import { z } from "zod";
import { sjGet } from "../client.js";

export const searchVacanciesSchema = z.object({
  keyword: z.string().optional().describe("Ключевые слова"),
  town: z.number().optional().describe("ID города (4=Москва, 14=СПб)"),
  payment_from: z.number().optional().describe("Зарплата от"),
  payment_to: z.number().optional().describe("Зарплата до"),
  count: z.number().int().min(1).max(100).default(20).describe("Количество"),
});

export async function handleSearchVacancies(params: z.infer<typeof searchVacanciesSchema>): Promise<string> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.town) query.set("town", String(params.town));
  if (params.payment_from) query.set("payment_from", String(params.payment_from));
  if (params.payment_to) query.set("payment_to", String(params.payment_to));
  query.set("count", String(params.count));

  const result = await sjGet(`/vacancies/?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

export const getVacancySchema = z.object({
  id: z.number().describe("ID вакансии"),
});

export async function handleGetVacancy(params: z.infer<typeof getVacancySchema>): Promise<string> {
  const result = await sjGet(`/vacancies/${params.id}/`);
  return JSON.stringify(result, null, 2);
}
