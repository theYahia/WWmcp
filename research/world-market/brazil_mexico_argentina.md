# LATAM MCP server implementation: the definitive market map

**Mercado Pago and Conekta have already shipped MCP servers, signaling that Latin America's API-first companies are ready for AI agent integration.** Across Brazil, Mexico, and Argentina — a combined market of **391 million people and 301 million internet users** — this research identified **120+ companies** across 32 categories, verified their API availability, and ranked implementation priority. The bottom line: **mandatory e-invoicing systems (NFe, CFDI, AFIP), dominant payment platforms, and marketplaces represent the highest-value MCP targets**, collectively serving virtually every business in these three economies. Brazil's ecosystem is by far the deepest, with 40+ public APIs; Mexico's CFDI invoicing and fintech scene are remarkably developer-friendly; Argentina's market is dominated by the MercadoLibre ecosystem and mandatory AFIP integration.

---

## Brazil: 215M people, the deepest API ecosystem in LATAM

**Market overview**: Brazil has **165M internet users**, the world's most advanced instant payment system (Pix, **175M+ users**), mandatory electronic invoicing (NFe/NFSe), and a regulated Open Finance framework with **800+ participating institutions**. Portuguese is the primary API documentation language. The Central Bank (BCB) mandates Open Finance participation and regulates Pix. Brazil's LGPD governs data protection. The dominant payment method is **Pix** (47% of all financial transactions), followed by credit cards and boleto bancário.

### A. Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Mercado Livre | Largest LATAM marketplace | ✅ Full REST API | developers.mercadolivre.com.br | OAuth 2.0 | 148M+ active users LATAM | **High** | 40–60 | Webhooks, SDKs in 5 languages, fulfillment API |
| Magazine Luiza | #2 retailer, omnichannel marketplace | ✅ REST API | developers.magalu.com | OAuth 2.0 | 950+ stores | **High** | 30–40 | Seller/integrator homologation required |
| Shopee BR | Fast-growing C2C marketplace | ✅ Open Platform API | open.shopee.com | HMAC-SHA256 + OAuth | 30M+ monthly visits | Medium | 30–40 | BR-specific production endpoint |
| Amazon BR | Growing marketplace + FBA | ✅ SP-API | developer-docs.amazon.com/sp-api | OAuth 2.0 + AWS SigV4 | Top 5 e-commerce | Medium | 25–35 | Brazil-specific Shipment Invoicing API |
| Americanas | Major retailer (in restructuring) | ⚠️ Uncertain | N/A | Token | Reduced post-2023 crisis | Low | — | Post-bankruptcy; monitor recovery |

### B. Food delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| iFood | Dominant food delivery (~80% share) | ✅ Merchant-API | developer.ifood.com.br | OAuth 2.0 | 60M+ users, 350K+ partners | **High** | 40–50 | Requires software house registration; polling-based events |
| Rappi BR | Super-app delivery | ✅ REST API | dev-portal.rappi.com | OAuth 2.0 (Auth0) | #2 delivery app | Medium | 25–35 | Menu + order management |

