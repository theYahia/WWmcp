import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { retailCrmGet, retailCrmPost, RetailCrmHttpError } from "./client.js";

const BASE_URL = "https://testshop.retailcrm.ru/api/v5";

beforeEach(() => {
  process.env.RETAILCRM_DOMAIN = "testshop.retailcrm.ru";
  process.env.RETAILCRM_API_KEY = "test-api-key-123";
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.RETAILCRM_DOMAIN;
  delete process.env.RETAILCRM_API_KEY;
});

function headersOf(init: RequestInit): Record<string, string> {
  return (init.headers ?? {}) as Record<string, string>;
}

describe("retailCrmGet", () => {
  it("sends GET with X-API-KEY header and keeps the key out of the URL", async () => {
    const mockResponse = { success: true, orders: [] };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await retailCrmGet("/orders", { "filter[status]": "new", limit: "20" });

    expect(result).toEqual(mockResponse);
    const call = vi.mocked(fetch).mock.calls[0];
    const url = call[0] as string;
    const headers = headersOf(call[1] as RequestInit);
    expect(url).toContain(`${BASE_URL}/orders`);
    expect(url).toContain("filter%5Bstatus%5D=new");
    expect(url).not.toContain("apiKey"); // key must NOT leak into the query string
    expect(headers["X-API-KEY"]).toBe("test-api-key-123");
  });

  it("throws descriptive error on 403 with RetailCRM error body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({
        success: false,
        errorMsg: "Access denied",
        errors: { "apiKey": "Invalid API key" },
      }), { status: 403 }),
    );

    await expect(retailCrmGet("/orders")).rejects.toThrow(/Access denied.*apiKey/);
  });

  it("retries on 429 rate limit", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const result = await retailCrmGet("/orders");
    expect(result).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry a 4xx whose body merely contains '429'", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, errorMsg: "Order 429 not found" }), { status: 400 }),
    );

    await expect(retailCrmGet("/orders/429")).rejects.toMatchObject({ status: 400 });
    expect(fetchSpy).toHaveBeenCalledTimes(1); // no spurious retry
  });

  it("retries on a timeout/abort then succeeds", async () => {
    const abortErr = Object.assign(new Error("The operation was aborted"), { name: "AbortError" });
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(abortErr)
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const result = await retailCrmGet("/orders");
    expect(result).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("surfaces the numeric status on RetailCrmHttpError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("not found", { status: 404 }),
    );
    const err = await retailCrmGet("/orders/999").catch((e) => e);
    expect(err).toBeInstanceOf(RetailCrmHttpError);
    expect(err.status).toBe(404);
  });

  it("throws when env vars are missing", async () => {
    delete process.env.RETAILCRM_DOMAIN;
    await expect(retailCrmGet("/orders")).rejects.toThrow("RETAILCRM_DOMAIN is not set");
  });
});

describe("retailCrmPost", () => {
  it("sends POST with form-encoded body and X-API-KEY header (no key in body)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, id: 42 }), { status: 200 }),
    );

    const result = await retailCrmPost("/orders/create", { order: '{"firstName":"Test"}' });

    expect(result).toEqual({ success: true, id: 42 });
    const call = vi.mocked(fetch).mock.calls[0];
    const opts = call[1] as RequestInit;
    const headers = headersOf(opts);
    expect(opts.method).toBe("POST");
    expect(opts.body).toContain("order=");
    expect(opts.body).not.toContain("apiKey="); // key must NOT be in the form body
    expect(headers["X-API-KEY"]).toBe("test-api-key-123");
  });

  it("retries a POST on 429 (server rejected before processing)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const result = await retailCrmPost("/orders/create", { order: "{}" });
    expect(result).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry a POST on 500 (mutation may have committed)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("Server Error", { status: 500 }));

    await expect(retailCrmPost("/orders/create", { order: "{}" })).rejects.toThrow("HTTP 500");
    expect(fetchSpy).toHaveBeenCalledTimes(1); // no duplicate-write risk
  });
});
