import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// First step of catalog discovery: lists the merchant's catalogs (catalogId, context
// DEFAULT/INDOOR, status). Feed a catalogId into list_categories.
export const list_catalogsSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
});

export async function handleListCatalogs(params: z.infer<typeof list_catalogsSchema>): Promise<string> {
  const result = await getClient().request("GET", `/catalog/v2.0/merchants/${params.merchant_id}/catalogs`);
  return formatResult(result);
}
