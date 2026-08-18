import { z } from "zod";
import { mangoPost } from "../client.js";

// --- get_calls: История звонков ---

export const getCallsSchema = z.object({
  date_from: z.string().describe("Начало периода (UNIX timestamp или ISO 8601)"),
  date_to: z.string().describe("Конец периода (UNIX timestamp или ISO 8601)"),
  limit: z.number().int().min(1).max(1000).default(100).describe("Количество записей"),
});

export async function handleGetCalls(params: z.infer<typeof getCallsSchema>): Promise<string> {
  const result = await mangoPost("stats/request", {
    date_from: params.date_from,
    date_to: params.date_to,
    limit: params.limit,
  });
  return JSON.stringify(result, null, 2);
}

// --- get_users: Список пользователей ---

export const getUsersSchema = z.object({
  limit: z.number().int().min(1).max(1000).default(100).describe("Количество пользователей"),
});

export async function handleGetUsers(params: z.infer<typeof getUsersSchema>): Promise<string> {
  const result = await mangoPost("config/users/request", {
    limit: params.limit,
  });
  return JSON.stringify(result, null, 2);
}

// --- make_call: Инициировать звонок ---

export const makeCallSchema = z.object({
  from: z.string().describe("Внутренний номер или SIP-аккаунт инициатора"),
  to: z.string().describe("Номер назначения (E.164 или внутренний)"),
  line: z.string().optional().describe("Линия (CallerID) для исходящего звонка"),
});

export async function handleMakeCall(params: z.infer<typeof makeCallSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    from: { extension: params.from },
    to_number: params.to,
    command_id: `mcp_${Date.now()}`,
  };
  if (params.line) body.line_number = params.line;
  const result = await mangoPost("commands/callback", body);
  return JSON.stringify(result, null, 2);
}

// --- get_stats: Статистика звонков (сводная) ---

export const getStatsSchema = z.object({
  date_from: z.string().describe("Начало периода (UNIX timestamp или ISO 8601)"),
  date_to: z.string().describe("Конец периода (UNIX timestamp или ISO 8601)"),
});

export async function handleGetStats(params: z.infer<typeof getStatsSchema>): Promise<string> {
  const result = await mangoPost("stats/request", {
    date_from: params.date_from,
    date_to: params.date_to,
  });
  return JSON.stringify(result, null, 2);
}

// --- get_recording: Получить запись звонка ---

export const getRecordingSchema = z.object({
  recording_id: z.string().describe("ID записи разговора"),
  action: z.enum(["play", "download"]).default("play").describe("Действие: play (ссылка) или download"),
});

export async function handleGetRecording(params: z.infer<typeof getRecordingSchema>): Promise<string> {
  const result = await mangoPost("queries/recording/post", {
    recording_id: params.recording_id,
    action: params.action,
  });
  return JSON.stringify(result, null, 2);
}

// --- send_sms: Отправить SMS ---

export const sendSmsSchema = z.object({
  from_extension: z.string().describe("Внутренний номер отправителя"),
  to_number: z.string().describe("Номер получателя"),
  text: z.string().max(1000).describe("Текст сообщения"),
});

export async function handleSendSms(params: z.infer<typeof sendSmsSchema>): Promise<string> {
  const result = await mangoPost("commands/sms", {
    from_extension: params.from_extension,
    to_number: params.to_number,
    text: params.text,
    command_id: `mcp_sms_${Date.now()}`,
  });
  return JSON.stringify(result, null, 2);
}
