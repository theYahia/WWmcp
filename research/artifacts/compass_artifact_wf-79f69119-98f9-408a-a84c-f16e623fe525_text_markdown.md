# MCP Server Candidates: Deep Verification Across Georgia, Armenia, Azerbaijan, Belarus, and Moldova

**Bottom line: Of 55+ services investigated across five post-Soviet states, only ~18 have functional public APIs, and just one (Wildberries) has existing MCP servers.** Georgia leads the region with TBC Bank and Bank of Georgia offering PSD2-compliant Open Banking APIs that rival Western European standards. Moldova's 999.md and Belarus's bePaid represent the fastest MCP builds. Sanctions create hard blockers for most Belarusian government and Russian-owned services. The overwhelming majority of classifieds, ride-hailing, and government platforms across all five countries have **zero public API access**.

---

## GEORGIA

### TBC Bank API (Georgia)

- **Developer Portal**: https://developers.tbcbank.ge (verified, active — hosted on Readme.io)
- **API Status**: Active — Comprehensive multi-product API platform
- **Base URL**: Production: `https://api.tbcbank.ge` · Sandbox: `https://test-api.tbcbank.ge`
- **Auth**: Dual model — API Key + Client Secret for merchant products; **OAuth 2.0** for Open Banking/PSD2 XS2A
- **Key Endpoints**: E-Commerce checkout (create/cancel payments, recurring, split payments), exchange rates, online installments, mortgage leads, **PSD2 XS2A** (account info, payment initiation)
- **Rate Limits**: HTTP 429 documented; specific limits not public
- **Sandbox**: Yes — dedicated sandbox with Postman collections and test credentials
- **Official SDK**: C# (.NET) — 5+ packages on GitHub (@TBCBank); PHP (Geopaysoft/TBC-Checkout); Community: Laravel, .NET
- **Existing MCP**: None found
- **Docs Quality**: 4/5 — English + Georgian; interactive "Try It" feature, Postman collections, error reference, Go-LIVE checklists
- **Est. MCP Build**: **S** (<1 week)
- **Notes**: Developer account via https://myapps.tbcbank.ge. QWAC certificate needed for Open Banking production. Georgia's most mature API — 12 GitHub repos. PSD2 XS2A sandbox fully operational. Contact: developers@tbcbank.ge

---

### Bank of Georgia / iPay API (Georgia)

- **Developer Portal**: https://api.bog.ge/docs/en/ (verified, Docusaurus-based)
- **API Status**: Active — Comprehensive multi-product API marketplace
- **Base URL**: Production: `https://ipay.ge/opay/api/v1` · Sandbox: `https://dev.ipay.ge/opay/api/v1` (public demo credentials available: client_id `1006`)
- **Auth**: OAuth 2.0 + JWT (Basic Auth for token, Bearer JWT for calls); QWAC for Open Banking
- **Key Endpoints**: Payment Manager (checkout, refunds, pre-auth, Google/Apple Pay), **NextGenPSD2 XS2A** (AIS, PIS, XAIS, XPIS, Identity Assurance), Business Internet Banking (transfers), BOG-ID
- **Rate Limits**: Not documented
- **Sandbox**: Yes — `dev.ipay.ge` with public demo credentials
- **Official SDK**: npm `@bank-of-georgia/ipay-sdk`; Community: .NET, Laravel, Drupal
- **Existing MCP**: None found
- **Docs Quality**: 4/5 — English + Georgian; Berlin Group NextGenPSD2 standard
- **Est. MCP Build**: **S-M** (1–2 weeks)
- **Notes**: Merchant registration via businessonline.bog.ge. Full NextGenPSD2 implementation including Identity Assurance. Copyright 2026 confirms active maintenance.

---

### Liberty Bank API (Georgia)

- **Developer Portal**: Not found
- **API Status**: No Public API — Open Banking claimed on website but no technical docs
- **Base URL**: N/A
- **Auth**: Unknown
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5 — Marketing-level Open Banking page only
- **Est. MCP Build**: **XL** (1+ month)
- **Notes**: Georgia's 3rd largest bank. Open Banking compliance appears mandated by NBG but not developer-accessible. Requires direct partnership or integration via third-party aggregator (integrals.ge).

---

### rs.ge API — Revenue Service (Georgia)

- **Developer Portal**: Not found (no dedicated portal). WSDL specs directly accessible.
- **API Status**: Active — **SOAP/WSDL only** (not REST)
- **Base URL**: Waybill: `http://services.rs.ge/WayBillService/WayBillService.asmx?WSDL` · E-Invoice: `https://webserv.rs.ge/SpecInvoices/SpecInvoicesService.asmx?WSDL`
- **Auth**: Service User credentials (username/password) + **IP whitelisting required**
- **Key Endpoints**: Waybill CRUD, e-Invoice operations, TIN→name resolution, transport/unit dictionaries, service user management
- **Rate Limits**: Not documented
- **Sandbox**: No — production API only
- **Official SDK**: None. Community: Ruby (`dimakura/rs.ge`, 5★, 320 commits — most mature), Python (`RealJTG/rsge`), Postman collection
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — Georgian only. WSDL is self-documenting. Ruby gem README is best practical reference.
- **Est. MCP Build**: **L** (2–4 weeks)
- **Notes**: **CRITICAL** — mandatory for all Georgian businesses. SOAP-only is a major technical hurdle. IP whitelisting complicates deployment. Two distinct WSDL services. Field names in Georgian.

---

### my.gov.ge API (Georgia)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: Georgian ID card / FaceID
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **XL** / Not feasible
- **Notes**: Citizen-facing portal only. No developer program. Would require scraping with legal/ToS concerns.

---

### NAPR — Public Registry (Georgia)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A (portal at public.reestri.gov.ge)
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **XL** / Not feasible
- **Notes**: Data legally "public" per Georgian law but no API. Uses authorized partner model for data access. Requires partnership agreement.

---

### MyAuto.ge (Georgia)

- **Developer Portal**: Not found
- **API Status**: Unofficial/Undocumented REST API (internal, used by mobile app)
- **Base URL**: Internal endpoints discovered via Postman collection
- **Auth**: Unknown (session/token-based)
- **Key Endpoints**: Fetch manufacturers, vehicle search with filters, VIN check
- **Rate Limits**: Not documented (IP blocking risk)
- **Sandbox**: No
- **Official SDK**: None. Community: Postman collection, Python/Scrapy scraper
- **Existing MCP**: None found
- **Docs Quality**: 1/5 — Unofficial only
- **Est. MCP Build**: **M** (if using undocumented endpoints)
- **Notes**: Largest auto portal in Caucasus (250K+ listings). No official API — reverse-engineered only. ToS violation risk.

