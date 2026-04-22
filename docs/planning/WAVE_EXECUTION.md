# WAVE_EXECUTION.md — Точные инструкции для запуска каждой волны

**Дата:** 2026-04-01
**Источник:** BUILD_QUEUE.md + MASTER_INVENTORY.md
**Как использовать:** копируй промпт агента → запускай в Claude Code

---

## WAVE 0: АПГРЕЙД СУЩЕСТВУЮЩИХ (3-5 дней)

> Запускаем 8 агентов параллельно. Каждый получает 1-2 сервера.
> Каждый агент работает в отдельном worktree чтобы не мешать другим.

### Общие правила для ВСЕХ агентов Wave 0:

```
Для каждого сервера:
1. Прочитай src/ — пойми текущую структуру
2. Зайди на официальную API документацию (URL в промпте)
3. Добавь ВСЕ основные endpoints как tools
4. Каждый tool: name, description (для AI), inputSchema (zod), handler
5. Error handling: HTTP ошибки, rate limit (retry), auth ошибки
6. Тесты: vitest, мокай HTTP через msw или nock
7. README: описание, установка, env переменные, список tools, 3 demo-промпта
8. npm version major && npm publish
9. git add -A && git commit && git push
```

### Агент 1: YooKassa + CloudPayments

```
Задача: апгрейд двух серверов платёжных систем.

СЕРВЕР 1: D:/Yahia/experiments/mcp-servers/servers/payments/yookassa-mcp/
- API docs: https://yookassa.ru/developers/api
- Текущее: 10 tools, 490 строк
- Цель: 25+ tools
- Добавить:
  * Платежи: создание, подтверждение, отмена, список, информация
  * Возвраты: создание, список, информация
  * Рекуррентные: сохранение метода, автоплатёж
  * Выплаты (payouts): создание, информация, список
  * Чеки (receipts): создание (54-ФЗ), список
  * Webhook: эндпоинты для payment.succeeded, payment.canceled, refund.succeeded
  * Баланс магазина
  * Самозанятые: выплаты
  * Сплиты: маркетплейс-платежи
- Auth: HTTP Basic (shopId:secretKey)
- Sandbox: есть (тестовый shopId)

СЕРВЕР 2: D:/Yahia/experiments/mcp-servers/servers/payments/cloudpayments-mcp/
- API docs: https://developers.cloudpayments.ru/
- Текущее: 6 tools, 305 строк
- Цель: 12+ tools
- Добавить:
  * Charge, Auth, Confirm, Void, Refund
  * Подписки (recurrent): создание, изменение, отмена, список
  * Токенизация карт
  * Apple Pay / Google Pay
  * 3-D Secure
  * Уведомления (webhooks): check, pay, fail, recurrent
  * Выгрузка операций
- Auth: HTTP Basic (PublicId:ApiSecret)
- Sandbox: есть (тестовые карты)
```

### Агент 2: МойСклад

```
Задача: апгрейд МойСклад из заготовки в production.

D:/Yahia/experiments/mcp-servers/servers/crm/moysklad-mcp/
- API docs: https://dev.moysklad.ru/doc/api/remap/1.2/
- Текущее: 4 tools, 245 строк
- Цель: 20+ tools
- Добавить:
  * Товары: CRUD, поиск, фильтры, модификации
  * Остатки: по складам, по товарам
  * Контрагенты: CRUD, поиск по ИНН/названию
  * Заказы покупателей: создание, статусы, позиции
  * Отгрузки: создание из заказа
  * Приёмка: создание
  * Склады: список, создание
  * Организации: список
  * Отчёты: остатки, прибыльность, продажи
  * Документы: печатные формы
  * Вебхуки: CRUD
- Auth: Bearer Token (из настроек аккаунта)
- JSON:API формат (application/json; charset=utf-8)
- Sandbox: тестовый аккаунт бесплатно
```

### Агент 3: СДЭК + Travelpayouts

