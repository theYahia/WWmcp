#!/usr/bin/env node

/**
 * @theyahia/fawaterak-mcp — MCP server for Fawaterak (Egypt)
 *
 * 8 tools: create_invoice_link, send_payment, get_payment_methods,
 * get_invoice_data, list_invoices, cancel_invoice, refund_payment, get_balance.
 *
 * Auth: Bearer API key (FAWATERAK_API_KEY env var).
 *
 * Sandbox: set FAWATERAK_SANDBOX=true for staging.fawaterk.com.
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "fawaterak-mcp",
  version: "1.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
