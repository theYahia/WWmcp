# Architecture — github-trends-bot

## Дизайн-принципы

1. **Stateless run** — каждый прогон самодостаточен, единственное persistent state = `data/seen_repos.json` (dedup).
2. **No new deps** — только `cheerio` (HTML parsing), всё остальное на native stdlib (fetch / fs / path).
3. **Fail-soft** — если TG упал, всё равно пишем в Obsidian; если Obsidian упал — TG отправлен. Не теряем data.
4. **Dry-run first** — `--dry-run` флаг для тестов без побочных эффектов.

## Модули

```
src/
├── scraper.ts    — fetchTrending(since, topN) → TrendingRepo[]
├── filter.ts     — scoreRepo / filterRepos → ScoredRepo[]
├── tg.ts         — formatMessage (MarkdownV2) + sendTelegram
├── obsidian.ts   — writeInboxCard(vaultPath, repos)
└── index.ts      — orchestrate: scrape → filter → dedup → alert
```

### scraper.ts

Парсит `<article class="Box-row">` из `/trending?since=<period>`. Ключевые поля:
- `h2 a[href]` → `owner/name`
- `p` → description
- `[itemprop="programmingLanguage"]` → язык
- `a[href$="/stargazers"]` → total stars
- `span.float-sm-right` → stars за период (`X stars today`)
- `span.d-inline-block img` count → built_by avatars (proxy для contributor count)

**Risk:** GitHub может поменять разметку. Mitigation — selectors локализованы в одной функции, `built_by_count` опциональный (default 0).

### filter.ts

4 keyword категории (ai / mcp / rag / ru). Word-boundary matching через regex (case-insensitive, дефис как часть слова).

Score:
- +1 за каждое уникальное matched keyword
- +1 boost если хотя бы один MCP keyword (primary thesis)
- +1 boost если solo-builder fit (`stars ≤500 && recent ≥30` ИЛИ `built_by_count ≤3`)

### tg.ts

MarkdownV2 message с экранированием (требование Telegram). Рендерим top-10 matches с tags / score / description preview / link.

### obsidian.ts

Append-mode: один файл за день (`<vault>/Inbox/<YYYY-MM-DD>_github_trends.md`), несколько прогонов = несколько `## Run:` секций. YAML frontmatter добавляется только при создании файла.

### index.ts

1. Load .env (zero-dep parser, walks `.env` и `.env.local`).
2. `fetchTrending` → `filterRepos` → dedup vs `seen_repos.json` (7-day TTL).
3. Print preview всех fresh matches.
4. Если `--dry-run` — stop здесь.
5. TG alert (best-effort) → Obsidian write (best-effort) → save seen state.

## Dedup window

7 дней. Логика: если repo всё ещё в trending через неделю — это уже не "discovery", а sustained trend. Не спамим.

Reset: `rm data/seen_repos.json` или вручную поправить JSON.

## Observability

Plain stdout логи с префиксами `[scraper]` / `[filter]` / `[dedup]` / `[tg]` / `[obsidian]` / `[done]`. Подходит для cron-out перенаправления в logfile (`>> /var/log/github-trends.log 2>&1`).

## Security notes

- `.env` в `.gitignore`, в коммит не идёт.
- TG bot token — write-only канал (бот может только отправлять в conversation, не читать чужое).
- GitHub trending — public HTML, без auth, без rate-limit рисков (1 запрос/12ч).
- `seen_repos.json` содержит только public repo names — не sensitive data.

## Open questions / known limitations

- **HTML schema drift:** GitHub может изменить классы / структуру. Detection: `repos.length === 0` после fetch → alert oncall.
- **No README scoring:** v0.1 фильтрует только по описанию + name + языку. README может содержать ключевые сигналы (e.g. "MCP server for X") — добавим в v0.3.
- **No language stats:** не учитываем что python+typescript = AI-стек bias. Возможно стоит boost'ить.
- **Single trending source:** только `/trending`, не `huggingface daily papers`, `ai-news`, `Product Hunt AI`. v0.5 расширит.
