#!/usr/bin/env node

/**
 * @theyahia/planfix-mcp — MCP server for Planfix
 *
 * 20 tools + 2 MCP prompts: tasks, contacts, projects, comments, users,
 * directories, custom fields, datatags, files.
 *
 * Auth: PLANFIX_ACCOUNT (subdomain) + PLANFIX_API_KEY (or legacy PLANFIX_TOKEN).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — `--http` flag or HTTP_PORT env (3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createPlanfixServer, TOOL_COUNT, VERSION, logger } from "./server.js";

runServer(createPlanfixServer, {
  name: "planfix-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
