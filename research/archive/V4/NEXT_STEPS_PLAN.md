# NEXT STEPS — Подробнейший план имплементации

**Дата:** 2026-03-31
**Контекст:** DaData, СДЭК готовы. МойСклад в процессе. КЗ/УЗ планы готовы.

---

## БЛОК 1: DaData — GitHub Actions CI (10 мин)

```
Перейди в репо dadata-mcp.

Создай .github/workflows/ci.yml:

name: CI
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm test

Закоммить и запушь.
```

---

## БЛОК 2: Ревью и полировка Хабр-статьи (30 мин)

```
Открой V4/content/HABR_ARTICLE_1.md.

Проверь:
1. Все ссылки рабочие (GitHub, npm)
2. JSON конфиги для Claude Desktop — copy-paste ready
3. Число серверов = 47 (не 50)
4. DaData: 31 tool, v1.0.6
5. Упомянуты Streamable HTTP и тесты
6. Лендинг: theyahia.github.io/russian-mcp
7. Тон: честный, build-in-public, без воды
8. Длина: 2000-3000 слов
9. Хабы: Open Source, API, AI, Node.js

Исправь ошибки, добавь недостающее. Сохрани.
```

---

## БЛОК 3: Ревью и фикс лендинга (15 мин)

```
Клонируй репо russian-mcp. Открой docs/index.html.

Проверь:
1. Число серверов: должно быть 47 (не 50)
2. DaData: v1.0.6, 31 tool
3. СДЭК: v1.1.0, 8 tools
4. МойСклад: 10 tools
5. Все npm-ссылки рабочие
6. Responsive на мобиле
7. Добавь Telegram-канал если создан

Закоммить и запушь.
```

---

## БЛОК 4: Smithery — подать DaData + СДЭК (20 мин)

```
Проверь как подать на Smithery:
1. Есть ли CLI: npx @smithery/cli
2. Или веб-форма: smithery.ai

Для DaData:
- smithery.yaml уже есть в репо
- npx @smithery/cli publish (если CLI)

Для СДЭК:
- smithery.yaml уже есть (создан агентом)
- Подать аналогично

Для МойСклад:
- smithery.yaml будет после агента
- Подать когда готово
```

---

## БЛОК 5: Skills для 3 production серверов (1-2 часа)

### DaData skills

```
В репо dadata-mcp создай .claude/skills/ с двумя навыками:

.claude/skills/check-counterparty/SKILL.md:
---
name: check-counterparty
description: Проверка контрагента по ИНН через DaData
---
Используй tool find_company_by_id для проверки компании.
Параметр: ИНН (10 или 12 цифр).
Выведи: название, статус (действует/ликвидирована), руководитель, дата регистрации, 
основной ОКВЭД, адрес. Если компания ликвидирована — предупреди.

.claude/skills/validate-address/SKILL.md:
---
name: validate-address
description: Валидация и стандартизация адреса через DaData
---
Используй tool suggest_address для поиска адреса.
Если найден — выведи стандартизированный адрес, индекс, ФИАС-код, координаты.
Если не найден или неоднозначный — предложи варианты.
```

### МойСклад skills

```
В репо moysklad-mcp создай .claude/skills/:

.claude/skills/low-stock/SKILL.md:
---
name: low-stock
description: Товары с минимальным остатком на складе
---
Используй tool get_stock для получения остатков.
Отфильтруй товары с остатком < 5 штук.
Выведи таблицу: название, артикул, остаток, склад.
Отсортируй по остатку (от меньшего к большему).

.claude/skills/create-order/SKILL.md:
---
name: create-order
description: Создание заказа покупателя в МойСклад
---
Спроси у пользователя: контрагент (название или ИНН), товары (название и количество).
1. Найди контрагента через get_counterparties
2. Найди товары через search_products
3. Создай заказ через create_customer_order
4. Выведи номер заказа и сумму
```

### СДЭК skills

```
В репо cdek-mcp создай .claude/skills/:

.claude/skills/calculate-delivery/SKILL.md:
---
name: calculate-delivery
description: Расчёт стоимости и сроков доставки СДЭК
---
Спроси у пользователя: откуда, куда, вес (в граммах).
1. Найди города через get_cities (от и до)
2. Рассчитай тариф через calculate_tariff
3. Выведи: стоимость, срок (дни), тариф

.claude/skills/track-shipment/SKILL.md:
---
name: track-shipment
description: Отслеживание посылки по трек-номеру СДЭК
---
Используй tool track_shipment с трек-номером.
Выведи: текущий статус, город, дата последнего события, история перемещений.
```

