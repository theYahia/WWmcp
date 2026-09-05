import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resetClient } from "../src/client.js";
import {
  handleListCampaigns,
  handleCreateCampaign,
  handleUpdateCampaign,
} from "../src/tools/ad_plans.js";
import { handleListAdGroups } from "../src/tools/ad_groups.js";
import { handleListAds, handleCreateAd } from "../src/tools/banners.js";
import { handleGetStatistics } from "../src/tools/statistics.js";
import { handleGetAccount } from "../src/tools/account.js";

const mockFetch = vi.fn();

function ok(data: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
  };
}

function err(status: number, body: unknown = "") {
  return {
    ok: false,
    status,
    statusText: "Error",
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
    headers: new Headers(),
  };
}

const url = (i = 0) => mockFetch.mock.calls[i][0] as string;
const body = (i = 0) => JSON.parse((mockFetch.mock.calls[i][1] as RequestInit).body as string);

beforeEach(() => {
  process.env["VK_ADS_TOKEN"] = "test-vk-token-123";
  delete process.env["VK_ADS_CLIENT_ID"];
  delete process.env["VK_ADS_CLIENT_SECRET"];
  delete process.env["VK_ADS_REFRESH_TOKEN"];
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
  resetClient();
});

afterEach(() => {
  vi.restoreAllMocks();
  resetClient();
});

describe("list_campaigns → /ad_plans.json", () => {
  it("hits ad_plans with the status filter and no account_id", async () => {
    mockFetch.mockResolvedValueOnce(ok({ count: 1, items: [{ id: 1, name: "C" }] }));
    const result = await handleListCampaigns({ status: "active" });
    expect(result).toMatchObject({ count: 1, truncated: false });
    expect(result.items).toHaveLength(1);
    expect(url()).toContain("/ad_plans.json");
    expect(url()).toContain("_status__in=active");
    expect(url()).toContain("limit=50");
    expect(url()).not.toContain("account_id");
    expect(url()).not.toContain("/campaigns.json");
  });

  it("auto-paginates through every page", async () => {
    mockFetch
      .mockResolvedValueOnce(ok({ count: 75, items: Array.from({ length: 50 }, (_, i) => ({ id: i })) }))
      .mockResolvedValueOnce(ok({ count: 75, items: Array.from({ length: 25 }, (_, i) => ({ id: 50 + i })) }));
    const result = await handleListAds({});
    expect(result.count).toBe(75);
    expect(result.items).toHaveLength(75);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(url(1)).toContain("offset=50");
  });

  it("caps collected items and reports truncated", async () => {
    mockFetch.mockResolvedValue(ok({ count: 500, items: Array.from({ length: 50 }, (_, i) => ({ id: i })) }));
    const result = await handleListCampaigns({ limit: 60 });
    expect(result.items).toHaveLength(60);
    expect(result.truncated).toBe(true);
  });
});

describe("create_campaign → POST /ad_plans.json", () => {
  it("sends budget_limit/objective, not all_limit/type", async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 200 }));
    await handleCreateCampaign({ name: "Summer", objective: "traffic", budget_limit: 5000 });
    expect(url()).toContain("/ad_plans.json");
    expect(body()).toMatchObject({ name: "Summer", objective: "traffic", budget_limit: 5000 });
    expect(body()).not.toHaveProperty("all_limit");
    expect(body()).not.toHaveProperty("type");
  });
});

describe("update_campaign → POST /ad_plans/{id}.json", () => {
  it("puts the id in the path and maps the action to a string status", async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 7 }));
    await handleUpdateCampaign({ campaign_id: 7, action: "stop", budget_limit: 1000 });
    expect(url()).toContain("/ad_plans/7.json");
    expect(body()).toMatchObject({ status: "blocked", budget_limit: 1000 });
    expect(body()).not.toHaveProperty("campaign_id");
  });
});

describe("list_ad_groups → /ad_groups.json", () => {
  it("filters by parent campaigns via _ad_plan_id__in", async () => {
    mockFetch.mockResolvedValueOnce(ok({ count: 0, items: [] }));
    await handleListAdGroups({ campaign_ids: [10, 20] });
    expect(url()).toContain("/ad_groups.json");
    expect(url()).toContain("_ad_plan_id__in=10%2C20");
  });
});

describe("create_ad → POST /banners.json", () => {
  it("posts ad_group_id + textblocks, no ad_format/campaign_id", async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 999 }));
    await handleCreateAd({
      ad_group_id: 5,
      textblocks: { title_40_vkads: { text: "Привет" } },
      urls: { primary: { url: "https://example.com" } },
    });
    expect(url()).toContain("/banners.json");
    expect(body()).toMatchObject({ ad_group_id: 5, textblocks: { title_40_vkads: { text: "Привет" } } });
    expect(body()).not.toHaveProperty("ad_format");
    expect(body()).not.toHaveProperty("campaign_id");
  });
});

