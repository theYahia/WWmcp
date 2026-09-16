import { z } from "zod";
import { smsRuGet } from "../client.js";

// --- send_sms ---
export const sendSmsSchema = z.object({
  to: z.string().describe("Номер получателя (формат 79XXXXXXXXX)"),
  msg: z.string().describe("Текст сообщения"),
  from: z.string().optional().describe("Имя отправителя (если одобрено)"),
});

export async function handleSendSms(params: z.infer<typeof sendSmsSchema>): Promise<string> {
  const p: Record<string, string> = { to: params.to, msg: params.msg };
  if (params.from) p.from = params.from;
  const result = await smsRuGet("sms/send", p);
  return JSON.stringify(result, null, 2);
}

// --- check_status ---
export const checkStatusSchema = z.object({
  sms_id: z.string().describe("ID сообщения для проверки статуса"),
});

export async function handleCheckStatus(params: z.infer<typeof checkStatusSchema>): Promise<string> {
  const result = await smsRuGet("sms/status", { sms_id: params.sms_id });
  return JSON.stringify(result, null, 2);
}

// --- get_balance ---
export const getBalanceSchema = z.object({});

export async function handleGetBalance(_params: z.infer<typeof getBalanceSchema>): Promise<string> {
  const result = await smsRuGet("my/balance");
  return JSON.stringify(result, null, 2);
}

// --- get_cost ---
export const getCostSchema = z.object({
  to: z.string().describe("Номер получателя (формат 79XXXXXXXXX)"),
  msg: z.string().describe("Текст сообщения для расчёта стоимости"),
});

export async function handleGetCost(params: z.infer<typeof getCostSchema>): Promise<string> {
  const result = await smsRuGet("sms/cost", { to: params.to, msg: params.msg });
  return JSON.stringify(result, null, 2);
}

// --- get_senders ---
export const getSendersSchema = z.object({});

export async function handleGetSenders(_params: z.infer<typeof getSendersSchema>): Promise<string> {
  const result = await smsRuGet("my/senders");
  return JSON.stringify(result, null, 2);
}
