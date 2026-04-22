# CIS MCP Research: Cross-Regional Services, Telegram Ecosystem & EAEU Systems

> Generated: 2026-04-01 | Analyst: OpenClaw Research Pipeline

---

## Section 1: Cross-CIS / Pan-Regional Services

Services operating across multiple CIS countries with MCP integration potential.

**Country codes:** RU = Russia, KZ = Kazakhstan, BY = Belarus, UZ = Uzbekistan, AM = Armenia, KG = Kyrgyzstan, TJ = Tajikistan, AZ = Azerbaijan, GE = Georgia, MD = Moldova, UA = Ukraine

---

### 1.1 Yandex Ecosystem

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| Yandex Cloud | RU | RU, KZ, BY | IaaS, PaaS, ML | Yes — cloud.yandex.ru/docs | IAM token + API key | **HIGH** | Compute, S3-compatible storage, YandexGPT API, SpeechKit, Translate, Vision, DataSphere. Full REST + gRPC |
| Yandex Maps API | RU | RU, KZ, BY, UZ, KG, AM, GE, AZ, TJ, MD | Maps, Geocoding, Routing | Yes — yandex.ru/dev/maps | API key | **HIGH** | Geocoder, Router, Static API, Places. Best CIS coverage by far |
| Yandex Direct | RU | RU, KZ, BY, UZ | Ads, PPC | Yes — yandex.ru/dev/direct | OAuth 2.0 | **HIGH** | Full campaign management API. Equivalent of Google Ads API for CIS |
| Yandex Metrica | RU | RU, KZ, BY, UZ, + any site | Web Analytics | Yes — yandex.ru/dev/metrika | OAuth 2.0 | **HIGH** | Reporting API, goal management, segment builder. Critical for CIS web analytics |
| Yandex Tracker | RU | RU, KZ, BY | Project Management | Yes — cloud.yandex.ru/docs/tracker | OAuth 2.0 / IAM | **HIGH** | Issue tracker, agile boards, workflows. Jira alternative dominant in RU enterprise |
| Yandex Market (Marketplace) | RU | RU, KZ, BY | E-commerce | Yes — yandex.ru/dev/market | OAuth 2.0 | **HIGH** | Seller API: orders, catalog, pricing, stocks, analytics. Growing marketplace |
| Yandex Delivery (Доставка) | RU | RU, KZ, BY | Logistics, Last-mile | Yes — yandex.ru/dev/logistics | OAuth 2.0 | **MED** | B2B delivery API, tracking, pricing estimation |
| Yandex Go (Taxi) | RU | RU, KZ, BY, UZ, KG, AM, GE, AZ, TJ, MD | Ride-hailing | Yes (B2B) — business.taxi.yandex.ru | OAuth 2.0 | **MED** | Corporate taxi API. Consumer API not public |
| Yandex Lavka | RU | RU, KZ | Grocery delivery | Limited — partner API only | API key | **LOW** | Dark store grocery. Limited partner integration |
| Yandex Eats | RU | RU, KZ | Food delivery | Partner API | OAuth 2.0 | **MED** | Restaurant partner API for order/menu management |
| Yandex Music | RU | RU, KZ, BY, UZ, KG, AM, AZ, TJ, MD, GE | Music streaming | No public API | — | **LOW** | No official API. Unofficial wrappers exist |
| Yandex 360 (Mail, Disk, Calendar) | RU | RU, KZ, BY | Productivity | Yes — yandex.ru/dev/api360 | OAuth 2.0 | **HIGH** | Org management, mail, disk, calendar APIs. Enterprise productivity suite |
| Yandex DataLens | RU | RU, KZ, BY | BI, Visualization | Yes (via Cloud) | IAM token | **MED** | BI tool with API access to dashboards and datasets |
| Yandex Webmaster | RU | RU, KZ, BY | SEO | Yes — yandex.ru/dev/webmaster | OAuth 2.0 | **MED** | Site indexing, search analytics, diagnostics |
| Yandex AppMetrica | RU | RU, KZ, BY, UZ, + global | Mobile Analytics | Yes — appmetrica.yandex.ru/docs | API key | **MED** | Mobile app analytics + push notifications |
| YandexGPT / Foundation Models | RU | RU, KZ, BY | AI/ML | Yes — cloud.yandex.ru/docs/foundation-models | IAM token | **HIGH** | Text generation, embeddings, classification. Growing LLM API |
| Yandex SpeechKit | RU | RU, KZ, BY | Speech, STT/TTS | Yes — cloud.yandex.ru/docs/speechkit | IAM token | **HIGH** | Best Russian-language STT/TTS. Streaming support |
| Yandex Translate | RU | RU, KZ, BY | Translation | Yes — cloud.yandex.ru/docs/translate | IAM token | **MED** | 100+ languages. Good CIS language support |
| Yandex Forms | RU | RU, KZ, BY | Forms, Surveys | Limited API | OAuth 2.0 | **LOW** | Form builder with some automation hooks |

