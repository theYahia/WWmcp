# MCP server opportunities across Malaysia, Philippines, and Bangladesh

**No MCP servers exist today for any service in these three markets — creating a massive greenfield opportunity.** Across 100+ companies investigated, roughly 40 have usable APIs, with payment gateways and e-commerce platforms leading in API maturity. Malaysia's mandatory e-invoice system (LHDN MyInvois), the Philippines' PayMongo, and Bangladesh's SSLCommerz represent the strongest immediate candidates. This report maps every verified API, developer portal, and authentication method across all three countries to prioritize MCP server development.

---

## Malaysia (MY)

### Market overview

Malaysia has **33 million people and 32 million internet users** — one of the highest internet penetration rates in Southeast Asia. The digital payment ecosystem centers on FPX (instant bank transfers), Touch 'n Go eWallet, and GrabPay. API ecosystem maturity is moderate: payment gateways like Billplz and Revenue Monster offer excellent public APIs, while banks remain enterprise-only. The most significant regulatory driver is **LHDN's mandatory e-invoicing**, which became compulsory for companies with RM100M+ turnover in August 2024, expanding to all taxpayers by July 2025. Malaysia's BRICS partner status and MyDIGITAL national initiative signal continued digital acceleration.

### 1–4. Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | Market Rank | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|----------------|-------|
| Shopee MY | #1 e-commerce marketplace | Public (Partner) | open.shopee.com | OAuth 2.0 + HMAC-SHA256 | #1 | **High** | 40–60 | API v2; seller/merchant APIs; sandbox available; complex auth with IP whitelisting |
| Lazada MY | #2 e-commerce (Alibaba) | Public (Partner) | open.lazada.com | App Key/Secret + SHA256 | #2 | **High** | 40–60 | Full seller lifecycle APIs; community Node.js SDK |
| Mudah.my | Largest classifieds | No API | N/A | N/A | #1 classifieds | Low | N/A | Part of Carousell Group; no developer access |
| Carousell MY | C2C marketplace | No API | N/A | N/A | #2 classifieds | Low | N/A | Confirmed "no APIs for 3rd party integrations" |
| GrabFood/GrabMart | Food + grocery delivery | Partner API | developer.grab.com | OAuth 2.0 | #1 food delivery | **High** | 30–50 | Official SDKs in Java, Python, Go; sandbox; webhook support |
| HappyFresh | Grocery delivery | **DEFUNCT** | N/A | N/A | N/A | None | N/A | Ceased Malaysia operations September 2022 |
| Jaya Grocer | Premium grocer (Grab subsidiary) | No API | N/A | N/A | N/A | Low | N/A | Internal Grab integration only |
| Foodpanda MY | Food delivery (Delivery Hero) | Partner API | developer.foodpanda.com | OAuth 2.0 / Bearer Token | #2 food delivery | Med | 30–40 | POS integration API; SFTP for bulk catalog; tokens valid 2 hours |
| StoreHub | Cloud POS (18K+ merchants) | Enterprise-only | None public | Unknown | #1 local POS | Med | N/A | No public API; enterprise integrations only |
| EasyStore | E-commerce platform (50K+ merchants) | Public (Partner) | developers.easystore.co | OAuth | Top 3 local | Med | 25–35 | Development stores for testing; Postman docs at postman.easystore.co |

