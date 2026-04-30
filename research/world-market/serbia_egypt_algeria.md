# MCP server opportunities across Serbia, Egypt, and Algeria

**No MCP servers exist today for any service in these three markets — a complete greenfield.** Across 100+ companies investigated in Serbia, Egypt, and Algeria, roughly 35 have confirmed or partner-accessible APIs suitable for MCP server development, with Egypt offering the largest opportunity by volume and API maturity, Serbia providing the highest per-capita compliance-driven demand, and Algeria emerging through a surprisingly capable third-party developer ecosystem. The combined addressable market spans **158 million people** and touches mandatory government compliance systems, dominant payment rails, and critical logistics infrastructure — all unserved by current MCP tooling.

---

## Serbia (RS)

### Market overview

Serbia's 6.6 million residents include approximately 5.5 million internet users. The country became an EU candidate but has not adopted PSD2, meaning **no Serbian bank offers a public developer API**. The mandatory Sistem e-Faktura (SEF) e-invoicing system, live since January 2023 for all B2B transactions, represents the single most important integration point. Payment processing runs through regional gateways (MonriPay, AllSecure) rather than local banks. The presence of 7,290 Russian entrepreneurs creates niche demand, though no service offers Russian-language API documentation. Most international platform APIs (Wolt, Glovo, Monri) document in English; government systems provide Serbian with partial English translations.

### Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| KupujemProdajem | #1 classifieds (~4M monthly) | No Public API | N/A | N/A | ~4M monthly users | High (strategic) | 80–120 | Unofficial scraping libs exist; Kupindo sister site had OAuth2 REST API (possibly dormant) |
| Limundo | Auction marketplace | Partner/Legacy | developers.kupindo.com | OAuth2 | ~500K users | Med | 60–80 | Kupindo API covers Limundo; may be inactive |
| eKupi | Electronics e-commerce | No Public API | N/A | N/A | Mid-tier | Low | N/A | Standard retail site |
| Gigatron | Electronics retailer (69+ stores) | No Public API | N/A | N/A | $204M revenue | Low | N/A | No developer resources |
| Tehnomanija | Electronics/appliances (70+ stores) | No Public API | N/A | N/A | 70+ stores | Low | N/A | No developer resources |

### Food delivery

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| Wolt | Food delivery (DoorDash subsidiary) | **Confirmed Public** | developer.wolt.com | OAuth2/JWT + Basic | Major Serbian cities | **High** | 40–60 | Order, Menu, Drive APIs; sandbox; webhooks; English docs |
| Glovo | Food/grocery delivery | **Confirmed Partner** | api-docs.glovoapp.com/partners/ | Token/API Key | Significant presence | **High** | 40–60 | Order, Stock & Price, LaaS APIs; staging env; 120 calls/min/store; English |
| Donesi | Local food delivery | No Public API | N/A | N/A | Declining share | Low | N/A | Losing to Wolt/Glovo |

### Finance and payments

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| MonriPay | Regional payment gateway | **Confirmed Public** | docs.monri.com | SHA512 digest + Token | Regional processor | **High** | 30–50 | REST; sandbox at ipgtest.monri.com; SDKs for iOS/Android; WooCommerce/Magento plugins; EUR/BAM/RSD |
| AllSecure | Payment gateway (20+ years) | **Confirmed Public** | allsecure.rs/en/developers/api/ | Custom | Long-established | **High** | 40–60 | PCI DSS compliant; developer portal confirmed |
| PaySpot | E-money institution | Partner/Custom | N/A | Custom | 1,700+ agents | Med | 60–80 | 150+ employees; integrates KoronaPay (Russian transfers); no public docs |
| Banca Intesa RS | Largest bank | No Public API | N/A | N/A | 147 branches | Low | N/A | No PSD2 = no open banking |
| Komercijalna Banka | Major bank (NLB Group) | No Public API | N/A | N/A | 1M+ customers | Low | N/A | — |
| OTP Banka RS | Major bank | No Public API | N/A | N/A | 155 branches, 294 ATMs | Low | N/A | — |
| Raiffeisen RS | Major bank | No Public API | N/A | N/A | Significant | Low | N/A | Has SEF e-Fakture integration in eBanka |

