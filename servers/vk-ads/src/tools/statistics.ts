import { z } from "zod";
import { apiGet } from "../client.js";

/**
 * Статистика VK Ads v2 — PATH-сегментированный endpoint:
 *   GET /statistics/{object_type}/{period}.json?id=&date_from=&date_to=&metrics=
 * (не плоский /statistics.json с ids_type/period=week|month|overall — это легаси api.vk.com).
 * Метрика показов называется `shows` (не impressions).
 */

export const getStatisticsSchema = z.object({
  // VERIFY: оф. stat-v2 doc перечисляет campaigns|banners|users; ad_groups подтверждён сторонними клиентами.
  object_type: z
    .enum(["campaigns", "ad_groups", "banners", "users"])
    .default("campaigns")
    .describe("Тип объектов (сегмент пути): campaigns (=ad_plans), ad_groups, banners, users"),
  ids: z.array(z.number().int().positive()).min(1).max(200).describe("ID объектов (1..200)"),
  period: z
    .enum(["day", "summary"])
    .default("day")
    .describe("day — разбивка по дням (нужны даты); summary — агрегат за период"),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Дата начала YYYY-MM-DD (обязательна для day)"),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Дата окончания YYYY-MM-DD (обязательна для day)"),
  metrics: z
    .enum(["all", "base", "events", "video", "uniques", "tps", "playable", "romi"])
    .default("all")
    .describe("Набор метрик"),
});

export async function handleGetStatistics(params: z.infer<typeof getStatisticsSchema>) {
  // Кросс-полевая валидация (возвращается как tool error, LLM может скорректировать).
  if (params.period === "day") {
    if (!params.date_from || !params.date_to) {
      throw new Error("Для period=day обязательны date_from и date_to (YYYY-MM-DD)");
    }
    if (params.date_from > params.date_to) {
      throw new Error("date_from должна быть не позже date_to");
    }
    const days = (Date.parse(params.date_to) - Date.parse(params.date_from)) / 86_400_000;
    if (days > 92) {
      throw new Error("Диапазон статистики не более 92 дней");
    }
  }

  const query: Record<string, string> = { id: params.ids.join(","), metrics: params.metrics };
  if (params.date_from) query.date_from = params.date_from;
  if (params.date_to) query.date_to = params.date_to;

  const data = (await apiGet(`/statistics/${params.object_type}/${params.period}.json`, query)) as {
    items?: unknown[];
    total?: unknown;
  };
  return { items: Array.isArray(data?.items) ? data.items : [], total: data?.total };
}
