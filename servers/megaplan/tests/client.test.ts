import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { megaplanGet, megaplanPost, resetClient } from "../src/client.js";

describe("megaplan client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MEGAPLAN_DOMAIN"] = "test-company";
    process.env["MEGAPLAN_TOKEN"] = "preset-token";
    delete process.env["MEGAPLAN_LOGIN"];
    delete process.env["MEGAPLAN_PASSWORD"];
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("uses MEGAPLAN_TOKEN directly when set (no auth call)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await megaplanGet("/task");
    expect(fetchMock).toHaveBeenCalledOnce(); // single API call, no auth/access_token roundtrip
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://test-company/api/v3/task");
    expect(new Headers(opts.headers).get("Authorization")).toBe("Bearer preset-token");
  });

  it("falls back to Password grant when MEGAPLAN_TOKEN is missing", async () => {
    delete process.env["MEGAPLAN_TOKEN"];
    process.env["MEGAPLAN_LOGIN"] = "user@example.com";
    process.env["MEGAPLAN_PASSWORD"] = "secret";
    resetClient();

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "fetched-token" }),
        text: () => Promise.resolve(JSON.stringify({ access_token: "fetched-token" })),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: [] })),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    await megaplanGet("/task");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // First call: password grant
    const [authUrl, authOpts] = fetchMock.mock.calls[0];
    expect(authUrl).toContain("/auth/access_token");
    const authBody = JSON.parse(authOpts.body);
    expect(authBody).toEqual({
      username: "user@example.com",
      password: "secret",
      grant_type: "password",
    });

    // Second call: actual API request with fetched token
    const [, dataOpts] = fetchMock.mock.calls[1];
    expect(new Headers(dataOpts.headers).get("Authorization")).toBe("Bearer fetched-token");
  });

  it("data.access_token nested response shape is also supported", async () => {
    delete process.env["MEGAPLAN_TOKEN"];
    process.env["MEGAPLAN_LOGIN"] = "user@example.com";
    process.env["MEGAPLAN_PASSWORD"] = "secret";
    resetClient();

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { access_token: "nested-token" } }),
        text: () => Promise.resolve(JSON.stringify({ data: { access_token: "nested-token" } })),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({})),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    await megaplanGet("/task");
    const [, dataOpts] = fetchMock.mock.calls[1];
    expect(new Headers(dataOpts.headers).get("Authorization")).toBe("Bearer nested-token");
  });

  it("throws on first request when MEGAPLAN_DOMAIN missing", async () => {
    delete process.env["MEGAPLAN_DOMAIN"];
    resetClient();
    await expect(megaplanGet("/task")).rejects.toThrow("MEGAPLAN_DOMAIN");
  });

  it("throws on first request when neither token nor login/password are set", async () => {
    delete process.env["MEGAPLAN_TOKEN"];
    delete process.env["MEGAPLAN_LOGIN"];
    delete process.env["MEGAPLAN_PASSWORD"];
    resetClient();
    await expect(megaplanGet("/task")).rejects.toThrow(/MEGAPLAN_TOKEN|MEGAPLAN_LOGIN/);
  });

  it("megaplanPost sends body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await megaplanPost("/task", { name: "New task" });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ name: "New task" });
  });
});
