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
import { handleGetProductVariants } from "../src/tools/get-product-variants.js";
import { handleUpdateProductPrice } from "../src/tools/update-product-price.js";
import { handleBulkInventoryAdjust } from "../src/tools/bulk-inventory-adjust.js";
import { handleGetCategories } from "../src/tools/get-categories.js";
import { handleGetBrands } from "../src/tools/get-brands.js";
import { handleGetProductBySku } from "../src/tools/get-product-by-sku.js";
import { handleDeleteProduct } from "../src/tools/delete-product.js";
import { handleCreateCategory } from "../src/tools/create-category.js";
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

  // --- v1.2 catalog ops ---

  it("get_product_variants projects variants block from /products/:id", async () => {
    mockFetchOk({
      data: {
        id: 42,
        name: "Premium Dates",
        options: [{ id: 1, name: "Size" }],
        variants: [
          { id: 100, sku: "DT-S" },
          { id: 101, sku: "DT-L" },
        ],
      },
    });
    const result = JSON.parse(
      await handleGetProductVariants({ product_id: 42 }),
    );
    expect(result.product_id).toBe(42);
    expect(result.total_variants).toBe(2);
    expect(result.variants).toHaveLength(2);
    expect(result.options).toHaveLength(1);
  });

  it("update_product_price PUTs price + optional sale_price", async () => {
    const fetch = mockFetchOk({ data: { id: 42 } });
    await handleUpdateProductPrice({
      product_id: 42,
      price: 200,
      sale_price: 150,
      sale_end: "2026-06-01T00:00:00Z",
    });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/products/42");
    expect(opts.method).toBe("PUT");
    const body = JSON.parse(opts.body);
    expect(body).toEqual({
      price: 200,
      sale_price: 150,
      sale_end: "2026-06-01T00:00:00Z",
    });
  });

  it("update_product_price rejects sale_price > price", async () => {
    mockFetchOk({});
    await expect(
      handleUpdateProductPrice({
        product_id: 1,
        price: 100,
        sale_price: 200,
      }),
    ).rejects.toThrow(/sale_price.*cannot exceed price/);
  });

  it("bulk_inventory_adjust POSTs to /products/quantities/bulk with id/variant_id/sku items", async () => {
    const fetch = mockFetchOk({ data: { updated: 3 } });
    await handleBulkInventoryAdjust({
      items: [
        {
          identifier_type: "id",
          identifier: 100,
          quantity: 50,
          option: "overwrite",
        },
        {
          identifier_type: "variant_id",
          identifier: 200,
          quantity: 5,
          option: "increment",
        },
        {
          identifier_type: "sku",
          identifier: "DATES-SM",
          quantity: 1,
          option: "decrement",
        },
      ],
    });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/products/quantities/bulk");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.products).toHaveLength(3);
    expect(body.products[0]).toEqual({
      id: 100,
      quantity: 50,
      option: "overwrite",
    });
    expect(body.products[1]).toEqual({
      variant_id: 200,
      quantity: 5,
      option: "increment",
    });
    expect(body.products[2]).toEqual({
      sku: "DATES-SM",
      quantity: 1,
      option: "decrement",
    });
  });

  it("get_categories GETs /categories with pagination + keyword", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleGetCategories({ page: 2, per_page: 100, keyword: "food" });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("/categories");
    expect(url).toContain("page=2");
    expect(url).toContain("per_page=100");
    expect(url).toContain("keyword=food");
  });

  it("get_brands GETs /brands with pagination", async () => {
    const fetch = mockFetchOk({ data: [] });
    await handleGetBrands({ page: 1, per_page: 50 });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("/brands");
    expect(url).toContain("page=1");
    expect(url).toContain("per_page=50");
  });

  // --- coverage additions ---

  it("get_product_by_sku encodes the SKU in the path", async () => {
    const fetch = mockFetchOk({ data: { id: 7 } });
    await handleGetProductBySku({ sku: "A B/C" });
    expect(fetch.mock.calls[0][0]).toContain("/products/sku/A%20B%2FC");
  });

  it("delete_product DELETEs /products/:id", async () => {
    const fetch = mockFetchOk({ success: true });
    await handleDeleteProduct({ product_id: 42 });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/products/42");
    expect(opts.method).toBe("DELETE");
  });

  it("create_category POSTs name + optional fields", async () => {
    const fetch = mockFetchOk({ data: { id: 3 } });
    await handleCreateCategory({ name: "Snacks", status: "hidden", parent_id: 2 });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/categories");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ name: "Snacks", status: "hidden", parent_id: 2 });
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
