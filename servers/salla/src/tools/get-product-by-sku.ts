import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const getProductBySkuSchema = z.object({
  sku: z.string().min(1).describe("Product SKU code"),
});

export async function handleGetProductBySku(
  params: z.infer<typeof getProductBySkuSchema>,
): Promise<string> {
  const result = await client.request("GET", `/products/sku/${encodeURIComponent(params.sku)}`);
  return JSON.stringify(result, null, 2);
}
