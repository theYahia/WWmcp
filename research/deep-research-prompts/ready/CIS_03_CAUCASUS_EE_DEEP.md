# Deep Research: MCP Candidates — Caucasus + Eastern Europe DEEP VERIFICATION (GE + AM + AZ + BY + MD)

You are a senior technology market analyst. Conduct **deep verification** of MCP candidates in Georgia, Armenia, Azerbaijan, Belarus, and Moldova.

## SERVICES TO VERIFY

### Georgia

**Banking (Open Banking leaders):**
- TBC Bank API (developer.tbcbank.ge or similar) — Georgia's most advanced open banking
- Bank of Georgia API / iPay API
- Liberty Bank API

**Government & Fiscal:**
- rs.ge API (Revenue Service — mandatory e-invoicing!)
- my.gov.ge API
- NAPR (public registry) API

**Other:**
- MyAuto.ge API (auto marketplace)
- ss.ge API (real estate)
- Glovo GE API
- Bolt GE API
- Wolt GE API

### Armenia

**Banking:**
- Ameriabank API (developer portal)
- Ardshinbank API
- IDBank / IDram API (payment system)
- Evocabank API
- ARCA (Armenian Card) API

**Other:**
- List.am (classifieds — check API status)
- Menu.am (food delivery) API
- GG Taxi API
- Staff.am API
- e-gov.am API
- Telcell API (payment terminals)

### Azerbaijan

**Banking & Payments:**
- Kapital Bank API
- PASHA Bank API
- ABB (Azerbaijan International Bank) API
- m10 wallet API
- Goldenpay API
- E-Manat API

**Classifieds:**
- Tap.az API (check if exists)
- Turbo.az API (check if exists)
- Bina.az API (check if exists)

**Government:**
- ASAN Service API
- e-Gov.az API

**Other:**
- Bolt AZ API
- Wolt AZ API
- Lent.az API

### Belarus

**Banking & Payments:**
- Belarusbank API
- Alfa-Bank BY API
- ERIP (ЕРИП) API — mandatory payment system, used by everyone!
- bePaid API (payment gateway)
- A1 Banking API

**E-commerce:**
- Onliner.by API (marketplace/price comparison — huge!)
- Kufar.by API (classifieds)
- Deal.by / Satu.by API
- Wildberries BY seller API

**Government:**
- e-pasluga.by API (e-gov)
- MNS (tax) API

**Other:**
- 21vek.by API (electronics retailer)
- Yandex Go BY API
- HeadHunter.by API

**Note:** Belarus is under EU/US sanctions — note impact on each service

### Moldova

**Banking:**
- MAIB API (developer portal)
- Victoriabank API
- Moldova Agroindbank API

**Government:**
- MConnect / MPass API (e-gov identity)
- SFS (tax) API
- e-Factura API (e-invoicing)

**Other:**
- 999.md API (dominant classifieds — check if API exists!)
- rabota.md API
- Moldtelecom API

## OUTPUT FORMAT

For each service:

```
## [Service Name] ([Country])

- **Developer Portal**: [verified URL]
- **API Status**: Active / Deprecated / Beta / Unavailable / No API Found
- **Base URL**: [URL]
- **Auth**: [method]
- **Key Endpoints**: [list]
- **Rate Limits**: [details]
- **Sandbox**: Yes / No
- **Official SDK**: [languages]
- **Existing MCP**: [GitHub search]
- **Docs Quality**: [1-5] + [language]
- **Est. MCP Build**: S/M/L/XL
- **Notes**: [blockers, requirements]
```

## CRITICAL INSTRUCTIONS

1. **TBC Bank** (Georgia) has one of the best open banking APIs in CIS — verify thoroughly
2. **rs.ge** (Georgia Revenue Service) is mandatory for all businesses — check API docs
3. **ERIP** (Belarus) is the universal payment system — every Belarusian business uses it
4. **Onliner.by** is Belarus's #1 platform — check catalog/marketplace API
5. **999.md** is Moldova's everything — classifieds, auto, real estate. Check if ANY API exists
6. **Sanctions on Belarus** — note which services are affected for international developers
7. Actually visit developer portals
8. Search GitHub for existing MCP servers
9. Produce final **IMPLEMENTATION PRIORITY MATRIX**
