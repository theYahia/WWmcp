import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

/**
 * Returns the variants block for a Salla product. The Salla Admin API embeds
 * variants inside the product detail response (`/products/{id}` → `data.variants`),
 * so we fetch the product and project just the variant-relevant fields.
 *
 * For per-variant edits use Salla's dedicated `PUT /products/variants/{variant_id}`
 * endpoint (exposed separately if/when this server adds an update-variant tool).
 */
export const getProductVariantsSchema = z.object({
  product_id: z
    .number()
    .int()
    .positive()
    .describe("Salla product ID whose variants to fetch."),
});

export async function handleGetProductVariants(
  params: z.infer<typeof getProductVariantsSchema>,
): Promise<string> {
  const raw = (await client.request(
    "GET",
    `/products/${params.product_id}`,
  )) as { data?: Record<string, unknown> };

  const data = raw?.data ?? {};
  const projected = {
    product_id: data["id"] ?? params.product_id,
    name: data["name"] ?? null,
    options: data["options"] ?? [],
    variants: data["variants"] ?? [],
    total_variants: Array.isArray(data["variants"])
      ? (data["variants"] as unknown[]).length
      : 0,
  };
  return JSON.stringify(projected, null, 2);
}
