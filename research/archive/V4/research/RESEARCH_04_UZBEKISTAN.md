# Рынок MCP-серверов Узбекистана: полное техническое исследование

**Ключевой вывод: рынок MCP-серверов для узбекских API полностью свободен.** Из 19 196+ серверов на mcp.so — ноль для Узбекистана. На smithery.ai — аналогично ноль. npm-экосистема для узбекских API критически недоразвита: существующие пакеты устарели на 4+ года с нулевым adoption. При этом рынок цифровых платежей растёт на **31% CAGR** и достигнет $28,76 млрд к 2029 году, **68,2 млн банковских карт** уже в обращении, а с 1 апреля 2026 вступает обязательный безналичный расчёт для покупок свыше 25 млн сум. Это создаёт уникальное окно первого входа для @theyahia.

---

## Блок 1: платёжные системы — техническая карта

### Payme (paycom.uz) — главная платёжная система

**Документация:** https://developer.help.paycom.uz/ (Docusaurus, только на русском)

**Протокол:** JSON-RPC 2.0 через HTTPS (POST). Архитектурная особенность: в Merchant API **Payme отправляет запросы на сервер мерчанта**, а не наоборот. Мерчант реализует обработчик входящих вызовов.

**Методы Merchant API** (мерчант принимает от Payme):

| Метод | Назначение |
|---|---|
| `CheckPerformTransaction` | Проверка возможности создания транзакции |
| `CreateTransaction` | Создание финансовой транзакции |
| `PerformTransaction` | Проведение транзакции |
| `CancelTransaction` | Отмена/возврат |
| `CheckTransaction` | Проверка состояния |
| `GetStatement` | Выписка по транзакциям |
| `SetFiscalData` | Фискальные данные |

**Subscribe API** (рекуррентные платежи) — **существует**. Здесь уже мерчант отправляет запросы к Payme. Endpoint тест: `https://checkout.test.paycom.uz/api`, продакшн: `https://checkout.paycom.uz/api`. Методы: `cards.create`, `cards.verify`, `cards.check`, `cards.remove`, `receipts.create`, `receipts.pay`, `receipts.send`, `receipts.cancel`, `receipts.check`. Поддержка холдирования через флаг `"hold": true`.

**Авторизация Merchant API:** HTTP Basic Auth — `Authorization: Basic {base64("Paycom:" + KEY)}`. Логин всегда `Paycom`, пароль — ключ из кабинета. Subscribe API: заголовок `X-Auth: {cashbox_id}:{password}`.

**Sandbox:** Полноценная тестовая среда по адресу `https://test.paycom.uz`. Тестовый кабинет: `https://merchant.test.paycom.uz` (логин — телефон, пароль `qwerty`, SMS-код `666666`). Предоставляются **7 тестовых карт** (8600-серия, срок 03/99) для разных сценариев — от успешной оплаты до системной ошибки и задержки 10 секунд.

**Rate limits:** не документированы.