### 1.2 VK (Mail.ru Group) Ecosystem

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| VK (VKontakte) | RU | RU, KZ, BY, UZ, KG, UA, MD, AM, AZ, TJ, GE | Social Network | Yes — dev.vk.com | OAuth 2.0 | **HIGH** | Massive API: messages, communities, ads, wall, friends, market. 100M+ MAU |
| VK Ads (VK Рекламa) | RU | RU, KZ, BY | Advertising | Yes — dev.vk.com/ru/api/ads | OAuth 2.0 | **HIGH** | Campaign management, targeting, analytics. Primary social ads platform in CIS |
| VK Mini Apps | RU | RU, KZ, BY | App Platform | Yes — dev.vk.com/ru/mini-apps | VK Bridge | **MED** | Mini app platform within VK. 30M+ users |
| OK (Odnoklassniki) | RU | RU, KZ, BY, UZ, KG, TJ, MD, AM, AZ, GE | Social Network | Yes — apiok.ru | OAuth 2.0 | **MED** | Older demographic. 40M+ MAU. Group/content APIs |
| VK Cloud (Mail.ru Cloud Solutions) | RU | RU, KZ, BY | IaaS, PaaS | Yes — cloud.vk.com/docs | API key / token | **HIGH** | S3, Kubernetes, ML Platform, databases. OpenStack-based |
| VK WorkSpace (ex-Myteam) | RU | RU, KZ, BY | Corporate messenger | Yes — myteam.mail.ru/botapi | Bot token | **MED** | Corporate messenger + mail + calendar. Enterprise market |
| VK Pay | RU | RU | Payments | Partner API | OAuth 2.0 | **LOW** | Payment within VK ecosystem. Limited geography |
| RuStore | RU | RU, KZ, BY | App Store | Yes — help.rustore.ru/rustore/for_developers | API key | **MED** | Android app store. Mandatory for RU-sold devices. Developer/publishing API |

### 1.3 E-commerce & Marketplaces

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| Wildberries | RU | RU, KZ, BY, AM, KG, UZ | Marketplace | Yes — openapi.wildberries.ru | API key (per-feature tokens) | **HIGH** | Largest CIS marketplace. APIs: content, prices, stocks, orders, analytics, ads, warehouses. 10M+ daily orders |
| Ozon | RU | RU, KZ, BY | Marketplace | Yes — docs.ozon.ru/api/seller | Client-ID + API key | **HIGH** | Second-largest marketplace. Seller API: products, orders, FBO/FBS, finance, analytics. Expanding to KZ/BY |
| Kaspi.kz | KZ | KZ | Super-app, Payments, Marketplace, Banking | Yes (partners) — kaspi.kz/developer | API key | **HIGH** | Dominant KZ super-app. 12M+ users (70% of KZ pop). Marketplace + payments + banking. Partner API for merchants |
| AliExpress Russia | RU/CN | RU, KZ, BY | Marketplace | Yes — openapi-docs.aliexpress.ru | API key | **MED** | JV with local partners. Seller API available |
| Uzum (ex-Uzum Market) | UZ | UZ | Marketplace | Limited | API key | **MED** | Largest UZ marketplace. Growing fast. API for sellers |
| Sbermarket (Kuper) | RU | RU, KZ | Grocery Delivery | Partner API | OAuth 2.0 | **LOW** | Grocery marketplace. Limited public API |
| Lamoda | RU | RU, KZ, BY, UA | Fashion E-commerce | Seller API | API key | **MED** | Fashion marketplace with seller integration API |
| Mega.kz | KZ | KZ | Marketplace | Limited | — | **LOW** | KZ local marketplace |

