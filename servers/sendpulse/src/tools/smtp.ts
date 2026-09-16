import { z } from "zod";
import { apiPost, apiGet } from "../client.js";

export const smtpSendSchema = z.object({
  to_name: z.string().describe("Имя получателя"),
  to_email: z.string().describe("Email получателя"),
  sender_name: z.string().describe("Имя отправителя"),
  sender_email: z.string().describe("Email отправителя"),
  subject: z.string().describe("Тема письма"),
  body_html: z.string().describe("HTML-тело письма"),
});

export async function handleSmtpSend(params: z.infer<typeof smtpSendSchema>): Promise<string> {
  const data = await apiPost("/smtp/emails", {
    email: {
      // btoa() бросает InvalidCharacterError на кириллице; SendPulse ждёт base64 от UTF-8.
      html: Buffer.from(params.body_html, "utf8").toString("base64"),
      text: "",
      subject: params.subject,
      from: { name: params.sender_name, email: params.sender_email },
      to: [{ name: params.to_name, email: params.to_email }],
    },
  });
  return JSON.stringify(data, null, 2);
}

export const smtpListEmailsSchema = z.object({
  limit: z.number().optional().describe("Лимит результатов"),
  offset: z.number().optional().describe("Смещение"),
});

export async function handleSmtpListEmails(params: z.infer<typeof smtpListEmailsSchema>): Promise<string> {
  const limit = params.limit ?? 100;
  const offset = params.offset ?? 0;
  const data = await apiGet(`/smtp/emails?limit=${limit}&offset=${offset}`);
  return JSON.stringify(data, null, 2);
}
