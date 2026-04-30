# Детальный план имплементации: 10 MCP-серверов для Казахстана

**Источник данных:** RESEARCH_03_KAZAKHSTAN.md
**npm scope:** `@theyahia/{service}-mcp`
**Язык README:** русский
**Общий стек:** TypeScript, `@modelcontextprotocol/sdk`, Zod, `tsx`
**Общая структура каждого проекта:**

```
{service}-mcp/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── tools/            # отдельный файл на каждый tool
│   ├── api/              # HTTP-клиент, auth, retry
│   └── types/            # Zod-схемы
├── README.md             # русский
├── smithery.yaml
├── package.json
├── tsconfig.json
├── .env.example
└── LICENSE (MIT)
```

---

## Общий шаблон smithery.yaml

```yaml
name: "@theyahia/{service}-mcp"
description: "MCP-сервер для {Service} API (Казахстан)"
license: MIT
author: theyahia
repository: https://github.com/theyahia/{service}-mcp
install:
  npm: "@theyahia/{service}-mcp"
config:
  env: [] # заполняется per-server
```

## Общий шаблон Telegram-анонса

```
🇰🇿 Новый MCP-сервер: @theyahia/{service}-mcp

Первый MCP-сервер для {Service} API в Казахстане.
Подключи к Claude/Cursor/Windsurf и работай с {описание} прямо из AI.

npm: npmjs.com/package/@theyahia/{service}-mcp
GitHub: github.com/theyahia/{service}-mcp

#MCP #AI #Kazakhstan #DevTools
```

**Каналы для анонсов:**
- @workitkz (29.8K) — IT вакансии
- @bluescreenkz (24.5K) — Tech новости
- @thetechkz (22.9K) — Стартапы
- @devkz_jobs (21.9K) — Dev вакансии
- @backenderskz (3.4K) — Backend
- @frontendkz (4.4K) — Frontend

---

# СЕРВЕР 1: nbk-mcp (Национальный Банк Казахстана)

**Приоритет:** 1 (Quick Win)
**Сложность:** Легко
**Время:** 1 день
**Авторизация:** НЕ НУЖНА — полностью открытый API

## 1.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/nbk-mcp для API Национального Банка Казахстана (курсы валют).

КРИТИЧЕСКИ ВАЖНО: Авторизация НЕ нужна. API полностью открытый, без ключей, без токенов.

=== ТЕХНИЧЕСКИЕ ДЕТАЛИ ===

Base URL: https://nationalbank.kz/rss/

Endpoints:
1. GET https://nationalbank.kz/rss/rates_all.xml
   - Возвращает XML со ВСЕМИ ~40 валютами на сегодня
   - Формат ответа: XML (RSS)
   - Каждый элемент <item> содержит:
     <title>USD</title>
     <description>449.19</description>
     <quant>1</quant>
     <index>UP</index>
     <change>1.52</change>
     <link>https://nationalbank.kz/rss/rates_all.xml?switch=kazakh</link>
     <pubDate>21.03.2026</pubDate>

2. GET https://nationalbank.kz/rss/rates.xml
   - Только основные валюты (USD, EUR, RUB, CNY, GBP и т.д.)
   - Тот же формат XML

3. GET https://nationalbank.kz/rss/get_rates.cfm?fdate=DD.MM.YYYY
   - Исторические курсы на конкретную дату
   - Параметр fdate в формате DD.MM.YYYY (пример: 15.03.2026)
   - Опциональный параметр: &switch=kazakh (казахский язык)

=== ENV VARS ===
Нет — авторизация не требуется.

=== 5 TOOLS С ZOD-СХЕМАМИ ===

1. get_all_rates
   Описание: "Получить курсы всех ~40 валют НБК на сегодня"
   Input: z.object({
     language: z.enum(["russian", "kazakh"]).optional().default("russian")
       .describe("Язык ответа")
   })
   Output: массив { currency: string, rate: number, quantity: number, direction: "UP" | "DOWN", change: number, date: string }
   Endpoint: GET /rss/rates_all.xml (или /rss/rates_all.xml?switch=kazakh)

2. get_currency_rate
   Описание: "Получить курс конкретной валюты к тенге"
   Input: z.object({
     currency: z.string().describe("Код валюты ISO 4217: USD, EUR, RUB, CNY, GBP, CHF, JPY, KGS, UZS и т.д.")
   })
   Output: { currency: string, rate: number, quantity: number, direction: "UP" | "DOWN", change: number, date: string }
   Реализация: вызвать get_rates_all.xml, найти нужную валюту в XML

3. get_historical_rates
   Описание: "Получить курсы валют на конкретную дату"
   Input: z.object({
     date: z.string().describe("Дата в формате DD.MM.YYYY, например 15.03.2026"),
     currency: z.string().optional().describe("Код валюты. Если не указан — все валюты")
   })
   Output: массив курсов на указанную дату
   Endpoint: GET /rss/get_rates.cfm?fdate={date}

4. convert_currency
   Описание: "Конвертировать валюту через тенге (KZT)"
   Input: z.object({
     from: z.string().describe("Исходная валюта (USD, EUR, RUB...) или KZT"),
     to: z.string().describe("Целевая валюта (USD, EUR, RUB...) или KZT"),
     amount: z.number().positive().describe("Сумма для конвертации")
   })
   Output: { from: string, to: string, amount: number, result: number, rate: number, date: string }
   Реализация: получить оба курса, конвертировать через KZT

5. get_rate_dynamics
   Описание: "Динамика курса валюты (растёт/падает/не изменился)"
   Input: z.object({
     currency: z.string().describe("Код валюты: USD, EUR, RUB, CNY и т.д.")
   })
   Output: { currency: string, rate: number, direction: "UP" | "DOWN", change: number, change_percent: number, date: string }
   Реализация: из полей index и change в XML

=== ПАРСИНГ XML ===
Используй пакет fast-xml-parser для парсинга XML → JSON.
XML содержит RSS-структуру: <rss><channel><item>...</item></channel></rss>

=== ОБРАБОТКА ОШИБОК ===
- Если API недоступен (503, timeout) — вернуть понятное сообщение "НБК API временно недоступен"
- Если валюта не найдена — вернуть список доступных валют
- Если дата невалидна — подсказать формат DD.MM.YYYY
- Если дата в будущем — вернуть ошибку
- Timeout: 10 секунд (XML-фид иногда медленный)

=== RATE LIMITS ===
Нет задокументированных лимитов. Но рекомендуется кэшировать ответы на 1 час (курсы обновляются 1 раз в день).
Реализовать in-memory кэш с TTL 3600 секунд.

=== README СТРУКТУРА ===
README на русском. Секции:
1. Заголовок + бейджи (npm, license)
2. Описание: MCP-сервер для курсов валют Национального Банка Казахстана
3. Установка (npx, npm install, claude_desktop_config.json)
4. Настройка — указать что авторизация НЕ нужна
5. Инструменты — таблица с описанием каждого tool
6. Примеры использования (натуральный язык: "Какой курс доллара?", "Сколько будет 1000 евро в тенге?")
7. Формат ответа (JSON-примеры)
8. Часть серии "Russian & CIS API MCP servers"
9. Лицензия MIT

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- fast-xml-parser
- zod
```

## 1.2 Pre-implementation checklist

- [ ] **Регистрация в API:** НЕ ТРЕБУЕТСЯ
- [ ] **Sandbox:** Не нужен — API открытый, данные публичные
- [ ] **Тестовые данные:** Просто вызвать https://nationalbank.kz/rss/rates_all.xml в браузере, убедиться что XML возвращается
- [ ] **Проверить исторические курсы:** GET https://nationalbank.kz/rss/get_rates.cfm?fdate=01.01.2026
- [ ] **Проверить казахский язык:** GET https://nationalbank.kz/rss/rates_all.xml?switch=kazakh

**Известные gotchas из ресёрча:**
- XML-фид, не JSON — обязательно парсить
- Поле `quant` (quantity) важно: для JPY quant=100, значит курс указан за 100 йен
- Поле `index` содержит UP/DOWN — направление изменения
- Формат даты DD.MM.YYYY, НЕ ISO
- Иногда XML-фид медленный (до 5-10 секунд)

## 1.3 Post-implementation checklist

- [ ] **npm publish:**
  ```bash
  cd nbk-mcp
  npm version patch
  npm publish --access public
  ```
- [ ] **mcp-publisher publish:**
  ```bash
  npx @anthropic/mcp-publisher publish
  ```
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/nbk-mcp"
  description: "MCP-сервер для курсов валют Национального Банка Казахстана (НБК). Без авторизации."
  license: MIT
  author: theyahia
  repository: https://github.com/theyahia/nbk-mcp
  install:
    npm: "@theyahia/nbk-mcp"
  config:
    env: []
  ```
- [ ] **Анонс в Telegram:** @thetechkz, @bluescreenkz, @backenderskz
- [ ] **Статья на Habr:** "Первый MCP-сервер для Казахстана: курсы НБК в Claude"

---

# СЕРВЕР 2: kaspi-merchant-mcp (Kaspi Marketplace Seller API)

**Приоритет:** 2 (Стратегически главный)
**Сложность:** Средне
**Время:** 4 дня
**Авторизация:** X-Auth-Token (статический токен из Seller Cabinet)

## 2.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/kaspi-merchant-mcp для Kaspi Marketplace Seller API.

=== ДОКУМЕНТАЦИЯ ===
Основная: https://guide.kaspi.kz/partner/ru/shop/api/general
Legacy Confluence: https://kaspi.kz/merchantcabinet/support/display/MS/API+for+orders+and+reviews
Content API: https://kaspi.kz/merchantcabinet/support/display/MS/Content+API