### 1.4 Fintech & Payments

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| YooKassa (ex-Yandex.Kassa) | RU | RU | Payment Gateway | Yes — yookassa.ru/developers | API key + Secret | **HIGH** | Dominant RU payment gateway. REST API, webhooks, recurring, payouts |
| Tinkoff (T-Bank) Acquiring | RU | RU | Payment Gateway, Banking | Yes — www.tinkoff.ru/kassa/dev | Terminal key + password | **HIGH** | Major bank. Acquiring API, e-commerce payments, SBP (fast payments) |
| Sber Acquiring | RU | RU | Payment Gateway | Yes | Certificate + token | **MED** | Largest bank. Payment API, SBP integration |
| Kaspi Pay | KZ | KZ | Payments | Partner API | API key | **HIGH** | Dominant KZ payment method. QR payments. 12M+ users |
| Halyk Bank | KZ | KZ | Banking, Payments | Yes — developer.halykbank.kz | OAuth 2.0 | **MED** | Major KZ bank with open banking API |
| Payme | UZ | UZ | Payments | Yes — developer.payme.uz | API key | **HIGH** | Dominant UZ payment system. Merchant API |
| Click | UZ | UZ | Payments | Yes — docs.click.uz | API key | **HIGH** | Major UZ payment. Merchant + USSD API |
| Uzcard | UZ | UZ | Card Processing | Yes (merchant) | API key | **MED** | National payment system of UZ |
| HUMO | UZ | UZ | Card Processing | Yes (merchant) | API key | **MED** | Second UZ card network |
| Freedom Pay | KZ | KZ, KG | Payments | Yes | API key | **MED** | Growing KZ fintech with cross-border ambitions |
| Robokassa | RU | RU, KZ | Payment Aggregator | Yes — docs.robokassa.ru | Merchant + hash | **MED** | Multi-PSP aggregator. Simple integration |
| CloudPayments | RU | RU, KZ, BY | Payment Gateway | Yes — developers.cloudpayments.ru | Public ID + API secret | **MED** | Modern payment API with Apple/Google Pay, subscriptions |
| Bepaid | BY | BY | Payment Gateway | Yes — docs.bepaid.by | API key | **MED** | Dominant BY payment gateway |
| ЕРИП (ERIP) | BY | BY | Payment System | Yes (banks) | Certificate | **MED** | National BY payment system. All utility/govt payments go through it |
| IDPay | TJ | TJ | Payments | Yes | API key | **LOW** | TJ mobile payments |

### 1.5 Business & CRM

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| Bitrix24 | RU | RU, KZ, BY, UZ, UA, + 18 languages global | CRM, Project Management | Yes — dev.1c-bitrix.ru/rest_help | OAuth 2.0 / Webhook | **HIGH** | Dominant CIS CRM/PM. REST API covers CRM, tasks, calendar, drive, telephony, chat. 15M+ orgs |
| amoCRM | RU | RU, KZ, BY, UZ | CRM (Sales) | Yes — amocrm.ru/developers | OAuth 2.0 | **HIGH** | Sales-focused CRM. Full REST API: leads, contacts, pipelines, webhooks. Popular with SMB |
| 1C:Enterprise | RU | RU, KZ, BY, UZ, KG, AM, AZ, TJ, MD | ERP, Accounting | Yes — OData/REST/SOAP | Session auth / API key | **HIGH** | De facto CIS accounting/ERP standard. Used by 90%+ of RU businesses. 1C:Fresh cloud API. Massive ecosystem |
| MoySklad (МойСклад) | RU | RU, KZ, BY | Inventory, Accounting | Yes — dev.moysklad.ru | Bearer token | **HIGH** | Cloud inventory/warehouse. JSON API v2.0. Popular with e-commerce sellers |
| Planfix | RU | RU, KZ, BY | Project Management | Yes — planfix.ru/docs/api | API key + token | **MED** | Flexible PM/CRM. REST API |
| Megaplan | RU | RU, KZ, BY | CRM, PM | Yes — help.megaplan.ru/api | API key | **MED** | CRM + project management combo |
| RetailCRM | RU | RU, KZ, BY | E-commerce CRM | Yes — docs.retailcrm.ru | API key | **HIGH** | Specialized e-commerce CRM. Order management, omnichannel. Integrates with all CIS marketplaces |
| YouGile | RU | RU, KZ, BY | Project Management | Yes | API key | **LOW** | Kanban/PM tool |
| Kaiten | RU | RU, KZ, BY | Project Management | Yes — developer.kaiten.ru | Bearer token | **MED** | Advanced PM with workflow automation |

### 1.6 HR & Recruitment

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| HeadHunter (hh.ru) | RU | RU, KZ (hh.kz), BY, UZ (hh.uz) | Job Board | Yes — github.com/hhru/api | OAuth 2.0 | **HIGH** | Dominant CIS job board. Extensive API: vacancies, resumes, employers, negotiations. Well-documented |
| SuperJob | RU | RU | Job Board | Yes — api.superjob.ru | OAuth 2.0 | **MED** | Second RU job board. REST API |
| Работа.ру (Rabota.ru) | RU | RU | Job Board | Limited | — | **LOW** | Sber-owned job board |
| HR Link | RU | RU, KZ | HR Document Management | Yes | API key | **MED** | Electronic HR document signing |

