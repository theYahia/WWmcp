import { z } from "zod";
import { DellinClient } from "../client.js";
import type { DellinCity } from "../types.js";

let client: DellinClient;
function getClient() { return client ??= new DellinClient(); }

export const getCitiesSchema = z.object({
  query: z.string().describe("Название города или его часть для поиска"),
});

export async function handleGetCities(params: z.infer<typeof getCitiesSchema>): Promise<string> {
  const result = (await getClient().post("/places", { q: params.query })) as {
    cities?: DellinCity[];
  };

  const cities = result.cities;
  if (!cities || cities.length === 0) {
    return `Города по запросу «${params.query}» не найдены.`;
  }

  const limited = cities.slice(0, 50);
  return JSON.stringify(limited.map(c => ({
    id: c.cityID,
    название: c.name,
    код: c.code,
    регион: c.region,
  })), null, 2);
}
