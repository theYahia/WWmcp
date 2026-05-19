import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleGetProfitReport } from "../src/tools/reports.js";

describe("reports tool handlers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MOYSKLAD_TOKEN"] = "test-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("handleGetProfitReport parses kopecks → rubles for all monetary fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        meta: { size: 1 },
        rows: [{
          assortment: { name: "Молоко" },
          sellQuantity: 100,
          sellSum: 1_200_000,    // 12_000 RUB
          sellCostSum: 800_000,  //  8_000 RUB
          returnQuantity: 2,
          returnSum: 24_000,     //    240 RUB
          profit: 400_000,       //  4_000 RUB
          margin: 33.3,
        }],
      })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleGetProfitReport({ limit: 25, offset: 0 });
    const parsed = JSON.parse(result);
    expect(parsed.total).toBe(1);
    const row = parsed.items[0];
    expect(row.product_name).toBe("Молоко");
    expect(row.sell_sum_rubles).toBe(12_000);
    expect(row.sell_cost_sum_rubles).toBe(8_000);
    expect(row.return_sum_rubles).toBe(240);
    expect(row.profit_rubles).toBe(4_000);
    expect(row.margin).toBe(33.3);
  });

  it("handleGetProfitReport encodes momentFrom/momentTo into filter", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ meta: { size: 0 }, rows: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleGetProfitReport({
      limit: 25,
      offset: 0,
      moment_from: "2026-01-01",
      moment_to: "2026-12-31",
    });
    const [url] = fetchMock.mock.calls[0]!;
    const urlStr = decodeURIComponent(String(url));
    expect(urlStr).toContain("/report/profit/byproduct");
    expect(urlStr).toContain("momentFrom=2026-01-01");
    expect(urlStr).toContain("momentTo=2026-12-31");
    expect(urlStr).toContain("00:00:00");
    expect(urlStr).toContain("23:59:59");
  });

  it("handleGetProfitReport propagates 403 forbidden errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve(JSON.stringify({ errors: [{ error: "Forbidden" }] })),
      headers: new Map(),
    }));
    await expect(handleGetProfitReport({ limit: 25, offset: 0 })).rejects.toThrow();
  });
});
