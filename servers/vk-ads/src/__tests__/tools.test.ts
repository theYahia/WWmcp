import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

process.env.VK_ADS_TOKEN = "test-vk-token-123";

function mockOk(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

/** Не-JSON тело ошибки. */
function mockError(status: number, body = "") {
  return {
    ok: false,
    status,
    statusText: "Error",
    text: () => Promise.resolve(body),
  };
}

/** JSON-тело ошибки (для проверки parseVkError). */
function mockJsonError(status: number, obj: unknown) {
  return {
    ok: false,
    status,
    statusText: "Error",
    text: () => Promise.resolve(JSON.stringify(obj)),
  };
}

/** 429 с Retry-After: 0 — ретрай без реальной задержки. */
function mock429() {
  return {
    ok: false,
    status: 429,
    statusText: "Too Many Requests",
    headers: { get: (h: string) => (h.toLowerCase() === "retry-after" ? "0" : null) },
    text: () => Promise.resolve(""),
  };
}

// ─── list_campaigns → /ad_plans.json ───

describe("list_campaigns", () => {
  beforeEach(() => mockFetch.mockReset());

  it("бьёт в /ad_plans.json со статус-фильтром и без account_id", async () => {
    const { handleListCampaigns } = await import("../tools/ad_plans.js");
    mockFetch.mockResolvedValueOnce(mockOk({ count: 1, items: [{ id: 1, name: "C", status: "active" }] }));

    const result = await handleListCampaigns({ status: "active" });
    expect(result.items).toHaveLength(1);
    expect(result.count).toBe(1);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/ad_plans.json");
    expect(url).toContain("_status__in=active");
    expect(url).toContain("limit=50");
    expect(url).not.toContain("account_id");
    expect(url).not.toContain("/campaigns.json");
  });

  it("авто-пагинация собирает все страницы", async () => {
    const { handleListAds } = await import("../tools/banners.js");
    mockFetch
      .mockResolvedValueOnce(mockOk({ count: 75, items: Array.from({ length: 50 }, (_, i) => ({ id: i })) }))
      .mockResolvedValueOnce(mockOk({ count: 75, items: Array.from({ length: 25 }, (_, i) => ({ id: 50 + i })) }));

    const result = await handleListAds({});
    expect(result.count).toBe(75);
    expect(result.items).toHaveLength(75);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0] as string).toContain("offset=50");
  });
});

// ─── create_campaign → POST /ad_plans.json ───

describe("create_campaign", () => {
  beforeEach(() => mockFetch.mockReset());

  it("шлёт budget_limit/objective, а не all_limit/type", async () => {
    const { handleCreateCampaign } = await import("../tools/ad_plans.js");
    mockFetch.mockResolvedValueOnce(mockOk({ id: 200 }));

    await handleCreateCampaign({ name: "Summer", objective: "traffic", budget_limit: 5000 });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url as string).toContain("/ad_plans.json");
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.name).toBe("Summer");
    expect(body.objective).toBe("traffic");
    expect(body.budget_limit).toBe(5000);
    expect(body).not.toHaveProperty("all_limit");
    expect(body).not.toHaveProperty("type");
  });
});

// ─── update_campaign → POST /ad_plans/{id}.json ───

describe("update_campaign", () => {
  beforeEach(() => mockFetch.mockReset());

  it("id в пути, строковый статус, без campaign_id в теле", async () => {
    const { handleUpdateCampaign } = await import("../tools/ad_plans.js");
    mockFetch.mockResolvedValueOnce(mockOk({ id: 7 }));

    await handleUpdateCampaign({ campaign_id: 7, action: "stop", budget_limit: 1000 });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url as string).toContain("/ad_plans/7.json");
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.status).toBe("blocked");
    expect(body.budget_limit).toBe(1000);
    expect(body).not.toHaveProperty("campaign_id");
    expect(body).not.toHaveProperty("all_limit");
  });
});

// ─── list_ad_groups → /ad_groups.json ───

describe("list_ad_groups", () => {
  beforeEach(() => mockFetch.mockReset());

  it("фильтрует по родительским кампаниям через _ad_plan_id__in", async () => {
    const { handleListAdGroups } = await import("../tools/ad_groups.js");
    mockFetch.mockResolvedValueOnce(mockOk({ count: 0, items: [] }));

    await handleListAdGroups({ campaign_ids: [10, 20] });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/ad_groups.json");
    expect(url).toContain("_ad_plan_id__in=10%2C20");
  });
});

// ─── create_ad → POST /banners.json ───

describe("create_ad", () => {
  beforeEach(() => mockFetch.mockReset());

  it("баннер с ad_group_id + textblocks, без ad_format/campaign_id", async () => {
    const { handleCreateAd } = await import("../tools/banners.js");
    mockFetch.mockResolvedValueOnce(mockOk({ id: 999 }));

    await handleCreateAd({
      ad_group_id: 5,
      textblocks: { title_40_vkads: { text: "Привет" } },
      urls: { primary: { url: "https://example.com" } },
    });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url as string).toContain("/banners.json");
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.ad_group_id).toBe(5);
    expect(body.textblocks).toEqual({ title_40_vkads: { text: "Привет" } });
    expect(body).not.toHaveProperty("ad_format");
    expect(body).not.toHaveProperty("campaign_id");
  });
});

