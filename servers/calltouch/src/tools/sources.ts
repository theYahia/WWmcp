import { z } from "zod";
import { apiGet, getSiteId } from "../client.js";

export const getSourcesSchema = z.object({
  date_from: z.string().describe("Дата начала в формате dd/MM/yyyy"),
  date_to: z.string().describe("Дата окончания в формате dd/MM/yyyy"),
});

export async function handleGetSources(params: z.infer<typeof getSourcesSchema>): Promise<string> {
  const siteId = getSiteId();
  const query: Record<string, string> = {
    dateFrom: params.date_from,
    dateTo: params.date_to,
  };

  const data = await apiGet(`/calls-service/RestAPI/${siteId}/sources`, query);
  return JSON.stringify(data, null, 2);
}
