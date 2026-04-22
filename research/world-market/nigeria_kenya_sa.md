# MCP Server Candidates Across Nigeria, Kenya, and South Africa

**Africa's API ecosystem is maturing fast, but unevenly.** Across 150+ companies investigated in Nigeria, Kenya, and South Africa, roughly 60 have public or semi-public APIs suitable for MCP server development. Payment gateways and communications platforms lead in API maturity, while insurance, healthcare, and agriculture remain largely closed ecosystems. Existing MCP servers already cover M-Pesa (3 implementations), Paystack, Flutterwave, and Luno — but the vast majority of high-value African APIs have zero MCP coverage, representing a massive greenfield opportunity. This report identifies the **45 highest-priority MCP candidates** (15 per country) with verified API documentation, authentication methods, and build estimates.

---

## Nigeria (NG)

### Market overview

Nigeria's **220 million population** and **136 million internet users** make it Africa's largest digital economy. The fintech sector dominates API development, with Paystack and Flutterwave offering world-class developer experiences. **Card + bank transfer** payments prevail alongside mobile money (OPay, PalmPay). English is the primary API language. The CBN Open Banking Framework exists but traditional banks have not yet opened public APIs — neobanks like Kuda fill the gap. Nigeria's BRICS partnership status is accelerating API infrastructure investment. The regulatory environment includes NIMC for identity, FIRS for tax, and SON for standards.

### Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| Jumia NG | Africa's largest e-commerce marketplace | ✅ Live | vendorcenter.jumia.com/api-docs/ (Seller); merchant-api-doc-pay.jumia.com.ng (JumiaPay) | API Key | Med | 15–20 | Seller API + JumiaPay; sandbox for payments |
| Konga | E-commerce marketplace | ❌ None | N/A | N/A | Low | N/A | Acquired by Zinox; no developer portal |
| Jiji.ng | Classifieds marketplace | ❌ None | N/A | N/A | Low | N/A | No API; Apify scrapers exist |
| Chowdeck | Fast-growing food delivery (YC S22) | ❌ None | N/A | N/A | Low | N/A | Founded by ex-Paystack engineers; Vendor Hub only |

### Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **Paystack** | Payment gateway (Stripe-acquired, dominant in NG) | ✅ Mature | paystack.com/docs/api/ | Bearer Token (Secret Key) | **High** | 24–32 | **20+ resource categories**; transactions, customers, plans, subscriptions, transfers, subaccounts, dedicated virtual accounts, BVN verification. REST/JSON. Sandbox via test keys. Existing MCP server. SDKs in 5+ languages |
| **Flutterwave** | Pan-African payments (150+ countries) | ✅ Mature (v3 + v4 beta) | developer.flutterwave.com | v3: Bearer Token; v4: OAuth2 | **High** | 24–32 | Payments, transfers, virtual accounts, BVN verification, bills. v4 adds OAuth2. Existing MCP server. Postman collection |
| Monnify | Payment gateway by Moniepoint/TeamApt | ✅ Live | developers.monnify.com | Bearer Token (API Key + Secret) | Med-High | 16–24 | Reserved accounts, disbursements, bills, POS integration. Sandbox available. This IS Moniepoint's developer API |
| Interswitch | Nigeria's first fintech unicorn, payment switching | ✅ Live | docs.interswitchgroup.com | OAuth2 (client credentials) | Med | 24–32 | Complex auth; Quickteller bills, card processing, Paycode, wallet. Enterprise-focused |
| Squad | Payment gateway by GTCO (GTBank parent) | ✅ Live | docs.squadco.com | Bearer Token (Secret Key) | Med | 16–20 | Cards, bank debit, USSD, virtual accounts, transfers. Sandbox with `sandbox_sk_` prefix |
| **Kuda Bank** | Nigeria's first mobile-only neobank | ✅ Live | docs.kuda.com; developer.kuda.com | API Key + Email → Token (15-min expiry) | **High** | 20–28 | Virtual accounts, fund transfers, bill payments, savings, cards. SDKs: PHP, Node.js, C#, Rust, Kotlin |
| Moniepoint | Unicorn ($1B+), 10M+ merchants, POS/banking | ✅ via Monnify | developers.monnify.com | Bearer Token | Med | — | Developer API IS Monnify; no separate portal |
| OPay | Mobile money super-app (35M+ users) | ❌ None | N/A | N/A | Low | N/A | Closed ecosystem despite massive user base |
| PalmPay | Mobile money app (35M+ users, Chinese-backed) | ❌ None | N/A | N/A | Low | N/A | No developer API; consumer-only |
| Paga | Pioneer mobile money/agent banking | ✅ Live | developer-docs.paga.com | SHA-512 HMAC + Basic Auth | Med | 20–24 | Money transfer, bills, airtime, merchant onboarding. Complex auth. IP whitelisting required |
| **Nomba** (ex-Kudi) | POS/payments infrastructure | ✅ Excellent | developer.nomba.com | OAuth2 (client credentials or PKCE) | **High** | 15–18 | Checkout, transfers, virtual accounts, **Global Payout API** (Mar 2026). OpenAPI spec available |
| Cowrywise | Investment-as-a-service (Embed API) | ✅ Live | developers.cowrywise.com | API Key/Bearer Token | Med-High | 16–20 | Unique: enables any app to offer savings/investments. SEC-regulated. Mutual funds, T-bills |

