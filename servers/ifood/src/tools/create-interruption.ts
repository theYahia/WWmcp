import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// PAUSES a store for a time window without touching its opening hours. This is the
// correct "temporarily stop receiving orders" mechanism. Dates use the store's local
// timezone (any timezone in the payload is discarded). Returns 201 with the new id.
export const create_interruptionSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  description: z.string().describe("Reason for the pause (shown internally)."),
  start: z.string().describe("Start, extended ISO 8601 (store local time)."),
  end: z.string().describe("End, extended ISO 8601 (store local time)."),
});

export async function handleCreateInterruption(
  params: z.infer<typeof create_interruptionSchema>,
): Promise<string> {
  // Not idempotent (each call creates a new interruption) — do NOT retry on write.
  const result = await getClient().request(
    "POST",
    `/merchant/v1.0/merchants/${params.merchant_id}/interruptions`,
    { description: params.description, start: params.start, end: params.end },
  );
  return formatResult(result, "Interruption created (201).");
}
