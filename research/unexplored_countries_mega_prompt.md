# MCP Expansion — Unexplored Countries Mega Prompt

> Generated 2026-04-22 after WWmcp coverage analysis.
> Use this as a self-contained prompt for **Claude.ai Deep Research**, **GPT-5 Pro**, or **Gemini Deep Research** to identify high-value API targets for new MCP servers.

---

## Part 1 — Current coverage snapshot (DON'T research these again)

The `theYahia/WWmcp` collection currently covers **22 countries / 114 servers**:

| Region | Countries | Server count |
|---|---|---|
| Russia | RU | 64 |
| CIS | KZ (3), UZ (3), GE (2), BY (1), MD (1) | 10 |
| Turkey | TR | 7 |
| Gulf | UAE, KSA | 7 |
| LATAM (partial) | BR, MX | 7 |
| Africa (partial) | NG, KE, ZA, DZ | 6 |
| Southeast Asia (partial) | ID, VN, PH | 7 |
| MENA (partial) | IR, PK | 6 |

**Categories already strong in covered regions:** payments / acquiring, e-commerce platforms, marketplaces, SMS gateways, CRM, marketing analytics, logistics / delivery, HR / job boards, AI inference (RU only), financial APIs, geocoding (RU only).

**Categories underserved everywhere:** government / tax APIs, banking open APIs, telco MVNO APIs, healthcare / pharmacy chains, education platforms (LMS / SIS), real estate listings, ride-hailing / delivery aggregators (regional incumbents), embedded finance (BNPL, neobanks).

---

## Part 2 — Priority unexplored markets (high → low)

### Tier 1 — Massive addressable markets, missing entirely

| Country | Pop (M) | Why critical | Anchor APIs to investigate |
|---|---|---|---|
| **Egypt** 🇪🇬 | 110 | MENA fintech leader, Fawry/Paymob > $400M val | Fawry, Paymob, Khazna, Telda, Vodafone Cash, ETA (tax), Talabat, NoonEgypt |
| **Argentina** 🇦🇷 | 46 | MercadoLibre HQ, peso volatility = high fintech demand | MercadoLibre, MercadoPago, AFIP (tax), Banco Galicia, Ualá, Tienda Nube |
| **Bangladesh** 🇧🇩 | 170 | Fastest-growing fintech in S.Asia, bKash 70M+ users | bKash, Nagad, SSL Wireless, Daraz BD, ShopUp, NRBC Bank |
| **Colombia** 🇨🇴 | 52 | Rappi HQ, Bancolombia $50B mkt cap | Bancolombia, RappiPay, Nequi, DIAN (tax), Mercado Libre CO, Movii |
| **Vietnam** 🇻🇳 (deepen) | 100 | Already partial — many fintechs missing | MoMo, ZaloPay, VNPay, Tiki, Sendo, Lazada VN |
| **Israel** 🇮🇱 | 9 | Outsized SaaS — but politically tricky | monday.com, Lemonade, Tipalti, Wix, Fiverr, BIT |

### Tier 2 — Regional fintech booms

| Country | Pop (M) | Why critical | Anchor APIs to investigate |
|---|---|---|---|
| **Ethiopia** 🇪🇹 | 120 | Telebirr 30M+ users, no Western competitor | Telebirr, Awash Bank, BCBE, Chapa, ArifPay |
| **Ghana** 🇬🇭 | 33 | Mobile money saturation, MTN MoMo dominant | MTN MoMo, Hubtel, Korba, ExpressPay, Zeepay |
| **Morocco** 🇲🇦 | 37 | Maghreb gateway, French/Arabic stack | CMI, Maroc Telecom, Inwi, Wafacash |
| **Tanzania** 🇹🇿 | 65 | M-Pesa, Tigo Pesa, Selcom | M-Pesa TZ, Selcom, Tigo Pesa, Azam Pay |
| **Senegal** 🇸🇳 | 17 | Wave Mobile Money disrupting West Africa | Wave, Orange Money SN, Free Money, Wari |
| **Pakistan** 🇵🇰 (deepen) | 240 | Already partial — JazzCash/Easypaisa missing | JazzCash, Easypaisa, NayaPay, SadaPay, Daraz PK |

