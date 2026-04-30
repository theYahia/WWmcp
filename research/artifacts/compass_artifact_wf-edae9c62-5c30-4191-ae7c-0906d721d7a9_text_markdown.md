# Turkey MCP Server Implementation: Complete Market Analysis

Turkey's API ecosystem is far more mature than expected — with **15+ existing MCP servers already on GitHub**, a **first-mover commercial MCP by Enuygun**, and over **60 services with documented APIs** across commerce, finance, logistics, and compliance. The mandatory e-Fatura system alone creates an addressable market of hundreds of thousands of businesses that all depend on API-connected integrators. Combined with 85M population, 77M internet users, and a $93B+ e-commerce market, Turkey represents one of the most underserved yet API-ready markets for MCP expansion.

**Important correction from the brief:** MIR card acceptance in Turkey was **halted in September 2022** after US Treasury sanctions pressure. All five banks stopped processing MIR, and as of early 2025, Russian officials confirmed no prospects for resumption.

---

## Turkey (TR)

### Market Overview

| Metric | Value |
|--------|-------|
| Population | 85.3 million |
| Internet users | 77.3 million (88.3% penetration) |
| E-commerce market | ~$93.5B total / ~$42B B2C (2025) |
| E-commerce share of GDP | 6.5% (2024) |
| Mobile transactions | 72% of all e-commerce |
| Trendyol GMV | ~$11.6B (2024), 360K+ sellers |
| Payment landscape | Credit cards dominant (54%); Troy national card (35M cards); Papara (21M users); 92 licensed payment institutions |
| Developer population | ~500,000–800,000 estimated |
| API documentation language | Primarily Turkish; major platforms offer English |
| E-Fatura mandate | Mandatory for businesses >TRY 3M revenue; >TRY 500K for e-commerce; 16+ document types; UBL-TR format; penalties up to TRY 1.1M for non-compliance |
| Open banking | Individual accounts opened to third-party access since Dec 2022; FAST Secure Payment Layer since May 2024 |
| Existing MCP servers | 15+ found on GitHub (see analysis below) |

---

### 1. E-Commerce Marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Trendyol** | Turkey's #1 marketplace, 30M+ products, 360K sellers | ✅ Public API | https://developers.trendyol.com/ | Basic Auth (API Key + Secret) | Large | 🔴 High | 40–60 | Excellent docs (EN/TR), Postman collection, sandbox, REST. Product CRUD, orders, stock, invoices, Q&A. Rate limit 1K req/sec |
| **Hepsiburada** | Turkey's #2 marketplace, 163M+ products | ✅ Public API | https://developers.hepsiburada.com/ | HTTP Basic Auth + Merchant ID | Large | 🔴 High | 40–60 | 6 sub-APIs: Marketplace, HepsiLojistik, HepsiJet, Hepsipay, HepsiGlobal. ReadMe-based docs |
| **n11.com** | Major marketplace platform | ✅ Public API (SOAP) | https://magazadestek.n11.com/ | API Key + Secret (SOAP) | Medium | 🟡 Medium | 35–50 | SOAP/XML protocol, less modern. Community PHP wrappers exist. Docs primarily Turkish |
| **GittiGidiyor** | Was eBay Turkey subsidiary | ❌ Shut down (2022) | N/A | N/A | N/A | ❌ Skip | 0 | Closed June 2022. Skip entirely |
| **Çiçeksepeti** | Online flower/gift delivery + marketplace | ⚠️ Partner API | https://ciceksepeti.dev/ | API Key (x-api-key header) | Medium-Large | 🟡 Medium | 30–40 | REST API, sandbox available. Access requires seller panel support ticket |
| **LC Waikiki** | Major fashion retailer, 1,100+ stores globally | ⚠️ Internal only | https://mym-apim-developer.lcwaikiki.com/ (requires auth) | Unknown (Azure APIM) | Large | 🟢 Low | N/A | Internal Azure API Management. No public developer API |

### 2. Grocery & Food Delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Getir** | Ultra-fast grocery delivery, international | ⚠️ Partner API | https://developers.getir.com/ (login required) | Token/JWT | Large | 🔴 High | 35–50 | Covers GetirYemek + GetirÇarşı. SPA portal requires authentication. C# community library exists |
| **Migros Sanal Market** | Major supermarket chain online | ❌ No public API | N/A | N/A | Large | 🟡 Medium | N/A | Confirmed no API via community forums. Internal AWS microservices only |
| **A101** | Discount supermarket online marketplace | ⚠️ Partner API | N/A (via integrators like Entegra) | API Key | Medium-Large | 🟢 Low | 20–30 | Marketplace seller integration only. No standalone developer portal |
| **İstegelsin** | Online grocery delivery (dark store model) | ❌ No public API | N/A | N/A | Small-Medium | 🟢 Low | N/A | Acquired by Şok Marketler in 2024. Consumer-only platform |

### 3. Restaurant / Food Ordering

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Yemeksepeti** | Turkey's #1 food ordering (Delivery Hero) | ⚠️ Partner API | https://developer.yemeksepeti.com/ + https://integration.yemeksepeti.com/ | Custom/Bearer | Large | 🔴 High | 45–60 | Dual API: legacy SOAP + modern REST. Catalog, orders, promotions, picking |
| **Getir Yemek** | Getir's food delivery arm | ⚠️ Partner API | https://developers.getir.com/food/api-documentation | Token/JWT | Medium | 🟡 Medium | 25–35 | Part of Getir developer platform. Partnership required |
| **Trendyol Yemek** | Trendyol Go food/market delivery (Uber Eats) | ⚠️ Partner API | https://developers.tgoapps.com/ | Basic Auth | Large | 🔴 High | 30–40 | Docusaurus docs, REST. Market + Yemek sections. PHP community library exists |

