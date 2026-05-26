import getClient from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { uploadToBlob } from '@/lib/blob';

export async function POST(request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.error;

  const rl = rateLimit(getClientIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.retryAfter) },
    });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const client = await getClient();
    const db = client.db('gallery');
    const collection = db.collection('images');

    const { ObjectId } = await import('mongodb');
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    const doc = await collection.findOne({ _id: objectId });
    if (!doc) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    if (!doc.url || !doc.url.startsWith('data:')) {
      return NextResponse.json({ error: 'Image is not stored as base64' }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Blob token not configured' }, { status: 500 });
    }

    const base64Data = doc.url.split(',')[1];
    if (!base64Data) {
      return NextResponse.json({ error: 'Invalid base64 image data' }, { status: 400 });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const blobUrl = await uploadToBlob(filename, buffer);

    await collection.updateOne(
      { _id: objectId },
      { $set: { url: blobUrl, migratedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      id: doc._id.toString(),
      oldUrl: doc.url.slice(0, 50) + '...',
      newUrl: blobUrl,
    });
  } catch (error) {
    console.error('Migration error:', error);
    const message = error instanceof Error ? `${error.name}: ${error.message}` : 'Migration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