### Tier 3 — Missing CIS / regional adjacent

| Country | Pop (M) | Why critical | Anchor APIs to investigate |
|---|---|---|---|
| **Armenia** 🇦🇲 | 3 | Tech hub, Idram, Telcell, AmeriaBank | Idram, Telcell, AmeriaBank, AraratBank, Ucom |
| **Azerbaijan** 🇦🇿 | 10 | Caspian energy + ABB Bank infra | Kapital Bank, ABB, Bakcell, m10 |
| **Kyrgyzstan** 🇰🇬 | 7 | MBANK, Optima, Demir Bank | MBANK, Optima Bank, Demir Bank, Beeline KG |
| **Tajikistan** 🇹🇯 | 10 | Alif, Eskhata Bank | Alif, Eskhata, Tcell |
| **Mongolia** 🇲🇳 | 3.4 | KhanBank, Golomt = 2-bank duopoly | KhanBank, Golomt, Mongol Bank, Mobicom |
| **Sri Lanka** 🇱🇰 | 22 | Sampath, FriMi, Lanka Pay | Sampath Bank, FriMi, LANKAQR, Daraz LK |
| **Nepal** 🇳🇵 | 30 | eSewa dominant fintech | eSewa, Khalti, FonePay, NIC Asia Bank |
| **Cambodia** 🇰🇭 | 17 | ABA Bank lead, Wing growing | ABA Bank, Wing, Pi Pay, TrueMoney KH |

### Tier 4 — Strategic but tricky / lower priority

- **China** — Alipay, WeChat Pay (geo-restricted but enormous; partner-only APIs)
- **Iraq** — Zain Cash, FastPay (post-conflict, high friction)
- **Lebanon** — diaspora payments, capital controls weird
- **Myanmar** — KBZPay (sanctioned banks complicate)
- **Cuba, Venezuela, North Korea** — sanctions block

---

## Part 3 — THE MEGA PROMPT (paste into Deep Research / GPT-5 Pro / Gemini)

