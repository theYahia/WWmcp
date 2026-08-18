import { z } from "zod";
import { gigachatPost } from "../client.js";

export const getTokenCountSchema = z.object({
  model: z.string().default("GigaChat").describe("Модель GigaChat"),
  input: z.array(z.string()).describe("Массив текстов для подсчёта токенов"),
});

export async function handleGetTokenCount(params: z.infer<typeof getTokenCountSchema>): Promise<string> {
  const result = await gigachatPost("/tokens/count", params.input.map(text => ({
    model: params.model,
    input: text,
  })));
  return JSON.stringify(result, null, 2);
}
