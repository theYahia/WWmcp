import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleGetOrdersSummary, handleGetCustomersSummary } from "./analytics.js";

beforeEach(() => {
  process.env.RETAILCRM_DOMAIN = "testshop.retailcrm.ru";
  process.env.RETAILCRM_API_KEY = "test-key";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleGetOrdersSummary", () => {
  it("aggregates a period over a single page and is honest about scope", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        orders: [
          { id: 1, status: "new", totalSumm: 1000 },
          { id: 2, status: "complete", totalSumm: 3000 },
          { id: 3, status: "new", totalSumm: 2000 },
        ],
        pagination: { currentPage: 1, totalPageCount: 1, totalCount: 3 },
      }), { status: 200 }),
    );

    const result = await handleGetOrdersSummary({ date_from: "2025-01-01", date_to: "2025-01-31", max_pages: 5 });
    const parsed = JSON.parse(result.text);

    // date filters were actually sent (the v2 bug was sending none)
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("filter%5BcreatedAtFrom%5D=2025-01-01");
    expect(url).toContain("filter%5BcreatedAtTo%5D=2025-01-31");

    expect(parsed.totalCount).toBe(3);
    expect(parsed.aggregatedOver).toBe(3);
    expect(parsed.partial).toBe(false);
    expect(parsed.revenue).toBe(6000);
    expect(parsed.averageOrderValue).toBe(2000);
    expect(parsed.byStatus).toEqual({ new: 2, complete: 1 });
  });

  it("flags partial when totalCount exceeds the aggregated window", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        orders: [{ id: 1, status: "new", totalSumm: 1000 }],
        pagination: { currentPage: 1, totalPageCount: 1, totalCount: 500 },
      }), { status: 200 }),
    );
    const result = await handleGetOrdersSummary({ date_from: "2025-01-01", date_to: "2025-01-31", max_pages: 1 });
    const parsed = JSON.parse(result.text);
    expect(parsed.totalCount).toBe(500);
    expect(parsed.aggregatedOver).toBe(1);
    expect(parsed.partial).toBe(true);
  });
});

describe("handleGetCustomersSummary", () => {
  it("returns the period new-customer count using the customers date filter", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, customers: [], pagination: { totalCount: 42 } }), { status: 200 }),
    );
    const result = await handleGetCustomersSummary({ date_from: "2025-01-01", date_to: "2025-01-31" });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("filter%5BdateFrom%5D=2025-01-01"); // not createdAtFrom (that's orders-only)
    expect(url).toContain("filter%5BdateTo%5D=2025-01-31");
    expect(JSON.parse(result.text)).toMatchObject({ newCustomers: 42 });
  });
});
