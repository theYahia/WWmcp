# MCP server candidates across Vietnam and Thailand

**Vietnam and Thailand present a massive greenfield opportunity for MCP server development**, with only **6 company-specific MCP servers** found across all 120 researched entities. The strongest candidates combine public APIs with large user bases: Zalo (70M users), LINE (53M Thai users), Momo (50M users), and Shopee (SEA-dominant). Three companies — LINE, Omise/Opn, and Agoda — have already published official MCP implementations, validating the approach. Vietnam's open banking mandate (Circular 64, effective March 2025) and Thailand's BOT open banking push will unlock dozens of new bank APIs by 2027, creating a wave of integration opportunities.

---

## Vietnam: Commerce & food delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **Shopee VN** | SEA's largest e-commerce marketplace | Public (Open Platform v2) | https://open.shopee.com | OAuth 2.0 + HMAC-SHA256 | $29.8B GMV, millions of sellers | **High** | 32–40 | Sandbox available; rate limit ~100 req/min; community SDKs in Python/Ruby |
| **Tiki** | Vietnam's #2 homegrown e-commerce | Public (Open API v2) | https://open.tiki.vn | OAuth 2.0 | Major VN platform, JD.com-backed | **High** | 24–32 | Sandbox at api-sandbox-sellercenter.tiki.vn; 50 req/s limit; webhooks |
| **Lazada VN** | Alibaba-owned e-commerce | Public (Open Platform) | https://open.lazada.com | App Key + HMAC-SHA256 | Major SEA platform | **High** | 28–36 | Node.js SDK available; Alibaba-quality infrastructure |
| **Sendo** | FPT-backed e-commerce (declining) | Semi-private | No public portal | API Key | ~80K shops, declining share | Low | 16–24 | API v1 shut down; no sandbox; declining viability |
| **GrabFood VN** | #1 food delivery (45% share) | Public (Partner API) | https://developer.grab.com/docs/ | OAuth 2.0 | ~$1.1B food delivery GMV | **High** | 24–32 | Official SDKs (Java/Python/Go); OpenAPI spec; sandbox |
| **ShopeeFood** | #2 food delivery (41% share) | No public API | N/A | N/A | ~$450M GMV | Low | N/A | Closed consumer platform; no developer ecosystem |
| **Loship** | On-demand hyperlocal delivery | No public API | N/A | N/A | ~3M customers, niche | Low | N/A | Interesting local player but no API |
| **Baemin VN** | Food delivery (Korean-owned) | **DEFUNCT** | N/A | N/A | Shut down Dec 2023 | N/A | N/A | Ceased all Vietnam operations |
| **KiotViet** | Vietnam's #1 POS/retail software | Public | https://www.kiotviet.vn/huong-dan-su-dung-public-api-retail/ | OAuth 2.0 | **100K+ retailers** | **High** | 8–16 | ✅ **Existing MCP server**: github.com/HiGo-MCP/kiotviet-mcp-server; webhooks; TypeScript SDK |
| **Haravan** | Shopify-like e-commerce SaaS | Public (REST API) | https://docs.haravan.com | OAuth 2.0 + JWT | 50K+ merchants | **High** | 24–32 | API design mirrors Shopify; partner dev stores; webhooks; **strong greenfield opportunity** |
| **Sapo POS** | POS/e-commerce platform | Public | https://developers.sapo.vn | API Key/Basic Auth or OAuth | Major VN POS alongside KiotViet | Medium-High | 20–28 | App store ecosystem; webhooks; n8n integration |

## Vietnam: Finance — Banks

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **Vietcombank** | Most profitable VN bank | Private/Limited | None public | Undocumented | ~$94–101B assets | Medium | 40–60 via SePay | No public API yet; SePay/Casso provide access; Circular 64 compliance pending |
| **BIDV** | Largest VN bank by assets | **Public** (Open API) | https://openapi.bidv.com.vn/devportal/ | Client ID/Secret + API Key | ~$123–133B assets | **High** | 60–80 | **15 API packages**; sandbox; award-winning; best public API among VN state banks |
| **VietinBank** | 2nd largest state bank | **Public** (iConnect) | https://developer.vietinbank.vn/ | OAuth 2.0 + OpenID Connect | ~$102B assets; 55M+ monthly txns | **High** | 50–70 | **Hundreds of APIs**; sandbox; won "Most Innovative API" 2025; 1,000+ partners |
| **Techcombank** | Leading private bank | Private/Partner-only | None public | Likely OAuth 2.0 | ~$39B assets | Medium | 40–60 via SePay | Strong tech investment but APIs partner-gated |
| **TPBank** | Digital-first private bank | **Public** | https://developer.tpb.vn/tpb/portal/ | Developer credentials + sandbox | ~$15B assets | **High** | 50–70 | eWallet linking, xSale, Fund Transfer APIs; SePay partner |
| **VPBank** | First VN bank >1 quadrillion VND | Private (646 internal APIs) | None public | WSO2/OAuth 2.0 internal | ~$42B assets; 10M+ txns/day | Medium-High | 40–60 via SePay | Red Hat OpenShift; 646 internal APIs; Circular 64 will open access |
| **MB Bank** | Military commercial bank | Undocumented (unofficial wrappers) | Unofficial: github.com/thedtvn/MBBank | Username/password + CAPTCHA | ~$49B assets | **High** | **10–20** | ✅ **Existing MCP server**: github.com/thedtvn/mbbank-mcp; Docker support; ⚠️ Uses reverse-engineered API |
| **Timo** | Digital-only neobank | No public API | N/A | N/A | ~1.75M accounts | Low | N/A | Mambu/AWS backend; operates on BVBank license |

