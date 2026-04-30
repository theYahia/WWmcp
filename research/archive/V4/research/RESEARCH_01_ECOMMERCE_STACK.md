# Единый MCP e-commerce стек для российского рынка: полный технический анализ

**Стоит ли строить? Да, но с чётким пониманием границ.** MCP-стек из 7 серверов (ozon-mcp, wildberries-mcp, yandex-market-mcp, moysklad-mcp, cdek-mcp, dadata-mcp, yookassa-mcp) реализуем как инструмент **ad-hoc операций и мониторинга** — это первый в мире AI-native интерфейс к российскому e-commerce. Однако для mission-critical задач (real-time stock sync, автоматическая обработка заказов 24/7) MCP архитектурно не подходит: нет scheduling, нет транзакций, нет shared state. Оптимальная стратегия — **гибрид**: MCP для интерактивных операций + традиционный backend для автоматизации. Конкуренты (МойСклад плагины, TopSeller, RetailCRM) берут **₽3 000–₽15 000/мес**, но ни один не даёт AI-native управление маркетплейсами через natural language.

---

## БЛОК 1–8: Детальный технический анализ API и конкурентов

### Ozon Seller API: зрелый, но нестабильный

**Аутентификация** — статические `Client-Id` + `Api-Key` в headers каждого запроса. Все методы — **POST с JSON body**, даже list-операции. Base URL: `https://api-seller.ozon.ru`.

**OpenAPI/Swagger спецификация отсутствует** публично. Ozon использует внутренний Swagger (подтверждается auto-generated `ozon-api-client` на PyPI), но не публикует. Для MCP-сервера схемы endpoint'ов придётся определять вручную из документации или Postman-коллекции (community-maintained на postman.com).

**Rate limits (обновлено 24.02.2026)**:
- **30 000 product operations/min** — единый лимит на `/v3/product/import`, `/v1/product/import/prices`, `/v2/products/stocks`
- **Per-second глобальный лимит** существует (точное число не документировано — requires verification)
- `/v1/product/import/prices`: batch до **1 000 товаров** за запрос
- `/v2/products/stocks`: batch до **100 товаров**, `warehouse_id` **обязателен** для multi-warehouse
- **Performance API**: отдельный лимит **100 000 req/day** (host: `api-performance.ozon.ru`)
- При превышении: HTTP **429**, **атомарный reject** — если в запросе 1000 товаров, а лимит 500, отклоняется **весь** запрос. Тело ответа содержит `Retry after X seconds. Remaining Y items`
- Rate limit headers **анонсированы**, но ещё «в ближайшем будущем» (requires verification на март 2026)

**Формат цен — строки в рублях** (не копейки, не числа). Пример: `"price": "79990"` = 79 990₽. Это критично для конвертации из МойСклад (копейки).

**Webhooks поддерживаются** (push-уведомления): `TYPE_NEW_POSTING`, `TYPE_POSTING_CANCELLED`, `TYPE_STATE_CHANGED`, chat-события. Настраиваются в личном кабинете, Ozon шлёт POST на ваш endpoint.

**Актуальные версии endpoint'ов** (старые выключены ~февраль 2025):

| Операция | Актуальный endpoint | Deprecated |
|----------|-------------------|------------|
| Список товаров | `POST /v3/product/list` | v2 выключен |
| Инфо о товаре | `POST /v3/product/info/list` | v2 выключен |
| Цены (чтение) | `POST /v5/product/info/prices` | v4 deprecated |
| Остатки (чтение) | `POST /v4/product/info/stocks` | v3 deprecated |
| FBS заказы | `POST /v3/posting/fbs/list` | — |
| FBO заказы | `POST /v2/posting/fbo/list` | analytics.city/region пустые |
| Финансы | `POST /v3/finance/transaction/list` | — |
| Возвраты FBS | `POST /v3/returns/company/fbs` | v2 выключен |

**Sandbox отсутствует.** Официальная позиция Ozon: «Тестового нету, только боевой. Создайте тестовый ЛК.» Legacy sandbox `cb-api.ozonru.me` нестабилен.

