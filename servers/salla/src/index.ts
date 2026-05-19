#!/usr/bin/env node

/**
 * @theyahia/salla-mcp — MCP server for Salla e-commerce platform (Saudi Arabia)
 *
 * 15 tools across products, orders, customers, store info, catalog ops, and
 * webhook signature verification. See README.md for the full list.
 *
 * Auth: OAuth 2.0 Bearer token (static or auto-refresh).
 *   - Static:   SALLA_ACCESS_TOKEN
 *   - Refresh:  SALLA_OAUTH_CLIENT_ID + SALLA_OAUTH_CLIENT_SECRET + SALLA_REFRESH_TOKEN
 *
 * Webhook security: SALLA_WEBHOOK_SECRET (HMAC-SHA256 verification).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "salla-mcp",
  version: "3.1.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
