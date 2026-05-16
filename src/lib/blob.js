const PROXY_PREFIX = '/api/gallery/proxy?url=';

export async function uploadToBlob(filename, buffer) {
  const { put } = await import('@vercel/blob');
  const blob = await put(filename, buffer, { access: 'private' });
  return blob.url;
}

export function getSignedUrl(blobUrl) {
  if (!blobUrl || typeof blobUrl !== 'string') return blobUrl;
  if (blobUrl.startsWith('data:') || blobUrl.startsWith('/api/')) return blobUrl;
  if (blobUrl.includes('blob.vercel-storage')) {
    return PROXY_PREFIX + encodeURIComponent(blobUrl);
  }
  return blobUrl;
}
