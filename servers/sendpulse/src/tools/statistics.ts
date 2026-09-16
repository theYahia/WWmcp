import { z } from "zod";
import { apiGet } from "../client.js";

export const getStatisticsSchema = z.object({
  campaign_id: z.number().describe("ID кампании рассылки"),
});

export async function handleGetStatistics(params: z.infer<typeof getStatisticsSchema>): Promise<string> {
  const data = await apiGet(`/campaigns/${params.campaign_id}`);
  return JSON.stringify(data, null, 2);
}
