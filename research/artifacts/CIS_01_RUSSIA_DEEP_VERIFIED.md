# Deep Research: MCP Candidates — Russia
> Source: Training data (cutoff Aug 2025). Требует живой верификации порталов.

---

## Wildberries Seller API

- **Developer Portal**: https://openapi.wildberries.ru / https://seller.wildberries.ru
- **API Status**: Active
- **Base URL**: `https://suppliers-api.wildberries.ru`
- **Auth**: API Key (Bearer token) — выдаётся в личном кабинете поставщика. Отдельные токены на каждый раздел (контент, статистика, цены, склад). С 2023 — новая система токенов с granular правами.
- **Key Endpoints**:
  - `GET /api/v3/orders` — новые заказы
  - `POST /api/v3/orders/status` — смена статуса
  - `GET /api/v3/stocks` — остатки
  - `POST /api/v3/stocks` — обновление остатков
  - `GET /api/v3/prices` — цены
  - `POST /api/v3/prices` — обновление цен
  - `GET /api/v1/statistics/orders` — статистика заказов
  - `GET /api/v1/statistics/sales` — статистика продаж
  - `GET /content/v2/get/cards/list` — карточки товаров
  - `POST /content/v2/cards/upload` — загрузка карточек
- **Rate Limits**: Зависит от эндпоинта. Обычно 1–6 rps на метод. Статистика — жёсткие лимиты (раз в минуту/час). Часто меняются без предупреждения.
- **Sandbox**: No (только prod, многие тестируют на тестовых SKU)
- **Official SDK**: Нет
- **Community SDK**: https://github.com/wildberries-tech (есть unoffical Go, Python libs)
- **Existing MCP**: Не обнаружено (по состоянию на дату среза)
- **Webhooks**: Есть (push-уведомления о новых заказах, отменах) — настраиваются в ЛК
- **Docs Quality**: 3/5 — RU only. Документация нестабильная, часто отстаёт от реального API. Версионирование хаотично.
- **Est. MCP Build**: M (30–50h) — из-за нестабильности API и отсутствия sandbox
- **Notes**: Требует статуса поставщика WB (ИП/ООО/самозанятый). API меняется без changelog. Отдельные токены на разные группы методов — надо учитывать в auth flow.

---

## Ozon Seller API

- **Developer Portal**: https://docs.ozon.ru/api/seller/
- **API Status**: Active
- **Base URL**: `https://api-seller.ozon.ru`
- **Auth**: API Key + Client-ID. Оба передаются в headers: `Client-Id` и `Api-Key`. Ключи создаются в личном кабинете.
- **Key Endpoints**:
  - `POST /v3/product/list` — список товаров
  - `POST /v2/product/import` — импорт товаров
  - `POST /v3/posting/fbs/list` — заказы FBS
  - `POST /v3/posting/fbo/list` — заказы FBO
  - `POST /v1/posting/fbs/ship` — отгрузка
  - `POST /v1/finance/realization` — отчёт о реализации
  - `POST /v1/analytics/data` — аналитика
  - `POST /v1/product/update/stocks` — обновление остатков
  - `POST /v1/product/update/price` — обновление цен
  - `POST /v1/report/seller/create` — создание отчёта
- **Rate Limits**: Различаются по методам. Базово ~60 req/min на большинство. Аналитика — строже.
- **Sandbox**: Yes — seller-sandbox.ozon.ru (полноценный sandbox с тестовыми заказами)
- **Official SDK**: Python (ozon-api-client), есть официальная библиотека
- **Community SDK**: https://github.com/diphantus/ozon-seller (Python), Go-библиотеки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — push-уведомления о заказах, статусах, отменах через Seller API webhooks
- **Docs Quality**: 4/5 — RU+EN. Одна из лучших среди российских маркетплейсов. Есть changelog.
- **Est. MCP Build**: M (20–40h)
- **Notes**: Sandbox — большое преимущество. Требует продавца на Ozon. Схемы FBS/FBO/RFBS разные — нужно реализовывать все три.

---

## Yandex Market Seller API

- **Developer Portal**: https://yandex.ru/dev/market/partner-api/
- **API Status**: Active
- **Base URL**: `https://api.partner.market.yandex.ru`
- **Auth**: OAuth 2.0. Yandex OAuth, scope: `market:partner-api`. Access token в заголовке `Authorization: OAuth <token>`
- **Key Endpoints**:
  - `GET /campaigns` — список магазинов
  - `GET /campaigns/{id}/orders` — заказы
  - `PUT /campaigns/{id}/orders/{orderId}/status` — статус заказа
  - `GET /campaigns/{id}/offer-mapping-entries` — маппинг товаров
  - `POST /campaigns/{id}/offer-prices/updates` — цены
  - `GET /campaigns/{id}/stats/orders` — статистика
  - `PUT /campaigns/{id}/offers/stocks` — остатки
  - `GET /campaigns/{id}/shipments` — отгрузки
  - `POST /businesses/{id}/offer-mappings` — загрузка товаров (Business API)
  - `GET /reports/info` — отчёты
- **Rate Limits**: ~600 req/min суммарно на аккаунт
- **Sandbox**: Yes — sandbox.partner.market.yandex.ru
- **Official SDK**: Java SDK (официальный, устаревающий)
- **Community SDK**: Python-обёртки на GitHub
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — push-уведомления через настройки кабинета партнёра
- **Docs Quality**: 4/5 — RU+EN. Хорошая документация, есть swagger.
- **Est. MCP Build**: M (25–45h)
- **Notes**: Требует партнёрского аккаунта. Разные модели работы (DBS/FBS/FBY) со своими методами.

---

## Bitrix24 REST API

- **Developer Portal**: https://dev.1c-bitrix.ru/rest_help/ / https://apidocs.bitrix24.com
- **API Status**: Active
- **Base URL**: `https://{account}.bitrix24.ru/rest/` (self-hosted) или через вебхук
- **Auth**: 
  - OAuth 2.0 (для приложений в Bitrix24.Market)
  - Входящие вебхуки (простой способ — токен в URL)
  - Исходящие вебхуки
- **Key Endpoints** (методы через REST):
  - `crm.lead.list / add / update / get`
  - `crm.deal.list / add / update`
  - `crm.contact.list / add / update`
  - `tasks.task.list / add / update`
  - `im.message.add` — сообщения
  - `disk.file.upload` — файлы
  - `user.get` — пользователи
  - `calendar.event.add` — календарь
  - `telephony.call.register` — телефония
  - `sonet_group.create` — группы/проекты
- **Rate Limits**: 2 req/sec на вебхук по умолчанию. Для приложений — выше. Батчинг до 50 методов в одном запросе (`batch`).
- **Sandbox**: Yes — бесплатный аккаунт Bitrix24 + developer.bitrix24.ru
- **Official SDK**: PHP (официальный), есть JavaScript
- **Community SDK**: Python (fast-bitrix24), Go, Ruby — множество на GitHub
- **Existing MCP**: Есть! https://github.com/mnfst/mnfst (упоминает Bitrix) — проверить. Единичные упоминания.
- **Webhooks**: Yes — исходящие вебхуки на любые события CRM, задачи, диск
- **Docs Quality**: 4/5 — RU+EN. Обширная документация, активное сообщество.
- **Est. MCP Build**: M (25–45h)
- **Notes**: Самый реалистичный кандидат для раннего запуска — большой рынок, sandbox, хорошие docs. Метод `batch` упрощает реализацию.

---

## amoCRM API

- **Developer Portal**: https://www.amocrm.ru/developers/content/crm_platform/api-reference
- **API Status**: Active
- **Base URL**: `https://{subdomain}.amocrm.ru/api/v4/`
- **Auth**: OAuth 2.0. Authorization Code flow. Scope не грануллирован — полный доступ. Long-lived refresh tokens.
- **Key Endpoints**:
  - `GET /api/v4/leads` — сделки
  - `POST /api/v4/leads` — создание сделок
  - `GET /api/v4/contacts` — контакты
  - `GET /api/v4/companies` — компании
  - `GET /api/v4/pipelines` — воронки
  - `GET /api/v4/tasks` — задачи
  - `GET /api/v4/users` — пользователи
  - `GET /api/v4/custom_fields` — кастомные поля
  - `POST /api/v4/leads/notes` — примечания
  - `GET /api/v4/events` — лента событий
- **Rate Limits**: 7 req/sec на аккаунт
- **Sandbox**: Yes — бесплатный триал + тестовый аккаунт для разработчиков
- **Official SDK**: PHP
- **Community SDK**: Python (amocrm2), Node.js
- **Existing MCP**: Не обнаружено публично
- **Webhooks**: Yes — богатый набор: создание/изменение сделок, контактов, входящие звонки, чаты
- **Docs Quality**: 4/5 — RU+EN
- **Est. MCP Build**: S-M (15–30h) — хороший API, предсказуемый
- **Notes**: Требует зарегистрированного аккаунта amoCRM. OAuth app регистрируется на developer.amocrm.ru. Очень популярная CRM — высокий рыночный спрос на автоматизацию.

---

## 1C:Enterprise

- **Developer Portal**: https://its.1c.ru / https://v8.1c.ru/
- **API Status**: Active (platform-level)
- **Base URL**: Зависит от конфигурации. Обычно `http://{server}/{base}/hs/` (HTTP-сервисы) или `http://{server}/{base}/odata/standard.odata/`
- **Auth**:
  - HTTP Basic Auth (стандарт для HTTP-сервисов)
  - OpenID Connect (через 1C:ИТС)
  - Session-based для web-клиента
- **Key Endpoints** (OData — стандартная конфигурация):
  - `GET /Catalog_Контрагенты` — контрагенты
  - `GET /Document_ПоступлениеТоваровУслуг` — документы поступления
  - `GET /Document_РеализацияТоваровУслуг` — реализации
  - `GET /AccumulationRegister_Продажи` — регистр продаж
  - `GET /InformationRegister_ЦеныНоменклатуры` — цены
  - HTTP-сервисы — полностью кастомные эндпоинты (зависят от конфигурации)
- **Rate Limits**: Нет встроенных — зависит от железа сервера
- **Sandbox**: No (нужна собственная установка или облако 1С:Fresh)
- **Official SDK**: COM-объект (Windows only), EDT (Eclipse-based IDE)
- **Community SDK**: Py1C, v8utils — минимальные
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет нативных. Можно реализовать через регламентные задания + HTTP-сервисы.
- **Docs Quality**: 3/5 — RU only. Документация есть, но разбросана по its.1c.ru (платный доступ!)
- **Est. MCP Build**: XL (150h+) — не единый API, а платформа. Нужен отдельный MCP под каждую конфигурацию.
- **Notes**: **Принципиально другой подход.** Нет единого API — каждая конфигурация (Бухгалтерия, УТ, УНФ) имеет свои HTTP-сервисы. OData — только для типовых. Доступ к документации its.1c.ru требует платной подписки ИТС. Для MCP реалистичнее делать коннектор к конкретной конфигурации, а не к "1С" в целом.