### Crypto and fintech

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| Quidax | SEC-licensed crypto exchange | ✅ Live | docs.quidax.io | Bearer Token (API Secret) | Med | 16–20 | Trading, wallets, deposits/withdrawals. 75+ cryptos. NGN/GHS/KES pairs |
| Luno NG | Global crypto exchange (DCG-owned) | ✅ Mature | luno.com/en/developers/api | API Key + Secret (Basic Auth) | Low | 0 | **Official MCP server exists** at github.com/luno/luno-mcp. REST + WebSocket |
| Piggyvest | Savings/investment platform | ❌ None | N/A | N/A | Low | N/A | Completely closed ecosystem |
| FairMoney | Digital bank/lending (12M+ users) | ❌ None | N/A | N/A | Low | N/A | No developer resources |
| Carbon | Digital lending/banking | ❌ None | N/A | N/A | Low | N/A | Consumer app only |

### Communications

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **Termii** | Messaging + verification API platform | ✅ Excellent | developers.termii.com | API Key (in request body) | **High** | 12–15 | SMS, WhatsApp, voice, email, OTP. **3M+ daily API calls**. 7-day test device IDs. Code samples in 5 languages |
| **Sendchamp** | Multi-channel messaging API | ✅ Excellent | developers.sendchamp.com | Bearer Token (Access Key) | **High** | 10–12 | SMS, WhatsApp, voice, email, OTP verification. **Full sandbox** at sandbox-api.sendchamp.com with $250 test credits |

### Logistics and delivery

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| GIG Logistics | Nigeria's largest courier company | ✅ Partnership | giglogistics.com/developer/ | API Key (partnership) | High | 15–20 | Shipping, tracking, rates, pickup scheduling. Not fully self-serve |
| Sendbox | API-first shipping platform | ✅ Excellent | docs.sendbox.co/shipping/introduction | API Key | High | 10–12 | Full lifecycle: quotes → create → track. Sandbox at sandbox.staging.sendbox.co |
| Topship | Shipping/logistics (YC W22) | ✅ Live | api-topship.com/shipping/docs | API Key (request via email) | Med-High | 12–15 | Partners with DHL, FedEx, UPS. Shopify app |
| Kwik Delivery | Same-day delivery | ✅ Live | apikwik.docs.apiary.io | Username/Password | Med | 10–12 | On-demand B2B delivery in Lagos, Abuja, Ibadan |
| Kobo360 | Freight/trucking marketplace | ❌ None | N/A | N/A | Low | N/A | Enterprise B2B; no public API |

### Business software and SaaS

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **SeamlessHR** | Africa's leading cloud HR/payroll | ✅ Live | docs.seamlesshr.com/reference/introduction | API Key/Token (login required) | **High** | 15–20 | Employee CRUD, payroll, leave, recruitment. ISO 27001 certified. $10M Series A |
| Remita (SystemSpecs) | Government payment/financial software | ✅ Live | api.remita.net; github.com/RemitaNet | API Key + Secret Key | High | 15–18 | RRR generation, collections, vending, agency banking. Sandbox at demo.remita.net |

### Government and compliance

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| NIMC (NIN) | National identity verification | ✅ Live | nimc.gov.ng/nimc-verification-service-api; app.ninauth.nimc.gov.ng/developers | RSA Private Key encryption | High | 15–18 | Virtual NIN tokenization. Requires NDA/MOU. Third-party providers (VerifyMe) offer easier access |
| FIRS (TaxProMax) | Federal tax filing | ⚠️ Limited | N/A (web portal) | N/A | Low | N/A | No public developer API |
| CAC | Company registry | ⚠️ Emerging | N/A | N/A | Low | N/A | AI-powered portal launched recently; no public API yet |

### Healthcare and insurance

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| Helium Health | Hospital/clinic EMR (YC, $30M Series B) | ⚠️ Internal | N/A (requires partnership) | N/A | High* | 20–25 | Africa's largest healthtech EMR; no public API but extremely valuable if obtained |
| Curacel | AI insurance infrastructure (YC) | ⚠️ Enterprise | Contact: grow@curacel.ai | N/A | Low-Med | 20–24 | Claims, fraud detection, embedded insurance. 10 markets. Not self-serve |

### Industry verticals

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| PropertyPro.ng | Property listings | ❌ None | N/A | N/A | Low | N/A | No API |
| uLesson | Education platform | ❌ None | N/A | N/A | Low | N/A | Consumer app only |
| FarmCrowdy/Thrive Agric/Releaf | AgriTech platforms | ❌ None | N/A | N/A | Low | N/A | No public APIs across all three |

### Top 15 MCP candidates for Nigeria (ranked)

