import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleListProducts } from "../src/tools/list-products.js";
import { handleGetProduct } from "../src/tools/get-product.js";
import { handleCreateProduct } from "../src/tools/create-product.js";
import { handleUpdateProduct } from "../src/tools/update-product.js";
import { handleListOrders } from "../src/tools/list-orders.js";
import { handleGetOrder } from "../src/tools/get-order.js";
import { handleUpdateOrderStatus } from "../src/tools/update-order-status.js";
import { handleListCustomers } from "../src/tools/list-customers.js";
import { handleGetStoreInfo } from "../src/tools/get-store-info.js";

function mockFetchOk(data: unknown): ReturnType<typeof vi.fn> {
  const mock = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map(),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

describe("salla tool handlers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["SALLA_ACCESS_TOKEN"] = "test-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("list_products GETs /products with pagination", async () => {
    const fetch = mockFetchOk({ data: [{ id: 1, name: "P1" }] });
    const result = JSON.parse(await handleListProducts({ page: 1, per_page: 25 }));
    expect(result.data[0].name).toBe("P1");
    expect(fetch.mock.calls[0][0]).toContain("/products");
    expect(fetch.mock.calls[0][0]).toContain("page=1");
  });

  it("list_products passes status filter", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleListProducts({ page: 1, per_page: 25, status: "sale" });
    expect(fetch.mock.calls[0][0]).toContain("status=sale");
  });

  it("get_product hits /products/:id", async () => {
    const fetch = mockFetchOk({ data: { id: 42, name: "Dates" } });
    const result = JSON.parse(await handleGetProduct({ product_id: 42 }));
    expect(result.data.name).toBe("Dates");
    expect(fetch.mock.calls[0][0]).toContain("/products/42");
  });

  it("create_product POSTs name + price + product_type", async () => {
    const fetch = mockFetchOk({ data: { id: 100 } });
    await handleCreateProduct({
      name: "Premium Dates",
      price: 150,
      product_type: "product",
      quantity: 50,
    });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.name).toBe("Premium Dates");
    expect(body.price).toBe(150);
    expect(body.quantity).toBe(50);
  });

  it("update_product PUTs only defined fields", async () => {
    const fetch = mockFetchOk({ data: { id: 1 } });
    await handleUpdateProduct({ product_id: 1, name: "New Name" });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/products/1");
    expect(opts.method).toBe("PUT");
    const body = JSON.parse(opts.body);
    expect(body).toEqual({ name: "New Name" });
    expect(body.price).toBeUndefined();
  });

  it("list_orders passes status filter", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleListOrders({ page: 1, per_page: 25, status: "completed" });
    expect(fetch.mock.calls[0][0]).toContain("status=completed");
  });

  it("get_order hits /orders/:id", async () => {
    const fetch = mockFetchOk({ data: { id: 1001 } });
    await handleGetOrder({ order_id: 1001 });
    expect(fetch.mock.calls[0][0]).toContain("/orders/1001");
  });

  it("update_order_status POSTs to /orders/:id/status", async () => {
    const fetch = mockFetchOk({ data: { id: 1001 } });
    await handleUpdateOrderStatus({ order_id: 1001, status: "completed" });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/orders/1001/status");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body).status).toBe("completed");
  });

  it("list_customers paginates correctly", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleListCustomers({ page: 2, per_page: 50 });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("/customers");
    expect(url).toContain("page=2");
    expect(url).toContain("per_page=50");
  });

  it("get_store_info hits /store/info with no params", async () => {
    const fetch = mockFetchOk({ data: { name: "Test Store" } });
    const result = JSON.parse(await handleGetStoreInfo({}));
    expect(result.data.name).toBe("Test Store");
    expect(fetch.mock.calls[0][0]).toContain("/store/info");
  });
});
