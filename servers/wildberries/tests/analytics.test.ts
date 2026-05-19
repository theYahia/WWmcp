import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleTool } from "../src/tools.js";
import type { WBClient } from "../src/client.js";

function createMockClient(): WBClient {
  return {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: [] }),
    put: vi.fn().mockResolvedValue({ data: [] }),
    patch: vi.fn().mockResolvedValue({ data: [] }),
    request: vi.fn().mockResolvedValue({ data: [] }),
  } as unknown as WBClient;
}

describe("Analytics tools — get_sales_velocity", () => {
  let client: WBClient;

  beforeEach(() => {
    client = createMockClient();
  });

  it("computes units-per-day for a specific nm_id, ignoring returns", async () => {
    (client.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { nm_id: 100, sa_name: "Prod-100", retail_amount: 1000, quantity: 5 },
        { nm_id: 100, sa_name: "Prod-100", retail_amount: 800, quantity: 4 },
        { nm_id: 100, sa_name: "Prod-100", retail_amount: 200, quantity: 1, doc_type_name: "Возврат" },
        { nm_id: 200, sa_name: "Prod-200", retail_amount: 500, quantity: 2 },
      ],
    });
    const result = (await handleTool(client, "get_sales_velocity", {
      nmId: 100,
      days: 10,
    })) as {
      period: { days: number };
      summary: { totalUnits: number; unitsPerDay: number; revenuePerDay: number };
      topSkus: Array<{ nmId: number; units: number }>;
    };

    expect(result.period.days).toBe(10);
    // Only nm_id=100 sales (5+4 = 9 units), returns excluded
    expect(result.summary.totalUnits).toBe(9);
    expect(result.summary.unitsPerDay).toBe(0.9);
    expect(result.topSkus).toHaveLength(1);
    expect(result.topSkus[0].nmId).toBe(100);
  });

  it("aggregates across all SKUs when nmId is omitted, caps days at 90", async () => {
    (client.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { nm_id: 1, sa_name: "A", retail_amount: 100, quantity: 1 },
        { nm_id: 2, sa_name: "B", retail_amount: 200, quantity: 2 },
      ],
    });
    const result = (await handleTool(client, "get_sales_velocity", { days: 1000 })) as {
      period: { days: number };
      summary: { totalUnits: number };
      topSkus: unknown[];
    };
    expect(result.period.days).toBe(90); // capped
    expect(result.summary.totalUnits).toBe(3);
    expect(result.topSkus).toHaveLength(2);
  });
});

describe("Analytics tools — get_returns_stats", () => {
  let client: WBClient;

  beforeEach(() => {
    client = createMockClient();
  });

  it("computes return rate from mixed sales/returns rows", async () => {
    (client.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { nm_id: 1, sa_name: "Item-1", retail_amount: 1000, quantity: 10 },
        { nm_id: 1, sa_name: "Item-1", retail_amount: 100, quantity: 1, doc_type_name: "Возврат" },
        { nm_id: 2, sa_name: "Item-2", retail_amount: 500, quantity: 5 },
        { nm_id: 2, sa_name: "Item-2", retail_amount: -50, quantity: -1 }, // alt return signal
      ],
    });
    const result = (await handleTool(client, "get_returns_stats", {
      dateFrom: "2026-01-01T00:00:00Z",
      dateTo: "2026-01-31T00:00:00Z",
    })) as {
      summary: {
        totalOrders: number;
        totalReturns: number;
        returnRate: number;
        salesRevenue: number;
        returnRevenue: number;
      };
      topReturned: Array<{ nmId: number; returns: number; returnRate: number }>;
    };

    expect(result.summary.totalOrders).toBe(15); // 10 + 5
    expect(result.summary.totalReturns).toBe(2); // 1 (Возврат) + 1 (negative quantity)
    expect(result.summary.returnRate).toBeCloseTo((2 / 15) * 100, 1);
    expect(result.summary.salesRevenue).toBe(1500);
    expect(result.topReturned).toHaveLength(2);
  });
});

describe("Analytics tools — get_competitor_prices", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("queries public WB catalog and returns normalised prices", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            products: [
              {
                id: 111,
                name: "Test A",
                brand: "BrandX",
                supplierId: 1,
                priceU: 199900,
                salePriceU: 149900,
                rating: 5,
                feedbacks: 100,
              },
              {
                id: 222,
                name: "Test B",
                brand: "BrandY",
                priceU: 299900,
                salePriceU: 199900,
                rating: 4,
                feedbacks: 50,
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = createMockClient();
    const result = (await handleTool(client, "get_competitor_prices", {
      query: "test product",
      limit: 5,
    })) as {
      query: string;
      summary: { count: number; minPrice: number; maxPrice: number; avgPrice: number };
      items: Array<{
        nmId: number;
        salePriceRubles: number | null;
        priceRubles: number | null;
      }>;
    };

    expect(result.query).toBe("test product");
    expect(result.items).toHaveLength(2);
    expect(result.items[0].priceRubles).toBe(1999);
    expect(result.items[0].salePriceRubles).toBe(1499);
    expect(result.summary.minPrice).toBe(1499);
    expect(result.summary.maxPrice).toBe(1999);
  });

  it("handles empty catalog response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { products: [] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createMockClient();
    const result = (await handleTool(client, "get_competitor_prices", { query: "x" })) as {
      summary: { count: number; minPrice: number | null };
      items: unknown[];
    };
    expect(result.items).toHaveLength(0);
    expect(result.summary.count).toBe(0);
    expect(result.summary.minPrice).toBeNull();
  });
});