### 5–9. Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | Market Rank | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|----------------|-------|
| **Maybank** | Largest bank | Partner/Enterprise | m2upay.maybank2u.com.my | Custom encryption + Payee Code | #1 bank | Med | 30–40 | Maybank2u Pay for merchants; MConnect sandbox; RPN webhooks; PHP/Java SDKs |
| CIMB | #2 bank | Enterprise-only | No public portal (MY) | Via implementation specialist | #2 bank | Low | N/A | Indonesia (CIMB Niaga) has full portal; MY requires enterprise onboarding |
| Public Bank | #3 bank | Partner-only | fintech.publicbankgroup.com/OpenApi/ | Not documented | #3 bank | Low | N/A | Requires formal partnership application |
| RHB | Major bank | Enterprise-only | simulator.api.rhbgroup.com | Azure APIM-based | #4 bank | Low | 20–30 | API simulator available; no additional fees; contact api@rhbgroup.com |
| Touch 'n Go eWallet | Dominant e-wallet | Partner-only | miniprogram.tngdigital.com.my/docs/ | Alipay+ protocol | #1 e-wallet | Med | 25–35 | No standalone merchant API; integrates via aggregators (Billplz, Fiuu, iPay88); Mini Program SDK available |
| **Billplz** | Payment gateway | **Public** | **billplz.com/api** | **HTTP Basic Auth (API Key)** | Top 3 gateway | **High** | **15–25** | Excellent docs; sandbox at billplz-sandbox.com; webhooks with X-Signature; MYR only; V4+V5 APIs |
| **Revenue Monster** | Unified payment platform | **Public** | **doc.revenuemonster.my** | **OAuth 2.0 + RSA keys** | Top 3 gateway | **High** | **20–30** | SDKs in PHP, Python, Go, JS; sandbox portal; supports e-wallets, QR, FPX, loyalty |
| iPay88 (NTT DATA) | Payment gateway | Partner-only | Provided on registration | SHA256 Hash Signature | #1 gateway by volume | Med | 25–35 | Renamed to NTT DATA e-Commerce Solutions Feb 2025; redirect-based; docs after signup |
| Fiuu (ex-Razer MS) | Payment gateway | **Public** | github.com/FiuuPayment | Verify Key + Secret + Hash | Major gateway | **High** | 20–30 | Full API specs on GitHub; PCI-DSS v4.0; supports 8 countries; IPN webhooks; Apple/Google Pay |
| SenangPay | Payment gateway | **Public** | developer.senangpay.my | HMAC SHA256 | Growing gateway | Med | 20–25 | Sandbox at sandbox.senangpay.my; Direct API for Enterprise tier; GitHub catalog |
| GrabPay MY | E-wallet | Partner-only | developer.grab.com | OAuth 2.0 / HMAC | #2 e-wallet | Med | 25–35 | Official SDKs in Go, PHP, Node, Python, Java, .NET; most merchants use via aggregators |
| Boost | E-wallet (Axiata) | Partner-only | connect.myboost.co/documentation/ | API Key + Secret | #3 e-wallet | Low | 20–30 | 10M+ users; requires email application; no self-service |
| MAE by Maybank | Digital banking feature | No API | N/A | N/A | Bundled with Maybank | Low | N/A | Consumer app only; available via aggregators |
| **Luno** | Crypto exchange (SC-regulated) | **Public** | **luno.com/api** | **API Key + Secret (Basic Auth)** | #1 crypto MY | Med | **15–20** | Official SDKs in Go, Python, PHP; Swagger spec; $5B+ traded via API |
| MX Global | Crypto exchange | Public | openapi.mx.exchange | API Key (likely) | #2 crypto MY | Low | 15–20 | Limited offerings; client-side rendered docs |

### 16. LHDN MyInvois e-invoice (critical compliance driver)

**This is Malaysia's highest-priority MCP candidate.** The LHDN MyInvois system is a mandatory e-invoicing platform with **15 well-documented APIs**, OAuth 2.0 authentication, a sandbox environment, and Postman collections. Every Malaysian business must integrate by July 2025.

| Detail | Value |
|--------|-------|
| API Docs | sdk.myinvois.hasil.gov.my |
| API Base (Production) | api.myinvois.hasil.gov.my |
| Auth | OAuth 2.0 Client Credentials + X.509 Digital Certificate |
| Sandbox | Yes — separate credentials via MyInvois Portal |
| APIs | 6 Platform APIs + 9 E-Invoice APIs (submit, cancel, reject, query, search) |
| Format | JSON or XML (UBL 2.1-based) |
| SDK | No official language SDK — API docs + Postman collection; community Go/Python implementations |
| Compliance Timeline | Aug 2024: >RM100M; Jan 2025: >RM25M; **Jul 2025: all taxpayers** |
| Rate Limits | Enforced; retry on "too many requests"; 2-hour duplicate detection window |

An MCP server for LHDN MyInvois would let AI assistants submit invoices, validate TINs, query document status, and manage the entire e-invoicing lifecycle — a capability every Malaysian business will need.

### 10–12. Logistics and delivery

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|----------------|-------|
| Pos Malaysia/Pos Laju | National postal service | Partner API | api-doc.pos.com.my | API Key | Med | 20–30 | Postman collection; most devs use aggregators like EasyParcel |
| J&T Express MY | Major courier (700K+ parcels/day) | Partner API | Via account manager | Custcode + API Key | Med | 20–30 | Community Laravel packages; sandbox available |
| Ninja Van MY | SEA logistics | Partner API | api-docs.ninjavan.co | OAuth 2.0 | Med | 25–35 | Pro Account required; sandbox in SG with MY addresses; webhooks |
| DHL eCommerce MY | International courier | Public (registration) | developer.dhl.com | API Key / Token | Med | 20–30 | Well-documented; Postman collections; push tracking API |
| **Lalamove MY** | On-demand delivery | **Public (Partner)** | **developers.lalamove.com** | **API Key + HMAC Secret** | **High** | **20–25** | Official Node.js + PHP SDKs; v3 API with 5-min price guarantee; sandbox; webhooks; multi-stop |

