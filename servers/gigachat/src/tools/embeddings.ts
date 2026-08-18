import { z } from "zod";
import { gigachatPost } from "../client.js";

export const getEmbeddingsSchema = z.object({
  model: z.string().default("Embeddings").describe("Модель для эмбеддингов"),
  input: z.array(z.string()).describe("Массив текстов для получения эмбеддингов"),
});

export async function handleGetEmbeddings(params: z.infer<typeof getEmbeddingsSchema>): Promise<string> {
  const result = await gigachatPost("/embeddings", {
    model: params.model,
    input: params.input,
  });
  return JSON.stringify(result, null, 2);
}