### 4. POS / Retail Tech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **iyzico** | Turkey's leading payment gateway + POS | ✅ Public API | https://docs.iyzico.com/ | API Key + Secret (PKI/SHA-1) | Large | 🔴 High | 40–60 | 15 official GitHub SDKs (PHP, Node, Python, .NET, Java, Ruby). Sandbox, Postman. Marketplace, subscriptions, physical POS |
| **Param POS** | Virtual POS, 23+ bank integrations | ✅ Public API | https://dev.param.com.tr/en/api | Custom (security object + IP whitelist) | Medium | 🟡 Medium | 35–45 | SOAP/REST hybrid. Marketplace + Wallet APIs. 5 GitHub repos. Plugins for WooCommerce, OpenCart |

---

### 5. Banks with APIs

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **İş Bankası** | Turkey's largest private bank | ✅ Public API | https://developer.isbank.com.tr/ | OAuth2 / API Key | Large | 🔴 High | 20–30 | **40+ APIs**: Accounts, EFT/FAST, bills, IBAN, credit scores, FX. Most comprehensive Turkish bank API. 1000+ sandbox users |
| **Garanti BBVA** | Major bank (BBVA group) | ✅ Public API | https://developers.garantibbva.com.tr/ + https://dev.garantibbva.com.tr/ | API Key / OAuth2 | Large | 🔴 High | 20–30 | Dual portal: Open Banking + E-Commerce/Virtual POS. Community PHP client |
| **Yapı Kredi** | Major bank (Koç Holding) | ✅ Public API | https://apiportal.yapikredi.com.tr/ | OAuth2 (client_credentials) | Large | 🟡 Medium | 15–20 | FX/investment rates APIs. Official GitHub repo: code-yapikredi/api |
| **Akbank** | Major bank (Sabancı Group) | ✅ Public API | https://apiportal.akbank.com/ | API Key | Large | 🟡 Medium | 15–20 | Credit rates, FX, ATM/branch finder, fund prices. Portal since 2016 |
| **Ziraat Bankası** | Turkey's largest state bank | ✅ Public API | https://developers.ziraatbank.com.tr/ | API Key | Large | 🟡 Medium | 15–20 | Also Open Banking portal. Ziraat Katılım has separate portal |
| **VakıfBank** | Major state bank | ⚠️ Partner API | N/A (merchant agreement required) | Custom (Posnet) | Large | 🟡 Medium | 15–20 | Virtual POS only. Community .NET/PHP libraries exist |
| **DenizBank** | Bank (Emirates NBD) | ⚠️ Partner API | N/A | Custom (InterPos) | Medium | 🟢 Low | 20 | Virtual POS through InterPos gateway |
| **QNB Finansbank** | Bank (QNB Group) | ✅ Public API | https://developer.qnb.com.tr/ | API Key / OAuth2 | Medium | 🟡 Medium | 15–20 | Open Banking + Virtual POS + e-Invoice APIs |
| **ING Turkey** | ING Bank Turkey branch | ⚠️ Partner API | N/A | Custom (NestPay) | Medium | 🟢 Low | 20+ | Virtual POS through NestPay. No TR-specific portal |
| **Papara** | Digital wallet/fintech, 21M users | ✅ Public API | https://merchant-api.papara.com/ | API Key (PAPARA_API_KEY) | Large | 🔴 High | 15–20 | Official SDKs: PHP, Java, Android, iOS. Balance, payments, mass payments, recurring. Test sandbox |

### 6. Payment Gateways

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **iyzico** | Market-leading payment gateway (PayU) | ✅ Public API | https://docs.iyzico.com/ | API Key + Secret (PKI) | Large | 🔴 High | 15–20 | Best developer ecosystem. 15 GitHub SDKs. Sandbox. Marketplace, subscriptions, POS |
| **PayTR** | Major e-commerce payment gateway | ✅ Public API | https://dev.paytr.com/en | Custom (HMAC-SHA256) | Large | 🔴 High | 15–20 | iFrame + Direct API. Webhook notifications. PHP code examples |
| **Param** | Payment gateway + wallet + card issuing | ✅ Public API | https://dev.param.com.tr/en/api | Custom (SOAP + REST) | Medium | 🟡 Medium | 20–25 | SOAP-based primary. 100K merchants, 11M prepaid cards |
| **Tosla** | Mobile payment/wallet by Akbank | ⚠️ Partner API | N/A | Unknown | Medium | 🟢 Low | N/A | Integration through Payten gateway only |
| **Craftgate** | Payment orchestration platform | ✅ Public API | https://developer.craftgate.io/ | Custom (HMAC-SHA256 signature) | Medium | 🔴 High | 12–18 | **Excellent**. 6 official SDKs (PHP, Node, Python, Go, .NET, Java). Sandbox. Routes across banks |
| **Paynet** | Payment solutions | ✅ Public API | https://doc.paynet.com.tr/english/api-integration | Custom (merchant credentials) | Medium | 🟡 Medium | 15–20 | REST API. Requires access request |

### 7. Mobile Wallets

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **BKM Express** | Interbank card payment system | ⚠️ Partner API | N/A (Node.js SDK on GitHub) | Custom (signature-based) | Large | 🟡 Medium | 20–25 | brendtumi/bkmexpress on GitHub. Sandbox available. Also integrated via iyzico/Craftgate |
| **Papara** | Digital wallet, 21M users | ✅ Public API | See Banks section above | API Key | Large | 🔴 High | 15–20 | See entry in Banks section |
| **Fastpay** | Mobile payment solution | 🔍 Unknown | N/A | Unknown | Small | 🟢 Low | N/A | No API docs or developer presence found |

