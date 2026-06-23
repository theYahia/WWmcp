#!/usr/bin/env node

/**
 * @theyahia/wildberries-mcp — MCP server for Wildberries Seller API
 *
 * 30 tools: products, prices, stocks, orders, sales, FBS supplies, analytics,
 * feedbacks, questions, returns, ads, ABC analysis. Per-category host routing
 * with rate limiting (X-Ratelimit-Retry-After + 409 penalty handling).
 *
 * Auth: Bearer token (WB_API_TOKEN env var).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

if (!process.env["WB_API_TOKEN"]) {
  logger.error(
    "WB_API_TOKEN is required. Get it at https://seller.wildberries.ru/supplier-settings/access-to-api",
  );
  process.exit(1);
}

runServer(createServer, {
  name: "wildberries-mcp",
  version: "3.1.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