**Key context**: Vietnam's Circular 64 (effective March 2025) mandates all commercial banks adopt standardized Open APIs. By **March 2027**, payment initiation APIs must be available. Third-party aggregators **SePay** (sepay.vn) and **Casso** (casso.vn) provide unified banking APIs across 25+ VN banks today — a high-value shortcut for MCP implementations.

## Vietnam: Finance — Payments & fintech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **VNPay** | Largest VN payment gateway | Public | https://sandbox.vnpayment.vn/apis/docs/gioi-thieu/ | HMAC-SHA512 | 40M+ users; 100K+ merchants | **High** | 30–40 | Sandbox; code demos in 5 languages; dominant QR network |
| **Momo** | Vietnam's #1 e-wallet (50M+ users) | **Public (V3)** | https://developers.momo.vn/v3/ | HMAC-SHA256 + Partner credentials | **50M+ users; ~70% e-wallet share** | **High** | 40–50 | Sandbox; 15+ endpoint categories (wallet, BNPL, COD, QR, disbursement, remittance); no rate limits documented |
| **ZaloPay** | VNG e-wallet (linked to Zalo) | Public | https://docs.zalopay.vn/docs/guides/intro/ | HmacSHA256 (app_id + key1/key2) | 20M+ users | **High** | 30–35 | Sandbox; GitHub: zalopay-oss; Flutter/mobile SDKs |
| **OnePay** | International card payment gateway | Public | https://mtf.onepay.vn/developer/ | HMAC-SHA256 | 1,500+ merchants | Medium | 25–30 | PCI-DSS; domestic + international gateways |
| **NganLuong** | Pioneer e-wallet/payment gateway | Public | https://www.nganluong.vn/en/service/online_payment.html | API Key + MD5 checksum | 1.3M+ users; declining | Low | 20–25 | Legacy platform; declining relevance |
| **AppotaPay** | Payment platform | Public | https://docs.appotapay.com/en/ | **JWT Token** | Mid-tier | Medium | 30–35 | Only VN payment using JWT auth; subscription/recurring support |
| **9Pay** | E-wallet + payment gateway | Public | https://developers.9pay.vn/ | Signature-based | Growing; 50+ bank connections | Low-Medium | 25–30 | Sandbox; cross-border capability; docs mostly Vietnamese |
| **ViettelPay** | E-wallet by largest VN telco | Public (Partner-only) | https://viettelpay.dev/ | SHA checksum | 10M+ users; leverages 70M Viettel subscribers | Medium | 30–35 | PDF integration spec; limited public documentation |
| **ShopeePay VN** | Shopee e-wallet | Public (Merchant) | https://product.shopeepay.com/integration/get-started/ | **OAuth 2.0 + HMAC-SHA256** | Large (Shopee ecosystem) | Medium | 35–40 | Sandbox; QR/Direct Pay; VND only |

## Vietnam: Logistics

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **GHN** | Leading last-mile delivery | **Public** | https://api.ghn.vn/home/docs/detail | API Token + ShopId headers | Top-tier; 63 provinces | **High** | 30–40 | Excellent English docs; sandbox; Node.js SDK; COD webhooks |
| **GHTK** | Cost-effective delivery leader | **Public** | https://pro-docs.ghtk.vn/ | API Token header | "Big 3" VN carrier | **High** | 30–40 | English + Vietnamese docs; staging env; PHP/Ruby SDKs |
| **Viettel Post** | Viettel's logistics arm | **Public** | https://partner.viettelpost.vn/expose/ | JWT/Bearer Token | Widest VN coverage (rural/remote) | **High** | 35–45 | Docs in Vietnamese; automated sort centers; NuGet package |
| **Ninja Van VN** | SEA logistics (6 countries) | Public (partner onboarding) | https://api-docs.ninjavan.co/ | OAuth 2.0 | Regional player | Medium | 40–50 | 1–3 week onboarding audit required; sandbox |
| **J&T Express VN** | Express delivery (Indonesia origin) | Public | https://api-docs.jtexpress.vn/ | Digest auth (Base64 + MD5) | 2.4M parcels/day capacity | Medium | 40–50 | Non-standard auth; Chinese platform origin |
| **Ahamove** | On-demand delivery/moving | **Public** | https://developers.ahamove.com/en/docs/introduction | API Key + Token | Niche; Hanoi/HCMC | Medium | 25–35 | **Best developer experience**; English docs; Postman collection; built-in AI assistant |
| **GrabExpress VN** | Grab's express delivery | Semi-Public (partner-gated) | https://developer.grab.com/ | OAuth 2.0 | Large but on-demand only | Low | 45–55 | Partnership approval required; GrabPlatform SDK |

