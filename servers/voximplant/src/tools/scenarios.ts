import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { voxGet, voxPost } from "../client.js";
import { fromResult, error, type ToolResult } from "../lib/formatters.js";
import { count, offset } from "../lib/schemas.js";

export const getScenariosSchema = z.object({
  count: count(50),
  offset: offset(),
  scenario_name: z.string().optional().describe("Фильтр по имени сценария"),
});

export async function handleGetScenarios(params: z.infer<typeof getScenariosSchema>): Promise<ToolResult> {
  const query: Record<string, string> = {
    count: String(params.count),
    offset: String(params.offset),
  };
  if (params.scenario_name) query.scenario_name = params.scenario_name;
  return fromResult(await voxGet("GetScenarios", query));
}

// ──────────────────────────────────────────────────────────────
// update_scenario — обновить код сценария VoxEngine
// ──────────────────────────────────────────────────────────────

export const updateScenarioSchema = z.object({
  scenario_id: z.number().int().describe("ID сценария Voximplant"),
  scenario_name: z.string().optional().describe("Новое имя сценария (необязательно)"),
  script: z.string().optional().describe("Новый JavaScript-код сценария VoxEngine"),
});

export async function handleUpdateScenario(params: z.infer<typeof updateScenarioSchema>): Promise<ToolResult> {
  // Guard от no-op: без script и без scenario_name обновлять нечего.
  if (params.scenario_name === undefined && params.script === undefined) {
    return error("Укажите хотя бы одно для обновления: script или scenario_name.");
  }
  const query: Record<string, string> = {
    scenario_id: String(params.scenario_id),
  };
  if (params.scenario_name) query.scenario_name = params.scenario_name;
  if (params.script) query.script = params.script;
  // POST: скрипт сценария может занимать килобайты — query string GET не выдержит.
  return fromResult(await voxPost("SetScenarioInfo", query));
}

export function registerScenarioTools(server: McpServer): void {
  server.tool(
    "get_scenarios",
    "Получить список сценариев Voximplant.",
    getScenariosSchema.shape,
    withErrorHandling(handleGetScenarios),
  );
  server.tool(
    "update_scenario",
    "Обновить код или имя сценария VoxEngine. Позволяет агенту динамически менять логику звонка.",
    updateScenarioSchema.shape,
    withErrorHandling(handleUpdateScenario),
  );
}
