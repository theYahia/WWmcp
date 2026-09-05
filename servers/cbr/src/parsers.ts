/**
 * Чистые парсеры ответов ЦБ РФ — без сети, чтобы их можно было покрыть
 * офлайн-фикстурами (см. tests/keyrate.test.ts).
 */

import type { DynamicsPoint, KeyRatePoint } from "./types.js";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** "1 234,56" / "14,25" → 14.25 (русский числовой формат ЦБ). */
export function parseRu(num: string): number {
  return parseFloat(num.replace(/\s/g, "").replace(",", "."));
}

/** "DD.MM.YYYY" → "YYYY-MM-DD". */
export function ddmmyyyyToIso(s: string): string {
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) throw new Error(`Не удалось разобрать дату "${s}"`);
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** Date → "YYYY-MM-DD" по UTC. */
export function isoFromDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/**
 * "YYYY-MM-DD" → "DD<sep>MM<sep>YYYY" ("/" для .asp date_req, "." для hd_base UniDbQuery).
 * Валидирует формат: дата приходит от пользователя и подставляется в URL, а без
 * проверки в запрос уезжает NaN и ЦБ отдаёт пустой ответ вместо понятной ошибки.
 */
export function isoToCbrDate(iso: string, sep: "/" | "." = "/"): string {
  if (!ISO_DATE_RE.test(iso)) {
    throw new Error(`Неверный формат даты "${iso}". Ожидается YYYY-MM-DD (например 2026-01-09).`);
  }
  const [yyyy, mm, dd] = iso.split("-");
  const check = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(check.getTime()) || isoFromDate(check) !== iso) {
    throw new Error(`Несуществующая дата "${iso}".`);
  }
  return `${dd}${sep}${mm}${sep}${yyyy}`;
}

/**
 * Разбирает таблицу ключевой ставки со страницы cbr.ru/hd_base/KeyRate.
 * Возвращает дневной ряд, отсортированный по убыванию даты (новые первыми).
 */
export function parseKeyRateHtml(html: string): KeyRatePoint[] {
  const re = /<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4})\s*<\/td>\s*<td[^>]*>\s*([\d\s]+,\d+)\s*<\/td>/g;
  const points: KeyRatePoint[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    points.push({ date: ddmmyyyyToIso(m[1]), rate: parseRu(m[2]) });
  }
  points.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return points;
}

/** Сворачивает дневной ряд ставки в точки изменения (дата вступления в силу), новые первыми. */
export function keyRateChanges(points: KeyRatePoint[]): KeyRatePoint[] {
  const asc = [...points].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const changes: KeyRatePoint[] = [];
  for (const p of asc) {
    if (changes.length === 0 || changes[changes.length - 1].rate !== p.rate) {
      changes.push({ date: p.date, rate: p.rate });
    }
  }
  return changes.reverse();
}

/** Дата, с которой действует текущая (самая свежая) ставка. points — desc по дате. */
export function keyRateSince(points: KeyRatePoint[]): string {
  if (points.length === 0) throw new Error("Пустой ряд ключевой ставки.");
  const current = points[0].rate;
  let since = points[0].date;
  for (const p of points) {
    if (p.rate !== current) break;
    since = p.date;
  }
  return since;
}

/** Разбирает XML_dynamic.asp в ряд динамики курса. */
export function parseDynamicsXml(xml: string): DynamicsPoint[] {
  const re =
    /<Record\s+Date="([^"]+)"[^>]*>\s*<Nominal>([^<]+)<\/Nominal>\s*<Value>([^<]+)<\/Value>(?:\s*<VunitRate>([^<]+)<\/VunitRate>)?\s*<\/Record>/g;
  const out: DynamicsPoint[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const [, date, nominal, value, vunit] = m;
    const nom = parseRu(nominal);
    const val = parseRu(value);
    out.push({
      date: ddmmyyyyToIso(date),
      nominal: nom,
      value: val,
      rate: vunit != null ? parseRu(vunit) : val / nom,
    });
  }
  return out;
}