### Logistics and delivery

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| DExpress | Leading private courier | Partner/Undocumented | N/A (AfterShip integration) | N/A | 300+ parcel lockers, 80 cities | High | 60–80 | WooCommerce/Magento plugins exist; API behind partner access |
| Post Express | State postal express | No Documented API | N/A | N/A | 1,500+ offices | Med | 80–100 | Third-party trackers have integrated |
| City Express | Courier | Partner API | N/A (MetaKocka integration) | N/A | Serbian courier | Med | 60–80 | MetaKocka ERP confirms API exists |
| BEX | Courier | Unknown | N/A | N/A | Serbian courier | Low | N/A | Basic web tracking only |
| Pošta Srbije | National postal | No Documented API | N/A | N/A | Universal coverage | Med | 80–100 | SAP-based backend |

### Business software and compliance

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| **SEF / eFaktura** | **MANDATORY e-invoicing** | **Confirmed Public** | efaktura.gov.rs + Swagger at efaktura.mfin.gov.rs/swagger/ | API Key | **ALL Serbian businesses** | **CRITICAL** | 40–80 | REST + UBL 2.1 XML; demo env; English spec available; webhook notifications; **legally mandatory since Jan 2023** |
| Minimax | Cloud accounting SaaS | **Confirmed Public** | moj.minimax.si/si/api | OAuth/API Key | Balkan SMBs | **High** | 30–50 | 30+ REST endpoints (invoices, contacts, stock, payroll); 1,000 calls/day limit |
| Pantheon (Datalab) | ERP (dominant in ex-Yugoslavia) | Partner/DEV Program | usersite.datalab.eu | API Keys + DB | Thousands across 7 countries | **High** | 60–100 | DEV Partner Program; ARES RAD; MsSQL stored procedures; Shopware plugin |

### HR, telecom, government, and verticals

| Company | What it does | API Status | MCP Priority | Notes |
|---|---|---|---|---|
| Infostud / Poslovi.rs | #1 job portal (3.2M visitors/mo) | No Public API | Med | ALMA Career Group (Monster.com network) |
| HelloWorld.rs | #1 IT jobs (650K visits/mo) | No Public API | Med | Owned by Infostud |
| MTS / A1 / Yettel | Mobile operators | No Direct APIs | Low | SMS only via third-party gateways |
| eUprava | E-government (2.5M users) | No API | Med | No developer documentation |
| APR | Business registry | Data on Request | Med | CSV/MDB via email with fees; no REST API |
| Nekretnine.rs / 4zida.rs | Real estate portals | No Public API | Med | Largest RE databases |
| Bolt Serbia | Ride-hailing | Partner/Limited | Med | developer.bolt.eu exists; limited access |
| CarGo | Local ride-hailing | No Public API | Low | Belgrade-only |

### Top 10 MCP candidates for Serbia

1. **SEF / eFaktura** — CRITICAL. Mandatory for every Serbian business. REST API with UBL 2.1 XML, API key auth, demo sandbox, English spec. ~400,000+ affected entities. **40–80 dev hours.**
2. **Wolt** — Excellent REST API with Order/Menu/Drive endpoints, OAuth2, sandbox, webhooks. Dominant food delivery. **40–60 hours.**
3. **MonriPay** — Comprehensive payment gateway API, SHA512 auth, sandbox, multi-currency. Regional reach. **30–50 hours.**
4. **Minimax** — Cloud accounting with 30+ REST endpoints covering full SMB accounting lifecycle. **30–50 hours.**
5. **Glovo** — Partner API with order management, stock/price control, logistics-as-a-service. Staging env. **40–60 hours.**
6. **Pantheon ERP** — Most popular ERP across former Yugoslavia. DEV Partner Program with API access. **60–100 hours.**
7. **AllSecure** — Established payment gateway with developer portal. 20+ years in market. **40–60 hours.**
8. **KupujemProdajem** — 4M monthly users, highest strategic value despite no official API. Reverse-engineering feasible. **80–120 hours.**
9. **DExpress** — Leading courier with confirmed partner APIs. E-commerce integration critical. **60–80 hours.**
10. **Infostud/Poslovi.rs** — Job market monopoly (1M+ users). Partnership-dependent. **80–100 hours.**

