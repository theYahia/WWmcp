import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiGet, apiPost, resetClient } from "../src/client.js";

describe("vk-ads client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["VK_ADS_TOKEN"] = "test-token-123";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("apiGet sends Bearer auth header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ items: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiGet("/campaigns.json", { account_id: "100" });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain("/campaigns.json");
    expect(url).toContain("account_id=100");
    expect(new Headers(opts.headers).get("Authorization")).toBe("Bearer test-token-123");
  });

  it("apiPost sends JSON body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 200 })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiPost("/campaigns.json", { name: "Test", type: "normal" });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ name: "Test", type: "normal" });
  });

  it("throws when VK_ADS_TOKEN missing", async () => {
    delete process.env["VK_ADS_TOKEN"];
    resetClient();
    await expect(apiGet("/test")).rejects.toThrow("VK_ADS_TOKEN");
  });

  it("retries on 500 then succeeds", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false, status: 500, statusText: "Internal",
        text: () => Promise.resolve(""),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", fetchMock);

    await apiGet("/test");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws on 401 without retry attempt count overflow", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false, status: 401, statusText: "Unauthorized",
      text: () => Promise.resolve("Bad token"),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiGet("/test")).rejects.toMatchObject({ status: 401 });
  });
});
