import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildODataPath, oneCGet, oneCPost, oneCPatch, resetClient } from "../src/client.js";

describe("buildODataPath", () => {
  it("builds path without query params", () => {
    const path = buildODataPath("Catalog_Test");
    expect(path).toBe("/odata/standard.odata/Catalog_Test");
  });

  it("builds path with query params preserving $ signs", () => {
    const path = buildODataPath("Catalog_Test", { $format: "json", $top: "10" });
    expect(path).toContain("/odata/standard.odata/Catalog_Test?");
    expect(path).toContain("$format=json");
    expect(path).toContain("$top=10");
  });

  it("encodes Cyrillic entity names", () => {
    const path = buildODataPath("Document_Счёт");
    expect(path).toContain(encodeURIComponent("Document_Счёт"));
  });
});

describe("oneCGet / oneCPost / oneCPatch", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://localhost:8080/base";
    process.env["ONEC_LOGIN"] = "admin";
    process.env["ONEC_PASSWORD"] = "secret";
    delete process.env["1C_BASE_URL"];
    delete process.env["1C_LOGIN"];
    delete process.env["1C_PASSWORD"];
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("oneCGet sends GET with Basic auth header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await oneCGet("/odata/standard.odata/Catalog_Test?$format=json");
    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/base/odata/standard.odata/Catalog_Test?$format=json");
    expect(opts.method).toBe("GET");
    const authHeader = new Headers(opts.headers).get("Authorization");
    expect(authHeader).toMatch(/^Basic /);
    // Verify Basic encoding: base64("admin:secret") == "YWRtaW46c2VjcmV0"
    expect(authHeader).toBe(`Basic ${Buffer.from("admin:secret").toString("base64")}`);
    expect(result).toEqual({ value: [] });
  });

  it("oneCPost sends POST with body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "abc-123" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await oneCPost("/odata/standard.odata/Document_Test", { Number: "001" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ Number: "001" });
    expect(result).toEqual({ Ref_Key: "abc-123" });
  });

  it("oneCPatch sends PATCH with body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "abc-123" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", mockFetch);

    await oneCPatch("/odata/standard.odata/Document_Test(guid'abc')", { Posted: true });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("PATCH");
  });

  it("throws when ONEC_BASE_URL missing", async () => {
    delete process.env["ONEC_BASE_URL"];
    delete process.env["1C_BASE_URL"];
    resetClient();
    await expect(oneCGet("/test")).rejects.toThrow("ONEC_BASE_URL");
  });

  it("throws when credentials missing", async () => {
    delete process.env["ONEC_LOGIN"];
    delete process.env["1C_LOGIN"];
    resetClient();
    await expect(oneCGet("/test")).rejects.toThrow(/ONEC_LOGIN/);
  });

  it("backward-compat: 1C_* env vars also accepted", async () => {
    delete process.env["ONEC_BASE_URL"];
    delete process.env["ONEC_LOGIN"];
    delete process.env["ONEC_PASSWORD"];
    process.env["1C_BASE_URL"] = "http://legacy:8080/base";
    process.env["1C_LOGIN"] = "legacy_user";
    process.env["1C_PASSWORD"] = "legacy_pass";
    resetClient();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", mockFetch);

    await oneCGet("/test");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("http://legacy:8080/base/test");
    const authHeader = new Headers(opts.headers).get("Authorization");
    expect(authHeader).toBe(`Basic ${Buffer.from("legacy_user:legacy_pass").toString("base64")}`);
  });

  it("retries on 500 then succeeds", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: false, status: 500, statusText: "Internal",
        text: () => Promise.resolve(""),
        headers: new Map(),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ value: [1] })),
        headers: new Map(),
      });
    vi.stubGlobal("fetch", mockFetch);

    const result = await oneCGet("/test");
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ value: [1] });
  });

  it("throws on 404 without retry", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false, status: 404, statusText: "Not Found",
      text: () => Promise.resolve("Not found"),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(oneCGet("/missing")).rejects.toMatchObject({ status: 404 });
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
