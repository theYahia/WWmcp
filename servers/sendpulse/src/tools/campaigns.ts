import { z } from "zod";
import { apiGet } from "../client.js";

export const listCampaignsSchema = z.object({
  limit: z.number().optional().describe("Лимит результатов (по умолчанию 100)"),
  offset: z.number().optional().describe("Смещение для пагинации"),
});

export async function handleListCampaigns(params: z.infer<typeof listCampaignsSchema>): Promise<string> {
  const limit = params.limit ?? 100;
  const offset = params.offset ?? 0;
  const data = await apiGet(`/campaigns?limit=${limit}&offset=${offset}`);
  return JSON.stringify(data, null, 2);
}
