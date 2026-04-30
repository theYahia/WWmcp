# India SaaS, infrastructure, and verticals: MCP server candidates

**India's SaaS ecosystem is surprisingly MCP-ready, with 20+ existing servers and 80+ platforms assessed.** Payments lead the pack — Razorpay, Paytm, Cashfree, and Juspay all ship official MCP servers. Zoho has emerged as the most prolific with ~10+ implementations (official + community) plus a dedicated MCP platform at zoho.com/mcp. The biggest untapped opportunities sit in logistics (Shiprocket, Delhivery), mapping (MapMyIndia), tax compliance (ClearTax), and customer engagement (CleverTap, MoEngage, WebEngage) — all have excellent APIs but zero MCP servers. EdTech (Unacademy, upGrad, PhysicsWallah) and real estate (99acres, MagicBricks) are dead zones with no public APIs whatsoever.

This report covers **90+ Indian platforms across 16 categories**, with verified API documentation URLs, authentication details, existing MCP server inventories, and prioritized build recommendations for a development team.

---

## Comprehensive platform assessment table

| Company | What It Does | API Status | API Docs URL | Auth Type | Market Significance | MCP Priority | Est. Hours | Notes |
|---------|-------------|-----------|-------------|-----------|-------------------|-------------|-----------|-------|
| **CRM** | | | | | | | | |
| Zoho CRM | Flagship CRM with sales pipeline, leads, deals, contacts | Verified | `zoho.com/crm/developer/docs/api/v7/` | OAuth 2.0 | 50+ product ecosystem, 100M+ users | HIGH | S (8-20h) | Official MCP platform + 6+ community servers |
| Freshsales/CRM | Cloud CRM with phone/email, lead scoring, deal pipelines | Verified | `developers.freshworks.com/crm/api/` | API Key (Token) | NASDAQ-listed, strong India/global | HIGH | S (8-20h) | Zapier MCP exists; no standalone open-source |
| LeadSquared | Marketing automation + CRM for education, healthcare, BFSI | Verified | `apidocs.leadsquared.com/` | Access Key + Secret Key | India's top vertical CRM | HIGH | M (25-50h) | Comprehensive REST API, no MCP exists |
| Kylas CRM | India-focused startup CRM, unlimited users model | Partial | No public docs | API Key | Small but growing India SMB | LOW | S-M (15-35h) | No public API documentation |
| Salesforce India | Global #1 CRM with India data residency (Hyperforce) | Verified | `developer.salesforce.com/docs/apis` | OAuth 2.0 | Global dominant | LOW | S (8-15h) | 5+ MCP servers already exist (official + community) |
| **ERP / Accounting** | | | | | | | | |
| Zoho Books | Cloud accounting — invoicing, expenses, banking, tax compliance | Verified | `zoho.com/books/api/v3/introduction/` | OAuth 2.0 | Major cloud accounting in India | HIGH | S (8-20h) | Community MCP exists (kkeeling/zoho-mcp) |
| Zoho Invoice | Free online invoicing with payments and time tracking | Verified | `zoho.com/invoice/api/v3/` | OAuth 2.0 | Free tier drives adoption | MED | S (8-20h) | Covered by Zoho Books MCP |
| TallyPrime | India's dominant desktop accounting — **7M+ businesses** | Documented | `help.tallysolutions.com/integration-with-tallyprime/` | None (network-level) | De facto standard for Indian SMEs | HIGH | M (20-60h) | Community MCP: dhananjay1405/tally-mcp-server (19★) |
| ERPNext/Frappe | Open-source ERP — accounting, CRM, HR, inventory, manufacturing | Verified | `docs.frappe.io/framework/user/en/api/rest` | API Key, OAuth 2.0 | Thousands of companies globally | HIGH | S (8-20h) | **Official frappe/mcp (117★) + 5 community servers** |
| Ramco Systems | Cloud ERP for HR, payroll, logistics, aviation MRO | Partial | `developer.ramco.com/` (registration required) | Developer registration | Enterprise niche | LOW | M (20-60h) | API behind registration wall |
| Busy Accounting | Desktop billing/accounting for MSMEs — 600K+ businesses | None | N/A | N/A | Significant but closed | LOW | L (60-150h) | No native API; third-party connectors only |
| **GST & Tax** | | | | | | | | |
| GSTN API | Government GST backbone — registration, filing, payments | Documented (via GSPs) | Via licensed GSPs only | GSTIN + OTP, multi-layer | Mandatory for all Indian businesses | HIGH | L (60-150h) | Requires GSP license; build via ClearTax instead |
| NIC e-Invoice | Government e-Invoice portal — IRN generation, mandatory for ₹5Cr+ | Verified | `einv-apisandbox.nic.in/` | AES256 + RSA encrypted | Mandatory compliance | HIGH | L (60-150h) | Complex encryption; recommend ClearTax wrapper |
| ClearTax (Clear) | India's #1 tax platform — GST, e-Invoice, e-Way Bill, TDS | Verified | `docs.cleartax.in/cleartax-docs` | Client ID + Secret | 1.5M+ customers, 20K+ CAs | HIGH | M-L (40-100h) | **Best single integration for all India GST needs**; no MCP exists |
| e-Way Bill API | Government e-Way Bill system for goods transport >₹50K | Verified | `docs.ewaybillgst.gov.in/apidocs/` | Client ID/Secret + encrypted payloads | Mandatory for logistics | MED-HIGH | M (30-60h) | Covered by ClearTax integration |
| Khatabook | Digital ledger app for micro-merchants, 11 languages | None | N/A | N/A | Millions of mobile users | LOW | L (60-150h) | Consumer mobile app, no API |
| myBillBook | GST billing for SMBs (Intuit-owned) | Unknown | N/A | N/A | SMB mobile-first | LOW | M-L (40-100h) | No public docs; Intuit acquisition may change this |
| Vyapar | Mobile billing/accounting — "India's #1" | None | N/A | N/A | Large mobile user base | LOW | L (60-150h) | No API or developer ecosystem |
| **Document / eSign** | | | | | | | | |
| Leegality | India's #1 eSign/eStamp platform for enterprises (BFSI) | Verified | `app.swaggerhub.com/apis/leegality/eSign_API/2.0` | X-Auth-Token header | 2000+ businesses, HDFC etc. | HIGH | M (20-50h) | Clean API v3.0 workflow-based; no MCP exists |
| SignDesk | eSign, eStamp, eNACH, Video KYC (rebranding to "Melento") | Partial | No public docs | Enterprise onboarding | 1500+ clients | LOW-MED | M (30-60h) | No public API documentation |
| Digio | Aadhaar eSign, eKYC, Digital Signatures, eNACH, Video KYC | Verified | `documentation.digio.in/digisign/` | API credentials (enterprise) | Zerodha, Groww, CoinSwitch | HIGH | M (25-60h) | Comprehensive eSign+KYC+NACH combo |
| Setu | Fintech API infra — eSign, UPI, BBPS, Account Aggregator | Verified | `docs.setu.co/` | OAuth/API key via Setu Bridge | Pine Labs-backed, broad platform | MED-HIGH | S-M (15-35h) | **Best developer experience**; expandable to payments |
| **HR / Recruiting** | | | | | | | | |
| Naukri.com | India's #1 job board — 75M+ users, 200K+ recruiters | None (public) | N/A (commercial partnership only) | API keys under MSA | Dominant job platform | LOW | N/A | Requires commercial agreement with Info Edge |
| Keka HR | Cloud HR & payroll — recruitment to retirement | Verified | `developers.keka.com/reference/getting-started-with-your-api` | OAuth 2.0 | Leading India HR platform | HIGH | M (20-60h) | Full HR lifecycle API, sandbox available; no MCP |
| greytHR | HR & payroll for SMBs — freemium model | Verified | `api-docs.greythr.com/` | OAuth 2.0 | Strong India SMB HR market | HIGH | M (20-60h) | Postman collection available; no MCP exists |
| Darwinbox | Enterprise HCM — unicorn, 900+ enterprises | Verified | `api-docs.darwinbox.com/` | Basic Auth or OAuth 2.0 | Enterprise-focused unicorn | MED | M (20-60h) | API access gated/request-only |
| Zoho People | HR management — onboarding, attendance, leave, performance | Verified | `zoho.com/people/api/` | OAuth 2.0 | Part of Zoho ecosystem | MED | S (8-20h) | Covered by Zoho MCP platform |
| Zoho Recruit | ATS/recruitment software | Verified | `zoho.com/recruit/developer-guide/apiv2/` | OAuth 2.0 | Part of Zoho ecosystem | MED | S (8-20h) | CRM-like API structure |
| HROne | Enterprise HRMS — 400K+ users, 10+ modules | Verified | `developer.hrone.cloud/` | Bearer token (OAuth) | Growing enterprise HR | MED | S (8-20h) | Azure API Management-powered portal |
| Pocket HRMS | AI-powered cloud HRMS for SMBs — 2000+ companies | Partial | No public API reference | Unknown | Mid-market HR | LOW | N/A | API claimed but undocumented |
| **CPaaS / Messaging** | | | | | | | | |
| Gupshup | World's largest conversational messaging — **10B+ msgs/month** | Verified | `docs.gupshup.io/` | API Key | 50K+ customers, 130+ countries | HIGH | L (60-150h) | Pipedream generic MCP only; dedicated server needed |
| MSG91 | Multi-channel CPaaS — SMS, WhatsApp, Email, Voice, RCS, OTP | Verified | `docs.msg91.com/` | authkey | Popular with Indian startups | MED | M (20-60h) | Pipedream MCP available |
| Exotel | India's leading cloud telephony — voice, SMS, IVR | Verified | `developer.exotel.com/api` | HTTP Basic (key+token) | Major Indian enterprises | HIGH | S (8-20h) | **Official MCP: exotel/ExotelMCP** (Java/Spring Boot) |
| Kaleyra | Global CPaaS — SMS, WhatsApp, RCS, Voice, Video, Email | Verified | `developers.kaleyra.io/` | API Key + SID | Now Tata Communications | MED | L (60-150h) | 7 channels; no MCP exists |
| Knowlarity | Cloud telephony — IVR, virtual numbers, call tracking | Partial | `developer.knowlarity.com/` (JS-rendered) | API Key | 15K+ businesses | LOW | M (20-60h) | Poor API documentation quality |
| Textlocal India | SMS gateway for India | **DEFUNCT** | N/A | N/A | **Shut down Oct 31, 2025** | NONE | N/A | Migrated to Cisco Webex Interact |
| MyOperator | Cloud calling + WhatsApp Business API | Documented | `myoperator.com/api/` | API Token + secret | 12K+ businesses | LOW | S (8-20h) | Limited developer ecosystem |
| **Email / Marketing** | | | | | | | | |
| Zoho Campaigns | Email marketing — newsletters, drips, lists | Verified | `zoho.com/campaigns/help/api/` | OAuth 2.0 | Part of Zoho ecosystem | MED | S (8-20h) | Covered by Zoho MCP platform |
| WebEngage | Full-stack engagement — push, email, SMS, WhatsApp, in-app | Verified | `docs.webengage.com/docs` | Bearer token + License Code | 800+ global brands | HIGH | M (20-60h) | Multi-channel; no MCP exists |
| MoEngage | AI-powered engagement — push, email, SMS, cards, analytics | Verified | `developers.moengage.com/hc/en-us` | Basic Auth (WorkspaceID:APIKey) | 1200+ global brands | HIGH | M (20-60h) | **Has llms.txt support** — MCP-forward |
| CleverTap | All-in-one engagement + analytics CDP | Verified | `developer.clevertap.com/docs` | X-CleverTap-Account-Id + Passcode | 2000+ brands globally | HIGH | M (20-60h) | Server SDKs (Python, Java, Go); no MCP |
| Netcore Cloud | India's largest omnichannel marketing cloud (formerly Pepipost) | Verified | `cpaasdocs.netcorecloud.com/` | API Key | 6500+ enterprise customers | HIGH | L (60-150h) | Multiple products; start with Email API |
| Mailmodo | AMP email marketing with interactive emails | Verified | `developers.mailmodo.com/` | mmApiKey | Growing startup | MED | S (8-20h) | Niche AMP email; simpler API surface |
| **Analytics / CDP** | | | | | | | | |
| Zoho Analytics | Self-service BI/analytics with dashboards and reports | Verified | `zoho.com/analytics/api/` | OAuth 2.0 | Part of Zoho ecosystem | MED | S (8-20h) | **Official MCP: zoho/analytics-mcp-server** |
| Hevo Data | No-code data pipeline/ETL — 150+ sources to warehouses | Verified | `api-docs.hevodata.com/reference/introduction` | Basic Auth (API Key:Secret) | 2500+ data teams | MED-HIGH | M (20-60h) | Clean pipeline mgmt API; no MCP |
| CustomerLabs | First-party data CDP for marketers | Partial | JS API only; REST API login-gated | JS SDK / API key | Niche CDP | LOW | S (8-20h) | Limited public API surface |
| **Maps / Geolocation** | | | | | | | | |
| MapMyIndia/Mappls | India's #1 indigenous mapping platform — 40Cr+ Indians | Verified | `about.mappls.com/api/` | OAuth 2.0 (24h token) | Government-compliant, India data | HIGH | M (40-60h) | **No MCP exists** — biggest gap |
| Ola Maps | AI-powered mapping by Ola Krutrim | Verified | `maps.olakrutrim.com/docs` | API Key + OAuth 2.0 | 10K+ developers signed up | MED | S (12-20h) | Newer platform; quick win |
| **Logistics / Courier** | | | | | | | | |
| Shiprocket | India's #1 eCommerce logistics aggregator — **17+ couriers** | Verified | `apidocs.shiprocket.in/` | Bearer Token (JWT, 10-day expiry) | Dominant aggregator | HIGH | M (30-50h) | **No MCP exists** — major opportunity |
| Delhivery | India's largest B2B & C2C logistics provider (publicly listed) | Verified | `delhivery-express-api-doc.readme.io/reference` | API Token | India's largest courier | HIGH | M (25-40h) | No MCP exists; clean docs on readme.io |
| BlueDart | India's #1 premium courier (DHL/DPDHL Group) | Partial (SOAP) | No public portal; PDF guides only | License Key + Credentials (SOAP) | Premium segment leader | MED | L (60-80h) | SOAP API = major barrier; use Shiprocket instead |
| Ecom Express | Major e-commerce logistics provider | Verified | `integration.ecomexpress.in/` | API credentials | Significant player | MED | S (15-25h) | Postman collection available |
| Shadowfax | Same-day/hyperlocal delivery — Flipkart, Meesho, Nykaa | Partial | Apiary: `sfxhlmarketplaceapi.docs.apiary.io/` | API token | Growing fast (Uber partnership) | MED | M (25-40h) | Fragmented documentation |
| Dunzo | Hyperlocal delivery startup | **DEFUNCT** | N/A | N/A | **Shut down Jan 2025** | NONE | N/A | Reliance wrote off $200M investment |
| Porter | Intra-city goods transport — 22+ cities | Partial | `porter.in/api-integrations` (no technical docs) | Unknown | India's leading intra-city | LOW | M (25-40h) | API limited to 2-wheelers currently |
| XpressBees | Fast-growing express logistics | Partial | No public developer portal | API credentials | Growing courier | LOW | M (30-50h) | Use through Shiprocket aggregation |
| iThink Logistics | Courier aggregator — 29K+ pincodes, 180+ countries | Verified | `docs.ithinklogistics.com/` | API Key + Secret Key | Smaller aggregator | MED | S (15-25h) | AI-powered courier recommendation |
| **Real Estate** | | | | | | | | |
| 99acres | India's leading property portal (Info Edge) | None | N/A | N/A | Dominant classifieds | LOW | L (60-150h) | CRM lead webhooks only; no public API |
| MagicBricks | Major property portal (Times Group) | None | N/A | N/A | Major classifieds | LOW | L (60-150h) | CRM lead webhooks only |
| Housing.com/PropTiger | India's #1 real estate app (REA India/News Corp) | None | N/A | N/A | Dominant mobile app | LOW | L (60-150h) | Active Akamai anti-bot protection |
| NoBroker | India's first proptech unicorn — C2C platform | None (official) | Unofficial: `api.market/store/the-api-guy/nobroker-api` | RapidAPI key (unofficial) | Unicorn, zero-brokerage | MED | M (20-60h) | Unofficial API only; fragile |
| **EdTech** | | | | | | | | |
| Unacademy | India's largest learning platform | None | N/A | N/A | Massive user base | LOW | L (60-150h) | Zero developer ecosystem |
| upGrad | Online higher education | None | N/A | N/A | Major ed-tech | LOW | L (60-150h) | No developer program |
| Scaler | Premium tech education | None | N/A | N/A | Growing tech ed | LOW | L (60-150h) | No developer program |
| PhysicsWallah | EdTech unicorn — affordable education | None | N/A | N/A | Large student base | LOW | L (60-150h) | No developer program |
| **Healthcare** | | | | | | | | |
| Practo | India's leading healthcare platform — doctor search/appointments | Documented | `developers.practo.com/` (partner API) | OAuth (client_id + token) | #1 healthcare platform | HIGH | M (20-60h) | SDKs (Java, .NET, JS); requires partnership |
| Tata 1mg | E-pharmacy + diagnostics + consultations (Tata Digital) | Documented | `onedoc.1mg.com/public_docs/` | JWT (private key from 1mg) | Market leader in e-pharmacy | HIGH | S-M (8-40h) | **Best-documented healthcare API** |
| PharmEasy | Online pharmacy and diagnostics | None | N/A | N/A | Major player | LOW | L (60-150h) | No public API |
| Apollo 24/7 | Digital health by Apollo Hospitals Group | Partial (private) | N/A (corporate integration only) | Unknown | Largest private hospital chain | LOW | L (60-150h) | Corporate HRMS integration only |
| **Transport / Mobility** | | | | | | | | |
| Ola | India's ride-hailing giant | Partial (restricted) | `developers.olacabs.com/` (503 errors) | OAuth 2.0 | Major ride-hailing | LOW-MED | M (20-60h) | Dev portal degraded; company pivoting to EVs/AI |
| Namma Yatri | Open-source zero-commission ride-hailing (Beckn Protocol) | Verified (open source) | `github.com/nammayatri/nammayatri` (2.5K★) | Ed25519 request signing | 80K+ daily rides, expanding | HIGH | S-M (8-40h) | **Beckn MCP exists**: dumko2001/mcp-beckn-mobility |
| Rapido | India's #1 bike-taxi/auto platform | None | N/A | N/A | 100+ cities | LOW | L (60-150h) | No public API |
| IRCTC/Indian Railways | India's rail ticketing — world's 4th-largest network | Partial (3rd-party) | `rapidapi.com/IRCTCAPI/api/irctc1` & `indianrailapi.com/api-collection` | API Key (RapidAPI) | 1.4B+ people | HIGH | S (8-20h) | **5+ MCP servers exist** (amith-vp/indian-railway-mcp etc.) |
| Uber India | Global ride-hailing in India | Verified | `developer.uber.com/` | OAuth 2.0 | Major ride-hailing | MED | M (20-60h) | Global API, India uses same endpoints |
| **Travel** | | | | | | | | |
| MakeMyTrip | India's #1 online travel agency | Partial (B2B only) | myBiz API only | Partner API Key | Largest OTA | LOW-MED | L (60-150h) | No public consumer API |
| Goibibo | India's #2 OTA (MakeMyTrip Group) | Unknown | `developer.goibibo.com/docs` (DNS failing) | API Key (historical) | MakeMyTrip subsidiary | LOW | L (60-150h) | Developer portal likely defunct |
| ixigo | Travel meta-search and planning | Partial (partner SDK) | N/A | Client ID + API Key (partner) | Recently IPO'd | LOW | L (60-150h) | Partner SDK only, no public API |
| Cleartrip | OTA for flights, hotels, buses (Flipkart/Walmart) | Documented (B2B) | `saasdoc.cleartrip.com/reference/getting-started-with-your-api` | API Key + JWT | Strong India/Middle East | MED-HIGH | M (20-60h) | **Best-documented OTA API** |
| RedBus | India's #1 bus booking (MakeMyTrip Group) | Documented (B2B) | `api.seatseller.travel/docs/` | OAuth | 60K+ routes, 10K+ buses | MED | M (20-60h) | Via "SeatSeller" brand; B2B registration |
| **AgriTech** | | | | | | | | |
| DeHaat | Full-stack agri-platform for smallholder farmers | None | N/A | N/A | India's largest agri-platform | LOW | L (60-150h) | No developer ecosystem |
| Ninjacart | B2B fresh produce supply chain — 1400+ tonnes daily | None | N/A | N/A | Major B2B agri | LOW | L (60-150h) | Internal tech only |
| AgroStar | Digital agri-input marketplace for farmers | None | N/A | N/A | Maharashtra-focused | LOW | L (60-150h) | No API or developer program |
| CropIn | Enterprise agri-food SaaS — 56 countries, 388 crops | Partial (enterprise) | N/A (enterprise-gated) | Enterprise contract | World's leading agri SaaS | MED | M (20-60h) | API confirmed by IFC; no public docs |

