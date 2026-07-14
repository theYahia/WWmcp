# github-trends-bot

Парсер `https://github.com/trending` → keyword filter (AI / MCP / RAG / Claude / agents) → TG alert + Obsidian Inbox карточка.

Назначение: автоматизация idea sourcing batch (как rd024-rd030 manual screen) — каждые 12 часов получаем список trending repos, релевантных нашей thesis (MCP / agents / Russian-stack).

## Стек

- Node 22.5+ (native `--experimental-strip-types` для TS)
- `cheerio` для HTML scraping
- Pure `fetch` для GitHub trending + Telegram Bot API
- Zero-dep .env loader

## Quick start

```bash
cd D:/Yahia/active/WWmcps/WWmcp/bots/github-trends
cp .env.example .env
# отредактировать .env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, OBSIDIAN_VAULT_PATH
npm install
npm run dry-run   # без отправки в TG / Obsidian — только preview
npm run dev       # реальный прогон
```

## Конфигурация (.env)

| Переменная | Default | Описание |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | — | Токен бота от @BotFather |
| `TELEGRAM_CHAT_ID` | — | Chat ID для алертов (получить у @userinfobot) |
| `OBSIDIAN_VAULT_PATH` | — | Путь к Obsidian vault (пишет в `<vault>/Inbox/`) |
| `MIN_SCORE` | `3` | Минимальный score для алерта (см. `filter.ts`) |
| `TRENDING_SINCE` | `daily` | `daily` / `weekly` / `monthly` |
| `TOP_N` | `25` | Сколько верхних repos парсить |
| `DRY_RUN` | `false` | Не отправлять, только preview |

## Data flow

```
[GitHub /trending HTML]
        ↓ fetch + cheerio (scraper.ts)
[TrendingRepo[]]
        ↓ keyword scoring + solo-builder boost (filter.ts)
[ScoredRepo[] score >= MIN_SCORE]
        ↓ dedup vs data/seen_repos.json (7-day window)
[fresh ScoredRepo[]]
        ↓
   ┌────┴────┐
[TG alert]  [Obsidian Inbox/<date>_github_trends.md]
   │           │
   └────┬──────┘
        ↓
[update seen_repos.json]
```

## Scoring (filter.ts)

Каждый repo получает:
- +1 за каждое matched keyword из 4 категорий: `ai`, `mcp`, `rag`, `ru`
- +1 boost если есть хотя бы один MCP-keyword (primary thesis)
- +1 boost если solo-builder fit (≤500 stars + ≥30 recent **или** ≤3 контрибьютора)

`MIN_SCORE` по дефолту 3 — отсекает шум. Для широкого скрина — поставить 2.

## Cron

### Linux/macOS crontab

Каждые 12 часов (UTC):

```cron
0 */12 * * * cd /path/to/bots/github-trends && /usr/bin/node --experimental-strip-types src/index.ts >> /var/log/github-trends.log 2>&1
```

### Windows Task Scheduler

```powershell
$action = New-ScheduledTaskAction -Execute "node.exe" `
  -Argument "--experimental-strip-types src\index.ts" `
  -WorkingDirectory "D:\Yahia\active\WWmcps\WWmcp\bots\github-trends"
$trigger = New-ScheduledTaskTrigger -Daily -At 9am
$trigger2 = New-ScheduledTaskTrigger -Daily -At 9pm
Register-ScheduledTask -TaskName "github-trends-bot" -Action $action -Trigger @($trigger, $trigger2)
```

### Интеграция в night-loop

YAML в `D:/Yahia/active/night-loop/queue/`:

```yaml
id: github-trends-daily
type: shell
command: node --experimental-strip-types D:/Yahia/active/WWmcps/WWmcp/bots/github-trends/src/index.ts
max_runtime_min: 5
```

## Roadmap

| Stage | Feature | Why |
|---|---|---|
| MVP (текущая) | trending HTML scrape + keyword filter + TG/Obsidian alerts | Auto idea-sourcing daily batch |
| v0.2 | Star velocity (REST API `q=created:>2026-01-01 stars:>50`) | Catch repos до того как они в /trending |
| v0.3 | Per-repo deep-dive: README fetch + LLM summary (local Ollama) | Меньше manual triage, выше signal/noise |
| v0.4 | Auto-route в `Ideas_tracker.md` если score ≥7 | Skip Inbox triage step |
| v0.5 | RSS подписки на ai-news / huggingface daily papers | Beyond GitHub — broader idea sourcing |
| v1.0 | TG inline buttons (✅ /screen-niche / ❌ skip / 📌 watch) | Triage прямо из чата |

## Архитектура

См. `docs/ARCHITECTURE.md`.
