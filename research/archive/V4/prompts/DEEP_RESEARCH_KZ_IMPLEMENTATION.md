# Deep Research — Полная техническая имплементация MCP-серверов для Казахстана

## Контекст

Я — @theyahia (npm org). У меня 47 MCP-серверов для российских API. Расширяюсь на Казахстан — **ноль MCP-серверов** для казахских API в мире. У меня уже есть:

1. **Исследование рынка КЗ** (RESEARCH_03) — 25+ API с документацией, Kaspi 721K продавцов, 2GIS с 17 городами КЗ, Halyk ePay с полным sandbox, НБК курсы без авторизации
2. **Базовый план** (IMPLEMENTATION_PLAN_KZ.md) — 10 серверов, промпты
3. **Детальный план** (DETAILED_IMPLEMENTATION_KZ.md) — endpoints, auth, Zod-схемы

Мне нужно **углубить** технический план до уровня, когда Claude Code может имплементировать каждый сервер без дополнительных вопросов.

---

## Что нужно для каждого из 10 серверов

### Сервер 1: nbk-mcp (Национальный Банк Казахстана)

Исследуй:
- XML feed по адресу `https://nationalbank.kz/rss/rates_all.xml` — какие поля возвращает? Какие валюты? Формат даты?
- Historical rates: `https://nationalbank.kz/rss/get_rates.cfm?fdate=DD.MM.YYYY` — точный формат даты? Какие параметры?
- Есть ли JSON endpoint или только XML?
- Параметр `&switch=kazakh` — что меняет?
- Какие ещё данные НБК публикует? Ключевая ставка? Инфляция?
- Есть ли npm-пакеты для парсинга XML в Node.js (fast-xml-parser)?

### Сервер 2: kaspi-merchant-mcp (Kaspi Marketplace)

Исследуй:
- JSON:API спецификация — как работает `application/vnd.api+json`? Какие relationships? Pagination?
- Endpoint `GET /v2/orders` — какие фильтры (page, state, status, creationDate)? Формат ответа?
- Endpoint `GET /v2/orders/{id}/entries` — что возвращает? Какие поля у line items?
- Content API: `GET /products`, `GET /categories`, `POST /products/import` — точные URL, параметры?
- X-Auth-Token — как получить? Через личный кабинет продавца? Есть ли срок действия?
- States: NEW, SIGN_REQUIRED, PICKUP, DELIVERY, KASPI_DELIVERY, ARCHIVE — что значит каждый?
- Есть ли webhooks? Push-уведомления о новых заказах?
- Rate limits?
- Есть ли sandbox/тестовая среда?
- Community Go SDK `kaspi-merchant-api` (github.com/abdymazhit/kaspi-merchant-api) — что реализовано?

### Сервер 3: 2gis-mcp (2GIS Maps)

Исследуй:
- Geocoder API: `GET catalog.api.2gis.com/3.0/items/geocode` — все параметры, формат ответа
- Places Search: `GET catalog.api.2gis.com/3.0/items` — поиск по запросу, по БИН, по категории
- Routing API v7: `POST routing.api.2gis.com/routing/7.0.0/global` — формат body, типы маршрутов (driving, walking, transit)
- Suggest API (автодополнение) — endpoint, параметры
- Distance Matrix — endpoint, лимиты
- Free tier: 1 месяц, 1000 запросов — подтвердить
- npm-пакеты: `@2gis/mapgl`, `@2gis/mapgl-directions` — можно ли использовать?
- Какие города КЗ покрыты (кроме Алматы и Астаны)?

### Сервер 4: halyk-epay-mcp (Halyk ePay)

Исследуй:
- OAuth 2.0: `POST https://epay-oauth.homebank.kz/oauth2/token` — точный формат request body
- Token TTL: 7200s — подтвердить
- Test credentials из документации — найти и указать
- Sandbox URL: `test-epay.homebank.kz` — какие endpoints?
- Payment flow: create → redirect → callback
- Тестовые карты — номера, CVV, срок
- Refund API — endpoint, параметры
- Invoice API (pay-by-link) — как создать
- Recurring/tokenization — как работает
- RSA public keys URL

