#!/usr/bin/env node

/**
 * @theyahia/1c-rest-mcp — MCP server for 1C:Enterprise REST/OData API
 *
 * 26 tools across 9 modules: meta (always on), catalogs, documents, registers,
 * accounting, constants, shortcuts, reports, odata. Use ONEC_SERVICES env var
 * to limit which optional modules register.
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
  VERSION,
} from "./server.js";

runServer(createServer, {
  name: "1c-rest-mcp",
  version: VERSION,
  toolCount: countRegisteredTools(getEnabledModules()),
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
