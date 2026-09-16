import { z } from "zod";
import { jivoGet } from "../client.js";

export const getChatsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20).describe("Количество чатов"),
  offset: z.number().int().default(0).describe("Смещение"),
  status: z.string().optional().describe("Фильтр по статусу: active, closed, assigned"),
});

export async function handleGetChats(params: z.infer<typeof getChatsSchema>): Promise<string> {
  const queryParams: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
  };
  if (params.status) queryParams.status = params.status;
  const result = await jivoGet("chats", queryParams);
  return JSON.stringify(result, null, 2);
}
