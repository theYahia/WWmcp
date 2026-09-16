import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Sets a menu item AVAILABLE/UNAVAILABLE. Replaces the old (broken) availability tool
// which used the wrong verb (PUT), a legacy v1.0 boolean body, and a v2.0 path.
// status is an ENUM string, not a boolean. (PAUSED appears in only one source and is
// NOT included until corroborated.)
export const update_item_statusSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  item_id: z.string().describe("Item ID (UUID). Discover via list_catalogs → list_categories(includeItems=true)."),
  status: z.enum(["AVAILABLE", "UNAVAILABLE"]).describe("New availability status."),
});

export async function handleUpdateItemStatus(
  params: z.infer<typeof update_item_statusSchema>,
): Promise<string> {
  const result = await getClient().request(
    "PATCH",
    `/catalog/v2.0/merchants/${params.merchant_id}/items/status`,
    { itemId: params.item_id, status: params.status },
    { retryOnWrite: true },
  );
  return formatResult(result, `Item ${params.item_id} set to ${params.status}.`);
}
