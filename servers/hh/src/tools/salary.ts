import { z } from "zod";
import { hhGet } from "../client.js";
import type { Vacancy, SearchResult } from "../types.js";
import { formatSalary } from "../format.js";

// hh.ru has NO free salary-distribution endpoint — the only one
// (/salary_statistics/paid/...) needs a paid "Банк данных зарплат" subscription.
// So we estimate the distribution client-side from posted vacancy salaries.
// This is an inherently biased sample (only vacancies that disclose salary;
// gross/net are mixed) and is explicitly labelled as such in the output.

export const getSalaryStatisticsSchema = z.object({
  professional_role_id: z
    .number()
    .describe("Professional role ID. Use get_professional_roles or suggest_positions to find IDs."),
  area_id: z
    .number()
    .optional()
    .describe("Region code (1=Moscow, 2=Saint Petersburg). Use get_areas to find codes."),
  text: z
    .string()
    .optional()
    .describe("Optional keyword to narrow the role (e.g. 'senior python')."),
  sample_pages: z
    .number()
    .int()
    .min(1)
    .max(5)
    .default(2)
    .describe("Pages of 100 salaried vacancies to sample (1-5). More = better estimate, more API calls."),
  raw: z
    .boolean()
    .optional()
    .describe("Return the computed stats object as JSON instead of the formatted summary."),
});

interface SalaryStats {
  professional_role_id: number;
  area_id?: number;
  currency: string;
  total_vacancies: number;
  with_salary: number;
  coverage_pct: number | null;
  sample_size: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  mean: number;
  other_currencies: Record<string, number>;
}

function midpoint(s: { from?: number | null; to?: number | null }): number | null {
  if (s.from != null && s.to != null) return (s.from + s.to) / 2;
  if (s.from != null) return s.from;
  if (s.to != null) return s.to;
  return null;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  if (sorted.length === 1) return sorted[0]!;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo]!;
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (idx - lo);
}

export async function handleGetSalaryStatistics(
  params: z.infer<typeof getSalaryStatisticsSchema>,
): Promise<string> {
  const base = new URLSearchParams();
  base.set("professional_role", String(params.professional_role_id));
  if (params.area_id != null) base.set("area", String(params.area_id));
  if (params.text) base.set("text", params.text);

  // 1) Total vacancies for the role (with and without salary) — for coverage %.
  const totalQ = new URLSearchParams(base);
  totalQ.set("per_page", "1");
  totalQ.set("page", "0");
  const totalRes = (await hhGet(`/vacancies?${totalQ.toString()}`)) as SearchResult<Vacancy>;
  const totalVacancies = totalRes.found ?? 0;

  // 2) Sample salaried vacancies (label=with_salary replaces deprecated only_with_salary).
  const perPage = 100;
  const byCurrency = new Map<string, number[]>();
  let withSalaryFound = 0;
  let sampled = 0;

  for (let page = 0; page < params.sample_pages; page++) {
    if ((page + 1) * perPage > 2000) break; // hh.ru pagination depth cap
    const q = new URLSearchParams(base);
    q.set("label", "with_salary");
    q.set("per_page", String(perPage));
    q.set("page", String(page));
    const res = (await hhGet(`/vacancies?${q.toString()}`)) as SearchResult<Vacancy>;
    if (page === 0) withSalaryFound = res.found ?? 0;
    const items = res.items ?? [];
    for (const v of items) {
      const value = v.salary ? midpoint(v.salary) : null;
      if (value == null) continue;
      const cur = v.salary?.currency || "RUR";
      if (!byCurrency.has(cur)) byCurrency.set(cur, []);
      byCurrency.get(cur)!.push(value);
      sampled++;
    }
    if (items.length < perPage) break; // no more pages
  }

  if (sampled === 0) {
    const msg =
      `Нет вакансий с указанной зарплатой для professional_role=${params.professional_role_id}` +
      (params.area_id != null ? `, area=${params.area_id}` : "") +
      (params.text ? `, text="${params.text}"` : "") +
      `. Всего вакансий по фильтру: ${totalVacancies}.`;
    throw new Error(msg);
  }

  // Pick the dominant currency for the distribution; report the rest as counts.
  const sortedCurrencies = [...byCurrency.entries()].sort((a, b) => b[1].length - a[1].length);
  const [currency, values] = sortedCurrencies[0]!;
  const sorted = [...values].sort((a, b) => a - b);
  const otherCurrencies: Record<string, number> = {};
  for (const [cur, vals] of sortedCurrencies.slice(1)) otherCurrencies[cur] = vals.length;

  const stats: SalaryStats = {
    professional_role_id: params.professional_role_id,
    area_id: params.area_id,
    currency,
    total_vacancies: totalVacancies,
    with_salary: withSalaryFound,
    coverage_pct: totalVacancies > 0 ? Math.round((withSalaryFound / totalVacancies) * 100) : null,
    sample_size: sorted.length,
    median: Math.round(percentile(sorted, 50)),
    p25: Math.round(percentile(sorted, 25)),
    p75: Math.round(percentile(sorted, 75)),
    min: Math.round(sorted[0]!),
    max: Math.round(sorted[sorted.length - 1]!),
    mean: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
    other_currencies: otherCurrencies,
  };

  if (params.raw) return JSON.stringify(stats, null, 2);

  const sal = (n: number) => formatSalary({ from: n, currency });
  const lines = [
    "Зарплатная статистика — оценка по объявлениям hh.ru",
    `Роль (professional_role): ${stats.professional_role_id}` +
      (stats.area_id != null ? ` · регион: ${stats.area_id}` : ""),
    `Вакансий всего: ${stats.total_vacancies.toLocaleString("ru-RU")}, с зарплатой: ${stats.with_salary.toLocaleString("ru-RU")}` +
      (stats.coverage_pct != null ? ` (${stats.coverage_pct}%)` : ""),
    `Выборка: ${stats.sample_size} вакансий, валюта ${currency}`,
    "",
    `Медиана: ${sal(stats.median)}`,
    `P25–P75: ${sal(stats.p25)} – ${sal(stats.p75)}`,
    `Мин–Макс: ${sal(stats.min)} – ${sal(stats.max)}`,
    `Среднее: ${sal(stats.mean)}`,
  ];
  if (Object.keys(otherCurrencies).length) {
    const others = Object.entries(otherCurrencies)
      .map(([c, n]) => `${c}: ${n}`)
      .join(", ");
    lines.push(`Другие валюты в выборке (исключены из расчёта): ${others}`);
  }
  lines.push(
    "",
    "⚠ Смещённая оценка из объявлений, не официальная статистика рынка:",
    "учитываются только вакансии с указанной зарплатой; gross и net смешаны;",
    "hh.ru ограничивает выборку 2000 результатами. Для официальных данных нужен",
    "платный сервис «Банк данных зарплат» (salary.hh.ru).",
  );
  return lines.join("\n");
}
