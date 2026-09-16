import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Returns the cancellation reason codes valid for THIS order at its current state.
// iFood requires consuming these dynamically rather than hardcoding a code — the
// available reasons differ by order state/timing. Feed the chosen code into
// `cancel_order`. Read-only.
export const get_cancellation_reasonsSchema = z.object({
  order_id: z.string().describe("Order ID"),
});

export async function handleGetCancellationReasons(
  params: z.infer<typeof get_cancellation_reasonsSchema>,
): Promise<string> {
  const result = await getClient().request("GET", `/order/v1.0/orders/${params.order_id}/cancellationReasons`);
  return formatResult(result);
}
