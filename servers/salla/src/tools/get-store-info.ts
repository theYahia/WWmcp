import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const getStoreInfoSchema = z.object({});

export async function handleGetStoreInfo(_params: z.infer<typeof getStoreInfoSchema>): Promise<string> {
  const result = await client.request("GET", "/store/info");
  return JSON.stringify(result, null, 2);
}
