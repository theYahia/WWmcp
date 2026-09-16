#!/usr/bin/env node

/**
 * @theyahia/megaplan-mcp — MCP server for Megaplan (Мегаплан) API v3
 *
 * 18 tools + 2 MCP prompts: tasks, deals, projects, employees, deal programs
 * (pipelines), CRM clients, current user, comments.
 *
 * Auth: Bearer token (MEGAPLAN_TOKEN) OR Password grant (MEGAPLAN_LOGIN + MEGAPLAN_PASSWORD).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, VERSION, logger } from "./server.js";

runServer(createServer, {
  name: "megaplan-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
