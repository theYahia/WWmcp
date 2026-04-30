# Детальный план имплементации: 10 MCP-серверов для Узбекистана

**Дата:** 2026-03-31
**Автор:** @theyahia
**npm scope:** `@theyahia/{service}-mcp`
**Статус рынка:** 0 MCP-серверов для УЗ (полностью свободный рынок)
**Критическая дата:** С 1 апреля 2026 — обязательный безнал свыше 25M сум

---

## Общие принципы для всех серверов

### Стек
- Runtime: Node.js 20+
- Язык: TypeScript 5.x
- MCP SDK: `@modelcontextprotocol/sdk` (latest)
- Валидация: Zod
- HTTP-клиент: встроенный `fetch` (Node 20+)
- Сборка: `tsup` (ESM + CJS)
- Линтер: `eslint` + `prettier`

### Структура каждого пакета
```
@theyahia/{service}-mcp/
  src/
    index.ts          # MCP server entry point
    tools/            # tool implementations
    schemas/          # Zod schemas
    auth.ts           # авторизация
    errors.ts         # error handling
    types.ts          # TypeScript типы
  README.md           # RU + EN
  smithery.yaml
  package.json
  tsconfig.json
  .env.example
```

### README-шаблон (для каждого сервера)
```markdown
# @theyahia/{service}-mcp

MCP-сервер для {описание API}.

## Установка
## Настройка (env vars)
## Инструменты (tools) — таблица
## Примеры использования (Claude Desktop, Cursor)
## Тестирование (sandbox)
## Ограничения и Rate Limits
## Лицензия (MIT)
```

---

## Ключевые особенности рынка Узбекистана