---

### ss.ge (Georgia)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **L** / Not feasible
- **Notes**: Georgia's main real estate platform. Zero public API or developer resources.

---

### Glovo GE (Georgia)

- **Developer Portal**: https://qcommerce-integrations.glovoapp.com/ (Partner/POS API); Business API docs at api-docs.glovoapp.com (restricted)
- **API Status**: Active (Partner API + Business API)
- **Base URL**: Production: `https://api.glovoapp.com/` · Staging: `https://stageapi.glovoapp.com/`
- **Auth**: API Key + API Secret (from business dashboard)
- **Key Endpoints**: Business API (create/track orders), Partner/POS API (order webhooks, status updates, menu updates)
- **Rate Limits**: Not documented
- **Sandbox**: Yes — staging environment available
- **Official SDK**: None official. Community: Python, PHP, Node.js (unofficial)
- **Existing MCP**: Apify Glovo Scraper has MCP integration
- **Docs Quality**: 3/5 — English; Partner docs well-organized, Business docs gated
- **Est. MCP Build**: **M**
- **Notes**: Not Georgia-specific — global API for all Glovo markets. Must pass integration validation. Staging store created by Glovo for testing.

---

### Bolt GE (Georgia)

- **Developer Portal**: https://developer.bolt.eu/ (JS-rendered)
- **API Status**: Rider/Consumer API **explicitly unavailable** ("We don't offer any public or private APIs"). Delivery API active.
- **Base URL**: Delivery: `https://delivery.bolt.eu/api-doc`
- **Auth**: Unknown (portal requires JS/login)
- **Key Endpoints**: Delivery order creation, tracking, webhooks
- **Rate Limits**: Not documented
- **Sandbox**: Unknown
- **Official SDK**: None. Community: `jzarca01/node-bolt` (unofficial, reverse-engineered)
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — Delivery API has Swagger; consumer API does not exist
- **Est. MCP Build**: **M** (delivery only) / Not feasible (ride-hailing)
- **Notes**: **Blocker for ride-hailing** — Bolt explicitly confirms no API. Delivery partner API exists but requires business relationship.

---

### Wolt GE (Georgia)

- **Developer Portal**: https://developer.wolt.com — comprehensive, well-documented
- **API Status**: Active (multiple APIs)
- **Base URL**: Production: `https://daas-public-api.wolt.com` · Dev: `https://daas-public-api.development.dev.woltapi.com`
- **Auth**: Bearer Token (Merchant Key) for Drive API; OAuth 2.0 JWT for Order/Menu APIs
- **Key Endpoints**: Wolt Drive (delivery estimates, create deliveries, webhooks), Order API (receive/manage orders, POS integration), Menu API (upload menus, inventory updates)
- **Rate Limits**: Rate limiter exists (specifics not public)
- **Sandbox**: Yes — development environment with staging tokens
- **Official SDK**: None official
- **Existing MCP**: **Yes** — `jonzarecki/wolt-sdk` includes `wolt-api-mcp` (restaurant search, availability); Apify MCP integration
- **Docs Quality**: 4/5 — Excellent English docs, use case guides, webhook docs, change-log, FAQ
- **Est. MCP Build**: **S-M**
- **Notes**: Acquired by DoorDash but operates under Wolt brand. Existing MCP server as reference. Most developer-friendly API among delivery platforms.

---

## ARMENIA

### Ameriabank API (Armenia)

- **Developer Portal**: https://servicestest.ameriabank.am/VPOS/help (test docs)
- **API Status**: Active — VPOS 3.0 merchant payment processing
- **Base URL**: Production: `https://services.ameriabank.am` · Test: `https://servicestest.ameriabank.am`
- **Auth**: Client ID + Username + Password (issued upon merchant agreement)
- **Key Endpoints**: InitPayment, ConfirmPayment, CancelPayment, GetPaymentFields, Refund
- **Rate Limits**: Not documented
- **Sandbox**: Yes — test environment on request
- **Official SDK**: None. Community: JS, PHP (Omnipay), WooCommerce plugin
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — English/Russian; not publicly browsable without merchant setup
- **Est. MCP Build**: **M**
- **Notes**: Requires business relationship with Ameriabank. Payment acceptance only (VPOS/acquiring) — no open banking.

---

### Ardshinbank API (Armenia)

- **Developer Portal**: Not found
- **API Status**: No Public API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A — uses ARCA gateway for payment processing
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **XL**
- **Notes**: Armenia's 2nd largest bank. No public API; all payment integration via ARCA gateway.

---

### IDram / IDBank API (Armenia)

- **Developer Portal**: Not a formal portal. Merchant docs provided upon agreement.
- **API Status**: Active — Merchant V-POS payment gateway
- **Base URL**: Endpoints provided upon merchant onboarding (HTTPS form POST / webhook pattern)
- **Auth**: Secret Key (IDRAM_SECRET_KEY) + Merchant Account ID
- **Key Endpoints**: Payment initiation (form POST), payment callback/webhook, payment verification
- **Rate Limits**: Not documented
- **Sandbox**: Unknown — test credentials may be available on request
- **Official SDK**: iOS (community). PHP Omnipay packages.
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — Armenian/Russian primarily; PDF docs to merchants
- **Est. MCP Build**: **M**
- **Notes**: Leading e-wallet in Armenia (900K+ users). Payment acceptance only — no account data APIs. Must contact IDram directly (by phone recommended).

---

### Evocabank API (Armenia)

- **Developer Portal**: Not found
- **API Status**: No Public API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A — uses ARCA for card processing
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **XL**
- **Notes**: Recognized as one of Armenia's most innovative/digital banks but no public API. All merchant integration through ARCA gateway.

---

### ARCA — Armenian Card (Armenia)

- **Developer Portal**: https://old.arca.am/en/emerchants
- **API Status**: Active — National payment gateway for card processing
- **Base URL**: Production: `https://ipay.arca.am` · Test: `https://ipaytest.arca.am`
- **Auth**: Username + Password provided by member bank
- **Key Endpoints**: Payment registration, payment execution, status query, refund, 3D Secure
- **Rate Limits**: Not documented
- **Sandbox**: Yes — test environment at ipaytest.arca.am
- **Official SDK**: None. Community: PHP (Omnipay), WooCommerce, Drupal Commerce, Shopify
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — Integration manual in Russian only ("Merchant_Manual_1.55.1.0")
- **Est. MCP Build**: **M**
- **Notes**: National card payment infrastructure (est. 2000). All Armenian banks route card payments through ARCA. Must register through a member bank first. Supports Visa, MC, AmEx, MIR, JCB.