### 8. Crypto / Fintech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **BtcTurk** | Turkey's oldest crypto exchange (2013) | ✅ Public API | https://docs.btcturk.com/ | API Key + HMAC-SHA256 | Large | 🔴 High | 12–18 | Swagger docs, Python SDK. Ticker, orderbook, trades, orders, balance, withdrawals. *Note: borsa-mcp already covers BtcTurk data* |
| **Paribu** | Major crypto exchange, 4M+ users | ❌ No public API | N/A | N/A | Large | 🟢 Low | N/A | Confirmed no API sharing. Partners only. Blockchain explorer API separate |
| **Bitci** | Crypto exchange with own blockchain | 🔍 Unknown | N/A | Unknown | Medium | 🟢 Low | N/A | No API docs found. Has Bitcichain but no exchange API |
| **Colendi** | Fintech/credit scoring | ⚠️ Partner API | N/A | Unknown | Small | 🟢 Low | N/A | B2B only, no public docs |
| **Figopara** | Invoice financing fintech | 🔍 Unknown | N/A | Unknown | Small | 🟢 Low | N/A | No API docs found |

### 9. Insurance

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Sigortam.net** | Insurance comparison, 9M+ customers | ❌ No public API | N/A | N/A | Large | 🟢 Low | N/A | Internal microservices only. Consumer platform |
| **Koalay** | Insurance comparison | 🔍 Unknown | N/A | Unknown | Small | 🟢 Low | N/A | No API docs found |
| **Aksigorta** | Insurance company (Sabancı/Ageas) | ⚠️ Partner API | N/A | Unknown | Medium | 🟢 Low | N/A | Agent/broker APIs likely exist but not publicly documented |

---

### 10. Courier / Last-Mile

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Yurtiçi Kargo** | Turkey's #1 private courier | ⚠️ Partner API (SOAP) | WSDL: webservices.yurticikargo.com | SOAP WS-Security (4 credential sets) | Large | 🔴 High | 30–40 | createShipment, queryShipment, cancel. Community PHP SDKs. IP whitelist required |
| **Aras Kargo** | Major courier (B2B, B2C, C2C) | ⚠️ Partner API (SOAP) | https://www.araskargo.com.tr/en/services/corporate-services/integration-services | Username + Password + Customer Code | Large | 🔴 High | 30–40 | 7 integration models. Community PHP SDK (ismail0234), Laravel package |
| **MNG Kargo** | Major courier (DHL eCommerce Turkey) | ✅ Public API (REST) | https://apizone.mngkargo.com.tr/ | API Key | Large | 🔴 High | 15–20 | **Best courier API in Turkey**. IBM API Connect portal, self-service, sandbox. Tracking, shipment prep, barcode |
| **Sürat Kargo** | Growing courier service | ⚠️ Partner API (SOAP) | WSDL: suratkargo.com.tr/GonderiWebServiceGercek | Username + Password | Medium | 🟡 Medium | 25–30 | Shipment creation, tracking. Two credential sets (normal + COD) |
| **Sendeo** | E-commerce logistics | ⚠️ Partner API | N/A (credentials via branch) | Username + Password | Medium | 🟡 Medium | 25–30 | Widely supported by e-commerce integrators. No public docs |

### 11. Postal Services

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **PTT** | Turkish national postal service | ⚠️ Partner API (SOAP) | WSDL: pttws.ptt.gov.tr. GitHub: github.com/ahmeti/ptt-kargo-api | Customer ID + Password | Large | 🔴 High | 25–30 | Barcode query, shipment tracking, data upload. Community PHP SDK on Packagist. Essential for rural coverage |

### 12. Freight / Trucking

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Kolay Gelsin** | E-commerce last-mile (Ekol Lojistik) | ✅ Public API | https://developer.kolaygelsin.com/ | API Key | Medium | 🟡 Medium | 15–25 | Developer portal exists. Integrates with Amazon, n11, Shopify |
| **Lojiper** | Fleet/logistics management SaaS | ❌ No API | N/A | N/A | Small | 🟢 Low | N/A | Internal management tool, not a carrier |
| **Fretlink TR** | European road freight marketplace | ❌ No API | N/A | N/A | Small | 🟢 Low | N/A | Primarily France/Western Europe. Minimal Turkey presence |

### 13. Warehousing / Fulfillment

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Trendyol Fulfillment** | Trendyol's fulfillment for sellers | ✅ Public API | https://developers.trendyol.com/ | HTTP Basic Auth | Large | 🔴 High | 20–25 | Covered under Trendyol Marketplace API. Shipment packages, carrier assignment |
| **HepsiLojistik** | Hepsiburada's fulfillment (7 warehouses) | ✅ Public API | https://developers.hepsiburada.com/ | HTTP Basic Auth | Large | 🔴 High | 20–25 | Separate HepsiLojistik API section. Shipment labels (ZPL, PDF, PNG, JPG) |

---

### 14. CRM

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Salesforce TR** | Global CRM, Turkish localization | ✅ Public API (global) | https://developer.salesforce.com/ | OAuth 2.0 | Large | 🟢 Low | 4 | Global MCP already exists. TR is config-level |
| **TeamGram** | Cloud CRM for Turkish SMBs | ✅ Public API + Webhooks | teamgram.com (API section) | API Key | Small-Medium | 🟡 Medium | 20 | Full REST API. Sales pipeline, quotes, invoicing, inventory |

### 15. ERP

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Logo Yazılım** | Turkey's #1 ERP (Tiger, Netsis, Go, j-Platform) | ✅ Public API | https://docs.logo.com.tr/public/jua/entegrasyon-arayuezleri/j-platform-rest/ | OAuth 2.0, API Keys | Large | 🔴 High | 60–80 | j-Platform REST API. Also e-Fatura integrator. Publicly traded (BIST). **Highest-value MCP target in business software** |
| **Mikro Yazılım** | Major ERP/accounting (textiles, retail) | ✅ Public REST API | https://apidocs.mikro.com.tr/guides | API Key + MD5 hash | Large | 🔴 High | 40 | Postman collection. Sessions, stock, orders, invoices. Demo DB available |
| **Uyumsoft** | ERP + e-Fatura integrator | ✅ Public API (SOAP + REST) | SOAP: efatura.uyumsoft.com.tr/Services/Integration?wsdl | WS-Security / Basic | Medium-Large | 🔴 High | 40 | Dual-role: ERP + GIB integrator. Test environment. Community PHP/Node repos |

