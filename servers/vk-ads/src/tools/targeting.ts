import { z } from "zod";
import { apiGet } from "../client.js";

export const listTargetingGroupsSchema = z.object({
  campaign_id: z.number().describe("ID кампании"),
});

export async function handleListTargetingGroups(params: z.infer<typeof listTargetingGroupsSchema>): Promise<string> {
  const data = await apiGet("/targeting_groups.json", {
    campaign_id: String(params.campaign_id),
  });
  return JSON.stringify(data, null, 2);
}
