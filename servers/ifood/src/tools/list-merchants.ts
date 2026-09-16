import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Lists the merchants the token can access. Paginated — `size` defaults to 100, so
// without paging you silently only see the first 100 stores.
export const list_merchantsSchema = z.object({
  page: z.number().int().positive().optional().describe("Page number (starts at 1)."),
  size: z.number().int().positive().max(100).optional().describe("Stores per page (max/default 100)."),
});

export async function handleListMerchants(params: z.infer<typeof list_merchantsSchema>): Promise<string> {
  const result = await getClient().request("GET", "/merchant/v1.0/merchants", undefined, {
    query: { page: params.page, size: params.size },
  });
  return formatResult(result);
}