### 16. Accounting / Tax

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Paraşüt (Parasut)** | Turkey's #1 cloud accounting for SMEs | ✅ Public REST API v4 | https://apidocs.parasut.com | OAuth 2.0 | Large | 🔴 High | 30 | **Excellent MCP candidate**. JSON:API format. SDKs in Node.js, Java, PHP. Contacts, invoices, products, e-Fatura |
| **Logo Muhasebe** | Logo's accounting module | ✅ Same as Logo REST API | See Logo Yazılım | OAuth 2.0 | Large | 🔴 High | — | Covered under Logo Yazılım |
| **ETA** | Legacy DOS/Windows accounting | ❌ No API | N/A | N/A | Small | 🟢 Low | N/A | Legacy software, no API |

### 17. E-Invoice / E-Fatura

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **GİB Portal** | Government e-Fatura system | ⚠️ Restricted (SOAP) | https://ebelgebasvuru.gib.gov.tr/entegrasyon | e-İmza / Mali Mühür | Massive | 🔴 High | 60+ | UBL-TR format. Direct integration requires GIB auth. Community PHP library: mlevent/fatura |
| **Foriba/Sovos** | Turkey's largest e-Fatura integrator | ✅ Public API (SOAP + REST) | https://api.fitbulut.com/servis/#/eInvoice | WS-Security / API Token | Large | 🔴 High | 40 | **TOP e-Fatura MCP candidate**. Official .NET + PHP SDKs on GitHub. SAP integration. ~80B TL/month processed |
| **Nilvera** | GIB-authorized e-Fatura integrator | ✅ Public REST API v2.1 | https://developer.nilvera.com | OAuth 2.0 (Bearer) | Medium-Large | 🔴 High | 30 | **Best REST API docs** among integrators. Full Swagger. e-Fatura, e-Arşiv, e-İrsaliye, e-SMM |
| **Turkcell e-Şirket** | Telecom-backed e-Fatura integrator | ✅ Public REST API | https://developer.turkcellesirket.com/fatura | Bearer Token | Large | 🔴 High | 35 | Well-documented REST. Test portal available. Turkcell backing |
| **Logo e-Fatura** | Logo's e-Fatura integration | ✅ Part of Logo REST API | See Logo Yazılım | OAuth 2.0 | Large | 🔴 High | — | Logo is both ERP vendor + GIB integrator |
| **Uyumsoft e-Fatura** | Uyumsoft's e-Invoice services | ✅ SOAP + REST | See Uyumsoft ERP | WS-Security / Basic | Medium-Large | 🔴 High | — | Covered under Uyumsoft |
| **Paraşüt e-Fatura** | Cloud accounting e-Invoice | ✅ Part of Parasut API v4 | See Parasut | OAuth 2.0 | Large | 🔴 High | — | Covered under Parasut |

### 18. EDI / Document Management

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Foriba EDI** | Supply chain document exchange (Sovos) | ⚠️ Enterprise offering | N/A | Enterprise credentials | Medium | 🟡 Medium | — | Part of Sovos enterprise integration suite |

### 19. HR / Recruiting

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Kariyer.net** | Turkey's #1 job portal | ❌ No public API | N/A | N/A | Large | 🟡 Medium | N/A | Confirmed no API access. Major gap |
| **Yenibiris.com** | Job portal | ❌ No public API | N/A | N/A | Small-Medium | 🟢 Low | N/A | Traditional job portal, no developer ecosystem |
| **Eleman.net** | Job portal | ❌ No public API | N/A | N/A | Small | 🟢 Low | N/A | No API |
| **Secretcv** | Job portal | ❌ No public API | N/A | N/A | Small | 🟢 Low | N/A | No API |
| **Kolay İK** | Cloud HR management (leave, payroll, ATS) | ✅ Public REST API | https://apidocs.kolayik.com/ | Bearer Token | Medium | 🔴 High | 25 | **Only Turkish HR platform with public API**. GitHub org (kolayik). Employee mgmt, leave, performance, shifts |

### 20. Project Management

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| *No notable local tools* | Turkish market uses Asana, Jira, Monday.com | N/A | N/A | N/A | N/A | 🟢 Low | N/A | No major Turkish PM tools identified |

---

### 21. SMS / Push Notification

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Netgsm** | Major SMS gateway (bulk, OTP, voice) | ✅ Public API | https://www.netgsm.com.tr/dokuman/ | Username/Password + IP whitelist | Large | 🔴 High | 15–20 | Official NPM + Laravel/Symfony packages. Postman collection. REST at api.netgsm.com.tr |
| **İleti Merkezi** | SMS platform, 800+ operators globally | ✅ Public API | https://www.toplusmsapi.com | API Key + API Hash | Large | 🔴 High | 12–15 | **Best developer experience**. Official SDKs in Go, C#, Node.js, PHP. 100 free test credits |
| **JetSMS** | Enterprise SMS (banks, finance) | ✅ Public API | https://docs.jetsms.com.tr/ | Username/Password | Large | 🟡 Medium | 15–18 | REST, XML, HTTP, SMPP. Community PHP package |
| **Turkcell MesajÜssü** | Turkcell's business SMS platform | ✅ Public API | API doc PDF at mesajussu.turkcell.com.tr | Session token + IP whitelist | Large | 🔴 High | 18–22 | REST API v2. Session-based auth. IYS/ETK compliance |

