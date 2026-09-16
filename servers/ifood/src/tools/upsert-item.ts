import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Creates or fully replaces an item with all its dependencies in one idempotent call.
// products / optionGroups / options are SIBLINGS of item (not nested inside it).
// IDs must be UUID v4; categoryId comes from the catalog. The nested shapes are
// passed through to iFood verbatim — see the iFood Catalog v2 "PUT /items" docs for
// the exact field requirements per item type (including pizza).
export const upsert_itemSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  item: z
    .object({
      id: z.string().describe("Item UUID."),
      type: z.string().describe("Item type (e.g. DEFAULT, PIZZA)."),
      categoryId: z.string().describe("Category UUID."),
      status: z.enum(["AVAILABLE", "UNAVAILABLE"]).describe("Initial status."),
      price: z.object({ value: z.number() }).passthrough().describe("Price object, at least { value }."),
      externalCode: z.string().optional(),
    })
    .passthrough()
    .describe("The item object (extra iFood fields allowed)."),
  products: z.array(z.record(z.string(), z.any())).optional().describe("Product definitions (iFood shape)."),
  optionGroups: z.array(z.record(z.string(), z.any())).optional().describe("Option-group definitions (iFood shape)."),
  options: z.array(z.record(z.string(), z.any())).optional().describe("Option definitions (iFood shape)."),
});

export async function handleUpsertItem(params: z.infer<typeof upsert_itemSchema>): Promise<string> {
  const body: Record<string, unknown> = { item: params.item };
  if (params.products) body.products = params.products;
  if (params.optionGroups) body.optionGroups = params.optionGroups;
  if (params.options) body.options = params.options;
  const result = await getClient().request("PUT", `/catalog/v2.0/merchants/${params.merchant_id}/items`, body, {
    retryOnWrite: true,
  });
  return formatResult(result, `Item ${params.item.id} upserted.`);
}