---

## Zoho product deep dive: 18 APIs under one OAuth umbrella

Zoho (Chennai, India) operates **50+ products** under a unified OAuth 2.0 infrastructure via `accounts.zoho.com`. All APIs use RESTful JSON with consistent patterns. A single MCP auth module can serve every product. **Zoho has launched a dedicated MCP platform at `zoho.com/mcp`**, making the entire suite agent-ready. Community MCP servers already exist for CRM, Books, Mail, Projects, Analytics, and Creator.

The **multi-datacenter challenge** is the primary gotcha: Zoho operates 7+ data centers (.com, .eu, .in, .com.au, .jp, .ca, .com.cn), and every API call must route to the correct regional base URL. Rate limiting varies by product — CRM uses **credit-based concurrency** (5K–unlimited credits/day), financial products use **100 req/min + daily caps**, and Projects enforces **100 per 2 minutes with 30-minute lockout** on breach.

The financial suite (Books, Invoice, Inventory, Expense, Billing) shares a near-identical API pattern, reducing distinct adapter implementations to approximately **6-7 pattern families** across all 18 products. Key products with verified APIs include: **CRM** (V7/V8, COQL query language, Composite API), **Books** (OpenAPI spec available), **Desk** (multi-channel ticketing), **People** (form-based HR data model), **Projects** (V3 API), **Campaigns** (email marketing), **Analytics** (V2, unit-based rate limits), **Cliq** (team messaging, V2), **Sign** (e-signatures, Postman collection), **Creator** (low-code, OpenAPI v3.0), **Inventory** (multi-channel selling), **Recruit** (ATS, CRM-like), **Expense** (expense reporting), **Invoice** (invoicing, CRM integration), **Mail** (email operations + ZeptoMail transactional), **Billing** (subscription management), **SalesIQ** (live chat, V2 REST + JS API), and **One** (orchestration layer, not a direct API).

