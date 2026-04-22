import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const listOrdersSchema = z.object({
  page: z.number().int().positive().default(1).describe("Page number"),
  per_page: z.number().int().min(1).max(50).default(25).describe("Items per page"),
  status: z.string().optional().describe("Filter by order status (e.g. completed, under_review)"),
});

export async function handleListOrders(params: z.infer<typeof listOrdersSchema>): Promise<string> {
  const query = new URLSearchParams({ page: String(params.page), per_page: String(params.per_page) });
  if (params.status) query.set("status", params.status);
  const result = await client.request("GET", `/orders?${query}`);
  return JSON.stringify(result, null, 2);
}
