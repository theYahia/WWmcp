/**
 * Salla MCP server factory.
 * Split from index.ts so tests can import without triggering runServer.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
// Products
import { listProductsSchema, handleListProducts } from "./tools/list-products.js";
import { getProductSchema, handleGetProduct } from "./tools/get-product.js";
import { getProductBySkuSchema, handleGetProductBySku } from "./tools/get-product-by-sku.js";
import { createProductSchema, handleCreateProduct } from "./tools/create-product.js";
import { updateProductSchema, handleUpdateProduct } from "./tools/update-product.js";
import { deleteProductSchema, handleDeleteProduct } from "./tools/delete-product.js";
import { bulkUpdateQuantitiesSchema, handleBulkUpdateQuantities } from "./tools/bulk-update-quantities.js";
// Categories & brands
import { listCategoriesSchema, handleListCategories } from "./tools/list-categories.js";
import { getCategorySchema, handleGetCategory } from "./tools/get-category.js";
import { createCategorySchema, handleCreateCategory } from "./tools/create-category.js";
import { listBrandsSchema, handleListBrands } from "./tools/list-brands.js";
// Orders
import { listOrdersSchema, handleListOrders } from "./tools/list-orders.js";
import { getOrderSchema, handleGetOrder } from "./tools/get-order.js";
import { updateOrderStatusSchema, handleUpdateOrderStatus } from "./tools/update-order-status.js";
import { listOrderStatusesSchema, handleListOrderStatuses } from "./tools/list-order-statuses.js";
import { getOrderHistoriesSchema, handleGetOrderHistories } from "./tools/get-order-histories.js";
// Customers
import { listCustomersSchema, handleListCustomers } from "./tools/list-customers.js";
import { getCustomerSchema, handleGetCustomer } from "./tools/get-customer.js";
// Store, marketing, ops
import { getStoreInfoSchema, handleGetStoreInfo } from "./tools/get-store-info.js";
import { listCouponsSchema, handleListCoupons } from "./tools/list-coupons.js";
import { listAbandonedCartsSchema, handleListAbandonedCarts } from "./tools/list-abandoned-carts.js";
import { listBranchesSchema, handleListBranches } from "./tools/list-branches.js";

export const logger = createLogger("salla-mcp");

/** Single source of truth for the server version (handshake + /health). */
export const VERSION = "3.1.0";

export const TOOL_COUNT = 22;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "salla-mcp",
    version: VERSION,
  });

  // ---- Products ----
  server.tool(
    "list_products",
    "List products from a Salla store with pagination. Optional filter by status (sale, out, hidden, deleted).",
    listProductsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListProducts(params) }],
    })),
  );

  server.tool(
    "get_product",
    "Get full product details from Salla by product ID.",
    getProductSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetProduct(params) }],
    })),
  );

  server.tool(
    "get_product_by_sku",
    "Get full product details from Salla by SKU code.",
    getProductBySkuSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetProductBySku(params) }],
    })),
  );

  server.tool(
    "create_product",
    "Create a new product in a Salla store. Required: name, price, product_type. Optional: quantity, description, SKU.",
    createProductSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateProduct(params) }],
    })),
  );

  server.tool(
    "update_product",
    "Update an existing Salla product — name, price, quantity, or status.",
    updateProductSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleUpdateProduct(params) }],
    })),
  );

  server.tool(
    "delete_product",
    "Permanently delete a product from a Salla store by product ID.",
    deleteProductSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleDeleteProduct(params) }],
    })),
  );

  server.tool(
    "bulk_update_quantities",
    "Bulk-update product or variant stock quantities by product id, variant id, or SKU. Queued; may take minutes.",
    bulkUpdateQuantitiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleBulkUpdateQuantities(params) }],
    })),
  );

  // ---- Categories & brands ----
  server.tool(
    "list_categories",
    "List Salla product categories with optional keyword and status filters.",
    listCategoriesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListCategories(params) }],
    })),
  );

  server.tool(
    "get_category",
    "Get details of a single Salla product category by ID.",
    getCategorySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCategory(params) }],
    })),
  );

  server.tool(
    "create_category",
    "Create a new product category in a Salla store. Required: name. Optional: status, parent_id, sort_order, image.",
    createCategorySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateCategory(params) }],
    })),
  );

  server.tool(
    "list_brands",
    "List the brands available in a Salla store with pagination.",
    listBrandsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListBrands(params) }],
    })),
  );

  // ---- Orders ----
  server.tool(
    "list_orders",
    "List Salla orders with pagination. Optional filter by order status (completed, in_progress, under_review, cancelled, etc.).",
    listOrdersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListOrders(params) }],
    })),
  );

  server.tool(
    "get_order",
    "Get full Salla order details by order ID, including customer, items, and totals.",
    getOrderSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetOrder(params) }],
    })),
  );

  server.tool(
    "update_order_status",
    "Update the fulfillment status of a Salla order (completed, in_progress, under_review, cancelled, restoring, refunded).",
    updateOrderStatusSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleUpdateOrderStatus(params) }],
    })),
  );

  server.tool(
    "list_order_statuses",
    "List all order statuses and sub-statuses configured for the store. Use to find valid values for update_order_status.",
    listOrderStatusesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListOrderStatuses(params) }],
    })),
  );

  server.tool(
    "get_order_histories",
    "List the status-change history (timeline) of a single Salla order.",
    getOrderHistoriesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetOrderHistories(params) }],
    })),
  );

  // ---- Customers ----
  server.tool(
    "list_customers",
    "List customers of the Salla store with pagination.",
    listCustomersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListCustomers(params) }],
    })),
  );

  server.tool(
    "get_customer",
    "Get details of a single Salla customer by ID, including their groups.",
    getCustomerSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCustomer(params) }],
    })),
  );

  // ---- Store, marketing, ops ----
  server.tool(
    "get_store_info",
    "Get general Salla store information and settings (name, currency, timezone, plan).",
    getStoreInfoSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetStoreInfo(params) }],
    })),
  );

  server.tool(
    "list_coupons",
    "List the discount coupons configured in a Salla store with pagination.",
    listCouponsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListCoupons(params) }],
    })),
  );

  server.tool(
    "list_abandoned_carts",
    "List abandoned shopping carts for revenue-recovery workflows, with pagination.",
    listAbandonedCartsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListAbandonedCarts(params) }],
    })),
  );

  server.tool(
    "list_branches",
    "List the store's branches (physical locations / pickup points), with pagination.",
    listBranchesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListBranches(params) }],
    })),
  );

  return server;
}