---

## МойСклад (Moy Sklad) API

- **Developer Portal**: https://dev.moysklad.ru/doc/api/remap/1.2/
- **API Status**: Active
- **Base URL**: `https://api.moysklad.ru/api/remap/1.2/`
- **Auth**: Bearer Token (API-ключ из ЛК) или Basic Auth (email:password — устаревает)
- **Key Endpoints**:
  - `GET /entity/product` — товары
  - `GET /entity/counterparty` — контрагенты
  - `GET /entity/customerorder` — заказы покупателей
  - `GET /entity/purchaseorder` — заказы поставщикам
  - `GET /entity/demand` — отгрузки
  - `GET /entity/invoiceout` — счета
  - `GET /entity/stock/all` — остатки
  - `GET /report/sales/byproduct` — продажи по товарам
  - `GET /entity/store` — склады
  - `GET /entity/currency` — валюты
- **Rate Limits**: 45 req/sec на аккаунт (одни из лучших среди российских)
- **Sandbox**: Yes — demo.moysklad.ru (демо-аккаунт)
- **Official SDK**: Java, Python (официальный python-client)
- **Community SDK**: Go, PHP — на GitHub
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — webhooks на создание/изменение/удаление любой сущности
- **Docs Quality**: 5/5 — RU+EN. Лучшая документация среди российских бизнес-API. Полный swagger, примеры, changelog.
- **Est. MCP Build**: S (12–20h)
- **Notes**: **Топ-кандидат для первого MCP.** Отличная документация, sandbox, адекватные rate limits. Широко используется МСБ. Webhook-система продуманная.

---

## YooKassa (ЮKassa) API

- **Developer Portal**: https://yookassa.ru/developers/api
- **API Status**: Active
- **Base URL**: `https://api.yookassa.ru/v3/`
- **Auth**: HTTP Basic Auth (shopId + secretKey). Идентификатор магазина + секретный ключ.
- **Key Endpoints**:
  - `POST /payments` — создание платежа
  - `GET /payments/{id}` — статус платежа
  - `POST /payments/{id}/capture` — подтверждение платежа
  - `POST /payments/{id}/cancel` — отмена платежа
  - `POST /refunds` — возврат
  - `GET /refunds/{id}` — статус возврата
  - `POST /receipts` — создание чека (54-ФЗ)
  - `GET /me` — информация о магазине
  - `POST /payouts` — выплаты (если подключено)
  - `GET /deals` — сделки (Safe Deal)
- **Rate Limits**: ~20–60 req/sec (не публикуется явно)
- **Sandbox**: Yes — test.yookassa.ru (тестовые карты, тестовые платежи)
- **Official SDK**: PHP, Python, Node.js, Java, Go, .NET — богатый набор
- **Community SDK**: Ruby, множество других
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — notifications на статусы платежей (payment.succeeded, payment.canceled, refund.succeeded)
- **Docs Quality**: 5/5 — RU+EN. Образцовая документация.
- **Est. MCP Build**: S (10–15h)
- **Notes**: **Топ-кандидат.** Лучший платёжный API в РФ по качеству документации и developer experience. Требует ИП/ООО и договора с ЮKassa.

---

## CloudPayments API

- **Developer Portal**: https://developers.cloudpayments.ru/
- **API Status**: Active
- **Base URL**: `https://api.cloudpayments.ru/`
- **Auth**: HTTP Basic Auth (PublicId + ApiSecret)
- **Key Endpoints**:
  - `POST /payments/cards/charge` — одностадийная оплата
  - `POST /payments/cards/auth` — двухстадийная (блокировка)
  - `POST /payments/confirm` — подтверждение
  - `POST /payments/void` — отмена
  - `POST /payments/refund` — возврат
  - `POST /subscriptions/create` — подписка
  - `POST /payments/find` — поиск платежа
  - `GET /payments/get` — статус платежа
  - `POST /orders/create` — создание заказа (hosted page)
  - `POST /kkt/receipt` — фискальный чек
- **Rate Limits**: Не публикуются явно, практически без ограничений для типовых нагрузок
- **Sandbox**: Yes — тестовые API keys, тестовые карты
- **Official SDK**: PHP, Python, Node.js, Java, .NET, Go
- **Community SDK**: Ruby и др.
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — Check, Pay, Fail, Confirm, Refund, Recurrent и др.
- **Docs Quality**: 4/5 — RU+EN
- **Est. MCP Build**: S (10–15h)
- **Notes**: Требует ИП/ООО + договор. Хорош для recurring payments / подписок.

---

## Tinkoff Acquiring API

- **Developer Portal**: https://www.tbank.ru/kassa/develop/api/acquiring/
- **API Status**: Active
- **Base URL**: `https://securepay.tinkoff.ru/v2/`
- **Auth**: TerminalKey + Password (HMAC-SHA256 подпись запроса). Токен генерируется на стороне клиента из параметров запроса.
- **Key Endpoints**:
  - `POST /Init` — инициализация платежа
  - `POST /Confirm` — подтверждение
  - `POST /Cancel` — отмена/возврат
  - `POST /GetState` — статус платежа
  - `POST /Charge` — рекуррентный платёж
  - `POST /AddCard` — привязка карты
  - `POST /GetCardList` — список карт
  - `POST /SendClosingReceipt` — закрывающий чек
  - `POST /QrCode` — генерация QR (СБП)
  - `POST /AttachCard` — прикрепление карты к клиенту
- **Rate Limits**: Не публикуются
- **Sandbox**: Yes — sandbox.tinkoff.ru
- **Official SDK**: PHP, Java, Python, Node.js, .NET, Android, iOS
- **Community SDK**: Go, Ruby
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — уведомления на URL магазина о статусах платежей
- **Docs Quality**: 4/5 — RU+EN
- **Est. MCP Build**: S-M (15–25h) — из-за нестандартной схемы подписи
- **Notes**: Подпись запросов специфична — конкатенация параметров + SHA256. Нужно реализовать корректно. Требует договора эквайринга с Т-Банком.

---

## Robokassa API

- **Developer Portal**: https://docs.robokassa.com/
- **API Status**: Active
- **Base URL**: `https://auth.robokassa.ru/Merchant/http/` (старый) + новый REST API
- **Auth**: MerchantLogin + подпись MD5/SHA (старый) или API-ключ (новый REST)
- **Key Endpoints**:
  - `POST /PaymentUrl` — ссылка на оплату
  - `GET /Invoicing` — выставление счёта
  - `POST /OpStateExt` — статус платежа
  - `POST /Refund` — возврат
  - Новый REST: аналогичные операции через JSON API
- **Rate Limits**: Не публикуются
- **Sandbox**: Yes — test.robokassa.com
- **Official SDK**: PHP, .NET, Python, Java
- **Community SDK**: Go и др.
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — ResultURL/SuccessURL/FailURL callback
- **Docs Quality**: 3/5 — RU only. Документация устаревшая, API старый по дизайну.
- **Est. MCP Build**: M (20–30h)
- **Notes**: Исторически один из первых платёжных шлюзов РФ. API устаревший дизайн, но рынок большой. Есть движение к новому REST API.

---

## CDEK API

- **Developer Portal**: https://api-docs.cdek.ru/
- **API Status**: Active
- **Base URL**: `https://api.cdek.ru/v2/`
- **Auth**: OAuth 2.0 Client Credentials. `POST /oauth/token?grant_type=client_credentials` с client_id + client_secret
- **Key Endpoints**:
  - `POST /orders` — создание заказа
  - `GET /orders/{uuid}` — статус заказа
  - `DELETE /orders/{uuid}` — удаление заказа
  - `POST /orders/print/barcodes` — печать штрихкодов
  - `GET /deliverypoints` — ПВЗ (пункты выдачи)
  - `POST /calculator/tariff` — расчёт стоимости
  - `GET /location/cities` — справочник городов
  - `POST /webhooks` — подписка на события
  - `GET /invoices` — накладные
  - `POST /print/orders` — печать накладных
- **Rate Limits**: 20 req/sec (практически достаточно)
- **Sandbox**: Yes — api.edu.cdek.ru (полноценный тест-стенд)
- **Official SDK**: PHP, Python — есть официальные
- **Community SDK**: Go, Node.js, Java — на GitHub
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — ORDER_STATUS, PRINT_STATUS, DOWNLOAD_TASK_STATUS
- **Docs Quality**: 4/5 — RU+EN. Хорошая документация, есть Postman-коллекция.
- **Est. MCP Build**: S-M (15–25h)
- **Notes**: **Топ-кандидат для логистики.** Sandbox с тестовыми заказами. Широко используется e-commerce. Регистрация открытая (не нужен договор для sandbox).

---

## Почта России API

- **Developer Portal**: https://otpravka.pochta.ru/specification / https://tracking.pochta.ru/
- **API Status**: Active (два отдельных API)
- **Base URL**: 
  - Отправка: `https://otpravka-api.pochta.ru/1.0/`
  - Трекинг: `https://tracking.pochta.ru/tracking/rest`
- **Auth**:
  - Отправка: HTTP Basic (логин:пароль) + `Authorization: AccessToken <token>` 
  - Трекинг: Login + Password + нужен отдельный договор на трекинг API
- **Key Endpoints**:
  - Отправка: `/user/shipping-points`, `/batch`, `/batch/{name}/shipment`, `/tariff`
  - Трекинг: `getOperationHistory`, `getTicket` (batch traking)
- **Rate Limits**: Трекинг — 100 трек-номеров за раз, до 1000 в сутки на бесплатном тарифе
- **Sandbox**: Ограниченный — тестовые аккаунты по заявке
- **Official SDK**: Java (частично официальный)
- **Community SDK**: Python pochta-api клиенты на GitHub
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 2/5 — RU only. Одна из худших документаций, нестабильный API, устаревшие примеры.
- **Est. MCP Build**: L (60–100h)
- **Notes**: Два разных API с разными auth схемами. Трекинг требует отдельного договора. Высокая latency. Нестабильность — системные проблемы частые. Низкий приоритет для MCP.

---

## Yandex Direct API

- **Developer Portal**: https://yandex.ru/dev/direct/
- **API Status**: Active
- **Base URL**: `https://api.direct.yandex.com/json/v5/`
- **Auth**: OAuth 2.0. Яндекс OAuth, `Authorization: Bearer <token>`
- **Key Endpoints** (сервисы):
  - `campaigns` — управление кампаниями
  - `adgroups` — группы объявлений
  - `ads` — объявления
  - `keywords` — ключевые слова
  - `bids` — ставки
  - `reports` — отчёты (асинхронные)
  - `dictionaries` — справочники (регионы, форматы)
  - `clients` — клиентский аккаунт
  - `agencyclients` — клиенты агентства
  - `dynamictextadtargets` — динамические объявления
