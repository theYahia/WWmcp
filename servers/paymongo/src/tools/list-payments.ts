import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

export const listPaymentsSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Max payments to return (1–100, default 10)."),
  before: z.string().optional().describe("Cursor: return resources before this payment ID."),
  after: z.string().optional().describe("Cursor: return resources after this payment ID."),
});

export async function handleListPayments(
  params: z.infer<typeof listPaymentsSchema>,
): Promise<string> {
  const qp = new URLSearchParams();
  if (params.limit) qp.set("limit", String(params.limit));
  if (params.before) qp.set("before", params.before);
  if (params.after) qp.set("after", params.after);
  const qs = qp.toString() ? "?" + qp.toString() : "";
  const result = await getClient().request("GET", "/payments" + qs);
  return JSON.stringify(result, null, 2);
}

export const listPaymentsTool: ToolDescriptor = {
  name: "list_payments",
  title: "List Payments",
  description: "List payments with cursor pagination (before/after by payment ID).",
  inputSchema: listPaymentsSchema.shape,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: handleListPayments,
};
