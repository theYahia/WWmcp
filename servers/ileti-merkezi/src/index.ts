#!/usr/bin/env node

/**
 * @theyahia/ileti-merkezi-mcp — MCP server for the İletiMerkezi SMS API (Turkey)
 *
 * 11 tools: send_sms, cancel_order, get_report, get_reports, get_balance,
 * get_sender, get_blacklist, add_blacklist, delete_blacklist, iys_register,
 * iys_check.
 *
 * Auth: ILETIMERKEZI_API_KEY + ILETIMERKEZI_API_HASH, sent inside the request
 * body envelope (both values come precomputed from the panel).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, VERSION, logger } from "./server.js";

runServer(createServer, {
  name: "ileti-merkezi-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
