import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const updateOrderStatusSchema = z.object({
  order_id: z.number().int().positive().describe("Order ID"),
  status: z.enum(["completed", "in_progress", "under_review", "cancelled", "restoring", "refunded"]).describe("New order status"),
});

export async function handleUpdateOrderStatus(params: z.infer<typeof updateOrderStatusSchema>): Promise<string> {
  const result = await client.request("POST", `/orders/${params.order_id}/status`, { status: params.status });
  return JSON.stringify(result, null, 2);
}
