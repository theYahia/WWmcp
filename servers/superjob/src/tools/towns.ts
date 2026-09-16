import { z } from "zod";
import { sjGet } from "../client.js";

export const getTownsSchema = z.object({
  keyword: z.string().optional().describe("Поиск по названию города"),
  id_country: z.number().optional().describe("ID страны (1=Россия)"),
  all: z.boolean().optional().default(false).describe("Все города (без пагинации)"),
});

export async function handleGetTowns(params: z.infer<typeof getTownsSchema>): Promise<string> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.id_country) query.set("id_country", String(params.id_country));
  if (params.all) query.set("all", "1");
  const result = await sjGet(`/towns/?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
