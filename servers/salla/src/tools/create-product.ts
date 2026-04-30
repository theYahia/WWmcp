import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const createProductSchema = z.object({
  name: z.string().describe("Product name"),
  price: z.number().positive().describe("Product price"),
  product_type: z.enum(["product", "service", "digital", "food", "codes"]).default("product").describe("Product type"),
  quantity: z.number().int().min(0).optional().describe("Stock quantity"),
  description: z.string().optional().describe("Product description"),
  sku: z.string().optional().describe("SKU code"),
});

export async function handleCreateProduct(params: z.infer<typeof createProductSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    name: params.name,
    price: params.price,
    product_type: params.product_type,
  };
  if (params.quantity !== undefined) body.quantity = params.quantity;
  if (params.description) body.description = params.description;
  if (params.sku) body.sku = params.sku;
  const result = await client.request("POST", "/products", body);
  return JSON.stringify(result, null, 2);
}