---

## Egypt (EG)

### Market overview

Egypt's **106 million population and 96 million internet users** make it the largest digital economy among the three countries. Two mandatory compliance systems drive enormous API demand: the **ETA e-Invoice system** (mandatory since 2022 for all businesses) and expanding e-receipt requirements. The payment ecosystem is rich — **Paymob, Fawry (40M+ users), and Kashier** all offer well-documented REST APIs with English documentation and sandbox environments. Egyptian banks lack open banking APIs (no PSD2 equivalent), but payment aggregators compensate by wrapping mobile wallets (Vodafone Cash, Orange Cash) into unified APIs. The logistics sector is API-forward, led by **Bosta** with official SDKs in five languages. CPaaS platforms **Unifonic and CEQUENS** offer the most polished developer experiences in the entire region.

### E-commerce and food delivery

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| Jumia Egypt | Africa's largest marketplace | **Confirmed Public** | sellerapi.sellercenter.jumia.com | HMAC + API Key | ~$1B GMV Africa-wide | **High** | 60–80 | Full seller ops: products, orders, QC, finance. English. Also JumiaPay API |
| Amazon Egypt | Ex-Souq marketplace | **Confirmed Public** | developer-docs.amazon.com/sp-api | OAuth 2.0 + AWS IAM | Egypt Marketplace ID: ARBP9OOSHTCHU | **High** | 80–100 | Full SP-API; orders, inventory, listings, reports; mature SDK ecosystem |
| Noon Egypt | MENA marketplace | **Partner-Sandbox** | docs.noonpayments.com + noon.partners | OAuth 2.0 (JWT) | Major MENA, 32% CAGR | **High** | 60–80 | Catalog, orders, stock APIs; separate Noon Payments API; English |
| OLX Egypt | Classifieds | **Partner-Sandbox** | developer.olxgroup.com | OAuth 2.0 + API Key | Millions active | Med | 40–60 | OLX Group Developer Hub; Egypt access may need approval |
| Talabat | Food delivery (Delivery Hero) | **Confirmed Public** | developer.talabat.com | OAuth 2.0 → JWT | Dominant MENA food delivery | **High** | 60–80 | Catalog, orders, POS integration, webhooks; English |
| Elmenus | Food discovery/ordering | No Public API | N/A | N/A | Local market | Low | 40–60 | — |
| Rabbit | Quick commerce | No Public API | N/A | N/A | Startup | Low | N/A | — |
| Breadfast | Grocery delivery | No Public API | N/A | N/A | Startup | Low | N/A | — |

### Finance and payments — Egypt's strongest API category

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| **ETA e-Invoice** | **MANDATORY tax compliance** | **Confirmed Public** | sdk.invoicing.eta.gov.eg | OAuth 2.0 + X.509 eSeal cert | **ALL Egyptian businesses** | **CRITICAL** | 80–120 | **30+ REST endpoints** across eInvoicing + eReceipt; PreProd + SIT sandboxes; Postman collection; .NET NuGet + Docker toolkit; webhooks; English docs. Handles invoices, credit/debit notes, exports, receipts |
| **Paymob** | #1 payment gateway | **Confirmed Public** | developers.paymob.com | Secret Key + Public Key + HMAC | Dominant Egyptian gateway | **High** | 60–80 | Unified Intention API; cards, Vodafone Cash, Apple Pay, BNPL (ValU, Sympl, Halan); payouts to wallets/banks; 12+ e-commerce plugins; English |
| **Fawry** | Most-used payment platform | **Confirmed Public** | developer.fawrystaging.com | Merchant Code + SHA-256 signature | **40M+ users** | **High** | 50–70 | Card payments (3DS), e-wallet, PayAtFawry (250K+ retail points), bank installments, refunds, tokenization; staging sandbox; English |
| Kashier | Payment gateway | **Confirmed Public** | developers.kashier.io | API Key + MID + Secret Key | Growing | Med | 40–50 | Cards, wallets, installments, invoicing, subscriptions, marketplace splits; multi-currency; PCI DSS L1; English |
| PayTabs Egypt | Payment gateway | **Confirmed Public** | docs.paytabs.com | Profile ID + Server Key | Regional | Med | 40–50 | Egypt endpoint: secure-egypt.paytabs.com; hosted page, managed form, invoices, PayLinks; 8+ mobile SDKs |
| InstaPay | CBE digital payments | **No Public API** | N/A | N/A | Bank-level only | Low | N/A | Consumer app; bank-to-bank integration only; Paymob lists InstaPay "Coming Soon" |
| Vodafone Cash | Mobile wallet | **No Direct API** | N/A | N/A | Part of 16M+ wallet market | Low | N/A | Accessible through Paymob payouts (issuer: "vodafone") |
| MNT-Halan | Fintech unicorn / super app | **No Public API** | N/A | N/A | 8M+ users, $1B+ valuation | Low | N/A | BNPL accessible via Paymob; proprietary "Neuron" core banking (internal) |
| Khazna | Fintech (BNPL, salary advance) | No Public API | N/A | N/A | 150K+ users | Low | N/A | B2B employer integrations only |
| Sympl | BNPL | No Public API | N/A | N/A | Niche | Low | N/A | Merchant integration via Paymob POS |

