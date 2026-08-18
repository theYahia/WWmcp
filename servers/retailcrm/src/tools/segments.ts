import { z } from "zod";
import { retailCrmGet } from "../client.js";
import { ok, runTool, type ToolResult } from "../format/index.js";
import { pageField, limitField } from "./common.js";

// ── list_segments ────────────────────────────────────────────
export const listSegmentsSchema = z.object({
  filter_active: z.boolean().optional().describe("Only active segments"),
  filter_type: z.enum(["dynamic", "custom"]).optional().describe("Segment type"),
  page: pageField,
  limit: limitField,
});

export async function handleListSegments(params: z.infer<typeof listSegmentsSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_active !== undefined) query["filter[active]"] = params.filter_active ? "1" : "0";
    if (params.filter_type) query["filter[type]"] = params.filter_type;
    const result = await retailCrmGet("/segments", query);
    return ok(result);
  });
}
