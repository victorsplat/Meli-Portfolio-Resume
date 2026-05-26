const rateMap = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Periodic cleanup to prevent memory leak from stale IP entries
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [ip, timestamps] of rateMap) {
    const valid = timestamps.filter(t => t > cutoff);
    if (valid.length === 0) rateMap.delete(ip);
    else rateMap.set(ip, valid);
  }
}, CLEANUP_INTERVAL).unref();

export function rateLimit(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  if (!rateMap.has(ip)) {
    rateMap.set(ip, []);
  }

  const timestamps = rateMap.get(ip).filter(t => t > windowStart);
  timestamps.push(now);
  rateMap.set(ip, timestamps);

  if (timestamps.length > MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000) };
  }

  return { allowed: true };
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
