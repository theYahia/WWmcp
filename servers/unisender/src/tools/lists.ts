import { z } from "zod";
import { apiCall } from "../client.js";

export const getListsSchema = z.object({});

export async function handleGetLists(_params: z.infer<typeof getListsSchema>): Promise<string> {
  const data = await apiCall("getLists");
  return JSON.stringify(data, null, 2);
}
