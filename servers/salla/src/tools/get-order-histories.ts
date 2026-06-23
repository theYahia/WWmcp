import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const getOrderHistoriesSchema = z.object({
  order_id: z.number().int().positive().describe("Order ID"),
});

export async function handleGetOrderHistories(
  params: z.infer<typeof getOrderHistoriesSchema>,
): Promise<string> {
  const result = await client.request("GET", `/orders/${params.order_id}/histories`);
  return JSON.stringify(result, null, 2);
}
