# План имплементации: MCP-серверы для Узбекистана

**Источник:** RESEARCH_04_UZBEKISTAN.md
**Статус рынка:** 0 MCP-серверов, npm-экосистема критически недоразвита
**Язык README:** русский (основной) + узбекский (желательно)
**npm scope:** `@theyahia/{service}-mcp` (единый бренд)
**Потенциальный партнёр:** PayTechUZ (unified payment library)

---

## Приоритизация: 10 серверов в порядке реализации

| # | Сервер | API | Авторизация | Сложность | Дней | Почему сейчас |
|---|--------|-----|-------------|-----------|------|---------------|
| 1 | `cbu-mcp` | ЦБ Узбекистана курсы | Без авторизации | Легко | 1 | Quick win, JSON API готов |
| 2 | `payme-mcp` | Payme Subscribe API | HTTP Basic / X-Auth | Средне | 4 | Главная платёжная система УЗ |
| 3 | `click-mcp` | Click Merchant API | SHA1 digest | Средне | 4 | REST API, двуязычная документация |
| 4 | `eskiz-mcp` | Eskiz.uz SMS | JWT Bearer | Легко | 2 | Доминирующий SMS-провайдер, критический пробел в npm |
| 5 | `uzum-merchant-mcp` | Uzum Bank Merchant | HTTP Basic | Средне | 3 | Самый современный developer portal |
| 6 | `uzum-market-mcp` | Uzum Market Seller | Token | Сложно | 5 | 15K+ продавцов, 10M+ пользователей |
| 7 | `oson-mcp` | Oson Kassa/InterHub | Secret Key | Средне | 3 | Полная документация, тестовые карты |
| 8 | `playmobile-mcp` | Playmobile SMS | HTTP Basic | Легко | 2 | Enterprise SMS, все операторы |
| 9 | `data-gov-uz-mcp` | data.gov.uz | API Key | Легко | 2 | Открытые данные |
| 10 | `efaktura-mcp` | E-Faktura (Soliq) | E-IMZO | Сложно | 5 | Обязательные электронные счета-фактуры |

**Итого: ~31 день на 10 серверов**

---

## Фаза 1: Quick Win — ЦБУ (1 день)

```
Создай MCP-сервер @theyahia/cbu-mcp для API Центрального Банка Узбекистана.

Авторизация НЕ нужна — полностью открытый JSON API.

Endpoints:
- GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/ — все валюты
- GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/ — конкретная валюта
- GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/all/2025-01-15/ — по дате
- GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/2025-01-15/ — комбинированный

5 tools:
1. get_all_rates — все ~30 валют на сегодня
2. get_currency_rate — курс конкретной валюты
3. get_historical_rates — курсы на дату
4. convert_currency — конвертация через сум (UZS)
5. get_rate_dynamics — динамика за период

Особенность: 1 USD ≈ 12 192 UZS — большие числа, показывать с разделителями.
```

---

## Фаза 2: Payme (4 дня)

```
Создай MCP-сервер @theyahia/payme-mcp для Payme Subscribe API.

Документация: https://developer.help.paycom.uz/
Протокол Subscribe API: HTTPS POST JSON-RPC 2.0
Sandbox: https://checkout.test.paycom.uz/api
Prod: https://checkout.paycom.uz/api
Авторизация: X-Auth header (cashbox_id:password)
Env: PAYME_CASHBOX_ID, PAYME_KEY

10 tools:
1. cards_create — привязка карты (номер + срок)
2. cards_verify — верификация через SMS-код
3. cards_check — проверка токена карты
4. cards_remove — удаление карты
5. receipts_create — создание чека (amount в тийинах!)
6. receipts_pay — оплата чека
7. receipts_send — отправка чека
8. receipts_cancel — отмена
9. receipts_check — статус чека
10. receipts_get_all — список чеков

ВАЖНО: суммы в ТИЙИНАХ (1 сум = 100 тийинов). В ответах показывать в сумах.

Тестовые карты: 8600-серия, срок 03/99, SMS-код 666666.
```

---

## Фаза 3: Click (4 дня)

```
Создай MCP-сервер @theyahia/click-mcp для Click Merchant API.

Документация: https://docs.click.uz/en/
Base URL: https://api.click.uz/v2/merchant/
Авторизация: Header Auth: merchant_user_id:digest:timestamp
  digest = SHA1(timestamp + secret_key)
Env: CLICK_SERVICE_ID, CLICK_MERCHANT_USER_ID, CLICK_SECRET_KEY

8 tools:
1. create_invoice — POST /invoice/create
2. get_invoice_status — GET /invoice/status/:service_id/:invoice_id
3. get_payment_status — GET /payment/status/:service_id/:payment_id
4. refund_payment — DELETE /payment/reversal/:service_id/:payment_id
5. request_card_token — POST /card_token/request
6. verify_card_token — POST /card_token/verify
7. pay_with_token — POST /card_token/payment
8. click_pass_payment — POST /click_pass/payment

Суммы в сумах (целые числа, без дробей).
```

---

## Фаза 4: Eskiz SMS (2 дня)

```
Создай MCP-сервер @theyahia/eskiz-mcp для Eskiz.uz SMS API.

Документация: https://documenter.getpostman.com/view/663428/TVK5eMco
Base URL: https://notify.eskiz.uz/api/
Авторизация: JWT Bearer Token (POST /auth/login с email+password)
Env: ESKIZ_EMAIL, ESKIZ_PASSWORD

6 tools:
1. send_sms — POST /message/sms/send (один SMS)
2. send_batch — POST /message/sms/send-batch (массовая отправка)
3. get_status — GET /message/sms/status_by_id/{id}
4. get_balance — GET /auth/user (баланс и инфо)
5. get_limits — GET /auth/user/limit (limit, used, remaining)
6. refresh_token — PATCH /auth/refresh

1 SMS = 160 лат. или 70 кириллических символов.
Стоимость: 95 сум/SMS (информационные), 175 сум/SMS (рекламные).
```

---

## Коллаборация с PayTechUZ

**PayTechUZ** — unified payment library для Payme+Click+Uzum+Paynet.
- Найти GitHub: github.com/PayTechUz
- Связаться с автором через Telegram-сообщество
- Предложить: "Мы делаем MCP-серверы для узбекских API, можем использовать PayTechUZ как основу или кросс-ссылаться"
- **Не конкурировать, а дополнять**: PayTechUZ = SDK для кода, наши MCP = AI-интерфейс

---

## Телеграм-каналы для продвижения в УЗ

> Исследование не дало конкретных @username — нужно найти через TGStat.

Искать по ключевым словам:
- "IT Uzbekistan", "Developers UZ", "Node.js Uzbekistan"
- "Payme developers", "Click developers"
- PayTechUZ Telegram-сообщество

---

## Особенности рынка

1. **Суммы в тийинах** (Payme) или сумах (Click) — разные API по-разному
2. **Узбекские карты без CVV** — вместо 3DS используется OTP
3. **E-IMZO** (ЭЦП) нужна для госсервисов — высокий порог входа
4. **С 1 апреля 2026** обязательный безнал свыше 25M сум — рост спроса на платёжные API
5. **IT Park** — 0% налог для резидентов, стоит рассмотреть регистрацию
