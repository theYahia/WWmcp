import { z } from "zod";
import { getClient } from "../client.js";
import type { RoistatVisitListResponse } from "../types.js";

export const getVisitsSchema = z.object({
  from: z.string().describe("Дата начала периода (YYYY-MM-DD)"),
  to: z.string().describe("Дата конца периода (YYYY-MM-DD)"),
  limit: z.number().default(50).describe("Максимум визитов в ответе"),
  offset: z.number().default(0).describe("Смещение для пагинации"),
  source: z.string().optional().describe("Фильтр по источнику трафика"),
});

export async function handleGetVisits(params: z.infer<typeof getVisitsSchema>): Promise<string> {
  const queryParams: Record<string, string> = {
    from: params.from,
    to: params.to,
    limit: String(params.limit),
    offset: String(params.offset),
  };
  if (params.source) queryParams.source = params.source;

  const result = (await getClient().get("/project/site/visit/list", queryParams)) as RoistatVisitListResponse;

  if (!result.data || result.data.length === 0) {
    return "Визиты за указанный период не найдены.";
  }

  return JSON.stringify({
    период: { от: params.from, до: params.to },
    всего: result.total,
    визиты: result.data.map(v => ({
      id: v.id,
      дата: v.date_create,
      источник: v.source,
      страница: v.landing_page,
      город: v.city,
      устройство: v.device_type,
      utm_source: v.utm_source,
      utm_medium: v.utm_medium,
      utm_campaign: v.utm_campaign,
    })),
  }, null, 2);
}
