import { z } from "zod";
import { apiGet } from "../client.js";

export const getStatisticsSchema = z.object({
  account_id: z.number().describe("ID рекламного кабинета"),
  ids_type: z.string().default("campaign").describe("Тип объектов: campaign, ad, office"),
  ids: z.array(z.number()).describe("ID объектов для статистики"),
  period: z.string().default("day").describe("Период группировки: day, week, month, overall"),
  date_from: z.string().describe("Дата начала YYYY-MM-DD"),
  date_to: z.string().describe("Дата окончания YYYY-MM-DD"),
});

export async function handleGetStatistics(params: z.infer<typeof getStatisticsSchema>): Promise<string> {
  const data = await apiGet("/statistics.json", {
    account_id: String(params.account_id),
    ids_type: params.ids_type,
    ids: params.ids.join(","),
    period: params.period,
    date_from: params.date_from,
    date_to: params.date_to,
  });
  return JSON.stringify(data, null, 2);
}
