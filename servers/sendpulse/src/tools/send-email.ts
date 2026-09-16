import { z } from "zod";
import { apiPost } from "../client.js";

export const sendEmailSchema = z.object({
  sender_name: z.string().describe("Имя отправителя"),
  sender_email: z.string().describe("Email отправителя"),
  subject: z.string().describe("Тема письма"),
  body: z.string().describe("HTML-тело письма"),
  list_id: z.number().describe("ID списка рассылки"),
  name: z.string().optional().describe("Название кампании"),
});

export async function handleSendEmail(params: z.infer<typeof sendEmailSchema>): Promise<string> {
  const data = await apiPost("/campaigns", {
    sender_name: params.sender_name,
    sender_email: params.sender_email,
    subject: params.subject,
    // btoa() бросает InvalidCharacterError на кириллице; SendPulse ждёт base64 от UTF-8.
    body: Buffer.from(params.body, "utf8").toString("base64"),
    list_id: params.list_id,
    name: params.name || `campaign_${Date.now()}`,
  });
  return JSON.stringify(data, null, 2);
}
