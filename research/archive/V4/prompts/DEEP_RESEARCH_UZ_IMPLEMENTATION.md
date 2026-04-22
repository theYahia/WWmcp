# Deep Research — Полная техническая имплементация MCP-серверов для Узбекистана

## Контекст

Я — @theyahia (npm org). У меня 47 MCP-серверов для российских API. Расширяюсь на Узбекистан — **ноль MCP-серверов** для узбекских API в мире. У меня уже есть:

1. **Исследование рынка УЗ** (RESEARCH_04) — Payme (JSON-RPC 2.0, полный sandbox), Click (REST, 12 GitHub-репо), Uzum Bank (самый современный dev portal), Eskiz.uz (SMS, критический пробел в npm), ЦБУ (JSON API без авторизации)
2. **Базовый план** (IMPLEMENTATION_PLAN_UZ.md) — 10 серверов
3. **Детальный план** (DETAILED_IMPLEMENTATION_UZ.md) — endpoints, auth, тестовые карты

**Особенности Узбекистана:**
- Суммы в **тийинах** для Payme (1 сум = 100 тийинов), но в **сумах** для Click
- Узбекские карты **без CVV** — вместо 3DS используется **OTP** от платёжной системы
- **E-IMZO** (ЭЦП) нужна для госсервисов
- С **1 апреля 2026** обязательный безнал для покупок свыше 25 млн сум
- Курс: 1 USD ≈ 12 192 UZS (большие числа)

---

## Что нужно для каждого из 10 серверов

### Сервер 1: cbu-mcp (Центральный Банк Узбекистана)

Исследуй:
- JSON endpoints:
  - `https://cbu.uz/ru/arkhiv-kursov-valyut/json/` — все валюты
  - `https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/` — конкретная валюта
  - `https://cbu.uz/ru/arkhiv-kursov-valyut/json/all/2025-01-15/` — по дате
  - `https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/2025-01-15/` — комбинированный
- Точный формат JSON-ответа: какие поля? (code, ccy, rate, diff, date?)
- Сколько валют (~30?) — полный список
- XML endpoints — формат
- Документация для вебмастеров: `https://cbu.uz/en/arkhiv-kursov-valyut/veb-masteram/`
- Есть ли API для ключевой ставки ЦБУ?
- Есть ли API для инфляции, денежной массы?

### Сервер 2: payme-mcp (Payme Subscribe API)

Это **самый важный** сервер для УЗ. Исследуй МАКСИМАЛЬНО подробно:

**Subscribe API (мерчант → Payme):**
- Endpoint тест: `https://checkout.test.paycom.uz/api`
- Endpoint прод: `https://checkout.paycom.uz/api`
- Авторизация: `X-Auth: {cashbox_id}:{password}`
- JSON-RPC 2.0 — формат запроса/ответа

**Методы карт:**
- `cards.create` — параметры: number, expire (MMYY). Что возвращает? token?
- `cards.verify` — параметры: token, code (SMS). Формат?
- `cards.check` — параметры: token. Что возвращает?
- `cards.remove` — параметры: token
- Какие ещё методы?

**Методы чеков (receipts):**
- `receipts.create` — параметры: amount (В ТИЙИНАХ!), account (object). Какие поля account?
- `receipts.pay` — параметры: id, token. Поддержка холдирования через `"hold": true`?
- `receipts.send` — параметры: id, phone. Что делает?
- `receipts.cancel` — параметры: id, reason
- `receipts.check` — параметры: id
- `receipts.get_all` — параметры: from, to, offset, limit

**Merchant API (Payme → мерчант) — нужен ли для MCP?**
- CheckPerformTransaction, CreateTransaction, PerformTransaction, CancelTransaction
- Это callback-протокол — Payme шлёт запросы на сервер мерчанта
- Для MCP вероятно НЕ нужен (MCP не может быть HTTP-сервером для callbacks)

