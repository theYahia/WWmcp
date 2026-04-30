# MCP server candidates across Iran, Pakistan, and Iraq

**The most promising MCP integration opportunities across these three markets lie in Iran's surprisingly mature developer ecosystem, Pakistan's payment and logistics APIs, and Iraq's rapidly evolving fintech layer.** Zero MCP servers currently exist for any service in these countries — the entire space is greenfield. Iran leads with at least 10 services offering well-documented REST APIs (ZarinPal, Kavenegar, Divar, Neshan, ArvanCloud, Finnotech, IDPay, AloPeyk, Bale, Melipayamak). Pakistan follows with strong payment and e-commerce APIs (JazzCash, Easypaisa, Daraz, TCS, Foodpanda, Bank Alfalah, 1LINK). Iraq's ecosystem is narrower but anchored by ZainCash and Qi Card, which together cover 80%+ of the country's digital payments. Combined, these markets represent **360M+ people and 220M+ internet users** with rapidly digitizing economies where local platforms dominate over global alternatives.

---

## 🇮🇷 Iran (IR)

### Market overview

Iran's **88M population and 70M+ internet users** operate within a parallel tech ecosystem isolated from global services by comprehensive Western sanctions. This isolation created domestic giants — Digikala (e-commerce), Snapp (ride-hailing), Divar (classifieds), SnappFood (food delivery) — that mirror their Western counterparts but operate entirely within Iran's domestic Shaparak/Shetab payment network, severed from SWIFT. The dominant API documentation language is **Farsi/Persian**, though most developer SDKs include English code samples. Many services are **IP-restricted to Iranian IPs**, though several key API platforms (ZarinPal, Kavenegar, ArvanCloud, Divar) are accessible internationally. The government's mandatory Moadian e-invoice system forces every business into digital compliance, creating high-value integration targets. A critical discovery from this research is **Finnotech** — Iran's open banking aggregator that provides a single API layer across dozens of banks, payment services, capital markets, and government data.

### Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Digikala | Iran's Amazon, dominant marketplace, 35M+ monthly visitors | Partial | `seller.digikala.com/open-api/v1/doc/` | API Key (token) | #1 e-commerce, 35M+ visitors | Med | 40–50 | Seller API exists (Swagger). Consumer API undocumented. Likely IP-restricted. |
| Torob | Price comparison across 50K+ shops, 15M+ products | No | — | — | 5M+ weekly users | Med | 30–40 | No public API. Partnership or reverse-engineering required. |
| Basalam | Social commerce marketplace | No | — | — | Large seller community | Low | — | No API found |
| DigiStyle | Fashion marketplace (Digikala subsidiary) | No | — | — | Part of Digikala group | Low | — | Likely shares Digikala infrastructure |

### Grocery and food delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| SnappFood | Dominant food/grocery delivery (Snapp Group) | No | — | JWT (internal) | Market leader | Low | — | Closed ecosystem. No public API. Partnership required. |

### Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| ZarinPal | #1 payment gateway (Shaparak) | **Yes** | `zarinpal.com/docs`, `zarinpal-lab.github.io/API-Docs/` | Merchant ID (UUID in body) | Dominant gateway | **High** | 20–25 | REST v4 API. Sandbox at `sandbox.zarinpal.com`. 27+ repos, official SDKs in Node, Python, PHP, Dart, .NET, Kotlin. |
| Finnotech | Open banking aggregator platform | **Yes** | `finnotech.ir/allServices` | OAuth/API Key | Gateway to entire banking system | **High** | 60–80 | KEY DISCOVERY. Banking, payments, credit scoring, e-promissory notes, government data APIs. Single integration unlocks Iran's financial ecosystem. |
| IDPay | Payment gateway (personal/business) | **Yes** | `idpay.ir/web-service/v1.1/` | X-API-KEY header | Popular with SMBs, Instagram sellers | **High** | 15–20 | REST v1.1. Sandbox via `X-SANDBOX: 1` header. 30 repos on official GitHub org. |
| NextPay | Payment gateway | Yes | `api.nextpay.org` | API Key | Mid-tier | Med | 15–20 | REST + SOAP/WSDL |
| Pay.ir | Payment gateway | Yes | — | API Key | Mid-tier | Low | 12–15 | Functional but simpler |
| Bank Mellat/Saman/Parsian | Bank payment gateways | Partial | Parsian sandbox: `sandbox.parsian-bank.ir` | Merchant credentials, terminal IDs | Major state/private banks | Med | 30–40 each | Mostly SOAP-based. Community `parsisolution/gateway` wraps 15+ gateways. |
| Bimeh.com | Insurance comparison | No | — | — | Consumer-facing | Low | — | No public API |

### Logistics and delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| AloPeyk | On-demand last-mile delivery, 15K daily drivers | **Yes** | `docs.alopeyk.com` | JWT Bearer token | Leading on-demand delivery | **High** | 20–25 | Geocoding, price calc, order CRUD, tracking. SDKs: PHP, Laravel, .NET, Node.js. Sandbox available. |
| Tipax | Major courier, 60+ years | Partial | — | — | Top private courier | Med | 25–35 | Likely has B2B APIs (serves Digikala). No public docs. |
| Iran Post / Post Pishtaz | National postal service | Partial | — | — | National | Low | 15–20 | Third-party tracking APIs available (TrackingMore) |
| BarBala | Freight/trucking | No | — | — | Niche | Low | — | No API found |

