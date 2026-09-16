import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Marks an order ready for pickup. REQUIRED for TAKEOUT and DINE_IN orders (without
// it they cannot complete); optional for DELIVERY with an iFood driver. Returns 202.
export const ready_to_pickupSchema = z.object({
  order_id: z.string().describe("Order ID"),
});

export async function handleReadyToPickup(params: z.infer<typeof ready_to_pickupSchema>): Promise<string> {
  const result = await getClient().request("POST", `/order/v1.0/orders/${params.order_id}/readyToPickup`, undefined, {
    retryOnWrite: true,
  });
  return formatResult(result, "Order marked ready to pickup (202).");
}