### 22. Email Marketing

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Euromsg (Related Digital)** | Leading Turkish omni-channel marketing automation | ✅ Public API (enterprise) | github.com/mahmut/euromsg (community) | Account credentials | Large | 🟡 Medium | 20–25 | 1500+ clients (THY, Trendyol, Starbucks). API primarily for enterprise. euromsgexpress.com for SMB |
| **Emarsys TR (SAP)** | SAP marketing automation in Turkey | ✅ Public API (global) | https://dev.emarsys.com/ | WSSE | Large | 🟡 Medium | 20–25 | Global API applies. Would use global MCP |

### 23. Advertising

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Trendyol Ads** | Marketplace advertising for sellers | ✅ Part of Trendyol API | https://developers.trendyol.com/ | Basic Auth | Large | 🔴 High | — | Covered under Trendyol Marketplace API. Ads management may be panel-only |
| **Hepsiburada Ads** | Marketplace advertising | ⚠️ Partner API | Via merchant portal | Merchant credentials | Large | 🟡 Medium | 25–30 | Requires active merchant account |

### 24. Social Media / Community

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Ekşi Sözlük** | Turkey's iconic collaborative dictionary/forum | ❌ No official API | N/A (8+ unofficial scrapers on GitHub) | N/A | Large (cultural institution) | 🟡 Medium | 15–20 | No official API. Community scrapers: Python (eksipy on PyPI), Node.js, FastAPI. Legal/ToS risks |

### 25. Analytics

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| *Market dominated by global tools* | Power BI, Tableau, Qlik used. Related Digital/Visilabs is local | 🔍 Fragmented | N/A | N/A | N/A | 🟢 Low | N/A | No notable standalone Turkish BI tool with API |

---

### 26. Cloud / Hosting

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Turkcell Bulut** | Enterprise cloud (VMs, K8s, backup) | ⚠️ Partner API | https://docs.turkcellbulut.com/ | Enterprise credentials | Large | 🟡 Medium | 20–25 | Tier 3 data center (Gebze). BDDK compliant. Not self-service like AWS |
| **Türknet** | ISP with hosting | ❌ No API | N/A | N/A | Medium | 🟢 Low | N/A | Primarily ISP |
| **Radore** | Data center, hosting, colocation | ⚠️ Likely panel API | N/A | Panel-based | Medium | 🟢 Low | 15–20 | RCD control panel. No public REST API docs |
| **Natro** | Hosting provider | ❌ No API | N/A | N/A | Small | 🟢 Low | N/A | Standard cPanel hosting |
| **Turhost** | Hosting provider | ❌ No API | N/A | N/A | Small | 🟢 Low | N/A | Small hosting provider |

### 27. Telecom API / CPaaS

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Turkcell API Platform** | SMS, MMS, Call, Device Query, TTS | ✅ Public API | https://gelecegiyazanlar.turkcell.com.tr/ | API Key (per app) | Large | 🔴 High | 20–25 | 100 free API credits/month. API Explorer. Turkey's largest mobile operator |
| **Vodafone TR API** | Network APIs (SIM swap, number verification) | ✅ Public API (global) | https://developer.vodafone.com/ | OAuth2 / API Key | Large | 🟡 Medium | 20–25 | Global developer marketplace. CAMARA-compliant. Sandbox free |
| **Bulutsantralim** | Cloud PBX / virtual switchboard | ✅ Public API | https://github.com/verimor/Bulutsantralim-API | API Key | Medium | 🔴 High | 12–15 | **Excellent MCP candidate**. GitHub docs. Call origination, bridging, transfer, CDR, IVR, webhooks |

### 28. Maps

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Yandex Maps TR** | Maps/navigation in Turkey | ✅ Public API (global) | https://yandex.com/dev/maps/ | API Key | Medium | 🟢 Low | N/A | Global API. Yandex reducing Turkey presence |
| **Başarsoft** | Turkey's GIS/mapping leader | ⚠️ Licensed API (BMS) | N/A (contact-based) | License key | Large | 🟡 Medium | 20–25 | Data used by Google Maps Turkey, Garmin. Geocoding, routing, catchment area. Commercial licensing |

---

### 29. Government Services

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **e-Devlet** | Central gov services portal (7000+ services) | ⚠️ Institutional (OAuth2) | https://kamu.turkiye.gov.tr/ | OAuth2 (institutional only) | Massive (60M+ users) | 🔴 High | 30–40 | KAM portal for G2G sharing. Requires protocol with Digital Transformation Office. Not commercial |
| **GİB** | Tax authority (e-Fatura, e-Arşiv, e-Defter) | ✅ SOAP + REST via integrators | https://ebelge.gib.gov.tr/ | Mali Mühür / e-İmza | Massive | 🔴 High | 35–45 | See e-Fatura section. Most practically accessed via authorized integrators |
| **MERNİS (KPS)** | Central Population Registry | ⚠️ Institutional SOAP | N/A (NVİGM protocol) | Institutional | Core infrastructure | 🟡 Medium | 25–30 | TC Kimlik verification. SOAP. Authorized institutions only |
| **TAKBİS** | Land Registry system | ⚠️ Institutional | N/A (TKGM protocol) | Institutional | Core infrastructure | 🟡 Medium | 25–30 | Property records. Authorized institutions only |
| **UYAP** | National Judicial Network | ⚠️ Institutional SOAP | https://uyap.gov.tr/ | e-İmza / Mali Mühür | Core infrastructure | 🟡 Medium | 30–35 | Central integration hub for Turkish government. Lawyers via avukat.uyap.gov.tr |
| **SGK** | Social Security Institution | ⚠️ Institutional SOAP | Via GİB e-Beyan | e-İmza | Core infrastructure | 🟡 Medium | 25–30 | Employment records, payroll declarations. Access via HR/payroll integrators |

### 30. Product Marking

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **ÜTS (Product Tracking)** | Medical device/cosmetics tracking (TİTCK) | ⚠️ Institutional | https://utsuygulama.saglik.gov.tr/UTS/ | Registration credentials | Medium (~17K companies) | 🟡 Medium | 20–25 | Mandatory for medical/cosmetics. 25 modules. Note: Tobacco/alcohol tracked by TAPDK separately |

