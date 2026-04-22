# План имплементации: MCP-серверы для Казахстана

**Источник:** RESEARCH_03_KAZAKHSTAN.md
**Статус рынка:** 0 MCP-серверов, 25+ API с документацией, ~60K разработчиков
**Язык README:** русский (основной язык dev-сообщества КЗ)
**npm scope:** `@theyahia/{service}-mcp` (единый бренд)

---

## Приоритизация: 10 серверов в порядке реализации

| # | Сервер | API | Авторизация | Сложность | Дней | Почему сейчас |
|---|--------|-----|-------------|-----------|------|---------------|
| 1 | `nbk-mcp` | НБК курсы валют | Без авторизации | Легко | 1 | Quick win, аналог cbr-mcp |
| 2 | `kaspi-merchant-mcp` | Kaspi Marketplace Seller | X-Auth-Token | Средне | 4 | 721K продавцов, главный приоритет |
| 3 | `2gis-mcp` | 2GIS Maps/Geo/Search | API Key | Средне | 3 | 17 городов КЗ, rich API |
| 4 | `halyk-epay-mcp` | Halyk ePay | OAuth 2.0 | Средне | 4 | Лучшая документация, полный sandbox |
| 5 | `data-egov-kz-mcp` | data.egov.kz | API Key | Легко | 2 | 3000+ датасетов, бесплатно |
| 6 | `webkassa-mcp` | Webkassa OFD | API Key | Средне | 3 | Обязательная фискализация, 300+ интеграций |
| 7 | `forte-mcp` | ForteBank | HTTP Basic | Средне | 3 | Отличная документация, Postman collection |
| 8 | `freedompay-kz-mcp` | Freedom Pay | Signature MD5 | Средне | 3 | Работает в КЗ+КГ+УЗ |
| 9 | `kazpost-mcp` | Казпочта | API Key | Легко | 2 | Трекинг + тарифы |
| 10 | `satu-kz-mcp` | Satu.kz | Token | Средне | 3 | OpenAPI/Swagger есть |

**Итого: ~28 дней на 10 серверов**

---

## Фаза 1: Quick Win — НБК (1 день)

```
Создай MCP-сервер @theyahia/nbk-mcp для API Национального Банка Казахстана.

Авторизация НЕ нужна — полностью открытый API.

Endpoints:
- GET https://nationalbank.kz/rss/rates_all.xml — все курсы (XML)
- GET https://nationalbank.kz/rss/get_rates.cfm?fdate=DD.MM.YYYY — исторические

5 tools:
1. get_all_rates — все ~40 валют на сегодня
2. get_currency_rate — курс конкретной валюты (USD, EUR, RUB, CNY...)
3. get_historical_rates — курсы на конкретную дату
4. convert_currency — конвертация через тенге
5. get_rate_dynamics — изменение курса (direction: UP/DOWN)

Парсить XML → JSON. Поддержка &switch=kazakh для казахского языка.

README на русском. Раздел "Часть серии Russian & CIS API MCP".
```

---

## Фаза 2: Kaspi Marketplace (4 дня)

```
Создай MCP-сервер @theyahia/kaspi-merchant-mcp для Kaspi Marketplace Seller API.

Документация: https://guide.kaspi.kz/partner/ru/shop/api/general
Протокол: JSON:API (application/vnd.api+json)
Base URL: https://kaspi.kz/shop/api/v2
Авторизация: Header X-Auth-Token (из Seller Cabinet)
Env: KASPI_AUTH_TOKEN

8 tools:
1. get_orders — GET /v2/orders (фильтры: date, state, status)
2. get_order — GET /v2/orders/{id}
3. get_order_items — GET /v2/orders/{id}/entries
4. update_order_status — POST /v2/orders (ACCEPTED_BY_MERCHANT, COMPLETED, CANCELLED)
5. get_cities — GET /v2/cities
6. get_products — Content API: GET /products
7. get_categories — Content API: GET /categories
8. import_products — Content API: POST /products/import

States: NEW, SIGN_REQUIRED, PICKUP, DELIVERY, KASPI_DELIVERY, ARCHIVE.
```

---

## Фаза 3: 2GIS (3 дня)

```
Создай MCP-сервер @theyahia/2gis-mcp для 2GIS API.

Документация: https://docs.2gis.com/en
Авторизация: API Key в query (?key=YOUR_KEY)
Env: TWOGIS_API_KEY

8 tools:
1. geocode — GET catalog.api.2gis.com/3.0/items/geocode (адрес → координаты)
2. reverse_geocode — координаты → адрес
3. search_places — GET catalog.api.2gis.com/3.0/items (поиск организаций)
4. get_directions — POST routing.api.2gis.com/routing/7.0.0/global (маршрут)
5. distance_matrix — расстояния между точками
6. suggest — автодополнение адреса
7. get_place_details — детали организации
8. search_by_bin — поиск по БИН компании

Покрытие: КЗ (17 городов), РФ, другие страны.
```

---

## Фаза 4: Halyk ePay (4 дня)

```
Создай MCP-сервер @theyahia/halyk-epay-mcp для Halyk EPay API.

Документация: https://epayment.kz/en-US/docs/mobile_sdk_documentation
Sandbox: test-epay.homebank.kz
OAuth 2.0: POST https://epay-oauth.homebank.kz/oauth2/token (7200s expiry)
Env: HALYK_TERMINAL_ID, HALYK_CLIENT_ID, HALYK_CLIENT_SECRET

8 tools:
1. create_payment — создать платёж (payment page URL)
2. get_payment_status — статус платежа
3. capture_payment — подтвердить (двухстадийный)
4. refund_payment — возврат
5. create_invoice — создать ссылку на оплату
6. create_recurring — подписка/рекуррент
7. get_token — токен карты для повторных платежей
8. get_balance — информация о терминале

Тестовые credentials из документации.
```

---

## Телеграм-каналы для продвижения в КЗ

| Канал | Подписчики | Тема |
|-------|------------|------|
| @workitkz | 29.8K | IT вакансии |
| @bluescreenkz | 24.5K | Tech новости |
| @thetechkz | 22.9K | Стартапы |
| @devkz_jobs | 21.9K | Dev вакансии |
| @frontendkz | 4.4K | Frontend |
| @backenderskz | 3.4K | Backend |
| @python_kz | 3.2K | Python |
| @go_kz | 2K | Go |

---

## Конференции КЗ 2026

- **AI Bridge 2026** (Астана) — преемник Digital Bridge
- **GITEX AI Central Asia** (Алматы, 4-5 мая 2026)
- **GDG DevFest** Алматы и Астана