```
You are conducting market intelligence for an open-source MCP (Model Context
Protocol) server collection that wraps non-Western APIs to make them callable
from AI agents like Claude, Cursor, and Windsurf. The maintainer is theYahia.
Current npm scope: @theyahia. Public collection: github.com/theYahia/WWmcp.

# CONTEXT — what already exists (DO NOT redo)

The collection covers 22 countries with 114 servers across these regions:
- Russia (64 servers): payments, e-commerce, CRM, marketing, logistics, HR, AI
- CIS partial: Kazakhstan (3), Uzbekistan (3), Georgia (2), Belarus (1), Moldova (1)
- Turkey (7): including Iyzico, Ileti Merkezi (SMS, HMAC auth), Trendyol
- Gulf (7): UAE + Saudi Arabia (Salla, etc.)
- LATAM partial: Brazil + Mexico (7)
- Africa partial: Nigeria, Kenya, South Africa, Algeria (6)
- SE Asia partial: Indonesia, Vietnam, Philippines (7)
- MENA partial: Iran, Pakistan (6)

The shared infrastructure (`@theyahia/mcp-core`) provides:
- BaseHttpClient with retries, timeouts, exponential backoff
- 5 reusable AuthStrategy implementations: API Key (Bearer or custom header),
  HTTP Basic, OAuth2 Client Credentials, Dual auth, NoAuth
- Custom strategies have been written for HMAC (SHA256 timestamp-based) and
  OAuth Password grant — patterns can be reused
- Streamable HTTP + stdio transports out of the box

# YOUR TASK

For each of the following UNEXPLORED markets, identify the TOP 5–10 APIs that
should be wrapped as MCP servers, ranked by **MCP value score**:

  MCP value score (0–100) =
       0.35 × addressable market (users × ARPU × API-touch frequency)
     + 0.25 × API quality (REST/GraphQL? OpenAPI spec? sandbox? docs language?)
     + 0.20 × strategic moat (no Western SaaS substitute? local-only payment rail?)
     + 0.10 × developer ecosystem (existing SDKs? GitHub stars? community size?)
     + 0.10 × auth simplicity (API key Bearer = 10, OAuth2 Client Creds = 7,
                                Password grant = 5, HMAC custom = 4, mTLS = 1)

## TIER 1 — research these first (highest gravity)

1. EGYPT 🇪🇬 — focus areas: fintech (Fawry, Paymob, Khazna, Telda, Vodafone
   Cash), tax/gov (ETA e-invoicing), e-commerce (NoonEgypt, Jumia EG),
   delivery (Talabat EG, Mrsool).

2. ARGENTINA 🇦🇷 — focus areas: MercadoLibre + MercadoPago, Tienda Nube,
   AFIP (tax), banking (Banco Galicia, Santander Río), neobanks (Ualá,
   Brubank), logistics (Andreani, OCA).

3. BANGLADESH 🇧🇩 — focus areas: mobile money (bKash 70M+ users, Nagad),
   SMS aggregators (SSL Wireless), e-commerce (Daraz BD, ShopUp), banking
   (Eastern Bank, City Bank, NRBC).

4. COLOMBIA 🇨🇴 — focus areas: payments (Bancolombia, RappiPay, Nequi, PSE),
   tax (DIAN), e-commerce (Mercado Libre CO, Linio), delivery (Rappi,
   Domicilios), telco (Movii).

5. ISRAEL 🇮🇱 — focus areas: SaaS APIs (monday.com, Wix, Fiverr, Lemonade,
   Tipalti) where MCP wrappers could surface to non-Western-SaaS users;
   payments (BIT, Pepper Pay, Isracard); banking (Bank Hapoalim Open API).

## TIER 2 — high value, regional fintech booms

6. ETHIOPIA 🇪🇹 (Telebirr, Awash Bank, BCBE, Chapa, ArifPay)
7. GHANA 🇬🇭 (MTN MoMo, Hubtel, Korba, ExpressPay, Zeepay)
8. MOROCCO 🇲🇦 (CMI, Maroc Telecom, Inwi, Wafacash, M2T)
9. TANZANIA 🇹🇿 (M-Pesa TZ, Selcom, Tigo Pesa, Azam Pay)
10. SENEGAL 🇸🇳 (Wave Mobile Money, Orange Money SN, Free Money, Wari)

## TIER 3 — CIS / regional adjacencies (deepening existing footprint)

11. ARMENIA 🇦🇲 (Idram, Telcell, AmeriaBank, AraratBank, Ucom)
12. AZERBAIJAN 🇦🇿 (Kapital Bank, ABB, Bakcell, m10)
13. KYRGYZSTAN 🇰🇬 (MBANK, Optima Bank, Demir Bank, Beeline KG)
14. TAJIKISTAN 🇹🇯 (Alif, Eskhata, Tcell)
15. MONGOLIA 🇲🇳 (KhanBank, Golomt, Mongol Bank, Mobicom)
16. SRI LANKA 🇱🇰 (Sampath Bank, FriMi, LANKAQR, Daraz LK)
17. NEPAL 🇳🇵 (eSewa, Khalti, FonePay, NIC Asia Bank)
18. CAMBODIA 🇰🇭 (ABA Bank, Wing, Pi Pay, TrueMoney KH)

## REQUIRED OUTPUT (per country)

Produce a structured table for each country with these columns:

| Rank | API name | Category | Users / GMV / Volume | API public? | Auth type | OpenAPI / SDK | Sandbox? | Strategic moat | MCP score | Notes |
|---|---|---|---|---|---|---|---|---|---|---|

After each country's table, add:

  — **Top 3 picks**: which 3 APIs would create the biggest MCP impact and why.
  — **Auth complexity heatmap**: for each top pick, classify auth as
    "trivial / standard / custom / blocker" — flagging anything that requires
    custom implementation beyond the 5 existing AuthStrategy types.
  — **One-paragraph go-to-market pitch**: why someone in this country would
    use the MCP collection (the wedge use case — usually "AI agent that does
    end-to-end workflow X across these N services").

## REQUIRED CITATIONS

For every numerical claim (user counts, GMV, valuations, transaction volumes):
cite a primary source with publication date. Do NOT use "approximately" or
"around" without a number — I need real research. Prefer:

- Company press releases / IR pages
- Central bank or regulator reports
- Crunchbase / PitchBook (mark as paywalled if relevant)
- Local fintech reports (CGAP, GSMA, World Bank, Statista country reports)

If a source is in a non-English language, cite both the original and an
English summary. Do NOT fabricate URLs — verify every link before citing it.

## DELIVERABLES (3 outputs)

1. **Per-country tables** as specified above (one per country).
2. **Cross-country prioritization matrix** — single table ranking all top
   picks across all 18 countries by MCP score, so I can see the global Top 25
   to build first.
3. **"Quick wins" list** — the 5 APIs that combine high MCP score AND low auth
   complexity AND English/Russian docs. These should be buildable in <2 days
   each by a single dev using the existing @theyahia/mcp-core scaffolding.

## SCOPE GUARDRAILS

- DO NOT recommend APIs that already have a Western SaaS equivalent that
  Western developers reach for first (e.g., generic Stripe alternatives in
  countries where Stripe works).
- DO NOT recommend deprecated APIs, beta-only APIs without commitment to
  GA, or APIs that require physical office presence to obtain credentials.
- DO NOT recommend APIs from sanctioned entities or in countries under
  comprehensive US/EU sanctions (Cuba, North Korea, Crimea, etc.) — but
  individual targeted sanctions on companies should be flagged, not blanket
  excluded.
- DO call out any API where credential acquisition requires a local entity,
  local bank account, or government-issued business license — this is
  important for prioritization.

## TONE

Be direct and quantitative. No marketing fluff. If an API is mediocre, say so.
If a country has nothing worth wrapping, say so explicitly and explain why.
This is a build-prioritization research, not a marketing piece.

Begin with TIER 1 (Egypt first). Take your time — I want depth over speed.
```