---

## БЛОК 6: YooKassa MCP → production (2-3 часа)

```
Перейди в репо yookassa-mcp. Проведи аудит и доработку:

1. Проверь все 10 tools:
   create_payment, get_payment, capture_payment, cancel_payment, list_payments,
   create_refund, get_refund, list_refunds, create_receipt, get_balance

2. Проверь авторизацию:
   - HTTP Basic Auth: YOOKASSA_SHOP_ID:YOOKASSA_SECRET_KEY
   - Base URL: https://api.yookassa.ru/v3/
   - Idempotence-Key: uuid-v4 в каждом POST
   - Timeout 10s, retry 3x на 429/5xx

3. Добавь Vitest тесты (mock HTTP)
4. Добавь Streamable HTTP (--http / HTTP_PORT)
5. Создай smithery.yaml
6. Обнови README (бейджи, Quick Start, таблица tools, чеки 54-ФЗ)
7. npm version patch + npm publish
8. git push
```

---

## БЛОК 7: hh.ru MCP → production (1-2 часа)

```
Перейди в репо hh-mcp. Аудит и доработка:

1. Проверь 8 tools:
   search_vacancies, get_vacancy, search_resumes, get_resume,
   get_salary_statistics, get_employers, get_areas, get_professional_roles

2. Авторизация:
   - Публичные endpoints (поиск) — без авторизации
   - Работодательские (резюме) — OAuth 2.0 (HH_ACCESS_TOKEN env, опционально)

3. Добавь тесты, Streamable HTTP, smithery.yaml
4. Обнови README
5. npm publish + git push
```

---

## БЛОК 8: Official MCP Registry — повторная публикация (30 мин)

```
mcp-publisher login github (нужен ре-логин)

Потом обновить записи для:
- dadata-mcp (v1.0.6 с Streamable HTTP)
- cdek-mcp (v1.1.0 — новая версия)
- moysklad-mcp (после завершения агента)
```

---

## БЛОК 9: КЗ — Quick Wins (2-3 часа на оба)

### 9.1 nbk-mcp — Национальный Банк Казахстана (1 час)

```
Создай новый MCP-сервер @theyahia/nbk-mcp для API Национального Банка Казахстана.

GitHub: создай репо theYahia/nbk-mcp

Авторизация НЕ нужна — полностью открытый API.

Endpoints:
- XML: GET https://nationalbank.kz/rss/rates_all.xml — все курсы
- XML: GET https://nationalbank.kz/rss/get_rates.cfm?fdate=DD.MM.YYYY — исторические
- Парсить XML через fast-xml-parser (npm)

5 tools:
1. get_all_rates — все ~40 валют на сегодня
   Returns: массив {title, code, value, change}
2. get_currency_rate — курс конкретной валюты (USD, EUR, RUB, CNY)
   Params: currency_code: z.string(), date: z.string().optional()
3. get_historical_rates — курсы на конкретную дату
   Params: date: z.string() (формат DD.MM.YYYY)
4. convert_currency — конвертация через тенге
   Params: amount: z.number(), from: z.string(), to: z.string().default("KZT")
5. get_rate_dynamics — изменение курса (direction: UP/DOWN)
   Params: currency_code: z.string()

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, fast-xml-parser
Структура: src/index.ts, src/client.ts, src/tools/rates.ts, src/tools/convert.ts, src/types.ts

Добавь: тесты (Vitest), Streamable HTTP, smithery.yaml, CI, README
package.json: name "@theyahia/nbk-mcp", mcpName "io.github.theYahia/nbk-mcp"

npm install && npm run build && npm test
npm publish --access public
```

### 9.2 cbu-mcp — Центральный Банк Узбекистана (1 час)

```
Создай MCP-сервер @theyahia/cbu-mcp для API Центрального Банка Узбекистана.

GitHub: создай репо theYahia/cbu-mcp

Авторизация НЕ нужна — полностью открытый JSON API.

Endpoints:
- GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/ — все валюты (JSON!)
- GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/ — конкретная валюта
- GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/all/2025-01-15/ — по дате
- GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/2025-01-15/ — комбинированный

5 tools:
1. get_all_rates — все ~30 валют на сегодня
2. get_currency_rate — курс конкретной валюты
   Params: currency_code: z.string(), date: z.string().optional()
3. get_historical_rates — курсы на дату
   Params: date: z.string() (формат YYYY-MM-DD)
4. convert_currency — конвертация через сум (UZS)
   Params: amount: z.number(), from: z.string(), to: z.string().default("UZS")
5. get_rate_dynamics — динамика за период

ВАЖНО: 1 USD ≈ 12 192 UZS — большие числа, форматировать с разделителями.

Стек: TypeScript, @modelcontextprotocol/sdk, Zod (JSON — не нужен XML parser!)
Добавь: тесты, Streamable HTTP, smithery.yaml, CI, README

npm publish --access public
```

