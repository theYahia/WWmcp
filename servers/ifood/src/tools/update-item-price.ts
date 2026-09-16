import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Edits an item's price. `value` is in reais (major unit, float). `originalValue`
// (optional) sets a strike-through "from" price for promotions.
export const update_item_priceSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  item_id: z.string().describe("Item ID (UUID)."),
  value: z.number().positive().describe("New price in reais (e.g. 29.90)."),
  original_value: z.number().positive().optional().describe("Optional original/strike-through price for promotions."),
});

export async function handleUpdateItemPrice(
  params: z.infer<typeof update_item_priceSchema>,
): Promise<string> {
  const price: Record<string, number> = { value: params.value };
  if (params.original_value !== undefined) price.originalValue = params.original_value;
  const result = await getClient().request(
    "PATCH",
    `/catalog/v2.0/merchants/${params.merchant_id}/items/price`,
    { itemId: params.item_id, price },
    { retryOnWrite: true },
  );
  return formatResult(result, `Item ${params.item_id} price updated.`);
}