**Стабильность API — умеренно нестабильный.** Депрекации каждые 2–4 месяца с 2-месячным notice. Ozon удаляет поля из стабильных методов без смены версии (например, `marketing_price` удалён из v3, `doc_amount` из `/v2/finance/realization`). Мониторинг обязателен через Telegram `@OzonSellerAPI`.

---

### Wildberries API: самый сложный из трёх маркетплейсов

**OpenAPI спецификации доступны** — отдельный YAML на каждую категорию API: `https://openapi.wildberries.ru/{category}/swagger/api/en/swagger.yaml`. Это огромное преимущество для генерации MCP-инструментов.

**Система токенов (обновлена октябрь 2025)** — **12 категорий** (не 13): Content, Analytics, Prices and Discounts, Marketplace, Statistics, Promotion, Feedbacks, Chat, Supplies, Returns, Documents, Finance. Плюс специальная категория Users (только Personal Access Token).

**4 типа токенов**: Base (`acc: 1`), Test (`acc: 2`, sandbox), Personal Access (`acc: 3`), Service (`acc: 4`). JWT формат, **180 дней** срок действия. Максимум ~20 токенов на аккаунт. Авто-ротации нет — нужен alert за ~30 дней до expiry.

**Rate limits — самые сложные из трёх платформ:**

| Категория | Period | Limit | Min interval | Burst | 409 Penalty |
|-----------|--------|-------|-------------|-------|-------------|
| Marketplace | 1 мин | **300 req** | **200ms** | 20 | **×5** |
| Content | 1 мин | **100 req** | 600ms | ~10 | requires verification |
| Prices | 6 сек | **10 req** | 600ms | ~2 | requires verification |
| FBS/DBS Orders | per account | varies | varies | varies | **×10** |

**КРИТИЧНО: механика 409-штрафа.** При получении HTTP 409, `X-Ratelimit-Remaining` уменьшается на **5** (Marketplace) или **10** (FBS/DBS Orders) вместо стандартной 1. Это не просто retry — это сжигание лимита. MCP-сервер обязан трекать remaining и полностью избегать 409.

**Rate limit headers**: `X-Ratelimit-Remaining` (все ответы кроме 429), `X-Ratelimit-Retry` (секунды до retry, только 429), `X-Ratelimit-Limit`, `X-Ratelimit-Reset`.

**Webhooks: НЕ ПОДДЕРЖИВАЮТСЯ.** WB API полностью pull-based. Новые заказы получаются только через polling `GET /api/v3/orders/new`. Это принципиальное отличие от Ozon и Yandex Market.

**Конкуренты MCP на GitHub:**
- **lyohadunker26/wildberries-mcp-server** — наиболее полный, npm-пакет, покрывает карточки, склады, заказы, цены, стикеры. Основной конкурент.
- **dmitriipolushin/wildberries-api-mcp-server** — 5 stars, 1 commit, только аналитика/промо. Низкое качество.
- **wb_smart_remaster** — только отзывы, не seller API.
- **Ozon MCP / Yandex Market MCP** — **не существуют**. Значительный gap в рынке.

**8+ отдельных API-доменов**: `content-api.wildberries.ru`, `marketplace-api.wildberries.ru`, `statistics-api.wildberries.ru`, `seller-analytics-api.wildberries.ru`, `discounts-prices-api.wildberries.ru`, `advert-api.wildberries.ru`, `finance-api.wildberries.ru`, `documents-api.wildberries.ru`.

---

### Yandex Market Partner API: лучшая документация из трёх

**Полный OpenAPI spec на GitHub**: `github.com/yandex-market/yandex-market-partner-api` (30 stars, BSD-3). YAML формат, совместим с OpenAPI Generator. Отдельный spec для Notification API.

**~80–150 endpoints** в 20+ категориях: Products, Prices, Stocks, Orders, Shipments FBS, DBS-delivery, Returns, Reports, Reviews, Q&A, Sales Boost, Quality Index, Chats, Warehouses, Reference books.