## Vietnam: Business software

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **MISA AMIS** | Vietnam's #1 accounting/ERP | Public (registration) | https://www.misa.vn/154117/tong-quan-open-api-amis-ke-toan-doanh-nghiep/ | OAuth 2.0-like (access_token) | **250K+ customers** | **High** | 60–80 | API has known limitations (no list endpoints, async webhooks); has own AI "AVA" |
| **Fast Accounting** | #2-3 VN accounting software | Private/Limited | None public | Unknown | ~52K businesses | Low | 100–120 | No public API; case-by-case integration |
| **Bravo ERP** | Enterprise ERP (.NET/SQL) | Private/Custom | None public | Unknown | ~5K enterprise customers | Low | 120+ | Custom per-deployment integrations only |
| **1C Vietnam** | Russian ERP localized for VN | Platform API (SOAP/REST) | https://1c-dn.com/library/1c_enterprise_8_administrative_service_api/ | Session/API Key | 5K+ VN customers | Medium | 80–100 | Developer platform exists but complex |
| **VN e-Invoice (Viettel S-Invoice)** | Mandatory e-invoicing since 2022 | **Public (REST)** | https://sinvoice.viettel.vn/ | Basic Auth (tax code) | **All VN businesses (~900K+)** | **High** | 40–60 | Sandbox; Postman guide; universal mandate; high business value |
| **VietnamWorks** | #1 professional job board | **Public** (OAuth2) | https://developers.vietnamworks.com/ | OAuth 2.0 | Millions of users; #1 job board | **High** | 40–50 | Sandbox; RapidAPI listing; job posting + application APIs |
| **TopCV.vn** | Most-visited recruitment platform | Private/Paid | None public (paid service) | Unknown | 9.5M+ users; 200K+ businesses | Medium | 60–80 | API is a commercial product (3M VND/6 months) |
| **ITviec** | IT-specific job platform | No API | N/A | N/A | Niche but dominant in IT | Low | 80–100 | Session-based web only |
| **Base.vn HRM** | All-in-one enterprise SaaS (50+ apps) | **Public (extensive)** | https://help.base.vn/support/solutions/articles/63000258324 | Access Token | 5K+ enterprises | **High** | 50–70 | **20+ product APIs** documented in Postman; company published article about MCP; HRM/payroll/recruitment/finance |

## Vietnam: Marketing, communications & infrastructure

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **Stringee** | Vietnamese CPaaS (voice/video/SMS) | **Public** | https://developer.stringee.com/ | JWT (access_token) | 3K+ enterprises; 40M+ end users | **High** | 40–55 | Call, SMS, Contact Center, Video APIs; 1.5M call min/day |
| **eSMS.vn** | Bulk SMS gateway | Public | https://esms.vn/sms-api | API Key + Secret Key | VN SME market | Medium | 15–20 | Simple REST API; cheapest/fastest MCP to build |
| **Cốc Cốc** | VN search engine/browser | Public (Search API, sales-gated) | https://coccoc.com/en/coc-coc-search-api | Contact sales | **30M+ claimed users**; ~3.7% browser share | Medium-High | 25–35 | Search API positioned for AI/LLM augmentation; no self-service; no Ads API |
| **Shopee Ads VN** | Shopee advertising | Partial (no ads API) | https://open.shopee.com | OAuth 2.0 | 63% VN e-commerce | Medium | 35–50 | Seller API yes; ad campaign management no |
| **Viettel IDC** | Largest VN cloud/DC | Public (OpenStack/Terraform) | https://docs.viettelcloud.vn | API Key | Largest VN cloud | Medium | 40–55 | Terraform provider on registry |
| **CMC Cloud** | Cloud by CMC Corp | Public (REST/Terraform) | https://github.com/cmc-cloud/terraform-provider-cmccloud | API Key | 10K+ enterprises | Medium-High | 35–45 | REST API at api.cloud.cmctelecom.vn; Samsung SDS stake |
| **FPT Cloud** | Cloud by Vietnam's #1 IT company | **Public** (REST/S3/Terraform/CLI) | https://docs.fptcloud.com/en | API Key/IAM | Largest VN IT company | **High** | 50–65 | Most mature VN cloud; English docs; AI Factory with NVIDIA; 30+ services |
| **VNPT Cloud** | Cloud by state telecom | Partial | https://vnptapi.com | OAuth 2.0/JWT | 2nd largest VN telecom | Medium-Low | 30–40 | Telecom APIs more accessible than cloud APIs |

## Vietnam: Zalo (super-app deep dive)

| API Surface | Status | API Docs URL | Auth Type | Rate Limits | MCP Priority | Est. Hours |
|------------|--------|-------------|-----------|-------------|-------------|-----------|
| **Zalo OA API (V3)** | ✅ Active | https://developers.zalo.me/docs/official-account/ | OAuth 2.0 (1h access + 3mo refresh) | 10 req/s per OA | **Critical (P0)** | 24–32 |
| **ZaloPay API** | ✅ Active | https://docs.zalopay.vn/docs/guides/intro/ | HmacSHA256 (key1/key2) | Not documented | High (P1) | 20–28 |
| **Zalo Social/Login** | ✅ Active | https://developers.zalo.me/docs/social-api/ | OAuth 2.0 + PKCE | Not disclosed | High (P1) | 12–16 |
| **Zalo Mini App** | ✅ Active | https://mini.zalo.me/docs/api/ | Access Token | N/A | Medium (P2) | 16–20 |
| **Zalo Shop API** | ⚠️ Deprecated | Legacy docs only | N/A | N/A | Skip | N/A |
| **Zalo Ads API** | ❌ No API | None | N/A | N/A | N/A | N/A |

**Existing MCP**: Zalo Agent CLI (github.com/PhucMPham/zalo-agent-cli) includes MCP server mode with `get_messages`, `send_message`, `list_threads`, `mark_read` tools. Covers OA API OAuth, messaging, follower management. Total comprehensive Zalo MCP: **72–96 hours**.

