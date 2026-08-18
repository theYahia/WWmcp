import type {
  CbrCurrency,
  CbrDailyResponse,
  DynamicsPoint,
  KeyRatePoint,
  MetalPrice,
} from "./types.js";

// ── Даты ────────────────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export interface DateParts {
  yyyy: number;
  mm: number;
  dd: number;
  iso: string;
}

/**
 * Валидирует строку YYYY-MM-DD и возвращает компоненты.
 * Парсит компоненты напрямую из строки (без локальных геттеров Date),
 * чтобы избежать таймзона-сдвига.
 */
export function parseDateParts(date: string): DateParts {
  if (!DATE_RE.test(date)) {
    throw new Error(`Неверный формат даты "${date}". Ожидается YYYY-MM-DD (например 2025-01-09).`);
  }
  const [yyyy, mm, dd] = date.split("-").map(Number);
  const check = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (
    check.getUTCFullYear() !== yyyy ||
    check.getUTCMonth() !== mm - 1 ||
    check.getUTCDate() !== dd
  ) {
    throw new Error(`Несуществующая дата "${date}".`);
  }
  return { yyyy, mm, dd, iso: date };
}

/** Date → "YYYY-MM-DD" по UTC. */
export function isoFromDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/** Сдвиг ISO-даты на deltaDays (UTC-арифметика, без таймзона-багов). */
export function shiftDays(iso: string, deltaDays: number): string {
  const { yyyy, mm, dd } = parseDateParts(iso);
  return isoFromDate(new Date(Date.UTC(yyyy, mm - 1, dd) + deltaDays * 86_400_000));
}

/** "YYYY-MM-DD" → "YYYY/MM/DD" (путь архива зеркала). */
export function isoToArchivePath(iso: string): string {
  const { yyyy, mm, dd } = parseDateParts(iso);
  return `${yyyy}/${pad2(mm)}/${pad2(dd)}`;
}

/** "YYYY-MM-DD" → "DD<sep>MM<sep>YYYY" ("/" для .asp date_req, "." для hd_base UniDbQuery). */
export function isoToCbrDate(iso: string, sep: "/" | "." = "/"): string {
  const { yyyy, mm, dd } = parseDateParts(iso);
  return `${pad2(dd)}${sep}${pad2(mm)}${sep}${yyyy}`;
}

/** "DD.MM.YYYY" → "YYYY-MM-DD". */
export function ddmmyyyyToIso(s: string): string {
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) throw new Error(`Не удалось разобрать дату "${s}"`);
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** "1 234,56" / "14,25" → 14.25 (русский числовой формат ЦБ). */
export function parseRu(num: string): number {
  return parseFloat(num.replace(/[\s]/g, "").replace(",", "."));
}

// ── Парсеры ответов ───────────────────────────────────────────────────────────

/** Валидирует JSON курсов зеркала (cbr-xml-daily.ru). */
export function normalizeDailyJson(json: unknown): CbrDailyResponse {
  const data = json as CbrDailyResponse;
  if (!data || typeof data !== "object" || !data.Valute || typeof data.Valute !== "object") {
    throw new Error("Некорректный ответ ЦБ: отсутствует поле Valute.");
  }
  return data;
}

/** Парсит официальный windows-1251 XML_daily.asp в форму CbrDailyResponse (без Previous). */
export function parseOfficialDailyXml(xml: string): CbrDailyResponse {
  const dateMatch = xml.match(/<ValCurs[^>]*\sDate="([^"]+)"/);
  const date = dateMatch ? ddmmyyyyToIso(dateMatch[1]) : "";
  const re =
    /<Valute\s+ID="([^"]+)">\s*<NumCode>([^<]*)<\/NumCode>\s*<CharCode>([^<]*)<\/CharCode>\s*<Nominal>([^<]*)<\/Nominal>\s*<Name>([^<]*)<\/Name>\s*<Value>([^<]*)<\/Value>/g;
  const Valute: Record<string, CbrCurrency> = {};
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const [, id, numCode, charCode, nominal, name, value] = m;
    const val = parseRu(value);
    Valute[charCode] = {
      ID: id,
      NumCode: numCode,
      CharCode: charCode,
      Nominal: parseRu(nominal),
      Name: name,
      Value: val,
      Previous: val, // официальный XML_daily не содержит предыдущего значения
    };
  }
  if (Object.keys(Valute).length === 0) {
    throw new Error("Не удалось разобрать официальный XML курсов ЦБ.");
  }
  return { Date: date, Valute };
}

/** Парсит таблицу ключевой ставки с hd_base/KeyRate. Возвращает ряд, отсортированный по дате (новые первыми). */
export function parseKeyRateHtml(html: string): KeyRatePoint[] {
  const re =
    /<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4})\s*<\/td>\s*<td[^>]*>\s*([\d\s]+,\d+)\s*<\/td>/g;
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
    if (p.rate === current) since = p.date;
    else break;
  }
  return since;
}

/** Парсит windows-1251 XML xml_metall.asp. Возвращает все записи (buy+sell). */
export function parseMetalsXml(xml: string): MetalPrice[] {
  const names: Record<string, string> = {
    "1": "Золото",
    "2": "Серебро",
    "3": "Платина",
    "4": "Палладий",
  };
  const re =
    /<Record\s+Date="([^"]+)"\s+Code="(\d+)">\s*<Buy>([^<]*)<\/Buy>\s*<Sell>([^<]*)<\/Sell>\s*<\/Record>/g;
  const out: MetalPrice[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const [, date, code, buy, sell] = m;
    out.push({
      code,
      name: names[code] ?? `Metal_${code}`,
      buy: parseRu(buy),
      sell: parseRu(sell),
      date: ddmmyyyyToIso(date),
    });
  }
  return out;
}

/** Сводит записи металлов к самой свежей цене на каждый металл, по возрастанию кода. */
export function latestMetals(records: MetalPrice[]): MetalPrice[] {
  const latest = new Map<string, MetalPrice>();
  for (const r of [...records].sort((a, b) => (a.date < b.date ? -1 : 1))) {
    latest.set(r.code, r);
  }
  return [...latest.values()].sort((a, b) => Number(a.code) - Number(b.code));
}

/** Парсит windows-1251 XML_dynamic.asp в ряд динамики курса. */
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
