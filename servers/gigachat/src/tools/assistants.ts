import { gigachatGet } from "../client.js";

export async function handleListAssistants(): Promise<string> {
  const result = await gigachatGet("/assistants");
  return JSON.stringify(result, null, 2);
}
