#!/usr/bin/env node

/**
 * @theyahia/kaspi-mcp — MCP server for the Kaspi.kz Marketplace API (Kazakhstan)
 *
 * 3 tools: get_orders, get_products, get_order.
 * Auth: KASPI_API_KEY (seller cabinet at kaspi.kz).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT).
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "kaspi-mcp",
  version: "1.0.2",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
