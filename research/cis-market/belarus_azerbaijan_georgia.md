# MCP Server Candidates: Belarus, Azerbaijan, Georgia

> Generated: 2026-04-01
> Purpose: Comprehensive inventory of services suitable for MCP (Model Context Protocol) server implementations
> Methodology: Market analysis across 38 categories per country

---

## Belarus (BY)

### Market Overview

- **Population**: ~9.2 million
- **Internet penetration**: ~85%
- **Dominant payment methods**: ERIP (national payment system), Belkart (national card), Visa/Mastercard (limited since 2022 sanctions)
- **API language**: Russian (docs, responses), some English endpoints
- **Regulatory notes**: Heavy sanctions from EU/US since 2020-2022. SWIFT restrictions on major state banks. Hi-Tech Park (HTP) provides tax benefits for IT companies but many relocated to Lithuania/Poland/Georgia. Crypto legally regulated since 2017 (Decree No. 8). Payment processing increasingly isolated from Western systems.
- **Telegram penetration**: Very high (~70% of internet users), many services have Telegram bots

---

### A. COMMERCE

#### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Onliner.by** | Largest Belarusian tech portal — catalog, classifieds, forum, news | Partial (catalog API, price comparison) | API key | ~5M monthly visitors | **HIGH** | Dominant price aggregator. Telegram bot exists. API undocumented but reverse-engineerable |
| **Deal.by** (ex-Satu.kz) | Marketplace platform (Prom.ua family by EVO) | REST API for merchants | OAuth 2.0 | Tens of thousands of sellers | **HIGH** | Well-documented merchant API. Ukrainian parent company. Sanctions risk for integration |
| **Kufar.by** | #1 classifieds platform (like Avito) | Limited public API | Unknown | ~3M monthly visitors | **HIGH** | Dominant C2C platform. Has Telegram bot. API exists for partners |
| **Wildberries BY** | Russian marketplace operating in Belarus | WB API (supplier portal) | Token | Large cross-border | **MED** | Supplier API well-documented. Sanctions complexity |
| **Ozon BY** | Russian marketplace with Belarus delivery | Ozon Seller API | Token/OAuth | Growing | **MED** | Seller API available |
| **21vek.by** | Major Belarusian electronics/appliances e-shop | No public API | N/A | Top-5 e-commerce | **LOW** | No known API; scraping only |
| **Lamoda BY** | Fashion marketplace (Russian origin) | Merchant API | Token | Significant | **LOW** | Limited to merchant operations |

#### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **E-dostavka.by** (Euroopt) | Largest grocery chain's delivery arm | No public API | N/A | Market leader | **LOW** | Telegram bot exists. No developer API |
| **Bonfesto / Sosedi delivery** | Grocery chain delivery | No public API | N/A | Regional | **LOW** | No API |
| **Yandex Lavka BY** | Quick grocery delivery | Yandex API ecosystem | OAuth | Growing | **MED** | Via Yandex APIs if available in BY |

#### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Eda BY** | Food delivery (Yandex ecosystem) | Restaurant partner API | OAuth/Token | Dominant | **MED** | Partner API for restaurants |
| **Menu.by** | Local food delivery aggregator | No public API | N/A | Moderate | **LOW** | Telegram bot available |
| **Raketa** | Food/grocery delivery app | No public API | N/A | Growing | **LOW** | Ukrainian origin, operates in Minsk |

#### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **iiko BY** | Restaurant management system | REST API | Token | Widespread in HoReCa | **HIGH** | Well-documented API. Reservation, menu, orders |
| **Poster POS** | Cloud POS for restaurants/retail | REST API | Token | Growing | **MED** | Ukrainian origin. Good API docs |
| **R-Keeper BY** | POS system for restaurants | XML API / REST | Token | Legacy market leader | **MED** | Older API but widely deployed |

---

### B. FINANCE

#### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Belarusbank** | Largest state bank | Limited API (ERIP integration) | Certificate-based | 6M+ clients | **HIGH** | ERIP API for payments. Internet banking API limited. Sanctions on Western operations |
| **BelVEB (VEB.RF subsidiary)** | Development bank | Corporate API (limited) | Certificate | Major corporate bank | **MED** | Under heavy sanctions. API for corporate clients only |
| **Priorbank (Raiffeisen)** | Commercial bank | Open Banking API (PSD2-inspired) | OAuth 2.0 | Top-5 bank | **HIGH** | Most Western-oriented API. Raiffeisen divesting but still operational |
| **Alfa-Bank BY** | Commercial bank | Business API | Token/Certificate | Significant | **MED** | API for business accounts, payments |
| **MTBank** | Commercial bank | Developer API portal | OAuth 2.0 | Growing digital bank | **HIGH** | Most developer-friendly. QR payments, merchant API |
| **BPS-Sberbank** | Sberbank subsidiary | Limited API | Certificate | Major bank | **MED** | Sanctions impact |
| **Belinvestbank** | State-owned bank | ERIP API | Certificate | Large | **LOW** | Minimal public API |

#### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **bePaid** | Payment gateway (HTP resident) | REST API | Token/Signature | Major gateway | **HIGH** | Well-documented. Card payments, ERIP, recurring. Good API docs |
| **WebPay** | Payment processing | REST API | Token | Established | **MED** | Card payments, ERIP integration |
| **ERIP (AIS Raschet)** | National payment system — utilities, services, fines | API for service providers | Certificate | Universal in Belarus | **HIGH** | Every Belarusian uses ERIP. Integration API available for service providers |
| **Bepay** | Mobile payments | REST API | Token | Growing | **LOW** | Smaller player |
| **Assist BY** | Payment gateway | REST API | Token/Signature | Moderate | **MED** | Russian origin gateway |

#### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Oplati** | QR payment app by Belarusbank | No public API | N/A | Growing | **MED** | National QR payment. No developer API yet |
| **Sber Pay BY** | Mobile payments | No public API | N/A | Limited | **LOW** | Sberbank ecosystem |

#### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Currency.com** | Crypto exchange (HTP resident) | REST + WebSocket API | API key + HMAC | Significant (global) | **HIGH** | Well-documented trading API. Legally regulated in Belarus |
| **FREE2EX** | Crypto exchange (HTP) | REST API | API key | Smaller | **LOW** | Limited volume |
| **Finstore.by** | Crowdfunding/tokenization platform | No public API | N/A | Niche | **LOW** | Token-based investments |

#### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Belgosstrakh** | State insurance monopoly (mandatory insurance) | No public API | N/A | Market leader | **LOW** | No developer API. Telegram bot for OSAGO |
| **BASK** | Insurance marketplace | No public API | N/A | Aggregator | **LOW** | No API known |
| **Promtransbank Insurance** | Various insurance products | No public API | N/A | Minor | **LOW** | No API |

---

### C. LOGISTICS

#### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Evropochta** | #1 private courier/postal in Belarus | REST API | Token | Market leader | **HIGH** | Tracking, shipment creation API. Well-documented |
| **CDEK BY** | Russian courier service operating in Belarus | REST API v2 | Token | Major cross-border | **HIGH** | Well-documented API. Shipment, tracking, pricing |
| **Boxberry BY** | Pickup point network | REST API | Token | Growing | **MED** | Order/tracking API |

#### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Belpochta** | National postal service | Tracking API (limited) | Unknown | Universal | **MED** | Basic tracking. Modernizing slowly |

#### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Lardi-Trans** | CIS freight exchange | REST API | Token | Major platform | **MED** | Cargo search, route planning |
| **ATI.su** | Freight exchange (Russia-based, used in BY) | REST API | Token | Dominant in CIS freight | **HIGH** | Well-documented. Load board, carrier search |

#### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No significant local players with APIs | — | — | — | — | — | Fulfillment handled by courier services above |

---

### D. BUSINESS SaaS

#### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bitrix24 BY** | Dominant CRM/collaboration in CIS | REST API | OAuth 2.0 | Very widespread | **HIGH** | Extremely well-documented API. Already has unofficial MCP but Belarus-specific integrations (ERIP, local services) missing |
| **amoCRM** | Sales CRM | REST API | OAuth 2.0 | Popular | **HIGH** | Good API. Widely used in Belarus SMBs |
| **1C:CRM** | CRM module of 1C ecosystem | OData/COM API | Certificate | Legacy dominant | **MED** | Complex integration |

#### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Enterprise BY** | Dominant ERP/accounting in Belarus | OData REST, COM API | Certificate/Token | ~90% of businesses | **HIGH** | Critical for Belarus business automation. Complex but essential |
| **Galaktika ERP** | Enterprise ERP | SOAP/REST API | Certificate | Large enterprises | **LOW** | Legacy, limited API |

#### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Accounting BY** | Accounting (localized for Belarus tax law) | OData API | Certificate | Dominant | **HIGH** | Same as 1C:Enterprise — localized tax calculations, reporting |
| **Налоговая (nalog.gov.by)** | Tax authority portal | e-Declaration API (XML) | EDS (digital signature) | All businesses | **MED** | Electronic declaration submission. Certificate-based auth |

#### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **СККО (fiscal devices)** | Belarus fiscal cash register system | Device API | Serial/USB | All retail | **MED** | Government-mandated fiscal device integration |
| **Webkassa-like systems** | Online fiscalization | Unknown | Unknown | Emerging | **LOW** | Belarus transitioning to online fiscal |

#### 18. EDI / EDM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **EDI-Provider BY** | Electronic data interchange | SOAP/REST API | Certificate/EDS | B2B mandatory | **MED** | E-invoicing for businesses |
| **1C:EDO** | Document exchange within 1C ecosystem | OData API | Certificate | Widespread | **MED** | Integrated with 1C accounting |

#### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Rabota.by** | #1 job portal in Belarus | Employer API | Token | Market leader | **HIGH** | Vacancy posting, resume search API |
| **Belmeta.com** | Job aggregator | No public API | N/A | Aggregator | **LOW** | No API |
| **HH.by (HeadHunter)** | Job portal (HeadHunter subsidiary) | REST API | OAuth 2.0 | Significant | **HIGH** | Well-documented HH API works for Belarus |

#### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No local players | Global tools (Jira, Trello, Bitrix24) dominate | — | — | — | — | Bitrix24 covers PM needs locally |

---

### E. MARKETING

#### 21. SMS / Push

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **A1 SMS API** | A1 Belarus (Telekom Austria) SMS gateway | REST API | Token | Major MNO | **HIGH** | SMS sending, delivery status API |
| **MTC BY SMS** | MTS Belarus SMS services | SMPP/HTTP API | Login/Token | Major MNO | **MED** | SMPP and HTTP API for bulk SMS |
| **life:) SMS** | Turkcell-owned MNO | HTTP API | Token | Third MNO | **MED** | Bulk SMS API |
| **BSG.world** | International SMS gateway (BY-based) | REST API | Token | B2B focused | **MED** | Multi-channel: SMS, Viber, WhatsApp |

#### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No major local players | Businesses use global platforms (Unisender, SendPulse, MailChimp) | — | — | — | — | Unisender (Russian/CIS) most popular |

#### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Direct BY** | Dominant search/display ads | REST API | OAuth 2.0 | Dominant | **HIGH** | Full campaign management API |
| **Onliner Ads** | Native advertising on Onliner.by | No public API | N/A | Premium inventory | **LOW** | Manual placement only |
| **TUT.by Ads** (legacy) | Was major portal, now restricted | No API | N/A | Declining | **LOW** | Zerkalo.io replacement, no API |

#### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **VKontakte** | Dominant social network | REST API | OAuth 2.0 | Very high usage | **HIGH** | Well-documented. VK is #1 social in BY |
| **OK (Odnoklassniki)** | Social network (older demographic) | REST API | OAuth 2.0 | Significant | **MED** | API available |
| **Telegram** | Dominant messenger | Bot API | Bot Token | ~70% penetration | **HIGH** | Critical channel for Belarus |

#### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Metrika** | Web analytics (dominant in CIS) | REST API | OAuth 2.0 | Dominant | **HIGH** | Full reporting API |
| No local BI platforms | Global tools used (Power BI, Tableau) | — | — | — | — | — |

---

### F. INFRASTRUCTURE

#### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Hoster.by** | Major Belarusian hosting/registrar | REST API (domain, DNS) | Token | Market leader | **MED** | Domain management API |
| **Active.by** | Hosting provider | Limited API | Token | Established | **LOW** | Basic hosting |
| **beCloud** | National cloud infrastructure (state) | IaaS API | Certificate | Government cloud | **MED** | OpenStack-based, government projects |

#### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **A1 Belarus** | MNO — API for SMS, USSD, billing | REST/SMPP | Token | Major MNO | **MED** | See SMS section |
| **MTS Belarus** | MNO | SMPP/HTTP | Token | Major MNO | **MED** | Telecom API |
| **Mango Office BY** | Virtual PBX / cloud telephony | REST API | Token | B2B telephony | **HIGH** | Call tracking, IVR, recording API |

#### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Maps BY** | Dominant mapping service | JavaScript + HTTP API | API key | Dominant | **HIGH** | Geocoding, routing, static maps |
| **2GIS Minsk** | City directory + maps | REST API | API key | Urban areas | **MED** | Business directory + navigation API |

---

### G. GOVERNMENT

#### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **e-pasluga.by** | National e-gov portal | No public API (SOAP for gov agencies) | EDS certificate | All citizens | **MED** | Internal SMEV-like system. No public developer API |
| **Portal.nalog.gov.by** | Tax portal | e-Declaration XML API | EDS | All businesses | **MED** | Tax filing, reports |

#### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Marking system (Belarus)** | Product marking (integrated with EAEU/Russian system) | API for manufacturers | Certificate/EDS | Mandatory for certain goods | **MED** | Aligned with Russian "Honest Mark" system |

---

### H. VERTICALS

#### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Realt.by** | #1 real estate portal | No public API (scraping common) | N/A | Market leader | **MED** | Very popular. No API. Telegram bot exists |
| **Hata.by** | Real estate portal | No public API | N/A | #2 player | **LOW** | No API |
| **Onliner Real Estate** | Real estate section of Onliner | Part of Onliner catalog API | API key | Significant | **MED** | Integrated with Onliner ecosystem |

#### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **IT-Academy.by** | Largest IT education platform (HTP) | No public API | N/A | Market leader | **LOW** | No API |
| **Coursera/Stepik** | Global platforms used locally | Existing APIs | — | Used by students | **LOW** | Global MCP servers likely exist |

#### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Talon.by** | Doctor appointment booking | No public API | N/A | Widely used | **MED** | Popular service but no developer API |
| **103.by** | Medical portal — doctors, clinics, appointments | No public API | N/A | Major medical portal | **MED** | Telegram bot exists. No API |

#### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Go BY** | Dominant ride-hailing + delivery | Partner API | OAuth | Dominant | **HIGH** | Delivery API for business. Driver API |
| **Maxim** | Ride-hailing | No public API | N/A | #2 player | **LOW** | No developer API |
| **Минсктранс** | Public transport (Minsk) | GTFS feed / API | Open | All Minsk commuters | **MED** | GTFS data, real-time arrivals |

#### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Belavia** | National airline | No public API (GDS only) | N/A | National carrier | **LOW** | No developer API. Under sanctions |
| **Holiday.by** | Travel agency aggregator | No public API | N/A | Major aggregator | **LOW** | No API |
| **Railroad (rw.by)** | Belarus Railways | Limited (schedule API) | Open | Universal | **MED** | Schedule lookup, sometimes ticket API |

#### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **ilex.by (Бизнес-инфо)** | Legal database (legislation, court decisions) | No public API | Subscription | B2B legal market | **LOW** | No developer API |

#### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No significant local platforms with APIs | Agriculture largely state-managed | — | — | — | — | Belarus agriculture is 80%+ state-owned |

#### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Realt.by / Onliner construction** | Building materials, new developments | No public API | N/A | Covered by real estate portals | **LOW** | No specific construction-tech APIs |

---

## Azerbaijan (AZ)

### Market Overview

- **Population**: ~10.2 million
- **Internet penetration**: ~85%
- **Dominant payment methods**: Bank cards (Visa/Mastercard), cash still significant, growing mobile payments (m10, ASAN Pay)
- **API language**: Azerbaijani (primary), Russian (common), English (growing in fintech)
- **Regulatory notes**: Central Bank actively pushing digital banking. ASAN system is world-recognized e-gov platform. Oil economy transitioning to digital. No major sanctions. Crypto is largely unregulated (gray area). Strong government push for cashless society.
- **Telegram penetration**: High (~60%), WhatsApp also very popular

---

### A. COMMERCE

#### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Tap.az** | #1 classifieds (like OLX/Avito) | No public API | N/A | ~2M monthly visitors | **MED** | Most popular classifieds. No developer API. Telegram bot exists |
| **Turbo.az** | #1 auto classifieds | No public API | N/A | Dominant for cars | **MED** | Very popular. No API. Telegram notifications exist |
| **Birja.az** | General classifieds | No public API | N/A | Secondary player | **LOW** | No API |
| **Umico.az** | E-commerce marketplace (Pasha Holding) | No public API | N/A | Growing fast | **MED** | Backed by PASHA Group. No public API yet |
| **Wildberries AZ** | Russian marketplace | WB Supplier API | Token | Cross-border growing | **LOW** | Supplier API only |

#### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Wolt AZ** | Food + grocery delivery (DoorDash-owned) | Wolt Merchant API | Token | Market leader | **HIGH** | Merchant integration API. Restaurant management |
| **Bravo / Araz delivery** | Grocery chain delivery | No public API | N/A | Growing | **LOW** | No developer API |
| **Bazar Store** | Online grocery | No public API | N/A | Emerging | **LOW** | No API |

#### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Wolt AZ** | Food delivery (see above) | Merchant API | Token | Dominant | **HIGH** | See grocery section |
| **Bolt Food AZ** | Food delivery arm of Bolt | Bolt Business API | OAuth | Growing | **MED** | Bolt Business API for corporate accounts |
| **Hungry.az** | Local food delivery | No public API | N/A | Smaller | **LOW** | No API |

#### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **iiko AZ** | Restaurant management | REST API | Token | Growing HoReCa | **HIGH** | Same well-documented API as CIS version |
| **Poster POS** | Cloud POS | REST API | Token | SMB restaurants | **MED** | See Belarus section |
| **Smartup** | ERP for distribution/retail | REST API | Token | Growing in AZ | **MED** | Uzbek origin, expanding in Azerbaijan |

---

### B. FINANCE

#### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kapital Bank** | Largest retail bank | Open Banking API | OAuth 2.0 | #1 by retail clients | **HIGH** | Developer portal. PSD2-inspired Open API. BirKart ecosystem |
| **PASHA Bank** | Major corporate/investment bank | Business API | OAuth/Certificate | Top-3 bank | **HIGH** | Digital banking leader. API for corporate services |
| **ABB (International Bank of Azerbaijan)** | Largest bank by assets (state) | Limited API | Certificate | #1 by assets | **MED** | Modernizing. Some API for corporate clients |
| **AccessBank** | Microfinance/SMB bank (EBRD-backed) | No public API | N/A | SMB market | **LOW** | No developer API |
| **Yelo Bank** | Digital-first bank | Mobile API | Token | Growing digital | **MED** | Modern stack but limited public API |
| **Bank Respublika** | Commercial bank | Business API (limited) | Certificate | Established | **LOW** | Limited API |
| **Rabitabank** | Commercial bank | No public API | N/A | Mid-tier | **LOW** | No API |
| **LeoBank (AFB Bank rebranded)** | Digital bank | Unknown — requires verification | Unknown | New entrant | **LOW** | Rebranding, API status unclear |

#### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Goldenpay** | Leading payment gateway | REST API | Token/Signature | Market leader | **HIGH** | Card payments, recurring, refunds API. Well-documented |
| **EPoint** | Payment gateway + loyalty | REST API | Token | Significant | **HIGH** | Payment processing + cashback system API |
| **AzeriCard** | National card processing center | Gateway API | Certificate | All bank cards | **MED** | Infrastructure-level. API for merchants |
| **Hesab.az** | Payment platform | REST API | Token | Growing | **MED** | Bill payments, merchant API |

#### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **m10** | Leading mobile wallet (PASHA ecosystem) | REST API | Token/OAuth | 1M+ users, fast growing | **HIGH** | P2P transfers, merchant payments. API for businesses. Telegram integration |
| **ASAN Pay** | Government-backed mobile payments | Unknown — requires verification | Unknown | Growing (gov push) | **MED** | Integrated with ASAN ecosystem. API status unclear |
| **BirPay (Kapital Bank)** | Bank wallet / QR payments | Part of Kapital Bank API | OAuth | Kapital Bank users | **MED** | Integrated with BirKart |

#### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No licensed local crypto exchanges** | Crypto unregulated, people use Binance/Bybit | — | — | Gray market | — | No local platforms with APIs. International exchanges used |

#### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **AXA MBASK** | Largest insurer | No public API | N/A | Market leader | **LOW** | No developer API |
| **PASHA Insurance** | Major insurer (PASHA Group) | No public API | N/A | Top-3 | **LOW** | No API |
| **Ateshgah Insurance** | Online-focused insurer | Partial (quotes API) | Unknown | Growing online | **LOW** | Basic integration only |

---

### C. LOGISTICS

#### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Azerpost Express** | National post express delivery | Limited tracking API | Unknown | State service | **LOW** | Modernizing but limited API |
| **Baku Courier** | Local courier service | No public API | N/A | Local | **LOW** | No API |
| **Aramex AZ** | International courier | Aramex global API | Token | Cross-border | **MED** | Global API works for AZ |

#### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Azərpoçt** | National postal service | Tracking API (basic) | Open | Universal | **LOW** | Basic tracking only |

#### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Baku International Sea Trade Port (BISTP)** | Trans-Caspian logistics hub | Port management system | Certificate | Major infrastructure | **LOW** | B2B integration, not public API |
| **Middle Corridor platforms** | Trans-Caspian freight platforms | Unknown — requires verification | Unknown | Growing strategic importance | **LOW** | Geopolitical significance but limited APIs |

#### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No significant local platforms with APIs | — | — | — | — | — | Market underdeveloped for API-driven fulfillment |

---

### D. BUSINESS SaaS

#### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bitrix24** | Dominant CRM in Azerbaijan | REST API | OAuth 2.0 | Widespread | **HIGH** | Same API as global. AZ-specific integrations needed |
| **amoCRM** | Sales CRM | REST API | OAuth 2.0 | Popular with SMBs | **HIGH** | Well-documented |

#### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Enterprise AZ** | Popular ERP (localized) | OData REST API | Certificate | Many businesses | **HIGH** | Localized for AZ tax/accounting |
| **SAP Business One** | Enterprise ERP | REST/OData API | OAuth | Large enterprises | **MED** | Used by oil/gas sector |
| **Smartup** | Distribution ERP | REST API | Token | Growing | **MED** | Popular in FMCG distribution |

#### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **e-taxes.gov.az** | Online tax system | XML/SOAP API for submissions | EDS certificate | All taxpayers | **HIGH** | Tax declaration, e-invoice. API for tax agents |
| **1C:Accounting AZ** | Localized accounting | OData API | Certificate | Widespread | **MED** | AZ tax law compliance |

#### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **E-Qaimə (e-invoice)** | Government e-invoicing system | REST/SOAP API | EDS certificate | Mandatory for B2B | **HIGH** | All businesses must use e-invoicing. API available |
| **NKA (New Cash Registers)** | Online fiscal devices | Device + cloud API | Certificate | All retail | **MED** | Government-mandated online fiscalization |

#### 18. EDI / EDM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **E-Qaimə** | Covers EDI for invoices (see above) | See fiscal section | EDS | Mandatory | **HIGH** | Unified with fiscal system |

#### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Boss.az** | #1 job portal | No public API | N/A | Market leader | **MED** | Very popular but no developer API |
| **Jobsearch.az** | Job portal | No public API | N/A | Secondary | **LOW** | No API |
| **HelloJobs.az** | Job portal | No public API | N/A | Growing | **LOW** | No API |
| **LinkedIn** | Professional network used heavily | LinkedIn API | OAuth 2.0 | Professional market | **MED** | Global API. Popular in AZ business |

#### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No local players | Global tools dominate (Jira, Bitrix24, Monday) | — | — | — | — | — |

---

### E. MARKETING

#### 21. SMS / Push

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Azercell SMS API** | Largest MNO (Azerconnect) | HTTP/SMPP API | Login/Token | 5M+ subscribers | **HIGH** | Bulk SMS, A2P messaging |
| **Bakcell SMS** | Second MNO | SMPP/HTTP API | Token | 3M+ subscribers | **MED** | Bulk SMS gateway |
| **Nar (Azerfon)** | Third MNO | HTTP API | Token | 2M+ subscribers | **MED** | SMS gateway |

#### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No local players | Global tools (Mailchimp, SendPulse, Unisender) used | — | — | — | — | — |

#### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Google Ads** | Dominant search ads | REST API | OAuth 2.0 | Dominant | **HIGH** | Global API |
| **Facebook/Meta Ads** | Social advertising | Marketing API | OAuth 2.0 | Significant | **HIGH** | Global API |
| **Yandex Direct** | Used by some businesses | REST API | OAuth | Minor share | **LOW** | Less relevant in AZ than BY |

#### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Instagram** | #1 social platform in AZ | Graph API | OAuth 2.0 | Dominant | **HIGH** | Primary social commerce channel |
| **WhatsApp Business** | Primary messenger | WhatsApp Business API | Token | ~80% penetration | **HIGH** | Critical communication channel |
| **Telegram** | Growing messenger | Bot API | Bot Token | ~60% penetration | **HIGH** | Growing fast |
| **TikTok** | Video platform | TikTok for Business API | OAuth | Fast growing | **MED** | Young demographic |

#### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Google Analytics** | Dominant web analytics | Reporting API | OAuth 2.0 | Dominant | **HIGH** | Global API |
| No local BI platforms | — | — | — | — | — | — |

---

### F. INFRASTRUCTURE

#### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **AzInTelecom** | State-owned data center / cloud | IaaS API | Certificate | Government cloud | **MED** | Gov cloud infrastructure. Limited public API |
| **Delta Telecom** | Largest ISP + hosting | Basic hosting API | Token | Major ISP | **LOW** | Limited API |

#### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Azercell (Azerconnect)** | Largest MNO | Developer API portal | Token | 5M+ subscribers | **HIGH** | SMS, USSD, number verification |
| **Bakcell** | Second MNO | API available | Token | 3M+ subscribers | **MED** | SMS, telecom services |

#### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Google Maps** | Dominant mapping | Maps API | API key | Dominant | **HIGH** | Global API. AZ coverage good |
| **Waze** | Navigation (Google-owned) | No public API | N/A | Popular | **LOW** | No API |

---

### G. GOVERNMENT

#### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **ASAN Xidmət (asan.gov.az)** | World-class e-gov one-stop-shop | Internal ASAN API | ASAN Login (SSO) | All citizens | **HIGH** | Award-winning e-gov. ASAN Login is national identity. API for gov agencies, limited public |
| **myGov.az** | E-government portal | SOAP/REST for agencies | ASAN Login | All citizens | **HIGH** | Unified gov services. API through ASAN ecosystem |
| **e-Court** | Electronic court system | No public API | ASAN Login | Legal system | **LOW** | No developer API |

#### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No mandatory marking system yet** | Planned but not fully implemented | — | — | — | — | Azerbaijan studying Russian/EU marking systems |

---

### H. VERTICALS

#### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Tap.az (real estate section)** | Real estate classifieds | No public API | N/A | Major listings | **MED** | Part of Tap.az platform |
| **Bina.az** | #1 dedicated real estate portal | No public API | N/A | Market leader for RE | **MED** | Very popular. No API. Telegram bot exists |
| **Emlak.az** | Real estate portal | No public API | N/A | Secondary | **LOW** | No API |

#### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Celt.az** | Language school chain | No public API | N/A | Largest language school | **LOW** | No API |
| **Coursera / Udemy** | Global platforms | Existing APIs | — | Growing | **LOW** | Global MCP servers likely exist |
| **Mektebim** | School management | Unknown — requires verification | Unknown | Growing | **LOW** | Status unclear |

#### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **TABIB** | State health authority (electronic health system) | Internal API | ASAN Login | All citizens | **MED** | COVID pushed digitalization. API for health providers |
| **Sağlam.az** | Private clinic booking | No public API | N/A | Growing | **LOW** | No API |

#### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bolt AZ** | #1 ride-hailing | Bolt Business API | OAuth/Token | Dominant | **HIGH** | Corporate ride API. Very widely used |
| **Uklon AZ** | Ride-hailing (Ukrainian origin) | Business API | Token | Secondary | **MED** | Business API available |
| **BakuBus** | Public bus transport | GTFS feed | Open | Public transport | **MED** | GTFS data available for some routes |
| **Baku Metro** | Metro system | No public API | N/A | Urban transport | **LOW** | No API |

#### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **AZAL (Azerbaijan Airlines)** | National airline | GDS API (Amadeus/Sabre) | Certificate | National carrier | **MED** | Through GDS systems. No direct public API |
| **Touristica.az** | Travel agency platform | No public API | N/A | Travel bookings | **LOW** | No API |
| **Booking.com AZ** | Hotel booking | Booking.com API | Token | Dominant for hotels | **MED** | Global API with AZ listings |

#### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No significant local LegalTech players | Market underdeveloped | — | — | — | — | Legal services still primarily offline |

#### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **AKIA (Azerbaijan Agency for Agricultural Credits)** | Agricultural finance platform | No public API | N/A | State agency | **LOW** | No developer API |
| No commercial AgriTech platforms with APIs | Agriculture digitalizing slowly | — | — | — | — | Emerging market |

#### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No significant local platforms with APIs | Construction tech underdeveloped | — | — | — | — | Major construction projects use international tools |

---

## Georgia (GE)

### Market Overview

- **Population**: ~3.7 million
- **Internet penetration**: ~80%
- **Dominant payment methods**: Bank cards (Visa/Mastercard), Apple Pay/Google Pay widely adopted, cash declining fast in Tbilisi
- **API language**: Georgian (primary), English (common in tech), Russian (secondary)
- **Regulatory notes**: Very business-friendly environment. EU candidate country pushing regulatory alignment. National Bank progressive on fintech. Crypto taxed as regular income. Many CIS tech companies relocated here (2022 wave). Digital nomad/startup hub. Open Banking regulations advancing.
- **Telegram penetration**: Very high (~75%), especially after 2022 Russian emigration wave

---

### A. COMMERCE

#### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **MyAuto.ge** | #1 auto/general classifieds | REST API (partial) | Token | Dominant classifieds | **HIGH** | Auto, real estate, jobs. Some API endpoints available |
| **SS.ge** | #1 real estate + general classifieds | No public API | N/A | Major classifieds | **MED** | Very popular. No API |
| **Extra.ge** | E-commerce marketplace | No public API | N/A | Growing e-commerce | **MED** | Amazon-like marketplace. No API yet |
| **Vendoo.ge** | Online marketplace | No public API | N/A | Smaller | **LOW** | No API |
| **Wildberries GE** | Russian marketplace | WB Supplier API | Token | Cross-border growing | **LOW** | Supplier API only |

#### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Glovo GE** | #1 food + grocery delivery | Glovo Business API | OAuth/Token | Dominant delivery | **HIGH** | Merchant API, corporate accounts. Very widely used |
| **Wolt GE** | Food delivery | Wolt Merchant API | Token | Growing | **HIGH** | Strong competitor to Glovo |
| **Spar/Carrefour delivery** | Grocery chain delivery | No public API | N/A | Growing | **LOW** | No API |

#### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Glovo GE** | Food delivery (see above) | Merchant API | Token | Dominant | **HIGH** | See grocery section |
| **Wolt GE** | Food delivery | Merchant API | Token | #2 player | **HIGH** | See grocery section |
| **Pulse (by Magti)** | Food + services delivery | No public API | N/A | Smaller | **LOW** | No API |

#### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **iiko GE** | Restaurant management | REST API | Token | Growing HoReCa | **HIGH** | Well-documented API. Popular in Tbilisi restaurants |
| **Poster POS** | Cloud POS | REST API | Token | SMB restaurants | **MED** | Popular among new restaurants |
| **SquarePOS/Lightspeed** | International POS | REST API | OAuth | Expat businesses | **LOW** | Used by international-oriented businesses |

---

### B. FINANCE

#### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **TBC Bank** | Largest bank, digital leader | Open Banking API | OAuth 2.0 | #1 bank (~40% market) | **HIGH** | Excellent developer portal. Open API. TBC ecosystem (Space neobank). Most innovative |
| **Bank of Georgia (BOG)** | Second largest bank | Open Banking API | OAuth 2.0 | #2 bank (~35% market) | **HIGH** | Developer portal. Open API. BOG ecosystem (mBank, iPay) |
| **Liberty Bank** | Third bank (state partial) | Limited API | Token | #3 bank | **MED** | Basic API, modernizing |
| **Credo Bank** | Microfinance bank | No public API | N/A | SMB/rural market | **LOW** | No developer API |
| **Basis Bank** | Commercial bank | Limited API | Certificate | Small market share | **LOW** | Limited API |
| **Terabank** | Commercial bank | No public API | N/A | Small | **LOW** | No API |

#### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **iPay (Bank of Georgia)** | Dominant payment gateway | REST API | Token/Signature | Market leader | **HIGH** | Card payments, recurring, Apple Pay. Excellent API docs |
| **TBC Pay** | TBC's payment gateway | REST API | Token/Signature | Major gateway | **HIGH** | Integrated with TBC ecosystem. Good docs |
| **Georgian Card** | Card processing center | Gateway API | Certificate | Infrastructure | **MED** | Backend processing for many banks |
| **Payze** | Modern payment gateway (startup) | REST API | Token | Growing | **HIGH** | Developer-friendly. Modern API. Checkout, subscriptions |
| **Optio.ai** | Payment orchestration | REST API | Token | Emerging | **MED** | Multi-provider payment routing |

#### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **TBC Space** | Neobank / digital wallet | TBC API | OAuth 2.0 | 500K+ users | **HIGH** | Part of TBC ecosystem. P2P, payments, investments |
| **BOG Pay** | Bank of Georgia wallet | BOG API | OAuth 2.0 | BOG customers | **HIGH** | Integrated with BOG Open API |
| **Liberty Pay** | Liberty Bank app | Limited API | Token | Growing | **LOW** | Basic mobile banking |

#### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **CityPay.io** | Crypto payment gateway (GE-based) | REST API | Token | Niche | **MED** | Crypto-to-fiat for merchants |
| **BitGeo** | Local crypto exchange | Unknown — requires verification | Unknown | Small | **LOW** | Status unclear |
| **Binance/Bybit** | International exchanges used locally | Existing APIs | — | Significant p2p volume | **LOW** | Global MCP servers exist |

#### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Aldagi (TBC Insurance)** | Largest insurer | No public API | N/A | Market leader | **LOW** | No developer API. Part of TBC Group |
| **GPI Holding** | Major insurer (BOG Group) | No public API | N/A | #2 insurer | **LOW** | No developer API |
| **Unison** | Insurance marketplace | REST API (basic) | Token | Aggregator | **MED** | Some API for insurance comparison |

---

### C. LOGISTICS

#### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Glovo Express** | Same-day delivery from Glovo | Glovo Business API | Token | Dominant last-mile | **HIGH** | Delivery API for businesses |
| **Extra.ge delivery** | E-commerce delivery | No public API | N/A | Tied to Extra.ge | **LOW** | No separate API |
| **CDEK GE** | Russian courier (relocated many staff) | REST API v2 | Token | Growing cross-border | **MED** | Well-documented API. CIS shipments |

#### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Georgian Post (Sakartvelos Posta)** | National postal service | Tracking API (basic) | Open | Universal | **LOW** | Basic tracking only |
| **USA2Georgia / OnTrak** | US/EU package forwarding | Tracking API | Token | Very popular for imports | **MED** | Widely used. Basic tracking API |

#### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Trans.ge** | Georgian freight exchange | No public API | N/A | Local freight | **LOW** | No API |
| **Anaklia Port (planned)** | Deep-water port project | N/A — future | N/A | Strategic | **LOW** | Not yet operational |

#### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No significant local platforms with APIs | Market underdeveloped | — | — | — | — | — |

---

### D. BUSINESS SaaS

#### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bitrix24** | Popular CRM (Russian-speaking businesses) | REST API | OAuth 2.0 | Significant | **HIGH** | Very popular after 2022 relocation wave |
| **amoCRM** | Sales CRM | REST API | OAuth 2.0 | Growing | **MED** | CIS-originated businesses |
| **HubSpot** | CRM (Western-oriented businesses) | REST API | OAuth 2.0 | Growing | **MED** | Popular among international startups in GE |

#### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Oris** | Popular Georgian ERP | Limited API | Certificate | Dominant local ERP | **HIGH** | Local market leader. Integration API. Georgian tax compliance |
| **1C:Enterprise GE** | 1C localized for Georgia | OData REST | Certificate | Russian-speaking businesses | **MED** | Less dominant than in BY/AZ |
| **SAP Business One** | Enterprise ERP | REST/OData | OAuth | Large companies | **LOW** | International companies in GE |

#### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **rs.ge (Revenue Service)** | Tax authority portal — declarations, VAT, e-invoices | REST API / SOAP | Certificate/EDS | All taxpayers | **HIGH** | Critical system. API for tax agents and businesses. E-invoice (e-sabuTi) |
| **Oris Accounting** | Localized accounting | API | Certificate | Dominant | **HIGH** | Georgian chart of accounts, tax reporting |

#### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **RS.ge e-Invoice (e-sabuTi)** | Mandatory electronic invoicing | REST/SOAP API | EDS certificate | Mandatory for B2B | **HIGH** | All businesses must use. Good API documentation |
| **Cash register systems** | Online fiscal cash registers | Device API | Certificate | All retail | **MED** | Government-mandated |

#### 18. EDI / EDM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **rs.ge e-Waybill** | Electronic waybill system | REST API | EDS certificate | Mandatory for transport | **HIGH** | All goods transport requires e-waybill. API documented |
| **rs.ge e-Invoice** | See fiscal section | See above | EDS | Mandatory | **HIGH** | Unified with fiscal |

#### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Jobs.ge** | #1 job portal in Georgia | No public API | N/A | Market leader | **MED** | Most popular. No API. Very dated UI |
| **HR.ge** | Job portal | No public API | N/A | Secondary | **LOW** | No API |
| **MyAuto.ge Jobs** | Job section of MyAuto | Part of MyAuto API | Token | Growing | **LOW** | Integrated with MyAuto ecosystem |
| **LinkedIn** | Professional network | LinkedIn API | OAuth 2.0 | Growing among professionals | **MED** | Popular in international Tbilisi scene |

#### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No local players | Global tools dominate. Georgian startups use Notion, Linear, Jira | — | — | — | — | — |

---

### E. MARKETING

#### 21. SMS / Push

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Magticom SMS** | Largest MNO SMS gateway | HTTP/SMPP API | Token | 2M+ subscribers | **HIGH** | A2P messaging, bulk SMS |
| **Silknet/Beeline GE** | Second MNO | SMPP/HTTP API | Token | Major MNO | **MED** | SMS gateway |
| **Geocell (Silknet)** | MNO brand | Same as Silknet | Token | Merged with Silknet | **MED** | See Silknet |
| **SendSMS.ge** | Local SMS aggregator | REST API | Token | B2B SMS | **MED** | Multi-operator SMS gateway |

#### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| No local players | Global platforms used (Mailchimp, SendPulse) | — | — | — | — | — |

#### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Google Ads** | Dominant search/display | REST API | OAuth 2.0 | Dominant | **HIGH** | Global API |
| **Facebook/Meta Ads** | Social advertising | Marketing API | OAuth 2.0 | Major channel | **HIGH** | Global API |
| **MyAuto.ge Ads** | Banner/classified ads | Part of MyAuto | Token | Local inventory | **LOW** | Platform-specific |

#### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Facebook** | #1 social network in Georgia | Graph API | OAuth 2.0 | Dominant | **HIGH** | Georgians are heavy Facebook users |
| **Instagram** | Visual social | Graph API | OAuth 2.0 | Very popular | **HIGH** | Social commerce growing |
| **Telegram** | #1 messenger (post-2022 surge) | Bot API | Bot Token | ~75% penetration | **HIGH** | Critical channel. Many bots |
| **TikTok** | Video platform | TikTok API | OAuth | Fast growing | **MED** | Young demographic |

#### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Google Analytics** | Dominant | Reporting API | OAuth 2.0 | Universal | **HIGH** | Global API |
| No local BI platforms | — | — | — | — | — | — |

---

### F. INFRASTRUCTURE

#### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Magticom Cloud** | Local cloud/hosting by largest MNO | Basic hosting API | Token | Largest ISP | **LOW** | Limited cloud API |
| **Georgian Hosting (ge.hosting)** | Domain + hosting | Domain API | Token | Local hosting | **LOW** | Basic domain management |
| **Caucasus Online** | ISP + data center | No public API | N/A | Major ISP | **LOW** | No cloud API |
| **AWS/GCP/Azure** | International cloud (used by GE tech companies) | Full APIs | Various | Growing | — | Global MCP servers exist |

#### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Magticom** | Largest MNO | Developer API | Token | 2M+ subscribers | **HIGH** | SMS, voice, number verification |
| **Silknet** | Fixed + mobile operator | API available | Token | Major operator | **MED** | Telecom services API |

#### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Google Maps** | Dominant | Maps API | API key | Dominant | **HIGH** | Good GE coverage |
| **Tbilisi Transport** | Public transport maps | GTFS feed | Open | Tbilisi commuters | **MED** | GTFS data for bus/metro |

---

### G. GOVERNMENT

#### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **my.gov.ge** | Unified e-gov portal | REST API (limited public) | Digital certificate / BankID | All citizens | **HIGH** | Growing service catalog. Authentication via bank identity |
| **rs.ge** | Revenue Service (see tax section) | REST/SOAP API | EDS | All taxpayers | **HIGH** | See accounting section |
| **napr.gov.ge** | Public Registry (business registration) | API for business data | Certificate | All businesses | **HIGH** | Company search, registration status API |
| **LEPL Data Exchange Agency** | Government data exchange layer | REST API | Certificate | Inter-agency | **MED** | Similar to Estonia X-Road. API for authorized integrators |
| **Justice House (iusticiis saxli)** | One-stop gov services | No public API | N/A | Citizens | **LOW** | Physical + online but no API |

#### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No mandatory marking system** | Not yet implemented | — | — | — | — | Georgia considering EU-aligned product marking |

---

### H. VERTICALS

#### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **SS.ge** | #1 real estate portal | No public API | N/A | Market leader | **MED** | Extremely popular. No developer API. Telegram bots exist (unofficial) |
| **MyHome.ge** | Real estate portal (TBC ecosystem) | No public API | N/A | Major player | **MED** | Backed by TBC. No API |
| **Place.ge** | Real estate (BOG ecosystem) | No public API | N/A | Growing | **LOW** | Backed by Bank of Georgia |
| **MyAuto.ge Real Estate** | RE section of MyAuto | Part of MyAuto | Token | Significant | **MED** | Integrated with MyAuto API |

#### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Aris.ge** | Educational portal | No public API | N/A | Popular | **LOW** | No API |
| **elearning.iliauni.edu.ge** | University e-learning (Moodle-based) | Moodle API | Token | University | **LOW** | Standard Moodle API |
| **Udemy/Coursera/Stepik** | Global platforms | Existing APIs | — | Growing | **LOW** | Global MCP servers exist |

#### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **my.gov.ge Health** | Government health services | Part of my.gov.ge | Certificate | Universal health | **MED** | Prescription, insurance status |
| **Booking.Doctor.ge** | Doctor appointment booking | No public API | N/A | Growing | **LOW** | No API |
| **Aversi Clinic** | Largest private clinic chain | No public API | N/A | Major chain | **LOW** | No developer API |
| **GPC (Georgian Pharmacy Chain)** | Pharmacy chain | No public API | N/A | Dominant pharmacy | **LOW** | No API |

#### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bolt GE** | #1 ride-hailing | Bolt Business API | OAuth/Token | Dominant | **HIGH** | Corporate API. Very widely used in Tbilisi |
| **Yandex Go GE** | Ride-hailing | Partner API | OAuth | #2 player | **MED** | Still operating in Georgia |
| **Tbilisi Transport Company** | Public transport | GTFS / API | Open | All Tbilisi | **MED** | Bus, metro schedule data |
| **Georgian Railway** | National railway | Schedule API (basic) | Open | National rail | **LOW** | Basic schedule information |

#### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Georgian Airways** | National airline | GDS API | Certificate | Small airline | **LOW** | Through GDS only |
| **MyTrip.ge** | Travel booking | No public API | N/A | Local aggregator | **LOW** | No API |
| **Booking.com / Airbnb** | Accommodation | Existing APIs | OAuth | Dominant for tourism | **MED** | Global APIs. Georgia is huge tourism market |

#### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Matsne.gov.ge** | Official legislation database | REST API | Open | All legal professionals | **HIGH** | Georgian law database. API available for law lookup |
| **napr.gov.ge** | Business registry (see e-gov) | API | Certificate | Business law | **HIGH** | Company registry search API |

#### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **MEPA (Ministry of Agriculture)** | Agricultural programs | No public API | N/A | Government programs | **LOW** | No developer API |
| **Fermeri.ge** | Farmer marketplace | No public API | N/A | Small | **LOW** | No API |

#### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **mSHENi.ge** | Construction marketplace | No public API | N/A | Niche | **LOW** | No API |
| No significant local platforms with APIs | Market developing | — | — | — | — | Construction booming but tech underdeveloped |

---

## Summary: TOP MCP PRIORITIES (Cross-Country)

### Tier 1 — HIGH priority, well-documented APIs, large user base

| # | Service | Country | Category | Why |
|---|---|---|---|---|
| 1 | **TBC Bank Open API** | GE | Banking | Best-in-class Open Banking in the region |
| 2 | **Bank of Georgia (iPay)** | GE | Payments | Dominant payment gateway with excellent docs |
| 3 | **Kapital Bank API** | AZ | Banking | Largest AZ retail bank, PSD2-inspired |
| 4 | **ERIP (bePaid)** | BY | Payments | Universal BY payment system, bePaid wraps it well |
| 5 | **rs.ge (Revenue Service)** | GE | Tax/Fiscal | Mandatory e-invoice/e-waybill, API documented |
| 6 | **m10 Wallet** | AZ | Mobile Wallet | Fast-growing, API for businesses |
| 7 | **Goldenpay** | AZ | Payments | Leading AZ payment gateway |
| 8 | **1C:Enterprise** | BY/AZ | ERP | 90%+ business penetration in BY |
| 9 | **Bitrix24** | BY/AZ/GE | CRM | Dominant CRM across all 3 countries |
| 10 | **Kufar.by** | BY | Classifieds | #1 C2C platform |
| 11 | **ASAN ecosystem** | AZ | e-Gov | World-recognized e-gov, SSO identity |
| 12 | **Payze** | GE | Payments | Modern, developer-friendly |
| 13 | **E-Qaimə** | AZ | Fiscal | Mandatory AZ e-invoicing |
| 14 | **Glovo GE / Wolt AZ** | GE/AZ | Delivery | Dominant delivery with merchant APIs |
| 15 | **Currency.com** | BY | Crypto | Regulated exchange with trading API |

### Tier 2 — MED priority, API exists but needs verification or limited docs

| Service | Country | Notes |
|---|---|---|
| MTBank Developer API | BY | Most dev-friendly BY bank |
| Evropochta API | BY | #1 courier in Belarus |
| PASHA Bank API | AZ | Corporate banking leader |
| Oris ERP | GE | Dominant local ERP |
| my.gov.ge | GE | e-Gov portal |
| Azercell Developer | AZ | Largest MNO |
| CDEK | BY/GE | Well-documented courier API |
| HH.by / Rabota.by | BY | Job portals with APIs |
| iiko | BY/AZ/GE | Restaurant management across all 3 |
| Matsne.gov.ge | GE | Legislation database with API |

### Key Observations

1. **Georgia leads in API maturity** — TBC Bank and Bank of Georgia have genuinely world-class Open Banking APIs. Revenue Service (rs.ge) has mandatory digital systems with documented APIs. Most developer-friendly market of the three.

2. **Azerbaijan has strong fintech potential** — Kapital Bank, m10, Goldenpay, EPoint form a solid payment ecosystem. ASAN is a unique government platform. But most classifieds (Tap.az, Turbo.az, Bina.az) lack APIs entirely.

3. **Belarus has scale but sanctions risk** — Largest market by business volume (1C, ERIP are universal). But EU/US sanctions complicate any integration involving state banks or state infrastructure. HTP companies (bePaid, Currency.com) are safer bets.

4. **Telegram bots are the universal interface** — All three countries have 60-75% Telegram penetration. Many services that lack REST APIs have Telegram bots, making Telegram Bot API a de facto integration layer.

5. **CIS-wide platforms are low-hanging fruit** — Bitrix24, amoCRM, 1C, iiko, CDEK, Yandex services, VK operate across all three countries. One MCP server serves the entire CIS.

6. **Government/fiscal systems are mandatory integrations** — ERIP (BY), E-Qaimə (AZ), rs.ge e-Invoice (GE) are legally required for businesses, making them high-value MCP targets despite complex authentication (EDS certificates).
