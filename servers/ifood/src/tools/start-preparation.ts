import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Optional but recommended transition between confirm and dispatch/readyToPickup
// (improves UX, especially for scheduled orders). Returns 202. Ignored outside
// the confirmed→dispatch window.
export const start_preparationSchema = z.object({
  order_id: z.string().describe("Order ID"),
});

export async function handleStartPreparation(params: z.infer<typeof start_preparationSchema>): Promise<string> {
  const result = await getClient().request("POST", `/order/v1.0/orders/${params.order_id}/startPreparation`, undefined, {
    retryOnWrite: true,
  });
  return formatResult(result, "Preparation started (202).");
}
