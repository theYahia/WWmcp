// Telegram alert — отправка одного консолидированного сообщения с найденными repos
import type { ScoredRepo } from './filter.ts';

function escapeMarkdown(text: string): string {
  // Telegram MarkdownV2 — экранируем спецсимволы
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, (m) => `\\${m}`);
}

export function formatMessage(repos: ScoredRepo[], since: string): string {
  if (repos.length === 0) {
    return `🔍 *GitHub Trending \\(${escapeMarkdown(since)}\\)*: новых matches нет`;
  }

  const lines: string[] = [
    `🔥 *GitHub Trending \\(${escapeMarkdown(since)}\\)* — ${repos.length} matches`,
    '',
  ];

  for (const r of repos.slice(0, 10)) {
    const tags = r.matched.slice(0, 4).map((w) => `\\#${escapeMarkdown(w.replace(/\s+/g, '_'))}`).join(' ');
    const solo = r.solo_builder_fit ? ' 🧑‍💻' : '';
    lines.push(
      `*${escapeMarkdown(r.full_name)}*${solo} \\[score: ${r.score}\\]`,
      `⭐ ${r.stars} \\(\\+${r.stars_recent} ${escapeMarkdown(since)}\\) · ${escapeMarkdown(r.language || 'n/a')}`,
      escapeMarkdown(r.description.slice(0, 200) || '(no description)'),
      `${tags}`,
      `[${escapeMarkdown(r.full_name)}](${r.url})`,
      '',
    );
  }

  return lines.join('\n');
}

export async function sendTelegram(
  token: string,
  chatId: string,
  text: string,
): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram sendMessage failed: HTTP ${res.status} — ${body}`);
  }
}
