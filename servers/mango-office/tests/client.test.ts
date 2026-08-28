import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Set env before importing
process.env.MANGO_API_KEY = "test-key";
process.env.MANGO_API_SALT = "test-salt";

const { mangoPost } = await import("../src/client.js");

describe("mangoPost", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends correct form data with HMAC signature", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await mangoPost("stats/request", { date_from: "1000", date_to: "2000" });

    expect(result).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://app.mango-office.ru/vpbx/stats/request");
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");

    // Verify form body contains required fields
    const body = opts.body as string;
    expect(body).toContain("vpbx_api_key=test-key");
    expect(body).toContain("sign=");
    expect(body).toContain("json=");
  });

  it("retries on 500 errors", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: "Internal Server Error" })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ retried: true }) });

    const result = await mangoPost("test/path", {});
    expect(result).toEqual({ retried: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws after max retries", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: "Internal Server Error" });

    await expect(mangoPost("test/path", {})).rejects.toThrow("HTTP 500");
  });

  it("throws when credentials are missing", async () => {
    const origKey = process.env.MANGO_API_KEY;
    delete process.env.MANGO_API_KEY;

    // Need to re-import to pick up env change — but since module is cached,
    // we test by directly checking the function behavior
    // The function reads env at call time, so this should work
    await expect(mangoPost("test", {})).rejects.toThrow("MANGO_API_KEY");

    process.env.MANGO_API_KEY = origKey;
  });
});