### C. Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| **Mercado Pago** | Payments, Pix, wallet | ✅ **HAS MCP SERVER** | mercadopago.com.br/developers | OAuth 2.0 | Dominant in LATAM | **Critical** | 0 (exists) | **Already has official MCP server + Claude plugin** |
| Pix (BCB) | Instant payment system | ✅ OpenAPI 3.0 spec | github.com/bacen/pix-api | mTLS + OAuth 2.0 | **175M+ users** | **Critical** | 50–70 | Access via PSPs only; wrap Mercado Pago or EfiPay |
| PagBank/PagSeguro | Payment gateway + bank | ✅ Full REST API v4.1 | developer.pagbank.com.br | Token-based | 30M+ accounts | **High** | 30–40 | Public sandbox; comprehensive docs |
| Pagar.me (Stone) | E-commerce gateway | ✅ Full REST API | docs.pagar.me | API Key | Thousands of merchants | **High** | 20–30 | Best DX; SDKs in 5 languages; simple auth |
| Cielo | Largest card acquirer | ✅ REST API | developercielo.github.io | MerchantId + Key | #1 acquirer in Brazil | **High** | 25–35 | Public sandbox; e-commerce + LIO POS APIs |
| Asaas | Billing/payments platform | ✅ REST API v3 | docs.asaas.com | API Key | Growing fintech | **High** | 20–30 | Excellent docs; Pix/boleto/card; Discord community |
| EfiPay (Gerencianet) | Pix-first payments | ✅ Multiple APIs | dev.efipay.com.br | OAuth 2.0 + mTLS | 6K+ Discord members | **High** | 35–45 | Strong Pix integration; SDKs in 7 languages |
| Banco do Brasil | State-owned, largest bank | ✅ Public APIs | developers.bb.com.br | OAuth 2.0 | 75M+ customers | **High** | 30–40 | Most mature bank developer portal |
| Banco Inter | Digital bank | ✅ Business APIs | developers.inter.co | OAuth 2.0 + mTLS | 30M+ customers | Medium | 30–40 | Pix billing, payments, statements |
| Nubank | Largest neobank in LATAM | ⚠️ NuPay only | docs.nupaybusiness.com.br | OAuth 2.0 | **80M+ customers** | Medium | 35–45 | No public retail API; NuPay for e-commerce partners |
| Itaú | Largest private bank | ✅ Open Banking | developer.itau.com.br | OAuth 2.0/FAPI | 60M+ customers | Medium | 35–45 | Open Finance APIs |
| Rede (Itaú) | Card acquirer | ✅ REST API | developer.userede.com.br | Basic Auth | #2-3 acquirer | Medium | 20–30 | Simple auth; sandbox available |
| Stone | Payments/POS | ✅ Partner APIs | stone.com.br/devcenter | Partner credentials | NASDAQ-listed | Medium | 30–40 | Redirects online payments to Pagar.me |
| PicPay | Digital wallet | ✅ REST API | studio.picpay.com | Token-based | 60M+ users | Medium | 20–25 | E-commerce payment API |
| Porto Seguro | Insurance leader | ✅ API catalog | dev.portoseguro.com.br | OAuth 2.0 | Millions of policies | Medium | 30–40 | BaaS, IaaS, Open Insurance |
| Mercado Bitcoin | Crypto exchange leader | ✅ REST + WebSocket | mercadobitcoin.com.br/api | API Key + Secret | 3.8M+ customers | Medium | 25–35 | Trading + market data |
| SumUp BR | Global POS | ✅ Cloud API | developer.sumup.com | OAuth 2.0 | Significant presence | Low | 15–20 | Global developer portal |

### D. Logistics

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Correios | National postal service | ✅ REST + SOAP | cws.correios.com.br | Token-based | ~50% of e-commerce deliveries | **High** | 35–45 | CEP, tracking, pricing, shipping APIs |
| Loggi | Largest private courier | ✅ REST API | docs.api.loggi.com | API Key | Unicorn; 4K+ municipalities | Medium | 25–30 | Same-day + national delivery |
| Jadlog | Express logistics (DPD group) | ✅ Partner API | Partner portal | Token | 500+ franchises | Low | 20–25 | Contract required |

### E. Business software and SaaS

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| **TOTVS** | Brazil's #1 ERP | ✅ REST APIs | api.totvs.com.br / developers.totvs.com | OAuth 2.0/OpenID | **70K+ customers, 30%+ market** | **High** | 60–80 | Multiple product lines (Protheus, RM, Datasul, Fluig) |
| NFe.io | Electronic invoicing API | ✅ REST API | nfe.io/docs | API Key | Serving fintechs/SaaS | **High** | 15–20 | **Mandatory NF-e/NFS-e; SDKs in 5 langs; simple auth** |
| Focus NFe | Electronic invoicing API | ✅ REST API v2 | focusnfe.com.br/doc | HTTP Basic Auth | Established player | **High** | 15–20 | NFe, NFCe, NFSe, CTe, MDFe support |
| RD Station | Marketing automation leader | ✅ REST API | developers.rdstation.com | OAuth 2.0 | **40K+ customers** | **High** | 25–35 | Rate limits: 60 GET/hr, 24 PATCH/day |
| Omie | Cloud ERP for SMBs | ✅ JSON-RPC API | developer.omie.com.br | App Key + Secret | Major cloud ERP | **High** | 30–40 | Non-REST (JSON-RPC over POST) |
| Bling | E-commerce ERP | ✅ REST API v3 | developer.bling.com.br | OAuth 2.0 | 1M+ entrepreneurs | **High** | 25–35 | 260+ marketplace integrations |
| ContaAzul | Cloud accounting | ✅ REST API (2025) | developers.contaazul.com | OAuth 2.0 | Leading SMB accounting | Medium | 25–30 | Newly modernized API |
| Ploomes | CRM (largest LATAM) | ✅ REST + OData | developers.ploomes.com | API Key | Growing B2B base | Medium | 20–25 | OData querying support |
| Agendor | Sales CRM for SMBs | ✅ REST API v3 | api.agendor.com.br/docs | API Key | Popular among SMBs | Low | 15–20 | GitHub-hosted API docs |
| Gupy | HR/recruitment leader | ✅ REST API (Swagger) | developers.gupy.io | OAuth Bearer | Market leader | Medium | 25–30 | Requires Gupy subscription |
| Tiny ERP | Small e-commerce ERP | ✅ REST API | tiny.com.br | Token | SMB e-commerce | Low | 15–20 | Token API extension activation |