| Особенность | Детали |
|-------------|--------|
| Суммы Payme | В **тийинах** (1 сум = 100 тийинов). `amount=50000` = 500 сум |
| Суммы Click | В **сумах** (целые числа). `amount=500` = 500 сум |
| CVV | Узбекские карты (UzCard, HUMO) **не имеют CVV**. Вместо 3DS — OTP-код |
| E-IMZO | Электронная цифровая подпись для госсервисов (PKCS#7) |
| С 01.04.2026 | Обязательный безнал для покупок >25 млн сум (~$2050) |
| С 01.07.2026 | Обязательный единый QR-код для всех торговых точек |
| Язык документации | Payme — RU, Click — RU+EN, Uzum — EN, Eskiz — EN |
| Тестовые карты | 8600-серия, срок 03/99, SMS-код 666666 |

---

# Сервер 1: cbu-mcp

## Описание
MCP-сервер для API Центрального Банка Узбекистана. Курсы ~30 валют, исторические данные, конвертация. Полностью открытый JSON API, авторизация не нужна. Идеальный quick win.

## Pre-implementation checklist

- [ ] Регистрация: **НЕ ТРЕБУЕТСЯ** — полностью открытый API
- [ ] Sandbox URL: **НЕТ** — прод-API можно использовать напрямую (read-only)
- [ ] Тестовые данные: не нужны, API возвращает реальные курсы
- [ ] Документация: https://cbu.uz/en/arkhiv-kursov-valyut/veb-masteram/
- [ ] Known gotchas:
  - 1 USD ~ 12 192 UZS — большие числа, показывать с разделителями
  - Даты в формате `YYYY-MM-DD`
  - API отдаёт данные только в рабочие дни (вых. — последний рабочий)
  - `Diff` в ответе показывает изменение курса за день
  - Поле `Rate` — это `string`, не `number`

## Env vars
```
# Нет переменных — API полностью открытый
```

## API Endpoints

| Действие | Метод | URL |
|----------|-------|-----|
| Все валюты (сегодня) | GET | `https://cbu.uz/ru/arkhiv-kursov-valyut/json/` |
| Конкретная валюта | GET | `https://cbu.uz/ru/arkhiv-kursov-valyut/json/{CurrencyCode}/` |
| Все валюты на дату | GET | `https://cbu.uz/ru/arkhiv-kursov-valyut/json/all/{YYYY-MM-DD}/` |
| Валюта на дату | GET | `https://cbu.uz/ru/arkhiv-kursov-valyut/json/{CurrencyCode}/{YYYY-MM-DD}/` |
| XML-формат | GET | `https://cbu.uz/ru/arkhiv-kursov-valyut/xml/` |

### Формат ответа (JSON)
```json
[
  {
    "id": "69",
    "Code": "840",
    "Ccy": "USD",
    "CcyNm_RU": "Доллар США",
    "CcyNm_UZ": "AQSH dollari",
    "CcyNm_UZC": "АКШ доллари",
    "CcyNm_EN": "US Dollar",
    "Nominal": "1",
    "Rate": "12890.41",
    "Diff": "-12.37",
    "Date": "22.03.2026"
  }
]
```

## Авторизация
Нет. Никаких заголовков, ключей, токенов.

## Rate Limits
Не документированы. Рекомендуется: не более 1 запроса/сек. Кэшировать ответы на 1 час (курсы обновляются раз в день).

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/cbu-mcp для API Центрального Банка Узбекистана.

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Авторизация: НЕ НУЖНА — полностью открытый JSON API.
Кэширование: in-memory TTL 1 час (курсы обновляются 1 раз в день).
Rate limit: встроенный — не более 1 запроса/сек к cbu.uz.

## API Endpoints

Base: https://cbu.uz/ru/arkhiv-kursov-valyut/json/

- GET /json/ — все валюты на сегодня (массив объектов)
- GET /json/{CurrencyCode}/ — конкретная валюта (напр. USD, EUR, RUB)
- GET /json/all/{YYYY-MM-DD}/ — все валюты на дату
- GET /json/{CurrencyCode}/{YYYY-MM-DD}/ — конкретная валюта на дату

Формат ответа — массив JSON-объектов:
{
  "id": "69",
  "Code": "840",        // ISO 4217 числовой код
  "Ccy": "USD",         // ISO 4217 буквенный код
  "CcyNm_RU": "Доллар США",
  "CcyNm_UZ": "AQSH dollari",
  "CcyNm_UZC": "АКШ доллари",
  "CcyNm_EN": "US Dollar",
  "Nominal": "1",       // единица номинала (может быть "1", "100", "10000")
  "Rate": "12890.41",   // курс за 1 единицу номинала (STRING, не number!)
  "Diff": "-12.37",     // изменение за день (STRING)
  "Date": "22.03.2026"  // формат DD.MM.YYYY
}

ВАЖНО: Rate и Diff — это строки, нужно парсить parseFloat().
ВАЖНО: Nominal может быть != 1 (напр. для японской йены Nominal="100").
При конвертации учитывать Nominal: реальный курс = Rate / Nominal.

## 5 tools с Zod-схемами

### 1. get_all_rates
Описание: "Получить курсы всех ~30 валют ЦБ Узбекистана на сегодня"
Параметры: нет
Zod schema: z.object({})
GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/
Возвращать: отформатированная таблица валют с Rate, Diff, Nominal.

### 2. get_currency_rate
Описание: "Получить курс конкретной валюты к узбекскому суму"
Параметры:
  - currency: z.string().length(3).describe("ISO 4217 код валюты, напр. USD, EUR, RUB, KZT, GBP, CNY")
Zod schema: z.object({ currency: z.string().length(3) })
GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/{currency}/
Возвращать: курс, изменение за день, номинал. Пример: "1 USD = 12 890.41 UZS (−12.37)"

### 3. get_historical_rates
Описание: "Получить курсы валют на указанную дату"
Параметры:
  - date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Дата в формате YYYY-MM-DD")
  - currency: z.string().length(3).optional().describe("ISO 4217 код валюты. Если не указан — все валюты")
Zod schema: z.object({ date: z.string(), currency: z.string().optional() })
Если currency задан: GET /json/{currency}/{date}/
Если нет: GET /json/all/{date}/

### 4. convert_currency
Описание: "Конвертировать сумму между валютами через узбекский сум (UZS)"
Параметры:
  - amount: z.number().positive().describe("Сумма для конвертации")
  - from: z.string().length(3).describe("Валюта источник (ISO 4217), напр. USD")
  - to: z.string().length(3).describe("Валюта назначение (ISO 4217), напр. EUR")
Zod schema: z.object({ amount: z.number(), from: z.string(), to: z.string() })
Логика: amount * (rate_from/nominal_from) / (rate_to/nominal_to).
Если from="UZS": amount / (rate_to/nominal_to).
Если to="UZS": amount * (rate_from/nominal_from).

### 5. get_rate_dynamics
Описание: "Получить динамику курса валюты за период (макс 30 дней)"
Параметры:
  - currency: z.string().length(3).describe("ISO 4217 код валюты")
  - start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Начало периода YYYY-MM-DD")
  - end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Конец периода YYYY-MM-DD")
Zod schema: z.object({ currency: z.string(), start_date: z.string(), end_date: z.string() })
Логика: итерировать по дням между start_date и end_date, GET /json/{currency}/{date}/ для каждого.
Ограничение: максимум 30 дней. Возвращать таблицу: дата, курс, изменение, тренд (стрелка вверх/вниз).

## Error Handling
- Если cbu.uz вернул пустой массив — "Данные за указанную дату недоступны (возможно, выходной день)"
- Если валюта не найдена — "Валюта {code} не найдена. Доступные: USD, EUR, RUB, GBP, ..."
- Network error — retry 1 раз через 2 сек
- Показывать числа с разделителями тысяч: 12 890.41 (не 12890.41)

## package.json
name: "@theyahia/cbu-mcp"
description: "MCP server for Central Bank of Uzbekistan currency rates API"
keywords: ["mcp", "uzbekistan", "cbu", "currency", "exchange-rates", "uzs"]

## README.md (русский + английский)
Секции: Установка, Настройка (нет env vars), Инструменты (таблица 5 tools), Примеры, Лицензия MIT.
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Создать `smithery.yaml` (см. шаблон ниже)
- [ ] Зарегистрировать на mcp.so
- [ ] Анонс в Telegram: @nodejs_uz, @js_uzb, @typescript_uzb, @paytechuz
- [ ] Анонс в GitHub Discussions PayTechUZ

### smithery.yaml шаблон
```yaml
name: "@theyahia/cbu-mcp"
description: "Central Bank of Uzbekistan currency rates — no auth required"
version: "1.0.0"
tools:
  - get_all_rates
  - get_currency_rate
  - get_historical_rates
  - convert_currency
  - get_rate_dynamics
auth: none
env: []
```

---

# Сервер 2: payme-mcp

## Описание
MCP-сервер для Payme Subscribe API — главной платёжной системы Узбекистана. JSON-RPC 2.0, привязка карт, рекуррентные платежи, чеки. Суммы в ТИЙИНАХ.

## Pre-implementation checklist

- [ ] Регистрация: **ДА** — https://merchant.paycom.uz (создать аккаунт мерчанта)
  - Получить `cashbox_id` и `key` (test + production)
  - Тестовый кабинет: https://merchant.test.paycom.uz (логин — телефон, пароль `qwerty`, SMS-код `666666`)
- [ ] Sandbox URL: `https://checkout.test.paycom.uz/api`
- [ ] Production URL: `https://checkout.paycom.uz/api`
- [ ] Тестовые данные:
  - Тестовые карты 8600-серии, срок 03/99, SMS-код 666666
  - 7 карт для разных сценариев (успех, ошибка, задержка 10 сек и т.д.)
  - REQUIRES VERIFICATION: точные номера тестовых карт (получить из sandbox-кабинета)
- [ ] Документация: https://developer.help.paycom.uz/
- [ ] Known gotchas:
  - **Суммы в ТИЙИНАХ** — 1 сум = 100 тийинов. `amount: 50000` = 500 сум
  - JSON-RPC 2.0 — все запросы POST, тело: `{"jsonrpc":"2.0","id":1,"method":"...","params":{...}}`
  - Merchant API — Payme отправляет запросы НА сервер мерчанта (обратная модель!)
  - Subscribe API — мерчант отправляет запросы К Payme (это то что нам нужно для MCP)
  - Поддержка холдирования через `"hold": true`
  - Rate limits НЕ документированы
  - Ответы ошибок: `{"error":{"code":-31001,"message":{"ru":"...","uz":"...","en":"..."}}}`

## Env vars
```bash
PAYME_CASHBOX_ID=       # ID кассы из кабинета мерчанта
PAYME_KEY=              # Ключ (test или production)
PAYME_SANDBOX=true      # true = checkout.test.paycom.uz, false = checkout.paycom.uz
```

## API Endpoints

**Protocol:** JSON-RPC 2.0 over HTTPS POST

**Sandbox:** `https://checkout.test.paycom.uz/api`
**Production:** `https://checkout.paycom.uz/api`

**Авторизация:**
```
X-Auth: {cashbox_id}:{key}
Content-Type: application/json
```

Все запросы — POST с телом:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cards.create",
  "params": { ... }
}
```

### Методы Subscribe API

| Метод | Назначение | Ключевые params |
|-------|-----------|----------------|
| `cards.create` | Привязка карты | `number`, `expire` (MMYY), `save: true` |
| `cards.get_verify_code` | Запросить SMS-код | `token` |
| `cards.verify` | Подтвердить SMS-код | `token`, `code` |
| `cards.check` | Проверить токен карты | `token` |
| `cards.remove` | Удалить привязку | `token` |
| `receipts.create` | Создать чек | `amount` (в тийинах!), `account` |
| `receipts.pay` | Оплатить чек | `id`, `token`, `payer` |
| `receipts.send` | Отправить чек | `id`, `phone` |
| `receipts.cancel` | Отменить чек | `id` |
| `receipts.check` | Статус чека | `id` |
| `receipts.get` | Получить чек по ID | `id` |
| `receipts.get_all` | Список чеков | `count`, `from`, `to` |

### Коды ошибок Payme
| Код | Значение |
|-----|----------|
| -31001 | Неверная сумма |
| -31003 | Транзакция не найдена |
| -31050 | Карта не найдена |
| -31051 | Недостаточно средств |
| -31060 | SMS-код неверный |
| -31099 | Системная ошибка |

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/payme-mcp для Payme Subscribe API.

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Протокол: JSON-RPC 2.0 через HTTPS POST.

## Конфигурация

Env vars:
  PAYME_CASHBOX_ID — ID кассы из кабинета мерчанта (обязательно)
  PAYME_KEY — ключ авторизации (обязательно)
  PAYME_SANDBOX — "true" для тестовой среды (по умолчанию "true")

Base URL:
  sandbox: https://checkout.test.paycom.uz/api
  prod: https://checkout.paycom.uz/api

Авторизация: заголовок X-Auth: {PAYME_CASHBOX_ID}:{PAYME_KEY}

Все запросы — POST с Content-Type: application/json.
Тело запроса:
{
  "jsonrpc": "2.0",
  "id": <auto-increment>,
  "method": "<method_name>",
  "params": { ... }
}

КРИТИЧЕСКИ ВАЖНО: суммы в ТИЙИНАХ (1 сум = 100 тийинов).
В tools принимать суммы в СУМАХ и конвертировать в тийины (* 100) перед отправкой.
В ответах показывать в СУМАХ (/ 100).
Пример: пользователь вводит 50000 сум → API получает 5000000 тийинов.

## 10 tools с Zod-схемами

### 1. cards_create
Описание: "Привязать банковскую карту (UzCard/HUMO) для последующих платежей"
Параметры:
  - card_number: z.string().regex(/^[0-9]{16}$/).describe("16-значный номер карты (UzCard 8600xxxx, HUMO 9860xxxx)")
  - expire_date: z.string().regex(/^(0[1-9]|1[0-2])\/?\d{2}$/).describe("Срок действия MM/YY или MMYY")
  - save: z.boolean().default(true).describe("Сохранить карту для повторных платежей")
Zod: z.object({ card_number: z.string(), expire_date: z.string(), save: z.boolean().optional() })
Метод JSON-RPC: "cards.create"
params: { number: card_number, expire: expire_date (формат MMYY без /), save: save }
Ответ содержит token — сохранить и вернуть. После вызова нужно cards.get_verify_code + cards.verify.

### 2. cards_get_verify_code
Описание: "Запросить SMS-код для верификации привязанной карты"
Параметры:
  - token: z.string().describe("Токен карты, полученный из cards_create")
Zod: z.object({ token: z.string() })
Метод: "cards.get_verify_code"
params: { token }
Ответ: { sent: true, phone: "998XX***XXXX", wait: 60 }

### 3. cards_verify
Описание: "Подтвердить привязку карты SMS-кодом (в sandbox код: 666666)"
Параметры:
  - token: z.string().describe("Токен карты")
  - code: z.string().regex(/^\d{6}$/).describe("6-значный SMS-код (тест: 666666)")
Zod: z.object({ token: z.string(), code: z.string() })
Метод: "cards.verify"
params: { token, code }

### 4. cards_check
Описание: "Проверить активность токена карты"
Параметры:
  - token: z.string().describe("Токен карты для проверки")
Zod: z.object({ token: z.string() })
Метод: "cards.check"
params: { token }

### 5. cards_remove
Описание: "Удалить привязанную карту"
Параметры:
  - token: z.string().describe("Токен удаляемой карты")
Zod: z.object({ token: z.string() })
Метод: "cards.remove"
params: { token }

### 6. receipts_create
Описание: "Создать платёжный чек (счёт на оплату)"
Параметры:
  - amount: z.number().positive().describe("Сумма в СУМАХ (будет конвертирована в тийины)")
  - order_id: z.string().describe("Уникальный ID заказа в вашей системе")
  - description: z.string().optional().describe("Описание платежа")
  - detail: z.object({
      items: z.array(z.object({
        title: z.string(),
        price: z.number(),
        count: z.number(),
        code: z.string().optional().describe("МХИК код товара (для фискализации)"),
        package_code: z.string().optional(),
        vat_percent: z.number().optional().default(0)
      })).optional()
    }).optional().describe("Детали чека (товары) для фискализации")
Zod: z.object({ amount: z.number(), order_id: z.string(), description: z.string().optional(), detail: z.object({...}).optional() })
Метод: "receipts.create"
params: { amount: amount * 100, account: { order_id }, description, detail }
ВАЖНО: amount * 100 при отправке!

### 7. receipts_pay
Описание: "Оплатить созданный чек с привязанной карты"
Параметры:
  - receipt_id: z.string().describe("ID чека из receipts_create")
  - token: z.string().describe("Токен привязанной карты")
  - payer_phone: z.string().optional().describe("Телефон плательщика (998XXXXXXXXX)")
Zod: z.object({ receipt_id: z.string(), token: z.string(), payer_phone: z.string().optional() })
Метод: "receipts.pay"
params: { id: receipt_id, token, payer: { phone: payer_phone } }

### 8. receipts_send
Описание: "Отправить чек на телефон плательщика (SMS с ссылкой)"
Параметры:
  - receipt_id: z.string().describe("ID чека")
  - phone: z.string().regex(/^998\d{9}$/).describe("Телефон в формате 998XXXXXXXXX")
Zod: z.object({ receipt_id: z.string(), phone: z.string() })
Метод: "receipts.send"
params: { id: receipt_id, phone }

### 9. receipts_cancel
Описание: "Отменить/вернуть платёж по чеку"
Параметры:
  - receipt_id: z.string().describe("ID чека для отмены")
Zod: z.object({ receipt_id: z.string() })
Метод: "receipts.cancel"
params: { id: receipt_id }

### 10. receipts_get_all
Описание: "Получить список чеков за период"
Параметры:
  - count: z.number().int().min(1).max(50).default(10).describe("Количество чеков (макс 50)")
  - from: z.number().optional().describe("Unix timestamp начала периода")
  - to: z.number().optional().describe("Unix timestamp конца периода")
Zod: z.object({ count: z.number().optional(), from: z.number().optional(), to: z.number().optional() })
Метод: "receipts.get_all"
params: { count, from, to }
В ответе конвертировать amount из тийинов в сумы.

## Auth module (auth.ts)
Функция createAuthHeaders():
  return { "X-Auth": `${PAYME_CASHBOX_ID}:${PAYME_KEY}`, "Content-Type": "application/json" }

Функция createJsonRpcRequest(method: string, params: object):
  return { jsonrpc: "2.0", id: autoIncrementId++, method, params }

## Error Handling
- JSON-RPC ошибки: проверять response.error, маппить code → человеческое сообщение
- -31001: "Неверная сумма платежа"
- -31003: "Транзакция не найдена"
- -31050: "Карта не найдена или не активна"
- -31051: "Недостаточно средств на карте"
- -31060: "Неверный SMS-код верификации"
- -31099: "Системная ошибка Payme, повторите позже"
- Network errors: retry 1 раз через 3 сек
- Timeout: 30 секунд на запрос

## Rate Limits
Не документированы Payme. Встроенный лимит: 5 req/sec.

## Тестирование
Sandbox: PAYME_SANDBOX=true
Тестовые карты: 8600-серия, срок 03/99
SMS-код верификации: 666666
Тестовый кабинет: https://merchant.test.paycom.uz

## package.json
name: "@theyahia/payme-mcp"
description: "MCP server for Payme Subscribe API — card payments in Uzbekistan"
keywords: ["mcp", "uzbekistan", "payme", "paycom", "payments", "subscribe", "uzcard", "humo"]
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Зарегистрировать на mcp.so, smithery.ai
- [ ] Анонс: @nodejs_uz, @js_uzb, @typescript_uzb, @paytechuz
- [ ] Написать @muhammadali_me (PayTechUZ) — предложить кросс-промо

### smithery.yaml
```yaml
name: "@theyahia/payme-mcp"
description: "Payme Subscribe API — card payments, receipts, refunds for Uzbekistan"
version: "1.0.0"
tools:
  - cards_create
  - cards_get_verify_code
  - cards_verify
  - cards_check
  - cards_remove
  - receipts_create
  - receipts_pay
  - receipts_send
  - receipts_cancel
  - receipts_get_all
auth:
  type: header
  header: X-Auth
env:
  - name: PAYME_CASHBOX_ID
    description: "Payme cashbox ID from merchant dashboard"
    required: true
  - name: PAYME_KEY
    description: "Payme API key (test or production)"
    required: true
  - name: PAYME_SANDBOX
    description: "Use sandbox environment (default: true)"
    required: false
    default: "true"
