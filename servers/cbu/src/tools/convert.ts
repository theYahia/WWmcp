import { z } from "zod";
import { fetchRates } from "../client.js";
import { formatNumber } from "../format.js";

export const convertCurrencySchema = z.object({
  amount: z.number().positive().describe("Amount to convert"),
  from_currency: z.string().describe("Source currency code, e.g. USD, EUR, RUB"),
  to_currency: z.string().default("UZS").describe("Target currency code (default: UZS)"),
  date: z.string().optional().describe("Date in YYYY-MM-DD format (optional)"),
});

export async function handleConvertCurrency(params: z.infer<typeof convertCurrencySchema>): Promise<string> {
  const from = params.from_currency.toUpperCase();
  const to = params.to_currency.toUpperCase();

  const fromRates = await fetchRates(params.date, from === "UZS" ? undefined : from);
  const fromRate = from === "UZS" ? null : fromRates.find(r => r.Ccy.toUpperCase() === from);

  if (from !== "UZS" && !fromRate) {
    return `Currency ${from} not found.`;
  }

  let amountInUzs: number;
  if (from === "UZS") {
    amountInUzs = params.amount;
  } else {
    const nominal = parseInt(fromRate!.Nominal, 10);
    const rate = parseFloat(fromRate!.Rate);
    amountInUzs = (params.amount / nominal) * rate;
  }

  let result: number;
  let resultCurrency: string;

  if (to === "UZS") {
    result = amountInUzs;
    resultCurrency = "UZS";
  } else {
    const toRates = await fetchRates(params.date, to);
    const toRate = toRates.find(r => r.Ccy.toUpperCase() === to);
    if (!toRate) return `Currency ${to} not found.`;
    const nominal = parseInt(toRate.Nominal, 10);
    const rate = parseFloat(toRate.Rate);
    result = (amountInUzs / rate) * nominal;
    resultCurrency = to;
  }

  return `${formatNumber(params.amount)} ${from} = ${formatNumber(result)} ${resultCurrency}${params.date ? ` (rate on ${params.date})` : ""}`;
}

export const getRateDynamicsSchema = z.object({
  currency_code: z.string().describe("Currency code, e.g. USD, EUR, RUB"),
});

export async function handleGetRateDynamics(params: z.infer<typeof getRateDynamicsSchema>): Promise<string> {
  const code = params.currency_code.toUpperCase();
  const rates = await fetchRates(undefined, code);
  const rate = rates.find(r => r.Ccy.toUpperCase() === code);

  if (!rate) return `Currency ${code} not found.`;

  const diff = parseFloat(rate.Diff);
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "unchanged";
  const rateVal = parseFloat(rate.Rate);

  return JSON.stringify({
    code: rate.Ccy,
    name: rate.CcyNm_EN,
    rate: formatNumber(rateVal),
    nominal: rate.Nominal,
    diff: formatNumber(diff),
    direction,
    date: rate.Date,
  }, null, 2);
}
