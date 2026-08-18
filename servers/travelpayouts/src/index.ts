#!/usr/bin/env node

/**
 * @theyahia/travelpayouts-mcp — MCP server for Travelpayouts API
 *
 * 13 tools: search_flights_prices, get_cheapest_month, get_calendar_prices,
 * get_popular_directions, get_airline_directions, get_special_offers,
 * search_hotels, get_hotel_prices, lookup_airports, lookup_airlines, lookup_cities,
 * get_direct_routes, get_nearest_prices.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "travelpayouts-mcp",
  version: "2.1.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
