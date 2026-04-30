# MASTER PLAN V4 — @theyahia MCP-серия для российских API
**Версия:** 4.0 · **Дата:** 2026-03-31
**Автор:** theYahia · **npm:** metarebalance · **org:** @theyahia · **GitHub:** github.com/theYahia
**Цель:** #1 в российском MCP-пространстве + международная экспансия CIS
**Горизонт:** 3 месяца · **Стек:** TypeScript + Python · **Соло**

> **Источники:** V3/MASTER_PLAN (обязательные пункты + промпты) + V4/compass (стратегический план Compass)

---

## ТЕКУЩИЙ СТАТУС (на 2026-03-31)

### npm-пакеты
- **Организация:** `@theyahia` (npmjs.com/org/theyahia, бесплатный план, public packages)
- **Аккаунт:** `metarebalance` (npmjs.com/~metarebalance)
- **dadata-mcp** опубликован как `@metarebalance/dadata-mcp` (v1.0.5) — единственный пакет вне @theyahia
- **50 пакетов** под `@theyahia/` (47 с реальным кодом, 3 зарезервированы)

### Выпущено реальных MCP: 47
Все 47 серверов имеют реальный код (src/, tools/, client.ts, types.ts). Наиболее развитые (8+ файлов): dadata (21 файл), yookassa, cbr, cdek, moysklad, yandex-metrika, unisender, boxberry, yandex-direct.

### Площадки — текущий охват
- **Glama.ai, VS Code, n8n:** 47/47 (100%) — авто из npm
- **LobeHub:** 47/47 (100%) — PR#3-6 + PR#8 (⏳ ждёт мерж)
- **cline/mcp-marketplace:** 47/47 (100%) — Issues #1118-#1179
- **mcp.so:** 1/47 (2%) — руками
- **cursor.directory:** 1/47 (2%) — руками
- **Official MCP Registry:** 47/47 (100%) — все опубликованы через mcp-publisher
- **PulseMCP:** 47/47 (100%) — авто из Registry
- **Остальные каталоги:** 0/47

---

## СТРАТЕГИЯ (обновлено по RESEARCH_06 — жёсткий аудит)

> **Вердикт:** прекрати делать новые серверы. Фокус на 3 production-grade + контент + прямая монетизация.
> **Реферальная модель завышена в 5-225 раз.** Реально: 2-30K₽/мес, не 150-450K.
> **97% MCP-серверов — мусор.** Не стань частью этих 97%.

### Новая стратегия: B + E + C (глубина + контент + монетизация)

1. **3 production-grade сервера** — DaData (31 tool, лучший на рынке), МойСклад (нет конкурентов), СДЭК (уникальная ниша)
2. **Контент = главный канал роста** — Хабр как #1 площадка (не HN, не PH)
3. **Прямая монетизация** — MCPize freemium (85% share), consulting leads, НЕ реферальные
4. **47 серверов = маркетинговый хук** — поддерживать только 3-5 в production, остальные — "community/experimental"
5. **CIS — позже** — застолби территорию (kaspi-mcp), но полная экспансия через 2-3 месяца

### KILL LIST
- ~~Делать новые серверы~~ — 47 достаточно
- ~~Реферальные комиссии как основной доход~~ — модель не работает для MCP
- ~~Координированный HN + PH запуск~~ — Хабр твоя площадка
- ~~Узбекистан прямо сейчас~~ — слишком рано
- ~~amoCRM как приоритет~~ — уже занят (caiborg-ai, 36 tools)

### BLIND SPOTS (из RESEARCH_06)
- Claude заблокирован в РФ — 80-90% разработчиков отсечены
- amoCRM MCP уже занят конкурентом
- Bitrix24 — официальный MCP, в другой лиге
- 47 серверов без тестов = технический долг
- Конкуренция не с MCP, а с CLI и прямым API

### HONEST ASSESSMENT
| Сценарий | Вероятность |
|----------|------------|
| Бизнес >150K₽/мес за 12 мес | 5-10% |
| Бизнес >50K₽/мес (прямая монетизация + фриланс) | 20-30% |
| Портфолио для карьеры | 80-90% |
| Consulting-бизнес (100-300K₽/проект) | 40-50% |

**Главная метрика месяца: есть ли хоть один человек, который реально использует твой MCP.**

---

## ЧАСТЬ 1: НЕМЕДЛЕННЫЕ ДЕЙСТВИЯ (дни 1-3)

### ✅ Действие 1: npm-имена зарезервированы (ВЫПОЛНЕНО 2026-03-30)
Все 50 пакетов опубликованы. Полный список:

**Из оригинального плана (10):**
1. `@theyahia/yookassa-mcp` — YooKassa payment API
2. `@theyahia/moysklad-mcp` — МойСклад inventory API
3. `@theyahia/cdek-mcp` — СДЭК delivery API
4. `@theyahia/ozon-mcp` — Ozon Seller API
5. `@theyahia/amocrm-mcp` — amoCRM API
6. `@theyahia/cbr-mcp` — Central Bank of Russia API
7. `@theyahia/hh-mcp` — hh.ru jobs API
8. `@theyahia/yandex-metrika-mcp` — Yandex Metrika API
9. `@theyahia/unisender-mcp` — Unisender email/SMS API
10. `@theyahia/kontur-focus-mcp` — Kontur.Focus counterparty API

