import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";
import {
  isoFromDate,
  isoToCbrDate,
  keyRateChanges,
  keyRateSince,
  parseDynamicsXml,
  parseKeyRateHtml,
} from "./parsers.js";
import type {
  CbrDailyResponse,
  DynamicsPoint,
  KeyRateInfo,
  KeyRatePoint,
} from "./types.js";

const logger = createLogger("cbr-mcp");

const client = new BaseHttpClient({
  baseUrl: "https://www.cbr-xml-daily.ru",
  timeout: 10_000,
  maxRetries: 3,
  auth: new NoAuthStrategy(),
  logger,
});

const cbrClient = new BaseHttpClient({
  baseUrl: "https://www.cbr.ru",
  timeout: 10_000,
  maxRetries: 3,
  auth: new NoAuthStrategy(),
  logger,
});

export async function getDailyRates(date?: string): Promise<CbrDailyResponse> {
  let path: string;
  if (date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    path = `/archive/${yyyy}/${mm}/${dd}/daily_json.js`;
  } else {
    path = "/daily_json.js";
  }
  return (await client.get(path)) as CbrDailyResponse;
}

/**
 * Страница официальной таблицы ключевой ставки. XML-эндпоинт
 * `/scripts/XML_KeyRate.asp` ЦБ снял (302 → /Error/404), HTML остался.
 */
function keyRateUrl(fromIso: string, toIso: string): string {
  const from = isoToCbrDate(fromIso, ".");
  const to = isoToCbrDate(toIso, ".");
  return `/hd_base/KeyRate/?UniDbQuery.Posted=True&UniDbQuery.From=${from}&UniDbQuery.To=${to}`;
}

function daysAgoIso(days: number): string {
  return isoFromDate(new Date(Date.now() - days * 86_400_000));
}

async function fetchKeyRatePoints(fromIso: string, toIso: string): Promise<KeyRatePoint[]> {
  const html = (await cbrClient.get(keyRateUrl(fromIso, toIso))) as string;
  return parseKeyRateHtml(html);
}

/** Текущая ключевая ставка ЦБ РФ + дата, с которой она действует. */
export async function getKeyRate(): Promise<KeyRateInfo> {
  // 400 дней назад — чтобы начало текущей серии (since) попало в выборку даже
  // после года без пересмотра ставки.
  const points = await fetchKeyRatePoints(daysAgoIso(400), isoFromDate(new Date()));
  if (points.length === 0) {
    throw new Error("Не удалось получить ключевую ставку ЦБ РФ (пустая таблица hd_base/KeyRate).");
  }
  return { rate: points[0].rate, date: points[0].date, since: keyRateSince(points) };
}

/** История изменений ключевой ставки за период (по умолчанию — последний год). */
export async function getKeyRateHistory(
  fromDate?: string,
  toDate?: string,
): Promise<KeyRatePoint[]> {
  const points = await fetchKeyRatePoints(
    fromDate ?? daysAgoIso(365),
    toDate ?? isoFromDate(new Date()),
  );
  return keyRateChanges(points);
}

export interface RateDynamics {
  code: string;
  id: string;
  points: DynamicsPoint[];
}

/** Динамика курса валюты за период. ID валюты берётся из актуального справочника ЦБ. */
export async function getRateDynamics(
  currencyCode: string,
  fromDate: string,
  toDate: string,
): Promise<RateDynamics> {
  const code = currencyCode.toUpperCase();
  if (code === "RUB") {
    throw new Error("Динамика для RUB недоступна (рубль — базовая валюта).");
  }
  const from = isoToCbrDate(fromDate, "/");
  const to = isoToCbrDate(toDate, "/");
  if (fromDate > toDate) {
    throw new Error("from_date должна быть не позже to_date.");
  }

  const daily = await getDailyRates();
  const currency = Object.values(daily.Valute).find((v) => v.CharCode === code);
  if (!currency) {
    const available = Object.values(daily.Valute)
      .map((v) => v.CharCode)
      .join(", ");
    throw new Error(`Валюта ${code} не найдена. Доступные: ${available}`);
  }

  const xml = (await cbrClient.get(
    `/scripts/XML_dynamic.asp?date_req1=${from}&date_req2=${to}&VAL_NM_RQ=${currency.ID}`,
  )) as string;

  return { code, id: currency.ID, points: parseDynamicsXml(xml) };
}

export async function getPreciousMetals(
  date?: string,
): Promise<Record<string, { price: number; date: string }>> {
  const now = new Date();
  const d1 = date
    ? new Date(date)
    : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d2 = date ? new Date(date) : now;

  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  const xml = (await cbrClient.get(
    `/scripts/xml_metall.asp?date_req1=${fmt(d1)}&date_req2=${fmt(d2)}`,
  )) as string;

  const metals: Record<string, string> = {
    "1": "Золото",
    "2": "Серебро",
    "3": "Платина",
    "4": "Палладий",
  };

  const result: Record<string, { price: number; date: string }> = {};
  const records = xml.match(
    /<Record\s+Date="([^"]+)"\s+Code="(\d+)">\s*<Buy>([^<]*)<\/Buy>\s*<Sell>([^<]*)<\/Sell>/g,
  );

  if (records) {
    for (const record of records) {
      const m = record.match(
        /Date="([^"]+)"\s+Code="(\d+)">\s*<Buy>([^<]*)<\/Buy>\s*<Sell>([^<]*)<\/Sell>/,
      );
      if (m) {
        const [, recordDate, code, buy] = m;
        const name = metals[code] || `Metal_${code}`;
        result[name] = {
          price: parseFloat(buy.replace(",", ".")),
          date: recordDate,
        };
      }
    }
  }

  return result;
}
