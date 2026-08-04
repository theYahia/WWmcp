# MCP Servers for Non-Western APIs

**English** | [Русский](README.ru.md)

> **23 servers (22 published) · 172 tools · 15+ countries · 1000+ APIs mapped · npm @theyahia**
>
> The largest open-source collection of MCP servers for CIS, MENA, Africa, LATAM, and Southeast Asia.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/mcp-core?label=downloads)](https://www.npmjs.com/org/theyahia)
[![GitHub stars](https://img.shields.io/github/stars/theYahia/WWmcp?style=social)](https://github.com/theYahia/WWmcp/stargazers)
![Servers](https://img.shields.io/badge/MCP_Servers-23-blue)
![Tools](https://img.shields.io/badge/Tools-172-green)
[![npm org](https://img.shields.io/badge/npm-@theyahia-red)](https://www.npmjs.com/org/theyahia)

> **🎯 40+ ready-made skills** for these servers: [mcp-skills](https://github.com/theYahia/mcp-skills) — e-commerce workflows, HR pipelines, marketing reports, financial audits

## Why WWmcp?

- **🌍 Non-Western coverage.** Anthropic's official MCP catalog ships mostly US/global SaaS. WWmcp fills the gap: Russian payments, Turkish SMS, MENA e-commerce, African mobile money, LATAM fintech, SEA logistics — all under one scope.
- **📦 One scope, one core, one CI.** Every server is `@theyahia/<name>-mcp`, built on `@theyahia/mcp-core` (auth, retries, dual transport stdio+HTTP, structured errors, opt-in telemetry). No copy-pasted boilerplate across 25 repos.
- **🛠 Production-grade by default.** 8+ tools per server, vitest coverage, automated changesets release pipeline, MCP-spec conformance. Not a Hello-World gallery.
- **🚀 Frictionless contribution.** `npx @theyahia/create-mcp <name>` scaffolds a working server in 30 seconds. Add your country's API in an afternoon.

## Table of Contents

- [Quick Start](#quick-start)
- [Servers by Region](#servers-by-region)
- [Usage with Claude Desktop](#usage-with-claude-desktop)
- [Usage with Cursor / VS Code](#usage-with-cursor--vs-code)
- [E-commerce Stack Demo](#e-commerce-stack-demo)
- [Monorepo Development](#monorepo-development)
- [Contributing](#contributing)
- [Community](#community)

## Quick Start

### 1. Add to your Claude Desktop config

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

### 3. The AI handles the rest

MoySklad → stock & pricing → CDEK → shipping rates → YooKassa → payment link. One prompt, no manual API work.

> 📦 **Ready-made workflows:** [@theyahia/mcp-skills](https://github.com/theYahia/mcp-skills) — 40+ skills for e-commerce, HR, marketing, and finance

---

## Servers by Region

<details>
<summary><b>📋 Full server catalog — 25 published packages across 15+ countries</b> (click to expand)</summary>

### Russia

#### Payments

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/yookassa-mcp](https://www.npmjs.com/package/@theyahia/yookassa-mcp) | v2.0.0 | 20 tools | YooKassa — payments, refunds, receipts (54-FZ), payouts, webhooks, recurring, SBP, splits |
| [@theyahia/tkassa-mcp](https://www.npmjs.com/package/@theyahia/tkassa-mcp) | v2.0.0 | 14 tools | T-Kassa (T-Bank/Tinkoff) — payments, refunds, recurring, customers, cards, SBP, receipts (54-FZ) |
| [@theyahia/cloudpayments-mcp](https://www.npmjs.com/package/@theyahia/cloudpayments-mcp) | v2.0.0 | 12 tools | CloudPayments — charge, auth, confirm, void, refund, subscriptions, orders, transactions |
| [@theyahia/robokassa-mcp](https://www.npmjs.com/package/@theyahia/robokassa-mcp) | v1.0.0 | 2 tools | Robokassa — payment URLs, invoice status |
| [@theyahia/sberbank-acquiring-mcp](https://www.npmjs.com/package/@theyahia/sberbank-acquiring-mcp) | v1.0.0 | 8 tools | Sberbank eCommerce Acquiring — online payments, refunds, pre-auth, card tokenization |
| [@theyahia/prodamus-mcp](https://www.npmjs.com/package/@theyahia/prodamus-mcp) | v1.0.0 | 8 tools | Prodamus — payments, subscriptions, refunds, invoices |

#### CRM / Business

| Package | Status | Tools | Description |
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

#### Marketing

| Package | Status | Tools | Description |
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

#### Logistics

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/cdek-mcp](https://www.npmjs.com/package/@theyahia/cdek-mcp) | v2.0.1 | 14 tools | CDEK — tariff calculation, order management, tracking, cities, delivery points, webhooks |
| [@theyahia/boxberry-mcp](https://www.npmjs.com/package/@theyahia/boxberry-mcp) | v1.0.1 | 4 tools | Boxberry — city/point search, delivery calculation, tracking |
| [@theyahia/delovye-linii-mcp](https://www.npmjs.com/package/@theyahia/delovye-linii-mcp) | v1.0.1 | 3 tools | Delovye Linii — tariff calculation, city search, tracking |
| [@theyahia/pochta-russia-mcp](https://www.npmjs.com/package/@theyahia/pochta-russia-mcp) | v1.0.1 | 3 tools | Russian Post — tracking, tariff calculation, post office search |
| [@theyahia/yandex-delivery-mcp](https://www.npmjs.com/package/@theyahia/yandex-delivery-mcp) | v1.0.0 | 8 tools | Yandex Delivery — claims, tracking, price estimation |
| [@theyahia/ati-su-mcp](https://www.npmjs.com/package/@theyahia/ati-su-mcp) | v1.0.0 | 8 tools | ATI.su — cargo search, truck matching, company ratings |

#### HR

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/hh-mcp](https://www.npmjs.com/package/@theyahia/hh-mcp) | v2.0.0 | 16 tools | hh.ru — vacancy search, resumes, employers, salary stats, dictionaries, autocomplete |
| [@theyahia/superjob-mcp](https://www.npmjs.com/package/@theyahia/superjob-mcp) | v1.0.0 | 2 tools | SuperJob — vacancy search, employers |
| [@theyahia/huntflow-mcp](https://www.npmjs.com/package/@theyahia/huntflow-mcp) | v1.0.0 | 4 tools | HuntFlow ATS — vacancies, candidates, applicants |

#### Comms

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/vk-mcp](https://www.npmjs.com/package/@theyahia/vk-mcp) | v1.0.1 | 4 tools | VK — wall posts, news search, users, groups |
| [@theyahia/jivosite-mcp](https://www.npmjs.com/package/@theyahia/jivosite-mcp) | v1.0.1 | 3 tools | JivoSite — chats, agents, visitors |
| [@theyahia/mts-exolve-mcp](https://www.npmjs.com/package/@theyahia/mts-exolve-mcp) | v3.0.0 | 8 tools | MTS Exolve — SMS, calls, call recordings, phone numbers, Viber |
| [@theyahia/mango-office-mcp](https://www.npmjs.com/package/@theyahia/mango-office-mcp) | v1.0.1 | 2 tools | Mango Office — calls, users |
| [@theyahia/voximplant-mcp](https://www.npmjs.com/package/@theyahia/voximplant-mcp) | v1.0.1 | 3 tools | Voximplant — call history, users, SMS |
| [@theyahia/sms-ru-mcp](https://www.npmjs.com/package/@theyahia/sms-ru-mcp) | v1.0.1 | 3 tools | SMS.RU — send SMS, check status, balance |
| [@theyahia/tilda-mcp](https://www.npmjs.com/package/@theyahia/tilda-mcp) | v1.0.0 | 3 tools | Tilda — projects, pages |
| [@theyahia/yandex-360-mcp](https://www.npmjs.com/package/@theyahia/yandex-360-mcp) | v1.0.0 | 10 tools | Yandex 360 — users, departments, groups, disk, calendar |

#### AI / Cloud

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/gigachat-mcp](https://www.npmjs.com/package/@theyahia/gigachat-mcp) | v3.0.0 | 8 tools | GigaChat (Sber) — chat, models, embeddings, token count, image generation, balance, assistants |
| [@theyahia/yandexgpt-mcp](https://www.npmjs.com/package/@theyahia/yandexgpt-mcp) | v3.0.0 | 8 tools | YandexGPT — completion, async completion, embeddings, classification, summarization, tokenization |
| [@theyahia/salutespeech-mcp](https://www.npmjs.com/package/@theyahia/salutespeech-mcp) | v1.0.0 | 2 tools | SaluteSpeech (Sber) — speech recognition and synthesis |
| [@theyahia/yandex-speechkit-mcp](https://www.npmjs.com/package/@theyahia/yandex-speechkit-mcp) | v1.0.0 | 2 tools | Yandex SpeechKit — speech recognition and synthesis |
| [@theyahia/yandex-cloud-mcp](https://www.npmjs.com/package/@theyahia/yandex-cloud-mcp) | v1.0.0 | 8 tools | Yandex Cloud — compute, storage, serverless, operations |

#### Finance / Fiscal

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/sber-mcp](https://www.npmjs.com/package/@theyahia/sber-mcp) | v1.0.0 | 5 tools | Sberbank — accounts, statements |
| [@theyahia/alfa-bank-mcp](https://www.npmjs.com/package/@theyahia/alfa-bank-mcp) | v1.1.0 | 8 tools | Alfa-Bank Business — accounts, balances, statements, payment orders, counterparties, FX rates, payroll |
| [@theyahia/tochka-bank-mcp](https://www.npmjs.com/package/@theyahia/tochka-bank-mcp) | v1.0.0 | 8 tools | Tochka Bank — accounts, payments, counterparties, company info |
| [@theyahia/aprovodka](https://www.npmjs.com/package/@theyahia/aprovodka) | v4.0.0 | 32 tools | 1C:Enterprise REST/OData — catalogs, documents, registers, accounting, batch, change-tracking |
| [@theyahia/atol-online-mcp](https://www.npmjs.com/package/@theyahia/atol-online-mcp) | v1.0.0 | 8 tools | ATOL Online — fiscal receipts (54-FZ compliance) |
| [@theyahia/kontur-diadoc-mcp](https://www.npmjs.com/package/@theyahia/kontur-diadoc-mcp) | v1.0.0 | 8 tools | Kontur.Diadoc — electronic document interchange |

#### Data / Legal

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@metarebalance/dadata-mcp](https://www.npmjs.com/package/@metarebalance/dadata-mcp) | v1.0.4 | 31 tools | DaData — address validation, company lookup, phone cleaning, geocoding |
| [@theyahia/kontur-focus-mcp](https://www.npmjs.com/package/@theyahia/kontur-focus-mcp) | v3.0.0 | 8 tools | Kontur.Focus — company search, EGRUL extracts, financial statements, arbitration, bankruptcy |
| [@theyahia/cbr-mcp](https://www.npmjs.com/package/@theyahia/cbr-mcp) | v1.0.0 | 5 tools | Central Bank of Russia — currency rates, key rate, precious metals, conversion |
| [@theyahia/chestnyznak-mcp](https://www.npmjs.com/package/@theyahia/chestnyznak-mcp) | v1.0.0 | 2 tools | Chestniy ZNAK — product marking verification |
| [@theyahia/casebook-mcp](https://www.npmjs.com/package/@theyahia/casebook-mcp) | v1.0.0 | 8 tools | Casebook/Pravo.ru — legal case search |
| [@theyahia/spark-interfax-mcp](https://www.npmjs.com/package/@theyahia/spark-interfax-mcp) | v1.0.0 | 8 tools | SPARK-Interfax — business intelligence |
| [@theyahia/2gis-mcp](https://www.npmjs.com/package/@theyahia/2gis-mcp) | v1.0.0 | 8 tools | 2GIS — places, geocoding, directions, reviews |
| [@theyahia/yandex-maps-mcp](https://www.npmjs.com/package/@theyahia/yandex-maps-mcp) | v1.0.0 | 8 tools | Yandex Maps — geocoding, routing, places search, static maps |

#### Other

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/travelpayouts-mcp](https://www.npmjs.com/package/@theyahia/travelpayouts-mcp) | v2.0.0 | 11 tools | Travelpayouts — flight search, price calendar, popular directions, hotel search |
| [@theyahia/getcourse-mcp](https://www.npmjs.com/package/@theyahia/getcourse-mcp) | v1.0.0 | 5 tools | GetCourse — users, deals (online school platform) |

---

### Kazakhstan

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/kaspi-mcp](https://www.npmjs.com/package/@theyahia/kaspi-mcp) | v1.0.0 | 3 tools | Kaspi.kz — shop orders and products |
| [@theyahia/halyk-epay-mcp](https://www.npmjs.com/package/@theyahia/halyk-epay-mcp) | v1.0.0 | 8 tools | Halyk Bank ePay — payment gateway |
| [@theyahia/forte-bank-mcp](https://www.npmjs.com/package/@theyahia/forte-bank-mcp) | v1.0.0 | 8 tools | Forte Bank — payment gateway |

### Uzbekistan

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/click-mcp](https://www.npmjs.com/package/@theyahia/click-mcp) | v1.0.0 | 8 tools | Click — payment system |
| [@theyahia/payme-mcp](https://www.npmjs.com/package/@theyahia/payme-mcp) | v1.0.0 | 8 tools | Payme — payment system |
| [@theyahia/factura-uz-mcp](https://www.npmjs.com/package/@theyahia/factura-uz-mcp) | v1.0.0 | 8 tools | Factura.uz — electronic invoicing |

### Georgia

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/bog-ipay-mcp](https://www.npmjs.com/package/@theyahia/bog-ipay-mcp) | v1.0.0 | 8 tools | Bank of Georgia iPay — payment gateway |
| [@theyahia/tbc-bank-mcp](https://www.npmjs.com/package/@theyahia/tbc-bank-mcp) | v1.0.0 | 8 tools | TBC Bank — payment gateway |

### Belarus

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/bepaid-mcp](https://www.npmjs.com/package/@theyahia/bepaid-mcp) | v1.0.0 | 8 tools | bePaid — payment gateway |

### Moldova

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/maib-mcp](https://www.npmjs.com/package/@theyahia/maib-mcp) | v1.0.0 | 8 tools | MAIB — e-commerce payments |

### Turkey

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/iyzico-mcp](https://www.npmjs.com/package/@theyahia/iyzico-mcp) | v1.0.1 | 8 tools | iyzico — payment gateway |
| [@theyahia/is-bankasi-mcp](https://www.npmjs.com/package/@theyahia/is-bankasi-mcp) | v1.0.0 | 8 tools | Isbank — developer API |
| [@theyahia/parasut-mcp](https://www.npmjs.com/package/@theyahia/parasut-mcp) | v1.0.0 | 8 tools | Parasut — accounting |
| [@theyahia/getir-mcp](https://www.npmjs.com/package/@theyahia/getir-mcp) | v1.0.0 | 8 tools | Getir — partner API |
| [@theyahia/hepsiburada-mcp](https://www.npmjs.com/package/@theyahia/hepsiburada-mcp) | v1.0.0 | 8 tools | Hepsiburada — marketplace |
| [@theyahia/trendyol-mcp](https://www.npmjs.com/package/@theyahia/trendyol-mcp) | v1.0.0 | 9 tools | Trendyol — marketplace |
| [@theyahia/ileti-merkezi-mcp](https://www.npmjs.com/package/@theyahia/ileti-merkezi-mcp) | v1.0.0 | 8 tools | Ileti Merkezi — SMS API |

### Gulf (UAE + Saudi Arabia)

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/tap-payments-mcp](https://www.npmjs.com/package/@theyahia/tap-payments-mcp) | v1.1.0 | 8 tools | Tap Payments — payment gateway (UAE/Saudi/Kuwait/Bahrain) |
| [@theyahia/moyasar-mcp](https://www.npmjs.com/package/@theyahia/moyasar-mcp) | v1.1.0 | 8 tools | Moyasar — payment gateway (Saudi Arabia) |
| [@theyahia/foodics-mcp](https://www.npmjs.com/package/@theyahia/foodics-mcp) | v1.1.0 | 8 tools | Foodics — POS/restaurant platform (UAE/Saudi) |
| [@theyahia/tabby-mcp](https://www.npmjs.com/package/@theyahia/tabby-mcp) | v1.1.0 | 8 tools | Tabby — BNPL platform (UAE/Saudi) |
| [@theyahia/salla-mcp](https://www.npmjs.com/package/@theyahia/salla-mcp) | v1.1.0 | 9 tools | Salla — e-commerce platform (Saudi Arabia) |
| [@theyahia/unifonic-mcp](https://www.npmjs.com/package/@theyahia/unifonic-mcp) | v1.1.0 | 8 tools | Unifonic — CPaaS: SMS, Voice, WhatsApp (Saudi Arabia) |
| [@theyahia/paytabs-mcp](https://www.npmjs.com/package/@theyahia/paytabs-mcp) | v1.1.0 | 8 tools | PayTabs — payment gateway (MENA region) |

### Latin America (Brazil + Mexico)

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/asaas-mcp](https://www.npmjs.com/package/@theyahia/asaas-mcp) | v1.0.0 | 9 tools | Asaas — payment and Pix gateway (Brazil) |
| [@theyahia/pagarme-mcp](https://www.npmjs.com/package/@theyahia/pagarme-mcp) | v1.0.0 | 10 tools | Pagar.me — payment gateway (Brazil) |
| [@theyahia/hotmart-mcp](https://www.npmjs.com/package/@theyahia/hotmart-mcp) | v1.0.0 | 8 tools | Hotmart — digital products platform (Brazil) |
| [@theyahia/ifood-mcp](https://www.npmjs.com/package/@theyahia/ifood-mcp) | v1.0.0 | 8 tools | iFood — merchant integration (Brazil) |
| [@theyahia/nfeio-mcp](https://www.npmjs.com/package/@theyahia/nfeio-mcp) | v1.0.0 | 10 tools | NFe.io — fiscal document platform (Brazil) |
| [@theyahia/correios-mcp](https://www.npmjs.com/package/@theyahia/correios-mcp) | v1.0.0 | 8 tools | Correios — Brazilian postal service |
| [@theyahia/facturapi-mcp](https://www.npmjs.com/package/@theyahia/facturapi-mcp) | v1.0.0 | 10 tools | Facturapi — Mexican e-invoicing (CFDI) |

### Africa (Nigeria + Kenya + South Africa + Algeria)

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/payfast-mcp](https://www.npmjs.com/package/@theyahia/payfast-mcp) | v1.0.0 | 8 tools | PayFast — payment gateway (South Africa) |
| [@theyahia/yoco-mcp](https://www.npmjs.com/package/@theyahia/yoco-mcp) | v1.0.0 | 8 tools | Yoco — payment gateway (South Africa) |
| [@theyahia/nomba-mcp](https://www.npmjs.com/package/@theyahia/nomba-mcp) | v1.0.0 | 8 tools | Nomba — payment and POS platform (Nigeria) |
| [@theyahia/termii-mcp](https://www.npmjs.com/package/@theyahia/termii-mcp) | v1.0.0 | 8 tools | Termii — SMS and messaging (Nigeria) |
| [@theyahia/africas-talking-mcp](https://www.npmjs.com/package/@theyahia/africas-talking-mcp) | v1.0.0 | 8 tools | Africa's Talking — communications platform (Kenya/Nigeria/Uganda) |
| [@theyahia/chargily-mcp](https://www.npmjs.com/package/@theyahia/chargily-mcp) | v1.0.0 | 8 tools | Chargily Pay — payment gateway (Algeria) |

### Southeast Asia (Indonesia + Vietnam + Philippines)

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/midtrans-mcp](https://www.npmjs.com/package/@theyahia/midtrans-mcp) | v1.0.1 | 8 tools | Midtrans — payment gateway (Indonesia) |
| [@theyahia/xendit-mcp](https://www.npmjs.com/package/@theyahia/xendit-mcp) | v1.0.1 | 10 tools | Xendit — payment gateway (Indonesia/Philippines) |
| [@theyahia/rajaongkir-mcp](https://www.npmjs.com/package/@theyahia/rajaongkir-mcp) | v1.0.1 | 8 tools | RajaOngkir — shipping cost API (Indonesia) |
| [@theyahia/vnpay-mcp](https://www.npmjs.com/package/@theyahia/vnpay-mcp) | v1.0.1 | 8 tools | VNPay — payment gateway (Vietnam) |
| [@theyahia/momo-vn-mcp](https://www.npmjs.com/package/@theyahia/momo-vn-mcp) | v1.0.1 | 8 tools | MoMo — payment gateway (Vietnam) |
| [@theyahia/zalo-oa-mcp](https://www.npmjs.com/package/@theyahia/zalo-oa-mcp) | v1.0.1 | 8 tools | Zalo Official Account — messaging API (Vietnam) |
| [@theyahia/paymongo-mcp](https://www.npmjs.com/package/@theyahia/paymongo-mcp) | v1.0.1 | 9 tools | PayMongo — payment gateway (Philippines) |

### MENA (Iran + Pakistan)

| Package | Status | Tools | Description |
|---------|--------|-------|-------------|
| [@theyahia/zarinpal-mcp](https://www.npmjs.com/package/@theyahia/zarinpal-mcp) | v1.0.1 | 8 tools | Zarinpal — payment gateway (Iran) |
| [@theyahia/idpay-mcp](https://www.npmjs.com/package/@theyahia/idpay-mcp) | v1.0.0 | 8 tools | IDPay — payment gateway (Iran) |
| [@theyahia/kavenegar-mcp](https://www.npmjs.com/package/@theyahia/kavenegar-mcp) | v1.0.0 | 8 tools | Kavenegar — SMS gateway (Iran) |
| [@theyahia/neshan-maps-mcp](https://www.npmjs.com/package/@theyahia/neshan-maps-mcp) | v1.0.0 | 8 tools | Neshan Maps — maps API (Iran) |
| [@theyahia/easypaisa-mcp](https://www.npmjs.com/package/@theyahia/easypaisa-mcp) | v1.0.0 | 8 tools | Easypaisa — mobile wallet and payments (Pakistan) |
| [@theyahia/jazzcash-mcp](https://www.npmjs.com/package/@theyahia/jazzcash-mcp) | v1.0.0 | 8 tools | JazzCash — mobile wallet and payments (Pakistan) |

</details>

---

## Usage with Claude Desktop

Add to `claude_desktop_config.json`:

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

## Usage with Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

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

## E-commerce Stack Demo

Wire DaData + MoySklad + CDEK + YooKassa into one agent flow:

```
1. dadata-mcp:    suggest_company("7707083893")  → validate counterparty by INN
2. moysklad-mcp:  create_customer_order(...)     → create sales order
3. cdek-mcp:      calculate_tariff(...)          → get shipping cost
4. cdek-mcp:      create_order(...)              → book delivery
5. yookassa-mcp:  create_payment(...)            → accept payment
6. atol-online-mcp: create_receipt(...)          → issue fiscal receipt (54-FZ)
```

---

## Monorepo Development

This repo is a **Turborepo + pnpm workspace**. Production servers live in [`servers/`](./servers/), shared library in [`packages/core`](./packages/core), CI/release pipelines in [`.github/workflows/`](./.github/workflows/).

Pipeline servers (100+ in queue) live as standalone repos under [@theYahia](https://github.com/theYahia?tab=repositories) by design — each is its own git history and npm publish target.

```bash
git clone https://github.com/theYahia/WWmcp.git
cd WWmcp
pnpm install
pnpm build                                # build all workspaces
pnpm dev --filter @theyahia/moysklad-mcp  # dev a single server
pnpm test                                 # run tests across the monorepo
```

Internal docs: [`docs/planning/`](./docs/planning/) (PLAN, STRUCTURE, BUILD_QUEUE, etc.) · Project rules: [`CLAUDE.md`](./CLAUDE.md) · Migration history: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

---

## Contributing

We welcome contributions of all sizes — from typo fixes to brand-new MCP servers for your country's APIs.

**Fastest way to add a new server:**

```bash
npx @theyahia/create-mcp <name> --region <country> --category <type> --base-url <api-url>
```

This scaffolds a working server in 30 seconds. Then implement your tools, run `pnpm test`, add a changeset, and open a PR.

- 🐛 [Report a bug](https://github.com/theYahia/WWmcp/issues/new?template=bug.yml)
- ✨ [Request a feature](https://github.com/theYahia/WWmcp/issues/new?template=feature.yml)
- 🌍 [Propose a new server](https://github.com/theYahia/WWmcp/issues/new?template=new-server.yml) for your country's API
- 🟢 [Browse `good first issue`](https://github.com/theYahia/WWmcp/labels/good%20first%20issue) — pick one and ship

Read the full [**Contributing Guide**](CONTRIBUTING.md) and our [**Code of Conduct**](CODE_OF_CONDUCT.md). For security reports, see [SECURITY.md](SECURITY.md).

## Community

- 💬 [GitHub Discussions](https://github.com/theYahia/WWmcp/discussions) — questions, ideas, use cases
- 📢 [Telegram channel](https://t.me/vhodvai) — release announcements, news
- ⭐ Star the repo if you find it useful — it directly helps discoverability

---

## Author

[@theYahia](https://github.com/theYahia) · Telegram: [@vhodvai](https://t.me/vhodvai) · npm: [npmjs.com/org/theyahia](https://www.npmjs.com/org/theyahia)

## License

MIT
