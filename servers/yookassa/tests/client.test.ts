import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { YooKassaClient, formatAmount, toKopecks, moneyAmount, resetClient } from "../src/client.js";

describe("YooKassaClient", () => {
  beforeEach(() => {
    resetClient();
  });

  it("throws without credentials", () => {
    const origId = process.env.YOOKASSA_SHOP_ID;
    const origKey = process.env.YOOKASSA_SECRET_KEY;
    delete process.env.YOOKASSA_SHOP_ID;
    delete process.env.YOOKASSA_SECRET_KEY;

    expect(() => new YooKassaClient()).toThrow("YOOKASSA_SHOP_ID");

    process.env.YOOKASSA_SHOP_ID = origId;
    process.env.YOOKASSA_SECRET_KEY = origKey;
  });

  it("creates with explicit credentials", () => {
    const client = new YooKassaClient("shop_123", "key_456");
    expect(client).toBeDefined();
  });
});

describe("formatAmount", () => {
  it("formats integer amount", () => {
    expect(formatAmount(100)).toEqual({ value: "100.00", currency: "RUB" });
  });

  it("formats decimal amount", () => {
    expect(formatAmount(99.99)).toEqual({ value: "99.99", currency: "RUB" });
  });

  it("uses custom currency", () => {
    expect(formatAmount(50, "USD")).toEqual({ value: "50.00", currency: "USD" });
  });

  it("formats string amounts exactly (no float)", () => {
    expect(formatAmount("100")).toEqual({ value: "100.00", currency: "RUB" });
    expect(formatAmount("99.5")).toEqual({ value: "99.50", currency: "RUB" });
    expect(formatAmount("99.99")).toEqual({ value: "99.99", currency: "RUB" });
    expect(formatAmount("0.01")).toEqual({ value: "0.01", currency: "RUB" });
  });

  it("formats number amounts via integer kopecks", () => {
    expect(formatAmount(2500.5)).toEqual({ value: "2500.50", currency: "RUB" });
    expect(formatAmount(7000)).toEqual({ value: "7000.00", currency: "RUB" });
  });

  it("toKopecks is exact for strings", () => {
    expect(toKopecks("100")).toBe(10000);
    expect(toKopecks("99.99")).toBe(9999);
    expect(toKopecks("0.5")).toBe(50);
    expect(toKopecks(123.45)).toBe(12345);
  });
});

describe("moneyAmount schema", () => {
  it("accepts a 2-decimal string and a positive number", () => {
    expect(moneyAmount.safeParse("100.00").success).toBe(true);
    expect(moneyAmount.safeParse("100").success).toBe(true);
    expect(moneyAmount.safeParse(5000).success).toBe(true);
  });

  it("rejects 3 decimals, negatives, and non-numeric strings", () => {
    expect(moneyAmount.safeParse("100.999").success).toBe(false);
    expect(moneyAmount.safeParse(-5).success).toBe(false);
    expect(moneyAmount.safeParse("abc").success).toBe(false);
  });
});