**Egyptian banks** (CIB, NBE, Banque Misr, QNB Alahli) have **no open banking APIs**. Egypt lacks PSD2-equivalent legislation. All programmatic financial access routes through payment aggregators.

### Logistics

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| **Bosta** | Tech-forward courier | **Confirmed Public** | docs.bosta.co | API Key | Egypt + Saudi | **High** | 30–40 | **Best logistics API in region.** Create/track shipments, pickups, AWBs, cash collection, webhooks. Official SDKs: Node, Python, PHP, Java, Ruby. English |
| Aramex Egypt | International logistics | **Confirmed Public** | aramex.com/developers | SOAP/WSDL + account | Pan-MENA major | **High** | 60–80 | Shipping, tracking, rate calc, location services. **SOAP-based** (not REST). English. PDF manuals |
| Mylerz | E-commerce last-mile | Partner-Sandbox | N/A (via plugins) | API Key | Egypt-focused, $9.6M raised | Med | 40–60 | API confirmed via WordPress/Shopify plugins; no standalone docs |
| Egypt Post | National postal | Unknown | N/A | N/A | Government | Low | 60–80 | Basic web tracking only |

### Business software, HR, and communications

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| **Daftra** | Arabic cloud ERP/accounting | **Confirmed Public** | docs.daftara.dev + developers.daftra.com | API Key + OAuth 2.0 | Leading Arabic ERP | **High** | 40–60 | RESTful JSON; invoices, clients, products, inventory, accounting, employees; developer marketplace (70% rev share); **English + Arabic** |
| Odoo Egypt | Open-source ERP | **Confirmed Public** | odoo.com/documentation/19.0/developer/ | API Key (Bearer) | Global, strong Egypt presence | **High** | 40–60 | XML-RPC, JSON-RPC, JSON-2 REST; full model access; English |
| **Unifonic** | CPaaS (SMS, WhatsApp, Voice) | **Confirmed Public** | docs.unifonic.com | AppSid (API Key) | Major MENA CPaaS | **High** | 30–40 | REST API: SMS, voice, WhatsApp, push, OTP verification; multi-language SDKs; English |
| **CEQUENS** | CPaaS (Egypt HQ) | **Confirmed Public** | apis.cequens.com | Bearer Token (OAuth) | Egypt-based global CPaaS | **High** | 30–40 | SMS, voice, WhatsApp, Messenger, Apple Business Chat, MFA; SDKs in 7+ languages; English |
| Wuzzuf | #1 job portal | No Public API | N/A | N/A | Largest Egyptian jobs | Med | 60–80 | High value but no API |
| Vezeeta | Doctor booking (MENA) | Partner-Sandbox | settings.vezeeta.com (internal) | API Key likely | 5M+ users | Med | 60–80 | Internal API visible; B2B partner access |

### Transport and other verticals