## Vietnam: Government & verticals

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **dichvucong.gov.vn** | National e-government portal | Semi-public (HCMC LGSP APIs) | https://api.tphcm.gov.vn/ | Government credentials | 100M citizens | **High** | 30–40 | ✅ **Existing MCP**: github.com/phake-studio/mcp-dichvucong (basic); HCMC has 30+ APIs |
| **VNEID** | Digital identity system | Private/Partner-only | Via eKYC providers (FPT eID, VNPT) | Biometric + chip-based | Tens of millions; mandatory by 2026 | High | 60–80 | Access via commercial eKYC APIs; not directly |
| **VN Tax Portal** | Electronic tax services | Undocumented/Private | None official | Digital signature + CAPTCHA | All VN businesses | High | 50–70 | Third-party wrappers exist; CAPTCHA is main barrier |
| **batdongsan.com.vn** | #1 real estate listings | No public API | Apify scrapers available | N/A | 7M+ monthly users | Medium-High | 40–50 | PropertyGuru-owned; scraping approach needed |
| **Cho Tot (chotot.com)** | #1 C2C classifieds marketplace | **Semi-public** | gateway.chotot.com (undocumented public endpoints) | None for reads | **10M+ monthly users; 1B+ pageviews** | **High** | **25–35** | Easiest high-value VN implementation — public JSON API, no auth for reads |
| **Grab VN** | Super-app (ride/food/delivery) | Public (Merchant) | https://developer.grab.com/docs/ | OAuth 2.0 | 35M+ users; 62% preference | **High** | 40–50 | GrabPay, GrabExpress, GrabFood APIs; partner approval needed |
| **Be** | Vietnamese ride-hailing | Private | None | N/A | 10M+ customers; 16% share | Medium | 50–60 | "Open platform" strategy but no public API |
| **Xanh SM** | VinFast EV ride-hailing | No API | N/A | N/A | 50M+ customers served; 36% preference | Medium | 50–60 | Explosive growth but no developer ecosystem |
| **VNTravel** | Travel platform group | Private/Partner | https://tripipartner.vn/ | Partner credentials | 25M+ customers | Medium | 45–55 | Owns Mytour; B2B partnerships with banks |
| **Mytour.vn** | Hotel booking | Private/Partner | None public | N/A | 1M+ customers | Low-Medium | 40–50 | Part of VNTravel; better to approach at group level |
| **Vntrip** | Travel/corporate TMS | Private/Affiliate | Via Dinos affiliate network | Affiliate credentials | 1,500+ B2B clients | Low-Medium | 40–50 | B2B-focused; affiliate API through Dinos |

---

## Thailand: Commerce & food delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **Shopee TH** | #1 e-commerce in Thailand | Public (Open Platform v2) | https://open.shopee.com | OAuth 2.0 + HMAC-SHA256 | Dominant SEA platform | **High** | 40–50 | Same API as Shopee VN; sandbox; managed seller restriction |
| **Lazada TH** | #2 e-commerce (Alibaba) | Public (Open Platform) | https://open.lazada.com | App Key + HMAC-SHA256 | Major SEA platform | **High** | 40–50 | SDKs in 5 languages; API Explorer; test accounts |
| **JD Central** | JD.com + Central Group JV | **DEFUNCT** | N/A | N/A | Shut down March 2023 | N/A | N/A | ~500 employees laid off; JD exited Thailand |
| **NocNoc** | Home improvement e-commerce | No public API | N/A | N/A | Growing 50%+ YoY | Low | N/A | github.com/nocnoc-thailand has internal tools only |
| **GrabFood TH** | #1 food delivery (~35-39% share) | **Public** (Partner API) | https://developer.grab.com/ | OAuth 2.0 | ~15.6B THB revenue | **High** | 30–40 | Official SDKs (Python/Java/Go/Node); sandbox; OpenAPI spec |
| **LINE MAN** | #2 food/delivery + restaurant reviews | Private/Partner-only | None public | Unknown | 10M+ MAU; $1B+ valuation | Medium | 40–50* | Unicorn; acquired FoodStory POS; no public API |
| **Robinhood TH** | Bank-backed food delivery | No API | N/A | N/A | Sold to Yip In Tsoi (Sep 2024) | Low | N/A | SCBX sold for 2B THB; only food delivery continues |
| **Foodpanda TH** | Food delivery (Delivery Hero) | **DEFUNCT** | N/A | N/A | Closing May 23, 2025 | N/A | N/A | Ceasing all Thai operations |
| **FoodStory** | Restaurant POS | Private/Partner | None public | Unknown | #1 trusted POS brand | Medium | 25–30* | Acquired by LINE MAN Wongnai July 2023 |
| **Wongnai POS** | Restaurant POS + reviews | Private/Internal | None public | Unknown | 50K+ restaurant operators | Medium | 25–30* | Part of LINE MAN Wongnai ecosystem |
| **Ocha POS** | Free iPad POS (Sea Group) | No API | N/A | N/A | 306K+ Facebook followers | Low | N/A | Sea Group-backed; integrates ShopeePay |