```

---

# Сервер 3: click-mcp

## Описание
MCP-сервер для Click Merchant API — REST API второй по величине платёжной системы Узбекистана. SHA1 digest авторизация, инвойсы, платежи, токенизация карт, Click Pass.

## Pre-implementation checklist

- [ ] Регистрация: **ДА** — https://merchant.click.uz (создать аккаунт мерчанта)
  - Получить `service_id`, `merchant_user_id`, `secret_key`
- [ ] Sandbox URL: Отдельного sandbox URL **НЕТ** — Click предоставляет **эмулятор** для локального тестирования
  - Документация эмулятора: https://docs.click.uz/en/click-api-testing/
- [ ] Тестовые данные: REQUIRES VERIFICATION — эмулятор предоставляет тестовые данные
- [ ] Документация: https://docs.click.uz/en/ (EN), https://docs.click.uz/ (RU)
- [ ] Known gotchas:
  - **Суммы в СУМАХ** (целые числа, без дробей) — НЕ в тийинах!
  - Авторизация: кастомный заголовок `Auth` (не `Authorization`!)
  - digest = SHA1(timestamp + secret_key) — timestamp в секундах
  - Нет отдельного sandbox — только эмулятор
  - Shop API (callback-модель) — НЕ подходит для MCP, используем Merchant API

## Env vars
```bash
CLICK_SERVICE_ID=           # ID сервиса из кабинета мерчанта
CLICK_MERCHANT_USER_ID=     # ID пользователя мерчанта
CLICK_SECRET_KEY=           # Секретный ключ для SHA1 digest
```

## API Endpoints

**Base URL:** `https://api.click.uz/v2/merchant/`

**Авторизация:**
```
Auth: {merchant_user_id}:{digest}:{timestamp}
```
где:
- `timestamp` = `Math.floor(Date.now() / 1000)` (Unix секунды)
- `digest` = `SHA1(timestamp + secret_key)` (crypto.createHash('sha1'))

| Действие | Метод | Endpoint |
|----------|-------|----------|
| Создать инвойс | POST | `/invoice/create` |
| Статус инвойса | GET | `/invoice/status/{service_id}/{invoice_id}` |
| Статус платежа | GET | `/payment/status/{service_id}/{payment_id}` |
| Возврат платежа | DELETE | `/payment/reversal/{service_id}/{payment_id}` |
| Запрос токена карты | POST | `/card_token/request` |
| Верификация токена | POST | `/card_token/verify` |
| Оплата по токену | POST | `/card_token/payment` |
| Click Pass оплата | POST | `/click_pass/payment` |

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/click-mcp для Click Merchant API.

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Протокол: REST API (JSON).

## Конфигурация

Env vars:
  CLICK_SERVICE_ID — ID сервиса (обязательно)
  CLICK_MERCHANT_USER_ID — ID пользователя мерчанта (обязательно)
  CLICK_SECRET_KEY — секретный ключ для digest (обязательно)

Base URL: https://api.click.uz/v2/merchant/

## Авторизация (auth.ts)

Заголовок: Auth (НЕ Authorization!)
Формат: {merchant_user_id}:{digest}:{timestamp}

Генерация digest:
```typescript
import { createHash } from 'crypto';

function createClickAuth(merchantUserId: string, secretKey: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = createHash('sha1')
    .update(timestamp + secretKey)
    .digest('hex');
  return {
    'Auth': `${merchantUserId}:${digest}:${timestamp}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}
```

ВАЖНО: Auth-заголовок нужно генерировать для КАЖДОГО запроса (timestamp меняется).

## 8 tools с Zod-схемами

### 1. create_invoice
Описание: "Создать счёт на оплату через Click"
Параметры:
  - amount: z.number().positive().describe("Сумма в сумах (целое число)")
  - phone_number: z.string().regex(/^998\d{9}$/).describe("Телефон клиента 998XXXXXXXXX")
  - merchant_trans_id: z.string().describe("Уникальный ID заказа в вашей системе")
Zod: z.object({ amount: z.number(), phone_number: z.string(), merchant_trans_id: z.string() })
POST https://api.click.uz/v2/merchant/invoice/create
Body: { service_id: CLICK_SERVICE_ID, amount, phone_number, merchant_trans_id }
Ответ: { error_code: 0, error_note: "Success", invoice_id: 12345 }

### 2. get_invoice_status
Описание: "Проверить статус инвойса Click"
Параметры:
  - invoice_id: z.number().int().describe("ID инвойса")
Zod: z.object({ invoice_id: z.number() })
GET https://api.click.uz/v2/merchant/invoice/status/{service_id}/{invoice_id}

### 3. get_payment_status
Описание: "Проверить статус платежа Click"
Параметры:
  - payment_id: z.number().int().describe("ID платежа")
Zod: z.object({ payment_id: z.number() })
GET https://api.click.uz/v2/merchant/payment/status/{service_id}/{payment_id}

### 4. refund_payment
Описание: "Вернуть платёж (полный или частичный возврат)"
Параметры:
  - payment_id: z.number().int().describe("ID платежа для возврата")
Zod: z.object({ payment_id: z.number() })
DELETE https://api.click.uz/v2/merchant/payment/reversal/{service_id}/{payment_id}

### 5. request_card_token
Описание: "Запросить токенизацию карты (UzCard/HUMO) — отправит SMS-код клиенту"
Параметры:
  - card_number: z.string().regex(/^[0-9]{16}$/).describe("16-значный номер карты")
  - expire_date: z.string().regex(/^\d{4}$/).describe("Срок действия MMYY")
  - temporary: z.number().int().min(0).max(1).default(0).describe("0=постоянный токен, 1=временный")
Zod: z.object({ card_number: z.string(), expire_date: z.string(), temporary: z.number().optional() })
POST https://api.click.uz/v2/merchant/card_token/request
Body: { service_id: CLICK_SERVICE_ID, card_number, expire_date, temporary }
Ответ: { card_token: "...", phone_number: "998XX***XXXX" }

### 6. verify_card_token
Описание: "Подтвердить токенизацию карты SMS-кодом"
Параметры:
  - card_token: z.string().describe("Токен карты из request_card_token")
  - sms_code: z.string().regex(/^\d{6}$/).describe("6-значный SMS-код")
Zod: z.object({ card_token: z.string(), sms_code: z.string() })
POST https://api.click.uz/v2/merchant/card_token/verify
Body: { service_id: CLICK_SERVICE_ID, card_token, sms_code }

### 7. pay_with_token
Описание: "Провести оплату по токену карты"
Параметры:
  - card_token: z.string().describe("Верифицированный токен карты")
  - amount: z.number().positive().describe("Сумма в сумах")
  - merchant_trans_id: z.string().describe("Уникальный ID транзакции")
Zod: z.object({ card_token: z.string(), amount: z.number(), merchant_trans_id: z.string() })
POST https://api.click.uz/v2/merchant/card_token/payment
Body: { service_id: CLICK_SERVICE_ID, card_token, amount, merchant_trans_id }

### 8. click_pass_payment
Описание: "Оплата через Click Pass (бесконтактная оплата без ввода данных карты)"
Параметры:
  - amount: z.number().positive().describe("Сумма в сумах")
  - merchant_trans_id: z.string().describe("Уникальный ID транзакции")
  - phone_number: z.string().regex(/^998\d{9}$/).describe("Телефон клиента")
Zod: z.object({ amount: z.number(), merchant_trans_id: z.string(), phone_number: z.string() })
POST https://api.click.uz/v2/merchant/click_pass/payment
Body: { service_id: CLICK_SERVICE_ID, amount, merchant_trans_id, phone_number }

## Error Handling
- error_code: 0 = успех, иначе ошибка
- error_code: -1 = "SIGN CHECK FAILED!" — проверить digest/timestamp
- error_code: -2 = "Неверная сумма"
- error_code: -3 = "Action не найден"
- error_code: -4 = "Уже оплачено"
- error_code: -5 = "Пользователь не найден"
- error_code: -9 = "Транзакция отменена"
- Network error: retry 1 раз через 3 сек
- Если digest ошибка — пересоздать Auth заголовок (timestamp мог устареть)

## Rate Limits
REQUIRES VERIFICATION — не документированы. Встроенный лимит: 5 req/sec.

## package.json
name: "@theyahia/click-mcp"
description: "MCP server for Click Merchant API — payments in Uzbekistan"
keywords: ["mcp", "uzbekistan", "click", "payments", "merchant", "uzcard", "humo"]
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Зарегистрировать на mcp.so, smithery.ai
- [ ] Анонс: @nodejs_uz, @js_uzb, @typescript_uzb, @paytechuz

### smithery.yaml
```yaml
name: "@theyahia/click-mcp"
description: "Click Merchant API — invoices, card tokens, payments for Uzbekistan"
version: "1.0.0"
tools:
  - create_invoice
  - get_invoice_status
  - get_payment_status
  - refund_payment
  - request_card_token
  - verify_card_token
  - pay_with_token
  - click_pass_payment
auth:
  type: custom
  description: "SHA1 digest auth via Auth header"
env:
  - name: CLICK_SERVICE_ID
    description: "Click service ID"
    required: true
  - name: CLICK_MERCHANT_USER_ID
    description: "Click merchant user ID"
    required: true
  - name: CLICK_SECRET_KEY
    description: "Secret key for SHA1 digest"
    required: true
```

---

# Сервер 4: eskiz-mcp

## Описание
MCP-сервер для Eskiz.uz SMS API — доминирующий SMS-провайдер для разработчиков в Узбекистане. JWT Bearer авторизация, одиночные и массовые SMS, статусы доставки.

## Pre-implementation checklist

- [ ] Регистрация: **ДА** — https://eskiz.uz (создать аккаунт, только юрлица)
  - Получить email и password для API
- [ ] Sandbox URL: **НЕТ** — Eskiz не предоставляет sandbox, SMS отправляются реально
  - REQUIRES VERIFICATION: возможно есть тестовый режим через параметр
- [ ] Тестовые данные: нет тестового режима, каждый SMS списывает баланс
- [ ] Документация: https://documenter.getpostman.com/view/663428/TVK5eMco
- [ ] Known gotchas:
  - Только для юридических лиц Узбекистана
  - 1 SMS = 160 латинских или 70 кириллических символов
  - 95 сум/SMS (информационные), 175 сум/SMS (рекламные — только Ucell/Mobiuz/Uzmobile)
  - JWT токен истекает (REQUIRES VERIFICATION: TTL токена)
  - Нужно авто-обновление токена при 401
  - `from` поле в send_sms — зарегистрированный alpha-name отправителя

## Env vars
```bash
ESKIZ_EMAIL=            # Email аккаунта Eskiz
ESKIZ_PASSWORD=         # Пароль аккаунта
```

## API Endpoints

**Base URL:** `https://notify.eskiz.uz/api/`

**Авторизация:** JWT Bearer Token
1. POST `/auth/login` с `{ email, password }` → получить `token`
2. Все запросы: `Authorization: Bearer {token}`
3. При 401: POST `/auth/refresh` → новый токен

