import { z } from "zod";
import { tpGet } from "../client.js";

// --- search_flights_prices (was: search_flights) ---

export const searchFlightsPricesSchema = z.object({
  origin: z.string().describe("IATA код города отправления (напр. MOW)"),
  destination: z.string().describe("IATA код города назначения (напр. LED)"),
  departure_at: z.string().optional().describe("Дата вылета (YYYY-MM или YYYY-MM-DD)"),
  return_at: z.string().optional().describe("Дата возврата (YYYY-MM или YYYY-MM-DD) для round-trip"),
  one_way: z.boolean().default(true).describe("Только в одну сторону"),
  currency: z.string().default("rub").describe("Валюта цен (rub, usd, eur)"),
  limit: z.number().int().min(1).max(30).default(10).describe("Количество результатов"),
});

export async function handleSearchFlightsPrices(
  params: z.infer<typeof searchFlightsPricesSchema>
): Promise<string> {
  const q = new URLSearchParams();
  q.set("origin", params.origin);
  q.set("destination", params.destination);
  if (params.departure_at) q.set("departure_at", params.departure_at);
  if (params.return_at) q.set("return_at", params.return_at);
  q.set("one_way", String(params.one_way));
  q.set("currency", params.currency);
  q.set("limit", String(params.limit));
  const result = await tpGet(`/aviasales/v3/prices_for_dates?${q.toString()}`);
  return JSON.stringify(result, null, 2);
}

// --- get_cheapest_month ---

export const getCheapestMonthSchema = z.object({
  origin: z.string().describe("IATA код города отправления"),
  destination: z.string().describe("IATA код города назначения"),
  month: z.string().describe("Месяц для поиска (YYYY-MM)"),
  currency: z.string().default("rub").describe("Валюта цен"),
});

export async function handleGetCheapestMonth(
  params: z.infer<typeof getCheapestMonthSchema>
): Promise<string> {
  const q = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    month: params.month,
    currency: params.currency,
  });
  const result = await tpGet(`/aviasales/v3/prices_for_dates?${q.toString()}&group_by=month`);
  return JSON.stringify(result, null, 2);
}

// --- get_calendar_prices (was: get_prices_calendar) ---

export const getCalendarPricesSchema = z.object({
  origin: z.string().describe("IATA код города отправления"),
  destination: z.string().describe("IATA код города назначения"),
  currency: z.string().default("rub").describe("Валюта цен"),
});

export async function handleGetCalendarPrices(
  params: z.infer<typeof getCalendarPricesSchema>
): Promise<string> {
  const result = await tpGet(
    `/aviasales/v3/calendar?origin=${params.origin}&destination=${params.destination}&currency=${params.currency}`
  );
  return JSON.stringify(result, null, 2);
}

// --- get_popular_directions (was: get_popular_routes) ---

export const getPopularDirectionsSchema = z.object({
  origin: z.string().describe("IATA код города для поиска популярных направлений"),
  currency: z.string().default("rub").describe("Валюта цен"),
});

export async function handleGetPopularDirections(
  params: z.infer<typeof getPopularDirectionsSchema>
): Promise<string> {
  const result = await tpGet(
    `/aviasales/v3/get_special_offers?origin=${params.origin}&currency=${params.currency}`
  );
  return JSON.stringify(result, null, 2);
}

// --- get_airline_directions ---

export const getAirlineDirectionsSchema = z.object({
  airline_code: z.string().describe("IATA код авиакомпании (напр. SU для Аэрофлота)"),
  limit: z.number().int().min(1).max(100).default(30).describe("Количество направлений"),
});

export async function handleGetAirlineDirections(
  params: z.infer<typeof getAirlineDirectionsSchema>
): Promise<string> {
  const result = await tpGet(
    `/aviasales/v3/airline-directions?airline_code=${params.airline_code}&limit=${params.limit}`
  );
  return JSON.stringify(result, null, 2);
}

// --- get_special_offers ---

export const getSpecialOffersSchema = z.object({
  origin: z.string().optional()
    .describe("IATA код города отправления (не указан — предложения по всем направлениям)"),
  currency: z.string().default("rub").describe("Валюта цен"),
  locale: z.string().default("ru").describe("Язык результатов (ru, en)"),
});

export async function handleGetSpecialOffers(
  params: z.infer<typeof getSpecialOffersSchema>
): Promise<string> {
  const q = new URLSearchParams({
    currency: params.currency,
    locale: params.locale,
  });
  if (params.origin) q.set("origin", params.origin);
  const result = await tpGet(`/aviasales/v3/get_special_offers?${q.toString()}`);
  return JSON.stringify(result, null, 2);
}

// --- get_direct_routes (NEW) ---

export const getDirectRoutesSchema = z.object({
  origin: z.string().describe("IATA код города отправления"),
  destination: z.string().describe("IATA код города назначения"),
  departure_at: z.string().optional().describe("Дата вылета (YYYY-MM или YYYY-MM-DD)"),
  currency: z.string().default("rub").describe("Валюта цен"),
  limit: z.number().int().min(1).max(30).default(10).describe("Количество результатов"),
});

export async function handleGetDirectRoutes(
  params: z.infer<typeof getDirectRoutesSchema>
): Promise<string> {
  const q = new URLSearchParams();
  q.set("origin", params.origin);
  q.set("destination", params.destination);
  q.set("direct", "true");
  q.set("currency", params.currency);
  q.set("limit", String(params.limit));
  if (params.departure_at) q.set("departure_at", params.departure_at);
  const result = await tpGet(`/aviasales/v3/prices_for_dates?${q.toString()}`);
  return JSON.stringify(result, null, 2);
}

// --- get_nearest_prices (NEW) ---

export const getNearestPricesSchema = z.object({
  origin: z.string().describe("IATA код города отправления"),
  destination: z.string().describe("IATA код города назначения"),
  departure_at: z.string().describe("Центральная дата (YYYY-MM-DD)"),
  range_days: z.number().int().min(1).max(7).default(3)
    .describe("Диапазон дней в обе стороны (напр. 3 = ±3 дня)"),
  currency: z.string().default("rub").describe("Валюта цен"),
});

export async function handleGetNearestPrices(
  params: z.infer<typeof getNearestPricesSchema>
): Promise<string> {
  const baseDate = new Date(params.departure_at);
  const promises: Promise<unknown>[] = [];
  const dates: string[] = [];

  for (let d = -params.range_days; d <= params.range_days; d++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    dates.push(dateStr);
    const q = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      departure_at: dateStr,
      currency: params.currency,
      limit: "3",
    });
    promises.push(tpGet(`/aviasales/v3/prices_for_dates?${q.toString()}`));
  }

  const results = await Promise.allSettled(promises);
  const merged = dates.map((date, i) => ({
    date,
    data: results[i].status === "fulfilled" ? (results[i] as PromiseFulfilledResult<unknown>).value : null,
  }));

  return JSON.stringify(merged, null, 2);
}

// --- Legacy aliases (backward compat with old tool names in index.ts) ---
export const searchFlightsSchema = searchFlightsPricesSchema;
export const handleSearchFlights = handleSearchFlightsPrices;
export const getPopularSchema = getPopularDirectionsSchema;
export const handleGetPopular = handleGetPopularDirections;
export const getCalendarSchema = getCalendarPricesSchema;
export const handleGetCalendar = handleGetCalendarPrices;