## Thailand: Finance

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **SCB** | First Thai bank with Open API | **Public** | https://developer.scb/ | OAuth 2.0 (Client Credentials + Auth Code) | ~16M mobile users; D-SIB | **High** | 40–60 | Sandbox + SCB Easy Simulator; QR Payment, Slip Verify, Payment Gateway |
| **Bangkok Bank** | Thailand's largest bank by assets | **Public** | https://apiportal.bangkokbank.com/ | JWT + HMAC-SHA256 + mTLS | ~4.5T THB assets; 17M+ customers | **High** | 40–60 | Sandbox; QR Payment, FX Rates, Fund Prices; corporate-focused |
| **KBank (KBTG)** | Most tech-forward Thai bank | **Public** | https://apiportal.kasikornbank.com/ | OAuth 2.0 + mTLS | ~20M mobile users; D-SIB | **High** | 50–70 | Most advanced Thai bank APIs; KBTG tech arm; acquired Satang→Orbix crypto |
| **Krungthai Bank** | Largest state-owned bank | **Public** | https://developers.krungthai.com/ | OAuth 2.0 | **30M+ Paotang users**; D-SIB | Medium-High | 40–50 | Government payments; Direct Debit, Fund Transfer, PromptPay APIs |
| **TTB Bank** | Merged TMB+Thanachart | Public (limited docs) | https://developers.ttbbank.com/ | Likely OAuth 2.0/JWT | ~10M customers; D-SIB | Medium | 30–40 | Portal exists but public docs limited |
| **Opn Payments (Omise)** | Thai-origin payment gateway | **Public (excellent)** | https://docs.opn.ooo/ | API Key (public + secret) | Thousands of SEA merchants | **High** | 30–40 | ✅ **Official MCP**: github.com/omise/omise-mcp; **best API docs quality**; 8+ client libraries; OpenAPI schema |
| **2C2P** | Enterprise payment gateway | **Public** | https://developer.2c2p.com/ | JWT (HMAC-SHA256) | SEA-wide; billions processed | **High** | 40–50 | Sandbox; mobile SDKs; supports PromptPay/TrueMoney/LINE Pay |
| **PromptPay** | National QR payment system | **No direct API** | Access via bank APIs | N/A (infrastructure) | **800M+ txns/month; 80% population** | Medium | 20–30 | Not a developer platform — access through bank/gateway APIs only; EMVCo QR standard |
| **Rabbit LINE Pay** | LINE + BTS mobile payment | Public (via LINE Pay/gateways) | https://pay.line.me | Channel ID + Secret | Millions of Thai users | Medium | 25–35 | Best via Omise/2C2P integration; sandbox available |
| **TrueMoney** | SEA's leading e-wallet (CP Group) | Private/Partner-only | Via Omise/2C2P or partner agreement | Client ID/Secret | **27M Thai users; 40M+ SEA** | Medium | 30–40 | No public portal; sandbox limited to business hours only |
| **Bitkub** | Thailand's #1 crypto exchange (~90% share) | **Public** | https://github.com/bitkub/bitkub-official-api-docs | HMAC API Key (X-BTK-APIKEY + X-BTK-SIGN) | ~90% Thai crypto share | **High** | 30–40 | Official GitHub API docs; WebSocket; Python SDK; 429 rate limit → 30s block |
| **Satang Pro / Orbix** | Crypto exchange → KBank subsidiary | Transitional | N/A | N/A | Rebranding to Orbix under KBank | Low | N/A | KBank acquired 97%; Binance holds 3% |
| **Zipmex** | Crypto exchange | **DEFUNCT** | N/A | N/A | License revoked May 2024 | N/A | 0 | CEO charged with fraud; website disabled |

**PromptPay deep dive**: PromptPay has **no standalone developer API**. It is national payment infrastructure operated by NITMX. Developers access PromptPay through bank APIs (KBank, SCB, Krungthai all expose PromptPay endpoints) or payment gateways (Omise/Opn, 2C2P). Open-source QR generation libraries exist on GitHub for EMVCo-standard Thai QR codes.

## Thailand: Logistics & business software

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **Kerry Express TH** | Major Thai express delivery | Private/Partner (EDI API) | Partner: exch.th.kerryexpress.com/ediwebapi | API key + partner creds | Top-3 Thai carrier; SET-listed | Medium | 30–50 | Partner-gated; best via AfterShip aggregator |
| **Flash Express TH** | Fast-growing express delivery | **Public (Partner)** | https://open-docs.flashfulfillment.co.th/en.html | API Key | Top-5; 1M+ parcels/day | **High** | 25–35 | Full API: order creation/tracking/cancel/labels |
| **Thailand Post EMS** | National postal service | **Public** | https://track.thailandpost.co.th/developerGuide | Token-based (monthly refresh) | 1,300+ post offices; national | **High** | 15–25 | 1K tracking/day (individual); 10K/day (corporate); PHP/React libs |
| **J&T Express TH** | Express delivery (Indonesia origin) | Private/Partner | https://developer.jet.co.id/ (Indonesia) | API key + MD5 signature | Top-5 in Thailand | Medium | 35–50 | Thai API mirrors Indonesia portal; partner agreement needed |
| **Best Express TH** | Express delivery (Chinese origin) | Undocumented | None | Unknown | Smaller market share | Low | 40–60 | No documented API; use multi-carrier aggregators |
| **FlowAccount** | #1 Thai cloud accounting SaaS | **Public (OpenAPI)** | https://developers.flowaccount.com/ | OAuth 2.0 | **40K+ Thai SMEs** | **High** | 20–30 | **Best Thai business software API**; Sequoia/Beacon VC-backed; sandbox; active dev (Mar 2026) |
| **PEAK Account** | Thai accounting software | Public (Limited) | https://www.peakaccount.com/developers | API Key | Leading Thai SaaS; True/CP Group invested | Medium-High | 30–40 | API may require higher-tier subscription |
| **AccRevo** | Accounting + firm services | Private/Partner | None public | Unknown | Smaller; SCB/AIS partners | Low | 50–70 | Service+platform hybrid; not API-first |
| **RD e-Tax Invoice** | Government e-tax invoice system | Public (Government) | https://efiling.rd.go.th/rd-cms/openapi | Digital certificate + token | All VAT-registered businesses | Medium-High | 50–70 | XML format; digital signature required; double expense deduction incentive |
| **JobsDB TH** | Job portal (SEEK Group) | Public (Partner) | https://developer.seek.com/ | OAuth 2.0 (Auth0) | Major Thai job platform | Medium | 40–55 | GraphQL API; 7-stage certification; formal partnership |
| **JobThai** | Thailand's #1 local job portal | No API | N/A | N/A | 150K+ daily users; #1 local | Low | 60–80 | No developer program |
| **Reeracoen TH** | Japanese-Thai recruitment agency | No API | N/A | N/A | Mid-sized agency | Low | N/A | Traditional agency; not API-suitable |

