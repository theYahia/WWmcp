import { z } from "zod";
import { fetchRates } from "../client.js";
import { formatRate } from "../format.js";

export const getAllRatesSchema = z.object({});

export async function handleGetAllRates(): Promise<string> {
  const rates = await fetchRates();
  if (!rates.length) return "No rates available.";
  return rates.map(formatRate).join("\n");
}

export const getCurrencyRateSchema = z.object({
  currency_code: z.string().describe("Currency code, e.g. USD, EUR, RUB, GBP"),
  date: z.string().optional().describe("Date in YYYY-MM-DD format (optional, defaults to today)"),
});

export async function handleGetCurrencyRate(params: z.infer<typeof getCurrencyRateSchema>): Promise<string> {
  const rates = await fetchRates(params.date, params.currency_code);
  if (!rates.length) {
    return `No rate found for ${params.currency_code.toUpperCase()}${params.date ? ` on ${params.date}` : ""}.`;
  }
  return rates.map(formatRate).join("\n");
}

export const getHistoricalRatesSchema = z.object({
  date: z.string().describe("Date in YYYY-MM-DD format"),
});

export async function handleGetHistoricalRates(params: z.infer<typeof getHistoricalRatesSchema>): Promise<string> {
  const rates = await fetchRates(params.date);
  if (!rates.length) return `No rates available for ${params.date}.`;
  return `Rates for ${params.date}:\n${rates.map(formatRate).join("\n")}`;
}
