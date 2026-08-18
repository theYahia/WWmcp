import {
  isoFromDate,
  isoToArchivePath,
  isoToCbrDate,
  keyRateChanges,
  keyRateSince,
  latestMetals,
  normalizeDailyJson,
  parseDateParts,
  parseDynamicsXml,
  parseKeyRateHtml,
  parseMetalsXml,
  parseOfficialDailyXml,
  shiftDays,
} from "./parsers.js";
import type {
  CbrDailyResponse,
  DailyRatesResult,
  DynamicsPoint,
  KeyRateInfo,
  KeyRatePoint,
  MetalPrice,
} from "./types.js";

const MIRROR_BASE = "https://www.cbr-xml-daily.ru";
const CBR_BASE = "https://www.cbr.ru";
const USER_AGENT = "cbr-mcp (+https://github.com/theYahia/cbr-mcp)";
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;
/** Сколько дней назад искать ближайшие опубликованные курсы при 404 на дату. */
const MAX_LOOKBACK = 4;

/** Ошибка HTTP с сохранённым статусом — чтобы отличать 404 от сетевых сбоев. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": USER_AGENT },
      });
      clearTimeout(timer);

      if (response.ok) return response;

      if (response.status >= 500 && attempt < retries) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[cbr-mcp] ${response.status} от ${url}, повтор через ${delay}мс (${attempt}/${retries})`);
        await sleep(delay);
        continue;
      }

      throw new HttpError(response.status, `HTTP ${response.status}: ${response.statusText} (${url})`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof HttpError) throw error;

      const isAbort = error instanceof Error && error.name === "AbortError";
      if (attempt === retries) {
        if (isAbort) throw new Error(`Таймаут запроса к ${url} после ${retries} попыток`);
        throw error;
      }
      if (isAbort) {
        console.error(`[cbr-mcp] Таймаут ${url}, повтор (${attempt}/${retries})`);
        continue;
      }
      console.error(`[cbr-mcp] Сетевая ошибка ${url}: ${(error as Error).message}, повтор (${attempt}/${retries})`);
      await sleep(Math.min(1000 * 2 ** (attempt - 1), 8000));
    }
  }
  throw new Error(`Все попытки запроса к ${url} исчерпаны`);
}

const win1251 = new TextDecoder("windows-1251");

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetchWithRetry(url);
  return res.json();
}

/** Официальные XML ЦБ отдаются в windows-1251 — декодируем явно. */
async function fetchWin1251(url: string): Promise<string> {
  const res = await fetchWithRetry(url);
  return win1251.decode(await res.arrayBuffer());
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetchWithRetry(url);
  return res.text();
}

// ── Курсы валют ───────────────────────────────────────────────────────────────

async function fetchMirrorDaily(iso?: string): Promise<CbrDailyResponse> {
  const url = iso
    ? `${MIRROR_BASE}/archive/${isoToArchivePath(iso)}/daily_json.js`
    : `${MIRROR_BASE}/daily_json.js`;
  return normalizeDailyJson(await fetchJson(url));
}

async function fetchOfficialDaily(iso?: string): Promise<CbrDailyResponse> {
  const url = iso
    ? `${CBR_BASE}/scripts/XML_daily.asp?date_req=${isoToCbrDate(iso, "/")}`
    : `${CBR_BASE}/scripts/XML_daily.asp`;
  return parseOfficialDailyXml(await fetchWin1251(url));
}

const FALLBACK_NOTE =
  "Зеркало недоступно — данные с официального cbr.ru; дневная динамика в этом режиме недоступна.";

/**
 * Курсы ЦБ РФ. Без даты — актуальные. С датой — на дату; если на неё курсы не
 * публиковались (выходной/праздник) — возвращает ближайший доступный день назад
 * (до MAX_LOOKBACK дней) с пометкой. При недоступности зеркала — официальный cbr.ru fallback.
 */
export async function getDailyRates(date?: string): Promise<DailyRatesResult> {
  if (!date) {
    try {
      return { ...(await fetchMirrorDaily()), source: "mirror" };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      return { ...(await fetchOfficialDaily()), source: "cbr.ru-fallback", note: FALLBACK_NOTE };
    }
  }

  const parts = parseDateParts(date);
  for (let back = 0; back <= MAX_LOOKBACK; back++) {
    const iso = back === 0 ? parts.iso : shiftDays(parts.iso, -back);
    try {
      const result: DailyRatesResult = { ...(await fetchMirrorDaily(iso)), source: "mirror" };
      if (back > 0) {
        result.requested_date = date;
        result.note = `На ${date} курсы не публиковались (выходной/праздник). Показаны данные за ближайший доступный день ${iso}.`;
      }
      return result;
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        if (back < MAX_LOOKBACK) continue;
        throw new Error(
          `Курсы на ${date} не публиковались (выходной/праздник), как и за ${MAX_LOOKBACK} предыдущих дней. Укажите рабочий день.`,
        );
      }
      // Сетевой сбой зеркала — официальный fallback на запрошенную дату.
      return {
        ...(await fetchOfficialDaily(parts.iso)),
        source: "cbr.ru-fallback",
        requested_date: date,
        note: FALLBACK_NOTE,
      };
    }
  }
  throw new Error(`Не удалось получить курсы на ${date}.`);
}

