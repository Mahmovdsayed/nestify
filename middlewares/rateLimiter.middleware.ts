import type { Context, MiddlewareHandler } from "hono";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  message?: string; // Custom error message
  statusCode?: number; // Custom status code
  standardHeaders?: boolean; // Send standard rate limit headers
  legacyHeaders?: boolean; // Send X-RateLimit-* headers
  keyGenerator?: (c: Context) => string; // Custom key generator function
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const store = new Map<string, RateLimitRecord>();

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetTime < now) {
      store.delete(key);
    }
  }
}, 60 * 1000);

export const rateLimiter = (options: RateLimitOptions): MiddlewareHandler => {
  const {
    windowMs,
    max,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = "Too many requests, please try again later.",
    statusCode = 429,
    standardHeaders = true,
    legacyHeaders = false,
    keyGenerator,
  } = options;

  return async (c: Context, next) => {
    try {
      // Generate key based on IP, path, and method to ensure route-specific limiting
      const ip =
        c.req.header("x-forwarded-for")?.split(",")?.[0]?.trim() ||
        c.req.header("x-real-ip") ||
        "unknown";

      const identifier = keyGenerator
        ? keyGenerator(c)
        : `${c.req.method}:${c.req.path}:${ip}`;

      const now = Date.now();
      const record = store.get(identifier);

      // Initialize or reset if window expired
      if (!record || record.resetTime < now) {
        store.set(identifier, {
          count: 0,
          resetTime: now + windowMs,
        });
      }

      const current = store.get(identifier)!;

      // Check if limit exceeded
      if (current.count >= max) {
        const resetTime = Math.ceil(current.resetTime / 1000);
        const retryAfter = Math.ceil((current.resetTime - now) / 1000);

        // Set rate limit headers
        if (standardHeaders) {
          c.header("RateLimit-Limit", max.toString());
          c.header("RateLimit-Remaining", "0");
          c.header("RateLimit-Reset", resetTime.toString());
        }

        if (legacyHeaders) {
          c.header("X-RateLimit-Limit", max.toString());
          c.header("X-RateLimit-Remaining", "0");
          c.header("X-RateLimit-Reset", resetTime.toString());
          c.header("Retry-After", retryAfter.toString());
        }

        return c.json(
          {
            success: false,
            message,
            retryAfter,
          },
          statusCode as any,
        );
      }

      // Increment counter if not skipping
      const shouldCount =
        !skipSuccessfulRequests ||
        (skipFailedRequests && !skipSuccessfulRequests);

      if (shouldCount) {
        current.count++;
        store.set(identifier, current);
      }

      // Set rate limit headers
      const remaining = Math.max(0, max - current.count);
      const resetTime = Math.ceil(current.resetTime / 1000);

      if (standardHeaders) {
        c.header("RateLimit-Limit", max.toString());
        c.header("RateLimit-Remaining", remaining.toString());
        c.header("RateLimit-Reset", resetTime.toString());
      }

      if (legacyHeaders) {
        c.header("X-RateLimit-Limit", max.toString());
        c.header("X-RateLimit-Remaining", remaining.toString());
        c.header("X-RateLimit-Reset", resetTime.toString());
      }

      // Continue to next middleware/handler
      await next();

      // Post-request handling for skipSuccessfulRequests/skipFailedRequests
      const response = c.res;
      const shouldDecrement =
        (skipSuccessfulRequests && response.ok) ||
        (skipFailedRequests && !response.ok);

      if (shouldDecrement) {
        const updated = store.get(identifier);
        if (updated && updated.count > 0) {
          updated.count--;
          store.set(identifier, updated);
        }
      }
    } catch (err) {
      console.error("Rate limiter error:", err);
      await next();
    }
  };
};

// Global rate limiter (apply to all routes)
export const globalRateLimiter = (
  options?: Partial<RateLimitOptions>,
): MiddlewareHandler => {
  return rateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // 100 requests per 5 minutes
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    // For global limiting, we override the default to use IP only (no path)
    keyGenerator: (c) =>
      c.req.header("x-forwarded-for")?.split(",")?.[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown",
    ...options,
  });
};

// Strict rate limiter for sensitive endpoints
export const strictRateLimiter = (
  options?: Partial<RateLimitOptions>,
): MiddlewareHandler => {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: "Too many attempts, please try again later.",
    standardHeaders: true,
    ...options,
  });
};

// Auth-specific rate limiter
export const authRateLimiter = (
  options?: Partial<RateLimitOptions>,
): MiddlewareHandler => {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    skipSuccessfulRequests: true, // Only count failed login attempts
    message: "Too many login attempts, please try again later.",
    standardHeaders: true,
    ...options,
  });
};

// API key-based rate limiter
export const apiKeyRateLimiter = (
  options?: Partial<RateLimitOptions>,
): MiddlewareHandler => {
  return rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
    keyGenerator: (c) => {
      const apiKey = c.req.header("x-api-key") || "anonymous";
      return `apikey:${apiKey}`;
    },
    message: "API rate limit exceeded.",
    standardHeaders: true,
    ...options,
  });
};

// Helper to reset rate limit for a specific identifier
export const resetRateLimit = (identifier: string): void => {
  store.delete(identifier);
  console.log(`✅ Rate limit reset for: ${identifier}`);
};

// Helper to get current rate limit status
export const getRateLimitStatus = (
  identifier: string,
): { requests: number; remaining: number; resetTime: number } | null => {
  const record = store.get(identifier);
  if (!record) {
    return null;
  }

  return {
    requests: record.count,
    remaining: Math.max(0, record.count),
    resetTime: record.resetTime,
  };
};

// Helper to clear all rate limits
export const clearAllRateLimits = (): void => {
  store.clear();
  console.log("🗑️  All rate limits cleared");
};

// Helper to get store size (for monitoring)
export const getRateLimitStoreSize = (): number => {
  return store.size;
};
