import { z } from "zod";
import { apiGetPaginated } from "../client.js";

/**
 * Группы объявлений (ad_groups) — средний уровень: ad_plans → ad_groups → banners.
 * Здесь живёт таргетинг/доставка (поле delivery/targetings), поэтому этот инструмент заменяет
 * прежний list_targeting_groups (отдельного ресурса targeting_groups в v2 не найдено).
 */

// VERIFY: имена полей ad_group (delivery/targetings) против живого ответа API.
const AD_GROUP_FIELDS = "id,ad_plan_id,name,status,delivery,targetings,banners,budget_limit,budget_limit_day,max_price";

export const listAdGroupsSchema = z.object({
  campaign_ids: z
    .array(z.number().int().positive())
    .optional()
    .describe("ID кампаний (ad_plan) для фильтра групп; пусто — все группы кабинета"),
  status: z.enum(["active", "blocked", "deleted"]).optional().describe("Фильтр по статусу"),
  limit: z.number().int().positive().max(1000).optional().describe("Макс. число групп в ответе (по умолчанию 200)"),
  fields: z.string().optional().describe("Список полей через запятую (проекция)"),
});

export async function handleListAdGroups(params: z.infer<typeof listAdGroupsSchema>) {
  const query: Record<string, string> = { fields: params.fields ?? AD_GROUP_FIELDS };
  if (params.campaign_ids?.length) query._ad_plan_id__in = params.campaign_ids.join(","); // VERIFY: _ad_plan_id__in
  if (params.status) query._status__in = params.status;
  const { items, count, truncated } = await apiGetPaginated("/ad_groups.json", query, params.limit ?? 200);
  return { count, truncated, items };
}