### 1.7 Logistics & Delivery

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| CDEK (СДЭК) | RU | RU, KZ, BY, AM, KG, UZ | Courier, Parcels | Yes — api-docs.cdek.ru | Client ID + Secret (OAuth 2.0) | **HIGH** | Major CIS courier. Full API: orders, tracking, tariffs, pickup points. Cross-border delivery |
| Boxberry | RU | RU, KZ, BY | Parcels | Yes — api.boxberry.ru | API token | **MED** | Parcel delivery network. Pickup points. REST API |
| DPD (RU) | RU | RU, KZ, BY | Courier | Yes | SOAP/REST | **MED** | International courier with CIS coverage |
| Pony Express | RU | RU, KZ, BY, UA | Courier | Yes | API key | **LOW** | Courier services |
| Dostavista (Borzo) | RU | RU, KZ, UZ + global | Same-day delivery | Yes — borzo.com/api | API key | **HIGH** | On-demand delivery. Clean REST API. Multi-country |
| Maxim (taxi/delivery) | RU | RU, KZ, BY, UZ, KG, TJ, GE, BG | Ride-hailing, Delivery | Limited B2B API | — | **MED** | Major non-Yandex taxi. 15M+ users. B2B corporate API available |
| InDrive | RU (HQ moved) | RU, KZ, UZ, KG, TJ + 47 countries | Ride-hailing | No public API | — | **LOW** | Price-negotiation ride-hailing. No API for integration |
| Bolt | EE | KZ, GE, AZ | Ride-hailing | No public API | — | **LOW** | Active in CIS periphery. No API |
| Glovo | ES | KZ, KG, GE, UA, BY | Delivery | Partner API | — | **LOW** | Active in several CIS countries. Restaurant partner API |

### 1.8 Telecom & Communication

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| SendPulse | UA (global) | RU, KZ, BY, UA, UZ + global | Email, SMS, Push, Chatbots | Yes — sendpulse.com/integrations/api | OAuth 2.0 | **HIGH** | Multi-channel marketing. REST API: email, SMS, push, chatbots (TG, VK, FB). CIS-originated, global |
| Unisender | RU | RU, KZ, BY, UA | Email Marketing | Yes — www.unisender.com/ru/support/api | API key | **HIGH** | Major CIS email platform. Full API: contacts, campaigns, templates, stats |
| Zadarma | RU | RU, KZ, BY, UA, UZ + global | Cloud PBX, VoIP | Yes — zadarma.com/ru/support/api | API key + secret | **HIGH** | Virtual PBX + SIP. API for calls, PBX config, SMS, call recording. 80+ countries |
| Mango Office | RU | RU, KZ, BY | Cloud PBX | Yes — www.mango-office.ru/support/api | API key | **MED** | Business telephony. Call tracking, virtual PBX |
| UIS (CoMagic) | RU | RU, KZ | Call Tracking | Yes | API key | **MED** | Call tracking + analytics |
| SMS.ru | RU | RU, KZ | SMS Gateway | Yes — sms.ru/api | API key | **MED** | Simple SMS sending API |
| SMSC.ru | RU | RU, KZ, BY, UA | SMS Gateway | Yes — smsc.ru/api | Login + password/hash | **MED** | Multi-channel: SMS, Viber, VK, push |

### 1.9 Data & Infrastructure

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| DaData | RU | RU | Address/Company data | Yes — dadata.ru/api | API key + Secret | **HIGH** | Address standardization, company lookup (by INN/OGRN), bank lookup. Essential for RU business apps |
| KONTUR (СКБ Контур) | RU | RU | Accounting, EDI, API | Yes — developer.kontur.ru | API key + Certificate | **HIGH** | Focus-API (company data), Extern (tax filing), Diadoc (EDI). Critical for RU enterprise |
| 2GIS | RU | RU, KZ, KG, UZ, CZ, AE | Maps, Business Directory | Yes — docs.2gis.com/en/api | API key | **HIGH** | Detailed indoor maps + business catalog. REST API: geocoding, routing, places search. Best building-level data |
| FIAS/KLADR (ГАР) | RU | RU | Address Database | Yes — fias.nalog.ru | Open | **MED** | Official RU address database. Free API |
| EGRUL/EGRIP (ФНС) | RU | RU | Company Registry | Yes — bo.nalog.ru | Open | **MED** | Official company registry. Free lookup |
| Selectel | RU | RU, KZ, BY | Cloud Infrastructure | Yes — developers.selectel.ru | API key / token | **MED** | RU cloud provider with OpenStack-based API |
| reg.ru | RU | RU, KZ, BY | Domain, Hosting | Yes — www.reg.ru/support/api | API key | **LOW** | Domain registrar + hosting |

### 1.10 Travel & Booking

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| Aviasales | RU | RU, KZ, BY, UZ + global | Flight Search | Yes — travelpayouts.com/developers/api | API token | **HIGH** | Largest CIS flight metasearch. Travelpayouts affiliate API: flights, hotels, search, deeplinks |
| Ostrovok (Emerging Travel Group) | RU | RU, KZ, BY + global | Hotel Booking | Yes (B2B) | API key | **MED** | Hotel booking API for agents/partners |
| Tutu.ru | RU | RU, KZ, BY | Rail/Bus/Air Tickets | Limited | — | **LOW** | Major RU transport booking. No full public API |
| Bronevik.com | RU | RU, KZ | Hotel Booking | Yes (B2B) | API key | **MED** | Hotel booking distribution API |
| Sutochno.ru | RU | RU, KZ, BY | Short-term Rentals | Limited | — | **LOW** | CIS equivalent of Airbnb |

