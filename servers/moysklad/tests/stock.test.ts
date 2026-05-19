import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleGetStock } from "../src/tools/stock.js";

describe("stock tool handlers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MOYSKLAD_TOKEN"] = "test-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("handleGetStock hits /report/stock/all and applies groupBy=product by default", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        meta: { size: 1 },
        rows: [{ name: "Молоко", article: "M-001", stock: 12, reserve: 0, inTransit: 5, quantity: 7, salePrice: 12_000 }],
      })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleGetStock({ limit: 25, offset: 0, group_by: "product", stock_mode: "all" });
    const parsed = JSON.parse(result);
    expect(parsed.total).toBe(1);
    expect(parsed.items[0].name).toBe("Молоко");
    expect(parsed.items[0].sale_price_rubles).toBe(120); // 12_000 kopecks → 120 RUB
    expect(parsed.items[0].quantity).toBe(7);

    const [url] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/report/stock/all");
    expect(String(url)).toContain("groupBy=product");
  });

  it("handleGetStock honours stock_mode filter when not 'all'", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ meta: { size: 0 }, rows: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleGetStock({ limit: 25, offset: 0, group_by: "store", stock_mode: "negativeOnly" });
    const [url] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("stockMode=negativeOnly");
    expect(String(url)).toContain("groupBy=store");
  });

  it("handleGetStock propagates 500 errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve(JSON.stringify({ errors: [{ error: "Internal" }] })),
      headers: new Map(),
    }));
    await expect(
      handleGetStock({ limit: 25, offset: 0, group_by: "product", stock_mode: "all" }),
    ).rejects.toThrow();
  });
});
