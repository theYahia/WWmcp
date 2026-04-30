import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mpGet, mpPost, resetClient } from "../src/client.js";

describe("mercadopago client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MERCADOPAGO_ACCESS_TOKEN"] = "TEST-1234567890";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("sends Bearer auth header with access token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await mpGet("/v1/payments/123");
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.mercadopago.com/v1/payments/123");
    expect(new Headers(opts.headers).get("Authorization")).toBe("Bearer TEST-1234567890");
  });

  it("mpPost serializes body as JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: "pref_001" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await mpPost("/checkout/preferences", { items: [{ title: "X", quantity: 1, unit_price: 100 }] });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ items: [{ title: "X", quantity: 1, unit_price: 100 }] });
  });

  it("throws when MERCADOPAGO_ACCESS_TOKEN missing", async () => {
    delete process.env["MERCADOPAGO_ACCESS_TOKEN"];
    resetClient();
    await expect(mpGet("/v1/payments/1")).rejects.toThrow("MERCADOPAGO_ACCESS_TOKEN");
  });

  it("retries on 500", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false, status: 500, statusText: "Internal",
        text: () => Promise.resolve(""),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    await mpGet("/v1/payments/1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
