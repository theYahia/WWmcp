// Entry point — orchestrate: fetch trending → filter → dedup → alert + Obsidian
import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchTrending } from './scraper.ts';
import { filterRepos, type ScoredRepo } from './filter.ts';
import { formatMessage, sendTelegram } from './tg.ts';
import { writeInboxCard } from './obsidian.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SEEN_PATH = join(__dirname, '..', 'data', 'seen_repos.json');

type Seen = {
  /** repo full_name → ISO timestamp последнего alert */
  alerts: Record<string, string>;
};

async function loadSeen(): Promise<Seen> {
  try {
    const txt = await fs.readFile(SEEN_PATH, 'utf8');
    return JSON.parse(txt);
  } catch {
    return { alerts: {} };
  }
}

async function saveSeen(seen: Seen): Promise<void> {
  await fs.mkdir(dirname(SEEN_PATH), { recursive: true });
  await fs.writeFile(SEEN_PATH, JSON.stringify(seen, null, 2), 'utf8');
}

/** Zero-dep .env / .env.local loader (текущей папке проекта) */
async function loadDotenv(): Promise<void> {
  for (const name of ['.env', '.env.local']) {
    try {
      const txt = await fs.readFile(join(__dirname, '..', name), 'utf8');
      for (const line of txt.split('\n')) {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (!m || process.env[m[1]]) continue;
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    } catch {
      /* missing file — ok */
    }
  }
}

async function main(): Promise<void> {
  await loadDotenv();

  const dryRun =
    process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';
  const minScore = parseInt(process.env.MIN_SCORE || '3', 10);
  const since = (process.env.TRENDING_SINCE || 'daily') as
    | 'daily'
    | 'weekly'
    | 'monthly';
  const topN = parseInt(process.env.TOP_N || '25', 10);
  const tgToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const tgChat = process.env.TELEGRAM_CHAT_ID || '';
  const vault = process.env.OBSIDIAN_VAULT_PATH || '';

  console.log(
    `[github-trends] dry_run=${dryRun} since=${since} top_n=${topN} min_score=${minScore}`,
  );

  // 1. Scrape
  const repos = await fetchTrending(since, topN);
  console.log(`[scraper] получено ${repos.length} repos`);

  // 2. Filter + score
  const matches = filterRepos(repos, minScore);
  console.log(`[filter] ${matches.length} matches со score ≥${minScore}`);

  // 3. Dedup — не алертим о repo если уже был alert за последние 7 дней
  const seen = await loadSeen();
  const cutoffMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const fresh: ScoredRepo[] = matches.filter((r) => {
    const last = seen.alerts[r.full_name];
    if (!last) return true;
    return Date.parse(last) < cutoffMs;
  });
  console.log(
    `[dedup] ${fresh.length} fresh (${matches.length - fresh.length} skipped как недавно alerted)`,
  );

  // 4. Print preview
  for (const r of fresh) {
    console.log(
      `  · ${r.full_name} [score=${r.score}] ⭐${r.stars} (+${r.stars_recent}) — ${r.matched.join(', ')}`,
    );
  }

  if (fresh.length === 0) {
    console.log('[done] нечего отправлять');
    return;
  }

  // 5. Alerts
  if (dryRun) {
    console.log('\n[dry-run] TG message preview:\n');
    console.log(formatMessage(fresh, since));
    console.log('\n[dry-run] Obsidian-карточка пропущена');
    return;
  }

  // TG
  if (tgToken && tgChat) {
    try {
      await sendTelegram(tgToken, tgChat, formatMessage(fresh, since));
      console.log('[tg] sent');
    } catch (e) {
      console.error('[tg] failed:', (e as Error).message);
    }
  } else {
    console.warn('[tg] TELEGRAM_BOT_TOKEN/CHAT_ID не выставлены — пропускаю');
  }

  // Obsidian
  if (vault) {
    try {
      const path = await writeInboxCard(vault, fresh, since);
      console.log(`[obsidian] записано → ${path}`);
    } catch (e) {
      console.error('[obsidian] failed:', (e as Error).message);
    }
  } else {
    console.warn('[obsidian] OBSIDIAN_VAULT_PATH не выставлен — пропускаю');
  }

  // 6. Update seen state
  const now = new Date().toISOString();
  for (const r of fresh) seen.alerts[r.full_name] = now;
  await saveSeen(seen);
  console.log(`[done] seen_repos.json обновлён (${Object.keys(seen.alerts).length} entries)`);
}

main().catch((e) => {
  console.error('[fatal]', e);
  process.exit(1);
});
