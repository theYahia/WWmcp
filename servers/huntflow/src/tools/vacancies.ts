import { z } from "zod";
import { hfGet } from "../client.js";
import { curateList, KEYS, listOutputSchema } from "../format.js";
import { HFVacancy } from "../types.js";

export const listVacanciesSchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта HuntFlow"),
  opened: z.boolean().default(true).describe("Только открытые вакансии"),
  state: z
    .enum(["OPEN", "CLOSED", "HOLD"])
    .optional()
    .describe("Фильтр по состоянию (альтернатива opened)"),
  mine: z.boolean().optional().describe("Только вакансии, где я участник"),
  count: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(30)
    .describe("Кол-во на странице (макс 100)"),
  page: z.coerce.number().int().min(1).default(1).describe("Номер страницы (с 1)"),
  raw: z.boolean().optional().describe("Вернуть полный сырой ответ без курирования"),
});

export const listVacanciesOutput = listOutputSchema(HFVacancy);

export async function handleListVacancies(
  params: z.infer<typeof listVacanciesSchema>,
): Promise<Record<string, unknown>> {
  const query = new URLSearchParams();
  if (params.opened !== undefined) query.set("opened", String(params.opened));
  if (params.state) query.set("state", params.state);
  if (params.mine !== undefined) query.set("mine", String(params.mine));
  query.set("count", String(params.count));
  query.set("page", String(params.page));
  const result = await hfGet(`/accounts/${params.account_id}/vacancies?${query.toString()}`);
  return curateList(result, KEYS.vacancy, params.raw);
}

export const getVacancySchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта"),
  vacancy_id: z.coerce.number().describe("ID вакансии"),
});

export async function handleGetVacancy(params: z.infer<typeof getVacancySchema>): Promise<unknown> {
  return hfGet(`/accounts/${params.account_id}/vacancies/${params.vacancy_id}`);
}
