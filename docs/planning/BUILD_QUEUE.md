# BUILD QUEUE -- NeuralDeep MCP Server Production Plan

**Generated:** 2026-04-01
**Source:** MASTER_INVENTORY.md (1,020 candidates, 507 HIGH priority)
**Current:** 47 servers (1 production-grade, 6 decent, 40 stubs)
**Target:** 47 -> 55 (April) -> 100+ (May) -> 150+ (June)

---

## Wave 0: UPGRADE EXISTING 47 (NOW -- April 2026)

Goal: Upgrade 10 highest-value existing servers from stub to production-grade.
Method: 8 parallel agents, each upgrading 1-2 servers.

### Top 10 Upgrade Priorities

Sorted by composite score from MASTER_INVENTORY + current stub quality.

| # | Server | Current | Target | Score | Why Upgrade |
|---|--------|---------|--------|-------|-------------|
| 1 | **yookassa-mcp** | Tier 2 (10 tools) | 25+ tools | 36.0 | Highest composite score in entire inventory; #1 RU payment gateway |
| 2 | **moysklad-mcp** | Tier 3 | 20+ tools | 33.5 | Best-documented RU business API; sandbox; 3M+ users |
| 3 | **cdek-mcp** | Tier 2 (6 tools) | 15+ tools | 31.5 | #1 CIS logistics; 60K+ businesses; sandbox; webhooks |
| 4 | **yandex-metrika-mcp** | Tier 3 | 15+ tools | 31.5 | #1 CIS web analytics; Reporting + Management API |
| 5 | **tkassa-mcp** | Tier 2 (5 tools) | 15+ tools | 31.5 | Best bank APIs in RU; gRPC Invest API; sandbox |
| 6 | **amocrm-mcp** | Tier 3 | 15+ tools | 29.0 | 50K+ businesses; excellent API; webhooks |
| 7 | **cloudpayments-mcp** | Tier 2 (6 tools) | 12+ tools | 29.0 | Modern API; subscriptions; sandbox |
| 8 | **hh-mcp** | Tier 3 | 12+ tools | 31.0 | Dominant CIS job board; 2 existing MCPs to beat |
| 9 | **travelpayouts-mcp** | Tier 3 | 10+ tools | 29.0 | #1 CIS flight metasearch; affiliate revenue potential |
| 10 | **retailcrm-mcp** | Tier 3 | 12+ tools | 28.5 | Best docs among RU CRMs; Swagger/Postman |

### Agent Assignments (Wave 0)

| Agent | Servers | Est Time |
|-------|---------|----------|
| Agent-1 | yookassa-mcp, cloudpayments-mcp | 2-3 days |
| Agent-2 | moysklad-mcp | 2 days |
| Agent-3 | cdek-mcp, travelpayouts-mcp | 2-3 days |
| Agent-4 | yandex-metrika-mcp | 2 days |
| Agent-5 | tkassa-mcp | 2 days |
| Agent-6 | amocrm-mcp | 2 days |
| Agent-7 | hh-mcp | 1-2 days |
| Agent-8 | retailcrm-mcp | 1-2 days |

**Wave 0 total:** 10 servers upgraded, ~2-3 days, 8 agents parallel

---

## Wave 1: CIS EXPANSION (April 2026)

Goal: Build 32-40 NEW CIS servers from HIGH priority candidates that don't already have @theyahia servers.
Method: 8 agents x 4-5 servers each.

### Agent-1: RU Payments + Banking (5 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Alfa-Bank API | 27.0 | M | OAuth 2.0 |
| 2 | Robokassa (upgrade) | 25.5 | S | MD5/SHA |
| 3 | Prodamus API | 25.0 | M | API Key |
| 4 | Sberbank Acquiring | 25.5 | M | Token |
| 5 | Tochka Bank API | 23.0 | M | OAuth 2.0 |

### Agent-2: RU Business Platform (5 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Bitrix24 (upgrade) | 27.5 | M | OAuth 2.0 |
| 2 | Yandex Tracker | 27.0 | M | OAuth 2.0 |
| 3 | Kaiten (upgrade) | 28.0 | M | Bearer Token |
| 4 | GetCourse (upgrade) | 27.0 | M | API Key |
| 5 | Yandex 360 | 27.0 | M | OAuth 2.0 |

### Agent-3: RU Marketing + Analytics (5 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Yandex Direct (upgrade) | 29.5 | M | OAuth 2.0 |
| 2 | VK Ads (myTarget) | 27.0 | M | OAuth 2.0 |
| 3 | AppMetrica | 27.0 | M | OAuth 2.0 |
| 4 | Telegram Ads | 27.0 | M | Token |
| 5 | TGStat | 27.0 | M | API Key |