**Existing Zoho MCP servers**: Official `zoho/analytics-mcp-server`, Zoho MCP Platform (zoho.com/mcp), community servers for CRM (SkanderBS, JunnAI, asklokesh, CData), Books (kkeeling), CRM+Books unified (Mgabr90), Projects (qpiai), Mail (FujiwaraChoki), Creator (CData, Scaflog). Pipedream offers MCP access for Books, Desk, Mail, Inventory, and Cliq.

---

## Freshworks product deep dive: 9 products, 2 MCP servers already built

Freshworks (Chennai origin, NASDAQ: FRSH) maintains a unified developer portal at `developers.freshworks.com` with a Node.js SDK (`@freshworks/api-sdk`) and an app marketplace with 1,000+ apps.

**Freshdesk** (customer support) has the most mature API — REST v2 at `developers.freshdesk.com/api/` with API Key Basic Auth, plan-based rate limits (200–700 req/min), and a **working MCP server** (`effytech/freshdesk_mcp`, 46★, MIT, Python). **Freshservice** (ITSM) mirrors this quality at `api.freshservice.com/` with another **working MCP** (`effytech/freshservice_mcp`, 18★, MIT). **Freshsales/CRM** has a comprehensive API at `developers.freshworks.com/crm/api/` using Token auth — this is the **#1 priority for new Freshworks MCP development** as no standalone open-source MCP exists. **Freshteam** (HR) has a beta REST API at `developers.freshteam.com/api/` with Bearer token auth. **Freshchat** has a V2 API with regional endpoints (US/EU/IN/AU). **Freshmarketer** shares the Freshsales CRM API. **Freshping** (monitoring) has a clean, simple API at `api.freshping.io/api/v1/` — easiest to implement. **Freshcaller** (VoIP) has developer docs at `developers.freshcaller.com/`. **Freshconnect** has no API and is not a standalone product.