---

### 31. Real Estate

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Sahibinden.com** | Turkey's #1 classifieds (real estate, cars, everything) | ❌ No public API | N/A | N/A | Dominant (~$1.5B+ valuation) | 🔴 High | 60–80 | **Explicitly no API**. Litigated to prevent access. ToS prohibit scraping. Unofficial MCP scraper exists on GitHub |
| **Hepsiemlak** | Real estate portal (merged with Zingat 2024) | ⚠️ Partner API | https://developers.hemlak.com/ | API Key (partner only) | Large | 🟡 Medium | 30–40 | B2B partner API for listing management. Contact: realtyintegration@hepsiemlak.com |
| **Emlakjet** | Real estate portal (iLab Holding) | ❌ No API | N/A | N/A | Medium | 🟢 Low | 50–60 | No developer portal. GitHub repos from 2018 only |

### 32. EdTech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Udemy** | Global online learning (Turkish-founded) | ✅ Public API | https://www.udemy.com/developers/ | Basic Auth (API Key) | Global ($16B+) | 🔴 High | 15–20 | Affiliate API v2.0 + Instructor API v1.0. Community SDKs (Python) |
| **Mavianalitik** | Turkish edtech/analytics | 🔍 Unknown | N/A | Unknown | Small | 🟢 Low | N/A | Very limited information |
| **Kodluyoruz** | Coding education nonprofit | ❌ No API | N/A | N/A | Small | 🟢 Low | N/A | Nonprofit running bootcamps, not a platform |

### 33. Healthcare

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **DoktorTakvimi (DocPlanner)** | Healthcare appointment booking, 181K+ profiles | ✅ Public API (Partner) | https://integrations.docplanner.com/docs/ | API Key + IP Whitelist | Large (global DocPlanner) | 🔴 High | 25–35 | REST API v1.9.2. Facilities, doctors, calendars, slots, bookings. HATEOAS-based |
| **Acıbadem Sağlık** | Largest private hospital chain (29 hospitals) | ❌ No API | N/A | N/A | Major | 🟡 Medium | 60+ | Internal tech subsidiary. Partnership required |
| **e-Nabız** | Government health records (Ministry of Health) | ⚠️ Government restricted | N/A (SBYS vendor certification) | Gov auth | National (85M) | 🟡 Medium | 100+ | Requires Ministry certification. KVKK compliance. Not feasible without regulatory work |

### 34. Transport / Mobility

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **BiTaksi** | Turkey's #1 ride-hailing taxi app | ❌ No API | N/A | N/A | Large | 🟡 Medium | 50+ | Consumer app only. Major API gap |
| **Uber TR** | Uber Turkey (mostly licensed taxis) | ✅ Public API (global) | https://developer.uber.com/ | OAuth 2.0 | Medium (limited scope) | 🟡 Medium | 20–25 | Global API applies but limited Turkey-specific utility |
| **Martı** | E-scooter + ride-sharing (NASDAQ: MRTI) | ❌ No API | N/A | N/A | Large | 🟡 Medium | 50+ | Turkey's largest micro-mobility. No developer portal |
| **BinBin** | E-scooter + taxi platform | ❌ No API | N/A | N/A | Small | 🟢 Low | 50+ | Smaller player, no API |

### 35. Travel

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Obilet** | Bus/flight/ferry ticketing (BlaBlaCar) | ⚠️ B2B Partner API | N/A (internal B2B) | API Key | Large | 🔴 High | 30–40 | B2B API for agencies. 15M monthly visitors, 300+ bus firms. BlaBlaCar acquisition |
| **Enuygun** | Travel comparison (flights, hotels, buses) | ✅ **MCP ALREADY EXISTS** | https://mcp.enuygun.com/ | OAuth | Large | ✅ Done | 0 | **34 endpoints live**: Flights (10), Car Rental (10), Buses (10), Hotels (2), Account (4) |
| **Jolly Tur** | Tour operator | ❌ No API | N/A | N/A | Medium | 🟢 Low | 50+ | Traditional operator |
| **Tatilbudur** | Online travel agency | ❌ No API | N/A | N/A | Medium | 🟢 Low | 50+ | Consumer OTA |
| **Tatilsepeti** | Online travel agency | ❌ No API | N/A | N/A | Medium | 🟢 Low | 50+ | Consumer OTA |
| **Pegasus Airlines** | Low-cost Turkish airline | ⚠️ NDC Partner API | https://devportal.flypgs.com/Api | OTA credentials + IP whitelist | Large | 🔴 High | 40–50 | IATA NDC 24.1 standard. Certification required |
| **Turkish Airlines** | Flag carrier (340+ destinations) | ✅ Public API | https://developer.turkishairlines.com/ | API Key + Secret | Massive | 🔴 High | 20–30 | **Excellent**. Self-serve registration. Availability, timetable, reservations, miles. Node.js + PHP community libs |

### 36. Legal Tech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Lexpera** | Legal information system (legislation, court decisions) | ❌ No API | N/A | N/A | Medium | 🟢 Low | N/A | Subscription platform. *Note: yargi-mcp (660 stars) and mevzuat-mcp (163 stars) already cover Turkish legal databases* |

### 37. AgriTech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Tarfin** | Agricultural fintech (input financing) | ❌ No API | N/A | N/A | Medium | 🟢 Low | N/A | Fintech lending model, proprietary ML scoring |
| **Doktar** | Precision agriculture (satellite, weather, crop) | ✅ Public API Marketplace | https://www.doktar.com/en/api-marketplace/ | API Key | Medium | 🔴 High | 25–35 | **Hidden gem**. Weather forecasts, satellite plant health, water stress, nitrogen monitoring. Global coverage |

