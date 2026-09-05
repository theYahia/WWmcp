# MCP Servers — Claude Code Instructions

## Проект
MCP-серверы для российских, СНГ и мировых API. npm org: @theyahia. GitHub: theYahia, монорепо `WWmcp` — **публичный**.
Стратегия: "Composio для остального мира" — MCP для non-Western API.

## Структура
```
WWmcp/
├── packages/
│   ├── core/               @theyahia/mcp-core (auth, client, errors, logging, dual transport)
│   ├── create-mcp/         @theyahia/create-mcp (скаффолдер новых серверов)
│   └── telemetry/          @theyahia/mcp-telemetry
├── servers/                46 серверов (Turborepo workspaces) + `_template/` — заготовка, не сервер
├── scripts/                служебные скрипты монорепо (catalog.mjs, build-mcpb.mjs)
├── docs/                   ⚠️ публикуется на GitHub Pages (ветка `main`, папка `/docs`)
│   ├── index.html          витрина каталога
│   ├── configs/            примеры конфигов (Claude Desktop, Cursor)
│   ├── use-cases/          сценарии использования
│   └── discoverability/
└── .github/workflows/      ci.yml, e2e.yml, release.yml, dependabot-automerge.yml
```

Число серверов проверяется командой, а не памятью:

```bash
ls -1d servers/*/ | grep -v _template | wc -l
```

Каталогов `pipeline/`, `skills/`, `content/` в монорепо **нет**. Они перечислены в `.gitignore`,
потому что живут отдельными репозиториями (`theYahia/<name>-mcp`, `theYahia/mcp-skills`) — не считать
их частью дерева и не искать в них файлы.

**Два репозитория остаются вне консолидации осознанно** (решение 05.09, WORK-388 — не переоткрывать):

- **`theYahia/mcp-skills`** — кросс-серверные воркфлоу по отраслям (ai, cis, comms, ecommerce,
  finance, hr, logistics, marketing). В монорепо своя схема скиллов, другая по единице:
  `servers/<name>/.claude/skills/<skill>/SKILL.md`, 63 штуки, консистентность проверяется
  `packages/core/tests/skills-consistency.test.ts`. Слияние смешало бы две схемы и потребовало бы
  переписать этот тест — ради «всё в одном месте» и ничего больше. README ссылается на репозиторий
  как на компаньон, ссылка работает.
- **`theYahia/chestnyznak-mcp`** — единственный сервер на Python, в pnpm/TypeScript-workspace
  как есть не встаёт. 204 установки в месяц — живой трафик, который переписывание на TS обнулит
  без выгоды. Единственное исключение из консолидации; на остальные серверы не влияет.

⚠️ **`docs/` целиком публикуется на GitHub Pages.** Всё, что туда положено, доступно по публичному
URL; «спрятать» файл, переложив его в `docs/archive/`, невозможно. Внутренние планы, ресёрч и аудиты
вынесены за пределы репозитория — в `../_archive-from-public/`.

## Правило подсчёта инструментов

- Считаем то, что возвращает `client.listTools()` у **собранного** сервера, а не то, что нашлось грепом.
- `server.prompt(...)` — это промпты, в счёт инструментов они **не** входят.
  Пример: `servers/planfix` — 20 инструментов и 2 промпта отдельно.
- У серверов, где набор инструментов зависит от окружения, фиксируем число **при настройках по
  умолчанию** и подписываем это условие рядом с числом:
  - `servers/aprovodka` — `ONEC_SERVICES` фильтрует, какие группы инструментов регистрируются;
    `ONEC_WRITE_MODE` (по умолчанию `off`) управляет пишущими;
  - `servers/retailcrm` — `isReadonly()` (env `RETAILCRM_READONLY`, по умолчанию выключен) отсекает
    write/destructive инструменты.
- Источник правды по числам — `scripts/catalog.mjs`. README, `docs/` и этот файл сверяются с ним,
  а не друг с другом.

## ⚠️ .gitignore — паттерны каталогов только с ведущим слешем

Писать `/skills/`, а не `skills/`. Без ведущего слеша git применяет паттерн **на любой глубине**:
28.08 правило `skills/` молча проглотило `servers/mango-office/src/skills/index.ts`, и релизный
конвейер был сломан две недели. То же относится к `/pipeline/`, `/content/`, `/package/`.

## Правила
1. **Планы, статусы и аудиты — не в публичном репозитории.** Задачи — в Яндекс Трекере, рабочие
   материалы — в `../_archive-from-public/`. Не заводить в корне `PLAN.md`, `STATUS.md`,
   `REVIEW-<дата>.md` и т. п.
2. **НЕ создавать серверы-заготовки.** Допилить существующие до production.
3. **НЕ конкурировать** с Bitrix24 official MCP и amoCRM (caiborg-ai, 36 tools).
4. Production серверы в `servers/` — Turborepo workspaces, используют @theyahia/mcp-core.
5. npm scope: `@theyahia`, исключение: `@metarebalance/dadata-mcp`.

## Стек
- TypeScript, Node.js >=18
- MCP SDK (@modelcontextprotocol/sdk)
- Turborepo + pnpm (monorepo)
- @theyahia/mcp-core (auth, client, errors, logging, dual transport)
- Тесты: vitest
- CI/CD: GitHub Actions (ci.yml, e2e.yml, release.yml)
- Публикация: changesets → npm publish

## Skill routing
| Задача | Скилл |
|--------|-------|
| Код-ревью MCP-сервера | `/review` |
| Тесты | `/qa` |
| Security audit | `/cso-ops` |
| Деплой/публикация | `/ship` |
| Баг/ошибка | `/investigate` |

## Скаффолд нового сервера

Канонический способ — через `@theyahia/create-mcp`:

```bash
npx @theyahia/create-mcp <name> --region=<...> --category=<...> --base-url=<...>
```

Копирует `servers/_template/` в `servers/<name>/`, заменяет placeholders. Подробности — `packages/create-mcp/README.md` и `servers/_template/HOW_TO_TEMPLATE.md`.

Не копировать `_template/` руками — CLI делает это правильнее (env-prefix, mcpName, repository.directory, keywords).

## Структура MCP-сервера (production)
```
servers/{name}/
├── package.json        @theyahia/{name}-mcp (workspace)
├── tsconfig.json       extends ../../tsconfig.base.json
├── README.md
├── LICENSE             MIT
└── src/
    ├── index.ts        entry, server setup, tool registration
    ├── client.ts       extends BaseHttpClient from core
    ├── types.ts        TypeScript типы
    └── tools/          отдельные tools
```

## Критерий production-grade
- 8+ tools покрывающих основные use cases
- Используют @theyahia/mcp-core (errors, client, auth, logging)
- Dual transport (stdio + Streamable HTTP)
- Error handling (isError: true)
- README с описанием каждого tool и demo-промптами
- Тесты (vitest, mock HTTP)
