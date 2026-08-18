import { describe, it, expect, vi } from "vitest";

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn(),
}));

vi.spyOn(process, "exit").mockImplementation((() => {}) as any);

describe("server smoke test", () => {
  it("registers exactly 11 tools", async () => {
    const { server } = await import("../src/index.js");
    const s = server as any;
    expect(s._registeredTools).toBeDefined();
    const toolNames = Object.keys(s._registeredTools);
    expect(toolNames.length).toBe(11);
    const expected = [
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
    ];
    for (const n of expected) {
      expect(toolNames).toContain(n);
    }
  });
});