### Agent-4: RU Logistics + Maps (4 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Yandex Maps | 29.5 | M | API Key |
| 2 | 2GIS | 29.0 | S | API Key |
| 3 | ATI.su (Freight) | 27.0 | M | Token |
| 4 | Yandex Delivery | 27.0 | M | OAuth 2.0 |

### Agent-5: RU AI + Cloud + Comms (5 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Yandex Cloud (core) | 26.0 | XL | IAM Token |
| 2 | MTS Exolve (upgrade) | 27.0 | M | Token |
| 3 | Voximplant (upgrade) | 28.0 | M | API Key |
| 4 | YandexGPT (upgrade) | 27.0 | M | IAM Token |
| 5 | GigaChat (upgrade) | 27.0 | M | OAuth 2.0 |

### Agent-6: Kazakhstan + Uzbekistan (5 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Forte Bank | 31.0 | S | HTTP Basic |
| 2 | Halyk Bank ePay | 29.5 | M | OAuth2-style |
| 3 | Payme API (UZ) | 29.5 | M | HTTP Basic |
| 4 | Click API (UZ) | 29.5 | M | Custom HMAC |
| 5 | Factura.uz | 27.0 | M | OAuth2 |

### Agent-7: Caucasus + Moldova + Belarus (4 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | TBC Bank (GE) | 29.0 | S | API Key + OAuth |
| 2 | Bank of Georgia / iPay | 29.0 | S | OAuth 2.0 + JWT |
| 3 | MAIB (Moldova) | 27.0 | M | OAuth 2.0 |
| 4 | bePaid (Belarus) | 26.5 | S | Token/Signature |

### Agent-8: RU Fiscal + Data + Other (5 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Kontur.Focus (upgrade) | 28.0 | S | API Key |
| 2 | ATOL Online | 27.0 | M | Token |
| 3 | Kontur.Diadoc | 25.5 | L | Bearer Token |
| 4 | SPARK (Interfax) | 27.0 | M | Token |
| 5 | Pravo.ru/Casebook | 27.0 | M | Token |

### Wave 1 Summary

| Metric | Value |
|--------|-------|
| **New servers** | 25-30 |
| **Upgraded existing** | 10-12 |
| **Agents** | 8 parallel |
| **Est time** | 5-7 days |
| **Post-Wave 1 total** | ~72-80 servers |

---

## Wave 2: WORLD EXPANSION (May 2026)

Goal: Build 40-56 NEW servers covering key global markets.
Method: 8 agents x 5-7 servers each, grouped by region.

### Agent-1: Turkey (7 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | iyzico | 34.5 | S | API Key + SHA-1 |
| 2 | Trendyol | 32.5 | M | Basic Auth |
| 3 | Ileti Merkezi | 32.0 | S | API Key + Hash |
| 4 | Is Bankasi | 31.5 | S | OAuth2 |
| 5 | Parasut | 30.0 | M | OAuth 2.0 |
| 6 | Hepsiburada | 29.5 | M | HTTP Basic |
| 7 | MNG Kargo | 29.0 | S | API Key |

### Agent-2: Gulf -- UAE + Saudi (7 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Tap Payments | 34.5 | S | API Key + HMAC |
| 2 | Tap Payments KSA | 34.5 | S | API Key + HMAC |
| 3 | PayTabs UAE | 32.0 | S | Profile ID + Key |
| 4 | PayTabs KSA | 32.0 | S | API Key |
| 5 | Salla | 29.5 | M | OAuth2 |
| 6 | Tabby | 29.0 | S | API Token |
| 7 | Unifonic KSA | 31.5 | S | API Key |

### Agent-3: LATAM -- Brazil (7 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Facturapi (MX) | 34.5 | S | API Key |
| 2 | Pagar.me | 32.0 | S | API Key |
| 3 | NFe.io | 32.0 | S | API Key |
| 4 | iFood | 29.5 | M | OAuth 2.0 |
| 5 | Correios | 29.5 | M | Token |
| 6 | Hotmart | 29.5 | M | OAuth 2.0 |
| 7 | Asaas | 26.5 | S | API Key |

### Agent-4: Africa (6 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Nomba | 33.5 | S | OAuth2 |
| 2 | Termii | 32.0 | S | API Key |
| 3 | Yoco | 32.0 | S | Bearer Token |
| 4 | PayFast | 31.5 | S | HMAC-MD5 |
| 5 | Takealot | 31.5 | S | API Key |
| 6 | Chargily Pay | 32.0 | S | API Key |

