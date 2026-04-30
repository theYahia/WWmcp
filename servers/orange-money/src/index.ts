#!/usr/bin/env node

/**
 * @theyahia/orange-money-mcp — MCP server for Orange Money WebPay
 *
 * Multi-country: covers ~12 Francophone African markets (Senegal, Côte d'Ivoire,
 * Mali, Cameroon, Burkina Faso, Chad, Madagascar, Niger, Guinea, Liberia,
 * Sierra Leone, DRC) via single ORANGE_MONEY_COUNTRY env var.
 *
 * 8 tools: create_webpayment, get_payment_status, cashin, cashout, transfer,
 * get_balance, list_supported_countries, validate_webhook.
 *
 * Auth: OAuth2 Client Credentials with Basic header (Orange Developer
 * forbids client_id/secret in body — verified via Brave sweep).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "orange-money-mcp",
  version: "1.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