### 1.11 Education & Content

| Service | HQ Country | Countries Active | Categories | Public API? | Auth Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|---|
| iSpring | RU | RU, KZ, BY + global | LMS | Yes — ispringlearn.ru/api | API key | **MED** | Corporate LMS with REST API |
| GetCourse | RU | RU, KZ, BY | Online Courses | Yes — getcourse.ru/pl/api | API key | **MED** | Dominant CIS course platform. API for users, deals, groups |
| Tilda | RU | RU, KZ, BY, UA + global | Website Builder | Yes — help.tilda.cc/api | API key | **MED** | Landing pages + simple sites. Export API + webhooks |
| eLama | RU | RU, KZ, BY | Ad Management | Yes | API key | **MED** | Multi-platform ad manager for Yandex Direct + VK Ads + Google Ads |

---

## Section 2: Telegram Ecosystem in CIS

Telegram is the dominant messaging platform across CIS with 80M+ users in Russia alone, and effective market penetration of 60-90% of internet users in Central Asian CIS countries.

### 2.1 Telegram Platform APIs

| API / Feature | What it does | MCP Priority | API Documentation |
|---|---|---|---|
| Bot API | Create bots, send messages, inline queries, payments, web apps | **HIGH** | core.telegram.org/bots/api |
| Telegram Login Widget | OAuth via Telegram for websites | **HIGH** | core.telegram.org/widgets/login |
| Telegram Payments API | In-chat payments via payment providers | **HIGH** | core.telegram.org/bots/payments |
| Mini Apps (Web Apps) | Full web apps inside Telegram | **HIGH** | core.telegram.org/bots/webapps |
| Telegram Business API | Auto-replies, away messages, business hours for Telegram Business accounts | **HIGH** | core.telegram.org/bots/features#telegram-business |
| Bot API Updates (Webhooks) | Real-time event delivery | **HIGH** | core.telegram.org/bots/api#getting-updates |
| Telegram Stars | In-app currency for digital goods | **HIGH** | core.telegram.org/bots/payments#supported-currencies |
| Telegram Gateway | Official SMS verification gateway | **MED** | gateway.telegram.org |
| TDLib | Full Telegram client library | **MED** | core.telegram.org/tdlib |
| MTProto | Low-level protocol | **LOW** | core.telegram.org/mtproto |

### 2.2 Payment Bots & Financial Services

| Bot / Mini-App | What it does | Countries | User Base Estimate | API Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| @wallet | Telegram's built-in crypto wallet + P2P exchange | RU, KZ, BY, UZ, + global | 50M+ | Telegram Payments API + TON | **HIGH** | TON-based. Supports buy/sell/send crypto. Built-in to Telegram |
| @CryptoBot | P2P crypto exchange + payment acceptance | RU, KZ, BY, UZ + global | 20M+ | Bot API + own payment API (t.me/CryptoBot) | **HIGH** | Accept crypto payments in bots. CryptoPay API for merchants |
| @SBPay_bot / SBP bots | Fast payment system (СБП) integration | RU | 5M+ | Bot API | **MED** | Various banks offer SBP payment bots |
| @YooMoneyBot | YooMoney (ex-Yandex.Money) balance, transfers | RU | 3M+ | Bot API | **MED** | Check balance, send money, payment history |
| @kasaborbot / Kaspi bots | Kaspi bank notifications, P2P | KZ | 5M+ | Bot API (unofficial) | **MED** | Unofficial but widely used. Kaspi notifications via TG |
| @xraborbot | Currency exchange rates | RU, KZ, BY, UZ | 2M+ | Bot API | **LOW** | Real-time exchange rates for CIS currencies |

### 2.3 Business Automation Bots

| Bot / Mini-App | What it does | Countries | User Base Estimate | API Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| @BotFather | Bot creation and management | Global | 100M+ | Telegram Bot API | **HIGH** | Foundation of all TG bots |
| @Combot | Community management, analytics, moderation | RU, KZ, BY + global | 10M+ groups | Bot API + own analytics API | **HIGH** | Group analytics, auto-moderation, member scoring. Leading CIS community tool |
| @ControllerBot | Channel post scheduling, reactions analytics | RU, KZ, BY | 500K+ channels | Bot API | **MED** | Post scheduling, best time to post, analytics |
| @TGStat_Bot | Channel/chat analytics and search | RU, KZ, BY, UA, UZ | 2M+ | Bot API + tgstat.ru API | **HIGH** | TGStat API available (tgstat.ru/docs/api). Channel metrics, search, audience overlap |
| @LivegramBot | Feedback bot builder (user-to-admin messaging) | RU, KZ, BY + global | 5M+ bots created | Bot API | **MED** | No-code feedback bot. Widely used for customer support |
| @Chatfuel / @ManyBot | No-code bot builders | RU, KZ, BY + global | 3M+ bots | Bot API | **MED** | Visual bot builders popular in CIS |
| @Senler | VK + Telegram newsletter automation | RU, KZ, BY | 500K+ | Bot API + own API (senler.ru/api) | **MED** | CIS-specific marketing automation |
| @SaleBotBot | Sales funnel automation inside Telegram | RU, KZ, BY | 300K+ | Bot API + Salebot API | **MED** | CRM-like pipelines, auto-replies, funnels. salebot.pro/api |
| @BotMother bots | Bot constructor platform | RU, KZ, BY, UZ | 200K+ bots | Bot API | **LOW** | No-code bot builder |

