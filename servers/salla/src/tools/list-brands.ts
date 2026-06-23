import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const listBrandsSchema = z.object({
  page: z.number().int().positive().default(1).describe("Page number"),
  per_page: z.number().int().min(1).max(50).default(25).describe("Items per page"),
});

export async function handleListBrands(params: z.infer<typeof listBrandsSchema>): Promise<string> {
  const query = new URLSearchParams({ page: String(params.page), per_page: String(params.per_page) });
  const result = await client.request("GET", `/brands?${query}`);
  return JSON.stringify(result, null, 2);
}
