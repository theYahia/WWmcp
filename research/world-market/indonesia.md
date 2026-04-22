# Indonesian MCP server candidates: a comprehensive API landscape

**Indonesia's API ecosystem is ripe for MCP adoption, with 20+ companies offering documented REST APIs — yet only ~6 MCP servers exist on GitHub today.** The biggest opportunities lie in payment gateways (Midtrans, Xendit), logistics aggregators (RajaOngkir), and Indonesia's largest SaaS platform (Mekari), all of which have public APIs with sandboxes but zero dedicated MCP implementations. This report maps 100+ companies across 28 categories, documenting API status, authentication, and implementation feasibility to identify the top 15 priority targets.

Indonesia's **275M population and 215M internet users** drive a mobile-first digital economy — the largest in Southeast Asia and a new BRICS member since January 2025. The country's tech ecosystem features homegrown super-apps (Gojek, Grab), dominant payment gateways processing billions in transactions, and mandatory government e-invoicing (e-Faktur) that creates API demand across every business. The gap between available APIs and MCP server implementations represents a massive first-mover opportunity.

---

## Commerce: e-commerce sellers and food merchants lead API maturity

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **Tokopedia** | E-commerce marketplace (now TikTok Shop) | Public (transitioning) | `partner.tiktokshop.com/docv2/page/seller-api-overview` | OAuth 2.0 | 100M+ MAU | High | 60–80h | Legacy API being terminated; new TikTok Shop API has 50+ endpoints. Requires SIUP business registration. Community SDKs exist (Python, TS). 1 existing MCP server on GitHub (`oshimayoan/simple-tokped-mcp`, 1 star) |
| **Shopee ID** | #1 e-commerce marketplace | Public (with approval) | `open.shopee.com/developer-guide/` | HMAC-SHA256 + OAuth2 tokens | 150M+ monthly visits | High | 50–70h | API v2.0 with Product, Order, Logistics, Payment, Ads modules. Sandbox available. Access token valid 4 hours. Rate limit ~100 req/min |
| **Bukalapak** | E-commerce + Mitra network | Semi-public (legacy) | `github.com/arbiyanto/BukaLapak-API` | Basic Auth / API Token | 30–50M MAU | Low | 40–60h | Community-maintained docs only; API appears outdated. Company pivoting to O2O |
| **Blibli** | B2C e-commerce (Djarum Group) | Partner-only | `seller-api.blibli.com/` | OAuth2 + HMAC-SHA256 | 20–30M monthly visits | Medium | 50–70h | Official Java/PHP client libraries on GitHub. Sandbox at api-uata.gdn-app.com. Internal Swagger usage |
| **Lazada ID** | E-commerce (Alibaba) | Public | `open.lazada.com/doc/api.htm` | App Key + SHA256 signature | 40–60M monthly visits | High | 40–60h | Well-documented Open Platform. Node.js SDK available. Multi-country support |
| **GoFood** | #1 food delivery (GoTo) | Partner-only | `developer.gobiz.com/docs/api/intro` | OAuth 2.0 | 500K+ restaurants | High | 50–70h | Facilitator + Direct Integration models. Sandbox at api.partner-sandbox.gobiz.co.id. Webhook support |
| **GrabFood** | Food delivery (Grab) | Partner-only | `developer.grab.com/` | OAuth 2.0 | Major food delivery | High | 35–50h | **✅ OpenAPI spec available.** Official SDKs: Python, Java, Go, Node.js. Best developer experience |
| **ShopeeFood** | Food delivery (Shopee) | None | — | — | Growing | Low | N/A | No API; app-only management |
| **Moka POS** | Cloud POS (GoTo) | Public | `api.mokapos.com/docs` | OAuth 2.0 | 1M+ downloads | High | 40–55h | Developer platform with app marketplace. Endpoints: Outlets, Sales, Items, Transactions |
| **iSeller** | Omnichannel commerce | Partner-only | Postman collection available | Likely OAuth2/API Key | Growing | Medium | 50–65h | Integrates with GoFood, GrabFood, Tokopedia |
| **Pawoon** | POS for F&B | Public (with activation) | `docs.pawoon.com/` | API Key/Token | Popular among MSMEs | Medium | 35–50h | RESTful API with webhook support. Requires Open API activation |
| **Majoo** | SME business management | Public | `docs.mangkujagat.com/` | Unknown | 30K+ merchants | Medium-Low | 45–60h | Open API exists but sparse documentation |
| **Qasir** | Micro-business POS | None | — | — | Micro segment | Low | N/A | No API; targets smallest businesses |