---

## ERPNext/Frappe deep dive: the most MCP-ready platform in India

ERPNext's architecture maps perfectly to MCP. Built on **Frappe Framework** (Python/JS), it exposes two core endpoint patterns:

**Resource API** (`/api/resource/{DocType}/{name}`) provides standard CRUD on any of ERPNext's **700+ DocTypes** — GET for listing with filters/pagination/ordering, POST for creation, PUT for updates, DELETE for removal. The `fields` parameter accepts JSON arrays (e.g., `["name","country"]`), and `filters` support operators like `["age",">","30"]`.

**RPC/Method API** (`/api/method/{dotted.path}`) calls any Python function decorated with `@frappe.whitelist()`. This enables arbitrary server-side logic — from `frappe.auth.get_logged_user` to custom business workflows. Supports both GET and POST.

Authentication offers three paths: **API Key/Secret** (header: `Authorization: token {key}:{secret}` — recommended for MCP), **OAuth 2.0** (full authorization code flow), and **Cookie-based** session auth. An unofficial **OpenAPI 3.0 spec** exists at `github.com/alyf-de/frappe_api-docs`.

**The MCP ecosystem is rich**: **frappe/mcp** (117★, official) is a framework enabling any Frappe app to function as a Streamable HTTP MCP server. **buildswithpaul/Frappe_Assistant_Core** is the most advanced — 20+ tools, plugin architecture, OAuth 2.0 + OpenID Connect, DXT file generation. **rakeshgangwar/erpnext-mcp-server** (TypeScript) handles document operations and report generation. **mascor/frappe-mcp-server** adds granular DocType allowlists and field-level security controls with 15 security tests.