describe("get_statistics → /statistics/{object_type}/{period}.json", () => {
  it("uses path segments, `id` (not ids/ids_type), and no account_id", async () => {
    mockFetch.mockResolvedValueOnce(ok({ items: [{ id: 1, rows: [{ shows: 1000, clicks: 50 }] }] }));
    const result = await handleGetStatistics({
      object_type: "campaigns",
      ids: [1],
      period: "day",
      date_from: "2026-01-01",
      date_to: "2026-01-31",
      metrics: "all",
    });
    expect(result.items).toHaveLength(1);
    expect(url()).toContain("/statistics/campaigns/day.json");
    expect(url()).toContain("id=1");
    expect(url()).toContain("date_from=2026-01-01");
    expect(url()).not.toContain("ids_type");
    expect(url()).not.toContain("account_id");
  });

  it("period=summary needs no dates", async () => {
    mockFetch.mockResolvedValueOnce(ok({ items: [], total: { shows: 0 } }));
    await handleGetStatistics({ object_type: "banners", ids: [1, 2], period: "summary", metrics: "base" });
    expect(url()).toContain("/statistics/banners/summary.json");
    expect(url()).not.toContain("date_from");
  });

  it("rejects period=day without dates before spending a call", async () => {
    await expect(
      handleGetStatistics({ object_type: "campaigns", ids: [1], period: "day", metrics: "all" }),
    ).rejects.toThrow("date_from");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects a range wider than 92 days", async () => {
    await expect(
      handleGetStatistics({
        object_type: "campaigns",
        ids: [1],
        period: "day",
        date_from: "2026-01-01",
        date_to: "2026-12-31",
        metrics: "all",
      }),
    ).rejects.toThrow("92");
  });
});

describe("get_account → /user.json", () => {
  it("reads /user.json, not the non-existent /budget.json", async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 1, account: { balance: "50000" } }));
    const result = await handleGetAccount({});
    expect(result.account).toBeDefined();
    expect(url()).toContain("/user.json");
    expect(url()).not.toContain("account_id");
    expect(url()).not.toContain("/budget.json");
  });
});

describe("retry policy", () => {
  it("retries a GET on 5xx, then succeeds", async () => {
    vi.useFakeTimers();
    try {
      mockFetch.mockResolvedValueOnce(err(500)).mockResolvedValueOnce(ok({ id: 2 }));
      const promise = handleGetAccount({});
      await vi.runAllTimersAsync();
      expect((await promise).account).toEqual({ id: 2 });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("never retries a create POST on 5xx (duplicate-campaign risk)", async () => {
    mockFetch.mockResolvedValueOnce(err(500, "boom"));
    await expect(handleCreateCampaign({ name: "X", objective: "traffic" })).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("error parsing", () => {
  it("throws when the token is missing", async () => {
    delete process.env["VK_ADS_TOKEN"];
    resetClient();
    await expect(handleGetAccount({})).rejects.toThrow("VK_ADS_TOKEN");
  });

  it("parses the flat {code,message} auth form", async () => {
    // No refresh creds → the 401 is re-sent maxRetries times, then surfaces as-is.
    mockFetch.mockResolvedValue(err(401, { code: "invalid_token", message: "Unknown access token" }));
    await expect(handleListCampaigns({})).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "invalid_token",
    });
    await expect(handleListCampaigns({})).rejects.toThrow("Unknown access token");
  });

  it("parses the OAuth {error,error_description} form", async () => {
    mockFetch.mockResolvedValueOnce(
      err(400, { error: "empty_request_body", error_description: "Request body is empty" }),
    );
    await expect(handleGetAccount({})).rejects.toMatchObject({ code: "empty_request_body" });
  });

  it("summarizes an unknown field-error shape instead of dropping it", async () => {
    mockFetch.mockResolvedValueOnce(err(400, [{ field: "objective", reason: "invalid" }]));
    await expect(handleGetAccount({})).rejects.toThrow(/objective/);
  });
});

describe("auth header", () => {
  it("sends the Bearer token", async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await handleGetAccount({});
    const init = mockFetch.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer test-vk-token-123");
  });

  it("refreshes an expired token on 401 when refresh creds are configured", async () => {
    process.env["VK_ADS_CLIENT_ID"] = "cid";
    process.env["VK_ADS_CLIENT_SECRET"] = "csecret";
    process.env["VK_ADS_REFRESH_TOKEN"] = "rtoken";
    resetClient();

    mockFetch
      .mockResolvedValueOnce(err(401, { code: "invalid_token", message: "expired" }))
      .mockResolvedValueOnce({ ...ok({ access_token: "renewed" }), json: () => Promise.resolve({ access_token: "renewed" }) })
      .mockResolvedValueOnce(ok({ id: 1 }));

    const result = await handleGetAccount({});
    expect(result.account).toEqual({ id: 1 });
    expect(url(1)).toContain("/oauth2/token.json");
    const retryHeaders = new Headers((mockFetch.mock.calls[2][1] as RequestInit).headers);
    expect(retryHeaders.get("Authorization")).toBe("Bearer renewed");
  });
});