**Из скоринговой таблицы (40):**
11. `@theyahia/wildberries-mcp` — Wildberries Seller API
12. `@theyahia/yandex-direct-mcp` — Yandex Direct advertising API
13. `@theyahia/vk-mcp` — VK API
14. `@theyahia/gigachat-mcp` — GigaChat (Sber) AI API
15. `@theyahia/yandexgpt-mcp` — YandexGPT API
16. `@theyahia/yandex-market-mcp` — Yandex Market API
17. `@theyahia/getcourse-mcp` — GetCourse online school API
18. `@theyahia/retailcrm-mcp` — RetailCRM API
19. `@theyahia/mts-exolve-mcp` — MTS Exolve communications API
20. `@theyahia/tkassa-mcp` — T-Kassa (Tinkoff) payment API
21. `@theyahia/sms-ru-mcp` — SMS.ru API
22. `@theyahia/sendpulse-mcp` — SendPulse email/SMS API
23. `@theyahia/yandex-webmaster-mcp` — Yandex Webmaster API
24. `@theyahia/kaiten-mcp` — Kaiten project management API
25. `@theyahia/huntflow-mcp` — HuntFlow recruiting API
26. `@theyahia/robokassa-mcp` — Robokassa payment API
27. `@theyahia/salutespeech-mcp` — SaluteSpeech (Sber) API
28. `@theyahia/yandex-speechkit-mcp` — Yandex SpeechKit API
29. `@theyahia/travelpayouts-mcp` — Travelpayouts affiliate API
30. `@theyahia/kaspi-mcp` — Kaspi.kz API
31. `@theyahia/boxberry-mcp` — Boxberry delivery API
32. `@theyahia/cloudpayments-mcp` — CloudPayments API
33. `@theyahia/delovye-linii-mcp` — Delovye Linii delivery API
34. `@theyahia/sber-mcp` — Sber API
35. `@theyahia/bitrix24-mcp` — Bitrix24 CRM API
36. `@theyahia/voximplant-mcp` — Voximplant communications API
37. `@theyahia/superjob-mcp` — SuperJob jobs API
38. `@theyahia/insales-mcp` — InSales e-commerce API
39. `@theyahia/megaplan-mcp` — Megaplan CRM API
40. `@theyahia/planfix-mcp` — Planfix project management API
41. `@theyahia/elma365-mcp` — ELMA365 BPM API
42. `@theyahia/tilda-mcp` — Tilda website builder API
43. `@theyahia/jivosite-mcp` — JivoSite chat API
44. `@theyahia/mindbox-mcp` — Mindbox CDP API
45. `@theyahia/chestnyznak-mcp` — Chestniy ZNAK marking API
46. `@theyahia/roistat-mcp` — Roistat analytics API
47. `@theyahia/calltouch-mcp` — Calltouch call tracking API
48. `@theyahia/mango-office-mcp` — Mango Office telephony API
49. `@theyahia/1c-rest-mcp` — 1C REST API
50. `@theyahia/pochta-russia-mcp` — Pochta Russia API

---

### 🟡 Действие 2: Регистрация на площадках (ЧАСТИЧНО ВЫПОЛНЕНО)

> ⚠️ **DaData** уже запустила официальный MCP на `https://dadata.ru/mcp/`.
> Наш dadata-mcp позиционируется как: локальная npm-альтернатива с 31 tool vs ~4.

#### Каталоги — текущий статус (обновлено 2026-03-31)

| # | Площадка | Статус |
|---|----------|--------|
| 1 | **Official MCP Registry** | ✅ 47/47 — mcp-publisher |
| 2 | **LobeHub** | ✅ 47/47 — PR#3-6 + PR#8 |
| 3 | **cline/mcp-marketplace** | ✅ 47/47 — Issues #1118-#1179 |
| 4 | **Glama.ai** | ✅ 47/47 — авто из npm |
| 5 | **PulseMCP** | ✅ 47/47 — авто из Registry |
| 6 | **VS Code** | ✅ 47/47 — авто из npm |
| 7 | **n8n** | ✅ 47/47 — авто из npm |
| 8 | **mcp.so** | ⬜ 1/47 — руками |
| 9 | **cursor.directory** | ⬜ 1/47 — руками |
| 10 | **Smithery** | ⬜ 0/47 — нужен Streamable HTTP |
| 11 | **mcpservers.org** | ⬜ 0/47 — руками |

> **GitHub Topics:** ✅ проставлены на всех 48 репо
> **mcpName:** ✅ добавлен во все package.json

---

### Действие 3: Открыть р/с + реферальные (бонус, НЕ основной доход)

> ⚠️ **БЛОКЕР:** Нужен расчётный счёт ИП. ИП есть, счёт нужно открыть.
> **Рекомендация (RESEARCH_05): Точка** — бесплатный старт, вывод до 400K₽ без комиссии.
> **НЕ Тинькофф** — самый агрессивный по 115-ФЗ.
> **RESEARCH_06:** реферальные = бонус (2-30K₽/мес), не стратегия. Основной доход — MCPize + consulting.

| Сервис | Ссылка | Условия |
|--------|--------|---------|
| **amoCRM** | https://www.amostart.ru | До **50%** от лицензий |
| **RetailCRM** | retailcrm.services | До **50%** от платежей |
| **Unisender** | https://affiliate.unisender.com | **50%** первый, **25%** повторные |
| **Roistat** | roistat.com/partners | **25-50%** (ИП = 50%) |
| **МойСклад** | https://partners.moysklad.ru | **25-40%** recurring 12 мес (RESEARCH_02) |
| **DaData** | https://dadata.ru/referral/ | **30%** от выручки |
| **ЮKassa** | https://promo.yookassa.ru/agents | Revenue share |
| **Calltouch** | calltouch.ru/partners | **15%** пожизненно |
| **CloudPayments** | https://cloudpayments.ru/agents | **0.1-0.3%** от оборота |
| **СДЭК** | https://cdek.promo/partner | Фиксированная за лиды |

---

### ✅ Действие 4: README dadata-mcp обновлён (ВЫПОЛНЕНО 2026-03-30)

### ✅ Действие 5: Репо-витрина russian-mcp создана (ВЫПОЛНЕНО 2026-03-30)

---

## ЧАСТЬ 2: СКОРИНГ И ПРИОРИТИЗАЦИЯ

**Критерии (1-10):** А — аудитория, К — качество API, Конк — конкуренция (10 = никого), С — простота, В — виральность, М — монетизация, Син — синергия.