### 38. Construction

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Endeksa** | Real estate valuation/data | ⚠️ Possible API | https://www.endeksa.com/en/products/api-widget | Unknown | Small-Medium | 🟡 Medium | 20–30 | API & Widget products listed. Worth further investigation |
| *No other notable companies* | Turkish construction tech is nascent | N/A | N/A | N/A | N/A | 🟢 Low | N/A | Large sector but no tech companies with APIs identified |

---

## Existing MCP servers on GitHub for Turkish services

The Turkish MCP ecosystem is already emerging. **15+ repositories** were found, with developer **saidsurucu** being the most prolific contributor (6 servers, 1,300+ combined stars):

| Repository | Service | Stars | Status |
|-----------|---------|-------|--------|
| saidsurucu/yargi-mcp | Turkish Legal Databases (10+ courts) | **660** | Complete, Remote MCP |
| saidsurucu/borsa-mcp | BIST Stocks + BtcTurk + Forex + Gold | **512** | Complete, 26 tools |
| saidsurucu/mevzuat-mcp | Turkish Legislation (mevzuat.gov.tr) | **163** | Complete, 18 tools |
| saidsurucu/ihale-mcp | Government Tenders (EKAP) | — | Complete |
| saidsurucu/yoktez-mcp | YÖK Thesis Database | — | Complete |
| saidsurucu/yokatlas-mcp | University Program Data | — | Complete |
| **Enuygun (commercial)** | **Flights, Hotels, Buses, Car Rental** | **N/A** | **Production MCP at mcp.enuygun.com, 34 endpoints** |
| yusuf-eren/trendyol-yemek-mcp | Trendyol Yemek (food delivery) | — | In development |
| mahirkurt/Sahibinden.com-MCP-Server | Sahibinden.com (classifieds) | — | Unofficial scraper |
| Eneswunbeaten/MarketPricesMCP | Turkish Grocery Price Comparison | — | Functional (.NET) |
| EnesCinr/market-fiyatlari-mcp-server | Market Prices | — | Basic (TypeScript) |
| kiliczsh/mcp-turkce | TDK Turkish Dictionary | — | Complete |
| emredeveloper/MCP-Turkey-Weather | Turkey Weather | — | Basic (Python) |
| finmap-org/mcp-server | BIST Stock Data (multi-exchange) | — | Functional |

**Services with NO existing MCP despite having APIs:** iyzico, Craftgate, PayTR, Hepsiburada, n11, Papara, Getir, Yemeksepeti, Logo Yazılım, Parasut, Foriba/Sovos, Nilvera, Netgsm, İleti Merkezi, Turkish Airlines, MNG Kargo, Kolay İK, Bulutsantralim, DoktorTakvimi, Doktar.

---

## TOP 20 MCP Priority List

Ranked by: market size × API quality × no existing MCP × developer demand.

| Rank | Company | Category | API Quality | Why #1 Priority | Est. Hours |
|------|---------|----------|-------------|-----------------|------------|
| **1** | **Trendyol Marketplace** | E-Commerce | ⭐⭐⭐⭐⭐ | Turkey's #1 platform, $14B revenue, 360K sellers, REST, sandbox, docs in EN/TR. No MCP exists | 40–60 |
| **2** | **iyzico** | Payments | ⭐⭐⭐⭐⭐ | Market-leading payment gateway, 15 official SDKs, sandbox, marketplace/subscriptions. No MCP | 15–20 |
| **3** | **Foriba/Sovos** | e-Fatura | ⭐⭐⭐⭐⭐ | #1 e-Fatura integrator, mandatory for all businesses, official SDKs, REST+SOAP. No MCP | 40 |
| **4** | **Paraşüt** | Accounting | ⭐⭐⭐⭐⭐ | Turkey's #1 cloud accounting, REST API v4, OAuth2, JSON:API, multi-lang SDKs. No MCP | 30 |
| **5** | **Hepsiburada** | E-Commerce | ⭐⭐⭐⭐ | Turkey's #2 marketplace, 6 sub-APIs (marketplace, logistics, payment, delivery). No MCP | 40–60 |
| **6** | **Craftgate** | Payments | ⭐⭐⭐⭐⭐ | Payment orchestration, 6 official SDKs, clean REST, sandbox. Fastest to implement. No MCP | 12–18 |
| **7** | **Turkish Airlines** | Travel | ⭐⭐⭐⭐ | Flag carrier, 340+ destinations, self-serve API, community SDKs. No MCP | 20–30 |
| **8** | **Nilvera** | e-Fatura | ⭐⭐⭐⭐⭐ | Best REST API among e-Fatura integrators, Swagger docs, OAuth2. No MCP | 30 |
| **9** | **Logo Yazılım** | ERP | ⭐⭐⭐⭐ | Turkey's #1 ERP (Tiger/Netsis/j-Platform), REST API, OAuth2. No MCP | 60–80 |
| **10** | **Netgsm** | SMS/CPaaS | ⭐⭐⭐⭐⭐ | Major SMS gateway, official SDKs (NPM, Laravel), Postman. No MCP | 15–20 |
| **11** | **İleti Merkezi** | SMS/CPaaS | ⭐⭐⭐⭐⭐ | Best SMS developer experience, 6+ language SDKs. No MCP | 12–15 |
| **12** | **Papara** | Fintech/Wallet | ⭐⭐⭐⭐ | 21M users, official SDKs (PHP, Java, Android, iOS), merchant API. No MCP | 15–20 |
| **13** | **İş Bankası** | Banking | ⭐⭐⭐⭐ | Largest private bank, 40+ APIs, most comprehensive bank portal. No MCP | 20–30 |
| **14** | **MNG Kargo** | Logistics | ⭐⭐⭐⭐⭐ | Best courier API in Turkey (REST, self-service, sandbox, DHL). No MCP | 15–20 |
| **15** | **Bulutsantralim** | Cloud PBX | ⭐⭐⭐⭐⭐ | Clean REST API on GitHub, call management, CDR, webhooks. No MCP | 12–15 |
| **16** | **PayTR** | Payments | ⭐⭐⭐⭐ | Major payment gateway, REST, webhook notifications. No MCP | 15–20 |
| **17** | **Yemeksepeti** | Food Delivery | ⭐⭐⭐⭐ | Turkey's #1 food platform, modern REST + legacy SOAP APIs. No MCP | 45–60 |
| **18** | **Kolay İK** | HR | ⭐⭐⭐⭐ | Only Turkish HR platform with public API. Monopoly opportunity. No MCP | 25 |
| **19** | **DoktorTakvimi** | Healthcare | ⭐⭐⭐⭐ | Turkey's #1 healthcare booking, comprehensive REST API. No MCP | 25–35 |
| **20** | **Doktar** | AgriTech | ⭐⭐⭐⭐ | Unique agricultural API marketplace (satellite, weather, crop). No MCP | 25–35 |