```
СЕРВЕР 1: D:/Yahia/experiments/mcp-servers/servers/logistics/cdek-mcp/
- API docs: https://api-docs.cdek.ru/
- Текущее: 6 tools, 539 строк
- Цель: 15+ tools
- Добавить:
  * Расчёт тарифов: все тарифы, по коду, кодам ПВЗ
  * Заказы: создание (ПВЗ-ПВЗ, дверь-дверь), информация, удаление
  * ПВЗ: список, поиск по городу/координатам/почтовому индексу
  * Трекинг: статусы, webhook подписка
  * Печать: квитанция, штрих-код, акт
  * Курьерский вызов: создание, информация
  * Регионы/города: справочники
  * Прямой звонок курьеру
- Auth: OAuth 2.0 (client_credentials, account + secure password)
- Sandbox: тестовый аккаунт

СЕРВЕР 2: D:/Yahia/experiments/mcp-servers/servers/other-ru/travelpayouts-mcp/
- API docs: https://support.travelpayouts.com/hc/ru/categories/200358578
- Текущее: 3 tools, 166 строк
- Цель: 10+ tools
- Добавить:
  * Поиск авиабилетов: цены на месяц, календарь цен, направления
  * Популярные направления из города
  * Спецпредложения авиакомпаний
  * Отели: поиск, цены, информация
  * Data API: аэропорты, авиакомпании, города
  * Партнёрская статистика: клики, продажи
- Auth: API Token (в заголовке X-Access-Token)
```

### Агент 4: Yandex Metrica

```
D:/Yahia/experiments/mcp-servers/servers/marketing/yandex-metrika-mcp/
- API docs: https://yandex.ru/dev/metrika/
- Текущее: 4 tools, 232 строк
- Цель: 15+ tools
- Добавить:
  * Management API:
    - Счётчики: CRUD, список
    - Цели: CRUD
    - Фильтры: CRUD
    - Сегменты: CRUD
    - Доступы: grant, revoke
  * Reporting API:
    - Таблица: dimensions + metrics + фильтры + сортировка
    - Сравнение периодов
    - По времени (BY_TIME)
    - Drill down
  * Метрики: визиты, просмотры, отказы, конверсии, e-commerce
  * Dimensions: источники, страны, устройства, браузеры, URL
- Auth: OAuth 2.0 (токен Яндекса)
```

### Агент 5: T-Kassa (Тинькофф)

```
D:/Yahia/experiments/mcp-servers/servers/payments/tkassa-mcp/
- API docs: https://www.tbank.ru/kassa/dev/payments/
- Текущее: 5 tools, 333 строк
- Цель: 15+ tools
- Добавить:
  * Платежи: Init, Confirm, Cancel, GetState, Charge
  * Рекуррентные: Init с Recurrent=Y, Charge
  * QR-код (СБП): QR генерация, статус
  * Выплаты на карту: Init (AddCardCustomer), Payout
  * Чеки (54-ФЗ): Receipt, items
  * Уведомления: webhook handlers
  * Магазины: информация, настройки
  * T-Bank Invest API (gRPC):
    - Портфель
    - Позиции
    - Заявки: создание, отмена
    - Котировки: свечи, стакан
    - Инструменты: поиск, информация
- Auth: TerminalKey + HMAC-SHA256 (кроме Invest: Bearer Token)
- Sandbox: есть для обоих API
```

### Агент 6: amoCRM

```
D:/Yahia/experiments/mcp-servers/servers/crm/amocrm-mcp/
- API docs: https://www.amocrm.ru/developers/content/crm_platform/api-reference
- Текущее: 5 tools, 280 строк
- Цель: 15+ tools
- ⚠️ Конкурент caiborg-ai/amocrm-mcp имеет 36 tools
- Стратегия: НЕ повторять все 36, фокус на уникальное:
  * Сделки: CRUD + комплексные фильтры + batch operations
  * Контакты и компании: CRUD + merge + поиск
  * Задачи: CRUD + привязка к сделкам
  * Воронки (pipelines): список, статусы
  * Каталоги (Custom fields): CRUD
  * Теги: CRUD
  * Webhooks: подписка, список
  * Unsorted (входящие лиды): список, accept, reject
  * Звонки: логирование
  * Short links
- Auth: OAuth 2.0 (с refresh token)
- Subdomain-based: {subdomain}.amocrm.ru/api/v4/
```

### Агент 7: HeadHunter

