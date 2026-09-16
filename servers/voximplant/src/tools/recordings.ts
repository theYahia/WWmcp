import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { voxGet } from "../client.js";
import { fromResult, type ToolResult } from "../lib/formatters.js";
import { dateTime, count, offset } from "../lib/schemas.js";

// ──────────────────────────────────────────────────────────────
// get_recordings — список записей разговоров (GetCallHistory with_records)
// ──────────────────────────────────────────────────────────────

export const getRecordingsSchema = z.object({
  from_date: dateTime("Начало периода (YYYY-MM-DD HH:mm:ss, UTC)"),
  to_date: dateTime("Конец периода (YYYY-MM-DD HH:mm:ss, UTC)"),
  call_session_history_id: z.number().int().optional().describe("ID конкретной сессии для получения записи"),
  count: count(20, 100),
  offset: offset(),
});

export async function handleGetRecordings(params: z.infer<typeof getRecordingsSchema>): Promise<ToolResult> {
  const query: Record<string, string> = {
    from_date: params.from_date,
    to_date: params.to_date,
    with_records: "1",
    count: String(params.count),
    offset: String(params.offset),
  };
  if (params.call_session_history_id) {
    query.call_session_history_id = String(params.call_session_history_id);
  }
  return fromResult(await voxGet("GetCallHistory", query));
}

export function registerRecordingTools(server: McpServer): void {
  server.tool(
    "get_recordings",
    "Получить список записей разговоров за период. Возвращает URL для скачивания записи (и transcription_url, если транскрипция готова).",
    getRecordingsSchema.shape,
    withErrorHandling(handleGetRecordings),
  );
}
