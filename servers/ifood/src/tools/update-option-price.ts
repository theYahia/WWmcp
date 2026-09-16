import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Edits a complement/option price (single-object form). For pizza-flavour complements
// set `parent_customization_option_id`; leave null/omitted for top-level options.
export const update_option_priceSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  option_id: z.string().describe("Option ID."),
  value: z.number().positive().describe("New price in reais."),
  original_value: z.number().positive().optional().describe("Optional original/strike-through price."),
  parent_customization_option_id: z.string().optional().describe("Required for pizza-flavour complements; omit for top-level options."),
});

export async function handleUpdateOptionPrice(
  params: z.infer<typeof update_option_priceSchema>,
): Promise<string> {
  const price: Record<string, number> = { value: params.value };
  if (params.original_value !== undefined) price.originalValue = params.original_value;
  const body: Record<string, unknown> = { optionId: params.option_id, price };
  if (params.parent_customization_option_id !== undefined) {
    body.parentCustomizationOptionId = params.parent_customization_option_id;
  }
  const result = await getClient().request(
    "PATCH",
    `/catalog/v2.0/merchants/${params.merchant_id}/options/price`,
    body,
    { retryOnWrite: true },
  );
  return formatResult(result, `Option ${params.option_id} price updated.`);
}