| Company | What it does | API Status | MCP Priority | Notes |
|---|---|---|---|---|
| Uber Egypt | Ride-hailing | Confirmed Public (developer.uber.com) | Med | Global API, Egypt supported |
| Careem | Super app (Uber-owned) | Confirmed Public (developer.careem.com) | Med | API Guide + Deep Linking |
| SWVL | Mass transit (pivoted to B2B SaaS) | No Public API | Low | — |
| Aqarmap | Real estate (#1 Egypt) | No Public API | Low | Research portal at i.aqarmap.com |
| Vodafone Egypt | Mobile operator (43M subs) | Confirmed Public (developer.vodafone.com) | Med | Global CAMARA APIs; Egypt-specific verification needed |

### Top 10 MCP candidates for Egypt

1. **ETA e-Invoice** — CRITICAL. Mandatory for every Egyptian business. 30+ REST endpoints, OAuth + certificate signing, PreProd sandbox, English docs, Postman collection. **80–120 dev hours.** Highest business value — compliance automation.
2. **Paymob** — Egypt's dominant payment gateway. Covers cards, wallets, Apple Pay, BNPL. Official SDKs in 5 languages. **60–80 hours.**
3. **Fawry** — **40M+ users**, ubiquitous payment platform bridging online and offline (250K+ retail points). Well-documented REST API with staging sandbox. **50–70 hours.**
4. **Bosta** — Most developer-friendly logistics API in the region. 5 official SDKs, simple API key auth, webhooks. **30–40 hours** — fastest MCP win.
5. **Daftra** — Only major Arabic-first cloud ERP with public REST API and developer marketplace. Covers full SMB accounting. **40–60 hours.**
6. **Unifonic** — Full CPaaS with SMS, Voice, WhatsApp, Push, OTP. Clean REST API. **30–40 hours.**
7. **CEQUENS** — Egypt-HQ CPaaS competitor to Unifonic with broader channel coverage (Apple Business Chat, Messenger). **30–40 hours.**
8. **Talabat** — Dominant food delivery with full Partner API (catalog, orders, POS, webhooks). **60–80 hours.**
9. **Amazon Egypt (SP-API)** — Mature global API fully supporting Egypt marketplace. **80–100 hours** (large API surface).
10. **Jumia Egypt** — Pan-African marketplace with comprehensive seller API. **60–80 hours.**

---

## Algeria (DZ)

### Market overview

Algeria's 45 million people include roughly 30 million internet users, but **digital maturity is significantly lower** than Egypt or Serbia. Of 32 services investigated, only **5–6 have confirmed public APIs**. A critical finding: Algeria's most important consumer platforms — **Yassir (dominant superapp), BaridiMob (10M+ downloads), and Ouedkniss (17M+ monthly visitors) — all lack public developer APIs**. However, a remarkably capable **third-party developer ecosystem** has emerged: **Chargily Pay** wraps both payment networks into one API with SDKs in 10+ languages, **Dolivroo** aggregates all major couriers, and **Yalidine** provides the best-documented logistics API. Documentation is primarily in French, with Chargily notably offering English docs. Jumia exited Algeria in February 2026. **90% of e-commerce runs on cash-on-delivery**, making logistics APIs more immediately impactful than payment APIs.

### Commerce, food, and ride-hailing

| Company | What it does | API Status | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|
| Ouedkniss | #1 classifieds (17M+ monthly) | No Public API | Dominant marketplace | Med | 60–80 (scraping) | No developer portal; mobile app uses internal APIs; French/Arabic |
| Jumia Algeria | E-commerce | **EXITED Feb 2026** | N/A | ❌ | N/A | Ceased Algeria operations |
| Yassir | Dominant ride-hailing superapp | **No Public API** | 150K+ partners, 58 cities, $150M Series B | Med (pending) | N/A | Biggest tech company in Algeria with zero developer API. GitHub (YAtechnologies) has internal repos only |
| Heetch Algeria | Ride-hailing | No Public API | Competitor to Yassir | Low | N/A | — |
| Temtem | Local ride-hailing | No Public API | Small share | Low | N/A | — |
| Yassir Food / Jumia Food | Food delivery | No Public / Discontinued | N/A | Low | N/A | Jumia Food shut down globally Dec 2023 |

### Finance and payments — Chargily changes everything

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| **Chargily Pay** ★ | **#1 payment gateway** wrapping EDAHABIA + CIB | **Confirmed Public** | dev.chargily.com/pay-v2/introduction | API Key (Public + Secret), test/live modes | 2nd most used payment solution in Algeria | **CRITICAL** | 20–30 | **Best API in Algeria's ecosystem.** REST; webhooks; customers, products, prices, checkouts, payment links. SDKs: PHP/Laravel, Python/Django, JS/Node, Go, C#, Dart, Kotlin, Swift, NestJS, WordPress, Shopify, Odoo. English docs. Active community |
| SATIM | Interbank payment network | **Confirmed Partner** | satim.dz/payment/rest (prod), test.satim.dz (test) | Username + Password + Terminal ID | All Algerian banks | **High** | 40–60 | **GitHub POC exists** (zakblacki/Satim-Payment-Gateway-Integration). PHP package (PiteurStudio/satim-php). Registration via CIBWeb is slow (months). French docs |
| BaridiMob | Algérie Poste wallet (10M+ downloads) | **No Developer API** | N/A | N/A | 10M+ downloads (claimed 20M+) | Low (direct) | N/A | **Consumer app only.** EDAHABIA card payments route through SATIM/Chargily. No merchant API |
| Chargily Pro | Flexy/airtime recharge | **Confirmed Public** | GitHub: Chargily Pro SDK | API Key | All 46M+ mobile subs | Med | 15–20 | Mobile credit recharge for Mobilis/Djezzy/Ooredoo |
| Flexy | Digital top-up | Via Chargily Pro | — | — | Universal | Med | 15–20 | Covered by Chargily Pro |

**Algerian banks** (BNA, BEA, BADR, CPA and all 21 commercial banks) have **zero open banking APIs**. No open banking regulation exists. All financial integration routes through SATIM or Chargily.

### Logistics — surprisingly API-mature

| Company | What it does | API Status | API Docs URL | Auth | Users/Market | MCP Priority | Dev Hours | Notes |
|---|---|---|---|---|---|---|---|---|
| **Yalidine** | Major e-commerce courier | **Confirmed Public** | api.yalidine.app/v1/ | API_ID + API_TOKEN | Major logistics player, 58 wilayas | **CRITICAL** | 20–30 | Excellent REST API: CRUD parcels, delivery fees, centers, wilayas, communes. Community SDKs: Laravel, TypeScript/JS (npm), Python. WooCommerce plugin. French/English |
| **Dolivroo** ★ | **Unified delivery aggregator** | **Confirmed Public** | PHP SDK on Packagist; Node.js SDK | API Key | Aggregates Yalidine, ZR Express, Ecotrack, Maystro | **High** | 20–25 | Single API for ALL Algerian couriers. Rate comparison, bulk ops, label gen. Laravel-ready |
| Maystro Delivery | Growing courier (50 wilayas, 14 warehouses) | **Confirmed Partner** | backend.maystro-delivery.com/api | Bearer Token | Growing competitor | **High** | 25–35 | Order creation, tracking, webhooks; Shopify/WooCommerce/Odoo integrations |
| ZR Express | Courier (aka Procolis) | **Confirmed API** | Via CourierDZ package | ID + Token | E-commerce delivery | Med | 25–35 | Integrated in PiteurStudio/CourierDZ unified package |
| EMS Algérie | Express mail | No Direct API | TrackingMore third-party | N/A | International shipping | Low | 40+ | Third-party tracking only |
| Algérie Poste | National postal | No Developer API | N/A | N/A | 4,000+ offices | Low | N/A | — |

### Remaining categories

| Company | What it does | API Status | MCP Priority | Notes |
|---|---|---|---|---|
| Emploitic | #1 job portal | No Public API | Med | 655K+ Facebook; French-only; scraping or partnership |
| Mobilis / Djezzy / Ooredoo | Mobile operators (~15M subs each) | No Direct APIs | Low | SMS only via international gateways (Twilio, BudgetSMS) |
| PCCompta | Algerian accounting | No Public API | Low | Desktop-oriented |
| Air Algérie | National airline (71 destinations) | No Direct API (via Duffel/Amadeus) | Med | Accessible through GDS aggregators |
| Algérie Télécom | State telecom/cloud | No Public API | Low | Basic hosting only |
| CNRC / mesydz.gov.dz | Government services | No Public API | Low | No open data or developer portals |

### Top 10 MCP candidates for Algeria

1. **Chargily Pay** — CRITICAL. Only well-documented payment API in Algeria. Wraps both EDAHABIA and CIB. **10+ SDKs, English docs, webhooks, test mode.** 20–30 dev hours.
2. **Yalidine** — Excellent REST API for Algeria's dominant courier infrastructure. Community SDKs in 3+ languages. **20–30 hours.**
3. **Dolivroo** — Single API aggregating ALL major Algerian couriers with rate comparison. One MCP server for all logistics. **20–25 hours.**
4. **SATIM** — Direct interbank payment network access. GitHub POC already exists. Complex registration. **40–60 hours.**
5. **Maystro Delivery** — Growing courier with confirmed API, webhooks, and e-commerce platform integrations. **25–35 hours.**
6. **Chargily Pro** — Flexy/airtime recharge API for all 3 operators. High daily-use utility. **15–20 hours.**
7. **ZR Express** — Courier API via Procolis system and CourierDZ package. **25–35 hours.**
8. **Air Algérie (via Duffel)** — Flag carrier bookable through established travel APIs. **30–40 hours.**
9. **Ouedkniss** — 17M+ monthly visitors. Requires scraping or partnership — fragile but enormous value. **60–80 hours.**
10. **Emploitic** — Algeria's jobs market. Scraping-based approach possible. **50–60 hours.**

---

## No existing MCP servers found anywhere

A systematic GitHub search across all 38 key services and broader queries ("mcp server egypt," "mcp server serbia," "mcp server algeria," "mcp server arabic") returned **zero results**. This is a completely unserved market. However, rich **SDK ecosystems exist** that would dramatically accelerate MCP development:

- **Paymob**: Official SDKs in Python, Node.js, Java, PHP, Flutter
- **Bosta**: Official SDKs in Python, Node.js, Java, PHP, Ruby
- **Chargily Pay**: Community SDKs in PHP/Laravel, Python/Django, JS/Node, Go, C#, Dart/Flutter, Kotlin, Swift, NestJS + WordPress, Shopify, Odoo plugins — **the richest SDK ecosystem found in the entire research**
- **Fawry**: Unofficial libraries in Node.js, Ruby, Go
- **MonriPay**: Official iOS and Android SDKs
- **ETA e-Invoice**: .NET Core bridge project, Postman collection, SAP integration
- **SEF Serbia**: Community Python scripts, XML generators/validators
- **Nafezly/payments**: Laravel package wrapping Paymob, Fawry, Kashier, Vodafone Cash, Orange — excellent reference for Egypt MCP

---

## Mandatory compliance systems deserve the highest priority

The two government e-invoice systems represent the **highest-value MCP opportunities** across all three countries because they are **legally required** for every business, creating captive demand.

**Egypt ETA** offers a more mature developer experience: **30+ REST endpoints**, OAuth 2.0 authentication, multiple sandbox environments (PreProd + SIT), Postman collections, .NET NuGet packages, Docker toolkit, full English documentation, and webhook support. The main complexity is **digital certificate signing** — invoices require CAdES-BES signatures via X.509 eSeal certificates (hardware USB tokens), which means an MCP server would need to interface with a local signing service or cloud HSM. The system covers **3–5 million+ VAT-registered businesses** with penalties of EGP 20,000–100,000 for non-compliance.

**Serbia SEF** is simpler to integrate: **API key authentication** (no certificate signing for API calls), UBL 2.1 XML standard format (EU-aligned), demo sandbox at demoefaktura.mfin.gov.rs, and Swagger UI documentation. The trade-off is that documentation is **primarily in Serbian** with limited English translations, and UBL 2.1 XML generation is inherently complex with many optional fields. The system covers **400,000+ VAT-liable businesses** with steeper penalties (up to €17,000). Serbia's SEF is expanding to cover e-transport documents in 2026.

| Dimension | Egypt ETA | Serbia SEF |
|---|---|---|
| Endpoints | 30+ (eInvoice + eReceipt + Common) | ~10–15 core |
| Auth complexity | High (OAuth + X.509 certificates) | Low (API key) |
| Document format | ETA custom JSON/XML | UBL 2.1 XML (EU standard) |
| Sandbox | PreProd + SIT environments | Demo environment |
| Documentation language | English | Serbian (limited English) |
| Affected businesses | 3–5M+ | 400K+ |
| Development estimate | 120–180 hours | 60–100 hours |
| SDK/library support | .NET NuGet, Docker, Postman | Swagger UI, community scripts |

---

## Cross-country top 5 MCP opportunities

Ranking the single most impactful MCP servers to build across all three markets, weighted by addressable user base, API quality, development feasibility, and business value:

**1. Egypt ETA e-Invoice** — The largest mandatory compliance API in the research. Every Egyptian business must use it. **3–5 million+ captive users**, excellent English documentation, multiple sandboxes, and existing .NET libraries to reference. The digital signing complexity creates a defensible moat. Estimated **120–180 hours**. Revenue potential: highest of any service studied.

**2. Paymob (Egypt)** — Dominant Egyptian payment gateway with the broadest method coverage (cards, wallets, Apple Pay, BNPL, kiosk). Official SDKs in 5 languages. A Paymob MCP server would let AI assistants process payments, issue refunds, query transactions, and manage payouts across Egypt's entire payment landscape. **60–80 hours.**

**3. Serbia SEF/eFaktura** — Smaller market than Egypt ETA but simpler integration (API key vs. certificates) and steeper penalties drive urgent adoption. **400,000+ mandatory users** with the market expanding to e-transport in 2026. **60–100 hours.**

**4. Chargily Pay (Algeria)** — The *only* pathway to programmatic payments in Algeria, wrapping both EDAHABIA (Algérie Poste's 20M+ user base) and CIB (SATIM interbank). Outstanding developer experience with **10+ SDKs and English documentation** — anomalously good for Algeria's market. **20–30 hours** — the fastest high-impact build in the entire analysis.

**5. Bosta (Egypt)** — Egypt's most developer-friendly logistics API with official SDKs in 5 languages, simple API key auth, and webhook support. E-commerce fulfillment is a high-frequency MCP use case (create shipments, track deliveries, schedule pickups, manage cash collection). **30–40 hours** — the second-fastest build with immediate commercial applicability across Egypt's booming e-commerce sector.

### Honorable mentions

**Fawry** (Egypt, 40M+ users, **50–70 hours**) narrowly misses the top 5 due to higher integration complexity versus Paymob's broader coverage. **Yalidine** (Algeria, **20–30 hours**) is the fastest logistics build for a market where 90% of e-commerce is cash-on-delivery. **Daftra** (Egypt, **40–60 hours**) is the only Arabic-first cloud ERP with a public API and developer marketplace — uniquely positioned for the Arabic-speaking market. **Unifonic/CEQUENS** (Egypt, **30–40 hours** each) represent quick-win CPaaS integrations covering SMS, WhatsApp, and voice across MENA.

---

## Conclusion

The three markets present fundamentally different MCP opportunity profiles. **Egypt is the volume play** — 96 million internet users, a dozen confirmed public APIs, English documentation throughout, and a mandatory e-invoice system affecting millions of businesses. **Serbia is the compliance play** — a smaller but affluent market where the mandatory SEF system and mature payment/ERP APIs create dense, high-value automation opportunities for every business. **Algeria is the platform play** — a market where third-party developers (Chargily, Dolivroo, Yalidine) have built the API infrastructure that first-party platforms (Yassir, BaridiMob, Ouedkniss) have not, creating opportunity for whoever builds the MCP integration layer first.

The total estimated development investment for all top-5 cross-country MCP servers is **290–430 hours** — roughly 2–3 developer-months to unlock programmatic AI-assistant access across three countries with a combined **158 million population**, two mandatory government systems, and zero existing competition.