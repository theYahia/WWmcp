import { z } from "zod";
import { apiGet, getSiteId } from "../client.js";

export const getStatisticsSchema = z.object({
  date_from: z.string().describe("Дата начала в формате dd/MM/yyyy"),
  date_to: z.string().describe("Дата окончания в формате dd/MM/yyyy"),
  group_by: z.string().optional().describe("Группировка: day, week, month (по умолчанию day)"),
});

export async function handleGetStatistics(params: z.infer<typeof getStatisticsSchema>): Promise<string> {
  const siteId = getSiteId();
  const query: Record<string, string> = {
    dateFrom: params.date_from,
    dateTo: params.date_to,
  };
  if (params.group_by) query.groupBy = params.group_by;

  const data = await apiGet(`/calls-service/RestAPI/${siteId}/statistics`, query);
  return JSON.stringify(data, null, 2);
}
