import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

/**
 * List store brands. Salla's `GET /brands` endpoint supports pagination and
 * an optional keyword filter on brand name. Requires the `brands.read` scope
 * on the app's OAuth credentials.
 */
export const getBrandsSchema = z.object({
  page: z.number().int().positive().default(1).describe("Page number."),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Items per page (max 100)."),
  keyword: z
    .string()
    .optional()
    .describe("Optional brand name substring search."),
});

export async function handleGetBrands(
  params: z.infer<typeof getBrandsSchema>,
): Promise<string> {
  const query = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });
  if (params.keyword) query.set("keyword", params.keyword);
  const result = await client.request("GET", `/brands?${query}`);
  return JSON.stringify(result, null, 2);
}