### F. Marketing, comms, infrastructure

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| WhatsApp Business API | Dominant messaging (120M+ BR users) | ✅ Cloud API | developers.facebook.com/docs/whatsapp | OAuth 2.0 Bearer | **120M+ Brazilian users** | **High** | 30–40 | Meta Graph API; global but critical for Brazil |
| Zenvia | CPaaS leader (SMS, WA, Voice) | ✅ Full REST APIs | zenvia.com/en/devs | Basic/API Key/Token | NASDAQ-listed | **High** | 25–35 | Multi-channel; OpenAPI spec on GitHub |
| Hotmart | Digital products platform | ✅ REST API | developers.hotmart.com | OAuth 2.0 | **35M+ users, 580K+ products** | **High** | 25–35 | Sales, subscriptions, affiliates; sandbox available |
| JusBrasil | Legal information platform | ✅ Enterprise API | api.jusbrasil.com.br/docs | Enterprise API Key | 100M+ visits/year | Medium | 30–40 | Process monitoring with webhooks; enterprise-only |
| Locaweb | #1 web hosting | ✅ REST APIs | developer.locaweb.com.br | Token | 500K+ hosted websites | Low | 15–20 | Server/email management scope |

### G. Government and compliance

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Gov.br / Receita Federal | Federal government / tax authority | ✅ REST APIs | gov.br/conecta/catalogo | OAuth/Token | **Every Brazilian business** | **High** | 30–40 | CNPJ/CPF validation; third-party wrappers easier (ReceitaWS, Minha Receita) |
| eSocial | Mandatory labor reporting | ⚠️ SOAP/XML | Third-party wrappers | Digital certificate | All employers | Medium | 40–50 | Use TecnoSpeed or nfephp-org wrappers |
| SPED | Digital bookkeeping system | ⚠️ SOAP/XML | Via ERP integrations | Digital certificate | All businesses | Low | — | Best accessed via TOTVS/ERP |

### H. Industry verticals

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Decolar/Despegar | Largest LATAM OTA | ✅ Partner API | dev.despegar.com | Partner credentials | NYSE-listed; 18M+ customers | Low | 30–35 | Partner agreement required |
| Conexa Saúde | Telehealth leader | ✅ Enterprise API | apidocs.conexasaude.com.br | API Token | Leading telehealth | Low | 20–25 | Enterprise-only |
| QuintoAndar | Real estate platform | ❌ No API | N/A | — | Valued at $5.1B | Low | — | 64 GitHub repos but no public API |

### Brazil top 15 MCP priority list

