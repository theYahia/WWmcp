import { z } from "zod";
import { apiGet, getSiteId } from "../client.js";

export const getLeadsSchema = z.object({
  date_from: z.string().describe("Дата начала в формате dd/MM/yyyy"),
  date_to: z.string().describe("Дата окончания в формате dd/MM/yyyy"),
  page: z.number().int().min(1).optional().describe("Номер страницы (по умолчанию 1)"),
  limit: z.number().int().min(1).max(1000).optional()
    .describe("Количество записей, 1-1000 (по умолчанию 50)"),
});

export async function handleGetLeads(params: z.infer<typeof getLeadsSchema>): Promise<string> {
  const siteId = getSiteId();
  const query: Record<string, string> = {
    dateFrom: params.date_from,
    dateTo: params.date_to,
  };
  if (params.page) query.page = String(params.page);
  if (params.limit) query.limit = String(params.limit);

  const data = await apiGet(`/calls-service/RestAPI/${siteId}/calls-diary/leads`, query);
  return JSON.stringify(data, null, 2);
}
