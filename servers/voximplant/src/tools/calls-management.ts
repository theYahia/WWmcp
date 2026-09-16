import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { voxGet, voxPost } from "../client.js";
import { fromResult, type ToolResult } from "../lib/formatters.js";
import { dateTime, count, offset } from "../lib/schemas.js";

// ──────────────────────────────────────────────────────────────
// start_call — инициировать исходящий звонок (StartScenarios)
// ──────────────────────────────────────────────────────────────

export const startCallSchema = z.object({
  rule_id: z.number().int().describe("ID правила маршрутизации (StartScenarios запускает его сценарий)"),
  destination: z
    .string()
    .min(1)
    .describe(
      "Назначение звонка (номер E.164, SIP URI или внутренний extension). Передаётся сценарию через customData: сценарий читает VoxEngine.customData() и инициирует звонок (callPSTN/callPBX/callSIP).",
    ),
  caller_id: z.string().optional().describe("Caller ID — передаётся сценарию в customData (StartScenarios не имеет отдельного параметра caller_id)."),
  script_custom_data: z.string().optional().describe("Переопределить customData целиком. Если задано — destination/caller_id игнорируются."),
});

export async function handleStartCall(params: z.infer<typeof startCallSchema>): Promise<ToolResult> {
  // У StartScenarios НЕТ параметра destination — номер назначения передаётся
  // сценарию через script_custom_data; сценарий читает его VoxEngine.customData().
  // VERIFY: соглашение customData со сценарием, см. docs/VERIFICATION.md §4.
  const customData =
    params.script_custom_data ??
    JSON.stringify({
      destination: params.destination,
      ...(params.caller_id ? { caller_id: params.caller_id } : {}),
    });
  return fromResult(await voxPost("StartScenarios", {
    rule_id: String(params.rule_id),
    script_custom_data: customData,
  }));
}

// ──────────────────────────────────────────────────────────────
// get_acd_state — состояние ACD-очередей (замена несуществующего GetActiveSessions)
// ──────────────────────────────────────────────────────────────

export const getAcdStateSchema = z.object({
  acd_queue_id: z
    .string()
    .optional()
    .describe("Фильтр по ID очереди ACD: число, список через запятую или 'any'. По умолчанию — все очереди."),
});

export async function handleGetAcdState(params: z.infer<typeof getAcdStateSchema>): Promise<ToolResult> {
  const query: Record<string, string> = {};
  // VERIFY: имя параметра acd_queue_id, см. docs/VERIFICATION.md §3.
  if (params.acd_queue_id) query.acd_queue_id = params.acd_queue_id;
  return fromResult(await voxGet("GetACDState", query));
}

// ──────────────────────────────────────────────────────────────
// get_sms_history — история SMS-сообщений
// ──────────────────────────────────────────────────────────────

export const getSmsHistorySchema = z.object({
  from_date: dateTime("Начало периода (YYYY-MM-DD HH:mm:ss, UTC)"),
  to_date: dateTime("Конец периода (YYYY-MM-DD HH:mm:ss, UTC)"),
  source_number: z.string().optional().describe("Фильтр по номеру отправителя"),
  destination_number: z.string().optional().describe("Фильтр по номеру получателя"),
  count: count(20),
  offset: offset(),
});

export async function handleGetSmsHistory(params: z.infer<typeof getSmsHistorySchema>): Promise<ToolResult> {
  const query: Record<string, string> = {
    from_date: params.from_date,
    to_date: params.to_date,
    count: String(params.count),
    offset: String(params.offset),
  };
  if (params.source_number) query.source_number = params.source_number;
  if (params.destination_number) query.destination_number = params.destination_number;
  // Корректное имя метода — GetSmsHistory (НЕ GetSMSHistory: all-caps → 404).
  return fromResult(await voxGet("GetSmsHistory", query));
}

export function registerCallManagementTools(server: McpServer): void {
  server.tool(
    "start_call",
    "Инициировать исходящий звонок через Voximplant по правилу маршрутизации. Номер назначения передаётся сценарию через customData — сценарий VoxEngine должен его обработать.",
    startCallSchema.shape,
    withErrorHandling(handleStartCall),
  );
  server.tool(
    "get_acd_state",
    "Получить состояние ACD-очередей Voximplant (звонки в очереди, статусы операторов).",
    getAcdStateSchema.shape,
    withErrorHandling(handleGetAcdState),
  );
  server.tool(
    "get_sms_history",
    "Получить историю SMS-сообщений за период с фильтрами по номерам.",
    getSmsHistorySchema.shape,
    withErrorHandling(handleGetSmsHistory),
  );
}
