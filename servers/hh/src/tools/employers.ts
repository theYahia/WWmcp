import { z } from "zod";
import { hhGet } from "../client.js";
import type { Employer, Vacancy, SearchResult } from "../types.js";
import {
  formatEmployerSearch,
  formatEmployer,
  formatVacancySearch,
} from "../format.js";

const rawFlag = z
  .boolean()
  .optional()
  .describe("Return the full raw hh.ru JSON instead of the compact summary.");

const employerId = z
  .string()
  .regex(/^\d+$/, "employer_id must be a numeric hh.ru id");

export const searchEmployersSchema = z.object({
  text: z.string().describe("Company name to search for"),
  area: z.number().optional().describe("Region code"),
  per_page: z.number().int().min(1).max(100).default(20).describe("Results per page"),
  page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
  raw: rawFlag,
});

export async function handleSearchEmployers(
  params: z.infer<typeof searchEmployersSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  if (params.area != null) query.set("area", String(params.area));
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(`/employers?${query.toString()}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatEmployerSearch(result as SearchResult<Employer>);
}

export const getEmployerSchema = z.object({
  employer_id: employerId.describe("Employer ID"),
  raw: rawFlag,
});

export async function handleGetEmployer(
  params: z.infer<typeof getEmployerSchema>,
): Promise<string> {
  const result = await hhGet(`/employers/${encodeURIComponent(params.employer_id)}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatEmployer(result as Employer);
}

export const getEmployerVacanciesSchema = z.object({
  employer_id: employerId.describe("Employer ID"),
  per_page: z.number().int().min(1).max(100).default(20).describe("Results per page"),
  page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
  raw: rawFlag,
});

export async function handleGetEmployerVacancies(
  params: z.infer<typeof getEmployerVacanciesSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(
    `/employers/${encodeURIComponent(params.employer_id)}/vacancies/active?${query.toString()}`,
  );
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatVacancySearch(result as SearchResult<Vacancy>);
}
