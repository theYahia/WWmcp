import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";
import type { CbrDailyResponse } from "./types.js";

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

export async function getKeyRate(): Promise<{ rate: number; date: string }> {
  const xml = (await cbrClient.get("/scripts/XML_KeyRate.asp")) as string;

  const records = xml.match(
    /<Record\s+Date="([^"]+)"\s+Id="[^"]*">\s*<Rate>([^<]+)<\/Rate>\s*<\/Record>/g,
  );
  if (!records || records.length === 0) {
    throw new Error("Не удалось получить ключевую ставку ЦБ РФ");
  }

  const last = records[records.length - 1];
  const dateMatch = last.match(/Date="([^"]+)"/);
  const rateMatch = last.match(/<Rate>([^<]+)<\/Rate>/);

  if (!dateMatch || !rateMatch) {
    throw new Error("Не удалось распарсить ключевую ставку");
  }

  return {
    rate: parseFloat(rateMatch[1].replace(",", ".")),
    date: dateMatch[1],
  };
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