---

## TallyPrime API specifics: XML/HTTP gateway for 7M+ businesses

TallyPrime uses a **non-REST XML-over-HTTP protocol**. The desktop application acts as an HTTP server (typically **port 9000**), accepting XML POST requests and returning XML responses. This is fundamentally different from every other API in this report.

**Request structure** follows an `<ENVELOPE>` pattern with `<HEADER>` (containing `<TALLYREQUEST>` of Export/Import/Execute, `<TYPE>`, and `<ID>`) and `<BODY>` (containing `<DESC>` with static variables, fetch lists, and optional TDL definitions, plus `<DATA>` for import payloads). **Three operations** are supported: **Export** (retrieve ledgers, vouchers, reports like Trial Balance/P&L/Balance Sheet), **Import Data** (create/update masters and vouchers), and **Execute** (run TDL functions).

**Critical gotchas**: No built-in authentication on the XML gateway — security relies entirely on network isolation (localhost/LAN). Tally must be **running on a Windows machine** with the port open. Multi-company setups require explicit company context in every request. Tally's XML schema is deeply nested and non-standard. A newer **JSON interface** exists but doesn't cover all XML endpoints. **ODBC access is read-only**.

The community MCP server (`dhananjay1405/tally-mcp-server`, 19★, TypeScript, MIT) already implements core operations: list masters, chart of accounts, account statements, stock item registers, and bill outstanding reports. The Python `tally-integration` library on PyPI provides reusable XML construction/parsing.

