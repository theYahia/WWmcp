import { z } from "zod";
import { getClient } from "../client.js";
export const getBalanceSchema = z.object({});

export async function handleGetBalance(_params: z.infer<typeof getBalanceSchema>): Promise<string> {
  const result = await getClient().get("account/info.json");
  return JSON.stringify(result, null, 2);
}
