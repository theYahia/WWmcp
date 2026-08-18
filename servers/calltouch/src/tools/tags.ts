import { z } from "zod";
import { apiGet, getSiteId } from "../client.js";

export const getTagsSchema = z.object({
  date_from: z.string().describe("Дата начала в формате dd/MM/yyyy"),
  date_to: z.string().describe("Дата окончания в формате dd/MM/yyyy"),
});

export async function handleGetTags(params: z.infer<typeof getTagsSchema>): Promise<string> {
  const siteId = getSiteId();
  const query: Record<string, string> = {
    dateFrom: params.date_from,
    dateTo: params.date_to,
  };

  const data = await apiGet(`/calls-service/RestAPI/${siteId}/tags`, query);
  return JSON.stringify(data, null, 2);
}
