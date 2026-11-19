import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  firstRequestTime: number;
}

// In-memory buckets partitioned by prefix (e.g., 'inquiry', 'login')
const rateLimitStores = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Periodically purge stale IP entries every 5 minutes to prevent memory leaks
 */
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    rateLimitStores.forEach((store) => {
      store.forEach((record, ip) => {
        // Purge records older than 1 hour
        if (now - record.firstRequestTime > 60 * 60 * 1000) {
          store.delete(ip);
        }
      });
    });
  }, 5 * 60 * 1000);

  // Avoid keeping the Node.js event loop alive solely for cleanup
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Extracts the real client IP from incoming request headers
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}

/**
 * Checks sliding-window rate limit for a given key within a namespace
 * @param namespace Namespace identifier (e.g., 'inquiries', 'login')
 * @param key Unique client key, usually IP address
 * @param maxRequests Maximum requests allowed within windowMs
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  namespace: string,
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  let store = rateLimitStores.get(namespace);
  if (!store) {
    store = new Map<string, RateLimitRecord>();
    rateLimitStores.set(namespace, store);
  }

  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, { count: 1, firstRequestTime: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  // If window has passed, reset the bucket
  if (now - record.firstRequestTime > windowMs) {
    record.count = 1;
    record.firstRequestTime = now;
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  // Within the current window
  if (record.count >= maxRequests) {
    const elapsed = now - record.firstRequestTime;
    const remainingTime = Math.max(0, windowMs - elapsed);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil(remainingTime / 1000),
    };
  }

  record.count += 1;
  const elapsed = now - record.firstRequestTime;
  const remainingTime = Math.max(0, windowMs - elapsed);

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - record.count),
    resetInSeconds: Math.ceil(remainingTime / 1000),
  };
}

/**
 * Clears rate limit state for a key (e.g. upon successful authentication)
 */
export function resetRateLimit(namespace: string, key: string): void {
  const store = rateLimitStores.get(namespace);
  if (store) {
    store.delete(key);
  }
}
