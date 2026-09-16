import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { voxGet, voxPost } from "../client.js";
import { fromResult, type ToolResult } from "../lib/formatters.js";
import { dateTime, count, offset } from "../lib/schemas.js";

// ── get_a2p_sms_history (READ) ────────────────────────────────
export const getA2pSmsHistorySchema = z.object({
  source_number: z.string().optional().describe("Фильтр по номеру отправителя (SenderID)"),
  destination_number: z.string().optional().describe("Фильтр по номеру получателя"),
  delivery_status: z.string().optional().describe("Фильтр по статусу доставки"),
  from_date: dateTime("Начало периода (YYYY-MM-DD HH:mm:ss, UTC)").optional(),
  to_date: dateTime("Конец периода (YYYY-MM-DD HH:mm:ss, UTC)").optional(),
  count: count(20),
  offset: offset(),
});

export async function handleGetA2pSmsHistory(p: z.infer<typeof getA2pSmsHistorySchema>): Promise<ToolResult> {
  const q: Record<string, string> = { count: String(p.count), offset: String(p.offset) };
  if (p.source_number) q.source_number = p.source_number;
  if (p.destination_number) q.destination_number = p.destination_number;
  if (p.delivery_status) q.delivery_status = p.delivery_status;
  if (p.from_date) q.from_date = p.from_date;
  if (p.to_date) q.to_date = p.to_date;
  return fromResult(await voxGet("A2PGetSmsHistory", q));
}

// ── send_a2p_sms (WRITE — guarded) ────────────────────────────
export const sendA2pSmsSchema = z.object({
  src_number: z.string().min(1).describe("Зарегистрированный SenderID / номер отправителя A2P"),
  dst_numbers: z
    .array(z.string().min(1))
    .min(1)
    .max(100)
    .describe("Список номеров получателей (до 100) в формате E.164"),
  text: z.string().min(1).describe("Текст сообщения"),
  store_body: z.boolean().optional().describe("Сохранять тело сообщения в истории"),
});

export async function handleSendA2pSms(p: z.infer<typeof sendA2pSmsSchema>): Promise<ToolResult> {
  // POST: рассылка нескольким получателям + текст — не в query string.
  // VERIFY: разделитель списка dst_numbers (';' vs ','), см. docs/VERIFICATION.md §5.
  const q: Record<string, string> = {
    src_number: p.src_number,
    dst_numbers: p.dst_numbers.join(";"),
    text: p.text,
  };
  if (p.store_body !== undefined) q.store_body = String(p.store_body);
  return fromResult(await voxPost("A2PSendSms", q));
}

export function registerA2pTools(server: McpServer): void {
  server.tool(
    "get_a2p_sms_history",
    "История доставки A2P-SMS с фильтрами по номерам, статусу и периоду.",
    getA2pSmsHistorySchema.shape,
    withErrorHandling(handleGetA2pSmsHistory),
  );
  server.tool(
    "send_a2p_sms",
    "⚠️ ДЕЙСТВИЕ С ОПЛАТОЙ: массовая A2P-рассылка SMS (до 100 получателей) через зарегистрированный SenderID. Реально отправляет сообщения и тарифицируется — обязательно подтвердите номера и текст с пользователем перед вызовом, не вызывайте автоматически.",
    sendA2pSmsSchema.shape,
    withErrorHandling(handleSendA2pSms),
  );
}