### Business software and SaaS

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Moadian | Mandatory government e-invoice system | **Yes** | Community implementations on GitHub | RSA key pair + certificate signing | All Iranian businesses (mandatory) | **High** | 40–50 | Complex crypto auth. Community SDKs: PHP/Laravel (`jooyeshgar/moadian`), Python (`moadian2` on PyPI), C#/.NET. Very high business value. |
| Hesabfa | Cloud accounting SaaS | Yes | `hesabfa.com/help/api` | API Key + user credentials in body | Growing cloud accounting | Med-High | 25–30 | REST API: invoices, contacts, products, inventory. WooCommerce plugin exists. |
| Hesabix | Open-source cloud accounting | Yes | `source.hesabix.ir` | API-based (Symfony backend) | Growing OSS community | Med | 25–30 | API-first architecture |
| Hamkaran System | Iran's largest ERP company, 22K+ clients | Unknown | — | — | Dominant enterprise ERP | Med | 40+ | Closed architecture, partnership likely required |

### Marketing and communications

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Kavenegar | #1 SMS/Voice API platform | **Yes** | `kavenegar.com/rest.html`, `kavenegar.github.io/kavenegar_en/` | API Key (in URL path) | Leading SMS provider | **High** | 15–20 | Excellent REST API. Send SMS, bulk SMS, OTP/verify, voice TTS. **54+ official repos** across Python, PHP, Node, Go, .NET, Java, Laravel, Delphi. Best SDK coverage of any service researched. |
| Melipayamak | SMS gateway/marketing | **Yes** | `github.com/melipayamak` | Username/Password or API Token | Top SMS provider | **High** | 15–20 | REST + SOAP. SDKs in Python, PHP, Node, C#, Google Sheets/Calendar. |
| Ghasedak | SMS gateway | Yes | — | API Key | Major SMS provider | Med | 15–20 | REST API documented |
| Yektanet | Iran's largest ad network | Unknown | — | — | Dominant in digital ads | Med | 25–30 | SDK for publishers, no confirmed REST API |
| Bale | Messaging super-app, 35M+ users | **Yes** | `bale.ai/dev` | Bot token (Telegram-compatible) | 35M+ users, banking integration | **High** | 15–20 | Uses Telegram Bot API protocol (endpoint: `tapi.bale.ai`). Existing Telegram bot libraries work with endpoint change. |
| Rubika | Super-app, 50M+ users | Unofficial only | — | — | Largest Iranian social media | Low-Med | 30–40 | Community Python libraries. Government-linked, privacy concerns. |
| Eitaa | Messaging app, 40M+ users | Partial | — | — | 40M+ users | Low | — | Telegram fork, security concerns |

### Infrastructure and cloud

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Arvan Cloud | Iran's leading cloud (CDN, IaaS, S3, VOD, K8s) | **Yes** | `arvancloud.ir/en/dev/api` | Machine User API Key; S3: HMAC (Access Key + Secret) | Iran's #1 cloud | **High** | 40–50 | CDN, compute, DNS, object storage (S3-compatible), video platform, container service. Terraform provider exists. European data centers too. |
| Neshan Maps | Iran's Google Maps, 10M+ users | **Yes** | `platform.neshan.org` | API Key (`Api-Key` header) | 10M+ active users | **High** | 20–25 | Directions, distance matrix, geocoding, reverse geocoding, search, map matching, static maps. Python SDK on PyPI. |

### Transport and travel

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Snapp | Iran's Uber, 40M+ users, 85% market share | No | — | JWT (internal) | 2.5M daily rides | Low | — | Completely closed ecosystem. No public API. |
| Tapsi | #2 ride-hailing | No | — | — | Significant market share | Low | — | No public API |
| Alibaba.ir | #1 travel OTA (flights, hotels, buses) | **Yes** | `alibaba.ir/api-flight/en` | API Key / partnership | Market leader in travel | **High** | 25–35 | Flight search and booking API documented. 26 open-source repos on GitHub. |
| Snapptrip | Travel OTA (Snapp Group) | Unknown | — | — | Top-tier, fast-growing | Med | — | B2B partnerships exist |

### Classifieds and real estate

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Divar | Dominant classifieds, 35M+ users, 500K+ daily ads | **Yes** | `divar-ir.github.io/kenar-docs/` | OAuth2 + API Key (`X-API-Key`) | 139M+ annual listings | **High** | 25–30 | **"Kenar" Open Platform** — full OpenAPI spec, auto-generated SDKs (Python, PHP, Go, JS). Addons, chat, posts, webhooks, payments. Sandbox available. |
| Sheypoor | #2 classifieds, 10M+ MAU | No | — | — | 10M+ active users | Med | — | No API found |
| Kilid | Real estate platform | No | — | — | Niche | Low | — | No API found |