### 2.4 Government Service Bots

| Bot / Mini-App | What it does | Countries | User Base Estimate | API Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| @GosUslugiBot (unofficial) | Gosuslugi notifications | RU | 1M+ | Bot API (unofficial) | **MED** | Various unofficial bots forwarding govt notifications |
| @eglobal_bot / eGov bots | e-Government service access | KZ | 2M+ | Bot API | **MED** | eGov.kz services via Telegram. ID queries, tax info |
| @TashkentCityBot | Tashkent city services | UZ | 500K+ | Bot API | **LOW** | Local government services |
| @CourtBot_uz | Court case tracking | UZ | 200K+ | Bot API | **LOW** | UZ court system notifications |
| @MIB_uz_bot | Bureau of Mandatory Enforcement | UZ | 300K+ | Bot API | **LOW** | Check fines, enforcement cases |
| @OpenDataBot_ua | Company/court/registry data | UA | 1M+ | Bot API + opendatabot.ua API | **MED** | Ukrainian registry data. Full API available |

### 2.5 E-commerce & Marketplace Bots / Mini Apps

| Bot / Mini-App | What it does | Countries | User Base Estimate | API Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| Telegram Mini App stores | In-Telegram shops via Mini Apps | RU, KZ, BY, UZ | Growing fast | Mini Apps API | **HIGH** | Booming category. Hundreds of stores launching as Mini Apps |
| @WildberriesBot (unofficial) | WB order tracking, price monitoring | RU, KZ, BY | 3M+ | Bot API | **MED** | Unofficial but massive adoption |
| @OzonBot (unofficial) | Ozon order tracking | RU, KZ | 1M+ | Bot API | **MED** | Order status, price alerts |
| @AvitoBot (unofficial) | Avito listing alerts | RU | 2M+ | Bot API | **LOW** | New listing notifications |
| Uzum Mini App | Uzum marketplace access | UZ | 1M+ | Mini Apps API | **MED** | Growing UZ marketplace in TG |
| Various food delivery bots | Order food via Telegram | RU, KZ, UZ | 5M+ combined | Bot API / Mini Apps | **MED** | Many local restaurants use TG bots for orders |

### 2.6 Delivery & Logistics Bots

| Bot / Mini-App | What it does | Countries | User Base Estimate | API Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| @cdaborbot / CDEK bots | Package tracking | RU, KZ, BY | 2M+ | Bot API + CDEK API | **MED** | Track CDEK shipments |
| @pickpointbot | Parcel locker tracking | RU | 500K+ | Bot API | **LOW** | Pickup point network |
| @DostavistaBot | Same-day delivery ordering | RU, KZ, UZ | 500K+ | Bot API + Borzo API | **MED** | Order courier delivery via bot |
| @YandexGoBot (unofficial) | Yandex Go ride/delivery | RU, KZ | 1M+ | Bot API | **LOW** | Unofficial ride tracking |

### 2.7 Notable Telegram Mini Apps (2025-2026 Trend)

| Mini App | What it does | Countries | User Base Estimate | API Type | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| Hamster Kombat | Tap-to-earn game (now TON-integrated) | RU, KZ, UZ + global | 300M+ claimed | Mini Apps + TON | **LOW** | Cultural phenomenon but limited MCP utility |
| Notcoin | Tap-to-earn + TON token | Global (CIS origin) | 40M+ | Mini Apps + TON | **LOW** | First mass-adoption Mini App |
| TON Space | TON wallet in Telegram | RU, KZ, BY + global | 20M+ | Mini Apps + TON Connect | **HIGH** | Self-custodial wallet. TON Connect API for dApps |
| Blum | Trading/GameFi Mini App | RU, KZ + global | 50M+ | Mini Apps + TON | **LOW** | Crypto trading gamification |
| Fragment | Username/number marketplace | Global | 5M+ | Mini Apps + TON | **MED** | Telegram username trading. TON-based |
| Getgems | NFT marketplace | Global (CIS heavy) | 3M+ | Mini Apps + TON | **LOW** | TON NFT marketplace |
| Various booking Mini Apps | Restaurant/salon booking | RU, KZ | Growing | Mini Apps API | **MED** | Rising category: local business booking via TG |

### 2.8 Telegram Business Features (2024-2026)