```
D:/Yahia/experiments/mcp-servers/servers/hr/hh-mcp/
- API docs: https://api.hh.ru/ (GitHub: hhru/api)
- Текущее: 6 tools, 244 строк
- Цель: 12+ tools
- Добавить:
  * Вакансии: поиск (фильтры: регион, зарплата, опыт, расписание), информация, похожие
  * Резюме: поиск, просмотр, скачивание
  * Отклики: список, создание (application), статусы
  * Работодатель: информация, вакансии работодателя
  * Справочники: регионы, профессии, валюты, типы занятости
  * Зарплатная статистика
  * Подсказки (suggests): должности, компании, регионы
- Auth: OAuth 2.0 (application token для чтения, user token для действий)
- Rate limit: 5 req/sec
```

### Агент 8: RetailCRM

```
D:/Yahia/experiments/mcp-servers/servers/crm/retailcrm-mcp/
- API docs: https://docs.retailcrm.ru/Developers/API/
- Текущее: 3 tools, 271 строк
- Цель: 12+ tools
- Добавить:
  * Заказы: CRUD, фильтры, статусы, история, комбинирование
  * Клиенты: CRUD, поиск, объединение, лояльность
  * Товары: каталог, группы, цены
  * Доставки: типы, расчёт, статусы
  * Склады: остатки, резервы
  * Задачи: CRUD
  * Аналитика: RFM, когорты, воронки
  * Справочники: статусы, типы доставок, типы оплат
  * Триггеры/уведомления
- Auth: API Key (в URL: ?apiKey=...)
- Swagger: https://docs.retailcrm.ru/Developers/API/APIVersions/APIv5
```

---

## WAVE 1: CIS EXPANSION (5-7 дней после Wave 0)

> 8 агентов, каждый создаёт 4-5 НОВЫХ серверов.
> Используем шаблон и паттерны из Wave 0.

### Общий шаблон для НОВОГО сервера:

```
Для каждого нового сервера:
1. mkdir servers/{category}/{name}-mcp && cd $_
2. npm init -y (scope @theyahia)
3. Скопировать структуру из любого Wave 0 сервера (tsconfig, .gitignore, etc.)
4. Прочитать API docs (URL в промпте)
5. Реализовать 8+ tools покрывающих основные use cases
6. Error handling, тесты, README
7. git init && git remote add origin https://github.com/theYahia/{name}-mcp
8. npm publish
9. git push
```

### Агент 1: RU Payments + Banking

```
Создать 5 НОВЫХ серверов:

1. alfa-bank-mcp (servers/finance/)
   - API: https://developer.alfabank.ru/
   - OAuth 2.0, REST
   - Tools: счета, платежи, выписки, зарплатные проекты

2. sberbank-acquiring-mcp (servers/payments/)
   - API: https://developer.sberbank.ru/doc
   - Token auth
   - Tools: register, getOrderStatus, reverse, refund

3. tochka-bank-mcp (servers/finance/)
   - API: https://enter.tochka.com/doc/v2/
   - OAuth 2.0
   - Tools: счета, платежи, выписки, контрагенты

4. prodamus-mcp (servers/payments/)
   - API: https://help.prodamus.ru/payform/integrations/api
   - API Key
   - Tools: создание платежа, статус, подписки

5. modulbank-mcp (servers/finance/)
   - API: https://api.modulbank.ru/
   - Bearer Token
   - Tools: счета, операции, платёжные поручения
```

### Агент 2: RU Business Platforms

```
Создать/апгрейд 5 серверов:

1. bitrix24-mcp АПГРЕЙД (servers/crm/)
   - API: https://dev.1c-bitrix.ru/rest_help/
   - Цель: 12+ tools, CRM + задачи + диск

2. yandex-tracker-mcp НОВЫЙ (servers/crm/)
   - API: https://cloud.yandex.ru/docs/tracker/
   - OAuth 2.0 + Org-ID
   - Tools: задачи CRUD, фильтры, комментарии, время

3. kaiten-mcp АПГРЕЙД (servers/crm/)
   - API: https://developer.kaiten.ru/
   - Цель: 10+ tools, карточки + доски + пользователи

4. getcourse-mcp АПГРЕЙД (servers/other-ru/)
   - API: https://getcourse.ru/help/api
   - Цель: 8+ tools, пользователи + сделки + экспорт

5. yandex-360-mcp НОВЫЙ (servers/comms/)
   - API: https://yandex.ru/dev/api360/
   - OAuth 2.0
   - Tools: почта, диск, календарь, контакты, организация
```

