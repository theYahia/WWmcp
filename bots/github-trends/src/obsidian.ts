// Obsidian Inbox writer — добавляет карточку в <vault>/Inbox/<date>_github_trends.md
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { ScoredRepo } from './filter.ts';

function todayISO(): string {
  // YYYY-MM-DD UTC
  return new Date().toISOString().slice(0, 10);
}

function repoBlock(r: ScoredRepo): string {
  const tags = r.matched.map((w) => `#${w.replace(/\s+/g, '_')}`).join(' ');
  const cats = Object.entries(r.category_hits)
    .filter(([, n]) => n > 0)
    .map(([cat, n]) => `${cat}:${n}`)
    .join(', ');
  return [
    `### [${r.full_name}](${r.url}) — score ${r.score}`,
    '',
    `- **Stars:** ${r.stars} (+${r.stars_recent} recent) · **Lang:** ${r.language || 'n/a'}`,
    `- **Categories:** ${cats || '—'}`,
    `- **Solo-builder fit:** ${r.solo_builder_fit ? 'yes 🧑‍💻' : 'no'}`,
    `- **Description:** ${r.description || '(no description)'}`,
    `- **Tags:** ${tags}`,
    '',
    `> Idea-source candidate. Triage в Ideas_tracker → screen-niche если score ≥5.`,
    '',
    '---',
    '',
  ].join('\n');
}

export async function writeInboxCard(
  vaultPath: string,
  repos: ScoredRepo[],
  since: string,
): Promise<string> {
  if (repos.length === 0) return '';

  const date = todayISO();
  const inboxDir = join(vaultPath, 'Inbox');
  await fs.mkdir(inboxDir, { recursive: true });

  const filePath = join(inboxDir, `${date}_github_trends.md`);
  const exists = await fs
    .stat(filePath)
    .then(() => true)
    .catch(() => false);

  let header = '';
  if (!exists) {
    header = [
      '---',
      `created: ${date}`,
      'source: github-trends-bot',
      'status: triage',
      `tags: [github, trends, idea-sourcing]`,
      '---',
      '',
      `# GitHub Trends — ${date}`,
      '',
      `Auto-generated. Period: \`${since}\`. Triage rule: score ≥5 → ${'`'}/screen-niche${'`'}.`,
      '',
    ].join('\n');
  }

  const runHeader = `## Run: ${new Date().toISOString()} — ${repos.length} matches\n\n`;
  const body = repos.map(repoBlock).join('');

  const content = (exists ? '\n' : header) + runHeader + body;
  await fs.appendFile(filePath, content, 'utf8');
  return filePath;
}