### HR, recruiting, and EdTech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Jobinja | Leading job board | No | — | — | #1 job platform | Med | — | No public API. Community scrapers only. |
| IranTalent | Premium recruitment | No | — | — | International firms segment | Low | — | No API |
| Faradars | Online education, 4.5M+ students, 16K+ titles | No | — | — | Iran's largest tutorial platform | Low-Med | — | No API |
| Maktabkhooneh | Iran's first MOOC platform | No | — | — | Major university partnerships | Low | — | No API |

### Government and compliance

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| e-Namad | Mandatory e-commerce trust seal | Unknown | — | — | Required for all e-commerce | Low | — | Badge integration likely exists |
| dolat.ir / my.gov.ir | Government portals | No | — | — | Citizen services | Low | — | Access through Finnotech preferred |

### Top 10 MCP candidates — Iran

| Rank | Company | Category | Why high priority | API Maturity | Est. Hours |
|------|---------|----------|-------------------|-------------|------------|
| 1 | **ZarinPal** | Payments | Clean REST v4, sandbox, 100+ community repos, official SDKs in 6+ languages | ★★★★★ | 20–25 |
| 2 | **Kavenegar** | SMS/Voice | Best SDK coverage researched (54+ repos, 7+ languages), simple API key auth | ★★★★★ | 15–20 |
| 3 | **Divar (Kenar)** | Classifieds | Full OpenAPI spec, OAuth2, auto-generated SDKs in 4 languages, 35M+ users | ★★★★★ | 25–30 |
| 4 | **Neshan Maps** | Maps/Geo | REST API, geocoding/routing/search, Python SDK, 10M+ users | ★★★★☆ | 20–25 |
| 5 | **Arvan Cloud** | Cloud/CDN | Broad API surface (CDN, compute, S3, DNS, VOD), Terraform provider | ★★★★☆ | 40–50 |
| 6 | **Finnotech** | Open Banking | Single gateway to Iran's entire banking system — accounts, payments, credit | ★★★★☆ | 60–80 |
| 7 | **IDPay** | Payments | Clean REST, sandbox header toggle, 30 repos on official org | ★★★★☆ | 15–20 |
| 8 | **Moadian** | Gov e-Invoice | Legally mandated for all businesses, community SDKs in PHP/Python/C# | ★★★☆☆ | 40–50 |
| 9 | **AloPeyk** | Delivery | Full REST API, JWT auth, sandbox, PHP/Node/Laravel/.NET SDKs | ★★★★☆ | 20–25 |
| 10 | **Bale** | Messaging | Telegram-compatible bot API, 35M+ users, banking integration | ★★★☆☆ | 15–20 |

---

## 🇵🇰 Pakistan (PK)

### Market overview

Pakistan's **230M population and 120M+ internet users** create the largest addressable market of the three countries. The economy is **mobile-first** — JazzCash (60M+ users) and Easypaisa (40M+ users) together cover 100M+ mobile wallet accounts. The State Bank of Pakistan (SBP) launched an Open Banking Framework in 2019 and the **RAAST instant payment system** in 2021, driving API-first banking. All developer documentation is in **English**, reducing localization friction. The government's **mandatory FBR POS integration** for Tier-1 retailers creates regulatory-driven API demand. Pakistan's logistics sector is notably API-mature, with TCS, Leopards, PostEx, BlueEx, and Bykea all offering documented REST APIs. Key infrastructure discovery: **1LINK** (national payment switch connecting 37 banks) has an Open API Gateway with a sandbox, and **NADRA's Nishan platform** provides API-based national identity verification for 220M+ citizens.

### Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Daraz.pk | Pakistan's #1 e-commerce (Alibaba/Lazada-owned) | **Yes** | `open.daraz.com/doc/api.htm` | API Key + HMAC signature | #1 marketplace | **High** | 30–40 | Lazada Open Platform. Full product/order/seller lifecycle. CreateProduct, UpdateProduct, GetOrders, GetCategoryTree. Sandbox available. |
| OLX Pakistan | Largest classifieds | Unknown | — | — | Major classifieds | Low | — | Global OLX Group, no PK-specific API |

### Food delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Foodpanda PK | Dominant food/grocery delivery (Delivery Hero) | **Yes** | `developer.foodpanda.com`, `integration.foodpanda.com/documentation/` | OAuth 2.0 (client_id + secret → Bearer token, 2hr validity) | Dominant food delivery | **High** | 30–40 | Partner API: catalog management, order lifecycle, promotions, webhooks. POS integration API. Mature Delivery Hero developer ecosystem. |

### Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| JazzCash | #1 mobile wallet, 60M+ users | **Yes** | `sandbox.jazzcash.com.pk/SandboxDocumentation/` | HMAC hash (Merchant_ID + Password + HashKey) | 60M+ users, dominant wallet | **High** | 25–35 | Card APIs (auth, capture, void, refund), mobile account APIs, voucher APIs, hosted checkout. Full sandbox. PHP/Flutter community libs. |
| Easypaisa | #2 mobile wallet, 40M+ users | **Yes** | `easypay.easypaisa.com.pk` + Open API Portal | Base64 username:password + hash key | 40M+ users, pioneer branchless banking | **High** | 25–35 | OTC/mobile account transactions, inquiry, IPN callbacks. Open API Portal launched 2021 (money transfers, IBFT, bills). Sandbox available. |
| 1LINK | National payment switch, 37 banks + 13 affiliates | **Yes** | `sandbox.1link.net.pk` | P2P connectivity (member institutions) | ALL Pakistani banks connected | **High** | 80–100 | 1BILL (1000+ billers), 1IBFT (interbank transfers), 1QR, OTP Debit Service. PCI DSS v4.0. Requires institutional partnership. |
| Bank Alfalah | Top-5 private bank, "Alfa" digital banking | **Yes** | `developer.bankalfalah.com/product` | OAuth/Token-based; HMAC for APG | 900+ branches | **High** | 60–80 | Accounts, Funds Transfer, QR Payments, Cards, Rewards, Alfa Payment Gateway. Most complete developer portal among PK banks. |
| NADRA Nishan | National identity/KYC verification, 220M+ citizens | **Yes** | `nishan.nadra.gov.pk` | Subscription-based institutional registration | ALL citizens (foundational) | **High** | 60–80 | Biosys (biometric), Verisys (demographic), Proof-of-Life, Batch CNIC verification, PakID SSO. Every fintech/bank needs this. |
| NayaPay | Neobank, payment gateway (NayaPay Arc) | Partial | `help.nayapay.com` + `merchant-portal.nayapay.com` | API credentials (PCI-certified merchants) | Growing rapidly | Med | 30–40 | Internet Payment Gateway for merchants. WooCommerce/Magento/Shopify plugins. QR via Raast + AliPay+. |
| SadaPay | Neobank, Mastercard debit, 2M+ users | No | — | — | 2M+ users, freelancer focus | Low | — | No public developer API |
| HBL | Largest private bank, 23M+ customers | Partial | HBL IPG docs (PDF) | Merchant credentials, RSA 4096 | 1,700+ branches | Med | 40–50 | Payment gateway REST APIs. Cybersource/VISA platform. |
| Allied Bank | Major bank, 1,400+ branches | Yes | Developer portal referenced | Unknown (likely OAuth2) | Large national bank | Med-High | 40–60 | Open Banking API platform announced |
| JS Bank | Mid-tier bank, Z-Connect developer portal | Yes | `developer.jsbl.com/services` | Registration-based | Partners: KuickPay, PayFast, Careem | Med | 40–50 | Active developer portal with sandbox |

### Logistics and delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| TCS | Pakistan's largest courier, 1,000+ express centers | **Yes** | `developer.tcscourier.com/products` | OAuth 2.0 | #1 courier network | **High** | 25–35 | Shipment creation, tracking, labels, COD management, rate calc. Shopify/WooCommerce plugins. "24-hour integration" claim. |
| Leopards Courier | Major courier, 1,700+ locations | **Yes** | Dashboard API management | API Key + API Password | Major e-commerce logistics | Med-High | 20–30 | GetAllCities, BookPacket, TrackPacket, load sheets. Test mode toggle. PHP/Laravel library. |
| PostEx | Fintech-logistics hybrid, instant COD upfront | **Yes** | Integration guide (PDF) | Token-based | Fast-growing, $7.3M funding | Med-High | 20–30 | Create/track/cancel orders, get operational cities. Unique instant payment + delivery combo. |
| BlueEx | Courier, 3,000+ corporate clients, PSX-listed | Yes (private) | Merchant dashboard | API-based (onboarding) | 400+ cities, publicly listed | Med | 25–35 | Booking, tracking, COD, labels. API docs require merchant onboarding. |
| Bykea | Motorcycle ride-hailing + delivery super-app | **Yes** | Open API v2 (Scribd), bSecure integration | Token-based (username + password) | 2M+ customers, 30K+ riders | Med-High | 25–30 | 11 endpoints: delivery booking, bill payment, BykeaCash transfers, tracking. Google Maps integration. |

### Business software and government

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| FBR POS | Mandatory government POS tax integration | **Yes** | `fbr.gov.pk/pos-technical-assistance/` | FBR registration + SDC encrypted | ALL Tier-1 retailers (mandatory) | **High** | 30–40 | RESTful. Invoice data → SDC → FBR Fiscal Invoice Number + QR code. PKR 1M penalty for non-compliance. Supports ASP/PHP/.NET/Java. |
| Oscar POS | #1 cloud POS (Unilever, Khaadi, Dunkin clients) | Unknown | — | — | Major retail brands | Med | 40–50 | Rich features but no public API documentation |

### Telecom APIs

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Telenor PK | #2 mobile operator, 54M subscribers | Yes | `developer.telenor.com.pk/apis` | Username/password | 54M subscribers | Med | 20–30 | SMS API. PHP Laravel wrapper exists. Portal returned 403 (may require auth). |
| Jazz/Mobilink | #1 telco, 74M subscribers | Internal only | — | — | 74M subscribers | Med | 30–40 | Uses WSO2 API Manager internally. Infobip partnership for CPaaS. No public developer portal beyond JazzCash. |