**Auth**: API-Key в header `Api-Key: <token>` (бессрочный, до 30 на кабинет). **OAuth 2.0 deprecated.** Гранулярные scopes: `inventory-and-order-processing`, `pricing`, `offers-and-cards-management`, `promotion`, `finance-and-accounting`, `communication`, `settings-management`, `all-methods`.

**Ключевые концепции:**
- **Business ID** = кабинет (один аккаунт, много магазинов)
- **Campaign ID** = конкретный магазин с одной моделью (FBY/FBS/DBS/Express)
- Путь: `POST v2/businesses/{businessId}/offer-mappings` (каталог), `PUT v2/campaigns/{campaignId}/offer-prices/updates` (цены)

**Rate limits:**
- **Макс. 2 параллельных запроса** на магазин/партнёра — HTTP **420** при превышении
- Per-resource лимиты (e.g., 10 000 points/day для `/regions/{regionId}`)
- Max body size: **512 KB**
- Headers: `X-RateLimit-Resource-Limit`, `X-RateLimit-Resource-Remaining`, `X-RateLimit-Resource-Until`

**Webhooks — лучшие из трёх платформ**: 13 типов событий включая создание/изменение/отмену заказа, возвраты, отзывы, чаты, споры. HTTPS обязателен. Retry: каждую минуту первый час → каждые 15 мин первый день → раз в час → **отключение через 14 дней** без ответа. Отдельный OpenAPI spec: `github.com/yandex-market/yandex-market-notification-api`.

**Sandbox**: нет отдельной среды, но есть система тестовых заказов в production с флагом `fake: true`. Данные хранятся 10 дней.

---

### МойСклад как центральный hub

**Rate limit подтверждён: 45 req / 3 sec = 15 req/sec.** Headers: `X-RateLimit-Limit: 45`, `X-RateLimit-Remaining`, `X-Lognex-Retry-TimeInterval: 3000`.

**Цены в копейках (integer ×100)** — подтверждено из кода и API-ответов. `"price": 10000.0` = 100.00₽. Конвертация для маркетплейсов:

| Маркетплейс | Формат | Конвертация из МойСклад |
|-------------|--------|------------------------|
| Ozon | String в рублях: `"1299"` | `String(msPrice / 100)` |
| Wildberries | Integer в рублях | `Math.round(msPrice / 100)` |
| Yandex Market | Float/Integer в рублях | `msPrice / 100` |

**Mapping товаров**: поле `article` (артикул) — естественный общий ключ. Custom fields (до 100 на entity) через `POST /entity/product/metadata/attributes`. Рекомендуемая схема: `article` = общий артикул, custom fields `ozon_offer_id`, `wb_nmId`, `ym_sku` для marketplace-специфичных ID. Поле `barcodes` (EAN13, GTIN) для универсального matching.

**Webhooks поддерживаются**: events `CREATE`/`UPDATE`/`DELETE` для products, orders, demands, payments, returns и др. Payload содержит meta (type, href, action) — фактические данные нужно дополучать через API. Header `X-Lognex-WebHook-Disable: true` позволяет подавить webhook при программных обновлениях.

**Маркетплейс приложений — 75% доля разработчика подтверждена.** С учётом НДС 22%: на подписку 1000₽/мес разработчик получает ~615₽. При включении в Реестр ПО (без НДС): 750₽. Модерация ~2 рабочих дня. Требуется ИП/юрлицо в РФ или СНГ.

**Существующие интеграции в каталоге МойСклад:**
- **MPsklad 3-в-1**: Ozon + WB + YM, sync **каждую 1 минуту** — фактический бенчмарк
- **Пакетная интеграция 2.0 (voInfo)**: 8 маркетплейсов, гибкая настройка
- **TopSeller Connect**: МойСклад↔маркетплейсы bridge

**Бесплатный тариф**: 0₽, до 5 пользователей, **100 товаров, 100 документов**, 50 MB. Custom fields **недоступны** на бесплатном. Для разработки: 14-дней trial на любом платном тарифе.

---

### СДЭК + DaData + ЮKassa

