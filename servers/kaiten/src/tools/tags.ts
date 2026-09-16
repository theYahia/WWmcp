import { z } from "zod";
import { kaitenGet } from "../client.js";
import { formatList, projectTag } from "../lib.js";
import type { KaitenTag, ToolDef } from "../types.js";

// --- list_tags (workspace-level tags) ---
export const listTagsSchema = z.object({});

export async function handleListTags(_params: z.infer<typeof listTagsSchema>): Promise<string> {
  return formatList<KaitenTag>(await kaitenGet("/tags"), "tags", projectTag);
}

export const tools: ToolDef[] = [
  {
    name: "list_tags",
    description: "List all tags in the Kaiten workspace.",
    schema: listTagsSchema,
    handler: handleListTags,
  },
];