**Sandbox:**
- Тестовый кабинет: `https://merchant.test.paycom.uz` (логин=телефон, пароль=qwerty, SMS=666666)
- 7 тестовых карт (8600-серия, срок 03/99):
  - Найти ВСЕ 7 номеров карт и описание каждого сценария
  - Успешная оплата, недостаточно средств, ошибка системы, задержка 10 сек, etc.

**Ошибки:**
- Коды ошибок Payme — полный список
- Формат ошибки JSON-RPC

**SDK на GitHub (PaycomUZ):**
- Какие репозитории? PHP, Java, Kotlin, WooCommerce, OpenCart?
- Python `payme-pkg` (107 stars) — что реализует?
- Node.js от samarbadriddin0v (15 stars) — что реализует? Можно использовать как референс?
- Go-клиент (19 stars)

### Сервер 3: click-mcp (Click Merchant API)

Исследуй:
- Документация: `https://docs.click.uz/en/`

**Merchant API (REST):**
- Base URL: `https://api.click.uz/v2/merchant/`
- Auth: `Auth: merchant_user_id:digest:timestamp`, digest = `SHA1(timestamp + secret_key)`
- Точный алгоритм подписи — пример с конкретными значениями

**Endpoints:**
- `POST /invoice/create` — все параметры (service_id, amount, phone_number, merchant_trans_id)
- `GET /invoice/status/:service_id/:invoice_id` — формат ответа
- `GET /payment/status/:service_id/:payment_id` — формат ответа
- `DELETE /payment/reversal/:service_id/:payment_id` — параметры
- `POST /card_token/request` — привязка карты
- `POST /card_token/verify` — верификация OTP (НЕ CVV!)
- `POST /card_token/payment` — оплата по токену
- `POST /click_pass/payment` — Click Pass оплата

**Суммы в СУМАХ** (не тийинах, в отличие от Payme!)

**Sandbox/эмулятор:**
- Отдельного URL нет — эмулятор для локального тестирования
- Документация: `https://docs.click.uz/en/click-api-testing/`
- Как настроить?

**GitHub (click-llc):**
- 12 репозиториев — проверить каждый: PHP, Django, Android SDK, плагины
- Какой из них можно использовать как референс для Node.js?

### Сервер 4: eskiz-mcp (Eskiz.uz SMS)

Исследуй:
- Base URL: `https://notify.eskiz.uz/api/`
- Документация: `https://documenter.getpostman.com/view/663428/TVK5eMco`

**Auth:** JWT Bearer Token
- `POST /auth/login` — body: email + password. Формат ответа (token, expire)?
- `PATCH /auth/refresh` — как обновить токен?

**Endpoints:**
- `POST /message/sms/send` — параметры: mobile_phone, message, from, callback_url
- `POST /message/sms/send-batch` — формат batch (массив?)
- `GET /message/sms/status_by_id/{id}` — статусы (delivered, not_delivered, etc.)
- `GET /auth/user` — баланс и инфо
- `GET /auth/user/limit` — limit, used, remaining

**Стоимость:**
- 95 сум/SMS (информационные)
- 175 сум/SMS (рекламные, только Ucell/Mobiuz/Uzmobile)
- 1 SMS = 160 латинских или 70 кириллических символов

**npm-пакет `azizdev-eskiz-uz`** — единственный на npm. Что реализует? Можно использовать?
**Python `eskiz-pkg`** — что реализует?

**Регистрация:** только юрлица. Как получить аккаунт для тестирования?

### Сервер 5: uzum-merchant-mcp (Uzum Bank)

Исследуй:
- Developer Portal: `https://developer.uzumbank.uz/en/`
- HTTP Basic Auth — credentials откуда?
- API Products: Checkout, Merchant API, FastPay, Dynamic QR, CrossBorder, Fiscalization

**Merchant API endpoints:**
- Webhook endpoints: `/check`, `/create`, `/confirm`, `/reverse`, `/status` — кто куда шлёт?
- Таймаут транзакции: 30 минут — подтвердить
- Поддерживает: Uzum, HUMO, UzCard, Visa, MasterCard

