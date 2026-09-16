import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { voxGet } from "../client.js";
import { fromResult, type ToolResult } from "../lib/formatters.js";
import { count, offset } from "../lib/schemas.js";

export const getRulesSchema = z.object({
  application_id: z.number().int().describe("ID приложения"),
  count: count(50),
  offset: offset(),
});

export async function handleGetRules(params: z.infer<typeof getRulesSchema>): Promise<ToolResult> {
  return fromResult(await voxGet("GetRules", {
    application_id: String(params.application_id),
    count: String(params.count),
    offset: String(params.offset),
  }));
}

export function registerRuleTools(server: McpServer): void {
  server.tool(
    "get_rules",
    "Получить правила маршрутизации Voximplant для приложения.",
    getRulesSchema.shape,
    withErrorHandling(handleGetRules),
  );
}
