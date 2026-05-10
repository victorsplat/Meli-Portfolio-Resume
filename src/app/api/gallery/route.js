import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sanitize, validateImage } from '@/lib/validate';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import sharp from 'sharp';

export async function GET(_request) {
  try {
    const client = await clientPromise;
    const db = client.db('gallery');
    const collection = db.collection('images');
    const images = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(images.map((doc) => ({
      ...doc,
      url: typeof doc.url === 'string' && doc.url.startsWith('data:') ? doc.url : doc.url,
      _id: doc._id.toString()
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
    const { image, title, description } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const validation = validateImage(image);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    let processedImage = image;
    try {
      const base64Data = image.split(',')[1];
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        const webpBuffer = await sharp(buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        processedImage = `data:image/webp;base64,${webpBuffer.toString('base64')}`;
      }
    } catch (sharpError) {
      console.error('Sharp processing failed, using original image:', sharpError);
    }

    const client = await clientPromise;
    const db = client.db('gallery');
    const collection = db.collection('images');

    const result = await collection.insertOne({
      url: processedImage,
      title: sanitize(title || ''),
      description: sanitize(description || ''),
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error adding image:', error);
    const message = error instanceof Error ? `${error.name}: ${error.message}` : 'Failed to add image';
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

    const client = await clientPromise;
    const db = client.db('gallery');
    const collection = db.collection('images');

    const { ObjectId } = await import('mongodb');
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}