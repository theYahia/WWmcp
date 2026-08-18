import { z } from "zod";
import { hfGet } from "../client.js";
import { curateList, KEYS, listOutputSchema } from "../format.js";
import { HFDictItem } from "../types.js";

// Справочники аккаунта — нужны для расшифровки числовых id (источники, причины отказа,
// подразделения, теги) при чтении кандидатов/вакансий.

export const dictSchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта HuntFlow"),
  raw: z.boolean().optional().describe("Вернуть полный сырой ответ без курирования"),
});

export const dictOutput = listOutputSchema(HFDictItem);

type DictParams = z.infer<typeof dictSchema>;

async function fetchDict(path: string, raw?: boolean): Promise<Record<string, unknown>> {
  const result = await hfGet(path);
  return curateList(result, KEYS.dict, raw);
}

export function handleListSources(p: DictParams): Promise<Record<string, unknown>> {
  return fetchDict(`/accounts/${p.account_id}/applicants/sources`, p.raw);
}

export function handleListRejectionReasons(p: DictParams): Promise<Record<string, unknown>> {
  return fetchDict(`/accounts/${p.account_id}/rejection_reasons`, p.raw);
}

export function handleListDivisions(p: DictParams): Promise<Record<string, unknown>> {
  return fetchDict(`/accounts/${p.account_id}/divisions`, p.raw);
}

export function handleListTags(p: DictParams): Promise<Record<string, unknown>> {
  return fetchDict(`/accounts/${p.account_id}/tags`, p.raw);
}