| Rank | Company | Category | API Maturity | Market Reach | Est. Hours | Justification |
|------|---------|----------|-------------|-------------|------------|---------------|
| 1 | **Paystack** | Payments | ★★★★★ | ★★★★★ | 24–32 | Best-documented African API; 20+ resource categories; existing MCP to improve |
| 2 | **Flutterwave** | Payments | ★★★★★ | ★★★★★ | 24–32 | Pan-African; v3+v4; multi-currency; existing MCP to improve |
| 3 | **Termii** | Communications | ★★★★★ | ★★★★ | 12–15 | 3M+ daily calls; SMS/WhatsApp/Voice/OTP; no MCP exists |
| 4 | **Kuda Bank** | Banking | ★★★★ | ★★★★ | 20–28 | Only Nigerian neobank with full public API; 5+ SDKs |
| 5 | **Sendchamp** | Communications | ★★★★★ | ★★★ | 10–12 | Best sandbox experience; multi-channel messaging |
| 6 | **Nomba** | POS/Payments | ★★★★★ | ★★★★ | 15–18 | OAuth2, OpenAPI spec, new Global Payout API |
| 7 | **SeamlessHR** | HR/Payroll | ★★★★ | ★★★★ | 15–20 | Only enterprise HR API in Africa; ISO certified |
| 8 | **Sendbox** | Logistics | ★★★★ | ★★★ | 10–12 | API-first design; full shipping lifecycle |
| 9 | **Monnify** | Payments | ★★★★ | ★★★★ | 16–24 | Moniepoint's API arm; 100K+ merchants |
| 10 | **Remita** | Gov Payments | ★★★★ | ★★★★ | 15–18 | Government payment backbone; salary processing |
| 11 | **Cowrywise** | Investment | ★★★ | ★★★ | 16–20 | Unique embedded investment API; SEC-regulated |
| 12 | **NIMC (NIN)** | Identity | ★★★ | ★★★★★ | 15–18 | Critical KYC infrastructure; mandatory for compliance |
| 13 | **GIG Logistics** | Logistics | ★★★ | ★★★★ | 15–20 | Nigeria's largest courier; requires partnership |
| 14 | **Interswitch** | Switching | ★★★ | ★★★★★ | 24–32 | Deep infrastructure; Quickteller; enterprise-heavy |
| 15 | **Quidax** | Crypto | ★★★ | ★★ | 16–20 | SEC-licensed; full trading API; 75+ cryptos |

---

## Kenya (KE)

### Market overview

Kenya's **55 million people** and **33 million+ internet users** sit atop Africa's most mature mobile money ecosystem. **M-Pesa dominates payments** — processing more daily transactions than PayPal does across Africa. The country pioneered the "API-first" approach to financial services, with Africa's Talking (Kenyan origin) becoming the continent's #1 developer platform. Swahili and English serve as primary languages. Kenya's regulatory environment is API-progressive: **KRA made e-invoicing (eTIMS) mandatory**, creating a compliance API that every business needs. The Nairobi tech scene ("Silicon Savannah") produces strong developer talent and API culture.

### Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **M-Pesa Daraja** | World's #1 mobile money (50M+ users) | ✅ Mature | developer.safaricom.co.ke | OAuth 2.0 (Consumer Key + Secret → Bearer, 1hr expiry) | **High** | 15–20 | **STK Push, C2B, B2C, B2B, Account Balance, Transaction Status, Reversal, Tax Remittance, QR Code**. Sandbox at sandbox.safaricom.co.ke. **3 existing MCP servers** (mcp-daraja, mpesa-mcp, DarajaMCP) — opportunity to consolidate/improve |
| **Africa's Talking** | Pan-African developer API platform (Kenyan origin) | ✅ Excellent | developers.africastalking.com | API Key + Username header | **High** | 20–30 | **SMS, USSD, Voice (IVR, conference, queue), Airtime, Mobile Data, Payments (C2B, B2C, B2B, bank/card checkout), WhatsApp, IoT**. Sandbox at api.sandbox.africastalking.com. SDKs: Python, Node, Java, PHP, Ruby, Elixir, .NET, Go. Partial MCP exists (mpesa-mcp covers SMS/Airtime only) — **no complete AT MCP** |
| IntaSend | Kenyan-built payment gateway | ✅ Well-documented | developers.intasend.com/docs | API Token + Publishable Key | High | 12–15 | M-Pesa STK Push, B2B, B2C, bank payouts via PesaLink, wallet management. SDKs: Python, PHP, Node.js. Sandbox via `test=true` |
| Kopokopo (K2 Connect) | Kenya-focused M-Pesa integration | ✅ Good | api-docs.kopokopo.com; developers.kopokopo.com | OAuth 2.0 (Client ID + Secret) | High | 12–15 | STK Push, buygoods webhooks, PAY disbursements, polling API. Heavy webhook architecture. SDKs: Node, Ruby, Python, PHP, Flutter |
| PesaPal | East African payment gateway | ✅ Good (API 3.0) | developer.pesapal.com | Bearer Token (from auth endpoint) | Med | 10–12 | M-Pesa, Airtel Money, Visa, Mastercard. IPN-driven. Sandbox at demo.pesapal.com |
| Equity Bank (Jenga API) | Kenya's #2 bank, comprehensive API | ✅ Extensive | developer.jengahq.io | OAuth 2.0 + RSA Private Key signature | High | 18–22 | **64+ APIs**: Send money (Equity, M-Pesa, Airtel, PesaLink, RTGS, international), receive (EazzyPay, Lipa Na M-Pesa, cards), KYC/ID verification, CRB check, AML, forex, airtime. 6 East African countries |
| KCB Bank | Kenya's largest bank by assets | ⚠️ Limited | sandbox.buni.kcbgroup.com/devportal/apis | OAuth 2.0 | Low-Med | 8–10 | M-Pesa Express API primarily; Buni portal sandbox |
| Co-operative Bank | Major Kenyan bank | ⚠️ Limited | developer.co-opbank.co.ke:9443/store/ | OAuth 2.0 | Low-Med | 10–12 | Balance, transfers, mini-statements, M-Pesa integration. PHP SDK on GitHub |
| Airtel Money KE | Mobile money (pan-African) | ✅ Live | developers.airtel.africa | OAuth 2.0 (7200s expiry) | Med | 10–12 | Collection (USSD Push), disbursement, remittance, balance enquiry. 14+ African countries. Sandbox at openapiuat.airtel.africa |
| Paystack Kenya | Nigerian gateway, Kenya expansion | ✅ Live | paystack.com/docs/api/ | Bearer Token (Secret Key) | Med | 10–12 | M-Pesa STK Push via Paystack; transfers to M-Pesa wallets/Paybills/Tills |
| Flutterwave Kenya | Pan-African, M-Pesa support | ✅ Live | developer.flutterwave.com | Bearer Token (Secret Key) | Med | 10–12 | M-Pesa charge via `type=mpesa`; KES currency |
| Chipper Cash | Cross-border P2P payments | ⚠️ Limited | documenter.getpostman.com/view/18693070/UVz1Psag | User ID + API Key | Low | 6–8 | Merchant "Pay with Chipper" only; enterprise API requires partnership |
| NCBA Bank | Runs M-Shwari with Safaricom | ⚠️ Enterprise | ke.ncbagroup.com/payment-solution/api-solutions/ | Partnership required | Low | N/A | No public developer portal |

