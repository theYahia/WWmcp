#!/usr/bin/env node

/**
 * @theyahia/paymongo-mcp — MCP server for PayMongo (Philippines)
 *
 * 24 tools: payment intents, sources, payments, refunds, checkout sessions,
 * payment links, webhooks, payment methods, customers.
 * Auth: PAYMONGO_SECRET_KEY (Basic Auth). Live-key guard: PAYMONGO_ALLOW_LIVE.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT).
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, VERSION, logger } from "./server.js";

runServer(createServer, {
  name: "paymongo-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