| # | Сервис | А | К | Конк | С | В | М | Син | Σ |
|---|--------|---|---|------|---|---|---|-----|---|
| 1 | ЮKassa | 9 | 10 | 10 | 8 | 9 | 8 | 10 | **64** |
| 2 | Ozon Seller | 10 | 9 | 10 | 7 | 10 | 6 | 9 | **61** |
| 3 | МойСклад | 9 | 10 | 10 | 8 | 7 | 7 | 10 | **61** |
| 4 | amoCRM | 8 | 8 | **3** | 7 | 8 | 9 | 8 | **51** ⚠️ конкурент caiborg-ai (36 tools) |
| 5 | СДЭК | 8 | 9 | 10 | 7 | 7 | 5 | 9 | **55** |
| 6 | Wildberries | 10 | 8 | 5 | 7 | 10 | 5 | 9 | **54** |
| 7 | Яндекс.Метрика | 10 | 8 | 10 | 7 | 8 | 4 | 6 | **53** |
| 8 | Яндекс.Директ | 9 | 8 | 10 | 6 | 9 | 5 | 6 | **53** |
| 9 | Контур.Фокус | 8 | 8 | 10 | 8 | 5 | 5 | 9 | **53** |
| 10 | Яндекс.Маркет | 8 | 8 | 10 | 7 | 7 | 4 | 8 | **52** |
| 11-50 | *(остальные 40 сервисов)* | — | — | — | — | — | — | — | 37-51 |

> **Фазы идут по стратегической логике, не по скорингу:**
> Фаза 1 (ЦБ) = quick win → Фаза 2 (ЮKassa) = монетизация → Фазы 3-4 (МойСклад+СДЭК) = e-commerce стек → Фаза 5 (Ozon) = аудитория

---

## ЧАСТЬ 3: ФАЗЫ РАЗРАБОТКИ

### ФАЗА 1 — ЦБ РФ MCP ✅ (ВЫПОЛНЕНО)

5 tools: get_daily_rates, get_currency_rate, get_key_rate, get_precious_metals, convert_currency

---

### ФАЗА 2 — ЮKassa MCP ✅ (ВЫПОЛНЕНО)

10 tools: create_payment, get_payment, capture_payment, cancel_payment, list_payments, create_refund, get_refund, list_refunds, create_receipt, get_balance

---

> **ОБНОВЛЕНИЕ 2026-03-31:** Все 47 серверов имеют реальный код (src/, tools/, client.ts).
> Фазы ниже содержат промпты для **доработки** существующих серверов.
>
> **ПРИОРИТЕТ (по RESEARCH_06):** Только 3 сервера довести до production:
> 1. **DaData** (Фаза — уже v1.0.5, 31 tool, лучший на рынке) — тесты + Streamable HTTP
> 2. **МойСклад** (Фаза 3) — тесты + Streamable HTTP + docs
> 3. **СДЭК** (Фаза 4) — тесты + Streamable HTTP + docs
>
> Остальные фазы (5-10) — **отложены**. Промпты сохранены как справочник.

---

### ФАЗА 3 — МойСклад MCP ✅ (код есть, нужна доработка)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/moysklad-mcp для МойСклад JSON API 1.2.

Референс: github.com/theYahia/dadata-mcp для паттернов.
Документация API: https://dev.moysklad.ru/doc/api/remap/1.2/

АВТОРИЗАЦИЯ:
- HTTP Basic Auth: MOYSKLAD_LOGIN (env) и MOYSKLAD_PASSWORD (env)
- Альтернатива: Bearer token MOYSKLAD_TOKEN (env) — если задан, использовать его
- Base URL: https://api.moysklad.ru/api/remap/1.2/
- Content-Type: application/json;charset=utf-8
- Таймаут: 15 секунд
- Rate limit: 45 запросов в 3 секунды — добавить throttling

10 TOOLS:

1. search_products — GET /entity/product?search={query}
2. get_product — GET /entity/product/{id}
3. create_product — POST /entity/product
4. get_stock — GET /report/stock/all
5. update_prices — POST /entity/product/{id}
6. get_counterparties — GET /entity/counterparty?search={query}
7. create_customer_order — POST /entity/customerorder
8. get_orders — GET /entity/customerorder
9. get_profit_report — GET /report/profit/byproduct
10. create_supply — POST /entity/supply

ВАЖНО: МойСклад хранит цены в КОПЕЙКАХ (×100). В ответах показывай в РУБЛЯХ.

Структура: src/index.ts, client.ts, types.ts, tools/products.ts, tools/orders.ts, tools/reports.ts

README: установка для Claude Desktop/Code/VS Code/Cursor/Windsurf, E-commerce стек,
ссылка на partners.moysklad.ru, раздел серии.

npm install && npm run build → npm publish --access public
```

---

### ФАЗА 4 — СДЭК MCP ✅ (код есть, нужна доработка)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/cdek-mcp для СДЭК API v2.

Документация: https://apidoc.cdek.ru/
Sandbox: https://api.edu.cdek.ru/v2/

АВТОРИЗАЦИЯ — OAuth 2.0 Client Credentials:
- Token endpoint: POST https://api.cdek.ru/v2/oauth/token
- CDEK_CLIENT_ID, CDEK_CLIENT_SECRET (env)
- CDEK_SANDBOX: "true" (env, optional) → тестовый endpoint
- Токен: 3600 сек, кешировать, обновлять за 60 сек до истечения

8 TOOLS:

1. calculate_tariff — POST /calculator/tariff
2. create_order — POST /orders
3. get_order — GET /orders/{uuid}
4. track_shipment — GET /orders?cdek_number={number}
5. list_delivery_points — GET /deliverypoints
6. get_cities — GET /location/cities
7. generate_barcode — POST /orders/{uuid}/barcode
8. delete_order — DELETE /orders/{uuid}

TokenManager class: получение, кеширование, авто-обновление Bearer.

README: sandbox режим, E-commerce стек, ссылка cdek.promo/partner, раздел серии.

npm install && npm run build → npm publish --access public
```

---

### ФАЗА 5 — Ozon Seller MCP ✅ (код есть, нужна доработка)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/ozon-mcp для Ozon Seller API.

Документация: https://docs.ozon.ru/api/seller/

АВТОРИЗАЦИЯ:
- Client-Id: OZON_CLIENT_ID (env), Api-Key: OZON_API_KEY (env)
- Base URL: https://api-seller.ozon.ru/
- Все запросы POST с JSON. Rate limit: 100 req/min на метод.

12 TOOLS:

