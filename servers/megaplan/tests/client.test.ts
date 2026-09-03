import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { megaplanGet, megaplanPost, resetClient } from "../src/client.js";

type FetchCall = [string, RequestInit & { body?: any }];

function mockFetch(responses: Array<{ status?: number; body?: unknown }>) {
  const mock = vi.fn();
  for (const r of responses) {
    const status = r.status ?? 200;
    mock.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      statusText: String(status),
      text: () => Promise.resolve(JSON.stringify(r.body ?? {})),
      json: () => Promise.resolve(r.body ?? {}),
      headers: new Headers(),
    });
  }
  vi.stubGlobal("fetch", mock);
  return mock as unknown as { mock: { calls: FetchCall[] } } & ReturnType<typeof vi.fn>;
}

describe("megaplan client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MEGAPLAN_DOMAIN"] = "acme";
    process.env["MEGAPLAN_TOKEN"] = "static-token";
    delete process.env["MEGAPLAN_LOGIN"];
    delete process.env["MEGAPLAN_PASSWORD"];
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("expands a bare subdomain to <sub>.megaplan.ru", async () => {
    const fetchMock = mockFetch([{ body: { data: [] } }]);
    await megaplanGet("/task");
    expect(fetchMock.mock.calls[0][0]).toBe("https://acme.megaplan.ru/api/v3/task");
  });

  it("accepts a full host and strips the scheme", async () => {
    process.env["MEGAPLAN_DOMAIN"] = "https://acme.megaplan.ru/";
    resetClient();
    const fetchMock = mockFetch([{ body: {} }]);
    await megaplanGet("/task");
    expect(fetchMock.mock.calls[0][0]).toBe("https://acme.megaplan.ru/api/v3/task");
  });

  it.each(["evil.com/path", "user:pass@evil.com", "acme megaplan ru", "../etc"])(
    "rejects an unsafe MEGAPLAN_DOMAIN: %s",
    async (domain) => {
      process.env["MEGAPLAN_DOMAIN"] = domain;
      resetClient();
      await expect(megaplanGet("/task")).rejects.toThrow(/MEGAPLAN_DOMAIN is invalid/);
    },
  );

  it("serializes the v3 list query as a single URL-encoded JSON object", async () => {
    const fetchMock = mockFetch([{ body: {} }]);
    await megaplanGet("/task", { limit: 10, q: "urgent" });
    const url = fetchMock.mock.calls[0][0];
    const [base, query] = url.split("?");
    expect(base).toBe("https://acme.megaplan.ru/api/v3/task");
    expect(JSON.parse(decodeURIComponent(query))).toEqual({ limit: 10, q: "urgent" });
    // Flat filter[...] params are what the pre-4.0 client sent — must be gone.
    expect(url).not.toContain("filter%5B");
  });

  it("omits the query entirely when there are no params", async () => {
    const fetchMock = mockFetch([{ body: {} }]);
    await megaplanGet("/task/7");
    expect(fetchMock.mock.calls[0][0]).not.toContain("?");
  });

  it("sends the static token as a Bearer header", async () => {
    const fetchMock = mockFetch([{ body: {} }]);
    await megaplanPost("/task", { name: "x" });
    const init = fetchMock.mock.calls[0][1];
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer static-token");
    expect(JSON.parse(init.body)).toEqual({ name: "x" });
  });

  it("password grant posts urlencoded form fields, not JSON", async () => {
    delete process.env["MEGAPLAN_TOKEN"];
    process.env["MEGAPLAN_LOGIN"] = "u@example.com";
    process.env["MEGAPLAN_PASSWORD"] = "secret";
    resetClient();

    const fetchMock = mockFetch([{ body: { access_token: "fresh" } }, { body: {} }]);
    await megaplanGet("/task");

    const [authUrl, authInit] = fetchMock.mock.calls[0];
    expect(authUrl).toBe("https://acme.megaplan.ru/api/v3/auth/access_token");
    expect(authInit.body).toBeInstanceOf(URLSearchParams);
    expect(Object.fromEntries(authInit.body as URLSearchParams)).toEqual({
      username: "u@example.com",
      password: "secret",
      grant_type: "password",
    });
    expect(new Headers(fetchMock.mock.calls[1][1].headers).get("Authorization")).toBe("Bearer fresh");
  });

  it("authenticates once for concurrent requests (no thundering herd)", async () => {
    delete process.env["MEGAPLAN_TOKEN"];
    process.env["MEGAPLAN_LOGIN"] = "u@example.com";
    process.env["MEGAPLAN_PASSWORD"] = "secret";
    resetClient();

    const fetchMock = mockFetch([
      { body: { access_token: "fresh" } },
      { body: {} },
      { body: {} },
      { body: {} },
    ]);
    await Promise.all([megaplanGet("/task"), megaplanGet("/deal"), megaplanGet("/project")]);

    const authCalls = fetchMock.mock.calls.filter(([url]) => url.endsWith("/auth/access_token"));
    expect(authCalls).toHaveLength(1);
  });

  it("folds the upstream error body into the thrown message", async () => {
    mockFetch([{ status: 422, body: { message: "deadline must be a DateTime" } }]);
    await expect(megaplanPost("/task", {})).rejects.toThrow(/deadline must be a DateTime/);
  });
});
