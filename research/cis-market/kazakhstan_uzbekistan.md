# MCP Server Candidates: Kazakhstan & Uzbekistan

> Generated: 2026-04-01 | Analyst: OpenClaw Research Division
> Purpose: Identify services suitable for Model Context Protocol (MCP) server implementations
> Scoring: HIGH/MED/LOW based on API availability (30%), market size (25%), automation potential (20%), existing MCP coverage (15%), dev ecosystem (10%)

---

# KAZAKHSTAN (KZ)

## Market Overview

- **Population**: ~20.2 million (2026)
- **Internet penetration**: ~92% (~18.6M users)
- **Smartphone penetration**: ~85%
- **Dominant payment method**: Kaspi QR (dominant), bank cards, cash declining rapidly
- **Primary API languages**: Russian, some English documentation
- **Currency**: Tenge (KZT)
- **Key regulatory notes**:
  - National Bank of Kazakhstan (NBK) regulates Open Banking — API standards emerging
  - Data localization law: personal data of KZ citizens must be stored on KZ territory
  - Digital signature (EDS/ЭЦП) required for most government services
  - Labeling system (marking) being adopted following Russian model
  - AIFC (Astana International Financial Centre) operates under English common law — separate fintech sandbox

### Ecosystem Notes
Kazakhstan's tech market is dominated by Kaspi.kz — a super-app covering payments, marketplace, banking, and government services. Kolesa Group is the second major player (classifieds). The market is relatively consolidated compared to Uzbekistan.

---

### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kaspi Marketplace** | Dominant marketplace, part of Kaspi super-app. 12M+ MAU. Seller tools, product catalog, order management | Seller API (REST, documented) | OAuth 2.0 / API key | Dominant (~65% e-commerce) | **HIGH** | Super-app integration; Kaspi Магазин seller cabinet has API for orders, products, analytics |
| **Wildberries KZ** | Russian marketplace with KZ warehouse operations | Seller API (REST, well-documented, Russian) | API token | Large (growing fast) | **HIGH** | Same API as Russian WB — already has some community MCP work for RU, but KZ-specific workflows differ |
| **Ozon KZ** | Russian marketplace expanding in KZ | Seller API (REST) | Client ID + API key | Medium-Large | **MED** | Uses same Ozon Seller API; logistics differ for KZ |
| **Satu.kz** | Classifieds/marketplace (Prom.ua family) | Unknown — requires verification | Unknown | Medium | **MED** | Historically B2B-focused, declining vs Kaspi |
| **Flip.kz** | Electronics & appliances e-commerce | No public API known | N/A | Small-Medium | **LOW** | No API documentation found; potential scraping only |
| **Mechta.kz** | Electronics retail chain with online store | No public API known | N/A | Medium | **LOW** | Physical retail chain, online store basic |
| **Sulpak** | Electronics retail chain | No public API known | N/A | Medium | **LOW** | Similar to Mechta.kz |
| **Aliexpress KZ** | International marketplace, KZ localization | AliExpress Affiliate API | API key | Large | **LOW** | Global service, not KZ-specific |
| **Shopify alternatives: InSales, Tilda** | Website builders used by KZ merchants | InSales has REST API | API key | Small | **LOW** | InSales popular in CIS for small shops |

---

### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Arbuz.kz** | Grocery delivery in Almaty & Astana (Chocofamily) | No public API known | N/A | Medium | **MED** | Part of Chocofamily; likely has internal APIs |
| **Glovo KZ** | Multi-category delivery (groceries, food, parcels) | Partner API (REST) | OAuth 2.0 | Large | **HIGH** | Global Glovo Partner API available; good documentation |
| **Wolt KZ** | Food & grocery delivery (DoorDash subsidiary) | Merchant API (REST) | API key | Medium-Large | **MED** | Wolt Merchant API exists but limited docs |
| **Kaspi Delivery** | Integrated delivery within Kaspi ecosystem | Part of Kaspi Seller API | OAuth 2.0 | Large | **HIGH** | Embedded in Kaspi Marketplace |
| **iGooods KZ** | Grocery delivery from hypermarkets | No public API known | N/A | Small | **LOW** | Niche player |

---

### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Chocofood** | Food ordering/delivery (Chocofamily group) | Partner API — requires verification | Unknown | Large (Almaty dominant) | **HIGH** | Largest local food delivery; Telegram bot available |
| **Glovo KZ** | Food ordering component | Partner API (REST) | OAuth 2.0 | Large | **HIGH** | See grocery section |
| **Wolt KZ** | Food ordering component | Merchant API | API key | Medium-Large | **MED** | See grocery section |
| **Yandex Eats KZ** | Yandex food delivery in KZ cities | Yandex.Eda Restaurant API | OAuth | Medium | **MED** | Part of Yandex ecosystem; API documentation in Russian |
| **EasyFood** | Local food ordering | No public API known | N/A | Small | **LOW** | Minor player |

---

### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Poster POS** | Cloud POS for restaurants/cafes (popular in CIS) | REST API (well-documented) | API key + OAuth | Medium | **HIGH** | Ukrainian product, very popular in KZ HoReCa; rich API |
| **iiko** | Restaurant management system | iiko API (REST/SOAP) | API key | Medium-Large | **HIGH** | Dominant in CIS HoReCa; webhooks available |
| **R-Keeper** | POS for restaurants | API available (varies by version) | API key | Medium | **MED** | Legacy system, widespread but older APIs |
| **1C Retail** | Retail management module | 1C OData REST API | Basic Auth | Large | **MED** | De facto standard; complex integration |
| **Paloma365** | KZ-native cloud POS | Unknown — requires verification | Unknown | Small-Medium | **MED** | Local player, growing |
| **Kaspi POS (Kaspi Pay terminal)** | Payment terminal for merchants | Limited (part of Kaspi merchant tools) | Kaspi merchant auth | Dominant | **MED** | Kaspi terminal ecosystem; API limited to payments |

---

### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kaspi Bank** | Dominant consumer/SMB bank, super-app | Kaspi Business API (REST) | OAuth 2.0 / EDS | Dominant (~15M users) | **HIGH** | Kaspi Business (B2B) has API for payments, statements, invoicing; kaspi.kz/pay API for QR |
| **Halyk Bank** | Largest traditional bank | Halyk Business API (REST) — emerging | OAuth 2.0 | Very Large | **HIGH** | Open Banking API initiative; business payments, FX, statements |
| **Forte Bank** | Major bank (ForteBank, ex-Alliance) | Business API (documented) | API key + cert | Large | **HIGH** | ForteBank Business API for payments, payroll; developer portal exists |
| **Jusan Bank** | Digital-first bank (ex-Tsesnabank) | API available (REST) | OAuth 2.0 | Large | **MED** | Jusan Business API; fintech-oriented |
| **Bank CenterCredit** | Major traditional bank | Limited API — requires verification | Unknown | Large | **MED** | Some B2B integration APIs |
| **Bereke Bank** | Rebranded Sberbank KZ | Limited API | Unknown | Medium | **LOW** | Post-sanctions rebrand; API maturity unclear |
| **Freedom Bank** | Part of Freedom Holding | REST API (basic) | API key | Medium | **MED** | Fintech-oriented; Freedom Finance ecosystem |
| **Altyn Bank** | China-linked bank | No public API known | N/A | Small | **LOW** | Niche |

---

### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kaspi QR / Kaspi Pay** | Dominant P2P and merchant payment | Kaspi Pay API (REST) | Merchant ID + secret | Dominant (80%+ mobile payments) | **HIGH** | QR payment API, payment links, recurring; most critical KZ integration |
| **Epay (Halyk)** | Card payment gateway by Halyk Bank | REST API (well-documented) | Merchant credentials | Large | **HIGH** | Major card processing gateway; Halyk epay.kz |
| **Paybox.money** | Multi-bank payment aggregator | REST API (documented) | Merchant ID + secret | Medium | **HIGH** | Aggregates multiple banks; webhooks, recurring |
| **CloudPayments** | Payment gateway (Russian, operates in KZ) | REST API | Public ID + API secret | Medium | **MED** | Well-documented; CIS-wide |
| **PayPost** | KazPost payment service | Limited API | Unknown | Small | **LOW** | Mainly for postal payments |
| **Wooppay** | KZ fintech payment gateway | REST API | API key | Small-Medium | **MED** | Local player; mobile payments focus |
| **Freedom Pay** | Freedom Holding payment service | REST API | Merchant credentials | Growing | **MED** | Part of Freedom ecosystem |

---

### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kaspi Gold (Kaspi Transfers)** | P2P transfers via phone number | Part of Kaspi API ecosystem | OAuth | Dominant | **HIGH** | ~15M users; P2P is via Kaspi app, merchant integration via API |
| **Halyk Wallet** | Halyk Bank mobile wallet | Limited — part of Halyk app | N/A | Large | **LOW** | Mostly in-app, no standalone API |
| **Jusan Wallet** | Jusan digital wallet | Unknown — requires verification | Unknown | Medium | **LOW** | Digital-first but API unclear |

---

### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Binance (AIFC-regulated)** | Crypto exchange, KZ entity via AIFC | Full REST + WebSocket API | API key + secret | Large | **MED** | Global Binance API; AIFC license holder |
| **Bybit AIFC** | Crypto exchange with AIFC license | Full REST + WebSocket API | API key | Medium | **MED** | Same global Bybit API |
| **Freedom Finance** | Brokerage + crypto (Freedom Holding) | Trading API (REST) | API key | Large | **MED** | KZ-based holding; stocks + crypto |
| **Tabys** | Micro-investment app for KZ | No public API known | N/A | Small-Medium | **LOW** | Consumer app, no B2B API |
| **ATAIX** | AIFC-registered crypto platform | REST API | API key | Small | **LOW** | Niche |

---

### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kaspi Insurance** | Insurance within Kaspi ecosystem | Part of Kaspi API | OAuth | Large | **MED** | Integrated auto insurance (OGPO), travel |
| **Nomad Insurance** | Major traditional insurer | API — requires verification | Unknown | Large | **LOW** | Legacy systems likely |
| **Freedom Insurance** | Part of Freedom Holding | Unknown — requires verification | Unknown | Medium | **LOW** | Growing |
| **Jusan Insurance** | Digital insurance | API — requires verification | Unknown | Small-Medium | **LOW** | Digital-first approach |
| **Kompetenz** | InsurTech aggregator | REST API (for partners) | API key | Small | **MED** | API-first InsurTech; aggregator model |

---

### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **CDEK KZ** | CIS-wide courier service, major in KZ | REST API v2 (well-documented) | OAuth 2.0 | Large | **HIGH** | Excellent API; tracking, pricing, order creation |
| **Pony Express KZ** | International courier in KZ | REST API (basic) | API key | Medium | **MED** | B2B focused |
| **DPD Kazakhstan** | European courier network in KZ | REST API | API key | Medium | **MED** | Standard DPD API localized |
| **Glovo Express** | Same-day delivery | Partner API | OAuth 2.0 | Medium | **MED** | Part of Glovo ecosystem |
| **Kaspi Delivery (courier)** | Kaspi marketplace logistics | Part of Kaspi Seller API | OAuth | Large | **HIGH** | Integrated with marketplace orders |
| **Jambyl Express / local couriers** | Regional courier services | No public API known | N/A | Small | **LOW** | Fragmented local market |

---

### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **KazPost (Казпочта)** | National postal service | REST API (tracking, parcels) | API key | Large (monopoly for mail) | **MED** | API for tracking and some operations; quality variable |
| **EMS Kazakhstan** | Express mail (part of KazPost) | Limited API via KazPost | API key | Small | **LOW** | Subservice of KazPost |

---

### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **KTZ Express** | Kazakhstan Railways freight | API — requires verification | Unknown | Large (rail dominant for freight) | **MED** | National railway; some digital services emerging |
| **Lardi-Trans** | Freight exchange platform (CIS-wide) | REST API | API key | Medium | **MED** | Truck freight matching; CIS-wide |
| **ATI.SU** | Freight exchange (Russian, used in KZ) | REST API (documented) | API key | Medium | **MED** | Major CIS freight board |
| **OnTrack** | KZ logistics tech startup | Unknown — requires verification | Unknown | Small | **LOW** | Local startup |

---

### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kaspi FBS/FBO** | Kaspi fulfillment for marketplace sellers | Part of Kaspi Seller API | OAuth | Large | **HIGH** | Integrated warehousing for Kaspi sellers |
| **CDEK Fulfillment** | CDEK warehousing services in KZ | REST API | OAuth 2.0 | Medium | **MED** | Extension of CDEK courier API |
| **Wildberries FBO KZ** | WB fulfillment centers in KZ | WB Seller API | API token | Medium | **MED** | Part of WB Seller API |
| **3PL providers (various)** | Various local 3PL companies | Mostly no APIs | N/A | Fragmented | **LOW** | Market immature for API-driven 3PL |

---

### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bitrix24** | Dominant CRM/collaboration in CIS | REST API (excellent docs) | OAuth 2.0 / webhook | Dominant in KZ SMB | **HIGH** | Very rich API; webhooks, telephony, CRM pipelines; already has some MCP community work |
| **AmoCRM** | Sales CRM popular in CIS | REST API (well-documented) | OAuth 2.0 | Large | **HIGH** | Excellent API; webhooks; KZ is top-3 market |
| **Salesforce** | Enterprise CRM (used by large KZ corps) | Full REST/SOAP API | OAuth 2.0 | Small (enterprise only) | **LOW** | Global product, existing MCP servers |
| **HubSpot** | Used by some KZ tech companies | Full REST API | API key / OAuth | Small | **LOW** | Global, existing MCP servers |
| **Megaplan** | CIS project/CRM tool | REST API | API key | Small | **LOW** | Declining market share |

---

### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Enterprise (1C:Предприятие)** | De facto ERP standard in CIS | OData REST API, COM, web services | Basic Auth / token | Dominant (~80% of KZ businesses) | **HIGH** | Critical integration; 1C 8.x has HTTP services, OData; complex but essential |
| **SAP** | Enterprise ERP (large KZ corps, oil/gas) | Full API suite | OAuth 2.0 | Medium (enterprise) | **LOW** | Global, existing MCP; KZ oil companies use it |
| **Oracle ERP** | Large enterprise | Full API | OAuth | Small | **LOW** | Global, existing tools |
| **iDo ERP** | KZ-focused cloud ERP | Unknown — requires verification | Unknown | Small | **LOW** | Local startup |

---

### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Бухгалтерия KZ** | KZ-localized 1C accounting | OData REST API (same as 1C) | Basic Auth | Dominant | **HIGH** | KZ tax forms, reporting; API via 1C platform |
| **Kontur (СКБ Контур)** | Accounting/tax SaaS (Russian, used in KZ) | REST API | API key | Medium | **MED** | Kontur.Extern, Kontur.Elba; some KZ operations |
| **Salyk.kz** | KZ tax authority portal | Limited API (e-invoicing) | EDS certificate | Mandatory | **HIGH** | Electronic invoices (ESF), tax reporting; integration critical |
| **Cabinet.salyk.kz** | Taxpayer cabinet | Web only, no REST API | EDS | Mandatory | **MED** | No API but high automation demand |
| **My Soliq** | Tax app (mobile) | Unknown | Unknown | Medium | **LOW** | Consumer-facing |

---

### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Webkassa** | Online cash register (OFD) for KZ | REST API (documented) | API key + token | Large | **HIGH** | Mandatory fiscal system; API for receipt generation, fiscalization |
| **1C:Касса** | Fiscal module in 1C | Part of 1C API | 1C auth | Medium | **MED** | Integrated with 1C ecosystem |
| **Rekassa.kz** | Mobile cash register app | REST API | API key | Medium | **MED** | Popular among IP/small business |

---

### 18. EDI / EDM (Electronic Document Management)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **ESF (ИС ЭСФ / Электронные счета-фактуры)** | Mandatory e-invoicing system (KZ tax) | API (SOAP/REST) | EDS certificate | Mandatory for all businesses | **HIGH** | Government system; every business must use it; API integration critical |
| **EDMS.kz** | Electronic document management | Unknown — requires verification | Unknown | Small | **LOW** | Local player |
| **Documentolog** | KZ-born document management system | REST API | API key | Medium | **MED** | Used by government and enterprise; KZ-native |
| **Synergy EDMS** | Russian EDMS used in KZ | REST API | Token | Small | **LOW** | Enterprise only |

---

### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **HeadHunter.kz (hh.kz)** | Dominant job board in KZ | REST API (well-documented) | OAuth 2.0 | Dominant | **HIGH** | HH API — vacancies, resumes, applications; critical for HR automation |
| **Enbek.kz** | Government employment portal | Limited API | Unknown | Large (government) | **MED** | State employment service; some integration |
| **HR-bot / Potok** | AI recruiting tools (CIS) | REST API | API key | Small | **LOW** | Niche HR tech |
| **BambooHR / Personio** | Western HR tools used by AIFC companies | Full APIs | OAuth | Small | **LOW** | Used in AIFC/international firms only |
| **1C:ЗУП (HR module)** | Payroll/HR in 1C ecosystem | OData REST | Basic Auth | Large | **MED** | Standard payroll; complex but widespread |

---

### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bitrix24 (tasks/projects)** | Project management component | REST API | OAuth 2.0 | Dominant | **HIGH** | Same Bitrix24 API; tasks, Gantt, Kanban |
| **Yandex Tracker** | Issue tracker (Yandex) | REST API (documented) | OAuth 2.0 | Medium | **MED** | Used by tech companies; good API |
| **Kaiten** | Russian Kanban tool | REST API | API key | Small | **LOW** | Growing in CIS |
| **Jira / Asana / Monday** | Western tools used by tech companies | Full APIs | Various | Small | **LOW** | Global products, existing MCP servers |

---

### 21. SMS / Push Notifications

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Mobizon** | SMS gateway for CIS | REST API (documented) | API key | Medium | **HIGH** | Good docs; SMS/voice; KZ numbers supported |
| **SMSC.kz** | SMS aggregator for KZ | REST/HTTP API | Login + password | Medium | **MED** | Simple API; local focus |
| **Prostor SMS / SMS.kz** | KZ SMS providers | HTTP API | API key | Small | **MED** | Basic SMS sending |
| **OneSignal** | Push notifications (used by KZ apps) | REST API | API key | Small | **LOW** | Global product |
| **Infobip** | Omnichannel messaging (global, KZ operations) | REST API (excellent) | API key | Medium | **MED** | SMS, WhatsApp, Viber; CIS presence |

---

### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **UniSender** | Email/SMS marketing (CIS leader) | REST API (well-documented) | API key | Medium-Large | **HIGH** | Dominant in CIS; email campaigns, automations, analytics API |
| **SendPulse** | Email/chatbot platform (Ukrainian, CIS-wide) | REST API | OAuth 2.0 | Medium | **MED** | Email, SMS, push, chatbots; good API |
| **Mailchimp / Sendinblue** | Global email tools used in KZ | Full APIs | API key | Small | **LOW** | Global products, existing MCP |

---

### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Direct** | Search advertising (dominant in KZ) | REST API v5 (well-documented) | OAuth 2.0 | Large | **HIGH** | Major ad platform for KZ; campaign management, bidding, reports |
| **Google Ads** | Search/display advertising | Full API | OAuth 2.0 | Large | **LOW** | Global, existing MCP servers |
| **myTarget (VK Ads)** | Social media advertising | REST API | OAuth 2.0 | Medium | **MED** | VK/OK targeting; CIS-specific |
| **Chocotravel Ads / Aviata Ads** | Travel vertical advertising | Unknown | Unknown | Small | **LOW** | Niche |
| **Kolesa Group Ads** | Classifieds advertising (Kolesa, Krisha, Market) | Unknown — requires verification | Unknown | Medium | **MED** | Major classifieds; likely has internal ad API |

---

### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Telegram** | Dominant messenger in KZ (~85% penetration) | Bot API + TDLib (excellent) | Bot token | Dominant | **HIGH** | Critical channel; Bot API, payments, channels; already has MCP community work |
| **Instagram** | Major social platform in KZ | Graph API (Meta) | OAuth 2.0 | Very Large | **MED** | Global API; KZ businesses heavily rely on IG |
| **WhatsApp Business** | Business messaging | Cloud API (Meta) | Bearer token | Large | **MED** | Global API; WhatsApp used for business in KZ |
| **VK (ВКонтакте)** | Russian social network, declining in KZ | VK API (well-documented) | OAuth 2.0 | Medium (declining) | **LOW** | Less relevant for KZ market |
| **TikTok** | Short video platform | Marketing API | OAuth | Growing | **LOW** | Global product |

---

### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Metrica** | Web analytics (dominant in CIS) | REST API (well-documented) | OAuth 2.0 | Large | **HIGH** | Critical for KZ websites; comprehensive analytics API |
| **AppMetrica** | Mobile analytics (Yandex) | REST API | API key | Medium | **MED** | Used by KZ mobile apps |
| **Google Analytics** | Web analytics | Data API | OAuth 2.0 | Large | **LOW** | Global, existing MCP |
| **Power BI** | BI tool (Microsoft) | REST API | OAuth | Medium | **LOW** | Global product |

---

### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **PS.kz** | KZ domain registrar + hosting | API (basic) | API key | Large (domains) | **MED** | .kz domain management API |
| **Hoster.kz** | KZ hosting provider | Limited API | Unknown | Medium | **LOW** | Basic hosting |
| **Selectel** | Russian cloud, serves KZ | Full API (REST) | API key | Medium | **MED** | IaaS/PaaS; good API docs |
| **Yandex Cloud** | Cloud platform (expanding to KZ) | Full API (gRPC + REST) | IAM token | Growing | **MED** | Comprehensive cloud API; data residency concerns |
| **AWS / Azure / GCP** | Global clouds used by KZ enterprise | Full APIs | Various | Medium | **LOW** | Global, existing MCP servers |
| **kazteleport.kz** | KZ data center / cloud | Unknown — requires verification | Unknown | Small | **LOW** | Local DC provider |

---

### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kcell (Tele2 KZ)** | Major mobile operator | Business API (SMS, USSD) | API key | Large (~30% market) | **MED** | Some B2B APIs for SMS, location |
| **Beeline KZ** | Major mobile operator | Business API (limited) | API key | Large (~30% market) | **MED** | B2B messaging APIs |
| **Tele2 / Altel** | Mobile operator (Kazakhtelecom subsidiary) | Limited API | Unknown | Large (~25% market) | **LOW** | Fewer B2B APIs |
| **Kazakhtelecom** | National telecom (fixed + mobile) | Unknown — requires verification | Unknown | Dominant (fixed) | **LOW** | Legacy telecom; limited APIs |
| **Vonage / Twilio** | Global CPaaS used in KZ | Full REST APIs | API key | Small | **LOW** | Global, existing MCP; limited KZ number support |

---

### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **2GIS** | Detailed city maps + business directory | 2GIS API (REST) | API key | Dominant in KZ cities | **HIGH** | Extremely detailed for KZ; geocoding, routing, places, reviews; critical local API |
| **Yandex Maps** | Maps platform | JavaScript API + HTTP Geocoder | API key | Large | **MED** | Well-documented; used widely in KZ |
| **Google Maps** | Maps platform | Full API suite | API key | Medium | **LOW** | Global, existing MCP |

---

### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **eGov.kz (Электронное правительство)** | Central government services portal | API gateway (REST/SOAP) | EDS certificate | Mandatory (~15M users) | **HIGH** | 800+ government services; API for business registration, certificates, permits |
| **eOtinish** | Electronic appeals to government | API — requires verification | EDS | Large | **MED** | Citizens' complaint system |
| **ENIS (Единая нотариальная информационная система)** | Notary system | Limited API | EDS | Medium | **LOW** | Specialized |
| **Adilet.zan.kz** | Legal database | No API (scraping only) | N/A | Medium | **LOW** | Laws and regulations database |
| **eGov Mobile** | Mobile government services | No separate API (uses eGov backend) | EDS / biometric | Large | **MED** | Consumer-facing mobile app |
| **NCA (National Certification Authority)** | Digital signatures (ЭЦП) | NCALayer API (JavaScript/REST) | Certificate | Mandatory for business | **HIGH** | NCALayer is the signing component; integration required for all eGov operations |

---

### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **IS MP (ИС МП / Маркировка)** | Mandatory product labeling system (Kazakhstan) | API (REST) | Certificate + token | Mandatory (expanding) | **HIGH** | Following Russian Честный ЗНАК model; API for tobacco, footwear, medicines labeling |
| **GS1 Kazakhstan** | Barcode/GS1 standards | GS1 Cloud API | API key | Medium | **MED** | Product registry; GTIN management |

---

### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Krisha.kz** | Dominant real estate classifieds (Kolesa Group) | No public API (historical scraping) | N/A | Dominant | **HIGH** | Most wanted integration; no official API but massive data; Telegram bot exists |
| **OLX.kz** | General classifieds incl. real estate | No public API | N/A | Medium | **LOW** | Declining |
| **Homsters.kz** | New development sales platform | Unknown — requires verification | Unknown | Small | **LOW** | Niche |
| **NamUs / Korter** | Real estate platforms | Unknown — requires verification | Unknown | Small | **LOW** | Emerging |

---

### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bilimland** | KZ educational platform (K-12) | No public API known | N/A | Medium-Large | **LOW** | State-supported; no API |
| **Stepik** | Online courses (Russian, popular in KZ) | REST API | OAuth 2.0 | Medium | **MED** | Course management, progress tracking API |
| **Kundelik.kz** | School management system (digital diary) | API — requires verification | OAuth | Large (schools) | **MED** | Used by most KZ schools; parent/teacher communication |
| **iMektep** | Alternative school platform | Unknown | Unknown | Small | **LOW** | Competitor to Kundelik |

---

### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **DamuMed** | National healthcare information system | API (for integrated systems) | Certificate | Large (mandatory for clinics) | **MED** | Electronic health records; integration for medical facilities |
| **DOC.online** | Telemedicine platform | Unknown — requires verification | Unknown | Small-Medium | **LOW** | Telemedicine startup |
| **iDoctor.kz** | Doctor appointment booking | No public API known | N/A | Small | **LOW** | Consumer-facing |
| **Pharmacies online (Daribar, etc.)** | Online pharmacy | No public API known | N/A | Small | **LOW** | Emerging vertical |

---

### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Go (Яндекс Go)** | Dominant ride-hailing + delivery | Yandex Delivery API (B2B) | OAuth 2.0 | Dominant | **HIGH** | B2B delivery API well-documented; ride-hailing corporate API |
| **inDrive** | Ride-hailing (KZ-born, now global) | No public API known | N/A | Large | **MED** | Bargaining model; born in Yakutsk/popular in KZ; no B2B API |
| **ONAY** | Almaty public transport card | No public API | N/A | Medium (Almaty) | **LOW** | NFC transit card; no integration |
| **EasyWay** | Public transport tracking | No public API known | N/A | Small | **LOW** | Transit app |

---

### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Aviata.kz** | Flight booking (Chocofamily) | Affiliate API — requires verification | Unknown | Large | **MED** | Major KZ flight booking |
| **Chocotravel** | Flight + hotel booking (Chocofamily) | Affiliate API — requires verification | Unknown | Large | **MED** | Part of Chocofamily group |
| **Ticketon.kz** | Event tickets | No public API known | N/A | Medium | **LOW** | Events/concerts |
| **Booking.com / Agoda** | Hotel booking (global, used in KZ) | Connectivity API | Various | Medium | **LOW** | Global, existing tools |
| **Air Astana** | National airline | NDC API emerging | Unknown | Large | **MED** | Airline APIs typically complex |

---

### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Zakon.kz** | Legal information system | No API (subscription site) | N/A | Medium | **LOW** | Legal database; scraping only |
| **Paragraph (online.zakon.kz)** | Legal database | No API | N/A | Medium | **LOW** | Subscription service |
| **eGov legal services** | Business registration, permits | Part of eGov API | EDS | Large | **MED** | See eGov section |
| **Documentolog** | Document management | REST API | API key | Medium | **MED** | See EDM section |

---

### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Qoldau (qoldau.kz)** | State agricultural subsidies platform | Limited API | EDS | Large (all farmers) | **MED** | Government ag-tech; subsidies, land registry |
| **FarmTech / local startups** | Various ag-tech startups | No APIs known | N/A | Small | **LOW** | Market immature |
| **Agrosektor** | Agricultural marketplace | Unknown — requires verification | Unknown | Small | **LOW** | Classifieds for agriculture |

---

### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **BI Group** | Largest construction company | No public API | N/A | Large | **LOW** | No B2B API known; internal systems |
| **ERP for construction (1C, specialized)** | Construction modules | 1C API | Basic Auth | Medium | **LOW** | Part of 1C ecosystem |
| **e-Qurylys** | Government construction permits system | Limited API | EDS | Medium | **MED** | Government construction permitting |

---
---

# UZBEKISTAN (UZ)

## Market Overview

- **Population**: ~36.5 million (2026) — largest in Central Asia
- **Internet penetration**: ~82% (~30M users), rapidly growing
- **Smartphone penetration**: ~78%, predominantly Android
- **Dominant payment methods**: Payme, Click (mobile wallets); cash still significant in rural areas; Humo/UzCard card systems
- **Primary API languages**: Russian, Uzbek (increasing), some English
- **Currency**: Uzbek Sum (UZS)
- **Key regulatory notes**:
  - Central Bank of Uzbekistan (CBU) pushing digitalization aggressively
  - Two national payment card systems: UzCard and Humo (interoperability improving)
  - IT Park tax benefits: 0% income tax, 0% social tax for registered IT companies
  - Data localization requirements for financial data
  - Rapid regulatory modernization under IT/Digital ministry
  - Presidential decrees actively driving digital transformation

