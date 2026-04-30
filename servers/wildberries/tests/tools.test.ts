import { describe, it, expect, vi, beforeEach } from "vitest";
import { toolDefinitions, handleTool, type ToolName } from "../src/tools.js";
import type { WBClient } from "../src/client.js";

function createMockClient(): WBClient {
  return {
    get: vi.fn().mockResolvedValue({ data: "mock-get" }),
    post: vi.fn().mockResolvedValue({ data: "mock-post" }),
    put: vi.fn().mockResolvedValue({ data: "mock-put" }),
    patch: vi.fn().mockResolvedValue({ data: "mock-patch" }),
    request: vi.fn().mockResolvedValue({ data: "mock" }),
  } as unknown as WBClient;
}

describe("Tool definitions", () => {
  it("should have exactly 15 tools", () => {
    const tools = Object.keys(toolDefinitions);
    expect(tools).toHaveLength(15);
  });

  it("should include all required tool names", () => {
    const expected: ToolName[] = [
      "list_products",
      "get_product",
      "update_prices",
      "update_stocks",
      "get_orders",
      "get_new_orders",
      "get_sales",
      "get_warehouses",
      "get_supply",
      "create_supply",
      "get_statistics",
      "get_feedbacks",
    ];
    for (const name of expected) {
      expect(toolDefinitions).toHaveProperty(name);
    }
  });

  it("every tool should have a description", () => {
    for (const [, def] of Object.entries(toolDefinitions)) {
      expect(def.description).toBeTruthy();
    }
  });
});

describe("Tool handlers", () => {
  let client: WBClient;

  beforeEach(() => {
    client = createMockClient();
  });

  it("list_products calls POST /content/v2/get/cards/list", async () => {
    await handleTool(client, "list_products", { limit: 50 });
    expect(client.post).toHaveBeenCalledWith(
      "/content/v2/get/cards/list",
      expect.objectContaining({
        settings: expect.objectContaining({
          cursor: { limit: 50 },
        }),
      }),
    );
  });

  it("get_product calls POST /content/v2/get/cards/detail", async () => {
    await handleTool(client, "get_product", { nmIDs: [123, 456] });
    expect(client.post).toHaveBeenCalledWith("/content/v2/get/cards/detail", {
      nmIDs: [123, 456],
    });
  });

  it("update_prices calls POST /api/v2/upload/task", async () => {
    const prices = [{ nmID: 1, price: 999 }];
    await handleTool(client, "update_prices", { prices });
    expect(client.post).toHaveBeenCalledWith("/api/v2/upload/task", {
      data: prices,
    });
  });

  it("update_stocks calls PUT /api/v3/stocks/{warehouseId}", async () => {
    const stocks = [{ sku: "ABC", amount: 10 }];
    await handleTool(client, "update_stocks", { warehouseId: 42, stocks });
    expect(client.put).toHaveBeenCalledWith("/api/v3/stocks/42", { stocks });
  });

  it("get_orders calls GET /api/v3/orders", async () => {
    await handleTool(client, "get_orders", { limit: 10, dateFrom: "2024-01-01T00:00:00Z" });
    expect(client.get).toHaveBeenCalledWith("/api/v3/orders", {
      limit: "10",
      dateFrom: "2024-01-01T00:00:00Z",
    });
  });

  it("get_new_orders calls GET /api/v3/orders/new", async () => {
    await handleTool(client, "get_new_orders", {});
    expect(client.get).toHaveBeenCalledWith("/api/v3/orders/new");
  });

  it("get_sales calls GET /api/v1/supplier/sales", async () => {
    await handleTool(client, "get_sales", { dateFrom: "2024-01-01T00:00:00Z" });
    expect(client.get).toHaveBeenCalledWith("/api/v1/supplier/sales", {
      dateFrom: "2024-01-01T00:00:00Z",
    });
  });

  it("get_warehouses calls GET /api/v3/offices", async () => {
    await handleTool(client, "get_warehouses", {});
    expect(client.get).toHaveBeenCalledWith("/api/v3/offices");
  });

  it("get_supply calls GET /api/v3/supplies", async () => {
    await handleTool(client, "get_supply", { limit: 50 });
    expect(client.get).toHaveBeenCalledWith("/api/v3/supplies", { limit: "50" });
  });

  it("create_supply calls POST /api/v3/supplies", async () => {
    await handleTool(client, "create_supply", { name: "Test Supply" });
    expect(client.post).toHaveBeenCalledWith("/api/v3/supplies", { name: "Test Supply" });
  });

  it("get_statistics calls GET /api/v1/supplier/reportDetailByPeriod", async () => {
    await handleTool(client, "get_statistics", {
      dateFrom: "2024-01-01T00:00:00Z",
      dateTo: "2024-01-31T00:00:00Z",
    });
    expect(client.get).toHaveBeenCalledWith("/api/v1/supplier/reportDetailByPeriod", {
      dateFrom: "2024-01-01T00:00:00Z",
      dateTo: "2024-01-31T00:00:00Z",
    });
  });

  it("get_feedbacks calls GET /api/v1/feedbacks", async () => {
    await handleTool(client, "get_feedbacks", { take: 20, order: "dateAsc" });
    expect(client.get).toHaveBeenCalledWith("/api/v1/feedbacks", {
      take: "20",
      order: "dateAsc",
    });
  });

  it("get_stocks calls POST /api/v3/stocks/{warehouseId}", async () => {
    const skus = ["SKU-1", "SKU-2"];
    await handleTool(client, "get_stocks", { warehouseId: 99, skus });
    expect(client.post).toHaveBeenCalledWith("/api/v3/stocks/99", { skus });
  });

  it("get_stocks uses empty skus array when omitted", async () => {
    await handleTool(client, "get_stocks", { warehouseId: 99 });
    expect(client.post).toHaveBeenCalledWith("/api/v3/stocks/99", { skus: [] });
  });

  it("get_abc_analysis calls GET /api/v1/supplier/reportDetailByPeriod and returns summary+items", async () => {
    (client.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { nm_id: 1, sa_name: "Prod A", retail_amount: 800, quantity: 10 },
        { nm_id: 2, sa_name: "Prod B", retail_amount: 150, quantity: 5 },
        { nm_id: 3, sa_name: "Prod C", retail_amount: 50, quantity: 2 },
      ],
    });
    const result = await handleTool(client, "get_abc_analysis", {
      dateFrom: "2024-01-01T00:00:00Z",
      dateTo: "2024-01-31T00:00:00Z",
    }) as { summary: { A: number; B: number; C: number; totalProducts: number }; items: unknown[] };
    expect(result.summary.totalProducts).toBe(3);
    expect(result.summary.A).toBe(1); // Prod A = 80% revenue → class A
    expect(result.items).toHaveLength(3);
  });

  it("reply_feedback calls PATCH /api/v1/feedbacks", async () => {
    await handleTool(client, "reply_feedback", { id: "fb-123", text: "Спасибо!" });
    expect(client.patch).toHaveBeenCalledWith("/api/v1/feedbacks", {
      id: "fb-123",
      text: "Спасибо!",
    });
  });

  it("should throw on unknown tool", async () => {
    await expect(
      handleTool(client, "nonexistent" as ToolName, {}),
    ).rejects.toThrow("Unknown tool");
  });
});
