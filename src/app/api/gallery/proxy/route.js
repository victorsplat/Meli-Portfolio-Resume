import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !url.startsWith('https://') || !url.includes('blob.vercel-storage')) {
    return NextResponse.json({ error: 'Invalid blob URL' }, { status: 400 });
  }

  try {
    const token = process.env.GALLERY_RW_TOKEN_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch blob' }, { status: res.status });
    }

    const blob = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/webp';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Blob proxy error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}
