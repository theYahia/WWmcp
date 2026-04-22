#!/usr/bin/env node

/**
 * @theyahia/chapa-mcp — MCP server for Chapa (Ethiopia)
 *
 * 8 tools: initialize_transaction, verify_transaction, list_banks, transfer,
 * verify_transfer, list_transfers, list_transactions, get_balance.
 *
 * Auth: Bearer secret key (CHAPA_SECRET_KEY env var).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "chapa-mcp",
  version: "1.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
