# MCP Servers — Claude Code Instructions

## Проект
MCP-серверы для российских, СНГ и мировых API. npm org: @theyahia. GitHub: theYahia.
Стратегия: "Composio для остального мира" — MCP для non-Western API (33 страны).

## Структура
```
mcp-servers/
├── packages/core/          @theyahia/mcp-core (shared library)
├── servers/                12 production-grade серверов (Turborepo workspaces)
├── pipeline/               100+ серверов в build queue, по категориям:
│   ├── ai/                 gigachat, yandexgpt, salutespeech, etc.
│   ├── cis/                международные (50 стран)
│   ├── comms/              jivosite, mango-office, sms-ru, etc.
│   ├── crm/                amocrm, elma365, kaiten, megaplan
│   ├── data/               dadata, 2gis, chestnyznak, etc.
│   ├── finance/            1c-rest, alfa-bank, atol, kontur, sber
│   ├── hr/                 hh, huntflow, superjob
│   ├── logistics/          boxberry, pochta-russia, delovye-linii, etc.
│   ├── marketing/          appmetrica, mindbox, roistat, sendpulse, etc.
│   └── payments/           prodamus, sberbank-acquiring, yookassa
├── skills/                 40 multi-server MCP skills (.git repo)
├── research/               Deep Research: 33 страны, 1020 API кандидатов
├── content/                Habr, Telegram, listings
└── docs/
    ├── configs/            Примеры конфигов (Claude Desktop, Cursor)
    ├── use-cases/          Сценарии использования
    └── planning/           PLAN.md, STRUCTURE.md, IMPLEMENTATION.md, etc.
```

## Ключевые файлы
- `docs/planning/PLAN.md` — единственный актуальный план (обновлять тут)
- `docs/planning/STRUCTURE.md` — карта проекта и статус серверов
- `docs/planning/IMPLEMENTATION.md` — детальный план (спринты)
- `docs/planning/MASTER_INVENTORY.md` — 1020 API кандидатов
- `docs/planning/BUILD_QUEUE.md` — очередь сборки
- `IMPLEMENTATION_PLAN.md` — план миграции в монорепу

## Правила
1. **НЕ создавать новые версии планов.** Обновлять docs/planning/PLAN.md in-place.
2. **НЕ создавать серверы-заготовки.** Допилить существующие до production.
3. **НЕ конкурировать** с Bitrix24 official MCP и amoCRM (caiborg-ai, 36 tools).
4. Production серверы в `servers/` — Turborepo workspaces, используют @theyahia/mcp-core.
5. Pipeline серверы в `pipeline/{category}/{name}-mcp/` — каждый = отдельный git repo.
6. npm scope: `@theyahia`, исключение: `@metarebalance/dadata-mcp`.

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
