import { z } from "zod";
import { getDailyRates } from "../client.js";
import type { ConversionResult } from "../types.js";

export const convertCurrencySchema = z.object({
  amount: z.number().positive().describe("Сумма для конвертации"),
  from_currency: z
    .string()
    .describe("Код исходной валюты (например USD, EUR, CNY, RUB)"),
  to_currency: z
    .string()
    .default("RUB")
    .describe("Код целевой валюты (по умолчанию RUB)"),
  date: z
    .string()
    .optional()
    .describe("Дата курса в формате YYYY-MM-DD (по умолчанию сегодня)"),
});

export async function handleConvertCurrency(
  params: z.infer<typeof convertCurrencySchema>,
): Promise<string> {
  const data = await getDailyRates(params.date);
  const from = params.from_currency.toUpperCase();
  const to = params.to_currency.toUpperCase();

  const getRateInRub = (code: string): number => {
    if (code === "RUB") return 1;
    const currency = Object.values(data.Valute).find(
      (v) => v.CharCode === code,
    );
    if (!currency) {
      const available = Object.values(data.Valute)
        .map((v) => v.CharCode)
        .join(", ");
      throw new Error(
        `Валюта ${code} не найдена. Доступные: RUB, ${available}`,
      );
    }
    return currency.Value / currency.Nominal;
  };

  const fromRate = getRateInRub(from);
  const toRate = getRateInRub(to);
  const result = (params.amount * fromRate) / toRate;

  const conversion: ConversionResult = {
    amount: params.amount,
    from,
    to,
    result: +result.toFixed(4),
    from_rate: +fromRate.toFixed(4),
    to_rate: +toRate.toFixed(4),
    date: data.Date,
  };

  return JSON.stringify(conversion, null, 2);
}