**Postman:** `https://www.postman.com/programmsoft/uzum-merchant/overview` — что внутри?
**PyPI:** `uzum-payments` — что реализует?

### Сервер 6: uzum-market-mcp (Uzum Market Seller)

Исследуй:
- Swagger: `https://api-seller.uzum.uz/api/seller-openapi/swagger/swagger-ui/` — доступен ли без авторизации?
- 15 000+ продавцов, 10M+ пользователей
- Какие endpoints есть? Товары, заказы, цены, остатки?
- Auth — как получить токен?
- Неофициальные endpoints: `github.com/spireuz/uzum-statistics` — что там?

### Сервер 7: oson-mcp (Oson)

Исследуй:
- Документация: `https://docs.oson.com/`
- Kassa API (invoice-модель) — endpoints
- InterHub Merchant API (check/pay/check_status) — endpoints
- Auth: secret key
- Тестовые карты — какие?
- Поддерживает: OSON-кошелёк, UzCard, HUMO

### Сервер 8: playmobile-mcp (Playmobile SMS)

Исследуй:
- API wiki: `https://wiki.playmobile.uz/`
- PDF docs: `https://playmobile.uz/wp-content/uploads/2022/08/http.pdf`
- Endpoint: `POST /send` — параметры
- HTTP Basic Auth
- SMPP поддержка — нужна ли для MCP?
- Покрытие: Beeline, Ucell, Mobiuz, UMS, Uzmobile, Perfectum

### Сервер 9: data-gov-uz-mcp (Открытые данные)

Исследуй:
- API: `https://data.gov.uz/uz/api/v1/json/dataset?access_key=`
- Как получить access_key?
- Какие датасеты доступны? ТОП-10 самых полезных
- Формат ответа

### Сервер 10: efaktura-mcp (E-Faktura)

Исследуй:
- API: `https://api.faktura.uz/help/`
- E-IMZO авторизация — как это работает для MCP?
- Возможно ли вообще сделать MCP с E-IMZO? (нужна ЭЦП = hardware token)
- Если невозможно — какую альтернативу предложить?
- Tasnif (МХИК классификация): npm-пакеты `mxik`, `ikpu-mxik` — что делают?

---

## Дополнительно

### PayTechUZ — коллаборация
- GitHub: github.com/PayTechUz — точный URL, репозитории
- Telegram-сообщество — найти ссылку
- Что реализовано: Payme, Click, Uzum, Paynet — на каких языках?
- Стоит ли использовать как зависимость или как референс?
- Как подойти к автору: "Мы делаем MCP-серверы, можем кросс-ссылаться"

### HUMO и UzCard
- Нет прямого API — доступ через шлюзы (PaySys, Click, Payme, Uzum)
- PaySys: `https://docs.paysys.uz/en/host-to-host/paysys-gateway/` — JSON-RPC API
- Стоит ли делать отдельный MCP для PaySys?

### E-IMZO (ЭЦП)
- GitHub: `https://github.com/qo0p/e-imzo-doc`
- REST API с frontend/backend endpoints
- Android SDK: `github.com/alimovshohrukh/horcrux`
- Реально ли интегрировать в MCP или это client-side only?

---

## Формат ответа

Для каждого из 10 серверов:

1. **Полная API спецификация** — все endpoints, параметры, формат ответа
2. **Auth** — точный механизм, где получить credentials
3. **Sandbox** — URL, тестовые credentials, тестовые карты (с номерами!)
4. **Суммы** — в чём (тийинах/сумах), как конвертировать
5. **Готовый Claude Code промпт** — copy-paste, все Zod-схемы, все tools
6. **Gotchas** — OTP вместо CVV, большие числа UZS, E-IMZO ограничения
7. **Трудозатраты** — часы

Отдельная секция: **PayTechUZ коллаборация** — конкретный план подхода.

Не давай абстрактных оценок. Конкретные URL, конкретные номера тестовых карт, конкретный код.
