import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatPayMongoError,
  PayMongoError,
  getClient,
  __resetClientForTests,
} from "../../client.js";

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("formatPayMongoError", () => {
  it("parses the errors[] array into a readable message", () => {
    const raw = JSON.stringify({
      errors: [
        {
          code: "parameter_invalid",
          detail: "amount must be at least 2000.",
          source: { pointer: "attributes.amount" },
        },
      ],
    });
    const err = formatPayMongoError(422, raw);
    expect(err).toBeInstanceOf(PayMongoError);
    expect(err.status).toBe(422);
    expect(err.message).toContain("PayMongo HTTP 422");
    expect(err.message).toContain("parameter_invalid");
    expect(err.message).toContain("amount must be at least 2000.");
    expect(err.message).toContain("attributes.amount");
    expect(err.errors).toHaveLength(1);
  });

  it("falls back to raw text but keeps the HTTP prefix for non-JSON bodies", () => {
    const err = formatPayMongoError(500, "Internal Server Error");
    expect(err.message).toBe("PayMongo HTTP 500: Internal Server Error");
  });
});

describe("PayMongoClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetClientForTests();
    delete process.env.PAYMONGO_SECRET_KEY;
    delete process.env.PAYMONGO_ALLOW_LIVE;
  });

  it("getClient surfaces a clear error when no key is set (lazy, not at import)", () => {
    expect(() => getClient()).toThrow(/PAYMONGO_SECRET_KEY is required/);
  });

  it("blocks money-moving ops on a LIVE key without PAYMONGO_ALLOW_LIVE", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_live_abc";
    __resetClientForTests();
    const client = getClient();
    expect(client.isLive).toBe(true);
    await expect(
      client.request("POST", "/payments", { x: 1 }, { moneyMoving: true }),
    ).rejects.toThrow(/LIVE secret key/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("allows money-moving ops on a LIVE key when PAYMONGO_ALLOW_LIVE=true", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_live_abc";
    process.env.PAYMONGO_ALLOW_LIVE = "true";
    __resetClientForTests();
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "pay_live" } }) });
    const result = await getClient().request("POST", "/payments", { x: 1 }, { moneyMoving: true });
    expect((result as { data: { id: string } }).data.id).toBe("pay_live");
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("allows read ops on a LIVE key (not money-moving)", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_live_abc";
    __resetClientForTests();
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "pay_1" } }) });
    const result = await getClient().request("GET", "/payments/pay_1");
    expect((result as { data: { id: string } }).data.id).toBe("pay_1");
  });

  it("retries HTTP 429 then succeeds", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
    __resetClientForTests();
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: () => "0" },
        text: async () => "rate limited",
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "ok" } }) });
    const result = await getClient().request("GET", "/payments");
    expect((result as { data: { id: string } }).data.id).toBe("ok");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry 5xx on POST (money-safety)", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
    __resetClientForTests();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => null },
      text: async () => "boom",
    });
    await expect(getClient().request("POST", "/payments", {})).rejects.toThrow("PayMongo HTTP 500");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries a 5xx on GET then succeeds", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
    __resetClientForTests();
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: { get: () => "0" },
        text: async () => "unavailable",
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "ok" } }) });
    const result = await getClient().request("GET", "/payments");
    expect((result as { data: { id: string } }).data.id).toBe("ok");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("gives up after MAX_RETRIES on a persistent 429", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
    __resetClientForTests();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: () => "0" },
      text: async () => "rate limited",
    });
    await expect(getClient().request("GET", "/payments")).rejects.toThrow("PayMongo HTTP 429");
    expect(mockFetch).toHaveBeenCalledTimes(3); // 1 + 2 retries
  });

  it("wraps a non-JSON success body as a PayMongoError and does NOT retry", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
    __resetClientForTests();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });
    await expect(getClient().request("GET", "/payments")).rejects.toThrow(
      "PayMongo HTTP 200: response body was not valid JSON",
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries a transient network error on GET then succeeds", async () => {
    vi.useFakeTimers();
    try {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
      __resetClientForTests();
      mockFetch
        .mockRejectedValueOnce(new TypeError("fetch failed"))
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "ok" } }) });
      const p = getClient().request("GET", "/payments");
      await vi.runAllTimersAsync();
      const result = await p;
      expect((result as { data: { id: string } }).data.id).toBe("ok");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does NOT retry a transient network error on POST and tags it PayMongo HTTP 0", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
    __resetClientForTests();
    mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(getClient().request("POST", "/payments", {})).rejects.toThrow("PayMongo HTTP 0");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("maps an aborted GET to a 408 timeout after retries", async () => {
    vi.useFakeTimers();
    try {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
      __resetClientForTests();
      mockFetch.mockRejectedValue(new DOMException("aborted", "AbortError"));
      const captured = getClient()
        .request("GET", "/payments")
        .catch((e: unknown) => e);
      await vi.runAllTimersAsync();
      const err = await captured;
      expect(String((err as Error).message)).toMatch(/request timeout/);
      expect(mockFetch).toHaveBeenCalledTimes(3); // 1 + 2 retries
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("formatPayMongoError branches", () => {
  it("joins multiple errors and uses the source.attribute fallback", () => {
    const raw = JSON.stringify({
      errors: [
        { code: "a", detail: "first", source: { pointer: "attributes.x" } },
        { code: "b", detail: "second", source: { attribute: "y" } },
      ],
    });
    const err = formatPayMongoError(400, raw);
    expect(err.message).toContain("first (attributes.x)");
    expect(err.message).toContain("second (y)");
    expect(err.message).toContain("; ");
    expect(err.errors).toHaveLength(2);
  });

  it("returns the bare prefix for an empty body", () => {
    expect(formatPayMongoError(502, "").message).toBe("PayMongo HTTP 502");
  });

  it("falls back to raw text when JSON has no errors array", () => {
    expect(formatPayMongoError(400, "{}").message).toBe("PayMongo HTTP 400: {}");
  });
});