Grocery platforms (HappyFresh, Sayurbox, Astro) and GrabMart have **no public APIs**. GrabMart shares GrabFood's API infrastructure and could be a quick add-on to a GrabFood MCP server.

---

## Finance and payments: the richest API ecosystem in Indonesia

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **Midtrans** | Payment gateway (GoTo) | **Public** | `docs.midtrans.com/` | Basic Auth (Server Key) | Hundreds of thousands of merchants | **High** ⭐ | 40–60h | SNAP + Core API. Sandbox by default. Official SDKs: PHP, Go, Node, Ruby, Python, Java, .NET. Postman collections. Supports all payment methods incl. QRIS |
| **Xendit** | Payment gateway | **Public** | `developers.xendit.co/api-reference/` | Basic Auth (Secret Key) | Major SEA payment provider | **High** ⭐ | 40–60h | API v3. Test/live key separation. SDKs in 6 languages. Postman collection. xenPlatform for marketplaces. 1 auto-generated MCP server (Pipedream) |
| **DOKU** | Pioneer payment gateway | Public | `docs.doku.com/` | Shared Key + HMAC | 300+ employees, major brands | Medium-High | 50–70h | Sandbox. SNAP BI compliant. PCI DSS + ISO 27001 certified |
| **Nicepay** | Payment gateway | Public | `docs.nicepay.co.id/` | Merchant Token (HMAC) | Mid-tier | Medium | 50–70h | SNAP BI compliant. Sandbox. SDK available |
| **Durianpay** | Modern payment gateway | Public | `docs.durianpay.id/` | API Key (Bearer) | Startup/growing | Medium | 35–50h | Clean modern API. 10K req/day limit. SNAP BI beta |
| **Fazz** | Payment infra (ex-Xfers) | Public | `docs.fazz.com/v4-ID/docs/home` | API Key / Bearer | ID + SG markets | Medium | 40–55h | Separate Indonesia v4 API. Clean docs |
| **BCA** | Largest private bank | Public (partner reg.) | `developer.bca.co.id/` | OAuth2 + API Key + HMAC | 35M+ customers | **High** | 60–80h | Sandbox at sandbox.bca.co.id. **SDKs in 5 languages.** SNAP compliant. Balance, Transfer, VA, Direct Debit, FX APIs |
| **BRI** | Largest bank by assets | Public (portal reg.) | `developers.bri.co.id/` | OAuth2 + Custom Signature | 130M+ customers | **High** | 60–80h | **Award-winning developer portal** (Best API Initiative 2024). Sandbox. 700+ API partners. BRIVA, Transfer, QRIS, Account APIs |
| **Mandiri** | 2nd largest bank | Public (partner reg.) | `developer.bankmandiri.co.id/` | OAuth2 / SNAP | 30M+ customers | Medium-High | 60–80h | SNAP compliant. VA, Transfer, Balance APIs. Requires active corporate account |
| **BNI** | State-owned bank | Public (portal reg.) | `digitalservices.bni.co.id/` | API Key + OAuth | 20M+ customers | Medium | 60–80h | Free sandbox. VA, Transfer, Account APIs |
| **Bank Jago** | Digital bank (GoTo) | Partner-only | — | — | 10M+ users | Low | N/A | No public developer portal. Deep GoPay integration |
| **SeaBank** | Digital bank (Shopee) | None | — | — | 20M+ users | Low | N/A | Consumer-only, no API |
| **Jenius (BTPN)** | Digital banking | None | — | — | 5M+ users | Low | N/A | Consumer-only |
| **GoPay** | E-wallet (GoTo) | Via Midtrans | `docs.midtrans.com/` | Basic Auth (Midtrans) | 40M+ MAU | Medium | 20–30h | Accepted via Midtrans Core API. Not standalone |
| **OVO** | E-wallet (Grab) | Partner-only | — | — | 100M+ downloads | Low | N/A | Via payment gateways only |
| **DANA** | E-wallet (Ant Group) | Partner-only | — | — | Tens of millions | Low | N/A | Via payment gateways only |
| **ShopeePay** | E-wallet (Shopee) | None | — | — | Tens of millions | Low | N/A | Embedded in Shopee |
| **LinkAja** | E-wallet (SOE) | Partner-only | — | — | Millions | Low | N/A | Via DOKU/Midtrans |
| **Indodax** | Largest crypto exchange | **Public** | `github.com/btcid/indodax-official-api-docs` | API Key + HMAC-SHA512 | 6M+ users | **High** | 30–45h | Public REST + WebSocket. Demo sandbox at demo-indodax.com. 400+ tokens. Community libs in Go, PHP, Python, Node |
| **Tokocrypto** | Crypto (Binance-backed) | Public | `tokocrypto.com/apidocs/` | API Key + HMAC-SHA256 | Millions | Medium-High | 35–50h | Migrating to Binance MBX engine. WebSocket streams. CCXT integration |
| **Pintu** | Crypto app | None | — | — | Millions | Low | N/A | Consumer app only |
| **Ajaib** | Stock/mutual fund trading | None | — | — | Millions | Low | N/A | Consumer app only |
| **Bibit** | Mutual fund robo-advisor | None | — | — | Millions | Low | N/A | Consumer app only |
| **Stockbit** | Stock trading/social | None | — | — | Hundreds of thousands | Low | N/A | No public API |
| **Bareksa** | Mutual fund marketplace | None | — | — | Largest MF marketplace | Low | N/A | May have B2B APIs, nothing public |
| **Qoala** | Insurtech | Partner-only | — | — | 2M+ policies/month | Low-Medium | N/A | B2B2C model. Likely has partner APIs |
| **PasarPolis** | Insurtech | Partner-only | — | — | Gojek partnership | Low | N/A | B2B2C, embedded insurance |
| **Lifepal** | Insurance marketplace | None | — | — | Largest D2C insurance | Low | N/A | Acquired by Roojai (Thailand) |
| **Fuse** | B2B insurtech | Partner-only | — | — | 500+ employees | Low-Medium | N/A | Agent/broker platform APIs likely exist |

