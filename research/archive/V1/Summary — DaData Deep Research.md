---
title: "Сводка глубокого исследования DaData MCP"
date: 2026-03-29
tags: [neuraldeep, dadata, mcp, research, summary]
status: ready-to-implement
---

# Сводка глубокого исследования DaData MCP

Источник: `compass_artifact_wf-e5956d8a...` (полный ресёрч)

---

## Критические открытия

### 1. У DaData уже есть официальный MCP — но он слабый
- Remote сервер на `https://mcp.dadata.ru/mcp`
- Покрывает **только 4 tool'а**: find_party, clean_address, find_company_by_email, find_company_by_domain
- Требует `supergateway` как stdio-proxy для Claude Desktop
- Нет suggest, geolocate, clean phone/email/name, findById для банков, нет resources/prompts
- **Наш покрывает 12+ tools, resources, prompts, кеш, локальный npm — другой уровень**

### 2. API = 56 endpoint'ов, не 7
| Группа | Количество | Домен |
|--------|-----------|-------|
| Suggestions (suggest/) | 21 | suggestions.dadata.ru |
| Find By ID (findById/) | 19 | suggestions.dadata.ru |
| Cleaner (clean/) | 8 | cleaner.dadata.ru |
| Geolocate | 2 | suggestions.dadata.ru |
| IPLocate | 1 | suggestions.dadata.ru |
| Profile | 3 | dadata.ru |
| Специальные (affiliated, byEmail) | 2 | suggestions.dadata.ru |

### 3. Монетизация = реферальная программа DaData
- **30% revenue share** от привлечённых клиентов
- Подать заявку на dadata.ru/referral/
- Встроить реферальную ссылку в onboarding (когда юзер без ключа)
- Пассивный доход с каждого нового пользователя MCP

### 4. На npm нет TS-клиента DaData
- `@via-profit/dadata` — устарел
- `react-dadata` (109 stars) — только фронтенд
- Наш MCP попутно станет **лучшим серверным TypeScript клиентом DaData**

### 5. Composio — единственный конкурент
- ~40 tools, но требует аккаунт Composio + ключи хранятся у них
- Нет resources/prompts, нет batch, нет локального режима
- Проблема безопасности для enterprise

---

## Архитектура: 12 tools в v1

### Must-have (v1 launch — 8 tools)

| Tool | Endpoint | API | Бесплатный |
|------|----------|-----|-----------|
| `suggest_address` | suggest/address | Suggestions | Yes |
| `suggest_company` | suggest/party | Suggestions | Yes |
| `find_company_by_id` | findById/party | Suggestions | Yes |
| `find_bank` | suggest/bank | Suggestions | Yes |
| `clean_address` | clean/address | Cleaner | No (20 коп) |
| `clean_phone` | clean/phone | Cleaner | No (20 коп) |
| `geolocate_address` | geolocate/address | Suggestions | Yes |
| `ip_locate` | iplocate/address | Suggestions | Yes |

### Nice-to-have (v1.1 — 4 tools)

| Tool | Описание |
|------|----------|
| `suggest_fio` | Подсказки ФИО с определением пола |
| `clean_name` | Стандартизация ФИО |
| `find_affiliated_companies` | Аффилированные компании (тариф Максимальный) |
| `get_balance` | Баланс и статистика аккаунта |

### Композитные tools (v2)
- `validate_counterparty` — полная проверка контрагента по ИНН
- `enrich_lead` — обогащение лида из неполных данных
- `smart_address_resolve` — подсказка → стандартизация → геокодирование

---

## Resources и Prompts

### Resources (контекст для AI)
- `quality-codes` — справочник кодов качества (qc, qc_geo)
- `capabilities` — что DaData может и не может
- `company-statuses` — ACTIVE/LIQUIDATING/LIQUIDATED/BANKRUPT/REORGANIZING

### Prompts (шаблоны задач)
- `check_counterparty` — проверка контрагента по ИНН
- `clean_contact_database` — очистка базы контактов

---

## Технические решения

### Стек
- `@modelcontextprotocol/sdk` ^1.28.0
- `zod` ^3.24.0
- Native `fetch` (zero deps для HTTP)
- Vitest для тестов
- Node.js >=18

### Структура проекта
```
src/
├── index.ts            # Entry: server + stdio transport
├── config.ts           # Env validation
├── client.ts           # HTTP client (fetch + retry + timeout)
├── tools/
│   ├── suggest.ts      # suggest_address, suggest_company, suggest_fio
│   ├── clean.ts        # clean_address, clean_phone, clean_name
│   ├── find.ts         # find_company_by_id, find_bank, find_affiliated
│   └── geo.ts          # geolocate_address, ip_locate
├── resources/
│   └── reference.ts    # Quality codes, statuses, capabilities
├── prompts/
│   └── workflows.ts    # check_counterparty, clean_database
├── lib/
│   ├── formatters.ts   # Response formatting + QC labels
│   └── errors.ts       # Error helpers
└── types.ts            # API response types
```

