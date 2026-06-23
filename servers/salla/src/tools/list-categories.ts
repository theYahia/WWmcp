import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const listCategoriesSchema = z.object({
  page: z.number().int().positive().default(1).describe("Page number"),
  keyword: z.string().optional().describe("Filter categories whose name matches this keyword"),
  status: z.enum(["active", "hidden"]).optional().describe("Filter by category status"),
});

export async function handleListCategories(
  params: z.infer<typeof listCategoriesSchema>,
): Promise<string> {
  const query = new URLSearchParams({ page: String(params.page) });
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  const result = await client.request("GET", `/categories?${query}`);
  return JSON.stringify(result, null, 2);
}
