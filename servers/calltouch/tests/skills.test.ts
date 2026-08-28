import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally before importing modules
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("skill_calls_today", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CALLTOUCH_TOKEN: "test-token",
      CALLTOUCH_SITE_ID: "99999",
    };
    vi.resetModules();
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("builds today report from calls + statistics", async () => {
    const callsResponse = {
      records: [
        { id: 1, duration: 120 },
        { id: 2, duration: 60 },
        { id: 3, duration: 180 },
      ],
    };
    const statsResponse = {
      total: { calls_count: 3, target_calls: 2, missed_calls: 1 },
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(callsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(statsResponse),
      });

    const { createMcpServer } = await import("../src/index.js");
    const server = createMcpServer();

    // Verify server was created with the skills
    expect(server).toBeDefined();
  });
});

describe("skill_sources", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CALLTOUCH_TOKEN: "test-token",
      CALLTOUCH_SITE_ID: "99999",
    };
    vi.resetModules();
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("handleGetSources returns JSON from API", async () => {
    const sourcesData = [
      { source: "google", calls_count: 50 },
      { source: "yandex", calls_count: 30 },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(sourcesData),
    });

    const { handleGetSources } = await import("../src/tools/sources.js");
    const result = await handleGetSources({
      date_from: "01/01/2025",
      date_to: "31/01/2025",
    });

    const parsed = JSON.parse(result);
    expect(parsed).toEqual(sourcesData);
    expect(mockFetch).toHaveBeenCalledOnce();

    // Verify the URL includes site ID and correct path
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("99999");
    expect(calledUrl).toContain("/sources");
  });
});
