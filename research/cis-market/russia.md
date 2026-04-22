# MCP Server Candidates — Russia (RU)

> Generated: 2026-04-01 | Analyst: OpenClaw Research Division
> Scope: Russian companies and services suitable for Model Context Protocol (MCP) server implementations

---

## Russia (RU)

### Market Overview
- **Population:** ~146 million
- **Internet penetration:** ~90% (~130M users)
- **Smartphone penetration:** ~80%
- **Dominant digital payment methods:** Mir cards, SBP (Sistema Bystrykh Platezhey / Система быстрых платежей), bank apps (Sber, T-Bank, Alfa)
- **Primary language for APIs/docs:** Russian (some large platforms offer English docs)
- **Key regulatory notes:**
  - Data localization law (152-FZ): personal data of Russian citizens must be stored on servers within Russia
  - Mandatory product labeling via Chestny ZNAK for many categories (dairy, tobacco, apparel, perfumes, tires, etc.)
  - Fiscal data operator (OFD) integration required for all retail POS
  - Import substitution policies accelerating since 2022 — government push to replace foreign SaaS (Slack → Pachca, Jira → Yandex Tracker, etc.)
  - Unified Biometric System (EBS) regulations for fintech
  - Western sanctions have isolated Russian fintech from SWIFT/Visa/MC for cross-border, accelerating domestic alternatives
  - Anti-fraud law (Antifraud 2.0) affecting telecom and banking APIs
  - 54-FZ online cash register law mandating real-time fiscal data transmission

---

## A. COMMERCE & MARKETPLACES

### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Wildberries** (Вайлдберриз) | #1 Russian marketplace by GMV (~$20B+). Fashion, electronics, FMCG | Yes (Seller API, Statistics API, Content API) | API Key (x-api-key header) | Large | **HIGH** | Seller API covers orders, supplies, warehouses, prices, promotions, analytics. Docs at openapi.wildberries.ru. No OAuth — key-only. Extremely high demand from sellers for automation. |
| **Ozon** (Озон) | #2 marketplace. Full-range marketplace with fulfillment (FBO/FBS) | Yes (Seller API v3, Performance API) | API Key + Client-Id header | Large | **HIGH** | Well-documented REST API. Seller API for products, orders, finance, warehouse. Performance API for advertising. Docs at docs.ozon.ru/api/seller. Active developer community. |
| **Yandex Market** (Яндекс Маркет) | Yandex's marketplace + price comparison. Growing aggressively | Yes (Partner API, Content API) | OAuth2 | Large | **HIGH** | OAuth2-based partner API. Covers campaigns, offers, orders, prices, warehouses, returns. Docs at yandex.ru/dev/market. Part of Yandex ecosystem. |
| **AliExpress Russia** | Alibaba's RU marketplace (now partially divested) | Partial (legacy Alibaba API) | API Key | Large | MED | API access through legacy Alibaba developer portal. Uncertain future post-divestiture. |
| **Megamarket** (Мегамаркет, ex-Goods.ru, SberMegaMarket) | Sber's marketplace platform | Yes (Merchant API) | API Key + Token | Medium | MED | Sber-backed. Merchant API for orders, catalog, pricing. Growing seller base. |
| **KazanExpress / Uzum Market** | Regional marketplace, fast delivery focus | Partial (Seller cabinet API) | Token | Medium | LOW | Merged with Uzum. Limited public API documentation. |
| **Avito** (Авито) | #1 classifieds platform (C2C + B2C). Auto, real estate, services, goods | Yes (Avito API) | OAuth2 | Large | **HIGH** | OAuth2 REST API. Covers listings, messages, statistics, autoload (XML feed). 90M+ monthly users. Critical for auto dealers, real estate agents, service providers. |
| **Youla** (Юла) | VK-owned classifieds (partially sunset, redirecting to VK Market) | Partial | Unknown | Small | LOW | Declining platform, migrating to VK ecosystem. |
| **Lamoda** (Ламода) | Fashion marketplace + own logistics | Partial (Merchant API) | API Key | Medium | MED | Merchant API for catalog and orders. Strong in fashion/apparel vertical. |
| **Vseinstrumenti.ru** (ВсеИнструменты) | DIY/tools marketplace | Partial | Unknown | Medium | LOW | B2B-oriented. Limited public API info. |
| **Lerua Merlen** (Леруа Мерлен) | DIY retail, now rebranded as Lemana Pro | Partial (supplier API) | Unknown | Large | LOW | Limited API, mostly EDI-based supplier integration. |
| **Sber e-commerce (SberMarket for goods)** | Sber's retail tech platform | Partial | Token | Medium | LOW | Separate from SberMarket grocery. Evolving platform. |

### 2. Grocery & Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **SberMarket** (СберМаркет, rebranded Kuper) | Grocery delivery aggregator (multi-retailer) | Partial (Partner API) | Token | Large | MED | Partner/merchant API for retailers. Consumer-facing API limited. Rebranded to Kuper in 2024. |
| **Samokat** (Самокат) | Ultra-fast grocery delivery (dark stores, 15 min) | No public API | N/A | Large | LOW | No public API. Internal tech stack. Potential for partner integration API in future. |
| **Yandex Lavka** (Яндекс Лавка) | Yandex's quick grocery delivery | Partial (via Yandex Eda partner API) | OAuth2 | Large | MED | Part of Yandex Eda ecosystem. Partner API for restaurants/stores. |
| **Yandex Eda** (Яндекс Еда) | Food + grocery delivery platform | Yes (Restaurant API / Partner API) | OAuth2 / API Key | Large | **HIGH** | Restaurant partner API for menu management, orders, analytics. Well-documented. High automation potential for restaurant chains. |
| **VkusVill** (ВкусВилл) | Health-focused grocery chain with delivery | Partial (B2B API) | Unknown | Large | LOW | Consumer loyalty app. B2B supplier APIs. Limited public documentation. |
| **Perekrestok Vprok** (Перекрёсток Впрок) | X5 Group online grocery | Partial | Unknown | Large | LOW | X5 Group's online arm. Mostly internal APIs. |
| **Magnit Delivery** (Магнит Доставка) | Magnit's grocery delivery service | No public API | N/A | Large | LOW | Major retailer expanding into delivery. No public API yet. |
| **Lenta Online** (Лента Онлайн) | Lenta hypermarket online delivery | Partial | Unknown | Medium | LOW | Basic e-grocery. Limited API. |
| **Igooods** (Айгудс) | Grocery delivery aggregator (multiple retailers) | Partial (Partner API) | Unknown | Small | LOW | Niche player. |

### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Eda** (see above) | Restaurant delivery platform | Yes | OAuth2 / API Key | Large | **HIGH** | See entry in Grocery section. |
| **Delivery Club** (Деливери Клаб) | Merged into Yandex Eda | Deprecated | N/A | N/A | N/A | Fully absorbed by Yandex Eda in 2024. |
| **Broniboy** (Бронибой) | Regional food delivery aggregator | Partial | Unknown | Small | LOW | Regional player in Southern Russia. |
| **Chibbis** (Чиббис) | Regional food delivery aggregator | Partial | API Key | Small | LOW | Covers ~100 Russian cities. Basic integration API. |

### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **iiko** (айко) | #1 restaurant management system in RU. POS, kitchen, delivery, loyalty | Yes (iiko API, iikoTransport, iikoCloud) | API Key / Token | Large | **HIGH** | Comprehensive REST API: orders, menus, reservations, loyalty, delivery, employees, stop-lists. Used by 50K+ restaurants. Active developer community. iikoCloud API is modern and well-documented. |
| **r_keeper** (р_кипер, by UCS) | Legacy POS leader for HoReCa | Yes (r_keeper Cloud API) | API Key | Large | MED | Long-standing POS. Cloud API for orders, menu, tables. Modernizing from legacy on-premise to cloud. High market share but older API design. |
| **Poster** (Постер) | Cloud POS for cafes, restaurants, retail | Yes (Poster API) | API Key (Acess Token) | Medium | **HIGH** | Clean REST API: products, clients, orders, transactions, inventory. Good documentation at dev.joinposter.com. SaaS model, growing fast. |
| **Quick Resto** (Квик Ресто) | Cloud POS for restaurants | Yes (API) | API Key | Medium | MED | REST API for menu, orders, reports. Growing in mid-market. |
| **Evotor** (Эвотор, Sber subsidiary) | Smart POS terminal + app marketplace | Yes (Evotor Cloud API, REST API) | OAuth2 / Token | Large | **HIGH** | 800K+ terminals deployed. Cloud API + on-device app SDK. Covers sales, receipts, inventory, employees. App marketplace for extensions. Sber-backed. |
| **ATOL** (АТОЛ) | Fiscal hardware + POS solutions | Yes (ATOL Online API) | Token | Large | MED | Fiscal data (receipts, corrections). REST API for OFD integration. See also Fiscal category. |
| **1C:Retail** (1С:Розница) | Retail management from 1C ecosystem | Partial (OData, COM) | Basic / Token | Large | MED | Part of 1C ecosystem. OData endpoint available. Complex but powerful. |
| **Frontpad** (Фронтпад) | Order management for delivery-focused food | Yes (API) | API Key | Small | MED | Simple REST API for orders, statuses, menu. Popular with small delivery restaurants. |
| **Tillypad** (Тиллипад) | POS for restaurants and entertainment | Partial | Unknown | Small | LOW | Niche POS. Limited public API documentation. |
| **Set Retail** (by CSI) | Enterprise retail platform | Partial (SOAP/REST) | Token | Medium | LOW | Enterprise-grade. Complex integration. |
| **Dooglys** (Дуглас) | Cloud POS for food service | Partial | API Key | Small | LOW | Smaller competitor to iiko/Poster. |

