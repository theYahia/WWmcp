import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// First mandatory transition after PLACED. Returns 202. Idempotent (duplicate
// confirms ignored). Orders auto-cancel if not confirmed within iFood's window.
export const confirm_orderSchema = z.object({
  order_id: z.string().describe("Order ID"),
});

export async function handleConfirmOrder(params: z.infer<typeof confirm_orderSchema>): Promise<string> {
  const result = await getClient().request("POST", `/order/v1.0/orders/${params.order_id}/confirm`, undefined, {
    retryOnWrite: true,
  });
  return formatResult(result, "Order confirmed (202).");
}
