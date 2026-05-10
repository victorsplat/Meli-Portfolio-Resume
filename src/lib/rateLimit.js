const rateMap = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;

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