### Travel, healthcare, and real estate

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Sastaticket.pk | Leading OTA, ~25% domestic flight share | Partial | Internal Django/REST APIs | — | Major travel platform | Med-High | 40–50 | API exists internally; partner/affiliate access via Sriggle |
| Bookme.pk | Multi-vertical ticketing (bus, flights, movies, events) | Unknown | — | — | 270+ airlines, 100+ bus operators | Med | 40–50 | Feature-rich but API access unclear |
| Careem PK | Super-app (Uber-owned) — **exited ride-hailing July 2025** | Yes | `developer.careem.com` | OAuth 2.0 | Regional presence | Med | 30–40 | Developer portal exists. CareemPay still active. Ride-hailing discontinued in PK. |
| Oladoc | Largest healthcare platform, 6K+ providers, 1M+ patients/mo | Internal | — | — | Dominant doctor booking | Med | 40–50 | Internal REST APIs for apps, no public developer API |
| Zameen.com | #1 real estate portal | No | — | — | Millions of listings | Low | — | Data-rich but no API |
| PakWheels | #1 auto classifieds, 25M+ annual visitors | No | — | — | Dominant in auto | Low | — | No API |
| Rozee.pk | #1 job portal, 5M+ professionals | No | — | — | #1 in recruitment | Low | — | No API |
| Graana.com | Real estate marketplace | No | — | — | #2 after Zameen | Low | — | No API |

### Top 10 MCP candidates — Pakistan

| Rank | Company | Category | Why high priority | API Maturity | Est. Hours |
|------|---------|----------|-------------------|-------------|------------|
| 1 | **JazzCash** | Payments | 60M+ users, full REST API, sandbox, HMAC auth, card+mobile+voucher APIs | ★★★★★ | 25–35 |
| 2 | **Easypaisa** | Payments | 40M+ users, REST + Open API Portal, sandbox, IPN callbacks | ★★★★★ | 25–35 |
| 3 | **Daraz.pk** | E-commerce | Alibaba-backed, full seller lifecycle API (Lazada Open Platform), sandbox | ★★★★★ | 30–40 |
| 4 | **TCS** | Logistics | #1 courier, OAuth 2.0, dedicated developer portal, shipment/tracking/COD | ★★★★★ | 25–35 |
| 5 | **Foodpanda PK** | Food Delivery | OAuth 2.0, Partner API (catalog/orders/promos), webhooks, mature DevEx | ★★★★★ | 30–40 |
| 6 | **Bank Alfalah** | Banking | Most complete PK bank developer portal — accounts, transfers, QR, cards | ★★★★☆ | 60–80 |
| 7 | **FBR POS** | Gov/Tax | Mandatory for all Tier-1 retailers, RESTful, PKR 1M non-compliance penalty | ★★★★☆ | 30–40 |
| 8 | **1LINK** | Payments Infra | National switch connecting 37 banks, bill pay (1000+ billers), IBFT, QR | ★★★★☆ | 80–100 |
| 9 | **NADRA Nishan** | Identity/KYC | National identity verification for 220M+ citizens, biometric/demographic APIs | ★★★★☆ | 60–80 |
| 10 | **Leopards Courier** | Logistics | 1,700+ locations, REST API, BookPacket/TrackPacket, test mode, PHP library | ★★★★☆ | 20–30 |

---

## 🇮🇶 Iraq (IQ)

### Market overview

Iraq's **43M population and 30M+ internet users** represent a nascent but rapidly digitizing tech ecosystem. The payments sector is the most API-mature, anchored by **ZainCash** (dominant mobile wallet, JWT-authenticated REST API with sandbox) and **Qi Card** (national payment infrastructure processing $100B+ annually, 10M+ customers). Cash-on-delivery still accounts for **70–80% of e-commerce transactions**, making digital payment integration a growth lever. **Facebook is the dominant social platform** (~20M+ users), and Telegram is heavily used for business communication. All API documentation discovered is in **English**, reducing barriers. Iraq's super-app trend — led by **Baly** (Rocket Internet-backed, $10.5M seed) and **Lezzoo** (Y Combinator-backed) — could create future API opportunities as these platforms mature. No Iraqi telecom (Asiacell, Zain Iraq, Korek) offers direct developer APIs; third-party SMS gateways (EasySendSMS, BulkSMS) are the practical path. The open-source **iq-epay** PHP library provides a unified interface to 5 Iraqi payment gateways and could inform MCP architecture.

### Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| ZainCash | Dominant mobile wallet | **Yes** | `docs.zaincash.iq` (v2) | JWT (merchant secret key) | Nationwide, 1.2–3M+ users | **High** | 30–40 | Test: `test.zaincash.iq`. Prod: `api.zaincash.iq`. Init/pay/get transaction. SDKs: PHP, Node.js, Laravel, Flutter, iOS. |
| Qi Card | National payment infrastructure, 10M+ customers | **Yes** | `developers-gate.qi.iq` | Server key (API key) | 13M+ accounts, 43K+ POS terminals, $100B+ annual volume | **High** | 35–50 | REST API + webhooks. Flutter/React Native/Android/iOS SDKs. WooCommerce plugin. Acquired Miswag e-commerce 2024. |
| Amwal/PayTabs | International payment gateway (Iraq presence) | Yes | PayTabs global developer docs | Server key / Profile ID | International + Iraq | Med | 25–35 | Well-documented parent platform; Iraq coverage may be limited |
| Switch Iraq | E-payment provider, CBI-licensed | Partial | Referenced in iq-epay PHP library | Token-based (entityId + tokenSwitch) | Nationwide POS/ATM | Med | 50–70 | No public developer portal. ISO 27001, PCI DSS. |
| Arab Payment Services | First Iraqi electronic payment company | Partial | Referenced in iq-epay library | Username/password/URL | Nationwide, 1,500+ POS | Med | 50–70 | No public developer portal |
| NassPay | Digital wallet, virtual/physical Visa cards | Unknown | — | — | Most-funded IQ fintech | Med | — | Worth monitoring |
| Asia Hawala | Mobile wallet (Asiacell) | Unknown | — | — | Central/northern Iraq | Low | — | No developer docs found |

### Delivery and food

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Talabat Iraq | Dominant food delivery (Delivery Hero) | **Yes** | `integration.talabat.com/en/documentation/`, `developer.talabat.com/api-specifications` | OAuth 2.0 (client_id + secret → JWT) | Major Iraqi cities | **High** | 40–55 | Order management, catalog/menu sync, store availability, promotions, webhooks. NDA required. |
| Baly | Super-app (rides, food, grocery, payments) | No | — | — | Baghdad + expanding, $10.5M seed | Med-High | 60–80 | Iraq's first super-app (Rocket Internet). No public API yet. |
| Lezzoo | On-demand delivery super-app (YC-backed) | No | — | — | Kurdistan, expanding | Med | 60–80 | Y Combinator S20. No public API. |
| Toters | Food/grocery delivery (Lebanon-origin) | No | — | — | Baghdad, Erbil | Low | — | Merchant app only, no developer API |

### Ride-hailing and transport

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Careem Iraq | Ride-hailing super-app (Uber-owned) | **Yes** | `developer.careem.com` | OAuth 2.0 (client credentials for CareemPay) | Baghdad, Basra, Najaf, Erbil, Mosul | **High** | 40–55 | Rides, CareemPay merchant API, deep linking. Active in 5+ Iraqi cities. |
| Bolt Iraq | European ride-hailing | Unknown | — | — | Present in Iraq | Low | — | Limited public APIs globally |
| inDrive Iraq | Ride-hailing (price-negotiation) | No | — | — | Present in Iraq | Low | — | No developer API |

### Telecoms

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Asiacell | #1 telco, ~19M subscribers (Ooredoo) | No | — | — | All 19 governorates | Med | 20–30 (via 3rd party) | No direct API. Use EasySendSMS/BulkSMS for SMS. |
| Zain Iraq | Major telco, parent of ZainCash | No | — | — | ~30% mobile market | Low (ZainCash is HIGH) | — | No telecom API. ZainCash covered separately. |
| Korek Telecom | #3 telecom, Kurdistan origin | No | — | — | Kurdistan + expanding | Low | — | No developer API |
| 3rd-Party SMS Gateways | EasySendSMS, BulkSMS, ExpertTexting | Yes | REST APIs | API Key | Covers all 3 Iraqi networks | Med | 20–30 | Practical path for Iraq SMS MCP server |

### E-commerce and classifieds

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| Miswag | Iraq's largest e-commerce (Qi Card-owned since 2024) | No | — | — | 170K+ products, 2,500+ brands | Low | — | Consumer marketplace; future integration likely via SuperQi |
| OpenSooq Iraq | Arabic classifieds platform | No | — | — | Major P2P marketplace | Low | — | No API |

### Infrastructure, government, and verticals

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Reach | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|---------------|-------|
| EarthLink | Iraq's largest ISP, 400+ PoPs | No | — | — | Every Iraqi city/town | Med (infrastructure partner) | — | Could host MCP servers. Runs Tamata e-commerce. |
| Ur Portal | Central e-government, 708 services | No | — | — | 859 gov entities | Low | — | Portal-based only, no APIs yet |
| Abwaab | EdTech, 300K+ students (MENA-wide) | No | — | — | Multi-country MENA | Low | — | Consumer platform, no API |

### Top 10 MCP candidates — Iraq

