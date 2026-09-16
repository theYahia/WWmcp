import { z } from "zod";
import { vkGet } from "../client.js";

export const getStatsSchema = z.object({
  group_id: z.number().describe("ID сообщества"),
  date_from: z.string().describe("Начальная дата (YYYY-MM-DD)"),
  date_to: z.string().describe("Конечная дата (YYYY-MM-DD)"),
});

export async function handleGetStats(params: z.infer<typeof getStatsSchema>): Promise<string> {
  const result = await vkGet("stats.get", {
    group_id: String(params.group_id),
    date_from: params.date_from,
    date_to: params.date_to,
  });
  return JSON.stringify(result, null, 2);
}
