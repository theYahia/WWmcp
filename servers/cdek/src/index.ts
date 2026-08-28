#!/usr/bin/env node

/**
 * @theyahia/cdek-mcp — runtime entry point.
 *
 * Thin wrapper: builds the server via the pure factory in `server.ts` and starts
 * the selected transport (stdio by default, Streamable HTTP via --http or HTTP_PORT).
 * All tool registration lives in `server.ts` so it can be imported side-effect-free.
 */

import { createLogger, runServer } from "@theyahia/mcp-core";
import { createServer, SERVER_NAME, SERVER_VERSION, TOOL_COUNT } from "./server.js";

const logger = createLogger(SERVER_NAME);

runServer(createServer, {
  name: SERVER_NAME,
  version: SERVER_VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
