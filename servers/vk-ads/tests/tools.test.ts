import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resetClient } from "../src/client.js";
import {
  handleListCampaigns, handleCreateCampaign, handleUpdateCampaign,
} from "../src/tools/campaigns.js";
import { handleListAds, handleCreateAd } from "../src/tools/ads.js";
import { handleGetStatistics } from "../src/tools/statistics.js";
import { handleListTargetingGroups } from "../src/tools/targeting.js";
import { handleGetBudget } from "../src/tools/budget.js";

function mockFetchOk(data: unknown): ReturnType<typeof vi.fn> {
  const mock = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map(),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

describe("vk-ads tool handlers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["VK_ADS_TOKEN"] = "test-token-123";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("list_campaigns hits /campaigns.json with account_id", async () => {
    const fetch = mockFetchOk({ items: [{ id: 1, name: "Test" }], count: 1 });
    const result = JSON.parse(await handleListCampaigns({ account_id: 100 }));
    expect(result.items[0].name).toBe("Test");
    expect(fetch.mock.calls[0][0]).toContain("/campaigns.json");
    expect(fetch.mock.calls[0][0]).toContain("account_id=100");
  });

  it("list_campaigns passes status filter", async () => {
    const fetch = mockFetchOk({ items: [] });
    await handleListCampaigns({ account_id: 100, status: "active" });
    expect(fetch.mock.calls[0][0]).toContain("status=active");
  });

  it("create_campaign POSTs name + budget", async () => {
    const fetch = mockFetchOk({ id: 200 });
    await handleCreateCampaign({
      account_id: 100,
      name: "Summer Sale",
      type: "normal",
      budget: 500000,
    });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.name).toBe("Summer Sale");
    expect(body.all_limit).toBe(500000);
  });

  it("update_campaign translates start/stop status to 1/0", async () => {
    const fetch = mockFetchOk({});
    await handleUpdateCampaign({ campaign_id: 1, status: "start" });
    expect(JSON.parse(fetch.mock.calls[0][1].body).status).toBe(1);

    await handleUpdateCampaign({ campaign_id: 1, status: "stop" });
    expect(JSON.parse(fetch.mock.calls[1][1].body).status).toBe(0);
  });

  it("list_ads joins campaign_ids with comma", async () => {
    const fetch = mockFetchOk({ items: [] });
    await handleListAds({ campaign_ids: [1, 2, 3] });
    expect(fetch.mock.calls[0][0]).toContain("campaign_ids=1%2C2%2C3");
  });

  it("create_ad POSTs ad_format + optional fields", async () => {
    const fetch = mockFetchOk({ id: 10 });
    await handleCreateAd({
      campaign_id: 1,
      format: "image",
      title: "Buy now",
      link_url: "https://example.com",
    });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.ad_format).toBe("image");
    expect(body.title).toBe("Buy now");
    expect(body.link_url).toBe("https://example.com");
  });

  it("get_statistics passes date range + ids", async () => {
    const fetch = mockFetchOk({ items: [] });
    await handleGetStatistics({
      account_id: 100,
      ids_type: "campaign",
      ids: [1, 2],
      period: "day",
      date_from: "2026-01-01",
      date_to: "2026-01-31",
    });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("/statistics.json");
    expect(url).toContain("date_from=2026-01-01");
    expect(url).toContain("date_to=2026-01-31");
    expect(url).toContain("ids=1%2C2");
  });

  it("list_targeting_groups passes campaign_id", async () => {
    const fetch = mockFetchOk({ items: [] });
    await handleListTargetingGroups({ campaign_id: 42 });
    expect(fetch.mock.calls[0][0]).toContain("campaign_id=42");
  });

  it("get_budget passes account_id", async () => {
    const fetch = mockFetchOk({ balance: 50000, limit: 100000 });
    const result = JSON.parse(await handleGetBudget({ account_id: 100 }));
    expect(result.balance).toBe(50000);
    expect(fetch.mock.calls[0][0]).toContain("account_id=100");
  });
});