| Действие | Метод | Endpoint | Content-Type |
|----------|-------|----------|-------------|
| Логин (получить JWT) | POST | `/auth/login` | multipart/form-data |
| Отправить SMS | POST | `/message/sms/send` | multipart/form-data |
| Массовая отправка | POST | `/message/sms/send-batch` | application/json |
| Статус SMS | GET | `/message/sms/status_by_id/{id}` | — |
| Информация аккаунта | GET | `/auth/user` | — |
| Лимиты | GET | `/auth/user/limit` | — |
| Обновить токен | PATCH | `/auth/refresh` | — |

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/eskiz-mcp для Eskiz.uz SMS API.

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Протокол: REST API.

## Конфигурация

Env vars:
  ESKIZ_EMAIL — email аккаунта Eskiz (обязательно)
  ESKIZ_PASSWORD — пароль (обязательно)

Base URL: https://notify.eskiz.uz/api/

## Авторизация (auth.ts)

JWT Bearer Token с авто-обновлением:

1. При старте сервера: POST /auth/login
   Content-Type: multipart/form-data (НЕ JSON!)
   Body: email={ESKIZ_EMAIL}&password={ESKIZ_PASSWORD}
   Ответ: { message: "token_generated", data: { token: "eyJ..." }, token_type: "bearer" }

2. Сохранить token в памяти.

3. Все запросы: Authorization: Bearer {token}

4. При 401 ответе: автоматически PATCH /auth/refresh с текущим токеном → обновить.

5. Если refresh тоже 401 → повторный /auth/login.

ВАЖНО: /auth/login и /message/sms/send используют multipart/form-data, НЕ JSON!
Использовать FormData для этих запросов.

## 6 tools с Zod-схемами

### 1. send_sms
Описание: "Отправить одиночный SMS через Eskiz.uz"
Параметры:
  - phone: z.string().regex(/^998\d{9}$/).describe("Номер телефона в формате 998XXXXXXXXX (без +)")
  - message: z.string().min(1).max(1600).describe("Текст SMS. Лимит: 160 лат. или 70 кирилл. символов = 1 SMS. Более длинные = несколько SMS")
  - from: z.string().default("4546").describe("Alpha-name отправителя (зарегистрированный в Eskiz). По умолчанию 4546")
  - callback_url: z.string().url().optional().describe("URL для callback о статусе доставки")
Zod: z.object({ phone: z.string(), message: z.string(), from: z.string().optional(), callback_url: z.string().optional() })
POST https://notify.eskiz.uz/api/message/sms/send
Content-Type: multipart/form-data
Body (FormData): mobile_phone={phone}, message={message}, from={from}, callback_url={callback_url}
Ответ: { status: "waiting", message: "Waiting for SMS provider", id: "UUID", request_id: 123 }
Вернуть: ID сообщения, статус, предупреждение о стоимости (95 сум инфо / 175 сум рекламные).

### 2. send_batch_sms
Описание: "Массовая отправка SMS (до 100 номеров за раз)"
Параметры:
  - messages: z.array(z.object({
      phone: z.string().regex(/^998\d{9}$/),
      text: z.string().min(1)
    })).min(1).max(100).describe("Массив сообщений [{phone, text}]")
  - from: z.string().default("4546").describe("Alpha-name отправителя")
Zod: z.object({ messages: z.array(z.object({...})), from: z.string().optional() })
POST https://notify.eskiz.uz/api/message/sms/send-batch
Content-Type: application/json
Body: { messages: [{ user_sms_id: "uuid", to: phone, text }], from, dispatch_id: uuid }
Вернуть: количество отправленных, общая стоимость.

### 3. get_sms_status
Описание: "Проверить статус доставки SMS по ID"
Параметры:
  - message_id: z.string().describe("ID сообщения из send_sms")
Zod: z.object({ message_id: z.string() })
GET https://notify.eskiz.uz/api/message/sms/status_by_id/{message_id}
Статусы: WAITING, TRANSMIT, DELIVERED, FAILED, NOT_FOUND

### 4. get_balance
Описание: "Получить баланс и информацию об аккаунте Eskiz"
Параметры: нет
Zod: z.object({})
GET https://notify.eskiz.uz/api/auth/user
Ответ содержит: balance, is_active, created_at, name, email

### 5. get_limits
Описание: "Получить лимиты SMS: дневной лимит, использовано, осталось"
Параметры: нет
Zod: z.object({})
GET https://notify.eskiz.uz/api/auth/user/limit
Ответ: { limit: 1000, used: 150, remaining: 850 }

### 6. refresh_token
Описание: "Принудительно обновить JWT-токен (обычно происходит автоматически)"
Параметры: нет
Zod: z.object({})
PATCH https://notify.eskiz.uz/api/auth/refresh
С текущим Bearer токеном.

## Error Handling
- 401: авто-refresh токена → retry запроса
- 403: "Аккаунт деактивирован или alpha-name не зарегистрирован"
- 400: "Неверный номер телефона или текст пустой"
- 402: "Недостаточно средств на балансе Eskiz"
- 429: REQUIRES VERIFICATION — rate limit от Eskiz
- Network error: retry 1 раз через 2 сек

## Rate Limits
REQUIRES VERIFICATION — не документированы. Встроенный лимит: 10 req/sec.

## package.json
name: "@theyahia/eskiz-mcp"
description: "MCP server for Eskiz.uz SMS API — send SMS in Uzbekistan"
keywords: ["mcp", "uzbekistan", "eskiz", "sms", "messaging", "otp"]
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Зарегистрировать на mcp.so, smithery.ai
- [ ] Анонс: @nodejs_uz, @js_uzb, @typescript_uzb, @paytechuz

### smithery.yaml
```yaml
name: "@theyahia/eskiz-mcp"
description: "Eskiz.uz SMS API — send SMS to all Uzbekistan operators"
version: "1.0.0"
tools:
  - send_sms
  - send_batch_sms
  - get_sms_status
  - get_balance
  - get_limits
  - refresh_token
auth:
  type: bearer
  description: "JWT Bearer token (auto-obtained from email/password)"
env:
  - name: ESKIZ_EMAIL
    description: "Eskiz.uz account email"
    required: true
  - name: ESKIZ_PASSWORD
    description: "Eskiz.uz account password"
    required: true
```

---

# Сервер 5: uzum-merchant-mcp

## Описание
MCP-сервер для Uzum Bank Merchant API (бывший Kapitalbank/Apelsin). Самый современный developer portal среди узбекских платёжных систем. HTTP Basic Auth, чекаут, фискализация, QR-платежи.

## Pre-implementation checklist

- [ ] Регистрация: **ДА** — https://developer.uzumbank.uz/en/ (создать аккаунт мерчанта)
  - Получить `terminal_id` и `access_key` (test + production)
- [ ] Sandbox URL: REQUIRES VERIFICATION — предполагается наличие test-среды
  - Postman-коллекция: https://www.postman.com/programmsoft/uzum-merchant/overview
- [ ] Тестовые данные: REQUIRES VERIFICATION
- [ ] Документация: https://developer.uzumbank.uz/en/
- [ ] Known gotchas:
  - HTTP Basic Auth (НЕ кастомный, стандартный!)
  - Поддерживает карты: Uzum, HUMO, UzCard, Visa, MasterCard
  - Таймаут транзакции — 30 минут
  - Webhook-эндпоинты: /check, /create, /confirm, /reverse, /status
  - Также есть FastPay, Dynamic QR, CrossBorder, Fiscalization — API-продукты
  - REQUIRES VERIFICATION: точные URL эндпоинтов (из developer portal)

## Env vars
```bash
UZUM_TERMINAL_ID=       # Terminal ID из кабинета мерчанта
UZUM_ACCESS_KEY=        # Access key для HTTP Basic Auth
UZUM_SANDBOX=true       # Использовать тестовую среду
```

## API Endpoints

**REQUIRES VERIFICATION:** точные URL эндпоинтов из developer.uzumbank.uz

Предполагаемая структура на основе документации:

| Действие | Метод | Endpoint |
|----------|-------|----------|
| Создать платёж (checkout) | POST | `/api/v1/payment/create` |
| Проверить платёж | POST | `/api/v1/payment/check` |
| Подтвердить платёж | POST | `/api/v1/payment/confirm` |
| Отменить/возврат | POST | `/api/v1/payment/reverse` |
| Статус платежа | POST | `/api/v1/payment/status` |
| Фискализация | POST | `/api/v1/fiscal/receipt` |
| Dynamic QR | POST | `/api/v1/qr/create` |

**Авторизация:** HTTP Basic Auth
```
Authorization: Basic {base64(terminal_id + ":" + access_key)}
```

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/uzum-merchant-mcp для Uzum Bank Merchant API.

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Протокол: REST API (JSON), HTTPS POST.

## Конфигурация

Env vars:
  UZUM_TERMINAL_ID — Terminal ID мерчанта (обязательно)
  UZUM_ACCESS_KEY — Access key (обязательно)
  UZUM_SANDBOX — "true" для тестовой среды (по умолчанию "true")

Base URL: REQUIRES VERIFICATION из https://developer.uzumbank.uz/en/
  Предполагаемый sandbox: https://test-api.uzumbank.uz/
  Предполагаемый prod: https://api.uzumbank.uz/

Авторизация: HTTP Basic Auth (стандартный)
  Authorization: Basic {Buffer.from(`${UZUM_TERMINAL_ID}:${UZUM_ACCESS_KEY}`).toString('base64')}

## 7 tools с Zod-схемами

### 1. create_payment
Описание: "Создать платёж через Uzum Bank (генерирует ссылку на оплату)"
Параметры:
  - amount: z.number().positive().describe("Сумма в сумах")
  - currency: z.literal(860).default(860).describe("Код валюты (860 = UZS)")
  - order_id: z.string().describe("Уникальный ID заказа")
  - description: z.string().optional().describe("Описание платежа")
  - return_url: z.string().url().optional().describe("URL возврата после оплаты")
Zod: z.object({ amount: z.number(), currency: z.number().optional(), order_id: z.string(), description: z.string().optional(), return_url: z.string().optional() })
POST /api/v1/payment/create  (REQUIRES VERIFICATION)
Ответ: { payment_id, checkout_url, status }

### 2. check_payment
Описание: "Проверить возможность проведения платежа"
Параметры:
  - payment_id: z.string().describe("ID платежа")
Zod: z.object({ payment_id: z.string() })
POST /api/v1/payment/check  (REQUIRES VERIFICATION)

### 3. confirm_payment
Описание: "Подтвердить (провести) платёж"
Параметры:
  - payment_id: z.string().describe("ID платежа")
Zod: z.object({ payment_id: z.string() })
POST /api/v1/payment/confirm  (REQUIRES VERIFICATION)

### 4. reverse_payment
Описание: "Отменить/вернуть платёж"
Параметры:
  - payment_id: z.string().describe("ID платежа для отмены")
  - reason: z.string().optional().describe("Причина отмены")
Zod: z.object({ payment_id: z.string(), reason: z.string().optional() })
POST /api/v1/payment/reverse  (REQUIRES VERIFICATION)

### 5. get_payment_status
Описание: "Получить текущий статус платежа Uzum Bank"
Параметры:
  - payment_id: z.string().describe("ID платежа")