---

## Gupshup deep dive: 30+ channels, 120B+ messages annually

Gupshup operates **two distinct platforms** that MCP implementations must handle separately:

**WhatsApp Self Serve** (newer, `api.gupshup.io`) covers the full WhatsApp Business API via `POST /wa/api/v1/msg`. Supported message types include text, image, document, audio, video, sticker, reaction, location, list messages, quick replies, catalog, single/multi-product, CTA URL, and **25+ template types** (text, image, video, document, location, coupon, carousel, limited-time-offer, multi-product, catalog, authentication). Additional endpoints handle template management, subscription management, business profile management, block/unblock users, and read receipts. Auth is via **API Key** per app.

**Legacy Bot Platform** (`smapi.gupshup.io`) supports bots across Instagram, Facebook Messenger, Telegram, LINE, and more via `POST /sm/api/v1/bot/{botname}/msg`. **SMS** uses the enterprise gateway at `enterprise.smsgupshup.com/GatewayAPI/rest` with userid/password auth. **RCS messaging** has full RBM Agent support with rich cards, carousels, suggested actions, and fallback to SMS/WhatsApp. **Voice/Click-to-Call** endpoints under `/Basic/v1/account/` handle transactional calls and agent management.

The **Pipedream MCP** (`mcp.pipedream.com/app/gupshup`) provides basic auto-generated tool access but is NOT a comprehensive, purpose-built server. A dedicated Gupshup MCP server covering all 30+ channels would be among the highest-value implementations in this entire research.

---

## MapMyIndia/Mappls: 25+ API endpoints, zero MCP servers

