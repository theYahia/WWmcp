import { z } from "zod";
import { sjGet } from "../client.js";

export const searchEmployersSchema = z.object({
  keyword: z.string().optional().describe("Название компании"),
  town: z.number().optional().describe("ID города (4=Москва, 14=СПб)"),
  count: z.number().int().min(1).max(100).default(20).describe("Количество"),
  page: z.number().int().min(0).default(0).describe("Страница"),
});

export async function handleSearchEmployers(params: z.infer<typeof searchEmployersSchema>): Promise<string> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.town) query.set("town", String(params.town));
  query.set("count", String(params.count));
  query.set("page", String(params.page));
  const result = await sjGet(`/employers/?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