Zod: z.object({ payment_id: z.string() })
POST /api/v1/payment/status  (REQUIRES VERIFICATION)

### 6. create_qr_payment
Описание: "Создать Dynamic QR-код для оплаты (обязательно с 01.07.2026)"
Параметры:
  - amount: z.number().positive().describe("Сумма в сумах")
  - order_id: z.string().describe("ID заказа")
  - expire_minutes: z.number().int().min(1).max(60).default(30).describe("Время жизни QR в минутах")
Zod: z.object({ amount: z.number(), order_id: z.string(), expire_minutes: z.number().optional() })
POST /api/v1/qr/create  (REQUIRES VERIFICATION)

### 7. create_fiscal_receipt
Описание: "Создать фискальный чек для платежа"
Параметры:
  - payment_id: z.string().describe("ID платежа")
  - items: z.array(z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      vat: z.number().default(0),
      mxik_code: z.string().optional().describe("Код МХИК товара (tasnif.soliq.uz)")
    })).describe("Товары/услуги в чеке")
Zod: z.object({ payment_id: z.string(), items: z.array(z.object({...})) })
POST /api/v1/fiscal/receipt  (REQUIRES VERIFICATION)

## Error Handling
- 401: "Неверные учётные данные (terminal_id/access_key)"
- 400: "Неверные параметры запроса"
- 404: "Платёж не найден"
- Таймаут транзакции: 30 минут (status=expired после)
- Network error: retry 1 раз через 3 сек

## Rate Limits
REQUIRES VERIFICATION — не документированы. Встроенный лимит: 5 req/sec.

## package.json
name: "@theyahia/uzum-merchant-mcp"
description: "MCP server for Uzum Bank Merchant API — payments, QR, fiscal receipts"
keywords: ["mcp", "uzbekistan", "uzum", "uzumbank", "kapitalbank", "payments", "qr"]

ПРИМЕЧАНИЕ: Многие endpoint URL помечены REQUIRES VERIFICATION.
Перед началом разработки:
1. Зарегистрироваться на https://developer.uzumbank.uz/en/
2. Изучить Postman-коллекцию: https://www.postman.com/programmsoft/uzum-merchant/overview
3. Уточнить точные URL, параметры и форматы ответов
4. Обновить этот промпт с реальными данными
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Зарегистрировать на mcp.so, smithery.ai
- [ ] Анонс: @nodejs_uz, @js_uzb, @typescript_uzb, @paytechuz

### smithery.yaml
```yaml
name: "@theyahia/uzum-merchant-mcp"
description: "Uzum Bank Merchant API — payments, QR codes, fiscal receipts"
version: "1.0.0"
tools:
  - create_payment
  - check_payment
  - confirm_payment
  - reverse_payment
  - get_payment_status
  - create_qr_payment
  - create_fiscal_receipt
auth:
  type: basic
env:
  - name: UZUM_TERMINAL_ID
    description: "Uzum Bank terminal ID"
    required: true
  - name: UZUM_ACCESS_KEY
    description: "Uzum Bank access key"
    required: true
  - name: UZUM_SANDBOX
    description: "Use sandbox (default: true)"
    required: false
    default: "true"
```

---

# Сервер 6: uzum-market-mcp

## Описание
MCP-сервер для Uzum Market Seller API — крупнейший маркетплейс Узбекистана (15 000+ продавцов, 10M+ пользователей). Управление товарами, заказами, аналитика.

## Pre-implementation checklist

- [ ] Регистрация: **ДА** — https://seller.uzum.uz (создать аккаунт продавца)
- [ ] Sandbox URL: **НЕТ** — API работает с реальными данными
- [ ] Swagger: `https://api-seller.uzum.uz/api/seller-openapi/swagger/swagger-ui/` (требует авторизации!)
- [ ] Тестовые данные: нет — работа с реальным каталогом и заказами
- [ ] Неофициальная документация: https://github.com/spireuz/uzum-statistics (consumer-эндпоинты)
- [ ] Known gotchas:
  - Swagger закрыт авторизацией — нужен аккаунт продавца для просмотра
  - API может меняться без предупреждения (нет публичного changelog)
  - REQUIRES VERIFICATION: формат токена авторизации
  - Consumer API (публичный каталог) отличается от Seller API (управление)

## Env vars
```bash
UZUM_MARKET_TOKEN=      # Токен авторизации продавца
```

## API Endpoints

**REQUIRES VERIFICATION:** большинство эндпоинтов нужно извлечь из Swagger после авторизации.

**Base URL (предполагаемый):** `https://api-seller.uzum.uz/api/`

**Авторизация:** Token-based
```
Authorization: Bearer {UZUM_MARKET_TOKEN}
```
REQUIRES VERIFICATION: точный формат заголовка (Bearer или Token или кастомный).

### Публичные Consumer-эндпоинты (из spireuz/uzum-statistics)
```
GET https://api.uzum.uz/api/main/search?query={query}
GET https://api.uzum.uz/api/v2/product/{productId}
GET https://api.uzum.uz/api/category/v2/{categoryId}/product
GET https://api.uzum.uz/api/shop/{shopId}
```

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/uzum-market-mcp для Uzum Market Seller API.

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Протокол: REST API (JSON).

## Конфигурация

Env vars:
  UZUM_MARKET_TOKEN — токен авторизации продавца (обязательно)

Base URL Seller API: https://api-seller.uzum.uz/api/  (REQUIRES VERIFICATION)
Base URL Consumer API: https://api.uzum.uz/api/

Авторизация: REQUIRES VERIFICATION — предполагается Bearer Token.
  Authorization: Bearer {UZUM_MARKET_TOKEN}

ВАЖНО: Перед имплементацией необходимо:
1. Зарегистрироваться на seller.uzum.uz
2. Получить API-токен
3. Открыть Swagger: https://api-seller.uzum.uz/api/seller-openapi/swagger/swagger-ui/
4. Задокументировать все доступные эндпоинты

## 8 tools с Zod-схемами (предполагаемые на основе стандартных marketplace API)

### 1. search_products
Описание: "Поиск товаров на Uzum Market (публичный каталог)"
Параметры:
  - query: z.string().min(1).describe("Поисковый запрос")
  - page: z.number().int().min(0).default(0).describe("Номер страницы")
  - size: z.number().int().min(1).max(100).default(20).describe("Количество результатов")
Zod: z.object({ query: z.string(), page: z.number().optional(), size: z.number().optional() })
GET https://api.uzum.uz/api/main/search?query={query}&page={page}&size={size}
Не требует авторизации (публичный API).

### 2. get_product
Описание: "Получить детальную информацию о товаре по ID"
Параметры:
  - product_id: z.number().int().describe("ID товара на Uzum Market")
Zod: z.object({ product_id: z.number() })
GET https://api.uzum.uz/api/v2/product/{product_id}
Не требует авторизации.

### 3. get_category_products
Описание: "Получить товары в категории"
Параметры:
  - category_id: z.number().int().describe("ID категории")
  - page: z.number().int().min(0).default(0).describe("Страница")
  - size: z.number().int().min(1).max(100).default(20).describe("Размер страницы")
  - sort: z.enum(["ascending_price", "descending_price", "popular", "new"]).default("popular").describe("Сортировка")
Zod: z.object({ category_id: z.number(), page: z.number().optional(), size: z.number().optional(), sort: z.string().optional() })
GET https://api.uzum.uz/api/category/v2/{category_id}/product?page={page}&size={size}&sort={sort}

### 4. get_shop_info
Описание: "Получить информацию о магазине продавца"
Параметры:
  - shop_id: z.number().int().describe("ID магазина")
Zod: z.object({ shop_id: z.number() })
GET https://api.uzum.uz/api/shop/{shop_id}

### 5. get_seller_orders  (REQUIRES VERIFICATION)
Описание: "Получить список заказов продавца"
Параметры:
  - status: z.enum(["new", "processing", "shipped", "delivered", "cancelled"]).optional()
  - page: z.number().int().min(0).default(0)
  - size: z.number().int().min(1).max(100).default(20)
Zod: z.object({ status: z.string().optional(), page: z.number().optional(), size: z.number().optional() })
GET https://api-seller.uzum.uz/api/orders  (REQUIRES VERIFICATION)
Требует авторизации продавца.

### 6. get_seller_products  (REQUIRES VERIFICATION)
Описание: "Получить список товаров продавца (управление каталогом)"
Параметры:
  - status: z.enum(["active", "inactive", "moderation", "rejected"]).optional()
  - page: z.number().int().min(0).default(0)
Zod: z.object({ status: z.string().optional(), page: z.number().optional() })
GET https://api-seller.uzum.uz/api/products  (REQUIRES VERIFICATION)

### 7. update_product_price  (REQUIRES VERIFICATION)
Описание: "Обновить цену товара"
Параметры:
  - product_id: z.number().int().describe("ID товара")
  - sku_id: z.number().int().describe("ID SKU")
  - price: z.number().positive().describe("Новая цена в сумах")
Zod: z.object({ product_id: z.number(), sku_id: z.number(), price: z.number() })
PUT https://api-seller.uzum.uz/api/products/{product_id}/skus/{sku_id}/price  (REQUIRES VERIFICATION)

### 8. get_seller_analytics  (REQUIRES VERIFICATION)
Описание: "Получить аналитику продаж: выручка, заказы, конверсия"
Параметры:
  - from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Начало периода YYYY-MM-DD")
  - to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Конец периода YYYY-MM-DD")
Zod: z.object({ from_date: z.string(), to_date: z.string() })
GET https://api-seller.uzum.uz/api/analytics  (REQUIRES VERIFICATION)

## Error Handling
- 401: "Токен недействителен или истёк — обновите UZUM_MARKET_TOKEN"
- 403: "Нет доступа к этому ресурсу (проверьте права аккаунта)"
- 404: "Товар/заказ не найден"
- 429: "Rate limit — слишком много запросов"
- Network error: retry 1 раз через 3 сек

## Rate Limits
REQUIRES VERIFICATION. Встроенный лимит: 3 req/sec (маркетплейсы чувствительны к нагрузке).

## package.json
name: "@theyahia/uzum-market-mcp"
description: "MCP server for Uzum Market — search products, manage seller catalog"
keywords: ["mcp", "uzbekistan", "uzum", "marketplace", "ecommerce", "seller"]

ПРИМЕЧАНИЕ: 5 из 8 tools помечены REQUIRES VERIFICATION.
Перед разработкой ОБЯЗАТЕЛЬНО:
1. Зарегистрироваться на seller.uzum.uz
2. Открыть и изучить Swagger-спецификацию
3. Обновить эндпоинты, параметры и форматы ответов
4. Публичные consumer-эндпоинты (tools 1-4) можно реализовать без верификации
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Зарегистрировать на mcp.so, smithery.ai
- [ ] Анонс: @nodejs_uz, @js_uzb, @typescript_uzb, @paytechuz

### smithery.yaml
```yaml
name: "@theyahia/uzum-market-mcp"
description: "Uzum Market — search products, manage seller catalog and orders"
version: "1.0.0"
tools:
  - search_products
  - get_product
  - get_category_products
  - get_shop_info
  - get_seller_orders
  - get_seller_products
  - update_product_price
  - get_seller_analytics
auth:
  type: bearer
env:
  - name: UZUM_MARKET_TOKEN
    description: "Uzum Market seller API token"
    required: true
```