### Агент 3: RU Marketing + Analytics

```
1. yandex-direct-mcp АПГРЕЙД (servers/marketing/)
   - Цель: 12+ tools, кампании + объявления + ставки + отчёты

2. vk-ads-mcp НОВЫЙ (servers/marketing/)
   - API: https://ads.vk.com/help/api
   - OAuth 2.0
   - Tools: кампании, объявления, таргетинги, статистика

3. appmetrica-mcp НОВЫЙ (servers/marketing/)
   - API: https://appmetrica.yandex.ru/docs/mobile-api/
   - OAuth 2.0
   - Tools: отчёты, push, deeplinks, аудитории

4. telegram-ads-mcp НОВЫЙ (servers/marketing/)
   - API: https://core.telegram.org/bots/api (+ Ads API)
   - Bot Token
   - Tools: каналы, посты, статистика

5. tgstat-mcp НОВЫЙ (servers/marketing/)
   - API: https://api.tgstat.ru/docs/ru
   - API Key
   - Tools: каналы, посты, статистика, поиск
```

### Агент 4: RU Logistics + Maps

```
1. yandex-maps-mcp НОВЫЙ (servers/data/)
   - API: https://yandex.ru/dev/maps/
   - API Key
   - Tools: geocoder, router, search, static maps

2. 2gis-mcp НОВЫЙ (servers/data/)
   - API: https://api.2gis.ru/
   - API Key
   - Tools: places, geocoder, directions, suggest

3. ati-su-mcp НОВЫЙ (servers/logistics/)
   - API: https://api.ati.su/
   - Token
   - Tools: грузы, транспорт, контрагенты, торги

4. yandex-delivery-mcp НОВЫЙ (servers/logistics/)
   - API: https://yandex.ru/dev/logistics/api/
   - OAuth 2.0
   - Tools: создание доставки, отслеживание, расчёт
```

### Агент 5: RU AI + Cloud + Comms

```
1. yandex-cloud-mcp НОВЫЙ (servers/ai/)
   - API: https://cloud.yandex.ru/docs/
   - IAM Token
   - Tools: Compute, S3, VPC, Serverless, Monitoring

2. mts-exolve-mcp АПГРЕЙД (servers/comms/)
   - Цель: 8+ tools, звонки + SMS + номера

3. voximplant-mcp АПГРЕЙД (servers/comms/)
   - Цель: 8+ tools, сценарии + правила + номера + записи

4. yandexgpt-mcp АПГРЕЙД (servers/ai/)
   - Цель: 8+ tools, completions + embeddings + classifiers + summarization

5. gigachat-mcp АПГРЕЙД (servers/ai/)
   - Цель: 8+ tools, chat + embeddings + function calling
```

### Агент 6: Kazakhstan + Uzbekistan

```
1. forte-bank-mcp НОВЫЙ (servers/cis/)
   - API docs: https://developer.forte.kz/
   - HTTP Basic
   - Tools: платежи, статусы, возвраты, токенизация

2. halyk-epay-mcp НОВЫЙ (servers/cis/)
   - API: Halyk Bank ePay docs
   - OAuth2-style
   - Tools: платежи, статусы, возвраты, QR

3. payme-mcp НОВЫЙ (servers/cis/)
   - API: https://developer.help.paycom.uz/
   - HTTP Basic (Base64)
   - Tools: CreateTransaction, PerformTransaction, CancelTransaction, CheckTransaction

4. click-mcp НОВЫЙ (servers/cis/)
   - API: https://docs.click.uz/
   - HMAC signature
   - Tools: создание, подтверждение, проверка, отмена

5. factura-uz-mcp НОВЫЙ (servers/cis/)
   - API: https://api-docs.factura.uz/
   - OAuth 2.0
   - Tools: создание ЭСФ, подписание, список, статусы
```

### Агент 7: Caucasus + Moldova + Belarus