1. list_products — POST /v3/product/list (RESEARCH_01: v2 выключен!)
2. get_product — POST /v3/product/info/list (RESEARCH_01: v2 выключен!)
3. create_product — POST /v3/product/import (RESEARCH_01: v3)
4. update_stocks — POST /v1/product/import/stocks
5. update_prices — POST /v1/product/import/prices
6. get_categories — POST /v2/category/tree
7. get_orders — POST /v3/posting/fbs/list
8. get_order — POST /v3/posting/fbs/get
9. get_analytics — POST /v1/analytics/data
10. get_finance_report — POST /v3/finance/transaction/list
11. list_returns — POST /v3/returns/company/fbs
12. get_fbo_shipments — POST /v2/posting/fbo/list

"500 000 продавцов. Первый MCP-сервер для Ozon Seller API."

npm install && npm run build → npm publish --access public
```

---

### ФАЗА 6 — amoCRM MCP ✅ (код есть, нужна доработка)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/amocrm-mcp для amoCRM REST API v4.

Документация: https://www.amocrm.ru/developers/content/crm_platform/api-reference

АВТОРИЗАЦИЯ — OAuth 2.0:
- AMOCRM_DOMAIN, AMOCRM_ACCESS_TOKEN, AMOCRM_REFRESH_TOKEN (env)
- AMOCRM_CLIENT_ID, AMOCRM_CLIENT_SECRET (env)
- Base URL: https://{AMOCRM_DOMAIN}/api/v4/
- TokenManager: авто-обновление при 401

10 TOOLS:

1. get_leads — GET /leads
2. create_lead — POST /leads
3. update_lead — PATCH /leads/{id}
4. get_contacts — GET /contacts
5. create_contact — POST /contacts
6. get_companies — GET /companies
7. get_pipelines — GET /leads/pipelines
8. create_task — POST /tasks
9. add_note — POST /{entity_type}/{id}/notes
10. search — глобальный поиск по всем сущностям

Killer usecase: dadata-mcp + amocrm-mcp — автообогащение лида по ИНН.
Ссылка amostart.ru (партнёрка до 50%).

npm install && npm run build → npm publish --access public
```

---

### ФАЗА 7 — hh.ru MCP ✅ (ВЫПОЛНЕНО)

8 tools: search_vacancies, get_vacancy, search_resumes, get_resume, get_salary_statistics, get_employers, get_areas, get_professional_roles

---

### ФАЗА 8 — Яндекс.Метрика MCP ✅ (код есть, нужна доработка)

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/yandex-metrika-mcp для Яндекс.Метрика API.

Документация: https://yandex.ru/dev/metrika/ru/

АВТОРИЗАЦИЯ:
- Bearer token: YANDEX_METRIKA_TOKEN (env)
- Base URL: https://api-metrika.yandex.net/

6 TOOLS:

1. get_counters — GET /management/v1/counters
2. get_report — GET /stat/v1/data (произвольный отчёт)
3. get_goals — GET /management/v1/counter/{id}/goals
4. export_logs — POST/GET Logs API
5. get_visitors_overview — сводка показателей
6. get_sources — отчёт по источникам трафика

Инструкция получения токена: oauth.yandex.ru

npm install && npm run build → npm publish --access public
```

---

### ФАЗА 9 — Wildberries MCP ✅ (код есть, нужна доработка) ← НОВОЕ из Compass

**ПРОМПТ ДЛЯ CLAUDE CODE — копировать целиком:**

```
Создай MCP-сервер @theyahia/wildberries-mcp для Wildberries API.

Документация: https://openapi.wildberries.ru/

АВТОРИЗАЦИЯ:
- JWT-токен (180 дней): WB_API_TOKEN (env)
- Base URL: https://suppliers-api.wildberries.ru/
- Rate limit: 300 req/min (token bucket), интервал 200мс
- КРИТИЧНО: ошибка 409 = штраф 5-10 запросов. Парсить X-Ratelimit-Remaining, X-Ratelimit-Retry.

12 TOOLS:

1. list_products — GET /content/v2/get/cards/list
2. get_product — POST /content/v2/get/cards/detail
3. update_prices — POST /api/v2/upload/task
4. update_stocks — PUT /api/v3/stocks/{warehouseId}
5. get_orders — GET /api/v3/orders
6. get_new_orders — GET /api/v3/orders/new
7. get_sales — GET /api/v1/supplier/sales
8. get_warehouses — GET /api/v3/offices
9. get_supply — GET /api/v3/supplies
10. create_supply — POST /api/v3/supplies
11. get_statistics — GET /api/v1/supplier/reportDetailByPeriod
12. get_feedbacks — GET /api/v1/feedbacks

Rate limiter с учётом штрафа за 409, npm пакет bottleneck.
Лучший в категории: полное покрытие + production-grade rate limiting.

npm install && npm run build → npm publish --access public
```

---

### ФАЗА 10 — Yandex Market MCP ✅ (код есть, нужна доработка) ← НОВОЕ из Compass

```
Создай MCP-сервер @theyahia/yandex-market-mcp для Yandex Market Partner API.

Документация: OpenAPI на GitHub (yandex-market/yandex-market-partner-api)

АВТОРИЗАЦИЯ:
- API-Key в заголовке: YM_API_KEY (env)
- Push Notifications API для real-time событий

10 TOOLS: products, orders, prices, stocks, analytics, campaigns, offers, returns, shipments, warehouses.

npm install && npm run build → npm publish --access public
```

---

## ЧАСТЬ 4: ТЕХНИЧЕСКАЯ ИНФРАСТРУКТУРА

### Общая архитектура — для всех MCP

```
Правила для всех MCP серии @theyahia:

