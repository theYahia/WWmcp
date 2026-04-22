import type { UzRate } from "./types.js";

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatRate(rate: UzRate): string {
  const nominal = parseInt(rate.Nominal, 10);
  const rateVal = parseFloat(rate.Rate);
  const diff = parseFloat(rate.Diff);
  const direction = diff > 0 ? "+" : diff < 0 ? "" : "=";
  const nominalPart = nominal !== 1 ? ` (${nominal} units)` : "";

  return `${rate.Ccy} -- ${rate.CcyNm_EN}: ${formatNumber(rateVal)} UZS${nominalPart} [${direction}${formatNumber(diff)}] (${rate.Date})`;
}
