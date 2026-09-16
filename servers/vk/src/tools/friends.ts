import { z } from "zod";
import { vkGet } from "../client.js";

export const getFriendsSchema = z.object({
  user_id: z.number().optional().describe("ID пользователя (по умолчанию — текущий)"),
  count: z.number().int().min(1).max(5000).default(100).describe("Количество друзей"),
  offset: z.number().int().default(0).describe("Смещение"),
  fields: z.string().default("nickname,city,photo_200").describe("Дополнительные поля"),
  order: z.enum(["name", "hints", "random"]).default("hints").describe("Сортировка"),
});

export async function handleGetFriends(params: z.infer<typeof getFriendsSchema>): Promise<string> {
  const p: Record<string, string> = {
    count: String(params.count),
    offset: String(params.offset),
    fields: params.fields,
    order: params.order,
  };
  if (params.user_id) p.user_id = String(params.user_id);

  const result = await vkGet("friends.get", p);
  return JSON.stringify(result, null, 2);
}