## Thailand: LINE (super-app deep dive)

| API Surface | Status | API Docs URL | Auth Type | Rate Limits | MCP Priority | Est. Hours |
|------------|--------|-------------|-----------|-------------|-------------|-----------|
| **LINE Messaging API** | ✅ Production | https://developers.line.biz/en/docs/messaging-api/ | Channel Access Token (Bearer) | **2,000 req/s** | **Critical (P0)** | 40–60 |
| **LINE Pay API** | ✅ Production | https://developers-pay.line.me/ | Channel ID + Secret + HMAC-SHA256 | Not disclosed | High (P1) | 16–20 |
| **LINE Shopping API** | ✅ Production (Thailand) | Via oaplus.line.biz | API Key (X-API-KEY) | Not disclosed | High (P1) | 12–16 |
| **LINE Ads API v3** | ✅ Production (corporate) | https://ads.line.me/public-docs/ | Access Key + Secret + JWS | Not disclosed | High (P1) | 24–30 |
| **LINE Login** | ✅ Production | https://developers.line.biz/en/docs/line-login/ | OAuth 2.0 + PKCE | 30-day access token | Medium (P2) | 8–10 |
| **LINE LIFF** | ✅ Production (v2.27) | https://developers.line.biz/en/docs/liff/ | Client-side SDK + Server API | N/A | Medium (P2) | 8–12 |
| **LINE Notify** | ❌ Discontinued Mar 2025 | N/A | N/A | N/A | N/A | N/A |
| **LINE MAN API** | ❌ No public API | N/A | N/A | N/A | N/A | N/A |

**Existing MCP servers**: Official `line/line-bot-mcp-server` (github.com/line/line-bot-mcp-server) covers ~5% of Messaging API surface (push/broadcast text+flex, profile, quota). Community forks add SSE and Python variants. Total comprehensive LINE MCP: **108–148 hours**.

## Thailand: Marketing, infrastructure, government & verticals

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|-----------|-------|
| **ThaiBulkSMS** | Thai SMS gateway | **Public** | https://developer.thaibulksms.com/ | API Key + Secret (Basic Auth) | Thai market | Medium | **6–8** | Simplest API; 120 TPS; npm package; OTP support |
| **Shopee Ads TH** | Shopee advertising | Partial (no ads API) | https://open.shopee.com | OAuth 2.0 | Dominant platform | Medium | 16–20 | Seller API yes; ad management no |
| **TikTok TH** | TikTok Marketing API | **Public** | https://business-api.tiktok.com/portal | OAuth 2.0 | Massive Thai adoption | **High** | 24–30 | Global API; full campaign CRUD; official SDK (Java/Python/JS) |
| **True IDC** | Largest Thai DC/cloud | Private | None public | Enterprise contracts | #1 Thai DC; 150MW+ | Low | 60–80 | Resells AWS/Azure/GCP; limited own API |
| **NT Cloud (CAT)** | Government cloud | No public API | N/A | Government access only | State enterprise | Low | 80–120 | Exclusively for Thai government |
| **AIS Cloud/Open API** | Telco cloud + network APIs | Semi-Public | https://partner.ais.co.th/ | Partner OAuth/API Key | 46M+ subscribers; #1 Thai telco | Medium | 40–60 | GSMA-standard SIM Swap, Location, QoS APIs |
| **Biz Portal** | Business registration portal | No public API | N/A | ThaID / DBD ID | All Thai businesses | Medium | 60–80 | Critical gateway but no API |
| **ThaID** | National digital identity | Semi-Public (via NDID) | https://ndid.co.th/ | Biometric + blockchain | 44+ state agencies; expanding | High | 80–120 | Access through NDID platform membership |
| **Revenue Dept (rd.go.th)** | Thai tax authority | Public (SOAP) | http://www.rd.go.th/42531.html | Digital certificate / token | All Thai taxpayers | **High** | 40–60 | 11 SOAP web services since 2005; CheckTIN and VAT verification |
| **DDproperty** | #1 Thai real estate listings | Private/Partner | Terms reference only | Partner API key | 40M+ monthly (PropertyGuru group) | Medium | 50–70 | PropertyGuru API exists but partner-only |
| **Hipflat** | Real estate search/analytics | No API | N/A | N/A | 200K+ listings; secondary player | Low | 60–80 | Part of Lifull Connect/Dot Property |
| **Kaidee** | #1 Thai classifieds | No API | N/A | N/A | 35M users; 4M+ monthly visitors | Medium | 60–80 | Owned by Carro (Singapore); no developer program |
| **Grab TH** | Super-app (ride/food/pay) | Semi-Public (Partner) | https://developer.grab.com/ | OAuth 2.0 (GrabID) | 100M+ installs SEA; dominant | **High** | 40–60 | GrabPlatform APIs: transport, logistics, payments, identity |
| **Bolt TH** | Ride-hailing (35+ Thai cities) | **Explicitly no API** | Bolt support: "We don't offer any APIs" | N/A | 35+ Thai cities since 2020 | Low | 80–100 | Confirmed operating; confirmed no API |
| **MuvMi** | Bangkok electric tuk-tuk | No API | N/A | N/A | 3.7M+ passengers; Bangkok only | Low | 80–100 | Innovative but tiny; no API |
| **Agoda** | Global OTA (Thai-origin) | **Public (Partner API)** | https://developer.agoda.com/demand/docs/getting-started | Site ID + API Key | Booking Holdings ($148B); millions of users | **High** | 30–50 | ✅ **Official MCP**: github.com/agoda-com/api-agent; Content/Search/Book/Post-booking APIs; sandbox; certification process |
| **Klook TH** | Activities/experiences booking | Semi-Public (affiliate) | https://affiliate.klook.com/ | Affiliate tracking + partner creds | 100K+ activities globally | Medium | 40–60 | Affiliate API for search/pricing; full booking API restricted |
| **12Go Asia** | Asian transport booking | Semi-Public (affiliate + operator SDK) | https://github.com/tmvrus/remote-api-sdk | Code + SHA1 signature | 3M+ bookings; 26 countries | **High** | 30–50 | Operator SDK on GitHub; 50% affiliate revenue share; trains/buses/ferries |