1. TypeScript + @modelcontextprotocol/sdk
2. Все параметры tools через Zod схемы
3. Все логи — stderr, stdout — только JSON-RPC
4. HTTP клиент: таймаут 10-15 сек, retry 3 раза с exponential backoff на 429/5xx
5. Ошибки API — читаемые сообщения на русском для AI-агента
6. Env vars — единственный способ передать credentials
7. bin в package.json для запуска через npx
8. README: Claude Desktop + Claude Code + VS Code/Cursor + Windsurf
9. Раздел "Часть серии" в конце каждого README
10. MIT лицензия
11. .mcp.json в корне репо (для cursor.directory)
12. mcpName в package.json (для Official MCP Registry)
13. .claude/skills/ — готовые сценарии (slash-команды)
14. После npm publish → ОБЯЗАТЕЛЬНО подать на площадки
```

### ~~Монорепозиторий Turborepo + pnpm~~ (ОТЛОЖЕНО)

> **RESEARCH_06:** Не приоритет. Сначала 3 production-grade сервера + контент.
> Монорепа имеет смысл когда нужно поддерживать 10+ серверов в production. Сейчас — 3.
> Сохранено как справочник на будущее.

### Streamable HTTP (из Compass)

> **Приоритет: высокий, срок: 10 дней**

- Единственный стандартный remote-транспорт в MCP spec 2025-03-26
- Один endpoint `/mcp`, POST для JSON-RPC, GET для SSE, `Mcp-Session-Id`
- TypeScript SDK v1.10.0+ поддерживает нативно
- Нужен для: Smithery, OpenAI Agents SDK, Cloudflare Workers, Azure Container Apps
- Реализация в `@theyahia/mcp-base`, все серверы наследуют

### ~~Docker~~ и ~~CLI установщик~~ (ОТЛОЖЕНО)

> Не приоритет до появления реальных пользователей. Сохранено как справочник.

---

## ЧАСТЬ 5: E-COMMERCE СТЕК (обновлено по RESEARCH_01)

> **Вердикт: ДА, но как инструмент ad-hoc операций, НЕ real-time синхронизации.**
> Конкуренты (МойСклад плагины, TopSeller, RetailCRM) берут 3-15K₽/мес, но ни один не даёт AI-native управление.

### Что РАБОТАЕТ через MCP

| Сценарий | Реально? | Пример |
|----------|----------|--------|
| Обновить цены на всех площадках | ✅ Да | "Подними цены на 10% в категории Электроника" |
| Проверить остатки < 5 шт | ✅ Да | "Покажи товары с минимальным остатком" |
| Аналитика за период | ✅ Да | "Общая выручка за март по всем площадкам" |
| Добавить товар на все площадки | ⚠️ Частично | Разные форматы карточек, обязательные поля |
| Обработка нового заказа | ⚠️ Частично | Цепочка из 4+ tool calls |
| Ежедневная синхронизация | ❌ Нет | MCP не поддерживает cron/scheduling |

### Технические ограничения (из RESEARCH_01)

- **Ozon API нестабилен** — депрекации каждые 2-4 месяца, удаляют поля без смены версии
- **WB rate limits со штрафами** — ошибка 409 = 5-10 запросов штрафа
- **Нет shared state** между 7 MCP-серверами
- **Нет транзакций** — partial failure при обновлении 3 площадок

### Архитектура

```
МойСклад (ERP, копейки)  ←→  Ozon (строки в рублях)
                          ←→  WB (OpenAPI YAML, 13 категорий токенов)
                          ←→  YM (OpenAPI на GitHub)

