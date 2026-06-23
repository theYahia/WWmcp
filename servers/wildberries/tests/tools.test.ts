import { describe, it, expect, vi, beforeEach } from "vitest";
import { toolDefinitions, handleTool, type ToolName } from "../src/tools.js";
import { HOSTS, type WBClient } from "../src/client.js";

function createMockClient(): WBClient {
  return {
    get: vi.fn().mockResolvedValue({ data: "mock-get" }),
    post: vi.fn().mockResolvedValue({ data: "mock-post" }),
    put: vi.fn().mockResolvedValue({ data: "mock-put" }),
    patch: vi.fn().mockResolvedValue({ data: "mock-patch" }),
    request: vi.fn().mockResolvedValue({ data: "mock" }),
    pollUntil: vi.fn().mockImplementation(async (o: { fn: () => Promise<unknown> }) => o.fn()),
  } as unknown as WBClient;
}

describe("Tool definitions", () => {
  it("should have exactly 30 tools", () => {
    expect(Object.keys(toolDefinitions)).toHaveLength(30);
  });

  it("should include all required tool names", () => {
    const expected: ToolName[] = [
      "list_products", "get_product", "update_prices", "update_stocks", "get_stocks",
      "get_orders", "get_new_orders", "get_sales", "get_incomes", "get_fbw_stocks",
      "get_warehouses", "get_supply", "create_supply", "add_orders_to_supply",
      "deliver_supply", "get_supply_barcode", "get_statistics", "get_abc_analysis",
      "get_funnel", "get_paid_storage", "get_commission", "get_tariffs",
      "get_feedbacks", "reply_feedback", "get_questions", "reply_question",
      "get_returns", "get_balance", "list_campaigns", "get_campaign_stats",
    ];
    for (const name of expected) expect(toolDefinitions).toHaveProperty(name);
  });

  it("every tool should have a description", () => {
    for (const [, def] of Object.entries(toolDefinitions)) {
      expect(def.description).toBeTruthy();
    }
  });
});

