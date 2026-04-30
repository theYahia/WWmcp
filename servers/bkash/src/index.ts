#!/usr/bin/env node

/**
 * @theyahia/bkash-mcp — MCP server for bKash Tokenized Checkout (Bangladesh)
 *
 * 8 tools: create_payment, execute_payment, query_payment, search_transaction,
 * refund_payment, query_refund, agreement_create, agreement_query.
 *
 * Auth: Custom 3-step token grant flow (BKASH_APP_KEY, BKASH_APP_SECRET,
 * BKASH_USERNAME, BKASH_PASSWORD env vars). Tokens cached + auto-refreshed.
 *
 * Sandbox: set BKASH_SANDBOX=true to use https://tokenized.sandbox.bka.sh.
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "bkash-mcp",
  version: "1.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
