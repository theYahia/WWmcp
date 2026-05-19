/**
 * Salla MCP server factory.
 * Split from index.ts so tests can import without triggering runServer.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { listProductsSchema, handleListProducts } from "./tools/list-products.js";
import { getProductSchema, handleGetProduct } from "./tools/get-product.js";
import { createProductSchema, handleCreateProduct } from "./tools/create-product.js";
import { updateProductSchema, handleUpdateProduct } from "./tools/update-product.js";
import { listOrdersSchema, handleListOrders } from "./tools/list-orders.js";
import { getOrderSchema, handleGetOrder } from "./tools/get-order.js";
import { updateOrderStatusSchema, handleUpdateOrderStatus } from "./tools/update-order-status.js";
import { listCustomersSchema, handleListCustomers } from "./tools/list-customers.js";
import { getStoreInfoSchema, handleGetStoreInfo } from "./tools/get-store-info.js";
import {
  getProductVariantsSchema,
  handleGetProductVariants,
} from "./tools/get-product-variants.js";
import {
  updateProductPriceSchema,
  handleUpdateProductPrice,
} from "./tools/update-product-price.js";
import {
  bulkInventoryAdjustSchema,
  handleBulkInventoryAdjust,
} from "./tools/bulk-inventory-adjust.js";
import {
  getCategoriesSchema,
  handleGetCategories,
} from "./tools/get-categories.js";
import { getBrandsSchema, handleGetBrands } from "./tools/get-brands.js";
import {
  verifyWebhookSignatureSchema,
  handleVerifyWebhookSignature,
} from "./tools/verify-webhook-signature.js";

export const logger = createLogger("salla-mcp");

// 9 base tools + 5 catalog ops + 1 webhook verifier = 15
export const TOOL_COUNT = 15;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "salla-mcp",
    version: "3.1.0",
  });

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
    "list_customers",
    "List customers of the Salla store with pagination.",
    listCustomersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListCustomers(params) }],
    })),
  );

  server.tool(
    "get_store_info",
    "Get general Salla store information and settings (name, currency, timezone, plan).",
    getStoreInfoSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetStoreInfo(params) }],
    })),
  );

  // --- Catalog ops (v1.2 additions) ---

  server.tool(
    "get_product_variants",
    "Get the variants and option matrix for a Salla product (size, color, etc.).",
    getProductVariantsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [
        { type: "text", text: await handleGetProductVariants(params) },
      ],
    })),
  );

  server.tool(
    "update_product_price",
    "Update a Salla product's base price (and optional sale_price + sale_end).",
    updateProductPriceSchema.shape,
    withErrorHandling(async (params) => ({
      content: [
        { type: "text", text: await handleUpdateProductPrice(params) },
      ],
    })),
  );

  server.tool(
    "bulk_inventory_adjust",
    "Bulk adjust inventory quantities (up to 1000 items) by product ID, variant ID, or SKU. Modes: overwrite | increment | decrement.",
    bulkInventoryAdjustSchema.shape,
    withErrorHandling(async (params) => ({
      content: [
        { type: "text", text: await handleBulkInventoryAdjust(params) },
      ],
    })),
  );

  server.tool(
    "get_categories",
    "List Salla store categories with pagination + optional keyword filter.",
    getCategoriesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCategories(params) }],
    })),
  );

  server.tool(
    "get_brands",
    "List Salla store brands with pagination + optional keyword filter. Requires brands.read scope.",
    getBrandsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetBrands(params) }],
    })),
  );

  // --- Security tool (v1.2 addition) ---

  server.tool(
    "verify_webhook_signature",
    "Verify a Salla webhook payload using the Signature (HMAC-SHA256) or Token strategy. Returns { valid, strategy, computed_signature }. Uses timing-safe comparison.",
    verifyWebhookSignatureSchema.shape,
    withErrorHandling(async (params) => ({
      content: [
        { type: "text", text: await handleVerifyWebhookSignature(params) },
      ],
    })),
  );

  return server;
}