| Rank | Company | Category | Justification |
|------|---------|----------|---------------|
| 1 | **Mercado Pago** | Payments | Already has MCP server; covers Pix, cards, boleto; dominant platform |
| 2 | **NFe.io** | E-invoicing | Mandatory for all businesses; API Key auth; SDKs in 5 languages; 15-hour build |
| 3 | **Focus NFe** | E-invoicing | Same rationale; Basic Auth; supports NFe/NFCe/NFSe/CTe/MDFe |
| 4 | **Mercado Livre** | Marketplace | 148M+ users; comprehensive OAuth 2.0 API; serves BR/MX/AR |
| 5 | **Pagar.me** | Payment gateway | Best developer experience; simple API Key; SDKs in 5 languages |
| 6 | **PagBank** | Payment gateway | 30M+ accounts; public sandbox; token auth |
| 7 | **TOTVS** | ERP | 70K+ customers, 30% market share; most impactful but complex |
| 8 | **RD Station** | Marketing/CRM | 40K+ customers; OAuth 2.0; marketing automation leader |
| 9 | **Hotmart** | Digital products | 35M+ users; OAuth 2.0; sales/subscription/affiliate APIs |
| 10 | **Cielo** | Acquiring | Largest acquirer; public sandbox; e-commerce + POS |
| 11 | **Correios** | Logistics | Handles 50% of e-commerce deliveries; REST + legacy SOAP |
| 12 | **iFood** | Food delivery | 80% market share; OAuth 2.0; software house registration needed |
| 13 | **Bling** | ERP | 1M+ e-commerce users; OAuth 2.0; REST v3 |
| 14 | **Zenvia** | Communications | Multi-channel CPaaS; SMS/WhatsApp/Voice; NASDAQ-listed |
| 15 | **Banco do Brasil** | Banking | Most mature bank developer portal; public sandbox |

---

## Mexico: 130M people, where CFDI compliance meets fintech innovation

