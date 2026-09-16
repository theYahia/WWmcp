import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Reads the configured weekly opening hours ({ storeId, shifts[] }).
export const get_opening_hoursSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
});

export async function handleGetOpeningHours(
  params: z.infer<typeof get_opening_hoursSchema>,
): Promise<string> {
  const result = await getClient().request("GET", `/merchant/v1.0/merchants/${params.merchant_id}/opening-hours`);
  return formatResult(result);
}
