import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

/**
 * List store categories. Salla's `GET /categories` endpoint supports
 * pagination (max 100 per page) and optional keyword search.
 */
export const getCategoriesSchema = z.object({
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
    .describe("Optional category name substring search."),
});

export async function handleGetCategories(
  params: z.infer<typeof getCategoriesSchema>,
): Promise<string> {
  const query = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });
  if (params.keyword) query.set("keyword", params.keyword);
  const result = await client.request("GET", `/categories?${query}`);
  return JSON.stringify(result, null, 2);
}
