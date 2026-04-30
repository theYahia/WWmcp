import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WBClient } from "../src/client.js";

describe("WBClient", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should send Bearer auth header", async () => {
    let capturedHeaders: HeadersInit | undefined;

    globalThis.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = new WBClient({ token: "test-jwt-token-123" });
    await client.get("/test");

    expect(capturedHeaders).toBeDefined();
    const headers = capturedHeaders as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-jwt-token-123");
  });

  it("should retry on 409 with penalty", async () => {
    let callCount = 0;

    globalThis.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response("Rate limited", {
          status: 409,
          headers: {
            "x-ratelimit-remaining": "10",
            "x-ratelimit-retry-after": "0.1",
          },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = new WBClient({ token: "test", maxRetries: 2 });
    const result = await client.get("/test");
    expect(result).toEqual({ ok: true });
    expect(callCount).toBe(2);
  });

  it("should throw on non-retryable errors", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response("Bad Request", { status: 400 });
    });

    const client = new WBClient({ token: "test", maxRetries: 0 });
    await expect(client.get("/test")).rejects.toThrow("400");
  });

  it("should handle 204 No Content", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response(null, { status: 204 });
    });

    const client = new WBClient({ token: "test" });
    const result = await client.get("/test");
    expect(result).toBeUndefined();
  });
});
