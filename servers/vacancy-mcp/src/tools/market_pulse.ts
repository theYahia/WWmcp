// market_pulse — aggregate stats по роли: total / median salary / top hiring.
import { z } from "zod";
import { getDb } from "../db.js";

export const marketPulseSchema = z.object({
  role: z
    .string()
    .optional()
    .describe(
      "Роль для фильтра (substring match по title и role). Например: 'product manager', 'ML', 'senior'.",
    ),
  hours: z.number().int().min(1).max(8760).default(168).describe("Окно в часах (default 168 = 7 days)"),
});

function median(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

export async function handleMarketPulse(
  params: z.infer<typeof marketPulseSchema>,
): Promise<string> {
  const db = getDb();
  const cutoff = new Date(Date.now() - params.hours * 3600 * 1000).toISOString();

  const where: string[] = ["imported_at >= @cutoff"];
  const args: Record<string, unknown> = { cutoff };
  if (params.role) {
    where.push("(LOWER(title) LIKE @role OR LOWER(COALESCE(role, '')) LIKE @role)");
    args.role = `%${params.role.toLowerCase()}%`;
  }
  const whereSql = where.join(" AND ");

  const total = (db
    .prepare(`SELECT COUNT(*) AS n FROM vacancies WHERE ${whereSql}`)
    .get(args) as { n: number }).n;

  // Зарплаты: используем salary_min где есть. salary_max используем для оценки upper.
  const salaryRows = db
    .prepare(
      `SELECT salary_min, salary_max FROM vacancies
       WHERE ${whereSql} AND (salary_min IS NOT NULL OR salary_max IS NOT NULL)`,
    )
    .all(args) as { salary_min: number | null; salary_max: number | null }[];

  const mins = salaryRows.map((r) => r.salary_min).filter((x): x is number => typeof x === "number");
  const maxs = salaryRows.map((r) => r.salary_max).filter((x): x is number => typeof x === "number");

  const topCompanies = db
    .prepare(
      `SELECT company, COUNT(*) AS cnt FROM vacancies
       WHERE ${whereSql} AND company IS NOT NULL
       GROUP BY company ORDER BY cnt DESC LIMIT 10`,
    )
    .all(args);

  const sourceBreakdown = db
    .prepare(
      `SELECT source, COUNT(*) AS cnt FROM vacancies WHERE ${whereSql} GROUP BY source ORDER BY cnt DESC`,
    )
    .all(args);

  return JSON.stringify(
    {
      role_filter: params.role || "any",
      window_hours: params.hours,
      cutoff,
      total_vacancies: total,
      salary_stats: {
        with_salary: salaryRows.length,
        median_min_rub: median(mins),
        median_max_rub: median(maxs),
        max_observed_rub: maxs.length ? Math.max(...maxs) : null,
      },
      top_hiring_companies: topCompanies,
      source_breakdown: sourceBreakdown,
      note:
        salaryRows.length < 5
          ? "⚠️ Низкая выборка по зарплатам — статистика низкоконфидентная. Запусти import_from_night_loop для пополнения корпуса."
          : null,
    },
    null,
    2,
  );
}
