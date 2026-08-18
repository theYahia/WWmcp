import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Set env vars before importing client
process.env.TKASSA_TERMINAL_KEY = "TestTerminalKey";
process.env.TKASSA_PASSWORD = "TestPassword";

import { TKassaClient, toKopecks } from "../client.js";

describe("toKopecks", () => {
  it("converts whole rubles to kopecks", () => {
    expect(toKopecks(100)).toBe(10000);
  });

  it("converts fractional rubles to kopecks", () => {
    expect(toKopecks(100.50)).toBe(10050);
  });

  it("handles small amounts", () => {
    expect(toKopecks(0.01)).toBe(1);
  });

  it("rounds correctly for floating point edge cases", () => {
    expect(toKopecks(19.99)).toBe(1999);
  });

  it("handles zero", () => {
    expect(toKopecks(0)).toBe(0);
  });
});

describe("TKassaClient", () => {
  it("throws when env vars are missing", () => {
    const origKey = process.env.TKASSA_TERMINAL_KEY;
    const origPwd = process.env.TKASSA_PASSWORD;
    delete process.env.TKASSA_TERMINAL_KEY;
    delete process.env.TKASSA_PASSWORD;

    expect(() => new TKassaClient()).toThrow("TKASSA_TERMINAL_KEY");

    process.env.TKASSA_TERMINAL_KEY = origKey;
    process.env.TKASSA_PASSWORD = origPwd;
  });

  it("constructs successfully with valid env vars", () => {
    const client = new TKassaClient();
    expect(client).toBeDefined();
  });
});

describe("TKassaClient.post", () => {
  let client: TKassaClient;

  beforeEach(() => {
    client = new TKassaClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("makes a POST request with Token and TerminalKey", async () => {
    const mockResponse = {
      Success: true,
      ErrorCode: "0",
      PaymentId: "12345",
      Status: "NEW",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await client.post("/Init", { Amount: 10000, OrderId: "test-1" });

    expect(result.Success).toBe(true);
    expect(result.PaymentId).toBe("12345");

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe("https://securepay.tinkoff.ru/v2/Init");

    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body.TerminalKey).toBe("TestTerminalKey");
    expect(body.Token).toBeDefined();
    expect(typeof body.Token).toBe("string");
    expect(body.Token.length).toBe(64); // SHA-256 hex
  });

  it("throws on T-Kassa logical error (Success=false)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        Success: false,
        ErrorCode: "7",
        Message: "Покупатель не найден",
      }),
    } as Response);

    await expect(client.post("/GetCustomer", {})).rejects.toThrow("T-Kassa [7]");
  });

  it("retries on 500 and eventually throws", async () => {
    const errorResponse = {
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as Response;

    vi.spyOn(globalThis, "fetch").mockResolvedValue(errorResponse);

    await expect(client.post("/Init", {})).rejects.toThrow("T-Kassa HTTP 500");
    // Should have retried 3 times
    expect(vi.mocked(fetch).mock.calls.length).toBe(3);
  });

  it("does not retry on 400 errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    } as Response);

    await expect(client.post("/Init", {})).rejects.toThrow("T-Kassa HTTP 400");
    expect(vi.mocked(fetch).mock.calls.length).toBe(1);
  });

  it("generates correct token (SHA-256 sorted concat)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Success: true, ErrorCode: "0" }),
    } as Response);

    await client.post("/Init", { Amount: 10000, OrderId: "order-1" });

    const call = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);

    // Token should be present and be a 64-char hex string
    expect(body.Token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("skips nested objects from token generation", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Success: true, ErrorCode: "0" }),
    } as Response);

    // Receipt is a nested object -- should be excluded from token signing
    await client.post("/Init", {
      Amount: 10000,
      OrderId: "order-1",
      Receipt: { Items: [{ Name: "Test" }] },
    });

    const call = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body.Token).toMatch(/^[a-f0-9]{64}$/);
  });
});
