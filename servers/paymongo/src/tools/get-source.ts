import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

export const getSourceSchema = z.object({
  source_id: z.string().describe("Source ID (src_...)"),
});

export async function handleGetSource(
  params: z.infer<typeof getSourceSchema>,
): Promise<string> {
  const result = await getClient().request(
    "GET",
    "/sources/" + encodeURIComponent(params.source_id),
  );
  return JSON.stringify(result, null, 2);
}

export const getSourceTool: ToolDescriptor = {
  name: "get_source",
  title: "Get Source",
  description: "Retrieve a payment source by its ID.",
  inputSchema: getSourceSchema.shape,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: handleGetSource,
};
