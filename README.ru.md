# MCP-серверы для российских и не-западных API

[English](README.md) | **Русский**

> **46 серверов · 566 инструментов · один npm-scope: [@theyahia](https://www.npmjs.com/org/theyahia)**
>
> Числа считает `node scripts/catalog.mjs`: каждый сервер поднимается по stdio и отвечает на `listTools()`. Последний прогон — 2026-09-02.

[![Лицензия: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/mcp-core?label=downloads)](https://www.npmjs.com/org/theyahia)
[![GitHub stars](https://img.shields.io/github/stars/theYahia/WWmcp?style=social)](https://github.com/theYahia/WWmcp/stargazers)
![Серверы](https://img.shields.io/badge/MCP_Servers-46-blue)
![Инструменты](https://img.shields.io/badge/Tools-566-green)

MCP-серверы для API, которых нет в западных каталогах: российские и СНГ-сервисы (1С, Wildberries, ЮKassa, СДЭК, hh.ru, amoCRM, МойСклад, Авито) плюс платёжные и SMS-провайдеры Турции, Залива, Египта, Эфиопии, Бангладеш и Латинской Америки. Подключаются к Claude Desktop, Cursor, VS Code и любому MCP-клиенту.

Каталог делится надвое: **[Россия и СНГ](#серверы-для-россии-и-снг)** — 39 серверов, 429 инструментов, основная часть; **[развивающиеся рынки](#серверы-для-развивающихся-рынков)** — 7 серверов, 72 инструмента за пределами постсоветского пространства.

**Что внутри:**

- Общее ядро `@theyahia/mcp-core`: авторизация, ретраи, структурированные ошибки, два транспорта (stdio и Streamable HTTP).
- TypeScript, Node.js >= 18, тесты на vitest, релизы через changesets, CI на GitHub Actions.
- Новый сервер: `npx @theyahia/create-mcp <name>` — скаффолд из `servers/_template/`.

> Готовые сценарии для этих серверов: [mcp-skills](https://github.com/theYahia/mcp-skills) — e-commerce, HR, маркетинг, финансы.

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Серверы для России и СНГ](#серверы-для-россии-и-снг)
- [Серверы для развивающихся рынков](#серверы-для-развивающихся-рынков)
- [Отдельные репозитории](#отдельные-репозитории)
- [Настройка клиента](#настройка-клиента)
- [Разработка монорепо](#разработка-монорепо)
- [Контрибуция](#контрибуция)
- [Сообщество](#сообщество)

## Быстрый старт

### 1. Добавь серверы в конфиг Claude Desktop

`claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "moysklad": {
      "command": "npx",
      "args": ["-y", "@theyahia/moysklad-mcp"],
      "env": { "MOYSKLAD_TOKEN": "your_token" }
    },
    "cdek": {
      "command": "npx",
      "args": ["-y", "@theyahia/cdek-mcp"],
      "env": { "CDEK_CLIENT_ID": "your_id", "CDEK_CLIENT_SECRET": "your_secret" }
    },
    "yookassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/yookassa-mcp"],
      "env": { "YOOKASSA_SHOP_ID": "your_id", "YOOKASSA_SECRET_KEY": "your_key" }
    }
  }
}
```

### 2. Спроси AI

> «Проверь остатки товара TS-100 в МойСклад, рассчитай доставку СДЭК до Новосибирска и создай ссылку на оплату через ЮKassa»

### 3. Дальше AI сам

МойСклад → остатки и цена → СДЭК → тариф → ЮKassa → ссылка на оплату. Один промпт, без ручной возни с API.

---

## Серверы для России и СНГ

39 серверов, 429 инструментов. Россия, Казахстан, Узбекистан.

#### Платежи

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/yookassa-mcp](https://www.npmjs.com/package/@theyahia/yookassa-mcp) | v3.0.0 | 20 tools | Платежи, возвраты, чеки (54-ФЗ), выплаты, СБП, сплиты, вебхуки |
| [@theyahia/tkassa-mcp](https://www.npmjs.com/package/@theyahia/tkassa-mcp) | v2.0.1 | 16 tools | Эквайринг Т-Банка: платежи, возвраты, карты, QR СБП, чеки |
| [@theyahia/payme-mcp](https://www.npmjs.com/package/@theyahia/payme-mcp) | v1.1.0 | 10 tools | Payme (Узбекистан): карты, чеки, подписные платежи |
| [@theyahia/cloudpayments-mcp](https://www.npmjs.com/package/@theyahia/cloudpayments-mcp) | v1.2.0 | 6 tools | Оплата, двухстадийная схема, отмена, возврат, поиск транзакции |
| [@theyahia/robokassa-mcp](https://www.npmjs.com/package/@theyahia/robokassa-mcp) | v1.2.0 | 2 tools | Ссылки на оплату, статус счёта |

#### ERP, учёт, CRM

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/retailcrm-mcp](https://www.npmjs.com/package/@theyahia/retailcrm-mcp) | v3.0.0 | 39 tools | Заказы, клиенты, товары, оплаты, задачи, e-commerce-аналитика |
| [@theyahia/aprovodka](https://www.npmjs.com/package/@theyahia/aprovodka) | v4.3.0 | 34 tools | 1С:Предприятие через OData: справочники, документы, регистры, бухучёт, батчи |
| [@theyahia/planfix-mcp](https://www.npmjs.com/package/@theyahia/planfix-mcp) | v1.2.0 | 20 tools | Задачи, контакты, проекты, комментарии, кастомные поля, файлы |
| [@theyahia/elma365-mcp](https://www.npmjs.com/package/@theyahia/elma365-mcp) | v2.0.0 | 20 tools | BPM: процессы, задачи, элементы приложений, схемы |
| [@theyahia/amocrm-mcp](https://www.npmjs.com/package/@theyahia/amocrm-mcp) | v2.0.2 | 19 tools | Сделки, контакты, компании, воронки, задачи, примечания, неразобранное |
| [@theyahia/moysklad-mcp](https://www.npmjs.com/package/@theyahia/moysklad-mcp) | v3.1.0 | 60 tools | Товары, остатки, заказы, контрагенты, приёмки, отчёт по прибыли |
| [@theyahia/megaplan-mcp](https://www.npmjs.com/package/@theyahia/megaplan-mcp) | v4.0.0 | 18 tools | Задачи, сделки, проекты, сотрудники, комментарии |
| [@theyahia/bitrix24-mcp](https://www.npmjs.com/package/@theyahia/bitrix24-mcp) | v1.2.0 | 4 tools | Сделки, контакты, задачи через входящий вебхук |
| [@theyahia/getcourse-mcp](https://www.npmjs.com/package/@theyahia/getcourse-mcp) | v1.2.0 | 3 tools | Онлайн-школа: пользователи, сделки |

#### Маркетплейсы и объявления

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/wildberries-mcp](https://www.npmjs.com/package/@theyahia/wildberries-mcp) | v3.1.0 | 30 tools | Seller API: товары, цены, остатки, заказы, поставки FBS, аналитика, отзывы |
| [@theyahia/avito-mcp](https://www.npmjs.com/package/@theyahia/avito-mcp) | v0.2.0 | 3 tools | Объявления продавца, карточка объявления, чаты мессенджера |
| [@theyahia/kaspi-mcp](https://www.npmjs.com/package/@theyahia/kaspi-mcp) | v1.0.2 | 3 tools | Kaspi.kz (Казахстан): заказы и товары магазина |

#### Логистика

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/cdek-mcp](https://www.npmjs.com/package/@theyahia/cdek-mcp) | v2.2.0 | 16 tools | Тарифы, заказы, вызов курьера, трекинг, ПВЗ, печать, вебхуки |
| [@theyahia/boxberry-mcp](https://www.npmjs.com/package/@theyahia/boxberry-mcp) | v1.1.1 | 6 tools | ПВЗ, расчёт доставки, трекинг, проверка индекса |
| [@theyahia/delovye-linii-mcp](https://www.npmjs.com/package/@theyahia/delovye-linii-mcp) | v1.1.1 | 6 tools | Тарифы на грузоперевозки, терминалы, заказы, трекинг |
| [@theyahia/pochta-russia-mcp](https://www.npmjs.com/package/@theyahia/pochta-russia-mcp) | v2.0.0 | 6 tools | Трекинг, тарифы, сроки, отделения, нормализация адреса |

#### HR

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/hh-mcp](https://www.npmjs.com/package/@theyahia/hh-mcp) | v2.1.0 | 19 tools | Поиск вакансий и резюме, работодатели, зарплатная статистика, справочники |
| [@theyahia/huntflow-mcp](https://www.npmjs.com/package/@theyahia/huntflow-mcp) | v1.2.0 | 14 tools | ATS: вакансии, кандидаты, резюме, этапы, источники |

#### Маркетинг, аналитика, веб

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/unisender-mcp](https://www.npmjs.com/package/@theyahia/unisender-mcp) | v1.1.1 | 10 tools | Списки, контакты, шаблоны, рассылки, статистика доставки |
| [@theyahia/vk-ads-mcp](https://www.npmjs.com/package/@theyahia/vk-ads-mcp) | v4.0.0 | 8 tools | Кампании, объявления, таргетинги, бюджеты, статистика |
| [@theyahia/tilda-mcp](https://www.npmjs.com/package/@theyahia/tilda-mcp) | v1.2.0 | 7 tools | Проекты, страницы, экспорт страниц |
| [@theyahia/calltouch-mcp](https://www.npmjs.com/package/@theyahia/calltouch-mcp) | v1.2.1 | 7 tools | Коллтрекинг: звонки, лиды, источники, статистика |
| [@theyahia/mindbox-mcp](https://www.npmjs.com/package/@theyahia/mindbox-mcp) | v1.2.0 | 6 tools | CDP: профили клиентов, заказы, сегменты, операции |
| [@theyahia/roistat-mcp](https://www.npmjs.com/package/@theyahia/roistat-mcp) | v1.1.1 | 6 tools | Маркетинговая аналитика: визиты, лиды, расходы, каналы |
| [@theyahia/yandex-search-mcp](https://www.npmjs.com/package/@theyahia/yandex-search-mcp) | v1.0.0 | 3 tools | Wordstat: топ-запросы, динамика, регионы |

#### Телефония и рассылки

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/mts-exolve-mcp](https://www.npmjs.com/package/@theyahia/mts-exolve-mcp) | v3.0.1 | 8 tools | SMS, звонки, записи, Viber, покупка номеров |
| [@theyahia/mango-office-mcp](https://www.npmjs.com/package/@theyahia/mango-office-mcp) | v1.1.1 | 8 tools | Облачная АТС: звонки, пользователи, callback, статистика, записи, SMS |

#### AI и речь

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/gigachat-mcp](https://www.npmjs.com/package/@theyahia/gigachat-mcp) | v3.0.1 | 8 tools | Чат, эмбеддинги, генерация изображений, подсчёт токенов, баланс |
| [@theyahia/salutespeech-mcp](https://www.npmjs.com/package/@theyahia/salutespeech-mcp) | v1.2.0 | 5 tools | Распознавание и синтез речи |

#### Данные и справочники

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/kontur-focus-mcp](https://www.npmjs.com/package/@theyahia/kontur-focus-mcp) | v3.0.1 | 8 tools | Проверка контрагента: ЕГРЮЛ, финансы, арбитраж, банкротство, лицензии |
| [@theyahia/2gis-mcp](https://www.npmjs.com/package/@theyahia/2gis-mcp) | v3.0.0 | 8 tools | Поиск мест, геокодинг, маршруты, отзывы |
| [@theyahia/cbr-mcp](https://www.npmjs.com/package/@theyahia/cbr-mcp) | v1.2.0 | 7 tools | ЦБ РФ: курсы валют, ключевая ставка, драгметаллы, конвертация |
| [@theyahia/cbu-mcp](https://www.npmjs.com/package/@theyahia/cbu-mcp) | v1.1.0 | 5 tools | ЦБ Узбекистана: курсы валют, история, динамика |

#### Тревел

| Пакет | Версия | Инструменты | Что умеет |
|---|---|---|---|
| [@theyahia/travelpayouts-mcp](https://www.npmjs.com/package/@theyahia/travelpayouts-mcp) | v2.0.1 | 13 tools | Aviasales: цены на авиабилеты, календарь цен, отели, справочники |

Набор инструментов у `retailcrm` и `aprovodka` зависит от окружения (`RETAILCRM_READONLY`, `ONEC_SERVICES`, `ONEC_WRITE_MODE`) — в таблице числа при настройках по умолчанию. Промпты MCP (`server.prompt`) в счёт инструментов не входят.

---

## Серверы для развивающихся рынков

7 серверов, 72 инструмента вне СНГ. Набор младше и уже, чем СНГ-часть; заявки на новые страны — через [issue «новый сервер»](https://github.com/theYahia/WWmcp/issues/new?template=new-server.yml).

| Пакет | Регион | Версия | Инструменты | Что умеет |
|---|---|---|---|---|
| [@theyahia/salla-mcp](https://www.npmjs.com/package/@theyahia/salla-mcp) | Саудовская Аравия | v3.1.0 | 22 tools | E-commerce: товары, заказы, покупатели, категории, купоны |
| [@theyahia/mercadopago-mcp](https://www.npmjs.com/package/@theyahia/mercadopago-mcp) | Латинская Америка (9 стран) | v1.1.0 | 10 tools | Платежи, возвраты, checkout preferences, заказы мерчанта |
| [@theyahia/bkash-mcp](https://www.npmjs.com/package/@theyahia/bkash-mcp) | Бангладеш | v1.1.0 | 8 tools | Tokenized Checkout: платежи, возвраты, соглашения |
| [@theyahia/chapa-mcp](https://www.npmjs.com/package/@theyahia/chapa-mcp) | Эфиопия | v1.1.0 | 8 tools | Платежи, верификация, переводы, банки, баланс |
| [@theyahia/fawaterak-mcp](https://www.npmjs.com/package/@theyahia/fawaterak-mcp) | Египет | v1.1.0 | 8 tools | Счета, способы оплаты (Fawry, карты, кошельки, Meeza), возвраты |
| [@theyahia/ileti-merkezi-mcp](https://www.npmjs.com/package/@theyahia/ileti-merkezi-mcp) | Турция | v4.0.0 | 11 tools | SMS, массовые рассылки, отчёты, контакты, чёрный список |
| [@theyahia/orange-money-mcp](https://www.npmjs.com/package/@theyahia/orange-money-mcp) | Франкофонная Африка (11 стран) | v1.1.0 | 8 tools | WebPay: платежи, статусы, cash-in, cash-out, переводы |

---

## Отдельные репозитории

77 пакетов опубликованы в npm под тем же scope, но их код лежит **не в этом монорепо** — каждый в своём репозитории. Здесь их нельзя собрать, протестировать и посчитать инструменты, поэтому версии и число инструментов смотри на странице пакета в npm.

Колонка «Исходники» — ссылка на репозиторий, если он публичный; «только npm» — публичного репозитория нет.

<details>
<summary><b>77 пакетов вне монорепо</b> (нажми, чтобы развернуть)</summary>

| Пакет | Регион | Исходники | Описание |
|---|---|---|---|
| [@metarebalance/dadata-mcp](https://www.npmjs.com/package/@metarebalance/dadata-mcp) | Россия | [github](https://github.com/theYahia/dadata-mcp) | DaData — address validation, company lookup, phone cleaning, geocoding |
| [@theyahia/alfa-bank-mcp](https://www.npmjs.com/package/@theyahia/alfa-bank-mcp) | Россия | [github](https://github.com/theYahia/alfa-bank-mcp) | Alfa-Bank Business — accounts, balances, statements, payment orders, counterparties, FX rates, payroll |
| [@theyahia/appmetrica-mcp](https://www.npmjs.com/package/@theyahia/appmetrica-mcp) | Россия | [github](https://github.com/theYahia/appmetrica-mcp) | AppMetrica — mobile analytics, reports, cohorts, profiles, push campaigns, crashes |
| [@theyahia/ati-su-mcp](https://www.npmjs.com/package/@theyahia/ati-su-mcp) | Россия | [github](https://github.com/theYahia/ati-su-mcp) | ATI.su — cargo search, truck matching, company ratings |
| [@theyahia/atol-online-mcp](https://www.npmjs.com/package/@theyahia/atol-online-mcp) | Россия | только npm | ATOL Online — fiscal receipts (54-FZ compliance) |
| [@theyahia/casebook-mcp](https://www.npmjs.com/package/@theyahia/casebook-mcp) | Россия | только npm | Casebook/Pravo.ru — legal case search |
| [@theyahia/chestnyznak-mcp](https://www.npmjs.com/package/@theyahia/chestnyznak-mcp) | Россия | [github](https://github.com/theYahia/chestnyznak-mcp) | Chestniy ZNAK — product marking verification |
| [@theyahia/jivosite-mcp](https://www.npmjs.com/package/@theyahia/jivosite-mcp) | Россия | [github](https://github.com/theYahia/jivosite-mcp) | JivoSite — chats, agents, visitors |
| [@theyahia/kaiten-mcp](https://www.npmjs.com/package/@theyahia/kaiten-mcp) | Россия | [github](https://github.com/theYahia/kaiten-mcp) | Kaiten — boards, cards, columns, tags, users, comments |
| [@theyahia/kontur-diadoc-mcp](https://www.npmjs.com/package/@theyahia/kontur-diadoc-mcp) | Россия | [github](https://github.com/theYahia/kontur-diadoc-mcp) | Kontur.Diadoc — electronic document interchange |
| [@theyahia/prodamus-mcp](https://www.npmjs.com/package/@theyahia/prodamus-mcp) | Россия | только npm | Prodamus — payments, subscriptions, refunds, invoices |
| [@theyahia/sber-mcp](https://www.npmjs.com/package/@theyahia/sber-mcp) | Россия | [github](https://github.com/theYahia/sber-mcp) | Sberbank — accounts, statements |
| [@theyahia/sberbank-acquiring-mcp](https://www.npmjs.com/package/@theyahia/sberbank-acquiring-mcp) | Россия | только npm | Sberbank eCommerce Acquiring — online payments, refunds, pre-auth, card tokenization |
| [@theyahia/sendpulse-mcp](https://www.npmjs.com/package/@theyahia/sendpulse-mcp) | Россия | [github](https://github.com/theYahia/sendpulse-mcp) | SendPulse — mailing lists, email sending, statistics |
| [@theyahia/sms-ru-mcp](https://www.npmjs.com/package/@theyahia/sms-ru-mcp) | Россия | [github](https://github.com/theYahia/sms-ru-mcp) | SMS.RU — send SMS, check status, balance |
| [@theyahia/spark-interfax-mcp](https://www.npmjs.com/package/@theyahia/spark-interfax-mcp) | Россия | только npm | SPARK-Interfax — business intelligence |
| [@theyahia/superjob-mcp](https://www.npmjs.com/package/@theyahia/superjob-mcp) | Россия | [github](https://github.com/theYahia/superjob-mcp) | SuperJob — vacancy search, employers |
| [@theyahia/tgstat-mcp](https://www.npmjs.com/package/@theyahia/tgstat-mcp) | Россия | [github](https://github.com/theYahia/tgstat-mcp) | TGStat — Telegram channel analytics, search, posts, stats, mentions, comparison |
| [@theyahia/tochka-bank-mcp](https://www.npmjs.com/package/@theyahia/tochka-bank-mcp) | Россия | [github](https://github.com/theYahia/tochka-bank-mcp) | Tochka Bank — accounts, payments, counterparties, company info |
| [@theyahia/vk-mcp](https://www.npmjs.com/package/@theyahia/vk-mcp) | Россия | [github](https://github.com/theYahia/vk-mcp) | VK — wall posts, news search, users, groups |
| [@theyahia/voximplant-mcp](https://www.npmjs.com/package/@theyahia/voximplant-mcp) | Россия | [github](https://github.com/theYahia/voximplant-mcp) | Voximplant — call history, users, SMS |
| [@theyahia/yandex-360-mcp](https://www.npmjs.com/package/@theyahia/yandex-360-mcp) | Россия | [github](https://github.com/theYahia/yandex-360-mcp) | Yandex 360 — users, departments, groups, disk, calendar |
| [@theyahia/yandex-cloud-mcp](https://www.npmjs.com/package/@theyahia/yandex-cloud-mcp) | Россия | [github](https://github.com/theYahia/yandex-cloud-mcp) | Yandex Cloud — compute, storage, serverless, operations |
| [@theyahia/yandex-delivery-mcp](https://www.npmjs.com/package/@theyahia/yandex-delivery-mcp) | Россия | только npm | Yandex Delivery — claims, tracking, price estimation |
| [@theyahia/yandex-direct-mcp](https://www.npmjs.com/package/@theyahia/yandex-direct-mcp) | Россия | [github](https://github.com/theYahia/yandex-direct-mcp) | Yandex.Direct — campaigns, ad groups, ads, keywords, statistics, account |
| [@theyahia/yandex-maps-mcp](https://www.npmjs.com/package/@theyahia/yandex-maps-mcp) | Россия | [github](https://github.com/theYahia/yandex-maps-mcp) | Yandex Maps — geocoding, routing, places search, static maps |
| [@theyahia/yandex-metrika-mcp](https://www.npmjs.com/package/@theyahia/yandex-metrika-mcp) | Россия | [github](https://github.com/theYahia/yandex-metrika-mcp) | Yandex.Metrika — counters, goals, reports, logs, traffic analysis |
| [@theyahia/yandex-speechkit-mcp](https://www.npmjs.com/package/@theyahia/yandex-speechkit-mcp) | Россия | [github](https://github.com/theYahia/yandex-speechkit-mcp) | Yandex SpeechKit — speech recognition and synthesis |
| [@theyahia/yandex-tracker-mcp](https://www.npmjs.com/package/@theyahia/yandex-tracker-mcp) | Россия | [github](https://github.com/theYahia/yandex-tracker-mcp) | Yandex Tracker — issues, queues, comments, worklogs |
| [@theyahia/yandex-webmaster-mcp](https://www.npmjs.com/package/@theyahia/yandex-webmaster-mcp) | Россия | [github](https://github.com/theYahia/yandex-webmaster-mcp) | Yandex.Webmaster — hosts, search queries, indexing status |
| [@theyahia/yandexgpt-mcp](https://www.npmjs.com/package/@theyahia/yandexgpt-mcp) | Россия | [github](https://github.com/theYahia/yandexgpt-mcp) | YandexGPT — completion, async completion, embeddings, classification, summarization, tokenization |
| [@theyahia/forte-bank-mcp](https://www.npmjs.com/package/@theyahia/forte-bank-mcp) | Казахстан | только npm | Forte Bank — payment gateway |
| [@theyahia/halyk-epay-mcp](https://www.npmjs.com/package/@theyahia/halyk-epay-mcp) | Казахстан | только npm | Halyk Bank ePay — payment gateway |
| [@theyahia/click-mcp](https://www.npmjs.com/package/@theyahia/click-mcp) | Узбекистан | только npm | Click — payment system |
| [@theyahia/factura-uz-mcp](https://www.npmjs.com/package/@theyahia/factura-uz-mcp) | Узбекистан | только npm | Factura.uz — electronic invoicing |
| [@theyahia/bog-ipay-mcp](https://www.npmjs.com/package/@theyahia/bog-ipay-mcp) | Грузия | только npm | Bank of Georgia iPay — payment gateway |
| [@theyahia/tbc-bank-mcp](https://www.npmjs.com/package/@theyahia/tbc-bank-mcp) | Грузия | только npm | TBC Bank — payment gateway |
| [@theyahia/bepaid-mcp](https://www.npmjs.com/package/@theyahia/bepaid-mcp) | Беларусь | только npm | bePaid — payment gateway |
| [@theyahia/maib-mcp](https://www.npmjs.com/package/@theyahia/maib-mcp) | Молдова | только npm | MAIB — e-commerce payments |
| [@theyahia/getir-mcp](https://www.npmjs.com/package/@theyahia/getir-mcp) | Турция | только npm | Getir — partner API |
| [@theyahia/hepsiburada-mcp](https://www.npmjs.com/package/@theyahia/hepsiburada-mcp) | Турция | только npm | Hepsiburada — marketplace |
| [@theyahia/is-bankasi-mcp](https://www.npmjs.com/package/@theyahia/is-bankasi-mcp) | Турция | только npm | Isbank — developer API |
| [@theyahia/iyzico-mcp](https://www.npmjs.com/package/@theyahia/iyzico-mcp) | Турция | только npm | iyzico — payment gateway |
| [@theyahia/parasut-mcp](https://www.npmjs.com/package/@theyahia/parasut-mcp) | Турция | [github](https://github.com/theYahia/parasut-mcp) | Parasut — accounting |
| [@theyahia/trendyol-mcp](https://www.npmjs.com/package/@theyahia/trendyol-mcp) | Турция | только npm | Trendyol — marketplace |
| [@theyahia/foodics-mcp](https://www.npmjs.com/package/@theyahia/foodics-mcp) | Залив (ОАЭ + Саудовская Аравия) | только npm | Foodics — POS/restaurant platform (UAE/Saudi) |
| [@theyahia/moyasar-mcp](https://www.npmjs.com/package/@theyahia/moyasar-mcp) | Залив (ОАЭ + Саудовская Аравия) | только npm | Moyasar — payment gateway (Saudi Arabia) |
| [@theyahia/paytabs-mcp](https://www.npmjs.com/package/@theyahia/paytabs-mcp) | Залив (ОАЭ + Саудовская Аравия) | только npm | PayTabs — payment gateway (MENA region) |
| [@theyahia/tabby-mcp](https://www.npmjs.com/package/@theyahia/tabby-mcp) | Залив (ОАЭ + Саудовская Аравия) | только npm | Tabby — BNPL platform (UAE/Saudi) |
| [@theyahia/tap-payments-mcp](https://www.npmjs.com/package/@theyahia/tap-payments-mcp) | Залив (ОАЭ + Саудовская Аравия) | только npm | Tap Payments — payment gateway (UAE/Saudi/Kuwait/Bahrain) |
| [@theyahia/unifonic-mcp](https://www.npmjs.com/package/@theyahia/unifonic-mcp) | Залив (ОАЭ + Саудовская Аравия) | только npm | Unifonic — CPaaS: SMS, Voice, WhatsApp (Saudi Arabia) |
| [@theyahia/asaas-mcp](https://www.npmjs.com/package/@theyahia/asaas-mcp) | Латинская Америка (Бразилия + Мексика) | [github](https://github.com/theYahia/asaas-mcp) | Asaas — payment and Pix gateway (Brazil) |
| [@theyahia/correios-mcp](https://www.npmjs.com/package/@theyahia/correios-mcp) | Латинская Америка (Бразилия + Мексика) | только npm | Correios — Brazilian postal service |
| [@theyahia/facturapi-mcp](https://www.npmjs.com/package/@theyahia/facturapi-mcp) | Латинская Америка (Бразилия + Мексика) | только npm | Facturapi — Mexican e-invoicing (CFDI) |
| [@theyahia/hotmart-mcp](https://www.npmjs.com/package/@theyahia/hotmart-mcp) | Латинская Америка (Бразилия + Мексика) | только npm | Hotmart — digital products platform (Brazil) |
| [@theyahia/ifood-mcp](https://www.npmjs.com/package/@theyahia/ifood-mcp) | Латинская Америка (Бразилия + Мексика) | [github](https://github.com/theYahia/ifood-mcp) | iFood — merchant integration (Brazil) |
| [@theyahia/nfeio-mcp](https://www.npmjs.com/package/@theyahia/nfeio-mcp) | Латинская Америка (Бразилия + Мексика) | только npm | NFe.io — fiscal document platform (Brazil) |
| [@theyahia/pagarme-mcp](https://www.npmjs.com/package/@theyahia/pagarme-mcp) | Латинская Америка (Бразилия + Мексика) | только npm | Pagar.me — payment gateway (Brazil) |
| [@theyahia/africas-talking-mcp](https://www.npmjs.com/package/@theyahia/africas-talking-mcp) | Африка (Нигерия + Кения + ЮАР + Алжир) | только npm | Africa's Talking — communications platform (Kenya/Nigeria/Uganda) |
| [@theyahia/chargily-mcp](https://www.npmjs.com/package/@theyahia/chargily-mcp) | Африка (Нигерия + Кения + ЮАР + Алжир) | только npm | Chargily Pay — payment gateway (Algeria) |
| [@theyahia/nomba-mcp](https://www.npmjs.com/package/@theyahia/nomba-mcp) | Африка (Нигерия + Кения + ЮАР + Алжир) | только npm | Nomba — payment and POS platform (Nigeria) |
| [@theyahia/payfast-mcp](https://www.npmjs.com/package/@theyahia/payfast-mcp) | Африка (Нигерия + Кения + ЮАР + Алжир) | только npm | PayFast — payment gateway (South Africa) |
| [@theyahia/termii-mcp](https://www.npmjs.com/package/@theyahia/termii-mcp) | Африка (Нигерия + Кения + ЮАР + Алжир) | только npm | Termii — SMS and messaging (Nigeria) |
| [@theyahia/yoco-mcp](https://www.npmjs.com/package/@theyahia/yoco-mcp) | Африка (Нигерия + Кения + ЮАР + Алжир) | только npm | Yoco — payment gateway (South Africa) |
| [@theyahia/midtrans-mcp](https://www.npmjs.com/package/@theyahia/midtrans-mcp) | Юго-Восточная Азия (Индонезия + Вьетнам + Филиппины) | только npm | Midtrans — payment gateway (Indonesia) |
| [@theyahia/momo-vn-mcp](https://www.npmjs.com/package/@theyahia/momo-vn-mcp) | Юго-Восточная Азия (Индонезия + Вьетнам + Филиппины) | только npm | MoMo — payment gateway (Vietnam) |
| [@theyahia/paymongo-mcp](https://www.npmjs.com/package/@theyahia/paymongo-mcp) | Юго-Восточная Азия (Индонезия + Вьетнам + Филиппины) | [github](https://github.com/theYahia/paymongo-mcp) | PayMongo — payment gateway (Philippines) |
| [@theyahia/rajaongkir-mcp](https://www.npmjs.com/package/@theyahia/rajaongkir-mcp) | Юго-Восточная Азия (Индонезия + Вьетнам + Филиппины) | только npm | RajaOngkir — shipping cost API (Indonesia) |
| [@theyahia/vnpay-mcp](https://www.npmjs.com/package/@theyahia/vnpay-mcp) | Юго-Восточная Азия (Индонезия + Вьетнам + Филиппины) | только npm | VNPay — payment gateway (Vietnam) |
| [@theyahia/xendit-mcp](https://www.npmjs.com/package/@theyahia/xendit-mcp) | Юго-Восточная Азия (Индонезия + Вьетнам + Филиппины) | только npm | Xendit — payment gateway (Indonesia/Philippines) |
| [@theyahia/zalo-oa-mcp](https://www.npmjs.com/package/@theyahia/zalo-oa-mcp) | Юго-Восточная Азия (Индонезия + Вьетнам + Филиппины) | только npm | Zalo Official Account — messaging API (Vietnam) |
| [@theyahia/easypaisa-mcp](https://www.npmjs.com/package/@theyahia/easypaisa-mcp) | MENA (Иран + Пакистан) | [github](https://github.com/theYahia/easypaisa-mcp) | Easypaisa — mobile wallet and payments (Pakistan) |
| [@theyahia/idpay-mcp](https://www.npmjs.com/package/@theyahia/idpay-mcp) | MENA (Иран + Пакистан) | только npm | IDPay — payment gateway (Iran) |
| [@theyahia/jazzcash-mcp](https://www.npmjs.com/package/@theyahia/jazzcash-mcp) | MENA (Иран + Пакистан) | [github](https://github.com/theYahia/jazzcash-mcp) | JazzCash — mobile wallet and payments (Pakistan) |
| [@theyahia/kavenegar-mcp](https://www.npmjs.com/package/@theyahia/kavenegar-mcp) | MENA (Иран + Пакистан) | [github](https://github.com/theYahia/kavenegar-mcp) | Kavenegar — SMS gateway (Iran) |
| [@theyahia/neshan-maps-mcp](https://www.npmjs.com/package/@theyahia/neshan-maps-mcp) | MENA (Иран + Пакистан) | только npm | Neshan Maps — maps API (Iran) |
| [@theyahia/zarinpal-mcp](https://www.npmjs.com/package/@theyahia/zarinpal-mcp) | MENA (Иран + Пакистан) | только npm | Zarinpal — payment gateway (Iran) |

</details>

---

## Настройка клиента

Cursor и VS Code — `.cursor/mcp.json` или `.vscode/mcp.json`:

```json
{
  "servers": {
    "yookassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/yookassa-mcp"],
      "env": {
        "YOOKASSA_SHOP_ID": "your-shop-id",
        "YOOKASSA_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

Каждый сервер умеет два транспорта: stdio (как в конфигах выше) и Streamable HTTP — детали в README конкретного сервера в [`servers/`](./servers/).

---

## Демо: e-commerce стек

Проверка контрагента, заказ, доставка и оплата — одной цепочкой:

```
1. kontur-focus-mcp: search_company("7707083893")   → проверить контрагента по ИНН
2. moysklad-mcp:     create_customer_order(...)     → создать заказ покупателя
3. cdek-mcp:         calculate_tariff(...)          → рассчитать доставку
4. cdek-mcp:         create_order(...)              → оформить доставку
5. yookassa-mcp:     create_payment(...)            → принять оплату
6. yookassa-mcp:     create_receipt(...)            → выдать чек (54-ФЗ)
```

---

## Разработка монорепо

Turborepo + pnpm workspace. Серверы — в [`servers/`](./servers/), общее ядро — в [`packages/core`](./packages/core), пайплайны CI и релиза — в [`.github/workflows/`](./.github/workflows/).

Числа в этом README не пишутся руками: `node scripts/catalog.mjs` поднимает каждый сервер и перегенерирует [`scripts/catalog.json`](./scripts/catalog.json), `--check` роняет CI при расхождении.

```bash
git clone https://github.com/theYahia/WWmcp.git
cd WWmcp
pnpm install
pnpm build                                # собрать все workspace'ы
pnpm test                                 # тесты по всему монорепо
pnpm dev --filter @theyahia/moysklad-mcp  # dev один сервер
node scripts/catalog.mjs --check          # сверить числа в README
```

Правила проекта: [`CLAUDE.md`](./CLAUDE.md).

---

## Контрибуция

Принимаем контрибуции любого размера — от опечатки до нового MCP-сервера для API твоей страны.

**Быстрый способ добавить сервер:**

```bash
npx @theyahia/create-mcp <name> --region <country> --category <type> --base-url <api-url>
```

Скаффолдит рабочий сервер. Дальше — реализуй инструменты, прогони `pnpm test`, добавь changeset, открывай PR.

- 🐛 [Сообщить о баге](https://github.com/theYahia/WWmcp/issues/new?template=bug.yml)
- ✨ [Запросить фичу](https://github.com/theYahia/WWmcp/issues/new?template=feature.yml)
- 🌍 [Предложить новый сервер](https://github.com/theYahia/WWmcp/issues/new?template=new-server.yml) для API твоей страны
- 🟢 [Смотри `good first issue`](https://github.com/theYahia/WWmcp/labels/good%20first%20issue) — выбери и зашипи

Полный гайд: [**CONTRIBUTING.md**](CONTRIBUTING.md) и [**Code of Conduct**](CODE_OF_CONDUCT.md). По вопросам безопасности — [SECURITY.md](SECURITY.md).

## Сообщество

- 💬 [GitHub Discussions](https://github.com/theYahia/WWmcp/discussions) — вопросы, идеи, кейсы
- 📢 [Telegram-канал](https://t.me/vhodvai) — анонсы релизов, новости
- ⭐ Поставь звезду репо если он полезен — это напрямую помогает discoverability

---

## Автор

[@theYahia](https://github.com/theYahia) · Telegram: [@vhodvai](https://t.me/vhodvai) · npm: [npmjs.com/org/theyahia](https://www.npmjs.com/org/theyahia)

## Лицензия

MIT