| Feature | What it does | MCP Relevance | Notes |
|---|---|---|---|
| Business Accounts | Dedicated business profile with hours, location, greeting | **HIGH** | Bots can manage business account messaging |
| Business Intro | Custom profile intro for first-time visitors | **MED** | Configurable via Bot API |
| Away Messages | Auto-replies when away | **HIGH** | Bot-managed automatic responses |
| Quick Replies | Saved reply templates | **MED** | Shortcut messages for common queries |
| Business Hours | Set working schedule | **MED** | Display availability |
| Business Location | Map pin on profile | **LOW** | Static info |
| Chatbot Integration | Connect bot to manage business messages | **HIGH** | Key MCP opportunity: bot acts as business assistant |
| Custom Start Page | Branded experience for business chats | **MED** | Customizable first-contact experience |

---

## Section 3: EAEU (Eurasian Economic Union) Shared Systems

EAEU members: Russia (RU), Kazakhstan (KZ), Belarus (BY), Armenia (AM), Kyrgyzstan (KG).

Observer/candidate states: Uzbekistan, Moldova, Cuba.

### 3.1 Shared Marking & Labeling Systems

| System | What it does | Countries | API Available? | MCP Priority | Notes |
|---|---|---|---|---|---|
| Честный ЗНАК / "Chestny ZNAK" (marking.crpt.ru) | Mandatory product marking & tracing (track-and-trace) | RU (primary), KZ (planned integration), BY (planned), AM, KG (in progress) | Yes — markirovka.crpt.ru/api | **HIGH** | Covers: tobacco, medicines, dairy, water, shoes, clothes, tires, perfumes, beer, electronics. REST API for marking, emission, reporting. Critical for any CIS product business |
| GS1 EAEU | Barcode/GTIN standards harmonization | RU, KZ, BY, AM, KG | Yes — gs1ru.org/api (varies by country) | **MED** | Unified product identification standards |
| Маркировка КЗ (IS Marking KZ) | Kazakhstan national marking system | KZ | Yes — markirovka.kz | **MED** | Being aligned with Chestny ZNAK. Phased rollout |
| Маркировка BY (Marking BY) | Belarus national marking system | BY | Yes — marking.by | **MED** | Tobacco, shoes, fur, tires. Aligning with EAEU standards |

### 3.2 Cross-Border Payment Systems

| System | What it does | Countries | API Available? | MCP Priority | Notes |
|---|---|---|---|---|---|
| ЕАЭС Платежное пространство (EAEU Payment Space) | Interoperable payment infrastructure | RU, KZ, BY, AM, KG | In development | **HIGH** | Goal: seamless cross-border payments. Building on national systems (Mir, Belkart, ArCa, Elcart) |
| Mir (МИР) card network | Russian national payment card | RU, BY, KZ (limited), AM, KG, UZ, TJ | Via acquiring banks | **MED** | Cross-border acceptance expanding. Under sanctions pressure |
| СПФС (SPFS — System for Transfer of Financial Messages) | SWIFT alternative messaging system | RU, BY, KZ, KG, AM + others | Via banks | **MED** | Russian SWIFT alternative. ~550 participants. Banks can integrate |
| SBP International | Cross-border fast payments | RU → KZ, BY, AM, KG (planned) | Via NSPK | **MED** | Extending Russia's instant payment system internationally |
| Belkart | Belarus national card network | BY, + acceptance in RU | Bank API | **LOW** | BY national cards |
| ArCa | Armenian national card network | AM, + acceptance in RU | Bank API | **LOW** | AM national cards |
| Elcart | Kyrgyz national card network | KG | Bank API | **LOW** | KG national cards |

### 3.3 Customs & Trade Systems

| System | What it does | Countries | API Available? | MCP Priority | Notes |
|---|---|---|---|---|---|
| Единое окно (Single Window EAEU) | Unified customs declaration portal | RU, KZ, BY, AM, KG | Yes — via national customs APIs | **HIGH** | Harmonized customs documentation. Electronic declaration. National implementations vary but converging |
| ТН ВЭД ЕАЭС (CN FEA EAEU) | Common commodity nomenclature | RU, KZ, BY, AM, KG | Yes — tks.ru, customs APIs | **MED** | Unified tariff classification. Available as reference data API |
| ЕАИС ТК (EAEU Customs Integration) | Customs info exchange between member states | RU, KZ, BY, AM, KG | Government-only | **LOW** | Inter-governmental data exchange. Not public |
| Электронная сертификация (eCert) | Electronic phytosanitary/veterinary certificates | RU, KZ, BY, AM, KG | Via Rosselkhoznadzor (Mercury system) | **MED** | mercury.vetrf.ru — electronic vet certification. REST API available |
| Mercury (ФГИС "Меркурий") | Veterinary e-certification | RU (primary), EAEU (recognition) | Yes — mercury.vetrf.ru/pub/apiLogin.html | **HIGH** | Mandatory for all animal product movement. SOAP/REST API. All food businesses must integrate |
| ASYCUDA (UNCTAD) | Customs management | KG, TJ (CIS users) | Yes | **LOW** | UN customs system used by some CIS countries |