### Agent-5: SE Asia -- Indonesia + Vietnam (7 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Midtrans | 32.5 | M | Basic Auth |
| 2 | Xendit | 30.0 | M | Basic Auth |
| 3 | RajaOngkir | 29.0 | S | API Key |
| 4 | VNPay | 29.5 | M | HMAC-SHA512 |
| 5 | Momo | 29.5 | M | HMAC-SHA256 |
| 6 | Shopee VN | 29.5 | M | OAuth + HMAC |
| 7 | Zalo OA API | 29.5 | M | OAuth 2.0 |

### Agent-6: SE Asia -- Thailand + Malaysia + Philippines + Bangladesh (6 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | PayMongo | 32.0 | S | API Key |
| 2 | Globe Labs | 32.0 | S | OAuth 2.0 |
| 3 | Billplz | 29.0 | S | HTTP Basic |
| 4 | SSLCommerz | 29.0 | S | Store ID + Pass |
| 5 | FlowAccount | 28.0 | S | OAuth 2.0 |
| 6 | Steadfast Courier | 26.5 | S | API Key + Secret |

### Agent-7: MENA -- Iran + Egypt + Pakistan (6 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | ZarinPal | 32.0 | S | Merchant ID |
| 2 | Kavenegar | 32.0 | S | API Key |
| 3 | Neshan Maps | 29.0 | S | API Key |
| 4 | IDPay | 26.5 | S | X-API-KEY |
| 5 | JazzCash | 29.5 | M | HMAC |
| 6 | TCS (PK logistics) | 29.5 | M | OAuth 2.0 |

### Agent-8: China + India (5 servers)

| # | Service | Score | Est | Auth |
|---|---------|-------|-----|------|
| 1 | Yunpian | 29.5 | S | API Key |
| 2 | Ping++ | 26.5 | S | API Key |
| 3 | Freshsales/CRM | 29.0 | S | API Key |
| 4 | Tata 1mg | 29.0 | S | JWT |
| 5 | Shiprocket | 29.5 | M | Bearer Token |

### Wave 2 Summary

| Metric | Value |
|--------|-------|
| **New servers** | 40-56 |
| **Agents** | 8 parallel |
| **Est time** | 7-10 days |
| **Post-Wave 2 total** | ~120-136 servers |

---

## Wave 3: LONG TAIL (June 2026)

Goal: Fill remaining HIGH priority gaps. Target 150+ total servers.
Focus: Deeper coverage per region + specialized verticals.

### 3A: E-Invoicing Vertical (mandatory/government APIs)

| Service | Country | Score | Est |
|---------|---------|-------|-----|
| ETA e-Invoice | EG | 31.0 | L |
| ZATCA Fatoora | SA | 28.0 | L |
| LHDN MyInvois | MY | 29.5 | M |
| VN e-Invoice | VN | 29.5 | M |
| Moadian | IR | 27.5 | M |
| SEF / eFaktura | RS | 27.0 | M |
| FBR POS | PK | 29.5 | M |
| KRA eTIMS | KE | 28.0 | L |
| Foriba/Sovos | TR | 29.5 | M |
| Focus NFe (BR) | BR | 29.0 | S |

### 3B: Banking Deepening

| Service | Country | Score | Est |
|---------|---------|-------|-----|
| Emirates NBD | AE | 28.0 | L |
| BCA | ID | 28.0 | L |
| BRI | ID | 28.0 | L |
| KBank (KBTG) | TH | 28.0 | L |
| Banco do Brasil | BR | 29.5 | M |
| Finnotech | IR | 28.0 | L |
| Kuda Bank | NG | 27.0 | M |
| Nedbank | ZA | 27.0 | M |

### 3C: Marketplace Deepening

| Service | Country | Score | Est |
|---------|---------|-------|-----|
| Mercado Livre | BR | 29.5 | M |
| Mercado Libre MX | MX | 29.5 | M |
| Mercado Libre AR | AR | 29.5 | M |
| Shopee ID | ID | 29.5 | M |
| Shopee TH | TH | 29.5 | M |
| Shopee MY | MY | 29.5 | M |
| Shopee PH | PH | 29.5 | M |
| Lazada (multi-country) | ID/MY/TH/PH/VN | 27.0 | M |
| Divar (Kenar) | IR | 34.0 | M |
| Jumia (multi-country) | EG/NG/KE | 25.5 | L |

### 3D: China Deep Dive