**Key pattern for e-wallets**: GoPay, OVO, DANA, ShopeePay, and LinkAja are all accessible as payment methods through Midtrans and Xendit — a single MCP server for either payment gateway effectively covers **all five e-wallets** plus credit cards, bank transfers, and QRIS.

---

## Logistics: aggregators are the key, not individual couriers

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **RajaOngkir** | Shipping rate aggregator | **Public** | `rajaongkir.com/docs/` | API Key | De facto standard; 20+ couriers | **High** ⭐ | 20–30h | Aggregates JNE, J&T, SiCepat, POS, TIKI, and more. Free Starter plan. Postman collections. Multiple community SDKs |
| **Shipper** | Logistics aggregator | Semi-public | `logistics-docs.shipper.id/` | API Key | Major aggregator | High | 25–35h | Full end-to-end: pricing, order, pickup, tracking. Webhooks. Requires UAT before production |
| **JNE** | Largest courier | Partner-only | `apidash.jne.co.id/` | Username + API Key | 300M+ shipments/year | Medium | 30–40h | Community PHP library. Better via RajaOngkir |
| **J&T Express** | #2 courier | Partner-only | `developer.jet.co.id/documentation` | API Key + MD5/Base64 sig | Millions daily | Medium | 35–45h | Cooperation agreement required. Webhooks. Complex address mapping |
| **SiCepat** | Fast-growing courier | Partner-only | `tmsapi.sicepat.com/api-docs/` | API Key | 1M+ packages/day | Medium | 30–40h | **Has Swagger/OpenAPI docs** (partner-gated). Via aggregators otherwise |
| **AnterAja** | Courier with great docs | Partner-only (docs public) | `developer.anteraja.id/` | Access Key + Secret Key | Mid-tier | High-Medium | 20–30h | Excellent Slate documentation. Webhooks. Full CRUD for orders |
| **Ninja Van ID** | Tech-forward courier | Partner-only | `api-docs.ninjavan.co/` | OAuth 2.0 | Millions monthly | High-Medium | 25–35h | OAuth2, webhooks, sandbox. Multi-country. Ruby gem exists |
| **Lion Parcel** | Courier (Lion Air) | Partner-only | `lionparcelapi.docs.apiary.io/` | API Key | Mid-tier | Low-Medium | 35–45h | Apiary docs, possibly outdated. Use aggregator |
| **Wahana** | Budget courier | None | — | — | Niche/budget | Low | N/A | Tracking only via web scraping or aggregators |
| **GoSend** | On-demand delivery (Gojek) | Partner-only | `developer.gobiz.com/docs/api/intro/` | OAuth 2.0 | 1M+ drivers | Medium | 40–50h | Requires NDA + integration fees. Webhook mandatory. LatLong required |
| **GrabExpress** | On-demand delivery (Grab) | Partner-only | `developer.grab.com/docs/` | OAuth 2.0 | Massive driver network | Medium | 35–45h | Express API. Partnership-gated |
| **Deliveree** | Trucking/freight | Public | `developers.deliveree.com/` | API Key | 100K+ drivers | High-Medium | 20–30h | Well-documented REST API v10. Sandbox. Webhooks. Only freight company with public API |
| **Kargo Technologies** | B2B trucking | Private | — | — | Largest B2B trucking | Low | N/A | Enterprise only via Kargo Nexus |
| **Waresix** | Logistics integrator | Private | — | — | 40K+ trucks, 375+ warehouses | Low | N/A | Enterprise only. $100M+ raised |
| **Ritase** | Digital trucking | None | — | — | 7,500 trucks | Low | N/A | Financial difficulties reported |

