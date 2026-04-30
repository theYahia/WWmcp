import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { IletiMerkeziClient } from "../src/client.js";

describe("IletiMerkeziClient", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["ILETI_API_KEY"] = "test-api-key";
    process.env["ILETI_SECRET"] = "test-secret";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("does not throw on construction without env vars (lazy init)", () => {
    delete process.env["ILETI_API_KEY"];
    delete process.env["ILETI_SECRET"];
    expect(() => new IletiMerkeziClient()).not.toThrow();
  });

  it("throws on first request when ILETI_API_KEY missing", async () => {
    delete process.env["ILETI_API_KEY"];
    const client = new IletiMerkeziClient();
    await expect(client.request("GET", "/balance")).rejects.toThrow("ILETI_API_KEY");
  });

  it("sends X-API-Key + X-API-Hash headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ balance: 1000 })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new IletiMerkeziClient();
    await client.request("GET", "/balance");
    const headers = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(headers.get("X-API-Key")).toBe("test-api-key");
    expect(headers.get("X-API-Hash")).toMatch(/^[0-9a-f]{64}$/); // SHA256 hex = 64 chars
  });

  it("X-API-Hash differs across requests (timestamp changes)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({})),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new IletiMerkeziClient();
    await client.request("GET", "/balance");
    // Wait a millisecond so the ISO timestamp changes
    await new Promise((r) => setTimeout(r, 2));
    await client.request("GET", "/balance");

    const hash1 = new Headers(fetchMock.mock.calls[0][1].headers).get("X-API-Hash");
    const hash2 = new Headers(fetchMock.mock.calls[1][1].headers).get("X-API-Hash");
    expect(hash1).not.toBe(hash2);
  });

  it("POST sends body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ messageId: "msg_001" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new IletiMerkeziClient();
    await client.request("POST", "/send-sms", { to: "+905551234567", message: "Hi" });
    const opts = fetchMock.mock.calls[0][1];
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ to: "+905551234567", message: "Hi" });
  });
});