---

## B. FINANCE & PAYMENTS

### 5. Banks (Business API / Open Banking)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Sberbank** (Сбербанк / Сбер) | #1 bank by assets and users (~100M clients) | Yes (SberBusinessAPI, Sber API) | OAuth2 / Certificate | Large | **HIGH** | Business API: payments, statements, salary projects, acquiring. Consumer API limited. OAuth2 + client certificates. Sanctions note: under full US/EU sanctions. |
| **T-Bank** (ex-Tinkoff, Т-Банк) | Leading digital/neo-bank. Strong tech culture | Yes (Tinkoff Business API, Acquiring API, Invest API) | OAuth2 / Token | Large | **HIGH** | Excellent API coverage: business banking, acquiring, invoicing, e-commerce, investment (gRPC!). Best developer docs in RU banking (tinkoff.github.io). Invest API uses gRPC + protobuf. Sanctions note: under EU sanctions. |
| **Alfa-Bank** (Альфа-Банк) | Major private bank. Strong digital banking | Yes (Alfa Business API, Alfa-ID) | OAuth2 | Large | **HIGH** | Business API for payments, statements, payroll. Alfa-ID for authentication. Active API development. |
| **VTB** (ВТБ) | State-owned bank, #2 by assets | Partial (VTB Business API) | OAuth2 / Certificate | Large | MED | Business API for corporate clients. Less developer-friendly than T-Bank. Under heavy sanctions. |
| **Raiffeisen Bank Russia** | International bank with RU operations | Yes (Raiffeisen Business API) | OAuth2 | Medium | MED | Open Banking API. Payments, accounts, statements. Being sold/divested. |
| **Gazprombank** (Газпромбанк) | Major state-related bank | Partial | Certificate | Large | LOW | Limited public API. Mostly for corporate integration. Under sanctions. |
| **Rosbank** (Росбанк) | Societe Generale legacy bank (now independent) | Partial | Unknown | Medium | LOW | Limited API availability. |
| **Otkritie** (Открытие, merged into VTB) | Former private bank, merged into VTB | N/A | N/A | N/A | N/A | Merged into VTB in 2024. APIs transitioning. |
| **Sovcombank** (Совкомбанк) | Growing universal bank | Partial | Token | Medium | LOW | Expanding API offerings. Under sanctions. |
| **MTS Bank** (МТС Банк) | Telecom-backed bank | Partial (MTS Money API) | OAuth2 | Medium | LOW | Growing fintech arm of MTS telecom. |
| **Modulbank** (Модульбанк) | SMB-focused neobank | Yes (Modulbank API) | Token | Small | MED | Good API for SMB banking: payments, statements, webhooks. Developer-friendly for its segment. |
| **Tochka Bank** (Точка Банк) | SMB-focused digital bank | Yes (Tochka API) | OAuth2 | Small | MED | Open Banking API. Strong automation focus. Payments, invoices, statements. Webhooks available. |

### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **YooKassa** (ЮKassa, ex-Yandex.Kassa) | #1 payment gateway in Russia | Yes (YooKassa API) | OAuth2 / API Key (shop_id + secret) | Large | **HIGH** | Comprehensive REST API: payments, refunds, receipts, payouts, recurring, SBP, bank cards, wallets. Webhooks. Excellent docs at yookassa.ru/developers. Used by 200K+ merchants. |
| **CloudPayments** (КлаудПейментс) | Modern payment gateway, strong in subscriptions | Yes (CloudPayments API) | API Key (public_id + api_secret) | Large | **HIGH** | REST API: payments (card, Apple Pay, Google Pay, SBP), subscriptions, tokenization, 3DS, receipts. Webhooks. Good docs. |
| **Robokassa** (Робокасса) | Long-standing payment aggregator | Yes (Robokassa API) | API Key (merchant login + passwords) | Medium | MED | Simpler API. Payments, recurring, invoices. Popular with small/medium businesses. |
| **PayKeeper** (ПэйКипер) | Payment gateway for mid-market | Yes (PayKeeper API) | Token | Medium | MED | REST API for payments, invoices, refunds. |
| **Bepaid / eCommpay** | International payment processing with RU focus | Yes | API Key | Medium | MED | Multi-currency. API for payments, payouts. |
| **Fondy** | Payment platform (UA origin, RU operations) | Yes (Fondy API) | API Key + Signature | Small | LOW | Uncertain status post-2022. |
| **PayMaster** (ПейМастер) | Payment aggregator | Yes (PayMaster API v2) | Token | Small | LOW | REST API. Smaller market share. |
| **SberPay acquiring** (СберPay) | Sber's merchant acquiring | Partial (via SberBusinessAPI) | Certificate / OAuth2 | Large | MED | Integrated into Sber ecosystem. Growing. |
| **T-Pay** (ex-Tinkoff Pay) | T-Bank's payment button | Yes (via T-Bank Acquiring API) | Token | Large | MED | Part of T-Bank ecosystem. Good API. |
| **Prodamus** (Продамус) | Payment + CRM for info-products, coaches | Yes (Prodamus API) | API Key | Medium | MED | Popular with course creators, coaches. API for payments, subscriptions, webhooks. Niche but high automation potential. |

### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **SBP (Система быстрых платежей)** | National instant payment system (via Central Bank) | Yes (via bank APIs + NSPK) | Varies by bank | Large | **HIGH** | QR-code payments, P2P transfers. API accessed through acquiring banks. Growing rapidly as Visa/MC replacement. |
| **SberPay** | Sber's mobile payment | Partial | OAuth2 | Large | LOW | Consumer-facing, limited merchant API outside Sber acquiring. |
| **MirPay** (МирPay) | Payment via Mir cards (NFC) | No public API | N/A | Large | LOW | Consumer NFC payment. No merchant API — works through standard Mir acquiring. |
| **YooMoney** (ЮMoney, ex-Yandex.Money) | Digital wallet + P2P | Yes (YooMoney API) | OAuth2 | Medium | MED | OAuth2 API for wallet operations, transfers, payment acceptance. Part of Sber ecosystem now. |

### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Binance (RU users)** | Global exchange, large RU user base | Yes (Binance API) | API Key + HMAC | Large | MED | Global MCP likely exists. RU-specific: P2P in rubles, CommEX migration. |
| **ByBit** | Exchange popular in RU after Binance restrictions | Yes | API Key | Large | LOW | Global service. MCP likely covered globally. |
| **Garantex** | Russian-focused crypto exchange | Partial | API Key | Medium | LOW | Under US sanctions. OFAC-designated. Risky integration target. |
| **BestChange** (БестЧендж) | Crypto/fiat exchange aggregator | Yes (BestChange API) | API Key | Medium | MED | API for rates monitoring across exchangers. Unique RU-specific service. |
| **Digital Ruble (Цифровой рубль)** | CBR CBDC (in pilot) | No public API yet | N/A | Large (future) | LOW | Pilot phase. Future API expected. |

### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **IngosStraKh** (Ингосстрах) | Major insurer | Partial (B2B API) | Token | Large | LOW | B2B/partner API for policy issuance. Limited public docs. |
| **Sravni.ru** (Сравни.ру) | Insurance comparison platform | Partial (Partner API) | API Key | Large | MED | API for quotes, comparisons. Used by agents and affiliates. |
| **Cherehapa** (Черехапа) | Travel insurance aggregator | Yes (Partner API) | API Key | Small | MED | REST API for travel insurance quotes and policies. Partner-focused. |
| **Polis.online** (Полис.онлайн) | Digital insurance marketplace | Partial | API Key | Small | LOW | API for insurance product distribution. |
| **Mango Insurance** (Манго Страхование) | Digital-first insurer | Partial | Unknown | Small | LOW | Modern insurtech but limited API documentation. |
| **Alfastrakhovanie** (АльфаСтрахование) | Alfa Group insurer | Partial (B2B API) | Token | Large | LOW | Partner integration API. |
| **Rosgosstrakh** (Росгосстрах) | State-adjacent insurer | Partial | Unknown | Large | LOW | Legacy systems. Limited API. |
| **Renessans Strakhovanie** (Ренессанс Страхование) | Mid-market insurer | Partial | Unknown | Medium | LOW | Some partner APIs available. |
| **OSAGO API (РСА — Российский союз автостраховщиков)** | Mandatory auto insurance association | Yes (RSA API) | Certificate | Large | MED | API for OSAGO (mandatory auto insurance) verification, KBM (bonus-malus) checks. |

---

## C. LOGISTICS & DELIVERY

