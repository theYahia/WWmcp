import { z } from "zod";
import { apiGetPaginated, apiPost } from "../client.js";

/**
 * Кампании = ad_plans (верхний уровень модели ad_plans → ad_groups → banners).
 * Имена инструментов оставлены дружелюбными (list/create/update_campaign), но бьют в /ad_plans*.
 */

// VERIFY: имена полей ad_plan против живого ответа API.
const AD_PLAN_FIELDS = "id,name,status,objective,budget_limit,budget_limit_day,date_start,date_end";

export const listCampaignsSchema = z.object({
  status: z.enum(["active", "blocked", "deleted"]).optional().describe("Фильтр по статусу"),
  limit: z.number().int().positive().max(1000).optional().describe("Макс. число кампаний в ответе (по умолчанию 200)"),
  fields: z.string().optional().describe("Список полей через запятую (проекция); по умолчанию — основные поля"),
});

export async function handleListCampaigns(params: z.infer<typeof listCampaignsSchema>) {
  const query: Record<string, string> = { fields: params.fields ?? AD_PLAN_FIELDS };
  if (params.status) query._status__in = params.status; // VERIFY: фильтр _status__in
  const { items, count, truncated } = await apiGetPaginated("/ad_plans.json", query, params.limit ?? 200);
  return { count, truncated, items };
}

export const createCampaignSchema = z.object({
  name: z.string().min(1).describe("Название кампании (ad_plan)"),
  // VERIFY: полный enum objective. Известные значения: traffic, reach, site_conversions, leadads, playersengagement и др.
  objective: z.string().min(1).describe("Цель кампании, напр.: traffic, reach, site_conversions, leadads, playersengagement"),
  // VERIFY: единицы бюджета — валюта кабинета (для RUB это рубли, НЕ копейки).
  budget_limit: z.number().positive().optional().describe("Общий бюджет в валюте кабинета (рубли для RUB)"),
  budget_limit_day: z.number().positive().optional().describe("Дневной бюджет в валюте кабинета"),
});

export async function handleCreateCampaign(params: z.infer<typeof createCampaignSchema>) {
  const body: Record<string, unknown> = { name: params.name, objective: params.objective };
  if (params.budget_limit !== undefined) body.budget_limit = params.budget_limit;
  if (params.budget_limit_day !== undefined) body.budget_limit_day = params.budget_limit_day;
  const data = await apiPost("/ad_plans.json", body);
  return { result: data };
}

const ACTION_TO_STATUS = { activate: "active", stop: "blocked", delete: "deleted" } as const;

export const updateCampaignSchema = z.object({
  campaign_id: z.number().int().positive().describe("ID кампании (ad_plan)"),
  action: z
    .enum(["activate", "stop", "delete"])
    .optional()
    .describe("Жизненный цикл: activate→status=active, stop→status=blocked, delete→status=deleted"),
  name: z.string().min(1).optional().describe("Новое название"),
  budget_limit: z.number().positive().optional().describe("Новый общий бюджет (валюта кабинета)"),
  budget_limit_day: z.number().positive().optional().describe("Новый дневной бюджет (валюта кабинета)"),
});

export async function handleUpdateCampaign(params: z.infer<typeof updateCampaignSchema>) {
  const body: Record<string, unknown> = {};
  if (params.action) body.status = ACTION_TO_STATUS[params.action];
  if (params.name) body.name = params.name;
  if (params.budget_limit !== undefined) body.budget_limit = params.budget_limit;
  if (params.budget_limit_day !== undefined) body.budget_limit_day = params.budget_limit_day;
  // Обновление: id в ПУТИ, в теле только изменённые поля. VERIFY: plural ad_plans/{id}.json (2 источника за plural).
  const data = await apiPost(`/ad_plans/${params.campaign_id}.json`, body);
  return { result: data };
}