| Rank | Company | Category | Why high priority | API Maturity | Est. Hours |
|------|---------|----------|-------------------|-------------|------------|
| 1 | **ZainCash** | Payments | Dominant mobile wallet, full REST API, JWT auth, sandbox, community SDKs | ★★★★☆ | 30–40 |
| 2 | **Qi Card** | Payments Infra | National infrastructure, 10M+ customers, $100B+ volume, REST API + mobile SDKs | ★★★★☆ | 35–50 |
| 3 | **Talabat Iraq** | Food Delivery | Full Partner API, OAuth 2.0, order/catalog/promo management, webhooks | ★★★★☆ | 40–55 |
| 4 | **Careem Iraq** | Ride-Hailing/Pay | Developer portal, CareemPay merchant API, deep linking, 5+ Iraqi cities | ★★★★☆ | 40–55 |
| 5 | **3rd-Party SMS** | SMS Gateway | EasySendSMS/BulkSMS REST APIs cover all 3 Iraqi telecom networks | ★★★☆☆ | 20–30 |
| 6 | **Amwal/PayTabs** | Payments | Well-documented PayTabs parent API with Iraq presence | ★★★☆☆ | 25–35 |
| 7 | **Switch Iraq** | Payments/POS | CBI-licensed, PCI DSS certified, referenced in iq-epay library | ★★☆☆☆ | 50–70 |
| 8 | **Baly** | Super-App | Rocket Internet-backed, first IQ super-app, future API potential | ★☆☆☆☆ | 60–80 |
| 9 | **Arab Payment Services** | Payments | First IQ electronic payment company, referenced in iq-epay | ★★☆☆☆ | 50–70 |
| 10 | **Lezzoo** | Delivery | YC-backed, strong tech stack likely, Kurdistan + expanding | ★☆☆☆☆ | 60–80 |

---

## The entire regional MCP ecosystem is untouched

Exhaustive searches across GitHub, the official MCP Registry (`registry.modelcontextprotocol.io`), MCP directories (mcpservers.org, mcpmarket.com, mcp.so, glama.ai), npm, and PyPI confirmed that **zero MCP servers exist for any service in Iran, Pakistan, or Iraq**. The MCP ecosystem has grown to 5,000+ servers since the registry launched in September 2025, but has zero Middle East or South Asian regional service representation. This represents a massive greenfield opportunity.

### Existing SDK ecosystems that accelerate MCP development

The strongest existing SDK foundations that would significantly reduce MCP server development time:

- **ZarinPal** (Iran): **100+ community repos**, official SDKs in Node.js, Python, PHP, Dart, .NET, Kotlin. Most mature ecosystem across all three countries.
- **Kavenegar** (Iran): **54+ official repos** spanning Python (123★), PHP (68★), Node.js (57★), Go (56★), .NET (33★), Java, Delphi, Ruby, Elixir. Best official multi-language coverage.
- **Divar Kenar** (Iran): Official auto-generated SDKs from OpenAPI spec in Python, PHP, Go, JavaScript.
- **ZainCash** (Iraq): Multiple PHP/Laravel wrappers, Flutter and iOS SDKs (all community-built).
- **JazzCash** (Pakistan): Several PHP/Laravel community wrappers; no Node.js or Python libraries.
- **Easypaisa** (Pakistan): Virtually no SDK presence — only via Paymob Flutter wrapper. Major gap.

### Services with zero library presence — pure greenfield

NayaPay (PK), SadaPay (PK), Hesabfa (IR, only WP plugin), Qi Card (IQ, only in combined iq-epay package), all Iraqi telecoms, all Pakistan classifieds/real estate portals.

---

## Master priority list: top 20 MCP candidates across all three countries

