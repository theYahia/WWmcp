#!/usr/bin/env node

/**
 * @theyahia/superjob-mcp — MCP server for the SuperJob.ru API (Russia)
 *
 * 5 tools: search_vacancies, get_vacancy, search_employers, get_towns,
 * get_professions.
 * Auth: SUPERJOB_SECRET_KEY (or legacy SUPERJOB_API_KEY), optional SUPERJOB_APP_ID.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, VERSION, logger } from "./server.js";

// 1.1.x exported createServer from the entry point — kept.
export { createServer };

runServer(createServer, {
  name: "superjob-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
