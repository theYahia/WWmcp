import { z } from "zod";
import { kaitenGet } from "../client.js";
import { buildQuery, json } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- list_sprints (read-only) ---
export const listSprintsSchema = z.object({
  active: z.boolean().optional().describe("Filter by active status"),
  limit: z.number().int().min(1).max(100).optional().describe("Max results (max 100)"),
  offset: z.number().int().optional().describe("Pagination offset"),
});

export async function handleListSprints(params: z.infer<typeof listSprintsSchema>): Promise<string> {
  return json(
    await kaitenGet(`/sprints${buildQuery({ active: params.active, limit: params.limit, offset: params.offset })}`),
  );
}

// --- get_sprint_summary (read-only) ---
export const getSprintSummarySchema = z.object({
  sprint_id: z.number().int().describe("Sprint ID"),
  exclude_deleted_cards: z.boolean().optional().describe("Exclude deleted cards from the summary"),
});

export async function handleGetSprintSummary(params: z.infer<typeof getSprintSummarySchema>): Promise<string> {
  return json(
    await kaitenGet(
      `/sprints/${params.sprint_id}${buildQuery({ exclude_deleted_cards: params.exclude_deleted_cards })}`,
    ),
  );
}

export const tools: ToolDef[] = [
  {
    name: "list_sprints",
    description: "List sprints, optionally filtered by active status.",
    schema: listSprintsSchema,
    handler: handleListSprints,
  },
  {
    name: "get_sprint_summary",
    description: "Get a sprint summary (cards, totals) by sprint ID.",
    schema: getSprintSummarySchema,
    handler: handleGetSprintSummary,
  },
];
