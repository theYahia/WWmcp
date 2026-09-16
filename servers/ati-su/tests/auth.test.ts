/**
 * Tests for the ATI.su token provider (auth.ts).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authMode, getAccessToken, resetAuthCache } from "../src/auth.js";

const mockFetch = vi.fn();

function clearAuthEnv() {
  delete process.env.ATI_TOKEN;
  delete process.env.ATI_CLIENT_ID;
  delete process.env.ATI_CLIENT_SECRET;
  delete process.env.ATI_REFRESH_TOKEN;
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  clearAuthEnv();
  resetAuthCache();
});

afterEach(() => {
  vi.restoreAllMocks();
  clearAuthEnv();
});

function tokenRes(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 401, json: async () => body, text: async () => JSON.stringify(body) };
}

describe("authMode", () => {
  it("is 'static' when ATI_TOKEN is set (and takes precedence)", () => {
    process.env.ATI_TOKEN = "t";
    process.env.ATI_CLIENT_ID = "c";
    process.env.ATI_CLIENT_SECRET = "s";
    process.env.ATI_REFRESH_TOKEN = "r";
    expect(authMode()).toBe("static");
  });

  it("is 'oauth2' when the three OAuth vars are set", () => {
    process.env.ATI_CLIENT_ID = "c";
    process.env.ATI_CLIENT_SECRET = "s";
    process.env.ATI_REFRESH_TOKEN = "r";
    expect(authMode()).toBe("oauth2");
  });

  it("is 'none' when nothing is configured", () => {
    expect(authMode()).toBe("none");
  });
});

describe("getAccessToken — static", () => {
  it("returns the static token without any network call", async () => {
    process.env.ATI_TOKEN = "static-123";
    expect(await getAccessToken()).toBe("static-123");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("getAccessToken — none", () => {
  it("throws a helpful error", async () => {
    await expect(getAccessToken()).rejects.toThrow(/credentials/i);
  });
});

describe("getAccessToken — oauth2", () => {
  beforeEach(() => {
    process.env.ATI_CLIENT_ID = "c";
    process.env.ATI_CLIENT_SECRET = "s";
    process.env.ATI_REFRESH_TOKEN = "r";
  });

  it("exchanges the refresh token and posts form-encoded body to the token URL", async () => {
    mockFetch.mockResolvedValueOnce(tokenRes({ access_token: "at1", expires_in: 7200 }));
    const token = await getAccessToken();
    expect(token).toBe("at1");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.ati.su/oauth2/token");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(String(options.body)).toContain("grant_type=refresh_token");
    expect(String(options.body)).toContain("refresh_token=r");
  });

  it("caches the access token (second call does not refetch)", async () => {
    mockFetch.mockResolvedValueOnce(tokenRes({ access_token: "at1", expires_in: 7200 }));
    await getAccessToken();
    await getAccessToken();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("collapses concurrent refreshes into a single token request (single-flight)", async () => {
    mockFetch.mockResolvedValue(tokenRes({ access_token: "at1", expires_in: 7200 }));
    const [a, b] = await Promise.all([getAccessToken(), getAccessToken()]);
    expect(a).toBe("at1");
    expect(b).toBe("at1");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("forceRefresh bypasses the cache and fetches a fresh token", async () => {
    mockFetch
      .mockResolvedValueOnce(tokenRes({ access_token: "at1", expires_in: 7200 }))
      .mockResolvedValueOnce(tokenRes({ access_token: "at2", expires_in: 7200 }));
    expect(await getAccessToken()).toBe("at1");
    expect(await getAccessToken(true)).toBe("at2");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws when the token response lacks an access_token", async () => {
    mockFetch.mockResolvedValueOnce(tokenRes({ error: "invalid_grant" }));
    await expect(getAccessToken()).rejects.toThrow(/access_token/);
  });

  it("throws when the token endpoint returns a non-2xx", async () => {
    mockFetch.mockResolvedValueOnce(tokenRes({}, false));
    await expect(getAccessToken()).rejects.toThrow(/token request failed/i);
  });
});
