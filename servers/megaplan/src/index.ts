#!/usr/bin/env node

/**
 * @theyahia/megaplan-mcp — MCP server for Megaplan project management
 *
 * 8 tools + 2 MCP prompts for tasks, deals, projects, employees, comments.
 *
 * Auth: Bearer token (MEGAPLAN_TOKEN) OR Password grant (MEGAPLAN_LOGIN + MEGAPLAN_PASSWORD).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "megaplan-mcp",
  version: "2.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
