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
});