```
1. tbc-bank-mcp НОВЫЙ (servers/cis/)
   - API: https://developers.tbcbank.ge/
   - API Key + OAuth
   - Tools: платежи, рекуррентные, QR, выплаты

2. bog-ipay-mcp НОВЫЙ (servers/cis/)
   - API: Bank of Georgia iPay docs
   - OAuth 2.0 + JWT
   - Tools: платежи, статусы, возвраты

3. maib-mcp НОВЫЙ (servers/cis/)
   - API: https://developer.maib.md/
   - OAuth 2.0
   - Tools: e-commerce платежи, рекуррентные, возвраты

4. bepaid-mcp НОВЫЙ (servers/cis/)
   - API: https://docs.bepaid.by/
   - Token/Signature
   - Tools: платежи, токенизация, подписки, выплаты
```

### Агент 8: RU Fiscal + Data

```
1. kontur-focus-mcp АПГРЕЙД (servers/data/)
   - Цель: 8+ tools, поиск по ИНН, выписки, арбитраж, связи

2. atol-online-mcp НОВЫЙ (servers/finance/)
   - API: https://online.atol.ru/possystem/v4/
   - Token
   - Tools: sell, sell_refund, correction, getToken

3. kontur-diadoc-mcp НОВЫЙ (servers/finance/)
   - API: https://developer.kontur.ru/doc/diadoc/
   - Bearer Token
   - Tools: документы, подписание, отправка, согласование

4. spark-mcp НОВЫЙ (servers/data/)
   - API: SPARK-Interfax
   - Token
   - Tools: поиск компании, финансы, риски, связи

5. casebook-mcp НОВЫЙ (servers/data/)
   - API: Casebook/Pravo.ru
   - Token
   - Tools: поиск дел, участники, документы, судьи
```

---

## WAVE 2: WORLD EXPANSION (7-10 дней)

> Те же 8 агентов, новые регионы.
> Промпты по аналогии с Wave 1 — указываем API docs URL, auth, список tools.

### Агент 1: Turkey (7 серверов)
iyzico, trendyol, ileti-merkezi, is-bankasi, parasut, hepsiburada, mng-kargo

### Агент 2: Gulf (7 серверов)
tap-payments, paytabs-uae, paytabs-ksa, salla, tabby, unifonic, moyasar

### Агент 3: LATAM Brazil (7 серверов)
facturapi, pagar-me, nfe-io, ifood, correios, hotmart, asaas

### Агент 4: Africa (6 серверов)
nomba, termii, yoco, payfast, takealot, chargily-pay

### Агент 5: SE Asia Indonesia+Vietnam (7 серверов)
midtrans, xendit, rajaongkir, vnpay, momo-vn, shopee-vn, zalo-oa

### Агент 6: SE Asia Thai+MY+PH+BD (6 серверов)
paymongo, globe-labs, billplz, sslcommerz, flowaccount, steadfast

### Агент 7: MENA Iran+Egypt+Pakistan (6 серверов)
zarinpal, kavenegar, neshan-maps, idpay, jazzcash, tcs-pk

### Агент 8: China+India (5 серверов)
yunpian, ping-plus, freshsales, tata-1mg, shiprocket

---

## WAVE 3: LONG TAIL (10-14 дней)

> Вертикали + углубление + мелкие рынки.
> Детальные промпты генерируются на основе MASTER_INVENTORY после Wave 2.

### Группы:
- E-Invoicing vertical (10 серверов): ZATCA, ETA, LHDN, Moadian, SEF, etc.
- Banking deepening (8 серверов): Emirates NBD, BCA, KBank, etc.
- Marketplace deepening (10 серверов): Mercado Libre ×3, Shopee ×4, Divar, etc.
- China deep dive (7 серверов): WeChat Pay, Baidu, Cainiao, Amap, etc.

---

## ЧЕКЛИСТ ПЕРЕД ЗАПУСКОМ КАЖДОЙ ВОЛНЫ

- [ ] Предыдущая волна завершена (все серверы опубликованы на npm)
- [ ] API ключи/аккаунты зарегистрированы для каждого сервиса
- [ ] Sandbox/тестовые аккаунты настроены
- [ ] Шаблон сервера обновлён (tsconfig, mcp-sdk version, error handling pattern)
- [ ] README template обновлён
- [ ] CI/CD pipeline работает (если настроен)

---

*Этот файл — операционный мануал для запуска волн. Копируй промпт агента → запускай.*
