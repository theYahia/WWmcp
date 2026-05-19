import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AvitoClient } from "../src/client.js";

describe("AvitoClient OAuth client_credentials", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env["AVITO_CLIENT_ID"];
    delete process.env["AVITO_CLIENT_SECRET"];
    delete process.env["AVITO_USER_ID"];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("does not throw on construction without env vars (lazy init)", () => {
    expect(() => new AvitoClient()).not.toThrow();
  });

  it("throws a clear error on first request when client credentials are missing", async () => {
    const client = new AvitoClient();
    await expect(client.request("GET", "/core/v1/items")).rejects.toThrow(
      /Avito auth not configured/,
    );
  });

  it("requests an access token then sends Bearer auth, caching the token across calls", async () => {
    process.env["AVITO_CLIENT_ID"] = "test-client";
    process.env["AVITO_CLIENT_SECRET"] = "test-secret";

    const fetchMock = vi
      .fn()
      // 1st call: token endpoint
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            access_token: "test-access-token",
            expires_in: 86400, // 24h, per Avito docs
            token_type: "Bearer",
          }),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              access_token: "test-access-token",
              expires_in: 86400,
              token_type: "Bearer",
            }),
          ),
        headers: new Map(),
      })
      // 2nd call: actual API
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ resources: [] })),
        headers: new Map(),
      })
      // 3rd call: second API call — should reuse cached token, no second token fetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ resources: [] })),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AvitoClient();
    await client.request("GET", "/core/v1/items");
    await client.request("GET", "/core/v1/items");

    // 1 token request + 2 API requests = 3 fetches (NOT 4).
    expect(fetchMock).toHaveBeenCalledTimes(3);

    // First call: token endpoint with client_credentials grant
    const [tokenUrl, tokenOpts] = fetchMock.mock.calls[0];
    expect(tokenUrl).toBe("https://api.avito.ru/token/");
    expect(tokenOpts.method).toBe("POST");
    expect(tokenOpts.body).toContain("grant_type=client_credentials");
    expect(tokenOpts.body).toContain("client_id=test-client");
    expect(tokenOpts.body).toContain("client_secret=test-secret");

    // Second call: API with Bearer header
    const [apiUrl, apiOpts] = fetchMock.mock.calls[1];
    expect(apiUrl).toBe("https://api.avito.ru/core/v1/items");
    expect(new Headers(apiOpts.headers).get("Authorization")).toBe(
      "Bearer test-access-token",
    );
  });

  it("resolveUserId prefers explicit param over env", () => {
    process.env["AVITO_USER_ID"] = "111";
    const client = new AvitoClient();
    expect(client.resolveUserId(222)).toBe("222");
    expect(client.resolveUserId()).toBe("111");
  });

  it("resolveUserId throws when neither param nor env is set", () => {
    const client = new AvitoClient();
    expect(() => client.resolveUserId()).toThrow(/user_id is required/);
  });
});
