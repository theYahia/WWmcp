# @theyahia/vacancy-mcp

MCP server для поиска вакансий — full-text search + market pulse stats. Aggregated source-of-truth для job-vacancy data, собранной night-loop'ом.

## Что делает

5 MCP-tools поверх SQLite (FTS5):

| Tool | Назначение |
|------|------------|
| `search_vacancies` | Full-text по title/company/raw + фильтры source / location / salary_min |
| `get_vacancy` | Детали по ID (вкл. raw payload из источника) |
| `list_companies` | Companies в базе с counts |
| `today_digest` | Что нового за N часов (default 24h) |
| `market_pulse` | Aggregate: total / median salary / top hiring companies |

## Источники данных

Импортирует из night-loop output (`D:/Yahia/active/night-loop/output/<date>/vacancies-scan/raw.json`):

- **Habr Career** (broad query + company-targeted): `habr-career`
- **Telegram digest mining** (LLM-summarized): `tg-digest`
- **Career pages SPA** (Playwright): `career-page`
- **Telegram live feed**: `telegram-jobs`

Schema night-loop совпадает один-в-один: `{id, source, company, title, url, salary?, location?, posted_at?}`.

## Установка / dev

```bash
cd servers/vacancy-mcp
npm install            # better-sqlite3 + MCP SDK + zod
npm run dev            # tsx src/index.ts (stdio MCP)
```

## Импорт данных

```bash
npm run import -- --days 7
# или прямой путь:
tsx scripts/import_from_night_loop.ts --src D:/Yahia/active/night-loop/output --days 30
```

Idempotent — повторный импорт обновит существующие записи (UPSERT по `id`).

## Конфигурация Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "vacancy-mcp": {
      "command": "node",
      "args": ["D:/Yahia/active/WWmcps/WWmcp/servers/vacancy-mcp/dist/index.js"],
      "env": { "VACANCY_DB_PATH": "D:/Yahia/active/WWmcps/WWmcp/servers/vacancy-mcp/data/vacancies.db" }
    }
  }
}
```

## SQLite Schema

```
vacancies(id PK, title, company, salary_min, salary_max, salary_raw,
          location, posted_at, source, url, role, raw, imported_at)
+ FTS5 mirror table (title, company, salary_raw, raw)
+ idx_company / idx_source / idx_posted / idx_role / idx_imported
```

`role` — классифицирована эвристикой по title (product / ml / data / engineering / design / marketing).

## Roadmap

- v0.2 — share-DB режим: read-only attach к night-loop процессу для live updates
- v0.3 — RSS / iCal export для today_digest
- v0.4 — semantic embedding column (pgvector-like) для смыслового поиска
- v0.5 — LinkedIn / hh.ru API (если/когда они снова откроются)

## Notes

- TypeScript strict, Node 22.5+, ESM.
- Pure stdlib pattern (no Express, no extra HTTP server) — stdio только.
- ~450 LOC всего без зависимостей.
