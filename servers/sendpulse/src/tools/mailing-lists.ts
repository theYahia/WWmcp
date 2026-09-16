import { z } from "zod";
import { apiGet } from "../client.js";

export const getMailingListsSchema = z.object({});

export async function handleGetMailingLists(_params: z.infer<typeof getMailingListsSchema>): Promise<string> {
  const data = await apiGet("/addressbooks");
  return JSON.stringify(data, null, 2);
}
