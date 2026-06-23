import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const deleteProductSchema = z.object({
  product_id: z.number().int().positive().describe("Product ID to delete"),
});

export async function handleDeleteProduct(params: z.infer<typeof deleteProductSchema>): Promise<string> {
  const result = await client.request("DELETE", `/products/${params.product_id}`);
  return JSON.stringify(result, null, 2);
}
