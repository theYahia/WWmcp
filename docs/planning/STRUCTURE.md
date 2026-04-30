# @theyahia MCP Servers — Структура проекта

**Обновлено:** 2026-04-22
**Автор:** @theYahia
**GitHub:** github.com/theYahia/mcp-servers (monorepo) + 100+ отдельных repos
**npm org:** @theyahia (47+ пакетов) + @metarebalance (dadata-mcp)

---

## Структура

```
mcp-servers/                         Turborepo + pnpm монорепа
│
├── CLAUDE.md                        инструкции для Claude Code
├── README.md                        описание проекта + Quick Start
├── IMPLEMENTATION_PLAN.md           план миграции в монорепу
│
├── packages/core/                   @theyahia/mcp-core (shared library)
│   ├── src/auth/                    ApiKey, Basic, OAuth2, Dual, NoAuth
│   ├── src/client.ts                BaseHttpClient, RateLimitedClient
│   ├── src/errors.ts                createToolError() + withErrorHandling()
│   ├── src/format.ts                formatResponse(), currency formatters
│   ├── src/logging.ts               createLogger() → stderr JSON
│   ├── src/server.ts                runServer() — stdio + Streamable HTTP
│   └── src/testing/smoke.ts         E2E smoke test runner
│
├── servers/                         19 production-grade серверов (Turborepo workspaces)
│   ├── _template/                   шаблон для новых серверов
│   ├── moysklad/     (10 tools)     ERP, инвентарь, заказы
│   ├── cdek/         (16 tools)     доставка, тарифы, ПВЗ, вебхуки, квитанции
│   ├── cbr/          (5 tools)      курсы ЦБ РФ, ключевая ставка
│   ├── cbu/          (5 tools)      курсы ЦБ Узбекистана
│   ├── bitrix24/     (4 tools)      CRM, сделки, контакты
│   ├── cloudpayments/ (6 tools)     платежи, подписки
│   ├── tkassa/       (16 tools)     Т-Банк платежи, СБП, клиенты, T-Invest
│   ├── robokassa/    (2 tools)      платежи
│   ├── getcourse/    (3 tools)      EdTech платформа
│   ├── payme/        (10 tools)     UZ платежи JSON-RPC
│   ├── travelpayouts/ (13 tools)    авиа, отели, lookup, прямые рейсы
│   │
│   │  ── Promoted from pipeline 2026-04-22 (v2.0.0 release wave for starred repos):
│   ├── 1c-rest/      (9 tools)      1C:Enterprise OData (3⭐)
│   ├── wildberries/  (15 tools)     WB Seller API + 409 penalty rate limiter (1⭐, EvilFreelancer)
│   ├── megaplan/     (8 tools + 2 prompts) project mgmt, Password grant auth (1⭐)
│   ├── 2gis/         (8 tools)      places, geocoding, directions, reviews (1⭐)
│   ├── vk-ads/       (8 tools)      campaigns, ads, statistics, targeting (1⭐)
│   ├── salla/        (9 tools)      Saudi e-commerce (1⭐)
│   └── ileti-merkezi/ (8 tools)     Turkish SMS, custom HMAC auth (1⭐)
│
├── pipeline/                        97 серверов в build queue, по категориям
│   │                                (каждый = отдельный git repo + npm пакет)
│   ├── ai/        (5)              gigachat, yandexgpt, salutespeech, etc.
│   ├── cis/       (49)             международные (50 стран)
│   ├── comms/     (8)              jivosite, mango-office, sms-ru, etc.
│   ├── crm/       (7)              amocrm, elma365, kaiten, megaplan, etc.
│   ├── data/      (7)              dadata, 2gis, chestnyznak, etc.
│   ├── finance/   (6)              1c-rest, alfa-bank, atol, kontur, sber
│   ├── hr/        (3)              hh, huntflow, superjob
│   ├── logistics/ (5)              boxberry, pochta-russia, etc.
│   ├── marketing/ (11)             appmetrica, mindbox, roistat, etc.
│   └── payments/  (3)              prodamus, sberbank-acquiring, yookassa
│
├── skills/                          40 multi-server MCP skills (.git repo)
│   ├── ecommerce/                   заказ-оплата-доставка
│   ├── finance/                     контрагент-проверка, 1С
│   ├── marketing/                   ROI, email, SEO
│   ├── hr/                          резюме, зарплаты
│   ├── comms/                       омниканал, звонки
│   ├── logistics/                   курьеры, отгрузки
│   ├── data/                        адреса, маркировка
│   ├── ai/                          контент, сентимент
│   └── cis/                         Kaspi, UZ
│
├── research/                        все исследования
│   ├── archive/                     V1-V5 (не трогаем)
│   ├── cis-market/                  CIS ресёрч (11 стран, 950+ компаний)
│   ├── world-market/                Deep Research W01-W10
│   ├── competitive-landscape/       конкуренты
│   ├── deep-research-prompts/       15 промптов для Claude.ai Deep Research
│   ├── artifacts/                   compass артефакты, доп. исследования
│   ├── inventory_cis.csv
│   └── inventory_world.csv
│
├── content/                         контент для публикации
│   ├── habr/                        статьи Habr
│   ├── telegram/                    Telegram контент
│   ├── listings/                    листинги площадок
│   └── outreach/                    партнёрские письма
│
├── docs/
│   ├── configs/                     примеры конфигов (Claude Desktop, Cursor)
│   ├── use-cases/                   сценарии использования
│   └── planning/                    планирование
│       ├── PLAN.md                  единственный актуальный план
│       ├── STRUCTURE.md             этот файл
│       ├── IMPLEMENTATION.md        спринты, чекбоксы
│       ├── BUILD_QUEUE.md           очередь сборки
│       ├── MASTER_INVENTORY.md      1020 API кандидатов
│       ├── SKILLS_IMPLEMENTATION.md план скиллов
│       ├── WAVE_EXECUTION.md        промпты для агентов
│       └── VERIFICATION_REPORT.md   отчёт верификации
│
└── infra/                           Turborepo + CI/CD
    ├── .github/workflows/           ci.yml, e2e.yml, release.yml
    ├── .changeset/                  changesets versioning
    ├── turbo.json                   task pipeline
    ├── pnpm-workspace.yaml          workspace definitions
    ├── docker-compose.yml           Docker compose
    ├── Dockerfile                   parameterized
    └── tsconfig.base.json           shared TS config
```

