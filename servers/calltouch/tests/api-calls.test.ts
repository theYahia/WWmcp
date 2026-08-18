import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("API tool handlers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CALLTOUCH_TOKEN: "test-token-abc",
      CALLTOUCH_SITE_ID: "12345",
    };
    vi.resetModules();
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("handleGetCalls sends correct params and headers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ records: [], total: 0 }),
    });

    const { handleGetCalls } = await import("../src/tools/calls.js");
    await handleGetCalls({ date_from: "01/03/2025", date_to: "31/03/2025", page: 2, limit: 10 });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/calls-service/RestAPI/12345/calls-diary/calls");
    expect(url).toContain("dateFrom=01%2F03%2F2025");
    expect(url).toContain("page=2");
    expect(url).toContain("limit=10");
    expect(opts.headers["Access-Token"]).toBe("test-token-abc");
  });

  it("handleGetLeads sends correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ records: [] }),
    });

    const { handleGetLeads } = await import("../src/tools/leads.js");
    await handleGetLeads({ date_from: "01/03/2025", date_to: "31/03/2025" });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/calls-diary/leads");
  });

  it("handleGetStatistics sends groupBy param", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [], total: {} }),
    });

    const { handleGetStatistics } = await import("../src/tools/statistics.js");
    await handleGetStatistics({ date_from: "01/01/2025", date_to: "31/01/2025", group_by: "week" });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("groupBy=week");
  });

  it("handleGetTags sends correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { handleGetTags } = await import("../src/tools/tags.js");
    await handleGetTags({ date_from: "01/01/2025", date_to: "31/01/2025" });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/tags");
  });

  it("retries on 500 errors", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: "Internal Server Error", text: () => Promise.resolve("") })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ records: [] }) });

    const { handleGetCalls } = await import("../src/tools/calls.js");
    await handleGetCalls({ date_from: "01/01/2025", date_to: "31/01/2025" });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws on 4xx errors without retry", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: () => Promise.resolve("Invalid token"),
    });

    const { handleGetCalls } = await import("../src/tools/calls.js");
    await expect(
      handleGetCalls({ date_from: "01/01/2025", date_to: "31/01/2025" })
    ).rejects.toThrow("401");

    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