**СДЭК API v2**: OAuth 2.0 `client_credentials`, токен **3600 секунд** (1 час), **refresh token отсутствует** — просто перезапрашивать. Sandbox: `https://api.edu.cdek.ru/v2/`, тестовые credentials: `client_id: EMscd6r9JnFiQ3bLoyjJY6eM78JrJceI` (requires verification — СДЭК обновляет). Ключевые endpoints: `POST /v2/orders` (создание), `POST /v2/calculator/tarifflist` (расчёт), `GET /v2/deliverypoints` (ПВЗ), webhooks для статусов заказов.

**DaData: ~35+ сервисов** (больше заявленных 31). Для e-commerce критичны:
- **Стандартизация адресов** (`/clean/address`) — ФИАС/КЛАДР коды, почтовый индекс, координаты
- **DaData → СДЭК city_code** (`/findById/delivery`) — определяет `cdek_id` по КЛАДР-коду. **Это ключевой bridge между DaData и СДЭК**
- **ФИО парсинг** (`/clean/name`) — разделение, склонение, пол
- **Компания по ИНН** (`/findById/party`) — для B2B
- **Подсказки адресов** (`/suggest/address`) — autocomplete
- Free tier: **10 000 подсказок/день** бесплатно навсегда. Sandbox отсутствует — free plan = dev environment. Auth: `Authorization: Token <API_KEY>`.

**ЮKassa**: HTTP Basic Auth (`shopId:secretKey`). **Sandbox — demo-магазин** (до 20 штук), тестовые карты, тот же API. Payment flow: `POST /v3/payments` → redirect на `confirmation_url` → webhook `payment.succeeded`. Для привязки к МойСклад: `metadata` object (`"moysklad_order_id": "abc-123"`) — сохраняется на протяжении всего lifecycle. **54-ФЗ обязателен**: объект `receipt` в запросе создания платежа с `items[]`, `vat_code`, `customer` email/phone. ЮKassa может сама управлять онлайн-кассой (без покупки ККТ). OpenAPI spec доступен.

---

## Конкурентный ландшафт: кто уже решает эту задачу

Рынок чётко сегментирован на **интеграторы** (ApiMonster ₽1 390–₽24 990/мес, Альбато ₽990–₽11 990/мес), **ERP** (МойСклад бесплатно–₽8 800/мес, 1С:УТ от ₽22 600 единовременно), **CRM** (RetailCRM бесплатно–₽297 000/мес), **аналитика** (MPSTATS ₽4 800–₽29 990/мес, Sellmonitor от ₽3 500/мес). Ключевые находки:

- **EKAM закрыт** (29.07.2023) — gap для малого бизнеса
- **SellerBoard** — только Amazon, в РФ не работает
- **TopSeller** — сильнейший МойСклад↔маркетплейсы bridge, 5 маркетплейсов
- **MPsklad 3-в-1** — sync каждую минуту, ₽1 950+/мес за маркетплейс
- **RetailCRM** — user reviews отмечают **ненадёжный marketplace sync** (медленные обновления цен/остатков)

**Ни один конкурент не предлагает AI-native управление маркетплейсами.** AI-фичи ограничены генерацией текстов и авто-ответами на отзывы. MCP-стек — первый инструмент, позволяющий управлять e-commerce через natural language.

---

## 7 технических pitfalls, ранжированных по критичности

**1. Race conditions при синхронизации остатков (КРИТИЧНО).** Товар продаётся одновременно на Ozon и WB. Обе платформы списывают stock → overselling. Решение: **centralized master inventory** в МойСклад + **safety stock buffer** (показывать 80% реальных остатков на каждом маркетплейсе) + pessimistic locking на уровне БД. MCP архитектурно не поддерживает distributed transactions — это **самый опасный** pitfall.

**2. MCP не имеет scheduling (КРИТИЧНО для автоматизации).** Без cron нет периодической синхронизации. Workarounds: OS-level cron → MCP tool calls через CLI, n8n/Temporal workflow orchestrator, отдельный background service. Но это уже не «чистый MCP-стек».

