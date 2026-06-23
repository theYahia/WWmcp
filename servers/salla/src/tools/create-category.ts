import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const createCategorySchema = z.object({
  name: z.string().min(1).describe("Category name"),
  status: z.enum(["active", "hidden"]).optional().describe("Category status"),
  parent_id: z.number().int().positive().optional().describe("Parent category ID (for subcategories)"),
  sort_order: z.number().int().optional().describe("Sort order within its parent"),
  image: z.string().optional().describe("Category image URL"),
});

export async function handleCreateCategory(
  params: z.infer<typeof createCategorySchema>,
): Promise<string> {
  const body = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
  const result = await client.request("POST", "/categories", body);
  return JSON.stringify(result, null, 2);
}
