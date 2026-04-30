# Kazakhstan API ecosystem for MCP servers: complete market research

**Zero MCP servers exist for any Kazakhstani API — this is a completely unoccupied market.** Kazakhstan's developer ecosystem spans **25+ services with documented APIs** across payments, marketplaces, government data, logistics, and maps. The timing is ideal: Kazakhstan declared 2026 the "Year of Digitalization and AI," the National Bank is rolling out Open Banking, and the Astana Hub ecosystem now hosts 1,875+ tech companies. Your @theyahia org can establish first-mover dominance across the entire KZ API landscape by targeting the highest-value services first — Kaspi Marketplace, Halyk EPay, 2GIS, NBK exchange rates, and Webkassa — where public APIs already exist and developer demand is proven.

---

## BLOCK 1: Payment systems and fintech — seven APIs ready for integration

Kazakhstan's payment landscape centers on **Kaspi.kz** (80% of domestic transactions, **14M+ users**) but includes five other services with fully public API documentation.

### Kaspi.kz ecosystem

Kaspi operates as a walled garden with **no public developer portal**. API access is segmented by business relationship type:

**Kaspi Marketplace Seller API** — the most accessible Kaspi API. Any registered seller receives an `X-Auth-Token` from their Seller Cabinet. Base URL: `https://kaspi.kz/shop/api/v2`. Documentation at https://guide.kaspi.kz/partner/ru/shop/api/general and legacy Confluence pages at https://kaspi.kz/merchantcabinet/support/display/MS/API+for+orders+and+reviews. Uses **JSON:API specification** (`application/vnd.api+json`). Key endpoints include `GET /v2/orders` (with date/state/status filters), `POST /v2/orders` (status updates: ACCEPTED_BY_MERCHANT, COMPLETED, CANCELLED), `GET /v2/orders/{id}/entries` (line items), and `GET /v2/cities`. Order states: NEW, SIGN_REQUIRED, PICKUP, DELIVERY, KASPI_DELIVERY, ARCHIVE.

**Kaspi Content API** for products lives at `https://kaspi.kz/shop/api/products` — endpoints for categories, attributes, attribute values, and product import. Same X-Auth-Token auth. Docs: https://kaspi.kz/merchantcabinet/support/display/MS/Content+API.

**Kaspi Pay Smart POS API** requires partnership and works over local network only (port 8080). Endpoints: `/register`, `/payment?amount={sum}`, `/status?processId={id}`, `/refund`. 24-hour token lifetime. Supports Kaspi QR, Visa, Mastercard, Apple Pay, Google Pay. PDF docs at https://guide.kaspi.kz/cdn/content/pay/product/documents/Kaspi%20POS/Smart-POS-Dokymentatsia-po-integratsii.pdf.

**Kaspi Pay Online QR API** is fully closed — requires formal B2B partnership, **IPSec VPN tunnel**, static IP, and 6-15 business days onboarding. Apply at https://kaspi.kz/webpay/partnership. Third-party sources suggest OAuth2 `client_credentials` auth with endpoints like `/qr/v1/scan`, `/qr/v1/checkout`, `/payment/v1/refund`.