---

## All existing MCP servers found on GitHub

| Repository | Target Platform | Type | Status |
|-----------|----------------|------|--------|
| `line/line-bot-mcp-server` | **LINE Messaging API** | ✅ Official | Preview; ~5% API coverage |
| `omise/omise-mcp` | **Opn Payments (Omise)** | ✅ Official | Alpha; comprehensive charge/token/customer tools |
| `agoda-com/api-agent` | **Agoda** (universal MCP proxy) | ✅ Official | Production; converts any REST/GraphQL to MCP |
| `HiGo-MCP/kiotviet-mcp-server` | **KiotViet** POS | Community | Active; products/categories/customers/orders |
| `thedtvn/mbbank-mcp` | **MB Bank** | Community | Active; Docker; ⚠️ unofficial API (account risk) |
| `phake-studio/mcp-dichvucong` | **dichvucong.gov.vn** | Community | Early; npm published; procedure search + status |
| `PhucMPham/zalo-agent-cli` | **Zalo** OA + Personal | Community | Active; MCP mode (stdio + HTTP); 4 tools |
| `hithereiamaliff/mcp-grabmaps` | **GrabMaps** (8 SEA countries) | Community | Active; geocoding + routing; not official Grab |
| `amornpan/py-mcp-line` | **LINE Bot** | Community | Basic; Python/FastAPI |
| `birariro/agoda-review-mcp` | **Agoda** reviews | Community | Basic; Java |
| `Funmula-Corp/BigGo-MCP-Server` | **Shopee** (via BigGo aggregator) | Community | Active; indirect Shopee access |

---

## TOP 10 MCP candidates — Vietnam

| Rank | Company | Justification |
|------|---------|---------------|
| **1** | **Zalo (all APIs)** | Vietnam's super-app with **70M+ users**. Four active API surfaces (OA, Pay, Social, Mini App) with OAuth 2.0 and comprehensive documentation. Existing MCP agent (zalo-agent-cli) validates feasibility. Messaging automation, payment triggers, and social login make this the single highest-impact MCP in Vietnam. Est. **72–96h** total. |
| **2** | **Momo** | Vietnam's dominant e-wallet with **50M+ users and ~70% market share**. Excellent V3 API documentation with sandbox covering payments, BNPL, COD, QR, disbursement, and remittance. No existing MCP server — pure greenfield with massive demand. HMAC-SHA256 auth is straightforward. Est. **40–50h**. |
| **3** | **Shopee VN (Seller API)** | The largest e-commerce platform in Vietnam and SEA. Public Open Platform v2 with OAuth 2.0, comprehensive endpoints (products, orders, logistics, marketing, finance), and sandbox. AI-driven seller automation (inventory, pricing, order management) has enormous demand. Est. **32–40h**. |
| **4** | **KiotViet** | **Existing MCP server already on GitHub** — lowest barrier to entry. Vietnam's #1 POS with **100K+ retailers**. Well-documented OAuth 2.0 API with webhooks. Just needs extension and polish. Est. **8–16h** to enhance existing server. |
| **5** | **VNPay** | Vietnam's dominant payment gateway integrated with **40+ banks and 100K+ merchants**. Public API with sandbox and code samples in 5 languages. Every Vietnamese e-commerce transaction touches VNPay. Payment automation is a core MCP use case. Est. **30–40h**. |
| **6** | **GHN (Giao Hang Nhanh)** | Vietnam's leading logistics API with excellent English documentation, simple token auth, full sandbox, and Node.js SDK. Order creation, tracking, fee calculation, and COD management are perfect for AI automation. Paired with e-commerce MCP servers, this completes the seller workflow. Est. **30–40h**. |
| **7** | **Haravan** | Vietnam's Shopify equivalent with **50K+ merchants**. Shopify-like REST API design (familiar patterns), OAuth 2.0, webhooks, and partner dev stores for testing. No existing MCP — strong greenfield opportunity. Multi-channel commerce (Facebook, Shopee, Lazada) management via AI is highly valuable. Est. **24–32h**. |
| **8** | **VietinBank** | Award-winning iConnect platform with **hundreds of APIs**, OAuth 2.0/OpenID Connect, sandbox, and 55M+ monthly transactions. Vietnam's strongest bank developer portal. Complements payment MCPs with banking operations. Est. **50–70h**. |
| **9** | **Base.vn** | The most API-rich Vietnamese business platform with **20+ product APIs** (HRM, payroll, recruitment, finance, workflow) documented in Postman. Company has published about MCP — indicating likely partnership interest. Covers the enterprise back-office that other MCPs don't touch. Est. **50–70h**. |
| **10** | **Vietnam e-Invoice (Viettel S-Invoice)** | Universal mandate for **all 900K+ Vietnamese businesses** since 2022. Viettel's REST API has sandbox and Postman guides. AI-assisted invoice creation, verification, and management has massive demand from accountants and bookkeepers. Est. **40–60h**. |