**Also notable**: **Biteship** (`biteship.com`) is another logistics aggregator covering 30+ couriers at IDR 5/request with a unified API — worth considering alongside RajaOngkir.

---

## Business software: Mekari dominates, tax APIs are critical

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **Mekari (platform)** | Indonesia's largest SaaS | **Public** | `developers.mekari.com/docs/kb/product-api` | HMAC-SHA256 | 60K+ businesses | **High** ⭐ | 80–120h | 5+ product APIs. Postman collections. Webhooks. Non-standard HMAC auth |
| — Jurnal | Cloud accounting | Public | `api-doc.jurnal.id` | HMAC-SHA256 | Part of Mekari | High | 30–40h | Indonesian tax (PPN/PPh). Invoices, contacts, journal entries |
| — Talenta | HR/Payroll | Public | Postman collection | HMAC-SHA256 | Part of Mekari | High | 20–30h | Employee, attendance, payroll APIs. SAP integration support |
| — Qontak CRM | CRM/Omnichannel | Public | Postman collection + `docs.qontak.com` | HMAC-SHA256 | Part of Mekari | High | 20–30h | Deals, contacts, companies. WhatsApp integration |
| — Klikpajak | Tax/e-Faktur | Public | Postman collection | HMAC-SHA256 | Licensed PJAP | High | 20–30h | DJP integration for e-Faktur. Tax invoice creation/reporting |
| **Accurate Online** | Established accounting | **Public** | `account.accurate.id/developer/api-docs.do` | **OAuth 2.0** | 200K+ businesses | **High** | 40–60h | Open developer registration. Basic + CRUD APIs. IDR 20K/db/month API fee. 20+ year track record |
| **OnlinePajak** | Tax compliance SaaS | **Public** | `developer.online-pajak.com/` | Likely OAuth2/API Key | Enterprise tax | **High** | 40–60h | Stoplight-based developer portal (**likely has OpenAPI specs**). e-Faktur, PPh 21, e-Billing |
| **Kledo** | Cloud accounting | Public | `kledo.com/en/restapi-integrations/` | Likely Bearer Token | 60–70K+ users | Medium | 30–40h | REST API with marketplace integrations. Very affordable |
| **Odoo ID** | Open-source ERP | Public (global) | `odoo.com/documentation/17.0/developer/reference/external_api.html` | XML-RPC / JSON-RPC | Thousands via 65+ partners | Medium | 40–60h | Standard Odoo API. Indonesian localization via partner modules |
| **e-Faktur (DJP)** | Mandatory e-invoicing | **No direct API** | — | Digital certificate | All PKP businesses | High (indirect) | Via PJAP | Must integrate through Klikpajak, OnlinePajak, or Pajak.io. Coretax DJP launched 2025 |
| **Jobstreet/SEEK** | #1 job portal | Partner-only | `developer.seek.com/` | OAuth 2.0 (**GraphQL**) | 20M+ candidates | Medium | 60–80h | GraphQL API (not REST). 7-stage certification. HR Open Standards |
| **HashMicro** | Enterprise ERP | None | — | — | 3K+ enterprises | Low | N/A | Custom implementation projects only |
| **BukuKas** | SME bookkeeping | **DEFUNCT** | — | — | Bankrupt Sept 2023 | None | N/A | Filed for bankruptcy |
| **BukuWarung** | Warung bookkeeping | None | — | — | 6.5M merchants | Low | N/A | Consumer app only |
| **Kalibrr** | Recruitment | None | — | — | 6M+ seekers | Low | N/A | No API found |
| **Glints** | Talent ecosystem | None | — | — | 5M+ profiles | Low | N/A | Confirmed: no public API exists |

