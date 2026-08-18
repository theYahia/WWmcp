import { z } from "zod";
import { gigachatPost } from "../client.js";

const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]).describe("Роль автора сообщения"),
  content: z.string().describe("Текст сообщения (для генерации изображения опишите что нарисовать)"),
});

export const generateImageSchema = z.object({
  model: z.string().default("GigaChat").describe("Модель GigaChat (GigaChat, GigaChat-Pro)"),
  messages: z.array(messageSchema).describe("Массив сообщений с запросом на генерацию изображения"),
});

export async function handleGenerateImage(params: z.infer<typeof generateImageSchema>): Promise<string> {
  const result = await gigachatPost("/chat/completions", {
    model: params.model,
    messages: params.messages,
    function_call: "auto",
    stream: false,
  });
  return JSON.stringify(result, null, 2);
}
