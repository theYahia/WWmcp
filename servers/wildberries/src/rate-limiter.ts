/**
 * Production-grade rate limiter for Wildberries Seller API.
 *
 * Wildberries enforces rate limits *per API category* (each host has its own
 * budget), not as one global pool. A single shared limiter therefore both
 * over-throttles cheap categories and under-protects strict ones. Use one
 * {@link RateLimiter} instance per category via {@link RateLimiterPool}.
 *
 * Per-instance rules (token bucket):
 * - N requests per minute (token bucket, configurable per category)
 * - Minimum interval between requests (configurable per category)
 * - HTTP 409 = PENALTY: 5-10 tokens deducted. Must read
 *   X-Ratelimit-Retry-After header and wait that duration.
 */
export class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms
  private lastRefill: number;
  private lastRequest: number = 0;
  private readonly minInterval: number; // ms between requests

  constructor(
    maxTokensPerMinute: number = 300,
    minIntervalMs: number = 200,
  ) {
    this.maxTokens = maxTokensPerMinute;
    this.tokens = maxTokensPerMinute;
    this.refillRate = maxTokensPerMinute / 60_000; // tokens per ms
    this.lastRefill = Date.now();
    this.minInterval = minIntervalMs;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  /**
   * Wait until a request can be made, respecting both token bucket
   * and minimum interval constraints.
   */
  async acquire(): Promise<void> {
    this.refill();

    const now = Date.now();
    const timeSinceLast = now - this.lastRequest;
    if (timeSinceLast < this.minInterval) {
      const waitMs = this.minInterval - timeSinceLast;
      this.log(`Throttling: waiting ${waitMs}ms (min interval)`);
      await this.sleep(waitMs);
    }

    this.refill();
    if (this.tokens < 1) {
      const waitMs = Math.ceil((1 - this.tokens) / this.refillRate);
      this.log(`Throttling: waiting ${waitMs}ms (token bucket exhausted)`);
      await this.sleep(waitMs);
      this.refill();
    }

    this.tokens -= 1;
    this.lastRequest = Date.now();
  }

  /**
   * Handle a 409 penalty response.
   * Reads X-Ratelimit-Remaining and X-Ratelimit-Retry-After headers.
   * Returns the number of milliseconds to wait.
   */
  handlePenalty(headers: Headers): number {
    const remaining = headers.get("x-ratelimit-remaining");
    const retryAfter = headers.get("x-ratelimit-retry-after");

    if (remaining !== null) {
      const rem = parseInt(remaining, 10);
      if (!isNaN(rem)) {
        this.tokens = Math.min(this.tokens, rem);
      }
    }

    let waitMs = 1000; // default 1s if header missing
    if (retryAfter !== null) {
      const seconds = parseFloat(retryAfter);
      if (!isNaN(seconds)) {
        waitMs = Math.ceil(seconds * 1000);
      }
    }

    this.log(`409 PENALTY: remaining=${remaining}, retry-after=${retryAfter}, waiting ${waitMs}ms`);
    return waitMs;
  }

  /** Deduct penalty tokens (5-10 on 409) */
  applyPenalty(count: number = 5): void {
    this.tokens = Math.max(0, this.tokens - count);
  }

  private log(msg: string): void {
    process.stderr.write(`[wildberries-mcp rate-limiter] ${msg}\n`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Expose for testing
  get availableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

/** Per-category rate limit configuration. */
export interface RateLimitConfig {
  /** Max requests per minute (token bucket size + refill). */
  rpm: number;
  /** Minimum milliseconds between two consecutive requests. */
  minIntervalMs: number;
}

/**
 * Holds one {@link RateLimiter} per key (API category host, or a finer-grained
 * per-endpoint key for endpoints with their own strict caps). Limiters are
 * created lazily from `configs[key]`, falling back to `fallback` for unknown
 * keys. This keeps 409 penalties and token budgets isolated per category,
 * matching how Wildberries actually meters requests.
 */
export class RateLimiterPool {
  private readonly limiters = new Map<string, RateLimiter>();

  constructor(
    private readonly configs: Record<string, RateLimitConfig> = {},
    private readonly fallback: RateLimitConfig = { rpm: 300, minIntervalMs: 200 },
  ) {}

  /** Get (or lazily create) the limiter for a key. */
  for(key: string): RateLimiter {
    let limiter = this.limiters.get(key);
    if (!limiter) {
      const cfg = this.configs[key] ?? this.fallback;
      limiter = new RateLimiter(cfg.rpm, cfg.minIntervalMs);
      this.limiters.set(key, limiter);
    }
    return limiter;
  }

  /** Number of distinct limiters created so far (for testing/introspection). */
  get size(): number {
    return this.limiters.size;
  }
}