### Ключевые принципы
- **isError: true, никогда throw** — LLM видит ошибки и может retry
- **console.error() only** — stdout = JSON-RPC, console.log ломает протокол
- **Lazy env validation** — без SECRET_KEY сервер работает (suggest tools), крашимся только без API_KEY
- **Hybrid ответы** — JSON + human-readable quality labels
- **Max 200 символов на description** — иначе LLM хуже выбирает tool

---

## Антипаттерны — чего НЕ делать

- НЕ оборачивать каждый endpoint в tool (56 tools сломают LLM) → 12 tools по intent
- НЕ возвращать raw response (80+ полей) → фильтровать + quality labels
- НЕ console.log() → только console.error()
- НЕ throw exceptions → { isError: true }
- НЕ валидировать SECRET_KEY при старте → lazy check при вызове clean tools
- НЕ называть `mcp-dadata-server` → `dadata-mcp` (конвенция экосистемы)
- НЕ делать descriptions длиннее 200 символов

---

## Rate limits

| Параметр | Значение |
|----------|---------|
| Req/s | 30 на IP |
| Connections/min | 60 на IP |
| Query max length | 300 символов |
| Count max | 20 |
| Locations max | 10 фильтров |
| Free daily limit | 10 000 запросов |
| Расширенный | 100 000/день |
| Максимальный | 200K–3M/день |
| Сброс лимита | 00:00 МСК |
| 429 recovery | ~5 минут |

---

## Тарифы и данные

| Тариф | Цена | Что даёт сверх бесплатного |
|-------|------|---------------------------|
| Бесплатный | 0 | Базовые поля, основной ОКВЭД, ИНН/КПП/ОГРН, статус, адрес, руководитель |
| Расширенный | 14K руб/год | Расстояние до МКАД, все ОКВЭДы, сотрудники, система налогообложения |
| Максимальный | 56K руб/год | Учредители, финансы, лицензии, аффилированные, телефоны/email, реестр МСП |
| Cleaner | 20 коп/запись | Стандартизация (адрес, телефон, ФИО, email, паспорт, дата рождения, авто) |

---

## Go-to-Market

### Листинг (по приоритету)
1. **npm publish** — `@neuraldeep/dadata-mcp`
2. **Official MCP Registry** — `smithery mcp publish`
3. **PR в modelcontextprotocol/servers** — секция community
4. **glama.ai** — кнопка "Add Server"
5. **smithery.ai** — через CLI
6. **mcp.so** — issue в chatmcp/mcpso
7. PulseMCP, mcp.directory, mcpservers.org, LobeHub

### Habr
- Формат: туториал + кейс
- Заголовок: "Как я сделал MCP-сервер для DaData: подключаем Claude к российским API за 5 минут"
- Хабы: Программирование, API, Open Source, ИИ, Node.js
- Время: вт–чт, 13:00–15:00 МСК
- **Связаться с DaData до публикации** — они продвигают партнёрские решения

### Telegram
- LLM продакшн, AI Happens (@AIhappens), Tproger AI — приоритетные
- Создать @neuraldeep канал (changelog, 1 пост/неделю)

---

## Launch Week

| День | Действие |
|------|----------|
| 0 | README с GIF, badges, CONTRIBUTING.md. Заявка на рефералку DaData. Связаться с DaData |
| 1 | `npm publish --access public`. Submit в MCP Registry + PR в modelcontextprotocol/servers |
| 2-3 | Glama, Smithery, mcp.so, PulseMCP, mcp.directory. Telegram @neuraldeep |
| 4-7 | Habr статья (вт–чт 13:00). Посев в Telegram. GitHub issues (good first issue) |
| 8+ | Follow-up DaData. Мониторинг issues. Начало v1.1 |

---

## Roadmap

| Версия | Срок | Что |
|--------|------|-----|
| **v1.0** | Сейчас | 8 must-have tools + resources + prompts |
| **v1.1** | +2-4 нед | suggest_fio, clean_name, clean_email, get_balance + TTL-кеш + rate limiter + Docker |
| **v2.0** | +2-3 мес | Композитные tools (validate_counterparty, enrich_lead) + batch + Беларусь/Казахстан |
| **v3.0** | +6 мес | Интеграция с МойСклад/ЮKassa MCP + analytics dashboard + webhooks |

---

## Монетизация по фазам

| Фаза | Модель | Доход |
|------|--------|-------|
| 1 (Launch) | Open-source + рефералка DaData (30%) | Пассивный с каждого нового юзера |
| 2 (Traction) | Hosted MCP через MCPize (85/15) или Apify | Pay-per-event |
| 3 (Scale) | Premium: persistent кеш, batch, priority support | Подписка |
