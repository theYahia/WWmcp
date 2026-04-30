# План имплементации: @theyahia/yookassa-mcp

**Дата:** 2026-03-30
**Статус:** В разработке
**Скоринг:** Σ=64 (первое место)
**Конкуренты:** Нет MCP-серверов для ЮKassa — мы первые

---

## 1. Исследование API

- [x] Документация: https://yookassa.ru/developers/api
- [x] **Base URL: `https://api.yookassa.ru/v3/`** (НЕ v2 как в мастер-плане!)
- [x] Авторизация: HTTP Basic Auth (shop_id : secret_key)
- [x] Idempotence-Key: обязательный заголовок для всех POST/DELETE, UUID v4, макс 64 символа, окно 24ч
- [x] Rate limits: не задокументированы публично, при 429 — exponential backoff
- [x] Sandbox: тот же endpoint, тестовый shop_id из демо-магазина (до 20 демо-магазинов)
- [x] Тестовые карты: Mastercard 5555555555554477 (3DS), Visa 4111111111111111
- [x] OpenAPI спецификация доступна в YAML
- [x] Конкуренты: **нет** MCP-серверов для ЮKassa

---

## 2. Проектирование tools (10 штук)

### Payments (5 tools)

| # | Tool | Method | Endpoint | Params |
|---|------|--------|----------|--------|
| 1 | `create_payment` | POST | `/payments` | amount (number), currency (string, default "RUB"), description (string, max 128), capture (bool, default true), return_url (string url, optional), payment_method_type (enum, optional) |
| 2 | `get_payment` | GET | `/payments/{id}` | payment_id (string) |
| 3 | `capture_payment` | POST | `/payments/{id}/capture` | payment_id (string), amount (number, optional — для частичного capture) |
| 4 | `cancel_payment` | POST | `/payments/{id}/cancel` | payment_id (string) |
| 5 | `list_payments` | GET | `/payments` | limit (int 1-100, default 10), status (enum, optional), created_at_gte (ISO datetime, optional), created_at_lte (ISO datetime, optional) |

### Refunds (3 tools)

| # | Tool | Method | Endpoint | Params |
|---|------|--------|----------|--------|
| 6 | `create_refund` | POST | `/refunds` | payment_id (string), amount (number), description (string, optional) |
| 7 | `get_refund` | GET | `/refunds/{id}` | refund_id (string) |
| 8 | `list_refunds` | GET | `/refunds` | payment_id (string, optional), limit (int 1-100, default 10) |

### Receipts (1 tool)

| # | Tool | Method | Endpoint | Params |
|---|------|--------|----------|--------|
| 9 | `create_receipt` | POST | `/receipts` | type (enum "payment"/"refund"), payment_id (string), customer.email (string), items[] (description, quantity, amount, vat_code 1-6) |

### Account (1 tool)

| # | Tool | Method | Endpoint | Params |
|---|------|--------|----------|--------|
| 10 | `get_balance` | GET | `/me` | нет |

### Важные детали API

**Формат amount в запросах ЮKassa:**
```json
"amount": { "value": "100.00", "currency": "RUB" }
```
Сумма передаётся как **строка с двумя знаками после запятой**, не число!
В нашем tool пользователь передаёт число (например 100), мы конвертируем в `"100.00"`.

**payment_method_type возможные значения:**
`bank_card`, `sbp`, `yoo_money`, `sberbank`, `tinkoff_bank`, `mobile_balance`, `cash`, `installments`

**Статусы платежа:**
`pending` → `waiting_for_capture` → `succeeded` (или `canceled` на любом этапе)

**Ошибки ЮKassa — формат:**
```json
{ "type": "error", "id": "...", "code": "...", "description": "...", "parameter": "..." }
```

**HTTP коды:**
- 200 = OK
- 400 = неверный запрос (показать parameter + description)
- 401 = неверные credentials (подсказать проверить YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY)
- 403 = нет прав
- 404 = не найдено
- 429 = rate limit (retry с backoff)
- 500 = неопределённый результат (ОБЯЗАТЕЛЬНО проверить GET-запросом)

---

## 3. Проектирование skills (4 штуки)

| Skill | Команда | Описание | Tools |
|-------|---------|----------|-------|
| `create-and-track` | `/create-and-track 5000 "Заказ #123"` | Создать платёж и показать ссылку для оплаты | create_payment → get_payment |
| `refund-payment` | `/refund-payment pay_xxx 2500` | Частичный или полный возврат с проверкой | get_payment → create_refund → get_refund |
| `daily-report` | `/daily-report` | Отчёт за сегодня: все платежи, суммы, статусы | list_payments → агрегация |
| `check-account` | `/check-account` | Статус магазина, тест/продакшн, фискализация | get_balance |

---

## 4. Структура файлов

```
yookassa-mcp/
├── .claude/
│   └── skills/
│       ├── create-and-track/SKILL.md
│       ├── refund-payment/SKILL.md
│       ├── daily-report/SKILL.md
│       └── check-account/SKILL.md
├── .mcp.json
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          — регистрация сервера и всех tools
    ├── client.ts         — YooKassaClient class (Basic Auth, idempotency, retry)
    ├── types.ts          — Payment, Refund, Receipt, Error интерфейсы
    └── tools/
        ├── payments.ts   — tools 1-5 (create, get, capture, cancel, list)
        ├── refunds.ts    — tools 6-8 (create, get, list)
        ├── receipts.ts   — tool 9 (create)
        └── balance.ts    — tool 10 (get)
```

