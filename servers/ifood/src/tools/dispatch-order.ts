import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Marks a DELIVERY order as dispatched (left for delivery). Returns 202.
// For iFood-logistics delivery the body is empty (default). For MERCHANT-managed
// delivery the docs sometimes require `{ deliveredBy: "MERCHANT" }` — pass
// delivered_by="MERCHANT" in that case.
export const dispatch_orderSchema = z.object({
  order_id: z.string().describe("Order ID"),
  delivered_by: z.enum(["MERCHANT"]).optional().describe("Set to 'MERCHANT' only for merchant-managed delivery; omit for iFood logistics."),
});

export async function handleDispatchOrder(params: z.infer<typeof dispatch_orderSchema>): Promise<string> {
  const body = params.delivered_by ? { deliveredBy: params.delivered_by } : undefined;
  const result = await getClient().request("POST", `/order/v1.0/orders/${params.order_id}/dispatch`, body, {
    retryOnWrite: true,
  });
  return formatResult(result, "Order dispatched (202).");
}
