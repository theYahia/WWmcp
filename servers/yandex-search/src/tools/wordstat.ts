import { z } from "zod";
import { cloudPost } from "../client.js";

// ── Types ────────────────────────────────────────────────────────────────────

interface TopRequestsResult {
  results: Array<{ phrase: string; count: string }>;
}

interface RegionsResult {
  results: Array<{ region: string; count: string; share: number; affinityIndex: number }>;
}

interface DynamicsResult {
  results: Array<{ date: string; count?: string; share?: number }>;
}

// ── Top Requests ─────────────────────────────────────────────────────────────

export const wordstatTopRequestsSchema = z.object({
  phrase: z.string().min(1).describe("Ключевая фраза для поиска (например: 'max бот', 'купить смартфон')"),
  limit: z.number().int().min(1).max(50).default(20).describe("Максимум связанных запросов (1-50, по умолчанию 20)"),
});

export async function handleWordstatTopRequests(
  params: z.infer<typeof wordstatTopRequestsSchema>
): Promise<string> {
  // num_phrases обязателен (API: «Value must be in the range of 1 to 2000»); без него — HTTP 400.
  const data = await cloudPost<TopRequestsResult>("/v2/wordstat/topRequests", {
    phrase: params.phrase,
    num_phrases: params.limit,
  });
  const results = data.results.slice(0, params.limit);

  if (!results.length) {
    return `Wordstat не нашёл связанных запросов для фразы "${params.phrase}". Попробуйте более общий запрос.`;
  }

  const lines = results.map((r, i) =>
    `${String(i + 1).padStart(2)}. ${r.phrase.padEnd(45)} ${Number(r.count).toLocaleString("ru-RU")}/мес`
  );

  return [
    `Топ связанных запросов для: "${params.phrase}" (${results.length} из API)`,
    "─".repeat(60),
    ...lines,
    "",
    `Итого фраз: ${results.length}`,
  ].join("\n");
}

// ── Regions ──────────────────────────────────────────────────────────────────

// Top-15 Yandex region IDs → human-readable names
const REGION_NAMES: Record<string, string> = {
  "1": "Москва", "2": "Санкт-Петербург", "3": "Екатеринбург",
  "4": "Новосибирск", "5": "Самара", "6": "Омск", "7": "Казань",
  "8": "Ростов-на-Дону", "9": "Уфа", "10": "Нижний Новгород",
  "11": "Пермь", "12": "Воронеж", "13": "Краснодар", "14": "Красноярск",
  "15": "Саратов", "20": "Волгоград", "51": "Челябинск",
  "54": "Тюмень", "62": "Тула", "63": "Тольятти",
  "213": "Москва (область)", "10243": "Беларусь", "187": "Украина",
  "225": "Россия (вся)", // агрегат по стране — обычно первый по объёму, без имени читался как регион
};

export const wordstatRegionsSchema = z.object({
  phrase: z.string().min(1).describe("Ключевая фраза для анализа по регионам"),
  top: z.number().int().min(1).max(30).default(10).describe("Количество регионов (1-30, по умолчанию 10)"),
  sort_by: z.enum(["volume", "affinity"]).default("volume").describe("volume — по объёму запросов; affinity — по индексу интереса (affinity > 100 = выше среднего)"),
});

export async function handleWordstatRegions(
  params: z.infer<typeof wordstatRegionsSchema>
): Promise<string> {
  const data = await cloudPost<RegionsResult>("/v2/wordstat/regions", { phrase: params.phrase });

  if (!data.results?.length) {
    return `Нет региональных данных для "${params.phrase}".`;
  }

  const sorted = [...data.results].sort((a, b) =>
    params.sort_by === "affinity"
      ? b.affinityIndex - a.affinityIndex
      : Number(b.count) - Number(a.count)
  ).slice(0, params.top);

  const lines = sorted.map((r, i) => {
    const name = REGION_NAMES[r.region] ?? `Регион ${r.region}`;
    const affinity = r.affinityIndex.toFixed(0);
    const flag = r.affinityIndex > 110 ? " ↑" : r.affinityIndex < 90 ? " ↓" : "";
    return `${String(i + 1).padStart(2)}. ${name.padEnd(25)} ${Number(r.count).toLocaleString("ru-RU").padStart(8)}/мес   affinity: ${affinity}${flag}`;
  });

  return [
    `Регионы для "${params.phrase}" (сорт.: ${params.sort_by})`,
    "─".repeat(70),
    ...lines,
    "",
    "affinity > 100 = спрос выше среднего по стране; ↑ = горячий регион",
  ].join("\n");
}

// ── Dynamics ─────────────────────────────────────────────────────────────────

export const wordstatDynamicsSchema = z.object({
  phrase: z.string().min(1).describe("Ключевая фраза для анализа трендов"),
  from_year: z.number().int().min(2018).max(2026).default(2023).describe("Год начала (2018-2026)"),
  to_year: z.number().int().min(2018).max(2026).default(2025).describe("Год конца (2018-2026)"),
});

export async function handleWordstatDynamics(
  params: z.infer<typeof wordstatDynamicsSchema>
): Promise<string> {
  const fromDate = `${params.from_year}-01-01T00:00:00Z`;
  const toDate = `${params.to_year}-12-31T00:00:00Z`;

  const data = await cloudPost<DynamicsResult>("/v2/wordstat/dynamics", {
    phrase: params.phrase,
    period: 1,
    from_date: fromDate,
    to_date: toDate,
  });

  const withData = data.results.filter(r => r.count);

  if (!withData.length) {
    return [
      `Нет данных о динамике для "${params.phrase}" за ${params.from_year}–${params.to_year}.`,
      "Причина: фраза имеет слишком малый объём запросов для отображения в динамике.",
      "Попробуйте более высокочастотную фразу (>10 000 показов/мес).",
    ].join("\n");
  }

  const max = Math.max(...withData.map(r => Number(r.count)));
  const lines = withData.map(r => {
    const month = r.date.slice(0, 7);
    const count = Number(r.count);
    const bar = "█".repeat(Math.round((count / max) * 25));
    return `${month}  ${bar.padEnd(25)}  ${count.toLocaleString("ru-RU")}`;
  });

  const total = withData.map(r => Number(r.count)).reduce((a, b) => a + b, 0);
  const avg = Math.round(total / withData.length);

  return [
    `Динамика для "${params.phrase}" (${params.from_year}–${params.to_year})`,
    "─".repeat(55),
    ...lines,
    "",
    `Среднее/мес: ${avg.toLocaleString("ru-RU")} | Пик: ${max.toLocaleString("ru-RU")} | Месяцев с данными: ${withData.length}`,
  ].join("\n");
}
