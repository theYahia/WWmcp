import { z } from "zod";
import { BoxberryClient } from "../client.js";
import type { BoxberryCity } from "../types.js";

const client = new BoxberryClient();

export const listCitiesSchema = z.object({
  search: z.string().optional().describe("Поиск по названию города (подстрока)"),
});

export async function handleListCities(params: z.infer<typeof listCitiesSchema>): Promise<string> {
  const result = (await client.call("ListCitiesFull")) as BoxberryCity[];

  if (!Array.isArray(result) || result.length === 0) {
    return "Города не найдены.";
  }

  let filtered = result;
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = result.filter(c => c.Name.toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    return `Города по запросу «${params.search}» не найдены.`;
  }

  const limited = filtered.slice(0, 50);
  return JSON.stringify(limited.map(c => ({
    код: c.Code,
    город: c.Name,
    регион: c.Region,
    страна: c.CountryCode,
  })), null, 2);
}