// ─── get_statistics → /statistics/{object_type}/{period}.json ───

describe("get_statistics", () => {
  beforeEach(() => mockFetch.mockReset());

  it("path-сегментированный URL: id (не ids), date_from, metrics, без account_id", async () => {
    const { handleGetStatistics } = await import("../tools/statistics.js");
    mockFetch.mockResolvedValueOnce(mockOk({ items: [{ id: 1, rows: [{ date: "2026-01-01", shows: 1000, clicks: 50 }] }] }));

    const result = await handleGetStatistics({
      object_type: "campaigns",
      ids: [1],
      period: "day",
      date_from: "2026-01-01",
      date_to: "2026-01-31",
      metrics: "all",
    });
    expect(result.items).toHaveLength(1);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/statistics/campaigns/day.json");
    expect(url).toContain("id=1");
    expect(url).toContain("date_from=2026-01-01");
    expect(url).toContain("metrics=all");
    expect(url).not.toContain("ids_type");
    expect(url).not.toContain("account_id");
  });

  it("period=summary без дат", async () => {
    const { handleGetStatistics } = await import("../tools/statistics.js");
    mockFetch.mockResolvedValueOnce(mockOk({ items: [], total: { shows: 0 } }));

    await handleGetStatistics({ object_type: "banners", ids: [1, 2], period: "summary", metrics: "base" });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/statistics/banners/summary.json");
    expect(url).not.toContain("date_from");
  });

  it("day без дат → ошибка валидации", async () => {
    const { handleGetStatistics } = await import("../tools/statistics.js");
    await expect(
      handleGetStatistics({ object_type: "campaigns", ids: [1], period: "day", metrics: "all" }),
    ).rejects.toThrow("date_from");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("диапазон >92 дней → ошибка", async () => {
    const { handleGetStatistics } = await import("../tools/statistics.js");
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

// ─── get_account → /user.json ───

describe("get_account", () => {
  beforeEach(() => mockFetch.mockReset());

  it("читает /user.json без account_id", async () => {
    const { handleGetAccount } = await import("../tools/account.js");
    mockFetch.mockResolvedValueOnce(mockOk({ id: 1, account: { balance: "50000" } }));

    const result = await handleGetAccount({});
    expect(result.account).toBeDefined();

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/user.json");
    expect(url).not.toContain("account_id");
    expect(url).not.toContain("/budget.json");
  });
});

// ─── Retry-политика ───

describe("retry policy", () => {
  beforeEach(() => mockFetch.mockReset());

  it("ретраит 429 затем успех", async () => {
    const { handleGetAccount } = await import("../tools/account.js");
    mockFetch.mockResolvedValueOnce(mock429()).mockResolvedValueOnce(mockOk({ id: 1 }));

    const result = await handleGetAccount({});
    expect(result.account).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("ретраит GET на 5xx затем успех", async () => {
    vi.useFakeTimers();
    try {
      const { handleGetAccount } = await import("../tools/account.js");
      mockFetch.mockResolvedValueOnce(mockError(500)).mockResolvedValueOnce(mockOk({ id: 2 }));

      const promise = handleGetAccount({});
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.account).toEqual({ id: 2 });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("НЕ ретраит create POST на 5xx (риск дублей)", async () => {
    const { handleCreateCampaign } = await import("../tools/ad_plans.js");
    mockFetch.mockResolvedValueOnce(mockError(500, "boom"));

    await expect(handleCreateCampaign({ name: "X", objective: "traffic" })).rejects.toMatchObject({ name: "VkAdsError" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// ─── Парсинг ошибок ───

describe("error parsing", () => {
  beforeEach(() => mockFetch.mockReset());

  it("кидает на отсутствие токена", async () => {
    const saved = process.env.VK_ADS_TOKEN;
    delete process.env.VK_ADS_TOKEN;

    const { apiGet } = await import("../client.js");
    await expect(apiGet("/user.json")).rejects.toThrow("VK_ADS_TOKEN");

    process.env.VK_ADS_TOKEN = saved;
  });

  it("разбирает плоский {code,message} (auth)", async () => {
    const { handleListCampaigns } = await import("../tools/ad_plans.js");
    mockFetch.mockResolvedValueOnce(mockJsonError(401, { code: "invalid_token", message: "Unknown access token" }));

    await expect(handleListCampaigns({})).rejects.toMatchObject({
      name: "VkAdsError",
      status: 401,
      code: "invalid_token",
    });
  });

  it("разбирает OAuth-форму {error,error_description}", async () => {
    const { handleGetAccount } = await import("../tools/account.js");
    mockFetch.mockResolvedValueOnce(mockJsonError(400, { error: "empty_request_body", error_description: "Request body is empty" }));

    await expect(handleGetAccount({})).rejects.toMatchObject({
      code: "empty_request_body",
      message: "Request body is empty",
    });
  });
});

// ─── Auth header ───

describe("auth header", () => {
  beforeEach(() => mockFetch.mockReset());

  it("шлёт Bearer-токен", async () => {
    const { handleGetAccount } = await import("../tools/account.js");
    mockFetch.mockResolvedValueOnce(mockOk({}));

    await handleGetAccount({});

    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect((opts.headers as Record<string, string>).Authorization).toBe("Bearer test-vk-token-123");
  });
});
