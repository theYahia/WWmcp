import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

process.env.TRAVELPAYOUTS_TOKEN = "test-token-123";

function mockFetch(body: unknown, status = 200) {
  return vi.fn(async () => ({
    ok: status === 200,
    status,
    headers: new Headers(),
    json: async () => body,
    text: async () => JSON.stringify(body),
  }));
}

function mockFetchSequence(responses: Array<{ status: number; body: unknown }>) {
  let callIndex = 0;
  return vi.fn(async () => {
    const resp = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return {
      ok: resp.status === 200,
      status: resp.status,
      headers: new Headers(),
      json: async () => resp.body,
      text: async () => JSON.stringify(resp.body),
    };
  });
}

describe("Travelpayouts MCP Server", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.resetModules();
  });

  it("search_flights_prices returns flight data", async () => {
    const mockData = {
      success: true,
      data: [
        { origin: "MOW", destination: "LED", price: 3500, airline: "SU", departure_at: "2025-03-15", transfers: 0, duration: 90 },
      ],
    };
    globalThis.fetch = mockFetch(mockData);

    const { handleSearchFlightsPrices } = await import("../src/tools/flights.js");
    const result = await handleSearchFlightsPrices({
      origin: "MOW",
      destination: "LED",
      one_way: true,
      currency: "rub",
      limit: 10,
    });

    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.data[0].price).toBe(3500);
  });

  it("get_cheapest_month returns sorted prices", async () => {
    const mockData = {
      success: true,
      data: [
        { origin: "MOW", destination: "LED", price: 2800, departure_at: "2025-03-05" },
        { origin: "MOW", destination: "LED", price: 3200, departure_at: "2025-03-12" },
      ],
    };
    globalThis.fetch = mockFetch(mockData);

    const { handleGetCheapestMonth } = await import("../src/tools/flights.js");
    const result = await handleGetCheapestMonth({
      origin: "MOW",
      destination: "LED",
      month: "2025-03",
      currency: "rub",
    });

    const parsed = JSON.parse(result);
    expect(parsed.data).toHaveLength(2);
    expect(parsed.data[0].price).toBe(2800);
  });

  it("get_calendar_prices returns calendar data", async () => {
    const mockData = {
      success: true,
      data: { "2025-03-01": { price: 3000, airline: "SU" } },
    };
    globalThis.fetch = mockFetch(mockData);

    const { handleGetCalendarPrices } = await import("../src/tools/flights.js");
    const result = await handleGetCalendarPrices({
      origin: "MOW",
      destination: "LED",
      currency: "rub",
    });

    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
  });

  it("get_popular_directions returns offers", async () => {
    const mockData = {
      success: true,
      data: [
        { origin: "MOW", destination: "IST", price: 12000, airline: "TK" },
      ],
    };
    globalThis.fetch = mockFetch(mockData);

    const { handleGetPopularDirections } = await import("../src/tools/flights.js");
    const result = await handleGetPopularDirections({ origin: "MOW", currency: "rub" });

    const parsed = JSON.parse(result);
    expect(parsed.data[0].destination).toBe("IST");
  });

  it("get_airline_directions returns routes", async () => {
    const mockData = {
      success: true,
      data: [
        { origin: "MOW", destination: "LED", price: 3500, airline: "SU" },
      ],
    };
    globalThis.fetch = mockFetch(mockData);

    const { handleGetAirlineDirections } = await import("../src/tools/flights.js");
    const result = await handleGetAirlineDirections({ airline_code: "SU", limit: 30 });
    const parsed = JSON.parse(result);
    expect(parsed.data[0].airline).toBe("SU");
  });

  it("get_special_offers returns deals", async () => {
    const mockData = {
      success: true,
      data: [
        { origin: "MOW", destination: "DXB", price: 18000 },
      ],
    };
    globalThis.fetch = mockFetch(mockData);

    const { handleGetSpecialOffers } = await import("../src/tools/flights.js");
    const result = await handleGetSpecialOffers({ currency: "rub", locale: "ru" });
    const parsed = JSON.parse(result);
    expect(parsed.data[0].price).toBe(18000);
  });

  it("search_hotels returns hotel data", async () => {
    const mockData = [
      { hotel_id: 1, hotel_name: "Test Hotel", price_from: 5000, stars: 4 },
    ];
    globalThis.fetch = mockFetch(mockData);

    const { handleSearchHotels } = await import("../src/tools/hotels.js");
    const result = await handleSearchHotels({
      location: "MOW",
      check_in: "2025-04-01",
      check_out: "2025-04-05",
      adults: 2,
      currency: "rub",
      limit: 15,
    });

    const parsed = JSON.parse(result);
    expect(parsed[0].hotel_name).toBe("Test Hotel");
  });

  it("get_hotel_prices returns price details", async () => {
    const mockData = [
      { hotel_id: 1, price_from: 4500, price_avg: 5200 },
    ];
    globalThis.fetch = mockFetch(mockData);

    const { handleGetHotelPrices } = await import("../src/tools/hotels.js");
    const result = await handleGetHotelPrices({
      hotel_id: 1,
      check_in: "2025-04-01",
      check_out: "2025-04-05",
      adults: 2,
      currency: "rub",
    });

    const parsed = JSON.parse(result);
    expect(parsed[0].price_from).toBe(4500);
  });

  it("lookup_airports returns autocomplete results", async () => {
    const mockData = [
      { code: "SVO", name: "Шереметьево", city_name: "Москва", country_code: "RU", type: "airport" },
    ];
    globalThis.fetch = mockFetch(mockData);

    const { handleLookupAirports } = await import("../src/tools/lookup.js");
    const result = await handleLookupAirports({ query: "SVO", locale: "ru" });
    const parsed = JSON.parse(result);
    expect(parsed[0].code).toBe("SVO");
  });

  it("lookup_airlines filters by query", async () => {
    const mockData = [
      { name: "Aeroflot", iata: "SU", icao: "AFL", is_lowcost: false },
      { name: "S7 Airlines", iata: "S7", icao: "SBI", is_lowcost: false },
      { name: "Pobeda", iata: "DP", icao: "PBD", is_lowcost: true },
    ];
    globalThis.fetch = mockFetch(mockData);

    const { handleLookupAirlines } = await import("../src/tools/lookup.js");
    const result = await handleLookupAirlines({ query: "aeroflot" });
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].iata).toBe("SU");
  });

  it("lookup_cities returns city matches", async () => {
    const mockData = [
      { code: "MOW", name: "Москва", country_code: "RU", type: "city" },
    ];
    globalThis.fetch = mockFetch(mockData);

    const { handleLookupCities } = await import("../src/tools/lookup.js");
    const result = await handleLookupCities({ query: "Москва", locale: "ru" });
    const parsed = JSON.parse(result);
    expect(parsed[0].code).toBe("MOW");
  });

  it("client retries on 429 rate limit", async () => {
    globalThis.fetch = mockFetchSequence([
      { status: 429, body: { error: "rate_limit" } },
      { status: 200, body: { success: true, data: [] } },
    ]);

    const { handleGetSpecialOffers } = await import("../src/tools/flights.js");
    const result = await handleGetSpecialOffers({ currency: "rub", locale: "ru" });
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
  });

  it("client throws on auth error", async () => {
    globalThis.fetch = mockFetch({ error: "forbidden" }, 403);

    const { handleGetPopularDirections } = await import("../src/tools/flights.js");
    await expect(handleGetPopularDirections({ origin: "MOW", currency: "rub" }))
      .rejects.toThrow("authentication error");
  });

  it("client retries on 500 server error", async () => {
    globalThis.fetch = mockFetchSequence([
      { status: 500, body: { error: "internal" } },
      { status: 200, body: { success: true, data: [{ price: 1000 }] } },
    ]);

    const { handleSearchFlightsPrices } = await import("../src/tools/flights.js");
    const result = await handleSearchFlightsPrices({
      origin: "MOW",
      destination: "LED",
      one_way: true,
      currency: "rub",
      limit: 5,
    });

    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
  });
});
