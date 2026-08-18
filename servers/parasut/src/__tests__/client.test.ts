import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
(global as any).fetch = mockFetch;

const ENV = {
  PARASUT_CLIENT_ID: "cid",
  PARASUT_CLIENT_SECRET: "csecret",
  PARASUT_USERNAME: "me@example.com",
  PARASUT_PASSWORD: "pw",
  PARASUT_COMPANY_ID: "12345",
};

/** OAuth token endpoint mock (client reads response via .json()). */
function mockToken(access: string, refresh: string, expiresIn = 7200) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ access_token: access, token_type: "bearer", expires_in: expiresIn, refresh_token: refresh }),
  });
}

function lastForm(callIndex: number): URLSearchParams {
  return mockFetch.mock.calls[callIndex][1].body as URLSearchParams;
}

describe("client auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(process.env, ENV);
  });
  afterEach(() => {
    for (const k of Object.keys(ENV)) delete process.env[k as keyof typeof ENV];
  });

  it("uses grant_type=password with username + redirect_uri (NOT client_credentials)", async () => {
    const { _getAccessToken, _reset, _AUTH_URL } = await import("../src/client.js");
    _reset();
    mockToken("a1", "r1");
    const token = await _getAccessToken();

    expect(token).toBe("a1");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe(_AUTH_URL);
    const form = lastForm(0);
    expect(form.get("grant_type")).toBe("password");
    expect(form.get("username")).toBe("me@example.com");
    expect(form.get("redirect_uri")).toBe("urn:ietf:wg:oauth:2.0:oob");
    expect(form.get("client_id")).toBe("cid");
  });

  it("refreshes with grant_type=refresh_token and rotates the stored refresh_token", async () => {
    const { _getAccessToken, _reset } = await import("../src/client.js");
    _reset();

    // 1st auth: token already expired (expires_in 0 => stale immediately), refresh_token r1.
    mockToken("a1", "r1", 0);
    expect(await _getAccessToken()).toBe("a1");

    // 2nd call: stale -> refresh with r1, server rotates to r2, again expires_in 0.
    mockToken("a2", "r2", 0);
    expect(await _getAccessToken()).toBe("a2");
    expect(lastForm(1).get("grant_type")).toBe("refresh_token");
    expect(lastForm(1).get("refresh_token")).toBe("r1");

    // 3rd call: must use the ROTATED refresh_token r2, proving rotation persisted.
    mockToken("a3", "r3", 7200);
    expect(await _getAccessToken()).toBe("a3");
    expect(lastForm(2).get("grant_type")).toBe("refresh_token");
    expect(lastForm(2).get("refresh_token")).toBe("r2");
  });

  it("falls back to a full password grant if refresh fails", async () => {
    const { _getAccessToken, _reset } = await import("../src/client.js");
    _reset();

    mockToken("a1", "r1", 0); // initial, immediately stale
    await _getAccessToken();

    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, text: async () => "invalid_grant" }); // refresh fails
    mockToken("a2", "r2", 7200); // password re-auth
    expect(await _getAccessToken()).toBe("a2");
    expect(lastForm(1).get("grant_type")).toBe("refresh_token"); // attempted refresh
    expect(lastForm(2).get("grant_type")).toBe("password"); // then fell back
  });

  it("throws a clear error when required env vars are missing", async () => {
    const { _getAccessToken, _reset } = await import("../src/client.js");
    _reset();
    delete process.env.PARASUT_PASSWORD;
    await expect(_getAccessToken()).rejects.toThrow("PARASUT_PASSWORD");
  });
});

describe("formatApiError", () => {
  it("parses the JSON:API { errors: [{ title, detail }] } shape", async () => {
    const { _formatApiError } = await import("../src/client.js");
    const msg = _formatApiError(422, JSON.stringify({ errors: [{ title: "Geçersiz", detail: "issue_date boş" }] }));
    expect(msg).toBe("Parasut HTTP 422: Geçersiz: issue_date boş");
  });
  it("joins multiple errors", async () => {
    const { _formatApiError } = await import("../src/client.js");
    const msg = _formatApiError(400, JSON.stringify({ errors: [{ title: "A" }, { detail: "B" }] }));
    expect(msg).toBe("Parasut HTTP 400: A; B");
  });
  it("falls back to raw text for non-JSON bodies", async () => {
    const { _formatApiError } = await import("../src/client.js");
    expect(_formatApiError(500, "Internal Error")).toBe("Parasut HTTP 500: Internal Error");
  });
});

describe("retryDelayMs", () => {
  it("honors a Retry-After header (seconds)", async () => {
    const { _retryDelayMs } = await import("../src/client.js");
    expect(_retryDelayMs(new Headers({ "Retry-After": "5" }), 1, 429)).toBe(5000);
  });
  it("waits a full 10s window for an undocumented 429 with no header", async () => {
    const { _retryDelayMs } = await import("../src/client.js");
    expect(_retryDelayMs(new Headers(), 1, 429)).toBe(10_000);
  });
  it("uses exponential backoff for 5xx", async () => {
    const { _retryDelayMs } = await import("../src/client.js");
    expect(_retryDelayMs(new Headers(), 1, 500)).toBe(1000);
    expect(_retryDelayMs(new Headers(), 2, 500)).toBe(2000);
  });
});

describe("extractCompanyId", () => {
  it("reads companies[0].id from /me", async () => {
    const { _extractCompanyId } = await import("../src/client.js");
    expect(_extractCompanyId({ data: { id: "u", type: "users", relationships: { companies: { data: [{ id: "77" }] } } } } as any)).toBe(
      "77",
    );
  });
  it("reads a single company relationship", async () => {
    const { _extractCompanyId } = await import("../src/client.js");
    expect(_extractCompanyId({ data: { id: "u", type: "users", relationships: { company: { data: { id: "9" } } } } } as any)).toBe("9");
  });
  it("returns undefined when no company is present", async () => {
    const { _extractCompanyId } = await import("../src/client.js");
    expect(_extractCompanyId({ data: { id: "u", type: "users" } } as any)).toBeUndefined();
  });
});
