import { z } from "zod";
import { apiCall } from "../client.js";

export const subscribeSchema = z.object({
  list_ids: z.string().describe("ID списков через запятую, например 1,2,3"),
  fields: z.record(z.string(), z.string()).describe("Поля контакта: { email: '...', Name: '...' }"),
  double_optin: z.enum(["0", "1", "2", "3", "4"]).optional().describe("Тип подтверждения"),
  overwrite: z.enum(["0", "1", "2"]).optional().describe("Перезапись: 0=нет, 1=да, 2=добавить"),
});

export async function handleSubscribe(params: z.infer<typeof subscribeSchema>): Promise<string> {
  const query: Record<string, string> = {
    list_ids: params.list_ids,
  };

  for (const [key, value] of Object.entries(params.fields)) {
    query[`fields[${key}]`] = value;
  }

  if (params.double_optin) query.double_optin = params.double_optin;
  if (params.overwrite) query.overwrite = params.overwrite;

  const data = await apiCall("subscribe", query);
  return JSON.stringify(data, null, 2);
}