---

## 5. Порядок имплементации

### 5.1 Инфраструктура
- [ ] Создать GitHub репо `theYahia/yookassa-mcp`
- [ ] package.json (name, bin, mcpName, keywords)
- [ ] tsconfig.json (скопировать из cbr-mcp)
- [ ] .gitignore, LICENSE, .mcp.json

### 5.2 HTTP-клиент (client.ts)
- [ ] YooKassaClient class
- [ ] Конструктор: проверка YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY
- [ ] Метод `get(path)` — GET с Basic Auth
- [ ] Метод `post(path, body)` — POST с Basic Auth + Idempotence-Key (crypto.randomUUID())
- [ ] Таймаут 10 секунд
- [ ] Retry 3 попытки с exponential backoff на 429 и 5xx
- [ ] При 500 — логировать что результат неопределён
- [ ] Парсинг ошибок ЮKassa → читаемые сообщения на русском
- [ ] При 401 — подсказка «Проверьте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY»

### 5.3 Типы (types.ts)
- [ ] Payment interface (id, status, paid, amount, confirmation, payment_method, created_at, description, metadata, recipient)
- [ ] Refund interface (id, status, amount, payment_id, created_at, description)
- [ ] Receipt interface (id, type, status, payment_id, items, customer)
- [ ] ReceiptItem interface (description, quantity, amount, vat_code)
- [ ] Amount interface ({ value: string, currency: string })
- [ ] YooKassaError interface (type, id, code, description, parameter)
- [ ] AccountInfo interface (account_id, status, test, fiscalization_enabled)

### 5.4 Tools — Payments (payments.ts)
- [ ] create_payment — конвертация amount number → string "100.00", сборка body
- [ ] get_payment — простой GET
- [ ] capture_payment — POST с опциональным amount
- [ ] cancel_payment — POST без body
- [ ] list_payments — GET с query params (limit, status, created_at фильтры)

### 5.5 Tools — Refunds (refunds.ts)
- [ ] create_refund — POST с payment_id и amount
- [ ] get_refund — GET
- [ ] list_refunds — GET с query params

### 5.6 Tools — Receipts (receipts.ts)
- [ ] create_receipt — POST с type, payment_id, customer, items[]
- [ ] Конвертация amount в каждом item: number → string "100.00"
- [ ] vat_code: 1=без НДС, 2=0%, 3=10%, 4=20%, 5=расчётная 10/110, 6=расчётная 20/120

### 5.7 Tools — Balance (balance.ts)
- [ ] get_balance — GET /me

### 5.8 Регистрация (index.ts)
- [ ] Импорт всех tools
- [ ] server.tool() для каждого из 10 tools
- [ ] Описания на русском языке
- [ ] StdioServerTransport

### 5.9 Skills
- [ ] create-and-track/SKILL.md
- [ ] refund-payment/SKILL.md
- [ ] daily-report/SKILL.md
- [ ] check-account/SKILL.md

### 5.10 README.md
- [ ] Описание + бейджи
- [ ] Сравнение (у ЮKassa нет MCP — мы первые)
- [ ] Установка: Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
- [ ] Таблица 10 tools
- [ ] Раздел «Синергия с dadata-mcp»
- [ ] Примеры запросов (5+)
- [ ] Раздел серии
- [ ] Ссылка на партнёрку (после открытия расчётного счёта)

---

## 6. Тестирование

- [ ] `npm run build` — чистая сборка без ошибок
- [ ] MCP Inspector: `YOOKASSA_SHOP_ID=test YOOKASSA_SECRET_KEY=test npx @modelcontextprotocol/inspector node dist/index.js`
- [ ] Тест get_balance — проверить что коннект работает
- [ ] Тест create_payment — тестовая карта 5555555555554477
- [ ] Тест обработки ошибок: неверный shop_id, несуществующий payment_id
- [ ] Тест list_payments с фильтрами

---

## 7. Публикация

- [ ] `npm run build && npm publish --access public`
- [ ] `git push origin main`
- [ ] Площадки по чеклисту из мастер-плана (Шаги 2-5)
- [ ] Обновить витрину russian-mcp: 📅 → ✅
- [ ] Обновить PLATFORM_TRACKER.md
- [ ] Пост в Telegram (опционально)

---

## Риски и нюансы

1. **amount как строка** — ЮKassa принимает `"100.00"` не `100`. Забудешь конвертировать — получишь 400.
2. **Idempotence-Key** — без него POST вернёт ошибку. Генерировать crypto.randomUUID() автоматически.
3. **HTTP 500** — результат неопределён! Нужно логировать и подсказывать пользователю проверить GET-запросом.
4. **Sandbox vs Production** — один и тот же endpoint, разные credentials. Добавить в README инструкцию по получению тестовых ключей.
5. **54-ФЗ чеки** — vat_code обязателен, пользователь может не знать коды. Добавить описания в Zod schema.
