import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { voxGet } from "../client.js";
import { fromResult, type ToolResult } from "../lib/formatters.js";
import { shapeAccountInfo } from "../lib/shape.js";

export const getAccountInfoSchema = z.object({});

export async function handleGetAccountInfo(): Promise<ToolResult> {
  // return_live_balance=true — актуальный баланс. Ответ шейпится строгим витлистом:
  // GetAccountInfo эхо-возвращает api_key/callback_salt — их вырезаем (см. shapeAccountInfo).
  const res = await voxGet("GetAccountInfo", { return_live_balance: "true" });
  return fromResult(res, shapeAccountInfo);
}

export function registerAccountTools(server: McpServer): void {
  server.tool(
    "get_account_info",
    "Получить информацию об аккаунте Voximplant (баланс, тариф, лимиты). Секретные поля (api_key, callback_salt) скрыты из ответа.",
    getAccountInfoSchema.shape,
    withErrorHandling(handleGetAccountInfo),
  );
}
