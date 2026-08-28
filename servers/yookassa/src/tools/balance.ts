import { getClient } from "../client.js";

export async function handleGetBalance(): Promise<string> {
  const result = await getClient().get("/me");
  return JSON.stringify(result, null, 2);
}