---

### List.am (Armenia)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None. GitHub: scraper only (`zidder/list.am`)
- **Existing MCP**: None found
- **Docs Quality**: 0/5
- **Est. MCP Build**: **L** (scraper-based only)
- **Notes**: Armenia's dominant classifieds (Craigslist equivalent). Absolutely no public API. Scraping only option — fragile and likely violates ToS.

---

### Menu.am (Armenia)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 0/5
- **Est. MCP Build**: **L** (reverse-engineering mobile app)
- **Notes**: Armenia's oldest food delivery service. No public developer API or program.

---

### GG Taxi (Armenia)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 0/5
- **Est. MCP Build**: **XL**
- **Notes**: Armenia's homegrown ride-hailing (100K+ MAU). No developer program, no public API.

---

### Staff.am (Armenia)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 0/5
- **Est. MCP Build**: **L** (scraping)
- **Notes**: Armenia's leading job portal. No public API despite being a tech-forward platform.

---

### e-gov.am (Armenia)

- **Developer Portal**: Not found
- **API Status**: No Public API — internal GIP (General Interoperability Platform) exists for inter-agency use
- **Base URL**: N/A
- **Auth**: EsEm national ID platform (yesem.am)
- **Key Endpoints**: N/A for public API. verify.e-gov.am offers document verification by tracking number.
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5 — Armenian/English/Russian
- **Est. MCP Build**: **XL**
- **Notes**: EU-funded modernization underway but no public APIs yet. Government partnership required.

---

### Telcell (Armenia)

- **Developer Portal**: Not found publicly. Business partnerships via telcell.am/en/business
- **API Status**: Active — merchant payment processing API (partner-only)
- **Base URL**: Not publicly documented
- **Auth**: API credentials upon merchant agreement
- **Key Endpoints**: Online payment processing (Telcell Wallet), QR payments, payment status
- **Rate Limits**: Not documented
- **Sandbox**: Unknown — likely available to partners
- **Official SDK**: None publicly
- **Existing MCP**: None found
- **Docs Quality**: 1/5 — Business partnership info only, no technical docs public
- **Est. MCP Build**: **M-L**
- **Notes**: Armenia's largest payment terminal network (4,700+ terminals, 900K+ wallet users). Partnership agreement required for API access.

---

## AZERBAIJAN

### Kapital Bank API (Azerbaijan)

- **Developer Portal**: https://api.birbank.business/ (also http://api.kapitalbank.az/)
- **API Status**: Active
- **Base URL**: Business API: `https://api.birbank.business/` · Payment Gateway: `https://e-commerce.kapitalbank.az/` · Test: `https://txpgtst.kapitalbank.az/api/`
- **Auth**: Certificate-based (CRT + key) for payment gateway; username/password for new API; token-based for business API
- **Key Endpoints**: Create/complete/reverse order, payment status, domestic/international transfers, currency exchange, balance, statements, salary card ordering
- **Rate Limits**: Not documented
- **Sandbox**: Yes — test environment at txpgtst.kapitalbank.az
- **Official SDK**: None official. Community: Python, PHP/Laravel
- **Existing MCP**: None found
- **Docs Quality**: 3/5 — Azerbaijani/English. Portal launched 2022.
- **Est. MCP Build**: **M**
- **Notes**: Azerbaijan's first open API portal (2022). Part of national Open Banking initiative (13+ banks integrated as of Oct 2025). Corporate account required.

---

### PASHA Bank API (Azerbaijan)

- **Developer Portal**: https://developer.pashabank.digital/
- **API Status**: Active
- **Base URL**: `https://developer.pashabank.digital/` · B2B: `https://b2bpayments.pashabank.digital/`
- **Auth**: Likely OAuth 2.0 / API key (portal requires application)
- **Key Endpoints**: B2B payment processing, account balance, statements, transfers
- **Rate Limits**: Not documented
- **Sandbox**: Unknown — gated behind application
- **Official SDK**: iOS UI library (PB-Digital/PashaKit)
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — Azerbaijani primarily, gated
- **Est. MCP Build**: **L**
- **Notes**: Leading corporate bank. B2B API enables ERP integration. Access requires corporate relationship.

---

### ABB — Azerbaijan International Bank (Azerbaijan)

- **Developer Portal**: https://abb-bank.az/en/korporativ/elektron-bankciliq/abb-business-api
- **API Status**: Active
- **Base URL**: Not publicly documented (gated)
- **Auth**: Likely certificate/token-based for corporate clients
- **Key Endpoints**: Business banking operations, transfers, account management
- **Rate Limits**: Not documented
- **Sandbox**: Unknown
- **Official SDK**: None found
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — English/Azerbaijani, gated
- **Est. MCP Build**: **L**
- **Notes**: Largest state-owned bank. Fully integrated with Central Bank's Open Banking platform (Oct 2025). Corporate account required.

---

### m10 Wallet (Azerbaijan)

- **Developer Portal**: Not found
- **API Status**: No Public API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A — consumer app only (P2P, QR, bills, loans)
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **XL**
- **Notes**: 5M+ users, operated by PashaPay (PASHA Holding). No merchant/developer API.

---

### Goldenpay (Azerbaijan)

- **Developer Portal**: https://www.goldenpay.az/ (merchant dashboard)
- **API Status**: Active
- **Base URL**: `https://rest.goldenpay.az/web/service/merchant/`
- **Auth**: AuthKey + MerchantName + MD5 hash
- **Key Endpoints**: `payment` (create payment + redirect URL), `getPaymentResult` (check status by paymentKey)
- **Rate Limits**: Not documented
- **Sandbox**: Unknown — credentials from Goldenpay upon merchant agreement
- **Official SDK**: Community: PHP, Python/Django
- **Existing MCP**: None found
- **Docs Quality**: 3/5 — English/Azerbaijani/Russian
- **Est. MCP Build**: **S** (<1 week)
- **Notes**: Azerbaijan's largest online payment company (est. 2007). Simple 2-endpoint REST API. AZN only. Commission 2–3%.

---

### E-Manat (Azerbaijan)

- **Developer Portal**: Not found
- **API Status**: No Public API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A — physical terminal network + wallet
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **XL**
- **Notes**: 3,000+ terminals, 200+ service providers. B2B integration only via direct agreement with Modenis LLC.

