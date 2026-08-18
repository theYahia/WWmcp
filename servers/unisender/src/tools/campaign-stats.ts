import { z } from "zod";
import { apiCall } from "../client.js";

export const getCampaignStatsSchema = z.object({
  campaign_id: z.number().describe("ID кампании (из send_email)"),
});

export async function handleGetCampaignStats(params: z.infer<typeof getCampaignStatsSchema>): Promise<string> {
  const data = await apiCall("getCampaignStatus", {
    campaign_id: String(params.campaign_id),
  });
  return JSON.stringify(data, null, 2);
}

export const getCampaignDeliveryStatsSchema = z.object({
  campaign_id: z.number().describe("ID кампании"),
  changed_since: z.string().optional().describe("Дата изменений YYYY-MM-DD HH:MM:SS"),
});

export async function handleGetCampaignDeliveryStats(params: z.infer<typeof getCampaignDeliveryStatsSchema>): Promise<string> {
  const query: Record<string, string> = {
    campaign_id: String(params.campaign_id),
  };
  if (params.changed_since) query.changed_since = params.changed_since;

  const data = await apiCall("getCampaignDeliveryStats", query);
  return JSON.stringify(data, null, 2);
}
