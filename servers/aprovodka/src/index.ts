#!/usr/bin/env node

/**
 * @theyahia/aprovodka — MCP server for 1C:Enterprise REST/OData API
 *
 * 34 tools across 11 modules: meta (always on), catalogs, documents, registers,
 * accounting, constants, shortcuts, batch, changes, reports, odata. Use
 * ONEC_SERVICES env var to limit which optional modules register.
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
  name: "aprovodka",
  version: VERSION,
  toolCount: countRegisteredTools(getEnabledModules()),
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