---

### Tap.az (Azerbaijan)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **XL**
- **Notes**: Major classifieds platform. Part of Turbo.az/Bina.az ecosystem. No public API.

---

### Turbo.az (Azerbaijan)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None. Multiple scrapers on GitHub (Python/Selenium)
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **L** (scraping-based)
- **Notes**: Azerbaijan's #1 auto marketplace. High demand for API (extensive scraper ecosystem). No official API.

---

### Bina.az (Azerbaijan)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **L** (scraping only)
- **Notes**: Azerbaijan's largest real estate platform. Same group as Turbo.az. No API.

---

### ASAN Service (Azerbaijan)

- **Developer Portal**: Not found
- **API Status**: No Public API — ASAN Login SSO at `https://asanlogin.my.gov.az/auth` for government portals; ASAN Bridge for inter-agency (not public)
- **Base URL**: N/A for third parties
- **Auth**: ASAN Login (video registration, SIMA digital signature)
- **Key Endpoints**: ASAN Login SSO integration (80+ portals)
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 2/5
- **Est. MCP Build**: **XL**
- **Notes**: Award-winning one-stop-shop (est. 2012). 2M+ SSO users. Government partnership required.

---

### e-Gov.az (Azerbaijan)

- **Developer Portal**: Not found
- **API Status**: No Public API Found
- **Base URL**: N/A
- **Auth**: ASAN Login SSO
- **Key Endpoints**: N/A — 40+ agencies, internal only
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 2/5
- **Est. MCP Build**: **XL**
- **Notes**: Government-to-citizen only. No third-party developer access.

---

### Bolt AZ (Azerbaijan)

- **Developer Portal**: https://developer.bolt.eu/ (global, JS-rendered)
- **API Status**: Partner API only — no public consumer API
- **Base URL**: Not publicly documented
- **Auth**: Partner API likely OAuth/API key
- **Key Endpoints**: Fleet management, business APIs (behind partner portal). Delivery API available.
- **Rate Limits**: Not documented
- **Sandbox**: Unknown
- **Official SDK**: None. Community: `jzarca01/node-bolt` (unofficial)
- **Existing MCP**: None found
- **Docs Quality**: 2/5
- **Est. MCP Build**: **L**
- **Notes**: No public consumer API. Partner/delivery API requires business relationship.

---

### Wolt AZ (Azerbaijan)

- **Developer Portal**: https://developer.wolt.com
- **API Status**: Active
- **Base URL**: Varies by API (provided after onboarding)
- **Auth**: OAuth 2.0 JWT for Marketplace; Bearer Token for Wolt Drive
- **Key Endpoints**: Order API (accept/reject/ready/pickup/delivered/refund), Menu API (CRUD), Venue API (online/offline), Wolt Drive (shipments, deliveries, webhooks)
- **Rate Limits**: Rate limiter exists
- **Sandbox**: Yes — staging environment available
- **Official SDK**: None (REST with comprehensive docs)
- **Existing MCP**: None found (Wolt MCP exists for Israel — `jonzarecki/wolt-sdk`)
- **Docs Quality**: 5/5 — Excellent English docs
- **Est. MCP Build**: **M**
- **Notes**: Best-documented API of all Azerbaijan services. Merchant/partner relationship required for credentials.

---

### Lent.az (Azerbaijan)

- **Developer Portal**: Not found
- **API Status**: N/A — **News website, not a service platform**
- **Base URL**: https://lent.az (news portal)
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **N/A**
- **Notes**: Lent.az is Azerbaijan's first Azerbaijani-language news portal (est. 2008). This appears to be a misidentification — not a fintech/tech service. No API exists or is expected.

---

## BELARUS

### ⚠️ Sanctions Context (All Belarus Services)

Belarus is under comprehensive **EU and US sanctions** (expanded 2022–2026). EU bans IT consultancy/enterprise software to government/public bodies. SWIFT bans on Belagroprombank, Bank Dabrabyt, Development Bank. Debt/equity restrictions on Belarusbank, Belinvestbank. Russian-owned services (Wildberries, Yandex, HeadHunter) carry additional Russia sanctions risk. **All services below must be evaluated for sanctions compliance before any integration by EU/US persons.**

---

### ERIP — ЕРИП (Belarus)

- **Developer Portal**: No direct API. Integration via licensed aggregators: **bePaid** (docs.bepaid.by/en/), **Express-Pay** (express-pay.by/docs/api/v1), **HutkiGrosh** (hutkigrosh.by/erip/developers)
- **API Status**: Active — via intermediaries only
- **Base URL**: Via bePaid: `https://api.bepaid.by/beyag/payments` · Via Express-Pay: REST v1 endpoint
- **Auth**: Via bePaid: HTTP Basic Auth (Shop ID + Secret Key). Via Express-Pay: API token + HMAC-SHA1 + IP whitelist
- **Key Endpoints**: Create ERIP payment request, get/delete payment, ERIP tree navigation, ERIP External (customer-initiated via internet banking), refund, bulk file upload
- **Rate Limits**: Not documented
- **Sandbox**: Yes — bePaid test ERIP service_no: 99999999; Express-Pay test keys available
- **Official SDK**: bePaid: Node.js, Elixir, Android, iOS, CMS plugins. Express-Pay: None.
- **Existing MCP**: None found
- **Docs Quality**: 4/5 (via bePaid — EN/RU) · 3.5/5 (via Express-Pay — RU only)
- **Est. MCP Build**: **L** (2–4 weeks)
- **Notes**: **CRITICAL** — universal payment system used by every Belarusian business. ERIP itself (OAO "NKFO ERIP") has no direct API — all integration through intermediaries. **HIGH sanctions risk** — state-backed system (National Bank created entity). BYN-only. ERIP tree navigation adds complexity.

---

### Belarusbank API (Belarus)

- **Developer Portal**: https://belarusbank.by/o-banke/for-developers/ (RU)
- **API Status**: Partial — informational APIs public; payment APIs for legal entities
- **Base URL**: `https://belarusbank.by/open-banking/v1.0/banks/AKBBBY2X/info`
- **Auth**: ApiKey via "Интернет-банк для юридических лиц" + **proprietary itTLS software** (mandatory)
- **Key Endpoints**: Service locations, credit/card/deposit products, exchange rates (public). Account balances, statements (authenticated).
- **Rate Limits**: Not documented
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — Russian only, minimal documentation, itTLS dependency
- **Est. MCP Build**: **M** (informational only) / **XL** (full payment APIs)
- **Notes**: Belarus's largest state-owned bank. **VERY HIGH sanctions risk** — EU debt/equity restrictions. 10 BYN/month for payment API access. Proprietary itTLS requirement is a major technical blocker.

