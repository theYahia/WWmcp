import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// ⚠️ UNVERIFIED PATH (best-guess). Adversarial verification against the official
// iFood docs could not confirm the exact path: the claimed `/order/v1.0/acknowledgment`
// is most likely `/order/v1.0/events/acknowledgment` (the `events` segment appears in
// the archived iFood guide and the deprecated POS API). Method (POST) and the raw
// `[{id}]` array body (max 2000) are corroborated. VERIFY against live iFood docs /
// Postman before relying on this in production. Do NOT use a `{acknowledgedEventIds:[]}`
// wrapper — that shape is an LLM hallucination, not in any real source.
export const acknowledge_eventsSchema = z.object({
  event_ids: z.array(z.string()).min(1).max(2000).describe("Event IDs to acknowledge (from list_orders). Max 2000 per call."),
});

export async function handleAcknowledgeEvents(params: z.infer<typeof acknowledge_eventsSchema>): Promise<string> {
  const body = params.event_ids.map((id) => ({ id }));
  const result = await getClient().request("POST", "/order/v1.0/events/acknowledgment", body, {
    retryOnWrite: true, // acknowledging the same ids twice is harmless
  });
  return formatResult(result, `Acknowledged ${params.event_ids.length} event(s).`);
}
