import { z } from "zod";
import { sjGet } from "../client.js";

export const getProfessionsSchema = z.object({
  keyword: z.string().optional().describe("Поиск по названию профессии"),
  parent: z.number().optional().describe("ID родительской категории"),
});

export async function handleGetProfessions(params: z.infer<typeof getProfessionsSchema>): Promise<string> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.parent) query.set("parent", String(params.parent));
  const result = await sjGet(`/catalogues/?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
