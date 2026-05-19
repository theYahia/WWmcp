#!/usr/bin/env node

/**
 * @theyahia/avito-mcp — MCP server for Avito (Russia's #1 classifieds, 50M+ MAU)
 *
 * v0.1.0 — 3 tools:
 *   - list_my_items     — paginate seller's own listings with status/category filters
 *   - get_item_info     — full item details (status, services, stats) by item_id
 *   - list_chats        — Avito Messenger chats with pagination + unread filter
 *
 * Auth: OAuth 2.0 Client Credentials (auto-refresh against
 *       https://api.avito.ru/token/, tokens valid 24h).
 *   - AVITO_CLIENT_ID
 *   - AVITO_CLIENT_SECRET
 *   - AVITO_USER_ID (optional, used as default for tools needing user_id in path)
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 *
 * Roadmap (v0.2.0, Day 27-28):
 *   - send_message, get_item_stats, get_chat_messages, mark_chat_read,
 *     get_account_balance.
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "avito-mcp",
  version: "0.1.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