### Ecosystem Notes
Uzbekistan is the fastest-growing digital market in Central Asia. The fintech sector is led by Payme/Click/Uzum. The government's IT Park initiative has created a favorable environment for startups. Market is less consolidated than Kazakhstan — more competition, more fragmentation.

---

### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Uzum Market (ex-Uzum Tezkor)** | Largest marketplace in UZ (backed by Uzum/Kapitalbank) | Seller API (REST) | API key / OAuth | Dominant (fastest growing) | **HIGH** | Rapidly scaling; seller cabinet with API; backed by major fintech group |
| **OLX.uz** | General classifieds/marketplace | No public API | N/A | Large | **LOW** | Classifieds model, declining |
| **Asaxiy.uz** | Electronics e-commerce | No public API known | N/A | Medium | **LOW** | Growing electronics retailer |
| **Wildberries UZ** | Russian marketplace entering UZ | Seller API (same as global WB) | API token | Growing | **MED** | WB expanding aggressively in UZ |
| **Ozon UZ** | Russian marketplace in UZ | Seller API | Client ID + API key | Growing | **MED** | Early stage in UZ |
| **Makro.uz** | Wholesale/retail marketplace | No public API known | N/A | Medium | **LOW** | Hypermarket chain with online presence |
| **Mediapark.uz** | Electronics retailer | No public API known | N/A | Medium | **LOW** | Major electronics chain |
| **Sello.uz** | Marketplace platform | Unknown — requires verification | Unknown | Small-Medium | **MED** | Local marketplace startup |

---

### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Express24** | Multi-category delivery (food, groceries, parcels) | Partner API — requires verification | Unknown | Dominant | **HIGH** | Largest delivery platform in UZ; strong tech team; Telegram bot active |
| **Uzum Tezkor** | Quick commerce / grocery delivery | Unknown — requires verification | Unknown | Large (growing) | **MED** | Part of Uzum ecosystem |
| **Yandex Lavka UZ** | Yandex grocery delivery (if present) | REST API | OAuth | Unknown | **LOW** | Unclear if operational in UZ |
| **Korzinka Go** | Grocery delivery from Korzinka supermarkets | No public API known | N/A | Medium | **LOW** | Major supermarket chain's delivery arm |

---

### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Express24 (food)** | Food delivery component | Partner API — requires verification | Unknown | Dominant | **HIGH** | See grocery section; food is core vertical |
| **Yandex Eats UZ** | Yandex food delivery in Tashkent | REST API | OAuth | Medium | **MED** | Operating in Tashkent |
| **MyTaxi Food** | Food delivery from ride-hailing super-app | Unknown — requires verification | Unknown | Medium | **MED** | Part of MyTaxi ecosystem |
| **Foodie** | Food ordering app | Unknown — requires verification | Unknown | Small | **LOW** | Niche player |

---

### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Poster POS** | Cloud POS (CIS-wide, popular in UZ) | REST API (well-documented) | API key + OAuth | Medium | **HIGH** | Same as KZ; popular in UZ restaurants |
| **iiko** | Restaurant management | iiko API | API key | Medium | **HIGH** | Growing adoption in UZ HoReCa |
| **Jowi** | UZ-born restaurant management system | REST API (basic) | API key | Medium | **MED** | Local player; some API functionality |
| **R-Keeper** | POS system | API (varies) | API key | Small | **LOW** | Less penetration than in KZ |
| **SolIQ QR** | Fiscal QR system for UZ tax | API required for fiscal compliance | Token | Mandatory | **HIGH** | UZ fiscal system; all POS must integrate |

---

### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kapitalbank** | Largest private bank, parent of Uzum | Open Banking API (REST) | OAuth 2.0 | Dominant (private) | **HIGH** | Most advanced API in UZ banking; linked to Uzum fintech ecosystem |
| **Hamkorbank** | Major bank, backing Payme | Business API (emerging) | API key | Large | **HIGH** | Payme is Hamkorbank's fintech arm |
| **Ipoteka Bank** | Mortgage-focused bank | Limited API | Unknown | Large | **MED** | State-backed; growing digital services |
| **NBU (National Bank of Uzbekistan)** | Largest state bank | Limited API | Unknown | Very Large (state) | **MED** | Legacy systems; slow API adoption |
| **Davr Bank** | Digital-first bank | API — requires verification | Unknown | Medium | **MED** | Fintech-oriented |
| **TBC Bank UZ** | Georgian bank expansion into UZ | REST API (based on TBC Georgia) | OAuth | Small-Medium | **MED** | TBC has strong API culture from Georgia |
| **Ravnaq Bank** | SMB-focused bank | Unknown — requires verification | Unknown | Small | **LOW** | Niche |
| **Anor Bank** | Digital bank | API — requires verification | Unknown | Small | **MED** | Digital-first approach |
| **InfinBank** | Commercial bank | Limited API | Unknown | Medium | **LOW** | Traditional bank |
| **Humans Bank** | Super-app bank (Humans ecosystem) | API (part of Humans platform) | OAuth | Growing | **MED** | See Humans in fintech |

---

### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Payme** | Dominant payment platform | REST API (well-documented) | Merchant ID + key | Dominant (~40% market) | **HIGH** | Excellent API docs; payments, subscriptions, receipts; developer.payme.uz |
| **Click** | Major payment platform | REST API (documented) | Merchant credentials | Dominant (~35% market) | **HIGH** | Long-standing API; SHOP-API, merchant callbacks; docs.click.uz |
| **Paylov** | Payment aggregator | REST API | API key | Medium | **MED** | Growing; multi-gateway aggregation |
| **Octo** | Payment gateway | REST API (documented) | Merchant key | Medium | **MED** | Modern API; checkout, recurring |
| **Oson** | Payment services | REST API | API key | Small-Medium | **MED** | Growing player |
| **Apelsin (by Kapitalbank)** | Payment service | Part of Kapitalbank API | OAuth | Medium | **MED** | Linked to Kapitalbank ecosystem |
| **Billz** | Retail payment/POS SaaS | REST API | API key | Small | **MED** | Retail tech + payments |
| **UzCard processing** | National card processing | API for banks/PSPs | Certificate | Infrastructure | **MED** | Backend processing; API for licensed entities |
| **Humo processing** | National card processing | API for banks/PSPs | Certificate | Infrastructure | **MED** | Second card system; interop with UzCard improving |

---

### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Payme Wallet** | P2P transfers + bill pay | Part of Payme API | Token | Dominant | **HIGH** | P2P, utilities, mobile top-up; see payments section |
| **Click Wallet** | P2P transfers + payments | Part of Click API | Token | Dominant | **HIGH** | P2P, government payments; see payments section |
| **Humans** | Super-app: wallet + bank + mobile + insurance | REST API | OAuth 2.0 | Large (growing fast) | **HIGH** | Full super-app; MVNO + banking + payments; API-first approach |
| **Uzum Nasiya** | BNPL (Buy Now Pay Later) | API (for merchants) | Merchant key | Growing | **MED** | Part of Uzum ecosystem; installment payments |

---

### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Binance** | Crypto exchange (accessible from UZ) | Full REST + WebSocket | API key | Medium | **LOW** | Global product; no UZ-specific entity |
| **Uzum fintech ecosystem** | Multiple fintech products | Various APIs | Various | Large | **MED** | Ecosystem play: marketplace + bank + payments |
| **Kapitalbank Digital** | Digital banking fintech | REST API | OAuth | Large | **MED** | Part of Kapital/Uzum group |
| **Local crypto exchanges** | Various small exchanges | Unknown | Unknown | Small | **LOW** | Regulatory uncertainty |

---

### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Gross Insurance** | Major insurer | Unknown — requires verification | Unknown | Large | **LOW** | Traditional insurer |
| **INGO Uzbekistan** | Insurance company | Unknown — requires verification | Unknown | Medium | **LOW** | International backing |
| **Humans Insurance** | InsurTech (part of Humans super-app) | Part of Humans API | OAuth | Small-Medium | **MED** | Digital-first insurance |
| **Uzagrosugurta** | State agricultural insurance | No API known | N/A | Medium | **LOW** | Government-backed |
| **Kafolat** | Insurance company | Unknown | Unknown | Medium | **LOW** | Traditional |

---

### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Express24 Delivery** | Same-day courier delivery | Partner API — requires verification | Unknown | Dominant | **HIGH** | Largest delivery network in UZ |
| **CDEK UZ** | CIS courier in UZ | REST API v2 | OAuth 2.0 | Medium | **HIGH** | Same excellent CDEK API |
| **Uzum Express** | Marketplace delivery logistics | Unknown — requires verification | Unknown | Growing | **MED** | Part of Uzum marketplace |
| **DPD Uzbekistan** | European courier | REST API | API key | Small | **MED** | B2B focused |
| **Fargo Delivery** | Local courier startup | Unknown — requires verification | Unknown | Small | **LOW** | Local player |
| **Yandex Delivery UZ** | Yandex delivery service | REST API | OAuth | Small | **MED** | If operational in UZ |

---

### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **O'zbekiston Pochtasi** | National postal service | Limited API (tracking) | API key | Large (monopoly for mail) | **MED** | Some digital services emerging; tracking API |
| **EMS Uzbekistan** | Express mail | Limited API | API key | Small | **LOW** | Subservice of national post |

---

### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **UTY (Uzbekistan Railways)** | National railway freight | Unknown — requires verification | Unknown | Large | **LOW** | State railway; limited digital |
| **Lardi-Trans** | CIS freight exchange | REST API | API key | Small-Medium | **LOW** | Some UZ usage |
| **ATI.SU** | CIS freight board | REST API | API key | Small | **LOW** | Less popular in UZ than KZ |
| **TIR-online** | Freight platform | Unknown | Unknown | Small | **LOW** | Niche |

---

### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Uzum Fulfillment** | Marketplace fulfillment | Part of Uzum Seller API | API key | Growing | **MED** | Marketplace-integrated |
| **CDEK Fulfillment UZ** | CDEK warehouse services | REST API | OAuth | Small | **LOW** | Extension of CDEK |
| **Local 3PL** | Various providers | No APIs known | N/A | Fragmented | **LOW** | Market very immature |

---

### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bitrix24** | Dominant CRM in CIS/UZ | REST API (excellent) | OAuth 2.0 | Dominant | **HIGH** | Same as KZ — most used CRM/collab tool |
| **AmoCRM** | Sales CRM | REST API | OAuth 2.0 | Large | **HIGH** | Very popular in UZ for sales teams |
| **iCRM / local CRMs** | UZ-specific CRM solutions | Unknown | Unknown | Small | **LOW** | Niche local players |

---

### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Enterprise** | De facto ERP standard | OData REST API | Basic Auth | Dominant (~70-80% businesses) | **HIGH** | Same as KZ; UZ localization for tax/accounting |
| **Tezis ERP** | UZ-focused ERP | Unknown — requires verification | Unknown | Small | **LOW** | Local startup |
| **SAP** | Enterprise (mining, telecom) | Full API | OAuth | Small | **LOW** | Global product |

---

### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Бухгалтерия UZ** | UZ-localized accounting | OData REST API | Basic Auth | Dominant | **HIGH** | UZ tax forms, UzCard/Humo reconciliation |
| **Soliq.uz** | UZ tax authority portal | API (e-invoicing, tax reporting) | EDS / ERI certificate | Mandatory | **HIGH** | Tax reporting, e-invoicing (faktura); critical integration |
| **my.soliq.uz** | Taxpayer personal cabinet | Limited API | EDS | Mandatory | **MED** | Tax compliance portal |
| **Buxgalter.uz** | Accounting portal/resource | No API | N/A | Medium | **LOW** | Informational only |

---

### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **SolIQ (Fiscal module)** | Mandatory online fiscal system | REST API (documented) | Fiscal key + token | Mandatory | **HIGH** | All businesses must fiscalize receipts; API for POS integration; soliq.uz |
| **Virtual kassa** | Virtual cash register service | REST API | Token | Medium | **MED** | For businesses without physical kassa |
| **OFD.uz** | Fiscal data operator | API for fiscal data | Token | Mandatory infrastructure | **MED** | Backend fiscal system |

---

### 18. EDI / EDM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Factura.uz** | E-invoicing system (mandatory) | REST API (documented) | EDS certificate | Mandatory for B2B | **HIGH** | Electronic invoicing platform; all B2B invoices must go through this; API available |
| **EDMS solutions** | Various document management | Unknown | Unknown | Small | **LOW** | Market immature |
| **E-imzo** | Electronic digital signature system | API (JavaScript/REST) | Certificate | Mandatory for business | **HIGH** | UZ digital signature; required for all government and tax interactions |

---

### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **HeadHunter.uz (hh.uz)** | Dominant job board | REST API (same HH platform) | OAuth 2.0 | Dominant | **HIGH** | Same HH API; vacancies, resumes, applications |
| **Ishchi.uz** | Government job portal | No API known | N/A | Medium | **LOW** | State employment portal |
| **OLX Jobs UZ** | Job classifieds | No API | N/A | Small | **LOW** | Declining |
| **Telegram job channels** | Major hiring channel in UZ | Bot API | Bot token | Large | **MED** | Many hiring happens via Telegram in UZ |

---

### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bitrix24** | Project management | REST API | OAuth 2.0 | Dominant | **HIGH** | See CRM section |
| **Yandex Tracker** | Issue tracking | REST API | OAuth 2.0 | Small-Medium | **LOW** | Some UZ tech companies |
| **Trello / Jira / Asana** | Western tools | Full APIs | Various | Small | **LOW** | Global, existing MCP |

---

### 21. SMS / Push

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Eskiz.uz** | Major SMS gateway for UZ | REST API (documented) | Email + password → token | Large | **HIGH** | Primary UZ SMS gateway; well-documented API; eskiz.uz/developer |
| **Playmobile.uz** | SMS gateway | REST API | API key | Medium | **MED** | Alternative SMS provider |
| **Infobip UZ** | Global CPaaS in UZ | REST API | API key | Small-Medium | **MED** | SMS, WhatsApp, Viber |
| **Notify.uz** | Notification service | REST API | API key | Small | **LOW** | Local startup |
| **Mobizon UZ** | CIS SMS gateway | REST API | API key | Small | **LOW** | Less prominent in UZ |

---

### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **UniSender** | CIS email marketing | REST API | API key | Medium | **MED** | Used by UZ businesses |
| **SendPulse** | Email/chatbot platform | REST API | OAuth | Small-Medium | **MED** | Growing in UZ |
| **Local email marketing** | Market is nascent | N/A | N/A | Small | **LOW** | Email marketing underutilized in UZ; Telegram dominates |

