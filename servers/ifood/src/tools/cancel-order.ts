import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Requests cancellation of an order. Method + path VERIFIED (POST .../requestCancellation
// → 202; result arrives as a CANCELLED or CANCELLATION_REQUEST_FAILED event next poll).
//
// ⚠️ UNVERIFIED BODY (best-guess). Adversarial verification could not confirm the
// order-module body shape. Best available evidence: the ORDER module wants a single
// field `{ "reason": "<code>" }` where `reason` carries the cancellation CODE itself
// (e.g. "503"); the two-field `{ reason, cancellationCode }` shape likely belongs to
// the SHIPPING module (POST /shipping/v1.0/orders/{id}/cancel). VERIFY against live
// iFood docs before relying on this. The code is NOT hardcoded — fetch valid codes
// for this order via `get_cancellation_reasons` first.
export const cancel_orderSchema = z.object({
  order_id: z.string().describe("Order ID"),
  code: z.string().describe("Cancellation code obtained from get_cancellation_reasons for THIS order (e.g. '503'). No safe default exists — an invalid code yields CANCELLATION_REQUEST_FAILED."),
});

export async function handleCancelOrder(params: z.infer<typeof cancel_orderSchema>): Promise<string> {
  // Best-guess order-module body: { reason: <code> }. See header note.
  const result = await getClient().request(
    "POST",
    `/order/v1.0/orders/${params.order_id}/requestCancellation`,
    { reason: params.code },
  );
  return formatResult(result, "Cancellation requested (202) — outcome arrives as an event in the next poll.");
}