describe("Tool handlers — host routing", () => {
  let client: WBClient;
  beforeEach(() => {
    client = createMockClient();
  });

  it("list_products -> content host", async () => {
    await handleTool(client, "list_products", { limit: 50 });
    expect(client.post).toHaveBeenCalledWith(
      HOSTS.content,
      "/content/v2/get/cards/list",
      expect.objectContaining({ settings: expect.objectContaining({ cursor: { limit: 50 } }) }),
    );
  });

  it("get_product -> content host", async () => {
    await handleTool(client, "get_product", { nmIDs: [123, 456] });
    expect(client.post).toHaveBeenCalledWith(HOSTS.content, "/content/v2/get/cards/detail", {
      nmIDs: [123, 456],
    });
  });

  it("update_prices -> prices host", async () => {
    const prices = [{ nmID: 1, price: 999 }];
    await handleTool(client, "update_prices", { prices });
    expect(client.post).toHaveBeenCalledWith(HOSTS.prices, "/api/v2/upload/task", { data: prices });
  });

  it("update_stocks -> marketplace host", async () => {
    const stocks = [{ sku: "ABC", amount: 10 }];
    await handleTool(client, "update_stocks", { warehouseId: 42, stocks });
    expect(client.put).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/stocks/42", { stocks });
  });

  it("get_stocks -> marketplace host", async () => {
    await handleTool(client, "get_stocks", { warehouseId: 99 });
    expect(client.post).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/stocks/99", { skus: [] });
  });

  it("get_orders -> marketplace host", async () => {
    await handleTool(client, "get_orders", { limit: 10, dateFrom: "2024-01-01T00:00:00Z" });
    expect(client.get).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/orders", {
      limit: "10",
      dateFrom: "2024-01-01T00:00:00Z",
    });
  });

  it("get_new_orders -> marketplace host", async () => {
    await handleTool(client, "get_new_orders", {});
    expect(client.get).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/orders/new");
  });

  it("get_sales -> statistics host", async () => {
    await handleTool(client, "get_sales", { dateFrom: "2024-01-01T00:00:00Z" });
    expect(client.get).toHaveBeenCalledWith(HOSTS.statistics, "/api/v1/supplier/sales", {
      dateFrom: "2024-01-01T00:00:00Z",
    });
  });

  it("get_incomes -> statistics host", async () => {
    await handleTool(client, "get_incomes", { dateFrom: "2024-01-01T00:00:00Z" });
    expect(client.get).toHaveBeenCalledWith(HOSTS.statistics, "/api/v1/supplier/incomes", {
      dateFrom: "2024-01-01T00:00:00Z",
    });
  });

  it("get_fbw_stocks -> statistics host", async () => {
    await handleTool(client, "get_fbw_stocks", { dateFrom: "2024-01-01T00:00:00Z" });
    expect(client.get).toHaveBeenCalledWith(HOSTS.statistics, "/api/v1/supplier/stocks", {
      dateFrom: "2024-01-01T00:00:00Z",
    });
  });

  it("get_warehouses -> marketplace host", async () => {
    await handleTool(client, "get_warehouses", {});
    expect(client.get).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/offices");
  });

  it("get_supply -> marketplace host", async () => {
    await handleTool(client, "get_supply", { limit: 50 });
    expect(client.get).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/supplies", { limit: "50" });
  });

  it("create_supply -> marketplace host", async () => {
    await handleTool(client, "create_supply", { name: "Test Supply" });
    expect(client.post).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/supplies", {
      name: "Test Supply",
    });
  });

  it("add_orders_to_supply -> marketplace host, one PATCH per order", async () => {
    const result = await handleTool(client, "add_orders_to_supply", {
      supplyId: "WB-GI-1",
      orderIds: [11, 22],
    });
    expect(client.patch).toHaveBeenCalledTimes(2);
    expect(client.patch).toHaveBeenNthCalledWith(1, HOSTS.marketplace, "/api/v3/supplies/WB-GI-1/orders/11");
    expect(client.patch).toHaveBeenNthCalledWith(2, HOSTS.marketplace, "/api/v3/supplies/WB-GI-1/orders/22");
    expect(result).toEqual({ supplyId: "WB-GI-1", added: [11, 22] });
  });

  it("deliver_supply -> marketplace host", async () => {
    const result = await handleTool(client, "deliver_supply", { supplyId: "WB-GI-1" });
    expect(client.patch).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/supplies/WB-GI-1/deliver");
    expect(result).toEqual({ supplyId: "WB-GI-1", delivered: true });
  });

  it("get_supply_barcode -> marketplace host with default type", async () => {
    await handleTool(client, "get_supply_barcode", { supplyId: "WB-GI-1" });
    expect(client.get).toHaveBeenCalledWith(HOSTS.marketplace, "/api/v3/supplies/WB-GI-1/barcode", {
      type: "svg",
    });
  });

  it("encodes string path segments to prevent path traversal", async () => {
    await handleTool(client, "deliver_supply", { supplyId: "../orders/999" });
    const path = (client.patch as ReturnType<typeof vi.fn>).mock.calls[0][1] as string;
    expect(path).not.toContain("../");
    expect(path).toBe("/api/v3/supplies/..%2Forders%2F999/deliver");
  });

  it("get_statistics -> statistics host, v5 path", async () => {
    await handleTool(client, "get_statistics", {
      dateFrom: "2024-01-01T00:00:00Z",
      dateTo: "2024-01-31T00:00:00Z",
    });
    expect(client.get).toHaveBeenCalledWith(HOSTS.statistics, "/api/v5/supplier/reportDetailByPeriod", {
      dateFrom: "2024-01-01T00:00:00Z",
      dateTo: "2024-01-31T00:00:00Z",
    });
  });

  it("get_funnel -> analytics host", async () => {
    await handleTool(client, "get_funnel", { dateFrom: "2024-01-01", dateTo: "2024-01-31" });
    expect(client.post).toHaveBeenCalledWith(
      HOSTS.analytics,
      "/api/v2/nm-report/detail",
      expect.objectContaining({ period: { begin: "2024-01-01", end: "2024-01-31" }, page: 1 }),
    );
  });

  it("get_commission -> common host", async () => {
    await handleTool(client, "get_commission", { locale: "en" });
    expect(client.get).toHaveBeenCalledWith(HOSTS.common, "/api/v1/tariffs/commission", { locale: "en" });
  });

  it("get_tariffs -> common host", async () => {
    await handleTool(client, "get_tariffs", { date: "2026-06-23" });
    expect(client.get).toHaveBeenCalledWith(HOSTS.common, "/api/v1/tariffs/box", { date: "2026-06-23" });
  });

  it("get_feedbacks -> feedbacks host", async () => {
    await handleTool(client, "get_feedbacks", { take: 20, order: "dateAsc" });
    expect(client.get).toHaveBeenCalledWith(HOSTS.feedbacks, "/api/v1/feedbacks", {
      take: "20",
      order: "dateAsc",
    });
  });

  it("reply_feedback -> feedbacks host", async () => {
    await handleTool(client, "reply_feedback", { id: "fb-123", text: "Спасибо!" });
    expect(client.patch).toHaveBeenCalledWith(HOSTS.feedbacks, "/api/v1/feedbacks", {
      id: "fb-123",
      text: "Спасибо!",
    });
  });

  it("get_questions -> feedbacks host with defaults", async () => {
    await handleTool(client, "get_questions", {});
    expect(client.get).toHaveBeenCalledWith(HOSTS.feedbacks, "/api/v1/questions", {
      isAnswered: "false",
      take: "100",
      skip: "0",
    });
  });

  it("reply_question -> feedbacks host", async () => {
    await handleTool(client, "reply_question", { id: "q-1", text: "Ответ" });
    expect(client.patch).toHaveBeenCalledWith(HOSTS.feedbacks, "/api/v1/questions", {
      id: "q-1",
      answer: { text: "Ответ" },
      state: "wbRu",
    });
  });

  it("get_returns -> returns host", async () => {
    await handleTool(client, "get_returns", { limit: 50 });
    expect(client.get).toHaveBeenCalledWith(HOSTS.returns, "/api/v1/claims", {
      is_archive: "false",
      limit: "50",
    });
  });

  it("get_balance -> advert host with limiter key", async () => {
    await handleTool(client, "get_balance", {});
    expect(client.get).toHaveBeenCalledWith(HOSTS.advert, "/adv/v1/balance", undefined, {
      limiterKey: "advert:balance",
    });
  });

  it("list_campaigns -> advert host", async () => {
    await handleTool(client, "list_campaigns", {});
    expect(client.get).toHaveBeenCalledWith(HOSTS.advert, "/adv/v1/promotion/count");
  });

  it("get_campaign_stats -> advert host", async () => {
    await handleTool(client, "get_campaign_stats", {
      campaignIds: [7],
      dateFrom: "2024-01-01",
      dateTo: "2024-01-31",
    });
    expect(client.post).toHaveBeenCalledWith(HOSTS.advert, "/adv/v2/fullstats", [
      { id: 7, interval: { begin: "2024-01-01", end: "2024-01-31" } },
    ]);
  });
});

