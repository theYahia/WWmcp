/**
 * 2GIS MCP server factory.
 *
 * Note: 2GIS spans 4 different base URLs (catalog, routing, suggest, reviews)
 * and uses query-param API key auth. The `BaseHttpClient` + `AuthStrategy`
 * pattern from @theyahia/mcp-core models a single base URL with header auth,
 * so the existing native HTTP client (`src/client.ts`) is intentionally kept
 * as-is. mcp-core is used here only for the entry/transport layer
 * (createLogger, runServer) and tool error handling.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "@theyahia/mcp-core";
import { registerSearchTools } from "./tools/search.js";
import { registerGeocodingTools } from "./tools/geocoding.js";
import { registerDirectionsTools } from "./tools/directions.js";
import { registerReviewsTools } from "./tools/reviews.js";

export const logger = createLogger("2gis-mcp");

export const TOOL_COUNT = 8;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "2gis-mcp",
    version: "2.0.0",
  });

  registerSearchTools(server);       // search_places, get_place, search_by_rubric
  registerGeocodingTools(server);    // geocode, reverse_geocode
  registerDirectionsTools(server);   // get_directions, suggest
  registerReviewsTools(server);      // get_reviews

  return server;
}