### 3.4 Digital Identity & Trust

| System | What it does | Countries | API Available? | MCP Priority | Notes |
|---|---|---|---|---|---|
| Единая биометрическая система (Unified Biometric System) | National biometric ID | RU | Yes — ebs.rt.ru/api | **MED** | Remote biometric verification. Bank/govt integration API |
| ЕСИА (ESIA / Gosuslugi ID) | National digital identity | RU | Yes — esia.gosuslugi.ru (partner access) | **HIGH** | OAuth-based authentication. Used by banks, govt, telcos. 100M+ accounts |
| eGov Mobile / Digital ID KZ | Kazakhstan digital identity | KZ | Yes — egov.kz developer portal | **MED** | Growing digital ID with biometric. eGov API |
| Digital ID BY | Belarus digital ID initiative | BY | In development | **LOW** | Early stages |
| Единая система идентификации ЕАЭС | EAEU cross-border digital ID initiative | RU, KZ, BY, AM, KG | In development | **HIGH** | Planned mutual recognition of digital signatures and identity. Key future MCP opportunity |
| ЭЦП / КЭП (Electronic Digital Signature) | Qualified electronic signatures | RU, KZ, BY, AM, KG | Via CryptoPro API (RU), NCALayer (KZ) | **MED** | Each country has own CA infrastructure. NCALayer (KZ) has REST API. CryptoPro (RU) has COM/JCP API |

### 3.5 Shared Regulatory & Compliance

| System | What it does | Countries | API Available? | MCP Priority | Notes |
|---|---|---|---|---|---|
| Технические регламенты ЕАЭС (EAEU Technical Regulations) | Common product safety standards | RU, KZ, BY, AM, KG | Reference databases | **MED** | 50+ technical regulations. Product certification required for EAEU market |
| ФТС России API (Russian Customs Service) | Customs statistics, tariff lookup | RU (primary), EAEU data | Yes — customs.gov.ru | **MED** | Trade statistics, HS code lookup |
| EAEU Register of EAC Certificates | Unified register of conformity certificates | RU, KZ, BY, AM, KG | Yes — fsa.gov.ru/use-api | **HIGH** | Verify product certifications across EAEU. Public API |
| Антимонопольный реестр ЕАЭС | Competition/antitrust registry | RU, KZ, BY, AM, KG | Limited | **LOW** | Regulatory data |

---

## MCP Priority Summary

### Top 15 HIGH-Priority MCP Servers for CIS

| # | Service | Category | Rationale |
|---|---|---|---|
| 1 | **Telegram Bot + Mini Apps + Business** | Platform | De facto CIS OS. 80M+ RU users. Payments, commerce, automation |
| 2 | **Wildberries Seller API** | E-commerce | Largest CIS marketplace. 10M+ daily orders. Full seller API |
| 3 | **Ozon Seller API** | E-commerce | #2 marketplace. Growing fast. Well-documented API |
| 4 | **Bitrix24** | CRM/PM | 15M+ orgs. Dominant CIS CRM. Extensive REST API |
| 5 | **1C:Enterprise / 1C:Fresh** | ERP/Accounting | Used by 90%+ RU businesses. Absolutely essential |
| 6 | **Yandex Cloud + YandexGPT** | Cloud/AI | Leading CIS cloud. LLM API growing fast |
| 7 | **Yandex Direct + Metrica** | Ads/Analytics | Primary CIS ad platform + analytics |
| 8 | **VK API + VK Ads** | Social/Ads | 100M+ MAU. Major social ads platform |
| 9 | **Kaspi.kz** | Super-app (KZ) | 70% KZ penetration. Payments + marketplace + banking |
| 10 | **HeadHunter** | HR | Dominant CIS job board. Excellent API |
| 11 | **amoCRM** | CRM | Leading SMB sales CRM. Full API |
| 12 | **CDEK** | Logistics | Major cross-border CIS courier. Full API |
| 13 | **YooKassa** | Payments | Dominant RU payment gateway |
| 14 | **Chestny ZNAK (Marking)** | Regulatory | Mandatory product marking. Every product business needs it |
| 15 | **DaData + 2GIS** | Data/Geo | Essential address/company data + best CIS maps |

### Quick Stats

- **Total services cataloged:** 130+
- **Services with public APIs:** ~90 (70%)
- **Cross-border services (3+ countries):** ~40
- **HIGH priority MCP candidates:** 35+
- **MED priority:** 45+
- **Countries with richest API ecosystems:** RU >> KZ > BY > UZ > UA

---

*This research is a point-in-time snapshot (April 2026). API availability and country coverage change frequently. Verify current status before building MCP integrations.*
