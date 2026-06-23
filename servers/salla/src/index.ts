#!/usr/bin/env node

/**
 * @theyahia/salla-mcp — MCP server for Salla e-commerce platform (Saudi Arabia)
 *
 * 22 tools across products (incl. delete, by-SKU, bulk quantities), categories,
 * brands, orders (incl. statuses, histories), customers, coupons, abandoned carts,
 * branches, and store info.
 *
 * Auth: OAuth 2.0 Bearer token (SALLA_ACCESS_TOKEN env var).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, VERSION, logger } from "./server.js";

runServer(createServer, {
  name: "salla-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
