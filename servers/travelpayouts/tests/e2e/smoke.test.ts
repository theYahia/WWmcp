import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");

describe("Travelpayouts MCP E2E Smoke Test", () => {
  it("starts and lists 3 tools", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 13,
      env: { TRAVELPAYOUTS_TOKEN: "test" },
    });

    expect(result.connected).toBe(true);
    expect(result.toolCount).toBe(13);
    expect(result.errors).toHaveLength(0);
  }, 15_000);

  it("all tools have quality descriptions (20+ chars)", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 13,
      env: { TRAVELPAYOUTS_TOKEN: "test" },
    });

    for (const tool of result.tools) {
      expect(tool.descriptionLength).toBeGreaterThanOrEqual(20);
      expect(tool.hasInputSchema).toBe(true);
    }
  }, 15_000);

  it("has expected tool names", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 13,
      env: { TRAVELPAYOUTS_TOKEN: "test" },
    });

    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "get_airline_directions",
      "get_calendar_prices",
      "get_cheapest_month",
      "get_direct_routes",
      "get_hotel_prices",
      "get_nearest_prices",
      "get_popular_directions",
      "get_special_offers",
      "lookup_airlines",
      "lookup_airports",
      "lookup_cities",
      "search_flights_prices",
      "search_hotels",
    ]);
  }, 15_000);
});
