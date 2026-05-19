#!/usr/bin/env node

/**
 * @theyahia/moysklad-mcp — MCP server for MoySklad ERP/inventory API
 *
 * 15 tools:
 *   - Single-entity (10): search_products, get_product, create_product, update_prices,
 *     get_stock, get_counterparties, create_customer_order, get_orders,
 *     get_profit_report, create_supply.
 *   - Batch (5, v3.1.0): batch_update_products, batch_set_prices,
 *     batch_create_orders, batch_update_status, batch_create_counterparties.
 *
 * Auth: Bearer token (MOYSKLAD_TOKEN) or Basic (MOYSKLAD_LOGIN + MOYSKLAD_PASSWORD).
 * Rate limit: token bucket 45 req / 3s.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import {
  searchProductsSchema, handleSearchProducts,
  getProductSchema, handleGetProduct,
  createProductSchema, handleCreateProduct,
  updatePricesSchema, handleUpdatePrices,
  batchUpdateProductsSchema, handleBatchUpdateProducts,
  batchSetPricesSchema, handleBatchSetPrices,
} from "./tools/products.js";
import { getStockSchema, handleGetStock } from "./tools/stock.js";
import {
  createCustomerOrderSchema, handleCreateCustomerOrder,
  getOrdersSchema, handleGetOrders,
  batchCreateOrdersSchema, handleBatchCreateOrders,
  batchUpdateStatusSchema, handleBatchUpdateStatus,
} from "./tools/orders.js";
import {
  getCounterpartiesSchema, handleGetCounterparties,
  batchCreateCounterpartiesSchema, handleBatchCreateCounterparties,
} from "./tools/counterparties.js";
import { getProfitReportSchema, handleGetProfitReport } from "./tools/reports.js";
import { createSupplySchema, handleCreateSupply } from "./tools/supply.js";

const logger = createLogger("moysklad-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "moysklad-mcp",
    version: "3.1.0",
  });

  server.tool(
    "search_products",
    "Search products in MoySklad by name or article/SKU. Returns a paginated list with sale and buy prices in rubles. Supports offset-based pagination up to 1000 results per page. Use filter_article for exact SKU lookup.",
    searchProductsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSearchProducts(params) }],
    })),
  );

  server.tool(
    "get_product",
    "Get a single product by its UUID. Returns full product details including name, article, code, description, sale/buy prices in rubles, weight, volume, and last update timestamp. Prices are returned in rubles (converted from kopecks internally).",
    getProductSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetProduct(params) }],
    })),
  );

  server.tool(
    "create_product",
    "Create a new product in MoySklad. Accepts name, article/SKU, description, code, prices in rubles (automatically converted to kopecks for the API), weight in grams, volume in liters, and VAT rate. Returns the created product with its assigned UUID.",
    createProductSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateProduct(params) }],
    })),
  );

  server.tool(
    "get_stock",
    "Get current stock/inventory report from MoySklad. Shows quantities, reserves, and in-transit amounts for each product. Supports grouping by product, variant, or store, and filtering by stock level (positive, negative, empty, non-empty). Paginated.",
    getStockSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetStock(params) }],
    })),
  );

  server.tool(
    "update_prices",
    "Update sale, buy, or minimum prices for an existing product by UUID. All prices are specified in rubles and converted to kopecks internally. Preserves existing price type metadata when updating sale prices. Returns the updated product.",
    updatePricesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleUpdatePrices(params) }],
    })),
  );

  server.tool(
    "get_counterparties",
    "Search counterparties (customers and suppliers) in MoySklad by name or INN (tax ID). Returns a paginated list with id, name, phone, email, INN, and company type. Use filter_inn for exact tax ID lookup. Supports offset-based pagination.",
    getCounterpartiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCounterparties(params) }],
    })),
  );

  server.tool(
    "create_customer_order",
    "Create a customer order in MoySklad. Requires organization (seller) and agent (buyer) meta hrefs, plus at least one line item with product href and quantity. Prices in rubles are converted to kopecks internally. Supports per-line discounts.",
    createCustomerOrderSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateCustomerOrder(params) }],
    })),
  );

  server.tool(
    "get_orders",
    "Get customer orders with filtering and sorting. Supports search by name/number, filtering by state name or counterparty, and sorting by created date, moment, or sum. Returns paginated results with order sums in rubles. Use expand parameter for nested entities.",
    getOrdersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetOrders(params) }],
    })),
  );

  server.tool(
    "get_profit_report",
    "Get profit report by product from MoySklad. Shows sell quantity, sell sum, cost sum, return quantity, return sum, profit, and margin for each product. Supports date range filtering with moment_from/moment_to in ISO 8601 format. All monetary values in rubles.",
    getProfitReportSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetProfitReport(params) }],
    })),
  );

  server.tool(
    "create_supply",
    "Create an incoming supply (purchase receipt) in MoySklad. Records goods received from a supplier into a warehouse. Requires organization and agent meta hrefs, plus line items with product hrefs and quantities. Optionally specify warehouse, incoming document number, and date.",
    createSupplySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateSupply(params) }],
    })),
  );

  // ── Batch tools (v3.1.0) ───────────────────────────────────────────────
  // Client-side parallel batching: N parallel HTTP requests with a concurrency
  // cap (default 5), per-item success/failure reporting, partial failures do
  // NOT abort. The shared 45 req/3s token bucket already shields MoySklad.

  server.tool(
    "batch_update_products",
    "Update up to 100 products in parallel by UUID. Each item may patch any subset of name/article/description/code/weight/volume/vat. Returns per-item ok/error envelope with `failed_indexes` ready for retry. For price-only updates use batch_set_prices (preserves priceType meta).",
    batchUpdateProductsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleBatchUpdateProducts(params) }],
    })),
  );

  server.tool(
    "batch_set_prices",
    "Update sale/buy/min prices for up to 100 products in parallel. Reuses the single-product update_prices logic per item so MoySklad's required salePrices.priceType meta is preserved. Returns per-item ok/error envelope with `failed_indexes`.",
    batchSetPricesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleBatchSetPrices(params) }],
    })),
  );

  server.tool(
    "batch_create_orders",
    "Create up to 100 customer orders in parallel. Each item is the same shape as create_customer_order (organization_href, agent_href, positions[]). Returns per-item ok/error envelope; failed orders can be retried by passing the subset back without re-running the successful ones.",
    batchCreateOrdersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleBatchCreateOrders(params) }],
    })),
  );

  server.tool(
    "batch_update_status",
    "Transition up to 100 customer orders to a target state in parallel. Pass an array of order UUIDs and one state meta href (look it up via /entity/customerorder/metadata). Returns per-item ok/error envelope.",
    batchUpdateStatusSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleBatchUpdateStatus(params) }],
    })),
  );

  server.tool(
    "batch_create_counterparties",
    "Create up to 100 counterparties (customers/suppliers) in parallel. Each item requires `name`; optional fields: inn, kpp, phone, email, description, company_type (legal/entrepreneur/individual). Returns per-item ok/error envelope with `failed_indexes`.",
    batchCreateCounterpartiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleBatchCreateCounterparties(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "moysklad-mcp",
  version: "2.1.0",
  toolCount: 15,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