### Government and compliance

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **KRA eTIMS** | Mandatory e-invoicing system | ✅ Comprehensive | developer.go.ke/apis/eTims; Sandbox: etims-api-sbx.kra.go.ke; Production: etims-api.kra.go.ke/etims-api | OAuth2 token | **High** | 60–80 | **Device initialization, invoice submission, tax codes, UNSPSC, purchases, sales, stock, customs, PIN verification**. OSCU (online) + VSCU (bulk) paths. GavaConnect platform (1000+ devs, 16 APIs). Node.js and PHP SDKs on GitHub. 6-phase certification process |
| eCitizen | Digital government services portal | ⚠️ Limited | github.com/3xplisit/eCitizen-Kenya-API (unofficial) | HMAC-SHA256 (api_client_key + id) | Med | 20–30 | Payment gateway integration via iFrame; credentials via eCitizen team |
| NTSA | Vehicle/driver verification | ❌ None | N/A (portal at serviceportal.ntsa.go.ke) | N/A | Med* | N/A | High demand but no API; third-party proxy lookups exist |

### Commerce and delivery

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| Jumia Kenya | E-commerce marketplace | ✅ Multiple APIs | vendorcenter.jumia.com/api-docs/ (Seller); merchant-api-doc-pay.jumia.co.ke (JumiaPay) | API Key | High | 40–50 | Product CRUD, order management, JumiaPay with webhooks. 30 req/3s throttle |
| Glovo Kenya | Multi-category delivery (Delivery Hero) | ✅ Partner API | api-docs.glovoapp.com/partners/; qcommerce-integrations.glovoapp.com | Credentials-based | High | 30–40 | Order API (POS integration), Stock & Price API, staging environment. Python/PHP SDKs |
| Sendy (SendyIT) | On-demand delivery/logistics | ✅ Live | sendypublicapi.docs.apiary.io | API credentials | High | 25–35 | Delivery cost estimation, order creation, tracking. WooCommerce, PrestaShop, Odoo plugins |
| Kilimall | E-commerce platform | ❌ None | N/A | N/A | Low | N/A | No public API found |

### Industry verticals

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| Travelstart KE | Online travel agency | ✅ Flight API | docs.travelstart.com | Partnership-based | Med | 30–40 | Open Travel Alliance XML schemas; partnership required |
| M-Tiba/CarePay | Mobile health wallet (4M+ users) | ⚠️ B2B only | N/A | Partnership | Med | 30–40 | Eligibility checks, claims processing; no public portal |
| Twiga Foods | B2B food distribution | ❌ None | N/A (github.com/twigaeng internal) | N/A | Low | N/A | M-Pesa Daraja integration internally; no external API |
| Apollo Agriculture | Precision farming/credit | ❌ None | N/A | N/A | Low | N/A | Internal ML/satellite platform; no developer access |
| BuyRentKenya | Property listings portal | ❌ None | N/A | N/A | Low | N/A | Owned by Ringier/ROAM; no API |
| BrighterMonday | Job board | ❌ None | N/A | N/A | Low | N/A | No developer portal |
| Eneza Education | Mobile learning | ❌ None | N/A | N/A | Low | N/A | Consumer-facing only |

### Insurance

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| Turaco | Embedded micro-insurance (1M+ customers) | ❌ None | N/A | N/A | Low | N/A | B2B partnership model only; competitor **Lami** (lami.insure) has a public insurance API worth investigating |
| Pula | Agricultural insurance | ❌ None | N/A | N/A | Low | N/A | Enterprise/government model |
| ICEA Lion | Traditional insurer | ❌ None | N/A | N/A | Low | N/A | Underwriter for insurtechs; no API |

### Top 15 MCP candidates for Kenya (ranked)

