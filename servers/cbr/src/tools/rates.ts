import { z } from "zod";
import { getDailyRates } from "../client.js";
import type { CurrencyRate } from "../types.js";

export const getDailyRatesSchema = z.object({
  date: z
    .string()
    .optional()
    .describe("Дата в формате YYYY-MM-DD (по умолчанию сегодня)"),
});

export async function handleGetDailyRates(
  params: z.infer<typeof getDailyRatesSchema>,
): Promise<string> {
  const data = await getDailyRates(params.date);
  const rates: CurrencyRate[] = Object.values(data.Valute).map((v) => ({
    code: v.CharCode,
    name: v.Name,
    nominal: v.Nominal,
    rate: v.Value,
    previous_rate: v.Previous,
    change: +(v.Value - v.Previous).toFixed(4),
    change_percent: +(((v.Value - v.Previous) / v.Previous) * 100).toFixed(2),
    date: data.Date,
  }));

  return JSON.stringify(
    { date: data.Date, count: rates.length, rates },
    null,
    2,
  );
}

export const getCurrencyRateSchema = z.object({
  currency_code: z
    .string()
    .describe("Код валюты (например USD, EUR, CNY)"),
  date: z
    .string()
    .optional()
    .describe("Дата в формате YYYY-MM-DD (по умолчанию сегодня)"),
});

export async function handleGetCurrencyRate(
  params: z.infer<typeof getCurrencyRateSchema>,
): Promise<string> {
  const data = await getDailyRates(params.date);
  const code = params.currency_code.toUpperCase();
  const currency = Object.values(data.Valute).find(
    (v) => v.CharCode === code,
  );

  if (!currency) {
    const available = Object.values(data.Valute)
      .map((v) => v.CharCode)
      .join(", ");
    throw new Error(`Валюта ${code} не найдена. Доступные: ${available}`);
  }

  const result: CurrencyRate = {
    code: currency.CharCode,
    name: currency.Name,
    nominal: currency.Nominal,
    rate: currency.Value,
    previous_rate: currency.Previous,
    change: +(currency.Value - currency.Previous).toFixed(4),
    change_percent: +(
      ((currency.Value - currency.Previous) / currency.Previous) *
      100
    ).toFixed(2),
    date: data.Date,
  };

  return JSON.stringify(result, null, 2);
}
