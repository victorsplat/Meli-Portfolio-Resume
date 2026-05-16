import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const sanitized = {
      name: String(name).slice(0, 100).replace(/[<>]/g, ''),
      email: String(email).slice(0, 200),
      message: String(message).slice(0, 2000).replace(/[<>]/g, ''),
    };

    console.log('[Contact] New message:', JSON.stringify(sanitized, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contact] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
