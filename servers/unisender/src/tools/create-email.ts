import { z } from "zod";
import { apiCall } from "../client.js";

export const createEmailSchema = z.object({
  sender_name: z.string().describe("Имя отправителя"),
  sender_email: z.string().describe("Email отправителя"),
  subject: z.string().describe("Тема письма"),
  body: z.string().describe("HTML-тело письма"),
  list_id: z.number().describe("ID списка рассылки"),
});

export async function handleCreateEmail(params: z.infer<typeof createEmailSchema>): Promise<string> {
  const data = await apiCall("createEmailMessage", {
    sender_name: params.sender_name,
    sender_email: params.sender_email,
    subject: params.subject,
    body: params.body,
    list_id: String(params.list_id),
  });
  return JSON.stringify(data, null, 2);
}
