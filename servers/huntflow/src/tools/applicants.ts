import { z } from "zod";
import { hfGet } from "../client.js";
import { curateList, KEYS, listOutputSchema } from "../format.js";
import { HFApplicant } from "../types.js";

// Поиск кандидатов — эндпоинт /applicants/search (у /applicants нет параметра q).
export const searchApplicantsSchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта HuntFlow"),
  q: z.string().optional().describe("Поиск по имени, email или телефону"),
  vacancy: z.coerce.number().optional().describe("Фильтр по ID вакансии"),
  status: z.coerce.number().optional().describe("Фильтр по ID этапа подбора"),
  tag: z.coerce.number().optional().describe("Фильтр по ID тега"),
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

export const searchApplicantsOutput = listOutputSchema(HFApplicant);

export async function handleSearchApplicants(
  params: z.infer<typeof searchApplicantsSchema>,
): Promise<Record<string, unknown>> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.vacancy !== undefined) query.set("vacancy", String(params.vacancy));
  if (params.status !== undefined) query.set("status", String(params.status));
  if (params.tag !== undefined) query.set("tag", String(params.tag));
  query.set("count", String(params.count));
  query.set("page", String(params.page));
  const result = await hfGet(
    `/accounts/${params.account_id}/applicants/search?${query.toString()}`,
  );
  return curateList(result, KEYS.applicant, params.raw);
}

// Кандидаты, прикреплённые к конкретной вакансии (search с фильтром vacancy).
export const listVacancyApplicantsSchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта HuntFlow"),
  vacancy_id: z.coerce.number().describe("ID вакансии"),
  status: z.coerce.number().optional().describe("Фильтр по ID этапа подбора"),
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

export const listVacancyApplicantsOutput = searchApplicantsOutput;

export async function handleListVacancyApplicants(
  params: z.infer<typeof listVacancyApplicantsSchema>,
): Promise<Record<string, unknown>> {
  return handleSearchApplicants({
    account_id: params.account_id,
    vacancy: params.vacancy_id,
    status: params.status,
    count: params.count,
    page: params.page,
    raw: params.raw,
  });
}

export const getApplicantSchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта"),
  applicant_id: z.coerce.number().describe("ID кандидата"),
});

export async function handleGetApplicant(
  params: z.infer<typeof getApplicantSchema>,
): Promise<unknown> {
  return hfGet(`/accounts/${params.account_id}/applicants/${params.applicant_id}`);
}
