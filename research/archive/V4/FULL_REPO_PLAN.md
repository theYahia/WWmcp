# FULL REPO PLAN — Детальный план для всех 56 MCP-репозиториев

**Дата:** 2026-03-31
**Автор:** theYahia
**GitHub:** github.com/theYahia
**npm:** @theyahia/* + @metarebalance/dadata-mcp
**Цель:** Каждый репозиторий — с чётким TODO, промптом для Claude Code, оценкой времени

---

## УСЛОВНЫЕ ОБОЗНАЧЕНИЯ

| Статус | Значение |
|--------|----------|
| **Production** | Тесты, Streamable HTTP, CI, smithery.yaml, skills — всё есть |
| **In Progress** | Агент работает прямо сейчас |
| **Needs Upgrade** | Код есть (tools, client.ts), нужны тесты + HTTP + CI |
| **Placeholder** | Минимальный код или только npm-имя |

### Стандартный upgrade-чеклист (для всех Needs Upgrade):
1. Vitest тесты (unit + smoke)
2. Streamable HTTP транспорт (--http / HTTP_PORT)
3. smithery.yaml
4. CI (.github/workflows/ci.yml)
5. Skills (.claude/skills/)
6. README (единый формат: бейджи, Quick Start, таблица tools, примеры)
7. .mcp.json (для cursor.directory)
8. npm publish обновлённой версии

---

## ГРУППА A: PRODUCTION-GRADE (8 серверов)

Уже прошли основной цикл — тесты, HTTP, CI. Остались мелкие TODO.

---

### 1. dadata-mcp — DaData API
**Status:** Production
**Current:** 31 tools, 99 tests, Streamable HTTP, CI, skills (2), smithery.yaml, ref=255717
**Priority:** HIGH — флагманский продукт, 31 tool vs 4 у конкурента (dadata.ru/mcp)
**API:** POST https://suggestions.dadata.ru/suggestions/api/4_1/rs/, https://cleaner.dadata.ru/api/v1/, Token auth
**npm:** `@metarebalance/dadata-mcp` v1.0.6

**TODO:**
- [ ] README: добавить секцию Streamable HTTP docs (примеры curl, конфиг для remote) — 1ч
- [ ] Добавить ещё 2-3 skills (например: skill-enrich-lead, skill-validate-address-batch) — 2ч
- [ ] Записать GIF-демо для README — 1ч
- [ ] Подать на Smithery (нужен Streamable HTTP — уже есть) — 0.5ч
- [ ] Реферальная ссылка: ref=255717 уже есть, проверить что в README — 0.5ч

**Claude Code prompt для доработки:**
```
В dadata-mcp:

1. Обнови README.md — добавь секцию "Streamable HTTP (remote)":
   - Запуск: npx @metarebalance/dadata-mcp --http
   - curl пример: curl -X POST http://localhost:3000/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
   - Конфиг для remote Claude Desktop (mcp_servers с URL)
   - Docker (заготовка)

2. Создай 2 новых skills в .claude/skills/:
   - skill-enrich-lead.md — "Обогати лид: по ИНН найди компанию через dadata, верни название, адрес, ОКВЭД, руководителя"
   - skill-validate-batch.md — "Валидируй список адресов: прими массив строк, стандартизируй каждый через dadata, верни таблицу"

3. Проверь что реферальная ссылка https://dadata.ru/?ref=255717 есть в README.
```

**Estimated total:** 5ч

---

### 2. moysklad-mcp — МойСклад API
**Status:** Production
**Current:** 10 tools, 15 tests, Streamable HTTP, CI, skills (4), smithery.yaml
**Priority:** HIGH — нет конкурентов, 200K+ пользователей МойСклад
**API:** https://api.moysklad.ru/api/remap/1.2/, Basic Auth (login+password) или Bearer token
**npm:** `@theyahia/moysklad-mcp` v2.0.0

**TODO:**
- [ ] Верифицировать все 10 tools с реальным API (нужен тестовый аккаунт МойСклад) — 3ч
- [ ] Добавить примеры integration-тестов в docs/ — 1ч
- [ ] Проверить конвертацию копейки↔рубли во всех tools — 1ч
- [ ] Подать на Smithery — 0.5ч
- [ ] Зарегистрировать реферальную ссылку partners.moysklad.ru — 0.5ч

**Claude Code prompt для доработки:**
```
В moysklad-mcp:

1. Проверь ВСЕ 10 tools — убедись что:
   - Правильные endpoints (https://api.moysklad.ru/api/remap/1.2/)
   - Цены конвертируются из копеек в рубли в ответах
   - Rate limit 45 req/3сек реализован
   - Error handling парсит ошибки МойСклад

2. Создай docs/integration-test-examples.md с примерами:
   - Как создать тестовый аккаунт МойСклад (бесплатный план)
   - curl-команды для каждого tool
   - Ожидаемые ответы

3. Проверь smithery.yaml — env vars: MOYSKLAD_LOGIN, MOYSKLAD_PASSWORD или MOYSKLAD_TOKEN
```

**Estimated total:** 6ч

---

### 3. cdek-mcp — СДЭК API v2
**Status:** Production
**Current:** 8 tools, 18 tests, Streamable HTTP, CI, skills (3), smithery.yaml
**Priority:** HIGH — уникальная ниша доставки, sandbox для тестов
**API:** https://api.cdek.ru/v2/, OAuth 2.0 Client Credentials
**npm:** `@theyahia/cdek-mcp` v1.1.0

**TODO:**
- [ ] Добавить документацию по webhook support — 1.5ч
- [ ] Подать на Smithery — 0.5ч
- [ ] Добавить примеры сценариев в README (рассчитать доставку + создать заказ + трекинг) — 1ч

**Claude Code prompt для доработки:**
```
В cdek-mcp:

1. Добавь в README секцию "Webhooks":
   - СДЭК поддерживает webhooks для статусов заказа
   - Как настроить: POST /webhooks с url и type
   - Типы событий: ORDER_STATUS, PRINT_FORM, DOWNLOAD_PHOTO
   - Пример payload

2. Добавь в README секцию "Сценарии использования":
   - "Рассчитай доставку из Москвы в Казань, 2 кг, 30x20x10 см"
   - "Создай заказ на доставку до двери"
   - "Отследи посылку CDEK-123456"

3. Проверь smithery.yaml — env vars: CDEK_CLIENT_ID, CDEK_CLIENT_SECRET, CDEK_SANDBOX
```

**Estimated total:** 3ч

---

### 4. yookassa-mcp — ЮKassa Payments API
**Status:** Production
**Current:** 10 tools, 36 tests, Streamable HTTP, CI, smithery.yaml
**Priority:** HIGH — платежи = критический сервис, score 64 (top-1 в скоринге)
**API:** https://api.yookassa.ru/v3/, Basic Auth (shopId + secretKey)
**npm:** `@theyahia/yookassa-mcp` v1.0.2

**TODO:**
- [ ] Добавить skills (2-3) — 2ч
- [ ] Добавить реферальную ссылку когда доступна (promo.yookassa.ru/agents) — 0.5ч
- [ ] Подать на Smithery — 0.5ч

**Claude Code prompt для доработки:**
```
В yookassa-mcp:

1. Создай skills в .claude/skills/:
   - skill-create-payment-link.md — "Создай ссылку на оплату: сумма, описание, email покупателя → payment URL"
   - skill-check-payment-status.md — "Проверь статус платежа по ID → pending/waiting_for_capture/succeeded/canceled"
   - skill-daily-report.md — "Покажи платежи за сегодня: сумма, количество, успешные/отменённые"

2. В README добавь ссылку на партнёрскую программу: https://promo.yookassa.ru/agents
```

**Estimated total:** 3ч

---

### 5. hh-mcp — hh.ru API
**Status:** Production
**Current:** 8 tools, 14 tests, Streamable HTTP, CI, smithery.yaml
**Priority:** MEDIUM — hh.ru = #1 HR-площадка в РФ
**API:** https://api.hh.ru/, Bearer token (OAuth 2.0)
**npm:** `@theyahia/hh-mcp` v1.1.0

**TODO:**
- [ ] Добавить skills (2) — 1.5ч
- [ ] Подать на Smithery — 0.5ч

**Claude Code prompt для доработки:**
```
В hh-mcp:

1. Создай skills в .claude/skills/:
   - skill-find-candidates.md — "Найди кандидатов: должность, город, зарплата → топ-10 резюме с контактами"
   - skill-salary-research.md — "Исследуй зарплаты: должность, регион → медиана, 25/75 перцентили, тренд"

2. Подать на Smithery — убедись что smithery.yaml корректен (env: HH_ACCESS_TOKEN)
```

**Estimated total:** 2ч

---

### 6. nbk-mcp — Национальный Банк Казахстана
**Status:** Production
**Current:** 5 tools, 8 tests, Streamable HTTP, CI, smithery.yaml
**Priority:** MEDIUM — first-mover в Казахстане, 0 конкурентов
**API:** https://nationalbank.kz/rss/, XML (RSS)
**npm:** `@theyahia/nbk-mcp` v1.0.0

**TODO:**
- [ ] Верифицировать XML-парсинг с реальным API — 1ч
- [ ] Добавить .mcp.json — 0.5ч
- [ ] Подать на Smithery — 0.5ч

**Claude Code prompt для доработки:**
```
В nbk-mcp:

1. Проверь работу с реальным API:
   - curl https://nationalbank.kz/rss/get_rates.cfm?fdate=31.03.2026
   - Убедись что XML парсится корректно
   - Проверь все 5 tools

2. Создай .mcp.json в корне:
   {
     "mcpServers": {
       "nbk": {
         "command": "npx",
         "args": ["-y", "@theyahia/nbk-mcp"]
       }
     }
   }
```

**Estimated total:** 2ч

---

### 7. cbu-mcp — Центральный Банк Узбекистана
**Status:** Production (partial)
**Current:** 5 tools, 13 tests, Streamable HTTP, CI
**Priority:** MEDIUM — first-mover в Узбекистане
**API:** https://cbu.uz/ru/arkhiv-kursov-valyut/json/, JSON
**npm:** `@theyahia/cbu-mcp` v1.0.0

**TODO:**
- [ ] Добавить .mcp.json — 0.5ч
- [ ] Добавить smithery.yaml — 0.5ч
- [ ] Подать на Smithery — 0.5ч

**Claude Code prompt для доработки:**
```
В cbu-mcp:

1. Создай smithery.yaml:
   startCommand:
     type: stdio
     configSchema:
       type: object
       properties: {}
     commandFunction: |-
       (config) => ({
         command: 'npx',
         args: ['-y', '@theyahia/cbu-mcp']
       })

2. Создай .mcp.json:
   {
     "mcpServers": {
       "cbu": {
         "command": "npx",
         "args": ["-y", "@theyahia/cbu-mcp"]
       }
     }
   }

3. npm version patch && npm publish --access public
```

**Estimated total:** 1.5ч

---

### 8. cbr-mcp — Центральный Банк России
**Status:** Production (partial)
**Current:** 5 tools, skills (2), есть код
**Priority:** LOW — quick win уже сделан, но нет тестов и HTTP
**API:** https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx, SOAP/XML
**npm:** `@theyahia/cbr-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI (.github/workflows/ci.yml) — 0.5ч
- [ ] README update (единый формат) — 1ч
- [ ] npm publish обновлённой версии — 0.5ч

**Claude Code prompt для доработки:**
```
В cbr-mcp:

1. Установи vitest. Создай tests/:
   - unit тесты для каждого из 5 tools (mock HTTP)
   - smoke тест: сервер запускается
   - Проверь Zod-схемы параметров

2. Добавь Streamable HTTP транспорт:
   - Аргумент --http или env HTTP_PORT
   - StreamableHTTPServerTransport на /mcp
   - CORS headers

3. Создай smithery.yaml (без env vars — API публичный)

4. Создай .github/workflows/ci.yml:
   - trigger: push, pull_request
   - node 20
   - npm ci && npm run build && npm test

5. Обнови README по единому шаблону.

6. npm version minor && npm publish --access public
```

**Estimated total:** 6ч

---

## ГРУППА B: IN PROGRESS (4 сервера)

Агенты работают прямо сейчас. Ожидаемый результат: production-ready.

---

### 9. payme-mcp — Payme (Узбекистан)
**Status:** In Progress
**Current:** Создаётся: 10 tools, JSON-RPC 2.0, Payme Subscribe API
**Priority:** HIGH — first-mover Узбекистан, 0 конкурентов
**API:** https://checkout.paycom.uz/api, JSON-RPC 2.0, Basic Auth (merchant key)

**TODO (после завершения создания):**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2: skill-create-invoice, skill-check-payment) — 1.5ч
- [ ] README — 1ч
- [ ] .mcp.json — 0.5ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для доработки (после создания):**
```
В payme-mcp:

1. Добавь Vitest тесты:
   - Mock JSON-RPC 2.0 запросы
   - Проверь все 10 tools: cards.create, cards.verify, cards.check, cards.remove,
     receipts.create, receipts.pay, receipts.send, receipts.cancel, receipts.check, receipts.get
   - Проверь Basic Auth header (Base64 encode merchant key)
   - Smoke тест: сервер запускается

2. Streamable HTTP транспорт (--http)
3. smithery.yaml (env: PAYME_MERCHANT_KEY, PAYME_SANDBOX)
4. CI workflow
5. Skills: skill-create-invoice.md, skill-check-payment.md
6. README по шаблону серии
```

**Estimated total:** 8ч (без учёта создания)

---

### 10. click-mcp — Click (Узбекистан)
**Status:** In Progress
**Current:** Создаётся: 8 tools, REST, SHA1 auth
**Priority:** HIGH — first-mover Узбекистан
**API:** https://api.click.uz/v2/, SHA1 signature auth

**TODO (после завершения создания):**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2) — 1ч
- [ ] README — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для доработки (после создания):**
```
В click-mcp:

1. Vitest тесты:
   - Mock REST API
   - Проверь SHA1 auth: sha1(timestamp + service_id + secret_key)
   - Проверь все 8 tools
   - Smoke тест

2. Streamable HTTP, smithery.yaml (env: CLICK_SERVICE_ID, CLICK_SECRET_KEY), CI
3. Skills: skill-create-payment.md, skill-check-status.md
4. README по шаблону серии
```

**Estimated total:** 7ч

---

### 11. eskiz-mcp — Eskiz SMS (Узбекистан)
**Status:** In Progress
**Current:** Создаётся: 6 tools, JWT auth
**Priority:** MEDIUM — SMS gateway для UZ рынка
**API:** https://notify.eskiz.uz/api/, JWT Bearer token

**TODO (после завершения создания):**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (1) — 0.5ч
- [ ] README — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для доработки (после создания):**
```
В eskiz-mcp:

1. Vitest тесты:
   - Mock JWT auth flow (POST /auth/login → token)
   - Проверь все 6 tools: send_sms, send_batch, get_status, get_balance, get_templates, get_reports
   - Smoke тест

2. Streamable HTTP, smithery.yaml (env: ESKIZ_EMAIL, ESKIZ_PASSWORD), CI
3. Skill: skill-send-sms.md — "Отправь SMS: номер, текст → статус"
4. README по шаблону серии
```

**Estimated total:** 6ч

---

### 12. kaspi-merchant-mcp — Kaspi Marketplace (Казахстан)
**Status:** In Progress
**Current:** Создаётся: 8 tools, JSON:API, X-Auth-Token
**Priority:** HIGH — first-mover Казахстан, 721K продавцов, 0 конкурентов
**API:** https://kaspi.kz/shop/api/v2/, JSON:API (application/vnd.api+json), X-Auth-Token

**TODO (после завершения создания):**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2: skill-orders-today, skill-update-status) — 1.5ч
- [ ] README — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для доработки (после создания):**
```
В kaspi-merchant-mcp:

1. Vitest тесты:
   - Mock JSON:API ответы (data, included, relationships)
   - Проверь X-Auth-Token header
   - Проверь все 8 tools: get_orders, get_order, get_order_items, update_order_status,
     get_cities, get_return_points, get_delivery_points, get_order_waybill
   - Smoke тест

2. Streamable HTTP, smithery.yaml (env: KASPI_AUTH_TOKEN), CI
3. Skills: skill-orders-today.md, skill-update-status.md
4. README: "Первый MCP-сервер для Kaspi Marketplace. 721K продавцов."
```

**Estimated total:** 8ч

---

## ГРУППА C: NEEDS UPGRADE — HIGH PRIORITY (5 серверов)

Код есть, tools реализованы, но нет тестов, Streamable HTTP, CI. Высокий приоритет — большая аудитория или отсутствие конкурентов.

---

### 13. ozon-mcp — Ozon Seller API
**Status:** Needs Upgrade
**Current:** 12 tools, skills (3). Код есть.
**Priority:** HIGH — 500K продавцов, первый MCP для Ozon в мире, score 61
**API:** https://api-seller.ozon.ru/, POST-only, Client-Id + Api-Key headers
**npm:** `@theyahia/ozon-mcp`

**КРИТИЧНО:**
- ВСЕ запросы POST с JSON body
- v2 endpoints депрекированы — использовать v3!
- Rate limit: 100 req/min на метод
- Нет sandbox — тестировать только с моками

**TODO:**
- [ ] Тесты (Vitest) — mock POST-запросы, проверить v3 endpoints — 3ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI (.github/workflows/ci.yml) — 0.5ч
- [ ] README update — добавить таблицу 12 tools, примеры, v3 disclaimer — 1.5ч
- [ ] Проверить что ВСЕ endpoints используют v3 (не v2) — 1ч
- [ ] npm publish обновлённой версии — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови ozon-mcp до production-grade.

КРИТИЧНО: Ozon API v2 выключен, все endpoints должны быть v3!
Проверь каждый tool — если используется /v2/, замени на /v3/.

1. Аудит endpoints:
   - list_products → POST /v3/product/list (НЕ v2!)
   - get_product → POST /v3/product/info/list (НЕ v2!)
   - create_product → POST /v3/product/import
   - update_stocks → POST /v1/product/import/stocks
   - update_prices → POST /v1/product/import/prices
   - get_categories → POST /v2/category/tree (v2 тут ок, не депрекирован)
   - get_orders → POST /v3/posting/fbs/list
   - get_order → POST /v3/posting/fbs/get
   - get_analytics → POST /v1/analytics/data
   - get_finance_report → POST /v3/finance/transaction/list
   - list_returns → POST /v3/returns/company/fbs
   - get_fbo_shipments → POST /v2/posting/fbo/list

2. Все запросы POST с headers:
   - Client-Id: env OZON_CLIENT_ID
   - Api-Key: env OZON_API_KEY
   - Content-Type: application/json

3. Rate limit: 100 req/min per method — добавь throttling

4. Vitest тесты:
   - Mock POST-запросы для каждого tool
   - Проверь что v3 endpoints используются
   - Проверь headers Client-Id, Api-Key
   - Smoke тест

5. Streamable HTTP транспорт (--http)
6. smithery.yaml (env: OZON_CLIENT_ID, OZON_API_KEY)
7. CI workflow
8. README: "500 000 продавцов. Первый MCP-сервер для Ozon Seller API."
   Таблица 12 tools, примеры запросов, ВАЖНО: v3 endpoints

9. npm version minor && npm publish --access public
```

**Estimated total:** 8.5ч

---

### 14. wildberries-mcp — Wildberries Seller API
**Status:** Needs Upgrade
**Current:** 12 tools, skills (3). Код есть.
**Priority:** HIGH — крупнейший маркетплейс РФ, 500K+ продавцов, score 54
**API:** https://suppliers-api.wildberries.ru/, JWT token (180 дней), 300 req/min
**npm:** `@theyahia/wildberries-mcp`

**КРИТИЧНО:**
- JWT-токен 180 дней, нужно напоминать о ротации
- Rate limit: 300 req/min (token bucket), интервал 200мс
- Ошибка 409 = штраф 5-10 запросов! Парсить X-Ratelimit-Remaining, X-Ratelimit-Retry
- OpenAPI спеки доступны: openapi.wildberries.ru

**TODO:**
- [ ] Тесты (Vitest) — mock с проверкой rate limit логики — 3ч
- [ ] Rate limiter с учётом штрафа 409 (bottleneck или custom) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — rate limits, 409 штрафы, ротация токена — 1.5ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови wildberries-mcp до production-grade.

КРИТИЧНО: Rate limit Wildberries со штрафами!
- 300 req/min (token bucket)
- Интервал между запросами: 200мс
- Ошибка 409 = штраф 5-10 запросов. Парсить заголовки:
  X-Ratelimit-Remaining, X-Ratelimit-Retry-After

1. Реализуй RateLimiter class:
   - Token bucket: 300 tokens/min
   - Минимальный интервал: 200мс
   - При 409: прочитать X-Ratelimit-Retry-After, подождать
   - Логировать в stderr когда throttling активен

2. Проверь все 12 tools:
   - list_products → GET /content/v2/get/cards/list
   - get_product → POST /content/v2/get/cards/detail
   - update_prices → POST /api/v2/upload/task
   - update_stocks → PUT /api/v3/stocks/{warehouseId}
   - get_orders → GET /api/v3/orders
   - get_new_orders → GET /api/v3/orders/new
   - get_sales → GET /api/v1/supplier/sales
   - get_warehouses → GET /api/v3/offices
   - get_supply → GET /api/v3/supplies
   - create_supply → POST /api/v3/supplies
   - get_statistics → GET /api/v1/supplier/reportDetailByPeriod
   - get_feedbacks → GET /api/v1/feedbacks

3. Auth header: Authorization: Bearer {WB_API_TOKEN}

4. Vitest тесты:
   - Mock каждого tool
   - Тест rate limiter: 409 → retry after delay
   - Тест headers
   - Smoke тест

5. Streamable HTTP, smithery.yaml (env: WB_API_TOKEN), CI
6. README: "Wildberries Seller API. 12 tools. Production-grade rate limiting с защитой от штрафов 409."

7. npm version minor && npm publish --access public
```

**Estimated total:** 10ч

---

### 15. amocrm-mcp — amoCRM v4
**Status:** Needs Upgrade
**Current:** 10 tools. Код есть.
**Priority:** MEDIUM — конкурент существует (caiborg-ai, 36 tools), но amoCRM = #1 CRM в РФ
**API:** https://{domain}/api/v4/, OAuth 2.0 with token refresh
**npm:** `@theyahia/amocrm-mcp`

**Конкуренция:** caiborg-ai/amocrm-mcp — 36 tools. Наш — 10. Нужно или догнать, или позиционировать иначе (легковесный, быстрый старт).

**TODO:**
- [ ] Тесты (Vitest) — 2.5ч
- [ ] OAuth 2.0 TokenManager с auto-refresh — проверить/доработать — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2: skill-enrich-lead, skill-pipeline-report) — 1.5ч
- [ ] README — позиционирование vs caiborg-ai — 1.5ч
- [ ] npm publish — 0.5ч
- [ ] Реферальная ссылка: amostart.ru (до 50%) — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови amocrm-mcp до production-grade.

ВАЖНО: Конкурент caiborg-ai/amocrm-mcp имеет 36 tools. Наш — 10.
Позиционирование: "Лёгкий старт — 10 ключевых tools для amoCRM. Plug & play."

1. Проверь/доработай OAuth 2.0 TokenManager:
   - Env vars: AMOCRM_DOMAIN, AMOCRM_ACCESS_TOKEN, AMOCRM_REFRESH_TOKEN,
     AMOCRM_CLIENT_ID, AMOCRM_CLIENT_SECRET
   - Base URL: https://{AMOCRM_DOMAIN}/api/v4/
   - Авто-обновление: при 401 → POST /oauth2/access_token с refresh_token
   - Сохранять новый access_token и refresh_token

2. Проверь все 10 tools:
   - get_leads, create_lead, update_lead, get_contacts, create_contact,
     get_companies, get_pipelines, create_task, add_note, search

3. Vitest тесты:
   - Mock OAuth flow (token, refresh)
   - Mock каждого tool
   - Тест auto-refresh при 401
   - Smoke тест

4. Streamable HTTP, smithery.yaml, CI
5. Skills:
   - skill-enrich-lead.md — "Используй dadata-mcp чтобы обогатить лид по ИНН, добавь данные в amoCRM"
   - skill-pipeline-report.md — "Покажи воронку: сколько лидов на каждом этапе pipeline"

6. README: Quick Start, 10 tools, сравнение с caiborg-ai (наш: лёгкий, их: полный)
   Реферальная ссылка: https://www.amostart.ru

7. npm version minor && npm publish --access public
```

**Estimated total:** 10.5ч

---

### 16. yandex-metrika-mcp — Яндекс.Метрика
**Status:** Needs Upgrade
**Current:** 6 tools. Код есть.
**Priority:** MEDIUM — 10M+ сайтов используют Метрику, score 53
**API:** https://api-metrika.yandex.net/, Bearer token (OAuth)
**npm:** `@theyahia/yandex-metrika-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2: skill-traffic-report, skill-goals-analysis) — 1.5ч
- [ ] README update — инструкция получения токена через oauth.yandex.ru — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови yandex-metrika-mcp до production-grade.

1. Проверь все 6 tools:
   - get_counters → GET /management/v1/counters
   - get_report → GET /stat/v1/data (dimensions, metrics, date1, date2)
   - get_goals → GET /management/v1/counter/{id}/goals
   - export_logs → Logs API (POST request + GET status + GET download)
   - get_visitors_overview → сводка ключевых метрик
   - get_sources → отчёт по источникам трафика

2. Auth: Authorization: Bearer {YANDEX_METRIKA_TOKEN}

3. Vitest тесты — mock каждого tool, smoke тест

4. Streamable HTTP, smithery.yaml (env: YANDEX_METRIKA_TOKEN), CI

5. Skills:
   - skill-traffic-report.md — "Покажи трафик за последний месяц: визиты, уникальные, отказы, глубина"
   - skill-goals-analysis.md — "Анализ целей: какие цели достигаются, конверсия по каждой"

6. README: инструкция получения токена через oauth.yandex.ru/authorize?response_type=token&client_id=...
   Примеры: "Покажи трафик за март", "Какие источники трафика самые эффективные?"

7. npm version minor && npm publish --access public
```

**Estimated total:** 7.5ч

---

### 17. yandex-direct-mcp — Яндекс.Директ
**Status:** Needs Upgrade
**Current:** ~8 tools. Код есть.
**Priority:** MEDIUM — крупнейшая рекламная платформа РФ, score 53
**API:** https://api.direct.yandex.com/json/v5/, Bearer token, JSON-RPC-like
**npm:** `@theyahia/yandex-direct-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2: skill-campaign-stats, skill-keyword-analysis) — 1.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови yandex-direct-mcp до production-grade.

API Яндекс.Директ — JSON-RPC-подобный:
- POST https://api.direct.yandex.com/json/v5/{service}
- Authorization: Bearer {YANDEX_DIRECT_TOKEN}
- Content-Type: application/json; charset=utf-8
- Accept-Language: ru

1. Проверь все tools (~8):
   - get_campaigns → POST /json/v5/campaigns (method: get)
   - get_ads → POST /json/v5/ads
   - get_keywords → POST /json/v5/keywords
   - get_adgroups → POST /json/v5/adgroups
   - get_statistics → POST /json/v5/reports (TSV/CSV)
   - update_bids → POST /json/v5/bids
   - get_balance → POST /json/v5/accountmanagement (SharedAccountInfo)
   - get_changes → POST /json/v5/changes

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: YANDEX_DIRECT_TOKEN), CI

3. Skills:
   - skill-campaign-stats.md — "Статистика кампании: клики, показы, CTR, расход за период"
   - skill-keyword-analysis.md — "Анализ ключевых слов: какие приносят клики, какие сжигают бюджет"

4. README: примеры, инструкция получения токена
5. npm version minor && npm publish --access public
```

**Estimated total:** 8ч

---

## ГРУППА D: NEEDS UPGRADE — MEDIUM PRIORITY (12 серверов)

Код есть, но приоритет средний — либо конкуренты, либо меньшая аудитория.

---

### 18. bitrix24-mcp — Bitrix24 CRM
**Status:** Needs Upgrade
**Current:** ~8 tools. Код есть.
**Priority:** LOW — у Bitrix24 есть ОФИЦИАЛЬНЫЙ MCP (другая лига)
**API:** https://{domain}/rest/{user_id}/{webhook_code}/, REST + Webhooks
**npm:** `@theyahia/bitrix24-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README — disclaimer: "Есть официальный Bitrix24 MCP. Этот — community альтернатива." — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови bitrix24-mcp до production-grade.

ВАЖНО: У Bitrix24 есть официальный MCP. Добавь disclaimer в README.
Позиционирование: community-альтернатива, lightweight, webhook-based.

1. Проверь tools (~8):
   - get_deals, create_deal, update_deal, get_contacts, create_contact,
     get_companies, get_tasks, create_task
   - API через webhooks: POST https://{BITRIX24_DOMAIN}/rest/{BITRIX24_USER_ID}/{BITRIX24_WEBHOOK_CODE}/crm.deal.list

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: BITRIX24_DOMAIN, BITRIX24_USER_ID, BITRIX24_WEBHOOK_CODE), CI
3. README с disclaimer
4. npm version minor && npm publish --access public
```

**Estimated total:** 6ч

---

### 19. unisender-mcp — Unisender Email/SMS
**Status:** Needs Upgrade
**Current:** ~8 tools. Код есть.
**Priority:** MEDIUM — хорошая реферальная программа (50% первый / 25% повторные)
**API:** https://api.unisender.com/ru/api/, API key parameter
**npm:** `@theyahia/unisender-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2: skill-send-campaign, skill-list-stats) — 1.5ч
- [ ] README update — 1ч
- [ ] Реферальная ссылка: affiliate.unisender.com — 0.5ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови unisender-mcp до production-grade.

API: GET/POST https://api.unisender.com/ru/api/{method}?api_key={UNISENDER_API_KEY}

1. Проверь tools (~8):
   - get_lists, create_list, subscribe, unsubscribe,
     create_email_message, create_campaign, get_campaign_stats, send_sms

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: UNISENDER_API_KEY), CI

3. Skills:
   - skill-send-campaign.md — "Создай и отправь email-рассылку: список, тема, текст"
   - skill-list-stats.md — "Статистика списка: подписчики, отписки, bounce rate"

4. README: реферальная ссылка https://affiliate.unisender.com
5. npm version minor && npm publish --access public
```

**Estimated total:** 8ч

---

### 20. tkassa-mcp — Т-Касса (Тинькофф)
**Status:** Needs Upgrade
**Current:** ~8 tools. Код есть.
**Priority:** LOW — много платёжных конкурентов (ЮKassa уже production)
**API:** https://securepay.tinkoff.ru/v2/, Terminal key + SHA-256 token
**npm:** `@theyahia/tkassa-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови tkassa-mcp до production-grade.

API: POST https://securepay.tinkoff.ru/v2/
Auth: TerminalKey + Token (SHA-256 от конкатенации полей + password)

1. Проверь tools (~8):
   - init_payment, get_payment_state, confirm_payment, cancel_payment,
     charge_payment, create_receipt, get_receipt, resend_receipt
   - Token формируется: SHA-256(sorted values + password)

2. Vitest тесты (mock SHA-256 auth), Streamable HTTP,
   smithery.yaml (env: TKASSA_TERMINAL_KEY, TKASSA_PASSWORD), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 6ч

---

### 21. robokassa-mcp — Robokassa
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — старый платёжный сервис
**API:** https://auth.robokassa.ru/Merchant/WebService/Service.asmx, XML/JSON
**npm:** `@theyahia/robokassa-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови robokassa-mcp до production-grade.

1. Проверь tools (~6):
   - create_invoice, get_payment_state, get_currencies,
     get_receipts, send_receipt, refund
   - Auth: MerchantLogin + SignatureValue (MD5/SHA-256)

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: ROBOKASSA_LOGIN, ROBOKASSA_PASSWORD1, ROBOKASSA_PASSWORD2), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 22. cloudpayments-mcp — CloudPayments
**Status:** Needs Upgrade
**Current:** ~8 tools. Код есть.
**Priority:** LOW — реферальная программа 0.1-0.3% от оборота
**API:** https://api.cloudpayments.ru/, Basic Auth (public_id + api_secret)
**npm:** `@theyahia/cloudpayments-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Реферальная ссылка: cloudpayments.ru/agents — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови cloudpayments-mcp до production-grade.

API: POST https://api.cloudpayments.ru/{method}
Auth: Basic (CP_PUBLIC_ID : CP_API_SECRET)

1. Проверь tools (~8):
   - charge, auth, confirm, void, refund, get_payment, find_payments, get_subscriptions

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: CP_PUBLIC_ID, CP_API_SECRET), CI
3. README: реферальная ссылка https://cloudpayments.ru/agents
4. npm version minor && npm publish --access public
```

**Estimated total:** 6.5ч

---

### 23. retailcrm-mcp — RetailCRM
**Status:** Needs Upgrade
**Current:** ~8 tools. Код есть.
**Priority:** MEDIUM — хорошая реферальная (50%), e-commerce CRM
**API:** https://{domain}.retailcrm.ru/api/v5/, API key
**npm:** `@theyahia/retailcrm-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2: skill-orders-today, skill-customer-search) — 1.5ч
- [ ] Реферальная ссылка: retailcrm.services (до 50%) — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови retailcrm-mcp до production-grade.

API: GET/POST https://{RETAILCRM_DOMAIN}.retailcrm.ru/api/v5/{method}?apiKey={RETAILCRM_API_KEY}

1. Проверь tools (~8):
   - get_orders, create_order, get_customers, create_customer,
     get_order_statuses, get_delivery_types, get_payment_types, get_stores

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: RETAILCRM_DOMAIN, RETAILCRM_API_KEY), CI
3. Skills:
   - skill-orders-today.md — "Покажи заказы за сегодня: количество, сумма, статусы"
   - skill-customer-search.md — "Найди клиента по телефону/email/имени"
4. README: реферальная ссылка https://retailcrm.services
5. npm version minor && npm publish --access public
```

**Estimated total:** 8ч

---

### 24. sendpulse-mcp — SendPulse
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — есть Unisender (приоритетнее)
**API:** https://api.sendpulse.com/, OAuth 2.0 (client_credentials)
**npm:** `@theyahia/sendpulse-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови sendpulse-mcp до production-grade.

API: OAuth 2.0 → POST https://api.sendpulse.com/oauth/access_token
→ Bearer token для всех запросов

1. Проверь tools (~6):
   - get_mailing_lists, create_mailing_list, add_emails,
     send_email, get_campaign_stats, send_sms

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: SENDPULSE_CLIENT_ID, SENDPULSE_CLIENT_SECRET), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 25. kontur-focus-mcp — Контур.Фокус
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** MEDIUM — уникальная ниша (проверка контрагентов), score 53
**API:** https://focus-api.kontur.ru/api3/, API key
**npm:** `@theyahia/kontur-focus-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2: skill-check-counterparty, skill-risk-assessment) — 1.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови kontur-focus-mcp до production-grade.

API: GET https://focus-api.kontur.ru/api3/{method}?key={KONTUR_FOCUS_API_KEY}&inn={inn}

1. Проверь tools (~6):
   - get_company_by_inn, get_company_by_ogrn, check_reliability,
     get_finances, get_affiliates, get_licenses

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: KONTUR_FOCUS_API_KEY), CI
3. Skills:
   - skill-check-counterparty.md — "Проверь контрагента по ИНН: надёжность, финансы, аффилированные лица"
   - skill-risk-assessment.md — "Оцени риски работы с компанией: суды, долги, банкротство"
4. README: синергия с dadata-mcp (ИНН из DaData → проверка в Контур.Фокус)
5. npm version minor && npm publish --access public
```

**Estimated total:** 7.5ч

---

### 26. chestnyznak-mcp — Честный ЗНАК
**Status:** Needs Upgrade
**Current:** ~5 tools. Код есть.
**Priority:** LOW — узкая ниша (маркировка товаров)
**API:** https://markirovka.crpt.ru/api/v3/, Certificate auth + JWT
**npm:** `@theyahia/chestnyznak-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови chestnyznak-mcp до production-grade.

API: POST/GET https://markirovka.crpt.ru/api/v3/
Auth: JWT token (получается через сертификат УКЭП)

1. Проверь tools (~5):
   - get_document, create_document, get_codes, check_code, get_product_info

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: CHESTNYZNAK_TOKEN), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 27. vk-mcp — VK API
**Status:** Needs Upgrade
**Current:** ~8 tools. Код есть.
**Priority:** MEDIUM — большая аудитория (97M пользователей VK)
**API:** https://api.vk.com/method/, Service token / User token
**npm:** `@theyahia/vk-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (2: skill-post-content, skill-group-stats) — 1.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови vk-mcp до production-grade.

API: POST https://api.vk.com/method/{method}?access_token={VK_ACCESS_TOKEN}&v=5.199

1. Проверь tools (~8):
   - wall_post, wall_get, groups_get, groups_getMembers,
     users_get, messages_send, photos_getAlbums, stats_get

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: VK_ACCESS_TOKEN), CI
3. Skills:
   - skill-post-content.md — "Опубликуй пост в группу VK: текст, изображение"
   - skill-group-stats.md — "Статистика группы VK: подписчики, охват, вовлечённость"
4. README по шаблону серии
5. npm version minor && npm publish --access public
```

**Estimated total:** 7.5ч

---

### 28. gigachat-mcp — GigaChat (Sber AI)
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** MEDIUM — российский LLM, растущая аудитория
**API:** https://gigachat.devices.sberbank.ru/api/v1/, OAuth 2.0 (client_credentials)
**npm:** `@theyahia/gigachat-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (1: skill-generate-text) — 1ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови gigachat-mcp до production-grade.

API: POST https://gigachat.devices.sberbank.ru/api/v1/chat/completions
Auth: OAuth 2.0 → POST https://ngw.devices.sberbank.ru:9443/api/v2/oauth
  Authorization: Basic {base64(client_id:client_secret)}
  scope: GIGACHAT_API_PERS

1. Проверь tools (~6):
   - chat_completion, get_models, get_model, count_tokens, generate_image, get_balance

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: GIGACHAT_CLIENT_ID, GIGACHAT_CLIENT_SECRET), CI
3. Skill: skill-generate-text.md — "Сгенерируй текст через GigaChat: промпт → ответ"
4. README: инструкция получения API-ключа на developers.sber.ru
5. npm version minor && npm publish --access public
```

**Estimated total:** 7ч

---

### 29. yandexgpt-mcp — YandexGPT
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** MEDIUM — российский LLM от Яндекса
**API:** https://llm.api.cloud.yandex.net/foundationModels/v1/, IAM token / API key
**npm:** `@theyahia/yandexgpt-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Skills (1: skill-generate-text) — 1ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови yandexgpt-mcp до production-grade.

API: POST https://llm.api.cloud.yandex.net/foundationModels/v1/completion
Auth: Authorization: Api-Key {YANDEXGPT_API_KEY} или Bearer {IAM_TOKEN}
Header: x-folder-id: {YANDEX_FOLDER_ID}

1. Проверь tools (~6):
   - completion, async_completion, tokenize, classify, embed, get_models

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: YANDEXGPT_API_KEY, YANDEX_FOLDER_ID), CI
3. Skill: skill-generate-text.md — "Сгенерируй текст через YandexGPT: промпт → ответ"
4. README: инструкция получения API-ключа через console.yandex.cloud
5. npm version minor && npm publish --access public
```

**Estimated total:** 7ч

---

## ГРУППА E: NEEDS UPGRADE — LOW PRIORITY (27 серверов)

Код есть, но аудитория маленькая или есть более приоритетные альтернативы.

---

### 30. boxberry-mcp — Boxberry доставка
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — СДЭК приоритетнее
**API:** https://api.boxberry.ru/json.php, API key parameter
**npm:** `@theyahia/boxberry-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови boxberry-mcp до production-grade.

API: GET https://api.boxberry.ru/json.php?token={BOXBERRY_API_KEY}&method={method}

1. Проверь tools (~6):
   - get_cities, get_points, calculate_delivery, create_order, track_order, get_order_info

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: BOXBERRY_API_KEY), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 31. delovye-linii-mcp — Деловые Линии
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — грузоперевозки, узкая ниша
**API:** https://api.dellin.ru/v3/, API key + session auth
**npm:** `@theyahia/delovye-linii-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови delovye-linii-mcp до production-grade.

API: POST https://api.dellin.ru/v3/
Auth: appKey в JSON body

1. Проверь tools (~6):
   - calculate, create_order, track_order, get_terminals, get_cities, get_order_info

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: DELLIN_APP_KEY), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 32. pochta-russia-mcp — Почта России
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — медленный API, бюрократичная организация
**API:** https://otpravka-api.pochta.ru/, Basic Auth + OAuth token
**npm:** `@theyahia/pochta-russia-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови pochta-russia-mcp до production-grade.

API: GET/POST https://otpravka-api.pochta.ru/1.0/
Auth: Authorization: AccessToken {POCHTA_ACCESS_TOKEN}
      X-User-Authorization: Basic {base64(login:password)}

1. Проверь tools (~6):
   - calculate_tariff, track_shipment, get_offices, create_order, get_order, normalize_address

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: POCHTA_ACCESS_TOKEN, POCHTA_LOGIN, POCHTA_PASSWORD), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 33. superjob-mcp — SuperJob
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — hh.ru приоритетнее
**API:** https://api.superjob.ru/2.0/, API key + OAuth 2.0
**npm:** `@theyahia/superjob-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови superjob-mcp до production-grade.

API: GET https://api.superjob.ru/2.0/{method}/
Auth: X-Api-App-Id: {SUPERJOB_API_KEY}

1. Проверь tools (~6):
   - search_vacancies, get_vacancy, get_catalogues, get_towns, search_resumes, get_salary

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: SUPERJOB_API_KEY), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 34. huntflow-mcp — HuntFlow ATS
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — узкая ниша (рекрутинг)
**API:** https://api.huntflow.ai/v2/, Bearer token (OAuth 2.0)
**npm:** `@theyahia/huntflow-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови huntflow-mcp до production-grade.

API: GET/POST https://api.huntflow.ai/v2/accounts/{account_id}/
Auth: Authorization: Bearer {HUNTFLOW_TOKEN}

1. Проверь tools (~6):
   - get_vacancies, get_applicants, create_applicant, get_statuses, get_tags, get_resume

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: HUNTFLOW_TOKEN, HUNTFLOW_ACCOUNT_ID), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 35. mts-exolve-mcp — MTS Exolve
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — телеком API, узкая аудитория
**API:** https://api.exolve.ru/v1/, Bearer token
**npm:** `@theyahia/mts-exolve-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови mts-exolve-mcp до production-grade.

API: POST https://api.exolve.ru/v1/
Auth: Authorization: Bearer {MTS_EXOLVE_TOKEN}

1. Проверь tools (~6):
   - make_call, send_sms, get_balance, get_numbers, get_call_history, get_recordings

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: MTS_EXOLVE_TOKEN), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 36. mango-office-mcp — Манго Офис
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — облачная телефония, конкуренция
**API:** https://app.mango-office.ru/vpbx/, HMAC-SHA256 auth
**npm:** `@theyahia/mango-office-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови mango-office-mcp до production-grade.

API: POST https://app.mango-office.ru/vpbx/{method}
Auth: HMAC-SHA256 sign = sha256(api_key + json + api_salt)

1. Проверь tools (~6):
   - make_call, get_stats, get_recording, get_users, get_groups, get_balance

2. Vitest тесты (mock HMAC auth), Streamable HTTP,
   smithery.yaml (env: MANGO_API_KEY, MANGO_API_SALT), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 6ч

---

### 37. voximplant-mcp — Voximplant
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — CPaaS, международная конкуренция (Twilio и др.)
**API:** https://api.voximplant.com/platform_api/, API key + account_id
**npm:** `@theyahia/voximplant-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови voximplant-mcp до production-grade.

API: GET/POST https://api.voximplant.com/platform_api/{method}
Auth: ?account_id={VOXIMPLANT_ACCOUNT_ID}&api_key={VOXIMPLANT_API_KEY}

1. Проверь tools (~6):
   - get_users, create_user, get_scenarios, start_scenario, get_call_history, get_balance

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: VOXIMPLANT_ACCOUNT_ID, VOXIMPLANT_API_KEY), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 38. sms-ru-mcp — SMS.ru
**Status:** Needs Upgrade
**Current:** ~5 tools. Код есть.
**Priority:** LOW — простой SMS gateway
**API:** https://sms.ru/sms/send, API key parameter
**npm:** `@theyahia/sms-ru-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови sms-ru-mcp до production-grade.

API: GET/POST https://sms.ru/{method}?api_id={SMS_RU_API_KEY}

1. Проверь tools (~5):
   - send_sms, get_status, get_balance, get_senders, get_cost

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: SMS_RU_API_KEY), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 39. jivosite-mcp — JivoSite
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — онлайн-чат, конкуренция (Intercom, Carrot quest)
**API:** https://api.jivosite.com/v1/, Bearer token
**npm:** `@theyahia/jivosite-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови jivosite-mcp до production-grade.

API: GET/POST https://api.jivosite.com/v1/
Auth: Authorization: Bearer {JIVOSITE_TOKEN}

1. Проверь tools (~6):
   - get_chats, send_message, get_agents, get_visitors, get_departments, get_stats

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: JIVOSITE_TOKEN), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 40. tilda-mcp — Tilda
**Status:** Needs Upgrade
**Current:** ~5 tools. Код есть.
**Priority:** LOW — конструктор сайтов, простой API
**API:** https://api.tildacdn.info/v1/, publickey + secretkey
**npm:** `@theyahia/tilda-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови tilda-mcp до production-grade.

API: GET https://api.tildacdn.info/v1/
Auth: ?publickey={TILDA_PUBLIC_KEY}&secretkey={TILDA_SECRET_KEY}

1. Проверь tools (~5):
   - get_projects, get_project, get_pages, get_page, get_page_full

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: TILDA_PUBLIC_KEY, TILDA_SECRET_KEY), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 41. megaplan-mcp — Мегаплан
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — CRM/PM, конкуренция с Bitrix24
**API:** https://{domain}.megaplan.ru/api/v3/, Bearer token
**npm:** `@theyahia/megaplan-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови megaplan-mcp до production-grade.

API: GET/POST https://{MEGAPLAN_DOMAIN}.megaplan.ru/api/v3/
Auth: Authorization: Bearer {MEGAPLAN_TOKEN}

1. Проверь tools (~6):
   - get_deals, create_deal, get_tasks, create_task, get_employees, get_projects

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: MEGAPLAN_DOMAIN, MEGAPLAN_TOKEN), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 42. planfix-mcp — Планфикс
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** MEDIUM — хорошая реферальная (35%), PM-система
**API:** https://apiv2.planfix.com/, Bearer token (REST API v2)
**npm:** `@theyahia/planfix-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Реферальная ссылка (35%) — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови planfix-mcp до production-grade.

API: POST https://apiv2.planfix.com/
Auth: Authorization: Bearer {PLANFIX_TOKEN}
Content-Type: application/json

1. Проверь tools (~6):
   - get_tasks, create_task, update_task, get_projects, get_contacts, get_comments

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: PLANFIX_TOKEN, PLANFIX_ACCOUNT), CI
3. README: реферальная ссылка (35% комиссия)
4. npm version minor && npm publish --access public
```

**Estimated total:** 6ч

---

### 43. kaiten-mcp — Kaiten
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — PM-инструмент, конкуренция
**API:** https://{domain}.kaiten.ru/api/latest/, Bearer token
**npm:** `@theyahia/kaiten-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови kaiten-mcp до production-grade.

API: GET/POST https://{KAITEN_DOMAIN}.kaiten.ru/api/latest/
Auth: Authorization: Bearer {KAITEN_TOKEN}

1. Проверь tools (~6):
   - get_boards, get_cards, create_card, update_card, get_columns, get_members

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: KAITEN_DOMAIN, KAITEN_TOKEN), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 44. elma365-mcp — ELMA365 BPM
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — BPM-платформа, enterprise
**API:** https://{domain}.elma365.com/api/, Bearer token
**npm:** `@theyahia/elma365-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови elma365-mcp до production-grade.

API: GET/POST https://{ELMA365_DOMAIN}.elma365.com/api/
Auth: Authorization: Bearer {ELMA365_TOKEN}

1. Проверь tools (~6):
   - get_processes, start_process, get_tasks, complete_task, get_apps, get_records

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: ELMA365_DOMAIN, ELMA365_TOKEN), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 45. insales-mcp — InSales
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — e-commerce платформа, конкуренция с Tilda/Shopify
**API:** https://{domain}.myinsales.ru/admin/, Basic Auth (api_key:password)
**npm:** `@theyahia/insales-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови insales-mcp до production-grade.

API: GET/POST https://{INSALES_DOMAIN}.myinsales.ru/admin/
Auth: Basic (INSALES_API_KEY : INSALES_PASSWORD)
Content-Type: application/json

1. Проверь tools (~6):
   - get_products, create_product, get_orders, get_categories, get_clients, get_stock

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: INSALES_DOMAIN, INSALES_API_KEY, INSALES_PASSWORD), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 46. mindbox-mcp — Mindbox CDP
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — CDP-платформа, enterprise-сегмент
**API:** https://api.mindbox.ru/v3/, API key (Mindbox-Integration header)
**npm:** `@theyahia/mindbox-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови mindbox-mcp до production-grade.

API: POST https://api.mindbox.ru/v3/operations
Auth: Mindbox secretKey={MINDBOX_SECRET_KEY}
Header: Content-Type: application/json

1. Проверь tools (~6):
   - get_customer, create_customer, get_orders, create_order, get_segments, send_email

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: MINDBOX_SECRET_KEY, MINDBOX_ENDPOINT_ID), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 47. roistat-mcp — Roistat
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — аналитика, реферальная 25-50%
**API:** https://cloud.roistat.com/api/v1/, API key
**npm:** `@theyahia/roistat-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Реферальная ссылка: roistat.com/partners (25-50%) — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови roistat-mcp до production-grade.

API: GET/POST https://cloud.roistat.com/api/v1/
Auth: ?key={ROISTAT_API_KEY}

1. Проверь tools (~6):
   - get_analytics, get_leads, get_sources, get_visits, get_calls, get_chats

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: ROISTAT_API_KEY, ROISTAT_PROJECT_ID), CI
3. README: реферальная ссылка roistat.com/partners (25-50%)
4. npm version minor && npm publish --access public
```

**Estimated total:** 6ч

---

### 48. calltouch-mcp — Calltouch
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — call tracking, реферальная 15% пожизненно
**API:** https://api.calltouch.ru/calls-service/RestAPI/, API key
**npm:** `@theyahia/calltouch-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] Реферальная ссылка: calltouch.ru/partners (15%) — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови calltouch-mcp до production-grade.

API: GET https://api.calltouch.ru/calls-service/RestAPI/{site_id}/
Auth: Access-Token: {CALLTOUCH_TOKEN}

1. Проверь tools (~6):
   - get_calls, get_call, get_tags, get_sources, get_statistics, get_goals

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: CALLTOUCH_TOKEN, CALLTOUCH_SITE_ID), CI
3. README: реферальная ссылка calltouch.ru/partners (15% пожизненно)
4. npm version minor && npm publish --access public
```

**Estimated total:** 6ч

---

### 49. salutespeech-mcp — SaluteSpeech (Sber)
**Status:** Needs Upgrade
**Current:** ~5 tools. Код есть.
**Priority:** LOW — Speech-to-Text/TTS от Сбера
**API:** https://smartspeech.sber.ru/rest/v1/, OAuth 2.0 (как GigaChat)
**npm:** `@theyahia/salutespeech-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови salutespeech-mcp до production-grade.

API: POST https://smartspeech.sber.ru/rest/v1/
Auth: OAuth 2.0 → POST https://ngw.devices.sberbank.ru:9443/api/v2/oauth
  scope: SALUTE_SPEECH_PERS

1. Проверь tools (~5):
   - recognize_speech (STT), synthesize_speech (TTS), get_models, get_tasks, get_task_result

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: SALUTESPEECH_CLIENT_ID, SALUTESPEECH_CLIENT_SECRET), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 50. yandex-speechkit-mcp — Yandex SpeechKit
**Status:** Needs Upgrade
**Current:** ~5 tools. Код есть.
**Priority:** LOW — Speech-to-Text/TTS от Яндекса
**API:** https://stt.api.cloud.yandex.net/speech/v1/, IAM token
**npm:** `@theyahia/yandex-speechkit-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови yandex-speechkit-mcp до production-grade.

API: POST https://stt.api.cloud.yandex.net/speech/v1/stt:recognize (STT)
     POST https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize (TTS)
Auth: Authorization: Bearer {YANDEX_IAM_TOKEN}
      x-folder-id: {YANDEX_FOLDER_ID}

1. Проверь tools (~5):
   - recognize_short, recognize_long, synthesize, get_voices, get_languages

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: YANDEX_IAM_TOKEN, YANDEX_FOLDER_ID), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 51. yandex-webmaster-mcp — Yandex Webmaster
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — SEO-инструмент
**API:** https://api.webmaster.yandex.net/v4/, OAuth token
**npm:** `@theyahia/yandex-webmaster-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови yandex-webmaster-mcp до production-grade.

API: GET/POST https://api.webmaster.yandex.net/v4/
Auth: Authorization: OAuth {YANDEX_WEBMASTER_TOKEN}

1. Проверь tools (~6):
   - get_hosts, get_host_info, get_search_queries, get_indexing_stats, submit_url, get_sitemaps

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: YANDEX_WEBMASTER_TOKEN), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 52. sber-mcp — Sber API
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — банковский API, ограниченный доступ
**API:** https://api.sberbank.ru/v1/, OAuth 2.0 (client_credentials)
**npm:** `@theyahia/sber-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови sber-mcp до production-grade.

API: POST/GET https://api.sberbank.ru/v1/
Auth: OAuth 2.0 client_credentials

1. Проверь tools (~6):
   - get_accounts, get_transactions, create_payment, get_payment_status, get_exchange_rates, get_branches

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: SBER_CLIENT_ID, SBER_CLIENT_SECRET), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 53. 1c-rest-mcp — 1C REST API
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — 1C = доминирующий ERP в РФ, но REST API нестандартный
**API:** https://{server}/1c/{database}/hs/, Basic Auth
**npm:** `@theyahia/1c-rest-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 2ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — disclaimer: "Требуется настройка HTTP-сервиса в 1С" — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови 1c-rest-mcp до production-grade.

API: GET/POST https://{1C_SERVER}/{1C_DATABASE}/hs/{service}/
Auth: Basic (1C_LOGIN : 1C_PASSWORD)

ВАЖНО: 1C REST API зависит от конфигурации HTTP-сервиса в 1С.
Стандартных endpoints нет — tools должны быть достаточно generic.

1. Проверь tools (~6):
   - get_documents, create_document, get_catalogs, get_catalog_item, execute_method, get_registers

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: 1C_SERVER, 1C_DATABASE, 1C_LOGIN, 1C_PASSWORD), CI
3. README: disclaimer — "Требуется настроенный HTTP-сервис в 1С:Предприятие"
4. npm version minor && npm publish --access public
```

**Estimated total:** 6ч

---

### 54. getcourse-mcp — GetCourse
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — онлайн-школы, узкая ниша
**API:** https://{domain}.getcourse.ru/pl/api/, API key
**npm:** `@theyahia/getcourse-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови getcourse-mcp до production-grade.

API: POST https://{GETCOURSE_DOMAIN}.getcourse.ru/pl/api/{method}
Auth: key={GETCOURSE_API_KEY} в body

1. Проверь tools (~6):
   - get_users, create_user, get_deals, get_groups, export_users, import_users

2. Vitest тесты, Streamable HTTP,
   smithery.yaml (env: GETCOURSE_DOMAIN, GETCOURSE_API_KEY), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 55. travelpayouts-mcp — Travelpayouts
**Status:** Needs Upgrade
**Current:** ~6 tools. Код есть.
**Priority:** LOW — travel affiliate, узкая ниша
**API:** https://api.travelpayouts.com/v2/, API token
**npm:** `@theyahia/travelpayouts-mcp`

**TODO:**
- [ ] Тесты (Vitest) — 1.5ч
- [ ] Streamable HTTP — 1.5ч
- [ ] smithery.yaml — 0.5ч
- [ ] CI — 0.5ч
- [ ] README update — 1ч
- [ ] npm publish — 0.5ч

**Claude Code prompt для upgrade:**
```
Обнови travelpayouts-mcp до production-grade.

API: GET https://api.travelpayouts.com/v2/
Auth: X-Access-Token: {TRAVELPAYOUTS_TOKEN}

1. Проверь tools (~6):
   - search_flights, get_prices, get_hotels, get_hotel_prices, get_airports, get_airlines

2. Vitest тесты, Streamable HTTP, smithery.yaml (env: TRAVELPAYOUTS_TOKEN), CI
3. README по шаблону серии
4. npm version minor && npm publish --access public
```

**Estimated total:** 5.5ч

---

### 56. kaspi-mcp — Kaspi.kz (старый placeholder)
**Status:** Placeholder / Решение необходимо
**Current:** Минимальный код или заготовка
**Priority:** LOW — есть kaspi-merchant-mcp (#12) как основной
**API:** (зависит от решения)
**npm:** `@theyahia/kaspi-mcp`

**РЕШЕНИЕ:**
- **Вариант A:** Мержить в kaspi-merchant-mcp — удалить репо, npm deprecate
- **Вариант B:** Сделать kaspi-mcp = Consumer API (P2P переводы, баланс), kaspi-merchant-mcp = Seller API
- **Рекомендация:** Вариант A. Consumer API Kaspi закрытый, нет публичного доступа. kaspi-merchant-mcp = единственный нужный.

**TODO:**
- [ ] Решить: merge или separate — 0.5ч
- [ ] Если merge: `npm deprecate @theyahia/kaspi-mcp "Use @theyahia/kaspi-merchant-mcp instead"` — 0.5ч
- [ ] Обновить README: redirect на kaspi-merchant-mcp — 0.5ч
- [ ] Archive GitHub repo — 0.5ч

**Claude Code prompt:**
```
В kaspi-mcp:

1. Обнови README.md:
   "⚠️ Этот пакет deprecated. Используйте @theyahia/kaspi-merchant-mcp.
    https://github.com/theYahia/kaspi-merchant-mcp"

2. Обнови package.json: deprecated: true

Затем:
npm deprecate @theyahia/kaspi-mcp "Use @theyahia/kaspi-merchant-mcp instead"
npm publish --access public
gh repo archive theYahia/kaspi-mcp --yes
```

**Estimated total:** 2ч

---

## СВОДНЫЕ ТАБЛИЦЫ

---

### ТАБЛИЦА 1: Матрица приоритетов (все 56 репо)

| # | Репо | Приоритет | Статус | Tools | Часы | Группа |
|---|------|-----------|--------|-------|------|--------|
| 1 | dadata-mcp | HIGH | Production | 31 | 5 | A |
| 2 | moysklad-mcp | HIGH | Production | 10 | 6 | A |
| 3 | cdek-mcp | HIGH | Production | 8 | 3 | A |
| 4 | yookassa-mcp | HIGH | Production | 10 | 3 | A |
| 9 | payme-mcp | HIGH | In Progress | 10 | 8 | B |
| 10 | click-mcp | HIGH | In Progress | 8 | 7 | B |
| 12 | kaspi-merchant-mcp | HIGH | In Progress | 8 | 8 | B |
| 13 | ozon-mcp | HIGH | Needs Upgrade | 12 | 8.5 | C |
| 14 | wildberries-mcp | HIGH | Needs Upgrade | 12 | 10 | C |
| 5 | hh-mcp | MEDIUM | Production | 8 | 2 | A |
| 6 | nbk-mcp | MEDIUM | Production | 5 | 2 | A |
| 7 | cbu-mcp | MEDIUM | Production | 5 | 1.5 | A |
| 11 | eskiz-mcp | MEDIUM | In Progress | 6 | 6 | B |
| 15 | amocrm-mcp | MEDIUM | Needs Upgrade | 10 | 10.5 | C |
| 16 | yandex-metrika-mcp | MEDIUM | Needs Upgrade | 6 | 7.5 | D |
| 17 | yandex-direct-mcp | MEDIUM | Needs Upgrade | 8 | 8 | D |
| 19 | unisender-mcp | MEDIUM | Needs Upgrade | 8 | 8 | D |
| 23 | retailcrm-mcp | MEDIUM | Needs Upgrade | 8 | 8 | D |
| 25 | kontur-focus-mcp | MEDIUM | Needs Upgrade | 6 | 7.5 | D |
| 27 | vk-mcp | MEDIUM | Needs Upgrade | 8 | 7.5 | D |
| 28 | gigachat-mcp | MEDIUM | Needs Upgrade | 6 | 7 | D |
| 29 | yandexgpt-mcp | MEDIUM | Needs Upgrade | 6 | 7 | D |
| 42 | planfix-mcp | MEDIUM | Needs Upgrade | 6 | 6 | D |
| 8 | cbr-mcp | LOW | Production (partial) | 5 | 6 | A |
| 18 | bitrix24-mcp | LOW | Needs Upgrade | 8 | 6 | D |
| 20 | tkassa-mcp | LOW | Needs Upgrade | 8 | 6 | E |
| 21 | robokassa-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 22 | cloudpayments-mcp | LOW | Needs Upgrade | 8 | 6.5 | E |
| 24 | sendpulse-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 26 | chestnyznak-mcp | LOW | Needs Upgrade | 5 | 5.5 | E |
| 30 | boxberry-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 31 | delovye-linii-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 32 | pochta-russia-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 33 | superjob-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 34 | huntflow-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 35 | mts-exolve-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 36 | mango-office-mcp | LOW | Needs Upgrade | 6 | 6 | E |
| 37 | voximplant-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 38 | sms-ru-mcp | LOW | Needs Upgrade | 5 | 5.5 | E |
| 39 | jivosite-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 40 | tilda-mcp | LOW | Needs Upgrade | 5 | 5.5 | E |
| 41 | megaplan-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 43 | kaiten-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 44 | elma365-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 45 | insales-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 46 | mindbox-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 47 | roistat-mcp | LOW | Needs Upgrade | 6 | 6 | E |
| 48 | calltouch-mcp | LOW | Needs Upgrade | 6 | 6 | E |
| 49 | salutespeech-mcp | LOW | Needs Upgrade | 5 | 5.5 | E |
| 50 | yandex-speechkit-mcp | LOW | Needs Upgrade | 5 | 5.5 | E |
| 51 | yandex-webmaster-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 52 | sber-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 53 | 1c-rest-mcp | LOW | Needs Upgrade | 6 | 6 | E |
| 54 | getcourse-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 55 | travelpayouts-mcp | LOW | Needs Upgrade | 6 | 5.5 | E |
| 56 | kaspi-mcp | LOW | Placeholder | — | 2 | — |

---

### ТАБЛИЦА 2: Оценка времени по группам

| Группа | Описание | Кол-во | Часов всего | Недель (40ч/нед) |
|--------|----------|--------|-------------|------------------|
| **A — Production** | Мелкие доработки | 8 | 28.5 | 0.7 |
| **B — In Progress** | Завершить создание + upgrade | 4 | 29 | 0.7 |
| **C — Needs Upgrade HIGH** | Ozon, WB, amoCRM | 3 | 29 | 0.7 |
| **D — Needs Upgrade MEDIUM** | Яндекс, CRM, AI | 10 | 72.5 | 1.8 |
| **E — Needs Upgrade LOW** | Все остальные | 27 | 151 | 3.8 |
| **Placeholder** | kaspi-mcp (deprecate) | 1 | 2 | — |
| | | | | |
| **ИТОГО HIGH** | A + B + C | 15 | 86.5 | **2.2 нед** |
| **ИТОГО MEDIUM** | D | 10 | 72.5 | **1.8 нед** |
| **ИТОГО LOW** | E + placeholder | 28 | 153 | **3.8 нед** |
| **ИТОГО ВСЁ** | Все 56 репо | 56 | **312** | **7.8 нед** |

---

### ТАБЛИЦА 3: Реферальный потенциал

| # | Сервис | Комиссия | Тип | Реферальная ссылка | Статус |
|---|--------|----------|-----|-------------------|--------|
| 1 | **amoCRM** | до 50% | От лицензий | amostart.ru | Нужно зарегистрироваться |
| 2 | **RetailCRM** | до 50% | От платежей | retailcrm.services | Нужно зарегистрироваться |
| 3 | **Unisender** | 50% / 25% | Первый / повторные | affiliate.unisender.com | Нужно зарегистрироваться |
| 4 | **Roistat** | 25-50% | От платежей (ИП=50%) | roistat.com/partners | Нужно зарегистрироваться |
| 5 | **Planfix** | 35% | От платежей | planfix.ru/partners | Нужно зарегистрироваться |
| 6 | **DaData** | 30% | От выручки | dadata.ru/?ref=255717 | ✅ Есть (ref=255717) |
| 7 | **МойСклад** | 25-40% | Recurring 12 мес | partners.moysklad.ru | Нужно зарегистрироваться |
| 8 | **ЮKassa** | Revenue share | Агентский | promo.yookassa.ru/agents | Ждёт р/с |
| 9 | **Calltouch** | 15% | Пожизненно | calltouch.ru/partners | Нужно зарегистрироваться |
| 10 | **СДЭК** | Фикс за лиды | Разовая | cdek.promo/partner | Нужно зарегистрироваться |
| 11 | **CloudPayments** | 0.1-0.3% | От оборота | cloudpayments.ru/agents | Нужно зарегистрироваться |

**Потенциал при 100 привлечённых клиентах:**
- amoCRM: ~150K₽/мес (при среднем чеке 6K₽/мес × 50%)
- Unisender: ~75K₽/мес (при среднем чеке 3K₽/мес × 50%)
- RetailCRM: ~50K₽/мес
- МойСклад: ~40K₽/мес
- **Реалистичная оценка (RESEARCH_06): 2-30K₽/мес total — НЕ основной доход**

---

### ТАБЛИЦА 4: Конкурентный анализ

| # | Наш MCP | Конкурент | Их tools | Наши tools | Статус | Стратегия |
|---|---------|-----------|----------|------------|--------|-----------|
| 1 | dadata-mcp | **dadata.ru/mcp** (official) | ~4 | **31** | Мы лучше | "31 vs 4, локальный, npm" |
| 2 | amocrm-mcp | **caiborg-ai/amocrm-mcp** | **36** | 10 | Мы хуже | "Лёгкий старт" или догнать |
| 3 | bitrix24-mcp | **Bitrix24 Official MCP** | ? | 8 | Мы хуже | Community-альтернатива |
| 4 | wildberries-mcp | **wildberries-mcp** (несколько) | ~5-8 | 12 | Мы лучше | Rate limiter + 12 tools |
| 5 | ozon-mcp | Нет | — | 12 | Монополия | First-mover advantage |
| 6 | moysklad-mcp | Нет | — | 10 | Монополия | First-mover advantage |
| 7 | cdek-mcp | Нет | — | 8 | Монополия | First-mover advantage |
| 8 | yookassa-mcp | Нет | — | 10 | Монополия | First-mover advantage |
| 9 | kaspi-merchant-mcp | Нет | — | 8 | Монополия | First-mover CIS |
| 10 | hh-mcp | **hh-mcp** (1-2 других) | ~3-5 | 8 | Мы лучше | Больше tools |

**Вывод:** 6 из 56 серверов — монополисты (нет конкурентов). Это главный актив.

---

### ТАБЛИЦА 5: Рекомендуемый порядок выполнения

**Фаза 1 (неделя 1-2): HIGH priority — 86.5ч**
1. dadata-mcp — доработки (5ч)
2. moysklad-mcp — верификация (6ч)
3. cdek-mcp — webhooks docs (3ч)
4. yookassa-mcp — skills (3ч)
5. ozon-mcp — полный upgrade (8.5ч)
6. wildberries-mcp — полный upgrade (10ч)
7. Завершить In Progress: payme, click, kaspi-merchant, eskiz (29ч)
8. amocrm-mcp — upgrade (10.5ч)
9. cbr-mcp — тесты + HTTP (6ч)
10. hh-mcp — skills (2ч)
11. nbk-mcp — .mcp.json (2ч)
12. cbu-mcp — smithery.yaml (1.5ч)

**Фаза 2 (неделя 3-4): MEDIUM priority — 72.5ч**
13. yandex-metrika-mcp (7.5ч)
14. yandex-direct-mcp (8ч)
15. unisender-mcp (8ч)
16. retailcrm-mcp (8ч)
17. kontur-focus-mcp (7.5ч)
18. vk-mcp (7.5ч)
19. gigachat-mcp (7ч)
20. yandexgpt-mcp (7ч)
21. planfix-mcp (6ч)
22. bitrix24-mcp (6ч)

**Фаза 3 (неделя 5-8): LOW priority — 153ч**
23-56. Все LOW priority по 5.5-6ч каждый

---

### ТАБЛИЦА 6: Суммарная статистика

| Метрика | Значение |
|---------|----------|
| Всего репозиториев | 56 |
| Production-ready | 7 (без cbr) |
| In Progress | 4 |
| Needs Upgrade | 44 |
| Placeholder (deprecate) | 1 |
| | |
| Всего tools (сумма) | ~388 |
| Средне tools на репо | ~7 |
| Максимум tools | 31 (dadata) |
| | |
| Всего тестов (сейчас) | ~213 |
| Всего часов на upgrade | **312ч** |
| Всего недель (40ч/нед) | **7.8 недель** |
| | |
| Монопольные ниши | 6 (ozon, moysklad, cdek, yookassa, kaspi, hh) |
| Рефералки доступно | 11 сервисов |
| Конкуренты (проигрываем) | 2 (amoCRM, Bitrix24) |

---

## КЛЮЧЕВЫЕ РЕШЕНИЯ

### 1. Что делать с kaspi-mcp (#56)?
**Решение:** Deprecate. Redirect на kaspi-merchant-mcp.

### 2. Стоит ли догонять caiborg-ai по amoCRM (36 vs 10 tools)?
**Решение:** НЕТ в ближайшее время. Позиционировать как "lightweight quickstart". При наличии спроса — расширить.

### 3. Стоит ли делать LOW priority серверы?
**Решение:** Да, но ПОСЛЕ фазы 1-2. 153 часа LOW priority = хороший портфолио + SEO + полнота серии. Но ТОЛЬКО после production на HIGH.

### 4. Единый паттерн upgrade (для автоматизации)?
**Решение:** Написать скрипт, который для каждого репо:
1. Клонирует
2. Добавляет Vitest boilerplate (vitest.config.ts, tests/smoke.test.ts)
3. Добавляет Streamable HTTP (http-transport.ts — стандартный файл)
4. Добавляет smithery.yaml (шаблон с env vars)
5. Добавляет CI workflow
6. Коммит + push

**Потенциал автоматизации:** 60-70% работы можно скриптовать, экономя ~100 часов.

---

*Документ создан 2026-03-31. Последнее обновление: 2026-03-31.*
*Автор: theYahia + Claude Opus 4.6*
