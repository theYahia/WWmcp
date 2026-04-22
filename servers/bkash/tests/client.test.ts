import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bkashPost, resetClient } from "../src/client.js";

describe("bkash client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["BKASH_APP_KEY"] = "test_app_key";
    process.env["BKASH_APP_SECRET"] = "test_app_secret";
    process.env["BKASH_USERNAME"] = "test_user";
    process.env["BKASH_PASSWORD"] = "test_pass";
    process.env["BKASH_SANDBOX"] = "true";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("performs grant token then forwards to API endpoint", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id_token: "id_abc", refresh_token: "rfr_abc" }),
        text: () => Promise.resolve(""),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ paymentID: "pay_001" })),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    await bkashPost("/tokenized/checkout/create", { amount: "500" });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    // First call: grant token
    const [grantUrl, grantOpts] = fetchMock.mock.calls[0];
    expect(grantUrl).toBe("https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant");
    expect(grantOpts.headers.username).toBe("test_user");
    expect(grantOpts.headers.password).toBe("test_pass");
    expect(JSON.parse(grantOpts.body)).toEqual({
      app_key: "test_app_key",
      app_secret: "test_app_secret",
    });

    // Second call: API request with token
    const [apiUrl, apiOpts] = fetchMock.mock.calls[1];
    expect(apiUrl).toBe("https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create");
    const apiHeaders = new Headers(apiOpts.headers);
    expect(apiHeaders.get("Authorization")).toBe("id_abc"); // raw token, no "Bearer" prefix
    expect(apiHeaders.get("X-APP-Key")).toBe("test_app_key");
  });

  it("uses sandbox URL when BKASH_SANDBOX=true", async () => {
    process.env["BKASH_SANDBOX"] = "true";
    resetClient();
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id_token: "x" }),
      text: () => Promise.resolve(""),
      headers: new Map(),
    }).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({})),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await bkashPost("/tokenized/checkout/create", {});
    expect(fetchMock.mock.calls[1][0]).toContain("sandbox.bka.sh");
  });

  it("uses production URL when BKASH_SANDBOX not set", async () => {
    delete process.env["BKASH_SANDBOX"];
    resetClient();
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id_token: "x" }),
      text: () => Promise.resolve(""),
      headers: new Map(),
    }).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({})),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await bkashPost("/tokenized/checkout/create", {});
    expect(fetchMock.mock.calls[1][0]).toContain("tokenized.pay.bka.sh");
    expect(fetchMock.mock.calls[1][0]).not.toContain("sandbox");
  });

  it("throws when any credential missing", async () => {
    delete process.env["BKASH_APP_KEY"];
    resetClient();
    await expect(bkashPost("/x", {})).rejects.toThrow("BKASH_APP_KEY");
  });

  it("throws when grant token returns no id_token", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ statusCode: "2055", statusMessage: "Bad credentials" }),
      text: () => Promise.resolve(""),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(bkashPost("/x", {})).rejects.toThrow(/no id_token|Bad credentials/);
  });
});
