import type { VercelRequest } from '@vercel/node';
import type { RateLimitInfo } from './types';

/**
 * In-memory rate limiter
 */
class RateLimiter {
  private limits: Map<string, RateLimitInfo> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

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

    // No previous requests or window expired
    if (!limitInfo || now > limitInfo.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return { allowed: true };
    }

    // Within window
    if (limitInfo.count < maxRequests) {
      limitInfo.count++;
      return { allowed: true };
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((limitInfo.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, info] of this.limits.entries()) {
      if (now > info.resetAt) {
        this.limits.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[RateLimit] Cleaned up ${removed} expired entries`);
    }
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalKeys: this.limits.size,
      entries: Array.from(this.limits.entries()).map(([key, info]) => ({
        key,
        count: info.count,
        resetAt: new Date(info.resetAt).toISOString(),
      })),
    };
  }

  /**
   * Clear all limits (for testing)
   */
  clear(): void {
    this.limits.clear();
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
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
