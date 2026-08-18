import { z } from "zod";
import { moyskladGet } from "../client.js";
import { formatList, listQuery, metaHref } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- list_organizations ---
export const listOrganizationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(100).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleListOrganizations(params: z.infer<typeof listOrganizationsSchema>): Promise<string> {
  const qs = listQuery({ limit: params.limit, offset: params.offset });
  const result = await moyskladGet(`/entity/organization?${qs}`);
  return formatList(result, "organizations", (o) => ({
    id: o.id,
    name: o.name,
    inn: o.inn,
    meta_href: metaHref(o),
  }));
}

export const tools: ToolDef[] = [
  {
    name: "list_organizations",
    description: "List all organizations (your legal entities) with names, INN, and meta hrefs.",
    schema: listOrganizationsSchema,
    handler: handleListOrganizations,
  },
];