### 10. Courier / Last-Mile Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **CDEK** (СДЭК) | #1 private courier/delivery company. 6000+ pickup points | Yes (CDEK API v2) | OAuth2 (client credentials) | Large | **HIGH** | REST API v2: shipments, tracking, tariff calculation, pickup points, webhooks. Excellent docs at api-docs.cdek.ru. 60K+ business clients. |
| **Boxberry** (Боксберри) | Parcel delivery + pickup point network | Yes (Boxberry API) | Token | Large | **HIGH** | REST API: shipments, tracking, pickup points, tariff calc. Good documentation. Major competitor to CDEK. |
| **DPD Russia** (ДПД) | International courier, strong in RU | Yes (DPD API) | Token | Medium | MED | REST/SOAP API for shipments, tracking, geography. |
| **Yandex Delivery** (Яндекс Доставка) | Yandex's delivery service (courier + express) | Yes (Yandex Delivery API) | OAuth2 | Large | **HIGH** | Part of Yandex ecosystem. API for creating deliveries, tracking, pricing. Used for same-day and express. |
| **Dostavista** (Достависта, now rebranded as Borzo) | Crowdsourced same-day delivery | Yes (Borzo/Dostavista API) | Token | Medium | MED | REST API: create orders, track, pricing. Used for last-mile and same-day. |
| **PEK** (ПЭК) | Major freight + parcel delivery | Yes (PEK API) | API Key | Medium | MED | API for cargo shipments, tracking, calculations. |
| **Delovye Linii** (Деловые Линии) | Major freight + parcel delivery | Yes (DL API) | API Key | Large | MED | REST API: shipments, tracking, terminals, tariffs. Major player in B2B logistics. |
| **IML** (ИМЛ) | E-commerce fulfillment + delivery | Yes (IML API) | Token | Medium | MED | API for orders, tracking. E-commerce focused. |
| **5Post** (5 Пост, X5 Group) | Pickup point network (X5 retail group) | Partial | Token | Medium | LOW | Growing network. Limited API documentation. |
| **PickPoint** (ПикПоинт) | Pickup point / parcel locker network | Yes (PickPoint API) | Token | Medium | LOW | Financial difficulties reported. API for shipments and tracking. |
| **Shiptor** (Шиптор) | Fulfillment + shipping aggregator | Yes (Shiptor API) | API Key | Small | MED | REST API aggregating multiple carriers. Good for multi-carrier shipping automation. |
| **ApiShip** (АпиШип) | Delivery API aggregator (multi-carrier) | Yes (ApiShip API) | Token | Small | MED | Single API for 40+ carriers. Similar to EasyPost/ShipEngine for RU market. |
| **RetailCRM Delivery** | Delivery module in RetailCRM | Yes (via RetailCRM API) | API Key | Medium | MED | Part of RetailCRM ecosystem. |

### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Pochta Russia** (Почта России) | National postal service | Yes (Pochta.ru API / Otpravka API) | OAuth2 / Token | Large | **HIGH** | REST API: shipments (otpravka), tracking, tariff calculation, address normalization, post office lookup. Docs at otpravka.pochta.ru/specification. 42K+ post offices. |
| **SPSR Express** (СПСР) | Express postal service (merged into DPD) | Deprecated | N/A | N/A | N/A | Merged into DPD. |

### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **ATI.su** (АТИ) | #1 freight exchange platform. Trucking marketplace | Yes (ATI.su API) | Token | Large | **HIGH** | REST API: loads, trucks, companies, directions, calculations. 500K+ transport companies. Critical infrastructure for Russian freight. |
| **Gruzovichkof** (Грузовичкоф) | Urban cargo/moving service | Partial | Unknown | Medium | LOW | Consumer-focused moving service. |
| **Vezet** (Везёт) | Regional trucking platform | Partial | Unknown | Small | LOW | Regional player. |
| **Groozgo** (ГрузГо) | Digital freight platform | Yes (API) | Token | Small | MED | Modern API for freight matching. Smaller but growing. |
| **Deliver** (Деливер) | TMS (Transport Management System) | Yes (API) | Token | Small | MED | SaaS TMS with API for route optimization, fleet management. |

### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Moy Sklad** (Мой Склад) | Cloud inventory/warehouse management (see also ERP section) | Yes (MoySklad API) | Token (Bearer) | Large | **HIGH** | See ERP section for full details. REST JSON API covers inventory, warehousing, orders. |
| **Kaktus** (Кактус) | E-commerce fulfillment | Yes (API) | Token | Small | MED | API for inventory, orders, shipping. Fulfillment-as-a-service. |
| **Fulfillment by Ozon / Wildberries** | Marketplace fulfillment | Yes (via marketplace seller APIs) | API Key | Large | **HIGH** | FBO (Fulfillment by Ozon/WB) APIs are part of seller APIs listed above. |
| **Storekeeper** (Складовщик) | WMS system | Partial | Unknown | Small | LOW | Niche WMS. |

---

## D. BUSINESS SOFTWARE & SaaS

### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bitrix24** (Битрикс24) | #1 CRM + collaboration suite in RU. 15M+ orgs | Yes (Bitrix24 REST API) | OAuth2 / Webhook | Large | **HIGH** | Massive REST API: CRM (deals, contacts, leads), tasks, calendar, telephony, disk, chat, workflows, webhooks. Docs at dev.1c-bitrix.ru. OAuth2 for apps, webhook URLs for simple integrations. Marketplace with 5K+ apps. |
| **amoCRM** (амоCRM) | Sales-focused CRM. Popular with SMBs | Yes (amoCRM API) | OAuth2 | Large | **HIGH** | REST API: leads, contacts, companies, tasks, pipelines, custom fields, webhooks, widgets. Docs at amocrm.ru/developers. Strong automation focus. 50K+ businesses. |
| **Megaplan** (Мегаплан) | CRM + project management | Yes (Megaplan API) | API Key | Medium | MED | REST API for CRM, tasks, projects, employees. Older but established player. |
| **RetailCRM** (РетейлCRM) | E-commerce-focused CRM + order management | Yes (RetailCRM API) | API Key | Medium | **HIGH** | REST API: orders, customers, delivery, marketing, analytics. Integrates with all major RU marketplaces. Purpose-built for e-commerce. Docs at docs.retailcrm.ru/api. |
| **Planfix** (Планфикс) | Customizable CRM/PM platform | Yes (Planfix API) | API Key / Token | Medium | MED | REST/XML API for tasks, projects, contacts, custom objects. Highly customizable. |
| **S2 CRM** (ex-SalesapCRM) | Simple CRM for small business | Yes (S2 API) | Token | Small | LOW | Basic API for deals, contacts, tasks. |
| **Flowlu** (Флоулу) | CRM + PM + finance management | Yes (Flowlu API) | API Key | Small | MED | REST API for CRM, projects, finance. Growing platform. |
| **WireCRM** | Lightweight CRM | Yes (API) | Token | Small | LOW | Simple API. Small market share. |
| **Envybox** (Энвибокс) | Lead capture widgets + mini-CRM | Yes (Envybox API) | API Key | Small | LOW | API for callbacks, chat, quiz forms. Lead gen focused. |
| **Albato** | Integration/iPaaS platform (like Zapier for RU) | Yes (Albato API) | OAuth2 / API Key | Medium | MED | iPaaS connecting 600+ RU and global services. API for custom integrations. Could be meta-MCP enabler. |

### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Enterprise** (1С:Предприятие) | Dominant ERP/accounting platform in Russia. 6M+ installations | Yes (OData REST, HTTP services, COM, web services) | Basic Auth / Token | Large | **HIGH** | De facto standard for Russian business accounting/ERP. OData REST API for data access. HTTP services for custom APIs. Massive ecosystem. Every business needs 1C integration. |
| **Moy Sklad** (Мой Склад) | Cloud ERP for SMBs. Inventory, sales, purchasing, manufacturing | Yes (MoySklad JSON API 1.2) | Token (Bearer) | Large | **HIGH** | Excellent REST API: entities (products, orders, invoices, counterparties), reports, webhooks, metadata. Docs at dev.moysklad.ru. 3M+ users. Growing fast as cloud alternative to 1C. |
| **SBIS** (СБИС by Tensor) | Business platform: ERP, EDM, reporting, CRM, POS | Yes (SBIS API) | Token / OAuth2 | Large | **HIGH** | Comprehensive platform API covering accounting, document management, reporting to government, POS, HR. Major platform for business digitalization. |
| **Kontur** (Контур / СКБ Контур) | Business services: accounting, reporting, EDM | Yes (Kontur API / Kontur.Extern API) | Certificate / Token | Large | **HIGH** | REST API for tax reporting (Kontur.Extern), EDM (Kontur.Diadoc), e-invoicing. Critical business infrastructure. |
| **Galaktika ERP** (Галактика) | Enterprise ERP for large companies | Partial (SOAP/XML) | Certificate | Medium | LOW | Legacy enterprise ERP. Complex integration. |
| **1C:Fresh** (1С:Фреш) | Cloud 1C hosting | Partial (via 1C OData) | Basic | Medium | MED | Cloud-hosted 1C with standard APIs. |

### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Accounting** (1С:Бухгалтерия) | #1 accounting software in Russia | Yes (OData) | Basic Auth | Large | **HIGH** | See 1C:Enterprise entry. Specific accounting modules accessed via OData. |
| **Kontur.Extern** (Контур.Экстерн) | #1 tax/pension/stat reporting to government | Yes (Kontur.Extern API) | Certificate + Token | Large | **HIGH** | REST API for filing reports to FNS (tax), PFR (pension), FSS (social insurance), Rosstat. Webhooks for status updates. Critical compliance tool. |
| **SBIS Reporting** (СБИС Отчётность) | Government reporting platform | Yes (SBIS API) | Token | Large | **HIGH** | Alternative to Kontur.Extern. API for tax reporting, document flow. |
| **Elba** (Эльба, by Kontur) | Simple accounting for solo entrepreneurs/IPs | Yes (API) | Token | Medium | MED | Simplified API for IP (individual entrepreneur) accounting. |
| **Moe Delo** (Моё Дело) | Online accounting platform | Partial | Token | Medium | LOW | Cloud accounting. Limited API documentation. |
| **Adesk** (Адеск) | Financial analytics for SMBs | Yes (API) | Token | Small | MED | API for financial reports, P&L, cash flow. Growing fintech tool. |

