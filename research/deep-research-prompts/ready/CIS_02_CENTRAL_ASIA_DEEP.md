# Deep Research: MCP Candidates — Central Asia DEEP VERIFICATION (KZ + UZ + KG + TJ)

You are a senior technology market analyst. You have a preliminary inventory of services in Kazakhstan, Uzbekistan, Kyrgyzstan, and Tajikistan. Now conduct **deep verification** — actually visit API documentation, verify endpoints, check for existing MCP implementations.

## TASK

For each HIGH-priority service listed below, **actually visit their developer portal** and document API status, endpoints, auth, rate limits, SDKs, and existing MCP servers.

## SERVICES TO VERIFY

### Kazakhstan (top priority)

**Super-app & Finance:**
- Kaspi.kz API (merchant API, payment API, marketplace seller API) — kaspi.kz/developer or similar
- Halyk Bank API (Open Banking) — halykbank.kz
- Forte Bank API (ForteBank developer)
- Jusan Bank API
- Kaspi Pay / Kaspi QR merchant API

**E-commerce & Classifieds:**
- Kolesa.kz API (auto classifieds)
- Krisha.kz API (real estate)
- Market.kz API
- Satu.kz API (B2B marketplace)
- Wildberries KZ seller API
- Ozon KZ seller API

**Government & Fiscal:**
- eGov.kz API (government services portal)
- Webkassa API (online cash register — mandatory!)
- Salyk.kz API (tax authority)
- ИС ЭСФ API (electronic invoices — mandatory!)

**Logistics & Delivery:**
- Kaspi Delivery API
- CDEK KZ API
- Glovo KZ API
- Wolt KZ API

**Other:**
- 2GIS KZ API
- Chocofamily (Chocolife, Chocofood) APIs
- HeadHunter.kz API
- Flip.kz API

### Uzbekistan (second priority)

**Payments (the duopoly):**
- Payme API (developer.payme.uz or similar)
- Click API (docs.click.uz or similar)
- Uzum Bank / Uzum Pay API
- UzCard API
- HUMO card API

**E-commerce:**
- Uzum Market API (marketplace)
- OLX.uz API
- Asaxiy.uz API

**Government & Fiscal:**
- my.gov.uz API
- SolIQ API (tax — mandatory!)
- Factura.uz API (electronic invoices — mandatory!)
- DIDOX API (e-invoicing)

**Other:**
- Express24 API (delivery)
- MyTaxi API (ride-hailing)
- Humans API (super-app)
- Yandex Go UZ API
- HeadHunter.uz API

### Kyrgyzstan

- MBANK API
- O!Dengi API
- Balance.kg API
- Tunduk (e-gov interoperability platform) API
- Lalafo.kg (classifieds) — check for API
- Namba Food — check for API

### Tajikistan

- Alif Bank / Alif Pay API
- Dushanbe City API (if exists)
- TojCard / Korti Milli API

## OUTPUT FORMAT

For each service:

```
## [Service Name] ([Country])

- **Developer Portal**: [verified URL]
- **API Status**: Active / Deprecated / Beta / Unavailable / No API Found
- **Base URL**: [URL]
- **Auth**: [method + details]
- **Key Endpoints**: [list top 5-10]
- **Rate Limits**: [details]
- **Sandbox**: Yes / No
- **Official SDK**: [languages]
- **Existing MCP**: [GitHub search results]
- **Webhooks**: [events]
- **Docs Quality**: [1-5] + [language]
- **Est. MCP Build**: S/M/L/XL
- **Notes**: [blockers, requirements, gotchas]
```

## CRITICAL INSTRUCTIONS

1. **Kaspi is #1 priority** — it's a super-app used by 12M+ people. Verify ALL API surfaces (merchant, payment, marketplace, delivery)
2. **Payme and Click** are used by every Uzbek business — verify integration docs thoroughly
3. **Government fiscal APIs** (Webkassa, SolIQ, Factura.uz, ИС ЭСФ) are mandatory — every business needs them
4. **Tunduk** (Kyrgyzstan) is based on X-Road (Estonian e-gov platform) — potentially excellent API
5. Actually visit developer portals, don't guess
6. Search GitHub for existing MCP servers for each service
7. Note language of documentation (Russian, Kazakh, Uzbek, English)
8. Note if API requires legal entity registration
9. Produce final **IMPLEMENTATION PRIORITY MATRIX** at the end
