import { z } from "zod";
import { getClient } from "../client.js";

export const getChannelsSchema = z.object({
  from: z.string().describe("Дата начала периода (YYYY-MM-DD)"),
  to: z.string().describe("Дата конца периода (YYYY-MM-DD)"),
  metrics: z
    .array(z.string())
    .default(["visitCount", "leadCount", "revenue", "cost", "roi"])
    .describe("Метрики: visitCount, leadCount, revenue, cost, roi"),
});

export async function handleGetChannels(params: z.infer<typeof getChannelsSchema>): Promise<string> {
  const result = (await getClient().post("/project/analytics", {
    from: params.from,
    to: params.to,
    metrics: params.metrics,
    dimensions: ["marker"],
    limit: 100,
  })) as {
    data: { title: string; marker_level: string; values: Record<string, number> }[];
    total: Record<string, number>;
    status: string;
  };

  if (!result.data || result.data.length === 0) {
    return "Данные по рекламным каналам не найдены.";
  }

  return JSON.stringify({
    период: { от: params.from, до: params.to },
    итого: result.total,
    каналы: result.data.map(ch => ({
      канал: ch.title,
      метрики: ch.values,
    })),
  }, null, 2);
}
