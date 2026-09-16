import { z } from "zod";
import { vkGet, vkPost } from "../client.js";

export const getWallSchema = z.object({
  owner_id: z.number().describe("ID владельца стены (отрицательный для групп)"),
  count: z.number().int().min(1).max(100).default(20).describe("Количество записей"),
  offset: z.number().int().default(0).describe("Смещение"),
});

export async function handleGetWall(params: z.infer<typeof getWallSchema>): Promise<string> {
  const result = await vkGet("wall.get", {
    owner_id: String(params.owner_id),
    count: String(params.count),
    offset: String(params.offset),
  });
  return JSON.stringify(result, null, 2);
}

export const postWallSchema = z.object({
  owner_id: z.number().describe("ID владельца стены (отрицательный для групп)"),
  message: z.string().describe("Текст поста"),
  from_group: z.number().int().min(0).max(1).default(1).describe("1 — от имени группы, 0 — от пользователя"),
  attachments: z.string().optional().describe("Вложения: photo123_456,video789_012"),
  publish_date: z.number().optional().describe("Отложенная публикация (unix timestamp)"),
});

export async function handlePostWall(params: z.infer<typeof postWallSchema>): Promise<string> {
  const p: Record<string, string> = {
    owner_id: String(params.owner_id),
    message: params.message,
    from_group: String(params.from_group),
  };
  if (params.attachments) p.attachments = params.attachments;
  if (params.publish_date) p.publish_date = String(params.publish_date);

  const result = await vkPost("wall.post", p);
  return JSON.stringify(result, null, 2);
}

export const searchPostsSchema = z.object({
  q: z.string().describe("Поисковый запрос"),
  count: z.number().int().min(1).max(200).default(20).describe("Количество результатов"),
  start_time: z.number().optional().describe("Начало периода (unix timestamp)"),
  end_time: z.number().optional().describe("Конец периода (unix timestamp)"),
});

export async function handleSearchPosts(params: z.infer<typeof searchPostsSchema>): Promise<string> {
  const p: Record<string, string> = {
    q: params.q,
    count: String(params.count),
  };
  if (params.start_time) p.start_time = String(params.start_time);
  if (params.end_time) p.end_time = String(params.end_time);

  const result = await vkGet("newsfeed.search", p);
  return JSON.stringify(result, null, 2);
}
