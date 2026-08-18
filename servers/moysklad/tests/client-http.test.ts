import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { moyskladGet, moyskladPost, _formatApiError, _retryDelayMs } from "../src/client.js";

function res(status: number, body: string, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    text: async () => body,
  } as unknown as Response;
}

describe("_formatApiError", () => {
  it("parses the MoySklad errors[] structure", () => {
    const body = JSON.stringify({
      errors: [{ error: "Field is required", code: 3006, error_message: "name must be unique", parameter: "name" }],
    });
    const msg = _formatApiError(400, body);
    expect(msg).toContain("[3006]");
    expect(msg).toContain("Field is required");
    expect(msg).toContain("name must be unique");
    expect(msg).toContain("parameter: name");
  });
  it("falls back to raw text for non-JSON bodies", () => {
    expect(_formatApiError(500, "Internal Error")).toBe("MoySklad HTTP 500: Internal Error");
  });
});

describe("_retryDelayMs", () => {
  it("prefers X-Lognex-Retry-After (milliseconds)", () => {
    expect(_retryDelayMs(new Headers({ "X-Lognex-Retry-After": "1500" }), 1)).toBe(1500);
  });
  it("falls back to Retry-After (seconds)", () => {
    expect(_retryDelayMs(new Headers({ "Retry-After": "2" }), 1)).toBe(2000);
  });
  it("falls back to exponential backoff", () => {
    expect(_retryDelayMs(new Headers({}), 1)).toBe(1000);
    expect(_retryDelayMs(new Headers({}), 2)).toBe(2000);
  });
});

describe("moyskladRequest (via moyskladGet/Post)", () => {
  const originalEnv = { ...process.env };
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.MOYSKLAD_TOKEN = "test-token";
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
  });

  it("returns parsed JSON on success and sends a User-Agent", async () => {
    mockFetch.mockResolvedValue(res(200, JSON.stringify({ id: "x", name: "ok" })));
    const result = (await moyskladGet("/entity/product/x")) as { name: string };
    expect(result.name).toBe("ok");
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers["User-Agent"]).toMatch(/moysklad-mcp\//);
    // We must NOT set Accept-Encoding (undici handles gzip + decompression).
    expect(headers["Accept-Encoding"]).toBeUndefined();
  });

  it("returns {success:true} for an empty body", async () => {
    mockFetch.mockResolvedValue(res(200, ""));
    expect(await moyskladGet("/entity/product/x")).toEqual({ success: true });
  });

  it("throws a clear auth error on 401", async () => {
    mockFetch.mockResolvedValue(res(401, "unauthorized"));
    await expect(moyskladGet("/entity/product/x")).rejects.toThrow(/auth error 401/);
  });

  it("surfaces a parsed MoySklad error on 4xx", async () => {
    mockFetch.mockResolvedValue(res(400, JSON.stringify({ errors: [{ error: "Bad", code: 1001 }] })));
    await expect(moyskladPost("/entity/product", {})).rejects.toThrow(/\[1001\] Bad/);
  });

  it("retries on 429 then succeeds", async () => {
    mockFetch
      .mockResolvedValueOnce(res(429, "rate limited", { "X-Lognex-Retry-After": "1" }))
      .mockResolvedValueOnce(res(200, JSON.stringify({ ok: true })));
    const result = (await moyskladGet("/entity/product")) as { ok: boolean };
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
