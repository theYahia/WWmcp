import { z } from "zod";
import { getRateDynamics } from "../client.js";
import { isoDateRequired } from "./common.js";

export const getRateDynamicsSchema = z.object({
  currency_code: z.string().describe("Код валюты (например USD, EUR, CNY)"),
  from_date: isoDateRequired("Начало периода YYYY-MM-DD"),
  to_date: isoDateRequired("Конец периода YYYY-MM-DD"),
});

export async function handleGetRateDynamics(params: z.infer<typeof getRateDynamicsSchema>): Promise<string> {
  const { code, id, points } = await getRateDynamics(params.currency_code, params.from_date, params.to_date);

  if (points.length === 0) {
    return JSON.stringify(
      { message: `Нет данных по ${code} за период ${params.from_date}..${params.to_date}.` },
      null,
      2,
    );
  }

  const rates = points.map((p) => p.rate);
  const first = rates[0];
  const last = rates[rates.length - 1];
  const avg = +(rates.reduce((s, r) => s + r, 0) / rates.length).toFixed(4);

  return JSON.stringify(
    {
      currency: code,
      id,
      period: { from: params.from_date, to: params.to_date },
      summary: {
        points: points.length,
        first_rate: first,
        last_rate: last,
        min: Math.min(...rates),
        max: Math.max(...rates),
        avg,
        change: +(last - first).toFixed(4),
        change_percent: first === 0 ? null : +(((last - first) / first) * 100).toFixed(2),
      },
      series: points.map((p) => ({ date: p.date, rate: p.rate })),
    },
    null,
    2,
  );
}