**3. Отсутствие atomicity между серверами (ВЫСОКИЙ).** Обновили цену на Ozon, WB упал с 429 — состояние рассинхронизировано. Нужен saga pattern с compensating transactions.

**4. Product mapping между платформами (ВЫСОКИЙ).** Общий ключ: `article`/`offer_id`. Но Ozon использует `product_id` + `offer_id`, WB — `nmId`/`imtId`, YM — `offerId` + `shopSku`. Нужна mapping table (МойСклад custom fields или внешняя БД).

**5. Конвертация форматов данных (СРЕДНИЙ):**

| Параметр | МойСклад | Ozon | WB | YM |
|----------|----------|------|----|----|
| Цена | Kopecks (int) | String в руб | Int в руб | Float в руб |
| Вес | кг (float) | г (int) | г? (requires verification) | кг/г (varies) |
| Размеры | — | мм | мм | мм/см (varies) |

**6. Надёжность длинных цепочек tool calls (СРЕДНИЙ).** Claude может выполнить 10–15 tool calls, но при ~30 вызовах начинает давать partial results из-за context window erosion. Каждый tool call + response ≈ 2–5K tokens. При 28 вызовах для sync 1000 SKU: ~56K tokens только от responses. Решение: **batch-операции внутри MCP tools** (один tool = sync всех остатков на одном маркетплейсе).

**7. Частые breaking changes API маркетплейсов (СРЕДНИЙ).** Ozon: deprecation wave каждые 2–4 месяца. WB: миграция доменов, async reports. YM: наиболее стабилен. Нужен мониторинг Telegram-каналов (@OzonSellerAPI, @wb_api_notifications, @yandex_market_api).

---

## Реалистичная оценка use cases

### Что РЕАЛЬНО работает через MCP

**1. One-time bulk price update (+10% на Электронику)** — ✅ ОТЛИЧНО подходит. Сценарий: Claude получает список товаров из МойСклад по категории → рассчитывает новые цены → обновляет на Ozon (/v1/product/import/prices, batch 1000), WB (Prices API), YM (PUT offer-prices/updates). **~28 API-вызовов для 1000 SKU, ~2–3 минуты через MCP.** Идеальный ad-hoc сценарий.

**2. Low stock alert (< 5 единиц)** — ✅ ХОРОШО. Claude запрашивает остатки из МойСклад (`report/stock/all`), фильтрует по порогу, выводит отчёт. Один tool call. Кросс-платформенная проверка: +3 вызова (по одному на маркетплейс). Итого ~4 tool calls.

**3. Monthly analytics aggregation** — ✅ ХОРОШО. Сбор данных из Ozon `/v1/analytics/data`, WB analytics endpoints, YM reports → сводная таблица. **Лучший use case для MCP** — ad-hoc аналитика, которую неудобно делать в каждом личном кабинете отдельно.

**4. Добавление нового товара на все платформы** — ⚠️ ЧАСТИЧНО. Разные форматы карточек, обязательные поля, категории. Claude может сгенерировать JSON для каждого маркетплейса, но Ozon требует category_id + attributes, WB — subject + characteristics, YM — category + parameters. **Один из самых полезных сценариев, но требует хорошо продуманных MCP tools для маппинга категорий.**

**5. New order full cycle (Ozon → МойСклад → СДЭК → DaData)** — ⚠️ ЧАСТИЧНО. Получить заказ из Ozon → создать заказ в МойСклад → валидировать адрес через DaData → получить СДЭК city_code → создать заказ СДЭК → рассчитать тариф. **~6–8 tool calls, ~1–2 минуты.** Работает для единичных заказов. Не работает для потока заказов (нет scheduling, нет auto-trigger).

### Что НЕ работает через MCP

**6. Daily stock sync (автоматическая синхронизация остатков)** — ❌ НЕ РАБОТАЕТ. MCP — request/response протокол, без cron. Workaround: внешний scheduler (cron, n8n, GitHub Actions) вызывает MCP tools через CLI/API. Но это уже не «MCP-стек», а hybrid architecture.

**7. Real-time order processing 24/7** — ❌ НЕ РАБОТАЕТ. WB не поддерживает webhooks — нужен polling каждые 30–60 секунд. MCP не может работать в daemon mode.

