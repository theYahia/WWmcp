import { z } from "zod";
import { apiGetPaginated, apiPost } from "../client.js";

/**
 * Объявления = banners (нижний уровень: ad_plans → ad_groups → banners).
 * Имена инструментов оставлены дружелюбными (list/create_ad), но бьют в /banners*.
 */

// VERIFY: имена полей banner против живого ответа API.
const BANNER_FIELDS = "id,ad_group_id,name,status,moderation_status,textblocks,urls,content";

export const listAdsSchema = z.object({
  ad_group_ids: z
    .array(z.number().int().positive())
    .optional()
    .describe("ID групп объявлений (ad_group) для фильтра; пусто — все баннеры кабинета"),
  status: z.enum(["active", "blocked", "deleted"]).optional().describe("Фильтр по статусу"),
  limit: z.number().int().positive().max(1000).optional().describe("Макс. число объявлений в ответе (по умолчанию 200)"),
  fields: z.string().optional().describe("Список полей через запятую (проекция)"),
});

export async function handleListAds(params: z.infer<typeof listAdsSchema>) {
  const query: Record<string, string> = { fields: params.fields ?? BANNER_FIELDS };
  if (params.ad_group_ids?.length) query._ad_group_id__in = params.ad_group_ids.join(","); // фильтр по родителю
  if (params.status) query._status__in = params.status;
  const { items, count, truncated } = await apiGetPaginated("/banners.json", query, params.limit ?? 200);
  return { count, truncated, items };
}

export const createAdSchema = z.object({
  ad_group_id: z.number().int().positive().describe("ID группы объявлений — обязательный родитель баннера"),
  name: z.string().min(1).optional().describe("Название баннера"),
  textblocks: z
    .record(z.string(), z.any())
    .optional()
    .describe("Текстовые слоты, напр.: {\"title_40_vkads\":{\"text\":\"...\"},\"text_90\":{\"text\":\"...\"}}"),
  urls: z.record(z.string(), z.any()).optional().describe("Ссылки, напр.: {\"primary\":{\"url\":\"https://...\"}}"),
  content: z
    .record(z.string(), z.any())
    .optional()
    .describe("Медиа: ссылки на УЖЕ загруженные креативы, напр.: {\"image_600x600\":{\"id\":123}}"),
});

export async function handleCreateAd(params: z.infer<typeof createAdSchema>) {
  const body: Record<string, unknown> = { ad_group_id: params.ad_group_id };
  if (params.name) body.name = params.name;
  if (params.textblocks) body.textblocks = params.textblocks;
  if (params.urls) body.urls = params.urls;
  if (params.content) body.content = params.content;
  // VERIFY: POST /banners.json с ad_group_id в теле (gistrec) против /ad_groups/{id}/banners.json (перехваченный request).
  // Загрузка медиа-креативов (получение content id) — отдельный flow, не входит в этот сервер.
  const data = await apiPost("/banners.json", body);
  return { result: data };
}