---

## БЛОК 10: КЗ — Kaspi Merchant MCP (3-4 часа)

```
Создай MCP-сервер @theyahia/kaspi-merchant-mcp для Kaspi Marketplace Seller API.

GitHub: создай репо theYahia/kaspi-merchant-mcp

Документация: https://guide.kaspi.kz/partner/ru/shop/api/general
Протокол: JSON:API (Content-Type: application/vnd.api+json)
Base URL: https://kaspi.kz/shop/api/v2
Auth: Header X-Auth-Token (из Seller Cabinet)
Env: KASPI_AUTH_TOKEN

8 tools:
1. get_orders — GET /v2/orders
   Params: page_number, page_size, state (NEW/PICKUP/DELIVERY/ARCHIVE), 
   creation_date_from, creation_date_to
2. get_order — GET /v2/orders/{id}
3. get_order_items — GET /v2/orders/{id}/entries (line items)
4. accept_order — POST /v2/orders/{id} (status → ACCEPTED_BY_MERCHANT)
5. complete_order — POST /v2/orders/{id} (status → COMPLETED)
6. cancel_order — POST /v2/orders/{id} (status → CANCELLED)
7. get_cities — GET /v2/cities
8. get_products — Content API products endpoint

JSON:API format: ответы в { "data": [...], "included": [...] }
Парсить relationships и included resources.

⚠️ НЕТ sandbox — все операции на реальных данных!
⚠️ accept/complete/cancel — необратимые действия, добавить confirmation в описании

README: первый MCP для Kaspi в мире, 721K продавцов
Добавь тесты (mock), Streamable HTTP, smithery.yaml, CI
npm publish --access public
```

---

## БЛОК 11: УЗ — Payme MCP (3-4 часа)

```
Создай MCP-сервер @theyahia/payme-mcp для Payme Subscribe API.

GitHub: создай репо theYahia/payme-mcp

Документация: https://developer.help.paycom.uz/
Протокол: JSON-RPC 2.0 через HTTPS POST
Sandbox: https://checkout.test.paycom.uz/api
Prod: https://checkout.paycom.uz/api
Auth: X-Auth header — {cashbox_id}:{password}
Env: PAYME_CASHBOX_ID, PAYME_KEY, PAYME_SANDBOX (optional, default true)

10 tools:

Карты:
1. cards_create — привязка карты
   Params: number: z.string(), expire: z.string() (MMYY)
   JSON-RPC method: "cards.create"
2. cards_verify — верификация через SMS
   Params: token: z.string(), code: z.string()
   Method: "cards.verify"
3. cards_check — проверка токена
   Params: token: z.string()
   Method: "cards.check"
4. cards_remove — удаление карты
   Params: token: z.string()
   Method: "cards.remove"

Чеки:
5. receipts_create — создание чека
   Params: amount: z.number() (В ТИЙИНАХ! 1 сум = 100 тийинов),
           account: z.object({ order_id: z.string() })
   Method: "receipts.create"
6. receipts_pay — оплата
   Params: id: z.string(), token: z.string()
   Method: "receipts.pay"
7. receipts_send — отправка чека клиенту
   Params: id: z.string(), phone: z.string()
   Method: "receipts.send"
8. receipts_cancel — отмена
   Params: id: z.string(), reason: z.number()
   Method: "receipts.cancel"
9. receipts_check — статус чека
   Params: id: z.string()
   Method: "receipts.check"
10. receipts_get_all — список чеков
    Params: from: z.string(), to: z.string(), offset: z.number(), limit: z.number()
    Method: "receipts.get_all"

ВАЖНО:
- Суммы в ТИЙИНАХ (×100). В описании tools указать: "amount in tiyins (1 sum = 100 tiyins)"
- В ответах показывать в сумах для читаемости
- JSON-RPC: каждый запрос = {"jsonrpc":"2.0","id":N,"method":"...","params":{...}}

Sandbox тестовые карты (8600-серия, срок 03/99, SMS-код 666666):
- Указать в README

Добавь: тесты (mock JSON-RPC), Streamable HTTP, smithery.yaml, CI, README
npm publish --access public
```

