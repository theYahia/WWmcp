import { z } from "zod";
import { apiGet, apiPost } from "../client.js";

export const listPushWebsitesSchema = z.object({});

export async function handleListPushWebsites(_params: z.infer<typeof listPushWebsitesSchema>): Promise<string> {
  const data = await apiGet("/push/websites");
  return JSON.stringify(data, null, 2);
}

export const getPushStatisticsSchema = z.object({
  website_id: z.number().describe("ID сайта push-подписки"),
});

export async function handleGetPushStatistics(params: z.infer<typeof getPushStatisticsSchema>): Promise<string> {
  const data = await apiGet(`/push/websites/${params.website_id}/tasks`);
  return JSON.stringify(data, null, 2);
}

export const createPushTaskSchema = z.object({
  website_id: z.number().describe("ID сайта"),
  title: z.string().describe("Заголовок push-уведомления"),
  body: z.string().describe("Текст push-уведомления"),
  url: z.string().describe("URL для перехода при клике"),
});

export async function handleCreatePushTask(params: z.infer<typeof createPushTaskSchema>): Promise<string> {
  const data = await apiPost(`/push/tasks`, {
    title: params.title,
    website_id: params.website_id,
    body: params.body,
    link: params.url,
  });
  return JSON.stringify(data, null, 2);
}
