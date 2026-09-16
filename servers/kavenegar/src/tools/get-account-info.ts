import { z } from "zod";
import { getClient } from "../client.js";
export const getAccountInfoSchema = z.object({});

export async function handleGetAccountInfo(_params: z.infer<typeof getAccountInfoSchema>): Promise<string> {
  const result = await getClient().get("account/info.json");
  return JSON.stringify(result, null, 2);
}
