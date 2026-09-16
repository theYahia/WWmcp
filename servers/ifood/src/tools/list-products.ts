import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Lists catalog products (paginated). The response wraps items in an `elements` array.
export const list_productsSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  limit: z.number().int().positive().optional().describe("Page size (e.g. 200)."),
  page: z.number().int().nonnegative().optional().describe("Page index (clients differ: some start at 0, some at 1)."),
});

export async function handleListProducts(params: z.infer<typeof list_productsSchema>): Promise<string> {
  const result = await getClient().request("GET", `/catalog/v2.0/merchants/${params.merchant_id}/products`, undefined, {
    query: { limit: params.limit, page: params.page },
  });
  return formatResult(result);
}
