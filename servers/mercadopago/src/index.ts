#!/usr/bin/env node

/**
 * @theyahia/mercadopago-mcp — MCP server for MercadoPago (Argentina + LATAM)
 *
 * 10 tools: create_payment, get_payment, search_payments, refund_payment,
 * get_payment_methods, create_preference, get_preference, update_preference,
 * search_merchant_orders, get_merchant_order.
 *
 * Auth: Bearer access token (MERCADOPAGO_ACCESS_TOKEN env var).
 *
 * Multi-country: works for AR, BR, MX, UY, CL, CO, PE, EC, VE — country
 * derived from token and account site_id (no separate env var needed).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "mercadopago-mcp",
  version: "1.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