describe("HTTP calls with mocked fetch", () => {
  let client: YooKassaClient;

  beforeEach(() => {
    client = new YooKassaClient("test_shop", "test_key");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("GET sends Authorization header", async () => {
    const mockResponse = { id: "pay_123", status: "succeeded" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await client.get("/payments/pay_123");
    expect(result).toEqual(mockResponse);

    const call = vi.mocked(fetch).mock.calls[0];
    const headers = call[1]?.headers as Record<string, string>;
    expect(headers["Authorization"]).toMatch(/^Basic /);
  });

  it("POST includes Idempotence-Key", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "pay_new" }), { status: 200 }),
    );

    await client.post("/payments", { amount: { value: "100.00", currency: "RUB" } });

    const call = vi.mocked(fetch).mock.calls[0];
    const headers = call[1]?.headers as Record<string, string>;
    expect(headers["Idempotence-Key"]).toBeDefined();
    expect(headers["Idempotence-Key"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("each POST gets unique Idempotence-Key", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await client.post("/payments", {});
    await client.post("/payments", {});

    const key1 = (vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>)["Idempotence-Key"];
    const key2 = (vi.mocked(fetch).mock.calls[1][1]?.headers as Record<string, string>)["Idempotence-Key"];
    expect(key1).not.toBe(key2);
  });

  it("reuses the SAME Idempotence-Key across retries of one POST (no duplicate charge)", async () => {
    vi.useFakeTimers();
    try {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response("server error", { status: 500 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ id: "pay_1" }), { status: 200 }));

      const promise = client.post("/payments", { amount: { value: "100.00", currency: "RUB" } });
      await vi.runAllTimersAsync();
      await promise;

      expect(fetch).toHaveBeenCalledTimes(2);
      const key1 = (vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>)["Idempotence-Key"];
      const key2 = (vi.mocked(fetch).mock.calls[1][1]?.headers as Record<string, string>)["Idempotence-Key"];
      expect(key1).toBeDefined();
      expect(key1).toBe(key2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("honors an explicit Idempotence-Key passed to post()", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "pay_1" }), { status: 200 }),
    );

    await client.post("/payments", {}, "my-stable-key");

    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers["Idempotence-Key"]).toBe("my-stable-key");
  });

  it("sends an Idempotence-Key on DELETE requests", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    await client.delete("/webhooks/wh_1");

    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers["Idempotence-Key"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("handles 401 error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({
        type: "error", id: "err_1", code: "unauthorized",
        description: "Invalid credentials",
      }), { status: 401 }),
    );

    await expect(client.get("/me")).rejects.toThrow("YOOKASSA_SHOP_ID");
  });

  it("handles 403 error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({
        type: "error", id: "err_2", code: "forbidden",
        description: "Access denied",
      }), { status: 403 }),
    );

    await expect(client.get("/payments")).rejects.toThrow("Access denied");
  });

  it("handles 404 error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({
        type: "error", id: "err_3", code: "not_found",
        description: "Payment not found",
      }), { status: 404 }),
    );

    await expect(client.get("/payments/nonexistent")).rejects.toThrow("Payment not found");
  });

  it("retries on 429 then succeeds", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await client.get("/payments");
    expect(result).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retries on 500 then succeeds", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("server error", { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await client.get("/payments");
    expect(result).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("fails after max retries on 429", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response("rate limited", { status: 429 }));

    await expect(client.get("/payments")).rejects.toThrow("HTTP 429");
  });

  it("throws a clear timeout error after exhausting retries on AbortError", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new DOMException("aborted", "AbortError"));
    await expect(client.get("/payments")).rejects.toThrow("request timeout");
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("includes the offending parameter name in a validation error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({
        type: "error", id: "e", code: "invalid_request",
        description: "Bad value", parameter: "amount",
      }), { status: 400 }),
    );
    await expect(client.get("/payments")).rejects.toThrow("(param: amount)");
  });

  it("sanitizes a non-JSON error body (truncated, not echoed verbatim)", async () => {
    const huge = "<html><body>" + "x".repeat(5000) + "</body></html>";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(huge, { status: 400 }));

    const err = await client.get("/payments").catch((e) => e as Error);
    expect(err.message).toContain("HTTP 400");
    expect(err.message).toContain("non-JSON error body");
    expect(err.message.length).toBeLessThan(300); // not the full 5KB body
  });

  it("logs request tracing only when YOOKASSA_DEBUG is set", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    process.env.YOOKASSA_DEBUG = "";
    await client.get("/payments");
    expect(spy.mock.calls.some((c) => String(c[0]).includes("[debug]"))).toBe(false);

    process.env.YOOKASSA_DEBUG = "1";
    await client.get("/payments");
    expect(spy.mock.calls.some((c) => String(c[0]).includes("[debug]"))).toBe(true);

    delete process.env.YOOKASSA_DEBUG;
  });
});
