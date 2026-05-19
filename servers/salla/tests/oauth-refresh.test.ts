import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SallaRefreshStrategy, SallaClient } from "../src/client.js";

describe("SallaRefreshStrategy", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockTokenEndpoint(
    body: Record<string, unknown>,
    status = 200,
  ): ReturnType<typeof vi.fn> {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: () => Promise.resolve(JSON.stringify(body)),
      json: () => Promise.resolve(body),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("refreshes the token before the first request when no initial token is provided", async () => {
    const fetchMock = mockTokenEndpoint({
      access_token: "new-access-token",
      refresh_token: "rotated-refresh",
      expires_in: 1209600, // 14 days
      token_type: "Bearer",
    });

    const strat = new SallaRefreshStrategy({
      clientId: "cid",
      clientSecret: "csec",
      refreshToken: "initial-refresh",
    });
    const req = await strat.authenticate({ headers: {} });
    const auth = new Headers(req.headers).get("Authorization");
    expect(auth).toBe("Bearer new-access-token");

    // Token endpoint hit with refresh_token grant + offline_access scope
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://accounts.salla.sa/oauth2/token");
    const body = new URLSearchParams(opts.body as string);
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("client_id")).toBe("cid");
    expect(body.get("client_secret")).toBe("csec");
    expect(body.get("refresh_token")).toBe("initial-refresh");
    expect(body.get("scope")).toBe("offline_access");
  });

  it("reuses the cached token while it's still fresh", async () => {
    const fetchMock = mockTokenEndpoint({
      access_token: "first-token",
      refresh_token: "rot",
      expires_in: 1209600,
    });
    const strat = new SallaRefreshStrategy({
      clientId: "cid",
      clientSecret: "csec",
      refreshToken: "r",
    });
    await strat.authenticate({ headers: {} });
    await strat.authenticate({ headers: {} });
    await strat.authenticate({ headers: {} });
    // 3 authenticate calls → only ONE token endpoint hit
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("re-refreshes after expiry timestamp passes", async () => {
    // Initial token already expired (initialExpiresAt = 0)
    const fetchMock = mockTokenEndpoint({
      access_token: "second-token",
      refresh_token: "rotated",
      expires_in: 1209600,
    });
    const strat = new SallaRefreshStrategy({
      clientId: "cid",
      clientSecret: "csec",
      refreshToken: "r",
      initialAccessToken: "stale-token",
      initialExpiresAt: 0, // == 1970, definitely past
    });
    const req = await strat.authenticate({ headers: {} });
    expect(new Headers(req.headers).get("Authorization")).toBe(
      "Bearer second-token",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("calls the persist callback with the new token pair", async () => {
    mockTokenEndpoint({
      access_token: "fresh",
      refresh_token: "fresh-refresh",
      expires_in: 100,
    });
    const persisted: unknown[] = [];
    const strat = new SallaRefreshStrategy({
      clientId: "cid",
      clientSecret: "csec",
      refreshToken: "old-refresh",
      persist: async (s) => {
        persisted.push(s);
      },
    });
    await strat.authenticate({ headers: {} });
    expect(persisted).toHaveLength(1);
    const p = persisted[0] as {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
    expect(p.accessToken).toBe("fresh");
    expect(p.refreshToken).toBe("fresh-refresh");
    expect(p.expiresAt).toBeGreaterThan(Date.now() / 1000 - 5);
  });

  it("rotates the refresh token between refreshes (Salla rotates on every refresh)", async () => {
    let call = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      call += 1;
      return {
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              access_token: `tok-${call}`,
              refresh_token: `refresh-${call}`,
              expires_in: 0, // immediately expired → forces re-refresh next call
            }),
          ),
        headers: new Map(),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const strat = new SallaRefreshStrategy({
      clientId: "cid",
      clientSecret: "csec",
      refreshToken: "r0",
      expiryBuffer: 0,
    });
    await strat.authenticate({ headers: {} });
    await strat.authenticate({ headers: {} });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    // Second call should use refresh token rotated from the first response.
    const secondBody = new URLSearchParams(
      fetchMock.mock.calls[1][1].body as string,
    );
    expect(secondBody.get("refresh_token")).toBe("refresh-1");
  });

  it("throws a helpful error when the token endpoint returns 4xx", async () => {
    mockTokenEndpoint(
      { error: "invalid_grant", error_description: "Refresh token expired" },
      400,
    );
    const strat = new SallaRefreshStrategy({
      clientId: "cid",
      clientSecret: "csec",
      refreshToken: "expired",
    });
    await expect(strat.authenticate({ headers: {} })).rejects.toThrow(
      /Salla OAuth refresh failed.*400/,
    );
  });

  it("deduplicates concurrent refreshes (single token endpoint hit)", async () => {
    const fetchMock = mockTokenEndpoint({
      access_token: "concurrent-token",
      refresh_token: "r1",
      expires_in: 1209600,
    });
    const strat = new SallaRefreshStrategy({
      clientId: "cid",
      clientSecret: "csec",
      refreshToken: "r",
    });
    const [a, b, c] = await Promise.all([
      strat.authenticate({ headers: {} }),
      strat.authenticate({ headers: {} }),
      strat.authenticate({ headers: {} }),
    ]);
    expect(new Headers(a.headers).get("Authorization")).toContain(
      "concurrent-token",
    );
    expect(new Headers(b.headers).get("Authorization")).toContain(
      "concurrent-token",
    );
    expect(new Headers(c.headers).get("Authorization")).toContain(
      "concurrent-token",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("SallaClient env-driven auth selection", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Strip Salla env vars between tests so each one starts clean.
    delete process.env["SALLA_ACCESS_TOKEN"];
    delete process.env["SALLA_OAUTH_CLIENT_ID"];
    delete process.env["SALLA_OAUTH_CLIENT_SECRET"];
    delete process.env["SALLA_REFRESH_TOKEN"];
    delete process.env["SALLA_ACCESS_TOKEN_EXPIRES_AT"];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("uses the static Bearer token when only SALLA_ACCESS_TOKEN is set", async () => {
    process.env["SALLA_ACCESS_TOKEN"] = "static-token";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new SallaClient();
    await client.request("GET", "/products");
    const auth = new Headers(fetchMock.mock.calls[0][1].headers).get(
      "Authorization",
    );
    expect(auth).toBe("Bearer static-token");
    // No token endpoint hit — static mode does not refresh.
    expect(
      fetchMock.mock.calls.some((c) =>
        String(c[0]).includes("accounts.salla.sa"),
      ),
    ).toBe(false);
  });

  it("uses refresh mode when all OAuth env vars are set", async () => {
    process.env["SALLA_OAUTH_CLIENT_ID"] = "cid";
    process.env["SALLA_OAUTH_CLIENT_SECRET"] = "csec";
    process.env["SALLA_REFRESH_TOKEN"] = "rfr";

    let calls = 0;
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      calls += 1;
      if (url.includes("accounts.salla.sa")) {
        return {
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              JSON.stringify({
                access_token: "refreshed-bearer",
                refresh_token: "next-rfr",
                expires_in: 1209600,
              }),
            ),
          headers: new Map(),
        };
      }
      return {
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: [] })),
        headers: new Map(),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new SallaClient();
    await client.request("GET", "/products");
    expect(calls).toBeGreaterThanOrEqual(2); // token endpoint + api
    // Find the products call and check Authorization header
    const productsCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes("/products"),
    );
    expect(productsCall).toBeDefined();
    const auth = new Headers(productsCall![1].headers).get("Authorization");
    expect(auth).toBe("Bearer refreshed-bearer");
  });

  it("errors clearly when no auth is configured", async () => {
    const client = new SallaClient();
    await expect(client.request("GET", "/products")).rejects.toThrow(
      /Salla auth not configured/,
    );
  });
});