### 14–20. Business software, SaaS, telecom, and cloud

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------|
| SQL Accounting | #1 local accounting (300K+ co.) | Public (REST) | docs.sql.com.my | API Key/Token | Med | LHDN e-invoice integration built-in; e-commerce sync |
| AutoCount | #2 accounting (240K+ co.) | Available | wiki.autocountsoft.com | Token-based | Med | Desktop + Cloud API; NuGet packages for .NET |
| Maxis | #1 telco | Enterprise/Emerging | Via Aduna/Bridge Alliance | CAMARA/OAuth | Low | GSMA Open Gateway; Number Verification API |
| CelcomDigi | Largest by subscribers | Enterprise/Emerging | Via Firebase/partners | CAMARA/OAuth | Low | First MY telco on Google Firebase phone verification (Feb 2026) |
| TM/TM One | National telco + cloud | Enterprise + OIP | portal.oip.tm.com.my/se | Subscription | Low | Service Exchange Platform = API marketplace |
| U Mobile | 5G provider | Public Portal (2025) | Open API Portal | CAMARA/OAuth | Med | First MY operator with GSMA-certified Open Gateway developer portal |
| EasyParcel | Shipping aggregator | Public | developers.easyparcel.com | API Key | Med | Connects to Pos Laju, J&T, Ninja Van via single API |

### Top 10 MCP candidates for Malaysia

1. **LHDN MyInvois** — Mandatory compliance for all businesses; 15 APIs; OAuth 2.0; sandbox; Postman collection. Highest demand, zero MCP servers exist. ~25 dev hours.
2. **Billplz** — Clean public REST API; Basic Auth; sandbox; excellent docs. Simplest integration among payment gateways. ~20 dev hours.
3. **Revenue Monster** — OAuth 2.0 with RSA; SDKs in 4 languages; e-wallets + QR + loyalty. Rich feature set. ~25 dev hours.
4. **Shopee MY Open Platform** — #1 e-commerce; full seller API; sandbox; community SDKs. High business value. ~50 dev hours.
5. **Fiuu/Razer Merchant Services** — API specs on GitHub; PCI-DSS v4.0; 8-country coverage. Multi-market advantage. ~25 dev hours.
6. **Lazada MY Open Platform** — #2 e-commerce; Alibaba-backed; seller lifecycle APIs. ~50 dev hours.
7. **Grab ecosystem (Food/Mart/Pay)** — Official SDKs in 6 languages; OAuth 2.0; webhooks. Super-app coverage. ~40 dev hours.
8. **Lalamove** — Best-documented logistics API; official SDKs; v3 with guaranteed pricing. ~20 dev hours.
9. **Luno** — Clean crypto trading API; official SDKs in 3 languages; $5B+ traded. ~15 dev hours.
10. **SenangPay** — Growing gateway with developer portal, sandbox, and GitHub catalog. ~20 dev hours.

---

## Philippines (PH)

### Market overview

The Philippines has **115 million people and 75M+ internet users**, with GCash dominating digital payments at **80M+ users**. The country has Southeast Asia's largest BPO sector, creating a tech-savvy workforce. API maturity is the highest of the three countries: PayMongo offers a Stripe-quality developer experience, UnionBank exposes ~1,000 APIs, and Globe Labs provides the best telco API platform in the region. The BSP (Bangko Sentral ng Pilipinas) actively promotes open finance, and the BIR is implementing mandatory e-invoicing by December 2026 for large taxpayers. **Facebook and GCash are the two dominant digital platforms** in daily Filipino life.

### 1–4. Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | Market Rank | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|----------------|-------|
| Shopee PH | #1 e-commerce | Public (Partner) | open.shopee.com | OAuth 2.0 + HMAC-SHA256 | #1 | **High** | 40–60 | Same global platform as MY; seller APIs; sandbox |
| Lazada PH | #2 e-commerce (Alibaba) | Public (Partner) | open.lazada.com | App Key/Secret + SHA256 | #2 | **High** | 40–60 | Same global platform; PH country code supported |
| Carousell PH | C2C marketplace | No API | N/A | N/A | Classifieds | Low | N/A | No third-party integrations |
| GrabFood PH | #1 food delivery | Partner API | developer.grab.com | OAuth 2.0 | #1 food | **High** | 30–50 | Official Python, Java, Go SDKs; sandbox |
| Foodpanda PH | Food delivery | Partner API | developer.foodpanda.com | OAuth 2.0 / Bearer | #2 food | Med | 30–40 | POS integration API; global Delivery Hero platform |
| MetroMart | Grocery delivery | No API | N/A | N/A | Metro Manila | Low | N/A | Consumer app only |

