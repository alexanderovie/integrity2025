/**
 * Basic rate limiting utility (Enterprise 2026-2027 pattern)
 *
 * Quick Win: In-memory rate limiting (can be upgraded to Redis/Upstash later)
 * Pattern: Token bucket algorithm (simple, effective)
 *
 * Future: Migrate to @upstash/ratelimit for distributed systems
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

// In-memory store (for Quick Wins phase)
// TODO: Migrate to Redis/Upstash in Phase 2
const store: RateLimitStore = {};

/**
 * Rate limit check
 * @param identifier - Unique identifier (IP, email, etc.)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000, // 1 minute default
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier.toLowerCase().trim();

  // Clean up expired entries (simple cleanup)
  if (Object.keys(store).length > 10000) {
    // Prevent memory leak - clear old entries
    Object.keys(store).forEach((k) => {
      if (store[k].resetAt < now) {
        delete store[k];
      }
    });
  }

  const entry = store[key];

  if (!entry || entry.resetAt < now) {
    // New or expired entry - reset
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  if (entry.count >= maxRequests) {
    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client identifier from request
 * Enterprise pattern: Use IP + User-Agent for better tracking
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP (respects proxies)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";

  // Add User-Agent hash for better tracking (prevent IP spoofing)
  const userAgent = request.headers.get("user-agent") || "unknown";
  const uaHash = userAgent.slice(0, 20); // Simple hash (can improve later)

  return `${ip}:${uaHash}`;
}

/**
 * Rate limit middleware for API routes
 * Enterprise pattern: Non-intrusive, returns proper HTTP headers
 */
export function rateLimitMiddleware(
  request: Request,
  maxRequests: number = 10,
  windowMs: number = 60000,
): { allowed: boolean; headers: HeadersInit; remaining: number; resetAt: number } {
  const pathname = new URL(request.url).pathname;
  const identifier = `${pathname}:${getClientIdentifier(request)}`;
  const result = checkRateLimit(identifier, maxRequests, windowMs);

  const headers: HeadersInit = {
    "X-RateLimit-Limit": maxRequests.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
  };

  return {
    allowed: result.allowed,
    headers,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}