---

## БЛОК 12: УЗ — Click MCP (3-4 часа)

```
Создай MCP-сервер @theyahia/click-mcp для Click Merchant API.

GitHub: создай репо theYahia/click-mcp

Документация: https://docs.click.uz/en/
Base URL: https://api.click.uz/v2/merchant/
Auth: Header "Auth: merchant_user_id:digest:timestamp"
  digest = SHA1(timestamp + secret_key)
Env: CLICK_SERVICE_ID, CLICK_MERCHANT_USER_ID, CLICK_SECRET_KEY

8 tools:
1. create_invoice — POST /invoice/create
   Params: amount: z.number() (в СУМАХ, не тийинах!), phone_number, merchant_trans_id
2. get_invoice_status — GET /invoice/status/:service_id/:invoice_id
3. get_payment_status — GET /payment/status/:service_id/:payment_id
4. refund_payment — DELETE /payment/reversal/:service_id/:payment_id
5. request_card_token — POST /card_token/request
6. verify_card_token — POST /card_token/verify (OTP, не CVV!)
7. pay_with_token — POST /card_token/payment
8. click_pass_payment — POST /click_pass/payment

ВАЖНО:
- Суммы в СУМАХ (НЕ тийинах — отличие от Payme!)
- Узбекские карты без CVV — используется OTP
- Signature: SHA1(timestamp + secret_key) — реализовать в client.ts

Добавь: тесты, Streamable HTTP, smithery.yaml, CI, README
npm publish --access public
```

---

## БЛОК 13: УЗ — Eskiz SMS MCP (1-2 часа)

```
Создай MCP-сервер @theyahia/eskiz-mcp для Eskiz.uz SMS API.

GitHub: создай репо theYahia/eskiz-mcp

Документация: https://documenter.getpostman.com/view/663428/TVK5eMco
Base URL: https://notify.eskiz.uz/api/
Auth: JWT Bearer Token
Env: ESKIZ_EMAIL, ESKIZ_PASSWORD

TokenManager: POST /auth/login → JWT token. PATCH /auth/refresh для обновления.

6 tools:
1. send_sms — POST /message/sms/send
   Params: mobile_phone: z.string(), message: z.string(), from: z.string().optional()
2. send_batch — POST /message/sms/send-batch
   Params: messages: z.array(z.object({ phone: z.string(), text: z.string() }))
3. get_status — GET /message/sms/status_by_id/{id}
   Params: message_id: z.string()
4. get_balance — GET /auth/user
5. get_limits — GET /auth/user/limit
   Returns: { limit, used, remaining }
6. refresh_token — PATCH /auth/refresh

Стоимость: 95 сум/SMS (информационные), 175 сум/SMS (рекламные)
1 SMS = 160 латинских или 70 кириллических символов

Добавь: тесты, Streamable HTTP, smithery.yaml, CI, README
npm publish --access public
```

---

## ПОРЯДОК ВЫПОЛНЕНИЯ

| # | Что | Время | Можно параллельно? |
|---|-----|-------|--------------------|
| 1 | DaData CI | 10 мин | Да |
| 2 | Ревью Хабр-статьи | 30 мин | Да |
| 3 | Ревью лендинга | 15 мин | Да |
| 4 | Smithery подача | 20 мин | Да |
| 5 | Skills (DaData + МойСклад + СДЭК) | 1-2 ч | Да |
| 6 | YooKassa → production | 2-3 ч | Да |
| 7 | hh.ru → production | 1-2 ч | Да |
| 8 | Registry re-login + update | 30 мин | Нужен ручной логин |
| 9 | **НБК КЗ** (nbk-mcp) | 1 ч | Да |
| 10 | **ЦБУ УЗ** (cbu-mcp) | 1 ч | Да |
| 11 | **Kaspi КЗ** (kaspi-merchant-mcp) | 3-4 ч | Да |
| 12 | **Payme УЗ** (payme-mcp) | 3-4 ч | Да |
| 13 | **Click УЗ** (click-mcp) | 3-4 ч | Да |
| 14 | **Eskiz УЗ** (eskiz-mcp) | 1-2 ч | Да |

**Итого: ~20-25 часов работы. 6 новых MCP-серверов (2 КЗ + 4 УЗ).**

---

*Все промпты готовы к copy-paste в Claude Code.*
