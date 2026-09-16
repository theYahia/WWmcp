import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Sets a complement/option AVAILABLE/UNAVAILABLE (single-object form is the canonical
// shape per the official docs).
export const update_option_statusSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  option_id: z.string().describe("Option ID."),
  status: z.enum(["AVAILABLE", "UNAVAILABLE"]).describe("New availability status."),
});

export async function handleUpdateOptionStatus(
  params: z.infer<typeof update_option_statusSchema>,
): Promise<string> {
  const result = await getClient().request(
    "PATCH",
    `/catalog/v2.0/merchants/${params.merchant_id}/options/status`,
    { optionId: params.option_id, status: params.status },
    { retryOnWrite: true },
  );
  return formatResult(result, `Option ${params.option_id} set to ${params.status}.`);
}
