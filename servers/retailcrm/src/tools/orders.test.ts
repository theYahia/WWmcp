import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleListOrders, handleGetOrder, handleCreateOrder, handleUpdateOrder } from "./orders.js";

beforeEach(() => {
  process.env.RETAILCRM_DOMAIN = "testshop.retailcrm.ru";
  process.env.RETAILCRM_API_KEY = "test-key";
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(data: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(data), { status }),
  );
}

const orderBody = (spy: ReturnType<typeof vi.spyOn>) => {
  const body = (spy.mock.calls[0][1] as RequestInit).body as string;
  return JSON.parse(decodeURIComponent(body).match(/order=(.+?)(&|$)/)![1]);
};

describe("handleListOrders", () => {
  it("sends correct filter params", async () => {
    const spy = mockFetch({ success: true, orders: [], pagination: { totalCount: 0 } });
    await handleListOrders({ filter_status: "complete", filter_date_from: "2025-01-01", detail: "summary", page: 1, limit: 10 });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("filter%5Bstatus%5D=complete");
    expect(url).toContain("filter%5BcreatedAtFrom%5D=2025-01-01");
    expect(url).toContain("limit=10");
  });

  it("returns a shaped summary with pagination", async () => {
    mockFetch({
      success: true,
      orders: [{ id: 1, number: "100", status: "new", totalSumm: 500, items: [{}], createdAt: "2025-01-01 10:00:00" }],
      pagination: { currentPage: 1, totalPageCount: 1, totalCount: 1 },
    });
    const result = await handleListOrders({ detail: "summary", page: 1, limit: 20 });
    const parsed = JSON.parse(result.text);
    expect(parsed.orders).toHaveLength(1);
    expect(parsed.orders[0]).toMatchObject({ id: 1, number: "100", status: "new", total: 500, itemCount: 1 });
    expect(parsed.orders[0].items).toBeUndefined(); // summary omits heavy nesting
    expect(parsed.pagination).toMatchObject({ page: 1, totalCount: 1, returned: 1, hasMore: false });
  });

  it("full detail includes line items", async () => {
    mockFetch({
      success: true,
      orders: [{ id: 1, number: "100", items: [{ offer: { displayName: "Widget" }, quantity: 2, initialPrice: 250 }] }],
      pagination: { currentPage: 1, totalPageCount: 1, totalCount: 1 },
    });
    const result = await handleListOrders({ detail: "full", page: 1, limit: 20 });
    const parsed = JSON.parse(result.text);
    expect(parsed.orders[0].items).toEqual([{ name: "Widget", quantity: 2, initialPrice: 250, discountTotal: 0, price: 250 }]);
  });
});

describe("handleGetOrder", () => {
  it("fetches and shapes an order by id", async () => {
    const spy = mockFetch({ success: true, order: { id: 42, number: "42", status: "new" } });
    const result = await handleGetOrder({ id: "42", by: "id", detail: "summary" });
    expect(spy.mock.calls[0][0]).toContain("/orders/42");
    expect(JSON.parse(result.text).order.id).toBe(42);
  });

  it("supports externalId lookup", async () => {
    const spy = mockFetch({ success: true, order: { id: 42 } });
    await handleGetOrder({ id: "EXT-001", by: "externalId", detail: "summary" });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/orders/EXT-001");
    expect(url).toContain("by=externalId");
  });

  it("returns isError (not a throw) on a 404", async () => {
    mockFetch("not found", 404);
    const result = await handleGetOrder({ id: "999", by: "id", detail: "summary" });
    expect(result.isError).toBe(true);
    expect(result.text).toContain("404");
  });
});

describe("handleCreateOrder", () => {
  it("sends order with items and inline customer", async () => {
    const spy = mockFetch({ success: true, id: 100 });
    await handleCreateOrder({
      first_name: "Ivan", last_name: "Petrov", phone: "+79001234567",
      order_type: "eshop-individual",
      items: [{ product_name: "Widget", quantity: 2, initial_price: 500 }],
    });
    const order = orderBody(spy);
    expect(order.firstName).toBe("Ivan");
    expect(order.items).toHaveLength(1);
    expect(order.customer.phones[0].number).toBe("+79001234567");
  });

  it("links an existing customer by id instead of inline", async () => {
    const spy = mockFetch({ success: true, id: 101 });
    await handleCreateOrder({
      customer_id: 555, order_type: "eshop-individual",
      items: [{ product_name: "Widget", quantity: 1, initial_price: 100 }],
    });
    const order = orderBody(spy);
    expect(order.customer).toEqual({ id: 555 });
    expect(order.firstName).toBeUndefined();
  });

  it("passes site through to the form body", async () => {
    const spy = mockFetch({ success: true, id: 102 });
    await handleCreateOrder({
      first_name: "Ivan", order_type: "eshop-individual", site: "myshop",
      items: [{ product_name: "Widget", quantity: 1, initial_price: 100 }],
    });
    const body = (spy.mock.calls[0][1] as RequestInit).body as string;
    expect(body).toContain("site=myshop");
  });

  it("returns isError when no customer info given", async () => {
    const result = await handleCreateOrder({
      order_type: "eshop-individual",
      items: [{ product_name: "Widget", quantity: 1, initial_price: 100 }],
    });
    expect(result.isError).toBe(true);
  });
});

describe("handleUpdateOrder", () => {
  it("sends only changed fields", async () => {
    const spy = mockFetch({ success: true });
    await handleUpdateOrder({ id: "42", by: "id", status: "complete", manager_comment: "Shipped" });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/orders/42/edit");
    const order = orderBody(spy);
    expect(order.status).toBe("complete");
    expect(order.managerComment).toBe("Shipped");
    expect(order.firstName).toBeUndefined();
  });
});
