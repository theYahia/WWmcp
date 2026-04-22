import { z } from "zod";
import { apiGet, apiPost } from "../client.js";

export const listCampaignsSchema = z.object({
  account_id: z.number().describe("ID рекламного кабинета"),
  status: z.string().optional().describe("Фильтр по статусу: active, blocked, deleted"),
});

export async function handleListCampaigns(params: z.infer<typeof listCampaignsSchema>): Promise<string> {
  const queryParams: Record<string, string> = {
    account_id: String(params.account_id),
  };
  if (params.status) queryParams.status = params.status;

  const data = await apiGet("/campaigns.json", queryParams);
  return JSON.stringify(data, null, 2);
}

export const createCampaignSchema = z.object({
  account_id: z.number().describe("ID рекламного кабинета"),
  name: z.string().describe("Название кампании"),
  type: z.string().default("normal").describe("Тип кампании: normal, promoted_posts, adaptive_ads"),
  budget: z.number().optional().describe("Бюджет кампании в копейках"),
});

export async function handleCreateCampaign(params: z.infer<typeof createCampaignSchema>): Promise<string> {
  const campaign: Record<string, unknown> = {
    account_id: params.account_id,
    name: params.name,
    type: params.type,
  };
  if (params.budget !== undefined) campaign.all_limit = params.budget;

  const data = await apiPost("/campaigns.json", campaign);
  return JSON.stringify(data, null, 2);
}

export const updateCampaignSchema = z.object({
  campaign_id: z.number().describe("ID кампании"),
  name: z.string().optional().describe("Новое название"),
  budget: z.number().optional().describe("Новый бюджет в копейках"),
  status: z.string().optional().describe("Новый статус: start, stop"),
});

export async function handleUpdateCampaign(params: z.infer<typeof updateCampaignSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    campaign_id: params.campaign_id,
  };
  if (params.name) body.name = params.name;
  if (params.budget !== undefined) body.all_limit = params.budget;
  if (params.status) body.status = params.status === "start" ? 1 : 0;

  const data = await apiPost("/campaigns.json", body);
  return JSON.stringify(data, null, 2);
}
