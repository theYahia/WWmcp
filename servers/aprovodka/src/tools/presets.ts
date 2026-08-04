import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { PRESETS, listPresets, getPresetWithCommon } from "../presets/index.js";

// ──────────────────────────────────────────────────────────────
// get_config_preset — курированная схема типовой конфигурации 1С
// Данные локальные: сетевого вызова НЕТ, базa 1С не нужна.
// ──────────────────────────────────────────────────────────────

const PRESET_IDS = PRESETS.map((p) => p.id).join(", ");

export const getConfigPresetSchema = z.object({
  config: z
    .string()
    .optional()
    .describe(
      `Конфигурация: ${PRESET_IDS} — либо синоним (бухгалтерия, ут, зуп, erp, accounting, trade). ` +
      "Без параметра возвращается список доступных пресетов.",
    ),
});

export async function handleGetConfigPreset(
  params: z.infer<typeof getConfigPresetSchema>,
): Promise<string> {
  if (!params.config) {
    return JSON.stringify(
      {
        presets: listPresets(),
        hint: "Повторите вызов с config=<id>, чтобы получить сущности, примеры и ловушки.",
      },
      null,
      2,
    );
  }

  const found = getPresetWithCommon(params.config);
  if (!found) {
    return JSON.stringify(
      {
        error: `Пресет "${params.config}" не найден.`,
        available: listPresets().map((p) => ({ id: p.id, name: p.name, aliases: p.aliases })),
      },
      null,
      2,
    );
  }

  return JSON.stringify(
    {
      ...found.preset,
      platform: found.common,
      how_to_read:
        'confidence:"verified" — имя встречено в источнике из sources. ' +
        'confidence:"common" — типовое имя из практики, НЕ подтверждённое: сначала ' +
        "list_entities / describe_entity на конкретной базе, потом запрос. " +
        "Пресет — карта, а не гарантия: любая база могла быть доработана.",
    },
    null,
    2,
  );
}

/**
 * Точка подключения. Вызвать один раз из createServer():
 *
 *   import { registerPresetTools } from "./tools/presets.js";
 *   registerPresetTools(server);
 *
 * Отдельная функция, чтобы не править общий реестр инструментов в server.ts.
 */
export function registerPresetTools(server: McpServer): void {
  server.tool(
    "get_config_preset",
    "Курированная схема типовой конфигурации 1С (БП 3.0, УТ 11, ЗУП 3.1, ERP 2): ключевые " +
    "OData-сущности с русскими описаниями, готовые примеры запросов и частые ловушки. " +
    "Локальные данные — запроса к базе не делает. Вызывать ПЕРЕД list_entities, чтобы знать, " +
    "что искать; без config возвращает список пресетов.",
    getConfigPresetSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetConfigPreset(params) }],
    })),
  );
}