- **Rate Limits**: Баллы (units): 1000 units/min на аккаунт. Разные методы стоят разное количество units.
- **Sandbox**: Yes — sandbox.direct.yandex.com
- **Official SDK**: Java, Python (официальные примеры)
- **Community SDK**: Python (direct-operator-api), PHP
- **Existing MCP**: Не обнаружено (есть mcp-сервер для Яндекс в целом, но не Direct)
- **Webhooks**: Нет (polling-based)
- **Docs Quality**: 4/5 — RU+EN. Хорошая документация с примерами.
- **Est. MCP Build**: M (30–50h) — из-за системы units и async reports
- **Notes**: Асинхронная генерация отчётов — нужен polling. Система units сложная. Требует аккаунта Direct или агентского доступа.

---

## Yandex Metrica API

- **Developer Portal**: https://yandex.ru/dev/metrika/
- **API Status**: Active
- **Base URL**: `https://api-metrika.yandex.net/stat/v1/` (Reporting API) / `https://api-metrika.yandex.net/management/v1/` (Management API)
- **Auth**: OAuth 2.0. Bearer token.
- **Key Endpoints**:
  - `GET /stat/v1/data` — получение данных отчёта
  - `GET /stat/v1/data/bytime` — данные по времени
  - `GET /management/v1/counters` — список счётчиков
  - `GET /management/v1/counter/{id}/goals` — цели
  - `GET /management/v1/counter/{id}/filters` — фильтры
  - Logs API: `POST /management/v1/counter/{id}/logrequests` — сырые логи
- **Rate Limits**: 50 req/sec суммарно на OAuth token
- **Sandbox**: No (но можно использовать демо-счётчик)
- **Official SDK**: Нет официального
- **Community SDK**: Python (yandex-metrika-api), JavaScript
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 4/5 — RU+EN
- **Est. MCP Build**: S (10–20h)
- **Notes**: Logs API даёт сырые данные — мощный инструмент. Нужен доступ к счётчику (права на счётчик через OAuth).

---

## VK API

- **Developer Portal**: https://dev.vk.com/api/api-requests
- **API Status**: Active
- **Base URL**: `https://api.vk.com/method/`
- **Auth**: 
  - OAuth 2.0 (для действий от имени пользователя)
  - Service Token (для серверных операций без пользователя)
  - Group Token (для сообществ)
- **Key Endpoints** (методы):
  - `users.get`, `users.search`
  - `wall.post`, `wall.get`
  - `groups.getById`, `groups.getMembers`
  - `messages.send`, `messages.getHistory` (требует доп. разрешений)
  - `photos.upload`, `video.upload`
  - `ads.getCampaigns`, `ads.createTargetGroup`
  - `stats.get` — статистика сообщества
  - `market.getItems`, `market.add`
  - `leads.complete`
  - `board.getPosts`
- **Rate Limits**: 3 req/sec на пользовательский токен; выше для сервисных
- **Sandbox**: No (тестируют на реальном аккаунте/тестовых группах)
- **Official SDK**: PHP SDK (vk-php-sdk), Python SDK
- **Community SDK**: Python (vk-api, vk), Node.js, Go — богатая экосистема
- **Existing MCP**: Есть! — https://github.com/bigdreamer17/vk-mcp (нужна проверка актуальности)
- **Webhooks**: Yes — Callback API: события сообществ (новые сообщения, вступления, лайки и т.д.)
- **Docs Quality**: 3/5 — RU+EN. Документация есть, но местами устаревшая и неполная.
- **Est. MCP Build**: M (20–35h)
- **Notes**: Callback API (webhooks) только для сообществ, не для личных страниц. Ограничения на отправку сообщений (только тем, кто первым написал). VK Mini Apps — отдельная экосистема.

---

## Telegram Bot API

- **Developer Portal**: https://core.telegram.org/bots/api
- **API Status**: Active (обновляется регулярно)
- **Base URL**: `https://api.telegram.org/bot{token}/`
- **Auth**: Bot token из @BotFather. Передаётся в URL.
- **Key Endpoints**:
  - `getUpdates` / `setWebhook` — получение обновлений
  - `sendMessage`, `sendPhoto`, `sendDocument`
  - `editMessageText`, `deleteMessage`
  - `answerCallbackQuery`
  - `getChatMember`, `getChat`
  - `createInvoice`, `answerPreCheckoutQuery` (Payments)
  - `sendPoll`, `stopPoll`
  - Business API: `getBusinessConnection`, `sendBusinessMessage`
  - `setMyCommands`, `getMyCommands`
