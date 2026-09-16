import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { voxGet } from "../client.js";
import { fromResult, type ToolResult } from "../lib/formatters.js";
import { dateTime, count, offset } from "../lib/schemas.js";

/** Записать необязательный параметр в query, приводя к строке. */
function put(query: Record<string, string>, key: string, value: string | number | boolean | undefined): void {
  if (value !== undefined) query[key] = String(value);
}

// ── get_phone_numbers ─────────────────────────────────────────
export const getPhoneNumbersSchema = z.object({
  application_id: z.number().int().optional().describe("Фильтр по ID приложения"),
  country_code: z.string().optional().describe("Код страны (напр. RU)"),
  sms_supported: z.boolean().optional().describe("Только номера с поддержкой SMS"),
  count: count(50),
  offset: offset(),
});
export async function handleGetPhoneNumbers(p: z.infer<typeof getPhoneNumbersSchema>): Promise<ToolResult> {
  const q: Record<string, string> = { count: String(p.count), offset: String(p.offset) };
  put(q, "application_id", p.application_id);
  put(q, "country_code", p.country_code);
  put(q, "sms_supported", p.sms_supported);
  return fromResult(await voxGet("GetPhoneNumbers", q));
}

// ── get_applications ──────────────────────────────────────────
export const getApplicationsSchema = z.object({
  application_id: z.number().int().optional().describe("Фильтр по ID приложения"),
  application_name: z.string().optional().describe("Фильтр по имени приложения"),
  with_rules: z.boolean().optional().describe("Включить правила маршрутизации"),
  with_scenarios: z.boolean().optional().describe("Включить сценарии"),
  count: count(50),
  offset: offset(),
});
export async function handleGetApplications(p: z.infer<typeof getApplicationsSchema>): Promise<ToolResult> {
  const q: Record<string, string> = { count: String(p.count), offset: String(p.offset) };
  put(q, "application_id", p.application_id);
  put(q, "application_name", p.application_name);
  put(q, "with_rules", p.with_rules);
  put(q, "with_scenarios", p.with_scenarios);
  return fromResult(await voxGet("GetApplications", q));
}

// ── get_queues ────────────────────────────────────────────────
export const getQueuesSchema = z.object({
  application_id: z.number().int().optional().describe("ID приложения (обычно требуется API для скоупа очередей)"),
  with_skills: z.boolean().optional().describe("Включить навыки очередей"),
  with_operatorcount: z.boolean().optional().describe("Включить число операторов"),
  count: count(50),
  offset: offset(),
});
export async function handleGetQueues(p: z.infer<typeof getQueuesSchema>): Promise<ToolResult> {
  const q: Record<string, string> = { count: String(p.count), offset: String(p.offset) };
  put(q, "application_id", p.application_id);
  put(q, "with_skills", p.with_skills);
  put(q, "with_operatorcount", p.with_operatorcount);
  return fromResult(await voxGet("GetQueues", q));
}

// ── get_skills ────────────────────────────────────────────────
export const getSkillsSchema = z.object({
  skill_name: z.string().optional().describe("Фильтр по имени навыка"),
  count: count(50),
  offset: offset(),
});
export async function handleGetSkills(p: z.infer<typeof getSkillsSchema>): Promise<ToolResult> {
  const q: Record<string, string> = { count: String(p.count), offset: String(p.offset) };
  put(q, "skill_name", p.skill_name);
  return fromResult(await voxGet("GetSkills", q));
}

// ── get_sq_state (SmartQueue live state) ──────────────────────
export const getSqStateSchema = z.object({
  application_id: z.number().int().describe("ID приложения"),
  sq_queue_id: z.string().describe("ID SmartQueue-очереди: число, список через запятую или 'any'"),
  sq_queue_name: z.string().optional().describe("Имя SmartQueue-очереди (альтернатива id)"),
});
export async function handleGetSqState(p: z.infer<typeof getSqStateSchema>): Promise<ToolResult> {
  const q: Record<string, string> = {
    application_id: String(p.application_id),
    sq_queue_id: p.sq_queue_id,
  };
  put(q, "sq_queue_name", p.sq_queue_name);
  return fromResult(await voxGet("GetSQState", q));
}

// ── get_caller_ids ────────────────────────────────────────────
export const getCallerIdsSchema = z.object({
  active: z.boolean().optional().describe("Только активные/верифицированные"),
  count: count(50),
  offset: offset(),
});
export async function handleGetCallerIds(p: z.infer<typeof getCallerIdsSchema>): Promise<ToolResult> {
  const q: Record<string, string> = { count: String(p.count), offset: String(p.offset) };
  put(q, "active", p.active);
  return fromResult(await voxGet("GetCallerIDs", q));
}

// ── get_record_storages ───────────────────────────────────────
export const getRecordStoragesSchema = z.object({
  record_storage_name: z.string().optional().describe("Фильтр по имени хранилища записей"),
});
export async function handleGetRecordStorages(p: z.infer<typeof getRecordStoragesSchema>): Promise<ToolResult> {
  const q: Record<string, string> = {};
  put(q, "record_storage_name", p.record_storage_name);
  return fromResult(await voxGet("GetRecordStorages", q));
}

// ── get_transaction_history ───────────────────────────────────
export const getTransactionHistorySchema = z.object({
  from_date: dateTime("Начало периода (YYYY-MM-DD HH:mm:ss, UTC)"),
  to_date: dateTime("Конец периода (YYYY-MM-DD HH:mm:ss, UTC)"),
  transaction_type: z.string().optional().describe("Фильтр по типу транзакции"),
  count: count(20),
  offset: offset(),
});
export async function handleGetTransactionHistory(p: z.infer<typeof getTransactionHistorySchema>): Promise<ToolResult> {
  const q: Record<string, string> = {
    from_date: p.from_date,
    to_date: p.to_date,
    count: String(p.count),
    offset: String(p.offset),
  };
  put(q, "transaction_type", p.transaction_type);
  return fromResult(await voxGet("GetTransactionHistory", q));
}

export function registerObservabilityTools(server: McpServer): void {
  server.tool("get_phone_numbers", "Список телефонных номеров аккаунта Voximplant (привязка, поддержка SMS, продление).", getPhoneNumbersSchema.shape, withErrorHandling(handleGetPhoneNumbers));
  server.tool("get_applications", "Список приложений Voximplant (опционально с правилами/сценариями).", getApplicationsSchema.shape, withErrorHandling(handleGetApplications));
  server.tool("get_queues", "Список ACD-очередей Voximplant (опционально с навыками и числом операторов).", getQueuesSchema.shape, withErrorHandling(handleGetQueues));
  server.tool("get_skills", "Каталог навыков (skills) ACD для маршрутизации.", getSkillsSchema.shape, withErrorHandling(handleGetSkills));
  server.tool("get_sq_state", "Текущее состояние SmartQueue-очереди (операторы, задачи).", getSqStateSchema.shape, withErrorHandling(handleGetSqState));
  server.tool("get_caller_ids", "Список Caller ID аккаунта и статус их верификации.", getCallerIdsSchema.shape, withErrorHandling(handleGetCallerIds));
  server.tool("get_record_storages", "Список хранилищ записей разговоров.", getRecordStoragesSchema.shape, withErrorHandling(handleGetRecordStorages));
  server.tool("get_transaction_history", "История биллинговых транзакций за период (расходы аккаунта).", getTransactionHistorySchema.shape, withErrorHandling(handleGetTransactionHistory));
}
