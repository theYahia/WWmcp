import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleCreateCustomerOrder,
  handleGetOrders,
  handleBatchCreateOrders,
  handleBatchUpdateStatus,
} from "../src/tools/orders.js";

function mockFetchJson(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map(),
  });
}

describe("orders tool handlers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MOYSKLAD_TOKEN"] = "test-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("handleCreateCustomerOrder converts price_rubles → kopecks per line and includes positions[]", async () => {
    const fetchMock = mockFetchJson({ id: "order-1", name: "ORD-001", sum: 25_000 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleCreateCustomerOrder({
      organization_href: "https://api.moysklad.ru/.../organization/abc",
      agent_href: "https://api.moysklad.ru/.../counterparty/xyz",
      positions: [
        { assortment_href: "https://api.moysklad.ru/.../product/p1", quantity: 2, price_rubles: 125 },
      ],
    });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe("order-1");
    expect(parsed.sum_rubles).toBe(250); // 25_000 kopecks → 250 RUB

    const [, opts] = fetchMock.mock.calls[0]!;
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.positions).toHaveLength(1);
    expect(body.positions[0].quantity).toBe(2);
    expect(body.positions[0].price).toBe(12_500); // 125 RUB = 12_500 kopecks
  });

  it("handleGetOrders combines multiple filters with semicolon separator", async () => {
    const fetchMock = mockFetchJson({ meta: { size: 0 }, rows: [] });
    vi.stubGlobal("fetch", fetchMock);

    await handleGetOrders({
      filter_state: "Новый",
      filter_agent: "https://api.moysklad.ru/.../counterparty/xyz",
      limit: 25,
      offset: 0,
      order: "created,desc",
    });
    const [url] = fetchMock.mock.calls[0]!;
    const urlStr = String(url);
    expect(urlStr).toContain("filter=");
    // semicolon may be URL-encoded as %3B
    expect(urlStr).toMatch(/state\.name/);
    expect(urlStr).toMatch(/agent/);
  });

  it("handleGetOrders surfaces non-2xx as error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve(JSON.stringify({ errors: [{ error: "Unauthorized" }] })),
      headers: new Map(),
    }));
    await expect(handleGetOrders({ limit: 25, offset: 0, order: "created,desc" })).rejects.toThrow();
  });

  it("handleBatchCreateOrders dispatches N POSTs and reports per-item results", async () => {
    let i = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      i++;
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ id: `order-${i}`, sum: 1000 })),
        headers: new Map(),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchCreateOrders({
      orders: [
        { organization_href: "org1", agent_href: "ag1", positions: [{ assortment_href: "p1", quantity: 1 }] },
        { organization_href: "org1", agent_href: "ag2", positions: [{ assortment_href: "p2", quantity: 3 }] },
      ],
      concurrency: 2,
    });
    const env = JSON.parse(result);
    expect(env.total).toBe(2);
    expect(env.succeeded).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("handleBatchUpdateStatus PUTs the state href into each order", async () => {
    const fetchMock = mockFetchJson({ id: "o", sum: 0 });
    vi.stubGlobal("fetch", fetchMock);

    await handleBatchUpdateStatus({
      ids: ["order-a", "order-b", "order-c"],
      state_href: "https://api.moysklad.ru/.../state/shipped",
      concurrency: 5,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const bodies = fetchMock.mock.calls.map((c) => JSON.parse((c[1] as RequestInit).body as string));
    for (const body of bodies) {
      expect(body.state.meta.href).toBe("https://api.moysklad.ru/.../state/shipped");
    }
  });
});
