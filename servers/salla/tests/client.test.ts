import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SallaClient } from "../src/client.js";

describe("SallaClient", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["SALLA_ACCESS_TOKEN"] = "test-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("does not throw on construction without env var (lazy init)", () => {
    delete process.env["SALLA_ACCESS_TOKEN"];
    expect(() => new SallaClient()).not.toThrow();
  });

  it("throws on first request when SALLA_ACCESS_TOKEN missing", async () => {
    delete process.env["SALLA_ACCESS_TOKEN"];
    const client = new SallaClient();
    await expect(client.request("GET", "/products")).rejects.toThrow("SALLA_ACCESS_TOKEN");
  });

  it("sends Bearer auth header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new SallaClient();
    await client.request("GET", "/products");
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.salla.dev/admin/v2/products");
    expect(new Headers(opts.headers).get("Authorization")).toBe("Bearer test-token");
  });

  it("sends body for POST", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: { id: 1 } })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new SallaClient();
    await client.request("POST", "/products", { name: "Test" });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ name: "Test" });
  });
});
