// Compact, LLM-friendly formatters for hh.ru responses.
//
// hh.ru payloads are large and deeply nested; dumping raw JSON for every search
// result burns tokens and buries the signal. These helpers render concise text.
// Every tool that uses them still exposes `raw: true` to get the full JSON.
//
// Inputs are typed against ./types.ts (which was previously dead code) but kept
// defensive — the API returns more fields than we model, and some are optional.

import type {
  Vacancy,
  VacancyDetail,
  Employer,
  Resume,
  Area,
  SearchResult,
} from "./types.js";

const RU = "ru-RU";

function stripTags(s: string): string {
  return s
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export interface SalaryLike {
  from?: number | null;
  to?: number | null;
  currency?: string | null;
  gross?: boolean | null;
}

export function formatSalary(salary?: SalaryLike | null): string {
  if (!salary || (salary.from == null && salary.to == null)) {
    return "з/п не указана";
  }
  const cur = salary.currency || "RUR";
  const sym = cur === "RUR" ? "₽" : cur;
  const fmt = (n: number) => n.toLocaleString(RU);
  let range: string;
  if (salary.from != null && salary.to != null) {
    range = `${fmt(salary.from)}–${fmt(salary.to)}`;
  } else if (salary.from != null) {
    range = `от ${fmt(salary.from)}`;
  } else {
    range = `до ${fmt(salary.to as number)}`;
  }
  const gross =
    salary.gross === true
      ? " (до вычета налога)"
      : salary.gross === false
        ? " (на руки)"
        : "";
  return `${range} ${sym}${gross}`;
}

function paginationHeader(
  noun: string,
  result: Pick<SearchResult<unknown>, "found" | "page" | "pages" | "items">,
): string {
  const found = typeof result.found === "number" ? result.found.toLocaleString(RU) : "?";
  const page = (result.page ?? 0) + 1;
  const pages = result.pages ?? 1;
  const shown = result.items?.length ?? 0;
  return `Найдено ${noun}: ${found} (страница ${page} из ${pages}, показано ${shown})`;
}

export function formatVacancyListItem(v: Vacancy, idx: number): string {
  const lines: string[] = [];
  lines.push(`${idx}. ${v.name} — ${v.employer?.name ?? "—"}`);
  const meta = [
    formatSalary(v.salary),
    v.area?.name,
    v.schedule?.name,
    v.experience?.name,
  ].filter(Boolean);
  lines.push(`   ${meta.join(" · ")}`);
  const snippet = [v.snippet?.requirement, v.snippet?.responsibility]
    .filter(Boolean)
    .map((s) => stripTags(String(s)))
    .join(" ")
    .trim();
  if (snippet) lines.push(`   ${truncate(snippet, 220)}`);
  lines.push(`   id=${v.id} · ${v.alternate_url ?? ""}`.trimEnd());
  return lines.join("\n");
}

export function formatVacancySearch(result: SearchResult<Vacancy>): string {
  const header = paginationHeader("вакансий", result);
  if (!result.items?.length) return `${header}\n(пусто)`;
  return (
    header +
    "\n\n" +
    result.items.map((v, i) => formatVacancyListItem(v, i + 1)).join("\n\n")
  );
}

export function formatVacancyDetail(v: VacancyDetail): string {
  const lines: string[] = [];
  lines.push(`# ${v.name}`);
  lines.push(
    `Работодатель: ${v.employer?.name ?? "—"}` +
      (v.employer?.alternate_url ? ` (${v.employer.alternate_url})` : ""),
  );
  lines.push(`Зарплата: ${formatSalary(v.salary)}`);
  if (v.area?.name) lines.push(`Регион: ${v.area.name}`);
  const conditions = [v.experience?.name, v.employment?.name, v.schedule?.name].filter(Boolean);
  if (conditions.length) lines.push(`Условия: ${conditions.join(" · ")}`);
  if (v.key_skills?.length) {
    lines.push(`Ключевые навыки: ${v.key_skills.map((s) => s.name).join(", ")}`);
  }
  if (v.description) {
    lines.push(`\nОписание:\n${truncate(stripTags(v.description), 4000)}`);
  }
  if (v.contacts) {
    const phones = v.contacts.phones?.map((p) => p.number).filter(Boolean).join(", ");
    const contact = [v.contacts.name, v.contacts.email, phones].filter(Boolean).join(" · ");
    if (contact) lines.push(`\nКонтакты: ${contact}`);
  }
  lines.push(`\nСсылка: ${v.alternate_url ?? ""}  ·  id=${v.id}`);
  return lines.join("\n");
}

export function formatEmployerListItem(e: Employer, idx: number): string {
  const meta = [
    e.area?.name,
    typeof e.open_vacancies === "number" ? `${e.open_vacancies} вакансий` : null,
  ].filter(Boolean);
  const tail = meta.length ? `\n   ${meta.join(" · ")}` : "";
  return `${idx}. ${e.name} (id=${e.id})${tail}\n   ${e.alternate_url ?? ""}`.trimEnd();
}

export function formatEmployerSearch(result: SearchResult<Employer>): string {
  const header = paginationHeader("работодателей", result);
  if (!result.items?.length) return `${header}\n(пусто)`;
  return (
    header +
    "\n\n" +
    result.items.map((e, i) => formatEmployerListItem(e, i + 1)).join("\n")
  );
}

export function formatEmployer(e: Employer): string {
  const lines: string[] = [];
  lines.push(`# ${e.name} (id=${e.id})`);
  if (e.area?.name) lines.push(`Регион: ${e.area.name}`);
  if (typeof e.open_vacancies === "number") {
    lines.push(`Открытых вакансий: ${e.open_vacancies}`);
  }
  if (e.industries?.length) {
    lines.push(`Отрасли: ${e.industries.map((i) => i.name).join(", ")}`);
  }
  if (e.site_url) lines.push(`Сайт: ${e.site_url}`);
  if (e.description) lines.push(`\n${truncate(stripTags(e.description), 1500)}`);
  lines.push(`\nСсылка: ${e.alternate_url ?? ""}`);
  return lines.join("\n");
}

export function formatResumeListItem(r: Resume, idx: number): string {
  const meta = [
    r.area?.name,
    r.age ? `${r.age} лет` : null,
    r.total_experience ? `опыт ${Math.round(r.total_experience.months / 12)} лет` : null,
    r.salary ? formatSalary({ from: r.salary.amount, currency: r.salary.currency }) : null,
  ].filter(Boolean);
  const tail = meta.length ? `\n   ${meta.join(" · ")}` : "";
  return `${idx}. ${r.title} (id=${r.id})${tail}\n   ${r.alternate_url ?? ""}`.trimEnd();
}

export function formatResumeSearch(result: SearchResult<Resume>): string {
  const header = paginationHeader("резюме", result);
  if (!result.items?.length) return `${header}\n(пусто)`;
  return (
    header +
    "\n\n" +
    result.items.map((r, i) => formatResumeListItem(r, i + 1)).join("\n")
  );
}

export function formatResume(r: Resume): string {
  const lines: string[] = [];
  lines.push(`# ${r.title} (id=${r.id})`);
  const head = [
    r.area?.name,
    r.age ? `${r.age} лет` : null,
    r.gender?.name,
    r.salary ? formatSalary({ from: r.salary.amount, currency: r.salary.currency }) : null,
  ].filter(Boolean);
  if (head.length) lines.push(head.join(" · "));
  if (r.total_experience) {
    lines.push(`Общий опыт: ${Math.round(r.total_experience.months / 12)} лет`);
  }
  if (r.experience?.length) {
    lines.push("\nОпыт работы:");
    for (const e of r.experience.slice(0, 10)) {
      const period = [e.start, e.end ?? "по наст. время"].filter(Boolean).join(" – ");
      lines.push(`  • ${[e.position, e.company].filter(Boolean).join(" @ ")} (${period})`);
    }
  }
  if (r.education?.primary?.length) {
    lines.push("\nОбразование:");
    for (const ed of r.education.primary.slice(0, 5)) {
      lines.push(`  • ${[ed.name, ed.organization, ed.year].filter(Boolean).join(", ")}`);
    }
  }
  if (r.skill_set?.length) lines.push(`\nНавыки: ${r.skill_set.join(", ")}`);
  lines.push(`\nСсылка: ${r.alternate_url ?? ""}`);
  return lines.join("\n");
}

/** Flatten the (large) /areas or /professional_roles tree into "id — name" lines. */
export function flattenAreaTree(areas: Area[], depth = 0): string {
  const out: string[] = [];
  for (const a of areas) {
    out.push(`${"  ".repeat(depth)}${a.id} — ${a.name}`);
    if (a.areas?.length) out.push(flattenAreaTree(a.areas, depth + 1));
  }
  return out.join("\n");
}