=== ПРОТОКОЛ ===
JSON:API specification (https://jsonapi.org/)
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

=== BASE URL ===
https://kaspi.kz/shop/api/v2

=== АВТОРИЗАЦИЯ ===
Header: X-Auth-Token: {token}
Токен получается вручную из Kaspi Seller Cabinet (Кабинет продавца).
Env: KASPI_AUTH_TOKEN

=== 8 TOOLS С ZOD-СХЕМАМИ ===

1. get_orders
   Описание: "Получить список заказов Kaspi Marketplace с фильтрами"
   Input: z.object({
     state: z.enum([
       "NEW",
       "SIGN_REQUIRED",
       "PICKUP",
       "DELIVERY",
       "KASPI_DELIVERY",
       "ARCHIVE"
     ]).optional().describe("Состояние заказа"),
     status: z.enum([
       "APPROVED_BY_BANK",
       "ACCEPTED_BY_MERCHANT",
       "COMPLETED",
       "CANCELLED",
       "CANCELLING",
       "RETURNED",
       "RETURNING"
     ]).optional().describe("Статус заказа"),
     creation_date_from: z.string().optional().describe("Дата начала (ISO 8601, пример: 2026-03-01T00:00:00+0600)"),
     creation_date_to: z.string().optional().describe("Дата окончания (ISO 8601)"),
     page_number: z.number().int().min(0).optional().default(0).describe("Номер страницы (начиная с 0)"),
     page_size: z.number().int().min(1).max(100).optional().default(20).describe("Размер страницы (макс 100)")
   })
   Endpoint: GET /v2/orders?filter[orders][state]={state}&filter[orders][status]={status}&filter[orders][creationDate][$ge]={from}&filter[orders][creationDate][$le]={to}&page[number]={page}&page[size]={size}
   Ответ: JSON:API формат { data: [...], meta: { totalCount, pageCount } }

2. get_order
   Описание: "Получить детали конкретного заказа"
   Input: z.object({
     order_id: z.string().describe("ID заказа Kaspi")
   })
   Endpoint: GET /v2/orders/{order_id}
   Ответ: JSON:API { data: { id, type: "order", attributes: { code, totalPrice, paymentMode, state, status, ... } } }

3. get_order_items
   Описание: "Получить товары (позиции) в заказе"
   Input: z.object({
     order_id: z.string().describe("ID заказа Kaspi")
   })
   Endpoint: GET /v2/orders/{order_id}/entries
   Ответ: JSON:API { data: [{ type: "orderEntry", attributes: { quantity, totalPrice, product, ... } }] }

4. update_order_status
   Описание: "Обновить статус заказа (принять, завершить, отменить)"
   Input: z.object({
     order_id: z.string().describe("ID заказа"),
     status: z.enum([
       "ACCEPTED_BY_MERCHANT",
       "COMPLETED",
       "CANCELLED"
     ]).describe("Новый статус заказа"),
     cancel_reason: z.string().optional().describe("Причина отмены (обязательно при CANCELLED)")
   })
   Endpoint: POST /v2/orders
   Body: JSON:API format { data: { type: "order", id: "{order_id}", attributes: { status: "{status}" } } }
   ВАЖНО: Для CANCELLED нужен reason в attributes

5. get_cities
   Описание: "Получить список городов Kaspi Marketplace"
   Input: z.object({})
   Endpoint: GET /v2/cities
   Ответ: JSON:API с городами КЗ

6. get_products
   Описание: "Получить товары из Content API"
   Input: z.object({
     page_number: z.number().int().min(0).optional().default(0),
     page_size: z.number().int().min(1).max(100).optional().default(20)
   })
   Endpoint: GET https://kaspi.kz/shop/api/products
   Headers: X-Auth-Token, Accept: application/vnd.api+json

7. get_categories
   Описание: "Получить категории товаров Kaspi Marketplace"
   Input: z.object({})
   Endpoint: GET https://kaspi.kz/shop/api/categories

8. import_products
   Описание: "Импортировать товары в Kaspi Marketplace"
   Input: z.object({
     products: z.array(z.object({
       sku: z.string().describe("Артикул товара"),
       name: z.string().describe("Название"),
       category_id: z.string().describe("ID категории"),
       price: z.number().positive().describe("Цена в тенге"),
       description: z.string().optional().describe("Описание товара")
     })).describe("Массив товаров для импорта")
   })
   Endpoint: POST https://kaspi.kz/shop/api/products/import
   Body: JSON:API format

=== ОБРАБОТКА ОШИБОК ===
- 401 Unauthorized: "Неверный X-Auth-Token. Получите токен в Кабинете продавца Kaspi: https://kaspi.kz/merchantcabinet/"
- 403 Forbidden: "Нет доступа к данному ресурсу. Проверьте права в Seller Cabinet."
- 404 Not Found: "Заказ не найден. Проверьте order_id."
- 422 Unprocessable Entity: "Невалидные данные. Проверьте формат запроса (JSON:API)."
- 429 Too Many Requests: retry с экспоненциальным backoff (хотя лимиты не задокументированы)

=== RATE LIMITS ===
Не задокументированы. Рекомендуется не превышать 60 запросов в минуту.
Реализовать rate limiter с token bucket (60 req/min).

=== SANDBOX ===
ОТСУТСТВУЕТ. Все тесты идут на production данных.
ВНИМАНИЕ: tool update_order_status ИЗМЕНЯЕТ реальные заказы. Добавить confirmation в описание tool.

=== ENV VARS ===
KASPI_AUTH_TOKEN — обязательный. Получить: Kaspi Seller Cabinet → API → Сгенерировать токен.

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- zod

=== README СТРУКТУРА ===
README на русском:
1. Заголовок + бейджи
2. Описание: MCP-сервер для Kaspi Marketplace Seller API — управление заказами, товарами, статусами
3. Предупреждение: "⚠️ Sandbox отсутствует. Все операции выполняются на реальных данных."
4. Установка (npx, npm install, claude_desktop_config.json)
5. Настройка — как получить X-Auth-Token (скриншот пути в Seller Cabinet)
6. Инструменты — таблица
7. JSON:API формат — пояснение специфики протокола
8. Примеры ("Покажи заказы за сегодня", "Прими заказ 12345", "Какие товары в заказе?")
9. Состояния заказов — таблица (NEW → SIGN_REQUIRED → PICKUP/DELIVERY → ARCHIVE)
10. Часть серии "Russian & CIS API MCP"
11. Лицензия MIT
```

## 2.2 Pre-implementation checklist

- [ ] **Регистрация:** Нужна учётная запись продавца на Kaspi Marketplace
  - Регистрация: https://kaspi.kz/merchantcabinet/
  - Требуется ИИН/БИН казахстанского юрлица или ИП
  - **REQUIRES VERIFICATION:** Можно ли получить тестовый аккаунт без реального ИП. Проверить: написать в support@kaspi.kz с запросом на developer access
- [ ] **Sandbox:** ОТСУТСТВУЕТ — тестирование только на production
- [ ] **Тестовые данные:** Реальные заказы в аккаунте продавца. Для тестирования get_orders достаточно читающих запросов.
- [ ] **Проверить документацию:** Открыть https://guide.kaspi.kz/partner/ru/shop/api/general — убедиться что endpoints актуальны

**Известные gotchas из ресёрча:**
- JSON:API протокол — Content-Type ОБЯЗАТЕЛЬНО `application/vnd.api+json`, иначе 406
- Нет sandbox — update_order_status меняет реальные заказы
- Content API (products, categories, import) живёт на другом URL: `https://kaspi.kz/shop/api/products`, а не `/v2/products`
- Единственный существующий SDK — Go-библиотека (github.com/abdymazhit/kaspi-merchant-api, 32 stars), можно использовать как reference
- 721K активных продавцов — огромная потенциальная аудитория
- Даты в фильтрах — ISO 8601 с timezone offset +0600 (Алматы)

## 2.3 Post-implementation checklist

- [ ] **npm publish:**
  ```bash
  cd kaspi-merchant-mcp
  npm version patch
  npm publish --access public
  ```
- [ ] **mcp-publisher publish:**
  ```bash
  npx @anthropic/mcp-publisher publish
  ```
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/kaspi-merchant-mcp"
  description: "MCP-сервер для Kaspi Marketplace Seller API. Заказы, товары, статусы."
  license: MIT
  author: theyahia
  repository: https://github.com/theyahia/kaspi-merchant-mcp
  install:
    npm: "@theyahia/kaspi-merchant-mcp"
  config:
    env:
      - name: KASPI_AUTH_TOKEN
        description: "X-Auth-Token из Kaspi Seller Cabinet"
        required: true
  ```
- [ ] **Анонс в Telegram:** @workitkz, @thetechkz, @bluescreenkz, @devkz_jobs (максимальный охват — Kaspi = самый узнаваемый бренд КЗ)
- [ ] **Статья на Habr:** "MCP + Kaspi Marketplace: управляй заказами через AI"

---

# СЕРВЕР 3: 2gis-mcp (2GIS Maps/Geo/Search)

**Приоритет:** 3
**Сложность:** Средне
**Время:** 3 дня
**Авторизация:** API Key в query-параметре

## 3.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/2gis-mcp для 2GIS API (карты, геокодирование, поиск организаций, маршруты).

=== ДОКУМЕНТАЦИЯ ===
https://docs.2gis.com/en
Управление API-ключами: https://platform.2gis.ru/

=== АВТОРИЗАЦИЯ ===
API Key в query-параметре: ?key=YOUR_KEY
Env: TWOGIS_API_KEY

=== BASE URLs ===
- Catalog API: https://catalog.api.2gis.com/3.0/
- Routing API: https://routing.api.2gis.com/routing/7.0.0/
- Suggest API: https://catalog.api.2gis.com/3.0/suggests

=== 8 TOOLS С ZOD-СХЕМАМИ ===

1. geocode
   Описание: "Геокодирование: адрес → координаты (прямое геокодирование)"
   Input: z.object({
     query: z.string().describe("Адрес для геокодирования, пример: 'Алматы, ул. Абая 150'"),
     fields: z.string().optional().default("items.point,items.full_name").describe("Поля для возврата")
   })
   Endpoint: GET https://catalog.api.2gis.com/3.0/items/geocode?q={query}&fields={fields}&key={TWOGIS_API_KEY}
   Ответ: { result: { items: [{ full_name, point: { lat, lon }, address_name, type }] } }

2. reverse_geocode
   Описание: "Обратное геокодирование: координаты → адрес"
   Input: z.object({
     lat: z.number().describe("Широта"),
     lon: z.number().describe("Долгота"),
     radius: z.number().optional().default(100).describe("Радиус поиска в метрах")
   })
   Endpoint: GET https://catalog.api.2gis.com/3.0/items/geocode?lat={lat}&lon={lon}&radius={radius}&fields=items.point,items.full_name&key={KEY}

3. search_places
   Описание: "Поиск организаций и мест (рестораны, аптеки, магазины и т.д.)"
   Input: z.object({
     query: z.string().describe("Поисковый запрос: 'аптека', 'Starbucks', 'банкомат Kaspi'"),
     location: z.string().optional().describe("Центр поиска: 'lon,lat', пример: '76.945,43.238'"),
     radius: z.number().optional().describe("Радиус поиска в метрах"),
     city: z.string().optional().describe("Город: 'Алматы', 'Астана', 'Шымкент'"),
     page: z.number().int().min(1).optional().default(1).describe("Страница результатов"),
     page_size: z.number().int().min(1).max(50).optional().default(10).describe("Результатов на страницу (макс 50)")
   })
   Endpoint: GET https://catalog.api.2gis.com/3.0/items?q={query}&point={location}&radius={radius}&page={page}&page_size={page_size}&fields=items.point,items.address,items.schedule,items.contact_groups,items.reviews&key={KEY}

4. get_directions
   Описание: "Построить маршрут между двумя точками"
   Input: z.object({
     from_lat: z.number().describe("Широта начальной точки"),
     from_lon: z.number().describe("Долгота начальной точки"),
     to_lat: z.number().describe("Широта конечной точки"),
     to_lon: z.number().describe("Долгота конечной точки"),
     transport: z.enum(["car", "taxi", "bicycle", "scooter", "motorcycle", "pedestrian", "public_transport"])
       .optional().default("car").describe("Тип транспорта")
   })
   Endpoint: POST https://routing.api.2gis.com/routing/7.0.0/global?key={KEY}
   Body: {
     "points": [
       { "type": "stop", "lat": from_lat, "lon": from_lon },
       { "type": "stop", "lat": to_lat, "lon": to_lon }
     ],
     "transport": "{transport}",
     "route_mode": "fastest",
     "traffic_mode": "jam",
     "output": "summary"
   }
   Ответ: { result: [{ distance, duration, legs }] }

5. distance_matrix
   Описание: "Матрица расстояний между несколькими точками"
   Input: z.object({
     origins: z.array(z.object({
       lat: z.number(),
       lon: z.number()
     })).min(1).max(10).describe("Начальные точки (макс 10)"),
     destinations: z.array(z.object({
       lat: z.number(),
       lon: z.number()
     })).min(1).max(10).describe("Конечные точки (макс 10)"),
     transport: z.enum(["car", "pedestrian", "bicycle"]).optional().default("car")
   })
   Endpoint: POST https://routing.api.2gis.com/routing/7.0.0/global?key={KEY}
   Реализация: множественные запросы маршрутов, агрегация в матрицу

6. suggest
   Описание: "Автодополнение адреса (подсказки при вводе)"
   Input: z.object({
     query: z.string().min(2).describe("Начало адреса: 'Алматы, ул. Аб'"),
     location: z.string().optional().describe("Центр поиска 'lon,lat' для релевантности"),
     locale: z.enum(["ru", "en", "kk"]).optional().default("ru").describe("Язык подсказок")
   })
   Endpoint: GET https://catalog.api.2gis.com/3.0/suggests?q={query}&point={location}&locale={locale}&key={KEY}

7. get_place_details
   Описание: "Детальная информация об организации (часы работы, телефон, отзывы)"
   Input: z.object({
     place_id: z.string().describe("ID организации из результатов поиска")
   })
   Endpoint: GET https://catalog.api.2gis.com/3.0/items/byid?id={place_id}&fields=items.point,items.address,items.schedule,items.contact_groups,items.reviews,items.external_content,items.description&key={KEY}

8. search_by_bin
   Описание: "Поиск организации по БИН (Business Identification Number, 12 цифр)"
   Input: z.object({
     bin: z.string().regex(/^\d{12}$/).describe("БИН компании (12 цифр)")
   })
   Endpoint: GET https://catalog.api.2gis.com/3.0/items?q={bin}&type=branch&fields=items.point,items.address,items.schedule,items.contact_groups&key={KEY}

=== RATE LIMITS ===
Free demo: 1,000 запросов/месяц на каждый сервис, максимум 1 месяц, 5 страниц по 10 результатов.
Paid: лимиты зависят от подписки (см. https://platform.2gis.ru/).
Реализовать: Rate limiter + retry при 429. Логировать оставшиеся запросы.

=== ОБРАБОТКА ОШИБОК ===
- 401/403: "Невалидный API-ключ 2GIS. Получите ключ: https://platform.2gis.ru/"
- 429: "Превышен лимит запросов. Demo: 1,000/месяц." + exponential backoff
- 404: "Объект не найден"
- Пустые результаты: "Ничего не найдено по запросу. Попробуйте уточнить."

=== ENV VARS ===
TWOGIS_API_KEY — обязательный. Получить: https://platform.2gis.ru/ → Create project → Get key

=== README СТРУКТУРА ===
README на русском:
1. Заголовок + бейджи
2. Описание: MCP-сервер для 2GIS — геокодирование, поиск организаций, маршруты по 17 городам Казахстана
3. Установка
4. Настройка — как получить API-ключ
5. Инструменты — таблица
6. Покрытие городов: Алматы, Астана, Шымкент, Караганда, Актобе, Тараз, Павлодар, Усть-Каменогорск, Семей, Атырау, Костанай, Петропавловск, Кызылорда, Актау, Уральск, Туркестан, Талдыкорган
7. Примеры ("Найди ближайшую аптеку к ул. Абая 150", "Построй маршрут от аэропорта до отеля")
8. Лимиты и тарифы
9. Часть серии "Russian & CIS API MCP"
10. Лицензия MIT

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- zod
```

## 3.2 Pre-implementation checklist

- [ ] **Регистрация:** https://platform.2gis.ru/ — создать проект, получить API Key
- [ ] **Sandbox:** Demo tier — 1,000 req/month бесплатно на 1 месяц
- [ ] **Тестовые данные:**
  - Геокодирование: "Алматы, ул. Абая 150" → должны вернуться координаты ~43.24, ~76.93
  - Поиск: "аптека" в Алматы → список аптек
  - Маршрут: аэропорт Алматы (43.352, 77.040) → центр города (43.238, 76.945)
- [ ] **Проверить endpoints:** `curl "https://catalog.api.2gis.com/3.0/items/geocode?q=Алматы&key=YOUR_KEY"`

**Известные gotchas из ресёрча:**
- API Key передаётся в query-параметре `key=`, не в header
- Routing API — POST-запрос, не GET
- Routing v7.0.0 — версия в URL
- Demo tier: макс 5 страниц по 10 результатов — это ограничение пагинации
- Покрытие: 17 городов КЗ, но также РФ и другие страны — сервер можно позиционировать шире
- npm-пакеты @2gis/mapgl существуют, но это карты для фронтенда, а не API-клиент

## 3.3 Post-implementation checklist

- [ ] **npm publish:**
  ```bash
  npm publish --access public
  ```
- [ ] **mcp-publisher publish**
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/2gis-mcp"
  description: "MCP-сервер для 2GIS API — геокодирование, поиск, маршруты. 17 городов Казахстана."
  license: MIT
  author: theyahia
  repository: https://github.com/theyahia/2gis-mcp
  install:
    npm: "@theyahia/2gis-mcp"
  config:
    env:
      - name: TWOGIS_API_KEY
        description: "API-ключ 2GIS (https://platform.2gis.ru/)"
        required: true
  ```
- [ ] **Анонс:** @thetechkz, @bluescreenkz, @backenderskz, @frontendkz

---

# СЕРВЕР 4: halyk-epay-mcp (Halyk ePay Payments)

**Приоритет:** 4
**Сложность:** Средне
**Время:** 4 дня
**Авторизация:** OAuth 2.0 (client_credentials)

## 4.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/halyk-epay-mcp для Halyk EPay API (платёжная система Народного Банка Казахстана).

=== ДОКУМЕНТАЦИЯ ===
https://epayment.kz/en-US/docs/mobile_sdk_documentation
Тестовые credentials: https://epayment.kz/en-US/docs/Test%20credentials

=== ОКРУЖЕНИЯ ===
Production:
  - OAuth: https://epay-oauth.homebank.kz/oauth2/token
  - API: https://epay-api.homebank.kz/
  - Payment Page: https://epay.homebank.kz/pay

Sandbox (ТЕСТОВОЕ):
  - OAuth: https://testoauth.homebank.kz/epay2/oauth2/token
  - API: https://testepay.homebank.kz/api/
  - Payment Page: https://test-epay.homebank.kz/pay

RSA Public Key: https://epay-api.homebank.kz/public.rsa

=== АВТОРИЗАЦИЯ ===
OAuth 2.0 (client_credentials grant):
POST {oauth_url}/oauth2/token
Content-Type: application/x-www-form-urlencoded
Body: grant_type=client_credentials&scope=webapi+usermanagement&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}
Ответ: { access_token: "...", expires_in: 7200, token_type: "Bearer" }

Токен действует 7200 секунд (2 часа). Автообновлять за 5 минут до истечения.

=== ENV VARS ===
HALYK_CLIENT_ID — обязательный
HALYK_CLIENT_SECRET — обязательный
HALYK_TERMINAL_ID — обязательный (ID терминала)
HALYK_ENVIRONMENT — "sandbox" | "production" (default: "sandbox")

=== 8 TOOLS С ZOD-СХЕМАМИ ===

1. create_payment
   Описание: "Создать платёж и получить URL страницы оплаты"
   Input: z.object({
     amount: z.number().positive().describe("Сумма платежа в тенге (KZT)"),
     order_id: z.string().describe("Уникальный ID заказа в вашей системе"),
     description: z.string().optional().describe("Описание платежа"),
     currency: z.string().optional().default("KZT").describe("Валюта (KZT по умолчанию)"),
     post_link: z.string().url().optional().describe("URL для callback после оплаты"),
     failure_post_link: z.string().url().optional().describe("URL для callback при ошибке"),
     language: z.enum(["ru", "en", "kk"]).optional().default("ru").describe("Язык страницы оплаты"),
     is_preauth: z.boolean().optional().default(false).describe("Двухстадийный платёж (preauth)")
   })
   Реализация: Сформировать URL платёжной страницы с параметрами:
   {payment_page_url}?amount={amount}&currency={currency}&name={description}&invoiceID={order_id}&terminal={TERMINAL_ID}&postLink={post_link}&failurePostLink={failure_post_link}&language={language}&auth={access_token}
   Ответ: { payment_url: string, order_id: string }

2. get_payment_status
   Описание: "Проверить статус платежа"
   Input: z.object({
     order_id: z.string().describe("ID заказа"),
     transaction_id: z.string().optional().describe("ID транзакции Halyk")
   })
   Endpoint: GET {api_url}/check-status/payment/transaction?invoiceId={order_id}
   Headers: Authorization: Bearer {access_token}
   Ответ: { statusCode, statusDescription, amount, currency, terminal, invoiceId, ... }

3. capture_payment
   Описание: "Подтвердить двухстадийный платёж (capture после preauth)"
   Input: z.object({
     transaction_id: z.string().describe("ID транзакции для capture"),
     amount: z.number().positive().describe("Сумма capture в тенге (может быть меньше preauth)")
   })
   Endpoint: POST {api_url}/operation/charge
   Headers: Authorization: Bearer {access_token}
   Body: { transactionId: "{transaction_id}", amount: {amount}, currency: "KZT", terminal: "{TERMINAL_ID}" }

4. refund_payment
   Описание: "Вернуть платёж (полный или частичный возврат)"
   Input: z.object({
     transaction_id: z.string().describe("ID транзакции для возврата"),
     amount: z.number().positive().describe("Сумма возврата в тенге"),
     reason: z.string().optional().describe("Причина возврата")
   })
   Endpoint: POST {api_url}/operation/refund
   Headers: Authorization: Bearer {access_token}
   Body: { transactionId: "{transaction_id}", amount: {amount}, currency: "KZT", terminal: "{TERMINAL_ID}", reason: "{reason}" }

5. create_invoice
   Описание: "Создать ссылку на оплату (invoice)"
   Input: z.object({
     amount: z.number().positive().describe("Сумма в тенге"),
     order_id: z.string().describe("ID заказа"),
     description: z.string().describe("Описание"),
     due_date: z.string().optional().describe("Срок действия ссылки (ISO 8601)"),
     email: z.string().email().optional().describe("Email для отправки ссылки")
   })
   Endpoint: POST {api_url}/invoice/create
   Headers: Authorization: Bearer {access_token}

6. create_recurring
   Описание: "Создать рекуррентный (повторяющийся) платёж / подписку"
   Input: z.object({
     amount: z.number().positive().describe("Сумма в тенге"),
     order_id: z.string().describe("ID заказа"),
     card_token: z.string().describe("Токен карты (получен через tokenization)"),
     description: z.string().optional().describe("Описание подписки")
   })
   Endpoint: POST {api_url}/operation/charge/token
   Headers: Authorization: Bearer {access_token}
   Body: { amount, currency: "KZT", invoiceId: "{order_id}", token: "{card_token}", terminal: "{TERMINAL_ID}" }

7. get_card_token
   Описание: "Получить токен карты для повторных платежей"
   Input: z.object({
     order_id: z.string().describe("ID заказа, при оплате которого была токенизирована карта")
   })
   Endpoint: GET {api_url}/check-status/payment/transaction?invoiceId={order_id}
   Реализация: Из ответа извлечь cardToken

8. void_payment
   Описание: "Отменить платёж (void до завершения операционного дня)"
   Input: z.object({
     transaction_id: z.string().describe("ID транзакции для отмены")
   })
   Endpoint: POST {api_url}/operation/void
   Headers: Authorization: Bearer {access_token}
   Body: { transactionId: "{transaction_id}", currency: "KZT", terminal: "{TERMINAL_ID}" }

=== ТЕСТОВЫЕ CREDENTIALS (из документации) ===
TerminalID: 67e34d63-102f-4bd1-898e-370781d0074d
ClientID: test
ClientSecret: yF587AV9Ms94qN2QShFzVR3vFnWkhjbAK3sG
Тестовая карта: 4405639704015096, exp 01/25, CVV 815
Sandbox URL: test-epay.homebank.kz

ВАЖНО: Записать в README что тестовые credentials могут измениться, ссылка на актуальные: https://epayment.kz/en-US/docs/Test%20credentials

=== ОБРАБОТКА ОШИБОК ===
- OAuth ошибки: автоматически обновлять токен при 401
- Невалидный терминал: "Проверьте HALYK_TERMINAL_ID"
- Платёж не найден: "Транзакция не найдена. Проверьте order_id."
- Двойная оплата: "Заказ уже оплачен"

=== RATE LIMITS ===
Не задокументированы. Реализовать: retry с exponential backoff при 429/503.

=== README СТРУКТУРА ===
README на русском:
1. Заголовок + бейджи
2. Описание: MCP-сервер для Halyk ePay — платежи, возвраты, подписки
3. Установка
4. Настройка — env vars + как получить credentials
5. Sandbox/Production переключение
6. Инструменты — таблица
7. Тестовые credentials (со ссылкой на актуальные)
8. Примеры ("Создай платёж на 5000 тенге", "Проверь статус заказа 12345")
9. Безопасность — не хранить ClientSecret в коде
10. Часть серии "Russian & CIS API MCP"
11. Лицензия MIT

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- zod
```

## 4.2 Pre-implementation checklist

- [ ] **Регистрация:** https://epayment.kz — зарегистрироваться как мерчант
  - **Для тестов:** можно использовать тестовые credentials из документации (см. промпт)
- [ ] **Sandbox:** https://test-epay.homebank.kz — полный тестовый стенд
- [ ] **Тестовые данные:**
  - Тестовая карта: 4405639704015096, exp 01/25, CVV 815
  - **REQUIRES VERIFICATION:** Проверить актуальность тестовых credentials на https://epayment.kz/en-US/docs/Test%20credentials — они могут обновляться
- [ ] **Проверить OAuth:** `curl -X POST https://testoauth.homebank.kz/epay2/oauth2/token -d "grant_type=client_credentials&scope=webapi+usermanagement&client_id=test&client_secret=yF587AV9Ms94qN2QShFzVR3vFnWkhjbAK3sG"`

**Известные gotchas из ресёрча:**
- OAuth scope: `webapi usermanagement` — оба нужны
- Token expiry: 7200 секунд (2 часа) — нужен auto-refresh
- RSA Public Key на отдельном endpoint — нужен для верификации подписей
- Sandbox и production — РАЗНЫЕ домены для OAuth и API
- 65%+ онлайн-магазинов КЗ используют Halyk ePay — высокий спрос

## 4.3 Post-implementation checklist

- [ ] **npm publish:** `npm publish --access public`
- [ ] **mcp-publisher publish**
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/halyk-epay-mcp"
  description: "MCP-сервер для Halyk ePay — платежи, возвраты, подписки (Народный Банк Казахстана)"
  license: MIT
  author: theyahia
  config:
    env:
      - name: HALYK_CLIENT_ID
        required: true
      - name: HALYK_CLIENT_SECRET
        required: true
      - name: HALYK_TERMINAL_ID
        required: true
      - name: HALYK_ENVIRONMENT
        required: false
        default: "sandbox"
  ```
- [ ] **Анонс:** @thetechkz, @bluescreenkz, @devkz_jobs, @backenderskz

---

# СЕРВЕР 5: data-egov-kz-mcp (data.egov.kz — открытые данные)

**Приоритет:** 5
**Сложность:** Легко
**Время:** 2 дня
**Авторизация:** API Key (бесплатная регистрация)

## 5.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/data-egov-kz-mcp для API открытых данных Казахстана (data.egov.kz).

=== ДОКУМЕНТАЦИЯ ===
https://data.egov.kz/pages/samples
Примеры: https://data.egov.kz/pages/samples

=== BASE URL ===
https://data.egov.kz/api/v4/

=== АВТОРИЗАЦИЯ ===
API Key в query-параметре: &apiKey={key}
Получить бесплатно: https://data.egov.kz/profile/apikeylist (нужна регистрация)
Env: EGOV_API_KEY

=== ФОРМАТ ЗАПРОСОВ ===
GET https://data.egov.kz/api/v4/{dataset_id}?source={JSON_QUERY}&apiKey={key}
Параметр source — URL-encoded JSON с Elasticsearch Query DSL.

Примеры source JSON:
- Все записи: {"size": 10, "from": 0}
- С фильтром: {"size": 10, "query": {"bool": {"must": [{"match": {"field": "value"}}]}}}
- С сортировкой: {"size": 10, "sort": [{"field": "asc"}]}
- Гео-запрос: {"query": {"bool": {"filter": {"geo_distance": {"distance": "5km", "location": {"lat": 43.238, "lon": 76.945}}}}}}

=== 7 TOOLS С ZOD-СХЕМАМИ ===

1. search_datasets
   Описание: "Поиск датасетов на data.egov.kz по ключевому слову"
   Input: z.object({
     query: z.string().describe("Поисковый запрос: 'аптеки', 'школы', 'бюджет', 'преступность'"),
     page: z.number().int().min(1).optional().default(1),
     page_size: z.number().int().min(1).max(50).optional().default(10)
   })
   Endpoint: GET https://data.egov.kz/api/v4/search?query={query}&page={page}&size={page_size}&apiKey={key}
   REQUIRES VERIFICATION: точный endpoint для поиска датасетов. Может быть https://data.egov.kz/meta/search?query={q}

2. get_dataset
   Описание: "Получить данные из конкретного датасета"
   Input: z.object({
     dataset_id: z.string().describe("ID датасета (пример: 'kr_opendata_incidentsmap_kz')"),
     size: z.number().int().min(1).max(100).optional().default(10).describe("Количество записей"),
     from: z.number().int().min(0).optional().default(0).describe("Смещение (offset)")
   })
   Endpoint: GET https://data.egov.kz/api/v4/{dataset_id}?source={"size":{size},"from":{from}}&apiKey={key}

3. query_dataset
   Описание: "Запросить данные с Elasticsearch-фильтрами"
   Input: z.object({
     dataset_id: z.string().describe("ID датасета"),
     field: z.string().describe("Поле для фильтрации"),
     value: z.string().describe("Значение поля"),
     size: z.number().int().min(1).max(100).optional().default(10),
     from: z.number().int().min(0).optional().default(0)
   })
   Endpoint: GET /api/v4/{dataset_id}?source={"size":{size},"from":{from},"query":{"bool":{"must":[{"match":{"{field}":"{value}"}}]}}}&apiKey={key}

4. get_dataset_schema
   Описание: "Получить структуру (mapping) датасета — какие поля, типы данных"
   Input: z.object({
     dataset_id: z.string().describe("ID датасета")
   })
   Endpoint: GET https://data.egov.kz/api/v4/mapping/{dataset_id}?apiKey={key}
   Ответ: поля с типами (string, number, date, geo_point и т.д.)

5. geo_search
   Описание: "Гео-поиск в датасете (найти объекты в радиусе от точки)"
   Input: z.object({
     dataset_id: z.string().describe("ID датасета с гео-данными"),
     lat: z.number().describe("Широта центра поиска"),
     lon: z.number().describe("Долгота центра поиска"),
     distance: z.string().optional().default("5km").describe("Радиус поиска: '1km', '5km', '10km'"),
     location_field: z.string().optional().default("location").describe("Название гео-поля в датасете"),
     size: z.number().int().min(1).max(100).optional().default(10)
   })
   Endpoint: source={"query":{"bool":{"filter":{"geo_distance":{"distance":"{distance}","{location_field}":{"lat":{lat},"lon":{lon}}}}}}}

6. get_dataset_metadata
   Описание: "Получить метаданные датасета (название, описание, обновления)"
   Input: z.object({
     dataset_id: z.string().describe("ID датасета"),
     version: z.string().optional().describe("Версия датасета")
   })
   Endpoint: GET https://data.egov.kz/meta/{dataset_id}/{version}?apiKey={key}
   REQUIRES VERIFICATION: точный формат endpoint для метаданных

7. list_popular_datasets
   Описание: "Список популярных датасетов для Казахстана"
   Input: z.object({
     category: z.enum([
       "education", "health", "transport", "crime",
       "economy", "budget", "addresses", "pharmacies",
       "public_services"
     ]).optional().describe("Категория данных")
   })
   Реализация: Хардкод популярных dataset_id по категориям:
   - education: школы, вузы, показатели образования
   - health: больницы, аптеки, поликлиники
   - transport: дороги, маршруты, ДТП
   - crime: инциденты, статистика
   - economy: экономические показатели, ВРП
   - budget: бюджет, расходы
   - addresses: адресный классификатор (АТЕ)
   - pharmacies: аптеки с лицензиями
   - public_services: ЦОНы, отделения eGov

=== ОБРАБОТКА ОШИБОК ===
- 401: "Невалидный API Key. Получите: https://data.egov.kz/profile/apikeylist"
- 404: "Датасет не найден. Проверьте dataset_id."
- 400: "Ошибка в Elasticsearch query. Проверьте синтаксис фильтра."
- Пустой ответ: подсказать альтернативный поисковый запрос

=== RATE LIMITS ===
Не задокументированы. Рекомендуется 30 req/min.

=== ENV VARS ===
EGOV_API_KEY — обязательный

=== README СТРУКТУРА ===
README на русском:
1. Заголовок + бейджи
2. Описание: MCP-сервер для 3000+ датасетов открытых данных Казахстана
3. Установка
4. Настройка — как получить API Key (бесплатно)
5. Инструменты — таблица
6. Популярные датасеты — таблица с ID и описаниями
7. Elasticsearch Query DSL — краткий гайд по фильтрам
8. Примеры ("Найди аптеки в радиусе 3км от моей локации", "Покажи статистику преступлений за 2025")
9. Часть серии "Russian & CIS API MCP"
10. Лицензия MIT

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- zod
```

## 5.2 Pre-implementation checklist

- [ ] **Регистрация:** https://data.egov.kz — зарегистрироваться, получить API Key на https://data.egov.kz/profile/apikeylist
  - Регистрация бесплатная
  - **REQUIRES VERIFICATION:** Нужен ли казахстанский номер телефона для регистрации. Проверить: попробовать зарегистрироваться.
- [ ] **Sandbox:** Нет отдельного sandbox, но данные открытые и read-only — безопасно тестировать на production
- [ ] **Тестовые данные:**
  - Попробовать: `GET https://data.egov.kz/api/v4/{dataset_id}?source={"size":5}&apiKey={key}` с известным dataset_id
  - **REQUIRES VERIFICATION:** Найти 5-10 популярных dataset_id для хардкода в tool list_popular_datasets
- [ ] **Проверить Elasticsearch query:** Убедиться что source-параметр принимает ES Query DSL

**Известные gotchas из ресёрча:**
- source-параметр = URL-encoded JSON с Elasticsearch DSL — нужно правильно кодировать
- 3000+ датасетов — нужен хороший tool для поиска/discovery
- Гео-запросы поддерживаются, но не все датасеты имеют гео-поля
- Формат скачивания: JSON, Excel, XML
- Mapping endpoint (`/api/v4/mapping/{dataset}`) возвращает структуру — использовать для discovery

## 5.3 Post-implementation checklist

- [ ] **npm publish:** `npm publish --access public`
- [ ] **mcp-publisher publish**
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/data-egov-kz-mcp"
  description: "MCP-сервер для 3000+ открытых датасетов Казахстана (data.egov.kz)"
  license: MIT
  config:
    env:
      - name: EGOV_API_KEY
        required: true
  ```
- [ ] **Анонс:** @thetechkz, @bluescreenkz, @devkz_jobs — акцент на "бесплатно, 3000+ датасетов"

---

# СЕРВЕР 6: webkassa-mcp (Webkassa OFD — онлайн-фискализация)

**Приоритет:** 6
**Сложность:** Средне
**Время:** 3 дня
**Авторизация:** API Key (получается после регистрации тестовой кассы)

## 6.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/webkassa-mcp для Webkassa API (онлайн-фискализация / ОФД Казахстана).

=== КОНТЕКСТ ===
Webkassa — система онлайн-фискализации, ОБЯЗАТЕЛЬНАЯ для всего ритейла Казахстана.
Позволяет пробивать фискальные чеки, формировать Z/X-отчёты, работать с ОФД.
300+ интеграций (1C, iiko, Poster, Bitrix24, Wolt, Yandex, Flip.kz, Air Astana).

=== ДОКУМЕНТАЦИЯ ===
https://webkassa.kz — основной сайт
REQUIRES VERIFICATION: Точный URL документации API. Проверить: https://webkassa.kz/api/docs или https://webkassa.kz/for-developers
Postman collection предоставляется (запросить у support@webkassa.kz или найти в личном кабинете)

=== BASE URL ===
REQUIRES VERIFICATION: Предположительно https://api.webkassa.kz/ или https://cabinet.webkassa.kz/api/
Тестовый стенд: REQUIRES VERIFICATION — есть, но URL нужно уточнить

=== АВТОРИЗАЦИЯ ===
API Key — получается после регистрации и добавления тестовой кассы в личном кабинете.
REQUIRES VERIFICATION: Точный механизм auth (header vs query, имя header).
Предположительно: Header `X-API-Key: {key}` или `Authorization: Bearer {token}`
Env: WEBKASSA_API_KEY, WEBKASSA_LOGIN, WEBKASSA_PASSWORD

=== 8 TOOLS С ZOD-СХЕМАМИ ===

1. create_receipt
   Описание: "Пробить фискальный чек (продажа)"
   Input: z.object({
     items: z.array(z.object({
       name: z.string().describe("Название товара/услуги"),
       quantity: z.number().positive().describe("Количество"),
       price: z.number().positive().describe("Цена за единицу в тенге"),
       tax_type: z.enum(["VAT_16", "VAT_10", "VAT_5", "NO_VAT"]).optional().default("VAT_16")
         .describe("Тип НДС (с 2026: 16%, 10%, 5% или без НДС)"),
       unit: z.string().optional().default("шт").describe("Единица измерения")
     })).min(1).describe("Позиции чека"),
     payment_type: z.enum(["CASH", "CARD", "QR", "CREDIT", "MIXED"]).describe("Тип оплаты"),
     cash_register_id: z.string().describe("ID кассового аппарата")
   })

2. create_refund_receipt
   Описание: "Пробить чек возврата"
   Input: z.object({
     original_receipt_id: z.string().describe("ID оригинального чека для возврата"),
     items: z.array(z.object({
       name: z.string(),
       quantity: z.number().positive(),
       price: z.number().positive(),
       tax_type: z.enum(["VAT_16", "VAT_10", "VAT_5", "NO_VAT"]).optional()
     })).min(1).describe("Позиции для возврата"),
     payment_type: z.enum(["CASH", "CARD", "QR"]).describe("Тип возврата"),
     reason: z.string().describe("Причина возврата")
   })

3. get_z_report
   Описание: "Сформировать Z-отчёт (закрытие смены)"
   Input: z.object({
     cash_register_id: z.string().describe("ID кассового аппарата")
   })
   Ответ: итоговые суммы за смену, количество чеков, налоги

4. get_x_report
   Описание: "Сформировать X-отчёт (промежуточный, без закрытия смены)"
   Input: z.object({
     cash_register_id: z.string().describe("ID кассового аппарата")
   })

5. get_receipt_status
   Описание: "Получить статус фискального чека"
   Input: z.object({
     receipt_id: z.string().describe("ID чека")
   })

6. get_receipt_archive
   Описание: "Получить архив чеков за период"
   Input: z.object({
     cash_register_id: z.string().describe("ID кассового аппарата"),
     date_from: z.string().describe("Дата начала (ISO 8601)"),
     date_to: z.string().describe("Дата окончания (ISO 8601)"),
     page: z.number().int().min(1).optional().default(1),
     page_size: z.number().int().min(1).max(100).optional().default(20)
   })

7. get_cash_registers
   Описание: "Список кассовых аппаратов"
   Input: z.object({})

8. check_connection
   Описание: "Проверить соединение с ОФД (оператор фискальных данных)"
   Input: z.object({
     cash_register_id: z.string().describe("ID кассового аппарата")
   })

=== НДС 2026 ===
С 2026 года в Казахстане новые ставки НДС:
- 16% (стандартная, ранее 12%)
- 10% (социальная, новая)
- 5% (для малого бизнеса, новая)
REQUIRES VERIFICATION: Точные даты вступления новых ставок. Проверить: https://kgd.gov.kz

=== ОБРАБОТКА ОШИБОК ===
- Ошибка ОФД-соединения: "Нет связи с ОФД. Чек будет отправлен при восстановлении связи."
- Невалидный чек: подробная ошибка валидации (обязательные поля)
- Смена уже закрыта: "Смена закрыта. Откройте новую смену."
- Дублирование: "Чек с таким ID уже существует"

=== RATE LIMITS ===
REQUIRES VERIFICATION. Предположительно без жёстких лимитов для обычных операций.

=== README СТРУКТУРА ===
README на русском:
1. Заголовок + бейджи
2. Описание: MCP-сервер для Webkassa — онлайн-фискализация в Казахстане
3. Контекст: почему это обязательно (закон о ККМ)
4. Установка
5. Настройка
6. Инструменты — таблица
7. Ставки НДС 2026 — таблица
8. Примеры ("Пробей чек: молоко 500тг 2шт, хлеб 300тг 1шт, оплата картой")
9. Часть серии "Russian & CIS API MCP"
10. Лицензия MIT

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- zod
```

## 6.2 Pre-implementation checklist

- [ ] **Регистрация:** https://webkassa.kz — создать аккаунт
- [ ] **REQUIRES VERIFICATION:** Найти точный URL документации API (запросить у support@webkassa.kz или найти в ЛК)
- [ ] **REQUIRES VERIFICATION:** Получить Postman collection — в документации указано что она предоставляется
- [ ] **Sandbox:** Тестовый стенд существует, **REQUIRES VERIFICATION** URL
- [ ] **Тестовые данные:** Добавить тестовую кассу в ЛК, получить API Key, пробить тестовый чек
- [ ] **Проверить НДС:** Уточнить актуальные ставки НДС на 2026

**Известные gotchas из ресёрча:**
- 300+ интеграций уже существует — значит API стабильный и документированный
- Обязательная фискализация — каждый ритейл-бизнес в КЗ обязан использовать
- ОФД операторы: WOFD (https://wofd.kz), Kazakhtelecom OFD (https://oofd.kz)
- Смешанные платежи (MIXED) — часть наличными, часть картой — нужно поддержать
- 2026: новые ставки НДС 16%/10%/5% (ранее было 12%) — критично правильно реализовать

## 6.3 Post-implementation checklist

- [ ] **npm publish:** `npm publish --access public`
- [ ] **mcp-publisher publish**
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/webkassa-mcp"
  description: "MCP-сервер для Webkassa — онлайн-фискализация / ОФД Казахстана"
  license: MIT
  config:
    env:
      - name: WEBKASSA_API_KEY
        required: true
      - name: WEBKASSA_LOGIN
        required: true
      - name: WEBKASSA_PASSWORD
        required: true
  ```
- [ ] **Анонс:** @workitkz, @thetechkz, @backenderskz — акцент на "обязательная фискализация"

---

# СЕРВЕР 7: forte-mcp (ForteBank Payments)

**Приоритет:** 7
**Сложность:** Средне
**Время:** 3 дня
**Авторизация:** HTTP Basic (Shop ID + Secret Key)

## 7.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/forte-mcp для ForteBank Payment API.

=== ДОКУМЕНТАЦИЯ ===
https://docs.fortebank.com/en/ (MkDocs, отличная структура)
Postman collection: https://docs.fortebank.com/en/using_api/postman_collection/

=== BASE URL ===
Production: https://gateway.fortebank.com
Sandbox: REQUIRES VERIFICATION — предположительно https://sandbox.fortebank.com или тестовый режим в том же URL
Products API: https://epsp.fortebank.com/products

=== АВТОРИЗАЦИЯ ===
HTTP Basic Auth:
  Username: Shop ID
  Password: Secret Key
Header: Authorization: Basic {base64(shopId:secretKey)}
Env: FORTE_SHOP_ID, FORTE_SECRET_KEY

=== 10 TOOLS С ZOD-СХЕМАМИ ===

1. create_payment
   Описание: "Создать платёж через ForteBank"
   Input: z.object({
     amount: z.number().positive().describe("Сумма в тенге (в минорных единицах — тиынах, *100)"),
     currency: z.string().optional().default("KZT").describe("Валюта"),
     order_id: z.string().describe("Уникальный ID заказа"),
     description: z.string().optional().describe("Описание платежа"),
     return_url: z.string().url().describe("URL для редиректа после оплаты"),
     customer_email: z.string().email().optional().describe("Email плательщика")
   })
   Endpoint: POST https://gateway.fortebank.com/transactions/payments
   Headers: Authorization: Basic {credentials}, Content-Type: application/json
   Body: { amount, currency, orderId, description, returnUrl, customerEmail }

2. create_authorization
   Описание: "Создать авторизацию (холдирование, двухстадийный платёж)"
   Input: z.object({
     amount: z.number().positive().describe("Сумма холдирования в тиынах"),
     order_id: z.string().describe("ID заказа"),
     return_url: z.string().url().describe("URL редиректа"),
     description: z.string().optional()
   })
   Endpoint: POST https://gateway.fortebank.com/transactions/authorizations

3. capture_payment
   Описание: "Подтвердить авторизацию (capture)"
   Input: z.object({
     transaction_id: z.string().describe("ID транзакции авторизации"),
     amount: z.number().positive().describe("Сумма capture в тиынах (может быть ≤ авторизации)")
   })
   Endpoint: POST https://gateway.fortebank.com/transactions/{transaction_id}/capture

4. void_payment
   Описание: "Отменить авторизацию (void)"
   Input: z.object({
     transaction_id: z.string().describe("ID транзакции")
   })
   Endpoint: POST https://gateway.fortebank.com/transactions/{transaction_id}/void

5. refund_payment
   Описание: "Возврат платежа (полный или частичный)"
   Input: z.object({
     transaction_id: z.string().describe("ID транзакции"),
     amount: z.number().positive().describe("Сумма возврата в тиынах")
   })
   Endpoint: POST https://gateway.fortebank.com/transactions/{transaction_id}/refund

6. create_payout
   Описание: "Выплата на карту (AFT/OCT)"
   Input: z.object({
     amount: z.number().positive().describe("Сумма выплаты в тиынах"),
     card_number: z.string().optional().describe("Номер карты получателя"),
     card_token: z.string().optional().describe("Токен карты (если ранее токенизирована)"),
     order_id: z.string().describe("ID операции")
   })
   Endpoint: POST https://gateway.fortebank.com/transactions/payout

7. get_transaction_status
   Описание: "Получить статус транзакции"
   Input: z.object({
     transaction_id: z.string().optional().describe("ID транзакции ForteBank"),
     order_id: z.string().optional().describe("ID заказа мерчанта")
   })
   Endpoint: GET https://gateway.fortebank.com/transactions/{transaction_id}/status
   или GET https://gateway.fortebank.com/transactions?orderId={order_id}

8. create_pay_link
   Описание: "Создать ссылку на оплату (pay-by-link)"
   Input: z.object({
     amount: z.number().positive().describe("Сумма в тиынах"),
     description: z.string().describe("Описание"),
     order_id: z.string().describe("ID заказа"),
     expiry_date: z.string().optional().describe("Срок действия ссылки (ISO 8601)")
   })
   Endpoint: POST https://epsp.fortebank.com/products
   Headers: Authorization: Basic {credentials}

9. create_subscription
   Описание: "Создать подписку (рекуррентный платёж)"
   Input: z.object({
     amount: z.number().positive().describe("Сумма подписки в тиынах"),
     interval: z.enum(["daily", "weekly", "monthly", "yearly"]).describe("Интервал списания"),
     card_token: z.string().describe("Токен карты"),
     description: z.string().optional(),
     start_date: z.string().optional().describe("Дата начала (ISO 8601)")
   })
   Endpoint: POST https://gateway.fortebank.com/subscriptions

10. get_balance
    Описание: "Получить баланс мерчант-аккаунта"
    Input: z.object({})
    Endpoint: GET https://gateway.fortebank.com/balance
    Headers: Authorization: Basic {credentials}

=== RATE LIMITS ===
HTTP 429 — задокументировано. Рекомендуется exponential backoff.
Реализовать: retry при 429 с backoff (1s, 2s, 4s, 8s, макс 3 retry).

=== ОБРАБОТКА ОШИБОК ===
- 401: "Неверные Shop ID или Secret Key. Документация: https://docs.fortebank.com/en/"
- 429: "Too Many Requests" — retry с backoff
- 400: детальная ошибка валидации из response body
- 404: "Транзакция не найдена"
- Суммы в тиынах: предупреждать если пользователь вероятно передал тенге вместо тиынов (amount < 100 → предупреждение)

=== SANDBOX ===
Sandbox существует. Postman collection: https://docs.fortebank.com/en/using_api/postman_collection/
REQUIRES VERIFICATION: Точные тестовые credentials (Shop ID, Secret Key). Получить в личном кабинете ForteBank.

=== ENV VARS ===
FORTE_SHOP_ID — обязательный
FORTE_SECRET_KEY — обязательный
FORTE_ENVIRONMENT — "sandbox" | "production" (default: "sandbox")

=== ВАЖНО: СУММЫ В ТИЫНАХ ===
ForteBank API принимает суммы в минорных единицах (тиынах).
1 тенге = 100 тиынов. Сумма 5000 тенге = 500000 тиынов.
Реализовать helper для конвертации: пользователь вводит в тенге, API получает тиыны.
REQUIRES VERIFICATION: Проверить что действительно тиыны, а не тенге — у разных банков по-разному.

=== README СТРУКТУРА ===
README на русском:
1. Заголовок + бейджи
2. Описание: MCP-сервер для ForteBank — платежи, возвраты, выплаты, подписки
3. Установка
4. Настройка — HTTP Basic Auth
5. Sandbox — как тестировать
6. Инструменты — таблица
7. Apple Pay / Google Pay / Samsung Pay — поддержка
8. Примеры
9. Часть серии "Russian & CIS API MCP"
10. Лицензия MIT

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- zod
```

## 7.2 Pre-implementation checklist

- [ ] **Регистрация:** https://docs.fortebank.com — зарегистрироваться как мерчант
  - **REQUIRES VERIFICATION:** Нужен ли казахстанский ИП/ТОО. Проверить: попробовать регистрацию.
- [ ] **Sandbox:** Есть, Postman collection есть. Скачать: https://docs.fortebank.com/en/using_api/postman_collection/
- [ ] **Тестовые данные:** Тестовые карты из Postman collection
- [ ] **Проверить:** Суммы в тиынах или тенге
- [ ] **Скачать Postman collection** и изучить все endpoints

**Известные gotchas из ресёрча:**
- HTTP Basic Auth — Username это Shop ID, Password это Secret Key
- 429 rate limiting задокументирован — ОБЯЗАТЕЛЬНО реализовать retry
- Поддерживает Apple Pay, Google Pay, Samsung Pay
- Products API на другом домене: https://epsp.fortebank.com/products
- AFT/OCT — Account Funding Transaction / Original Credit Transaction для выплат на карты
- Чистая MkDocs документация — лучшая среди KZ-банков

## 7.3 Post-implementation checklist

- [ ] **npm publish:** `npm publish --access public`
- [ ] **mcp-publisher publish**
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/forte-mcp"
  description: "MCP-сервер для ForteBank — платежи, возвраты, выплаты, подписки"
  license: MIT
  config:
    env:
      - name: FORTE_SHOP_ID
        required: true
      - name: FORTE_SECRET_KEY
        required: true
      - name: FORTE_ENVIRONMENT
        required: false
        default: "sandbox"
  ```
- [ ] **Анонс:** @thetechkz, @backenderskz, @devkz_jobs

---

# СЕРВЕР 8: freedompay-kz-mcp (Freedom Pay)

**Приоритет:** 8
**Сложность:** Средне
**Время:** 3 дня
**Авторизация:** MD5 Signature (pg_sig)

## 8.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/freedompay-kz-mcp для Freedom Pay API (бывший PayBox.money).

=== ДОКУМЕНТАЦИЯ ===
https://docs.freedompay.kz/

=== КОНТЕКСТ ===
Freedom Pay (ранее PayBox.money, приобретён Freedom Holding за $11.5M в 2021).
Работает в 3 странах: Казахстан, Кыргызстан, Узбекистан.
CMS-плагины: WooCommerce, OpenCart, 1C-Bitrix, PrestaShop, Tilda, Ecwid.
Два уровня:
  - Merchant API (без PCI DSS) — redirect на страницу оплаты
  - Gateway API (PCI DSS required) — прямые карточные операции

=== BASE URL ===
Merchant API: https://api.freedompay.kz/
Gateway API: REQUIRES VERIFICATION — вероятно тот же домен с другими endpoints

=== АВТОРИЗАЦИЯ ===
MD5 Signature (pg_sig):
1. Собрать все параметры запроса (кроме pg_sig) в алфавитном порядке
2. Добавить secret_key в конец
3. Вычислить MD5 от конкатенации: md5(script_name + sorted_params_values + secret_key)

Пример:
  Параметры: pg_merchant_id=123, pg_order_id=456, pg_amount=5000
  Sorted values: script_name;123;5000;456;SECRET_KEY
  pg_sig = md5("init_payment.php;123;5000;456;my_secret_key")

Env: FREEDOMPAY_MERCHANT_ID, FREEDOMPAY_SECRET_KEY

=== 8 TOOLS С ZOD-СХЕМАМИ ===

1. init_payment
   Описание: "Инициализировать платёж (получить URL страницы оплаты)"
   Input: z.object({
     amount: z.number().positive().describe("Сумма в тенге"),
     description: z.string().describe("Описание платежа"),
     order_id: z.string().describe("ID заказа"),
     currency: z.string().optional().default("KZT").describe("Валюта: KZT, KGS, UZS"),
     result_url: z.string().url().optional().describe("URL для callback"),
     success_url: z.string().url().optional().describe("URL при успехе"),
     failure_url: z.string().url().optional().describe("URL при ошибке"),
     language: z.enum(["ru", "en", "kk"]).optional().default("ru").describe("Язык формы"),
     recurring_start: z.boolean().optional().default(false).describe("Начать рекуррентные платежи"),
     user_phone: z.string().optional().describe("Телефон плательщика"),
     user_email: z.string().email().optional().describe("Email плательщика")
   })
   Endpoint: POST https://api.freedompay.kz/init_payment.php
   Params: pg_merchant_id, pg_order_id, pg_amount, pg_description, pg_currency, pg_result_url, pg_success_url, pg_failure_url, pg_language, pg_recurring_start, pg_user_phone, pg_user_contact_email, pg_sig
   Ответ: XML { pg_redirect_url, pg_payment_id }

2. get_payment_status
   Описание: "Проверить статус платежа"
   Input: z.object({
     payment_id: z.string().describe("ID платежа (pg_payment_id из init_payment)")
   })
   Endpoint: POST https://api.freedompay.kz/get_status.php
   Params: pg_merchant_id, pg_payment_id, pg_sig

3. cancel_payment
   Описание: "Отменить платёж"
   Input: z.object({
     payment_id: z.string().describe("ID платежа")
   })
   Endpoint: POST https://api.freedompay.kz/cancel.php

4. refund_payment
   Описание: "Возврат платежа (полный или частичный)"
   Input: z.object({
     payment_id: z.string().describe("ID платежа"),
     amount: z.number().positive().describe("Сумма возврата в тенге"),
     description: z.string().optional().describe("Причина возврата")
   })
   Endpoint: POST https://api.freedompay.kz/refund.php
   Params: pg_merchant_id, pg_payment_id, pg_refund_amount, pg_sig

5. create_recurring
   Описание: "Выполнить рекуррентный платёж по сохранённой карте"
   Input: z.object({
     amount: z.number().positive().describe("Сумма в тенге"),
     order_id: z.string().describe("ID нового заказа"),
     recurring_profile_id: z.string().describe("ID рекуррентного профиля"),
     description: z.string().optional()
   })
   Endpoint: POST https://api.freedompay.kz/make_recurring_payment.php

6. create_payout
   Описание: "Выплата на карту или IBAN"
   Input: z.object({
     amount: z.number().positive().describe("Сумма выплаты в тенге"),
     order_id: z.string().describe("ID операции"),
     card_number: z.string().optional().describe("Номер карты получателя"),
     iban: z.string().optional().describe("IBAN получателя (если выплата на счёт)"),
     description: z.string().optional()
   })
   Endpoint: REQUIRES VERIFICATION — POST https://api.freedompay.kz/create_payout.php

7. create_invoice
   Описание: "Создать счёт/инвойс для оплаты"
   Input: z.object({
     amount: z.number().positive().describe("Сумма в тенге"),
     description: z.string().describe("Описание"),
     order_id: z.string().describe("ID заказа"),
     due_date: z.string().optional().describe("Срок оплаты")
   })
   Endpoint: REQUIRES VERIFICATION

8. mobile_payment
   Описание: "Оплата с мобильного баланса"
   Input: z.object({
     amount: z.number().positive().describe("Сумма в тенге"),
     phone: z.string().describe("Номер телефона (+7XXXXXXXXXX)"),
     order_id: z.string().describe("ID заказа"),
     description: z.string().optional()
   })
   Endpoint: REQUIRES VERIFICATION — см. документацию mobile balance payments

=== ОТВЕТЫ — XML ===
ВАЖНО: Freedom Pay API отвечает XML, НЕ JSON.
Пример ответа:
<response>
  <pg_status>ok</pg_status>
  <pg_payment_id>12345</pg_payment_id>
  <pg_redirect_url>https://api.freedompay.kz/pay/12345</pg_redirect_url>
</response>

Парсить XML → JSON с fast-xml-parser.

=== ФУНКЦИЯ ПОДПИСИ (pg_sig) ===
Реализовать helper:

function createSignature(scriptName: string, params: Record<string, string>, secretKey: string): string {
  // 1. Отсортировать params по ключам в алфавитном порядке
  const sortedKeys = Object.keys(params).sort();
  // 2. Собрать значения
  const values = sortedKeys.map(k => params[k]);
  // 3. Конкатенировать: scriptName;value1;value2;...;secretKey
  const toSign = [scriptName, ...values, secretKey].join(';');
  // 4. MD5
  return crypto.createHash('md5').update(toSign).digest('hex');
}

=== ОБРАБОТКА ОШИБОК ===
- pg_status: "error" → вернуть pg_error_description
- Невалидная подпись: "Ошибка pg_sig. Проверьте FREEDOMPAY_SECRET_KEY."
- Платёж не найден: "Платёж не найден. Проверьте payment_id."

=== RATE LIMITS ===
Не задокументированы.

=== SANDBOX ===
Тестовый режим доступен в личном кабинете Freedom Pay.
REQUIRES VERIFICATION: Тестовые credentials (merchant_id, secret_key). Получить при регистрации.

=== ENV VARS ===
FREEDOMPAY_MERCHANT_ID — обязательный
FREEDOMPAY_SECRET_KEY — обязательный

=== README СТРУКТУРА ===
README на русском:
1. Заголовок + бейджи
2. Описание: MCP-сервер для Freedom Pay — платежи в КЗ, КГ, УЗ
3. Установка
4. Настройка
5. Как работает подпись (pg_sig) — схема
6. Инструменты — таблица
7. Примеры
8. Поддерживаемые CMS (WooCommerce, OpenCart, 1C-Bitrix, PrestaShop, Tilda, Ecwid)
9. Часть серии "Russian & CIS API MCP"
10. Лицензия MIT

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- zod
- fast-xml-parser (ответы в XML)
```

## 8.2 Pre-implementation checklist

- [ ] **Регистрация:** https://freedompay.kz — зарегистрироваться как мерчант
- [ ] **Sandbox:** Тестовый режим в ЛК, **REQUIRES VERIFICATION** точные тестовые credentials
- [ ] **Тестовые данные:** Тестовые карты из документации
- [ ] **Документация:** Прочитать https://docs.freedompay.kz/ целиком — уточнить endpoints для payout, invoice, mobile payment
- [ ] **Ruby gem reference:** https://github.com/maddevsio/paybox_api — использовать как reference для подписи

**Известные gotchas из ресёрча:**
- Ответы в XML, НЕ JSON — обязательно парсить
- MD5 подпись (pg_sig) — сложный механизм, нужна точная реализация
- Работает в 3 странах: KZ, KG, UZ — можно позиционировать шире
- npm-пакет `paybox` — для ФРАНЦУЗСКОГО Paybox, НЕ для казахстанского
- Существующие SDKs: JS, Android, iOS, Ruby gem (maddevsio/paybox_api)

## 8.3 Post-implementation checklist

- [ ] **npm publish:** `npm publish --access public`
- [ ] **mcp-publisher publish**
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/freedompay-kz-mcp"
  description: "MCP-сервер для Freedom Pay — платежи в Казахстане, Кыргызстане, Узбекистане"
  license: MIT
  config:
    env:
      - name: FREEDOMPAY_MERCHANT_ID
        required: true
      - name: FREEDOMPAY_SECRET_KEY
        required: true
  ```
- [ ] **Анонс:** @thetechkz, @backenderskz — акцент на "3 страны: КЗ + КГ + УЗ"

---

# СЕРВЕР 9: kazpost-mcp (KazPost — Казпочта)

**Приоритет:** 9
**Сложность:** Легко
**Время:** 2 дня
**Авторизация:** API Key

## 9.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/kazpost-mcp для KazPost API (Казпочта — государственная почтовая служба Казахстана).

=== ДОКУМЕНТАЦИЯ ===
Tracking: https://track.kazpost.kz/api/
Delivery Module: https://rates.kazpost.kz (SOAP-based)
Личный кабинет: https://kabinet.kazpost.kz

=== ENDPOINTS ===

REST Tracking API:
- Base URL: https://track.post.kz/api/v2/
- GET https://track.post.kz/api/v2/{barcode} — трекинг по штрих-коду
- Ответ: JSON с историей перемещения посылки

SOAP Delivery Module (https://rates.kazpost.kz):
- Расчёт тарифов
- Генерация этикеток
- Генерация трек-номеров
- Тестовые и production endpoints
REQUIRES VERIFICATION: Точные SOAP-endpoints и WSDL URL

=== АВТОРИЗАЦИЯ ===
API Key из личного кабинета KazPost (https://kabinet.kazpost.kz)
REQUIRES VERIFICATION: Механизм передачи ключа — Header (Authorization, X-API-Key?) или query parameter
Env: KAZPOST_API_KEY

=== 6 TOOLS С ZOD-СХЕМАМИ ===

1. track_parcel
   Описание: "Отследить посылку по штрих-коду (трек-номеру)"
   Input: z.object({
     barcode: z.string().describe("Штрих-код / трек-номер посылки (пример: RR123456789KZ)")
   })
   Endpoint: GET https://track.post.kz/api/v2/{barcode}
   Ответ: { events: [{ date, status, location, description }], current_status, origin, destination }

2. track_multiple
   Описание: "Отследить несколько посылок одновременно"
   Input: z.object({
     barcodes: z.array(z.string()).min(1).max(20).describe("Массив штрих-кодов (макс 20)")
   })
   Реализация: параллельные запросы к track API

3. calculate_tariff
   Описание: "Рассчитать стоимость отправки"
   Input: z.object({
     from_postcode: z.string().describe("Почтовый индекс отправителя (6 цифр, пример: 050000)"),
     to_postcode: z.string().describe("Почтовый индекс получателя"),
     weight: z.number().positive().describe("Вес в граммах"),
     type: z.enum(["letter", "parcel", "ems", "registered"]).describe("Тип отправления"),
     declared_value: z.number().optional().describe("Объявленная ценность в тенге")
   })
   Endpoint: SOAP https://rates.kazpost.kz/... (REQUIRES VERIFICATION)
   Альтернатива: если SOAP слишком сложен, использовать скрейпинг https://post.kz/tariffs

4. get_offices
   Описание: "Найти отделения Казпочты"
   Input: z.object({
     city: z.string().optional().describe("Город: 'Алматы', 'Астана'"),
     postcode: z.string().optional().describe("Почтовый индекс")
   })
   Endpoint: REQUIRES VERIFICATION — возможно https://post.kz/api/offices или SOAP
   Альтернатива: хардкод основных отделений + ссылка на карту post.kz

5. validate_postcode
   Описание: "Проверить валидность почтового индекса КЗ"
   Input: z.object({
     postcode: z.string().describe("Почтовый индекс (6 цифр)")
   })
   Реализация: Валидация формата (6 цифр, начинается с 0-1) + lookup в справочнике
   REQUIRES VERIFICATION: API для справочника индексов

6. get_delivery_time
   Описание: "Примерные сроки доставки между городами"
   Input: z.object({
     from_city: z.string().describe("Город отправки"),
     to_city: z.string().describe("Город получения"),
     type: z.enum(["standard", "ems", "express"]).optional().default("standard")
   })
   Реализация: Таблица сроков (хардкод) или SOAP-запрос
   REQUIRES VERIFICATION: Есть ли API для сроков или только тарифный калькулятор

=== ОБРАБОТКА ОШИБОК ===
- Невалидный штрих-код: "Неверный формат трек-номера. Пример: RR123456789KZ"
- Посылка не найдена: "Посылка не найдена. Проверьте трек-номер или попробуйте позже."
- SOAP timeout: "Сервис расчёта тарифов временно недоступен"

=== RATE LIMITS ===
Не задокументированы. Рекомендуется не более 30 req/min.

=== ENV VARS ===
KAZPOST_API_KEY — обязательный (REQUIRES VERIFICATION: нужен ли для tracking или только для delivery module)

=== README СТРУКТУРА ===
README на русском:
1. Заголовок + бейджи
2. Описание: MCP-сервер для Казпочты — трекинг, тарифы, отделения
3. Установка
4. Настройка — как получить API Key
5. Инструменты — таблица
6. Примеры ("Где моя посылка RR123456789KZ?", "Сколько стоит отправить из Алматы в Астану?")
7. Часть серии "Russian & CIS API MCP"
8. Лицензия MIT

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- zod
- soap (для SOAP endpoints, если используются)
```

## 9.2 Pre-implementation checklist

- [ ] **Регистрация:** https://kabinet.kazpost.kz — создать аккаунт, получить API Key
- [ ] **REQUIRES VERIFICATION:** Tracking API (https://track.post.kz/api/v2/) — попробовать с реальным трек-номером БЕЗ API key. Возможно tracking — открытый API.
- [ ] **REQUIRES VERIFICATION:** SOAP WSDL для delivery module — найти URL
- [ ] **Sandbox:** Тестовые endpoints на rates.kazpost.kz — **REQUIRES VERIFICATION**
- [ ] **Тестовые данные:** Взять реальный трек-номер с post.kz для тестирования tracking
- [ ] **Проверить third-party:** Ship24, AfterShip предоставляют REST-обёртки для KazPost — можно использовать как fallback

**Известные gotchas из ресёрча:**
- Tracking API — REST (JSON), Delivery Module — SOAP (XML) — два разных протокола
- Нет официальных SDKs ни на каком языке
- Third-party агрегаторы (Ship24, AfterShip) предоставляют REST-обёртки
- Личный кабинет: kabinet.kazpost.kz
- Почтовые индексы КЗ: 6 цифр (от 010000 до 161000)

## 9.3 Post-implementation checklist

- [ ] **npm publish:** `npm publish --access public`
- [ ] **mcp-publisher publish**
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/kazpost-mcp"
  description: "MCP-сервер для Казпочты — трекинг посылок и расчёт тарифов"
  license: MIT
  config:
    env:
      - name: KAZPOST_API_KEY
        required: true
  ```
- [ ] **Анонс:** @thetechkz, @bluescreenkz

---

# СЕРВЕР 10: satu-kz-mcp (Satu.kz Marketplace)

**Приоритет:** 10
**Сложность:** Средне
**Время:** 3 дня
**Авторизация:** Token (Bearer)

## 10.1 Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/satu-kz-mcp для Satu.kz Marketplace API.

=== КОНТЕКСТ ===
Satu.kz — казахстанский маркетплейс, часть группы EVO/Prom.ua.
API идентичен Prom.ua API — можно использовать как reference.
Swagger/OpenAPI документация доступна.

=== ДОКУМЕНТАЦИЯ ===
https://public-api.docs.satu.kz/ (Swagger/OpenAPI)
Reference: Prom.ua API (тот же формат)

=== BASE URL ===
REQUIRES VERIFICATION: Предположительно https://satu.kz/api/ или https://api.satu.kz/
Swagger: https://public-api.docs.satu.kz/

=== АВТОРИЗАЦИЯ ===
Token-based auth
Header: Authorization: Bearer {token}
Токен получается в личном кабинете продавца на satu.kz
Env: SATU_API_TOKEN

=== 8 TOOLS С ZOD-СХЕМАМИ ===

1. get_products
   Описание: "Получить список товаров"
   Input: z.object({
     page: z.number().int().min(1).optional().default(1),
     per_page: z.number().int().min(1).max(100).optional().default(20),
     group_id: z.number().optional().describe("ID группы/категории товаров"),
     status: z.enum(["active", "draft", "deleted"]).optional().describe("Статус товара")
   })
   Endpoint: GET {base}/products?page={page}&per_page={per_page}&group_id={group_id}

2. get_product
   Описание: "Получить детали товара"
   Input: z.object({
     product_id: z.number().describe("ID товара")
   })
   Endpoint: GET {base}/products/{product_id}

3. create_product
   Описание: "Создать новый товар"
   Input: z.object({
     name: z.string().describe("Название товара"),
     price: z.number().positive().describe("Цена в тенге"),
     description: z.string().optional().describe("Описание HTML"),
     group_id: z.number().describe("ID категории"),
     sku: z.string().optional().describe("Артикул"),
     quantity_in_stock: z.number().int().min(0).optional().describe("Количество на складе"),
     images: z.array(z.string().url()).optional().describe("URLs изображений")
   })
   Endpoint: POST {base}/products

4. update_product
   Описание: "Обновить товар"
   Input: z.object({
     product_id: z.number().describe("ID товара"),
     name: z.string().optional(),
     price: z.number().positive().optional(),
     description: z.string().optional(),
     quantity_in_stock: z.number().int().min(0).optional(),
     status: z.enum(["active", "draft"]).optional()
   })
   Endpoint: PUT {base}/products/{product_id}

5. get_orders
   Описание: "Получить список заказов"
   Input: z.object({
     status: z.enum(["pending", "accepted", "declined", "completed", "cancelled"]).optional(),
     date_from: z.string().optional().describe("Дата начала (ISO 8601)"),
     date_to: z.string().optional().describe("Дата окончания"),
     page: z.number().int().min(1).optional().default(1),
     per_page: z.number().int().min(1).max(100).optional().default(20)
   })
   Endpoint: GET {base}/orders

6. update_order_status
   Описание: "Обновить статус заказа"
   Input: z.object({
     order_id: z.number().describe("ID заказа"),
     status: z.enum(["accepted", "declined", "completed"]).describe("Новый статус"),
     decline_reason: z.string().optional().describe("Причина отклонения (если declined)")
   })
   Endpoint: PUT {base}/orders/{order_id}

7. get_categories
   Описание: "Получить дерево категорий Satu.kz"
   Input: z.object({
     parent_id: z.number().optional().describe("ID родительской категории (для вложенных)")
   })
   Endpoint: GET {base}/groups

8. send_message
   Описание: "Отправить сообщение клиенту"
   Input: z.object({
     order_id: z.number().describe("ID заказа"),
     message: z.string().describe("Текст сообщения")
   })
   Endpoint: POST {base}/orders/{order_id}/messages
   REQUIRES VERIFICATION: точный endpoint для messaging

=== DELIVERY TRACKING ===
Satu.kz поддерживает обновление трек-номеров для заказов:
update_order_status → можно передать tracking_number
REQUIRES VERIFICATION: точный формат поля для tracking

=== ОБРАБОТКА ОШИБОК ===
- 401: "Невалидный токен. Получите в личном кабинете satu.kz."
- 422: ошибки валидации из response body
- 404: "Товар/заказ не найден"

=== RATE LIMITS ===
REQUIRES VERIFICATION. Предположительно стандартные для Prom.ua/EVO: ~60 req/min.

=== ENV VARS ===
SATU_API_TOKEN — обязательный

=== README СТРУКТУРА ===
README на русском:
1. Заголовок + бейджи
2. Описание: MCP-сервер для Satu.kz — товары, заказы, сообщения
3. Установка
4. Настройка — как получить Token
5. Инструменты — таблица
6. OpenAPI/Swagger — ссылка на документацию
7. Примеры ("Покажи заказы за сегодня", "Создай товар: iPhone 15 за 450000тг")
8. Совместимость с Prom.ua API
9. Часть серии "Russian & CIS API MCP"
10. Лицензия MIT

=== DEPENDENCIES ===
- @modelcontextprotocol/sdk
- zod
```

## 10.2 Pre-implementation checklist

- [ ] **Регистрация:** https://satu.kz — зарегистрироваться как продавец
- [ ] **REQUIRES VERIFICATION:** Изучить Swagger UI на https://public-api.docs.satu.kz/ — скопировать все endpoints, base URL, auth mechanism
- [ ] **Sandbox:** REQUIRES VERIFICATION — проверить есть ли тестовый режим
- [ ] **Тестовые данные:** Создать тестовый магазин на satu.kz, добавить товары
- [ ] **Prom.ua reference:** Изучить https://public-api.docs.prom.ua/ — тот же API

**Известные gotchas из ресёрча:**
- API идентичен Prom.ua (EVO group) — можно использовать Prom.ua доку как дополнительный reference
- OpenAPI/Swagger есть — можно автоматически сгенерировать типы
- Token-based auth — Bearer token
- Endpoints для products (CRUD), orders (status management), delivery (tracking numbers), categories, client messaging

## 10.3 Post-implementation checklist

- [ ] **npm publish:** `npm publish --access public`
- [ ] **mcp-publisher publish**
- [ ] **smithery.yaml:**
  ```yaml
  name: "@theyahia/satu-kz-mcp"
  description: "MCP-сервер для Satu.kz маркетплейса — товары, заказы, сообщения"
  license: MIT
  config:
    env:
      - name: SATU_API_TOKEN
        required: true
  ```
- [ ] **Анонс:** @thetechkz, @workitkz

---

# ОБЩАЯ ТАБЛИЦА: REQUIRES VERIFICATION

Все пункты, требующие верификации перед началом разработки:

| # | Сервер | Что проверить | Как проверить |
|---|--------|---------------|---------------|
| 1 | nbk-mcp | Ничего — всё точно | - |
| 2 | kaspi-merchant-mcp | Нужен ли казахстанский ИП для тестового аккаунта | Написать support@kaspi.kz |
| 3 | 2gis-mcp | Ничего — всё точно | - |
| 4 | halyk-epay-mcp | Актуальность тестовых credentials | Открыть https://epayment.kz/en-US/docs/Test%20credentials |
| 5 | data-egov-kz-mcp | Нужен ли KZ-номер для регистрации | Попробовать зарегистрироваться |
| 5 | data-egov-kz-mcp | Endpoint для поиска датасетов | Изучить API docs |
| 5 | data-egov-kz-mcp | Популярные dataset_id для хардкода | Поискать на data.egov.kz |
| 6 | webkassa-mcp | URL документации API | support@webkassa.kz или ЛК |
| 6 | webkassa-mcp | Base URL API | Из документации |
| 6 | webkassa-mcp | URL тестового стенда | Из документации |
| 6 | webkassa-mcp | Актуальные ставки НДС 2026 | https://kgd.gov.kz |
| 7 | forte-mcp | Sandbox URL | https://docs.fortebank.com/en/ |
| 7 | forte-mcp | Тестовые credentials | Личный кабинет ForteBank |
| 7 | forte-mcp | Суммы: тиыны или тенге | Из Postman collection |
| 8 | freedompay-kz-mcp | Endpoints для payout, invoice, mobile payment | https://docs.freedompay.kz/ |
| 8 | freedompay-kz-mcp | Тестовые credentials | Регистрация + ЛК |
| 9 | kazpost-mcp | Нужен ли API Key для tracking | Попробовать без ключа |
| 9 | kazpost-mcp | SOAP WSDL URL для delivery module | https://rates.kazpost.kz |
| 10 | satu-kz-mcp | Base URL API | https://public-api.docs.satu.kz/ |
| 10 | satu-kz-mcp | Наличие sandbox | Swagger UI |

---

# TIMELINE

| Неделя | Серверы | Дней |
|--------|---------|------|
| 1 | nbk-mcp (1 день) + 2gis-mcp (3 дня) + начало kaspi | 5 |
| 2 | kaspi-merchant-mcp (4 дня) + data-egov-kz-mcp (2 дня) | 5 |
| 3 | halyk-epay-mcp (4 дня) + webkassa-mcp (начало) | 5 |
| 4 | webkassa-mcp (2 дня) + forte-mcp (3 дня) | 5 |
| 5 | freedompay-kz-mcp (3 дня) + kazpost-mcp (2 дня) | 5 |
| 6 | satu-kz-mcp (3 дня) + финальный QA + Habr-статьи | 5 |

**Итого: ~6 недель / 28 рабочих дней на 10 серверов**

---

# СТРАТЕГИЯ АНОНСОВ

## Волна 1 (после nbk-mcp + 2gis-mcp + kaspi-merchant-mcp)
**Канал: Habr + Telegram**
- Статья: "Первые MCP-серверы для Казахстана: НБК, 2GIS, Kaspi Marketplace в Claude/Cursor"
- Telegram: @thetechkz, @bluescreenkz, @devkz_jobs, @workitkz
- Формат: пост с GIF/видео демонстрацией

## Волна 2 (после платёжных серверов: halyk, forte, freedompay)
- Статья: "AI + платежи: Halyk ePay, ForteBank, Freedom Pay через MCP"
- Telegram: @backenderskz, @devkz_jobs

## Волна 3 (после всех 10)
- Статья: "10 MCP-серверов для Казахстана: полная экосистема"
- Подать на @digitalbusiness_kz (IT-медиа Казахстана)
- GDG Almaty / GDG Astana — предложить доклад
- GITEX AI Central Asia (Алматы, 4-5 мая 2026) — демо на стенде

---

# КОНФЕРЕНЦИИ ДЛЯ ПРОДВИЖЕНИЯ

| Конференция | Город | Когда | Формат |
|-------------|-------|-------|--------|
| GITEX AI Central Asia | Алматы | 4-5 мая 2026 | Стенд/доклад |
| AI Bridge 2026 | Астана | TBD 2026 | Доклад |
| GDG DevFest | Алматы/Астана | Осень 2026 | Lightning talk |
| Digital Qazaqstan Forum | Шымкент | TBD 2026 | Доклад |
