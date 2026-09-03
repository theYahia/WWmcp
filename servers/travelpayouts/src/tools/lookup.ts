import { z } from "zod";
import { tpGet } from "../client.js";

export const lookupAirportsSchema = z.object({
  query: z.string().describe("Название города, аэропорта или IATA-код (напр. Москва, SVO, Moscow)"),
  lang: z.string().default("ru").describe("Язык результатов (ru, en)"),
  limit: z.number().int().min(1).max(20).default(5).describe("Количество результатов"),
});

export const lookupAirlinesSchema = z.object({
  query: z.string().optional()
    .describe("Название или IATA/ICAO код авиакомпании (не указан — весь справочник)"),
  // Enum, not a free string: this value becomes a URL path segment in
  // handleLookupAirlines (`/data/${lang}/airlines.json`).
  lang: z.enum(["ru", "en"]).default("ru").describe("Язык названий авиакомпаний (ru, en)"),
});

export const lookupCitiesSchema = z.object({
  query: z.string().describe("Название города для поиска (напр. Москва, Moscow)"),
  lang: z.string().default("ru").describe("Язык результатов (ru, en)"),
  limit: z.number().int().min(1).max(20).default(5).describe("Количество результатов"),
});

export async function handleLookupAirports(
  params: z.infer<typeof lookupAirportsSchema>
): Promise<string> {
  const q = new URLSearchParams({
    term: params.query,
    lang: params.lang,
    limit: String(params.limit),
    types: "airport",
  });
  const result = await tpGet(`/aviasales/v3/autocomplete?${q.toString()}`);
  return JSON.stringify(result, null, 2);
}

export async function handleLookupAirlines(
  params: z.infer<typeof lookupAirlinesSchema>
): Promise<string> {
  const result = await tpGet(`/data/${params.lang ?? "ru"}/airlines.json`);
  if (!params.query || !Array.isArray(result)) {
    return JSON.stringify(result, null, 2);
  }
  // ponytail: substring match over the whole record covers name, IATA, ICAO and
  // localized names in one line — the reference feed's field names vary by lang.
  const needle = params.query.toLowerCase();
  const matches = result.filter((a) =>
    JSON.stringify(a).toLowerCase().includes(needle),
  );
  return JSON.stringify(matches, null, 2);
}

export async function handleLookupCities(
  params: z.infer<typeof lookupCitiesSchema>
): Promise<string> {
  const q = new URLSearchParams({
    term: params.query,
    lang: params.lang,
    limit: String(params.limit),
    types: "city",
  });
  const result = await tpGet(`/aviasales/v3/autocomplete?${q.toString()}`);
  return JSON.stringify(result, null, 2);
}
