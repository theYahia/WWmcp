#!/usr/bin/env node

/**
 * @theyahia/CHANGEME-mcp — MCP server for CHANGEME API
 *
 * Tools: list_items
 * Auth: API Key (Bearer)
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "CHANGEME-mcp",
  version: "1.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
