import { gigachatGet } from "../client.js";

export async function handleListModels(): Promise<string> {
  const result = await gigachatGet("/models");
  return JSON.stringify(result, null, 2);
}
