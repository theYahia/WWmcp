import { z } from "zod";
import { moyskladGet } from "../client.js";
import { formatList, listQuery, metaHref } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- list_stores ---
export const listStoresSchema = z.object({
  limit: z.number().int().min(1).max(100).default(100).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleListStores(params: z.infer<typeof listStoresSchema>): Promise<string> {
  const qs = listQuery({ limit: params.limit, offset: params.offset });
  const result = await moyskladGet(`/entity/store?${qs}`);
  return formatList(result, "stores", (s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    meta_href: metaHref(s),
  }));
}

export const tools: ToolDef[] = [
  {
    name: "list_stores",
    description: "List all warehouses/stores with names, addresses, and meta hrefs.",
    schema: listStoresSchema,
    handler: handleListStores,
  },
];
