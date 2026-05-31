import getClient from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sanitize } from '@/lib/validate';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { uploadToBlob, getSignedUrl } from '@/lib/blob';

interface I18nField {
  en: string;
  es: string;
  pt: string;
}

async function processWithSharp(image: string): Promise<string> {
  try {
    const sharp = (await import('sharp')).default;
    const base64Data = image.split(',')[1];
    if (!base64Data) return image;
    const buffer = Buffer.from(base64Data, 'base64');
    const webpBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Sharp processing failed, using original:', err);
    return image;
  }
}

async function autoTranslate(text: string, source = 'en'): Promise<I18nField> {
  if (!text?.trim()) return { en: text || '', es: '', pt: '' };
  try {
    const res = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target: 'es', format: 'text' }),
    });
    const es = res.ok ? (await res.json()).translatedText || '' : '';
    const res2 = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target: 'pt', format: 'text' }),
    });
    const pt = res2.ok ? (await res2.json()).translatedText || '' : '';
    return { en: text, es, pt };
  } catch {
    return { en: text, es: '', pt: '' };
  }
}

function normalizeI18nField(val: unknown): I18nField {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    const obj = val as Record<string, string>;
    return { en: obj.en || '', es: obj.es || '', pt: obj.pt || '' };
  }
  const str = String(val || '');
  return { en: str, es: '', pt: '' };
}

export async function GET(_request: NextRequest) {
  try {
    const client = await getClient();
    const db = client.db('gallery');
    const collection = db.collection('images');
    const images = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(images.map((doc: Record<string, unknown>) => ({
      ...doc,
      url: getSignedUrl(typeof doc.url === 'string' ? doc.url : ''),
      _id: (doc._id as { toString(): string }).toString(),
      category: doc.category || 'others',
      featured: doc.featured === true,
      title: normalizeI18nField(doc.title),
      description: normalizeI18nField(doc.description),
    })));
  } catch (error) {
    console.error('Error fetching images:', error);
    const msg = error instanceof Error ? `${error.name}: ${error.message}` : 'Failed to fetch images';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.error;

  const rl = rateLimit(getClientIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.retryAfter) }
    });
  }

  try {
    const body = await request.json();
    const { image, url, title, description, category, featured } = body;

    if (!image && !url) {
      return NextResponse.json({ error: 'Image data or URL is required' }, { status: 400 });
    }

    const client = await getClient();
    const db = client.db('gallery');
    const settingsDoc = await db.collection('settings').findOne({ _id: 'main' as any });
    const validCategories: string[] = (settingsDoc as Record<string, unknown>)?.data 
      ? ((settingsDoc as Record<string, unknown>).data as Record<string, unknown>)?.categories 
        ? ((((settingsDoc as Record<string, unknown>).data as Record<string, unknown>).categories as Record<string, unknown>).items as Record<string, string>[])?.map(c => c.id) 
        : ['design', 'aboutMe', 'skate', 'drinks', 'food', 'others']
      : ['design', 'aboutMe', 'skate', 'drinks', 'food', 'others'];
    const safeCategory = validCategories.includes(category) ? category : 'others';
    let finalUrl = url || '';

    if (image) {
      const base64Data = image.split(',')[1];
      if (!base64Data) {
        return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
      }
      const buffer = Buffer.from(base64Data, 'base64');

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const ext = image.match(/image\/(\w+)/)?.[1] || 'jpeg';
          const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          finalUrl = await uploadToBlob(filename, buffer.buffer);
        } catch (blobError) {
          console.error('Blob upload failed, falling back to base64 with Sharp:', blobError);
          finalUrl = await processWithSharp(image);
        }
      } else {
        finalUrl = await processWithSharp(image);
      }
    }

    const titleText = typeof title === 'object' ? title : await autoTranslate(sanitize(String(title || '')));
    const descText = typeof description === 'object' ? description : await autoTranslate(sanitize(String(description || '')));

    const collection = db.collection('images');

    const result = await collection.insertOne({
      url: finalUrl,
      title: titleText,
      description: descText,
      category: safeCategory,
      featured: featured === true,
      createdAt: new Date()
    } as Record<string, unknown>);

    return NextResponse.json({ success: true, id: result.insertedId, url: finalUrl });
  } catch (error) {
    console.error('Error adding image:', error);
    const message = error instanceof Error ? `${error.name}: ${error.message}` : 'Failed to add image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.error;

  const rl = rateLimit(getClientIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.retryAfter) }
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');
    const body = await request.json();
    const ids = body.ids || (singleId ? [singleId] : []);

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Image ID(s) are required' }, { status: 400 });
    }

    const { title, description, category, featured } = body;

    const client = await getClient();
    const db = client.db('gallery');

    const settingsDoc = await db.collection('settings').findOne({ _id: 'main' as any });
    const validCategories: string[] = (settingsDoc as Record<string, unknown>)?.data 
      ? ((settingsDoc as Record<string, unknown>).data as Record<string, unknown>)?.categories 
        ? ((((settingsDoc as Record<string, unknown>).data as Record<string, unknown>).categories as Record<string, unknown>).items as Record<string, string>[])?.map(c => c.id) 
        : []
      : [];
    const safeCategory = validCategories.includes(category) ? category : undefined;

    const update: Record<string, unknown> = {};
    if (title !== undefined) {
      if (typeof title === 'object') {
        update.title = {
          en: sanitize(title.en || ''),
          es: sanitize(title.es || ''),
          pt: sanitize(title.pt || ''),
        };
      } else {
        update.title = await autoTranslate(sanitize(String(title)));
      }
    }
    if (description !== undefined) {
      if (typeof description === 'object') {
        update.description = {
          en: sanitize(description.en || ''),
          es: sanitize(description.es || ''),
          pt: sanitize(description.pt || ''),
        };
      } else {
        update.description = await autoTranslate(sanitize(String(description)));
      }
    }
    if (safeCategory !== undefined) update.category = safeCategory;
    if (featured !== undefined) update.featured = featured === true;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { ObjectId } = await import('mongodb');
    const objectIds = ids.map((id: string) => new ObjectId(id));

    if (singleId && ids.length === 1) {
      const result = await db.collection('images').updateOne(
        { _id: objectIds[0] },
        { $set: update }
      );
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }
    } else {
      const result = await db.collection('images').updateMany(
        { _id: { $in: objectIds } },
        { $set: update }
      );
      return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating image:', error);
    const message = error instanceof Error ? `${error.name}: ${error.message}` : 'Failed to update image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.error;

  const rl = rateLimit(getClientIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.retryAfter) }
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');
    const body = request.headers.get('content-type')?.includes('application/json')
      ? await request.json().catch(() => ({}))
      : {};
    const ids = body.ids || (singleId ? [singleId] : []);

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Image ID(s) are required' }, { status: 400 });
    }

    const client = await getClient();
    const db = client.db('gallery');
    const collection = db.collection('images');

    const { ObjectId } = await import('mongodb');
    const objectIds = ids.map((id: string) => new ObjectId(id));

    if (singleId && ids.length === 1) {
      const existing = await collection.findOne({ _id: objectIds[0] }) as Record<string, unknown> | null;
      if (existing?.url && typeof existing.url === 'string' && existing.url.startsWith('https://') && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const { del } = await import('@vercel/blob');
          await del(existing.url);
        } catch (blobError) {
          console.error('Failed to delete from Blob:', blobError);
        }
      }
      await collection.deleteOne({ _id: objectIds[0] });
    } else {
      await collection.deleteMany({ _id: { $in: objectIds } });
    }

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