// ── Ключевая ставка ───────────────────────────────────────────────────────────

function keyRateUrl(fromIso: string, toIso: string): string {
  const from = isoToCbrDate(fromIso, ".");
  const to = isoToCbrDate(toIso, ".");
  return `${CBR_BASE}/hd_base/KeyRate/?UniDbQuery.Posted=True&UniDbQuery.From=${from}&UniDbQuery.To=${to}`;
}

/** Текущая ключевая ставка ЦБ РФ + дата вступления в силу. */
export async function getKeyRate(): Promise<KeyRateInfo> {
  const today = new Date();
  const toIso = isoFromDate(today);
  const fromIso = isoFromDate(new Date(today.getTime() - 400 * 86_400_000));
  const points = parseKeyRateHtml(await fetchHtml(keyRateUrl(fromIso, toIso)));
  if (points.length === 0) {
    throw new Error("Не удалось получить ключевую ставку ЦБ РФ (пустой ответ hd_base/KeyRate).");
  }
  return { rate: points[0].rate, date: points[0].date, since: keyRateSince(points) };
}

/** История изменений ключевой ставки за период (по умолчанию — последний год). */
export async function getKeyRateHistory(fromDate?: string, toDate?: string): Promise<KeyRatePoint[]> {
  const today = new Date();
  const toIso = toDate ? parseDateParts(toDate).iso : isoFromDate(today);
  const fromIso = fromDate
    ? parseDateParts(fromDate).iso
    : isoFromDate(new Date(today.getTime() - 365 * 86_400_000));
  return keyRateChanges(parseKeyRateHtml(await fetchHtml(keyRateUrl(fromIso, toIso))));
}

// ── Драгоценные металлы ───────────────────────────────────────────────────────

/** Учётные цены ЦБ на драгметаллы (руб./грамм). Без даты — за последнюю неделю (свежайшие). */
export async function getPreciousMetals(date?: string): Promise<MetalPrice[]> {
  let fromIso: string;
  let toIso: string;
  if (date) {
    const p = parseDateParts(date);
    fromIso = p.iso;
    toIso = p.iso;
  } else {
    const today = new Date();
    toIso = isoFromDate(today);
    fromIso = isoFromDate(new Date(today.getTime() - 7 * 86_400_000));
  }
  const url = `${CBR_BASE}/scripts/xml_metall.asp?date_req1=${isoToCbrDate(fromIso, "/")}&date_req2=${isoToCbrDate(toIso, "/")}`;
  return latestMetals(parseMetalsXml(await fetchWin1251(url)));
}

// ── Динамика курса ────────────────────────────────────────────────────────────

export interface RateDynamics {
  code: string;
  id: string;
  points: DynamicsPoint[];
}

/** Динамика курса валюты за период (XML_dynamic.asp). currencyCode → ID берётся из актуального справочника. */
export async function getRateDynamics(
  currencyCode: string,
  fromDate: string,
  toDate: string,
): Promise<RateDynamics> {
  const code = currencyCode.toUpperCase();
  if (code === "RUB") {
    throw new Error("Динамика для RUB недоступна (рубль — базовая валюта).");
  }
  const from = parseDateParts(fromDate);
  const to = parseDateParts(toDate);
  if (from.iso > to.iso) {
    throw new Error("from_date должна быть не позже to_date.");
  }

  const daily = await getDailyRates();
  const cur = Object.values(daily.Valute).find((v) => v.CharCode === code);
  if (!cur) {
    const available = Object.values(daily.Valute)
      .map((v) => v.CharCode)
      .join(", ");
    throw new Error(`Валюта ${code} не найдена. Доступные: ${available}`);
  }

  const url = `${CBR_BASE}/scripts/XML_dynamic.asp?date_req1=${isoToCbrDate(from.iso, "/")}&date_req2=${isoToCbrDate(to.iso, "/")}&VAL_NM_RQ=${cur.ID}`;
  return { code, id: cur.ID, points: parseDynamicsXml(await fetchWin1251(url)) };
}