---

### Alfa-Bank BY (Belarus)

- **Developer Portal**: https://developerhub.alfabank.by/developerhub/
- **API Status**: Active — modern portal with sandbox
- **Base URL**: Developer hub; acquiring at `https://alfa-biz.by/`
- **Auth**: OAuth 2.0 for client APIs; Token for acquiring/merchant
- **Key Endpoints**: Authorization (OAuth SSO), Accounts (balances, statements), Documents (create, sign), Public (exchange rates, bank codes). Acquiring: register, status, refund.
- **Rate Limits**: Not documented
- **Sandbox**: Yes — documented, Swagger files downloadable
- **Official SDK**: None official. Community: `alfabank` npm package (TypeScript)
- **Existing MCP**: None found
- **Docs Quality**: 3.5/5 — Russian, modern portal, Swagger available
- **Est. MCP Build**: **M**
- **Notes**: Private bank (CJSC), separate from Alfa-Bank Russia. Not specifically on EU/US sanctions lists but **parent ecosystem sanctioned**. Rebranding to INSNC may be sanctions-avoidance strategy. **MODERATE-HIGH sanctions risk**.

---

### bePaid (Belarus)

- **Developer Portal**: https://docs.bepaid.by/en/ (EN) · https://bepaid.by/dev
- **API Status**: Active — well-maintained API v3 (since Sep 2022)
- **Base URL**: Card: `https://gateway.bepaid.by/transactions/payments` · ERIP: `https://api.bepaid.by/beyag/payments` · Checkout: `https://checkout.bepaid.by/ctp/api/checkouts`
- **Auth**: HTTP Basic Auth (Shop ID + Secret Key); API v3 via `X-API-Version: 3` header
- **Key Endpoints**: Card payments/authorizations/refunds/voids, transaction status, ERIP payment requests/tree navigation, products/payment links, hosted checkout, cryptocurrency transactions
- **Rate Limits**: Not documented
- **Sandbox**: Yes — test environment in open access
- **Official SDK**: Android SDK, iOS SDK. Community: Node.js, Elixir, WooCommerce, OpenCart, PrestaShop, 1C-Bitrix
- **Existing MCP**: None found
- **Docs Quality**: 4.5/5 — **Best-in-class for Belarus**. Full EN/RU, detailed JSON examples, flow diagrams, test credentials documented
- **Est. MCP Build**: **S-M**
- **Notes**: Private company, not individually sanctioned. Provides unified access to card payments + ERIP. Also operates **Overpay** (docs.overpay.io) as international-facing brand. **MODERATE sanctions risk** (indirect via Belarusian banking system).

---

### A1 Banking (Belarus)

- **Developer Portal**: Not found
- **API Status**: No Public API
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A — mobile app only
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 0/5
- **Est. MCP Build**: **N/A**
- **Notes**: Mobile banking app by A1 Belarus (A1 Telekom Austria Group). Austrian parent provides some sanctions insulation. Banking via JSC Reshenie Bank. No API.

---

### Onliner.by (Belarus)

- **Developer Portal**: https://github.com/onlinerby (official GitHub org — 11 repos)
- **API Status**: Active — B2B/Shop API, Cart API, Second-hand API
- **Base URL**: `https://b2bapi.onliner.by`
- **Auth**: OAuth2 / API token (registered application via Onliner B2B portal)
- **Key Endpoints**: Shop info, catalog sections, product position import/export, position updates/deletions. Cart API: order management. Second-hand API: classifieds.
- **Rate Limits**: Not documented
- **Sandbox**: No — production access only, requires registered shop
- **Official SDK**: None (raw REST, curl examples)
- **Existing MCP**: None found. Community scraper exists (`Underclassity/marketplace-crawler`)
- **Docs Quality**: 3/5 — Russian only. GitHub-hosted markdown docs, changelog maintained.
- **Est. MCP Build**: **M**
- **Notes**: Belarus's #1 tech platform (~3M+ monthly users). B2B API requires registered Onliner shop — not open for general use. Semi-public catalog endpoints exist but are undocumented. **LOW-MODERATE sanctions risk** (private company).

---

### Kufar.by (Belarus)

- **Developer Portal**: Not found
- **API Status**: No official API — internal mobile APIs reverse-engineered
- **Base URL**: Unofficial: `https://api.kufar.by`; third-party proxy: `https://rest-app.net/api-kufar-by/ads`
- **Auth**: Email/password (unofficial)
- **Key Endpoints**: Search ads, get ad by ID, upload images, post adverts, messaging (all unofficial)
- **Rate Limits**: Third-party proxy: 1000 ads/request
- **Sandbox**: No
- **Official SDK**: None. Community: PHP, Python, C++ Telegram bot
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **L**
- **Notes**: Major classifieds. No official API. Reverse-engineering only. **LOW sanctions risk** (private platform).

---

### Deal.by / Satu.by (Belarus)

- **Developer Portal**: https://public-api.docs.prom.ua/ (unified Prom.ua network)
- **API Status**: Active — seller/integration API
- **Base URL**: Platform-specific (deal.by domain)
- **Auth**: API Token (from seller account settings)
- **Key Endpoints**: Orders (list, update status), Products CRUD, Categories, Messages, Prices/availability sync
- **Rate Limits**: Not documented
- **Sandbox**: No (test mode via CRM connectors)
- **Official SDK**: None official; CRM integrations (RetailCRM, amoCRM, Bitrix24, Odoo)
- **Existing MCP**: None found
- **Docs Quality**: 3/5 — Russian/Ukrainian. Swagger/OpenAPI available.
- **Est. MCP Build**: **M**
- **Notes**: Part of Prom.ua (EVO Group — Ukrainian company). **MODERATE sanctions risk** due to Belarus-Ukraine tensions. Deal.by continues to operate.

---

### Wildberries BY (Belarus)

