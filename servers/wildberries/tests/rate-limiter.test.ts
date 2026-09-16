import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RateLimiter, RateLimiterPool } from "../src/rate-limiter.js";

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
    // Корзина пополняется по Date.now(): без заморозки между чтениями
    // availableTokens набегает refill и проверка списания падает на медленной
    // машине. Именно на этом валился CI.
    vi.useFakeTimers();
    const headers = new Headers({
      "x-ratelimit-remaining": "42",
      "x-ratelimit-retry-after": "2.5",
    });

    const waitMs = limiter.handlePenalty(headers);
    expect(waitMs).toBe(2500);
    // Allow small tolerance for token refill between handlePenalty and availableTokens check
    expect(limiter.availableTokens).toBeLessThanOrEqual(43);
    vi.useRealTimers();
  });

  it("should handle 409 penalty - missing headers", () => {
    // Корзина пополняется по Date.now(): без заморозки между чтениями
    // availableTokens набегает refill и проверка списания падает на медленной
    // машине. Именно на этом валился CI.
    vi.useFakeTimers();
    const headers = new Headers({});
    const waitMs = limiter.handlePenalty(headers);
    expect(waitMs).toBe(1000);
    vi.useRealTimers();
  });

  it("should deduct penalty tokens", () => {
    // Корзина пополняется по Date.now(): без заморозки между чтениями
    // availableTokens набегает refill и проверка списания падает на медленной
    // машине. Именно на этом валился CI.
    vi.useFakeTimers();
    const before = limiter.availableTokens;
    limiter.applyPenalty(5);
    const after = limiter.availableTokens;
    expect(after).toBeLessThanOrEqual(before - 5);
    vi.useRealTimers();
  });

  it("should not go below 0 tokens on penalty", () => {
    // Корзина пополняется по Date.now(): без заморозки между чтениями
    // availableTokens набегает refill и проверка списания падает на медленной
    // машине. Именно на этом валился CI.
    vi.useFakeTimers();
    limiter.applyPenalty(1000);
    expect(limiter.availableTokens).toBeGreaterThanOrEqual(0);
    vi.useRealTimers();
  });
});

describe("RateLimiterPool", () => {
  it("returns the same limiter instance for the same key", () => {
    const pool = new RateLimiterPool();
    expect(pool.for("a")).toBe(pool.for("a"));
  });

  it("isolates limiters per key", () => {
    const pool = new RateLimiterPool();
    expect(pool.for("a")).not.toBe(pool.for("b"));
    expect(pool.size).toBe(2);
  });

  it("applies per-key config and falls back for unknown keys", () => {
    const pool = new RateLimiterPool(
      { strict: { rpm: 1, minIntervalMs: 1000 } },
      { rpm: 300, minIntervalMs: 200 },
    );
    expect(pool.for("strict").availableTokens).toBeLessThanOrEqual(1);
    expect(pool.for("unknown").availableTokens).toBeGreaterThanOrEqual(299);
  });

  it("isolates a 409 penalty to a single key's bucket", () => {
    // Корзина пополняется по Date.now(): без заморозки между чтениями
    // availableTokens набегает refill и проверка списания падает на медленной
    // машине. Именно на этом валился CI.
    vi.useFakeTimers();
    const pool = new RateLimiterPool();
    const a = pool.for("a");
    const b = pool.for("b");
    const bBefore = b.availableTokens;
    a.applyPenalty(50);
    expect(a.availableTokens).toBeLessThan(bBefore);
    expect(b.availableTokens).toBeGreaterThanOrEqual(bBefore - 1); // tolerate refill jitter
    vi.useRealTimers();
  });
});