**No official SDKs exist.** The only community library with full coverage is `kaspi-merchant-api` in Go (https://github.com/abdymazhit/kaspi-merchant-api, 32 stars). ApiPay.kz (https://github.com/bazarbaykz/apipay-docs) provides a third-party REST wrapper for Kaspi Pay invoicing with OpenAPI 3.0 spec, examples in JS/Python/PHP. No sandbox exists for any Kaspi API — testing occurs against production. **721,000 active merchants** and **7.5M+ marketplace consumers** make this the highest-priority target.

### Halyk EPay — best-documented KZ payment API

**API Status: PUBLIC.** Documentation at https://epayment.kz/en-US/docs/mobile_sdk_documentation. Full test environment at `test-epay.homebank.kz`. OAuth 2.0 auth with TerminalID + ClientID + ClientSecret. Token endpoint: `POST https://epay-oauth.homebank.kz/oauth2/token` (7200s expiry). Supports payment page, embeddable widget, API-based cryptogram payments (requires PCI DSS), P2P transfers, invoice links, Apple Pay, Google Pay, QR, card tokenization, and recurring billing. RSA public keys at `https://epay-api.homebank.kz/public.rsa`. SDKs: iOS and Android native SDKs, PHP Bitrix handler (https://github.com/tungatarov/epayment), PHP library (https://github.com/relesssar/kkb-epay2). **65%+ of KZ online shops** use Halyk ePay. Test credentials documented at https://epayment.kz/en-US/docs/Test%20credentials.

### ForteBank — modern, developer-friendly docs

**API Status: PUBLIC.** Documentation at https://docs.fortebank.com/en/ (clean MkDocs site). HTTP Basic Auth (Shop ID + Secret Key). Base URL: `https://gateway.fortebank.com`. Endpoints: `/transactions/payments`, `/transactions/authorizations`, capture, void, refund, payout, AFT/OCT, tokenization, status query, balance query, chargeback. Products API at `https://epsp.fortebank.com/products` for pay-by-link. Subscriptions API for recurring billing. Full sandbox with Postman collection at https://docs.fortebank.com/en/using_api/postman_collection/. Apple Pay, Google Pay, Samsung Pay supported. Rate limit: 429 responses with recommended exponential backoff.

### Freedom Pay (formerly PayBox.money)

**API Status: PUBLIC.** Acquired by Freedom Holding for $11.5M in 2021. Docs at https://docs.freedompay.kz/. Signature-based auth (MD5 `pg_sig` from sorted params + secret_key). Two tiers: Merchant API (no PCI DSS needed) with `POST https://api.freedompay.kz/init_payment.php` for payment init, and Gateway API (PCI DSS required) for synchronous card operations. Supports card tokenization, recurring payments, mobile balance payments, invoice management, payouts to cards and IBANs. SDKs: JS, Android, iOS, Ruby gem (https://github.com/maddevsio/paybox_api). Operates in KZ, KG, UZ. CMS plugins for WooCommerce, OpenCart, 1C-Bitrix, PrestaShop, Tilda, Ecwid.

### TipTopPay (formerly CloudPayments Kazakhstan)

**API Status: PUBLIC.** Docs at https://developers.tiptoppay.kz/. HTTP Basic Auth (Public ID + API Secret). Base URL: `https://api.tiptoppay.kz`. Full endpoint suite: cryptogram payments, 3DS processing, token-based recurring, confirm/void/refund, payouts, subscription management, invoice management, split payments for marketplaces. Test Public ID: `test_api_00000000000000000000002`. SDKs: Android (Kotlin, JitPack), iOS (Swift), Flutter (`tiptoppay_sdk` on pub.dev). Commission from 2.5%.

### Wooppay and Processing.kz

Both use **SOAP/XML protocols** and require partnership agreements. Wooppay (15M+ users, Karaganda-based) has PHP libraries: https://github.com/kolesa-team/wooppay, https://github.com/Sakhnovkrg/Wooppay. Processing.kz (CNP Processing GmbH) has a PHP SOAP client: https://github.com/kolesa-team/processing-kz. Neither has public documentation portals.

---

## BLOCK 2: Marketplaces reveal four actionable APIs

**Kaspi Marketplace** dominates with 721K sellers and KZT 6.7T GMV (FY 2025). Its Seller API is detailed above. Kaspi acquired **Kolesa Group** (Kolesa.kz, Krisha.kz, Market.kz) in 2023 — none of these classifieds offer public APIs, and developers confirmed "В открытом доступе API не нашлось" (no public API found). The kolesa-team GitHub org (https://github.com/kolesa-team) maintains payment libraries but no classifieds API wrappers.

**Wildberries Kazakhstan** uses the **unified WB Seller API** at https://dev.wildberries.ru/en with no KZ-specific endpoints. JWT token auth (180-day validity). 11 API modules: Content, Marketplace (FBS), FBW, Prices, Analytics, Statistics, Promotions, Finances, Communications, Tariffs, Reports. Rate limits use token bucket algorithm (e.g., 300 requests/minute for Marketplace). KZ seller sales **doubled (+99% YoY)** in 2024. WB is building fulfillment centers in Almaty and Astana.

**Ozon Kazakhstan** uses the standard Ozon Seller API at https://docs.ozon.ru/global/en/api/. Auth: Client-Id + Api-Key headers. Base URL: `https://api-seller.ozon.ru/`. KZ sellers register through https://seller.ozon.com/ selecting "Kazakhstan." Python SDK: `pip install ozon-api-client` (https://pypi.org/project/ozon-api-client/).

**Satu.kz** (EVO/Prom.ua group) has a **public REST API** at https://public-api.docs.satu.kz/ (Swagger/OpenAPI). Same API structure as Prom.ua. Token-based auth. Endpoints for products (CRUD), orders (status management), delivery (tracking numbers), categories, and client messaging.

**Flip.kz** (2M+ buyers, 3M+ app downloads) and **Arbuz.kz** (Freedom Holding subsidiary, grocery delivery) have no public APIs. Lamoda KZ has a private Seller Center API at https://api.sellercenter.lamoda.ru/docs/ (requires auth).

---

## BLOCK 3: 2GIS offers the richest geo API for Kazakhstan

**2GIS covers 17 Kazakhstani cities** with field-verified data at 95% accuracy — far superior to Google Maps or Yandex Maps for local business search in KZ. Developer portal: https://docs.2gis.com/en. API key management: https://platform.2gis.ru/.

The API suite is comprehensive. **Geocoder** at `GET https://catalog.api.2gis.com/3.0/items/geocode?q={address}&fields=items.point&key=YOUR_KEY` handles forward, reverse, and IP-based geocoding. **Places/Organization Search** at `GET https://catalog.api.2gis.com/3.0/items?q={query}&location={lon,lat}&key=YOUR_KEY` searches by name, phone, website, TIN/BIN, category. **Routing** (v7) at `POST https://routing.api.2gis.com/routing/7.0.0/global?key=API_KEY` supports driving, taxi, bicycle, scooter, motorcycle, walking, and public transport with real-time traffic. Additional APIs include **Distance Matrix**, **TSP** (traveling salesman), **Isochrone**, **Map Matching**, **Suggest** (autocomplete), **Static Maps**, and **Raster/Vector Tiles**.

Free demo tier: 1 month, 1,000 requests per service, max 5 pages of 10 results. Paid subscriptions via Platform Manager (prices shown only after login). Auth: `key=YOUR_KEY` query parameter.

**npm packages**: `@2gis/mapgl` (map loader with TypeScript), `@2gis/mapgl-directions` (routing plugin), `react-2gis` (React wrapper). **Mobile SDKs**: Android (https://github.com/2gis/mobile-sdk-android-demo, BSD-2-Clause), iOS via Swift Package Manager (full and lite versions), Flutter (`dgis_mobile_sdk_map`, `dgis_mobile_sdk_full`). **Python**: `pip install 2gis` (outdated v1.3 wrapper at https://pypi.org/project/2gis/). GitHub org: https://github.com/2gis (158+ repos).

**Yandex Maps** works fully for KZ addresses via standard API at https://developer.tech.yandex.ru. Supports `lang=kk_KZ` for Kazakh language. Good building-level detail in Almaty and Astana. **Google Maps** provides global coverage but less detailed business directory data than 2GIS in Kazakhstan. Geocoding at $5/1,000 requests.

---

## BLOCK 4: Government APIs — data.egov.kz leads with 3,000+ datasets

**data.egov.kz** is Kazakhstan's best government API. **REST API v4** with API key authentication (free registration at https://data.egov.kz/profile/apikeylist). Base URL: `https://data.egov.kz/api/v4/{dataset}?source={JSON}&apiKey={key}`. Supports Elasticsearch query DSL for filtering, pagination (`size`, `from`), sorting, and **geo-distance queries**. Over **3,000 datasets** spanning education, health, transport, crime statistics, pharmacies, public service centers, notaries, address classifiers, budget data, and economic indicators. Mapping endpoint: `/api/v4/mapping/{dataset}` returns field descriptions and types. Download formats: JSON, Excel, XML.

**National Bank of Kazakhstan (NBK)** provides **free, no-auth XML feeds** for currency exchange rates. Current rates: `GET https://nationalbank.kz/rss/rates_all.xml`. Historical rates: `GET https://nationalbank.kz/rss/get_rates.cfm?fdate=DD.MM.YYYY`. Returns ~40 currencies with rate, direction (UP/DOWN), and change amount. Supports `&switch=kazakh` for language. PHP wrapper: https://github.com/naffiq/php-tenge-rates. NBK also operates https://data.nationalbank.kz for monetary statistics (beta).

**IIN/BIN verification** has no official government REST API. Best options: **DaData** offers a `party_kz` endpoint at `POST https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_kz` (Token auth, JSON, data sourced from Bureau of National Statistics, 30 req/sec limit). **Adata.kz** (https://adata.kz/en/api-description) is the KZ-native DaData analog with counterparty verification by BIN/IIN, tax debts, court cases, founders data — commercial, subscription-based. **Kompra.kz** offers free basic checks.

**Salyk.kz** (tax service) and **Adilet.zan.kz** (legislation) have **no public REST APIs**. Tax data requires EDS/NCALayer authentication. Adilet offers only RSS feeds at `http://adilet.zan.kz/rus/docs/rss`. The **legal entities registry** is accessible only through eGov authenticated services (EDS required). Bulk BIN data is downloadable as Excel from https://stat.gov.kz/ru/juridical/list/ (16 regional archives).

---

## BLOCK 5: Business software targets mandatory compliance systems

**ИС ЭСФ (Electronic Invoicing System)** is **legally mandatory** for all KZ businesses. Portal: https://esf.gov.kz:8443/esf-web/login. SOAP API with SDK downloadable at https://kgd.gov.kz/sites/default/files/ftpdata/ESF/esf-sdk-2025.zip. Test environment: https://test1.esf.kgd.gov.kz:8443/esf-web/login. Auth requires EDS from NCA RK (GOST cryptographic algorithms). SoapUI project included in SDK. Modules: ЭСФ (e-invoices), СНТ (transport documents), Virtual Warehouse. 2026 updates: new VAT rates 16%/10%/5%, non-resident taxation.

**Webkassa (Online Fiscalization/OFD)** has a **fully public REST API** at https://webkassa.kz. API key auth (obtained after adding test cash register). **300+ existing integrations** (1C, iiko, Poster, Bitrix24, Wolt, Yandex, Flip.kz, Air Astana). Capabilities: punch fiscal receipts, refunds, Z/X-reports, receipt status/archive, mixed payment types (QR, cash, card, credit), VAT handling. Postman collection provided. Test environment available. OFD operators: WOFD (https://wofd.kz), Kazakhtelecom OFD (https://oofd.kz).

**1C Kazakhstan** (https://1c.kz) uses the same 1С:Предприятие 8.3 REST/OData 3.0 API as the Russian version but with KZ-specific configurations: tenge currency, KZ tax forms, 2026 VAT rates (16%/10%/5%), ИС ЭСФ integration via "1С:ЭСФ для Казахстана," NCA digital signatures, Kazakh language interface.

**Bitrix24** uses the same global REST API (https://apidocs.bitrix24.com/) with OAuth 2.0. Popular among KZ SMBs. KZ marketplace at https://www.bitrix24.kz with local integrations (hh.kz, Kaspi Pay).

**iiko** (restaurant POS, dominant in KZ) uses the iikoCloud API at https://api-ru.iiko.services/ — Bearer token auth (1-hour lifetime), OpenAPI spec, Postman collection. SDKs in Go, Python, PHP/Laravel, TypeScript.

**KZ Electronic Document Management (ЭДО)** platforms with APIs: **Doodocs** (https://doodocs.kz/edo), **idocs** (https://idocs.kz — first TЭДО cross-border operator with Russia), **Учёт.ЭДО** (https://edo.uchet.kz — 200K+ companies), **Documentolog** (https://documentolog.com — largest counterparty base), **Papka.kz** (https://papka.kz — small business ЭДО).

---

## BLOCK 6: Delivery and logistics APIs from international players

**CDEK Kazakhstan** uses the **unified API v2.0** at https://api-docs.cdek.ru/29923741.html. OAuth 2.0 auth. KZ cities included in standard locations directory. Full sandbox with test credentials: account `EMscd6r9JnFiQ3bLoyjJY6eM78JrJceI`, password `PjLZkKBHEiLK3YsjtNrt3TGNG0ahs3kh`. Endpoints: order creation, tracking, tariff calculation, PVZ listing, label printing, webhooks. PHP SDKs: `cdek-it/sdk2.0` (official), `AntistressStore/cdek-sdk-v2`.

**KazPost (Казпочта)** has a native tracking API: `GET https://track.post.kz/api/v2/{barcode}` (JSON response). SOAP-based Delivery Module at https://rates.kazpost.kz for tariff calculation, label generation, and track number generation (test + production endpoints). API key from KazPost personal cabinet (kabinet.kazpost.kz). No official SDKs — third-party aggregators (Ship24, AfterShip) provide REST wrappers.

**Glovo Kazakhstan** Partner API at https://api-docs.glovoapp.com/partners/index.html. Token-based auth. Order API (POS integration), Stock & Price API, On-Demand API, LAAS (last-mile delivery). Stage: `https://stageapi.glovoapp.com`, Prod: `https://api.glovoapp.com`. Rate limit: 120 calls/minute per store. Python SDK: `pip install glovo-api-python`.

**Yandex Delivery** operates in KZ via unified API at `https://b2b.taxi.yandex.net`. Bearer token auth. Endpoints: calculate delivery (`/v2/offers/calculate`), create claim (`/v2/claims/create`), cancel claim. Express and same-day delivery. No test environment — tested on real orders.

**Wolt Kazakhstan** API at https://developer.wolt.com. Wolt Drive API for delivery creation, venue management. Basic/Bearer auth. Development environment provided by Wolt.

**inDrive** (founded in Kazakhstan) offers B2B delivery at https://delivery.indrive.com but **no public API** — requires direct partnership. **PONY EXPRESS** has a unified API portal at https://api.p2e.ru/Documentation (SOAP, test keys available). **Bolt** has delivery API docs at https://delivery.bolt.eu/api-doc. **Chocofood** has no public API.

---

## BLOCK 7: Telecom relies entirely on third-party SMS gateways

Kazakhstan's mobile operators — **Kcell/Activ**, **Beeline KZ**, **Tele2 KZ**, and **Altel** — provide **no public SMS API gateways**. Beeline KZ has a niche IoT/M2M platform at https://beeline-kz.m2m.com/ and carrier billing via KemPay (https://kempay.kz/ru/razrab) with REST endpoints for mobile balance payments.

All business SMS flows through third-party aggregators:

**SMSC.KZ** (https://smsc.kz/api/) — full-featured gateway supporting HTTP/HTTPS, SMTP, SMPP v3.4, SOAP. SMS, voice calls, Viber, Telegram, WhatsApp. 1000+ SMS/minute. Login/password auth. Code examples in multiple languages at https://smsc.kz/api/code/. Covers all KZ operators.

**Mobizon.KZ** (https://mobizon.kz/integration/api) — API endpoint: `https://api.mobizon.kz/service/{module}/{method}?apiKey={KEY}`. JSON/XML responses. Methods: `message/sendSMSMessage`, bulk SMS, signature management, campaign reports. PHP SDK: https://github.com/mobizon/mobizon-php. 100₸ test credit on registration.

International platforms with KZ coverage include Twilio, Messaggio (multichannel: SMS, Viber, WhatsApp, RCS), EasySendSMS, and SMS.to.

---

## BLOCK 8: HeadHunter dominates KZ job market with shared API

**hh.kz (HeadHunter Kazakhstan)** uses the **same API** as hh.ru at `https://api.hh.ru`. OpenAPI spec: https://api.hh.ru/openapi/redoc. OAuth 2.0 (register apps at https://dev.hh.kz/admin). Filter for KZ using area ID 40 (Kazakhstan), 160 (Almaty). SDKs: PHP (https://github.com/seregazhuk/php-headhunter-api — supports `setHost('hh.kz')`), Python (https://github.com/kirillzhosul/hhru), TypeScript (`@sargonpiraev/hh-api-client` on npm). Webhooks supported.

**Enbek.kz** (state employment exchange, 150K+ vacancies) has **no public REST API**. ЕСУТД integration service exists for HR systems but requires government-level access and EDS.

**BilimLand** (1.5M daily users, 40K+ lessons) and **Platonus** (university management across dozens of KZ universities) have **no official public APIs**. An unofficial Platonus Python wrapper exists at https://github.com/ZhymabekRoman/platonus-api-wrapper (abandoned).

---

## BLOCK 9: Telegram dominates the KZ developer community

Kazakhstan's developers are concentrated on **Telegram** — a curated list at https://github.com/saubakirov/KZ-IT-telegram-list (134 stars) catalogs **40 groups and 18 channels**. Top channels by subscribers: @workitkz (29.8K, IT jobs), @bluescreenkz (24.5K, tech news), @thetechkz (22.9K, startups), @devkz_jobs (21.9K, dev jobs), @ml_jobs_kz (9.5K, ML/DS). Top groups: @frontendkz (4.4K), @backenderskz (3.4K), @python_kz (3.2K), @go_kz (2K), @astanajug (2K, Java), @kz_1C (2K). **Discord is irrelevant** — no significant KZ dev Discord servers exist.

**Russian is the dominant language** in the KZ developer community. All major Telegram channels, API documentation, and technical discussions use Russian. Kazakh language is emerging in government AI initiatives but is **not needed for developer documentation**. English is used at international events (GITEX, GDG).

Key conferences: **AI Bridge 2026** (Astana, successor to Digital Bridge), **GITEX AI Central Asia** (Almaty, May 4-5, 2026), **Digital Qazaqstan Forum** (Shymkent), GDG DevFest Almaty and Astana. Active GDG chapters in Almaty, Astana, and Cloud Astana.

**IT media**: Digital Business (digitalbusiness.kz — winner of Tech Media Excellence award), Bluescreen.kz (@bluescreenkz, 24.5K), Habr.com (primary Russian-language tech publication widely read by KZ devs). Best article distribution: Habr + Telegram channels.

GitHub community: **nugmanoff/awesome-made-in-kz** (190 stars) lists KZ open-source projects. NCALayer-related repos (`ncalayer-js-client`, `Kalkan`, IIN validators) are the most practically important KZ-specific projects.

**AI tool adoption** is growing rapidly. ChatGPT is widely used, followed by DeepSeek, Claude, and Cursor. **MCP awareness is very nascent** in KZ but growing in Russian-language dev communities. The @dsmlkz_news (3.8K) and @ml_jobs_kz (9.5K) channels show active ML communities.

---

## BLOCK 10: Zero competition — total first-mover advantage

Exhaustive searches across npm, GitHub, Smithery.ai, mcp.so, PulseMCP, and Glama found **zero MCP servers for any Kazakhstani API**. The closest CIS precedent: Yandex has built official MCP servers (yandex-search-mcp-server), and individual developers have created MCPs for Yandex Tools (Wordstat, Metrika, Webmaster) and Tinkoff Invest. **Nobody is building MCPs for KZ services.**

Existing KZ SDK coverage is minimal. Only one full-coverage library exists: `kaspi-merchant-api` in Go. No npm packages exist for Kaspi Pay, Halyk ePay, eGov.kz, NBK, KazPost, Webkassa, or NCALayer integration (beyond the existing `ncalayer-js-client` which handles only digital signatures, not MCP). The `paybox` npm package is for the French Paybox system, not KZ PayBox.

**KZ AI startups** (CerebraAI — $15M, Higgsfield AI — $8M, Laminar/lmnr.ai) focus on consumer/enterprise AI products — none are building developer tooling or MCP servers. Astana Hub hosts 1,875+ companies but the ecosystem orientation is toward AI applications, not developer infrastructure.

**The competitive moat** lies in Kaspi's semi-closed ecosystem. Kaspi handles 80% of domestic transactions, but its API documentation is scattered and partially non-public. First movers who properly document and wrap the API will establish significant advantage. The only potential future competitors are Kaspi itself (2000+ engineers) or individual KZ developers — but KZ banks have historically not prioritized developer ecosystems.

---

## BLOCK 11: Market specifics — data localization, EDS, and Russian-first

**Data residency** is mandatory since January 1, 2016: personal data of Kazakhstan citizens **must be stored on servers physically in Kazakhstan**. Database owners must register with the Ministry of Digital Development. Administrative fines up to ~$7,000 (1,000 MCI) for violations. This affects MCP server hosting decisions.

**NCALayer** (National Certification Authority digital signature tool) is critical infrastructure. Required for eGov, ИС ЭСФ, tax filing, and any government e-service. Runs locally, communicates via **WebSocket at `wss://127.0.0.1:13579/`**. npm packages: `ncalayer-js-client` (https://github.com/sigex-kz/ncalayer-js-client — most maintained), `@seithq/ncalayer`. Supports CAdES/CMS and XMLDSIG signatures with GOST algorithms. Official examples: https://github.com/pkigovkz/NCALayerJSExample.

**Open Banking** is coming: NBK approved the "Development Concept of Open API and Open Banking for 2023-2025." Pilot completed in November 2023 with 5 banks and 128 users. National Payment Corporation (НПК) is developing unified Open API specifications. This will create standardized banking APIs across all KZ banks — a major future opportunity for MCP servers.

**Currency**: All financial APIs operate in KZT (tenge). NBK provides free exchange rate feeds. 2026 VAT rates: **16%, 10%, 5%** per new Tax Code. IIN is a 12-digit individual identification number; BIN is a 12-digit business identification number — both are algorithmically validatable with check digit calculations.

---

## BLOCK 12: Prioritization — top 15 services ranked for MCP development

| # | Service | Audience | API Quality | Competition | Simplicity | Virality | Monetization | **Total** |
|---|---------|----------|-------------|-------------|------------|----------|--------------|-----------|
| 1 | **Kaspi Marketplace** | 10 | 7 | 10 | 7 | 10 | 9 | **63** |
| 2 | **Halyk EPay** | 9 | 9 | 10 | 8 | 8 | 8 | **62** |
| 3 | **2GIS** | 9 | 10 | 10 | 8 | 9 | 7 | **63** |
| 4 | **NBK Exchange Rates** | 8 | 7 | 10 | 10 | 7 | 5 | **57** |
| 5 | **Webkassa (OFD)** | 8 | 8 | 10 | 7 | 8 | 8 | **59** |
| 6 | **data.egov.kz** | 7 | 8 | 10 | 8 | 7 | 6 | **56** |
| 7 | **ForteBank** | 7 | 9 | 10 | 8 | 6 | 7 | **57** |
| 8 | **hh.kz (HeadHunter)** | 8 | 9 | 9 | 8 | 8 | 6 | **58** |
| 9 | **Freedom Pay** | 7 | 8 | 10 | 7 | 6 | 7 | **55** |
| 10 | **NCALayer** | 7 | 7 | 9 | 5 | 6 | 7 | **51** |
| 11 | **KazPost** | 6 | 6 | 10 | 7 | 6 | 5 | **50** |
| 12 | **ИС ЭСФ** | 8 | 5 | 10 | 4 | 7 | 8 | **52** |
| 13 | **TipTopPay** | 6 | 8 | 10 | 8 | 5 | 6 | **53** |
| 14 | **Satu.kz** | 5 | 7 | 10 | 8 | 5 | 5 | **50** |
| 15 | **Mobizon SMS** | 6 | 7 | 9 | 8 | 6 | 5 | **51** |

### Recommended build order (first 10 MCP servers)

**Wave 1 — Quick wins with maximum impact (Week 1-2):**
1. **NBK Exchange Rates** — 1 day build. No auth. XML parsing. Universal utility. Perfect launch announcement.
2. **2GIS** — 3-4 days. API key auth. Geocoding + org search + routing. Massive KZ developer appeal.
3. **hh.kz** — 2-3 days. OAuth2. Vacancy search, resume management. Same API as your likely existing hh.ru MCP.

**Wave 2 — Payment ecosystem (Week 2-4):**
4. **Halyk EPay** — 3-4 days. OAuth2. Payments, refunds, status. Best-documented KZ payment API.
5. **Kaspi Marketplace** — 4-5 days. Token auth. Orders, products, reviews. Highest strategic value.
6. **ForteBank** — 3 days. HTTP Basic. Clean API. Payments, payouts, subscriptions.

**Wave 3 — Business compliance (Week 4-6):**
7. **Webkassa (OFD)** — 3-4 days. API key. Fiscal receipts, Z-reports. Mandatory for every retail business.
8. **data.egov.kz** — 3-4 days. API key. 3,000+ government datasets. Unique value proposition.
9. **KazPost** — 2-3 days. API key. Tracking + rate calculation. Simple, immediately useful.
10. **Freedom Pay** — 3 days. MD5 signature auth. Payments, invoices, payouts.

### Per-service output format

**1. Kaspi Marketplace Seller API**
- **URL**: https://guide.kaspi.kz/partner/ru/shop/api/general | Base: `https://kaspi.kz/shop/api/v2`
- **API Status**: Public (for registered sellers)
- **Authorization**: X-Auth-Token (static token from Seller Cabinet)
- **Key endpoints**: GET /v2/orders (list with filters), POST /v2/orders (update status), GET /v2/orders/{id}/entries (line items), GET /v2/orders/{id}/user (customer), GET /v2/cities, GET /v2/pointofservices/{id}, Content API: GET /categories, POST /import
- **Rate limits/sandbox**: No documented limits. No sandbox — test against production.
- **Existing SDKs**: Go (github.com/abdymazhit/kaspi-merchant-api). No npm/PyPI packages.
- **Competition**: Zero MCP servers. One Go SDK only.
- **Priority**: HIGH — 721K sellers, 14M users, 80% of KZ transactions
- **Effort**: 4-5 days

**2. Halyk EPay**
- **URL**: https://epayment.kz/en-US/docs/mobile_sdk_documentation
- **API Status**: Public
- **Authorization**: OAuth 2.0 (TerminalID + ClientID + ClientSecret)
- **Key endpoints**: Payment page (JS), cryptopay, refund, void, P2P transfers, invoice links, card tokenization, Apple Pay, Google Pay, QR, status check
- **Rate limits/sandbox**: Full sandbox at test-epay.homebank.kz. Test credentials documented.
- **Existing SDKs**: iOS/Android native, PHP (2 libraries). No npm package.
- **Competition**: Zero MCP servers.
- **Priority**: HIGH — 65%+ of KZ online shops
- **Effort**: 3-4 days

**3. 2GIS**
- **URL**: https://docs.2gis.com/en | Base: `https://catalog.api.2gis.com/3.0/`
- **API Status**: Public (free demo + paid tiers)
- **Authorization**: API Key (`key=` query parameter)
- **Key endpoints**: Geocode (forward/reverse/IP), Places search, Routing (7 transport modes), Distance Matrix, TSP, Isochrone, Suggest, Static Maps, Raster Tiles, Categories, Regions
- **Rate limits/sandbox**: Demo: 1,000 req/month, 1 month free. Paid: per-service subscriptions.
- **Existing SDKs**: npm @2gis/mapgl, @2gis/mapgl-directions, react-2gis. Mobile: Android, iOS, Flutter. PyPI: 2gis (outdated).
- **Competition**: Zero MCP servers.
- **Priority**: HIGH — 17 KZ cities, 56M+ users globally, best local business data
- **Effort**: 3-4 days

**4. NBK Exchange Rates**
- **URL**: https://nationalbank.kz/rss/rates_all.xml
- **API Status**: Public (no auth required)
- **Authorization**: None
- **Key endpoints**: GET /rss/rates_all.xml (all rates), GET /rss/rates.xml (major), GET /rss/get_rates.cfm?fdate=DD.MM.YYYY (historical)
- **Rate limits/sandbox**: No known limits. No sandbox needed.
- **Existing SDKs**: PHP (github.com/naffiq/php-tenge-rates). No npm/PyPI.
- **Competition**: Zero MCP servers.
- **Priority**: HIGH — universal utility, simplest build
- **Effort**: 1 day

**5. data.egov.kz**
- **URL**: https://data.egov.kz/pages/samples | Base: `https://data.egov.kz/api/v4/`
- **API Status**: Public
- **Authorization**: API Key (free registration at data.egov.kz/profile/apikeylist)
- **Key endpoints**: GET /api/v4/{dataset}?source={JSON} (query), GET /api/v4/mapping/{dataset} (schema), GET /meta/{dataset}/{version} (metadata)
- **Rate limits/sandbox**: No documented limits. 3,000+ datasets.
- **Existing SDKs**: None.
- **Competition**: Zero MCP servers.
- **Priority**: HIGH — unique government open data, 3,000+ datasets
- **Effort**: 3-4 days

**6. Webkassa (OFD)**
- **URL**: https://webkassa.kz
- **API Status**: Public REST API
- **Authorization**: API Key
- **Key endpoints**: Fiscal receipt creation, refunds, Z/X-reports, receipt status, archive, cash register management
- **Rate limits/sandbox**: Test environment available. Postman collection provided. 300+ integrations.
- **Existing SDKs**: None on npm/PyPI.
- **Competition**: Zero MCP servers.
- **Priority**: VERY HIGH — mandatory for all KZ retail
- **Effort**: 3-4 days

**7. ForteBank**
- **URL**: https://docs.fortebank.com/en/
- **API Status**: Public
- **Authorization**: HTTP Basic (Shop ID + Secret Key)
- **Key endpoints**: /transactions/payments, /authorizations, capture, void, refund, payout, AFT/OCT, tokenization, status, products (pay-by-link), subscriptions
- **Rate limits/sandbox**: Full sandbox. Postman collection. 429 rate limiting.
- **Existing SDKs**: None on npm/PyPI.
- **Competition**: Zero MCP servers.
- **Priority**: HIGH — excellent docs, modern API
- **Effort**: 3 days

**8. hh.kz (HeadHunter)**
- **URL**: https://api.hh.ru/openapi/redoc | Dev portal: https://dev.hh.kz/
- **API Status**: Public
- **Authorization**: OAuth 2.0
- **Key endpoints**: /vacancies, /resumes, /employers, /areas, /industries, /negotiations, webhooks
- **Rate limits/sandbox**: Standard hh.ru rate limits apply.
- **Existing SDKs**: PHP, Python, TypeScript (npm @sargonpiraev/hh-api-client).
- **Competition**: Zero KZ-specific MCP servers. Your existing hh.ru MCP may need minor adaptation.
- **Priority**: HIGH — dominant job platform
- **Effort**: 2-3 days (if adapting existing hh.ru MCP)

**9. Freedom Pay (ex-PayBox)**
- **URL**: https://docs.freedompay.kz/
- **API Status**: Public
- **Authorization**: MD5 signature (Merchant ID + Secret Key)
- **Key endpoints**: init_payment, cancel, clearing, refund, status, payout (card/IBAN), card tokenization, recurring, mobile balance payments, invoices
- **Rate limits/sandbox**: Test mode available.
- **Existing SDKs**: Ruby gem, JS/Android/iOS SDKs documented.
- **Competition**: Zero MCP servers.
- **Priority**: MEDIUM-HIGH — operates in KZ, KG, UZ
- **Effort**: 3 days

**10. KazPost**
- **URL**: https://track.kazpost.kz/api/ | Tracking: `https://track.post.kz/api/v2/{barcode}`
- **API Status**: Public (tracking), SOAP (delivery module)
- **Authorization**: API key (from personal cabinet)
- **Key endpoints**: Tracking (JSON), tariff calculation, label generation, track number generation
- **Rate limits/sandbox**: Test endpoints at rates.kazpost.kz.
- **Existing SDKs**: None.
- **Competition**: Zero MCP servers.
- **Priority**: MEDIUM-HIGH — state postal service, widely used
- **Effort**: 2-3 days

## Conclusion: a strategic window is wide open

The Kazakhstan API ecosystem presents a rare **greenfield opportunity** where documented, production-ready APIs exist across every major business vertical — but zero MCP servers have been built for any of them. The competitive vacuum is total: no npm packages, no GitHub repos, no registry listings on mcp.so or Smithery target KZ services. Your existing experience building 47 MCP servers for Russian APIs translates directly — many KZ services (Wildberries, Ozon, CDEK, hh.kz, Bitrix24, iiko, 1C) use identical or near-identical APIs to their Russian counterparts, enabling rapid adaptation.

Three factors make 2026 the optimal entry window. First, Kazakhstan's government is aggressively pushing digitalization with a new AI ministry and mandatory digital compliance systems (ИС ЭСФ, Webkassa). Second, the NBK Open Banking initiative will create standardized banking APIs across all KZ banks within 12-18 months. Third, the KZ developer community (30K+ across Telegram channels) is actively adopting AI coding tools but has almost zero MCP awareness — making this the ideal moment to establish @theyahia as the definitive MCP provider for the Kazakhstan market before awareness creates competition. Launch with the five highest-impact servers (NBK, 2GIS, Kaspi Marketplace, Halyk EPay, Webkassa), announce on @thetechkz and @devkz_jobs Telegram channels, and build the complete ecosystem from there.