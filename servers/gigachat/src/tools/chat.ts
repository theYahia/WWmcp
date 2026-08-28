import { z } from "zod";
import { gigachatPost } from "../client.js";

const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]).describe("Роль автора сообщения"),
  content: z.string().describe("Текст сообщения"),
});

export const chatCompletionSchema = z.object({
  model: z.string().default("GigaChat").describe("Модель GigaChat (GigaChat, GigaChat-Plus, GigaChat-Pro)"),
  messages: z.array(messageSchema).describe("Массив сообщений диалога"),
  temperature: z.number().min(0).max(2).optional().describe("Температура генерации (0–2)"),
  top_p: z.number().min(0).max(1).optional().describe("Top-p sampling"),
  max_tokens: z.number().int().positive().optional().describe("Максимальное количество токенов"),
});

export async function handleChatCompletion(params: z.infer<typeof chatCompletionSchema>): Promise<string> {
  const result = await gigachatPost("/chat/completions", {
    model: params.model,
    messages: params.messages,
    temperature: params.temperature,
    top_p: params.top_p,
    max_tokens: params.max_tokens,
    stream: false,
  });
  return JSON.stringify(result, null, 2);
}
