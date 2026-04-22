import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const listProductsSchema = z.object({
  page: z.number().int().positive().default(1).describe("Page number"),
  per_page: z.number().int().min(1).max(50).default(25).describe("Items per page"),
  status: z.enum(["sale", "out", "hidden", "deleted"]).optional().describe("Filter by status"),
});

export async function handleListProducts(params: z.infer<typeof listProductsSchema>): Promise<string> {
  const query = new URLSearchParams({ page: String(params.page), per_page: String(params.per_page) });
  if (params.status) query.set("status", params.status);
  const result = await client.request("GET", `/products?${query}`);
  return JSON.stringify(result, null, 2);
}
