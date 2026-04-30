# Deep Research: MCP Candidates — Russia (DEEP VERIFICATION)

You are a senior technology market analyst. You have a preliminary inventory of ~350 Russian services that are MCP candidates. Now conduct **deep verification** — actually visit API documentation, verify endpoints are live, check for existing MCP implementations.

## TASK

For each of the following HIGH-priority Russian services, **actually visit their developer portal** and document:

1. API base URL and version
2. Authentication method (with specifics — OAuth2 scopes, API key format, etc.)
3. Key endpoints available (list the main ones)
4. Rate limits
5. Sandbox/test environment availability
6. SDK availability (official + community)
7. Existing MCP servers on GitHub (search: "mcp" + service name, "mcp-server" + service name)
8. Webhook support (events available)
9. Documentation quality (1-5 scale)
10. Estimated hours to build MCP server (S/M/L/XL)

## SERVICES TO VERIFY (by priority)

### Tier 1 — Must verify (market leaders, HIGH automation value)

**E-commerce seller APIs:**
- Wildberries seller API (seller.wildberries.ru)
- Ozon seller API (docs.ozon.ru/api/seller/)
- Yandex Market seller API
- AliExpress seller API (Russian segment)

**Business software:**
- Bitrix24 REST API
- amoCRM API
- 1C:Enterprise (check 1C:EDT, HTTP services, OData)
- Moy Sklad (МойСклад) API
- Megaplan API
- Planfix API

**Payments:**
- YooKassa (YooMoney) API
- CloudPayments API
- Robokassa API
- Tinkoff Acquiring API
- Sberbank Acquiring API
- SBP (Система быстрых платежей) API

**CRM & Marketing:**
- Unisender API
- SendPulse API
- Roistat API
- Calltouch API
- Callibri API
- DashaMail API
- Mindbox API

**Logistics:**
- CDEK API
- Boxberry API
- DPD Russia API
- Pochta Russia API (tracking.pochta.ru)
- Dostavista API

**Advertising:**
- Yandex Direct API
- VK Ads API (previously myTarget)
- Yandex Metrica API

**Cloud & Infrastructure:**
- Yandex Cloud APIs (full ecosystem)
- VK Cloud API
- Selectel API
- DaData API (address/company lookup)
- 2GIS API

**Telecom:**
- Mango Office API
- Zadarma API
- UIS (uiscom) API
- Voximplant API
- Novofon API

**Social:**
- VK API (full scope)
- Telegram Bot API + Telegram Business API
- OK.ru API

**Government & Compliance:**
- Gosuslugi API (ЕСИА)
- nalog.ru API (ФНС)
- Chestny ZNAK API (Честный ЗНАК / маркировка)
- EGAIS (алкоголь) API
- Mercury (Меркурий / ветеринарный контроль) API
- ФГИС МДЛП (лекарства) API
- SBIS API
- Kontur.Diadoc API
- Kontur.Focus API
- Kontur.Extern API

**HR:**
- HeadHunter API (hh.ru)
- SuperJob API
- Huntflow API
- Хабр Карьера API

**Industry:**
- CIAN API
- Avito API
- Yandex Go / Taxi API
- Aviasales API
- Ostrovok API
- iiko API
- Poster POS API
- r_keeper API

### Tier 2 — Verify if time permits

- Evotor API (smart cash registers)
- ATOL Online API (fiscal)
- OFD.ru API
- RetailCRM API
- GetCourse API
- Tilda API
- InSales API
- Ecwid API
- Yclients API
- YCLIENTS / Dikidi / Арника (booking)
- Kaiten API
- YouTrack (JetBrains)
- Pachca API
- Pyrus API

## OUTPUT FORMAT

```
## [Service Name]

- **Developer Portal**: [verified URL]
- **API Status**: Active / Deprecated / Beta / Unavailable
- **Base URL**: [URL]
- **Auth**: [method + details]
- **Key Endpoints**: [list top 10]
- **Rate Limits**: [details]
- **Sandbox**: Yes / No
- **Official SDK**: [languages]
- **Community SDK**: [GitHub links]
- **Existing MCP**: [GitHub search results]
- **Webhooks**: [list events]
- **Docs Quality**: [1-5] + [language: RU only / EN+RU / EN only]
- **Est. MCP Build**: S (8-20h) / M (20-60h) / L (60-150h) / XL (150h+)
- **Notes**: [blockers, gotchas, special requirements]
```

## CRITICAL INSTRUCTIONS

1. **Actually visit** each developer portal — don't rely on training data
2. **Search GitHub** for "mcp-server-[service]" and "[service] mcp" for each service
3. **Note registration requirements** — some APIs need legal entity (ИП/ООО), some need contract
4. **Note sandbox availability** — critical for MCP development
5. **Rate limits matter** — some APIs have very low limits that affect MCP usability
6. **1C is special** — it's not a single API but a platform. Document HTTP services, OData, COM
7. **Government APIs often need certificates** — note EDS/УКЭП requirements
8. Produce a final **IMPLEMENTATION PRIORITY MATRIX** at the end ranking all verified services
