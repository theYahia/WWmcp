import { z } from "zod";
import { tpGet } from "../client.js";

export const searchHotelsSchema = z.object({
  location: z.string().describe("Название города или курорта (напр. Moscow, Сочи)"),
  check_in: z.string().describe("Дата заезда (YYYY-MM-DD)"),
  check_out: z.string().describe("Дата выезда (YYYY-MM-DD)"),
  adults: z.number().int().min(1).max(9).default(2).describe("Количество взрослых"),
  children: z.number().int().min(0).max(4).default(0).describe("Количество детей"),
  currency: z.string().default("rub").describe("Валюта цен"),
  limit: z.number().int().min(1).max(50).default(10).describe("Количество результатов"),
});

export const getHotelPricesSchema = z.object({
  hotel_id: z.number().describe("ID отеля в Hotellook"),
  check_in: z.string().describe("Дата заезда (YYYY-MM-DD)"),
  check_out: z.string().describe("Дата выезда (YYYY-MM-DD)"),
  adults: z.number().int().min(1).max(9).default(2).describe("Количество взрослых"),
  currency: z.string().default("rub").describe("Валюта цен"),
});

export async function handleSearchHotels(
  params: z.infer<typeof searchHotelsSchema>
): Promise<string> {
  const q = new URLSearchParams({
    location: params.location,
    checkIn: params.check_in,
    checkOut: params.check_out,
    adults: String(params.adults),
    children: String(params.children),
    currency: params.currency,
    limit: String(params.limit),
    language: "ru",
  });
  const result = await tpGet(`/cache.json?${q.toString()}`, true);
  return JSON.stringify(result, null, 2);
}

export async function handleGetHotelPrices(
  params: z.infer<typeof getHotelPricesSchema>
): Promise<string> {
  const q = new URLSearchParams({
    id: String(params.hotel_id),
    checkIn: params.check_in,
    checkOut: params.check_out,
    adults: String(params.adults),
    currency: params.currency,
    language: "ru",
  });
  const result = await tpGet(`/cache.json?${q.toString()}`, true);
  return JSON.stringify(result, null, 2);
}