---

# Сервер 7: oson-mcp

## Описание
MCP-сервер для Oson Kassa API и InterHub Merchant API. Invoice-модель платежей, поддерживает OSON-кошелёк, UzCard, HUMO.

## Pre-implementation checklist

- [ ] Регистрация: **ДА** — через Oson менеджера (REQUIRES VERIFICATION: URL регистрации)
- [ ] Sandbox URL: REQUIRES VERIFICATION — тестовая среда предположительно есть
- [ ] Тестовые карты: **ДА** — Oson предоставляет тестовые карты (из документации)
- [ ] Документация: https://docs.oson.com/
- [ ] Known gotchas:
  - Два API: Kassa (invoice-модель) и InterHub (check/pay/check_status)
  - Авторизация через secret key (REQUIRES VERIFICATION: формат заголовка)
  - Поддерживает OSON-кошелёк, UzCard, HUMO (но НЕ Visa/MC)

## Env vars
```bash
OSON_MERCHANT_ID=       # ID мерчанта
OSON_SECRET_KEY=        # Секретный ключ
OSON_SANDBOX=true       # Тестовая среда
```

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/oson-mcp для Oson Kassa/InterHub API.

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Протокол: REST API (JSON).

## Конфигурация

Env vars:
  OSON_MERCHANT_ID — ID мерчанта (обязательно)
  OSON_SECRET_KEY — секретный ключ (обязательно)
  OSON_SANDBOX — "true" для тестовой среды (по умолчанию "true")

Документация: https://docs.oson.com/

Авторизация: Secret Key (REQUIRES VERIFICATION: точный формат заголовка).
Предполагаемый формат: подпись запроса через HMAC-SHA256 или MD5 с secret_key.

## Два API

### Kassa API (invoice-модель)
Мерчант создаёт инвойс → клиент оплачивает через OSON → callback на URL мерчанта.

### InterHub Merchant API (check/pay)
OSON вызывает URL мерчанта с методами check, pay, check_status.
Для MCP-сервера используем Kassa API (активная сторона — мерчант).

## 6 tools с Zod-схемами

### 1. create_invoice
Описание: "Создать счёт на оплату через Oson"
Параметры:
  - amount: z.number().positive().describe("Сумма в сумах")
  - order_id: z.string().describe("ID заказа")
  - description: z.string().optional().describe("Описание платежа")
  - expire_minutes: z.number().int().min(5).max(1440).default(60).describe("Время жизни инвойса в минутах")
  - callback_url: z.string().url().optional().describe("URL для callback о статусе оплаты")
Zod: z.object({ amount: z.number(), order_id: z.string(), description: z.string().optional(), expire_minutes: z.number().optional(), callback_url: z.string().optional() })
POST /api/v1/invoice/create  (REQUIRES VERIFICATION: точный URL из docs.oson.com)

### 2. get_invoice_status
Описание: "Проверить статус инвойса Oson"
Параметры:
  - invoice_id: z.string().describe("ID инвойса")
Zod: z.object({ invoice_id: z.string() })
GET /api/v1/invoice/status/{invoice_id}  (REQUIRES VERIFICATION)

### 3. cancel_invoice
Описание: "Отменить неоплаченный инвойс"
Параметры:
  - invoice_id: z.string().describe("ID инвойса для отмены")
Zod: z.object({ invoice_id: z.string() })
POST /api/v1/invoice/cancel  (REQUIRES VERIFICATION)

### 4. refund_payment
Описание: "Вернуть оплаченный платёж"
Параметры:
  - payment_id: z.string().describe("ID платежа")
  - amount: z.number().positive().optional().describe("Сумма возврата (если частичный)")
Zod: z.object({ payment_id: z.string(), amount: z.number().optional() })
POST /api/v1/payment/refund  (REQUIRES VERIFICATION)

### 5. get_payment_list
Описание: "Получить список платежей за период"
Параметры:
  - from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Начало YYYY-MM-DD")
  - to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Конец YYYY-MM-DD")
  - page: z.number().int().min(1).default(1)
Zod: z.object({ from_date: z.string(), to_date: z.string(), page: z.number().optional() })
GET /api/v1/payment/list  (REQUIRES VERIFICATION)

### 6. get_balance
Описание: "Получить баланс мерчанта Oson"
Параметры: нет
Zod: z.object({})
GET /api/v1/merchant/balance  (REQUIRES VERIFICATION)

## Error Handling
- REQUIRES VERIFICATION: коды ошибок из docs.oson.com
- Network error: retry 1 раз через 3 сек

## Rate Limits
REQUIRES VERIFICATION. Встроенный лимит: 5 req/sec.

## package.json
name: "@theyahia/oson-mcp"
description: "MCP server for Oson Kassa/InterHub API — payments via OSON wallet, UzCard, HUMO"
keywords: ["mcp", "uzbekistan", "oson", "payments", "wallet", "uzcard", "humo"]

ПРИМЕЧАНИЕ: Все endpoint URL помечены REQUIRES VERIFICATION.
Перед разработкой ОБЯЗАТЕЛЬНО:
1. Изучить docs.oson.com полностью
2. Связаться с Oson для получения тестовых credentials
3. Уточнить все URL, формат авторизации и коды ошибок
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Анонс: @nodejs_uz, @js_uzb, @paytechuz

### smithery.yaml
```yaml
name: "@theyahia/oson-mcp"
description: "Oson Kassa — payments via OSON wallet, UzCard, HUMO"
version: "1.0.0"
tools:
  - create_invoice
  - get_invoice_status
  - cancel_invoice
  - refund_payment
  - get_payment_list
  - get_balance
auth:
  type: custom
  description: "Secret key based auth"
env:
  - name: OSON_MERCHANT_ID
    description: "Oson merchant ID"
    required: true
  - name: OSON_SECRET_KEY
    description: "Oson secret key"
    required: true
  - name: OSON_SANDBOX
    description: "Use sandbox (default: true)"
    required: false
    default: "true"
```

---

# Сервер 8: playmobile-mcp

## Описание
MCP-сервер для Playmobile.uz SMS API — enterprise SMS-провайдер с 2004 года. HTTP Basic Auth, покрытие всех операторов УЗ (Beeline, Ucell, Mobiuz, UMS, Uzmobile, Perfectum). HTTP + SMPP протоколы.

## Pre-implementation checklist

- [ ] Регистрация: **ДА** — через менеджера Playmobile (enterprise, не self-service)
  - Контакт: https://playmobile.uz/
  - Цены: по запросу (enterprise-тарифы)
- [ ] Sandbox URL: **НЕТ** — нет тестовой среды
- [ ] Тестовые данные: нет
- [ ] Документация:
  - Wiki: https://wiki.playmobile.uz/
  - PDF: https://playmobile.uz/wp-content/uploads/2022/08/http.pdf
- [ ] Known gotchas:
  - Enterprise-ориентированный — нет self-service регистрации
  - HTTP Basic Auth (стандартный)
  - Поддерживает HTTP + SMPP протоколы (MCP = только HTTP)
  - Покрытие ВСЕХ операторов УЗ
  - Цены по запросу — не фиксированные

## Env vars
```bash
PLAYMOBILE_LOGIN=       # Логин (от менеджера)
PLAYMOBILE_PASSWORD=    # Пароль
PLAYMOBILE_BASE_URL=    # URL API (предоставляет менеджер)
```

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/playmobile-mcp для Playmobile.uz SMS API.

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Протокол: REST API через HTTP.

## Конфигурация

Env vars:
  PLAYMOBILE_LOGIN — логин (обязательно)
  PLAYMOBILE_PASSWORD — пароль (обязательно)
  PLAYMOBILE_BASE_URL — URL API, предоставляется менеджером (обязательно)

Авторизация: HTTP Basic Auth (стандартный)
  Authorization: Basic {Buffer.from(`${PLAYMOBILE_LOGIN}:${PLAYMOBILE_PASSWORD}`).toString('base64')}

Документация: https://wiki.playmobile.uz/ и PDF https://playmobile.uz/wp-content/uploads/2022/08/http.pdf

## 5 tools с Zod-схемами

### 1. send_sms
Описание: "Отправить SMS через Playmobile (все операторы Узбекистана)"
Параметры:
  - recipient: z.string().regex(/^998\d{9}$/).describe("Номер телефона 998XXXXXXXXX")
  - message_id: z.string().describe("Уникальный ID сообщения (для отслеживания)")
  - text: z.string().min(1).max(1600).describe("Текст SMS")
  - originator: z.string().describe("Имя отправителя (alpha-name, зарегистрированный)")
Zod: z.object({ recipient: z.string(), message_id: z.string(), text: z.string(), originator: z.string() })
POST {PLAYMOBILE_BASE_URL}/send
Content-Type: application/json
Body:
{
  "messages": [{
    "recipient": recipient,
    "message-id": message_id,
    "sms": {
      "originator": originator,
      "content": { "text": text }
    }
  }]
}
Операторы: Beeline, Ucell, Mobiuz, UMS, Uzmobile, Perfectum.

### 2. send_batch_sms
Описание: "Массовая отправка SMS (несколько получателей, один текст)"
Параметры:
  - recipients: z.array(z.object({
      phone: z.string().regex(/^998\d{9}$/),
      message_id: z.string()
    })).min(1).max(500).describe("Массив получателей")
  - text: z.string().min(1).describe("Текст SMS (одинаковый для всех)")
  - originator: z.string().describe("Имя отправителя")
Zod: z.object({ recipients: z.array(z.object({...})), text: z.string(), originator: z.string() })
POST {PLAYMOBILE_BASE_URL}/send
Body: messages[] с несколькими получателями

### 3. get_sms_status
Описание: "Проверить статус доставки SMS по message-id"
Параметры:
  - message_id: z.string().describe("ID сообщения из send_sms")
Zod: z.object({ message_id: z.string() })
GET {PLAYMOBILE_BASE_URL}/status?id={message_id}  (REQUIRES VERIFICATION: точный URL)
Статусы: DELIVERED, EXPIRED, UNDELIVERABLE, REJECTED, UNKNOWN

### 4. get_balance
Описание: "Проверить баланс аккаунта Playmobile"
Параметры: нет
Zod: z.object({})
GET {PLAYMOBILE_BASE_URL}/balance  (REQUIRES VERIFICATION)

### 5. get_dlr_report
Описание: "Получить отчёт о доставке SMS за период"
Параметры:
  - from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Начало YYYY-MM-DD")
  - to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Конец YYYY-MM-DD")
Zod: z.object({ from_date: z.string(), to_date: z.string() })
GET {PLAYMOBILE_BASE_URL}/report  (REQUIRES VERIFICATION)

## Error Handling
- 401: "Неверные учётные данные Playmobile"
- 400: "Неверный номер телефона или пустой текст"
- REQUIRES VERIFICATION: полный список кодов ошибок из wiki.playmobile.uz
- Network error: retry 1 раз через 2 сек

## Rate Limits
REQUIRES VERIFICATION. Встроенный лимит: 10 req/sec.

