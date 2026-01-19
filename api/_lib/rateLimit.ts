import type { VercelRequest } from '@vercel/node';
import type { RateLimitInfo } from './types';

/**
 * In-memory rate limiter
 */
class RateLimiter {
  private limits: Map<string, RateLimitInfo> = new Map();

  /**
   * Check if request is allowed
   */
  checkLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const limitInfo = this.limits.get(key);

    // Clean up expired entry if exists
    if (limitInfo && now > limitInfo.resetAt) {
      this.limits.delete(key);
    }

    const currentInfo = this.limits.get(key);

    // No previous requests or window expired
    if (!currentInfo) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return { allowed: true };
    }

    // Within window
    if (currentInfo.count < maxRequests) {
      currentInfo.count++;
      return { allowed: true };
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((currentInfo.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalKeys: this.limits.size,
    };
  }

  /**
   * Clear all limits (for testing)
   */
  clear(): void {
    this.limits.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  createBattle: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  vote: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
  listBattles: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },
  getBattle: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
} as const;

/**
 * Extract client IP from request
 */
export function getClientIP(req: VercelRequest): string {
  // Vercel provides client IP in headers
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers['x-real-ip'];
  if (typeof realIP === 'string') {
    return realIP;
  }

  // Fallback to connection remote address
  return 'unknown';
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  req: VercelRequest,
  endpoint: keyof typeof RATE_LIMITS
): { allowed: boolean; retryAfter?: number } {
  const ip = getClientIP(req);
  const key = `${endpoint}:${ip}`;
  const config = RATE_LIMITS[endpoint];

  return rateLimiter.checkLimit(key, config.maxRequests, config.windowMs);
}

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  constructor(public retryAfter: number) {
    super(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    this.name = 'RateLimitError';
  }
}

/**
 * Enforce rate limit middleware
 */
export function enforceRateLimit(
  req: VercelRequest,
  endpoint: keyof typeof RATE_LIMITS
): void {
  const result = checkRateLimit(req, endpoint);
  
  if (!result.allowed) {
    throw new RateLimitError(result.retryAfter || 60);
  }
}

// Export for testing
export { rateLimiter };
