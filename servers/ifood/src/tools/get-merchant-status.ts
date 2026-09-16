import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Availability per operation/sales-channel: open/closed, closing reasons via
// `validations`, and a `reopenable` flag.
export const get_merchant_statusSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
});

export async function handleGetMerchantStatus(
  params: z.infer<typeof get_merchant_statusSchema>,
): Promise<string> {
  const result = await getClient().request("GET", `/merchant/v1.0/merchants/${params.merchant_id}/status`);
  return formatResult(result);
}