- **Developer Portal**: https://dev.wildberries.ru/en · https://openapi.wildberries.ru
- **API Status**: Active — comprehensive REST API (11+ modules)
- **Base URL**: Service-specific: `content-api.wildberries.ru`, `marketplace-api.wildberries.ru`, `statistics-api.wildberries.ru`, `analytics-api.wildberries.ru`, etc.
- **Auth**: JWT API Token (180-day validity, scoped); OAuth 2.0 for partners
- **Key Endpoints**: Content (product cards CRUD), Marketplace (orders FBS/FBW, warehouses, returns), Prices/Discounts, Analytics, Statistics, Promotions, Tariffs, Communications, Finances
- **Rate Limits**: Documented per-category (Content: 100 req/min, Prices: 10 req/6s, Marketplace: 300 req/min)
- **Sandbox**: Yes — test tokens available
- **Official SDK**: `wildberries-tech/wildkit` (official). Community: TypeScript, Python, Go, PHP
- **Existing MCP**: **YES — Multiple**: `dmitriipolushin/wildberries-api-mcp-server`, `lyohadunker26-wildberries-mcp-server` (LobeHub), listed in `PipedreamHQ/awesome-mcp-servers`
- **Docs Quality**: 5/5 — Excellent English + Russian. OpenAPI specs, guides, FAQ, webinars, community forum.
- **Est. MCP Build**: **S** — MCP servers already exist
- **Notes**: **HIGH sanctions risk** — Russian company subject to both Russia AND Belarus sanctions. EU/US developers face significant compliance risk. Technically the best-documented API in the entire assessment. All infrastructure through *.wildberries.ru (Russian servers).

---

### e-pasluga.by (Belarus)

- **Developer Portal**: Not found
- **API Status**: No Public API
- **Base URL**: N/A (portal uses Belarus-specific crypto: GSecTLS, Avest)
- **Auth**: EDS (Electronic Digital Signature) + ID-card (NFC), or login/password
- **Key Endpoints**: N/A — 550+ government e-services via portal only
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **XL** — Not feasible
- **Notes**: **CRITICAL sanctions blocker** — Belarus government infrastructure. EU explicitly prohibits IT services to Belarus government. Requires Belarus-issued EDS. Proprietary crypto standards.

---

### MNS Tax — nalog.gov.by (Belarus)

- **Developer Portal**: Not found
- **API Status**: No Public REST API. Single endpoint discovered: `https://www.portal.nalog.gov.by/grp/getData?unp={TIN}` (taxpayer lookup)
- **Base URL**: `https://portal.nalog.gov.by`
- **Auth**: EDS + login/password for personal account
- **Key Endpoints**: Taxpayer lookup by UNP (tax ID) — only semi-public endpoint
- **Rate Limits**: Unknown
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5
- **Est. MCP Build**: **XL**
- **Notes**: **CRITICAL sanctions blocker** — Belarus Ministry of Taxes, government entity directly targeted by EU sanctions.

---

### 21vek.by (Belarus)

- **Developer Portal**: Not found
- **API Status**: No Public API
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 0/5
- **Est. MCP Build**: **XL**
- **Notes**: Major electronics retailer (3M+ monthly users, 150+ person IT team). No external developer ecosystem. **LOW sanctions risk** (private, HTP-registered).

---

### Yandex Go BY (Belarus)

- **Developer Portal**: https://yandex.com/dev/apitaxi/ (widget embed); Fleet API separate
- **API Status**: Active (limited — widget embed public; Fleet/Corporate API gated)
- **Base URL**: Fleet: `https://fleet-api.taxi.yandex.net/`
- **Auth**: Client ID + Park ID + API Key (Fleet); OAuth (Corporate)
- **Key Endpoints**: Widget: embed taxi ordering. Fleet API: driver/vehicle management. Corporate: create/track/cancel orders.
- **Rate Limits**: Not documented
- **Sandbox**: Unknown
- **Official SDK**: None official. Community: PHP, Scala, npm
- **Existing MCP**: None found
- **Docs Quality**: 3/5 — Russian + English
- **Est. MCP Build**: **M-L**
- **Notes**: **HIGH sanctions risk** — Russian company. Fleet API requires park registration. Widget API is simple but limited.

---

### HeadHunter.by (Belarus)

- **Developer Portal**: https://dev.hh.ru
- **API Status**: Active — comprehensive public REST API
- **Base URL**: `https://api.hh.ru` (serves all hh.ru network including Belarus)
- **Auth**: OAuth 2.0 (some endpoints anonymous — vacancy search)
- **Key Endpoints**: Vacancy search/details (anonymous OK), resume search (auth), apply to vacancies, employer info, geographic regions, dictionaries. OpenAPI spec available.
- **Rate Limits**: Documented (vary by endpoint/auth)
- **Sandbox**: Dev portal for testing registered apps
- **Official SDK**: Official: `hhru/api` (docs repo). Community: PHP, TypeScript, Python
- **Existing MCP**: None found
- **Docs Quality**: 4/5 — Russian + English, OpenAPI spec (Redoc), active community
- **Est. MCP Build**: **S-M**
- **Notes**: **MODERATE-HIGH sanctions risk** — Russian company (delisted from NASDAQ 2024). All API calls to Russian servers (api.hh.ru). Anonymous vacancy search is lowest-friction entry point. Filter by Belarus area parameter.

---

## MOLDOVA

### MAIB — Moldova Agroindbank (Moldova)

- **Developer Portal**: https://www.maib.md/en/open-banking (OBP API Explorer)
- **API Status**: Active — Open Banking (PSD2 compliance, launched for Feb 2025 deadline)
- **Base URL**: Open Bank Project (OBP) standard endpoints (`/obp/v4.0.0/...`)
- **Auth**: OAuth 1.0a, OAuth 2.0, Direct Login (sandbox). Certificate-based for regulated entities (TPPs).
- **Key Endpoints**: XS2A — AISP (accounts, transactions, balances), PISP (payment initiation), consent management, SCA challenges
- **Rate Limits**: Not documented
- **Sandbox**: Yes — OBP sandbox environment available
- **Official SDK**: OBP OAuth Starter SDKs (multiple languages). Community: `Fruitware/MaibApi` (PHP, 13★)
- **Existing MCP**: None found
- **Docs Quality**: 3/5 — English. OBP API Explorer comprehensive but Moldova-specific docs sparse.
- **Est. MCP Build**: **M**
- **Notes**: Moldova's largest bank. Built on TESOBE's Open Bank Project (open source). Berlin Group standard with NBM modifications. TPP registration required for full access.

---

### Victoriabank (Moldova)

