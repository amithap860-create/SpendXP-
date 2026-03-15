
/**
 * @fileOverview Client-side memory-based rate limiter to prevent automated abuse.
 */

type RateLimitConfig = {
  key: string;
  maxCalls: number;
  windowMs: number;
};

class RateLimiter {
  private store: Map<string, number[]> = new Map();

  /**
   * Checks if an action is allowed based on the rate limit config.
   */
  public check(config: RateLimitConfig): boolean {
    const now = Date.now();
    const timestamps = this.store.get(config.key) || [];
    
    // Purge expired timestamps
    const validTimestamps = timestamps.filter(ts => now - ts < config.windowMs);
    
    if (validTimestamps.length >= config.maxCalls) {
      return false;
    }
    
    validTimestamps.push(now);
    this.store.set(config.key, validTimestamps);
    return true;
  }

  /**
   * Resets all limits for a key or the entire store.
   */
  public reset(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}

export const rateLimiter = new RateLimiter();
