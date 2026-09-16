#!/usr/bin/env node

/**
 * @theyahia/sendpulse-mcp — MCP server for SendPulse (email campaigns, SMTP, web push)
 *
 * 11 tools, see ./server.ts.
 * Auth: SENDPULSE_ID + SENDPULSE_SECRET (OAuth2 client credentials).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT).
 */

import { runServer } from "@theyahia/mcp-core";
import { createMcpServer, TOOL_COUNT, VERSION, logger } from "./server.js";

runServer(createMcpServer, {
  name: "sendpulse-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
