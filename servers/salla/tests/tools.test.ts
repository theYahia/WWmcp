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
import { handleDeleteProduct } from "../src/tools/delete-product.js";
import { handleGetProductBySku } from "../src/tools/get-product-by-sku.js";
import { handleBulkUpdateQuantities } from "../src/tools/bulk-update-quantities.js";
import { handleListCategories } from "../src/tools/list-categories.js";
import { handleGetCategory } from "../src/tools/get-category.js";
import { handleCreateCategory } from "../src/tools/create-category.js";
import { handleListBrands } from "../src/tools/list-brands.js";
import { handleGetCustomer } from "../src/tools/get-customer.js";
import { handleListOrderStatuses } from "../src/tools/list-order-statuses.js";
import { handleGetOrderHistories } from "../src/tools/get-order-histories.js";
import { handleListCoupons } from "../src/tools/list-coupons.js";
import { handleListAbandonedCarts } from "../src/tools/list-abandoned-carts.js";
import { handleListBranches } from "../src/tools/list-branches.js";

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

  it("delete_product DELETEs /products/:id", async () => {
    const fetch = mockFetchOk({ success: true });
    await handleDeleteProduct({ product_id: 42 });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/products/42");
    expect(opts.method).toBe("DELETE");
  });

  it("get_product_by_sku encodes the SKU in the path", async () => {
    const fetch = mockFetchOk({ data: { id: 7 } });
    await handleGetProductBySku({ sku: "A B/C" });
    expect(fetch.mock.calls[0][0]).toContain("/products/sku/A%20B%2FC");
  });

  it("bulk_update_quantities POSTs a products array", async () => {
    const fetch = mockFetchOk({ status: 201 });
    await handleBulkUpdateQuantities({
      products: [{ identifer_type: "sku", identifer: "SKU1", quantity: 5 }],
    });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/products/quantities/bulk");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body).products[0].identifer_type).toBe("sku");
  });

  it("list_categories passes keyword + status filters", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleListCategories({ page: 1, keyword: "food", status: "active" });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("/categories");
    expect(url).toContain("keyword=food");
    expect(url).toContain("status=active");
  });

  it("get_category hits /categories/:id", async () => {
    const fetch = mockFetchOk({ data: { id: 9 } });
    await handleGetCategory({ category_id: 9 });
    expect(fetch.mock.calls[0][0]).toContain("/categories/9");
  });

  it("create_category POSTs name + optional fields", async () => {
    const fetch = mockFetchOk({ data: { id: 3 } });
    await handleCreateCategory({ name: "Snacks", status: "hidden", parent_id: 2 });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/categories");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ name: "Snacks", status: "hidden", parent_id: 2 });
  });

  it("list_brands hits /brands", async () => {
    const fetch = mockFetchOk({ data: [{ id: 1 }] });
    await handleListBrands({ page: 1, per_page: 25 });
    expect(fetch.mock.calls[0][0]).toContain("/brands");
  });

  it("get_customer hits /customers/:id", async () => {
    const fetch = mockFetchOk({ data: { id: 5, first_name: "Sara" } });
    const result = JSON.parse(await handleGetCustomer({ customer_id: 5 }));
    expect(result.data.first_name).toBe("Sara");
    expect(fetch.mock.calls[0][0]).toContain("/customers/5");
  });

  it("list_order_statuses hits /orders/statuses", async () => {
    const fetch = mockFetchOk({ data: [{ id: 1, name: "completed" }] });
    await handleListOrderStatuses({});
    expect(fetch.mock.calls[0][0]).toContain("/orders/statuses");
  });

  it("get_order_histories hits /orders/:id/histories", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleGetOrderHistories({ order_id: 1001 });
    expect(fetch.mock.calls[0][0]).toContain("/orders/1001/histories");
  });

  it("list_coupons hits /coupons", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleListCoupons({ page: 1, per_page: 25 });
    expect(fetch.mock.calls[0][0]).toContain("/coupons");
  });

  it("list_abandoned_carts hits /carts/abandoned", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleListAbandonedCarts({ page: 1, per_page: 25 });
    expect(fetch.mock.calls[0][0]).toContain("/carts/abandoned");
  });

  it("list_branches hits /branches", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleListBranches({ page: 1, per_page: 25 });
    expect(fetch.mock.calls[0][0]).toContain("/branches");
  });
});
