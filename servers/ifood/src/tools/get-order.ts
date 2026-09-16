import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// NOTE: the order detail can lag slightly behind the PLACED event (event + detail
// systems run in parallel). A 404 right after PLACED is expected — retry with
// backoff for up to ~10 minutes. Details are retained for 7 days.
export const get_orderSchema = z.object({
  order_id: z.string().describe("Order ID"),
});

export async function handleGetOrder(params: z.infer<typeof get_orderSchema>): Promise<string> {
  const result = await getClient().request("GET", `/order/v1.0/orders/${params.order_id}`);
  return formatResult(result);
}
