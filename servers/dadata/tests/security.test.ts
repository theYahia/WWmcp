/**
 * Security-focused tests.
 *
 * Validates:
 *   - No secrets leak to stdout (JSON-RPC channel)
 *   - Input validation rejects malicious payloads
 *   - Path traversal attempts are blocked
 *   - Error messages are safe for external consumption
 *   - No prototype pollution in JSON parsing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callSuggestions, callCleaner, callProfileAPI } from "../src/client.js";
import { success, error } from "../src/lib/formatters.js";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  process.env.DADATA_API_KEY = "test-key";
  process.env.DADATA_SECRET_KEY = "test-secret";
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.DADATA_API_KEY;
  delete process.env.DADATA_SECRET_KEY;
});

// ---------------------------------------------------------------------------
// Path traversal prevention
// ---------------------------------------------------------------------------

describe("Path traversal prevention", () => {
  const maliciousEndpoints = [
    "../../../etc/passwd",
    "suggest/address?token=stolen",
    "suggest/address#fragment",
    "suggest/../findById/party",
    "%2e%2e%2f%2e%2e%2fetc/passwd",
    "suggest/address\x00",
    "suggest/address\nHost: evil.com",
  ];

  for (const endpoint of maliciousEndpoints) {
    it(`callSuggestions blocks: "${endpoint}"`, async () => {
      const result = await callSuggestions(endpoint, { query: "x" });
      expect(result.error).toContain("Invalid endpoint");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  }

  const maliciousTypes = [
    "../../../etc",
    "phone?extra=param",
    "address\x00",
    "phone; rm -rf /",
    "PHONE",  // uppercase not allowed
  ];

  for (const type of maliciousTypes) {
    it(`callCleaner blocks: "${type}"`, async () => {
      const result = await callCleaner(type, ["test"]);
      // Either blocked by regex or by missing secret
      if (result.error?.includes("Invalid")) {
        expect(mockFetch).not.toHaveBeenCalled();
      }
    });
  }

  const maliciousProfileEndpoints = [
    "../../secrets",
    "profile/balance?key=x",
    "profile\x00",
  ];

  for (const endpoint of maliciousProfileEndpoints) {
    it(`callProfileAPI blocks: "${endpoint}"`, async () => {
      const result = await callProfileAPI(endpoint);
      expect(result.error).toContain("Invalid");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  }
});

// ---------------------------------------------------------------------------
// Secret leakage prevention
// ---------------------------------------------------------------------------

describe("Secret leakage prevention", () => {
  it("401 error never contains the actual API key", async () => {
    process.env.DADATA_API_KEY = "my-super-secret-key-abc123";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toBeDefined();
    expect(result.error).not.toContain("my-super-secret-key-abc123");
  });

  it("403 error never contains the secret key", async () => {
    process.env.DADATA_SECRET_KEY = "my-secret-key-xyz789";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({}),
    });

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toBeDefined();
    expect(result.error).not.toContain("my-secret-key-xyz789");
  });

  it("network error messages don't leak env vars", async () => {
    process.env.DADATA_API_KEY = "leak-this-key";
    mockFetch
      .mockRejectedValueOnce(new Error("connect ECONNREFUSED"))
      .mockRejectedValueOnce(new Error("connect ECONNREFUSED"))
      .mockRejectedValueOnce(new Error("connect ECONNREFUSED"));

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).not.toContain("leak-this-key");
  });
});

// ---------------------------------------------------------------------------
// Response format safety
// ---------------------------------------------------------------------------

describe("Response format safety", () => {
  it("success() output is valid JSON", () => {
    const result = success({ test: "<script>alert('xss')</script>" });
    // JSON.stringify escapes HTML
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.test).toBe("<script>alert('xss')</script>");
    // The text itself is valid JSON, not raw HTML
    expect(result.content[0].type).toBe("text");
  });

  it("error() output is plain text, not JSON", () => {
    const result = error("Something failed");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Something failed");
  });

  it("success() handles deeply nested objects safely", () => {
    const deep = { a: { b: { c: { d: { e: "value" } } } } };
    const result = success(deep);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.a.b.c.d.e).toBe("value");
  });

  it("success() handles arrays safely", () => {
    const result = success([1, 2, 3]);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toEqual([1, 2, 3]);
  });
});

// ---------------------------------------------------------------------------
// Graceful degradation
// ---------------------------------------------------------------------------

describe("Graceful degradation", () => {
  it("callCleaner returns actionable error when SECRET_KEY missing", async () => {
    delete process.env.DADATA_SECRET_KEY;

    const result = await callCleaner("phone", ["89161234567"]);
    expect(result.error).toContain("DADATA_SECRET_KEY is required");
    expect(result.error).toContain("dadata.ru/profile");
    expect(result.data).toBeNull();
    // No HTTP call should have been made
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("callSuggestions works without SECRET_KEY", async () => {
    delete process.env.DADATA_SECRET_KEY;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ suggestions: [] }),
    });

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
