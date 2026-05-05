// Simple in-memory rate limiter for development
// NOTE: NextRequest is intentionally NOT imported here so this file stays
// client-safe. We use a minimal interface instead.
// Replace with Redis/Upstash Redis for production
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export class RateLimiter {
  private config: RateLimitConfig;
  private keyPrefix: string;

  constructor(config: RateLimitConfig, keyPrefix: string = 'rate_limit') {
    this.config = config;
    this.keyPrefix = keyPrefix;
  }

  async isAllowed(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing record
    let record = rateLimitStore.get(key);
    
    if (!record || record.resetTime <= now) {
      // New window
      record = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      rateLimitStore.set(key, record);
      return { allowed: true, remaining: this.config.maxRequests - 1, resetTime: record.resetTime };
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);

    const allowed = record.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - record.count);

    return { allowed, remaining, resetTime: record.resetTime };
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.keyPrefix}:${identifier}`;
    rateLimitStore.delete(key);
  }

  // Cleanup old entries periodically
  static cleanup(): void {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Rate limiters for different endpoints
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

// Minimal request interface — avoids importing next/server so this file stays client-safe.
interface RequestLike {
  headers: { get(name: string): string | null };
}

// Helper function to extract identifier from request
export function getIdentifier(request: RequestLike): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Create a unique identifier based on IP and user agent
  return Buffer.from(`${ip}:${userAgent}`).toString('base64');
}

// Rate limiting middleware helper
export async function checkRateLimit(
  rateLimiter: RateLimiter,
  request: RequestLike,
  customIdentifier?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const identifier = customIdentifier || getIdentifier(request);
  return rateLimiter.isAllowed(identifier);
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(RateLimiter.cleanup, 5 * 60 * 1000);
}

// Export rateLimiter instance for client-side use
export const rateLimiter = new RateLimiter(
  { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute for client-side
  'client_rate_limit'
);

// Legacy check method for compatibility
export const check = (config: { key: string; maxCalls: number; windowMs: number }): boolean => {
  const now = Date.now();
  const timestamps: number[] = []; // Simplified implementation
  
  // For now, always return true (basic implementation)
  return true;
};

// Add check method to rateLimiter instance for compatibility
(rateLimiter as any).check = check;
