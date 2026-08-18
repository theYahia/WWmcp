import { z } from "zod";
import { hhGet } from "../client.js";
import type { Vacancy, VacancyDetail, SearchResult } from "../types.js";
import {
  formatVacancySearch,
  formatVacancyDetail,
} from "../format.js";

const rawFlag = z
  .boolean()
  .optional()
  .describe("Return the full raw hh.ru JSON instead of the compact summary.");

// hh vacancy ids are numeric strings — validate to avoid path injection.
const vacancyId = z.string().regex(/^\d+$/, "vacancy_id must be a numeric hh.ru id");

export const searchVacanciesSchema = z
  .object({
    text: z
      .string()
      .optional()
      .describe(
        "Search query. Supports hh.ru query language (quotes, AND/OR/NOT, field:). e.g. \"python AND django\"",
      ),
    area: z
      .number()
      .optional()
      .describe("Region code (1=Moscow, 2=Saint Petersburg). Use get_areas / suggest_areas to find codes."),
    professional_role: z
      .number()
      .optional()
      .describe("Professional role id. Use get_professional_roles / suggest_positions to find ids."),
    industry: z
      .string()
      .optional()
      .describe("Industry id (employer industry). Use get_industries to find ids."),
    metro: z
      .string()
      .optional()
      .describe("Metro station or line id. Use get_metro to find ids."),
    employer_id: z.string().optional().describe("Restrict results to a single employer id."),
    salary: z.number().optional().describe("Desired salary amount (sent together with currency)."),
    currency: z
      .string()
      .optional()
      .describe("Salary currency (RUR, USD, EUR). Only applied when salary is set; defaults to RUR."),
    label: z
      .enum(["with_salary", "not_from_agency", "accept_handicapped", "accept_kids", "accept_temporary"])
      .optional()
      .describe("Vacancy label filter (replaces the deprecated only_with_salary — use with_salary)."),
    experience: z
      .enum(["noExperience", "between1And3", "between3And6", "moreThan6"])
      .optional()
      .describe("Required experience level"),
    employment_form: z
      .enum(["FULL", "PART", "PROJECT", "FLY_IN_FLY_OUT"])
      .optional()
      .describe("Employment form (modern replacement for the deprecated `employment`)."),
    work_format: z
      .enum(["ON_SITE", "REMOTE", "HYBRID", "FIELD_WORK"])
      .optional()
      .describe("Work format (modern replacement for schedule=remote etc.)."),
    employment: z
      .enum(["full", "part", "project", "volunteer", "probation"])
      .optional()
      .describe("DEPRECATED by hh.ru — prefer employment_form. Still accepted."),
    schedule: z
      .enum(["fullDay", "shift", "flexible", "remote", "flyInFlyOut"])
      .optional()
      .describe("DEPRECATED by hh.ru — prefer work_format. Still accepted."),
    search_field: z
      .enum(["name", "company_name", "description"])
      .optional()
      .describe("Restrict the text search to a single field."),
    excluded_text: z.string().optional().describe("Exclude vacancies matching this text."),
    period: z
      .number()
      .int()
      .min(1)
      .max(30)
      .optional()
      .describe("Only vacancies published within the last N days (1-30). Mutually exclusive with date_from/date_to."),
    date_from: z
      .string()
      .optional()
      .describe("Published from this date (ISO 8601, e.g. 2026-06-01). Mutually exclusive with period."),
    date_to: z
      .string()
      .optional()
      .describe("Published up to this date (ISO 8601). Mutually exclusive with period."),
    order_by: z
      .enum(["relevance", "publication_time", "salary_desc", "salary_asc"])
      .optional()
      .describe("Sort order"),
    per_page: z.number().int().min(1).max(100).default(20).describe("Results per page (1-100)"),
    page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
    raw: rawFlag,
  });

export async function handleSearchVacancies(
  params: z.infer<typeof searchVacanciesSchema>,
): Promise<string> {
  // Cross-field rules (kept out of the schema so `.shape` stays usable for MCP
  // tool registration, which requires a ZodRawShape, not a refined ZodEffects).
  if (params.period != null && (params.date_from != null || params.date_to != null)) {
    throw new Error(
      "period is mutually exclusive with date_from/date_to (hh.ru rejects both).",
    );
  }
  if ((params.page + 1) * params.per_page > 2000) {
    throw new Error(
      "hh.ru caps pagination depth at 2000 results (page*per_page must be ≤ 2000). Narrow filters or use date windows (date_from/date_to).",
    );
  }

  const query = new URLSearchParams();
  if (params.text) query.set("text", params.text);
  if (params.area != null) query.set("area", String(params.area));
  if (params.professional_role != null)
    query.set("professional_role", String(params.professional_role));
  if (params.industry) query.set("industry", params.industry);
  if (params.metro) query.set("metro", params.metro);
  if (params.employer_id) query.set("employer_id", params.employer_id);
  // Only send currency together with a salary, otherwise hh.ru can skew results.
  if (params.salary != null) {
    query.set("salary", String(params.salary));
    query.set("currency", params.currency || "RUR");
  }
  if (params.label) query.set("label", params.label);
  if (params.experience) query.set("experience", params.experience);
  if (params.employment_form) query.set("employment_form", params.employment_form);
  if (params.work_format) query.set("work_format", params.work_format);
  if (params.employment) query.set("employment", params.employment);
  if (params.schedule) query.set("schedule", params.schedule);
  if (params.search_field) query.set("search_field", params.search_field);
  if (params.excluded_text) query.set("excluded_text", params.excluded_text);
  if (params.period != null) query.set("period", String(params.period));
  if (params.date_from) query.set("date_from", params.date_from);
  if (params.date_to) query.set("date_to", params.date_to);
  if (params.order_by) query.set("order_by", params.order_by);
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(`/vacancies?${query.toString()}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatVacancySearch(result as SearchResult<Vacancy>);
}

export const getVacancySchema = z.object({
  vacancy_id: vacancyId.describe("Vacancy ID"),
  raw: rawFlag,
});

export async function handleGetVacancy(
  params: z.infer<typeof getVacancySchema>,
): Promise<string> {
  const result = await hhGet(`/vacancies/${encodeURIComponent(params.vacancy_id)}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatVacancyDetail(result as VacancyDetail);
}

export const getSimilarVacanciesSchema = z.object({
  vacancy_id: vacancyId.describe("Vacancy ID to find similar vacancies for"),
  per_page: z.number().int().min(1).max(100).default(20).describe("Results per page"),
  page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
  raw: rawFlag,
});

export async function handleGetSimilarVacancies(
  params: z.infer<typeof getSimilarVacanciesSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(
    `/vacancies/${encodeURIComponent(params.vacancy_id)}/similar_vacancies?${query.toString()}`,
  );
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatVacancySearch(result as SearchResult<Vacancy>);
}