MapMyIndia (CE Info Systems, India's government-compliant mapping company) offers the richest API surface of any Indian mapping platform, yet **no MCP server exists** — making this one of the biggest gaps identified.

**Search APIs**: Autosuggest (typeahead), Forward Geocoding (address → coordinates with confidence scores), Reverse Geocoding (coordinates → address with landmarks), Nearby (POIs by category), eLOC (MapMyIndia's unique 6-character place codes), Text Search, Address Standardization, Elevation, POI Along Route, and Geo Location (IP-based).

**Route & Navigation APIs**: Routing for Passenger Vehicles (traffic-aware, alternate routes, turn-by-turn), Two Wheelers (avoids expressways), Heavy Vehicles (height/weight/width/axle restrictions, hazmat), Pedestrians (walkways, foot bridges), Driving Distance Matrix, **Predictive ETA** (historical traffic), Snap to Road, Route Optimization (VRP solver: CVRP, VRPTW), Driving Range Polygon (isopolygon), and Transit Routing (metro, bus, train multimodal).

**Additional APIs**: Still Map Image generation, Traveled Route Image overlay, GeoAnalytics (demographic/affluence data by state/city/district), Digital Twin (3D/Metaverse), RealView (360° panoramic imagery), Telematics (device/drive/event/alarm/geofence/trip), and Address Cleansing.

Auth uses **OAuth 2.0** with tokens valid **24 hours** (must handle refresh). Free developer tier available with limited calls. SDKs for Android, iOS, React Native, and Web are actively maintained on GitHub (`github.com/mappls-api`).

---

## Existing MCP servers found on GitHub and registries

| Server | Repository / URL | Stars | Type | Language | Coverage |
|--------|-----------------|-------|------|----------|----------|
| **Razorpay** (official) | `github.com/razorpay/razorpay-mcp-server` | 216 | Official | Go | 35+ tools: payments, refunds, settlements, payouts, QR codes. **Remote MCP v2.0** at `mcp.razorpay.com` |
| **Paytm** (official) | `github.com/paytm/payment-mcp-server` | 22 | Official | Python | Payments, refunds, settlements, payouts. Remote hosted |
| **Cashfree** (official) | `github.com/cashfree/cashfree-mcp` | — | Official | TypeScript | Payments, refunds, payouts, batch transfers, KYC. npm: `@cashfreepayments/cashfree-mcp` |
| **Juspay** (official) | `github.com/juspay/juspay-mcp` | — | Official | Docker | Core Payment + Dashboard APIs. Multiple server variants |
| **Frappe/ERPNext** (official) | `github.com/frappe/mcp` | 117 | Official | Python | Framework enabling any Frappe app as MCP server |
| **Zoho Analytics** (official) | `github.com/zoho/analytics-mcp-server` | — | Official | Docker | Analytics data analysis. Beta stage |
| **Zoho MCP Platform** | `zoho.com/mcp` | — | Official | Platform | Full Zoho suite — CRM, Desk, Books, and more |
| **Exotel** (official) | `github.com/exotel/ExotelMCP` | 3 | Official | Java | SMS (single/bulk/dynamic), Voice, Call flows |
| **Freshdesk** | `github.com/effytech/freshdesk_mcp` | 46 | Community | Python | Ticket management via Claude/AI |
| **Freshservice** | `github.com/effytech/freshservice_mcp` | 18 | Community | Python | Incidents, changes, assets via Claude/AI |
| **Tally** | `github.com/dhananjay1405/tally-mcp-server` | 19 | Community | TypeScript | Masters, chart of accounts, statements, stock registers |
| **ERPNext** | `github.com/rakeshgangwar/erpnext-mcp-server` | — | Community | TypeScript | Document ops, reports, metadata discovery |
| **Frappe Assistant** | `github.com/buildswithpaul/Frappe_Assistant_Core` | — | Community | Python | 20+ tools, plugin architecture, OAuth 2.0 |
| **Indian Railways** | `github.com/amith-vp/indian-railway-mcp` | 21 | Community | — | Train search, availability, live status. Deployed at `railway-mcp.amithv.xyz/mcp` |
| **Indian Railways** | `github.com/rajprem4214/indian-railways-mcp` | — | Community | — | Live station/train status |
| **Indian Railways** | `github.com/maasir554/indian-railway-mcp-server` | — | Community | — | PNR status, live train status |
| **Indian Railways** | `github.com/kapurshitij/irctc-mcp` | — | Community | Python | Seat availability, PNR via RapidAPI |
| **Beckn Mobility** (Namma Yatri) | `github.com/dumko2001/mcp-beckn-mobility` | — | Community | Hono/SSE | search_cabs, select_ride, init_booking, confirm_booking |
| **Zoho CRM** | `github.com/SkanderBS2024/zoho-mcp` | — | Community | Python | Contacts, deals, users. PyPI: `zoho-crm-mcp` |
| **Zoho Books** | `github.com/kkeeling/zoho-mcp` | — | Community | Python | Invoices, contacts, expenses. PyPI: `zoho-books-mcp` |
| **Zoho CRM+Books** | `github.com/Mgabr90/zoho-mcp-server` | — | Community | TypeScript | Unified CRM + Books with bi-directional sync |
| **Zoho Projects** | `github.com/qpiai/zoho-projects-mcp` | — | Community | TypeScript | Projects, tasks, issues, milestones |
| **Zoho Mail** | `github.com/FujiwaraChoki/zoho-mail-mcp` | — | Community | TypeScript | Read, send, search, reply emails |
| **Zoho CRM** (CData) | `github.com/CDataSoftware/zoho-crm-mcp-server-by-cdata` | — | Vendor | Java | Read-only CRM via JDBC |

Additionally, **Pipedream** offers platform-hosted MCP access for Gupshup, MSG91, Zoho Books, Zoho Desk, Zoho Mail, Zoho Inventory, Zoho Cliq, and CleverTap.

---

## Top 15 priority MCP servers to build first

These recommendations balance **market impact**, **API readiness**, **competitive gap** (no existing MCP), and **implementation feasibility**:

1. **ClearTax GST** — Single integration covers GST filing, e-Invoice, e-Way Bill, and TDS for every Indian business. Well-documented REST API, sandbox available. No MCP exists. Impact: mandatory compliance for millions of businesses.

2. **Shiprocket** — India's dominant eCommerce shipping aggregator covering 17+ couriers through one API. Clean REST/JSON, Postman collection, JWT auth. No MCP exists. The order→ship→track workflow is a natural fit for AI assistants.

3. **MapMyIndia/Mappls** — India's government-compliant mapping champion with 25+ API endpoints. No MCP exists despite being the obvious Indian alternative to Google Maps MCP servers. Use Mapbox MCP as architectural template.

4. **Gupshup (dedicated)** — 120B+ messages/year across 30+ channels. Pipedream generic MCP is insufficient. A purpose-built server covering WhatsApp Business (25+ message types), SMS, RCS, and bot platforms would unlock massive value.

5. **LeadSquared** — India's most important vertical CRM (education, healthcare, BFSI). Comprehensive REST API with Postman collection. No MCP exists. Simple key+secret auth.

6. **Freshsales/Freshworks CRM** — Rich API with no standalone open-source MCP (Freshdesk/Freshservice already covered). High-value gap in the Freshworks ecosystem.

7. **CleverTap** — Best-documented Indian engagement platform. Server SDKs in Python/Java/Go accelerate development. Simple header auth. 2000+ brands would benefit.

8. **Keka HR** — India's leading HR platform with full lifecycle API (recruitment→payroll). OAuth 2.0, sandbox, excellent docs. No MCP exists for any Indian HR platform.

9. **Delhivery** — India's largest courier with clean API docs on readme.io. Full shipment lifecycle coverage. Complements Shiprocket MCP for businesses using direct courier relationships.

10. **Leegality** — India's #1 eSign/eStamp platform. Clean API v3.0, strong BFSI adoption. eSign is a high-frequency AI assistant workflow (send for signature, check status, download signed doc).

11. **WebEngage** — Multi-channel engagement (push, email, SMS, WhatsApp, in-app) with clean REST API. Bearer auth. 800+ brands. Strong complement to CleverTap.

12. **MoEngage** — Notable for explicitly supporting **llms.txt** (AI agent documentation access). Excellent docs, Postman collection, 1200+ brands. The llms.txt support signals MCP-forward thinking.

13. **greytHR** — Dominant India SMB HR/payroll platform. Well-documented API with Postman collection, OAuth 2.0. Complements Keka for the SMB segment.

14. **Digio** — India's leading eSign + KYC + NACH platform for fintech. Covers three critical India-specific workflows in one integration. Zerodha, Groww, CoinSwitch all use it.

15. **Tata 1mg** — Best-documented healthcare API in India. JWT auth, full pharmacy/labs/order management. Healthcare is an underserved vertical for MCP.

---

## Companies requiring Indian entity or special registration

Several platforms require India-specific legal or regulatory compliance to access their APIs:

**GST Suvidha Provider (GSP) License** is required for direct GSTN API access — only ~29 licensed GSPs exist in India. Building via ClearTax (which holds a GSP license) eliminates this requirement. **NIC e-Invoice direct access** requires companies with ₹100 Cr+ turnover or GSP status, plus IP whitelisting and passing 50+50 test cases in sandbox. **e-Way Bill API** requires government onboarding process. **Aadhaar eKYC** is restricted to licensed entities (banks, telcos, government) since the 2018 Supreme Court ruling — Aadhaar offline KYC is available to all enterprises via aggregators like Digio and Setu.

**DLT (Distributed Ledger Technology) registration** is mandatory for all SMS sending in India — every SMS platform (Gupshup, MSG91, Exotel, Kaleyra) requires template registration with TRAI authorities before messages can be sent. **IRCTC booking APIs** (not just inquiry) require official B2B partnership with IRCTC — all third-party services only provide read-only inquiry endpoints.

**MapMyIndia** requires API key registration with Indian data residency compliance. **TallyPrime** requires the software to be running on a Windows machine within LAN — there is no cloud API. **Namma Yatri/Beckn** requires Ed25519 key registration on the Beckn Registry. **Cleartrip and RedBus** APIs require B2B partner registration through their sales teams.

---

## The Indian MCP ecosystem is at an inflection point

The most striking finding is the **payments-first adoption pattern**: four Indian payment gateways have shipped official MCP servers (Razorpay leading with Remote MCP v2.0 and 35+ tools), while categories with arguably higher AI-assistant value — logistics, tax compliance, mapping, and HR — have **zero implementations**. This gap represents the clearest opportunity for a development team.

The **Zoho ecosystem** deserves special architectural consideration. Rather than building individual MCP servers for each of Zoho's 18 API-enabled products, the recommended approach is a unified Zoho MCP server with a shared OAuth 2.0 module, per-product endpoint routing, DC-aware base URL resolution, and per-product rate limiting — reducing distinct adapters to ~6-7 pattern families.

Two categories are essentially **dead zones for MCP**: Indian EdTech (Unacademy, upGrad, Scaler, PhysicsWallah) offers zero public APIs, and Indian real estate portals (99acres, MagicBricks, Housing.com) only expose private CRM lead webhooks. These sectors' consumer-first, closed-platform approach makes them non-viable without commercial partnerships. Two platforms have shut down entirely: **Dunzo** (January 2025) and **Textlocal India** (October 2025) — neither should receive any investment.

The most strategically interesting platform is **Namma Yatri / Beckn Protocol**: an MCP server for Beckn Mobility doesn't just work with one ride-hailing app — it works with any Beckn-compliant provider on India's ONDC open commerce network. As ONDC expands to more verticals (food delivery, grocery, logistics), a Beckn MCP server becomes a universal India commerce integration layer.