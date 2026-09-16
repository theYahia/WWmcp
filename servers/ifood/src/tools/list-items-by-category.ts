import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Lists all items, products, option groups and options in a category.
export const list_items_by_categorySchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  category_id: z.string().describe("Category ID (from list_categories)."),
});

export async function handleListItemsByCategory(
  params: z.infer<typeof list_items_by_categorySchema>,
): Promise<string> {
  const result = await getClient().request(
    "GET",
    `/catalog/v2.0/merchants/${params.merchant_id}/categories/${params.category_id}/items`,
  );
  return formatResult(result);
}