**8. Automatic stock decrement при продаже** — ❌ НЕ РАБОТАЕТ. Race conditions + отсутствие transactions + нет shared state = гарантированный overselling при высоком трафике.

---

## Расчёт rate limits: sync 1000 SKU на 3 платформы

| Операция | Ozon | WB | YM | Итого |
|----------|------|----|----|-------|
| Stock update requests | 10 (×100 items) | 1–2 (batch) | 2 (×500 items) | ~14 |
| Price update requests | 10 (×100 items) | 1–2 (batch) | 2 (×500 items) | ~14 |
| **Всего запросов** | **20** | **3–4** | **4** | **~28** |
| **Время (API only)** | ~60 сек | ~2 сек | ~2 сек | **~65 сек** |
| **Время через MCP** | +30 сек overhead | +5 сек | +5 сек | **~2.5 мин** |

При 10 000 SKU: ~280 запросов, ~10–15 минут через API, ~25–30 минут через MCP. Это на грани практичности для MCP (context window: 280 tool calls × ~2K tokens = 560K — **превышает лимит 200K**). Для 10K+ SKU нужны batch tools, которые делают весь sync внутри одного tool call.

---

## MVP план

### Обязательные серверы (4 из 7):

1. **moysklad-mcp** — ядро стека. Без него нет центрального хранилища.
2. **ozon-mcp** — крупнейший маркетплейс по API-зрелости
3. **wildberries-mcp** — крупнейший маркетплейс по объёму продаж
4. **dadata-mcp** — необходим для валидации адресов и bridge к СДЭК

### Опциональные серверы (3 из 7):

5. **yandex-market-mcp** — Phase 2, третий по приоритету маркетплейс
6. **cdek-mcp** — Phase 2, нужен только при обработке FBS-заказов с собственной доставкой
7. **yookassa-mcp** — Phase 3, нужен только при собственном интернет-магазине (маркетплейсы обрабатывают платежи сами)

### Архитектура пакета

**Meta-package не нужен.** Рекомендация: **монорепо** `@theyahia/mcp-ecommerce-ru` с:
- Shared `utils/` (rate limiter, price converter, article mapper)
- README с примерами Claude Desktop config для всех 7 серверов
- `claude_desktop_config.json` шаблон
- Примеры промптов для типовых сценариев

### Инструменты для добавления в каждый сервер:

**moysklad-mcp** (приоритет: критический):
- `ms_search_products` — поиск по article/barcode с expand
- `ms_get_stock_all` — остатки по всем складам
- `ms_create_customer_order` — создание заказа
- `ms_update_stock` — обновление остатков
- `ms_list_webhooks` — управление webhooks

**ozon-mcp**:
- `ozon_list_products` — `/v3/product/list`
- `ozon_update_prices` — batch `/v1/product/import/prices`
- `ozon_update_stocks` — batch `/v2/products/stocks`
- `ozon_get_orders_fbs` — `/v3/posting/fbs/list`
- `ozon_get_analytics` — `/v1/analytics/data`
- `ozon_get_finance` — `/v3/finance/transaction/list`

**wildberries-mcp**:
- `wb_get_cards` — `/content/v2/get/cards/list`
- `wb_update_prices` — Prices API batch
- `wb_update_stocks` — `PUT /api/v3/stocks/{warehouseId}`
- `wb_get_orders_new` — `GET /api/v3/orders/new`
- `wb_get_sales_report` — async report generation

---

## Timeline и тестовые среды

### Оценка трудозатрат (production-quality):