## package.json
name: "@theyahia/playmobile-mcp"
description: "MCP server for Playmobile.uz SMS — enterprise SMS for all UZ operators"
keywords: ["mcp", "uzbekistan", "playmobile", "sms", "enterprise", "messaging"]

ПРИМЕЧАНИЕ: Enterprise API — нужен контракт с Playmobile для получения credentials.
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Анонс: @nodejs_uz, @js_uzb

### smithery.yaml
```yaml
name: "@theyahia/playmobile-mcp"
description: "Playmobile.uz — enterprise SMS for all Uzbekistan operators"
version: "1.0.0"
tools:
  - send_sms
  - send_batch_sms
  - get_sms_status
  - get_balance
  - get_dlr_report
auth:
  type: basic
env:
  - name: PLAYMOBILE_LOGIN
    description: "Playmobile login"
    required: true
  - name: PLAYMOBILE_PASSWORD
    description: "Playmobile password"
    required: true
  - name: PLAYMOBILE_BASE_URL
    description: "Playmobile API base URL"
    required: true
```

---

# Сервер 9: data-gov-uz-mcp

## Описание
MCP-сервер для data.gov.uz — портал открытых данных Узбекистана. API Key авторизация, доступ к государственным датасетам (население, экономика, здравоохранение, образование и т.д.).

## Pre-implementation checklist

- [ ] Регистрация: **ДА** — https://data.egov.uz/eng (создать аккаунт, получить API Key)
- [ ] Sandbox URL: **НЕТ** — API работает с реальными данными (read-only)
- [ ] Тестовые данные: не нужны — read-only API
- [ ] Документация: портал https://data.egov.uz/eng
- [ ] Known gotchas:
  - API Key передаётся как query-параметр `access_key`
  - Формат: JSON
  - REQUIRES VERIFICATION: полный список доступных датасетов
  - Портал может быть нестабильным (государственный ресурс)
  - Данные на узбекском и русском языках

## Env vars
```bash
DATA_GOV_UZ_API_KEY=    # API ключ с data.egov.uz
```

## API Endpoints

**Base URL:** `https://data.gov.uz/uz/api/v1/`

**Авторизация:** API Key как query-параметр
```
GET https://data.gov.uz/uz/api/v1/json/dataset?access_key={API_KEY}
```

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/data-gov-uz-mcp для data.gov.uz (открытые данные Узбекистана).

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Протокол: REST API (JSON).

## Конфигурация

Env vars:
  DATA_GOV_UZ_API_KEY — API ключ (обязательно)

Base URL: https://data.gov.uz/uz/api/v1/

Авторизация: API Key как query-параметр.
Все запросы: ?access_key={DATA_GOV_UZ_API_KEY}

## 5 tools с Zod-схемами

### 1. list_datasets
Описание: "Получить список доступных датасетов на data.gov.uz"
Параметры:
  - page: z.number().int().min(1).default(1).describe("Номер страницы")
  - per_page: z.number().int().min(1).max(100).default(20).describe("Количество на странице")
  - search: z.string().optional().describe("Поиск по названию датасета")
  - category: z.string().optional().describe("Категория (экономика, здравоохранение, образование и т.д.)")
Zod: z.object({ page: z.number().optional(), per_page: z.number().optional(), search: z.string().optional(), category: z.string().optional() })
GET https://data.gov.uz/uz/api/v1/json/dataset?access_key={key}&page={page}&search={search}
(REQUIRES VERIFICATION: точные query-параметры)

### 2. get_dataset
Описание: "Получить данные конкретного датасета по ID"
Параметры:
  - dataset_id: z.string().describe("ID датасета")
  - page: z.number().int().min(1).default(1)
  - per_page: z.number().int().min(1).max(1000).default(100)
Zod: z.object({ dataset_id: z.string(), page: z.number().optional(), per_page: z.number().optional() })
GET https://data.gov.uz/uz/api/v1/json/dataset/{dataset_id}?access_key={key}
(REQUIRES VERIFICATION)

### 3. get_dataset_metadata
Описание: "Получить метаданные датасета (описание, автор, дата обновления, формат)"
Параметры:
  - dataset_id: z.string().describe("ID датасета")
Zod: z.object({ dataset_id: z.string() })
GET https://data.gov.uz/uz/api/v1/json/dataset/{dataset_id}/meta?access_key={key}
(REQUIRES VERIFICATION)

### 4. get_categories
Описание: "Получить список категорий датасетов"
Параметры: нет
Zod: z.object({})
GET https://data.gov.uz/uz/api/v1/json/categories?access_key={key}
(REQUIRES VERIFICATION)

### 5. search_data
Описание: "Полнотекстовый поиск по всем датасетам"
Параметры:
  - query: z.string().min(1).describe("Поисковый запрос (рус/узб)")
  - limit: z.number().int().min(1).max(100).default(20).describe("Максимум результатов")
Zod: z.object({ query: z.string(), limit: z.number().optional() })
GET https://data.gov.uz/uz/api/v1/json/search?q={query}&limit={limit}&access_key={key}
(REQUIRES VERIFICATION)

## Error Handling
- 401/403: "Неверный или истёкший API-ключ"
- 404: "Датасет не найден"
- 500/503: "Портал data.gov.uz недоступен — повторите позже"
- Network error: retry 2 раза через 5 сек (государственные сервисы бывают нестабильны)
- Кэширование: рекомендуется TTL 24 часа для метаданных, 6 часов для данных

## Rate Limits
REQUIRES VERIFICATION. Встроенный лимит: 2 req/sec (щадящий для госсервиса).

## package.json
name: "@theyahia/data-gov-uz-mcp"
description: "MCP server for data.gov.uz — Uzbekistan open government data"
keywords: ["mcp", "uzbekistan", "open-data", "government", "data-gov-uz"]

ПРИМЕЧАНИЕ: Все endpoint URL REQUIRES VERIFICATION.
Перед разработкой:
1. Зарегистрироваться на https://data.egov.uz/eng
2. Получить API Key
3. Протестировать реальные эндпоинты
4. Обновить URL и параметры
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Анонс: @nodejs_uz, @js_uzb, @uzgeeksgroup

### smithery.yaml
```yaml
name: "@theyahia/data-gov-uz-mcp"
description: "data.gov.uz — Uzbekistan open government datasets"
version: "1.0.0"
tools:
  - list_datasets
  - get_dataset
  - get_dataset_metadata
  - get_categories
  - search_data
auth:
  type: api_key
  location: query
  parameter: access_key
env:
  - name: DATA_GOV_UZ_API_KEY
    description: "API key from data.egov.uz"
    required: true
```

---

# Сервер 10: efaktura-mcp

## Описание
MCP-сервер для E-Faktura API (api.faktura.uz) — электронные счета-фактуры, обязательные для всех юрлиц Узбекистана. Авторизация через E-IMZO (электронная цифровая подпись, PKCS#7). Самый сложный сервер из 10.

## Pre-implementation checklist

- [ ] Регистрация: **ДА** — нужен E-IMZO (электронная цифровая подпись)
  - E-IMZO выдаётся в авторизованных центрах: https://e-imzo.uz/
  - Необходимо юрлицо в Узбекистане
  - USB-токен с сертификатом или мобильное приложение
- [ ] Sandbox URL: REQUIRES VERIFICATION — предполагается наличие тестовой среды
- [ ] Тестовые данные: REQUIRES VERIFICATION
- [ ] Документация:
  - REST API: https://api.faktura.uz/help/
  - E-IMZO интеграция: https://github.com/qo0p/e-imzo-doc
  - МХИК классификатор: https://tasnif.soliq.uz/
  - npm-пакеты МХИК: `mxik`, `ikpu-mxik`
- [ ] Known gotchas:
  - **E-IMZO** обязательна — это hardware USB-токен или мобильное приложение с ЭЦП
  - PKCS#7 подписи — нужна библиотека для работы с криптографией
  - Deeplink для мобильного E-IMZO: `eimzo://sign?...`
  - Android SDK: https://github.com/alimovshohrukh/horcrux
  - Для MCP-сервера нужен PFX/P12 файл сертификата или API-ключ E-IMZO
  - МХИК-коды (аналог HS-кодов) обязательны для каждого товара в счёте-фактуре
  - Этот сервер САМЫЙ СЛОЖНЫЙ — криптография + государственная специфика

## Env vars
```bash
EFAKTURA_TIN=           # ИНН (СТИР) организации (9 цифр)
EFAKTURA_PINFL=         # ПИНФЛ подписанта (14 цифр)
EFAKTURA_PFX_PATH=      # Путь к PFX/P12 файлу ЭЦП
EFAKTURA_PFX_PASSWORD=  # Пароль к PFX файлу
EFAKTURA_SANDBOX=true   # Тестовая среда
```

## Claude Code промпт (copy-paste ready)

```
Создай MCP-сервер @theyahia/efaktura-mcp для E-Faktura API (электронные счета-фактуры Узбекистана).

Стек: TypeScript, @modelcontextprotocol/sdk, Zod, tsup.
Дополнительно: node-forge или @peculiar/x509 для PKCS#7 подписей.
Протокол: REST API (JSON) + PKCS#7 подпись.

## Конфигурация

Env vars:
  EFAKTURA_TIN — ИНН (СТИР) организации, 9 цифр (обязательно)
  EFAKTURA_PINFL — ПИНФЛ подписанта, 14 цифр (обязательно для подписи)
  EFAKTURA_PFX_PATH — путь к PFX/P12 файлу ЭЦП (обязательно)
  EFAKTURA_PFX_PASSWORD — пароль к PFX файлу (обязательно)
  EFAKTURA_SANDBOX — "true" для тестовой среды (по умолчанию "true")

Документация: https://api.faktura.uz/help/
E-IMZO docs: https://github.com/qo0p/e-imzo-doc

## Авторизация (auth.ts)

E-IMZO авторизация состоит из двух частей:
1. Аутентификация: получение access token через ИНН + ЭЦП подпись
2. Подпись документов: PKCS#7 detached signature для каждого документа

Реализация:
```typescript
import forge from 'node-forge';

// Загрузка PFX
const pfxData = fs.readFileSync(EFAKTURA_PFX_PATH);
const p12Asn1 = forge.asn1.fromDer(pfxData.toString('binary'));
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, EFAKTURA_PFX_PASSWORD);

