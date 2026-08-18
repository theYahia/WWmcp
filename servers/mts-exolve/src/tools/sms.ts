import { z } from "zod";
import { exolvePost } from "../client.js";

export const sendSmsSchema = z.object({
  number: z.string().describe("Номер получателя (формат 7XXXXXXXXXX)"),
  destination: z.string().describe("Номер отправителя или имя отправителя"),
  text: z.string().describe("Текст сообщения"),
});

export async function handleSendSms(params: z.infer<typeof sendSmsSchema>): Promise<string> {
  const result = await exolvePost("/sms/send", {
    number: params.number,
    destination: params.destination,
    text: params.text,
  });
  return JSON.stringify(result, null, 2);
}

export const getSmsStatusSchema = z.object({
  message_id: z.string().describe("ID сообщения для проверки статуса"),
});

export async function handleGetSmsStatus(params: z.infer<typeof getSmsStatusSchema>): Promise<string> {
  const result = await exolvePost("/sms/status", {
    message_id: params.message_id,
  });
  return JSON.stringify(result, null, 2);
}