- **Rate Limits**: 30 msg/sec на бота суммарно; 1 msg/sec на один чат
- **Sandbox**: No (используют тестовый сервер: https://api.telegram.org/bot{token}/test)
- **Official SDK**: Нет официального
- **Community SDK**: python-telegram-bot, aiogram, Telegraf (JS), telebot — огромная экосистема
- **Existing MCP**: **Есть несколько!** Поиск "telegram mcp server" — обнаружено 5+ реализаций на GitHub
- **Webhooks**: Yes — основной метод (setWebhook). Либо long polling (getUpdates).
- **Docs Quality**: 5/5 — EN only. Лучшая документация для Telegram API.
- **Est. MCP Build**: S (8–15h) — простой API, богатая экосистема библиотек
- **Notes**: **Уже есть MCP — проверить качество перед разработкой собственного.** Telegram Business API (2024) — новые возможности для бизнес-аккаунтов. Тестовый сервер TG существует (test.telegram.org).

---

## HeadHunter API (hh.ru)

- **Developer Portal**: https://api.hh.ru / https://github.com/hhru/api
- **API Status**: Active
- **Base URL**: `https://api.hh.ru/`
- **Auth**: OAuth 2.0. Разные типы приложений (работодатель, соискатель, агентство). Scopes: `resumes_modify`, `vacancy_edit`, `employer_info` и др.
- **Key Endpoints**:
  - `GET /vacancies` — поиск вакансий
  - `GET /vacancies/{id}` — детали вакансии
  - `POST /vacancies` — публикация вакансии (работодатель)
  - `GET /resumes` — поиск резюме (работодатель)
  - `GET /resumes/{id}` — резюме
  - `GET /negotiations` — отклики
  - `PUT /negotiations/{id}` — смена статуса отклика
  - `GET /employers/{id}` — профиль работодателя
  - `GET /areas` — справочник регионов
  - `GET /me` — текущий пользователь
- **Rate Limits**: 50 req/sec для приложений работодателя; строже для соискательских
- **Sandbox**: No (тестируют на реальном аккаунте)
- **Official SDK**: Нет официального
- **Community SDK**: Python (hhapi), Node.js — несколько на GitHub
- **Existing MCP**: Не обнаружено публично
- **Webhooks**: Нет (polling)
- **Docs Quality**: 4/5 — RU+EN. GitHub-документация, хорошо структурированная.
- **Est. MCP Build**: M (20–35h)
- **Notes**: Разные права доступа для работодателей и соискателей — нужно определиться с use case. Публикация вакансий требует платного аккаунта работодателя.

---

## DaData API

- **Developer Portal**: https://dadata.ru/api/
- **API Status**: Active
- **Base URL**: `https://cleaner.dadata.ru/api/v1/` / `https://suggestions.dadata.ru/suggestions/api/4_1/rs/`
- **Auth**: API Key в заголовке `Authorization: Token {api_key}` + `X-Secret: {secret_key}`
- **Key Endpoints**:
  - `POST /suggest/address` — подсказки адресов
  - `POST /suggest/party` — подсказки организаций
  - `POST /suggest/bank` — подсказки банков
  - `POST /suggest/name` — подсказки ФИО
  - `POST /clean/address` — стандартизация адреса
  - `POST /clean/phone` — стандартизация телефона
  - `POST /clean/name` — стандартизация ФИО
  - `POST /findById/party` — поиск по ИНН/ОГРН
  - `POST /findById/bank` — поиск банка по БИК
  - `POST /geolocate/address` — геолокация → адрес
- **Rate Limits**: Зависит от тарифа. Бесплатный — 10,000 запросов/день
- **Sandbox**: No (есть бесплатный тариф — фактически sandbox)
- **Official SDK**: Python, PHP, Node.js, Java, C# — официальные
- **Community SDK**: Go, Ruby
- **Existing MCP**: Не обнаружено. **Высокий потенциал** — уникальная ценность для бизнес-автоматизации.
- **Webhooks**: Нет
- **Docs Quality**: 5/5 — RU+EN. Образцовая документация с интерактивными примерами.
- **Est. MCP Build**: S (8–12h)
- **Notes**: **Топ-кандидат.** Простой API, отличная документация, уникальная ценность (нет западного аналога для российских данных). Бесплатный тариф для разработки. Проверка ИНН, адресов, банковских реквизитов — критично для бизнес-автоматизации.

---

## Kontur.Diadoc API

- **Developer Portal**: https://api-docs.diadoc.ru/
- **API Status**: Active
- **Base URL**: `https://diadoc-api.kontur.ru/`
- **Auth**: Bearer token (Kontur SSO) или API-ключ. Требует УКЭП для полноценной работы (подписание документов).
- **Key Endpoints**:
  - `GET /GetMyOrganizations` — организации пользователя
  - `GET /GetDocuments` — список документов
  - `GET /GetDocument` — документ
  - `POST /PostMessage` — отправка документа
  - `POST /PostMessagePatch` — изменение статуса
  - `GET /GetMessage` — сообщение (пакет документов)
  - `POST /GenerateTorg12XmlForSeller` — формирование ТОРГ-12
  - `GET /GetEntityContent` — содержимое документа
  - `POST /CloudSign` — облачная подпись
  - `GET /GetCounteragents` — контрагенты в диадоке
- **Rate Limits**: Не публикуются, практически нет для типовых нагрузок
- **Sandbox**: Yes — sandbox.diadoc.ru
- **Official SDK**: .NET (официальный, наиболее полный), Java, PHP, Python
- **Community SDK**: Python обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — события документооборота через long polling или webhooks
- **Docs Quality**: 4/5 — RU only. Хорошая документация для корпоративного API.
- **Est. MCP Build**: L (60–100h)
- **Notes**: **Требует УКЭП** для подписания документов. Без УКЭП — только чтение и отправка неподписанных. Юридически значимый ЭДО — высокая сложность интеграции. Sandbox доступен. Высокая ценность для бухгалтерии/B2B.

---

## Kontur.Focus API

- **Developer Portal**: https://focus.kontur.ru/api
- **API Status**: Active
- **Base URL**: `https://focus-api.kontur.ru/api3/`
- **Auth**: API Key (`key` query parameter или Bearer header)
- **Key Endpoints**:
  - `GET /req` — реквизиты компании по ИНН
  - `GET /egr` — данные ЕГРЮЛ/ЕГРИП
  - `GET /finances` — финансовая отчётность
  - `GET /licenses` — лицензии
  - `GET /contracts` — госконтракты
  - `GET /arbitration` — арбитражные дела
  - `GET /bankruptcies` — банкротства
  - `GET /enforcementProceedings` — исполнительные производства
  - `GET /beneficialOwners` — бенефициары
  - `GET /connections` — связанные компании
- **Rate Limits**: Зависит от тарифа
- **Sandbox**: No (требует платного доступа)
- **Official SDK**: .NET (частичный)
- **Community SDK**: Python — есть обёртки на GitHub
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 3/5 — RU only. Документация есть, но требует регистрации для полного доступа.
- **Est. MCP Build**: S-M (15–25h)
- **Notes**: **Высокая бизнес-ценность** — проверка контрагентов. Требует платного доступа (нет бесплатного тарифа для разработки). Данные из ЕГРЮЛ, арбитража, банкротств — уникально для российского рынка.

---

## Avito API

- **Developer Portal**: https://developers.avito.ru/
- **API Status**: Active
- **Base URL**: `https://api.avito.ru/`
- **Auth**: OAuth 2.0 Client Credentials (для дилеров/бизнеса). `POST /token` с client_id + client_secret.
- **Key Endpoints**:
  - `GET /core/v1/accounts/self` — профиль
  - `GET /autoload/v2/items` — объявления (автозагрузка)
  - `POST /autoload/v2/items` — создание объявления
  - `GET /messenger/v3/accounts/{id}/chats` — чаты
  - `GET /messenger/v3/accounts/{id}/chats/{chat}/messages` — сообщения
  - `POST /messenger/v3/accounts/{id}/chats/{chat}/messages` — отправить сообщение
  - `GET /stats/v1/accounts/{id}/items` — статистика объявлений
  - `GET /ratings/v1/accounts/{id}/ratings/summary` — рейтинг
  - `POST /vas/v1/accounts/{id}/schedule` — дополнительные услуги (продвижение)
- **Rate Limits**: Зависит от endpoint, обычно 100-500 req/min
- **Sandbox**: No
- **Official SDK**: Нет
- **Community SDK**: Python-обёртки на GitHub
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — webhooks для чатов (новые сообщения)
- **Docs Quality**: 3/5 — RU only. Документация неполная в ряде мест.
- **Est. MCP Build**: M (25–40h)
- **Notes**: Доступ к API только для бизнес-аккаунтов (дилеры, агентства). Физлицам API недоступен. Мессенджер API — высокая ценность для автоматизации общения с клиентами.

---

## Huntflow API

- **Developer Portal**: https://github.com/huntflow/huntflow-api-docs
- **API Status**: Active
- **Base URL**: `https://api.huntflow.ru/v2/`
- **Auth**: Personal token или OAuth 2.0
- **Key Endpoints**:
  - `GET /v2/me` — текущий пользователь
  - `GET /v2/accounts/{id}/vacancies` — вакансии
  - `GET /v2/accounts/{id}/applicants` — кандидаты
  - `POST /v2/accounts/{id}/applicants` — создание кандидата
  - `GET /v2/accounts/{id}/applicants/{id}/logs` — история
  - `POST /v2/accounts/{id}/applicants/vacancy` — добавление в воронку
  - `GET /v2/accounts/{id}/users` — пользователи
  - `GET /v2/accounts/{id}/stages` — этапы воронки
- **Rate Limits**: Не публикуются явно
- **Sandbox**: No (trial-аккаунт)
- **Official SDK**: Нет
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — события по кандидатам и вакансиям
- **Docs Quality**: 4/5 — RU+EN. Документация на GitHub — хорошо структурирована.
- **Est. MCP Build**: M (20–35h)
- **Notes**: Нишевый, но высококачественный HR API. Популярен среди IT-компаний. Webhooks хорошо документированы.

---

## iiko API

- **Developer Portal**: https://docs.iiko.ru/
- **API Status**: Active
- **Base URL**: `https://{server}/api/1/` (self-hosted) или cloud: `https://api-eu.iiko.services/api/1/`
- **Auth**: Login + password → получение token. `POST /access_token`
- **Key Endpoints**:
  - `POST /access_token` — авторизация
  - `GET /organizations` — организации
  - `GET /nomenclature` — меню/номенклатура
  - `POST /order/create_or_update` — создание заказа
  - `GET /order/by_id` — заказ по ID
  - `GET /deliveries/by_delivery_date_and_status` — доставки
  - `GET /employees` — сотрудники
  - `GET /reports/balance_and_cash_shifts` — кассовые отчёты
  - `GET /terminal_groups` — группы терминалов
  - `POST /commands/execute` — отправка команд
- **Rate Limits**: Не публикуются
- **Sandbox**: Yes (iiko Cloud trial / тестовая организация)
- **Official SDK**: .NET (частичный)
- **Community SDK**: Python-обёртки на GitHub
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — webhooks на заказы, доставки
- **Docs Quality**: 3/5 — RU only. Документация есть, но неполная.
- **Est. MCP Build**: M (30–50h)
- **Notes**: Лидер рынка автоматизации ресторанов в РФ. Высокая бизнес-ценность. Self-hosted и cloud версии — разные базовые URL.

---

## Poster POS API

- **Developer Portal**: https://dev.joinposter.com/
- **API Status**: Active
- **Base URL**: `https://joinposter.com/api/`
- **Auth**: OAuth 2.0 или API Token
- **Key Endpoints**:
  - `GET /menu.getAll` — полное меню
  - `GET /transactions.getTransactions` — транзакции
  - `GET /finance.getTransactions` — финансы
  - `POST /incomingOrders.createIncomingOrder` — создание заказа
  - `GET /storage.getSupplies` — поставки
  - `GET /clients.getClient` — клиент
  - `GET /dash.getRevenue` — выручка
  - `GET /tables.getTable` — столики
- **Rate Limits**: 1000 req/min
- **Sandbox**: Yes — demo аккаунт
- **Official SDK**: PHP, Python, Node.js, iOS, Android
- **Community SDK**: Есть
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — обновление меню, транзакции, заказы
- **Docs Quality**: 4/5 — RU+EN. Хорошая документация, Postman-коллекция.
- **Est. MCP Build**: S-M (15–25h)
- **Notes**: Украинский стартап, работает в СНГ включая РФ. Хороший developer experience.

---

## Yandex Cloud APIs

- **Developer Portal**: https://cloud.yandex.ru/docs/
- **API Status**: Active
- **Base URL**: gRPC endpoints (primary) + REST (`https://[service].api.cloud.yandex.net/`)
- **Auth**: IAM Token (через Yandex OAuth или service account key). `Authorization: Bearer {iam_token}`. IAM token TTL = 12h.
- **Key Services/Endpoints**:
  - Compute: создание/управление VM
  - Object Storage (S3-совместимый): bucket/object операции
  - Managed Databases: PostgreSQL, MySQL, Redis, MongoDB, ClickHouse
  - Cloud Functions: deploy и invoke
  - Message Queue (SQS-совместимый)
  - YDB (serverless): document/table API
  - Speech Kit: STT/TTS
  - Translate API
  - Vision OCR
  - DataSphere: ML notebooks
- **Rate Limits**: Зависит от сервиса и квот аккаунта
- **Sandbox**: Yes — trial аккаунт с кредитами
- **Official SDK**: Python, Go, Java, Node.js — для большинства сервисов
- **Community SDK**: Terraform provider (официальный), Pulumi
- **Existing MCP**: Есть упоминания — поиск "yandex cloud mcp" даёт результаты. Требует проверки.
- **Webhooks**: Да (Event Notifier, Cloud Functions triggers)
- **Docs Quality**: 4/5 — RU+EN. Хорошая документация, активно развивается.
- **Est. MCP Build**: XL (150h+) — полная экосистема, имеет смысл делать по сервисам
- **Notes**: Разумнее делать отдельные MCP-серверы под конкретные сервисы (Storage, Compute, Functions), а не один на всё Yandex Cloud. gRPC API — первичный, REST — secondary.

---

## Selectel API

- **Developer Portal**: https://docs.selectel.ru/
- **API Status**: Active
- **Base URL**: `https://api.selectel.ru/` + сервис-специфичные URL
- **Auth**: Keystone v3 (OpenStack-совместимый). Token получается через `POST /identity/v3/auth/tokens`. Также API-ключи в панели.
- **Key Endpoints**:
  - Серверы: создание/управление через Nova-совместимый API
  - Object Storage (Swift-совместимый)
  - DNS: управление зонами
  - SSL-сертификаты
  - VPC: сети, маршрутизация
  - Managed Kubernetes
- **Rate Limits**: Не публикуются явно
- **Sandbox**: No (только prod)
- **Official SDK**: Terraform provider, Pulumi
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 3/5 — RU only
- **Est. MCP Build**: L (60–100h)
- **Notes**: OpenStack-совместимый API — теоретически можно использовать OpenStack SDK. Нишевый рынок.

---

## Unisender API

- **Developer Portal**: https://www.unisender.com/ru/support/api/
- **API Status**: Active
- **Base URL**: `https://api.unisender.com/ru/api/`
- **Auth**: API Key (параметр `api_key` в запросе)
- **Key Endpoints**:
  - `importContacts` — импорт контактов
  - `subscribe` — подписка
  - `unsubscribe` — отписка
  - `createEmailMessage` — создание письма
  - `sendEmail` — отправка одиночного письма
  - `createList` — создание списка
  - `getLists` — получение списков
  - `getCampaignStatus` — статус рассылки
  - `getVisitedLinks` — статистика переходов
  - `checkEmail` — статус письма
- **Rate Limits**: 20 req/sec на API key
- **Sandbox**: No (тестируют на реальном аккаунте с тестовыми email)
- **Official SDK**: PHP, Python — есть официальные
- **Community SDK**: Node.js, Ruby
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — события по email кампаниям (отправка, открытие, клик, отписка)
- **Docs Quality**: 3/5 — RU+EN (EN неполный)
- **Est. MCP Build**: S (10–15h)
- **Notes**: Простой API, нет sandbox — минус. Широко используется для email-маркетинга в РФ.

---

## SendPulse API

- **Developer Portal**: https://sendpulse.com/developers
- **API Status**: Active
- **Base URL**: `https://api.sendpulse.com/`
- **Auth**: OAuth 2.0 Client Credentials. `POST /oauth/access_token` с client_id + client_secret
- **Key Endpoints**:
  - `GET /addressbooks` — списки рассылки
  - `POST /addressbooks/{id}/emails` — добавление в список
  - `POST /emails` — создание кампании
  - `GET /emails/{id}/stat` — статистика
  - `POST /smtp/emails` — транзакционная отправка
  - `GET /bots/telegram` — Telegram боты
  - `POST /flows/run` — запуск автоматизации
  - `GET /push/tasks` — push-уведомления
  - `POST /viber/tasks` — Viber рассылки
  - `GET /whatsapp/contacts` — WhatsApp контакты
- **Rate Limits**: 10 req/sec
- **Sandbox**: No
- **Official SDK**: PHP, Python, Node.js, Java, .NET
- **Community SDK**: Go, Ruby
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes
- **Docs Quality**: 4/5 — EN+RU (EN первичный)
- **Est. MCP Build**: M (20–30h)
- **Notes**: Multichannel — email + Telegram + Viber + WhatsApp + Push + SMS. Международный продукт, работающий в РФ. Хороший developer experience.

---

## Voximplant API

- **Developer Portal**: https://voximplant.com/docs/references/httpapi/
- **API Status**: Active
- **Base URL**: `https://api.voximplant.com/platform_api/`
- **Auth**: API key + account_id + account_email (подпись запроса)
- **Key Endpoints**:
  - `CreateApplication` — создание приложения
  - `CreateScenario` — создание сценария
  - `StartConference` — конференция
  - `CreateRule` — правило маршрутизации
  - `GetCallHistory` — история звонков
  - `SendSmsMessage` — SMS
  - `AddPstnNumber` — добавление номера
  - `GetUsers` — пользователи (операторы)
  - `CreateQueue` — очередь
  - `BindSkill` — скилл к оператору
- **Rate Limits**: Не публикуются явно
- **Sandbox**: Yes — trial аккаунт с балансом
- **Official SDK**: Node.js, Python, .NET, iOS, Android, Web
- **Community SDK**: Есть
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — события звонков через VoxEngine (serverless JS внутри платформы)
- **Docs Quality**: 4/5 — EN+RU (EN первичный)
- **Est. MCP Build**: M (25–40h)
- **Notes**: Уникальная архитектура — логика звонков пишется на JavaScript (VoxEngine) внутри платформы. HTTP API — только для управления, не для real-time. Высокая ценность для колл-центров.

---

## Zadarma API

- **Developer Portal**: https://zadarma.com/ru/support/api/
- **API Status**: Active
- **Base URL**: `https://api.zadarma.com/`
- **Auth**: Ключ API + секрет (HMAC-SHA1 подпись). Передаётся в заголовке `Authorization`.
- **Key Endpoints**:
  - `GET /v1/info/balance/` — баланс
  - `GET /v1/pbx/internal/` — внутренние номера АТС
  - `POST /v1/request/callback/` — заказ обратного звонка
  - `GET /v1/statistics/` — статистика звонков
  - `GET /v1/pbx/recordingfile/` — запись звонка
  - `GET /v1/direct_numbers/` — прямые номера
  - `POST /v1/sip/callerid/` — CallerID
  - `GET /v1/tariffs/` — тарифы
- **Rate Limits**: 100 req/min
- **Sandbox**: No (trial аккаунт)
- **Official SDK**: PHP, Python, Node.js, Java, C#, Ruby
- **Community SDK**: Есть
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — события звонков (старт, конец, запись готова)
- **Docs Quality**: 3/5 — RU+EN
- **Est. MCP Build**: S-M (15–25h)
- **Notes**: Виртуальная АТС. Нестандартная авторизация (HMAC-SHA1). Международная компания, хорошо работает в РФ.

---

## Mango Office API

- **Developer Portal**: https://www.mango-office.ru/support/api/
- **API Status**: Active
- **Base URL**: `https://app.mango-office.ru/vpbx/`
- **Auth**: API key + salt (SHA256 подпись запроса). `json` параметр + `sign` параметр.
- **Key Endpoints**:
  - `POST /stats/request` — запрос статистики
  - `POST /stats/result` — получение статистики
  - `POST /call` — инициация звонка
  - `GET /config/users/request` — список сотрудников
  - `POST /recording/post/request` — запись разговора
- **Rate Limits**: Не публикуются
- **Sandbox**: No
- **Official SDK**: PHP
- **Community SDK**: Python — есть обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — события через HTTP-уведомления: входящие звонки, завершение, запись
- **Docs Quality**: 2/5 — RU only. Документация устаревшая, примеры неполные.
- **Est. MCP Build**: M (30–50h) — из-за качества документации
- **Notes**: Лидер рынка виртуальных АТС в РФ. Специфическая авторизация с SHA256 подписью. Асинхронная статистика (запрос → polling результата).

---

## Boxberry API

- **Developer Portal**: https://api.boxberry.ru/documentation
- **API Status**: Active
- **Base URL**: `https://api.boxberry.ru/json.php`
- **Auth**: API Token (параметр `token`)
- **Key Endpoints**:
  - `ListCities` — список городов
  - `ListPoints` — ПВЗ
  - `DeliveryCalculation` — расчёт стоимости
  - `OrdersCreate` — создание заказа
  - `OrdersList` — список заказов
  - `TrackingList` — трекинг
  - `CreateOrder` — создание посылки
  - `SetLabel` — этикетка
  - `PointsForParcels` — пункты приёма
- **Rate Limits**: Не публикуются
- **Sandbox**: No (тестовый токен по запросу)
- **Official SDK**: PHP
- **Community SDK**: Python — несколько на GitHub
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет (polling)
- **Docs Quality**: 2/5 — RU only. Документация минимальная.
- **Est. MCP Build**: M (25–40h)
- **Notes**: API устаревшего дизайна (GET-запросы с action-параметром). Нет sandbox. Работает — но неудобно.

---

## SBIS API

- **Developer Portal**: https://sbis.ru/help/integration/api
- **API Status**: Active
- **Base URL**: `https://online.sbis.ru/service/` (JSONRPC)
- **Auth**: Авторизация через `POST /service/?srv=1` метод `СБИС.Авторизоваться`. Возвращает сессионный token.
- **Key Endpoints** (JSONRPC методы):
  - `СБИС.Авторизоваться`
  - `СБИС.СписокДокументов`
  - `СБИС.ПолучитьДокумент`
  - `СБИС.ЗаписатьДокумент`
  - `СБИС.СписокКонтрагентов`
  - `СБИС.ПолучитьКонтрагента`
  - `Регламент.Список`
  - `ЭДО.СписокДокументов`
- **Rate Limits**: Не публикуются
- **Sandbox**: Yes — тестовая компания по заявке
- **Official SDK**: .NET, Python, JavaScript — есть официальные
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Да — push-уведомления на события ЭДО
- **Docs Quality**: 3/5 — RU only
- **Est. MCP Build**: L (70–120h)
- **Notes**: JSONRPC API с методами на русском языке — экзотика. Требует понимания СБИС-специфики (регламенты, тэги документов). Высокая бизнес-ценность для бухгалтерии. Требует УКЭП для ЭДО-функций.

---

## Gosuslugi ЕСИА API

- **Developer Portal**: https://esia.gosuslugi.ru / https://digital.gov.ru/
- **API Status**: Active (ограниченный доступ)
- **Base URL**: `https://esia.gosuslugi.ru/aas/oauth2/`
- **Auth**: OAuth 2.0 с ГОСТ-криптографией. **Требует квалифицированной электронной подписи (УКЭП) в запросе.** Это ГОСТ-подпись, не RSA.
- **Key Endpoints**:
  - `GET /aas/oauth2/ac` — authorization code flow
  - `POST /aas/oauth2/token` — получение токена
  - `GET /rs/prns/{OID}/` — данные пользователя
  - `GET /rs/orgs/{OID}/` — данные организации
- **Rate Limits**: Зависит от договора с Минцифры
- **Sandbox**: Yes — esia-portal1.test.gosuslugi.ru (тестовая среда ЕСИА)
- **Official SDK**: Java (рекомендован), PHP, Python — есть от сообщества
- **Community SDK**: Python-esia обёртки, но требуют ГОСТ-криптографию (КриптоПро или OpenSSL с ГОСТ)
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 3/5 — RU only. Документация официальная, но бюрократичная.
- **Est. MCP Build**: XL (150h+)
- **Notes**: **Серьёзные барьеры входа.** Требует: (1) регистрации системы в реестре Минцифры, (2) УКЭП в ГОСТ-формате (КриптоПро), (3) тестовой среды, (4) договора. Недоступно для частных разработчиков без ИП/ООО. Только для юридически значимой идентификации.

---

## Честный ЗНАК (CRPT) API

- **Developer Portal**: https://честныйзнак.рф / https://markirovka.crpt.ru/
- **API Status**: Active
- **Base URL**: `https://markirovka.crpt.ru/api/v3/`
- **Auth**: OAuth 2.0 с УКЭП. Требует квалифицированной подписи для регистрации документов.
- **Key Endpoints**:
  - `POST /documents/create` — создание документа
  - `GET /documents/{id}` — статус документа
  - `POST /codes/create` — заказ кодов маркировки
  - `GET /codes` — список кодов
  - `POST /products/create` — регистрация товара
  - `GET /products/{id}` — информация о товаре
- **Rate Limits**: Зависит от тарифа участника
- **Sandbox**: Yes — markirovka.crpt.ru (тестовая среда, отдельные логины)
- **Official SDK**: Java, .NET
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Есть (статусы документов)
- **Docs Quality**: 3/5 — RU only
- **Est. MCP Build**: XL (150h+)
- **Notes**: **Обязательная маркировка товаров.** Требует статуса участника оборота (ИП/ООО + договор с ЦРПТ). УКЭП обязательна. Высокая бизнес-ценность для retail/производства, но высокий барьер входа.

---

## SuperJob API

- **Developer Portal**: https://api.superjob.ru/
- **API Status**: Active
- **Base URL**: `https://api.superjob.ru/2.0/`
- **Auth**: OAuth 2.0 + client_secret. Access token в заголовке `X-Api-App-Id`.
- **Key Endpoints**:
  - `GET /vacancies/` — вакансии
  - `GET /resumes/` — резюме (работодатель)
  - `GET /user/current/` — текущий пользователь
  - `GET /clients/` — компании
  - `POST /vacancies/` — создание вакансии
  - `GET /candidates/` — кандидаты
  - `GET /negotiations/` — отклики
- **Rate Limits**: 5 req/sec
- **Sandbox**: No
- **Official SDK**: Нет
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 3/5 — RU only
- **Est. MCP Build**: S-M (15–25h)
- **Notes**: Проще чем HH.ru API, но меньше данных. Требует регистрации работодателя.

---

## Roistat API

- **Developer Portal**: https://roistat.com/wiki/display/RU/API
- **API Status**: Active
- **Base URL**: `https://cloud.roistat.com/api/`
- **Auth**: API Key в заголовке `Api-key`
- **Key Endpoints**:
  - `GET /project/integration/list` — список интеграций
  - `GET /project/analytic/data` — аналитические данные
  - `GET /project/lead/list` — лиды
  - `POST /project/lead/create` — создание лида
  - `GET /project/call/list` — звонки
  - `GET /project/visit/list` — визиты
  - `GET /project/order/list` — заказы
  - `GET /project/channel/list` — каналы
- **Rate Limits**: Не публикуются
- **Sandbox**: No
- **Official SDK**: Нет
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — события по лидам, звонкам
- **Docs Quality**: 3/5 — RU only
- **Est. MCP Build**: M (20–35h)
- **Notes**: Сквозная аналитика — высокая ценность для маркетологов. Требует платного аккаунта Roistat.

---

## 2GIS API

- **Developer Portal**: https://docs.2gis.com/ru/
- **API Status**: Active
- **Base URL**: `https://catalog.api.2gis.com/3.0/` (Places) / `https://routing.api.2gis.com/` (Routes)
- **Auth**: API Key (параметр `key`)
- **Key Endpoints**:
  - `GET /items` — поиск мест
  - `GET /items/byid` — место по ID
  - `GET /items/rubrics` — рубрики
  - `GET /items/aggregate` — агрегация
  - Routing: `POST /carrouting/route` — маршрут на авто
  - Routing: `POST /pedestrian/route` — пешеходный маршрут
  - Geocoding: `GET /geocode` — геокодирование
  - Reverse Geocoding: `GET /geocode` — обратное геокодирование
  - Map Tiles: тайлы карты
- **Rate Limits**: Зависит от тарифа. Бесплатный — 1000 req/day
- **Sandbox**: No (бесплатный тариф = sandbox)
- **Official SDK**: JavaScript, iOS, Android — для карт; REST — без SDK
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 4/5 — RU+EN
- **Est. MCP Build**: S (10–15h)
- **Notes**: Хороший аналог Google Maps для РФ + СНГ. Данные о российских компаниях лучше чем у Google. Бесплатный тариф для начала разработки.

---

## VK Ads API (myTarget)

- **Developer Portal**: https://target.my.com/adv/api/doc
- **API Status**: Active
- **Base URL**: `https://target.my.com/api/v2/`
- **Auth**: OAuth 2.0. Scope: `read_ads`, `edit_ads`. Bearer token.
- **Key Endpoints**:
  - `GET /campaigns.json` — кампании
  - `POST /campaigns.json` — создание кампании
  - `GET /banners.json` — баннеры
  - `GET /statistics/banners/day.json` — статистика по дням
  - `GET /remarketing/audiences.json` — аудитории ретаргетинга
  - `POST /remarketing/audience/contacts.json` — загрузка аудитории
  - `GET /targeting.json` — таргетинг
  - `GET /budget.json` — бюджет
  - `GET /packages.json` — пакеты
- **Rate Limits**: 200 req/min на аккаунт
- **Sandbox**: No (только prod, можно создавать кампании с нулевым бюджетом)
- **Official SDK**: Python SDK (официальный от VK)
- **Community SDK**: PHP, Node.js
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет (polling)
- **Docs Quality**: 3/5 — RU only (местами EN)
- **Est. MCP Build**: M (25–40h)
- **Notes**: Реклама во ВКонтакте, Одноклассниках, проектах VK. Требует рекламного кабинета.

---

## OK.ru (Одноклассники) API

- **Developer Portal**: https://apiok.ru/dev/
- **API Status**: Active
- **Base URL**: `https://api.ok.ru/fb.do`
- **Auth**: OAuth 2.0 + подпись методов (MD5 от параметров + session secret)
- **Key Endpoints**:
  - `users.getCurrentUser` — текущий пользователь
  - `group.getUserGroupsV2` — группы пользователя
  - `mediatopic.post` — публикация поста
  - `discuss.getList` — комментарии
  - `stream.get` — лента
  - `photos.getPhotoInfo` — фото
  - `video.getInfo` — видео
- **Rate Limits**: 30 req/sec на метод
- **Sandbox**: No
- **Official SDK**: Нет официального
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes (Group Hooks для групп)
- **Docs Quality**: 3/5 — RU+EN (EN неполный)
- **Est. MCP Build**: M (20–35h)
- **Notes**: Специфическая подпись запросов (MD5). Меньше аудитория чем VK, но демография другая (35+). Актуален для определённых ниш.

---

## Calltouch API

- **Developer Portal**: https://www.calltouch.ru/support/api/
- **API Status**: Active
- **Base URL**: `https://api.calltouch.ru/`
- **Auth**: API Token (в URL или заголовке)
- **Key Endpoints**:
  - `GET /calls-service/RestAPI/{siteId}/calls-diary/calls` — список звонков
  - `POST /calls-service/RestAPI/leads/` — создание лида
  - `GET /calls-service/RestAPI/{siteId}/visits-diary/visits` — визиты
  - `GET /calls-service/RestAPI/{siteId}/goals/` — цели
  - `POST /calls-service/RestAPI/{siteId}/caller-ids/` — Caller ID
- **Rate Limits**: Не публикуются
- **Sandbox**: No
- **Official SDK**: Нет
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — webhook на входящий звонок
- **Docs Quality**: 3/5 — RU only
- **Est. MCP Build**: S-M (15–25h)
- **Notes**: Коллтрекинг — атрибуция звонков. Нишевый, но полезный для маркетингового стека.

---

## Mindbox API

- **Developer Portal**: https://developers.mindbox.ru/
- **API Status**: Active
- **Base URL**: `https://api.mindbox.ru/v3/`
- **Auth**: Endpoint ID + Secret Key в заголовке `Authorization: Mindbox secretKey="{key}"`
- **Key Endpoints**:
  - `POST /operations/async` — асинхронная операция (регистрация заказа, событие)
  - `POST /operations/sync` — синхронная операция (получение скидок в реальном времени)
  - `GET /operations/result` — результат async операции
  - Основные операции через тип `operationType`:
    - `Website.CreateOrder`
    - `Website.SetCartItems`
    - `Website.AuthorizeCustomer`
    - `Website.RegisterCustomer`
- **Rate Limits**: 300 req/sec async; 100 req/sec sync
- **Sandbox**: Yes — sandbox.mindbox.ru
- **Official SDK**: .NET, PHP — официальные
- **Community SDK**: Python
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — вебхуки на триггерные события
- **Docs Quality**: 4/5 — RU+EN
- **Est. MCP Build**: M (25–40h)
- **Notes**: Enterprise-класс CDP/маркетинг-автоматизация. Используется крупными ритейлерами РФ. Операционная модель (не REST-ресурсы) — нестандартный дизайн API.

---

## DPD Russia API

- **Developer Portal**: https://www.dpd.ru/ols/b2b/dpd_xml_api_1.1.htm
- **API Status**: Active (устаревший дизайн)
- **Base URL**: `https://ws.dpd.ru/services/`
- **Auth**: clientKey + clientNumber (в каждом SOAP-запросе)
- **Key Endpoints** (SOAP/XML):
  - `geography2` — география (города, ПВЗ)
  - `calculator2` — расчёт стоимости
  - `order2` — создание заказа
  - `tracking` — трекинг
  - `invoice` — накладные
  - `label` — этикетки
- **Rate Limits**: Не публикуются
- **Sandbox**: No (по запросу тестовый аккаунт)
- **Official SDK**: Java, .NET
- **Community SDK**: Python-обёртки (zeep/suds)
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 2/5 — RU only. **SOAP/XML API** — устаревшая технология. Документация 2010-х годов.
- **Est. MCP Build**: L (60–100h) — из-за SOAP
- **Notes**: **SOAP API** — сложнее для MCP. Нужен SOAP-клиент или конвертация в REST. Низкий приоритет из-за технического долга.

---

## Dostavista API

- **Developer Portal**: https://dostavista.ru/api/
- **API Status**: Active
- **Base URL**: `https://robot.dostavista.ru/business-api/1.3/`
- **Auth**: API Token в заголовке `X-DV-Auth-Token`
- **Key Endpoints**:
  - `POST /calculate-order` — расчёт стоимости
  - `POST /create-order` — создание заказа
  - `GET /orders` — список заказов
  - `GET /order` — заказ по ID
  - `POST /cancel-order` — отмена
  - `GET /couriers` — курьеры
  - `GET /delivery-intervals` — интервалы доставки
- **Rate Limits**: Не публикуются
- **Sandbox**: Yes — тестовая среда по запросу
- **Official SDK**: Нет
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — статусы заказов
- **Docs Quality**: 3/5 — RU+EN
- **Est. MCP Build**: S (10–20h)
- **Notes**: Курьерская доставка в пределах города. Простой REST API. Актуален для e-commerce с локальной доставкой.

---

## AliExpress Seller API

- **Developer Portal**: https://open.aliexpress.com/
- **API Status**: Active (ограниченный доступ для РФ)
- **Base URL**: `https://api.taobao.com/router/rest` (TOP API)
- **Auth**: App Key + App Secret → MD5 подпись. Session token для операций от имени продавца.
- **Key Endpoints**:
  - `aliexpress.solution.order.get` — заказы
  - `aliexpress.solution.product.list.get` — товары
  - `aliexpress.solution.product.update` — обновление товара
  - `aliexpress.ds.order.create` — создание заказа (дропшиппинг)
  - `aliexpress.logistics.buyer.freight.calculate` — расчёт доставки
- **Rate Limits**: Зависит от уровня продавца. Базово — 1000 req/min
- **Sandbox**: Yes — sandbox.aliexpress.com
- **Official SDK**: Python, Java, PHP — TopSDK
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет нативных (polling)
- **Docs Quality**: 2/5 — EN (частично). Документация неполная, примеры устаревшие.
- **Est. MCP Build**: L (60–100h)
- **Notes**: Специфика РФ — после 2022 ограничения. API Alibaba-экосистемы, технически сложный. Низкий приоритет для российского рынка.

---

## Kontur.Extern API

- **Developer Portal**: https://extern-api.testkontur.ru/swagger/
- **API Status**: Active
- **Base URL**: `https://extern-api.kontur.ru/`
- **Auth**: API Key + сессионный ключ (Kontur SSO)
- **Key Endpoints**:
  - `GET /v1/{accountId}/docflows` — список документооборотов
  - `POST /v1/{accountId}/drafts` — создание черновика
  - `POST /v1/{accountId}/drafts/{draftId}/documents` — добавление документа
  - `POST /v1/{accountId}/drafts/{draftId}/send` — отправка в ФНС/ПФР/ФСС
  - `GET /v1/{accountId}/docflows/{docflowId}/documents` — документы
  - `GET /v1/{accountId}/organizations` — организации
- **Rate Limits**: Не публикуются
- **Sandbox**: Yes — extern-api.testkontur.ru (полноценный тест-стенд с тестовым сертификатом)
- **Official SDK**: .NET (официальный), Java, Python
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes
- **Docs Quality**: 4/5 — RU+EN. Swagger UI доступен.
- **Est. MCP Build**: L (80–130h)
- **Notes**: Электронная отчётность в ФНС, ПФР, ФСС. Требует УКЭП. Sandbox с тестовым сертификатом — большой плюс. Высокая бизнес-ценность для бухгалтерии.

---

## Megaplan API

- **Developer Portal**: https://help.megaplan.ru/API
- **API Status**: Active
- **Base URL**: `https://{account}.megaplan.ru/BumsCommonApiV01/`
- **Auth**: Token-based (POST /BumsCommonApiV01/User/authorize.api)
- **Key Endpoints**:
  - `Task/list.api` — список задач
  - `Task/create.api` — создание задачи
  - `Contractor/list.api` — контрагенты
  - `Deal/list.api` — сделки
  - `Deal/create.api` — создание сделки
  - `Comment/list.api` — комментарии
  - `File/upload.api` — файлы
  - `Staff/list.api` — сотрудники
- **Rate Limits**: Не публикуются
- **Sandbox**: No (trial аккаунт)
- **Official SDK**: Нет
- **Community SDK**: PHP, Python — обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 2/5 — RU only. Документация устаревшая.
- **Est. MCP Build**: M (25–40h)
- **Notes**: Устаревший REST-дизайн (не RESTful). Нет webhooks — существенный минус. Меньший рынок чем Bitrix24/amoCRM.

---

## Planfix API

- **Developer Portal**: https://planfix.com/docs/
- **API Status**: Active
- **Base URL**: `https://api.planfix.com/xml/` (XML API) / `https://api.planfix.com/rest/` (REST API — новый)
- **Auth**: XML API: signature (MD5). REST API: Bearer token.
- **Key Endpoints** (REST):
  - `GET /task/` — задачи
  - `POST /task/` — создание задачи
  - `GET /project/` — проекты
  - `GET /contact/` — контакты
  - `GET /user/` — пользователи
  - `GET /analytics/` — аналитика
  - `POST /action/` — действия (комментарии, изменения)
  - `GET /field/` — кастомные поля
- **Rate Limits**: 100 req/min
- **Sandbox**: No (trial)
- **Official SDK**: Нет
- **Community SDK**: PHP, Python — обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — webhook на события задач, проектов
- **Docs Quality**: 3/5 — RU+EN
- **Est. MCP Build**: M (20–35h)
- **Notes**: Есть и XML и REST API — использовать REST (новый). Гибкая система кастомных полей. Используется среди среднего бизнеса в РФ.

---

## DashaMail API

- **Developer Portal**: https://dashamail.ru/api/
- **API Status**: Active
- **Base URL**: `https://api.dashamail.com/`
- **Auth**: API Key (параметр `api_key`)
- **Key Endpoints**:
  - `lists.get` — списки рассылки
  - `lists.add` — создание списка
  - `subscribers.add` — добавление подписчика
  - `subscribers.update` — обновление подписчика
  - `campaigns.create` — создание рассылки
  - `campaigns.send` — отправка
  - `campaigns.get_stat` — статистика
  - `transactional.send` — транзакционные письма
- **Rate Limits**: Не публикуются
- **Sandbox**: No
- **Official SDK**: PHP, Python
- **Community SDK**: Минимальные
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes
- **Docs Quality**: 3/5 — RU only
- **Est. MCP Build**: S (8–15h)
- **Notes**: Небольшой российский email-сервис. Простой API.

---

## Sberbank Acquiring API

- **Developer Portal**: https://developer.sberbank.ru / https://ecom.sberbank.ru
- **API Status**: Active
- **Base URL**: `https://securepayments.sberbank.ru/payment/rest/`
- **Auth**: userName + password (legacy) или token (новый). Передаётся в параметрах запроса.
- **Key Endpoints**:
  - `POST /register.do` — регистрация заказа
  - `POST /orderStatus.do` — статус заказа
  - `POST /paymentOrderBinding.do` — оплата привязанной картой
  - `POST /refund.do` — возврат
  - `POST /reverse.do` — отмена
  - `POST /getLastOrdersForMerchants.do` — история
  - `POST /sbp/c2b/qr/dynamic/get` — QR для СБП
- **Rate Limits**: Не публикуются
- **Sandbox**: Yes — 3dsec.paymentgate.ru (тестовая среда)
- **Official SDK**: PHP, Java, .NET
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — callbacks на статусы
- **Docs Quality**: 3/5 — RU only. Документация есть, но устаревающая.
- **Est. MCP Build**: M (20–35h)
- **Notes**: Крупнейший эквайер РФ. Нестандартный REST (не RESTful). Требует договора эквайринга со Сбербанком.

---

## SBP API (Система быстрых платежей)

- **Developer Portal**: https://sbp.nspk.ru/
- **API Status**: Active
- **Base URL**: Зависит от банка-участника (нет единого endpoint)
- **Auth**: Зависит от банка-участника
- **Key Endpoints**: API реализуется банком-участником, не НСПК напрямую. Базовые операции: QR-генерация, C2B платёж, статус платежа, возврат.
- **Rate Limits**: Зависит от банка
- **Sandbox**: Зависит от банка
- **Official SDK**: Нет единого
- **Existing MCP**: Не обнаружено
- **Docs Quality**: 2/5 — RU only. Документация НСПК — концептуальная, не техническая.
- **Est. MCP Build**: N/A — нет единого API
- **Notes**: **Не единый API.** СБП — стандарт/протокол, реализованный банками. Для MCP нужно интегрироваться с конкретным банком (Тинькофф, Сбербанк, ВТБ уже включены в другие API выше). Рекомендую не делать отдельный MCP для "СБП", а включить СБП-функции в банковские MCP.

---

## Aviasales API

- **Developer Portal**: https://www.aviasales.ru/API / https://api.aviasales.ru/docs
- **API Status**: Active (Travelpayouts API)
- **Base URL**: `https://api.travelpayouts.com/`
- **Auth**: API Token в заголовке `X-Access-Token`
- **Key Endpoints**:
  - `GET /v1/prices/cheap` — дешёвые билеты
  - `GET /v1/prices/monthly` — цены по месяцам
  - `GET /v2/prices/latest` — последние найденные цены
  - `GET /v1/prices/calendar` — календарь цен
  - `GET /v1/directions` — популярные направления
  - `GET /data/airlines.json` — справочник авиакомпаний
  - `GET /data/airports.json` — справочник аэропортов
  - `GET /data/cities.json` — справочник городов
- **Rate Limits**: 200 req/min
- **Sandbox**: No (данные реальные, поиск не создаёт бронирований)
- **Official SDK**: Нет
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 4/5 — RU+EN
- **Est. MCP Build**: S (10–15h)
- **Notes**: Данные о ценах на билеты (кэш, не real-time поиск). Для real-time поиска нужен Aviasales Search API (отдельно, сложнее). Хорошо для travel-помощников.

---

## CIAN API

- **Developer Portal**: https://cian.ru/help/about/api-about/
- **API Status**: Ограниченный (только для агентств/застройщиков)
- **Base URL**: `https://api.cian.ru/`
- **Auth**: API Key (только для верифицированных агентств/застройщиков)
- **Key Endpoints**:
  - `POST /announcements/v2/create` — создание объявления
  - `PUT /announcements/v2/update` — обновление объявления
  - `DELETE /announcements/v2/delete` — удаление
  - `GET /announcements/v2/list` — список объявлений
  - `POST /photos/upload` — загрузка фото
- **Rate Limits**: Зависит от тарифа
- **Sandbox**: No
- **Official SDK**: Нет
- **Community SDK**: Минимальные
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет
- **Docs Quality**: 2/5 — RU only. Документация закрытая, только после подключения.
- **Est. MCP Build**: M (25–40h)
- **Notes**: **Только для агентств недвижимости** — доступ физлицам закрыт. Ограниченный рынок для MCP.

---

## Yandex Go / Taxi API

- **Developer Portal**: https://fleet.taxi.yandex.ru / корпоративное API
- **API Status**: Active (B2B)
- **Base URL**: `https://fleet-api.taxi.yandex.net/`
- **Auth**: API Key (Park ID + Client ID + Client Secret → Bearer token)
- **Key Endpoints** (Fleet API для таксопарков):
  - `GET /v1/parks/drivers/list` — список водителей
  - `GET /v2/parks/orders/list` — заказы
  - `GET /v1/parks/driver-work-rules` — правила работы
  - `GET /v1/parks/transactions/list` — транзакции
  - Corporate API (для компаний):
  - `POST /v2/orders` — заказ такси для сотрудника
- **Rate Limits**: Зависит от тарифа
- **Sandbox**: No
- **Official SDK**: Нет
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Нет (polling)
- **Docs Quality**: 3/5 — RU only
- **Est. MCP Build**: M (25–40h)
- **Notes**: Два разных API: Fleet (для таксопарков) и Corporate (для корпоративных поездок). Разные auth и базовые URL. Высокая ценность для корпоративного сегмента.

---

## Ostrovok API

- **Developer Portal**: https://ostrovok.ru/about/extranet-api/ (закрытый)
- **API Status**: Active (только для партнёров)
- **Base URL**: Не публикуется
- **Auth**: Partner ID + Secret (HMAC)
- **Notes**: Полностью закрытый партнёрский API для отелей. Документация по запросу. **Низкий приоритет** без партнёрского договора.

---

## r_keeper API

- **Developer Portal**: https://r-keeper.ru/technologies/api/
- **API Status**: Active
- **Base URL**: Зависит от версии (локальный сервер или облако)
- **Auth**: Логин/пароль → XML-сессия
- **Notes**: **XML/SOAP API** как у DPD. Очень legacy. Лидер рынка ресторанной автоматизации в РФ, но API устаревший. MCP Build: XL. Низкий приоритет из-за технической сложности.

---

## Mercury (Меркурий) API

- **Developer Portal**: https://vetrf.ru/vetrf/
- **API Status**: Active (ограниченный)
- **Auth**: SOAP + УКЭП
- **Notes**: Ветеринарная сертификация — требует аккредитации Россельхознадзора. **Узкоспециализированный.** XL build. Низкий приоритет для общего MCP.

---

## EGAIS API

- **Developer Portal**: https://egais.ru/
- **API Status**: Active
- **Auth**: Через УТМ (Универсальный Транспортный Модуль) — локальное ПО + УКЭП
- **Notes**: Алкогольный учёт — взаимодействие через локальный УТМ (не REST API). Практически невозможно сделать облачный MCP без физического доступа к УТМ. **Исключить из приоритетов.**

---

## nalog.ru (ФНС) API

- **Developer Portal**: https://www.nalog.gov.ru/rn77/related_activities/api/
- **API Status**: Частично активный
- **Auth**: УКЭП или личный кабинет налогоплательщика
- **Notes**: Несколько разных API: открытые данные (реестры юрлиц — бесплатно), ЛК физлица, ЛК ЮЛ (УКЭП). Разный уровень доступа. ЕГРЮЛ/ЕГРИП данные лучше получать через DaData или Kontur.Focus. M-L build. Средний приоритет.

---

## Yclients API

- **Developer Portal**: https://developers.yclients.com/
- **API Status**: Active
- **Base URL**: `https://api.yclients.com/api/v1/`
- **Auth**: Bearer token (Partner token + User token)
- **Key Endpoints**:
  - `GET /company/{id}/records` — записи (бронирования)
  - `POST /record/{companyId}` — создание записи
  - `GET /company/{id}/services` — услуги
  - `GET /company/{id}/staff` — сотрудники
  - `GET /company/{id}/clients` — клиенты
  - `GET /company/{id}/goods` — товары
  - `GET /company/{id}/finance/transactions` — финансы
- **Rate Limits**: Не публикуются
- **Sandbox**: No
- **Official SDK**: Нет
- **Community SDK**: Python-обёртки
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — бронирования, изменения
- **Docs Quality**: 3/5 — RU+EN
- **Est. MCP Build**: M (20–35h)
- **Notes**: Лидер онлайн-записи в салоны красоты/медицину/спорт в РФ. Высокая ценность для beauty/health индустрии.

---

## RetailCRM API

- **Developer Portal**: https://docs.retailcrm.ru/
- **API Status**: Active
- **Base URL**: `https://{account}.retailcrm.ru/api/v5/`
- **Auth**: API Key в заголовке `X-API-KEY`
- **Key Endpoints**:
  - `GET /orders` — заказы
  - `POST /orders/create` — создание заказа
  - `GET /customers` — клиенты
  - `POST /customers/create` — создание клиента
  - `GET /store/products` — товары
  - `GET /statistic/orders` — статистика
  - `POST /orders/upload` — массовая загрузка
  - `GET /delivery/calculate` — расчёт доставки
  - `GET /marketplace/orders` — заказы маркетплейсов
- **Rate Limits**: 200 req/min
- **Sandbox**: No (trial)
- **Official SDK**: PHP, Python (официальные)
- **Community SDK**: Go, Node.js
- **Existing MCP**: Не обнаружено
- **Webhooks**: Yes — богатый набор событий: заказы, клиенты, задачи
- **Docs Quality**: 5/5 — RU+EN. Лучшая документация среди российских CRM. Swagger, postman, examples.
- **Est. MCP Build**: M (20–35h)
- **Notes**: Специализированная CRM для e-commerce. Нативные интеграции с маркетплейсами. **Топ-кандидат** — отличная документация, webhooks, e-commerce фокус.

---

## Конtur.Focus API

*(Дублирует блок выше — см. Kontur.Focus)*

---

## UIS (uiscom) API

- **Developer Portal**: https://uiscom.ru/developers/
- **API Status**: Active
- **Base URL**: `https://dataapi.uiscom.ru/v2.0`
- **Auth**: API Key
- **Key Endpoints**:
  - Отчёты по звонкам
  - Статистика
  - Управление сотрудниками
- **Docs Quality**: 3/5 — RU only
- **Est. MCP Build**: M (20–35h)
- **Notes**: Коллтрекинг + виртуальная АТС. Схожий с Calltouch функционал.

---

---

# IMPLEMENTATION PRIORITY MATRIX

| # | Сервис | Автомат. ценность (1-10) | Качество API (1-5) | Сложность MCP | Sandbox | Существующий MCP | ПРИОРИТЕТ |
|---|--------|--------------------------|---------------------|---------------|---------|------------------|-----------|
| 1 | **DaData** | 9 | 5 | S | ✅ (free tier) | ❌ | 🔴 TOP |
| 2 | **МойСклад** | 9 | 5 | S | ✅ | ❌ | 🔴 TOP |
| 3 | **YooKassa** | 9 | 5 | S | ✅ | ❌ | 🔴 TOP |
| 4 | **CDEK** | 9 | 4 | S-M | ✅ | ❌ | 🔴 TOP |
| 5 | **Ozon Seller** | 9 | 4 | M | ✅ | ❌ | 🔴 TOP |
| 6 | **amoCRM** | 8 | 4 | S-M | ✅ | ❌ | 🔴 TOP |
| 7 | **RetailCRM** | 8 | 5 | M | ❌ | ❌ | 🔴 TOP |
| 8 | **Bitrix24** | 8 | 4 | M | ✅ | ⚠️ частичный | 🔴 TOP |
| 9 | **Yandex Metrica** | 8 | 4 | S | ❌ | ❌ | 🟠 HIGH |
| 10 | **CloudPayments** | 8 | 4 | S | ✅ | ❌ | 🟠 HIGH |
| 11 | **Tinkoff Acquiring** | 8 | 4 | S-M | ✅ | ❌ | 🟠 HIGH |
| 12 | **HH.ru** | 8 | 4 | M | ❌ | ❌ | 🟠 HIGH |
| 13 | **Wildberries Seller** | 9 | 3 | M | ❌ | ❌ | 🟠 HIGH |
| 14 | **Yandex Market Seller** | 8 | 4 | M | ✅ | ❌ | 🟠 HIGH |
| 15 | **Yandex Direct** | 8 | 4 | M | ✅ | ❌ | 🟠 HIGH |
| 16 | **SendPulse** | 7 | 4 | M | ❌ | ❌ | 🟠 HIGH |
| 17 | **Huntflow** | 7 | 4 | M | ❌ | ❌ | 🟠 HIGH |
| 18 | **Kontur.Focus** | 8 | 3 | S-M | ❌ | ❌ | 🟠 HIGH |
| 19 | **Voximplant** | 7 | 4 | M | ✅ | ❌ | 🟠 HIGH |
| 20 | **2GIS** | 7 | 4 | S | ✅ (free) | ❌ | 🟠 HIGH |
| 21 | **Yclients** | 7 | 3 | M | ❌ | ❌ | 🟡 MED |
| 22 | **Avito** | 7 | 3 | M | ❌ | ❌ | 🟡 MED |
| 23 | **Mindbox** | 7 | 4 | M | ✅ | ❌ | 🟡 MED |
| 24 | **Poster POS** | 6 | 4 | S-M | ✅ | ❌ | 🟡 MED |
| 25 | **iiko** | 7 | 3 | M | ✅ | ❌ | 🟡 MED |
| 26 | **Kontur.Diadoc** | 8 | 4 | L | ✅ | ❌ | 🟡 MED (барьер: УКЭП) |
| 27 | **Kontur.Extern** | 8 | 4 | L | ✅ | ❌ | 🟡 MED (барьер: УКЭП) |
| 28 | **Zadarma** | 6 | 3 | S-M | ❌ | ❌ | 🟡 MED |
| 29 | **Dostavista** | 6 | 3 | S | ✅ | ❌ | 🟡 MED |
| 30 | **VK API** | 7 | 3 | M | ❌ | ⚠️ есть | 🟡 MED (проверить существующий) |
| 31 | **Telegram Bot API** | 8 | 5 | S | ⚠️ test | ✅ несколько | 🟢 SKIP (уже есть MCP) |
| 32 | **VK Ads** | 7 | 3 | M | ❌ | ❌ | 🟡 MED |
| 33 | **Sberbank Acquiring** | 7 | 3 | M | ✅ | ❌ | 🟡 MED |
| 34 | **Aviasales** | 6 | 4 | S | ❌ | ❌ | 🟡 MED |
| 35 | **Unisender** | 6 | 3 | S | ❌ | ❌ | 🟡 MED |
| 36 | **Calltouch** | 6 | 3 | S-M | ❌ | ❌ | 🟡 MED |
| 37 | **Roistat** | 6 | 3 | M | ❌ | ❌ | 🟡 MED |
| 38 | **Mango Office** | 6 | 2 | M | ❌ | ❌ | 🟡 MED |
| 39 | **UIS** | 5 | 3 | M | ❌ | ❌ | 🟡 MED |
| 40 | **SBIS** | 7 | 3 | L | ✅ | ❌ | 🔵 LOW-MED (барьер: УКЭП) |
| 41 | **SuperJob** | 6 | 3 | S-M | ❌ | ❌ | 🔵 LOW-MED |
| 42 | **DashaMail** | 4 | 3 | S | ❌ | ❌ | 🔵 LOW |
| 43 | **Robokassa** | 6 | 3 | M | ✅ | ❌ | 🔵 LOW-MED |
| 44 | **OK.ru** | 5 | 3 | M | ❌ | ❌ | 🔵 LOW |
| 45 | **Boxberry** | 5 | 2 | M | ❌ | ❌ | 🔵 LOW |
| 46 | **Pochta Russia** | 6 | 2 | L | ❌ | ❌ | 🔵 LOW |
| 47 | **Yandex Cloud** | 8 | 4 | XL | ✅ | ⚠️ частичный | 🔵 LOW (делать по сервисам) |
| 48 | **Selectel** | 5 | 3 | L | ❌ | ❌ | 🔵 LOW |
| 49 | **Megaplan** | 5 | 2 | M | ❌ | ❌ | 🔵 LOW |
| 50 | **Planfix** | 5 | 3 | M | ❌ | ❌ | 🔵 LOW |
| 51 | **Yandex Go** | 6 | 3 | M | ❌ | ❌ | 🔵 LOW |
| 52 | **CIAN** | 5 | 2 | M | ❌ | ❌ | 🔵 LOW (закрытый) |
| 53 | **1C:Enterprise** | 9 | 2 | XL | ❌ | ❌ | ⚫ HOLD (платформа, не API) |
| 54 | **Gosuslugi ЕСИА** | 7 | 3 | XL | ✅ | ❌ | ⚫ HOLD (ГОСТ-криптография) |
| 55 | **Честный ЗНАК** | 6 | 3 | XL | ✅ | ❌ | ⚫ HOLD (УКЭП обязательна) |
| 56 | **AliExpress** | 5 | 2 | L | ✅ | ❌ | ⚫ LOW (РФ-ограничения) |
| 57 | **DPD Russia** | 5 | 2 | L | ❌ | ❌ | ⚫ LOW (SOAP) |
| 58 | **r_keeper** | 6 | 1 | XL | ❌ | ❌ | ⚫ LOW (SOAP/XML legacy) |
| 59 | **EGAIS** | 5 | 1 | XL | ❌ | ❌ | ⚫ SKIP (УТМ, не API) |
| 60 | **Mercury** | 4 | 1 | XL | ❌ | ❌ | ⚫ SKIP (SOAP + аккредитация) |
| 61 | **SBP** | N/A | N/A | N/A | N/A | N/A | ⚫ SKIP (не единый API) |
| 62 | **Ostrovok** | 4 | N/A | L | ❌ | ❌ | ⚫ SKIP (закрытый) |

---

## Рекомендуемый порядок реализации

### Волна 1 — Быстрые победы (S-size, sandbox, отличные docs)
1. DaData — 8–12h
2. YooKassa — 10–15h
3. МойСклад — 12–20h
4. CDEK — 15–25h
5. Yandex Metrica — 10–20h

### Волна 2 — Высокая ценность (M-size, хорошие docs)
6. amoCRM — 15–30h
7. Ozon Seller — 20–40h
8. RetailCRM — 20–35h
9. CloudPayments — 10–15h
10. 2GIS — 10–15h

### Волна 3 — Стратегические (M-size, большой рынок)
11. Bitrix24 — 25–45h
12. HH.ru — 20–35h
13. Wildberries Seller — 30–50h
14. Yandex Direct — 30–50h
15. Tinkoff Acquiring — 15–25h

### Волна 4 — Специализированные
16. Kontur.Focus — 15–25h
17. Voximplant — 25–40h
18. SendPulse — 20–30h
19. iiko / Poster POS — 15–50h
20. Mindbox — 25–40h

### На паузе (высокий барьер или legacy tech)
- 1C:Enterprise, Gosuslugi, Честный ЗНАК, EGAIS, DPD, r_keeper

---

*Дата среза данных: август 2025. Требует живой верификации API endpoints перед разработкой.*