| Rank | Company | Category | API Maturity | Market Reach | Est. Hours | Justification |
|------|---------|----------|-------------|-------------|------------|---------------|
| 1 | **Africa's Talking** | Communications | ★★★★★ | ★★★★★ | 20–30 | 6+ products (SMS, USSD, Voice, Airtime, Payments, IoT), 20+ countries; **no complete MCP exists** |
| 2 | **M-Pesa Daraja** | Mobile Money | ★★★★★ | ★★★★★ | 15–20 | World's #1 mobile money; 3 partial MCPs exist — consolidate into comprehensive version |
| 3 | **KRA eTIMS** | Government/Tax | ★★★★ | ★★★★★ | 60–80 | **Mandatory** e-invoicing for all Kenyan businesses; GavaConnect platform; high complexity |
| 4 | **Equity Bank Jenga** | Banking | ★★★★ | ★★★★ | 18–22 | 64+ APIs; most comprehensive bank API in East Africa; KYC + payments + forex |
| 5 | **IntaSend** | Payments | ★★★★ | ★★★ | 12–15 | Best Kenyan-built gateway DX; M-Pesa STK + bank payouts; good SDKs |
| 6 | **Kopokopo** | Payments | ★★★★ | ★★★ | 12–15 | Excellent webhook architecture; M-Pesa for businesses; multiple SDKs |
| 7 | **Jumia Kenya** | Commerce | ★★★★ | ★★★★ | 40–50 | Dual API (Seller + JumiaPay); Kenya-specific endpoints |
| 8 | **Glovo Kenya** | Delivery | ★★★★ | ★★★ | 30–40 | Partner API for orders + stock/price management; staging environment |
| 9 | **Sendy** | Logistics | ★★★ | ★★★ | 25–35 | Public delivery API with e-commerce plugins; serves 3000+ businesses |
| 10 | **PesaPal** | Payments | ★★★★ | ★★★ | 10–12 | API 3.0 with IPN; M-Pesa + cards; East Africa coverage |
| 11 | **Airtel Money** | Mobile Money | ★★★ | ★★★ | 10–12 | Pan-African mobile money API; 14+ countries |
| 12 | **Paystack Kenya** | Payments | ★★★★ | ★★★ | 10–12 | M-Pesa via Paystack; familiar API for Nigerian developers expanding east |
| 13 | **Flutterwave Kenya** | Payments | ★★★★ | ★★★ | 10–12 | M-Pesa charge type; multi-currency East Africa |
| 14 | **Travelstart KE** | Travel | ★★★ | ★★ | 30–40 | Flight API with OTA XML; partnership required |
| 15 | **Co-operative Bank** | Banking | ★★ | ★★★ | 10–12 | Limited but functional; balance, transfers, M-Pesa |

---

## South Africa (ZA)

### Market overview

South Africa's **60 million people** and **40 million internet users** form the continent's most mature API ecosystem. As a **BRICS founding member**, SA has sophisticated financial infrastructure — the "Big 4" banks (FNB, Standard Bank, Nedbank, ABSA) plus disruptors like Capitec and TymeBank. **Card payments and instant EFT dominate** over mobile money (unlike Kenya/Nigeria). Nedbank leads open banking; Capitec Pay and PayShap are emerging but not yet developer-accessible. SA-origin companies Clickatell and BulkSMS have become global messaging platforms. The AWS Cape Town region provides local cloud infrastructure. SARS eFiling and CIPC provide government API access points. ZAR is the sole currency.

### Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **PayFast** | Major SA payment gateway (Network International) | ✅ Mature | developers.payfast.co.za; developers.payfast.co.za/api | Merchant ID + Key + Passphrase (HMAC-MD5) | **High** | 20–25 | Payments, subscriptions (pause/unpause/cancel), tokenization, refunds, ITN webhooks. Sandbox at sandbox.payfast.co.za. PHP SDK on GitHub |
| **Yoco** | SA POS/payments (200K+ merchants) | ✅ Excellent | developer.yoco.com | Bearer Token (`sk_test_` / `sk_live_`) | **High** | 15–20 | Checkout API, payments, refunds, webhooks. Clean modern REST. ZAR-only. Plugins: WooCommerce, Wix, Shopify |
| Peach Payments | Payment orchestration for enterprise | ✅ Good | developer.peachpayments.com | Entity ID + Username + Password | Med | 25–30 | Cards, EFT, mobile money, BNPL, payment links, tokenization. PCI DSS Level 1. Enterprise-focused |
| PayGate | Enterprise card processing (DPO/Network) | ✅ Good | developer.paygate.co.za; docs.paygate.co.za | PayGate ID + Encryption Key (MD5) | Med | 20–25 | PayWeb3 (REST), PayHost (SOAP), PayBatch, PaySubs. Sandbox with test ID 10011072130 |
| **Ozow** | Instant EFT payments (47M bank account holders) | ✅ Good | ozow.com/integrations; api.i-pay.co.za/guide/payment | Token-based + SHA512 hash | **High** | 15–20 | Bank-to-bank instant payments, refunds, payment links, QR. Free first R1M/year. Works with 9+ SA banks. Payment API for selected merchants |

### Banks

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **Nedbank** | SA's open banking pioneer | ✅ Full API marketplace | apim.nedbank.co.za | OAuth 2.0 | **High** | 25–30 | **Best SA bank API**: Customers, Accounts, Rewards, Funds Transfer, Open Data (branches, banks), Vehicle Finance. Won "Best Open Banking APIs SA 2021". Self-service portal |
| Standard Bank | Africa's largest bank by assets | ⚠️ Portal exists | developer.standardbank.com/APIMarketplace/s/ | OAuth 2.0 (expected) | Low | N/A | Owns SnapScan; API Marketplace requires partnership/registration |
| FNB | Big 4 bank (FirstRand Group) | ⚠️ Business only | fnb.co.za/integration-channel/ | Online Banking profile | Low | N/A | DebiCheck, EFT Collections/Payments. Requires business banking relationship |
| ABSA | Big 4 bank (ex-Barclays Africa) | ⚠️ Portal exists | developer.absa.africa | OAuth 2.0 (expected) | Low | N/A | Developer portal exists; limited public information |
| Capitec | Largest SA bank by customers (21M+) | ⚠️ Closed | N/A | Via partners (Ozow, Stitch) | Low | N/A | Capitec Pay (3.5M users, 12.5M txn/month) via TPPP partners only |
| TymeBank | Digital-only bank (GoTyme) | ❌ None | N/A | N/A | Low | N/A | Consumer-facing only; no developer API |
| Discovery Bank | Behavioral banking (Vitality-linked) | ❌ None | N/A | N/A | Low | N/A | Closed ecosystem |