### 17. Fiscal Systems / OFD (Operators of Fiscal Data)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **ATOL Online** (АТОЛ Онлайн) | Cloud fiscalization service + OFD | Yes (ATOL Online API) | Token | Large | **HIGH** | REST API for creating/sending fiscal receipts (checks) to OFD. Mandatory for online retail. Docs at online.atol.ru/docs. |
| **OrangeData** (ОранжДата) | Cloud fiscalization (54-FZ) | Yes (OrangeData API) | Certificate + Token | Medium | MED | REST API for fiscal receipts. Alternative to ATOL Online. |
| **Evotor OFD** (see Evotor in POS) | Evotor's OFD service | Yes (via Evotor API) | Token | Large | MED | Part of Evotor ecosystem. |
| **OFD.ru** (ОФД.ру) | Operator of fiscal data | Yes (OFD.ru API) | Token | Large | MED | API for receipt data, analytics. Major OFD provider. |
| **Platforma OFD** (Платформа ОФД) | OFD service by Ekosystem | Partial | Token | Medium | LOW | OFD with limited public API. |
| **Taxcom** (Такском) | OFD + EDM services | Yes (Taxcom API) | Token / Certificate | Medium | MED | API for OFD and electronic document management. |
| **Ferma** (Фёрма) | Cloud cash register service | Yes (API) | Token | Small | MED | Simple API for fiscal receipts. Developer-friendly. |
| **Modulkassa** (Модулькасса) | Cloud cash register (Modulbank group) | Yes (Modulkassa API) | Token | Small | MED | REST API for POS operations, receipts, sales. |

### 18. EDI / EDM (Electronic Document Management)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Diadoc** (Диадок, by Kontur) | #1 EDM operator. B2B electronic document exchange | Yes (Diadoc API) | Token (DDAuth) | Large | **HIGH** | REST API: send/receive invoices, acts, UPD, UTD. E-signatures. Document workflow. 2M+ organizations connected. Docs at api-docs.diadoc.ru. |
| **SBIS EDM** (СБИС ЭДО) | EDM by Tensor/SBIS | Yes (SBIS API) | Token | Large | **HIGH** | Document exchange, e-signatures, workflow. Part of SBIS platform. Major Diadoc competitor. |
| **1C-EDO** (1С-ЭДО) | EDM integrated into 1C | Partial (via 1C) | Basic | Large | MED | Works through 1C platform. Popular due to 1C ecosystem dominance. |
| **Synerdocs** (Синердокс) | EDM platform | Yes (API) | Token | Medium | LOW | Smaller EDM operator with API. |
| **Taxcom EDM** (Такском ЭДО) | EDM service | Yes (API) | Token / Certificate | Medium | LOW | Combined OFD + EDM provider. |
| **Directum** (Директум) | Enterprise ECM/BPM platform | Yes (Directum API / IS-Builder) | Token | Medium | MED | REST API for document management, workflows, approvals. Enterprise-grade. |
| **DocSpace / ELMA** | BPM + document management | Yes (ELMA API) | Token | Medium | MED | REST API for business processes, documents. |

### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **HeadHunter (hh.ru)** | #1 job board in Russia. 50M+ resumes, 1M+ employers | Yes (hh.ru API) | OAuth2 | Large | **HIGH** | REST API: vacancies, resumes, employers, negotiations (applications), dictionaries. OAuth2. Docs at github.com/hhru/api. Public company (NASDAQ: HHRU). Telegram bot available. |
| **SuperJob** (СуперДжоб) | #2 job board | Yes (SuperJob API) | OAuth2 | Large | MED | REST API: vacancies, resumes, employers. OAuth2. Docs at api.superjob.ru. |
| **Rabota.ru** (Работа.ру, Sber) | Job board (Sber ecosystem) | Partial | OAuth2 | Medium | MED | API available for partners. Growing under Sber. |
| **Huntflow** (Хантфлоу) | ATS (Applicant Tracking System) for recruiters | Yes (Huntflow API) | Token | Medium | **HIGH** | REST API: candidates, vacancies, pipeline stages, webhooks. Purpose-built for recruiting automation. Good documentation. |
| **Potok** (Поток, by TalentTech) | ATS / recruiting automation | Yes (Potok API) | Token | Medium | MED | API for recruiting pipeline management. Part of TalentTech (Severgrup). |
| **FriendWork** (ФрендВорк) | ATS for agencies | Yes (API) | Token | Small | MED | REST API for recruiting workflow. |
| **Hurma** | HR management system | Yes (API) | Token | Small | LOW | HRM platform with API. |
| **HRBOX** | HR automation platform | Partial | Token | Small | LOW | Limited API. |
| **1C:ZUP** (1С:ЗУП — Зарплата и Управление Персоналом) | Payroll & HR management | Yes (OData) | Basic | Large | MED | Part of 1C ecosystem. OData for payroll, employee data. |
| **Skillaz** (Скилаз) | Enterprise recruiting platform | Partial | Token | Small | LOW | Enterprise ATS. Limited public API. |

### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Tracker** (Яндекс Трекер) | Yandex's issue/project tracker (Jira alternative) | Yes (Yandex Tracker API) | OAuth2 / IAM Token | Large | **HIGH** | REST API: issues, queues, boards, sprints, comments, attachments, macros, webhooks. Docs at cloud.yandex.ru/docs/tracker. Growing as Jira replacement. Part of Yandex 360. |
| **Kaiten** (Кайтен) | Kanban/Scrum project management | Yes (Kaiten API) | Token | Medium | **HIGH** | REST API: cards, boards, columns, sprints, time tracking, comments. Modern API. Growing fast as Trello/Jira replacement. Docs at kaiten.ru/api. |
| **Pachca** (Пачка) | Team messenger + task management (Slack alternative) | Yes (Pachca API) | Token | Medium | MED | REST API: messages, channels, tasks, users, webhooks. Growing as Slack replacement. |
| **Weeek** | Project management + CRM | Yes (API) | Token | Small | MED | REST API for tasks, projects. Growing platform. |
| **YouGile** (ЮГайл) | Project management platform | Yes (YouGile API) | Token | Small | MED | REST API for boards, tasks, columns. Telegram integration. |
| **Shtab** (Штаб) | Simple project management | Yes (API) | Token | Small | LOW | Basic API. |
| **ELMA365** | BPM/Low-code platform | Yes (ELMA365 API) | Token | Medium | MED | REST API for processes, tasks, applications. Low-code platform. |
| **GanttPRO** | Gantt chart project management (CIS origin) | Yes (API) | Token | Small | LOW | Gantt-focused PM tool. |

---

## E. MARKETING & COMMUNICATIONS

### 21. SMS / Push / Notifications

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **SMS.ru** | Simple SMS gateway | Yes (SMS.ru API) | API Key | Medium | **HIGH** | REST API: send SMS, check status, cost calculation, HLR lookup. Simple and developer-friendly. Popular with developers. |
| **SMSC.ru** (СМСЦ) | SMS gateway | Yes (SMSC API) | Login + Password / API Key | Medium | MED | REST API: SMS, voice calls, viber, HLR. Long-standing provider. |
| **SMS Aero** (СМС Аэро) | SMS platform | Yes (SMS Aero API v2) | API Key | Medium | MED | REST API for SMS sending, templates, statistics. |
| **Devino Telecom** (Девино Телеком) | Omnichannel messaging (SMS, push, Viber, VK, WhatsApp) | Yes (Devino API) | Token | Medium | MED | REST API for multi-channel messaging. |
| **Infobip (RU)** | Global CPaaS with RU operations | Yes (Infobip API) | API Key | Large | MED | Global service but significant RU presence. Likely has global MCP. |
| **Unisender (Push)** | Push notifications (part of Unisender) | Yes | Token | Medium | MED | See Email Marketing section. |
| **Pushwoosh** | Push notification platform (RU origin, global) | Yes (Pushwoosh API) | API Key | Medium | MED | REST API for push notifications across platforms. RU-origin, used globally. |
| **OneSignal** | Global push platform with RU usage | Yes | API Key | Large | LOW | Global MCP likely exists. |
| **Notify.bot (Telegram bots)** | Telegram notification services | Various | Token | Medium | MED | Various Telegram bot-based notification services for business. |

### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Unisender** (Юнисендер) | #1 email marketing platform in RU | Yes (Unisender API) | API Key | Large | **HIGH** | REST API: campaigns, lists, contacts, templates, statistics, webhooks. Docs at www.unisender.com/ru/support/api. 200K+ users. Also has chatbots and SMS. |
| **SendPulse** (СендПульс) | Multi-channel marketing (email, SMS, push, chatbots) | Yes (SendPulse API) | OAuth2 / Token | Large | **HIGH** | REST API: email, SMS, push, Viber, chatbots (Telegram, FB, VK, WhatsApp), CRM, landing pages. Comprehensive docs. UA origin, popular in RU. |
| **DashaMail** (ДашаМэйл) | Email marketing platform | Yes (DashaMail API) | API Key | Medium | MED | REST API for campaigns, lists, autoresponders. Russian-focused. |
| **Mailopost** (Мэйлопост) | Email marketing | Yes (API) | API Key | Small | LOW | Basic email API. |
| **NotiSend** (НотиСенд) | Email + push marketing | Yes (API) | API Key | Small | LOW | Email and push notifications. |
| **Sendsay** (Сендсей) | Enterprise email marketing | Yes (Sendsay API) | Token | Medium | MED | API for enterprise email marketing, segmentation. |
| **eSputnik** (еСпутник) | Omnichannel marketing automation | Yes (eSputnik API) | Token | Medium | MED | REST API for email, SMS, push, web push, app inbox. UA origin, used in RU. |
| **Mindbox** (Майндбокс) | Customer data platform + marketing automation | Yes (Mindbox API) | Token | Medium | **HIGH** | REST API: customer profiles, segmentation, triggers, campaigns, loyalty. Enterprise CDP. High automation potential. |

### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Direct** (Яндекс Директ) | #1 search/display ad platform in Russia | Yes (Yandex Direct API v5) | OAuth2 | Large | **HIGH** | REST/JSON API: campaigns, ad groups, ads, keywords, bids, reports, audiences. OAuth2. Docs at yandex.ru/dev/direct. Dominant ad platform post-Google. |
| **VK Ads** (ВК Реклама, ex-myTarget) | VK ecosystem advertising (VK, OK, Mail.ru, partner network) | Yes (VK Ads API) | OAuth2 | Large | **HIGH** | REST API: campaigns, ad plans, creatives, audiences, reports. Consolidated from myTarget + old VK ads. OAuth2. |
| **myTarget** (Мой Таргет) | Legacy ad platform (migrating to VK Ads) | Yes (myTarget API) | OAuth2 | Large | MED | Being absorbed into VK Ads. API still functional but transitioning. |
| **Yandex Business** (Яндекс Бизнес) | Local business advertising platform | Partial | OAuth2 | Large | MED | API for business listings, reviews. Part of Yandex ecosystem. |
| **eLama** (еЛама) | Ad management platform (aggregator for Yandex/VK/Google) | Yes (eLama API) | Token | Medium | MED | API for managing ads across platforms. Useful as aggregator MCP. |
| **K50** | Bid management / ad automation | Yes (API) | Token | Small | MED | API for automated bidding, reports. |
| **Alytics** (Алитикс) | Ad automation platform | Yes (API) | Token | Small | LOW | Campaign automation API. |
| **Click.ru** (Клик.ру) | Ad platform for agencies | Yes (Click.ru API) | Token | Medium | MED | API for bulk ad management. Agency-focused. |
| **Telegram Ads** | Telegram advertising platform | Yes (Telegram Ad Platform API) | Token | Large | **HIGH** | API for Telegram channel advertising. Growing rapidly. High demand. |
| **Yandex Zen / Dzen Ads** | Native advertising on Dzen platform | Partial | OAuth2 | Medium | MED | Native ad placement on Dzen (ex-Yandex Zen). |

### 24. Social Media / Content

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **VK (ВКонтакте)** | #1 social network in Russia. 100M+ monthly users | Yes (VK API) | OAuth2 / Token | Large | **HIGH** | Comprehensive API: wall posts, messages, groups, ads, stories, clips, market, apps, streaming. Docs at dev.vk.com. Long-standing, well-documented. VK Mini Apps platform. |
| **Telegram** | Dominant messenger in Russia. 90M+ RU users | Yes (Bot API, TDLib, MTProto) | Bot Token / TDLib | Large | **HIGH** | Bot API (REST), TDLib (full client), MTProto (core protocol). Docs at core.telegram.org. Critical for Russian business communication. Bot ecosystem is massive. |
| **OK (Одноклассники)** | Social network (VK Group), older demographic | Yes (OK API) | OAuth2 | Large | MED | REST API: profiles, groups, photos, videos, apps. Part of VK ecosystem. Docs at apiok.ru. |
| **Dzen** (Дзен, ex-Yandex Zen) | Content platform (articles, videos, shorts) | Partial (Dzen Publisher API) | OAuth2 | Large | MED | Publisher API for content management, analytics. Separated from Yandex in 2022, now part of VK. |
| **RuTube** (Рутуб) | Russian YouTube alternative | Yes (RuTube API) | Token | Medium | MED | API for video upload, management, analytics. Growing as YouTube alternative. |
| **TenChat** (ТенЧат) | Business social network (LinkedIn alternative) | Partial | Unknown | Medium | LOW | Growing LinkedIn alternative in Russia. Limited API. |
| **VC.ru** | Tech/business media platform | Yes (API) | Token | Medium | LOW | API for publishing, comments. Tech community. |
| **Pikabu** (Пикабу) | Reddit-like community platform | Partial | Unknown | Medium | LOW | Limited API. Community platform. |
| **LiveJournal** (ЖЖ) | Legacy blogging platform | Yes (LJ API / AtomPub) | Token | Small | LOW | Legacy API. Declining platform. |
| **Yappy** | Short video platform (Gazprom Media) | Partial | Unknown | Small | LOW | TikTok alternative. Early stage API. |

### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Metrica** (Яндекс Метрика) | #1 web analytics in Russia (Google Analytics alternative) | Yes (Yandex Metrica API) | OAuth2 | Large | **HIGH** | REST API: reports, goals, counters, segments, user parameters. Management API + Reporting API. OAuth2. Docs at yandex.ru/dev/metrika. Dominant analytics platform. |
| **AppMetrica** (АппМетрика) | Mobile analytics by Yandex | Yes (AppMetrica API) | OAuth2 | Large | **HIGH** | REST API: push notifications, reports, user profiles, crash analytics. Part of Yandex ecosystem. Free tier. |
| **Roistat** (Роистат) | Marketing analytics / end-to-end analytics | Yes (Roistat API) | API Key | Medium | **HIGH** | REST API: analytics data, leads, calls, costs, reports. End-to-end marketing ROI tracking. Popular with agencies. |
| **Calltouch** (Коллтач) | Call tracking + analytics | Yes (Calltouch API) | Token | Medium | MED | REST API: calls, leads, reports, tags. Call tracking for marketing attribution. |
| **CoMagic** (КоМэджик) | Call tracking + analytics | Yes (CoMagic API) | Token | Medium | MED | REST API for call tracking, lead generation, analytics. |
| **Callibri** (Каллибри) | Multi-channel tracking | Yes (API) | Token | Small | MED | API for call tracking, chat tracking, email tracking. |
| **DataLens** (ДатаЛенс, Yandex) | BI/visualization platform by Yandex | Yes (DataLens API) | OAuth2 / IAM | Large | MED | Yandex Cloud BI tool. API for dashboards, datasets, connections. Growing as Tableau alternative. |
| **Yandex DataLens** | See DataLens above | Yes | OAuth2 | Large | MED | Free BI tool with API. |
| **Power BI (RU market)** | Microsoft BI (partially available) | Yes | OAuth2 | Medium | LOW | Global MCP likely exists. Some RU-specific connectors. |
| **Visiology** (Визиолоджи) | Russian BI platform | Yes (API) | Token | Small | MED | Import substitution BI. REST API for reports, dashboards. |

---

## F. INFRASTRUCTURE & CLOUD

### 26. Cloud / Hosting / CDN

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Cloud** (Яндекс Облако) | #1 Russian cloud platform. Full IaaS/PaaS | Yes (Yandex Cloud API — gRPC + REST) | IAM Token / OAuth2 / API Key | Large | **HIGH** | Comprehensive gRPC + REST API: Compute, Storage (S3-compatible), VPC, Managed databases, Serverless, ML, IoT, CDN, DNS, Monitoring, Logging. Docs at cloud.yandex.ru/docs. Terraform provider available. |
| **VK Cloud** (ВК Облако, ex-Mail.ru Cloud) | VK's cloud platform | Yes (OpenStack-compatible API + custom APIs) | Token | Large | **HIGH** | OpenStack-based. S3 compatible storage. Managed databases, Kubernetes, ML. REST API. Growing fast. |
| **Selectel** (Селектел) | Hosting + cloud + dedicated servers | Yes (Selectel API) | Token (X-Token) | Medium | **HIGH** | REST API: servers, cloud platform, domains, DNS, CDN, storage (S3), databases. Good docs at developers.selectel.ru. |
| **Reg.ru** (Рег.ру) | #1 domain registrar + hosting | Yes (Reg.ru API) | Token | Large | MED | REST API: domains, DNS, hosting, SSL certificates. Docs at www.reg.ru/support/help/api2. |
| **RuCenter (nic.ru)** | Domain registrar + hosting | Yes (NIC.ru API) | Token | Medium | MED | REST API for domain management, DNS. |
| **Beget** (Бегет) | Popular hosting provider | Yes (Beget API) | Token | Medium | MED | REST API for hosting management, domains, databases, files. Popular with developers. |
| **TimeWeb** (ТаймВеб) | Hosting + cloud provider | Yes (Timeweb Cloud API) | Token | Medium | MED | REST API for cloud infrastructure, servers, databases, domains, S3. |
| **FirstVDS** (ФёрстВДС) | VPS/VDS hosting | Partial | Token | Medium | LOW | Limited API for server management. |
| **SpaceWeb** (СпейсВеб) | Hosting provider | Partial | Unknown | Medium | LOW | Limited API documentation. |
| **CDNvideo** | Russian CDN provider | Yes (API) | Token | Small | MED | REST API for CDN management. |
| **Ngenix** (Нженикс) | Enterprise CDN + WAF | Yes (Ngenix API) | Token | Medium | MED | REST API for CDN, DDoS protection, WAF. Enterprise-grade. |
| **EdgeCenter** (ex-G-Core Labs) | CDN + cloud (CIS origin) | Yes (EdgeCenter API) | API Key | Medium | MED | REST API for CDN, streaming, cloud, hosting. |
| **Aeza** (Аеза) | Budget VPS provider | Yes (API) | Token | Small | LOW | Simple API for VPS management. Popular in dev community. |

### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Mango Office** (Манго Офис) | #1 cloud telephony / virtual PBX in Russia | Yes (Mango Office API) | Token / API Key | Large | **HIGH** | REST API: calls, call tracking, callback widget, IVR, recordings, CRM integration, statistics. Docs at www.mango-office.ru/integration. Webhooks for real-time events. 60K+ businesses. |
| **Zadarma** (Задарма) | Cloud PBX + SIP telephony (CIS + global) | Yes (Zadarma API) | API Key + Secret | Medium | **HIGH** | REST API: PBX management, calls, SMS, callback, statistics, call recordings. Docs at zadarma.com/ru/support/api. Also operates globally. |
| **UIS (Uiscom)** (УИС) | Cloud telephony + call tracking | Yes (UIS API) | Token | Medium | MED | REST API: calls, virtual numbers, IVR, recordings, webhooks. Call tracking for marketing. |
| **Telfin** (Телфин) | Cloud PBX | Yes (Telfin API) | Token | Medium | MED | REST API for virtual PBX, calls, routing. |
| **Sipuni** (Сипуни) | Cloud telephony for SMBs | Yes (Sipuni API) | Token | Small | MED | API for calls, PBX, CRM integration. |
| **MCN Telecom** (МСН Телеком) | Virtual operator + PBX | Yes (API) | Token | Small | LOW | Telecom API for virtual numbers, PBX. |
| **MTS Exolve** (МТС Экзолв) | CPaaS by MTS telecom | Yes (MTS Exolve API) | Token | Large | **HIGH** | REST API: voice, SMS, number verification, SIP trunking. Major telecom's CPaaS offering. Growing platform. |
| **Megafon Virtual PBX** (Мегафон ВАТС) | Cloud PBX by Megafon | Partial (API) | Token | Large | MED | Telecom-backed PBX with API. |
| **Beeline Cloud PBX** (Билайн Облачная АТС) | Cloud PBX by Beeline | Partial | Token | Large | LOW | Limited public API documentation. |
| **Voximplant** (Voximplant) | CPaaS platform (CIS origin, global) | Yes (Voximplant API) | API Key | Medium | **HIGH** | REST + WebSocket API: voice, video, messaging, AI scenarios. JavaScript cloud scripting. Docs at voximplant.com/docs. RU-origin, used globally. |
| **Exotel / Novofon** (ex-Zadarma white-label) | SIP/PBX | Yes | API Key | Small | LOW | Variants of cloud PBX services. |

### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Maps** (Яндекс Карты) | #1 mapping platform in Russia | Yes (Yandex Maps API: JavaScript, Static, Geocoder, Router) | API Key | Large | **HIGH** | Multiple APIs: JavaScript API, Static API, Geocoding, Routing, Places, Search. Docs at yandex.ru/dev/maps. Dominant after Google Maps restrictions. |
| **2GIS** (2ГИС / ДубльГИС) | City maps + business directory. Extremely detailed for Russian cities | Yes (2GIS API) | API Key | Large | **HIGH** | REST API: geocoding, routing, places, search, building plans. Most detailed local business data in Russia. 50M+ monthly users. |
| **DaData** (ДаДата) | Address/company/name normalization + suggestion | Yes (DaData API) | Token | Large | **HIGH** | REST API: address suggestions/cleanup, company lookup (by INN/OGRN), name normalization, email validation, geolocation. Docs at dadata.ru/api. Critical for e-commerce and CRM. 30K+ clients. |
| **FIAS / GAR** | Federal address system (government) | Yes (FIAS API) | Open / Token | Large | MED | Government address database API. Used for address validation. |
| **Yandex Geocoder** | Part of Yandex Maps | Yes | API Key | Large | **HIGH** | Standalone geocoding API. Part of Yandex Maps suite. |
| **GIS Innovatsia** | B2B geolocation services | Partial | Unknown | Small | LOW | Niche B2B mapping. |

---

## G. GOVERNMENT & COMPLIANCE

### 29. Government Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Gosuslugi** (Госуслуги) | National government services portal | Partial (ESIA API for auth, SMEV for integration) | OAuth2 (ESIA) / Certificate (SMEV) | Large | MED | ESIA (Единая система идентификации и аутентификации) provides OAuth2 for citizen auth. SMEV for government system integration. Complex certification process. |
| **nalog.ru (FNS API)** (Налог.ру — ФНС) | Federal Tax Service | Yes (FNS API for checks, INN lookup) | Token / Certificate | Large | **HIGH** | REST API for: receipt verification (checking fiscal data), INN lookup, tax debt checking, business entity verification (EGRUL/EGRIP). Some APIs are open, others require registration. |
| **EGRUL/EGRIP** (ЕГРЮЛ/ЕГРИП) | Business entity registry | Yes (via FNS API + DaData) | Token | Large | **HIGH** | Company lookup by INN/OGRN. Available directly from FNS and via DaData. Critical for KYC/compliance. |
| **Rosreestr** (Росреестр) | Real estate registry | Partial (Rosreestr API) | Certificate | Large | MED | Property ownership, cadastral data. Complex access. API available but certification heavy. |
| **FSSP** (ФССП — Федеральная служба судебных приставов) | Bailiff service — debt/enforcement check | Yes (FSSP API) | Open (public data) | Large | MED | REST API for checking enforcement proceedings against individuals/companies. Public data. |
| **CBR** (ЦБ РФ — Центральный Банк) | Central Bank of Russia | Yes (CBR API) | Open | Large | MED | REST/XML API: exchange rates, bank info, key rate. Public data. Docs at cbr.ru/development. |
| **Rospatent / FIPS** (Роспатент) | Patent/trademark office | Partial | Unknown | Medium | LOW | Patent/trademark search. Limited API. |
| **Zakupki.gov.ru** (Закупки) | Government procurement portal | Yes (Zakupki API / FTP data) | Certificate | Large | MED | API for government tenders, contracts. FTP bulk data. Complex but valuable for B2G. |
| **GIS GMP** (ГИС ГМП) | Government payments platform | Partial (via SMEV) | Certificate | Large | LOW | Government fine/fee payment integration. Via SMEV only. |
| **Sudrf.ru / kad.arbitr.ru** | Court case databases | Partial (limited API) | Unknown | Medium | MED | Court case search. kad.arbitr.ru has some API for arbitration cases. |

### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Chestny ZNAK** (Честный ЗНАК) | National product labeling/tracking system (mandatory) | Yes (Chestny ZNAK API / True API) | Certificate + Token | Large | **HIGH** | REST API: product registration, label ordering, shipment tracking, aggregation, reporting. Mandatory for: tobacco, apparel, shoes, perfumes, tires, dairy, water, pharma, beer. Docs at честныйзнак.рф/business/api. Critical compliance integration. |
| **MDLP** (МДЛП — Маркировка лекарств) | Pharmaceutical labeling (part of Chestny ZNAK) | Yes (MDLP API) | Certificate | Large | MED | Drug tracking system. Separate API within Chestny ZNAK ecosystem. |
| **EGAIS** (ЕГАИС) | Alcohol tracking system | Yes (EGAIS API / UTM) | Certificate / Hardware token | Large | MED | Mandatory alcohol sales tracking. Requires UTM (Universal Transfer Module) hardware. Complex but mandatory for alcohol retail/wholesale. |
| **Mercury** (Меркурий, by Rosselkhoznadzor) | Veterinary certification system for food products | Yes (Mercury API / VetIS API) | Certificate | Large | MED | API for veterinary certificates, product movement tracking. Mandatory for food industry. |
| **Saturn** (Сатурн) | Pharmaceutical precursor tracking | Yes (API) | Certificate | Small | LOW | Niche regulatory system. |

---

## H. INDUSTRY VERTICALS

### 31. Real Estate / PropTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **CIAN** (ЦИАН) | #1 real estate platform in Russia | Yes (CIAN Partner API) | Token | Large | **HIGH** | REST API: listings, search, analytics. Partner API for agents and developers. NASDAQ-listed (CIAN). 20M+ monthly users. |
| **Avito Nedvizhimost** (Авито Недвижимость) | Real estate section of Avito | Yes (via Avito API) | OAuth2 | Large | **HIGH** | Part of Avito API (see Marketplaces). Autoload for listings. Massive audience. |
| **Domclick** (ДомКлик, Sber) | Real estate platform by Sber. Mortgage + listings | Partial (Partner API) | Token | Large | MED | Sber's real estate ecosystem. API for mortgage calculators, listings. |
| **Yandex Nedvizhimost** (Яндекс Недвижимость) | Yandex real estate | Partial | OAuth2 | Medium | MED | Part of Yandex ecosystem. Feed-based listing integration. |
| **N1.ru** (Н1) | Regional real estate platform | Partial | Token | Medium | LOW | Regional focus. Limited API. |
| **Novostroi.ru** (Новострой) | New construction real estate | Partial | Unknown | Medium | LOW | New-build listings. |
| **Profitbase** (Профитбейс) | CRM/ERP for real estate developers | Yes (Profitbase API) | Token | Medium | MED | REST API for apartment catalog, deals, bookings. Specialized for developers/builders. |
| **Realty.yandex.ru** | See Yandex Nedvizhimost | Partial | OAuth2 | Medium | MED | Rebranded. |
| **JCat** (ДжКэт) | Multi-platform real estate posting | Yes (API) | Token | Small | LOW | API for posting listings to multiple platforms. |

