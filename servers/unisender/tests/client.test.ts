import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/** BaseHttpClient (@theyahia/mcp-core) читает тело через response.text(), не .json(). */
function okResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(JSON.stringify(payload)),
    json: () => Promise.resolve(payload),
    headers: new Headers(),
  };
}

describe("client", () => {
  const originalEnv = process.env.UNISENDER_API_KEY;

  beforeEach(() => {
    process.env.UNISENDER_API_KEY = "test-api-key-123";
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.UNISENDER_API_KEY = originalEnv;
    } else {
      delete process.env.UNISENDER_API_KEY;
    }
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("throws when UNISENDER_API_KEY is missing", async () => {
    delete process.env.UNISENDER_API_KEY;
    const { apiCall } = await import("../src/client.js");
    await expect(apiCall("getLists")).rejects.toThrow("UNISENDER_API_KEY");
  });

  it("apiCall builds correct URL and parses result", async () => {
    const mockResult = [{ id: 1, title: "Test" }];
    const mockFetch = vi.fn().mockResolvedValue(okResponse({ result: mockResult }));
    vi.stubGlobal("fetch", mockFetch);

    const { apiCall } = await import("../src/client.js");
    const result = await apiCall("getLists");

    expect(result).toEqual(mockResult);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.pathname).toBe("/ru/api/getLists");
    expect(calledUrl.searchParams.get("api_key")).toBe("test-api-key-123");
    expect(calledUrl.searchParams.get("format")).toBe("json");
  });

  it("apiCall throws on API error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        okResponse({ error: "Invalid key", code: "unrecognized_api_key" }),
      ),
    );

    const { apiCall } = await import("../src/client.js");
    await expect(apiCall("getLists")).rejects.toThrow("Invalid key");
  });

  it("apiCall passes extra params", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okResponse({ result: {} }));
    vi.stubGlobal("fetch", mockFetch);

    const { apiCall } = await import("../src/client.js");
    await apiCall("subscribe", { list_ids: "1,2", "fields[email]": "test@example.com" });

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get("list_ids")).toBe("1,2");
    expect(calledUrl.searchParams.get("fields[email]")).toBe("test@example.com");
  });
});
