#!/usr/bin/env node

/**
 * @theyahia/ifood-mcp — MCP server for the iFood Merchant API (Brazil)
 *
 * 26 tools: orders (9), merchant (8), catalog v2.0 (9).
 * Auth: IFOOD_CLIENT_ID + IFOOD_CLIENT_SECRET (OAuth2 client_credentials).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT).
 *
 * ponytail: the HTTP client stays its own (src/client.ts), not the core BaseHttpClient —
 * it carries one shared OAuth token with a one-shot refresh on 401, Retry-After-aware
 * retries, and retryOnWrite for iFood's idempotent state transitions.
 */

import { readFileSync } from "node:fs";
import type { ZodRawShape } from "zod";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";

// Order module
import { list_ordersSchema, handleListOrders } from "./tools/list-orders.js";
import { acknowledge_eventsSchema, handleAcknowledgeEvents } from "./tools/acknowledge-events.js";
import { get_orderSchema, handleGetOrder } from "./tools/get-order.js";
import { confirm_orderSchema, handleConfirmOrder } from "./tools/confirm-order.js";
import { start_preparationSchema, handleStartPreparation } from "./tools/start-preparation.js";
import { ready_to_pickupSchema, handleReadyToPickup } from "./tools/ready-to-pickup.js";
import { dispatch_orderSchema, handleDispatchOrder } from "./tools/dispatch-order.js";
import { get_cancellation_reasonsSchema, handleGetCancellationReasons } from "./tools/get-cancellation-reasons.js";
import { cancel_orderSchema, handleCancelOrder } from "./tools/cancel-order.js";
// Merchant module
import { list_merchantsSchema, handleListMerchants } from "./tools/list-merchants.js";
import { get_merchantSchema, handleGetMerchant } from "./tools/get-merchant.js";
import { get_merchant_statusSchema, handleGetMerchantStatus } from "./tools/get-merchant-status.js";
import { get_opening_hoursSchema, handleGetOpeningHours } from "./tools/get-opening-hours.js";
import { set_opening_hoursSchema, handleSetOpeningHours } from "./tools/set-opening-hours.js";
import { list_interruptionsSchema, handleListInterruptions } from "./tools/list-interruptions.js";
import { create_interruptionSchema, handleCreateInterruption } from "./tools/create-interruption.js";
import { delete_interruptionSchema, handleDeleteInterruption } from "./tools/delete-interruption.js";
// Catalog module
import { update_item_statusSchema, handleUpdateItemStatus } from "./tools/update-item-status.js";
import { update_item_priceSchema, handleUpdateItemPrice } from "./tools/update-item-price.js";
import { update_option_statusSchema, handleUpdateOptionStatus } from "./tools/update-option-status.js";
import { update_option_priceSchema, handleUpdateOptionPrice } from "./tools/update-option-price.js";
import { list_catalogsSchema, handleListCatalogs } from "./tools/list-catalogs.js";
import { list_categoriesSchema, handleListCategories } from "./tools/list-categories.js";
import { list_items_by_categorySchema, handleListItemsByCategory } from "./tools/list-items-by-category.js";
import { list_productsSchema, handleListProducts } from "./tools/list-products.js";
import { upsert_itemSchema, handleUpsertItem } from "./tools/upsert-item.js";

// Single source of truth for the version. dist/index.js → ../package.json is the package root.
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  version: string;
};

const logger = createLogger("ifood-mcp");

// Tool annotation presets. Hints are advisory UX signals for clients (e.g. to warn
// before destructive actions), not a security boundary. Every tool hits an external
// API, so openWorldHint is always true.
const READ: ToolAnnotations = { readOnlyHint: true, openWorldHint: true };
const WRITE_IDEMPOTENT: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true };
const WRITE_CREATE: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
const WRITE_DESTRUCTIVE: ToolAnnotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true };

type Tool = [name: string, description: string, inputSchema: ZodRawShape, annotations: ToolAnnotations, handler: (args: any) => Promise<string>];

