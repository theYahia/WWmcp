import { jivoGet } from "../client.js";

interface ChatItem {
  chat_id?: string;
  status?: string;
  client_name?: string;
  agent_id?: string;
  created_at?: string;
  [key: string]: unknown;
}

export async function skillActiveChats(): Promise<string> {
  const result = await jivoGet("chats", { status: "active", limit: "100" }) as { data?: ChatItem[] } | ChatItem[];

  const chats: ChatItem[] = Array.isArray(result) ? result : (result?.data ?? []);

  if (chats.length === 0) {
    return "Активные чаты сейчас: нет активных чатов.";
  }

  const lines = chats.map((c, i) => {
    const client = c.client_name || "Без имени";
    const agent = c.agent_id || "не назначен";
    const time = c.created_at || "—";
    return `${i + 1}. ${client} -> оператор: ${agent} (с ${time})`;
  });

  return `Активные чаты сейчас (${chats.length}):\n${lines.join("\n")}`;
}