| Rank | Company | Country | Category | Why top priority | API Maturity | Est. Hours |
|------|---------|---------|----------|------------------|-------------|------------|
| 1 | **ZarinPal** | 🇮🇷 Iran | Payments | Clean REST v4, sandbox, 100+ repos, official SDKs in 6+ languages. Iran's payment backbone. | ★★★★★ | 20–25 |
| 2 | **Kavenegar** | 🇮🇷 Iran | SMS/Voice | Simple API key auth, 54+ official repos across 7+ languages. SMS is critical Iran infrastructure (OTP, notifications). | ★★★★★ | 15–20 |
| 3 | **JazzCash** | 🇵🇰 Pakistan | Payments | 60M+ users. Full REST API with card/mobile/voucher APIs, sandbox, HMAC auth. Pakistan's largest wallet. | ★★★★★ | 25–35 |
| 4 | **Easypaisa** | 🇵🇰 Pakistan | Payments | 40M+ users. REST + Open API Portal, sandbox, IPN callbacks. Pioneer branchless banking. | ★★★★★ | 25–35 |
| 5 | **Divar (Kenar)** | 🇮🇷 Iran | Classifieds | Full OpenAPI spec, OAuth2, auto-generated SDKs in 4 languages. 35M+ users, 139M+ annual listings. Best developer experience in Iran. | ★★★★★ | 25–30 |
| 6 | **Daraz.pk** | 🇵🇰 Pakistan | E-commerce | Alibaba-backed. Full Lazada Open Platform API (products, orders, sellers). Sandbox available. Pakistan's Amazon. | ★★★★★ | 30–40 |
| 7 | **TCS** | 🇵🇰 Pakistan | Logistics | Pakistan's #1 courier. OAuth 2.0 developer portal. Shipment creation, tracking, labels, COD. | ★★★★★ | 25–35 |
| 8 | **Neshan Maps** | 🇮🇷 Iran | Maps/Geo | REST API with API key auth. Geocoding, routing, distance matrix, search, map matching. 10M+ users. Iran's Google Maps. | ★★★★☆ | 20–25 |
| 9 | **ZainCash** | 🇮🇶 Iraq | Payments | Iraq's dominant wallet. Full REST API, JWT auth, sandbox, community SDKs. Only well-documented Iraqi payment API. | ★★★★☆ | 30–40 |
| 10 | **Arvan Cloud** | 🇮🇷 Iran | Cloud/CDN | Comprehensive API surface: CDN, compute, DNS, S3-compatible storage, VOD, Kubernetes. Terraform provider. | ★★★★☆ | 40–50 |
| 11 | **Foodpanda PK** | 🇵🇰 Pakistan | Food Delivery | OAuth 2.0, Partner API (catalog/orders/promotions), webhooks. Mature Delivery Hero developer ecosystem. | ★★★★☆ | 30–40 |
| 12 | **Finnotech** | 🇮🇷 Iran | Open Banking | Single gateway to Iran's entire banking system — accounts, payments, credit scoring, government data. Enormous breadth. | ★★★★☆ | 60–80 |
| 13 | **Qi Card** | 🇮🇶 Iraq | Payments Infra | Iraq's national payment infrastructure. 10M+ customers, $100B+ volume. REST API + mobile SDKs + webhooks. | ★★★★☆ | 35–50 |
| 14 | **IDPay** | 🇮🇷 Iran | Payments | Clean REST v1.1, sandbox toggle via header, 30 repos on official org. Complement to ZarinPal. | ★★★★☆ | 15–20 |
| 15 | **FBR POS** | 🇵🇰 Pakistan | Gov/Tax | Mandatory for all Tier-1 retailers (PKR 1M penalty). RESTful invoice submission. Every retail business needs this. | ★★★★☆ | 30–40 |
| 16 | **Bank Alfalah** | 🇵🇰 Pakistan | Banking | Most complete PK bank developer portal — accounts, funds transfer, QR, cards, rewards, payment gateway. | ★★★★☆ | 60–80 |
| 17 | **Moadian** | 🇮🇷 Iran | Gov e-Invoice | Legally mandated for all Iranian businesses. Complex RSA/certificate auth but community SDKs in PHP/Python/C#. | ★★★☆☆ | 40–50 |
| 18 | **Talabat Iraq** | 🇮🇶 Iraq | Food Delivery | Full Partner API with OAuth 2.0 — orders, catalog, promotions, webhooks. Delivery Hero ecosystem. | ★★★★☆ | 40–55 |
| 19 | **AloPeyk** | 🇮🇷 Iran | Delivery | Full REST API, JWT auth, sandbox, SDKs in PHP/Node/.NET. On-demand delivery automation. | ★★★★☆ | 20–25 |
| 20 | **NADRA Nishan** | 🇵🇰 Pakistan | Identity/KYC | National identity verification for 220M+ citizens. Biometric, demographic, proof-of-life APIs. Every fintech needs this. | ★★★★☆ | 60–80 |

---

## Strategic patterns and what they mean for MCP development

**Iran's parallel ecosystem is more API-mature than expected.** Despite sanctions and isolation, Iranian developer culture has produced sophisticated API platforms. ZarinPal, Kavenegar, and Divar rival their global counterparts in documentation quality and SDK coverage. The key bottleneck is IP restrictions — several services require Iranian IP access, which means MCP servers may need to be deployed within Iran's network infrastructure or use Iranian VPS providers like ArvanCloud.

**Pakistan's strength is in payments and logistics, not platforms.** While consumer platforms (Zameen, PakWheels, Rozee) remain API-closed, the payment (JazzCash, Easypaisa, 1LINK, Bank Alfalah) and logistics (TCS, Leopards, PostEx, Bykea) layers are notably accessible. SBP's RAAST system and pending open banking mandates suggest the API landscape will expand significantly. The combination of JazzCash + Easypaisa + 1LINK + FBR POS creates a comprehensive financial MCP stack covering **100M+ wallet users, 1000+ billers, and all Tier-1 retail tax compliance**.

**Iraq's ecosystem is payment-centric with emerging super-apps.** ZainCash and Qi Card are the clear starting points — together they cover the vast majority of Iraq's digital payment volume. The super-app trend (Baly, Lezzoo, SuperQi) could be transformative but lacks public APIs today. The **iq-epay open-source library** (unified interface to 5 Iraqi payment gateways) provides a ready reference architecture for MCP server design.

**Sanctions compliance is a critical consideration for Iran.** All Iranian payment APIs process transactions exclusively within the domestic Shaparak/Shetab network, isolated from international financial systems. MCP server developers must evaluate sanctions compliance obligations in their jurisdiction. Iranian cloud infrastructure (ArvanCloud), mapping (Neshan), and communication (Kavenegar, Bale) APIs face fewer compliance issues than payment services since they don't facilitate financial transactions through sanctioned banking channels.

**The fastest path to impact** across all three countries: build MCP servers for ZarinPal + Kavenegar + Neshan (Iran), JazzCash + Easypaisa + TCS (Pakistan), and ZainCash + Qi Card (Iraq) first. These eight servers would provide AI assistants with **payment processing, SMS/OTP, mapping, logistics tracking, and e-commerce** capabilities reaching over **200M+ users** across the three markets — and could all be built in an estimated **200–280 total development hours** given the clean REST APIs and existing SDK foundations.