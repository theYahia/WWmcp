import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WBClient, HOSTS } from "../src/client.js";

describe("WBClient", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends Bearer auth header", async () => {
    let capturedHeaders: HeadersInit | undefined;
    globalThis.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = new WBClient({ token: "test-jwt-token-123" });
    await client.get(HOSTS.content, "/test");

    const headers = capturedHeaders as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-jwt-token-123");
  });

  it("routes each call to the correct per-category host", async () => {
    let capturedUrl = "";
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = new WBClient({ token: "t" });

    await client.post(HOSTS.prices, "/api/v2/upload/task", { data: [] });
    expect(new URL(capturedUrl).host).toBe(HOSTS.prices);

    await client.get(HOSTS.content, "/content/v2/get/cards/list");
    expect(new URL(capturedUrl).host).toBe(HOSTS.content);
  });

  it("appends query params to the URL", async () => {
    let capturedUrl = "";
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const client = new WBClient({ token: "t" });
    await client.get(HOSTS.statistics, "/api/v1/supplier/sales", { dateFrom: "2024-01-01", flag: "1" });
    const u = new URL(capturedUrl);
    expect(u.searchParams.get("dateFrom")).toBe("2024-01-01");
    expect(u.searchParams.get("flag")).toBe("1");
  });

  it("retries on 409 with penalty", async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response("Rate limited", {
          status: 409,
          headers: { "x-ratelimit-remaining": "10", "x-ratelimit-retry-after": "0.1" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = new WBClient({ token: "t", maxRetries: 2 });
    const result = await client.get(HOSTS.content, "/test");
    expect(result).toEqual({ ok: true });
    expect(callCount).toBe(2);
  });

  it("throws on non-retryable errors with host + parsed WB error", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response(JSON.stringify({ errorText: "bad token", requestId: "req-9" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = new WBClient({ token: "t", maxRetries: 0 });
    const err = await client.get(HOSTS.advert, "/adv/v1/balance").catch((e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    const msg = (err as Error).message;
    expect(msg).toContain("401");
    expect(msg).toContain("bad token");
    expect(msg).toContain("requestId=req-9");
    expect(msg).toContain(HOSTS.advert); // host is in the message for diagnosability
  });

  it("handles 204 No Content", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => new Response(null, { status: 204 }));
    const client = new WBClient({ token: "t" });
    const result = await client.get(HOSTS.marketplace, "/test");
    expect(result).toBeUndefined();
  });

  it("returns text body when responseType is text", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => new Response("<svg/>", { status: 200 }));
    const client = new WBClient({ token: "t" });
    const result = await client.request("GET", HOSTS.marketplace, "/barcode", undefined, {
      responseType: "text",
    });
    expect(result).toBe("<svg/>");
  });

  it("times out a hung request via AbortController", async () => {
    globalThis.fetch = vi.fn().mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        }),
    );

    const client = new WBClient({ token: "t", maxRetries: 0 });
    await expect(
      client.get(HOSTS.content, "/slow", undefined, { timeoutMs: 50 }),
    ).rejects.toThrow(/timed out after 50ms/);
  });
});
