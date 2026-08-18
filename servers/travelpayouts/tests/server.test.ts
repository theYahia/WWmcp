import { describe, it, expect } from "vitest";
import { createServer, TOOL_COUNT } from "../src/server.js";

const EXPECTED_TOOLS = [
  "search_flights_prices",
  "get_cheapest_month",
  "get_calendar_prices",
  "get_popular_directions",
  "get_airline_directions",
  "get_special_offers",
  "search_hotels",
  "get_hotel_prices",
  "lookup_airports",
  "lookup_airlines",
  "lookup_cities",
  "get_direct_routes",
  "get_nearest_prices",
];

describe("travelpayouts server factory", () => {
  it("createServer returns a connectable McpServer", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("TOOL_COUNT is 13", () => {
    expect(TOOL_COUNT).toBe(13);
    expect(EXPECTED_TOOLS).toHaveLength(TOOL_COUNT);
  });

  it("registers every documented tool", () => {
    const registered = Object.keys(
      (createServer() as unknown as { _registeredTools: Record<string, unknown> })
        ._registeredTools,
    );
    expect(registered.sort()).toEqual([...EXPECTED_TOOLS].sort());
  });
});
