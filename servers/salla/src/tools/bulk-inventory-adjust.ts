import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

/**
 * Bulk adjust inventory quantities. Wraps Salla's
 * `POST /products/quantities/bulk` endpoint, which accepts an array of items
 * keyed by `id` (product_id), `variant_id`, or `sku`, plus a `quantity` and
 * an `option` (overwrite | increment | decrement).
 *
 * Salla limit: up to 1000 items per request.
 *
 * Doc source verified 2026-05-19: github.com/bolticio/integrations
 * (Salla/schemas/resources/productquantity.json).
 */
const adjustItemSchema = z.object({
  identifier_type: z
    .enum(["id", "variant_id", "sku"])
    .describe(
      "How to identify the product. 'id' = Salla product ID, 'variant_id' = specific variant, 'sku' = SKU code.",
    ),
  identifier: z
    .union([z.string(), z.number()])
    .describe("The product ID, variant ID, or SKU value."),
  quantity: z
    .number()
    .int()
    .min(0)
    .describe("Quantity value (≥ 0)."),
  option: z
    .enum(["overwrite", "increment", "decrement"])
    .default("overwrite")
    .describe(
      "How to apply the quantity: overwrite (replace), increment (add), decrement (subtract).",
    ),
});

export const bulkInventoryAdjustSchema = z.object({
  items: z
    .array(adjustItemSchema)
    .min(1)
    .max(1000)
    .describe("Up to 1000 quantity adjustments per request."),
});

export async function handleBulkInventoryAdjust(
  params: z.infer<typeof bulkInventoryAdjustSchema>,
): Promise<string> {
  // Salla expects the inner key name `option` and one of id|variant_id|sku as
  // the top-level identifier — we shape the wire payload accordingly.
  const products = params.items.map((it) => ({
    [it.identifier_type]: it.identifier,
    quantity: it.quantity,
    option: it.option,
  }));
  const result = await client.request("POST", "/products/quantities/bulk", {
    products,
  });
  return JSON.stringify(result, null, 2);
}
