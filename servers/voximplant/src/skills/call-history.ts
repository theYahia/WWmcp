import { voxGet } from "../client.js";
import { fromResult, type ToolResult } from "../lib/formatters.js";
import { lastHoursRange } from "../lib/dates.js";

export const skillCallHistory = {
  name: "skill-call-history",
  title: "История звонков",
  description: "Получить сводку истории звонков за последние 24 часа.",
  async run(): Promise<ToolResult> {
    const { from, to } = lastHoursRange(24);
    const res = await voxGet("GetCallHistory", {
      from_date: from,
      to_date: to,
      count: "100",
      offset: "0",
    });
    return fromResult(res, (data) => {
      const d = data as { result?: unknown[]; total_count?: number };
      const calls = d.result ?? [];
      return {
        title: "История звонков (24ч)",
        period: { from, to },
        total_count: d.total_count ?? calls.length,
        returned: calls.length,
        calls,
      };
    });
  },
};
