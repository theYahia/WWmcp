import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

// Completes the Refunds resource (create_refund already lives in
// create-refund.ts) with read operations.

// --- get_refund -----------------------------------------------------------
export const getRefundSchema = z.object({
  refund_id: z.string().describe("Refund ID (ref_...)."),
});

export async function handleGetRefund(
  params: z.infer<typeof getRefundSchema>,
): Promise<string> {
  const result = await getClient().request(
    "GET",
    "/refunds/" + encodeURIComponent(params.refund_id),
  );
  return JSON.stringify(result, null, 2);
}

// --- list_refunds ---------------------------------------------------------
export const listRefundsSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Max refunds to return (1–100, default 10)."),
  before: z.string().optional().describe("Cursor: return resources before this refund ID."),
  after: z.string().optional().describe("Cursor: return resources after this refund ID."),
});

export async function handleListRefunds(
  params: z.infer<typeof listRefundsSchema>,
): Promise<string> {
  const qp = new URLSearchParams();
  if (params.limit) qp.set("limit", String(params.limit));
  if (params.before) qp.set("before", params.before);
  if (params.after) qp.set("after", params.after);
  const qs = qp.toString() ? "?" + qp.toString() : "";
  const result = await getClient().request("GET", "/refunds" + qs);
  return JSON.stringify(result, null, 2);
}

export const refundsDescriptors: ToolDescriptor[] = [
  {
    name: "get_refund",
    title: "Get Refund",
    description: "Retrieve a refund by its ID.",
    inputSchema: getRefundSchema.shape,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    handler: handleGetRefund,
  },
  {
    name: "list_refunds",
    title: "List Refunds",
    description: "List refunds with cursor pagination (before/after by refund ID).",
    inputSchema: listRefundsSchema.shape,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    handler: handleListRefunds,
  },
];
