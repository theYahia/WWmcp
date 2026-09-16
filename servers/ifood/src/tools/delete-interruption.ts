import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// RESUMES a store by removing an interruption created earlier. Returns 204.
export const delete_interruptionSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  interruption_id: z.string().describe("Interruption ID (from list_interruptions)."),
});

export async function handleDeleteInterruption(
  params: z.infer<typeof delete_interruptionSchema>,
): Promise<string> {
  const result = await getClient().request(
    "DELETE",
    `/merchant/v1.0/merchants/${params.merchant_id}/interruptions/${params.interruption_id}`,
    undefined,
    { retryOnWrite: true },
  );
  return formatResult(result, "Interruption removed (204).");
}
