import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

// Field names follow Salla's API verbatim, including the "identifer" spelling.
const quantityItemSchema = z.object({
  identifer_type: z
    .enum(["id", "variant_id", "sku"])
    .describe("How `identifer` is interpreted: product id, variant id, or SKU"),
  identifer: z.string().min(1).describe("The product/variant id or SKU value"),
  quantity: z.number().int().min(0).describe("New quantity value"),
  mode: z
    .enum(["overwrite", "increment", "decrement"])
    .optional()
    .describe("How to apply the quantity (default: overwrite)"),
  unlimited_quantity: z.boolean().optional().describe("Mark the item as having unlimited stock"),
  branch: z.number().int().optional().describe("Branch ID to scope the update to"),
  reason_id: z.number().int().optional().describe("Reason ID for the inventory change"),
});

export const bulkUpdateQuantitiesSchema = z.object({
  products: z
    .array(quantityItemSchema)
    .min(1)
    .describe("List of quantity updates to apply (queued; may take minutes to finish)"),
});

export async function handleBulkUpdateQuantities(
  params: z.infer<typeof bulkUpdateQuantitiesSchema>,
): Promise<string> {
  const result = await client.request("POST", "/products/quantities/bulk", {
    products: params.products,
  });
  return JSON.stringify(result, null, 2);
}