## TOP 10 MCP candidates — Thailand

| Rank | Company | Justification |
|------|---------|---------------|
| **1** | **LINE (all APIs)** | Thailand's everything-app with **53M+ users** (~95% smartphone penetration). LINE Corp already published an **official MCP server** covering ~5% of the Messaging API. Enormous opportunity to build comprehensive coverage across Messaging, Pay, Shopping, Ads, Login, and LIFF — **108–148h** for full ecosystem. The official server validates demand. |
| **2** | **Opn Payments (Omise)** | **Official MCP server already published** (github.com/omise/omise-mcp). Best API documentation quality among all 120 companies researched. Supports PromptPay, TrueMoney, LINE Pay, cards, and 10+ payment methods. OpenAPI schema published. 8 official client libraries. The existing alpha MCP server makes this the fastest path to production. Est. **30–40h** to extend. |
| **3** | **Agoda** | Thai-origin global OTA with **official MCP tools** (github.com/agoda-com/api-agent — universal REST/GraphQL-to-MCP converter). Professional Content/Search/Book/Post-booking APIs with sandbox. Hotel search and booking via AI is a killer use case. Part of **Booking Holdings ($148B)**. Est. **30–50h**. |
| **4** | **KBank (KBTG)** | Most advanced open banking APIs among Thai banks. **20M+ mobile users**. Comprehensive portal with OAuth 2.0 + mTLS, sandbox, and QR Payment/Slip Verify/Fund Transfer endpoints. KBTG tech arm is the most developer-friendly banking entity in Thailand. Also owns Orbix crypto. Est. **50–70h**. |
| **5** | **Shopee TH (Seller API)** | Identical API infrastructure to Shopee VN (#3 in Vietnam list). Dominant Thai e-commerce platform with OAuth 2.0, sandbox, and comprehensive seller management endpoints. A single Shopee MCP server can serve both VN and TH markets. Est. **40–50h**. |
| **6** | **GrabFood TH / Grab TH** | Official SDKs in 4 languages, OpenAPI spec, and sandbox environment. Dominant food delivery (**~35–39% share**) and ride-hailing in Thailand. GrabPlatform covers payments, delivery, and identity. A Grab MCP server serves all 8 SEA countries. Est. **30–40h** for GrabFood; **40–60h** for full Grab. |
| **7** | **FlowAccount** | Thailand's **#1 cloud accounting** with full public OpenAPI, sandbox, and OAuth 2.0. **40K+ SMEs** use it. Backed by Sequoia and Beacon VC (KBank). Covers invoicing, expenses, tax documents, and payroll. An accounting MCP (like Xero's) is proven high-demand. Est. **20–30h** — fastest non-existing Thai MCP to build. |
| **8** | **Bitkub** | Thailand's dominant crypto exchange with **~90% market share**. Well-documented REST API + WebSocket on **official GitHub** (github.com/bitkub/bitkub-official-api-docs). HMAC auth, public/private endpoints, Python SDK. Crypto trading automation via AI is a growing use case. Est. **30–40h**. |
| **9** | **2C2P** | Major enterprise payment gateway serving SEA with comprehensive REST API, JWT auth, sandbox, and mobile SDKs. Supports PromptPay, TrueMoney, LINE Pay, GrabPay, Alipay, WeChat Pay. Complements Omise for enterprise-tier payment MCP. Est. **40–50h**. |
| **10** | **SCB (Siam Commercial Bank)** | Thailand's first bank to launch Open API (2019). OAuth 2.0, sandbox with SCB Easy Simulator app, and APIs for QR Payment, Slip Verification, Payment Gateway, Customer Info, and Loan Origination. **~16M mobile banking users**. Strong developer engagement via SCB10X hackathons. Est. **40–60h**. |

---

## Strategic observations for implementation planning

Three companies have already published **official MCP servers** — LINE, Omise/Opn, and Agoda — signaling strong market validation. These official implementations are early-stage (LINE covers ~5%, Omise is alpha), creating opportunities to build comprehensive community alternatives or extensions.

The **fastest wins** are extending existing MCP servers: KiotViet (8–16h), Omise (already alpha), and LINE (extend from 5% to 80%+ coverage). The **highest-impact greenfield builds** are Momo (50M users, no MCP), Zalo (70M users, basic MCP), and Shopee (SEA-wide, no dedicated MCP).

**Vietnam's Circular 64** will transform the banking landscape by March 2027, mandating open APIs from all commercial banks. Building MCP servers for early adopters (BIDV, VietinBank, TPBank) establishes first-mover advantage. Meanwhile, third-party aggregators **SePay** and **Casso** offer a shortcut to multi-bank MCP coverage today.

**Common auth pattern** across Vietnamese payment APIs is HMAC-SHA256 signature-based (not OAuth 2.0). MCP implementations should include a shared HMAC signing utility. Thai bank APIs generally use OAuth 2.0 + mutual TLS, which is more standard but requires certificate management.

The e-commerce logistics pipeline (Shopee→GHN/GHTK→VNPay/Momo) and the Thai equivalent (Shopee/Lazada→Flash Express→Omise/2C2P) represent **end-to-end workflow chains** where multiple MCP servers working together create exponentially more value than individual implementations.