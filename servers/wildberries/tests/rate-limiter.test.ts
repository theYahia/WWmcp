import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiter } from "../src/rate-limiter.js";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(300, 200);
  });

  it("should start with full tokens", () => {
    expect(limiter.availableTokens).toBeGreaterThanOrEqual(299);
  });

  it("should deduct one token per acquire", async () => {
    const before = limiter.availableTokens;
    await limiter.acquire();
    const after = limiter.availableTokens;
    expect(after).toBeLessThan(before);
  });

  it("should enforce 200ms minimum interval", async () => {
    const fastLimiter = new RateLimiter(10000, 200);
    const start = Date.now();
    await fastLimiter.acquire();
    await fastLimiter.acquire();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(190); // small tolerance
  });

  it("should handle 409 penalty - parse headers", () => {
    const headers = new Headers({
      "x-ratelimit-remaining": "42",
      "x-ratelimit-retry-after": "2.5",
    });

    const waitMs = limiter.handlePenalty(headers);
    expect(waitMs).toBe(2500);
    // Allow small tolerance for token refill between handlePenalty and availableTokens check
    expect(limiter.availableTokens).toBeLessThanOrEqual(43);
  });

  it("should handle 409 penalty - missing headers", () => {
    const headers = new Headers({});
    const waitMs = limiter.handlePenalty(headers);
    expect(waitMs).toBe(1000);
  });

  it("should deduct penalty tokens", () => {
    const before = limiter.availableTokens;
    limiter.applyPenalty(5);
    const after = limiter.availableTokens;
    expect(after).toBeLessThanOrEqual(before - 5);
  });

  it("should not go below 0 tokens on penalty", () => {
    limiter.applyPenalty(1000);
    expect(limiter.availableTokens).toBeGreaterThanOrEqual(0);
  });

  // ---- happy-path & failure scenarios (added v1.1.0) ----

  it("happy path: 10 sequential acquires complete and deduct ~10 tokens", async () => {
    const fastLimiter = new RateLimiter(1000, 0); // no inter-call wait
    const before = fastLimiter.availableTokens;
    for (let i = 0; i < 10; i++) {
      await fastLimiter.acquire();
    }
    const after = fastLimiter.availableTokens;
    expect(before - after).toBeGreaterThanOrEqual(9);
    expect(before - after).toBeLessThanOrEqual(10);
  });

  it("failure scenario: exhausting the bucket forces a wait, then recovers", async () => {
    // 5 tokens/min, no min interval → bucket runs dry quickly
    const tiny = new RateLimiter(5, 0);
    for (let i = 0; i < 5; i++) {
      await tiny.acquire();
    }
    // Bucket is now near-empty. The next acquire must wait for refill.
    const start = Date.now();
    const acquirePromise = tiny.acquire();
    // Don't wait for real refill (12s/token at 5/min) — race the promise
    // against a short timeout and assert it isn't immediately resolved.
    const winner = await Promise.race([
      acquirePromise.then(() => "acquired"),
      new Promise((r) => setTimeout(() => r("timeout"), 50)),
    ]);
    expect(winner).toBe("timeout");
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    // Don't await the dangling acquire — let the test cleanup tear it down.
  }, 1000);

  it("handlePenalty + applyPenalty sequence reflects in availableTokens", () => {
    const before = limiter.availableTokens;
    limiter.applyPenalty(5);
    const headers = new Headers({
      "x-ratelimit-remaining": "10",
      "x-ratelimit-retry-after": "1.0",
    });
    limiter.handlePenalty(headers);
    expect(limiter.availableTokens).toBeLessThanOrEqual(11);
    expect(limiter.availableTokens).toBeLessThan(before);
  });
});
