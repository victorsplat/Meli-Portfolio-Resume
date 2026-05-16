import getClient from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sanitize } from '@/lib/validate';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

async function processWithSharp(image) {
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

async function autoTranslate(text, source = 'en') {
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

function normalizeI18nField(val) {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return { en: val.en || '', es: val.es || '', pt: val.pt || '' };
  }
  const str = String(val || '');
  return { en: str, es: '', pt: '' };
}

export async function GET(_request) {
  try {
    const client = await getClient();
    const db = client.db('gallery');
    const collection = db.collection('images');
    const images = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(images.map((doc) => ({
      ...doc,
      url: typeof doc.url === 'string' ? doc.url : doc.url,
      _id: doc._id.toString(),
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

export async function POST(request) {
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
    const settingsDoc = await db.collection('settings').findOne({ _id: 'main' });
    const validCategories = settingsDoc?.data?.categories?.items?.map(c => c.id) || ['design', 'aboutMe', 'skate', 'drinks', 'food', 'others'];
    const safeCategory = validCategories.includes(category) ? category : 'others';
    let finalUrl = url || '';

    if (image) {
      const base64Data = image.split(',')[1];
      if (!base64Data) {
        return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
      }
      const buffer = Buffer.from(base64Data, 'base64');

      if (process.env.GALLERY_RW_TOKEN_READ_WRITE_TOKEN) {
        try {
          const { put } = await import('@vercel/blob');
          const ext = image.match(/image\/(\w+)/)?.[1] || 'jpeg';
          const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const blob = await put(filename, buffer, { access: 'public' });
          finalUrl = blob.url;
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
    });

    return NextResponse.json({ success: true, id: result.insertedId, url: finalUrl });
  } catch (error) {
    console.error('Error adding image:', error);
    const message = error instanceof Error ? `${error.name}: ${error.message}` : 'Failed to add image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request) {
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
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, category, featured } = body;

    const client = await getClient();
    const db = client.db('gallery');

    const settingsDoc = await db.collection('settings').findOne({ _id: 'main' });
    const validCategories = settingsDoc?.data?.categories?.items?.map(c => c.id) || [];
    const safeCategory = validCategories.includes(category) ? category : undefined;

    const update = {};
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
    const result = await db.collection('images').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating image:', error);
    const message = error instanceof Error ? `${error.name}: ${error.message}` : 'Failed to update image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const client = await getClient();
    const db = client.db('gallery');
    const collection = db.collection('images');

    const { ObjectId } = await import('mongodb');

    const existing = await collection.findOne({ _id: new ObjectId(id) });

    if (existing?.url && existing.url.startsWith('https://') && process.env.GALLERY_RW_TOKEN_READ_WRITE_TOKEN) {
      try {
        const { del } = await import('@vercel/blob');
        await del(existing.url);
      } catch (blobError) {
        console.error('Failed to delete from Blob:', blobError);
      }
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
