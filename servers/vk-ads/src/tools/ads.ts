import { z } from "zod";
import { apiGet, apiPost } from "../client.js";

export const listAdsSchema = z.object({
  campaign_ids: z.array(z.number()).describe("ID кампаний для выборки объявлений"),
});

export async function handleListAds(params: z.infer<typeof listAdsSchema>): Promise<string> {
  const data = await apiGet("/ads.json", {
    campaign_ids: params.campaign_ids.join(","),
  });
  return JSON.stringify(data, null, 2);
}

export const createAdSchema = z.object({
  campaign_id: z.number().describe("ID кампании"),
  ad_group_id: z.number().optional().describe("ID группы объявлений"),
  format: z.string().default("text").describe("Формат объявления: text, image, video"),
  title: z.string().optional().describe("Заголовок объявления"),
  description: z.string().optional().describe("Описание объявления"),
  link_url: z.string().optional().describe("Ссылка объявления"),
});

export async function handleCreateAd(params: z.infer<typeof createAdSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    campaign_id: params.campaign_id,
    ad_format: params.format,
  };
  if (params.ad_group_id) body.ad_group_id = params.ad_group_id;
  if (params.title) body.title = params.title;
  if (params.description) body.description = params.description;
  if (params.link_url) body.link_url = params.link_url;

  const data = await apiPost("/ads.json", body);
  return JSON.stringify(data, null, 2);
}
