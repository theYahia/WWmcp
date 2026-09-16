import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Full detail for one merchant: name, address, and the `operations[]` array
// (DELIVERY/TAKEOUT with sales channels).
export const get_merchantSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
});

export async function handleGetMerchant(params: z.infer<typeof get_merchantSchema>): Promise<string> {
  const result = await getClient().request("GET", `/merchant/v1.0/merchants/${params.merchant_id}`);
  return formatResult(result);
}