// Подписание данных
function signData(data: string): string {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(data, 'utf8');
  p7.addCertificate(certificate);
  p7.addSigner({ ... });
  p7.sign({ detached: true });
  return forge.util.encode64(forge.asn1.toDer(p7.toAsn1()).getBytes());
}
```

REQUIRES VERIFICATION: точный процесс аутентификации из api.faktura.uz/help/

## 7 tools с Zod-схемами

### 1. create_invoice
Описание: "Создать электронную счёт-фактуру (e-faktura)"
Параметры:
  - buyer_tin: z.string().regex(/^\d{9}$/).describe("ИНН (СТИР) покупателя, 9 цифр")
  - contract_number: z.string().describe("Номер контракта")
  - contract_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Дата контракта")
  - items: z.array(z.object({
      name: z.string().describe("Наименование товара/услуги"),
      mxik_code: z.string().regex(/^\d{17}$/).describe("17-значный МХИК-код товара с tasnif.soliq.uz"),
      unit_code: z.string().describe("Код единицы измерения"),
      quantity: z.number().positive(),
      price: z.number().positive().describe("Цена за единицу в сумах"),
      vat_rate: z.number().min(0).max(100).default(12).describe("Ставка НДС (12% стандартная)")
    })).min(1).describe("Товары/услуги в счёте-фактуре")
  - description: z.string().optional()
Zod: z.object({ buyer_tin: z.string(), contract_number: z.string(), contract_date: z.string(), items: z.array(z.object({...})), description: z.string().optional() })
POST https://api.faktura.uz/api/v1/invoice/create  (REQUIRES VERIFICATION)
Тело подписывается E-IMZO перед отправкой.

### 2. get_invoice
Описание: "Получить счёт-фактуру по ID"
Параметры:
  - invoice_id: z.string().describe("ID счёта-фактуры")
Zod: z.object({ invoice_id: z.string() })
GET https://api.faktura.uz/api/v1/invoice/{invoice_id}  (REQUIRES VERIFICATION)

### 3. list_invoices
Описание: "Получить список счетов-фактур (исходящих или входящих)"
Параметры:
  - direction: z.enum(["outgoing", "incoming"]).describe("Направление: исходящие или входящие")
  - status: z.enum(["draft", "sent", "accepted", "rejected", "cancelled"]).optional()
  - from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  - to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  - page: z.number().int().min(1).default(1)
Zod: z.object({ direction: z.string(), status: z.string().optional(), from_date: z.string(), to_date: z.string(), page: z.number().optional() })
GET https://api.faktura.uz/api/v1/invoices  (REQUIRES VERIFICATION)

### 4. sign_invoice
Описание: "Подписать (принять) входящую счёт-фактуру через E-IMZO"
Параметры:
  - invoice_id: z.string().describe("ID входящей счёта-фактуры")
Zod: z.object({ invoice_id: z.string() })
POST https://api.faktura.uz/api/v1/invoice/{invoice_id}/sign  (REQUIRES VERIFICATION)
Подпись через E-IMZO (PKCS#7).

### 5. reject_invoice
Описание: "Отклонить входящую счёт-фактуру"
Параметры:
  - invoice_id: z.string().describe("ID входящей счёта-фактуры")
  - reason: z.string().describe("Причина отклонения")
Zod: z.object({ invoice_id: z.string(), reason: z.string() })
POST https://api.faktura.uz/api/v1/invoice/{invoice_id}/reject  (REQUIRES VERIFICATION)

### 6. cancel_invoice
Описание: "Отменить (аннулировать) исходящую счёт-фактуру"
Параметры:
  - invoice_id: z.string().describe("ID исходящей счёта-фактуры")
  - reason: z.string().describe("Причина аннулирования")
Zod: z.object({ invoice_id: z.string(), reason: z.string() })
POST https://api.faktura.uz/api/v1/invoice/{invoice_id}/cancel  (REQUIRES VERIFICATION)

### 7. lookup_mxik
Описание: "Поиск МХИК-кода товара по наименованию (tasnif.soliq.uz)"
Параметры:
  - query: z.string().min(2).describe("Название товара для поиска МХИК-кода")
  - limit: z.number().int().min(1).max(50).default(10)
Zod: z.object({ query: z.string(), limit: z.number().optional() })
GET https://tasnif.soliq.uz/api/cls-api/search/mxik?keyword={query}&limit={limit}
(REQUIRES VERIFICATION: точный URL из tasnif.soliq.uz API)
Существующие npm-пакеты: `mxik`, `ikpu-mxik` — можно использовать как reference.

## Error Handling
- 401: "ЭЦП истекла или неверный сертификат"
- 403: "Нет доступа — проверьте ИНН и ПИНФЛ"
- 422: "Неверные данные в счёте-фактуре (проверьте МХИК-коды, ИНН покупателя)"
- REQUIRES VERIFICATION: полный список кодов ошибок
- Network error: retry 2 раза через 5 сек
- PFX loading error: "Не удалось загрузить сертификат — проверьте путь и пароль"

## Rate Limits
REQUIRES VERIFICATION. Встроенный лимит: 2 req/sec (государственный сервис).

## Зависимости (дополнительные)
- `node-forge` — для PKCS#7 подписей (альтернатива: `@peculiar/x509`)
- Опционально: `mxik` npm-пакет для lookup_mxik

## package.json
name: "@theyahia/efaktura-mcp"
description: "MCP server for E-Faktura — electronic tax invoices in Uzbekistan"
keywords: ["mcp", "uzbekistan", "efaktura", "tax", "invoice", "e-imzo", "soliq"]

ПРИМЕЧАНИЕ: ЭТО САМЫЙ СЛОЖНЫЙ СЕРВЕР ИЗ 10.
Требует:
1. Юридическое лицо в Узбекистане
2. E-IMZO (ЭЦП) — USB-токен или мобильное приложение
3. PFX-файл сертификата
4. Глубокое изучение api.faktura.uz/help/
5. Тестирование с реальным E-IMZO

Рекомендация: реализовать ПОСЛЕ всех остальных серверов.
Сначала реализовать lookup_mxik (не требует E-IMZO) как отдельный полезный tool.
```

## Post-implementation checklist

- [ ] `npm publish --access public`
- [ ] `npx @anthropic/mcp-publisher publish`
- [ ] Анонс: @nodejs_uz, @js_uzb, @paytechuz
- [ ] Обсудить с бухгалтерскими компаниями в УЗ (целевая аудитория)

### smithery.yaml
```yaml
name: "@theyahia/efaktura-mcp"
description: "E-Faktura — electronic tax invoices for Uzbekistan (E-IMZO required)"
version: "1.0.0"
tools:
  - create_invoice
  - get_invoice
  - list_invoices
  - sign_invoice
  - reject_invoice
  - cancel_invoice
  - lookup_mxik
auth:
  type: custom
  description: "E-IMZO digital signature (PKCS#7) via PFX certificate"
env:
  - name: EFAKTURA_TIN
    description: "Organization TIN (STIR), 9 digits"
    required: true
  - name: EFAKTURA_PINFL
    description: "Signer PINFL, 14 digits"
    required: true
  - name: EFAKTURA_PFX_PATH
    description: "Path to PFX/P12 certificate file"
    required: true
  - name: EFAKTURA_PFX_PASSWORD
    description: "PFX certificate password"
    required: true
  - name: EFAKTURA_SANDBOX
    description: "Use sandbox (default: true)"
    required: false
    default: "true"
```

---

# Сводная таблица

| # | Сервер | Tools | Дней | Auth | Sandbox | REQUIRES VERIFICATION |
|---|--------|-------|------|------|---------|----------------------|
| 1 | cbu-mcp | 5 | 1 | Нет | Не нужен | Нет |
| 2 | payme-mcp | 10 | 4 | X-Auth header | checkout.test.paycom.uz | Нет |
| 3 | click-mcp | 8 | 4 | SHA1 digest | Эмулятор | Нет |
| 4 | eskiz-mcp | 6 | 2 | JWT Bearer | Нет | TTL токена |
| 5 | uzum-merchant-mcp | 7 | 3 | HTTP Basic | Вероятно есть | Все URL |
| 6 | uzum-market-mcp | 8 | 5 | Token | Нет | 5 из 8 tools |
| 7 | oson-mcp | 6 | 3 | Secret Key | Вероятно есть | Все URL |
| 8 | playmobile-mcp | 5 | 2 | HTTP Basic | Нет | 3 из 5 tools |
| 9 | data-gov-uz-mcp | 5 | 2 | API Key (query) | Не нужен | Все URL |
| 10 | efaktura-mcp | 7 | 5 | E-IMZO (PKCS#7) | Вероятно есть | Все URL |
| | **ИТОГО** | **67 tools** | **~31 день** | | | |

---

# Порядок запуска и зависимости

```
Неделя 1: cbu-mcp (1 день) → payme-mcp (4 дня)
  └ Анонс CBU в @nodejs_uz для первого adoption

Неделя 2: click-mcp (4 дня) + eskiz-mcp (2 дня, параллельно после click)
  └ Связаться с @muhammadali_me (PayTechUZ) для кросс-промо

Неделя 3: uzum-merchant-mcp (3 дня) + playmobile-mcp (2 дня, параллельно)
  └ Зарегистрироваться на developer.uzumbank.uz заранее (неделя 2)

Неделя 4: uzum-market-mcp (5 дней)
  └ Зарегистрироваться на seller.uzum.uz заранее (неделя 3)

Неделя 5: oson-mcp (3 дня) + data-gov-uz-mcp (2 дня)
  └ Получить credentials от Oson и data.egov.uz заранее

Неделя 6+: efaktura-mcp (5 дней)
  └ Требует E-IMZO — начать процесс получения ЭЦП на неделе 3-4
```

---

# Каналы анонса в Telegram

| Канал | Аудитория | Для каких серверов |
|-------|-----------|-------------------|
| @nodejs_uz | Node.js разработчики УЗ | Все |
| @js_uzb | JavaScript УЗ | Все |
| @typescript_uzb | TypeScript УЗ | Все |
| @paytechuz | Платёжные интеграции | payme, click, uzum, oson |
| @uzgeeksgroup | Общие IT УЗ | cbu, data-gov-uz, efaktura |
| @uzdevgroup | Разработчики УЗ | Все |
| @tasdev | Ташкент разработчики | Все |
| @nestjs_uz | NestJS УЗ | Серверные (payme, click) |
| @bunjs_uz | Bun.js УЗ | Все (бенчмарки) |
| @mlc_uz | ML/AI УЗ | MCP-специфичные анонсы |
| @djangouzb | Django/Python УЗ | Кросс-промо с PayTechUZ |

Полный список: https://github.com/doniyor2109/awesome-telegram-dev-groups-uz (60+ групп)

---

# Коллаборация с PayTechUZ

**Контакт:** @muhammadali_me (Telegram), paytechuz@gmail.com
**Группа:** @paytechuz

**Предложение:**
```
Привет, Muhammadali!

Я делаю серию MCP-серверов для узбекских API (@theyahia scope на npm):
- payme-mcp, click-mcp, uzum-merchant-mcp — аналоги PayTechUZ, но для AI-агентов (Claude, Cursor, GPT).
- Также eskiz-mcp, cbu-mcp, efaktura-mcp.

Хочу предложить кросс-промо:
- Я ссылаюсь на PayTechUZ в README как рекомендацию для Python-разработчиков
- Ты ссылаешься на @theyahia MCP-серверы для Node.js/AI-пользователей

Не конкурируем — дополняем (Python SDK vs. MCP/Node.js).
Также буду рад обратной связи по нюансам API (особенно Uzum и Paynet).
```

---

# IT Park Uzbekistan (для масштабирования)

- 0% налогов на IT + 7.5% НДФЛ (вместо 12%)
- Регистрация удалённая, 15 рабочих дней
- 100% иностранное владение разрешено
- Стоит 1% от дохода
- Гарантировано до 2040 года
- Рассмотреть после достижения $1000+/мес дохода от MCP-серверов
