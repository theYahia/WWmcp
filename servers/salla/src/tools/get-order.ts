import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const getOrderSchema = z.object({
  order_id: z.number().int().positive().describe("Order ID"),
});

export async function handleGetOrder(params: z.infer<typeof getOrderSchema>): Promise<string> {
  const result = await client.request("GET", `/orders/${params.order_id}`);
  return JSON.stringify(result, null, 2);
}
