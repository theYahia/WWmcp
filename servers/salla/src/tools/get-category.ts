import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const getCategorySchema = z.object({
  category_id: z.number().int().positive().describe("Category ID"),
});

export async function handleGetCategory(params: z.infer<typeof getCategorySchema>): Promise<string> {
  const result = await client.request("GET", `/categories/${params.category_id}`);
  return JSON.stringify(result, null, 2);
}
