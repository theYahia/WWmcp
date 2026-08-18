import { z } from "zod";
import { getDailyRates } from "../client.js";
import { isoDateOptional } from "./common.js";
import type { CbrCurrency, CurrencyRate, DailyRatesResult } from "../types.js";

function toCurrencyRate(v: CbrCurrency, date: string): CurrencyRate {
  return {
    code: v.CharCode,
    name: v.Name,
    nominal: v.Nominal,
    rate: v.Value,
    previous_rate: v.Previous,
    change: +(v.Value - v.Previous).toFixed(4),
    change_percent: v.Previous === 0 ? null : +(((v.Value - v.Previous) / v.Previous) * 100).toFixed(2),
    date,
  };
}

/** Метаданные источника/подмены даты для включения в вывод. */
function meta(data: DailyRatesResult): Record<string, unknown> {
  const m: Record<string, unknown> = { source: data.source };
  if (data.requested_date) m.requested_date = data.requested_date;
  if (data.note) m.note = data.note;
  return m;
}

export const getDailyRatesSchema = z.object({
  date: isoDateOptional("Дата в формате YYYY-MM-DD (по умолчанию сегодня)"),
});

export async function handleGetDailyRates(params: z.infer<typeof getDailyRatesSchema>): Promise<string> {
  const data = await getDailyRates(params.date);
  const rates: CurrencyRate[] = Object.values(data.Valute).map((v) => toCurrencyRate(v, data.Date));
  return JSON.stringify({ date: data.Date, ...meta(data), count: rates.length, rates }, null, 2);
}

export const getCurrencyRateSchema = z.object({
  currency_code: z.string().describe("Код валюты (например USD, EUR, CNY)"),
  date: isoDateOptional("Дата в формате YYYY-MM-DD (по умолчанию сегодня)"),
});

export async function handleGetCurrencyRate(params: z.infer<typeof getCurrencyRateSchema>): Promise<string> {
  const data = await getDailyRates(params.date);
  const code = params.currency_code.toUpperCase();
  const currency = Object.values(data.Valute).find((v) => v.CharCode === code);

  if (!currency) {
    const available = Object.values(data.Valute)
      .map((v) => v.CharCode)
      .join(", ");
    throw new Error(`Валюта ${code} не найдена. Доступные: ${available}`);
  }

  return JSON.stringify({ ...toCurrencyRate(currency, data.Date), ...meta(data) }, null, 2);
}
