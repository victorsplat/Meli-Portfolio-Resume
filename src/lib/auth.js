import { NextResponse } from 'next/server';

export function requireAdmin(request) {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return { error: NextResponse.json({ error: 'Server misconfigured' }, { status: 500 }), authorized: false };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), authorized: false };
  }

  const token = authHeader.slice(7);
  if (token !== adminKey) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), authorized: false };
  }

  return { authorized: true };
}