---

## Marketing, communications, and infrastructure

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **WhatsApp Business** | Dominant messaging (Meta) | **Public** | `developers.facebook.com/docs/whatsapp/` | OAuth 2.0 / Bearer | 100M+ ID users | **High** | 40–60h | Cloud API + Business Management API. Per-message pricing July 2025. Indonesian BSPs add dashboards |
| **Instagram Graph API** | Social media (Meta) | **Public** | `developers.facebook.com/docs/instagram-platform/` | OAuth 2.0 | 100M+ ID users | High | 40–60h | Media publishing, insights, comments, messaging. ~200 calls/user/hour. Well-documented |
| **TikTok Ads** | Advertising platform | Public | `business-api.tiktok.com/portal/docs` | OAuth 2.0 | ~$1B+ ad revenue SEA | High | 50–70h | Excellent docs. **Official SDKs (Java, Python, JS).** Campaign CRUD, reporting, catalog management |
| **Qiscus** | Chat SDK/Omnichannel | **Public** | `documentation.qiscus.com/` | APP ID + Secret Key | Indonesian CPaaS | **High** | 40–60h | Well-documented SDKs (Android, iOS, Flutter, Web). Postman collections. Webhooks. WhatsApp BSP |
| **Kata.ai** | Conversational AI | Partner-only | `docs.kata.ai/` | Bearer Token | Major enterprises | Medium | 60–80h | Chatbot/NLP platform. WhatsApp BSP. Docs last updated 2022 |
| **Wappin** | WhatsApp BSP | Partner-only | — | Meta Cloud API | Niche BSP | Low | N/A | BSP overlay; implement Meta's Cloud API directly |
| **Tokopedia Ads** | E-commerce ads | Partner-only | Now TikTok Shop | OAuth 2.0 | ~$500M+ ad spend | Medium | 60–80h | Migrating to TikTok Shop. No dedicated Ads API |
| **Shopee Ads** | E-commerce ads | Partner-only | `open.shopee.com/` | HMAC-SHA256 + OAuth2 | ~$300–500M ad spend | Medium | 60–80h | Part of Open Platform v2.0 Ads module |
| **Telkomsel DigiHub** | Telecom APIs | Public (registration) | `digihub.telkomsel.com/` | OAuth2 / API Key | 170M subscribers | High | 50–80h | **GSMA Open Gateway APIs**: Number Verify, SIM Swap, Device Location. SMS, OTP APIs |
| **IDCloudHost** | Indonesian cloud | **Public** | `api.idcloudhost.com/` | API Key | SME cloud | Medium | 40–60h | REST API for VM CRUD, storage, networking. Terraform provider exists |
| **Biznet Gio** | Indonesian cloud | Semi-public | — (OpenStack APIs) | OpenStack Keystone | Enterprise cloud | Low | 80–120h | Uses OpenStack; no dedicated portal |
| **Telkom Sigma** | Enterprise IT | None | — | — | Enterprise | Low | N/A | No public API |
| **Lintasarta** | Enterprise ICT | None | — | — | 2,400+ corporates | Low | N/A | No public API |

---

