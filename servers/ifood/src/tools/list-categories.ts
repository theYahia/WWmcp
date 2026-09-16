import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Lists categories in a catalog. With include_items=true this is the easiest way to
// enumerate item IDs (needed by update_item_status / update_item_price).
export const list_categoriesSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  catalog_id: z.string().describe("Catalog ID (from list_catalogs)."),
  include_items: z.boolean().optional().describe("Include items (and their IDs) in each category."),
});

export async function handleListCategories(params: z.infer<typeof list_categoriesSchema>): Promise<string> {
  const result = await getClient().request(
    "GET",
    `/catalog/v2.0/merchants/${params.merchant_id}/catalogs/${params.catalog_id}/categories`,
    undefined,
    { query: { includeItems: params.include_items } },
  );
  return formatResult(result);
}
