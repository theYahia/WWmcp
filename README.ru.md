# MCP-серверы для не-западных API

[English](README.md) | **Русский**

> **114 серверов · 910+ инструментов · 15+ стран · npm @theyahia**
>
> Крупнейший open-source каталог MCP-серверов для СНГ, MENA, Африки, Латинской Америки и Юго-Восточной Азии.

[![Лицензия: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Серверы](https://img.shields.io/badge/MCP_Servers-114-blue)
![Инструменты](https://img.shields.io/badge/Tools-910+-green)
[![npm org](https://img.shields.io/badge/npm-@theyahia-red)](https://www.npmjs.com/org/theyahia)

> **🎯 40+ готовых скиллов** для этих серверов: [mcp-skills](https://github.com/theYahia/mcp-skills) — workflow для e-commerce, HR-конвейеры, маркетинг-отчёты, финансовые аудиты

## Быстрый старт

### 1. Добавь в Claude Desktop config

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

### 2. Скажи AI

> «Проверь остатки товара TS-100 в МойСклад, рассчитай доставку СДЭК до Новосибирска и создай ссылку на оплату через ЮKassa»

### 3. AI сделает всё сам

МойСклад → остатки и цена → СДЭК → тарифы доставки → ЮKassa → ссылка на оплату. Один промпт, без ручной возни с API.

> 📦 **Готовые сценарии:** [@theyahia/mcp-skills](https://github.com/theYahia/mcp-skills) — 40+ скиллов для e-commerce, HR, маркетинга, финансов

---

## Серверы по регионам

### Россия

#### Платежи

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/yookassa-mcp](https://www.npmjs.com/package/@theyahia/yookassa-mcp) | v2.0.0 | 20 tools | YooKassa — payments, refunds, receipts (54-FZ), payouts, webhooks, recurring, SBP, splits |
| [@theyahia/tkassa-mcp](https://www.npmjs.com/package/@theyahia/tkassa-mcp) | v2.0.0 | 14 tools | T-Kassa (T-Bank/Tinkoff) — payments, refunds, recurring, customers, cards, SBP, receipts (54-FZ) |
| [@theyahia/cloudpayments-mcp](https://www.npmjs.com/package/@theyahia/cloudpayments-mcp) | v2.0.0 | 12 tools | CloudPayments — charge, auth, confirm, void, refund, subscriptions, orders, transactions |
| [@theyahia/robokassa-mcp](https://www.npmjs.com/package/@theyahia/robokassa-mcp) | v1.0.0 | 2 tools | Robokassa — payment URLs, invoice status |
| [@theyahia/sberbank-acquiring-mcp](https://www.npmjs.com/package/@theyahia/sberbank-acquiring-mcp) | v1.0.0 | 8 tools | Sberbank eCommerce Acquiring — online payments, refunds, pre-auth, card tokenization |
| [@theyahia/prodamus-mcp](https://www.npmjs.com/package/@theyahia/prodamus-mcp) | v1.0.0 | 8 tools | Prodamus — payments, subscriptions, refunds, invoices |

#### CRM / Бизнес

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/amocrm-mcp](https://www.npmjs.com/package/@theyahia/amocrm-mcp) | v2.0.1 | 19 tools | amoCRM — leads, contacts, companies, pipelines, tasks, notes, search, events, unsorted |
| [@theyahia/bitrix24-mcp](https://www.npmjs.com/package/@theyahia/bitrix24-mcp) | v3.0.0 | 12 tools | Bitrix24 CRM — deals, contacts, tasks, users, files, messages |
| [@theyahia/moysklad-mcp](https://www.npmjs.com/package/@theyahia/moysklad-mcp) | v3.0.0 | 21 tools | MoySklad — products, stock, orders, counterparties, shipments, supplies, stores, reports, webhooks |
| [@theyahia/retailcrm-mcp](https://www.npmjs.com/package/@theyahia/retailcrm-mcp) | v2.0.0 | 15 tools | RetailCRM — orders, customers, products, references, analytics |
| [@theyahia/megaplan-mcp](https://www.npmjs.com/package/@theyahia/megaplan-mcp) | v1.0.0 | 3 tools | Megaplan — tasks, deals management |
| [@theyahia/planfix-mcp](https://www.npmjs.com/package/@theyahia/planfix-mcp) | v1.0.0 | 3 tools | Planfix — tasks, contacts |
| [@theyahia/kaiten-mcp](https://www.npmjs.com/package/@theyahia/kaiten-mcp) | v3.0.0 | 10 tools | Kaiten — boards, cards, columns, tags, users, comments |
| [@theyahia/elma365-mcp](https://www.npmjs.com/package/@theyahia/elma365-mcp) | v1.0.0 | 3 tools | ELMA365 — app items, BPM tasks |
| [@theyahia/yandex-tracker-mcp](https://www.npmjs.com/package/@theyahia/yandex-tracker-mcp) | v1.0.0 | 12 tools | Yandex Tracker — issues, queues, comments, worklogs |

#### Маркетинг

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/yandex-metrika-mcp](https://www.npmjs.com/package/@theyahia/yandex-metrika-mcp) | v2.1.0 | 15 tools | Yandex.Metrika — counters, goals, reports, logs, traffic analysis |
| [@theyahia/yandex-direct-mcp](https://www.npmjs.com/package/@theyahia/yandex-direct-mcp) | v3.0.0 | 12 tools | Yandex.Direct — campaigns, ad groups, ads, keywords, statistics, account |
| [@theyahia/yandex-webmaster-mcp](https://www.npmjs.com/package/@theyahia/yandex-webmaster-mcp) | v1.0.1 | 5 tools | Yandex.Webmaster — hosts, search queries, indexing status |
| [@theyahia/appmetrica-mcp](https://www.npmjs.com/package/@theyahia/appmetrica-mcp) | v1.0.0 | 8 tools | AppMetrica — mobile analytics, reports, cohorts, profiles, push campaigns, crashes |
| [@theyahia/unisender-mcp](https://www.npmjs.com/package/@theyahia/unisender-mcp) | v1.0.1 | 7 tools | UniSender — email lists, campaigns, contacts |
| [@theyahia/sendpulse-mcp](https://www.npmjs.com/package/@theyahia/sendpulse-mcp) | v1.0.2 | 6 tools | SendPulse — mailing lists, email sending, statistics |
| [@theyahia/roistat-mcp](https://www.npmjs.com/package/@theyahia/roistat-mcp) | v1.0.0 | 5 tools | Roistat — marketing analytics, visits tracking |
| [@theyahia/calltouch-mcp](https://www.npmjs.com/package/@theyahia/calltouch-mcp) | v1.0.0 | 4 tools | Calltouch — call tracking, call statistics |
| [@theyahia/mindbox-mcp](https://www.npmjs.com/package/@theyahia/mindbox-mcp) | v1.0.0 | 3 tools | Mindbox CDP — customer profiles, orders, segments |
| [@theyahia/tgstat-mcp](https://www.npmjs.com/package/@theyahia/tgstat-mcp) | v1.0.0 | 8 tools | TGStat — Telegram channel analytics, search, posts, stats, mentions, comparison |
| [@theyahia/vk-ads-mcp](https://www.npmjs.com/package/@theyahia/vk-ads-mcp) | v1.0.0 | 8 tools | VK Ads — campaigns, ads, statistics, targeting, budgets |

#### Логистика

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/cdek-mcp](https://www.npmjs.com/package/@theyahia/cdek-mcp) | v2.0.1 | 14 tools | CDEK — tariff calculation, order management, tracking, cities, delivery points, webhooks |
| [@theyahia/boxberry-mcp](https://www.npmjs.com/package/@theyahia/boxberry-mcp) | v1.0.1 | 4 tools | Boxberry — city/point search, delivery calculation, tracking |
| [@theyahia/delovye-linii-mcp](https://www.npmjs.com/package/@theyahia/delovye-linii-mcp) | v1.0.1 | 3 tools | Delovye Linii — tariff calculation, city search, tracking |
| [@theyahia/pochta-russia-mcp](https://www.npmjs.com/package/@theyahia/pochta-russia-mcp) | v1.0.1 | 3 tools | Russian Post — tracking, tariff calculation, post office search |
| [@theyahia/yandex-delivery-mcp](https://www.npmjs.com/package/@theyahia/yandex-delivery-mcp) | v1.0.0 | 8 tools | Yandex Delivery — claims, tracking, price estimation |
| [@theyahia/ati-su-mcp](https://www.npmjs.com/package/@theyahia/ati-su-mcp) | v1.0.0 | 8 tools | ATI.su — cargo search, truck matching, company ratings |

#### HR

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/hh-mcp](https://www.npmjs.com/package/@theyahia/hh-mcp) | v2.0.0 | 16 tools | hh.ru — vacancy search, resumes, employers, salary stats, dictionaries, autocomplete |
| [@theyahia/superjob-mcp](https://www.npmjs.com/package/@theyahia/superjob-mcp) | v1.0.0 | 2 tools | SuperJob — vacancy search, employers |
| [@theyahia/huntflow-mcp](https://www.npmjs.com/package/@theyahia/huntflow-mcp) | v1.0.0 | 4 tools | HuntFlow ATS — vacancies, candidates, applicants |

#### Связь

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/vk-mcp](https://www.npmjs.com/package/@theyahia/vk-mcp) | v1.0.1 | 4 tools | VK — wall posts, news search, users, groups |
| [@theyahia/jivosite-mcp](https://www.npmjs.com/package/@theyahia/jivosite-mcp) | v1.0.1 | 3 tools | JivoSite — chats, agents, visitors |
| [@theyahia/mts-exolve-mcp](https://www.npmjs.com/package/@theyahia/mts-exolve-mcp) | v3.0.0 | 8 tools | MTS Exolve — SMS, calls, call recordings, phone numbers, Viber |
| [@theyahia/mango-office-mcp](https://www.npmjs.com/package/@theyahia/mango-office-mcp) | v1.0.1 | 2 tools | Mango Office — calls, users |
| [@theyahia/voximplant-mcp](https://www.npmjs.com/package/@theyahia/voximplant-mcp) | v1.0.1 | 3 tools | Voximplant — call history, users, SMS |
| [@theyahia/sms-ru-mcp](https://www.npmjs.com/package/@theyahia/sms-ru-mcp) | v1.0.1 | 3 tools | SMS.RU — send SMS, check status, balance |
| [@theyahia/tilda-mcp](https://www.npmjs.com/package/@theyahia/tilda-mcp) | v1.0.0 | 3 tools | Tilda — projects, pages |
| [@theyahia/yandex-360-mcp](https://www.npmjs.com/package/@theyahia/yandex-360-mcp) | v1.0.0 | 10 tools | Yandex 360 — users, departments, groups, disk, calendar |

#### AI / Облако

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/gigachat-mcp](https://www.npmjs.com/package/@theyahia/gigachat-mcp) | v3.0.0 | 8 tools | GigaChat (Sber) — chat, models, embeddings, token count, image generation, balance, assistants |
| [@theyahia/yandexgpt-mcp](https://www.npmjs.com/package/@theyahia/yandexgpt-mcp) | v3.0.0 | 8 tools | YandexGPT — completion, async completion, embeddings, classification, summarization, tokenization |
| [@theyahia/salutespeech-mcp](https://www.npmjs.com/package/@theyahia/salutespeech-mcp) | v1.0.0 | 2 tools | SaluteSpeech (Sber) — speech recognition and synthesis |
| [@theyahia/yandex-speechkit-mcp](https://www.npmjs.com/package/@theyahia/yandex-speechkit-mcp) | v1.0.0 | 2 tools | Yandex SpeechKit — speech recognition and synthesis |
| [@theyahia/yandex-cloud-mcp](https://www.npmjs.com/package/@theyahia/yandex-cloud-mcp) | v1.0.0 | 8 tools | Yandex Cloud — compute, storage, serverless, operations |

#### Финансы / Фискальное

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/sber-mcp](https://www.npmjs.com/package/@theyahia/sber-mcp) | v1.0.0 | 5 tools | Sberbank — accounts, statements |
| [@theyahia/alfa-bank-mcp](https://www.npmjs.com/package/@theyahia/alfa-bank-mcp) | v1.0.0 | 8 tools | Alfa-Bank Business — accounts, payments, statements, exchange rates |
| [@theyahia/tochka-bank-mcp](https://www.npmjs.com/package/@theyahia/tochka-bank-mcp) | v1.0.0 | 8 tools | Tochka Bank — accounts, payments, counterparties, company info |
| [@theyahia/1c-rest-mcp](https://www.npmjs.com/package/@theyahia/1c-rest-mcp) | v1.0.0 | 6 tools | 1C REST API — catalogs, documents |
| [@theyahia/atol-online-mcp](https://www.npmjs.com/package/@theyahia/atol-online-mcp) | v1.0.0 | 8 tools | ATOL Online — fiscal receipts (54-FZ compliance) |
| [@theyahia/kontur-diadoc-mcp](https://www.npmjs.com/package/@theyahia/kontur-diadoc-mcp) | v1.0.0 | 8 tools | Kontur.Diadoc — electronic document interchange |

#### Данные / Право

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@metarebalance/dadata-mcp](https://www.npmjs.com/package/@metarebalance/dadata-mcp) | v1.0.4 | 31 tools | DaData — address validation, company lookup, phone cleaning, geocoding |
| [@theyahia/kontur-focus-mcp](https://www.npmjs.com/package/@theyahia/kontur-focus-mcp) | v3.0.0 | 8 tools | Kontur.Focus — company search, EGRUL extracts, financial statements, arbitration, bankruptcy |
| [@theyahia/cbr-mcp](https://www.npmjs.com/package/@theyahia/cbr-mcp) | v1.0.0 | 5 tools | Central Bank of Russia — currency rates, key rate, precious metals, conversion |
| [@theyahia/chestnyznak-mcp](https://www.npmjs.com/package/@theyahia/chestnyznak-mcp) | v1.0.0 | 2 tools | Chestniy ZNAK — product marking verification |
| [@theyahia/casebook-mcp](https://www.npmjs.com/package/@theyahia/casebook-mcp) | v1.0.0 | 8 tools | Casebook/Pravo.ru — legal case search |
| [@theyahia/spark-interfax-mcp](https://www.npmjs.com/package/@theyahia/spark-interfax-mcp) | v1.0.0 | 8 tools | SPARK-Interfax — business intelligence |
| [@theyahia/2gis-mcp](https://www.npmjs.com/package/@theyahia/2gis-mcp) | v1.0.0 | 8 tools | 2GIS — places, geocoding, directions, reviews |
| [@theyahia/yandex-maps-mcp](https://www.npmjs.com/package/@theyahia/yandex-maps-mcp) | v1.0.0 | 8 tools | Yandex Maps — geocoding, routing, places search, static maps |

#### Прочее

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/travelpayouts-mcp](https://www.npmjs.com/package/@theyahia/travelpayouts-mcp) | v2.0.0 | 11 tools | Travelpayouts — flight search, price calendar, popular directions, hotel search |
| [@theyahia/getcourse-mcp](https://www.npmjs.com/package/@theyahia/getcourse-mcp) | v1.0.0 | 5 tools | GetCourse — users, deals (online school platform) |

---

### Казахстан

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/kaspi-mcp](https://www.npmjs.com/package/@theyahia/kaspi-mcp) | v1.0.0 | 3 tools | Kaspi.kz — shop orders and products |
| [@theyahia/halyk-epay-mcp](https://www.npmjs.com/package/@theyahia/halyk-epay-mcp) | v1.0.0 | 8 tools | Halyk Bank ePay — payment gateway |
| [@theyahia/forte-bank-mcp](https://www.npmjs.com/package/@theyahia/forte-bank-mcp) | v1.0.0 | 8 tools | Forte Bank — payment gateway |

### Узбекистан

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/click-mcp](https://www.npmjs.com/package/@theyahia/click-mcp) | v1.0.0 | 8 tools | Click — payment system |
| [@theyahia/payme-mcp](https://www.npmjs.com/package/@theyahia/payme-mcp) | v1.0.0 | 8 tools | Payme — payment system |
| [@theyahia/factura-uz-mcp](https://www.npmjs.com/package/@theyahia/factura-uz-mcp) | v1.0.0 | 8 tools | Factura.uz — electronic invoicing |

### Грузия

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/bog-ipay-mcp](https://www.npmjs.com/package/@theyahia/bog-ipay-mcp) | v1.0.0 | 8 tools | Bank of Georgia iPay — payment gateway |
| [@theyahia/tbc-bank-mcp](https://www.npmjs.com/package/@theyahia/tbc-bank-mcp) | v1.0.0 | 8 tools | TBC Bank — payment gateway |

### Беларусь

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/bepaid-mcp](https://www.npmjs.com/package/@theyahia/bepaid-mcp) | v1.0.0 | 8 tools | bePaid — payment gateway |

### Молдова

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/maib-mcp](https://www.npmjs.com/package/@theyahia/maib-mcp) | v1.0.0 | 8 tools | MAIB — e-commerce payments |

### Турция

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/iyzico-mcp](https://www.npmjs.com/package/@theyahia/iyzico-mcp) | v1.0.1 | 8 tools | iyzico — payment gateway |
| [@theyahia/is-bankasi-mcp](https://www.npmjs.com/package/@theyahia/is-bankasi-mcp) | v1.0.0 | 8 tools | Isbank — developer API |
| [@theyahia/parasut-mcp](https://www.npmjs.com/package/@theyahia/parasut-mcp) | v1.0.0 | 8 tools | Parasut — accounting |
| [@theyahia/getir-mcp](https://www.npmjs.com/package/@theyahia/getir-mcp) | v1.0.0 | 8 tools | Getir — partner API |
| [@theyahia/hepsiburada-mcp](https://www.npmjs.com/package/@theyahia/hepsiburada-mcp) | v1.0.0 | 8 tools | Hepsiburada — marketplace |
| [@theyahia/trendyol-mcp](https://www.npmjs.com/package/@theyahia/trendyol-mcp) | v1.0.0 | 9 tools | Trendyol — marketplace |
| [@theyahia/ileti-merkezi-mcp](https://www.npmjs.com/package/@theyahia/ileti-merkezi-mcp) | v1.0.0 | 8 tools | Ileti Merkezi — SMS API |

### Залив (ОАЭ + Саудовская Аравия)

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/tap-payments-mcp](https://www.npmjs.com/package/@theyahia/tap-payments-mcp) | v1.1.0 | 8 tools | Tap Payments — payment gateway (UAE/Saudi/Kuwait/Bahrain) |
| [@theyahia/moyasar-mcp](https://www.npmjs.com/package/@theyahia/moyasar-mcp) | v1.1.0 | 8 tools | Moyasar — payment gateway (Saudi Arabia) |
| [@theyahia/foodics-mcp](https://www.npmjs.com/package/@theyahia/foodics-mcp) | v1.1.0 | 8 tools | Foodics — POS/restaurant platform (UAE/Saudi) |
| [@theyahia/tabby-mcp](https://www.npmjs.com/package/@theyahia/tabby-mcp) | v1.1.0 | 8 tools | Tabby — BNPL platform (UAE/Saudi) |
| [@theyahia/salla-mcp](https://www.npmjs.com/package/@theyahia/salla-mcp) | v1.1.0 | 9 tools | Salla — e-commerce platform (Saudi Arabia) |
| [@theyahia/unifonic-mcp](https://www.npmjs.com/package/@theyahia/unifonic-mcp) | v1.1.0 | 8 tools | Unifonic — CPaaS: SMS, Voice, WhatsApp (Saudi Arabia) |
| [@theyahia/paytabs-mcp](https://www.npmjs.com/package/@theyahia/paytabs-mcp) | v1.1.0 | 8 tools | PayTabs — payment gateway (MENA region) |

### Латинская Америка (Бразилия + Мексика)

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/asaas-mcp](https://www.npmjs.com/package/@theyahia/asaas-mcp) | v1.0.0 | 9 tools | Asaas — payment and Pix gateway (Brazil) |
| [@theyahia/pagarme-mcp](https://www.npmjs.com/package/@theyahia/pagarme-mcp) | v1.0.0 | 10 tools | Pagar.me — payment gateway (Brazil) |
| [@theyahia/hotmart-mcp](https://www.npmjs.com/package/@theyahia/hotmart-mcp) | v1.0.0 | 8 tools | Hotmart — digital products platform (Brazil) |
| [@theyahia/ifood-mcp](https://www.npmjs.com/package/@theyahia/ifood-mcp) | v1.0.0 | 8 tools | iFood — merchant integration (Brazil) |
| [@theyahia/nfeio-mcp](https://www.npmjs.com/package/@theyahia/nfeio-mcp) | v1.0.0 | 10 tools | NFe.io — fiscal document platform (Brazil) |
| [@theyahia/correios-mcp](https://www.npmjs.com/package/@theyahia/correios-mcp) | v1.0.0 | 8 tools | Correios — Brazilian postal service |
| [@theyahia/facturapi-mcp](https://www.npmjs.com/package/@theyahia/facturapi-mcp) | v1.0.0 | 10 tools | Facturapi — Mexican e-invoicing (CFDI) |

### Африка (Нигерия + Кения + ЮАР + Алжир)

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/payfast-mcp](https://www.npmjs.com/package/@theyahia/payfast-mcp) | v1.0.0 | 8 tools | PayFast — payment gateway (South Africa) |
| [@theyahia/yoco-mcp](https://www.npmjs.com/package/@theyahia/yoco-mcp) | v1.0.0 | 8 tools | Yoco — payment gateway (South Africa) |
| [@theyahia/nomba-mcp](https://www.npmjs.com/package/@theyahia/nomba-mcp) | v1.0.0 | 8 tools | Nomba — payment and POS platform (Nigeria) |
| [@theyahia/termii-mcp](https://www.npmjs.com/package/@theyahia/termii-mcp) | v1.0.0 | 8 tools | Termii — SMS and messaging (Nigeria) |
| [@theyahia/africas-talking-mcp](https://www.npmjs.com/package/@theyahia/africas-talking-mcp) | v1.0.0 | 8 tools | Africa's Talking — communications platform (Kenya/Nigeria/Uganda) |
| [@theyahia/chargily-mcp](https://www.npmjs.com/package/@theyahia/chargily-mcp) | v1.0.0 | 8 tools | Chargily Pay — payment gateway (Algeria) |

### Юго-Восточная Азия (Индонезия + Вьетнам + Филиппины)

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/midtrans-mcp](https://www.npmjs.com/package/@theyahia/midtrans-mcp) | v1.0.1 | 8 tools | Midtrans — payment gateway (Indonesia) |
| [@theyahia/xendit-mcp](https://www.npmjs.com/package/@theyahia/xendit-mcp) | v1.0.1 | 10 tools | Xendit — payment gateway (Indonesia/Philippines) |
| [@theyahia/rajaongkir-mcp](https://www.npmjs.com/package/@theyahia/rajaongkir-mcp) | v1.0.1 | 8 tools | RajaOngkir — shipping cost API (Indonesia) |
| [@theyahia/vnpay-mcp](https://www.npmjs.com/package/@theyahia/vnpay-mcp) | v1.0.1 | 8 tools | VNPay — payment gateway (Vietnam) |
| [@theyahia/momo-vn-mcp](https://www.npmjs.com/package/@theyahia/momo-vn-mcp) | v1.0.1 | 8 tools | MoMo — payment gateway (Vietnam) |
| [@theyahia/zalo-oa-mcp](https://www.npmjs.com/package/@theyahia/zalo-oa-mcp) | v1.0.1 | 8 tools | Zalo Official Account — messaging API (Vietnam) |
| [@theyahia/paymongo-mcp](https://www.npmjs.com/package/@theyahia/paymongo-mcp) | v1.0.1 | 9 tools | PayMongo — payment gateway (Philippines) |

### MENA (Иран + Пакистан)

| Пакет | Статус | Инструменты | Описание |
|---------|--------|-------|-------------|
| [@theyahia/zarinpal-mcp](https://www.npmjs.com/package/@theyahia/zarinpal-mcp) | v1.0.1 | 8 tools | Zarinpal — payment gateway (Iran) |
| [@theyahia/idpay-mcp](https://www.npmjs.com/package/@theyahia/idpay-mcp) | v1.0.0 | 8 tools | IDPay — payment gateway (Iran) |
| [@theyahia/kavenegar-mcp](https://www.npmjs.com/package/@theyahia/kavenegar-mcp) | v1.0.0 | 8 tools | Kavenegar — SMS gateway (Iran) |
| [@theyahia/neshan-maps-mcp](https://www.npmjs.com/package/@theyahia/neshan-maps-mcp) | v1.0.0 | 8 tools | Neshan Maps — maps API (Iran) |
| [@theyahia/easypaisa-mcp](https://www.npmjs.com/package/@theyahia/easypaisa-mcp) | v1.0.0 | 8 tools | Easypaisa — mobile wallet and payments (Pakistan) |
| [@theyahia/jazzcash-mcp](https://www.npmjs.com/package/@theyahia/jazzcash-mcp) | v1.0.0 | 8 tools | JazzCash — mobile wallet and payments (Pakistan) |

---

## Использование с Claude Desktop

Добавь в `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "yookassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/yookassa-mcp"],
      "env": {
        "YOOKASSA_SHOP_ID": "your-shop-id",
        "YOOKASSA_SECRET_KEY": "your-secret-key"
      }
    },
    "dadata": {
      "command": "npx",
      "args": ["-y", "@metarebalance/dadata-mcp"],
      "env": {
        "DADATA_API_KEY": "your-key"
      }
    }
  }
}
```

## Использование с Cursor / VS Code

Добавь в `.cursor/mcp.json` или `.vscode/mcp.json`:

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

## Демо: e-commerce стек

Связываем DaData + МойСклад + СДЭК + ЮKassa в один agent flow:

```
1. dadata-mcp:    suggest_company("7707083893")  → валидация контрагента по ИНН
2. moysklad-mcp:  create_customer_order(...)     → создать заказ покупателя
3. cdek-mcp:      calculate_tariff(...)          → рассчитать стоимость доставки
4. cdek-mcp:      create_order(...)              → оформить доставку
5. yookassa-mcp:  create_payment(...)            → принять оплату
6. atol-online-mcp: create_receipt(...)          → выдать фискальный чек (54-ФЗ)
```

---

## Разработка монорепо

Этот репозиторий — **Turborepo + pnpm workspace**. Production-серверы лежат в [`servers/`](./servers/), общая библиотека в [`packages/core`](./packages/core), CI/release пайплайны в [`.github/workflows/`](./.github/workflows/).

Pipeline-серверы (100+ в очереди) живут отдельными репозиториями под [@theYahia](https://github.com/theYahia?tab=repositories) — у каждого собственная git-история и npm publish target.

```bash
git clone https://github.com/theYahia/WWmcp.git
cd WWmcp
pnpm install
pnpm build                                # собрать все workspace'ы
pnpm dev --filter @theyahia/moysklad-mcp  # dev один сервер
pnpm test                                 # тесты по всему монорепо
```

Внутренняя документация: [`docs/planning/`](./docs/planning/) (PLAN, STRUCTURE, BUILD_QUEUE и др.) · Правила проекта: [`CLAUDE.md`](./CLAUDE.md) · История миграции: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

---

## Автор

[@theYahia](https://github.com/theYahia) · Telegram: [@vhodvai](https://t.me/vhodvai) · npm: [npmjs.com/org/theyahia](https://www.npmjs.com/org/theyahia)

## Лицензия

MIT
