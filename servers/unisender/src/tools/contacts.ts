import { z } from "zod";
import { apiCall } from "../client.js";

export const getContactsSchema = z.object({
  list_id: z.number().describe("ID списка рассылки"),
  limit: z.number().optional().describe("Количество контактов (по умолчанию 100)"),
});

export async function handleGetContacts(params: z.infer<typeof getContactsSchema>): Promise<string> {
  const query: Record<string, string> = {
    list_id: String(params.list_id),
  };
  if (params.limit) query.limit = String(params.limit);

  const data = await apiCall("exportContacts", query);
  return JSON.stringify(data, null, 2);
}
