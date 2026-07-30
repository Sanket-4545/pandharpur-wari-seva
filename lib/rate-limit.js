const rateLimitMap = new Map();

const CLEANUP_INTERVAL = 60000;

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.start > entry.interval) {
      rateLimitMap.delete(key);
    }
  }
  lastCleanup = now;
}

export function rateLimit({ interval = 60000, max = 10 } = {}) {
  return function (identifier) {
    cleanup();
    const now = Date.now();
    const key = `${identifier}`;
    const entry = rateLimitMap.get(key);

    if (!entry || now - entry.start > interval) {
      rateLimitMap.set(key, { start: now, count: 1, interval });
      return { allowed: true, remaining: max - 1, resetAt: now + interval };
    }

    if (entry.count >= max) {
      return { allowed: false, remaining: 0, resetAt: entry.start + interval };
    }

    entry.count++;
    return { allowed: true, remaining: max - entry.count, resetAt: entry.start + interval };
  };
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}