---

## Key observations about the Turkish API ecosystem

**Turkey's API maturity is stratified into three tiers.** Tier 1 includes payments and marketplaces, where iyzico, Craftgate, Trendyol, and Hepsiburada offer REST APIs with sandboxes, SDKs, and English documentation matching global standards. Tier 2 covers banking and e-invoicing, where **7 of 10 major banks** now have developer portals and all e-Fatura integrators provide APIs by regulatory necessity. Tier 3 includes everything else — logistics, real estate, mobility, insurance — where SOAP dominates and many major platforms have no public API at all.

**The e-Fatura ecosystem is the single largest MCP opportunity.** Every Turkish business above TRY 3M revenue (TRY 500K for e-commerce) must use electronic invoicing through GİB. This creates a captive market of hundreds of thousands of businesses that depend on integrators like Foriba/Sovos, Nilvera, Turkcell e-Şirket, Logo, and Uyumsoft — all of which have APIs. An MCP server covering the top 3 integrators would serve virtually the entire Turkish B2B market.

**Authentication patterns are surprisingly consistent.** Turkish APIs overwhelmingly use **API Key + HMAC-SHA256 signature** patterns rather than standard OAuth2. This is true across iyzico, Craftgate, BtcTurk, PayTR, and most courier services. Notable exceptions are Parasut and Logo (OAuth2) and banks (mixed OAuth2/API Key). MCP implementations should build a shared Turkish HMAC auth module.

**SOAP remains pervasive in logistics and government.** All major couriers except MNG Kargo use SOAP/XML (Yurtiçi, Aras, Sürat, PTT). Government systems (MERNİS, UYAP, SGK, GİB) are exclusively SOAP. MCP implementations for these services will require SOAP-to-REST wrapper layers, increasing development time by **50–100%** versus REST equivalents.

**The mobility and classifieds sectors are API deserts.** Neither BiTaksi, Martı, nor BinBin offer any API. Sahibinden.com (Turkey's most-visited website) explicitly refuses API access and has successfully litigated against forced data sharing. These represent massive unmet demand but require partnership negotiation, not technical implementation.

**A Turkish MCP developer community already exists.** Developer saidsurucu has single-handedly built 6 MCP servers covering legal, financial, legislative, procurement, and academic data — accumulating **1,300+ GitHub stars**. Enuygun launched the first commercial Turkish MCP with 34 endpoints. This signals strong developer interest and a first-mover landscape that is still wide open for commercial services.

**Turkey's open banking regulation is accelerating API adoption.** Individual consumer accounts were opened to third-party access in December 2022, and the FAST Secure Payment Transaction Layer launched in May 2024. This regulatory push is driving banks toward better developer portals and will make banking MCP servers increasingly viable.

---

## Quick wins: services with well-documented APIs, no MCP, and high usage

These services can be implemented fastest due to excellent documentation, existing SDKs, and REST architecture:

| Service | Category | Why it's a quick win | Est. Hours | SDK Availability |
|---------|----------|---------------------|------------|-----------------|
| **Craftgate** | Payments | Cleanest API, 6 official SDKs (PHP/Node/Python/Go/.NET/Java), sandbox, comprehensive docs | **12–18** | ✅ Official 6-language |
| **Bulutsantralim** | Cloud PBX | Full API on GitHub, simple API key auth, RESTful, call management + webhooks | **12–15** | ✅ GitHub docs |
| **İleti Merkezi** | SMS | Best dev experience, official SDKs (Go/C#/Node/PHP), 100 free test credits | **12–15** | ✅ Official 4-language |
| **BtcTurk** | Crypto | Public REST API v2, Swagger docs, Python SDK, comprehensive endpoints. *borsa-mcp partially covers this* | **12–18** | ✅ Official Python |
| **Netgsm** | SMS | Official NPM + Laravel packages, Postman collection, well-documented REST | **15–20** | ✅ Official multi-platform |
| **iyzico** | Payments | Market leader, 15 SDKs, sandbox, Postman. Highest developer adoption | **15–20** | ✅ Official 7-language |
| **Papara** | Fintech | 21M users, official SDKs (PHP/Java/Android/iOS), simple API key auth | **15–20** | ✅ Official multi-platform |
| **MNG Kargo** | Logistics | Only REST courier API, IBM API Connect portal, self-service, sandbox | **15–20** | ⚠️ Portal-based |
| **Udemy** | EdTech | Public Affiliate API v2.0, Basic Auth, community SDKs | **15–20** | ✅ Community Python |
| **Paraşüt** | Accounting | REST API v4, OAuth2, JSON:API, multi-language SDKs. Turkey's #1 cloud accounting | **30** | ✅ Community multi-lang |

The combined estimated effort for all 10 quick wins is approximately **150–200 hours**, covering payments, communications, logistics, crypto, education, and accounting — a broad foundation for the Turkish MCP ecosystem.