import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { omGet, omPost, resetClient } from "../src/client.js";

describe("orange-money client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["ORANGE_MONEY_CLIENT_ID"] = "test_client_id";
    process.env["ORANGE_MONEY_CLIENT_SECRET"] = "test_client_secret";
    process.env["ORANGE_MONEY_COUNTRY"] = "sn";
    process.env["ORANGE_MONEY_MERCHANT_KEY"] = "test_merchant_key";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("OAuth: sends Basic auth header (NOT body credentials) + form-urlencoded body", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "tok_abc", expires_in: 3600 }),
        text: () => Promise.resolve(""),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({})),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    await omGet("/balance");

    // First call: token request
    const [tokenUrl, tokenOpts] = fetchMock.mock.calls[0];
    expect(tokenUrl).toBe("https://api.orange.com/oauth/v3/token");
    expect(tokenOpts.headers["Authorization"]).toBe(
      `Basic ${Buffer.from("test_client_id:test_client_secret").toString("base64")}`,
    );
    expect(tokenOpts.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(tokenOpts.body).toBe("grant_type=client_credentials");
    // Critically: client_id/secret should NOT be in body
    expect(tokenOpts.body).not.toContain("client_id=");
    expect(tokenOpts.body).not.toContain("client_secret=");
  });

  it("uses correct per-country base URL", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "x", expires_in: 3600 }),
        text: () => Promise.resolve(""),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({})),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    await omGet("/balance");
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.orange.com/orange-money-webpay/sn/v1/balance");
  });

  it("country switches via ORANGE_MONEY_COUNTRY", async () => {
    process.env["ORANGE_MONEY_COUNTRY"] = "ci";
    resetClient();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "x", expires_in: 3600 }),
        text: () => Promise.resolve(""),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({})),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    await omGet("/balance");
    expect(fetchMock.mock.calls[1][0]).toContain("/orange-money-webpay/ci/v1");
  });

  it("subsequent API calls use Bearer + Accept headers", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "tok_abc", expires_in: 3600 }),
        text: () => Promise.resolve(""),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({})),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    await omPost("/webpayment", { amount: 1000 });
    const apiHeaders = new Headers(fetchMock.mock.calls[1][1].headers);
    expect(apiHeaders.get("Authorization")).toBe("Bearer tok_abc");
    expect(apiHeaders.get("Accept")).toBe("application/json");
  });

  it("throws when ORANGE_MONEY_COUNTRY missing", async () => {
    delete process.env["ORANGE_MONEY_COUNTRY"];
    resetClient();
    await expect(omGet("/balance")).rejects.toThrow("ORANGE_MONEY_COUNTRY");
  });

  it("throws when client credentials missing", async () => {
    delete process.env["ORANGE_MONEY_CLIENT_ID"];
    resetClient();
    await expect(omGet("/balance")).rejects.toThrow("ORANGE_MONEY_CLIENT_ID");
  });
});