## Verticals: super-apps have APIs, consumer apps do not

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **Traveloka** | SE Asia's largest OTA | Partner-only | `developer.travelokapartnersnetwork.com/` | Partner credentials | 150K+ accommodations | **High** | 40–100h | Loka API: Content, Rate, Search, Booking modules. Apigee-managed. 4–8 week onboarding |
| **Tiket.com** | Travel booking (Blibli) | Partner/Affiliate | `aff-hotel-tiketcom.redoc.ly/` | API credentials | Major OTA | Medium-High | 40–100h | **Hotel B2B API on Redoc.** Sandbox. Also flight/train APIs. Deposit-based |
| **Gojek (transport)** | Super-app | Partner-only | `developer.gobiz.com/` | OAuth 2.0 | 190M+ downloads | High | See GoFood/GoSend | Separate APIs per service. No unified "Gojek API." GoRide/GoCar have no public API |
| **Grab (transport)** | Super-app | Partner-only | `developer.grab.com/` | OAuth 2.0 | Major SEA super-app | High | See GrabFood | **OpenAPI specs.** SDKs in 4 languages. Express, Food, Pay APIs |
| **Halodoc** | #1 telemedicine | None | — (unofficial: `github.com/bakunya/halodoc-api`) | — | 20M+ users | Medium (strategic) | 100–120h | SATUSEHAT mandate may force APIs open. No public API today |
| **Alodokter** | Health portal/telemedicine | None | — | — | 1M+ downloads | Medium | 80–100h | Deep BPJS integration. Health content database valuable |
| **KlikDokter** | Health (Kalbe Farma) | None | — | — | Third health app | Low | N/A | Backed by largest pharma company |
| **Rumah123** | Property listings (99 Group) | Partner-only | — (API confirmed in ToS) | Unknown | 1.8M+ listings | Medium | 60–80h | Shares backend with 99.co |
| **OLX Autos** | Used car marketplace | None | — | — | 9M+ MAU | Medium | 80–100h | Now under Astra (OLXmobbi). No API |
| **Ruangguru** | #1 EdTech | None | — | — | 22M+ users | Low | N/A | Proprietary content. No API |
| **Maxim** | Budget ride-hailing | None | — | — | 16.4M downloads | Low | N/A | Russian HQ. No developer ecosystem |
| **BPJS Kesehatan** | National health insurance | Partner-only | `apijkn-dev.bpjs-kesehatan.go.id` | HMAC-SHA256 + Basic Auth | 240M+ participants | Medium | 60–80h | VClaim, PCare, Antrean APIs. Community Node.js/PHP libraries. Healthcare facilities only |
| **Zenius** | EdTech | **SHUT DOWN** | — | — | Was 16M+ users | None | N/A | Halted operations Jan 2024 |
| **PegiPegi** | Budget travel | **SHUT DOWN** | — | — | Was 7K+ hotels | None | N/A | Closed Dec 2023 |

---

## Existing MCP servers found on GitHub

The Indonesian MCP ecosystem is **extremely nascent** — only **~6 implementations** exist, none from official company channels:

| Repository | Service | Stars | Quality | Notes |
|-----------|---------|-------|---------|-------|
| `baguskto/saham-mcp` | IDX Stock Exchange | **18** ⭐ | **Best quality.** Published npm package, 9 tools, MIT license, active development | 958 stocks, 2019–2025 historical data |
| `oshimayoan/simple-tokped-mcp` | Tokopedia | 1 | Functional. TypeScript/Bun/Docker. Product search + order history | Uses session cookie auth (unofficial) |
| `murphi/bps-mcp-server` | BPS Statistics (Government) | Low | Bilingual (ID+EN). Requires free BPS API key | Indonesian economic/demographic data |
| `ilhamfp/pasal` | Indonesian Law Database | New | Impressive scope — 40K+ laws, 937K+ articles. FastMCP + Supabase | Hackathon-born, remote MCP supported |
| `arbyazra123/auto-news` | IDX Stock News Analysis | Low | Complex Docker setup (Milvus vector DB). News pipeline + MCP | Heavy infrastructure requirements |
| Pipedream auto-generated | Xendit | N/A | Auto-generated wrapper, not purpose-built | Part of Pipedream's 2,000+ app MCP catalog |

**No official MCP servers exist** from any major Indonesian tech company. The official MCP server lists (modelcontextprotocol/servers, awesome-mcp-servers) contain **zero** Indonesian-specific entries.

---

## Top 15 MCP implementation priorities

This ranking weighs **API quality** (40%), **market size** (25%), **developer ecosystem** (20%), and **Indonesia-uniqueness** (15%).

### 1. Midtrans — Indonesia's payment backbone

**Rationale**: Midtrans is Indonesia's most widely adopted payment gateway with the **best-documented API** in the country. Basic Auth is trivially simple. Full sandbox by default. Official SDKs in 7 languages. Postman collections. Covers credit cards, bank transfers, QRIS, GoPay, OVO, DANA, ShopeePay, and LinkAja — **one MCP server unlocks all major Indonesian payment methods**. No existing MCP server. Est. **40–60 hours**. 🏷️ **Quick win + Strategic play.**

