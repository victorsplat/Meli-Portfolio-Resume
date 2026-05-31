import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.error;
  return NextResponse.json({ success: true });
}
