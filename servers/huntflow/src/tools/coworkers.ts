import { z } from "zod";
import { hfGet } from "../client.js";
import { curateList, KEYS, listOutputSchema } from "../format.js";
import { HFCoworker } from "../types.js";

export const listCoworkersSchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта HuntFlow"),
  count: z.coerce.number().int().min(1).max(100).default(30).describe("Кол-во на странице"),
  page: z.coerce.number().int().min(1).default(1).describe("Номер страницы (с 1)"),
  raw: z.boolean().optional().describe("Вернуть полный сырой ответ без курирования"),
});

export const listCoworkersOutput = listOutputSchema(HFCoworker);

export async function handleListCoworkers(
  params: z.infer<typeof listCoworkersSchema>,
): Promise<Record<string, unknown>> {
  const query = new URLSearchParams();
  query.set("count", String(params.count));
  query.set("page", String(params.page));
  const result = await hfGet(`/accounts/${params.account_id}/coworkers?${query.toString()}`);
  return curateList(result, KEYS.coworker, params.raw);
}
