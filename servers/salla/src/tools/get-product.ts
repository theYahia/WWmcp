import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const getProductSchema = z.object({
  product_id: z.number().int().positive().describe("Product ID"),
});

export async function handleGetProduct(params: z.infer<typeof getProductSchema>): Promise<string> {
  const result = await client.request("GET", `/products/${params.product_id}`);
  return JSON.stringify(result, null, 2);
}