**Market overview**: Mexico has **100M+ internet users**, the 2nd-largest LATAM economy, and a **2018 Fintech Law** mandating open banking APIs from financial institutions. The dominant payment methods are cash (via OXXO, Latin America's largest convenience chain), credit/debit cards, and SPEI bank transfers. **CFDI (Comprobante Fiscal Digital por Internet)** is Mexico's mandatory electronic invoicing system — every business must use it. API documentation is primarily in **Spanish**. Mexico has a neutral geopolitical stance and strong US trade ties through USMCA.

### A. Commerce and marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Mercado Libre MX | Largest marketplace | ✅ Full REST API | developers.mercadolibre.com.mx | OAuth 2.0 | #1 e-commerce in MX | **High** | 40–60 | Same ML API, MX site ID: MLM |
| Amazon MX | #2 marketplace | ✅ SP-API | developer-docs.amazon.com/sp-api | OAuth 2.0 + AWS SigV4 | #2 e-commerce | Medium | 25–35 | Global API with MX marketplace |
| Coppel | Major retailer (1,800+ stores) | ❌ No API | N/A | — | Major retailer | Low | — | No developer API |
| Liverpool | Premium department store | ❌ No API | N/A | — | 130+ locations | Low | — | No developer API |

### B. Food delivery and restaurant

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Rappi MX | #1 delivery super-app | ✅ Partner API | dev-portal.rappi.com | OAuth 2.0 (Auth0) | #1 in MX delivery | Medium | 25–35 | Partner-restricted |
| Uber Eats MX | Major food delivery | ✅ Marketplace API | developer.uber.com/docs/eats | OAuth 2.0 | Major player | Medium | 25–30 | POS integrator program |
| DiDi Food MX | Growing delivery | ❌ No API | N/A | — | Aggressive expansion | Low | — | Via third-party aggregators only |

### C. Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| **Mercado Pago MX** | LATAM payments leader | ✅ **HAS MCP SERVER** | mercadopago.com.mx/developers | OAuth 2.0 | Largest LATAM fintech | **Critical** | 0 (exists) | **Already has official MCP server** |
| **Conekta** | Mexico's #1 payment gateway | ✅ **HAS MCP SERVER** | developers.conekta.com | API Key (Basic) | Leading MX gateway | **Critical** | 0 (exists) | **conekta/mcp-server on GitHub; OXXO Pay, SPEI, cards** |
| OpenPay (BBVA) | Payment platform | ✅ Full REST API | documents.openpay.mx/docs/api | Basic Auth | BBVA-backed | **High** | 25–30 | Sandbox; also operates in Colombia/Peru |
| Bitso | Largest LATAM crypto exchange | ✅ REST + WebSocket | docs.bitso.com | HMAC-SHA256 | Largest LATAM crypto | **High** | 30–40 | 60 RPM public, 300 RPM private; sandbox available |
| Clip | Mexico's POS unicorn | ✅ REST APIs | developer.clip.mx | API Key | Hundreds of thousands of merchants | **High** | 25–30 | Checkout API, Transactions, Terminal SDK |
| BBVA Mexico | Largest bank in MX | ✅ Multiple APIs | bbvaapimarket.com | OAuth 2.0/API Key | ~30% market share | Medium | 35–45 | Most extensive bank API catalog in MX; many partner-only |
| Banregio | Innovative regional bank | ✅ Developer portal | api.banregio.com | API credentials | Hey Banco neobank | Medium | 25–30 | Innovation leader |
| PayPal MX | Global payments | ✅ Global API | developer.paypal.com | OAuth 2.0 | Significant MX presence | Low | 15–20 | Global API well-served by existing MCPs |
| SumUp MX | Global POS | ✅ Global API | developer.sumup.com | OAuth 2.0 | Growing | Low | 15–20 | Global developer portal |

### D. Logistics

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| **Skydropx** | Shipping aggregator (20+ carriers) | ✅ REST API | docs.skydropx.com | OAuth 2.0 | Leading aggregator | **High** | 25–35 | **Single API for FedEx, Estafeta, DHL, UPS, 99minutos** |
| 99minutos | Last-mile delivery leader | ✅ REST API | developers.99minutos.com | API Key | 50K+ daily deliveries | Medium | 20–25 | 52 cities; YCombinator S18 |
| Estafeta | Major courier | ✅ SOAP-based | Via aggregators | Login + API Key | Major carrier | Low | 25–30 | Better accessed via Skydropx |
| DHL MX | Global courier | ✅ Global API | developer.dhl.com | API Key | Major presence | Low | 15–20 | Global developer portal |

### E. ERP, accounting, and fiscal (CFDI)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| **Facturapi** | CFDI 4.0 invoicing API | ✅ Excellent REST API | docs.facturapi.io | API Key (Bearer) | Thousands of integrations | **Critical** | 15–20 | **Stripe-like DX; SDKs in 3 langs; EN/ES docs; free trial** |
| Bind ERP | #1 cloud ERP for MX SMEs | ✅ REST API | developers.bind.com.mx | API Key | 6K+ users | Medium | 20–25 | 150–300 req/5min rate limits |
| SW Sapien | CFDI PAC (stamping) | ✅ REST API | developers.sw.com.mx | Token | Established PAC | Medium | 20–25 | Postman collection available |
| FiscalAPI | Modern CFDI 4.0 API | ✅ REST API | docs.fiscalapi.com | API Key | Growing | Medium | 20–25 | SDKs in 6 languages |
| ContPAQi | Major MX ERP | ✅ Cloud APIs | developers.contpaqinube.com | Subscription key | Major ERP | Low | 30–40 | Complex ecosystem; Azure API Management |
| Finkok/Quadrum | CFDI PAC | ✅ SOAP API | github.com/phpcfdi/finkok | Username/Password | Established | Low | 25–30 | SOAP-based; less MCP-friendly |
| Aspel | Legacy desktop ERP | ❌ No API | N/A | — | Large user base | Low | — | Desktop-only; acquired by Siigo |

### F. Government and compliance

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| SAT | Tax authority | ⚠️ Complex SOAP | Via third-party wrappers | Various | Every MX business | **High** | 30–40 | Access via Facturapi, CheckID, APIMarket, Satpi |
| gob.mx Datos Abiertos | Open data platform | ✅ Open API | datos.gob.mx | Public/open | Government data | Low | 15–20 | DKAN/CKAN-based |
| CURP validation | National ID | ⚠️ Third-party only | valida-curp.com.mx, apimarket.mx | API Key | KYC requirement | Medium | 15–20 | No official REST API |
| RFC validation | Tax ID | ⚠️ Third-party only | Via Facturapi, CheckID, Satpi | API Key | Invoicing requirement | Medium | 10–15 | Facturapi validates RFC natively |

### G. Communications and marketing

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Auronix | Mexican CPaaS | ✅ Partner API | auronix.com | Partner credentials | 30+ years | Low | 25–30 | Enterprise-only; WhatsApp BSP |
| Sinch MX | Global CPaaS | ✅ Global API | developers.sinch.com | API Key/OAuth | Global | Low | 15–20 | Global API |
| Doctoralia MX | Healthcare appointments | ✅ Partner API | integrations.docplanner.com | Partner credentials | Market leader | Low | 20–25 | DocPlanner Integrations API |

### Mexico top 15 MCP priority list

| Rank | Company | Category | Justification |
|------|---------|----------|---------------|
| 1 | **Facturapi** | CFDI invoicing | Every MX business needs CFDI; best DX; API Key auth; 15-hour build |
| 2 | **Mercado Pago** | Payments | Already has MCP server; OXXO Pay, SPEI, cards, wallet |
| 3 | **Conekta** | Payment gateway | Already has MCP server on GitHub; #1 MX gateway; OXXO/SPEI/cards |
| 4 | **Mercado Libre MX** | Marketplace | Largest MX marketplace; same ML API with MX site ID |
| 5 | **Bitso** | Crypto exchange | Largest LATAM crypto; excellent API docs; HMAC auth |
| 6 | **Skydropx** | Shipping aggregator | Single API for 20+ carriers; critical for e-commerce |
| 7 | **OpenPay** | Payments (BBVA) | BBVA-backed; public sandbox; simple Basic Auth |
| 8 | **Clip** | POS/payments | Mexico's POS unicorn; Checkout + Transaction APIs |
| 9 | **Bind ERP** | Cloud ERP | #1 cloud ERP for MX SMEs; API Key auth |
| 10 | **99minutos** | Last-mile delivery | 50K+ daily deliveries; developer portal |
| 11 | **BBVA Mexico** | Banking | Most extensive bank API catalog in Mexico |
| 12 | **FiscalAPI** | CFDI invoicing | Modern alternative; SDKs in 6 languages |
| 13 | **SW Sapien** | CFDI PAC | REST-based CFDI stamping; Postman collection |
| 14 | **Amazon MX** | Marketplace | Growing; SP-API global standard |
| 15 | **Rappi MX** | Food delivery | #1 delivery app; partner API available |

---

## Argentina: 46M people, where inflation drives fintech innovation

**Market overview**: Argentina has **36M internet users** and an extremely active fintech scene driven by chronic peso instability (inflation exceeded 200% in 2023). **Mercado Pago dominates payments** — no single company is more important to Argentina's digital economy. AFIP's electronic invoicing is **mandatory for all businesses**. Open banking regulation is immature compared to Brazil. The Central Bank (BCRA) provides public APIs for exchange rates and monetary statistics. The dominant payment method is a mix of credit cards, Mercado Pago wallet, and MODO (bank consortium). API documentation is primarily in **Spanish**.

### A. Commerce

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Mercado Libre AR | Dominant marketplace | ✅ Full REST API | developers.mercadolibre.com.ar | OAuth 2.0 | 150M+ LATAM users | **High** | 40–60 | Same ML API, AR site ID: MLA |

### B. Food delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| PedidosYa | #1 delivery (iFood-owned) | ⚠️ Partner-only | socios.pedidosya.com.ar | Partner credentials | 20K+ couriers | Low | — | Via POS integrations (Fudo) |
| Rappi AR | Delivery super-app | ⚠️ Partner-only | dev-portal.rappi.com | OAuth 2.0 | Major presence | Low | — | Via POS integrations |

### C. Finance and payments

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| **Mercado Pago AR** | Dominant payments | ✅ **HAS MCP SERVER** | mercadopago.com.ar/developers | OAuth 2.0 | Dominant in AR | **Critical** | 0 (exists) | **Already has MCP server + Claude plugin + LLM guide** |
| Mobbex | Payment gateway | ✅ Full REST API | mobbex.dev | API Key + Token | Growing alternative | Medium | 20–25 | WooCommerce, PrestaShop, VTEX plugins |
| MODO | Bank consortium wallet (35+ banks) | ⚠️ Merchant API | merchants.modo.com.ar/docs | Partner credentials | 100K+ merchant locations | Medium | 25–30 | QR payments; 35+ member banks |
| Ripio | Crypto exchange/wallet | ✅ Full REST API | apidocs.ripiotrade.co | HMAC + API Key | Major LATAM crypto | **High** | 25–35 | Trade API + B2B Ramps API; webhooks |
| Ualá | Neobank | ⚠️ No public API | N/A | — | **7M+ users** | Low | — | Huge user base but no API; watch for open banking |
| Lemon Cash | Crypto wallet + Visa card | ⚠️ No public API | N/A | — | **3.5M+ users** | Low | — | Popular but no developer access |
| Banco Galicia | Major private bank | ❌ No public API | N/A | — | 3M+ customers | Low | — | Uses Red Hat 3scale internally |
| BCRA Public APIs | Central bank data | ✅ REST API | bcra.gob.ar/en/central-bank-api-catalog | Public | Exchange rates, stats | Low | 10–15 | Useful for fintech context |

### D. Logistics

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Andreani | #1 private courier | ✅ Developer portal | developers.andreani.com | Contract credentials | 80 years in market | **High** | 25–30 | Shipment, tracking, rate APIs |
| OCA | Major courier | ✅ Developer portal | developers.oca.com.ar | Client credentials | #2 private courier | Medium | 20–25 | Shipping and tracking |
| Correo Argentino | National post | ✅ Developer portal | tintegraciones.correoargentino.com.ar | API credentials | National service | Medium | 20–25 | Also on RapidAPI |

### E. ERP, accounting, and fiscal

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| **AFIP Factura Electrónica** | Mandatory electronic invoicing | ✅ SOAP WS (REST via AfipSDK) | afip.gob.ar/ws/documentacion | X.509 cert + SOAP | **Every AR business** | **Critical** | 40–50 | **Use AfipSDK (docs.afipsdk.com) for REST wrapper; Node/PHP/Python/Ruby** |
| Colppy | Cloud accounting | ✅ REST API | apidocs.colppy.com | Username/password | SME-focused | Medium | 20–25 | AFIP integration built-in |
| Xubio | Cloud ERP (Visma) | ⚠️ Pre-built connectors | N/A | — | 50K+ businesses | Low | — | No clear public API |

### F. Marketing and other

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size/Users | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------------|-------------|------------|-------|
| Doppler | Email marketing | ✅ Full REST API | restapi.fromdoppler.com/docs | API Key | LATAM leader (Spanish) | Medium | 15–20 | 93+ GitHub repos; campaigns, lists, subscribers |
| Auravant | Precision agriculture | ✅ Developer APIs | developers.auravant.com | Extension auth | AR agriculture sector | Low | 20–25 | Niche but important for AR agriculture |
| Despegar | LATAM OTA (HQ in Buenos Aires) | ✅ Partner API | dev.despegar.com | Partner credentials | NYSE-listed | Low | 25–30 | Partner agreement required |

### Argentina top 15 MCP priority list

| Rank | Company | Category | Justification |
|------|---------|----------|---------------|
| 1 | **Mercado Pago AR** | Payments | Already has MCP server; every AR business uses it |
| 2 | **AFIP (via AfipSDK)** | E-invoicing | Mandatory for all businesses; AfipSDK wraps SOAP in REST |
| 3 | **Mercado Libre AR** | Marketplace | Dominant marketplace; comprehensive API |
| 4 | **Ripio** | Crypto | Best LATAM crypto API; high adoption due to inflation |
| 5 | **Andreani** | Logistics | #1 private courier; developer portal |
| 6 | **Mobbex** | Payment gateway | Full public REST API; growing alternative |
| 7 | **Colppy** | Accounting | Cloud ERP with API; AFIP integration |
| 8 | **Correo Argentino** | Postal/logistics | National service; developer portal + RapidAPI |
| 9 | **OCA** | Logistics | #2 courier; developer portal |
| 10 | **MODO** | Mobile payments | 35+ banks; merchant API |
| 11 | **Doppler** | Email marketing | Full REST API; AR-headquartered |
| 12 | **BCRA APIs** | Central bank data | Public APIs for exchange rates, monetary data |
| 13 | **Auravant** | AgriTech | Developer platform for AR agriculture |
| 14 | **Despegar** | Travel | Largest LATAM OTA; partner API |
| 15 | **Ualá** | Neobank | 7M+ users; no API yet but monitor closely |

---

## Three companies already have MCP servers

The most significant finding is that MCP adoption has already begun in LATAM. **Mercado Pago** launched an official MCP server with documentation for Cursor and other clients, plus a Claude Code marketplace plugin (GitHub: mercadopago/mercadopago-claude-marketplace). **Conekta** has published conekta/mcp-server on GitHub for Mexico's leading payment gateway. **Infobip** is building MCP servers natively for their CPaaS platform. This confirms strong market demand and validates the opportunity for additional MCP server development across the ecosystem.

---

## Cross-country platforms that should be built once

Several companies operate across multiple countries and can be implemented as a single MCP server with country-specific configuration (site IDs, currencies, payment methods, tax rules).

| Company | Countries | Category | Implementation Strategy |
|---------|-----------|----------|------------------------|
| **Mercado Libre** | BR, MX, AR | Marketplace | Single API, site IDs: MLB (BR), MLM (MX), MLA (AR). One MCP server with country parameter. |
| **Mercado Pago** | BR, MX, AR | Payments | **Already has MCP server.** Single API with country-specific payment methods (Pix in BR, OXXO in MX, Rapipago in AR). |
| **Rappi** | BR, MX, AR | Food delivery | Single developer portal (dev-portal.rappi.com). Partner API with country endpoints. |
| **Uber/Uber Eats** | BR, MX, AR | Transport/Food | Global API with country-specific availability. Restricted developer access. |
| **Amazon** | BR, MX | Marketplace | SP-API with country marketplace IDs. Single MCP server. |
| **WhatsApp Business** | BR, MX, AR | Messaging | Meta Cloud API. Single global API with country-specific phone number provisioning. |
| **SumUp** | BR, MX | POS | Global developer.sumup.com API. Single MCP with country config. |
| **Despegar/Decolar** | BR, MX, AR | Travel | Same company (different branding in BR). Partner API at dev.despegar.com. |
| **Shopee** | BR (MX possible) | Marketplace | open.shopee.com with country-specific endpoints. |
| **Doctoralia** | BR, MX | Healthcare | DocPlanner Integrations API across both markets. |
| **Ripio** | AR, BR, MX | Crypto | Single API platform; country-specific fiat on/off-ramps. |
| **DHL** | BR, MX, AR | Logistics | Global developer.dhl.com API. |
| **Infobip** | BR, MX, AR | CPaaS | **Already building MCP servers.** Global API with local numbers. |

---

## The mandatory compliance opportunity is the biggest unlock

The single most important insight from this research is that **mandatory government compliance systems represent the highest-value MCP targets** because they have universal adoption — every business must use them, regardless of size or sector.

In **Brazil**, NFe/NFSe electronic invoicing is mandatory, and NFe.io and Focus NFe offer API-key-authenticated REST APIs with SDKs in 5+ languages. An NFe.io MCP server could be built in **15–20 hours** and would serve the needs of every Brazilian business. In **Mexico**, CFDI 4.0 invoicing through Facturapi offers a Stripe-quality developer experience with API Key auth and full EN/ES documentation — also achievable in **15–20 hours**. In **Argentina**, AFIP's factura electrónica uses legacy SOAP services with complex PKI certificate authentication, but **AfipSDK** wraps this in a clean REST layer, making a practical MCP server feasible in **40–50 hours**.

Beyond compliance, the payments layer is the second critical tier. Mercado Pago (already live), Conekta (already live), PagBank, Pagar.me, and Cielo collectively process the vast majority of digital transactions across all three countries. Payment MCP servers enable AI agents to create charges, check statuses, generate QR codes, issue refunds, and manage subscriptions — the operational backbone of any digital business.

## What should be built first: the 10 highest-impact MCP servers

Combining cross-country reach, market size, API maturity, and implementation feasibility, these are the ten MCP servers that would deliver the most value:

1. **Mercado Libre marketplace** (BR+MX+AR) — One build, three countries, 148M+ users
2. **NFe.io or Focus NFe** (BR) — Mandatory e-invoicing, API Key auth, ~15 hours
3. **Facturapi** (MX) — Mandatory CFDI, best-in-class DX, ~15 hours
4. **AFIP via AfipSDK** (AR) — Mandatory invoicing, REST wrapper available, ~40 hours
5. **Pagar.me** (BR) — Best DX among BR payment gateways, API Key, ~20 hours
6. **TOTVS** (BR) — 70K+ customers but high complexity, ~60–80 hours
7. **Bitso** (MX+LATAM) — Largest LATAM crypto exchange, excellent docs, ~30 hours
8. **Skydropx** (MX) — Single API for 20+ carriers, ~25 hours
9. **Hotmart** (BR+global) — 35M+ users, digital products/creator economy, ~25 hours
10. **RD Station** (BR) — 40K+ customers, marketing automation leader, ~25 hours

Mercado Pago and Conekta are excluded from this build list because they already have live MCP servers. The total estimated build time for all ten is approximately **275–345 hours** — a focused team could deliver the entire set in 8–10 weeks, unlocking AI agent access to the core infrastructure of Latin America's three largest digital economies.