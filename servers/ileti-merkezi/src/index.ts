#!/usr/bin/env node

/**
 * @theyahia/ileti-merkezi-mcp — MCP server for Ileti Merkezi SMS API (Turkey)
 *
 * 8 tools: send_sms, send_bulk_sms, get_sms_report, get_balance, list_senders,
 * create_contact_group, add_contacts, get_blacklist.
 *
 * Auth: API Key + HMAC SHA256 (ILETI_API_KEY + ILETI_SECRET env vars).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "ileti-merkezi-mcp",
  version: "2.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
