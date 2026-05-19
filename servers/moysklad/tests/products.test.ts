import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleSearchProducts,
  handleGetProduct,
  handleCreateProduct,
  handleUpdatePrices,
  handleBatchUpdateProducts,
  handleBatchSetPrices,
} from "../src/tools/products.js";

function mockFetchJson(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map(),
  });
}

function mockFetchError(status: number, body: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: () => Promise.resolve(body),
    headers: new Map(),
  });
}

describe("products tool handlers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MOYSKLAD_TOKEN"] = "test-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("handleSearchProducts builds offset+limit query and parses kopecks → rubles", async () => {
    const fetchMock = mockFetchJson({
      meta: { size: 2 },
      rows: [
        { id: "p1", name: "Молоко", article: "MILK-1", code: "001", salePrices: [{ value: 12_000 }] },
        { id: "p2", name: "Хлеб", article: "BREAD-1", code: "002", salePrices: [{ value: 5_000 }] },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleSearchProducts({ search: "Мол", limit: 25, offset: 0 });
    const parsed = JSON.parse(result) as { total: number; products: Array<Record<string, unknown>> };

    expect(parsed.total).toBe(2);
    expect(parsed.products[0].sale_price_rubles).toBe(120);
    expect(parsed.products[1].sale_price_rubles).toBe(50);
    const [url] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("limit=25");
    expect(String(url)).toContain("offset=0");
    expect(String(url)).toContain("search=");
  });

  it("handleCreateProduct converts rubles → kopecks for sale price", async () => {
    const fetchMock = mockFetchJson({ id: "new-uuid", name: "Йогурт", salePrices: [{ value: 8500 }] });
    vi.stubGlobal("fetch", fetchMock);

    await handleCreateProduct({ name: "Йогурт", sale_price_rubles: 85 });
    const [, opts] = fetchMock.mock.calls[0]!;
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.name).toBe("Йогурт");
    expect(body.salePrices[0].value).toBe(8500); // 85 RUB = 8500 kopecks
  });

  it("handleUpdatePrices preserves existing priceType meta when patching salePrices", async () => {
    // Step 1: GET returns existing product with priceType meta
    // Step 2: PUT receives body with preserved priceType
    let call = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      call++;
      if (call === 1) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify({
            id: "abc",
            salePrices: [{ value: 10_000, priceType: { meta: { href: "https://api.moysklad.ru/...", type: "pricetype", mediaType: "application/json" } } }],
          })),
          headers: new Map(),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ id: "abc", salePrices: [{ value: 15_000 }] })),
        headers: new Map(),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleUpdatePrices({ id: "abc", sale_price_rubles: 150 });
    const [, putOpts] = fetchMock.mock.calls[1]!;
    const body = JSON.parse((putOpts as RequestInit).body as string);
    expect(body.salePrices[0].value).toBe(15_000);
    // priceType meta must be preserved
    expect(body.salePrices[0].priceType).toBeDefined();
  });

  it("handleGetProduct surfaces API errors as thrown exceptions", async () => {
    vi.stubGlobal("fetch", mockFetchError(404, JSON.stringify({ errors: [{ error: "Not found" }] })));
    await expect(handleGetProduct({ id: "missing-uuid" })).rejects.toThrow();
  });

  // ── Batch tools ──────────────────────────────────────────────────────────

  it("handleBatchUpdateProducts dispatches one PUT per item and reports per-item ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ id: "x", name: "patched" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchUpdateProducts({
      items: [
        { id: "a", name: "A" },
        { id: "b", name: "B" },
        { id: "c", weight: 500 },
      ],
      concurrency: 5,
    });
    const env = JSON.parse(result);
    expect(env.total).toBe(3);
    expect(env.succeeded).toBe(3);
    expect(env.failed).toBe(0);
    expect(env.failed_indexes).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // Each call hits /entity/product/<id>
    for (const call of fetchMock.mock.calls) {
      expect(String(call[0])).toMatch(/\/entity\/product\/[a-c]/);
    }
  });

  it("handleBatchSetPrices reports failed_indexes for items that error", async () => {
    // First item GET succeeds, PUT succeeds. Second item GET fails (404).
    let getCount = 0;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      const isGet = !url.includes("?");
      // simulate: id "ok-id" succeeds, "bad-id" 404s on the initial GET
      if (url.includes("bad-id")) {
        return Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve("not found"),
          headers: new Map(),
        });
      }
      if (isGet) {
        getCount++;
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify({ id: "ok-id", salePrices: [{ value: 1000, priceType: { meta: { href: "x", type: "pricetype", mediaType: "application/json" } } }] })),
          headers: new Map(),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ id: "ok-id", salePrices: [{ value: 2000 }] })),
        headers: new Map(),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchSetPrices({
      items: [
        { id: "ok-id", sale_price_rubles: 20 },
        { id: "bad-id", sale_price_rubles: 99 },
      ],
      concurrency: 2,
    });
    const env = JSON.parse(result);
    expect(env.total).toBe(2);
    expect(env.failed).toBeGreaterThanOrEqual(1);
    expect(env.failed_indexes).toContain(1);
  });
});