- **Developer Portal**: Not found (no dedicated portal)
- **API Status**: Limited — e-Commerce payment gateway active; Open Banking via Salt Edge in progress
- **Base URL**: Test: `https://ecomt.victoriabank.md/cgi-bin/cgi_link` · Production: `https://vb059.vb.md/cgi-bin/cgi_link`
- **Auth**: RSA key pair + CGI form POST with P_SIGN signature
- **Key Endpoints**: Payment authorization, completion, reversal, 3-D Secure
- **Rate Limits**: Not documented
- **Sandbox**: Yes — test endpoint at ecomt.victoriabank.md
- **Official SDK**: None official. Community: PHP (`Fruitware/VictoriaBankGateway`, `alexminza/victoriabank-sdk-php`), WooCommerce, Drupal
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — Romanian. Integration docs as downloadable ZIP.
- **Est. MCP Build**: **L**
- **Notes**: Part of Banca Transilvania group (Romania). CGI form-based gateway (not REST). Open Banking API expected through Salt Edge aggregation but not yet public.

---

### MConnect / MPass (Moldova)

- **Developer Portal**: https://egov-moldova.github.io/egov4dev/ (official, comprehensive)
- **API Status**: Active — MPass (SSO/SAML) and MConnect (interoperability) both operational
- **Base URL**: MPass: `https://mpass.gov.md` (prod) · `https://testmpass.gov.md` (test). MConnect Events: Kafka-based.
- **Auth**: MPass: SAML v2.0 (SP certificates from STISC). MConnect: formal application to e-Governance Agency.
- **Key Endpoints**: MPass: SAML login/logout/callbacks. MConnect: inter-system data exchange (SOA). MConnect Events: Kafka producer/consumer. Additional: MSign, MPower, MPay, MNotify, MDelivery, MDocs, MLog.
- **Rate Limits**: MConnect charges 0.25 lei/query. Events tested at 10,000 msg/sec.
- **Sandbox**: Yes — testmpass.gov.md
- **Official SDK**: ASP.NET Core (`egov-moldova/AGE.AspNetCore.MPass.Saml`)
- **Existing MCP**: None found (but `yoda-digital/mcp-mtender-server` exists for Moldova MTender — related ecosystem)
- **Docs Quality**: 4/5 — English. Comprehensive egov4dev docs (MkDocs) covering all services.
- **Est. MCP Build**: **L**
- **Notes**: Government registration process required. MPass provides SSO for 190+ systems. Not freely accessible for commercial use.

---

### SFS Tax (Moldova)

- **Developer Portal**: Not found
- **API Status**: No Public REST API
- **Base URL**: `https://sfs.md` (portal only)
- **Auth**: Digital signature (USB token / mobile e-signature)
- **Key Endpoints**: N/A — web portal access only
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 1/5 — Romanian only
- **Est. MCP Build**: **XL**
- **Notes**: No API. Digital signature required for authentication. Related e-Factura system does have an API.

---

### e-Factura (Moldova)

- **Developer Portal**: Integration guides within e-Factura system help section
- **API Status**: Active — SOAP/WCF API
- **Base URL**: WCF: `https://efactura-api.sfs.md/Service.svc` · SOAP: `https://efactura-api.sfs.md/dialog.asmx` · WSDL: `https://efactura-api.sfs.md/Service.svc?wsdl`
- **Auth**: SSL client certificates + username/password. Digital signature required. Director role needed for API access account.
- **Key Endpoints**: PostCanceledInvoices, invoice creation/signing/sending, status checking, reservation (series/number), actor info, XML upload/download. Two modes: semi-automated and fully automated.
- **Rate Limits**: Not documented (delays during month-end peaks)
- **Sandbox**: Unknown — testing procedures exist per integration guide
- **Official SDK**: None. .NET samples provided.
- **Existing MCP**: None found
- **Docs Quality**: 2/5 — Romanian only. PDF integration guide ("Ghid de integrare" v2.0).
- **Est. MCP Build**: **L**
- **Notes**: Mandatory for certain business categories. SOAP (not REST). Digital signature requirement. Launched July 2020.

---

### 999.md (Moldova)

- **Developer Portal**: https://partners-api.999.md/api/documentation (verified, comprehensive)
- **API Status**: **Active** — well-documented REST API
- **Base URL**: `https://partners-api.999.md`
- **Auth**: HTTP Basic Auth (API key as username, no password)
- **Key Endpoints**: Categories/subcategories, cash balance, phone numbers, adverts CRUD (create/update/list/get), republish, access policy, autorepublisher, labels, image upload, booster, packages, dependent options, states, features, units
- **Rate Limits**: Not documented
- **Sandbox**: No — live data. Posting ads is paid.
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: 4/5 — Russian/Romanian (bilingual via `lang` param). Clear REST docs with cURL examples, JSON samples, pagination, error codes, backward compatibility policy.
- **Est. MCP Build**: **S** (<1 week)
- **Notes**: **HIGHEST-VALUE Moldova MCP opportunity**. Partners API focused on ad management. Business analytics API also at business.999.md. Important limitation: this is a merchant/seller API for managing own ads — not a read-only classifieds search API. Mobile app likely uses separate internal APIs for browsing.

---

### rabota.md (Moldova)

- **Developer Portal**: Not found
- **API Status**: No API Found
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: N/A
- **Est. MCP Build**: **XL**
- **Notes**: Job portal. Web interface only. No API or developer docs.

---

### Moldtelecom (Moldova)

- **Developer Portal**: Not found
- **API Status**: No Public API
- **Base URL**: N/A
- **Auth**: N/A
- **Key Endpoints**: N/A
- **Rate Limits**: N/A
- **Sandbox**: No
- **Official SDK**: None
- **Existing MCP**: None found
- **Docs Quality**: N/A
- **Est. MCP Build**: **XL**
- **Notes**: State-owned telecom. MyMoldtelecom app exists but no public API exposed.

---

## IMPLEMENTATION PRIORITY MATRIX

Services ranked by API maturity, MCP build feasibility, business impact, and access risk. Grouped into four tiers.

### Tier 1 — Build Now (high API maturity, feasible build, strong business case, low access risk)

| Service | Country | Build | API Quality | Business Impact | Risk |
|---------|---------|-------|-------------|-----------------|------|
| **TBC Bank** | Georgia | S | ★★★★ | Very High — best open banking in region | Low |
| **Bank of Georgia / iPay** | Georgia | S-M | ★★★★ | Very High — NextGenPSD2, iPay dominant | Low |
| **999.md** | Moldova | S | ★★★★ | Very High — Moldova's dominant platform | Low |
| **bePaid** | Belarus | S-M | ★★★★½ | High — card + ERIP gateway | Moderate (sanctions) |
| **Wolt** (GE/AZ) | Multi | S-M | ★★★★ | Medium — delivery/POS integration | Low |
| **Goldenpay** | Azerbaijan | S | ★★★ | Medium — AZ payment leader | Low |