### Crypto and investment

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **VALR** | Africa's leading crypto exchange (1.5M+ users) | ✅ Institutional-grade | docs.valr.com | HMAC-SHA512 (X-VALR-API-KEY, X-VALR-SIGNATURE, X-VALR-TIMESTAMP) | **High** | 30–35 | **Spot, margin, perpetual futures trading**; order book, wallet, deposits/withdrawals, VALR Pay, wire transfers, batch orders. REST + WebSocket. Sub-account support. Maker rebate: -0.1%. Backed by Coinbase Ventures, Pantera Capital |
| Luno ZA | Major crypto exchange (DCG-owned) | ✅ Mature | luno.com/en-za/api | API Key + Secret (Basic Auth) | Done | 0 | **Official MCP server at github.com/luno/luno-mcp** (Go, MIT, 13 stars). Trading, wallet, order book, candles. Docker support |
| EasyEquities | Fractional share investing (700K+ clients) | ❌ No official API | N/A | N/A | Med-High* | 30–40 | **Massive user demand but NO API**. Unofficial Python scrapers exist on GitHub. JSE, US markets, crypto. Monitor for future API |
| MTN MoMo ZA | Mobile money wallet | ✅ Pan-African portal | momodeveloper.mtn.com | API Key + OAuth 2.0 | Med | 20 | Collections, disbursements, remittances, balance. Sandbox available. SA mobile money adoption is lower |

### Communications

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **Clickatell** | SA-origin global chat commerce platform | ✅ Comprehensive | docs.clickatell.com; clickatell.github.io | API Key/Token | **High** | 20–30 | **One API (unified SMS + WhatsApp), SMS API (100 msg/sec, 230+ territories, 1000+ carriers), WhatsApp Business API, Chat 2 Pay, Chat Flow, Marketplace APIs (12+ including Reserve & Transact, Bank Interfaces, Security Service)**. SDKs: Python, PHP, Java, Node, C#, C++, Android, iOS |
| BulkSMS | SA-origin global bulk SMS | ✅ Good | bulksms.com/developer/json/v1/ | Basic Auth (base64) | Med | 8–12 | Send/receive SMS, delivery reports, number lookup. REST JSON. Postman collection |

### Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **Takealot** | SA's largest e-commerce (Naspers) | ✅ Seller API | seller-api.takealot.com/api-docs/ (Swagger) | API Key (from Seller Portal) | **High** | 12–16 | List/count/update offers, stock, pricing, sales webhooks. 3rd-party integrators: Stock2Shop, Wherehouse |
| Bidorbuy | SA marketplace | ❌ None | N/A | N/A | Low | N/A | No public API found |
| Superbalist | Fashion e-commerce (Takealot group) | ❌ None | N/A | N/A | Low | N/A | No public API |
| Checkers Sixty60 | Grocery delivery (Shoprite group) | ❌ None | N/A | N/A | Low | N/A | No public API |
| Mr D Food | Food delivery (Naspers/Takealot) | ❌ None | N/A | N/A | Low | N/A | No public API; POS integrations via partners only |

### Logistics and delivery

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **Bob Go** (ex-uAfrica) | Multi-courier shipping aggregator | ✅ Open API | api-docs.bob.co.za/bobgo | Auth token | **High** | 14–18 | Aggregates 10+ couriers (TCG, Pargo, RAM, SkyNet). Rate quotes, waybills, tracking. Shopify/WooCommerce integrations. R749+/month plans |
| Pargo | Click-and-collect (4000+ points) | ✅ Live (Simba API) | docs.pargo.co.za | Auth Token + Map Token | Med | 10–14 | Shipments, tracking, Pargo Points lookup, waybill generation. WooCommerce/Shopify/Magento plugins |
| The Courier Guy | Major SA courier (200+ kiosks) | ✅ via Ship Logic | api-docs.shiplogic.com | API credentials | Med | 10–14 | Quoting, waybill creation, tracking. Sandbox. Bob Go already aggregates TCG |
| Imperial Logistics | Freight/logistics | ❌ None | N/A | N/A | Low | N/A | Enterprise freight; no public API |