describe("get_abc_analysis", () => {
  let client: WBClient;
  beforeEach(() => {
    client = createMockClient();
  });

  it("hits statistics host and classifies by revenue (data-wrapped response)", async () => {
    (client.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { nm_id: 1, sa_name: "Prod A", retail_amount: 800, quantity: 10 },
        { nm_id: 2, sa_name: "Prod B", retail_amount: 150, quantity: 5 },
        { nm_id: 3, sa_name: "Prod C", retail_amount: 50, quantity: 2 },
      ],
    });
    const result = (await handleTool(client, "get_abc_analysis", {
      dateFrom: "2024-01-01T00:00:00Z",
      dateTo: "2024-01-31T00:00:00Z",
    })) as { summary: { A: number; totalProducts: number }; items: unknown[] };
    expect(client.get).toHaveBeenCalledWith(
      HOSTS.statistics,
      "/api/v5/supplier/reportDetailByPeriod",
      expect.objectContaining({ dateFrom: "2024-01-01T00:00:00Z" }),
    );
    expect(result.summary.totalProducts).toBe(3);
    expect(result.summary.A).toBe(1);
    expect(result.items).toHaveLength(3);
  });

  it("tolerates a top-level array response (real API shape)", async () => {
    (client.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { nm_id: 1, sa_name: "A", retail_amount: 100, quantity: 1 },
      { nm_id: 1, sa_name: "A", retail_amount: 50, quantity: 1 },
    ]);
    const result = (await handleTool(client, "get_abc_analysis", {
      dateFrom: "x",
      dateTo: "y",
    })) as { summary: { totalProducts: number; totalRevenue: number } };
    expect(result.summary.totalProducts).toBe(1); // grouped by nm_id
    expect(result.summary.totalRevenue).toBe(150);
  });
});

describe("get_paid_storage (async report)", () => {
  it("creates task on analytics host, polls, downloads", async () => {
    const get = vi.fn().mockImplementation(async (_host: string, path: string) => {
      if (path === "/api/v1/paid_storage") return { data: { taskId: "task-1" } };
      if (path.endsWith("/status")) return { data: { status: "done" } };
      if (path.endsWith("/download")) return [{ cost: 42 }];
      return {};
    });
    const client = {
      get,
      pollUntil: vi.fn().mockImplementation(async (o: { fn: () => Promise<unknown> }) => o.fn()),
    } as unknown as WBClient;

    const result = (await handleTool(client, "get_paid_storage", {
      dateFrom: "2024-01-01",
      dateTo: "2024-01-31",
    })) as { taskId: string; report: unknown };

    expect(get).toHaveBeenCalledWith(
      HOSTS.analytics,
      "/api/v1/paid_storage",
      { dateFrom: "2024-01-01", dateTo: "2024-01-31" },
      { limiterKey: "paid_storage:create" },
    );
    expect(result.taskId).toBe("task-1");
    expect(result.report).toEqual([{ cost: 42 }]);
  });
});

describe("error handling", () => {
  it("throws on unknown tool", async () => {
    const client = createMockClient();
    await expect(handleTool(client, "nonexistent" as ToolName, {})).rejects.toThrow("Unknown tool");
  });
});
