/**
 * Tests for DaData HTTP client.
 *
 * Security tests:
 *   - API keys are never in error responses
 *   - Path traversal in endpoint names is blocked
 *   - Missing secrets handled gracefully
 *   - Retry logic on transient errors
 *   - Timeout handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callSuggestions, callCleaner, callProfileAPI } from "../src/client.js";

// ---------------------------------------------------------------------------
// Mock fetch globally
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  process.env.DADATA_API_KEY = "test-api-key";
  process.env.DADATA_SECRET_KEY = "test-secret-key";
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.DADATA_API_KEY;
  delete process.env.DADATA_SECRET_KEY;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockResponse(status: number, body: unknown = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

// ---------------------------------------------------------------------------
// callSuggestions
// ---------------------------------------------------------------------------

describe("callSuggestions", () => {
  it("sends correct headers with Token auth", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200, { suggestions: [] }));

    await callSuggestions("suggest/address", { query: "test" });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
    );
    expect(options.headers.Authorization).toBe("Token test-api-key");
    expect(options.headers["X-Secret"]).toBeUndefined();
    expect(options.method).toBe("POST");
  });

  it("returns data on 200", async () => {
    const body = { suggestions: [{ value: "Москва" }] };
    mockFetch.mockResolvedValueOnce(mockResponse(200, body));

    const result = await callSuggestions("suggest/address", { query: "мск" });
    expect(result.error).toBeNull();
    expect(result.data).toEqual(body);
  });

  it("returns error on 401 without exposing key", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(401));

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toContain("Authentication failed");
    expect(result.error).not.toContain("test-api-key");
    expect(result.data).toBeNull();
  });

  it("returns error on 402 (daily limit)", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(402));

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toContain("Daily request limit");
  });

  it("returns error on 429 after retries", async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse(429))
      .mockResolvedValueOnce(mockResponse(429))
      .mockResolvedValueOnce(mockResponse(429));

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toContain("Rate limit exceeded");
    // Should have retried: 1 initial + 2 retries = 3 calls
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("retries on 500 and succeeds", async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse(500))
      .mockResolvedValueOnce(mockResponse(200, { suggestions: [] }));

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("handles network error after retries", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toContain("Network error");
    expect(result.error).toContain("ECONNREFUSED");
  });

  it("handles timeout (AbortError)", async () => {
    const abortError = new DOMException("signal is aborted", "AbortError");
    mockFetch.mockRejectedValueOnce(abortError);

    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toContain("timed out");
  });

  // --- SECURITY: path traversal ---
  it("rejects endpoint with path traversal characters", async () => {
    const result = await callSuggestions("../../etc/passwd", { query: "x" });
    expect(result.error).toContain("Invalid endpoint");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects endpoint with query string injection", async () => {
    const result = await callSuggestions("suggest/address?token=stolen", {
      query: "x",
    });
    expect(result.error).toContain("Invalid endpoint");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // --- SECURITY: missing API key ---
  it("returns error (not throw) when DADATA_API_KEY is not set", async () => {
    delete process.env.DADATA_API_KEY;
    const result = await callSuggestions("suggest/address", { query: "test" });
    expect(result.error).toContain("DADATA_API_KEY is not set");
    expect(result.data).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// callCleaner
// ---------------------------------------------------------------------------

describe("callCleaner", () => {
  it("sends both Token and Secret headers", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(200, [{ phone: "+7 916 823-34-54", qc: 0 }]),
    );

    await callCleaner("phone", ["89168233454"]);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://cleaner.dadata.ru/api/v1/clean/phone");
    expect(options.headers.Authorization).toBe("Token test-api-key");
    expect(options.headers["X-Secret"]).toBe("test-secret-key");
  });

  it("returns error when SECRET_KEY is missing (not crash)", async () => {
    delete process.env.DADATA_SECRET_KEY;

    const result = await callCleaner("phone", ["89168233454"]);
    expect(result.error).toContain("DADATA_SECRET_KEY is required");
    expect(result.data).toBeNull();
    // Must NOT have called fetch
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects invalid cleaner type", async () => {
    const result = await callCleaner("../../../etc", ["test"]);
    expect(result.error).toContain("Invalid cleaner type");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns data on 200", async () => {
    const body = [{ phone: "+7 916 823-34-54", qc: 0 }];
    mockFetch.mockResolvedValueOnce(mockResponse(200, body));

    const result = await callCleaner("phone", ["89168233454"]);
    expect(result.error).toBeNull();
    expect(result.data).toEqual(body);
  });
});

// ---------------------------------------------------------------------------
// callProfileAPI
// ---------------------------------------------------------------------------

describe("callProfileAPI", () => {
  it("sends GET request with correct auth", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(200, { balance: 1000 }),
    );

    await callProfileAPI("profile/balance");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://dadata.ru/api/v2/profile/balance");
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Token test-api-key");
  });

  it("rejects invalid endpoint path", async () => {
    const result = await callProfileAPI("../../secrets");
    expect(result.error).toContain("Invalid profile endpoint");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