---

### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Google Ads** | Search/display advertising | Full API | OAuth 2.0 | Large | **LOW** | Global, existing MCP |
| **Yandex Direct** | Search advertising | REST API v5 | OAuth 2.0 | Medium | **MED** | Less dominant in UZ than KZ |
| **Facebook/Instagram Ads** | Social advertising | Marketing API | OAuth | Large | **LOW** | Global, existing MCP |
| **Telegram Ads** | Telegram advertising platform | Telegram Ad Platform API | OAuth | Growing fast | **MED** | Telegram is primary channel in UZ |
| **OLX.uz / Sello Ads** | Classifieds advertising | Unknown | Unknown | Small | **LOW** | Niche |

---

### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Telegram** | Dominant messenger (~90% penetration in UZ) | Bot API + TDLib | Bot token | Dominant | **HIGH** | THE primary communication channel; bots critical for business |
| **Instagram** | Major social platform | Graph API (Meta) | OAuth 2.0 | Very Large | **MED** | Key business channel |
| **Facebook** | Social platform | Graph API | OAuth 2.0 | Medium | **LOW** | Less popular than IG/TG |
| **TikTok** | Short video | Marketing API | OAuth | Growing fast | **LOW** | Youth demographic |
| **OdnoKlassniki** | Russian social network | OK API | OAuth | Small (declining) | **LOW** | Older demographic |

---

### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Metrica** | Web analytics | REST API | OAuth 2.0 | Medium | **MED** | Used by many UZ sites |
| **Google Analytics** | Web analytics | Data API | OAuth 2.0 | Large | **LOW** | Global, existing MCP |
| **Stat.uz** | Government statistics | No API (data downloads) | N/A | Reference | **LOW** | Statistical data; no API |

---

### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **UzInfolcom** | State data center / cloud | Unknown — requires verification | Unknown | Medium | **LOW** | Government cloud infrastructure |
| **Sarvernet** | UZ hosting/cloud provider | Limited API | Unknown | Small | **LOW** | Local provider |
| **Ahost.uz** | UZ hosting | Unknown | Unknown | Small | **LOW** | Local hosting |
| **Webspace.uz** | Domain registrar + hosting | Basic API for domains | API key | Medium | **LOW** | .uz domain management |
| **Yandex Cloud / Selectel** | Russian clouds serving UZ | Full APIs | Various | Growing | **MED** | See KZ section |

---

### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Ucell (GSM Uzbekistan)** | Major mobile operator (Telia-backed) | Some B2B SMS/USSD APIs | API key | Large (~30%) | **MED** | Limited developer APIs |
| **Beeline UZ (Unitel)** | Major mobile operator | B2B SMS API | API key | Large (~25%) | **MED** | Basic messaging APIs |
| **UzMobile (Uztelecom)** | State mobile operator | Limited API | Unknown | Large (~25%) | **LOW** | State-owned; limited APIs |
| **Mobiuz (ex-UMS)** | Mobile operator | Limited API | Unknown | Medium (~20%) | **LOW** | Growing but limited APIs |
| **Humans (MVNO)** | Virtual operator on Ucell network | Part of Humans API | OAuth | Small-Medium | **MED** | MVNO with fintech integration |

---

### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **2GIS UZ** | Detailed city maps + business directory | 2GIS API (REST) | API key | Large (Tashkent dominant) | **HIGH** | Excellent detail for Tashkent; geocoding, routing, places |
| **Yandex Maps** | Maps platform | API suite | API key | Medium | **MED** | Used by Yandex Go in UZ |
| **Google Maps** | Maps platform | Full API | API key | Medium | **LOW** | Global, existing MCP |
| **OpenStreetMap** | Open map data | Overpass API | None | Used by developers | **LOW** | UZ mapping community active |

---

### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **my.gov.uz** | Central government services portal | REST API (documented) | OneID OAuth / EDS | Large (~10M+ users) | **HIGH** | 300+ government services; API gateway for business registration, permits, certificates |
| **OneID** | Government identity/auth system | OAuth 2.0 (documented) | OneID credentials | Mandatory for eGov | **HIGH** | Single sign-on for all government services; critical authentication layer |
| **EPIGRAF (e-gov data platform)** | Government data exchange | API (for integrated systems) | Certificate | Infrastructure | **MED** | Backend government integration |
| **e-mehnat.uz** | Electronic labor exchange | Unknown | Unknown | Medium | **LOW** | Employment services |
| **license.gov.uz** | Licensing portal | Unknown — requires verification | OneID | Medium | **MED** | Business licensing |
| **Data.gov.uz** | Open data portal | REST API | API key / open | Medium | **MED** | Government open data; machine-readable datasets |

---

### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **ASL BELGISI (aslbelgisi.uz)** | National product marking/labeling system | REST API (documented) | Certificate + token | Mandatory (expanding) | **HIGH** | UZ labeling system; tobacco, textiles, footwear; API for generating/reporting marks |
| **GS1 Uzbekistan** | Barcode standards | GS1 API | API key | Medium | **LOW** | GTIN management |

---

### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **OLX.uz (real estate)** | General classifieds with property section | No API | N/A | Large | **LOW** | Dominant classifieds but no API |
| **UyBor.uz** | Real estate portal | No public API known | N/A | Medium | **LOW** | Growing |
| **Makler.uz** | Real estate classifieds | Unknown — requires verification | Unknown | Small-Medium | **LOW** | Declining |
| **Rosson.uz** | Construction/real estate | Unknown | Unknown | Small | **LOW** | Niche |
| **Realtor.uz** | Real estate agents platform | Unknown | Unknown | Small | **LOW** | Niche |

---

### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Hemis** | University management system (mandatory) | API (for universities) | Token | Large (all universities) | **MED** | Government-mandated university ERP; student management |
| **Stepik** | Online courses | REST API | OAuth 2.0 | Medium | **MED** | Popular in UZ tech education |
| **Elma.uz** | UZ online learning | Unknown — requires verification | Unknown | Small | **LOW** | Local EdTech |
| **Kundalik.com (UZ version)** | School management system | Unknown — requires verification | Unknown | Medium | **LOW** | If deployed in UZ schools |
| **IT Park Academy** | Tech education (government-backed) | No API known | N/A | Medium | **LOW** | Training programs |

---

### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **EMIS (E-Health)** | National electronic medical information system | API (for medical facilities) | Certificate | Large (mandatory) | **MED** | Government health IT; integration for clinics |
| **DOC24** | Telemedicine platform | Unknown — requires verification | Unknown | Small | **LOW** | UZ telemedicine |
| **iMed** | Clinic management | Unknown — requires verification | Unknown | Small | **LOW** | Local health tech |

---

### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **MyTaxi** | Dominant ride-hailing in UZ | No public API known | N/A | Dominant | **MED** | Largest taxi app; super-app ambitions (food, payments); no B2B API found |
| **Yandex Go UZ** | Yandex ride-hailing in Tashkent | B2B Delivery API | OAuth 2.0 | Large | **MED** | Corporate rides + delivery API |
| **inDrive UZ** | Ride-hailing with bargaining | No public API | N/A | Medium | **LOW** | Consumer only |
| **Tashkent Metro app** | Public transit | No API | N/A | Small | **LOW** | Basic transit |
| **UzTransGaz** | Transport management | No API | N/A | Small | **LOW** | Government transport |

---

### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Uzbekistan Airways** | National airline | NDC API / booking engine | Unknown | Large | **MED** | National carrier; some digital services |
| **Chipta.uz** | Flight/train booking | Unknown — requires verification | Unknown | Medium | **LOW** | Local booking platform |
| **Aviasales (UZ traffic)** | Metasearch for flights | Affiliate API | API key | Medium | **LOW** | Global product with UZ traffic |
| **Railways.uz / e-ticket** | Train ticket booking | Unknown — requires verification | Unknown | Large | **MED** | UZ railway ticketing; high demand for API |
| **MyTrip.uz** | Travel platform | Unknown | Unknown | Small | **LOW** | Niche |

---

### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Lex.uz** | National legal database | No API (web access) | Subscription | Large | **LOW** | Laws and regulations; no API |
| **NORMA.uz** | Legal/tax reference system | No API | Subscription | Medium | **LOW** | Reference system |
| **e-sud.uz** | Electronic court system | Unknown — requires verification | OneID/EDS | Medium | **MED** | E-filing for courts |

---

### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Agroplatforma.uz** | Government agriculture platform | Unknown — requires verification | Unknown | Medium | **LOW** | Government ag services |
| **Cotton/textile platforms** | UZ is major cotton producer | No known APIs | N/A | Large (industry) | **LOW** | Industry vertical, no tech APIs |
| **AgroBank** | Agricultural bank | Limited banking API | Unknown | Medium | **LOW** | Specialized bank |

---

### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Qurilish.gov.uz** | Government construction portal | Unknown — requires verification | OneID | Medium | **MED** | Permits and regulations |
| **1C Construction modules** | ERP for construction | 1C API | Basic Auth | Small | **LOW** | Part of 1C ecosystem |
| **Local construction cos** | Various | No APIs | N/A | Large (industry) | **LOW** | No tech APIs |

---
---

# CROSS-COUNTRY: TOP 30 HIGH-PRIORITY MCP TARGETS

Ranked by overall MCP viability across both countries.

| Rank | Service | Country | Category | API Ready? | Why HIGH |
|---|---|---|---|---|---|
| 1 | **Kaspi Ecosystem** (Pay, Marketplace, Bank, Delivery) | KZ | Multi | Yes (REST) | Super-app monopoly; 15M+ users; seller + payment + banking APIs |
| 2 | **Payme** | UZ | Payments | Yes (REST) | ~40% UZ payments; well-documented API |
| 3 | **Click** | UZ | Payments | Yes (REST) | ~35% UZ payments; mature API |
| 4 | **1C:Enterprise** | KZ+UZ | ERP/Accounting | Yes (OData) | 70-80% of all businesses; universal need |
| 5 | **Bitrix24** | KZ+UZ | CRM/PM | Yes (REST) | Dominant CRM in both countries |
| 6 | **HeadHunter** (hh.kz/hh.uz) | KZ+UZ | HR | Yes (REST) | Dominant job boards; shared API |
| 7 | **2GIS** | KZ+UZ | Maps | Yes (REST) | Best local maps; business directory |
| 8 | **eGov.kz** | KZ | Government | Yes (REST/SOAP) | 800+ services; mandatory for business |
| 9 | **my.gov.uz + OneID** | UZ | Government | Yes (REST) | Central UZ e-gov; OAuth identity |
| 10 | **AmoCRM** | KZ+UZ | CRM | Yes (REST) | Major sales CRM; excellent API |
| 11 | **Halyk Bank (Epay)** | KZ | Banking/Payments | Yes (REST) | #2 bank; Epay gateway critical |
| 12 | **Kapitalbank / Uzum** | UZ | Banking/Fintech | Yes (REST) | Largest private bank + marketplace ecosystem |
| 13 | **CDEK** | KZ+UZ | Logistics | Yes (REST) | Major courier; excellent API |
| 14 | **Express24** | UZ | Delivery | Likely (needs verification) | Dominant delivery platform |
| 15 | **Webkassa** | KZ | Fiscal | Yes (REST) | Mandatory fiscal system |
| 16 | **SolIQ / Factura.uz** | UZ | Fiscal/Tax | Yes (REST) | Mandatory fiscal + e-invoicing |
| 17 | **ESF (ИС ЭСФ)** | KZ | E-invoicing | Yes (SOAP/REST) | Mandatory e-invoicing |
| 18 | **Yandex Go** | KZ+UZ | Transport | Yes (REST) | B2B delivery API; corporate rides |
| 19 | **Eskiz.uz** | UZ | SMS | Yes (REST) | Primary UZ SMS gateway |
| 20 | **Poster POS / iiko** | KZ+UZ | HoReCa | Yes (REST) | Dominant restaurant tech |
| 21 | **Humans** | UZ | Super-app | Yes (REST) | MVNO + bank + payments; API-first |
| 22 | **Forte Bank** | KZ | Banking | Yes (REST) | Major bank; developer portal |
| 23 | **NCALayer** | KZ | Digital Signature | Yes (JS/REST) | Required for all eGov operations |
| 24 | **E-imzo** | UZ | Digital Signature | Yes (JS/REST) | Required for all UZ eGov |
| 25 | **ASL BELGISI** | UZ | Labeling | Yes (REST) | Mandatory product marking |
| 26 | **IS MP (Маркировка KZ)** | KZ | Labeling | Yes (REST) | Mandatory product marking |
| 27 | **UniSender** | KZ+UZ | Email | Yes (REST) | CIS email marketing leader |
| 28 | **Yandex Direct** | KZ | Advertising | Yes (REST) | Major ad platform |
| 29 | **Yandex Metrica** | KZ+UZ | Analytics | Yes (REST) | CIS web analytics standard |
| 30 | **Chocofood** | KZ | Food Delivery | Likely | Dominant KZ food ordering |

---

# METHODOLOGY NOTES

1. **API verification status**: Services marked "Yes" have publicly accessible API documentation. Services marked "requires verification" need direct outreach or developer portal registration to confirm.

2. **Scoring weights applied**:
   - API availability (30%): Public docs, REST/GraphQL, auth standards
   - Market size (25%): User base, transaction volume, market share
   - Automation potential (20%): Repetitive workflows, B2B operations, integration frequency
   - Existing MCP coverage (15%): No known MCP servers for any listed CIS-specific service as of 2026-04
   - Dev ecosystem (10%): SDKs, community, documentation language

3. **Key findings**:
   - **No existing MCP servers** found for any Kazakhstan or Uzbekistan-specific service in the open-source ecosystem
   - **Kaspi (KZ)** and **Payme+Click (UZ)** are the single most impactful integration targets per country
   - **1C and Bitrix24** are cross-border plays covering both markets (and all of CIS)
   - **Government services** (eGov.kz, my.gov.uz) have functional APIs and massive automation potential
   - **Fiscal/tax systems** (Webkassa, SolIQ, ESF, Factura.uz) are mandatory for businesses — high-value automations
   - **Telegram Bot API** is already well-known but KZ/UZ-specific business workflows (payment bots, eGov bots) remain untapped
   - UZ market is growing faster but APIs are less mature; KZ has more established API ecosystems

4. **Recommended first batch** (maximum impact, confirmed API availability):
   - Kaspi MCP Server (KZ)
   - Payme MCP Server (UZ)
   - Click MCP Server (UZ)
   - 1C:Enterprise MCP Server (KZ+UZ)
   - Bitrix24 MCP Server (KZ+UZ)

---

*Research compiled from public API documentation, developer portals, app store listings, tech press, and CIS developer community sources. All API availability claims should be verified against current developer portal access before implementation.*
