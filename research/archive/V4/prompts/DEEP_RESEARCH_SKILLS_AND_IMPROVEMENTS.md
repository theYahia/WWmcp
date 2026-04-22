# Deep Research — Skills и улучшения для 47 MCP-серверов @theyahia

## Контекст

Я — @theyahia. У меня **47 MCP-серверов** для российских API + **2 новых** для CIS (НБК Казахстан, ЦБУ Узбекистан). Все на TypeScript, опубликованы на npm и GitHub.

**Production-grade серверы (с тестами, Streamable HTTP, CI):**
- `@metarebalance/dadata-mcp` — 31 tool, 99 тестов, v1.0.6, реферальная ссылка получена (30% пожизненно)
- `@theyahia/cdek-mcp` — 8 tools, 18 тестов, v1.1.0, OAuth 2.0, sandbox
- `@theyahia/moysklad-mcp` — 10 tools (в процессе upgrade)
- `@theyahia/yookassa-mcp` — 10 tools (в процессе upgrade)
- `@theyahia/hh-mcp` — 8 tools (в процессе upgrade)

**У некоторых серверов уже есть Claude Code skills (.claude/skills/):**
- DaData: `/check-counterparty`, `/validate-address`
- МойСклад: `/low-stock`, `/create-order`, `/daily-report`, `/find-product` (добавляются)
- СДЭК: `/calculate-delivery`, `/track-shipment`, `/find-pvz` (добавляются)
- WB: `/wb-orders`, `/wb-low-stock`, `/wb-analytics` (добавляются)
- Ozon: `/ozon-orders`, `/ozon-analytics`, `/ozon-update-prices` (добавляются)
- ЦБ РФ: `/exchange-rate`, `/convert` (добавляются)

**Остальные ~35 серверов** имеют код но нет skills, нет тестов, README минимальный.

---

## Что мне нужно

### 1. Skills — какие сценарии РЕАЛЬНО нужны пользователям

Для каждого из 47 серверов определи:
- **Какие 2-3 skill'а** дадут максимальную ценность пользователю?
- **Какой формат SKILL.md** работает лучше всего? (пошаговый алгоритм vs короткое описание)
- **Какие cross-server skills** (связки между серверами) наиболее ценны?

Примеры cross-server skills:
- `/check-and-pay` — DaData (проверить контрагента по ИНН) → YooKassa (создать платёж)
- `/ship-order` — МойСклад (получить заказ) → DaData (валидировать адрес) → СДЭК (создать доставку)
- `/enrich-lead` — DaData (данные по ИНН) → amoCRM (создать контакт + сделку)
- `/market-report` — Ozon (аналитика) + WB (аналитика) + YM (аналитика) → сводный отчёт

**Критерий:** skill должен решать **реальную боль** пользователя, а не быть обёрткой над одним tool.

### 2. Улучшения существующих серверов — что даст наибольший эффект

Для каждого из 47 серверов:

**a) Tool quality:**
- Описания tools достаточно подробные для AI-агента?
- Zod-схемы покрывают все параметры?
- Error messages помогают AI понять что делать дальше?
- Примеры в описании каждого tool?

**b) API coverage:**
- Какие endpoints API НЕ покрыты нашим MCP?
- Какие endpoints наиболее востребованы?
- Стоит ли добавлять (ROI: effort vs value)?

**c) DX (Developer Experience):**
- README: достаточно ли информации для быстрого старта?
- Примеры запросов: какие 3-5 запросов должны быть в каждом README?
- .mcp.json: корректен ли формат для cursor.directory?

### 3. Конкретные улучшения для топ-10 серверов

Для каждого из 10 самых ценных серверов дай конкретный список:

**DaData MCP (31 tool):**
- Какие tools можно улучшить? (более подробные описания, лучшие default-ы)
- Стоит ли добавлять новые tools? Какие endpoints DaData ещё не покрыты?
- find_affiliated требует тариф "Максимальный" — как gracefully handle это?

**МойСклад MCP (10 tools):**
- Какие ещё endpoints МойСклад JSON API 1.2 стоит покрыть?
- Webhooks — можно ли использовать в MCP? (push-уведомления о новых заказах)
- Фильтры и сортировка — достаточно ли параметров?

**СДЭК MCP (8 tools):**
- Какие ещё endpoints СДЭК API v2 полезны? (print_order? get_regions?)
- Webhook'и СДЭК — можно ли интегрировать?

**YooKassa MCP (10 tools):**
- Какие ещё endpoints полезны? (payouts? deals? self_employed?)
- Webhook'и для статусов платежей?
- 54-ФЗ чеки — все ли параметры покрыты?

**hh.ru MCP (8 tools):**
- Какие endpoints hh.ru API полезны но не покрыты?
- Negotiation/response API — стоит ли добавлять?

**Wildberries MCP (12 tools):**
- Rate limiter с учётом штрафа 409 — реализован ли?
- Какие из 13 категорий токенов WB покрыты?

**Ozon MCP (12 tools):**
- v3 endpoints (v2 deprecated) — все ли обновлены?
- Performance API — стоит ли добавлять?

**amoCRM MCP (10 tools):**
- Конкурент caiborg-ai имеет 36 tools — какие tools у них есть, а у нас нет?
- Стоит ли догонять или фокусироваться на нишевых features?

**Яндекс.Метрика MCP (6 tools):**
- Какие отчёты Метрики наиболее востребованы?
- Logs API — полезен ли для MCP?

**Unisender MCP:**
- Какие endpoints покрыть: списки, шаблоны, рассылки, статистика?

### 4. Паттерны quality для всех серверов

Определи best practices которые нужно применить ко ВСЕМ 47 серверам:

**Error handling:**
- Формат error message для AI-агента (что включать, что нет)
- Как отличить "user error" от "API error" от "network error"
- Retry логика: на какие ошибки повторять, на какие нет

**Tool descriptions:**
- Оптимальная длина описания tool для AI-агента
- Нужны ли примеры в описании?
- Как писать inputSchema descriptions для лучшего AI-понимания

**README шаблон:**
- Какой формат README лучше конвертирует посетителей в пользователей?
- Исследования: что работает для open-source MCP проектов

**Тестирование:**
- Минимальный набор тестов для MCP-сервера
- Нужны ли integration тесты с реальным API?
- Как тестировать OAuth-серверы без credentials?

### 5. Промпты для Claude Code

Для каждого улучшения — готовый промпт для Claude Code CLI.

Формат:
```
Сервер: @theyahia/SERVICE-mcp
Задача: [что сделать]
Промпт:
[copy-paste ready prompt]
```

---

## Формат ответа

### Таблица skills для всех 47 серверов

| Сервер | Skill 1 | Skill 2 | Skill 3 | Cross-server |
|--------|---------|---------|---------|-------------|
| dadata-mcp | ... | ... | ... | ... |
| moysklad-mcp | ... | ... | ... | ... |
| ... | ... | ... | ... | ... |

### Таблица улучшений

| Сервер | Tools добавить | Tools улучшить | Приоритет | Effort |
|--------|---------------|---------------|-----------|--------|
| ... | ... | ... | ... | ... |

### Топ-20 конкретных улучшений (по ROI)

Отсортированные по impact/effort:
1. [Сервер] — [что сделать] — [effort часы] — [почему важно]
2. ...

### Cross-server skills (5-10 лучших)

Сценарии которые используют 2-3 MCP сервера вместе — это наша уникальная ценность.

Не давай абстрактных советов. Конкретные skills, конкретные tools, конкретные промпты.
