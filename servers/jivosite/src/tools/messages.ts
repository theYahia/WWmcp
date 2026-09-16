import { z } from "zod";
import { jivoGet, jivoPost } from "../client.js";

export const getMessagesSchema = z.object({
  chat_id: z.string().describe("ID чата"),
  limit: z.number().int().min(1).max(100).default(50).describe("Количество сообщений"),
  offset: z.number().int().default(0).describe("Смещение"),
});

export async function handleGetMessages(params: z.infer<typeof getMessagesSchema>): Promise<string> {
  const result = await jivoGet(`chats/${params.chat_id}/messages`, {
    limit: String(params.limit),
    offset: String(params.offset),
  });
  return JSON.stringify(result, null, 2);
}

export const sendMessageSchema = z.object({
  chat_id: z.string().describe("ID чата"),
  body: z.string().describe("Текст сообщения"),
  type: z.string().default("text").describe("Тип сообщения (text)"),
});

export async function handleSendMessage(params: z.infer<typeof sendMessageSchema>): Promise<string> {
  const result = await jivoPost(`chats/${params.chat_id}/messages`, {
    body: params.body,
    type: params.type,
  });
  return JSON.stringify(result, null, 2);
}
