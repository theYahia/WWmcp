import { z } from "zod";
import { getClient } from "../client.js";

export const getCostsSchema = z.object({
  from: z.string().describe("Дата начала периода (YYYY-MM-DD)"),
  to: z.string().describe("Дата конца периода (YYYY-MM-DD)"),
  group_by: z.enum(["day", "week", "month"]).default("day").describe("Группировка: day, week, month"),
});

export async function handleGetCosts(params: z.infer<typeof getCostsSchema>): Promise<string> {
  const result = (await getClient().post("/project/analytics", {
    from: params.from,
    to: params.to,
    metrics: ["cost", "revenue", "roi", "leadCount", "orderCount"],
    dimensions: ["marker"],
    period: params.group_by,
    limit: 100,
  })) as {
    data: Record<string, unknown>[];
    total: Record<string, number>;
    status: string;
  };

  if (!result.data || result.data.length === 0) {
    return "Данные по затратам не найдены.";
  }

  return JSON.stringify({
    период: { от: params.from, до: params.to, группировка: params.group_by },
    итого: result.total,
    данные: result.data,
  }, null, 2);
}