### 2. Xendit — the developer-favorite payment gateway

**Rationale**: Modern API v3 with excellent documentation. Same Basic Auth simplicity as Midtrans. Official SDKs in 6 languages. Covers payments, disbursements, invoices, and platform (marketplace) use cases. Strong in both Indonesia and Philippines. Only a Pipedream auto-generated wrapper exists. Est. **40–60 hours**. 🏷️ **Quick win.**

### 3. RajaOngkir — one API for all Indonesian shipping

**Rationale**: The single highest-value MCP server for Indonesian e-commerce. **API Key auth** (simplest possible). Aggregates shipping rates from JNE, J&T, SiCepat, TIKI, POS Indonesia, and 15+ other couriers. Free Starter plan. Community SDKs in PHP, Python, Go, Laravel. No existing MCP server. Est. **20–30 hours**. 🏷️ **Quick win** — fastest path to a working, high-value MCP server.

### 4. Shopee ID Seller API — #1 e-commerce by market share

**Rationale**: Dominant e-commerce platform in Indonesia. Comprehensive Open Platform v2.0 with 20+ service modules (Product, Order, Logistics, Ads, Returns). Sandbox available. Massive seller base creates enormous demand. HMAC-SHA256 auth adds complexity but is well-documented. No existing MCP server. Est. **50–70 hours**. 🏷️ **Strategic play.**

### 5. Mekari (Jurnal + Talenta + Qontak + Klikpajak) — Indonesia's SaaS OS

**Rationale**: Indonesia's **largest SaaS company** with 60K+ businesses. A Mekari MCP server covers accounting (Jurnal), HR/payroll (Talenta), CRM (Qontak), and tax compliance (Klikpajak) — essentially the operating system for Indonesian businesses. Klikpajak is a **licensed PJAP**, making it the gateway to mandatory e-Faktur. HMAC-SHA256 auth is non-standard but documented with code samples. No existing MCP server. Est. **80–120 hours** for full suite. 🏷️ **Strategic play** — the most complex but highest-ceiling implementation.

### 6. GrabFood/GrabMart — OpenAPI-powered food delivery

**Rationale**: **Only Indonesian-market API with confirmed OpenAPI/Swagger specs** and official auto-generated SDKs in Python, Java, Go, and Node.js. This means an MCP server could be partially generated from specs. OAuth2 standard auth. Sandbox available. GrabMart shares the same infrastructure for an easy extension. No existing MCP server. Est. **35–50 hours**. 🏷️ **Quick win** — OpenAPI spec dramatically reduces implementation time.

### 7. BCA Developer API — gateway to Indonesia's largest private bank

**Rationale**: BCA serves **35M+ customers** and is the most trusted bank brand in Indonesia. Developer portal with sandbox. SDKs in 5 languages. SNAP (Bank Indonesia standard) compliant. APIs cover Balance, Transfer, Virtual Account, Direct Debit, FX Rates. Requires business registration but API access is relatively open. No existing MCP server. Est. **60–80 hours**. 🏷️ **Strategic play.**

### 8. Indodax — public crypto trading API

**Rationale**: Indonesia's largest crypto exchange with **fully public** REST + WebSocket APIs documented on GitHub. HMAC-SHA512 auth. Demo sandbox at demo-indodax.com. 400+ tokens with IDR pairs. Community libraries in 5 languages. The simplest financial trading API to implement. No existing MCP server (IDX stocks has one but not Indodax). Est. **30–45 hours**. 🏷️ **Quick win.**

### 9. GoFood/GoBiz — Indonesia's #1 food delivery

**Rationale**: Dominant food delivery platform (500K+ restaurants). Well-documented GoBiz Developer Portal with OAuth2, sandbox, and webhooks. Facilitator model enables POS/aggregator integration. Also exposes Moka POS integration endpoints. Complements a Midtrans MCP server since GoPay flows through Midtrans. No existing MCP server. Est. **50–70 hours**.

### 10. Accurate Online — Indonesia's accounting workhorse

**Rationale**: **200K+ businesses** over a 20+ year track record. **OAuth 2.0** (standard, easy auth). Open developer registration — no partnership required. REST API with JSON responses. Supports Indonesian tax formats (PPN/PPh) and e-Faktur CSV export. API fee is only IDR 20K/database/month. No existing MCP server. Est. **40–60 hours**. 🏷️ **Quick win** — standard OAuth2 with open registration is rare in Indonesian APIs.