### 5–9. Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | Market Rank | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|----------------|-------|
| **GCash** | Dominant mobile wallet (80M+ users) | **Partner-only** | **apiportal.gcash.com** | **RSA256 digital signatures** | **#1 wallet** | **High** | 30–40 | Sandbox at apiportal.lab.gcash.com; Mini Program platform; Ant Group/Alipay tech stack; available via PayMongo as payment method |
| BDO | Largest bank | Partner-only | UAT portal exists | Unknown | #1 bank | Low | N/A | Accessible via Brankas/Finverse aggregators |
| BPI | Major bank | Partner-only | developer.bpi.com.ph | OAuth 2.0 + JWT/JWE | #2 bank | Med | 30–40 | Sandbox + UAT + production; requires VPN; IBM API Connect |
| **UnionBank** | Most digital-forward bank | **Public/Partner** | **developer.unionbankph.com** | **OAuth 2.0** | Digital leader | **High** | **25–40** | **~1,000 APIs**; 200+ institutions; 40M API calls/month; P3B+ transacted; first PH bank to expose APIs (2016) |
| **Maya/PayMaya** | Digital bank + wallet + gateway | **Public** | **developers.maya.ph** | **Basic Auth (API Key)** | #2 wallet | **High** | **25–35** | Checkout, Vault, Disbursement, Bills Payment APIs; SDKs in PHP, Ruby, JS, Node, iOS, Android; sandbox; webhooks; free for developers |
| Tonik | Digital neobank | Partner-only | Private (Apigee) | OAuth 2.0 | Neobank | Low | N/A | API-driven internally; partner portal for ecosystem |
| GoTyme Bank | Digital bank | No API | N/A | N/A | Growing neobank | Low | N/A | Consumer-facing only |
| **PayMongo** | Stripe-like payment gateway | **Public** | **developers.paymongo.com** | **API Key (Basic Auth, pk_/sk_)** | **#1 gateway** | **High** | **20–30** | Cards, GCash, Maya, GrabPay, QR Ph, Google Pay; Payment Intents, Checkout, Subscriptions, Disbursements; official PHP SDK; sandbox; webhooks; PCI DSS; self-service signup |
| Dragonpay | Alternative payment gateway | Partner-only | dragonpay.ph/developers | SHA1 Digest | Pioneer gateway | Med | 25–35 | Sandbox at test.dragonpay.ph; 14+ banks; SOAP/XML + REST/JSON; 10+ years in business |
| PesoPay (AsiaPay) | Payment gateway | Partner-only | Docs after signup | Merchant ID + TLS | Major gateway | Low | 25–35 | Part of AsiaPay Group; e-commerce plugins; no public docs |
| **Coins.ph** | Crypto wallet + exchange (BSP-regulated) | **Public** | **docs.coins.ph/rest-api/** | **HMAC SHA-384** | #1 crypto PH | Med | **20–25** | REST + WebSocket; JS, Java, Python SDKs; Postman collection; white-label API (Coins Access) |
| PDAX | Crypto exchange (BSP-regulated) | Public | doc.restapi.pdax.ph | HMAC SHA-384 | #2 crypto PH | Low | 20–25 | Sandbox available; integrated into UnionBank portal |

### Special focus: Globe Labs API

**Globe Labs is the best telco developer API in Southeast Asia** and one of the strongest MCP candidates in this entire report. It offers a fully self-service developer portal at developer.globelabs.com.ph with **7 APIs** (SMS, Location, Charging, Rewards/Load, USSD, Voice, Sponsored Access) and **SDKs in 8 languages** (PHP, Node.js, Python, C#, Java, React Native, Swift, PhoneGap).

| Detail | Value |
|--------|-------|
| Portal | developer.globelabs.com.ph |
| Docs | globelabs.com.ph/docs/ + github.com/globelabs/gl-docs |
| Auth | OAuth 2.0 (App ID + App Secret → subscriber consent → access token) |
| Base URL | devapi.globelabs.com.ph |
| Free Credits | PHP 1,000 developer wallet on signup |
| GitHub | 31 repositories at github.com/globelabs |
| SDKs | PHP, Node.js, Python, C#, Java, React Native, Swift, PhoneGap/Cordova |

An MCP server for Globe Labs would enable AI assistants to send SMS, query subscriber location, charge to prepaid balance, and send rewards/load — powerful for customer engagement, OTP verification, and mobile marketing workflows in the Philippines.

### 10–12. Logistics, telecom, and government

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|----------------|-------|
| J&T Express PH | Major courier | Partner API | developer.jet.co.id (regional) | Custcode + API Key | Med | 20–30 | PH-specific requires partnership |
| Ninja Van PH | SEA logistics | Partner API | api-docs.ninjavan.co | OAuth 2.0 | Med | 25–35 | VIP shipper account required |
| **LBC Express** | Major PH courier (1,252+ branches) | **Public** | **lbcapiservice.lbcapps.com** | **API Key** | Med | **20–25** | Self-service developer portal; rare for PH-native courier |
| JRS Express | Courier | Limited | N/A | Unknown | Low | N/A | No public developer portal |
| **Lalamove PH** | On-demand delivery | **Public (Partner)** | **developers.lalamove.com** | **API Key + HMAC** | **High** | **20–25** | Official Node.js + PHP SDKs; v3 sandbox; webhooks |
| Transportify | Logistics marketplace | Active | transportify.com.ph/api-for-tech-teams | API-based | Med | 20–30 | Sandbox available |
| Smart Communications | #2 telco (59M subscribers) | Enterprise/Transitioning | pldtenterprise.com | GSMA CAMARA | Low | N/A | First PH telco with GSMA Open Gateway certification; enterprise A2P SMS |
| DITO Telecommunity | #3 telco | No public API | N/A | N/A | Low | N/A | Emerging; Silent Network Auth via Twilio/Shush partnership |
| **Sprout Solutions** | #1 PH HR/Payroll SaaS | **Active** | **developers.sprout.ph** | Partner credentials | Med | **25–35** | Partner API docs at api-docs-partners.sprout.ph; HR data, payroll, timekeeping |
| eGov PH | Government digital services | Active | e.gov.ph/developers/egov-partners-api | X-Secret-Code + Token | Med | 25–35 | 12 APIs; 42 of 75 agencies integrated; citizen profile inquiry |
| BIR EIS | Tax e-invoicing | Government API | eis.bir.gov.ph | JSON Web Signature | Med | 30–40 | Mandatory Dec 2026 for large taxpayers; real-time or 3-day submission |
| PhilSys/NIDAS | National ID verification | Government API | everify.gov.ph | TSP-based API | Med | 30–40 | 56M+ authentications; biometric checks; requires TSP onboarding |

### Top 10 MCP candidates for Philippines

1. **PayMongo** — Most complete public API in PH; Stripe-quality docs; covers GCash, Maya, cards, QR, disbursements; self-service signup. ~25 dev hours.
2. **Globe Labs** — Best telco API in SEA; 7 APIs; 8 SDK languages; self-service; free developer credits. ~20 dev hours.
3. **Maya/PayMaya** — Comprehensive public gateway + wallet + bank API; 10+ products; SDKs in 6 languages; free for developers. ~30 dev hours.
4. **UnionBank** — ~1,000 APIs; most open bank in PH; OAuth 2.0; sandbox. Covers fund transfers, bills, authentication. ~35 dev hours.
5. **Shopee PH Open Platform** — #1 e-commerce; full seller APIs; sandbox. ~50 dev hours.
6. **GCash** — 80M+ users makes this the single most impactful integration, despite partner-only access. Available indirectly via PayMongo MCP. ~35 dev hours.
7. **Coins.ph** — Public crypto API with REST + WebSocket; SDKs; white-label wallet API. ~20 dev hours.
8. **Lazada PH Open Platform** — #2 e-commerce; full seller APIs. ~50 dev hours.
9. **Lalamove PH** — Excellent logistics API; official SDKs; sandbox; webhooks. ~20 dev hours.
10. **LBC Express** — Rare PH courier with self-service API portal; 1,252+ branches nationwide. ~20 dev hours.

---

## Bangladesh (BD)

### Market overview

Bangladesh has **170 million people with a rapidly growing digital economy**. The market is defined by mobile financial services: **bKash (70M+ users)** and Nagad dominate payments, while **SSLCommerz** is the undisputed payment gateway leader. API maturity is the lowest of the three countries — banks have no public APIs, government services are entirely web-form-based, and cryptocurrency is effectively banned by Bangladesh Bank. However, the courier/logistics sector shows surprising API maturity, driven by e-commerce growth. The tech ecosystem is PHP/Laravel-dominant, with a vibrant community building packages for local services. **No local SaaS, healthcare, travel, education, or real estate company offers a public API.**

### 1–4. Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | Market Rank | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|----------------|-------|
| **Daraz BD** | #1 e-commerce (Alibaba) | **Public (Seller)** | **open.daraz.com** | API Key + User ID | #1 | **High** | 35–50 | Full seller lifecycle: products, orders, categories, brands; same platform as Lazada |
| Chaldal | #1 online grocery (Y Combinator-backed) | No API | N/A | N/A | #1 grocery | Low | N/A | Sophisticated internal engineering; no public developer portal |
| **Evaly** | Former e-commerce | **DEFUNCT** | N/A | N/A | N/A | None | N/A | CEO sentenced Jan 2025 for Tk500+ crore fraud; website hacked May 2025 |
| Pickaboo | Electronics e-commerce | No API | N/A | N/A | Niche | Low | N/A | Still operational; raised $1.5M Dec 2022 |
| AjkerDeal | Large marketplace | No API | N/A | N/A | Top 5 | Low | N/A | Owned by Bdjobs.com founder; runs Delivery Tiger courier |
| Foodpanda BD | #1 food delivery | Partner API | developer.foodpanda.com | OAuth 2.0 | #1 food | Med | 30–40 | Global Delivery Hero API; POS integration; SFTP for catalogs |
| HungryNaki | Food delivery | **SHUT DOWN** | N/A | N/A | N/A | None | N/A | Acquired by Daraz 2021; ceased operations mid-2023 |
| Shohoz Food | Food delivery | **SHUT DOWN** | N/A | N/A | N/A | None | N/A | Discontinued 2021 |

### 5–9. Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | Market Rank | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|----------------|-------|
| **bKash** | Dominant MFS (70M+ users) | **Partner-only** | **developer.bka.sh** | **OAuth (app_key + secret + user/pass → token)** | **#1 MFS** | **High** | **25–35** | Sandbox at merchantdemo.sandbox.bka.sh; 11 repos on GitHub (bKash-developer); WooCommerce, PHP, Node, Flutter SDKs; checkout, tokenized, refund, B2C payout APIs |
| **SSLCommerz** | #1 payment gateway | **Public** | **developer.sslcommerz.com** | **Store ID + Store Password** | **#1 gateway** | **High** | **20–25** | Sandbox at sandbox.sslcommerz.com; test creds: testbox/qwerty; official SDKs in PHP, Laravel, Node, Java, .NET, WooCommerce, Magento, WHMCS, Odoo; IPN webhooks; 174 GitHub repos in ecosystem |
| **aamarPay** | Payment gateway (PSO-licensed) | **Public** | **aamarpay.readme.io** | **Store ID + Signature Key** | Top 3 gateway | Med | **15–20** | Sandbox at sandbox.aamarpay.com; Node, PHP, Android, Flutter SDKs; IPN; no setup fees |
| PortWallet/PortPos | Payment gateway | Partner-only | portwallet.com/developer.html | REST API Key | Niche gateway | Low | 20–25 | Rebranded as PortPos; IPN support; 1.5–2.5% per transaction |
| **ShurjoPay** | Payment gateway (PCI-DSS L1) | **Public** | **shurjopay.com.bd/developers** | **Username + Password → JWT (15 min)** | Growing gateway | Med | **15–20** | Sandbox at sandbox.shurjopayment.com; SDKs in TypeScript, Node, PHP, .NET, Spring, Flutter; 4 simple RESTful APIs; webhook support |
| **Nagad** | #2 MFS | **Partner-only** | Docs via merchant portal only | **RSA public/private key pair** | #2 MFS | **High** | 30–40 | Sandbox at sandbox.mynagad.com; community SDKs in PHP, Node, Python, Flutter; IP whitelisting required; more complex RSA auth |
| Rocket (DBBL) | MFS (17M+ users) | No API | N/A | N/A | #3 MFS | Low | N/A | Available only via aggregators (SSLCommerz, aamarPay) |
| Upay | MFS | Partner-only | None public | Merchant ID + Key + Code | Minor MFS | Low | 20–25 | Community Laravel package; IPv4 only; details via Upay directly |
| BRAC Bank | Major bank (bKash parent) | Enterprise-only | bracbank.com (product page) | Enterprise credentials | Top 3 bank | Low | N/A | First BD bank with NBR VAT API; H2H for corporates only |
| DBBL | Major bank (Rocket operator) | No API | N/A | N/A | Top 5 bank | Low | N/A | No banking APIs; card payments via aggregators |
| City Bank | Private bank | No API | N/A | N/A | Top 5 bank | Low | N/A | Card payments via SSLCommerz only |
| EBL | Private bank | No API | N/A | N/A | Top 10 bank | Low | N/A | No developer portal |
| Standard Chartered BD | International bank | Enterprise-only | openbanking.sc.com (global) | Enterprise OAuth | International | Low | N/A | 100+ H2H/API integrations for corporates; no public access |

**Cryptocurrency is effectively banned in Bangladesh.** Bangladesh Bank classified virtual currencies as illegal under anti-money laundering laws. Despite this, ~3.1 million Bangladeshis reportedly own crypto wallets. No crypto exchange APIs operate legally. CBDC feasibility studies began in 2022.

### 10–12. Logistics, telecom, and infrastructure

Bangladesh's courier sector is surprisingly API-mature, driven by the COD e-commerce boom. A notable community resource is the **`xenon/multicourier`** Laravel package that provides unified access to Pathao, Steadfast, eCourier, Paperfly, and RedX through a single interface.

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Dev Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|----------------|-------|
| **Pathao Courier** | Super-app courier arm | **Available** | **merchant.pathao.com → Developer API** | **OAuth2 (client credentials + user/pass)** | **#1 courier** | **High** | **20–30** | API base: api-hermes.pathao.com; Python, PHP/Laravel, WooCommerce SDKs; order creation, tracking, price calc; Food/Rides have no public API |
| **Steadfast Courier** | Fast-growing COD courier | **Available** | **portal.steadfast.com.bd/api/v1** | **API Key + Secret Key** | **Top 3 courier** | **High** | **15–20** | Official Laravel package; bulk orders (max 500); 64 districts, 495 upazilas; WooCommerce plugin |
| **RedX** | Major courier (ShopUp group) | **Available** | **redx.com.bd/developer-api/** | Bearer Token | Top 5 courier | Med | 15–20 | Laravel package; nopCommerce plugin; 64 districts |
| **eCourier** | On-demand logistics | **Available** | **ecourier.com.bd/resources/** | API-KEY + API-SECRET + USER-ID | Top 5 courier | Med | 15–20 | PDF documentation (v5.5); Laravel, WordPress, WooCommerce SDKs; Odoo integration |
| Paperfly | Wide COD coverage courier | Per-merchant | Contact Paperfly team | Credentials per seller | Top 5 courier | Low | 20–25 | No public docs; Tk102 crore investment from India's Ecom Express |
| Sundarban Courier | Traditional courier | No API | N/A | N/A | Legacy player | Low | N/A | Traditional company; no digital integration |
| Bangladesh Post | Government postal | No API | N/A | N/A | Government | Low | N/A | No developer API |
| **Grameenphone** | #1 telco (80M subscribers) | **Available** | **apihub.grameenphone.com** | Partner credentials | #1 telco | Med | **25–35** | DOB, Offer, Recharge, IoT, SMS Gateway APIs; requires partnership agreement; PHP client available |
| Robi | #2 telco | Limited/Indirect | N/A | Partner-only | #2 telco | Low | N/A | No public developer portal |
| Banglalink | #3 telco | Limited/Indirect | N/A | Partner-only | #3 telco | Low | N/A | Community PHP SMS client exists |
| **Barikoi** | BD-focused geocoding/mapping | **Available** | **docs.barikoi.com** | API Key | Mapping leader | Med | 15–20 | Address lookup, reverse geocoding, route optimization; Bangladesh-specific |
| Dingi Map | BD mapping platform | Available | dingi.tech/docs/api/ | API Key | #2 mapping | Low | 15–20 | Web SDK, Android SDK, iOS SDK |

### Government and compliance

Bangladesh government services have **no public APIs**. The NBR (tax authority) has web-form-based e-TIN and e-Return portals but no developer API. The a2i/myGov platform is citizen-facing with no third-party integration capability. VAT API connectivity exists only through private bank partnerships (BRAC Bank first). One notable government-adjacent service is **Porichoy** (porichoy.gov.bd), a paid identity verification API.

### Top 10 MCP candidates for Bangladesh

1. **SSLCommerz** — Public API with free sandbox; official SDKs in 9+ platforms; IPN webhooks; dominant gateway covering all BD payment methods. ~20 dev hours.
2. **bKash** — 70M+ users; developer portal (developer.bka.sh); OAuth token auth; checkout, tokenized, and B2C payout APIs; 11 official GitHub repos. ~30 dev hours.
3. **Pathao Courier** — OAuth2 API; Python, PHP, WooCommerce SDKs; order management, tracking, price calculation. ~25 dev hours.
4. **Steadfast Courier** — Simple API Key auth; official Laravel package; bulk orders up to 500; fastest-growing courier. ~15 dev hours.
5. **Nagad** — #2 MFS with RSA-based auth; sandbox available; community SDKs in 5 languages. Partner-only but high impact. ~35 dev hours.
6. **Daraz BD Open Platform** — #1 e-commerce; Alibaba-backed; full seller API covering products, orders, categories. ~40 dev hours.
7. **ShurjoPay** — Public API with JWT auth; SDKs in 6 platforms; sandbox; simple 4-endpoint design. ~15 dev hours.
8. **aamarPay** — Public gateway; ReadMe-hosted docs; sandbox; Node, Flutter SDKs; no setup fees. ~15 dev hours.
9. **eCourier** — Documented REST API; Laravel, WooCommerce SDKs; order creation and tracking. ~15 dev hours.
10. **Grameenphone API Hub** — 80M subscribers; DOB, Recharge, SMS, IoT APIs; partnership required. ~30 dev hours.

---

## The GitHub MCP landscape is empty for Southeast Asia

Extensive searching across **35+ query patterns** on GitHub revealed **zero dedicated MCP server implementations** for any Malaysia, Philippines, or Bangladesh service. No existing MCP servers were found for GCash, bKash, PayMongo, Billplz, SSLCommerz, Globe Labs, LHDN, or any other regional service. The major "awesome-mcp-servers" curated lists (wong2, appcypher, TensorBlock, official modelcontextprotocol/servers) contain no Southeast Asian services whatsoever.

Two tangentially relevant findings emerged. A **BigGo MCP Server** (github.com/Funmula-Corp/BigGo-MCP-Server) provides indirect Shopee product search capability across markets. A **BridgeAPI ecosystem** from Brazil includes a `mcp-shopee` connector published as `@bridgeapi/mcp-shopee` on npm, though it targets the Brazilian market.

However, **strong API wrapper ecosystems exist** that can serve as conversion foundations:

- **SSLCommerz**: 174 GitHub repos; official Node.js module (sslcommerz/SSLCommerz-NodeJS, 139 stars); TypeScript types available
- **bKash**: 50+ repos in GitHub topic; TypeScript npm packages; Laravel packages
- **Billplz**: PHP library (jomweb/billplz, 77 stars); TypeScript wrappers; GraphQL server
- **PayMongo**: Fully typed TypeScript client (@paymongo/core)
- **Globe Labs**: Official multi-language SDKs (53 stars); 31 repos
- **LHDN e-Invoice**: Go SDK, Python/ERPNext integrations, community guide
- **Steadfast**: Official Laravel package from steadfast-it

The most efficient path to MCP servers would be converting these TypeScript/Node.js wrappers, particularly PayMongo's typed client, SSLCommerz's Node module, and the bKash TypeScript packages.

---

## Cross-country patterns and strategic insights

Three structural patterns emerge across these markets that should shape MCP development strategy.

**Payment gateways are the lowest-hanging fruit.** Billplz, Revenue Monster, PayMongo, Maya, SSLCommerz, ShurjoPay, and aamarPay all offer public APIs with sandbox environments, webhook support, and reasonable documentation. These gateways also serve as indirect access points to partner-only wallets — PayMongo processes GCash and Maya payments, while SSLCommerz handles bKash, Nagad, and Rocket transactions. Building MCP servers for these gateways effectively unlocks the entire payment ecosystem in each country.

**Compliance mandates create urgent, captive demand.** Malaysia's LHDN e-invoice mandate (all businesses by July 2025) and the Philippines' BIR EIS mandate (large taxpayers by December 2026) represent regulatory requirements that every business must meet. An MCP server enabling AI assistants to submit invoices, validate tax IDs, and query compliance status addresses a need that cannot be deferred. LHDN's 15 well-documented APIs with OAuth 2.0 and sandbox make it immediately buildable.

**The courier API ecosystem in Bangladesh is remarkably mature** relative to the country's overall API landscape. Five of the ten Bangladesh MCP candidates are courier services (Pathao, Steadfast, RedX, eCourier, Paperfly), each with documented REST APIs and Laravel SDKs. The `xenon/multicourier` community package already provides a unified interface. A single "Bangladesh Courier MCP" server wrapping these five APIs could serve the entire e-commerce logistics workflow.

### Priority development roadmap

Building across all three markets, the optimal sequence targets maximum impact with minimum development time:

- **Phase 1 (immediate, ~100 hours)**: LHDN MyInvois, PayMongo, SSLCommerz, Billplz — these four cover mandatory compliance and dominant payment infrastructure across all three countries
- **Phase 2 (short-term, ~150 hours)**: Globe Labs, Maya, bKash, Steadfast Courier, Revenue Monster — extending to telco, wallets, and logistics
- **Phase 3 (medium-term, ~250 hours)**: Shopee Open Platform, Lazada Open Platform, Daraz, Pathao, UnionBank, Lalamove — e-commerce and banking platforms requiring more complex OAuth flows
- **Phase 4 (longer-term, ~200 hours)**: Grab ecosystem, Luno, Coins.ph, Grameenphone, Nagad, BIR EIS — partner-gated and specialized platforms

## Conclusion

This research reveals a **completely unoccupied market** for MCP servers in Malaysia, Philippines, and Bangladesh. While roughly 40 services across the three countries have viable APIs, not a single MCP server exists for any of them. The strongest immediate opportunities cluster around three themes: payment gateways with public APIs (PayMongo, Billplz, SSLCommerz), mandatory compliance systems (LHDN MyInvois, BIR EIS), and the Philippines' uniquely mature developer ecosystem (Globe Labs, UnionBank, Maya). Bangladesh's API maturity lags significantly in banking and government but surprises in courier logistics. The existing TypeScript/Node.js wrapper ecosystem — particularly PayMongo's typed client, SSLCommerz's 174-repo community, and Globe Labs' 31 official repos — provides ready-made foundations that can accelerate MCP server development from months to weeks.