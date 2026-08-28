import { describe, it, expect, vi } from "vitest";

vi.mock("../src/client.js", () => ({
  tpGet: vi.fn(),
}));

import {
  searchFlightsPricesSchema,
  getCheapestMonthSchema,
  getCalendarPricesSchema,
  getPopularDirectionsSchema,
  getAirlineDirectionsSchema,
  getSpecialOffersSchema,
} from "../src/tools/flights.js";
import { searchHotelsSchema, getHotelPricesSchema } from "../src/tools/hotels.js";
import { lookupAirportsSchema, lookupAirlinesSchema, lookupCitiesSchema } from "../src/tools/lookup.js";

describe("searchFlightsPricesSchema", () => {
  it("accepts valid params", () => {
    const result = searchFlightsPricesSchema.safeParse({
      origin: "MOW",
      destination: "LED",
      departure_at: "2025-06",
    });
    expect(result.success).toBe(true);
  });

  it("requires origin and destination", () => {
    expect(searchFlightsPricesSchema.safeParse({}).success).toBe(false);
    expect(searchFlightsPricesSchema.safeParse({ origin: "MOW" }).success).toBe(false);
  });

  it("applies defaults", () => {
    const result = searchFlightsPricesSchema.parse({ origin: "MOW", destination: "LED" });
    expect(result.one_way).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.currency).toBe("rub");
  });
});

describe("getCheapestMonthSchema", () => {
  it("accepts valid params", () => {
    const result = getCheapestMonthSchema.safeParse({ origin: "MOW", destination: "LED", month: "2025-06" });
    expect(result.success).toBe(true);
  });

  it("requires all fields", () => {
    expect(getCheapestMonthSchema.safeParse({ origin: "MOW" }).success).toBe(false);
  });
});

describe("getCalendarPricesSchema", () => {
  it("accepts origin and destination", () => {
    const result = getCalendarPricesSchema.safeParse({ origin: "MOW", destination: "LED" });
    expect(result.success).toBe(true);
  });

  it("requires both fields", () => {
    expect(getCalendarPricesSchema.safeParse({ origin: "MOW" }).success).toBe(false);
  });
});

describe("getPopularDirectionsSchema", () => {
  it("accepts origin", () => {
    const result = getPopularDirectionsSchema.safeParse({ origin: "MOW" });
    expect(result.success).toBe(true);
  });
});

describe("getAirlineDirectionsSchema", () => {
  it("accepts airline_code", () => {
    const result = getAirlineDirectionsSchema.safeParse({ airline_code: "SU" });
    expect(result.success).toBe(true);
  });
});

describe("getSpecialOffersSchema", () => {
  it("applies defaults", () => {
    const result = getSpecialOffersSchema.parse({});
    expect(result.currency).toBe("rub");
    expect(result.locale).toBe("ru");
  });
});

describe("searchHotelsSchema", () => {
  it("accepts valid params", () => {
    const result = searchHotelsSchema.safeParse({
      location: "MOW",
      check_in: "2025-04-01",
      check_out: "2025-04-05",
    });
    expect(result.success).toBe(true);
  });

  it("requires location and dates", () => {
    expect(searchHotelsSchema.safeParse({}).success).toBe(false);
  });
});

describe("getHotelPricesSchema", () => {
  it("accepts hotel_id and dates", () => {
    const result = getHotelPricesSchema.safeParse({
      hotel_id: 123,
      check_in: "2025-04-01",
      check_out: "2025-04-05",
    });
    expect(result.success).toBe(true);
  });
});

describe("lookupAirportsSchema", () => {
  it("accepts query", () => {
    const result = lookupAirportsSchema.safeParse({ query: "SVO" });
    expect(result.success).toBe(true);
  });
});

describe("lookupAirlinesSchema", () => {
  it("accepts query", () => {
    const result = lookupAirlinesSchema.safeParse({ query: "Aeroflot" });
    expect(result.success).toBe(true);
  });
});

describe("lookupCitiesSchema", () => {
  it("accepts query", () => {
    const result = lookupCitiesSchema.safeParse({ query: "Moscow" });
    expect(result.success).toBe(true);
  });
});
