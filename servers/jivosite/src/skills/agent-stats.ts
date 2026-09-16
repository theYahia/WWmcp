import { jivoGet } from "../client.js";

interface AgentItem {
  agent_id?: string;
  name?: string;
  email?: string;
  status?: string;
  [key: string]: unknown;
}

export async function skillAgentStats(): Promise<string> {
  const result = await jivoGet("agents", { limit: "100" }) as { data?: AgentItem[] } | AgentItem[];

  const agents: AgentItem[] = Array.isArray(result) ? result : (result?.data ?? []);

  if (agents.length === 0) {
    return "Статистика операторов: нет операторов.";
  }

  const online = agents.filter(a => a.status === "online");
  const offline = agents.filter(a => a.status !== "online");

  const lines: string[] = [
    `Всего операторов: ${agents.length}`,
    `Онлайн: ${online.length}`,
    `Оффлайн: ${offline.length}`,
    "",
    "Операторы:",
  ];

  for (const a of agents) {
    const status = a.status === "online" ? "[ON]" : "[OFF]";
    lines.push(`  ${status} ${a.name || "Без имени"} (${a.email || "—"})`);
  }

  return lines.join("\n");
}
