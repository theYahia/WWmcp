import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { chapaGet, chapaPost, resetClient } from "../src/client.js";

describe("chapa client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["CHAPA_SECRET_KEY"] = "CHASECK_TEST-test-key";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("sends Bearer auth header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: "success" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await chapaGet("/transaction/verify/tx_001");
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.chapa.co/v1/transaction/verify/tx_001");
    expect(new Headers(opts.headers).get("Authorization")).toBe("Bearer CHASECK_TEST-test-key");
  });

  it("chapaPost serializes body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: { checkout_url: "https://chapa.co/c/abc" } })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await chapaPost("/transaction/initialize", {
      amount: "100",
      currency: "ETB",
      email: "test@example.com",
      tx_ref: "tx_001",
    });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.tx_ref).toBe("tx_001");
  });

  it("throws when CHAPA_SECRET_KEY missing", async () => {
    delete process.env["CHAPA_SECRET_KEY"];
    resetClient();
    await expect(chapaGet("/x")).rejects.toThrow("CHAPA_SECRET_KEY");
  });
});