| Сервер | Дни | Обоснование |
|--------|-----|-------------|
| moysklad-mcp | **5–7** | Хорошая документация, стандартный REST, но много entity types |
| ozon-mcp | **7–10** | Нет OpenAPI, сложные rate limits, частые deprecations |
| wildberries-mcp | **8–12** | OpenAPI есть, но 8 доменов, 12 token categories, 409 penalty |
| yandex-market-mcp | **4–6** | OpenAPI spec на GitHub, лучшая документация |
| dadata-mcp | **2–3** | Простой API, хорошие SDK |
| cdek-mcp | **3–4** | Стандартный REST, OAuth |
| yookassa-mcp | **2–3** | Хорошая документация, OpenAPI spec |
| **Integration testing** | **5–7** | Cross-server scenarios |
| **ИТОГО MVP (4 сервера)** | **~25–35 дней** | moysklad + ozon + wb + dadata |
| **ИТОГО полный стек** | **~40–55 дней** | все 7 + интеграция |

### Тестовые среды:

| Сервис | Sandbox | Стоимость | Примечание |
|--------|---------|-----------|------------|
| Ozon | ❌ Нет | Нужен реальный seller account | Тестовый ЛК на production |
| Wildberries | ✅ Test token (acc: 2) | Бесплатно | Новая система токенов |
| Yandex Market | ⚠️ Test orders only | Нужен seller account | `fake: true` в production |
| МойСклад | ✅ Free plan | 0₽ (100 товаров) | 14-дней trial полный |
| СДЭК | ✅ api.edu.cdek.ru | Бесплатно | Публичные test credentials |
| DaData | ✅ Free tier | 0₽ (10K/день) | No separate sandbox |
| ЮKassa | ✅ Demo-магазин | Бесплатно (до 20) | Тестовые карты |

**Для Ozon и Yandex Market нужны реальные seller accounts.** Без них невозможно полноценное тестирование. WB предлагает test-токены в новой системе. МойСклад free plan достаточен для разработки, но custom fields недоступны (нужен минимум «Базовый» за ₽1 040/мес).

---

## Репозитории @theyahia на GitHub

**Репозитории не найдены** при поиске по GitHub, MCP-реестрам, LobeHub, awesome-mcp-servers. Возможные причины: репозитории ещё не созданы (это план), приватные, или username отличается. **Requires verification.** Если репозитории планируются — это **первый в мире полный MCP e-commerce стек для российского рынка**. Единственный конкурент: `lyohadunker26/wildberries-mcp-server` (WB only).

---

## Итоговый вердикт и рекомендация

### Стоит строить? **ДА — с оговорками.**

**Аргументы ЗА:**
- **Первый в мире** AI-native e-commerce стек для РФ. Ни MPSTATS, ни RetailCRM, ни 1С не предлагают conversational marketplace management
- **Конкуренция MCP-серверов минимальна**: только 1 WB MCP существует, Ozon и YM — 0
- МойСклад Marketplace of Apps позволяет **монетизировать** через 75% revenue share
- Ценовой sweet spot **₽5 000–₽8 000/мес** свободен для AI-native решения
- 7 серверов с ~50 tools комфортно помещаются в Claude (32 сервера / 473 tools — протестированный максимум)

**Аргументы ПРОТИВ:**
- MCP **не заменяет** backend для real-time sync, scheduling, transactions
- Overselling risk без proper distributed locking
- Зависимость от стабильности API маркетплейсов (Ozon ломает API каждые 2-4 месяца)
- Масштабирование: при 10K+ SKU context window MCP становится узким местом

### Конкретный next step

**Фаза 1 (2 недели):** Создать **moysklad-mcp** и **ozon-mcp** с базовыми tools (list products, update prices, update stocks, get orders). Протестировать цепочку: «обнови цены на все товары категории X на +10% на Ozon» end-to-end.

**Фаза 2 (3 недели):** Добавить **wildberries-mcp** и **dadata-mcp**. Протестировать кросс-платформенный сценарий: «покажи товары с остатками < 5 на всех маркетплейсах».

**Фаза 3 (2 недели):** Добавить оставшиеся 3 сервера. Создать README с примерами промптов, опубликовать в npm. Подать заявку в Маркетплейс МойСклад.

**Критическая рекомендация:** Позиционировать стек как **«AI-assistant для селлера»**, а не как замену SaaS-автоматизации. MCP — это интерфейс для human-in-the-loop операций, не для autonomous automation. Это честное и уникальное позиционирование, которого нет ни у одного конкурента на российском рынке.