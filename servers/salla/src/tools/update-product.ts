import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const updateProductSchema = z.object({
  product_id: z.number().int().positive().describe("Product ID to update"),
  name: z.string().optional().describe("New product name"),
  price: z.number().positive().optional().describe("New price"),
  quantity: z.number().int().min(0).optional().describe("New stock quantity"),
  status: z.enum(["sale", "out", "hidden"]).optional().describe("Product status"),
});

export async function handleUpdateProduct(params: z.infer<typeof updateProductSchema>): Promise<string> {
  const { product_id, ...body } = params;
  const filtered = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined));
  const result = await client.request("PUT", `/products/${product_id}`, filtered);
  return JSON.stringify(result, null, 2);
}
