import { z } from "zod";
import { parasutGet, parasutMe } from "../client.js";
import { formatList, json, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

const page = z.number().int().min(1).default(1).describe("Page number (1-based)");
const perPage = z.number().int().min(1).max(25).default(25).describe("Items per page (max 25)");

// --- get_me ---
async function getMe(): Promise<string> {
  return json(await parasutMe());
}

// --- simple list factory for reference resources ---
function listTool(resource: string, key: string, description: string): ToolDef {
  const schema = z.object({ page, per_page: perPage });
  return {
    name: `list_${key}`,
    description,
    schema,
    handler: async (p: z.infer<typeof schema>) => {
      const qs = listQuery({ page: p.page, pageSize: p.per_page });
      return formatList(await parasutGet(`/${resource}?${qs}`), key);
    },
  };
}

export const tools: ToolDef[] = [
  {
    name: "get_me",
    description:
      "Get the authenticated user and the companies they can access (GET /me). Useful for discovering your company_id.",
    schema: z.object({}),
    handler: getMe,
  },
  listTool("tags", "tags", "List tags used to categorize invoices and contacts."),
  listTool("item_categories", "item_categories", "List item categories (for products, invoices, contacts)."),
  listTool("warehouses", "warehouses", "List warehouses."),
  listTool("taxes", "taxes", "List taxes (VAT/withholding records you owe)."),
];