### Tier 2 — Build Soon (viable APIs, moderate complexity, good business case)

| Service | Country | Build | API Quality | Business Impact | Risk |
|---------|---------|-------|-------------|-----------------|------|
| **MAIB Open Banking** | Moldova | M | ★★★ | High — Moldova's largest bank, PSD2 | Low |
| **rs.ge (Revenue Service)** | Georgia | L | ★★ | Very High — mandatory for all GE businesses | Low (technical) |
| **Kapital Bank** | Azerbaijan | M | ★★★ | High — AZ open banking leader | Low |
| **ARCA (Armenian Card)** | Armenia | M | ★★ | High — national payment infrastructure | Low |
| **Ameriabank** | Armenia | M | ★★ | Medium — leading AM bank VPOS | Low |
| **IDram/IDBank** | Armenia | M | ★★ | High — AM's leading e-wallet | Low |
| **Onliner.by** | Belarus | M | ★★★ | Very High — BY #1 platform | Moderate (sanctions) |
| **Glovo** (GE) | Georgia | M | ★★★ | Medium — delivery platform | Low |
| **Alfa-Bank BY** | Belarus | M | ★★★½ | Medium — modern portal, sandbox | Moderate-High (sanctions) |
| **HeadHunter.by** | Belarus | S-M | ★★★★ | Medium — job market | Moderate-High (Russian) |
| **Deal.by** | Belarus | M | ★★★ | Medium — marketplace | Moderate (sanctions) |

### Tier 3 — Monitor (APIs exist but gated/limited, or high complexity)

| Service | Country | Build | Notes |
|---------|---------|-------|-------|
| **ERIP (via aggregators)** | Belarus | L | Critical system but HIGH sanctions risk; complex tree navigation |
| **e-Factura** | Moldova | L | SOAP, digital signature auth, Romanian docs |
| **MConnect/MPass** | Moldova | L | Government registration required, SAML complexity |
| **Victoriabank** | Moldova | L | CGI form-based only; Open Banking via Salt Edge coming |
| **PASHA Bank** | Azerbaijan | L | Developer portal exists but fully gated |
| **ABB Bank** | Azerbaijan | L | Corporate access only |
| **Belarusbank** | Belarus | M-XL | itTLS dependency, VERY HIGH sanctions risk |
| **Bolt** (GE/AZ) | Multi | M | Delivery API only — no ride-hailing API |
| **Telcell** | Armenia | M-L | Partner agreement required |
| **MyAuto.ge** | Georgia | M | Unofficial API — fragile, ToS risk |
| **Wildberries BY** | Belarus | S | MCP exists! But HIGH Russia sanctions risk |
| **Yandex Go BY** | Belarus | M-L | HIGH sanctions risk (Russian company) |

### Tier 4 — Skip / Blocked (no API, sanctions-blocked, or not applicable)

| Service | Country | Reason |
|---------|---------|--------|
| **Liberty Bank** | Georgia | No public API or developer docs |
| **my.gov.ge** | Georgia | No API, ID-card auth only |
| **NAPR** | Georgia | No API, partnership model only |
| **ss.ge** | Georgia | No API at all |
| **Ardshinbank** | Armenia | No public API |
| **Evocabank** | Armenia | No public API |
| **List.am** | Armenia | No API — scraping only |
| **Menu.am** | Armenia | No API |
| **GG Taxi** | Armenia | No API |
| **Staff.am** | Armenia | No API |
| **e-gov.am** | Armenia | No API, government access only |
| **m10 Wallet** | Azerbaijan | No API |
| **E-Manat** | Azerbaijan | No API |
| **Tap.az** | Azerbaijan | No API |
| **Turbo.az** | Azerbaijan | No API (scrapers exist) |
| **Bina.az** | Azerbaijan | No API |
| **ASAN Service** | Azerbaijan | No public API, government only |
| **e-Gov.az** | Azerbaijan | No public API |
| **Lent.az** | Azerbaijan | News site, not a service |
| **A1 Banking** | Belarus | No API |
| **Kufar.by** | Belarus | No official API |
| **21vek.by** | Belarus | No API |
| **e-pasluga.by** | Belarus | No API + **CRITICAL sanctions block** |
| **MNS Tax** | Belarus | No API + **CRITICAL sanctions block** |
| **SFS Tax** | Moldova | No API, digital signature only |
| **rabota.md** | Moldova | No API |
| **Moldtelecom** | Moldova | No API |

---

## Key strategic findings across all five markets

**Georgia is the clear regional leader in API maturity.** TBC Bank and Bank of Georgia offer PSD2-compliant Open Banking APIs with sandboxes, SDKs, and English documentation that rival Western European standards. These two services alone justify prioritizing Georgia for MCP development. The rs.ge Revenue Service API, while SOAP-only and technically challenging, serves a mandatory use case for every Georgian business — making it a high-value but complex target.

**The classifieds/marketplace gap is striking.** Across all five countries, dominant platforms like List.am (Armenia), Tap.az/Turbo.az/Bina.az (Azerbaijan), Kufar.by (Belarus), ss.ge (Georgia), and rabota.md (Moldova) have **zero public APIs**. The sole exception is 999.md (Moldova), which offers a well-documented Partners API — making it one of the easiest and most valuable MCP builds in the entire region.

**Belarus sanctions create a complex compliance landscape.** bePaid represents the safest entry point (private company, excellent docs, card + ERIP access), while state entities (ERIP directly, Belarusbank, e-pasluga, MNS) and Russian-owned platforms (Wildberries, Yandex, HeadHunter) carry escalating sanctions risk. Wildberries is technically the most mature API with existing MCP servers, but its Russian ownership makes it unusable for EU/US developers.

**Azerbaijan's Open Banking revolution is underway but not yet developer-accessible.** The Central Bank launched a national Open Banking platform in 2024 with 13+ banks integrated by late 2025, but developer portals remain gated behind corporate relationships. Goldenpay's simple 2-endpoint REST API is the lowest-friction Azerbaijan entry point.

**Only one service in the entire assessment has existing MCP servers: Wildberries** (Russian marketplace, multiple MCP implementations). Wolt has a related MCP server built for Israel that could be adapted. This represents a massive greenfield opportunity — **zero MCP servers exist for any native Georgian, Armenian, Azerbaijani, Belarusian, or Moldovan service**.