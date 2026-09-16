import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Lists active and future interruptions (temporary store pauses) without changing
// the permanent opening hours.
export const list_interruptionsSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
});

export async function handleListInterruptions(
  params: z.infer<typeof list_interruptionsSchema>,
): Promise<string> {
  const result = await getClient().request("GET", `/merchant/v1.0/merchants/${params.merchant_id}/interruptions`);
  return formatResult(result);
}
