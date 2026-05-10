import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { validateApplication } from '@/lib/validate';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
  const rl = rateLimit(getClientIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.retryAfter) }
    });
  }

  try {
    const body = await request.json();
    const validation = validateApplication(body);

    if (!validation.valid) {
      return NextResponse.json({
        error: 'Validation failed',
        fields: validation.errors
      }, { status: 400 });
    }

    const { sanitized } = validation;

    const client = await clientPromise;
    const db = client.db('meli');
    const collection = db.collection('applications');

    const result = await collection.insertOne({
      ...sanitized,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
