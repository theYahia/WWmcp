import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

/**
 * Update a single product's price. Salla exposes price as a top-level field
 * on the product resource — `PUT /products/{id}` accepts a `price` numeric
 * field and recomputes any derived sale_price/discount fields server-side.
 *
 * For bulk operations across many products, use Salla's
 * `POST /products/bulk/prices` endpoint via a dedicated tool (not exposed
 * here to keep the single-product surface focused).
 */
export const updateProductPriceSchema = z.object({
  product_id: z
    .number()
    .int()
    .positive()
    .describe("Salla product ID."),
  price: z
    .number()
    .positive()
    .describe("New base price (in the store's currency, e.g. SAR)."),
  sale_price: z
    .number()
    .positive()
    .optional()
    .describe(
      "Optional discounted/sale price. Omit to leave unchanged. Must be ≤ price.",
    ),
  sale_end: z
    .string()
    .optional()
    .describe(
      "Optional sale end timestamp (ISO 8601). Required by Salla when sale_price is set.",
    ),
});

export async function handleUpdateProductPrice(
  params: z.infer<typeof updateProductPriceSchema>,
): Promise<string> {
  if (
    params.sale_price !== undefined &&
    params.sale_price > params.price
  ) {
    throw new Error(
      `sale_price (${params.sale_price}) cannot exceed price (${params.price}).`,
    );
  }
  const body: Record<string, unknown> = { price: params.price };
  if (params.sale_price !== undefined) body["sale_price"] = params.sale_price;
  if (params.sale_end) body["sale_end"] = params.sale_end;
  const result = await client.request(
    "PUT",
    `/products/${params.product_id}`,
    body,
  );
  return JSON.stringify(result, null, 2);
}
