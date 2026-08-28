import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Set env before importing modules
process.env.ROISTAT_API_KEY = "test-key-123";
process.env.ROISTAT_PROJECT_ID = "12345";

function mockResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

describe("RoistatClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws without API key", async () => {
    const saved = process.env.ROISTAT_API_KEY;
    delete process.env.ROISTAT_API_KEY;
    // Re-import to test constructor
    const { RoistatClient } = await import("../client.js");
    expect(() => new RoistatClient("", "123")).toThrow("ROISTAT_API_KEY");
    process.env.ROISTAT_API_KEY = saved;
  });

  it("throws without project ID", async () => {
    const saved = process.env.ROISTAT_PROJECT_ID;
    delete process.env.ROISTAT_PROJECT_ID;
    const { RoistatClient } = await import("../client.js");
    expect(() => new RoistatClient("key", "")).toThrow("ROISTAT_PROJECT_ID");
    process.env.ROISTAT_PROJECT_ID = saved;
  });
});

describe("get_analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns formatted analytics data", async () => {
    mockFetch.mockReturnValueOnce(
      mockResponse({
        status: "ok",
        data: [
          { title: "google", marker_level: "1", values: { visitCount: 100, revenue: 5000 } },
          { title: "yandex", marker_level: "1", values: { visitCount: 50, revenue: 3000 } },
        ],
        total: { visitCount: 150, revenue: 8000 },
      }),
    );

    const { handleGetAnalytics } = await import("../tools/analytics.js");
    const result = await handleGetAnalytics({
      from: "2025-01-01",
      to: "2025-01-31",
      metrics: ["visitCount", "revenue"],
      dimensions: ["marker"],
      limit: 50,
    });

    const parsed = JSON.parse(result);
    expect(parsed.итого.revenue).toBe(8000);
    expect(parsed.данные).toHaveLength(2);
    expect(parsed.данные[0].источник).toBe("google");
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("returns message when no data", async () => {
    mockFetch.mockReturnValueOnce(mockResponse({ status: "ok", data: [], total: {} }));

    const { handleGetAnalytics } = await import("../tools/analytics.js");
    const result = await handleGetAnalytics({
      from: "2025-01-01",
      to: "2025-01-31",
      metrics: ["visitCount"],
      dimensions: ["marker"],
      limit: 50,
    });

    expect(result).toContain("не найдены");
  });
});

describe("get_visits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns formatted visits", async () => {
    mockFetch.mockReturnValueOnce(
      mockResponse({
        status: "ok",
        data: [
          {
            id: "v1",
            date_create: "2025-01-15",
            source: "google",
            landing_page: "/",
            ip: "1.2.3.4",
            city: "Moscow",
            device_type: "desktop",
            browser: "Chrome",
            os: "Windows",
            utm_source: "google",
            utm_medium: "cpc",
          },
        ],
        total: 1,
      }),
    );

    const { handleGetVisits } = await import("../tools/visits.js");
    const result = await handleGetVisits({
      from: "2025-01-01",
      to: "2025-01-31",
      limit: 50,
      offset: 0,
    });

    const parsed = JSON.parse(result);
    expect(parsed.всего).toBe(1);
    expect(parsed.визиты[0].источник).toBe("google");
  });
});

describe("get_leads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns formatted leads", async () => {
    mockFetch.mockReturnValueOnce(
      mockResponse({
        status: "ok",
        data: [{ id: "l1", name: "Test Lead", date: "2025-01-15", roistat_status: "new" }],
        total: 1,
      }),
    );

    const { handleGetLeads } = await import("../tools/leads.js");
    const result = await handleGetLeads({
      from: "2025-01-01",
      to: "2025-01-31",
      limit: 50,
      offset: 0,
    });

    const parsed = JSON.parse(result);
    expect(parsed.всего).toBe(1);
    expect(parsed.лиды[0].name).toBe("Test Lead");
  });
});

describe("get_channels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns channel comparison", async () => {
    mockFetch.mockReturnValueOnce(
      mockResponse({
        status: "ok",
        data: [
          { title: "Google Ads", marker_level: "1", values: { visitCount: 200, roi: 150 } },
          { title: "Yandex Direct", marker_level: "1", values: { visitCount: 100, roi: 80 } },
        ],
        total: { visitCount: 300, roi: 120 },
      }),
    );

    const { handleGetChannels } = await import("../tools/channels.js");
    const result = await handleGetChannels({
      from: "2025-01-01",
      to: "2025-01-31",
      metrics: ["visitCount", "roi"],
    });

    const parsed = JSON.parse(result);
    expect(parsed.каналы).toHaveLength(2);
    expect(parsed.каналы[0].канал).toBe("Google Ads");
  });
});

describe("get_costs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cost data", async () => {
    mockFetch.mockReturnValueOnce(
      mockResponse({
        status: "ok",
        data: [{ title: "Google Ads", values: { cost: 10000, revenue: 25000, roi: 150 } }],
        total: { cost: 10000, revenue: 25000, roi: 150 },
      }),
    );

    const { handleGetCosts } = await import("../tools/costs.js");
    const result = await handleGetCosts({
      from: "2025-01-01",
      to: "2025-01-31",
      group_by: "day",
    });

    const parsed = JSON.parse(result);
    expect(parsed.итого.cost).toBe(10000);
  });
});

describe("get_integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns integrations list", async () => {
    mockFetch.mockReturnValueOnce(
      mockResponse({
        status: "ok",
        integrations: [
          { title: "Bitrix24", type: "crm", status: "active" },
          { title: "Google Analytics", type: "analytics", status: "active" },
        ],
      }),
    );

    const { handleGetIntegrations } = await import("../tools/integrations.js");
    const result = await handleGetIntegrations({});

    const parsed = JSON.parse(result);
    expect(parsed.интеграции).toHaveLength(2);
    expect(parsed.интеграции[0].название).toBe("Bitrix24");
  });

  it("returns message when no integrations", async () => {
    mockFetch.mockReturnValueOnce(mockResponse({ status: "ok", integrations: [] }));

    const { handleGetIntegrations } = await import("../tools/integrations.js");
    const result = await handleGetIntegrations({});

    expect(result).toContain("не найдены");
  });
});
