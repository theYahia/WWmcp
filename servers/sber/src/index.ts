#!/usr/bin/env node

/**
 * @theyahia/sber-mcp — MCP server for the SberBusiness API (Russia)
 *
 * 8 tools: get_accounts, get_balance, get_statement, summarize_transactions,
 * create_payment, get_payment_status, list_counterparties, get_company_info.
 * Auth: SBER_TOKEN или SBER_CLIENT_ID + SBER_CLIENT_SECRET (опционально поверх mTLS).
 *
 * Transports: stdio (default), Streamable HTTP (--http или HTTP_PORT).
 */

import { runServer } from "@theyahia/mcp-core";
import { createMcpServer, TOOL_COUNT, VERSION, logger } from "./server.js";

// ponytail: README 1.x обещает `PORT=… --http`, ядро слушает HTTP_PORT. PORT берём только при
// --http: сам по себе HTTP_PORT включает HTTP-режим, а PORT часто задан платформой.
if (process.argv.includes("--http") && process.env.PORT && !process.env.HTTP_PORT) {
  process.env.HTTP_PORT = process.env.PORT;
}

runServer(createMcpServer, {
  name: "sber-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
