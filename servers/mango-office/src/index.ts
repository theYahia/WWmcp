#!/usr/bin/env node

/**
 * @theyahia/mango-office-mcp — MCP server for Mango Office VPBX API
 *
 * 8 tools: get_calls, get_users, make_call, get_stats, get_recording,
 * send_sms + skill_call_history, skill_stats.
 *
 * Auth: HMAC-SHA256 over the JSON body (MANGO_API_KEY / MANGO_API_SALT).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, logger, TOOL_COUNT, VERSION } from "./server.js";

runServer(createServer, {
  name: "mango-office-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