---

## Part 4 — How to use this prompt

1. **Pick your research engine:**
   - **Claude.ai Deep Research mode** (best for citation discipline + Anthropic ecosystem)
   - **GPT-5 Pro Deep Research** (best for breadth + speed across 18 countries)
   - **Gemini Deep Research** (best for multilingual primary sources)

2. **Paste the entire "THE MEGA PROMPT" block** (between the triple backticks in Part 3).

3. **Expect output volume:** 80–120 pages structured. Run on a fresh chat to avoid context drift. Budget 1–2 hours of human review.

4. **After research returns:**
   - Drop the per-country tables into `research/unexplored/<country>.md`.
   - Use the cross-country prioritization matrix to update `docs/planning/BUILD_QUEUE.md` with the global Top 25.
   - Build the 5 "Quick wins" first via the canonical `servers/_template/` pattern.

5. **Re-run quarterly** — fintech moves fast, especially in Tier 1 (Egypt, Argentina, Bangladesh).

---

## Notes on the methodology

- **MCP value score weights** were chosen with a strong bias toward **strategic moat** (0.20) and **API quality** (0.25) over raw market size, because building an MCP for a low-quality API is high cost and low yield even if the market is huge.
- **Auth simplicity** is given non-trivial weight (0.10) because the development effort delta between API key Bearer and custom HMAC is roughly 4–8 hours of focused work — material when prioritizing a backlog.
- **Tier 1 selection** is biased toward markets where there is a clear local fintech incumbent with NO Western equivalent (Bangladesh's bKash, Egypt's Fawry, Senegal's Wave). These are the wedge plays.
