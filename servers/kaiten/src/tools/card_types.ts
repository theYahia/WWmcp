import { z } from "zod";
import { kaitenGet } from "../client.js";
import { buildQuery, json } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- list_card_types (read-only) ---
export const listCardTypesSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().describe("Max results (max 100)"),
  offset: z.number().int().optional().describe("Pagination offset"),
});

export async function handleListCardTypes(params: z.infer<typeof listCardTypesSchema>): Promise<string> {
  return json(await kaitenGet(`/card-types${buildQuery({ limit: params.limit, offset: params.offset })}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_card_types",
    description: "List card types defined in the workspace (id, name, color, letter).",
    schema: listCardTypesSchema,
    handler: handleListCardTypes,
  },
];