const TOOLS: Tool[] = [
  // ── Order module ────────────────────────────────────────────────────────────
  ["list_orders", "Poll iFood order events (one GET per ~30s). Returns new events (PLACED/CONFIRMED/...) or none. Each event MUST be passed to acknowledge_events or it is redelivered forever.", list_ordersSchema.shape, READ, handleListOrders],
  ["acknowledge_events", "Acknowledge polled events so iFood stops redelivering them. WARNING: endpoint path is best-guess — verify against live iFood docs.", acknowledge_eventsSchema.shape, WRITE_IDEMPOTENT, handleAcknowledgeEvents],
  ["get_order", "Get full order detail by ID. May 404 briefly right after PLACED — retry with backoff.", get_orderSchema.shape, READ, handleGetOrder],
  ["confirm_order", "Confirm/accept an order (first transition after PLACED; orders auto-cancel if not confirmed in time).", confirm_orderSchema.shape, WRITE_IDEMPOTENT, handleConfirmOrder],
  ["start_preparation", "Mark an order as in preparation (optional, recommended between confirm and dispatch/pickup).", start_preparationSchema.shape, WRITE_IDEMPOTENT, handleStartPreparation],
  ["ready_to_pickup", "Mark an order ready for pickup (REQUIRED for TAKEOUT/DINE_IN).", ready_to_pickupSchema.shape, WRITE_IDEMPOTENT, handleReadyToPickup],
  ["dispatch_order", "Mark a DELIVERY order as dispatched.", dispatch_orderSchema.shape, WRITE_IDEMPOTENT, handleDispatchOrder],
  ["get_cancellation_reasons", "Get valid cancellation codes for an order at its current state (feed into cancel_order).", get_cancellation_reasonsSchema.shape, READ, handleGetCancellationReasons],
  ["cancel_order", "Request cancellation of an order using a code from get_cancellation_reasons. WARNING: request body is best-guess — verify against live iFood docs.", cancel_orderSchema.shape, WRITE_DESTRUCTIVE, handleCancelOrder],

  // ── Merchant module ─────────────────────────────────────────────────────────
  ["list_merchants", "List merchants the token can access (paginated; size default 100).", list_merchantsSchema.shape, READ, handleListMerchants],
  ["get_merchant", "Get full detail for one merchant (name, address, operations).", get_merchantSchema.shape, READ, handleGetMerchant],
  ["get_merchant_status", "Get merchant availability per operation/sales-channel (open/closed, reasons).", get_merchant_statusSchema.shape, READ, handleGetMerchantStatus],
  ["get_opening_hours", "Get a merchant's configured weekly opening hours.", get_opening_hoursSchema.shape, READ, handleGetOpeningHours],
  ["set_opening_hours", "Replace a merchant's ENTIRE weekly schedule (days not sent are removed).", set_opening_hoursSchema.shape, WRITE_IDEMPOTENT, handleSetOpeningHours],
  ["list_interruptions", "List active/future store interruptions (temporary pauses).", list_interruptionsSchema.shape, READ, handleListInterruptions],
  ["create_interruption", "Temporarily PAUSE a store for a time window (correct pause mechanism, not opening-hours).", create_interruptionSchema.shape, WRITE_CREATE, handleCreateInterruption],
  ["delete_interruption", "RESUME a store by removing an interruption.", delete_interruptionSchema.shape, WRITE_IDEMPOTENT, handleDeleteInterruption],

  // ── Catalog module (v2.0) ───────────────────────────────────────────────────
  ["update_item_status", "Set a menu item AVAILABLE/UNAVAILABLE.", update_item_statusSchema.shape, WRITE_IDEMPOTENT, handleUpdateItemStatus],
  ["update_item_price", "Update a menu item's price (reais).", update_item_priceSchema.shape, WRITE_IDEMPOTENT, handleUpdateItemPrice],
  ["update_option_status", "Set a complement/option AVAILABLE/UNAVAILABLE.", update_option_statusSchema.shape, WRITE_IDEMPOTENT, handleUpdateOptionStatus],
  ["update_option_price", "Update a complement/option price (reais).", update_option_priceSchema.shape, WRITE_IDEMPOTENT, handleUpdateOptionPrice],
  ["list_catalogs", "List a merchant's catalogs (step 1 of catalog discovery).", list_catalogsSchema.shape, READ, handleListCatalogs],
  ["list_categories", "List categories in a catalog (use include_items=true to get item IDs).", list_categoriesSchema.shape, READ, handleListCategories],
  ["list_items_by_category", "List items/products/options in a category.", list_items_by_categorySchema.shape, READ, handleListItemsByCategory],
  ["list_products", "List catalog products (paginated; response wrapped in `elements`).", list_productsSchema.shape, READ, handleListProducts],
  ["upsert_item", "Create or fully replace an item with its products/optionGroups/options (idempotent).", upsert_itemSchema.shape, WRITE_IDEMPOTENT, handleUpsertItem],
];

function createServer(): McpServer {
  const server = new McpServer({ name: "ifood-mcp", version: pkg.version });
  for (const [name, description, inputSchema, annotations, handler] of TOOLS) {
    server.registerTool(
      name,
      { description, inputSchema, annotations },
      withErrorHandling(async (args: any) => ({
        content: [{ type: "text", text: await handler(args) }],
      })),
    );
  }
  return server;
}

runServer(createServer, {
  name: "ifood-mcp",
  version: pkg.version,
  toolCount: TOOLS.length,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
