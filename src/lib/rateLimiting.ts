import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

class RateLimiter {
  private config: RateLimitConfig;
  private keyPrefix: string;

  constructor(config: RateLimitConfig, keyPrefix: string = 'rate_limit') {
    this.config = config;
    this.keyPrefix = keyPrefix;
  }

  async isAllowed(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current request timestamps
      const existingRequests = await kv.get<number[]>(key) || [];
      
      // Filter out old requests outside the window
      const validRequests = existingRequests.filter(timestamp => timestamp > windowStart);
      
      // Check if under limit
      if (validRequests.length < this.config.maxRequests) {
        // Add current request
        validRequests.push(now);
        await kv.set(key, validRequests, { ex: Math.ceil(this.config.windowMs / 1000) });
        
        return {
          allowed: true,
          remaining: this.config.maxRequests - validRequests.length,
          resetTime: new Date(now + this.config.windowMs)
        };
      } else {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(validRequests[0] + this.config.windowMs)
        };
      }
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: new Date(now + this.config.windowMs)
      };
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.keyPrefix}:${identifier}`;
    await kv.del(key);
  }
}

// Predefined rate limiters for different actions
export const loginRateLimiter = new RateLimiter(
  { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  'auth_login'
);

export const passwordResetRateLimiter = new RateLimiter(
  { windowMs: 15 * 60 * 1000, maxRequests: 3 }, // 3 requests per 15 minutes
  'auth_password_reset'
);

export const signupRateLimiter = new RateLimiter(
  { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 requests per hour
  'auth_signup'
);

export const emailVerificationRateLimiter = new RateLimiter(
  { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 requests per hour
  'auth_email_verification'
);

// Helper function to extract identifier from request
export function getIdentifier(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create a unique identifier based on IP and user agent
  return Buffer.from(`${ip}:${userAgent}`).toString('base64');
}

// Rate limiting middleware helper
export async function checkRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter,
  identifier?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  const id = identifier || getIdentifier(request);
  return await rateLimiter.isAllowed(id);
}
