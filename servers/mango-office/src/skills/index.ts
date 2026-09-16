import { mangoPost } from "../client.js";

/**
 * skill-call-history: "История звонков за сегодня"
 * Returns today's calls formatted for human reading.
 */
export async function skillCallHistory(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const startOfDay = now - (now % 86400);

  const result = await mangoPost("stats/request", {
    date_from: String(startOfDay),
    date_to: String(now),
    limit: 50,
  });

  const data = result as { records?: Array<Record<string, unknown>> };
  const records = data?.records ?? [];

  if (records.length === 0) {
    return "Сегодня звонков не было.";
  }

  const lines = records.map((r, i) => {
    const from = r.from ?? "неизвестно";
    const to = r.to ?? "неизвестно";
    const duration = r.duration ?? 0;
    const status = r.disconnect_reason === 1110 ? "отвечен" : "пропущен";
    return `${i + 1}. ${from} → ${to} | ${duration}с | ${status}`;
  });

  return `История звонков за сегодня (${records.length} шт.):\n${lines.join("\n")}`;
}

/**
 * skill-stats: "Статистика звонков"
 * Returns aggregated call statistics for today.
 */
export async function skillStats(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const startOfDay = now - (now % 86400);

  const result = await mangoPost("stats/request", {
    date_from: String(startOfDay),
    date_to: String(now),
  });

  const data = result as { records?: Array<Record<string, unknown>> };
  const records = data?.records ?? [];

  const total = records.length;
  const answered = records.filter((r) => r.disconnect_reason === 1110).length;
  const missed = total - answered;
  const totalDuration = records.reduce((sum, r) => sum + (Number(r.duration) || 0), 0);
  const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;

  return [
    `Статистика звонков за сегодня:`,
    `  Всего: ${total}`,
    `  Отвечено: ${answered}`,
    `  Пропущено: ${missed}`,
    `  Общая длительность: ${totalDuration}с`,
    `  Средняя длительность: ${avgDuration}с`,
  ].join("\n");
}
