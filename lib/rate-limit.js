const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let upstashLimiter = null;
let upstashAvailable = false;

if (UPSTASH_URL && UPSTASH_TOKEN) {
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
    upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "1s"),
      analytics: false,
    });
    upstashAvailable = true;
  } catch {
    console.warn("[rate-limit] Upstash Redis unavailable, falling back to in-memory");
  }
}

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

function inMemoryCheck(key, interval, max) {
  cleanup();
  const now = Date.now();
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
}

export function rateLimit({ interval = 60000, max = 10 } = {}) {
  if (upstashAvailable) {
    return async function (identifier) {
      try {
        const key = `rl:${identifier}`;
        const { success, remaining, reset } = await upstashLimiter.limit(key, {
          rate: max,
          duration: Math.floor(interval / 1000),
        });
        return {
          allowed: success,
          remaining: Math.max(0, remaining),
          resetAt: reset,
        };
      } catch {
        return inMemoryCheck(identifier, interval, max);
      }
    };
  }

  return function (identifier) {
    const key = `${identifier}`;
    return inMemoryCheck(key, interval, max);
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