### Сервер 5: data-egov-kz-mcp (Открытые данные КЗ)

Исследуй:
- REST API v4: `https://data.egov.kz/api/v4/{dataset}` — формат запроса
- Как получить API key? Бесплатно?
- Elasticsearch query DSL — какие фильтры поддерживаются?
- Mapping endpoint: `/api/v4/mapping/{dataset}` — что возвращает?
- Самые полезные датасеты (ТОП-10) — ID, название, описание
- Geo-distance queries — как использовать?
- Лимиты (requests per second/day)?

### Сервер 6: webkassa-mcp (Онлайн-фискализация)

Исследуй:
- REST API — base URL, авторизация (API Key откуда?)
- Endpoints: пробить чек, возврат, Z-отчёт, X-отчёт, статус чека
- Формат чека: какие обязательные поля?
- НДС ставки Казахстана 2026: 16%/10%/5% — подтвердить
- Типы оплаты: QR, наличные, карта, кредит
- Postman collection — есть?
- 300+ существующих интеграций — список?
- Тестовая среда — как подключиться?

### Сервер 7: forte-mcp (ForteBank)

Исследуй:
- Docs: `https://docs.fortebank.com/en/` — актуальны?
- HTTP Basic Auth (Shop ID + Secret Key) — как получить?
- Endpoints: `/transactions/payments`, `/transactions/authorizations`, capture, void, refund
- Postman collection URL
- Sandbox credentials
- Apple Pay / Google Pay — как инициировать через API?

### Сервер 8: freedompay-kz-mcp (Freedom Pay)

Исследуй:
- Docs: `https://docs.freedompay.kz/` — актуальны?
- Signature auth: MD5 `pg_sig` из отсортированных параметров — точный алгоритм
- Init payment endpoint: `POST https://api.freedompay.kz/init_payment.php`
- Работает в КЗ+КГ+УЗ — одинаковый API?
- Card tokenization, recurring — endpoints
- Ruby gem `paybox_api` (github.com/maddevsio/paybox_api) — что реализовано?

### Сервер 9: kazpost-mcp (Казпочта)

Исследуй:
- Tracking API: `GET https://track.post.kz/api/v2/{barcode}` — формат ответа (JSON?)
- SOAP Delivery Module: `https://rates.kazpost.kz` — endpoints для расчёта тарифа, генерации трек-номера
- API Key — как получить? kabinet.kazpost.kz?
- Какие статусы посылки существуют?

### Сервер 10: satu-kz-mcp (Satu.kz Marketplace)

Исследуй:
- OpenAPI/Swagger: `https://public-api.docs.satu.kz/` — скачать спецификацию
- Token auth — как получить?
- Endpoints: products CRUD, orders, delivery, categories, messaging
- Аналогично Prom.ua API — подтвердить
- Сколько продавцов на платформе?

---

## Дополнительно

### Казахстанские SMS-шлюзы
- SMSC.KZ (`https://smsc.kz/api/`) — endpoints, auth, стоимость
- Mobizon.KZ (`https://mobizon.kz/integration/api`) — endpoints, auth
- Стоит ли делать отдельные MCP для SMS?

### hh.kz (HeadHunter Казахстан)
- Тот же API что hh.ru? Area ID 40 для Казахстана?
- Стоит ли делать отдельный MCP или достаточно hh-mcp с фильтром?

### ИИН/БИН проверка
- DaData endpoint `party_kz` — работает? Достаточно ли?
- Adata.kz — API? Стоимость?

---

## Формат ответа

Для каждого из 10 серверов:

1. **Полная спецификация API** — все endpoints с URL, методами, параметрами, форматом ответа
2. **Auth** — точный механизм, как получить ключи, срок действия
3. **Sandbox** — URL, тестовые credentials, тестовые данные
4. **Rate limits** — точные числа
5. **Готовый Claude Code промпт** — copy-paste для имплементации (Zod-схемы, все tools, error handling)
6. **Gotchas** — подводные камни, особенности, что может сломаться
7. **Трудозатраты** — часы на имплементацию

Не давай абстрактных оценок. Конкретные URL, конкретные параметры, конкретный код.