### Business software and SaaS

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **Sage SA** | Cloud accounting/ERP (#1 in SA) | ✅ Full REST API | sage.com/en-za/sage-business-cloud/accounting/developer-api/; SA API at accounting.sageone.co.za | Basic Auth (base64) | **High** | 16–22 | **100+ API services**: Companies, Customers, Suppliers, Products, Invoices, Quotes, Bank Accounts, Tax, Journals, Assets. **SA uses v2.0.0** (different codebase from global). 5000 req/day |
| SYSPRO | SA-origin ERP for manufacturing | ✅ Comprehensive | developer.syspro.com | Session-based (Logon → SessionID) | Med-High | 20–30 | OData API, Business Objects (XML), Open Reporting, e.net Solutions. Complex enterprise integration |
| PNET | Job board | ❌ None | N/A | N/A | Low | N/A | No API |
| CareerJunction | Job board | ❌ None | N/A | N/A | Low | N/A | No API |

### Government and compliance

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| **CIPC** | Company/IP registration | ✅ APIVerse Hub | apim.cipc.co.za | OAuth 2.0 | **High** | 12–16 | Company Search, Disqualified Directors, Documents, IP (trademarks/patents), Streaming API. XBRL coming soon |
| SARS eFiling | Tax filing/returns | ⚠️ ISV program | sars.gov.za → ISV program | OAuth2 (via ISV) | Med | 20–30 | ITR12, ITR14, EMP501, VAT, PAYE. Requires ISV registration. SFTP-based |

### Insurance

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| Discovery | SA's largest insurer/health group | ❌ None | N/A | N/A | Low | N/A | Vitality data extremely valuable but completely closed |
| Naked Insurance | InsurTech disruptor (IFC, Naspers-backed) | ❌ None | N/A | N/A | Low | N/A | AI chatbots Rose/Jade; entirely app-based, no API |
| Pineapple | P2P insurance | ❌ None | N/A | N/A | Low | N/A | No developer API |

### Industry verticals

| Company | What it does | API Status | API Docs URL | Auth Type | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|------------|-------|
| Property24 | SA's largest property portal (Naspers) | ⚠️ Syndication only | sync2.docs.apiary.io (via Entegral) | API-based | Med | 10–14 | Agent listing syndication via Sync API; no public search API |
| Aerobotics | AI drone/satellite agriculture | ❌ None | N/A | N/A | Low | N/A | Platform-only; no public API |
| Discovery Health | Health insurance (40%+ market) | ❌ None | N/A | N/A | Low | N/A | Highly regulated; completely closed |
| GetSmarter | Online education (2U/edX) | ❌ None | N/A | N/A | Low | N/A | Course marketplace only |
| FlySafair | Budget airline | ❌ None | N/A | N/A | Low | N/A | No booking API |

### Top 15 MCP candidates for South Africa (ranked)

| Rank | Company | Category | API Maturity | Market Reach | Est. Hours | Justification |
|------|---------|----------|-------------|-------------|------------|---------------|
| 1 | **Clickatell** | Communications | ★★★★★ | ★★★★★ | 20–30 | SA-origin global platform; 20+ API endpoints; SMS + WhatsApp + Chat 2 Pay + Marketplace |
| 2 | **VALR** | Crypto | ★★★★★ | ★★★★ | 30–35 | Africa's leading exchange; spot/margin/futures; REST + WebSocket; institutional-grade |
| 3 | **PayFast** | Payments | ★★★★ | ★★★★★ | 20–25 | Most popular SA gateway; subscriptions, tokenization, refunds |
| 4 | **Yoco** | Payments/POS | ★★★★★ | ★★★★ | 15–20 | 200K+ merchants; cleanest modern API; excellent DX |
| 5 | **Sage SA** | Accounting | ★★★★ | ★★★★★ | 16–22 | 100+ API services; SA's dominant accounting platform; unique SA v2.0.0 codebase |
| 6 | **Ozow** | Instant EFT | ★★★★ | ★★★★ | 15–20 | Unique instant bank-to-bank payments; 47M bank accounts; free first R1M |
| 7 | **Nedbank** | Banking | ★★★★ | ★★★★ | 25–30 | SA's best open banking API; Customers, Accounts, Rewards, Transfers |
| 8 | **Takealot** | Commerce | ★★★★ | ★★★★★ | 12–16 | SA's #1 e-commerce; Swagger-documented Seller API |
| 9 | **Bob Go** | Logistics | ★★★★ | ★★★ | 14–18 | Multi-courier aggregator; single API for 10+ SA couriers |
| 10 | **CIPC** | Government | ★★★ | ★★★★ | 12–16 | Rare government API; company/IP search; OAuth 2.0 APIVerse Hub |
| 11 | **SYSPRO** | ERP | ★★★ | ★★★ | 20–30 | SA-origin ERP; OData + Business Objects APIs; manufacturing/distribution |
| 12 | **BulkSMS** | Communications | ★★★★ | ★★★ | 8–12 | SA-origin; simple, focused SMS API; REST JSON |
| 13 | **Peach Payments** | Payments | ★★★★ | ★★★ | 25–30 | Enterprise payment orchestration; PCI DSS Level 1 |
| 14 | **Pargo** | Logistics | ★★★ | ★★★ | 10–14 | Click-and-collect network; Simba API; 4000+ points |
| 15 | **MTN MoMo ZA** | Mobile Money | ★★★ | ★★★ | 20 | Pan-African mobile money; financial inclusion use case |

---

## Existing MCP servers already on GitHub

Before building new servers, teams should evaluate and potentially extend these existing implementations:

| MCP Server | Repository | Coverage | Language | Status |
|------------|-----------|----------|----------|--------|
| **Luno MCP** (official) | github.com/luno/luno-mcp | Luno crypto exchange (SA, NG) | Go | ✅ Production (13 stars, MIT) |
| **Africa Payments MCP** | github.com/kenyaclaw/africa-payments-mcp | Paystack, Flutterwave, M-Pesa, MTN MoMo, Chipper Cash | — | ✅ Listed on Glama.ai |
| **Safaricom Daraja MCP** | meshhack/safaricom-daraja-mcp | M-Pesa STK Push, transaction queries | Node.js (npm: mcp-daraja) | ✅ Published |
| **M-Pesa MCP** | gabrielmahia/mpesa-mcp | M-Pesa + Africa's Talking SMS/Airtime | Python (PyPI: mpesa-mcp) | ✅ Published (Mar 2026) |
| **DarajaMCP** | jameskanyiri/DarajaMCP | M-Pesa STK Push, document processing | Python | ✅ Published |
| **Mono Banking MCP** | sin4ch/mono-mcp | Nigerian banking via Mono Open Banking | Python (FastMCP) | ✅ 12 tools + webhooks |
| **Paystack MCP** | PipedreamHQ/awesome-mcp-servers listing | Paystack API | — | ✅ Listed |
| **Flutterwave MCP** | PipedreamHQ/awesome-mcp-servers listing | Flutterwave API | — | ✅ Listed |

---

## Cross-country architecture patterns that emerged

Every major African API follows **REST/JSON architecture** — no GraphQL implementations were found across any of the 150+ companies researched. This simplifies MCP server development as all integrations share a common paradigm. Authentication splits into three tiers:

**Simple Bearer Token** dominates payment gateways (Paystack, Flutterwave, Yoco, Squad, Termii, Sendchamp). These are the fastest to implement as MCP servers, typically requiring **10–20 hours**. The token is passed in the Authorization header, and sandbox environments use separate test keys.

**OAuth 2.0** is standard for banking and government APIs (M-Pesa Daraja, Kopokopo, KRA eTIMS, Nedbank, CIPC, Airtel Money). These require token refresh logic and typically **15–30 hours** to implement. M-Pesa tokens expire hourly; Kuda tokens expire every 15 minutes.

**HMAC signature-based** authentication is used by crypto exchanges and some legacy systems (VALR uses HMAC-SHA512, Paga uses SHA-512, PayFast uses HMAC-MD5). These add implementation complexity — **20–35 hours** — but provide stronger security for financial operations.

A critical architectural note: **Africa's Talking USSD is entirely callback-driven** — the platform POSTs to your server, and your server responds with menu text. This inverts the typical API client model and requires a persistent webhook receiver, adding complexity to any MCP implementation.

## The 10 highest-priority MCP servers across all three countries

Consolidating across all three markets, these represent the greatest impact-to-effort ratio for a development team:

| Rank | Company | Country | Category | Est. Hours | Why build first |
|------|---------|---------|----------|------------|----------------|
| 1 | **Africa's Talking** | KE (pan-African) | Communications | 20–30 | 6+ products, 20+ countries, **no complete MCP exists** — only partial SMS/Airtime coverage |
| 2 | **Paystack** | NG (pan-African) | Payments | 24–32 | Africa's most-used payment API; existing MCP needs expansion to cover 20+ resource categories |
| 3 | **Clickatell** | ZA (global) | Communications | 20–30 | 20+ API endpoints; SMS + WhatsApp + Chat Commerce + Marketplace; zero MCP coverage |
| 4 | **M-Pesa Daraja** | KE | Mobile Money | 15–20 | World's #1 mobile money; 3 MCPs exist but none is comprehensive — consolidate and extend |
| 5 | **VALR** | ZA | Crypto/Trading | 30–35 | Africa's leading exchange; institutional-grade REST + WebSocket; zero MCP coverage |
| 6 | **Termii** | NG | Communications | 12–15 | 3M+ daily API calls; SMS/WhatsApp/Voice/OTP; zero MCP coverage; fast to build |
| 7 | **KRA eTIMS** | KE | Government/Tax | 60–80 | **Mandatory** e-invoicing; every Kenyan business needs this; high complexity but enormous impact |
| 8 | **Kuda Bank** | NG | Banking | 20–28 | Only Nigerian neobank with full API; virtual accounts, transfers, bills, savings, cards |
| 9 | **Yoco** | ZA | Payments/POS | 15–20 | 200K+ SA merchants; cleanest modern API; zero MCP coverage |
| 10 | **Sage SA** | ZA | Accounting | 16–22 | 100+ API services; SA's dominant accounting platform; unique SA-specific codebase |

## Where the gaps are widest

The starkest finding across all three countries is that **insurance, healthcare, agriculture, and real estate have essentially zero public APIs**. Discovery (SA's largest insurer), Naked Insurance, Helium Health, Twiga Foods, Apollo Agriculture, and Property24 — all large, well-funded companies — operate as closed ecosystems. This represents both a limitation for near-term MCP development and an advocacy opportunity. If any of these companies open APIs, the MCP opportunity would be enormous: Discovery's Vitality health data alone could power transformative AI integrations. In the near term, **aggregator APIs** like MyCover.ai (Nigerian insurance), Mono/Okra (Nigerian banking), and Stitch (SA banking) may provide workaround access to these closed platforms and warrant investigation as alternative MCP targets.

The Nigerian government API landscape is similarly sparse — FIRS (tax), CAC (company registry), and most state services lack developer access. Kenya's GavaConnect platform and South Africa's CIPC APIVerse Hub show what's possible when governments prioritize API infrastructure. Nigeria's NIMC (identity verification) stands as the sole functional government API, critical for KYC compliance but requiring formal partnership to access.