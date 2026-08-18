import { z } from "zod";
import { getClient } from "../client.js";
import type { RoistatAnalyticsResponse } from "../types.js";

export const getAnalyticsSchema = z.object({
  from: z.string().describe("Дата начала периода (YYYY-MM-DD)"),
  to: z.string().describe("Дата конца периода (YYYY-MM-DD)"),
  metrics: z
    .array(z.string())
    .default(["visitCount", "visits2leads", "leadCount", "visits2orders", "orderCount", "revenue"])
    .describe("Метрики: visitCount, leadCount, orderCount, revenue, visits2leads, visits2orders и т.д."),
  dimensions: z
    .array(z.string())
    .default(["marker"])
    .describe("Группировки: marker (источник), landing_page, region, keyword и т.д."),
  limit: z.number().default(50).describe("Максимум строк в ответе"),
});

export async function handleGetAnalytics(params: z.infer<typeof getAnalyticsSchema>): Promise<string> {
  const result = (await getClient().post("/project/analytics", {
    from: params.from,
    to: params.to,
    metrics: params.metrics,
    dimensions: params.dimensions,
    limit: params.limit,
  })) as RoistatAnalyticsResponse;

  if (!result.data || result.data.length === 0) {
    return "Данные аналитики за указанный период не найдены.";
  }

  return JSON.stringify({
    период: { от: params.from, до: params.to },
    итого: result.total,
    данные: result.data.slice(0, params.limit).map(d => ({
      источник: d.title,
      уровень: d.marker_level,
      метрики: d.values,
    })),
  }, null, 2);
}
