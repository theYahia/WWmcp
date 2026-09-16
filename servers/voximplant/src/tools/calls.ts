import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { voxGet, voxPost } from "../client.js";
import { fromResult, type ToolResult } from "../lib/formatters.js";
import { dateTime, count, offset, phoneNumber } from "../lib/schemas.js";

export const getCallHistorySchema = z.object({
  from_date: dateTime("Начало периода (YYYY-MM-DD HH:mm:ss, UTC)"),
  to_date: dateTime("Конец периода (YYYY-MM-DD HH:mm:ss, UTC)"),
  count: count(20),
  offset: offset(),
});

export async function handleGetCallHistory(params: z.infer<typeof getCallHistorySchema>): Promise<ToolResult> {
  return fromResult(await voxGet("GetCallHistory", {
    from_date: params.from_date,
    to_date: params.to_date,
    count: String(params.count),
    offset: String(params.offset),
  }));
}

export const getUsersSchema = z.object({
  count: count(50),
  offset: offset(),
});

export async function handleGetUsers(params: z.infer<typeof getUsersSchema>): Promise<ToolResult> {
  return fromResult(await voxGet("GetUsers", {
    count: String(params.count),
    offset: String(params.offset),
  }));
}

export const sendSmsSchema = z.object({
  source: z.string().min(1).describe("Номер отправителя или буквенный sender ID"),
  destination: phoneNumber("Номер получателя в формате E.164, напр. +79001234567"),
  sms_body: z.string().min(1).describe("Текст сообщения"),
});

export async function handleSendSms(params: z.infer<typeof sendSmsSchema>): Promise<ToolResult> {
  // POST: текст SMS может быть длинным — не загоняем его в query string.
  return fromResult(await voxPost("SendSmsMessage", {
    source: params.source,
    destination: params.destination,
    sms_body: params.sms_body,
  }));
}

export function registerCallTools(server: McpServer): void {
  server.tool(
    "get_call_history",
    "Получить историю звонков Voximplant за период.",
    getCallHistorySchema.shape,
    withErrorHandling(handleGetCallHistory),
  );
  server.tool(
    "get_users",
    "Получить список пользователей Voximplant.",
    getUsersSchema.shape,
    withErrorHandling(handleGetUsers),
  );
  server.tool(
    "send_sms",
    "Отправить SMS через Voximplant.",
    sendSmsSchema.shape,
    withErrorHandling(handleSendSms),
  );
}
