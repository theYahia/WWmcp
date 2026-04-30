#!/usr/bin/env node

/**
 * @theyahia/salla-mcp — MCP server for Salla e-commerce platform (Saudi Arabia)
 *
 * 9 tools: list_products, get_product, create_product, update_product,
 * list_orders, get_order, update_order_status, list_customers, get_store_info.
 *
 * Auth: OAuth 2.0 Bearer token (SALLA_ACCESS_TOKEN env var).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "salla-mcp",
  version: "2.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