---

## Серверы: статус качества

### Tier 1 — Production-ready
| Сервер | Tools | Lines | npm | Примечание |
|--------|-------|-------|-----|-----------|
| dadata-mcp | 31 | 2603 | @metarebalance | Лучший. На neuraldeep.ru + mcp.so |

### Tier 2 — Decent (нужен апгрейд до production)
| Сервер | Tools | Lines | npm |
|--------|-------|-------|-----|
| yookassa-mcp | 10 | 490 | @theyahia |
| cdek-mcp | 16 | ~900 | @theyahia | v2.1.0 — intake, print, webhooks |
| cbr-mcp | 5 | 360 | @theyahia |
| tkassa-mcp | 16 | ~950 | @theyahia | v2.1.0 — customers, SBP, T-Invest |
| cloudpayments-mcp | 6 | 305 | @theyahia |
| pochta-russia-mcp | 3 | 386 | @theyahia |

| travelpayouts-mcp | 13 | ~600 | @theyahia | v2.1.0 — hotels, lookup, direct routes |

### Tier 3 — Заготовки (40 серверов, 2-5 tools, 100-300 строк)
Все остальные. Работают, но минимальное покрытие API.

**Общее для ВСЕХ:** 0 тестов, README есть, исходники на GitHub открыты.

---

## Площадки

| Площадка | Статус | Охват |
|----------|--------|-------|
| npm (@theyahia) | ✅ | 47/47 |
| GitHub (theYahia/*-mcp) | ✅ исходники открыты | 47/47 |
| Official MCP Registry | ✅ | 47/47 |
| PulseMCP | ✅ (авто из Registry) | 47/47 |
| Glama.ai | ✅ (авто из npm) | 47/47 |
| LobeHub | ⏳ PR ждёт мерж | 47/47 |
| Cline marketplace | ⏳ Issues открыты | 47/47 |
| neuraldeep.ru | ✅ | 1/47 (dadata) |
| mcp.so | ✅ | 1/47 |
| cursor.directory | ✅ | 1/47 |
