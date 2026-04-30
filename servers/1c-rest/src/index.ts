#!/usr/bin/env node

/**
 * @theyahia/1c-rest-mcp — MCP server for 1C:Enterprise REST/OData API
 *
 * 9 tools split into modules: meta (always on), catalogs, documents, registers,
 * reports, odata. Use ONEC_SERVICES env var to limit registered tools.
 *
 * Auth: HTTP Basic (ONEC_LOGIN / ONEC_PASSWORD) — backward-compat aliases 1C_*.
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import {
  createServer,
  countRegisteredTools,
  getEnabledModules,
  logger,
} from "./server.js";

runServer(createServer, {
  name: "1c-rest-mcp",
  version: "2.0.0",
  toolCount: countRegisteredTools(getEnabledModules()),
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