| Service | Country | Score | Est |
|---------|---------|-------|-----|
| WeChat Pay | CN | 29.5 | M |
| Baidu Marketing | CN | 29.5 | M |
| Cainiao | CN | 29.5 | M |
| Amap / Gaode Maps | CN | 29.5 | M |
| Didi Chuxing | CN | 29.5 | M |
| Ctrip / Trip.com | CN | 29.5 | M |
| Boss Zhipin | CN | 29.5 | M |
| Nuonuo (E-Invoice) | CN | 27.0 | M |
| Tianyancha | CN | 27.0 | M |
| Douyin Open Platform | CN | 29.5 | M |

### 3E: Regional Fill

| Region | Servers to Add | Focus |
|--------|---------------|-------|
| Iraq | ZainCash, Qi Card, Talabat | 3 servers |
| Algeria | SATIM, Yalidine, Maystro | 3 servers |
| Serbia | MonriPay, Minimax, Pantheon | 3 servers |
| Kyrgyzstan | Elsom, Balance.kg | 2 servers |
| Armenia | Ameriabank OB, ARCA | 2 servers |
| Azerbaijan | Kapital Bank, E-Qaime | 2 servers |

### Wave 3 Summary

| Metric | Value |
|--------|-------|
| **New servers** | 30-50 |
| **Agents** | 8 parallel |
| **Est time** | 10-14 days |
| **Post-Wave 3 total** | **150-186 servers** |

---

## Consolidated Timeline

| Wave | When | Servers | Cumulative | Focus |
|------|------|---------|------------|-------|
| **Wave 0** | Apr 1-5 | 10 upgraded | 47 (10 production) | Existing server quality |
| **Wave 1** | Apr 5-12 | +30 new CIS | ~77 | CIS domination |
| **Wave 2** | May 1-12 | +48 new World | ~125 | Global footprint |
| **Wave 3** | Jun 1-15 | +35 long tail | ~160 | Depth + verticals |

### Resource Requirements Per Wave

| Resource | Wave 0 | Wave 1 | Wave 2 | Wave 3 |
|----------|--------|--------|--------|--------|
| Claude Code agents | 8 | 8 | 8 | 8 |
| Calendar days | 3-5 | 5-7 | 7-10 | 10-14 |
| API registrations needed | 0 | ~15 | ~30 | ~20 |
| Sandbox/test accounts | 0 | ~10 | ~25 | ~15 |

### Success Criteria Per Wave

| Wave | Criteria |
|------|----------|
| Wave 0 | All 10 servers have 10+ tools, tests, sandbox validation |
| Wave 1 | 30+ new CIS servers published on npm + GitHub + Registry |
| Wave 2 | 45+ world servers, coverage in 15+ countries |
| Wave 3 | 150+ total, e-invoice vertical complete, China started |

---

## Agent Allocation Strategy

Each agent gets a themed batch to maximize context reuse:

| Agent Archetype | Skill | Wave 0 | Wave 1 | Wave 2 | Wave 3 |
|----------------|-------|--------|--------|--------|--------|
| Payment Agent | Payments/BNPL/Banking | yookassa, cloudpay | RU banks, KZ/UZ pay | TR/Gulf/Africa pay | CN/BD/PH pay |
| Commerce Agent | Marketplace/POS | moysklad | Bitrix24, GetCourse | Trendyol, Shopee | Mercado Libre, Divar |
| Logistics Agent | Courier/Freight/Postal | cdek | Yandex Maps/Delivery | Correios, RajaOngkir | SF Express, Aramex |
| Analytics Agent | Analytics/Ads/Marketing | yandex-metrika | VK Ads, AppMetrica | Hotmart, Ads | Baidu, ByteDance |
| Comms Agent | SMS/CPaaS/Messaging | -- | MTS Exolve, TGStat | Termii, Kavenegar | Clickatell, Unifonic |
| Finance Agent | ERP/Accounting/E-Invoice | retailcrm | ATOL, Kontur | Facturapi, Parasut | ZATCA, ETA, LHDN |
| HR/Gov Agent | HR/Government/Identity | hh | SPARK, Pravo.ru | SeamlessHR, FBR | UAE Pass, NADRA |
| Infra Agent | Cloud/AI/Maps/Travel | tkassa | Yandex Cloud, AI | Neshan, Yunpian | Amap, Ctrip |

---

*This document defines the build execution plan for NeuralDeep MCP servers.*
*Companion document: MASTER_INVENTORY.md*
*Source plan: PLAN.md (Phase 1-3)*
