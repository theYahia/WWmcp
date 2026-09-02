# MCP servers for Russian, CIS and non-Western APIs

**English** | [Русский](README.ru.md)

> **46 servers · 501 tools · one npm scope: [@theyahia](https://www.npmjs.com/org/theyahia)**
>
> Counts come from `node scripts/catalog.mjs`: every server is started over stdio and asked for `listTools()`. Last run — 2026-09-02.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/mcp-core?label=downloads)](https://www.npmjs.com/org/theyahia)
[![GitHub stars](https://img.shields.io/github/stars/theYahia/WWmcp?style=social)](https://github.com/theYahia/WWmcp/stargazers)
![Servers](https://img.shields.io/badge/MCP_Servers-46-blue)
![Tools](https://img.shields.io/badge/Tools-501-green)

MCP servers for APIs that Western catalogs skip: Russian and CIS services (1C, Wildberries, YooKassa, CDEK, hh.ru, amoCRM, MoySklad, Avito) plus payment and SMS providers in Turkey, the Gulf, Egypt, Ethiopia, Bangladesh and Latin America. They plug into Claude Desktop, Cursor, VS Code and any other MCP client.

The catalog splits in two: **[Russia and CIS](#servers-for-russia-and-cis)** — 39 servers, 429 tools, the bulk of it; **[emerging markets](#servers-for-emerging-markets)** — 7 servers, 72 tools outside the post-Soviet space.

**What is inside:**

- Shared core `@theyahia/mcp-core`: auth, retries, structured errors, two transports (stdio and Streamable HTTP).
- TypeScript, Node.js >= 18, vitest tests, changesets releases, GitHub Actions CI.
- New server: `npx @theyahia/create-mcp <name>` scaffolds from `servers/_template/`.

> Ready-made workflows for these servers: [mcp-skills](https://github.com/theYahia/mcp-skills) — e-commerce, HR, marketing, finance.

## Contents

- [Quick start](#quick-start)
- [Servers for Russia and CIS](#servers-for-russia-and-cis)
- [Servers for emerging markets](#servers-for-emerging-markets)
- [Separate repositories](#separate-repositories)
- [Client configuration](#client-configuration)
- [Monorepo development](#monorepo-development)
- [Contributing](#contributing)
- [Community](#community)

## Quick start

### 1. Add servers to the Claude Desktop config

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

### 2. Ask the AI

> "Check stock for SKU TS-100 in MoySklad, calculate CDEK shipping to Novosibirsk, and generate a YooKassa payment link."

### 3. The AI does the rest

MoySklad → stock and price → CDEK → tariff → YooKassa → payment link. One prompt, no manual API work.

---

## Servers for Russia and CIS

39 servers, 429 tools. Russia, Kazakhstan, Uzbekistan.

#### Payments

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/yookassa-mcp](https://www.npmjs.com/package/@theyahia/yookassa-mcp) | v3.0.0 | 20 tools | Payments, refunds, receipts (54-FZ), payouts, SBP, splits, webhooks |
| [@theyahia/tkassa-mcp](https://www.npmjs.com/package/@theyahia/tkassa-mcp) | v2.0.1 | 16 tools | T-Bank (Tinkoff) acquiring: payments, refunds, cards, SBP QR, receipts |
| [@theyahia/payme-mcp](https://www.npmjs.com/package/@theyahia/payme-mcp) | v1.1.0 | 10 tools | Payme (Uzbekistan): cards, receipts, subscription payments |
| [@theyahia/cloudpayments-mcp](https://www.npmjs.com/package/@theyahia/cloudpayments-mcp) | v1.2.0 | 6 tools | Charge, two-stage auth/confirm, void, refund, transaction lookup |
| [@theyahia/robokassa-mcp](https://www.npmjs.com/package/@theyahia/robokassa-mcp) | v1.2.0 | 2 tools | Payment links, invoice status |

#### ERP, accounting, CRM

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/retailcrm-mcp](https://www.npmjs.com/package/@theyahia/retailcrm-mcp) | v3.0.0 | 39 tools | Orders, customers, products, payments, tasks, e-commerce analytics |
| [@theyahia/aprovodka](https://www.npmjs.com/package/@theyahia/aprovodka) | v4.3.0 | 34 tools | 1C:Enterprise over OData: catalogs, documents, registers, accounting, batch |
| [@theyahia/planfix-mcp](https://www.npmjs.com/package/@theyahia/planfix-mcp) | v1.2.0 | 20 tools | Tasks, contacts, projects, comments, custom fields, files |
| [@theyahia/elma365-mcp](https://www.npmjs.com/package/@theyahia/elma365-mcp) | v2.0.0 | 20 tools | BPM: processes, tasks, app items, schema discovery |
| [@theyahia/amocrm-mcp](https://www.npmjs.com/package/@theyahia/amocrm-mcp) | v2.0.2 | 19 tools | Leads, contacts, companies, pipelines, tasks, notes, unsorted |
| [@theyahia/moysklad-mcp](https://www.npmjs.com/package/@theyahia/moysklad-mcp) | v2.1.0 | 10 tools | Products, stock, orders, counterparties, supplies, profit report |
| [@theyahia/megaplan-mcp](https://www.npmjs.com/package/@theyahia/megaplan-mcp) | v3.0.0 | 8 tools | Tasks, deals, projects, employees, comments |
| [@theyahia/bitrix24-mcp](https://www.npmjs.com/package/@theyahia/bitrix24-mcp) | v1.2.0 | 4 tools | Deals, contacts, tasks over an inbound webhook |
| [@theyahia/getcourse-mcp](https://www.npmjs.com/package/@theyahia/getcourse-mcp) | v1.2.0 | 3 tools | Online school: users, deals |

#### Marketplaces and classifieds

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/wildberries-mcp](https://www.npmjs.com/package/@theyahia/wildberries-mcp) | v3.1.0 | 30 tools | Seller API: products, prices, stocks, orders, FBS supplies, analytics, feedback |
| [@theyahia/avito-mcp](https://www.npmjs.com/package/@theyahia/avito-mcp) | v0.2.0 | 3 tools | Seller items, item details, messenger chats |
| [@theyahia/kaspi-mcp](https://www.npmjs.com/package/@theyahia/kaspi-mcp) | v1.0.2 | 3 tools | Kaspi.kz (Kazakhstan): shop orders, products |

#### Logistics

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/cdek-mcp](https://www.npmjs.com/package/@theyahia/cdek-mcp) | v2.2.0 | 16 tools | Tariffs, orders, courier pickup, tracking, pickup points, labels, webhooks |
| [@theyahia/boxberry-mcp](https://www.npmjs.com/package/@theyahia/boxberry-mcp) | v1.1.1 | 6 tools | Pickup points, delivery cost, tracking, zip check |
| [@theyahia/delovye-linii-mcp](https://www.npmjs.com/package/@theyahia/delovye-linii-mcp) | v1.1.1 | 6 tools | Freight tariffs, terminals, orders, tracking |
| [@theyahia/pochta-russia-mcp](https://www.npmjs.com/package/@theyahia/pochta-russia-mcp) | v2.0.0 | 6 tools | Tracking, tariffs, delivery time, post offices, address normalization |

#### HR

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/hh-mcp](https://www.npmjs.com/package/@theyahia/hh-mcp) | v2.1.0 | 19 tools | Vacancy and resume search, employers, salary stats, dictionaries |
| [@theyahia/huntflow-mcp](https://www.npmjs.com/package/@theyahia/huntflow-mcp) | v1.2.0 | 14 tools | ATS: vacancies, applicants, resumes, stages, sources |

#### Marketing, analytics, web

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/unisender-mcp](https://www.npmjs.com/package/@theyahia/unisender-mcp) | v1.1.1 | 10 tools | Lists, contacts, templates, campaigns, delivery stats |
| [@theyahia/vk-ads-mcp](https://www.npmjs.com/package/@theyahia/vk-ads-mcp) | v3.0.0 | 8 tools | Campaigns, ads, targeting, budgets, statistics |
| [@theyahia/tilda-mcp](https://www.npmjs.com/package/@theyahia/tilda-mcp) | v1.2.0 | 7 tools | Projects, pages, page export |
| [@theyahia/calltouch-mcp](https://www.npmjs.com/package/@theyahia/calltouch-mcp) | v1.2.1 | 7 tools | Call tracking: calls, leads, sources, statistics |
| [@theyahia/mindbox-mcp](https://www.npmjs.com/package/@theyahia/mindbox-mcp) | v1.2.0 | 6 tools | CDP: customer profiles, orders, segments, operations |
| [@theyahia/roistat-mcp](https://www.npmjs.com/package/@theyahia/roistat-mcp) | v1.1.1 | 6 tools | Marketing analytics: visits, leads, costs, channels |
| [@theyahia/yandex-search-mcp](https://www.npmjs.com/package/@theyahia/yandex-search-mcp) | v1.0.0 | 3 tools | Wordstat: top requests, dynamics, regions |

#### Telephony and messaging

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/mts-exolve-mcp](https://www.npmjs.com/package/@theyahia/mts-exolve-mcp) | v3.0.1 | 8 tools | SMS, calls, recordings, Viber, number provisioning |
| [@theyahia/mango-office-mcp](https://www.npmjs.com/package/@theyahia/mango-office-mcp) | v1.1.1 | 8 tools | Cloud PBX: calls, users, callback, stats, recordings, SMS |

#### AI and speech

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/gigachat-mcp](https://www.npmjs.com/package/@theyahia/gigachat-mcp) | v3.0.1 | 8 tools | Chat, embeddings, image generation, token count, balance |
| [@theyahia/salutespeech-mcp](https://www.npmjs.com/package/@theyahia/salutespeech-mcp) | v1.2.0 | 5 tools | Speech recognition and synthesis |

#### Data and reference

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/kontur-focus-mcp](https://www.npmjs.com/package/@theyahia/kontur-focus-mcp) | v3.0.1 | 8 tools | Counterparty check: EGRUL, financials, arbitration, bankruptcy, licenses |
| [@theyahia/2gis-mcp](https://www.npmjs.com/package/@theyahia/2gis-mcp) | v3.0.0 | 8 tools | Places search, geocoding, directions, reviews |
| [@theyahia/cbr-mcp](https://www.npmjs.com/package/@theyahia/cbr-mcp) | v1.1.0 | 5 tools | Bank of Russia: FX rates, key rate, precious metals, conversion |
| [@theyahia/cbu-mcp](https://www.npmjs.com/package/@theyahia/cbu-mcp) | v1.1.0 | 5 tools | Central Bank of Uzbekistan: FX rates, history, dynamics |

#### Travel

| Package | Version | Tools | What it does |
|---|---|---|---|
| [@theyahia/travelpayouts-mcp](https://www.npmjs.com/package/@theyahia/travelpayouts-mcp) | v2.0.1 | 13 tools | Aviasales: flight prices, price calendar, hotels, airport lookup |

`retailcrm` and `aprovodka` register different tool sets depending on the environment (`RETAILCRM_READONLY`, `ONEC_SERVICES`, `ONEC_WRITE_MODE`) — the table shows the default configuration. MCP prompts (`server.prompt`) are not counted as tools.

---

## Servers for emerging markets

7 servers, 72 tools outside the CIS. This half is younger and narrower than the CIS one; request a country through the [new server issue](https://github.com/theYahia/WWmcp/issues/new?template=new-server.yml).

| Package | Region | Version | Tools | What it does |
|---|---|---|---|---|
| [@theyahia/salla-mcp](https://www.npmjs.com/package/@theyahia/salla-mcp) | Saudi Arabia | v3.1.0 | 22 tools | E-commerce: products, orders, customers, categories, coupons |
| [@theyahia/mercadopago-mcp](https://www.npmjs.com/package/@theyahia/mercadopago-mcp) | Latin America (9 countries) | v1.1.0 | 10 tools | Payments, refunds, checkout preferences, merchant orders |
| [@theyahia/bkash-mcp](https://www.npmjs.com/package/@theyahia/bkash-mcp) | Bangladesh | v1.1.0 | 8 tools | Tokenized Checkout: payments, refunds, agreements |
| [@theyahia/chapa-mcp](https://www.npmjs.com/package/@theyahia/chapa-mcp) | Ethiopia | v1.1.0 | 8 tools | Payments, verification, transfers, banks, balance |
| [@theyahia/fawaterak-mcp](https://www.npmjs.com/package/@theyahia/fawaterak-mcp) | Egypt | v1.1.0 | 8 tools | Invoices, payment methods (Fawry, cards, wallets, Meeza), refunds |
| [@theyahia/ileti-merkezi-mcp](https://www.npmjs.com/package/@theyahia/ileti-merkezi-mcp) | Turkey | v3.0.0 | 8 tools | SMS, bulk SMS, reports, contacts, blacklist |
| [@theyahia/orange-money-mcp](https://www.npmjs.com/package/@theyahia/orange-money-mcp) | Francophone Africa (11 countries) | v1.1.0 | 8 tools | WebPay: payments, status, cash-in, cash-out, transfers |

---

## Separate repositories

77 packages are published to npm under the same scope, but their code is **not in this monorepo** — each lives in its own repository. They cannot be built, tested or counted here, so check versions and tool counts on the npm package page.

The Source column links to the repository when it is public; "npm only" means there is no public repository.

<details>
<summary><b>77 packages outside the monorepo</b> (click to expand)</summary>

| Package | Region | Source | Description |
|---|---|---|---|
| [@metarebalance/dadata-mcp](https://www.npmjs.com/package/@metarebalance/dadata-mcp) | Russia | [github](https://github.com/theYahia/dadata-mcp) | DaData — address validation, company lookup, phone cleaning, geocoding |
| [@theyahia/alfa-bank-mcp](https://www.npmjs.com/package/@theyahia/alfa-bank-mcp) | Russia | [github](https://github.com/theYahia/alfa-bank-mcp) | Alfa-Bank Business — accounts, balances, statements, payment orders, counterparties, FX rates, payroll |
| [@theyahia/appmetrica-mcp](https://www.npmjs.com/package/@theyahia/appmetrica-mcp) | Russia | [github](https://github.com/theYahia/appmetrica-mcp) | AppMetrica — mobile analytics, reports, cohorts, profiles, push campaigns, crashes |
| [@theyahia/ati-su-mcp](https://www.npmjs.com/package/@theyahia/ati-su-mcp) | Russia | [github](https://github.com/theYahia/ati-su-mcp) | ATI.su — cargo search, truck matching, company ratings |
| [@theyahia/atol-online-mcp](https://www.npmjs.com/package/@theyahia/atol-online-mcp) | Russia | npm only | ATOL Online — fiscal receipts (54-FZ compliance) |
| [@theyahia/casebook-mcp](https://www.npmjs.com/package/@theyahia/casebook-mcp) | Russia | npm only | Casebook/Pravo.ru — legal case search |
| [@theyahia/chestnyznak-mcp](https://www.npmjs.com/package/@theyahia/chestnyznak-mcp) | Russia | [github](https://github.com/theYahia/chestnyznak-mcp) | Chestniy ZNAK — product marking verification |
| [@theyahia/jivosite-mcp](https://www.npmjs.com/package/@theyahia/jivosite-mcp) | Russia | [github](https://github.com/theYahia/jivosite-mcp) | JivoSite — chats, agents, visitors |
| [@theyahia/kaiten-mcp](https://www.npmjs.com/package/@theyahia/kaiten-mcp) | Russia | [github](https://github.com/theYahia/kaiten-mcp) | Kaiten — boards, cards, columns, tags, users, comments |
| [@theyahia/kontur-diadoc-mcp](https://www.npmjs.com/package/@theyahia/kontur-diadoc-mcp) | Russia | [github](https://github.com/theYahia/kontur-diadoc-mcp) | Kontur.Diadoc — electronic document interchange |
| [@theyahia/prodamus-mcp](https://www.npmjs.com/package/@theyahia/prodamus-mcp) | Russia | npm only | Prodamus — payments, subscriptions, refunds, invoices |
| [@theyahia/sber-mcp](https://www.npmjs.com/package/@theyahia/sber-mcp) | Russia | [github](https://github.com/theYahia/sber-mcp) | Sberbank — accounts, statements |
| [@theyahia/sberbank-acquiring-mcp](https://www.npmjs.com/package/@theyahia/sberbank-acquiring-mcp) | Russia | npm only | Sberbank eCommerce Acquiring — online payments, refunds, pre-auth, card tokenization |
| [@theyahia/sendpulse-mcp](https://www.npmjs.com/package/@theyahia/sendpulse-mcp) | Russia | [github](https://github.com/theYahia/sendpulse-mcp) | SendPulse — mailing lists, email sending, statistics |
| [@theyahia/sms-ru-mcp](https://www.npmjs.com/package/@theyahia/sms-ru-mcp) | Russia | [github](https://github.com/theYahia/sms-ru-mcp) | SMS.RU — send SMS, check status, balance |
| [@theyahia/spark-interfax-mcp](https://www.npmjs.com/package/@theyahia/spark-interfax-mcp) | Russia | npm only | SPARK-Interfax — business intelligence |
| [@theyahia/superjob-mcp](https://www.npmjs.com/package/@theyahia/superjob-mcp) | Russia | [github](https://github.com/theYahia/superjob-mcp) | SuperJob — vacancy search, employers |
| [@theyahia/tgstat-mcp](https://www.npmjs.com/package/@theyahia/tgstat-mcp) | Russia | [github](https://github.com/theYahia/tgstat-mcp) | TGStat — Telegram channel analytics, search, posts, stats, mentions, comparison |
| [@theyahia/tochka-bank-mcp](https://www.npmjs.com/package/@theyahia/tochka-bank-mcp) | Russia | [github](https://github.com/theYahia/tochka-bank-mcp) | Tochka Bank — accounts, payments, counterparties, company info |
| [@theyahia/vk-mcp](https://www.npmjs.com/package/@theyahia/vk-mcp) | Russia | [github](https://github.com/theYahia/vk-mcp) | VK — wall posts, news search, users, groups |
| [@theyahia/voximplant-mcp](https://www.npmjs.com/package/@theyahia/voximplant-mcp) | Russia | [github](https://github.com/theYahia/voximplant-mcp) | Voximplant — call history, users, SMS |
| [@theyahia/yandex-360-mcp](https://www.npmjs.com/package/@theyahia/yandex-360-mcp) | Russia | [github](https://github.com/theYahia/yandex-360-mcp) | Yandex 360 — users, departments, groups, disk, calendar |
| [@theyahia/yandex-cloud-mcp](https://www.npmjs.com/package/@theyahia/yandex-cloud-mcp) | Russia | [github](https://github.com/theYahia/yandex-cloud-mcp) | Yandex Cloud — compute, storage, serverless, operations |
| [@theyahia/yandex-delivery-mcp](https://www.npmjs.com/package/@theyahia/yandex-delivery-mcp) | Russia | npm only | Yandex Delivery — claims, tracking, price estimation |
| [@theyahia/yandex-direct-mcp](https://www.npmjs.com/package/@theyahia/yandex-direct-mcp) | Russia | [github](https://github.com/theYahia/yandex-direct-mcp) | Yandex.Direct — campaigns, ad groups, ads, keywords, statistics, account |
| [@theyahia/yandex-maps-mcp](https://www.npmjs.com/package/@theyahia/yandex-maps-mcp) | Russia | [github](https://github.com/theYahia/yandex-maps-mcp) | Yandex Maps — geocoding, routing, places search, static maps |
| [@theyahia/yandex-metrika-mcp](https://www.npmjs.com/package/@theyahia/yandex-metrika-mcp) | Russia | [github](https://github.com/theYahia/yandex-metrika-mcp) | Yandex.Metrika — counters, goals, reports, logs, traffic analysis |
| [@theyahia/yandex-speechkit-mcp](https://www.npmjs.com/package/@theyahia/yandex-speechkit-mcp) | Russia | [github](https://github.com/theYahia/yandex-speechkit-mcp) | Yandex SpeechKit — speech recognition and synthesis |
| [@theyahia/yandex-tracker-mcp](https://www.npmjs.com/package/@theyahia/yandex-tracker-mcp) | Russia | [github](https://github.com/theYahia/yandex-tracker-mcp) | Yandex Tracker — issues, queues, comments, worklogs |
| [@theyahia/yandex-webmaster-mcp](https://www.npmjs.com/package/@theyahia/yandex-webmaster-mcp) | Russia | [github](https://github.com/theYahia/yandex-webmaster-mcp) | Yandex.Webmaster — hosts, search queries, indexing status |
| [@theyahia/yandexgpt-mcp](https://www.npmjs.com/package/@theyahia/yandexgpt-mcp) | Russia | [github](https://github.com/theYahia/yandexgpt-mcp) | YandexGPT — completion, async completion, embeddings, classification, summarization, tokenization |
| [@theyahia/forte-bank-mcp](https://www.npmjs.com/package/@theyahia/forte-bank-mcp) | Kazakhstan | npm only | Forte Bank — payment gateway |
| [@theyahia/halyk-epay-mcp](https://www.npmjs.com/package/@theyahia/halyk-epay-mcp) | Kazakhstan | npm only | Halyk Bank ePay — payment gateway |
| [@theyahia/click-mcp](https://www.npmjs.com/package/@theyahia/click-mcp) | Uzbekistan | npm only | Click — payment system |
| [@theyahia/factura-uz-mcp](https://www.npmjs.com/package/@theyahia/factura-uz-mcp) | Uzbekistan | npm only | Factura.uz — electronic invoicing |
| [@theyahia/bog-ipay-mcp](https://www.npmjs.com/package/@theyahia/bog-ipay-mcp) | Georgia | npm only | Bank of Georgia iPay — payment gateway |
| [@theyahia/tbc-bank-mcp](https://www.npmjs.com/package/@theyahia/tbc-bank-mcp) | Georgia | npm only | TBC Bank — payment gateway |
| [@theyahia/bepaid-mcp](https://www.npmjs.com/package/@theyahia/bepaid-mcp) | Belarus | npm only | bePaid — payment gateway |
| [@theyahia/maib-mcp](https://www.npmjs.com/package/@theyahia/maib-mcp) | Moldova | npm only | MAIB — e-commerce payments |
| [@theyahia/getir-mcp](https://www.npmjs.com/package/@theyahia/getir-mcp) | Turkey | npm only | Getir — partner API |
| [@theyahia/hepsiburada-mcp](https://www.npmjs.com/package/@theyahia/hepsiburada-mcp) | Turkey | npm only | Hepsiburada — marketplace |
| [@theyahia/is-bankasi-mcp](https://www.npmjs.com/package/@theyahia/is-bankasi-mcp) | Turkey | npm only | Isbank — developer API |
| [@theyahia/iyzico-mcp](https://www.npmjs.com/package/@theyahia/iyzico-mcp) | Turkey | npm only | iyzico — payment gateway |
| [@theyahia/parasut-mcp](https://www.npmjs.com/package/@theyahia/parasut-mcp) | Turkey | [github](https://github.com/theYahia/parasut-mcp) | Parasut — accounting |
| [@theyahia/trendyol-mcp](https://www.npmjs.com/package/@theyahia/trendyol-mcp) | Turkey | npm only | Trendyol — marketplace |
| [@theyahia/foodics-mcp](https://www.npmjs.com/package/@theyahia/foodics-mcp) | Gulf (UAE + Saudi Arabia) | npm only | Foodics — POS/restaurant platform (UAE/Saudi) |
| [@theyahia/moyasar-mcp](https://www.npmjs.com/package/@theyahia/moyasar-mcp) | Gulf (UAE + Saudi Arabia) | npm only | Moyasar — payment gateway (Saudi Arabia) |
| [@theyahia/paytabs-mcp](https://www.npmjs.com/package/@theyahia/paytabs-mcp) | Gulf (UAE + Saudi Arabia) | npm only | PayTabs — payment gateway (MENA region) |
| [@theyahia/tabby-mcp](https://www.npmjs.com/package/@theyahia/tabby-mcp) | Gulf (UAE + Saudi Arabia) | npm only | Tabby — BNPL platform (UAE/Saudi) |
| [@theyahia/tap-payments-mcp](https://www.npmjs.com/package/@theyahia/tap-payments-mcp) | Gulf (UAE + Saudi Arabia) | npm only | Tap Payments — payment gateway (UAE/Saudi/Kuwait/Bahrain) |
| [@theyahia/unifonic-mcp](https://www.npmjs.com/package/@theyahia/unifonic-mcp) | Gulf (UAE + Saudi Arabia) | npm only | Unifonic — CPaaS: SMS, Voice, WhatsApp (Saudi Arabia) |
| [@theyahia/asaas-mcp](https://www.npmjs.com/package/@theyahia/asaas-mcp) | Latin America (Brazil + Mexico) | [github](https://github.com/theYahia/asaas-mcp) | Asaas — payment and Pix gateway (Brazil) |
| [@theyahia/correios-mcp](https://www.npmjs.com/package/@theyahia/correios-mcp) | Latin America (Brazil + Mexico) | npm only | Correios — Brazilian postal service |
| [@theyahia/facturapi-mcp](https://www.npmjs.com/package/@theyahia/facturapi-mcp) | Latin America (Brazil + Mexico) | npm only | Facturapi — Mexican e-invoicing (CFDI) |
| [@theyahia/hotmart-mcp](https://www.npmjs.com/package/@theyahia/hotmart-mcp) | Latin America (Brazil + Mexico) | npm only | Hotmart — digital products platform (Brazil) |
| [@theyahia/ifood-mcp](https://www.npmjs.com/package/@theyahia/ifood-mcp) | Latin America (Brazil + Mexico) | [github](https://github.com/theYahia/ifood-mcp) | iFood — merchant integration (Brazil) |
| [@theyahia/nfeio-mcp](https://www.npmjs.com/package/@theyahia/nfeio-mcp) | Latin America (Brazil + Mexico) | npm only | NFe.io — fiscal document platform (Brazil) |
| [@theyahia/pagarme-mcp](https://www.npmjs.com/package/@theyahia/pagarme-mcp) | Latin America (Brazil + Mexico) | npm only | Pagar.me — payment gateway (Brazil) |
| [@theyahia/africas-talking-mcp](https://www.npmjs.com/package/@theyahia/africas-talking-mcp) | Africa (Nigeria + Kenya + South Africa + Algeria) | npm only | Africa's Talking — communications platform (Kenya/Nigeria/Uganda) |
| [@theyahia/chargily-mcp](https://www.npmjs.com/package/@theyahia/chargily-mcp) | Africa (Nigeria + Kenya + South Africa + Algeria) | npm only | Chargily Pay — payment gateway (Algeria) |
| [@theyahia/nomba-mcp](https://www.npmjs.com/package/@theyahia/nomba-mcp) | Africa (Nigeria + Kenya + South Africa + Algeria) | npm only | Nomba — payment and POS platform (Nigeria) |
| [@theyahia/payfast-mcp](https://www.npmjs.com/package/@theyahia/payfast-mcp) | Africa (Nigeria + Kenya + South Africa + Algeria) | npm only | PayFast — payment gateway (South Africa) |
| [@theyahia/termii-mcp](https://www.npmjs.com/package/@theyahia/termii-mcp) | Africa (Nigeria + Kenya + South Africa + Algeria) | npm only | Termii — SMS and messaging (Nigeria) |
| [@theyahia/yoco-mcp](https://www.npmjs.com/package/@theyahia/yoco-mcp) | Africa (Nigeria + Kenya + South Africa + Algeria) | npm only | Yoco — payment gateway (South Africa) |
| [@theyahia/midtrans-mcp](https://www.npmjs.com/package/@theyahia/midtrans-mcp) | Southeast Asia (Indonesia + Vietnam + Philippines) | npm only | Midtrans — payment gateway (Indonesia) |
| [@theyahia/momo-vn-mcp](https://www.npmjs.com/package/@theyahia/momo-vn-mcp) | Southeast Asia (Indonesia + Vietnam + Philippines) | npm only | MoMo — payment gateway (Vietnam) |
| [@theyahia/paymongo-mcp](https://www.npmjs.com/package/@theyahia/paymongo-mcp) | Southeast Asia (Indonesia + Vietnam + Philippines) | [github](https://github.com/theYahia/paymongo-mcp) | PayMongo — payment gateway (Philippines) |
| [@theyahia/rajaongkir-mcp](https://www.npmjs.com/package/@theyahia/rajaongkir-mcp) | Southeast Asia (Indonesia + Vietnam + Philippines) | npm only | RajaOngkir — shipping cost API (Indonesia) |
| [@theyahia/vnpay-mcp](https://www.npmjs.com/package/@theyahia/vnpay-mcp) | Southeast Asia (Indonesia + Vietnam + Philippines) | npm only | VNPay — payment gateway (Vietnam) |
| [@theyahia/xendit-mcp](https://www.npmjs.com/package/@theyahia/xendit-mcp) | Southeast Asia (Indonesia + Vietnam + Philippines) | npm only | Xendit — payment gateway (Indonesia/Philippines) |
| [@theyahia/zalo-oa-mcp](https://www.npmjs.com/package/@theyahia/zalo-oa-mcp) | Southeast Asia (Indonesia + Vietnam + Philippines) | npm only | Zalo Official Account — messaging API (Vietnam) |
| [@theyahia/easypaisa-mcp](https://www.npmjs.com/package/@theyahia/easypaisa-mcp) | MENA (Iran + Pakistan) | [github](https://github.com/theYahia/easypaisa-mcp) | Easypaisa — mobile wallet and payments (Pakistan) |
| [@theyahia/idpay-mcp](https://www.npmjs.com/package/@theyahia/idpay-mcp) | MENA (Iran + Pakistan) | npm only | IDPay — payment gateway (Iran) |
| [@theyahia/jazzcash-mcp](https://www.npmjs.com/package/@theyahia/jazzcash-mcp) | MENA (Iran + Pakistan) | [github](https://github.com/theYahia/jazzcash-mcp) | JazzCash — mobile wallet and payments (Pakistan) |
| [@theyahia/kavenegar-mcp](https://www.npmjs.com/package/@theyahia/kavenegar-mcp) | MENA (Iran + Pakistan) | [github](https://github.com/theYahia/kavenegar-mcp) | Kavenegar — SMS gateway (Iran) |
| [@theyahia/neshan-maps-mcp](https://www.npmjs.com/package/@theyahia/neshan-maps-mcp) | MENA (Iran + Pakistan) | npm only | Neshan Maps — maps API (Iran) |
| [@theyahia/zarinpal-mcp](https://www.npmjs.com/package/@theyahia/zarinpal-mcp) | MENA (Iran + Pakistan) | npm only | Zarinpal — payment gateway (Iran) |

</details>

---

## Client configuration

Cursor and VS Code — `.cursor/mcp.json` or `.vscode/mcp.json`:

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

Every server supports two transports: stdio (as in the configs above) and Streamable HTTP — see the server's own README in [`servers/`](./servers/).

---

## E-commerce stack demo

Counterparty check, order, delivery and payment in one chain:

```
1. kontur-focus-mcp: search_company("7707083893")   → verify counterparty by INN
2. moysklad-mcp:     create_customer_order(...)     → create sales order
3. cdek-mcp:         calculate_tariff(...)          → get shipping cost
4. cdek-mcp:         create_order(...)              → book delivery
5. yookassa-mcp:     create_payment(...)            → accept payment
6. yookassa-mcp:     create_receipt(...)            → issue fiscal receipt (54-FZ)
```

---

## Monorepo development

Turborepo + pnpm workspace. Servers live in [`servers/`](./servers/), the shared core in [`packages/core`](./packages/core), CI and release pipelines in [`.github/workflows/`](./.github/workflows/).

Numbers in this README are not written by hand: `node scripts/catalog.mjs` starts every server and regenerates [`scripts/catalog.json`](./scripts/catalog.json); `--check` fails CI on drift.

```bash
git clone https://github.com/theYahia/WWmcp.git
cd WWmcp
pnpm install
pnpm build                                # build all workspaces
pnpm test                                 # run tests across the monorepo
pnpm dev --filter @theyahia/moysklad-mcp  # dev a single server
node scripts/catalog.mjs --check          # verify the numbers in the README
```

Project rules: [`CLAUDE.md`](./CLAUDE.md).

---

## Contributing

Contributions of any size are welcome — from a typo fix to a new MCP server for your country's API.

**Fastest way to add a server:**

```bash
npx @theyahia/create-mcp <name> --region <country> --category <type> --base-url <api-url>
```

This scaffolds a working server. Then implement the tools, run `pnpm test`, add a changeset, and open a PR.

- 🐛 [Report a bug](https://github.com/theYahia/WWmcp/issues/new?template=bug.yml)
- ✨ [Request a feature](https://github.com/theYahia/WWmcp/issues/new?template=feature.yml)
- 🌍 [Propose a new server](https://github.com/theYahia/WWmcp/issues/new?template=new-server.yml) for your country's API
- 🟢 [Browse `good first issue`](https://github.com/theYahia/WWmcp/labels/good%20first%20issue) — pick one and ship

Full guide: [**CONTRIBUTING.md**](CONTRIBUTING.md) and the [**Code of Conduct**](CODE_OF_CONDUCT.md). For security reports see [SECURITY.md](SECURITY.md).

## Community

- 💬 [GitHub Discussions](https://github.com/theYahia/WWmcp/discussions) — questions, ideas, use cases
- 📢 [Telegram channel](https://t.me/vhodvai) — release announcements, news
- ⭐ Star the repo if you find it useful — it directly helps discoverability

---

## Author

[@theYahia](https://github.com/theYahia) · Telegram: [@vhodvai](https://t.me/vhodvai) · npm: [npmjs.com/org/theyahia](https://www.npmjs.com/org/theyahia)

## License

MIT
