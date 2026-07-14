// search_vacancies + get_vacancy + list_companies — read-only queries.
import { z } from "zod";
import { getDb, type Vacancy } from "../db.js";

// ─── search_vacancies ────────────────────────────────────────────────────────
export const searchVacanciesSchema = z.object({
  query: z.string().describe("Поисковая фраза (full-text по title + company + raw)"),
  location: z.string().optional().describe("Фильтр по городу/региону (substring match)"),
  salary_min: z.number().int().optional().describe("Минимальная нижняя граница оклада в рублях"),
  source: z
    .enum(["habr-career", "tg-digest", "career-page", "telegram-jobs", "any"])
    .default("any")
    .describe("Источник: habr-career / tg-digest / career-page / telegram-jobs / any"),
  limit: z.number().int().min(1).max(100).default(20),
});

export async function handleSearchVacancies(
  params: z.infer<typeof searchVacanciesSchema>,
): Promise<string> {
  const db = getDb();
  // FTS5 MATCH с экранированием спецсимволов через двойные кавычки (phrase query).
  const ftsQuery = `"${params.query.replace(/"/g, '""')}"`;

  const where: string[] = [];
  const args: Record<string, unknown> = { fts: ftsQuery, limit: params.limit };

  if (params.source !== "any") {
    where.push("v.source = @source");
    args.source = params.source;
  }
  if (params.location) {
    where.push("v.location LIKE @location");
    args.location = `%${params.location}%`;
  }
  if (params.salary_min) {
    where.push("(v.salary_min >= @smin OR v.salary_max >= @smin)");
    args.smin = params.salary_min;
  }

  const whereSql = where.length ? `AND ${where.join(" AND ")}` : "";
  const sql = `
    SELECT v.id, v.title, v.company, v.salary_raw, v.location, v.posted_at, v.source, v.url
    FROM vacancies_fts f
    JOIN vacancies v ON v.rowid = f.rowid
    WHERE vacancies_fts MATCH @fts ${whereSql}
    ORDER BY v.posted_at DESC NULLS LAST, v.imported_at DESC
    LIMIT @limit
  `;
  const rows = db.prepare(sql).all(args) as Partial<Vacancy>[];

  if (rows.length === 0) {
    return JSON.stringify({ count: 0, results: [], hint: "Try broader query or run import script." });
  }
  return JSON.stringify({ count: rows.length, results: rows }, null, 2);
}

// ─── get_vacancy ─────────────────────────────────────────────────────────────
export const getVacancySchema = z.object({
  id: z.string().describe("Vacancy ID (например habr:12345 или tg-digest:salary_pm:280)"),
});

export async function handleGetVacancy(
  params: z.infer<typeof getVacancySchema>,
): Promise<string> {
  const db = getDb();
  const row = db.prepare("SELECT * FROM vacancies WHERE id = ?").get(params.id) as Vacancy | undefined;
  if (!row) {
    throw new Error(`Vacancy ${params.id} not found`);
  }
  // Распаковать raw обратно в объект для удобства потребителя.
  let rawObj: unknown = null;
  try {
    rawObj = JSON.parse(row.raw);
  } catch {
    /* raw can be non-json — leave as string */
  }
  return JSON.stringify({ ...row, raw: rawObj ?? row.raw }, null, 2);
}

// ─── list_companies ──────────────────────────────────────────────────────────
export const listCompaniesSchema = z.object({
  filter: z.string().optional().describe("Substring match по названию компании"),
  min_count: z.number().int().min(1).default(1).describe("Минимум вакансий чтобы показать компанию"),
  limit: z.number().int().min(1).max(200).default(50),
});

export async function handleListCompanies(
  params: z.infer<typeof listCompaniesSchema>,
): Promise<string> {
  const db = getDb();
  const where: string[] = ["company IS NOT NULL"];
  const args: Record<string, unknown> = { min_count: params.min_count, limit: params.limit };
  if (params.filter) {
    where.push("company LIKE @filter");
    args.filter = `%${params.filter}%`;
  }
  const sql = `
    SELECT company, COUNT(*) AS vacancy_count,
           MIN(posted_at) AS first_seen, MAX(posted_at) AS last_seen
    FROM vacancies
    WHERE ${where.join(" AND ")}
    GROUP BY company
    HAVING vacancy_count >= @min_count
    ORDER BY vacancy_count DESC
    LIMIT @limit
  `;
  const rows = db.prepare(sql).all(args);
  return JSON.stringify({ count: rows.length, companies: rows }, null, 2);
}