**SDK на GitHub** (организация PaycomUZ — https://github.com/PaycomUZ): официальные шаблоны для PHP, Java/Kotlin, плагины для WooCommerce (16★), OpenCart (11★), Magento, 1C-Битрикс, ModX. Сообщество: `payme-pkg` на Python (107★, PyPI), Node.js-пример от samarbadriddin0v (15★), Go-клиент (19★).

### Click (click.uz) — вторая по величине

**Документация:** https://docs.click.uz/ (RU) и https://docs.click.uz/en/ (EN) — двуязычная, в отличие от Payme.

**Две модели интеграции:**

**Shop API (CLICK-API)** — callback-протокол. CLICK отправляет POST-запросы на сервер мерчанта в две стадии: Prepare (action=0) и Complete (action=1). Мерчант указывает два URL в `merchant.click.uz`.

**Merchant API (CLICK-API-MERCHANT)** — REST API, мерчант как активная сторона. Base URL: `https://api.click.uz/v2/merchant/`.

| Действие | Метод | Endpoint |
|---|---|---|
| Создать инвойс | POST | `/invoice/create` |
| Статус инвойса | GET | `/invoice/status/:service_id/:invoice_id` |
| Статус платежа | GET | `/payment/status/:service_id/:payment_id` |
| Возврат | DELETE | `/payment/reversal/:service_id/:payment_id` |
| Запрос токена карты | POST | `/card_token/request` |
| Верификация токена | POST | `/card_token/verify` |
| Оплата по токену | POST | `/card_token/payment` |
| Click Pass оплата | POST | `/click_pass/payment` |

**Авторизация:** кастомный заголовок `Auth: merchant_user_id:digest:timestamp`, где `digest = SHA1(timestamp + secret_key)`.

**Sandbox:** отдельного URL нет — предоставляется **эмулятор** для локального тестирования. Документация: https://docs.click.uz/en/click-api-testing/.

**GitHub** (организация click-llc — https://github.com/click-llc): 12 репозиториев — PHP, Django, Android SDK, плагины для Joomla, CS-Cart, 1C-Битрикс, Drupal.

### Uzum Bank (бывший Kapitalbank/Apelsin)

**Developer Portal:** https://developer.uzumbank.uz/en/ — самый современный портал среди узбекских платёжных систем.

**API-продукты:** Checkout (хостинговая платёжная страница), Merchant API, FastPay, Dynamic QR, CrossBorder, RemitCore, Fiscalization, Payment Hub. Протокол: HTTPS POST, JSON. Авторизация: **HTTP Basic Auth**. Webhook-эндпоинты: `/check`, `/create`, `/confirm`, `/reverse`, `/status`. Таймаут транзакции — 30 минут. Поддерживает карты Uzum, HUMO, UzCard, Visa, MasterCard.

**Seller API** Uzum Market: Swagger-спецификация существует по адресу `https://api-seller.uzum.uz/api/seller-openapi/swagger/swagger-ui/`, но требует авторизации. Более **15 000 продавцов**, **10+ млн пользователей**. Неофициальные consumer-эндпоинты задокументированы в https://github.com/spireuz/uzum-statistics.

**PyPI:** `uzum-payments`. **Postman:** https://www.postman.com/programmsoft/uzum-merchant/overview.

### Paynet (paynet.uz)

**Публичная API-документация практически отсутствует.** Paynet работает как агрегатор платежей — 20 млн пользователей, 390+ провайдеров, 21 000+ точек оплаты. Существует страница https://app.theneo.io/paynet/product, но содержимое не верифицировано. Интеграция возможна через community-библиотеки: `paynet-pkg` (Python, PayTechUz), `pay-uz` (Laravel).

### HUMO и UzCard — национальные платёжные системы

**Ни HUMO, ни UzCard не имеют публичного developer API.** Обе системы доступны через платёжные шлюзы: **PaySys** (https://docs.paysys.uz/en/host-to-host/paysys-gateway/ — JSON-RPC API для UzCard+HUMO acquiring), Click, Payme, Uzum Bank. Важная техническая деталь: **узбекские карты не имеют CVV-кода** — вместо 3DS используется OTP-код от платёжной системы.

### Oson

**Документация:** https://docs.oson.com/ — полноценная, включает Kassa API (invoice-модель) и InterHub Merchant API (check/pay/check_status). Авторизация через secret key. Тестовые карты доступны. Поддерживает OSON-кошелёк, UzCard, HUMO.

---

## Блок 2: SMS-шлюзы и телеком

### Eskiz.uz — доминирующий SMS-провайдер для разработчиков

**Base URL:** `https://notify.eskiz.uz/api/`
**Документация:** https://documenter.getpostman.com/view/663428/TVK5eMco

| Метод | Endpoint | Назначение |
|---|---|---|
| POST | `/auth/login` | Получение JWT-токена (email + password) |
| POST | `/message/sms/send` | Отправка одного SMS |
| POST | `/message/sms/send-batch` | Массовая отправка |
| GET | `/message/sms/status_by_id/{id}` | Статус доставки |
| GET | `/auth/user` | Инфо о пользователе / баланс |
| GET | `/auth/user/limit` | Лимиты (limit, used, remaining) |
| PATCH | `/auth/refresh` | Обновление токена |

**Авторизация:** JWT Bearer Token. **Стоимость:** **95 сум/SMS** (информационные), **175 сум/SMS** (рекламные, только Ucell/Mobiuz/Uzmobile). Только для юрлиц. 1 SMS = 160 латинских или 70 кириллических символов.

**SDK:** Python (`eskiz-pkg`, `eskiz-sms`, `django-eskiz-sms`), PHP/Laravel (`uzbek/eskiz-sms-client`), Go (`eskizuz`, `iota-uz/eskiz`). **npm-пакет только один:** `azizdev-eskiz-uz` — крайне низкий adoption. Это критический пробел.

### Playmobile.uz — enterprise-альтернатива

**API:** https://wiki.playmobile.uz/ (wiki) + PDF: https://playmobile.uz/wp-content/uploads/2022/08/http.pdf. Endpoint: `POST /send`. Авторизация: HTTP Basic Auth. Поддерживает HTTP + SMPP. Покрытие: все операторы УЗ (Beeline, Ucell, Mobiuz, UMS, Uzmobile, Perfectum). Работает с 2004 года, ориентирован на enterprise, цены по запросу.

**Ucell и Beeline Uzbekistan** не имеют прямых developer SMS API — бизнес-рассылки идут через агрегаторы Eskiz/Playmobile.

---

## Блок 3: государственные API

### Центральный банк Узбекистана — курсы валют

**API полностью открыт, авторизация не нужна.**

| Формат | URL |
|---|---|
| JSON (все валюты) | `https://cbu.uz/ru/arkhiv-kursov-valyut/json/` |
| По валюте | `https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/` |
| По дате | `https://cbu.uz/ru/arkhiv-kursov-valyut/json/all/2025-01-15/` |
| Комбинированный | `https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/2025-01-15/` |
| XML | `https://cbu.uz/ru/arkhiv-kursov-valyut/xml/` |

Документация для вебмастеров: https://cbu.uz/en/arkhiv-kursov-valyut/veb-masteram/. ~30 валют. Текущий курс: **~12 192 сум за 1 USD**. Идеальный кандидат для первого MCP-сервера — простой, открытый, без авторизации.

### my.gov.uz — API Manager

Портал интеграции: https://integration.my.gov.uz/. Доступны ПИНФЛ-верификация (14-значный номер физлица), СТИР/ИНН-проверка (9 цифр) — https://my.gov.uz/ru/info-by-tin/passport, ЕГРПО-данные (сервис №662). Требует OneID-аутентификацию или E-IMZO.

### Soliq.uz — налоговая

**E-Faktura API:** https://api.faktura.uz/help/ — REST API для электронных счетов-фактур. Авторизация через E-IMZO (ЭЦП). **Tasnif** (классификация МХИК): https://tasnif.soliq.uz/ — существуют npm-пакеты `mxik` и `ikpu-mxik` (TypeScript-обёртки). Доступ для юрлиц с E-IMZO.

### data.gov.uz

API endpoint: `https://data.gov.uz/uz/api/v1/json/dataset?access_key=`. Формат JSON, требует API-ключ. Портал: https://data.egov.uz/eng.

### E-IMZO (электронная подпись)

Интеграционная документация: https://github.com/qo0p/e-imzo-doc. REST API с frontend/backend эндпоинтами, PKCS#7-подписи, deeplink для мобильного приложения. Android SDK: https://github.com/alimovshohrukh/horcrux. Используется для налоговой отчётности и e-faktura, **не для платёжных интеграций напрямую**.

---

## Блок 4: маркетплейсы, доставка, геосервисы

**Uzum Market:** публичного Seller REST API нет — управление через кабинет seller.uzum.uz и мобильное приложение. Swagger-спецификация существует, но закрыта авторизацией. **Asaxiy.uz:** API отсутствует. **OLX UZ:** использует глобальный OLX Partner API v2 (https://developer.olxgroup.com/), авторизация OAuth2 + API Key, код страны UZ.

**Express24:** API отсутствует. Рестораны интегрируются через мобильное приложение Express24 Merchant. Сервис перешёл в Яндекс Еду. **Почта Узбекистана:** прямого API трекинга нет, только веб-форма https://uz.post/tracking.

**Yandex Delivery:** работает в УЗ (Ташкент, Самарканд, Бухара, Хива, Фергана). **Тот же API** что и для России — host `https://b2b.taxi.yandex.net`, OAuth-токен, единая документация: https://yandex.com/dev/logistics/api-go-delivery/.

**2GIS:** покрывает Ташкент, Самарканд, Бухару. **Единый API-ключ** для РФ/КЗ/УЗ — регистрация на https://platform.2gis.ru/. Geocoder принимает запросы на узбекском, русском, английском. Документация: https://docs.2gis.com/en/.

---

## Блок 5: PayTechUZ — профиль и возможности коллаборации

**GitHub:** https://github.com/PayTechUz (9 репозиториев). **Автор:** Muhammadali Akbarov, Software Engineer в MyTaxi (Ташкент). **Telegram:** @muhammadali_me, email: paytechuz@gmail.com. Группа: https://t.me/paytechuz.

**Поддерживает:** Payme, Click, Uzum, Paynet, Atmos. **Звёзды:** `payme-pkg` — 107★, `eskiz-pkg` — 33★, `paytechuz` (unified) — 23★, 57 коммитов, 1 контрибьютор. **Только Python** (Django/FastAPI/Flask). На PyPI: `paytechuz` v0.3.5. Требует лицензионный API-ключ (freemium через https://pay-tech.uz/console).

**npm-пакета нет.** Это ключевой пробел: весь Node.js/TypeScript-сегмент не охвачен. **MCP-серверов нет.** PayTechUZ — потенциальный партнёр, а не конкурент, поскольку работает в другой экосистеме (Python vs. Node.js/MCP).

---

## Блок 6: конкурентный анализ — npm и MCP

### MCP-серверы для Узбекистана: абсолютный ноль

| Поисковый запрос | Результат |
|---|---|
| mcp.so «uzbekistan» | 0 из 19 196 серверов |
| smithery.ai «uzbekistan» | 0 |
| «payme mcp server» | 0 |
| «click.uz mcp» | 0 |
| «uzum mcp» | 0 |
| GitHub «uzbekistan API» MCP | 0 |

### npm-пакеты для узбекских API

| Пакет | Версия/дата | Статус |
|---|---|---|
| `payme-uz` | 1.1.2, ~4 года назад | Заброшен, 0 dependents |
| `click-uz` | 1.1.2, ~4 года назад | Заброшен, 0 dependents |
| `@exode-team/payme-uz.api` | 1.0.56, ~4 мес. назад | Единственный активный, TypeScript |
| `@exode-team/payme.api` | 1.0.52, ~2 мес. назад | Активный |
| `azizdev-eskiz-uz` | — | Минимальный adoption |
| `mxik` | — | TypeScript-обёртка tasnif.soliq.uz |

**Отсутствуют npm-пакеты для:** Uzum, Paynet, Oson, ЦБУ, Playmobile, UzCard/HUMO gateway. **Это пустое поле** для @theyahia.

---

## Блок 7: разработчицкое сообщество и рынок

### Telegram-каналы (реальные @username)

**JavaScript/TypeScript:** @js_uzb, @typescript_uzb, @nodejs_uz, @bunjs_uz, @nestjs_uz, @nextjs_uzbekistan, @react_uz, @vuejs_uz. **Python:** @python_uz, @djangouzb (~2 250 участников). **AI/ML:** @mlc_uz (организует ML Gap, ML Party, AI Rewind). **Общие:** @uzgeeksgroup, @uzdevgroup, @tasdev. **Платежи:** @paytechuz. **Работа:** @uzdev_jobs, @ITjobs_Uzbekistan (14+ каналов). Полный список: https://github.com/doniyor2109/awesome-telegram-dev-groups-uz (60+ групп).

### IT Park Uzbekistan — налоговый рай для IT

**0% корпоративного налога**, 0% НДС на IT-экспорт, 0% налога на имущество, **7,5% НДФЛ** (вместо 12%), 0% таможенных пошлин на оборудование. IT Park берёт 1% от дохода резидента. Льготы **гарантированы до 2040 года**. **2 800+ резидентов**, 586 с иностранным капиталом. **Регистрация удалённая**, рассмотрение за 15 рабочих дней. 100% иностранное владение разрешено. IT-виза до 3 лет.

### Размер рынка

| Показатель | Значение |
|---|---|
| Население | ~38 млн, 60% моложе 30 |
| ICT-специалисты | **200 000+** |
| IT-выпускников в год | ~29 000 |
| E-commerce рынок | **$1,2 млрд** (2024), прогноз $2,2 млрд к 2027 |
| Банковских карт | **68,2 млн** (янв. 2026, +48% г/г) |
| POS-терминалов | 430 700 |
| Безналичные платежи | 81% (M0/M2 = 19,2%) |
| Цель правительства | 75% безнала в торговле к 2030 |
| Цифровые платежи CAGR | **31,12%** (2025–2029) |
| IT-экспорт | $57,2 млн (Q1 2023), цель $5 млрд к 2030 |

### Специфика валюты и API

**Payme хранит суммы в тийинах** (1/100 сума): `amount=50000` = 500 сум. **Click хранит в сумах**: `amount=500` = 500 сум. Это критически важно для реализации MCP-серверов — нужна нормализация. С 1 апреля 2026 покупки >25 млн сум (~$2 050) — только безналично. С 1 июля 2026 — обязательный единый QR-код для всех торговых точек.

**Язык документации:** Payme — только RU; Click — RU + EN; Uzum Bank — EN; PayTechUZ — EN. **README для MCP-серверов:** основной — русский (lingua franca dev-документации в УЗ), дополнительный — английский, опционально — узбекский.

---

## Блок 8: таблица приоритизации MCP-серверов

| # | Сервис | Аудитория | Качество API | Конкуренция (10=нет) | Простота | Виральность | Монетизация | **ИТОГО** |
|---|---|---|---|---|---|---|---|---|
| 1 | **Payme Merchant+Subscribe** | 10 | 9 | 9 | 7 | 10 | 9 | **54** |
| 2 | **Click Merchant API** | 10 | 9 | 9 | 8 | 10 | 9 | **55** |
| 3 | **ЦБУ курсы валют** | 8 | 10 | 10 | 10 | 7 | 4 | **49** |
| 4 | **Eskiz SMS** | 9 | 8 | 10 | 9 | 9 | 7 | **52** |
| 5 | **Uzum Bank** | 8 | 9 | 10 | 7 | 8 | 8 | **50** |
| 6 | **Oson Kassa** | 5 | 7 | 10 | 8 | 5 | 5 | **40** |
| 7 | **Soliq/Tasnif МХИК** | 6 | 6 | 9 | 7 | 6 | 6 | **40** |
| 8 | **Paynet** | 7 | 4 | 10 | 4 | 7 | 6 | **38** |
| 9 | **2GIS (UZ)** | 7 | 9 | 8 | 8 | 6 | 5 | **43** |
| 10 | **Yandex Delivery UZ** | 6 | 9 | 8 | 7 | 5 | 6 | **41** |

### Топ-10 по приоритету запуска

1. **Click Merchant API** (55) — REST, двуязычная документация, самый простой для создания MCP
2. **Payme Merchant + Subscribe** (54) — JSON-RPC, огромная аудитория, полный sandbox
3. **Eskiz SMS** (52) — критический пробел (npm-пакета нет), REST + JWT, понятные endpoints
4. **Uzum Bank** (50) — современный портал, растущая экосистема, HTTP Basic
5. **ЦБУ курсы валют** (49) — идеальный quick win: открытый, без авторизации, простой JSON
6. **2GIS Узбекистан** (43) — единый ключ RU/KZ/UZ, отличная документация
7. **Yandex Delivery UZ** (41) — тот же API что для РФ, можно адаптировать существующий MCP
8. **Oson Kassa** (40) — документированный, тестовые карты, но аудитория меньше
9. **Soliq/Tasnif** (40) — нишевый, но важный для B2B (МХИК-коды уже имеют npm-обёртки)
10. **Paynet** (38) — слабая документация, но 20 млн пользователей дают потенциал

---

## Стратегическая рекомендация по коллаборации с PayTechUZ

**Вывод: коллаборировать стоит, но как партнёры в разных экосистемах, а не как конкуренты.**

PayTechUZ — single-developer проект Muhammadali Akbarov (@muhammadali_me, paytechuz@gmail.com), Software Engineer в MyTaxi. Его сильная сторона — Python (Django/FastAPI), ваша — Node.js/TypeScript + MCP-протокол. Пересечения нет.

**Конкретные шаги:**
1. Написать в Telegram @muhammadali_me — предложить кросс-промо (он ссылается на ваши MCP в документации, вы ссылаетесь на paytechuz для Python-разработчиков)
2. Вступить в @paytechuz Telegram-группу для получения обратной связи от узбекских разработчиков
3. Использовать его опыт интеграции как reference — особенно нюансы API Paynet и Uzum, которые плохо документированы официально
4. Не конкурировать на PyPI — ваша ценность в MCP-серверах и npm, его — в Python-пакетах

**Рекомендуемый порядок запуска:** начать с ЦБУ (quick win за 1 день, демонстрация присутствия), затем Click + Payme параллельно (ядро ценности), потом Eskiz (критический пробел). Анонсировать в @nodejs_uz, @js_uzb, @typescript_uzb, @paytechuz. Регистрация в IT Park не обязательна для начала, но целесообразна для налоговых льгот при масштабировании.