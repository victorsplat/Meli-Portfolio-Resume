import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.error;
  return NextResponse.json({ success: true });
}
