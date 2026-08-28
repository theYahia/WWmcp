import { z } from "zod";
import { createLogger } from "@theyahia/mcp-core";
import { getClient } from "../client.js";

const logger = createLogger("mindbox-mcp");

export const runOperationSchema = z.object({
  operation: z.string().describe("Системное имя произвольной операции Mindbox"),
  body: z.record(z.string(), z.unknown()).default({}).describe("Тело запроса (JSON)"),
  mode: z
    .enum(["sync", "async"])
    .default("sync")
    .describe("Режим: sync (request→response) или async (fire-and-forget)"),
});

/** Отключён ли raw-доступ: MINDBOX_ALLOW_RAW=0 / false / off / no. */
function rawDisabled(): boolean {
  const v = (process.env.MINDBOX_ALLOW_RAW ?? "").trim().toLowerCase();
  return v === "0" || v === "false" || v === "off" || v === "no";
}

export async function handleRunOperation(
  params: z.infer<typeof runOperationSchema>,
): Promise<string> {
  if (rawDisabled()) {
    return "Инструмент run_operation отключён (MINDBOX_ALLOW_RAW=0). Уберите переменную или задайте MINDBOX_ALLOW_RAW=1, чтобы включить произвольные операции.";
  }

  // run_operation шлёт любую операцию с секретным ключом — логируем для аудита.
  logger.warn("run_operation invoked", {
    operation: params.operation,
    mode: params.mode,
  });

  const result = await getClient().operation(params.operation, params.body, { mode: params.mode });
  return JSON.stringify(result, null, 2);
}
