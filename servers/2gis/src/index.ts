#!/usr/bin/env node

/**
 * @theyahia/2gis-mcp — MCP server for 2GIS API (Russia and CIS)
 *
 * 8 tools: search_places, get_place, search_by_rubric, geocode, reverse_geocode,
 * get_directions, suggest, get_reviews.
 *
 * Auth: API key in query param (`key=`) — TWOGIS_API_KEY env var.
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

// Validate API key early — fail fast with a helpful message instead of
// surfacing it as an error on the first tool call.
if (!process.env["TWOGIS_API_KEY"]) {
  logger.error(
    "TWOGIS_API_KEY is required. Get your key at https://dev.2gis.com/ and set it via your MCP client env config.",
  );
  process.exit(1);
}

runServer(createServer, {
  name: "2gis-mcp",
  version: "2.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