### 11. BRI Developer API — reaching 130M+ customers

**Rationale**: Indonesia's **largest bank by assets and customers** (130M+). Award-winning developer portal with sandbox, DevStudio web IDE, and automated certification. 700+ existing API partners validate the platform. BRIVA, Direct Debit, Transfer, QRIS, and Account APIs. Est. **60–80 hours**. 🏷️ **Strategic play.**

### 12. OnlinePajak — tax compliance with likely OpenAPI specs

**Rationale**: Licensed PJAP with Stoplight-based developer portal — strongly suggesting **OpenAPI/Swagger specs** are available (Stoplight is an OpenAPI-first tool). Covers e-Faktur creation, PPh 21, e-Billing, and payments. Pre-built ERP connectors (Odoo). Combined tax + payment + invoice platform. Est. **40–60 hours**. 🏷️ **Quick win** if OpenAPI specs confirm.

### 13. Traveloka — SE Asia's travel giant

**Rationale**: Largest travel platform in Southeast Asia. Loka API through Traveloka Partners Network covers accommodation search, booking, content, and post-booking. Enterprise-grade infrastructure (Apigee-managed). 150K+ accommodations. Modular API design. Partner onboarding required (4–8 weeks). Est. **40–60 hours** for accommodation, **80–100 hours** for full suite. 🏷️ **Strategic play.**

### 14. WhatsApp Business Cloud API — Indonesia's messaging backbone

**Rationale**: WhatsApp is the **dominant messaging app** in Indonesia (100M+ users). Meta's Cloud API is exceptionally well-documented with Postman collections, OAuth2, and mature developer ecosystem. While not Indonesia-specific, the platform's outsized importance to Indonesian business communications makes it essential. Indonesian BSPs (Qiscus, Kata.ai, Mekari Qontak) add local context. Est. **40–60 hours**. 🏷️ **Quick win** — global API, local importance.

### 15. Telkomsel DigiHub — 170M subscribers and GSMA Open Gateway

**Rationale**: Indonesia's largest mobile operator. DigiHub API marketplace offers SMS, OTP verification, Number Verify, SIM Swap detection, and Device Location — all through standardized **GSMA Open Gateway APIs** (CAMARA/Linux Foundation). These APIs are increasingly important for authentication, fraud prevention, and identity verification. Registration-gated documentation. Est. **50–80 hours**.

---

## Implementation strategy and quick-reference flags

**Quick wins** (good APIs, small effort, high value):

- **RajaOngkir** — 20–30h, API Key, free tier, aggregates all couriers
- **Indodax** — 30–45h, public API, demo sandbox, no partnership needed
- **GrabFood** — 35–50h, OpenAPI spec + 4 official SDKs cuts work dramatically
- **Accurate Online** — 40–60h, OAuth2, open registration, no partnership needed
- **Midtrans** — 40–60h, Basic Auth, sandbox by default, 7 SDKs

**Strategic plays** (large market, worth complexity):

- **Mekari** — 80–120h, covers accounting + HR + CRM + tax for 60K+ businesses
- **BCA + BRI** — 60–80h each, together reach 165M+ bank customers
- **Shopee ID** — 50–70h, #1 e-commerce with HMAC auth complexity
- **Traveloka** — 80–100h full suite, largest OTA in Southeast Asia
- **Telkomsel** — 50–80h, 170M subscribers, standardized GSMA APIs

**Indonesia-unique value**: RajaOngkir, Mekari (Klikpajak for e-Faktur), Accurate Online, Indodax, BCA/BRI, and GoFood/GoBiz have no global equivalents — these MCP servers would serve a market of **215M internet users** with tools unavailable anywhere else.

## The biggest gap is in payment infrastructure

The most striking finding is that **Midtrans and Xendit** — Indonesia's two dominant payment gateways with some of the best API documentation in Southeast Asia — have no purpose-built MCP servers. A Midtrans MCP server alone would unlock AI-assisted payment processing, transaction management, and refund handling for hundreds of thousands of Indonesian merchants. Combined with RajaOngkir for shipping and Mekari for accounting/tax, these three MCP servers would form the backbone of AI-powered Indonesian e-commerce operations. The developer who builds them first will define the standard.