СДЭК (OAuth 2.0, sandbox) → DaData (валидация адреса) → ЮKassa (оплата)
```

### План: документация + примеры (НЕ мета-пакет)

> **Приоритет: средний, срок: 7 дней** — README с 6 конкретными сценариями, не мета-пакет.

---

## ЧАСТЬ 6: КОНТЕНТ-СТРАТЕГИЯ

### Русскоязычные медиа

| Площадка | Аудитория | Формат | Приоритет |
|----------|-----------|--------|-----------|
| **Habr.com** | 10M+/мес | Техническая статья | 🔴 Высший |
| **vc.ru** | 21M+/мес | Бизнес-статья (AI) | 🔴 Высокий |
| **proglib.io** | Крупный | Guest article | 🟡 Средний |
| **tproger.ru** | Крупный | Статья/новость | 🟡 Средний |

### Telegram-каналы

| Канал | Подписчики | Когда постить |
|-------|------------|---------------|
| **@pro_mcp** | — | Каждый новый MCP |
| **@llm_under_hood** | 15-30K | Ключевые релизы |
| **@neurohive** | 30-50K | Ключевые релизы |
| **@ai_machinelearning_big_data** | 50K+ | Обзорные статьи |
| **@techsparks** | 50K+ | E-commerce стек |
| **@ai_newz** | 50K+ | Новости серии |
| **@n8n_ru** | — | После n8n-интеграции |
| **@ozon_sellers_chat** | — | После Ozon MCP |
| **@amocrm_developers** | — | После amoCRM MCP |

### Международные площадки

| Площадка | Формат | Приоритет |
|----------|--------|-----------|
| **Hacker News** | Show HN: 47 MCP Servers for Russian APIs | ~~🔴~~ 🟡 Средний (RESEARCH_06: не попадёт в топ HN) |
| **Product Hunt** | Запуск (вт/ср, 12:01 AM PT) | ~~🔴~~ 🟡 Средний (RESEARCH_06: kill list) |
| **Reddit r/ClaudeAI** | I built 47 MCP Servers for Russian APIs | 🔴 Высокий |
| **Reddit r/LocalLLaMA** | Технический пост | 🔴 Высокий |
| **Discord MCP Community** | Showcase (11.8K) | 🔴 Высокий |
| **Discord Claude** | Showcase (77K) | 🔴 Высокий |
| **Twitter/X** | Тред + #MCP #ClaudeAI | 🔴 Высокий |
| **dev.to** | Туториал (#ai #mcp #showdev) | 🟡 Средний |
| **LinkedIn** | B2B статья | 🟡 Средний |

### Habr-статьи — расписание

| После фазы | Заголовок | Ожидаемые просмотры |
|-----------|-----------|---------------------|
| Фаза 1 (ЦБ) | «ЦБ РФ + AI: курсы валют в Claude за вечер» | 2-5K |
| Фаза 2 (ЮKassa) | «ЮKassa MCP: AI-агент принимает платежи и формирует чеки 54-ФЗ» | 5-10K |
| Фаза 3-4 (МойСклад+СДЭК) | «E-commerce стек: 4 MCP-сервера которые работают вместе» | 8-15K |
| Фаза 5 (Ozon) | «500K продавцов, 0 MCP: первый AI-интерфейс для Ozon Seller API» | 10-20K |
| Фаза 6 (amoCRM) | «amoCRM + dadata-mcp: AI создаёт контакт по ИНН» | 5-10K |
| Середина | «2 месяца, 10+ MCP, X установок: итоги» | 8-15K |

### ~~Product Hunt — правила запуска~~ (ОТЛОЖЕНО по RESEARCH_06)

> **RESEARCH_06:** «Прекрати думать о координированном HN+PH запуске. Хабр — твоя площадка.»
> MCP-серверы для российских API не попадут в топ HN/PH. Сохранено как справочник на будущее.

### Собственный Telegram-канал «MCP Россия» (из Compass)

> **Discord заблокирован в РФ с октября 2024.** Telegram — единственная платформа.

- Контент: 2-3 поста/неделю (релизы, туториалы, новости MCP)
- Траектория: 0→100 (личная сеть) → 100→500 (кросс-посты) → 500→1000 (органика)
- Каналы от 1000 подписчиков: **50% дохода от Telegram Ads**

---

## ЧАСТЬ 7: МОНЕТИЗАЦИЯ (обновлено по RESEARCH_02 + RESEARCH_06)

> **RESEARCH_06 опроверг реферальную модель.** Люди, ставящие MCP для amoCRM, уже пользуются amoCRM.
> Реальный реферальный доход: **2 000-30 000₽/мес**, не 150-450K.
> **Единственная проверенная модель монетизации MCP — прямая оплата** (21st.dev: $10K MRR за 6 недель, freemium).

### Приоритет #1: Прямая монетизация через MCPize

- MCPize.com: **85% revenue share**
- Модель: 5-10 бесплатных запросов → подписка $5-9/мес
- Опубликовать DaData, МойСклад, СДЭК на MCPize
- **Ожидаемый доход: $10-50/мес на старте**, масштабируется с пользователями

### Приоритет #2: Consulting leads от контента

- Хабр-статьи → входящие запросы на разработку MCP
- Позиционирование: "MCP-эксперт для русского рынка"
- Цены: **100-300K₽/проект** за кастомную разработку MCP для компаний
- **Вероятность: 40-50%** (по RESEARCH_06)

### Приоритет #3: Реферальные (бонус, не стратегия)

Зарегистрироваться параллельно в 3-5 программах (DaData 30%, МойСклад 25-40%, Calltouch 15%), но не ждать дохода от этого.

### Банк для ИП (по RESEARCH_05)

**Рекомендация: Точка** — бесплатный старт, вывод до 400K₽ без комиссии, бесплатные платежи юрлицам, встроенная бухгалтерия УСН 6%. Т-Банк НЕ рекомендуется.

---

## ЧАСТЬ 8: ПАРТНЁРСТВА

### Путь к официальному партнёрству

Стандарт: качественная интеграция → маркетплейс сервиса → заявка на технологическое партнёрство → рекомендованный интегратор.

**Действие:** Написать tech-командам (приоритет высокий, срок 5 дней):
- **DaData**: https://dadata.ru/referral/
- **ЮKassa**: agents@yoomoney.ru
- **МойСклад**: partners@moysklad.ru
- **amoCRM**: https://amostart.ru/

Pitch: «Мы создали MCP-сервер для вашего API с X tools, это позволяет вашим клиентам работать через Claude/Cursor. Готовы стать технологическим партнёром.»

### Попадание в рекомендации Anthropic

- **MCP Directory** (anthropic.com/partners/mcp): требуется OAuth, MCP Directory Terms
- **Community servers** в github.com/modelcontextprotocol/servers: PR 5-10 лучших серверов

---

## ЧАСТЬ 9: МЕЖДУНАРОДНАЯ ЭКСПАНСИЯ (ОТЛОЖЕНО — месяц 2-3)

> **RESEARCH_06:** «Сначала докажи модель дома. Застолби территорию, но не инвестируй 28+31 день.»
> **Планы готовы:** V4/KZ/IMPLEMENTATION_PLAN_KZ.md, V4/UZ/IMPLEMENTATION_PLAN_UZ.md
> **Сейчас:** только kaspi-mcp (базовый, 5-10 tools) как first-mover claim на неделе 3.

### Казахстан — отложен до месяца 2 (RESEARCH_03)

**0 MCP-серверов, 25+ API с документацией, 2026 = "Год цифровизации и AI"**

| # | Сервер | Дней | Ключевая ценность |
|---|--------|------|-------------------|
| 1 | `nbk-mcp` | 1 | Quick win — курсы валют, без авторизации |
| 2 | `kaspi-merchant-mcp` | 4 | 721K продавцов, JSON:API |
| 3 | `2gis-mcp` | 3 | 17 городов КЗ, rich geo/search API |
| 4 | `halyk-epay-mcp` | 4 | Лучшая документация + полный sandbox |
| 5 | `data-egov-kz-mcp` | 2 | 3000+ датасетов |
| 6-10 | webkassa, forte, freedompay, kazpost, satu.kz | 14 | Фискализация, платежи, логистика, маркетплейс |

**Итого: 10 серверов, ~28 дней. Промпты и детали → V4/KZ/IMPLEMENTATION_PLAN_KZ.md**

Продвижение: Telegram @workitkz (29.8K), @bluescreenkz (24.5K), @thetechkz (22.9K). Конференции: AI Bridge 2026, GITEX AI Central Asia (май 2026).

### Узбекистан — отложен до месяца 3 (RESEARCH_04)

**0 MCP-серверов, рост цифровых платежей 31% CAGR, с 01.04.2026 обязательный безнал >25M сум**

| # | Сервер | Дней | Ключевая ценность |
|---|--------|------|-------------------|
| 1 | `cbu-mcp` | 1 | Quick win — курсы валют, JSON API |
| 2 | `payme-mcp` | 4 | Главная платёжная система, полный sandbox |
| 3 | `click-mcp` | 4 | REST API, двуязычная документация |
| 4 | `eskiz-mcp` | 2 | Доминирующий SMS, критический пробел в npm |
| 5 | `uzum-merchant-mcp` | 3 | Самый современный developer portal |
| 6-10 | uzum-market, oson, playmobile, data.gov.uz, efaktura | 17 | Маркетплейс, SMS, данные, фискализация |

**Итого: 10 серверов, ~31 день. Промпты и детали → V4/UZ/IMPLEMENTATION_PLAN_UZ.md**

**Коллаборация с PayTechUZ** — unified payment library (Payme+Click+Uzum+Paynet). Не конкурировать, а дополнять: PayTechUZ = SDK, наши MCP = AI-интерфейс.

### Бренд-стратегия

Единый бренд `@theyahia` → `@theyahia/{service}-mcp`. README на русском (основной язык dev-сообщества КЗ и УЗ).

---

## ЧАСТЬ 10: ДОРОЖНАЯ КАРТА (по RESEARCH_06)

### Неделя 1 (дни 1-7): Инфраструктура + Глубина

| День | Действие | Статус |
|------|----------|--------|
| 1 | Открыть р/с ИП (Точка, онлайн) | ⬜ |
| 1 | Выбрать 3 сервера: **DaData, МойСклад, СДЭК** | ⬜ |
| 1-2 | Тесты для DaData MCP | ⬜ |
| 2 | Streamable HTTP для DaData (нужен для Smithery) | ⬜ |
| 2 | README DaData: GIF-демо, getting started | ⬜ |
| 3 | Тесты + Streamable HTTP для МойСклад и СДЭК | ⬜ |
| 3 | Зарегистрироваться в рефках DaData (30%) и МойСклад (25-40%) | ⬜ |
| 3 | Опубликовать DaData на Smithery | ⬜ |
| 4 | Начать Хабр-статью: «47 MCP-серверов за 2 дня — вот что я понял» | ⬜ |
| 4 | Создать Telegram-канал | ⬜ |
| 5 | Допиши Хабр-статью. Подай все 47 на mcp.so | ⬜ |
| 6 | Лендинг (GitHub Pages). Проверь 3 сервера end-to-end | ⬜ |
| 7 | **ЗАПУСК:** Хабр утром + Reddit + Telegram + Twitter/X | ⬜ |

### Неделя 2 (дни 8-14): Контент + Дистрибуция

| День | Действие | Статус |
|------|----------|--------|
| 8-9 | Измерить результаты Хабра (просмотры, stars, downloads) | ⬜ |
| 9-10 | Вторая статья: «MCP для e-commerce: Ozon/WB/МойСклад через AI» | ⬜ |
| 10-11 | Подать DaData и МойСклад в маркетплейсы САМИХ сервисов | ⬜ |
| 11-12 | Отвечать в чатах/форумах где спрашивают про MCP + Россия | ⬜ |
| 13-14 | Smithery: МойСклад + СДЭК | ⬜ |

### Неделя 3 (дни 15-21): Монетизация + First-mover claims

| День | Действие | Статус |
|------|----------|--------|
| 15-17 | Freemium DaData MCP через MCPize (85% share) | ⬜ |
| 17-18 | Статья на dev.to (английская аудитория, портфолио) | ⬜ |
| 19-20 | Базовый kaspi-mcp (5-10 tools) — first-mover claim КЗ | ⬜ |
| 21 | Написать tech-командам DaData и МойСклад (партнёрство) | ⬜ |

### Неделя 4 (дни 22-30): Оценка + Решение

| День | Действие | Статус |
|------|----------|--------|
| 22-25 | Оценка метрик: npm downloads, stars, MCPize revenue, пользователи | ⬜ |
| 25-28 | **РАЗВИЛКА:** | ⬜ |
| | >500 установок, >5 активных пользователей → масштабируй контент + глубину | |
| | <100 установок → переключись на consulting-модель (портфолио + фриланс) | |
| 28-30 | Третья Хабр-статья или первый consulting pitch — по результатам | ⬜ |

### Месяц 2: по результатам развилки

**Если тяга есть (>200 downloads, активные пользователи):**
- Довести до production ещё 2-3 сервера
- Kaspi MCP полноценный (КЗ first-mover)
- Ещё 2 Хабр-статьи
- MCPize: добавить МойСклад и СДЭК

**Если тяги нет:**
- Фокус на consulting: использовать 47 серверов как портфолио
- Искать контракты на разработку MCP для компаний (100-300K₽/проект)
- Хабр-статья как lead generation

### Месяц 3: масштаб или pivot

**При успехе:** CIS-экспансия (КЗ: Kaspi, Halyk, 2GIS), больше контента, MCPize revenue
**При consulting:** 2-3 контракта, стабильный доход, MCP-серверы как побочный проект

### Цели первого месяца

| Метрика | Цель | Критично? |
|---------|------|-----------|
| GitHub stars (сумма) | 50+ | Нет |
| npm downloads (реальных) | 200+ | Да |
| Хабр-статьи | 2 | Да |
| Серверы с тестами + Streamable HTTP | 3 | Да |
| ИП + р/с | Открыто | Да |
| MCPize revenue | $10-50 | Нет |
| **Реальные пользователи** | **Хотя бы 1** | **Критично** |

---

## ЧЕКЛИСТ ПУБЛИКАЦИИ (копировать при каждом релизе)

### Обязательные файлы в репо

```
repo/
├── .mcp.json              ← cursor.directory
├── package.json           ← keywords, bin, mcpName
├── README.md              ← установка для всех IDE
└── ...
```

**Шаблон `.mcp.json`:**
```json
{
  "mcpServers": {
    "SERVICE_NAME": {
      "command": "npx",
      "args": ["-y", "@theyahia/SERVICE-mcp"],
      "env": {
        "SERVICE_API_KEY": "<YOUR_TOKEN>"
      }
    }
  }
}
```

**В package.json:**
```json
"mcpName": "io.github.theYahia/SERVICE-mcp",
"keywords": [
  "mcp", "mcp-server", "model-context-protocol", "modelcontextprotocol",
  "claude", "ai", "llm", "anthropic", "cursor", "ai-tools", "ai-agent",
  "russian-api", "SERVICE-SPECIFIC-KEYWORDS"
]
```

**GitHub Topics:** `mcp-server`, `mcp`, `model-context-protocol`, `claude`, `ai`, `llm`, `russian-api`, `SERVICE`

### 7 шагов после каждого npm publish

| Шаг | Действие | Автоматизация |
|-----|----------|---------------|
| 1 | `npm publish --access public` | CLI |
| 2 | cursor.directory → Scan repo | ❌ Руками |
| 3 | mcp.so/submit → форма | ❌ Руками |
| 4 | LobeHub → PR через Claude Code | ✅ Claude Code |
| 5 | Official MCP Registry → `mcp-publisher publish` | ✅ CLI |
| 6 | cline/mcp-marketplace → Issue через Claude Code | ✅ Claude Code |
| 7 | Обновить витрину + PLATFORM_TRACKER | ✅ Claude Code |

Плюс автоматически: Glama.ai, VS Code, n8n, PulseMCP (из Registry).

---

## МЕТРИКИ — проверять каждую пятницу (по RESEARCH_06)

| Метрика | Неделя 4 | Неделя 8 | Неделя 12 |
|---------|----------|----------|-----------|
| **Реальные пользователи** | **≥1** | **≥5** | **≥20** |
| Production-grade серверов | 3 | 5 | 5 |
| npm downloads/нед (реальных) | 200+ | 500+ | 1000+ |
| GitHub ★ (сумма) | 50+ | 150+ | 300+ |
| Хабр-статьи опубликовано | 2 | 4 | 6 |
| MCPize revenue ($/мес) | $10-50 | $50-200 | $200+ |
| Consulting leads | 0-1 | 2-3 | 5+ |
| Реферальный доход (₽/мес) | 0-2K | 2-10K | 10-30K |

> **Главная метрика: реальные пользователи.** Всё остальное — vanity metrics.

---

## SEO И npm ОПТИМИЗАЦИЯ

### Поисковые запросы с нулевой конкуренцией
- `mcp server for russian apis`
- `dadata address validation ai`
- `yookassa mcp integration`
- `claude [сервис] integration`
- `cursor [сервис] mcp`
- `mcp сервер яндекс метрика` (Yandex SEO)

### Домен russian-mcp.ru (из Compass)
- ~500₽/год, хостинг Vercel бесплатно
- Next.js, авто-генерация из npm-метаданных
- Двуязычная (RU + EN)
- SEO-ценность: нулевая конкуренция

### Лендинг GitHub Pages
```
theyahia.github.io/russian-mcp/
├── index.html       — каталог 47 серверов
├── /dadata-mcp/     — страница каждого
├── /blog/           — туториалы
└── catalog.json     — машиночитаемый каталог
```

---

## ВАЖНЫЕ ССЫЛКИ

### MCP-каталоги

| Ресурс | URL |
|--------|-----|
| Official MCP Registry | https://registry.modelcontextprotocol.io |
| Smithery | https://smithery.ai |
| mcp.so | https://mcp.so |
| PulseMCP | https://pulsemcp.com |
| Glama.ai | https://glama.ai/mcp/servers |
| cursor.directory | https://cursor.directory/plugins |
| LobeHub MCP | https://lobehub.com/mcp |
| Docker MCP | https://hub.docker.com/mcp |
| MCP Inspector | npx @modelcontextprotocol/inspector |
| MCP SDK docs | https://modelcontextprotocol.io |

### Awesome-списки

| Список | URL | Stars |
|--------|-----|-------|
| wong2/awesome-mcp-servers | github.com/wong2/awesome-mcp-servers | 40K+ |
| appcypher/awesome-mcp-servers | github.com/appcypher/awesome-mcp-servers | 10K+ |
| modelcontextprotocol/servers | github.com/modelcontextprotocol/servers | Офиц. |

### API-документации

| Сервис | URL |
|--------|-----|
| ЮKassa | https://yookassa.ru/developers/using-api/testing |
| СДЭК | https://api.edu.cdek.ru |
| МойСклад | https://dev.moysklad.ru |
| Ozon Seller | https://docs.ozon.ru/api/seller |
| amoCRM | https://www.amocrm.ru/developers |
| hh.ru | https://github.com/hhru/api |
| Яндекс.Метрика | https://yandex.ru/dev/metrika/ru |
| Wildberries | https://openapi.wildberries.ru |
| Yandex Market | github.com/yandex-market/yandex-market-partner-api |

### Сообщества

| Ресурс | Размер |
|--------|--------|
| Discord MCP Community | ~11.8K |
| Discord Claude (Anthropic) | ~77K |
| Reddit r/ClaudeAI | ~200K |
| Reddit r/LocalLLaMA | ~500K |

---

## ПРОЦЕСС РАЗРАБОТКИ НОВОГО MCP

> **ПРАВИЛО:** Перед кодом — ВСЕГДА план имплементации.

### Шаблон плана

```
## План: @theyahia/SERVICE-mcp

### 1. Исследование API
- [ ] Документация: [ссылка]
- [ ] Авторизация (Basic / OAuth / API Key / без)
- [ ] Base URL, rate limits, sandbox
- [ ] Конкуренты (существующие MCP)

### 2. Проектирование tools
- [ ] Таблица: tool → endpoint → params → returns
- [ ] Zod-схемы
- [ ] Маппинг tool → endpoint

### 3. Структура файлов
- [ ] src/index.ts, client.ts, types.ts
- [ ] src/tools/ — по группам
- [ ] .mcp.json, README.md, LICENSE

### 4. Имплементация
- [ ] client.ts — HTTP, авторизация, retry
- [ ] types.ts — TypeScript интерфейсы
- [ ] tools — по одному, с тестированием
- [ ] index.ts — регистрация

### 5. Тестирование
- [ ] npm run build — чистая сборка
- [ ] MCP Inspector
- [ ] Error handling

### 6. Публикация (чеклист 7 шагов)
```

---

*Этот план — живой документ. Обновлён по результатам 6 исследований (RESEARCH_00-06). 47 MCP с кодом, 3 в production-фокусе. Окно сужается каждую неделю. Главный вопрос через 30 дней: есть ли хоть один реальный пользователь?*