### 32. Education / EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Skillbox** (Скиллбокс) | #1 online education platform | Partial (internal API) | Unknown | Large | LOW | Limited public API. Major edtech player. |
| **GeekBrains** (ГикБрейнс, Mail.ru) | Online tech education | Partial | Unknown | Large | LOW | VK ecosystem. Limited public API. |
| **Stepik** (Степик) | Open online course platform | Yes (Stepik API) | OAuth2 | Medium | MED | REST API: courses, lessons, steps, submissions, users. OAuth2. Docs at stepik.org/api/docs. Open platform model. |
| **Netology** (Нетология) | Online professional education | Partial | Unknown | Large | LOW | Limited API. |
| **Yandex Praktikum** (Яндекс Практикум) | Tech education by Yandex | Partial | OAuth2 | Large | LOW | Part of Yandex ecosystem. Limited public API. |
| **Uchi.ru** (Учи.ру) | K-12 education platform | Partial | Unknown | Large | LOW | School education. Limited API. |
| **Moodle (RU instances)** | Open-source LMS, widely used in RU universities | Yes (Moodle API) | Token | Large | MED | Standard Moodle REST API. Widely deployed. |
| **iSpring** (АйСпринг) | Corporate e-learning platform (RU origin, global) | Yes (iSpring API) | Token | Medium | MED | REST API for LMS management, users, courses, reports. RU-origin, used globally. |
| **GetCourse** (ГетКурс) | Platform for selling online courses | Yes (GetCourse API) | API Key | Large | **HIGH** | REST API: users, deals, payments, groups. Dominant platform for info-business/course creators in Russia. High automation potential. 50K+ schools. |
| **JustClick** (ДжастКлик) | Course selling + email marketing platform | Yes (API) | API Key | Medium | MED | API for contacts, orders, products. Popular with info-business. |
| **Zenclass** (Зенкласс) | Course hosting platform | Partial | Token | Small | LOW | Simpler alternative to GetCourse. |
| **Bizon365** (Бизон365) | Webinar + course platform | Yes (API) | Token | Medium | MED | API for webinars, users, records. Popular for webinar funnels. |

### 33. Healthcare / Telemedicine

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **DocDoc (СберЗдоровье)** | #1 doctor appointment platform (Sber) | Partial (Partner API) | Token | Large | MED | Partner API for clinic integration. Sber ecosystem. |
| **Prodoctorov** (ПроДокторов) | Doctor review + appointment platform | Partial (Partner API) | Token | Large | MED | API for clinic catalog, appointments. |
| **Medsi** (МЕДСИ) | Largest private clinic chain | Partial | Unknown | Large | LOW | Internal systems. Limited public API. |
| **EMD (ЕМИАС)** | Moscow government healthcare system | Partial (via EMIAS API) | Certificate | Large | LOW | Government healthcare IT. Complex access. |
| **MIS (МИС) providers** | Medical Information Systems (various: Infoclinica, Medods, etc.) | Various | Various | Medium | MED | Multiple MIS vendors with APIs: Infoclinica, MedElement, ArchiMed+. |
| **Apteka.ru** (Аптека.ру) | Online pharmacy marketplace | Partial | Unknown | Large | LOW | Pharmacy ordering. Limited API. |
| **Zdravcity** (Здравсити) | Online pharmacy | Partial | Unknown | Medium | LOW | Pharmacy marketplace. |
| **Medsenger** (Медсенджер) | Doctor-patient messaging platform | Yes (API) | Token | Small | MED | API for telemedicine messaging, monitoring. |

### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Go** (Яндекс Go) | #1 ride-hailing in Russia + delivery | Yes (Yandex Taxi API / B2B Taxi API) | OAuth2 / Token | Large | **HIGH** | B2B API for corporate taxi: ordering rides, expense reports, employee management. Consumer API limited. Docs at yandex.ru/dev/taxi. |
| **Yandex Routing** (Яндекс Маршрутизация) | Route optimization API | Yes (Yandex Routing API) | Token | Medium | **HIGH** | REST API for vehicle routing, delivery optimization, fleet management. B2B focused. |
| **Delimobil** (Делимобиль) | #1 carsharing in Russia | Partial (B2B API) | Token | Large | LOW | Consumer app. Limited B2B API. |
| **CityMobil** (СитиМобил, merged into Yandex) | Ride-hailing (absorbed by Yandex) | Deprecated | N/A | N/A | N/A | Merged into Yandex Go. |
| **BelkaCar** (БелкаКар) | Carsharing | Partial | Unknown | Medium | LOW | Consumer carsharing. |
| **Whoosh** (Вуш) | #1 e-scooter sharing | Partial | Unknown | Medium | LOW | Public company. Consumer-focused. Limited API. |
| **Urent** (Юрент) | E-scooter/bike sharing | Partial | Unknown | Medium | LOW | Competitor to Whoosh. |
| **RZD API** (РЖД) | Russian Railways | Yes (RZD API) | Token | Large | MED | API for schedules, tickets, station info. Complex but large market. |
| **Tutu.ru** (Туту.ру) | Train/bus ticket aggregator | Partial | Unknown | Large | LOW | Consumer-facing. Limited API. |

### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Aviasales** (Авиасейлз) | #1 flight search/metasearch | Yes (Aviasales API / Travelpayouts) | Token | Large | **HIGH** | REST API: flight search, prices, calendar, airlines, airports. Travelpayouts affiliate API. Docs at support.travelpayouts.com/hc/ru/categories. |
| **Ostrovok** (Островок) | Hotel booking platform | Yes (Ostrovok API / B2B) | API Key | Medium | MED | B2B API for hotel inventory, booking. Growing post-Booking.com. |
| **Bronevik** (Броневик) | B2B hotel booking | Yes (Bronevik API) | Token | Medium | MED | API for hotel bookings. B2B/B2G focused. |
| **Sutochno.ru** (Суточно) | Short-term apartment rentals | Partial | Unknown | Medium | LOW | Airbnb alternative for Russia. Limited API. |
| **Travelline** (Тревеллайн) | Hotel channel manager + booking engine | Yes (Travelline API) | Token | Medium | MED | REST API for hotel inventory management, channel distribution. B2B. |
| **Bnovo** (Бново) | Hotel PMS + channel manager | Yes (Bnovo API) | Token | Small | MED | REST API for property management, bookings, channels. |
| **Level.Travel** (Левел Тревел) | Package tour aggregator | Partial (Affiliate API) | Token | Medium | LOW | Affiliate API for tour search. |
| **OneTwoTrip** (ВанТуТрип) | Flight + hotel booking | Partial | Unknown | Medium | LOW | Consumer booking. Limited API. |
| **Aeroflot** (Аэрофлот) | National airline | Partial (NDC API) | Certificate | Large | LOW | NDC standard API for corporate booking. Complex certification. |
| **S7 Airlines** (С7) | Major airline | Partial | Unknown | Large | LOW | Limited public API. |

### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Consultant Plus** (КонсультантПлюс) | #1 legal database in Russia | Partial (Consultant API for partners) | Certificate | Large | MED | Legal database. Partner API available. Massive content. Complex licensing. |
| **Garant** (Гарант) | Legal database (#2 after Consultant+) | Partial | Unknown | Large | LOW | Similar to Consultant+. Limited API. |
| **Pravo.ru** (Право.ру) | Legal analytics + court case database | Yes (Pravo.ru API / Casebook API) | Token | Medium | **HIGH** | REST API: court cases, company legal profiles, judge analytics. Casebook is their analytics product with good API. |
| **SPARK (Interfax)** | Business intelligence / counterparty check | Yes (SPARK API) | Token / Certificate | Large | **HIGH** | REST API: company profiles, financial data, affiliations, risks, sanctions. Critical for compliance/due diligence. Major B2B data provider. |
| **Kontur.Focus** (Контур.Фокус) | Counterparty verification / business intelligence | Yes (Kontur.Focus API) | Token | Large | **HIGH** | REST API: company data by INN/OGRN, financial statements, court cases, enforcement, risks. Competitor to SPARK. Docs available. |
| **SBIS Counterparty** (СБИС Контрагенты) | Company verification in SBIS | Yes (via SBIS API) | Token | Large | MED | Part of SBIS platform. Company verification, financial data. |
| **Rusprofile** (Руспрофиль) | Free company lookup | Partial (scraping-based) | Unknown | Large | LOW | No official API. Web scraping possible but not recommended. |
| **FedResurs** (Федресурс) | Bankruptcy/financial statements registry | Yes (FedResurs API) | Token | Medium | MED | REST API for bankruptcy cases, financial disclosures. Government registry. |
| **Sudact.ru** (Судакт) | Court decision database | Partial | Unknown | Medium | LOW | Court decisions search. Limited API. |

### 37. Agriculture / AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **ExactFarming** (ЭксактФарминг) | Precision agriculture platform | Yes (API) | Token | Small | MED | REST API for field management, satellite imagery, crop monitoring. Leading RU agritech. |
| **Cropio** (Кропио) | Farm management platform | Yes (Cropio API) | Token | Small | MED | REST API for field monitoring, weather, NDVI, task management. |
| **AgroSignal** (АгроСигнал) | Fleet/field management for agriculture | Yes (API) | Token | Small | MED | API for vehicle tracking, field operations, fuel monitoring. |
| **OneSoil** | AI-powered field analysis (Belarus origin, RU usage) | Yes (API) | Token | Small | LOW | Satellite-based crop monitoring API. |
| **Mercury (Rosselkhoznadzor)** | Veterinary certification (see Gov section) | Yes | Certificate | Large | MED | Critical for agricultural product movement. |
| **FGIS Zerno** (ФГИС Зерно) | Grain tracking system (government) | Yes (API) | Certificate | Large | MED | Mandatory grain movement tracking. Government system. |
| **AgroClub** (АгроКлуб) | Agricultural marketplace + fintech | Partial | Unknown | Medium | LOW | Grain trading, input purchasing. |

### 38. Construction / PermitTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **PlanRadar** (ПланРадар, Austrian origin, RU operations) | Construction management platform | Yes (PlanRadar API) | Token | Medium | MED | REST API for construction documentation, defect tracking, tasks. Used in Russia. |
| **Gектар** | Real estate developer CRM (see Profitbase) | Partial | Unknown | Small | LOW | Construction CRM. |
| **ISOGD** (ИСОГД) | Urban planning information system | Partial (government API) | Certificate | Medium | LOW | Government urban planning data. Complex access. |
| **BIM platforms (RU)** | Various BIM tools (Renga, nanoCAD, etc.) | Partial | Various | Medium | LOW | Russian BIM/CAD tools. nanoCAD has some API capabilities. |
| **nanoCAD** (наноКАД) | Russian CAD platform | Yes (API/SDK) | License | Medium | MED | API/SDK for CAD automation. Russian AutoCAD alternative. |
| **Renga** (Ренга) | Russian BIM platform | Yes (API) | License | Small | LOW | BIM modeling API. Import substitution play. |
| **DOM.RF** (ДОМ.РФ) | Government housing development institution | Partial (API for mortgage programs) | Token | Large | LOW | Housing finance. Limited API. |
| **Stroyportal** (Стройпортал) | Construction materials marketplace | Partial | Unknown | Medium | LOW | B2B marketplace. |
| **Smeta.ru / GrandSmeta** | Construction cost estimation | Partial (file exchange) | N/A | Medium | LOW | Desktop software. No REST API. |

---

## CROSS-CUTTING SERVICES

### iPaaS / Integration Platforms (Russian Zapier alternatives)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Albato** (Альбато) | #1 Russian iPaaS. 600+ app connectors | Yes (Albato API) | OAuth2 / API Key | Medium | **HIGH** | Meta-integration platform. MCP server for Albato would unlock 600+ Russian services indirectly. |
| **ApiX-Drive** (АпиксДрайв) | Integration platform | Yes (API) | Token | Small | MED | Similar to Albato. 300+ connectors. |
| **Make (ex-Integromat) — RU market** | Global iPaaS with RU usage | Yes | OAuth2 | Medium | LOW | Global MCP likely exists. |

### AI / ML Services (Russian)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **YandexGPT** (ЯндексGPT) | Yandex's LLM API | Yes (YandexGPT API) | IAM Token | Large | **HIGH** | REST API for text generation, summarization, classification. Part of Yandex Cloud. |
| **GigaChat** (ГигаЧат, Sber) | Sber's LLM | Yes (GigaChat API) | OAuth2 / Token | Large | **HIGH** | REST API compatible with OpenAI format. Sber's answer to ChatGPT. |
| **Yandex SpeechKit** | Speech-to-text + text-to-speech | Yes (SpeechKit API) | IAM Token | Large | MED | REST + gRPC API. Part of Yandex Cloud. |
| **Yandex Translate** (Яндекс Переводчик) | Machine translation | Yes (Translate API) | IAM Token / API Key | Large | MED | REST API for translation. Part of Yandex Cloud. |
| **Yandex Vision** (Яндекс Vision OCR) | OCR + image analysis | Yes (Vision API) | IAM Token | Medium | MED | REST API for OCR, document recognition, classification. |
| **Salute (Sber AI)** | Sber's AI ecosystem (speech, vision, NLP) | Yes (SmartSpeech, SmartVision API) | Token | Large | MED | Multiple AI APIs from Sber ecosystem. |
| **Tinkoff VoiceKit** | Speech recognition/synthesis by T-Bank | Yes (VoiceKit API) | Token | Medium | MED | gRPC API for speech processing. High quality for Russian. |

---

## SUMMARY: TOP 50 HIGH-PRIORITY MCP CANDIDATES

Ranked by composite score (API availability 30%, market size 25%, automation potential 20%, existing MCP coverage 15%, dev ecosystem 10%):

| Rank | Service | Category | Priority | Key Reason |
|---|---|---|---|---|
| 1 | **Wildberries Seller API** | Marketplace | HIGH | #1 marketplace, no MCP exists, massive seller demand |
| 2 | **Ozon Seller API** | Marketplace | HIGH | #2 marketplace, excellent API, high automation need |
| 3 | **Bitrix24** | CRM | HIGH | 15M+ orgs, massive API surface, no RU MCP |
| 4 | **1C:Enterprise** | ERP | HIGH | De facto standard ERP, universal business need |
| 5 | **Yandex Direct** | Advertising | HIGH | Dominant ad platform, complex campaign management |
| 6 | **YooKassa** | Payments | HIGH | #1 payment gateway, 200K+ merchants |
| 7 | **Telegram Bot API** | Social/Messaging | HIGH | Dominant messenger, bot ecosystem |
| 8 | **VK API** | Social Media | HIGH | #1 social network, comprehensive API |
| 9 | **HeadHunter (hh.ru)** | HR/Recruiting | HIGH | #1 job board, OAuth2, massive data |
| 10 | **Yandex Metrica** | Analytics | HIGH | #1 web analytics, rich reporting API |
| 11 | **amoCRM** | CRM | HIGH | Sales CRM leader, strong automation |
| 12 | **T-Bank (Tinkoff) APIs** | Banking | HIGH | Best bank APIs in RU, gRPC Invest API |
| 13 | **CDEK** | Logistics | HIGH | #1 courier, OAuth2, 60K+ businesses |
| 14 | **MoySklad** | ERP/WMS | HIGH | Cloud ERP leader, excellent API |
| 15 | **Kontur ecosystem** | Accounting/EDM | HIGH | Critical compliance infrastructure |
| 16 | **Yandex Cloud** | Cloud | HIGH | #1 cloud, comprehensive gRPC+REST |
| 17 | **DaData** | Data/Geo | HIGH | Address/company lookup, used everywhere |
| 18 | **iiko** | HoReCa POS | HIGH | #1 restaurant POS, 50K+ restaurants |
| 19 | **Chestny ZNAK** | Compliance | HIGH | Mandatory labeling, growing categories |
| 20 | **Diadoc (Kontur)** | EDM | HIGH | #1 B2B document exchange, 2M+ orgs |
| 21 | **Yandex Market** | Marketplace | HIGH | Growing marketplace, Yandex ecosystem |
| 22 | **Avito** | Classifieds | HIGH | #1 classifieds, 90M+ users |
| 23 | **VK Ads** | Advertising | HIGH | Consolidated ad platform, large reach |
| 24 | **Sberbank Business API** | Banking | HIGH | #1 bank, 100M clients |
| 25 | **SBIS** | Business Platform | HIGH | Multi-function business platform |
| 26 | **CloudPayments** | Payments | HIGH | Modern payment API, subscriptions |
| 27 | **Yandex Eda** | Food Delivery | HIGH | Restaurant partner API, high automation |
| 28 | **Mango Office** | Telephony | HIGH | #1 cloud PBX, 60K+ businesses |
| 29 | **Pochta Russia** | Postal | HIGH | National postal service, universal need |
| 30 | **RetailCRM** | E-commerce CRM | HIGH | Purpose-built for e-commerce |
| 31 | **2GIS** | Maps | HIGH | Most detailed local data |
| 32 | **ATI.su** | Freight | HIGH | #1 freight exchange, 500K+ companies |
| 33 | **Unisender** | Email Marketing | HIGH | #1 email platform in RU |
| 34 | **Yandex Maps** | Maps | HIGH | Dominant mapping platform |
| 35 | **Evotor** | POS/Fiscal | HIGH | 800K+ terminals, Sber-backed |
| 36 | **YandexGPT** | AI/ML | HIGH | Yandex LLM, growing adoption |
| 37 | **GigaChat** | AI/ML | HIGH | Sber LLM, OpenAI-compatible API |
| 38 | **ATOL Online** | Fiscal | HIGH | Mandatory fiscalization |
| 39 | **Yandex Go B2B** | Transport | HIGH | Corporate taxi, expense automation |
| 40 | **Kontur.Extern** | Tax Reporting | HIGH | #1 tax reporting, compliance-critical |
| 41 | **Huntflow** | Recruiting ATS | HIGH | Purpose-built recruiting automation |
| 42 | **Yandex Tracker** | Project Management | HIGH | Growing Jira replacement |
| 43 | **SPARK (Interfax)** | Legal/BI | HIGH | Business intelligence, due diligence |
| 44 | **Kontur.Focus** | Legal/BI | HIGH | Counterparty verification |
| 45 | **Pravo.ru / Casebook** | Legal Tech | HIGH | Court case analytics |
| 46 | **Kaiten** | Project Management | HIGH | Modern PM, strong API |
| 47 | **Poster POS** | HoReCa | HIGH | Clean API, growing fast |
| 48 | **GetCourse** | EdTech | HIGH | 50K+ schools, info-business dominant |
| 49 | **Aviasales / Travelpayouts** | Travel | HIGH | #1 flight search, affiliate API |
| 50 | **CIAN** | Real Estate | HIGH | #1 real estate platform |

---

## METHODOLOGY NOTES

1. **API verification date:** Information reflects known API status as of early 2026. APIs change frequently — verification recommended before implementation.
2. **Sanctions impact:** Services under US/EU sanctions (Sber, VTB, etc.) may have restricted international API access but function normally within Russia.
3. **Missing from global MCP ecosystem:** As of this analysis, no major Russian service has an established open-source MCP server, making this entire list greenfield opportunity.
4. **Language consideration:** Most API documentation is in Russian only. MCP server implementations should handle Russian-language error messages and field names.
5. **Authentication patterns:** Russian APIs predominantly use API Key or Token auth. OAuth2 is used by larger platforms (Yandex, VK, banks). Government systems often require digital certificates (qualified electronic signatures).
6. **Telegram as meta-platform:** Many Russian B2B services offer Telegram bots as primary interface. MCP servers should consider Telegram bot bridging as a supplementary integration path.

---

*Total services cataloged: ~350+ across 38 categories*
*HIGH priority candidates: ~50*
*Estimated addressable market for MCP integrations: significant — Russian businesses increasingly adopting AI assistants and need standardized integration layers for domestic services.*
