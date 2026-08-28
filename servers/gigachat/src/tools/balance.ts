import { gigachatGet } from "../client.js";

export async function handleGetBalance(): Promise<string> {
  const result = await gigachatGet("/balance");
  return JSON.stringify(result, null, 2);
}
