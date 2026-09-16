import { voxGet } from "../client.js";
import { fromResult, type ToolResult } from "../lib/formatters.js";
import { shapeAccountInfo } from "../lib/shape.js";

export const skillAccountInfo = {
  name: "skill-account-info",
  title: "Информация об аккаунте",
  description: "Получить информацию об аккаунте Voximplant: баланс, тариф, лимиты.",
  async run(): Promise<ToolResult> {
    const res = await voxGet("GetAccountInfo", { return_live_balance: "true" });
    // Строгий витлист — api_key/callback_salt не утекают в ответ.
    return fromResult(res, (data) => ({
      title: "Информация об аккаунте Voximplant",
      ...shapeAccountInfo(data),
    }));
  },
};
