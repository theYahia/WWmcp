# MCP Server Candidates: Armenia, Kyrgyzstan, Tajikistan, Moldova, Turkmenistan

> Generated: 2026-04-01 | Analyst: Claude Opus 4.6 | Scope: 38 categories x 5 countries

---

## Armenia (AM)

### Market Overview
- **Population:** ~3.0M (diaspora ~7M globally)
- **Internet penetration:** ~79%
- **Dominant payment:** Card (Visa/MC via local banks), mobile wallets growing fast (Telcell, Idram)
- **API language:** Armenian/English; most tech docs in English or Russian
- **Regulatory notes:** Central Bank of Armenia regulates fintech; relatively open tech ecosystem; strong IT sector (TUMO, tech hubs); no data localization mandate but personal data law exists
- **Mobile-first:** High smartphone penetration, Telegram widely used for business

---

### A. COMMERCE

### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **List.am** | Dominant classifieds platform (real estate, auto, jobs, goods) | No official API | N/A | ~2M monthly visits | HIGH | De facto marketplace of Armenia; scraping possible but no official integration layer |
| **Menu.am** | Online marketplace for electronics, home goods, fashion | Partial (product feed) | Unknown | Growing | MED | Part of broader e-commerce ecosystem |
| **Wildberries AM** | Russian marketplace with Armenia presence | Yes (WB API) | API Key | Large (cross-border) | MED | API already exists for RU; AM-specific features limited |
| **Ozon AM** | Russian e-commerce expanding into Armenia | Yes (Ozon Seller API) | OAuth 2.0 | Growing | LOW | Primarily RU-focused API |
| **Buy.am** | Local e-commerce platform | No | N/A | Small | LOW | Limited tech infrastructure |

### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Glovo Armenia** | Major food/grocery delivery | Partner API (limited) | API Key | Dominant in Yerevan | HIGH | Global platform; partner integration available |
| **Yandex Eats AM** | Food delivery in Yerevan | Yes (Yandex API ecosystem) | OAuth 2.0 | Significant | MED | Part of Yandex ecosystem |
| **Menu.am Delivery** | Local food delivery | Unknown — requires verification | N/A | Moderate | MED | Growing local player |
| **SAS Supermarket Online** | Grocery chain online ordering | No | N/A | Moderate | LOW | Major retail chain, no API |

### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Glovo** | Restaurant ordering + delivery | Partner API | API Key | Dominant | HIGH | See above |
| **Wolt Armenia** | Restaurant delivery (DoorDash-owned) | Partner API | OAuth 2.0 | Growing | MED | Global platform expanding in AM |
| **iFood.am** | Local restaurant ordering | No | N/A | Small | LOW | Limited market share |

### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Poster POS** | Cloud POS system used by restaurants/cafes | Yes (REST API) | API Key | Significant in HoReCa | HIGH | Ukrainian company widely used in CIS including AM |
| **iiko** | Restaurant management system | Yes (iiko API) | API Key / Token | Significant | HIGH | Russian-origin, dominant in CIS restaurant management |
| **1C Armenia** | Retail/accounting software | Partial (COM/OData) | Various | Enterprise | MED | Ubiquitous in CIS retail |

---

### B. FINANCE

### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Ameriabank** | Largest bank by assets; innovation leader | Yes (Open Banking API) | OAuth 2.0 | #1 bank | HIGH | Most advanced API ecosystem among AM banks; PSD2-inspired open banking |
| **Ardshinbank** | Second largest bank | Partial (Internet banking API) | Token | #2 bank | HIGH | Business banking APIs available |
| **IDBank** | Digital-first bank (formerly Anelik) | Yes (REST API) | OAuth 2.0 | Growing digital bank | HIGH | Strong developer focus; mobile-first |
| **ACBA Bank** | Major commercial bank | Partial | Token | Top 5 | MED | Some business integration APIs |
| **Converse Bank** | Commercial bank with SME focus | Limited | Unknown | Mid-tier | MED | Limited API documentation |
| **Evocabank** | Digital banking innovator | Yes (API banking) | OAuth 2.0 | Growing | HIGH | Strong open banking push |
| **Inecobank** | Major bank, digital services | Partial | Token | Top 5 | MED | Online banking integration available |

### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **ARCA (Armenian Card) / ArCa** | National payment card system + processing | Yes (Merchant API) | API Key + Certificate | Dominant | HIGH | National card network; every bank connects through ARCA |
| **AMIO (Ameriabank)** | Payment gateway / acquiring | Yes (REST API) | API Key | Major | HIGH | Ameriabank's acquiring service |
| **IDram** | Digital wallet + payment gateway | Yes (Merchant API) | API Key | ~1M users | HIGH | Most popular e-wallet; merchant integration well-documented |
| **Telcell** | Payment terminal network + gateway | Yes (Partner API) | API Key | ~3000 terminals | HIGH | Ubiquitous payment network in Armenia |
| **EasyPay** | Payment terminals + online payments | Partial (Merchant API) | API Key | Significant | MED | Wide terminal network |

### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **IDram** | Dominant mobile wallet | Yes (P2P API for merchants) | API Key | ~1M+ users | HIGH | Person-to-person, bill pay, merchant payments |
| **Telcell Wallet** | Mobile payments via Telcell | Partial | API Key | Hundreds of thousands | MED | Part of Telcell ecosystem |
| **MobiDram** | Mobile banking wallet (ACBA) | No public API | N/A | Bank customers | LOW | Bank-specific wallet |

### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **CREX24** | Crypto exchange with AM presence | Yes (REST API) | API Key | Small | LOW | Limited local adoption |
| **No significant local crypto exchanges** | Armenia has a growing crypto community but no dominant local exchange | N/A | N/A | N/A | N/A | Most users use Binance, Bybit globally |

### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **INGO Armenia** | Major insurance company | No public API | N/A | Top 3 insurer | MED | Digital initiatives growing |
| **Rosgosstrakh Armenia** | Insurance provider | No | N/A | Significant | LOW | Traditional insurer |
| **SIL Insurance** | Local insurance | No | N/A | Mid-tier | LOW | No API presence |

---

### C. LOGISTICS

### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Glovo (courier layer)** | Same-day delivery | Partner API | API Key | Dominant in Yerevan | HIGH | Already covered above |
| **Onex** | International parcel forwarding (US/EU to AM) | Partial (tracking API) | Unknown | Very popular | MED | Armenian diaspora heavily uses this; Telegram bot available |
| **Globbing** | International shipping aggregator | Partial (tracking) | Unknown | Popular | MED | Competitor to Onex |

### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Haypost** | National postal service | Limited (tracking) | None | National | MED | Government-owned; minimal API |
| **DHL Armenia** | International courier | Yes (DHL API global) | API Key | International parcels | LOW | Global API already exists |

### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Armenia relies on international freight companies; local market fragmented among small operators | N/A | N/A | N/A | N/A | Transit via Georgia/Iran corridors |

### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Market too small for dedicated fulfillment platforms | N/A | N/A | N/A | N/A | E-commerce fulfillment handled by delivery services |

---

### D. BUSINESS SaaS

### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **amoCRM** | CRM popular in CIS | Yes (REST API) | OAuth 2.0 | Popular in AM SMBs | HIGH | Russian-origin, widely adopted in Armenia |
| **Bitrix24** | CRM + collaboration | Yes (REST API) | OAuth 2.0 | Enterprise + SMB | HIGH | Dominant CIS business platform; used by AM companies |

### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Enterprise** | Dominant ERP in CIS | Yes (OData/COM) | Various | Enterprise dominant | HIGH | De facto standard for accounting/ERP in Armenia |
| **SAP Armenia** | Enterprise ERP | Yes (SAP API) | OAuth 2.0 | Large enterprise | LOW | Global API exists; limited local specifics |

### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Accounting (Armenia localization)** | Accounting software with AM tax compliance | Yes (OData) | Token | Dominant | HIGH | Handles Armenian tax reporting |
| **Tax.am (SRC system)** | State Revenue Committee e-filing | Yes (XML/SOAP) | Certificate | All businesses | HIGH | Mandatory tax filing; API for automated submission |

### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Armenian Fiscal System (CRK)** | Cash register / fiscalization | Yes (fiscal API) | Certificate | All retail | HIGH | Mandatory for all retail; API for cash register integration |

### 18. EDI / EDM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **e-invoice.am** | Electronic invoicing (SRC) | Yes (SOAP/REST) | Certificate | All B2B | HIGH | Government-mandated e-invoicing system |
| **Diadoc (Kontur)** | EDI platform used in CIS | Yes (REST API) | Certificate | Growing | MED | Russian platform used by AM businesses trading with RU |

### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Staff.am** | Dominant job board in Armenia | No public API | N/A | #1 job board | HIGH | Most important HR platform; no API is a gap worth filling (scraping-based MCP) |
| **LinkedIn Armenia** | Professional networking | Yes (LinkedIn API) | OAuth 2.0 | IT sector | MED | Global API; significant use in AM tech |
| **HeadHunter.am (hh.am)** | Job portal (HH expansion) | Yes (REST API) | OAuth 2.0 | Growing | MED | API well-documented from RU parent |

### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Armenian companies use global tools (Jira, Asana, Notion) | N/A | N/A | N/A | N/A | Tech sector uses global SaaS |

---

### E. MARKETING

### 21. SMS / Push

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Viva-MTS (A1)** | Telco SMS gateway | Yes (SMS API) | API Key | Major telco | HIGH | Largest mobile operator; SMS sending API |
| **Ucom** | Telco SMS gateway | Yes (SMS API) | API Key | Second telco | MED | Business SMS services |
| **Team Telecom Armenia** | Telco SMS gateway | Yes (SMS API) | API Key | Third telco | MED | Former Beeline Armenia |

### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Armenian businesses use Mailchimp, SendGrid, UniSender | N/A | N/A | N/A | N/A | UniSender (CIS) is popular |

### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Google Ads, Facebook Ads, Yandex Direct dominate | N/A | N/A | N/A | N/A | Yandex.Direct has limited AM adoption |

### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Telegram (dominant messenger)** | Primary business communication | Yes (Bot API) | Bot Token | ~2M+ users | HIGH | De facto business platform in Armenia |
| **Instagram** | Social commerce platform | Yes (Meta API) | OAuth 2.0 | Very popular | MED | Key sales channel for AM SMBs |

### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Global tools (GA, Amplitude) used | N/A | N/A | N/A | N/A | — |

---

### F. INFRASTRUCTURE

### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **GreenWeb.am** | Local hosting provider | Partial (cPanel API) | API Key | Local market | LOW | Small player |
| **Arminco** | ISP + hosting | Limited | Unknown | Historical player | LOW | One of Armenia's oldest ISPs |

### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Viva-MTS** | A1 Telekom Austria subsidiary | SMS/USSD API | API Key | Dominant telco | HIGH | Largest operator; business APIs for SMS, USSD |
| **Ucom** | Second telco | SMS API | API Key | Growing | MED | Mobile + fixed |
| **Team Telecom** | Third mobile operator | SMS API | API Key | Moderate | MED | Former Beeline |

### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **2GIS Armenia** | Detailed city maps + business directory | Yes (2GIS API) | API Key | Popular in Yerevan | HIGH | Very detailed indoor/outdoor maps; business listings |
| **Yandex Maps** | Mapping service | Yes (Yandex Maps API) | API Key | Used by many | MED | Good coverage of Armenia |

---

### G. GOVERNMENT

### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **e-gov.am** | Unified e-government portal | Partial (SOAP/REST for specific services) | Certificate / EDS | All citizens | HIGH | Digital ID, document requests, tax, social services |
| **datalex.am** | Court case database | No API (web scraping only) | N/A | Legal professionals | MED | Public court records |
| **e-cadastre.am** | Land registry / cadastre | Limited | Certificate | Real estate | MED | Property ownership verification |
| **e-register.am** | Business registry | Partial (data feeds) | Unknown | All businesses | MED | Company registration and lookup |

### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **EAEU marking (pilot)** | Armenia participates in Eurasian marking system | Partial | Certificate | Growing | MED | Following Russia's Chestny ZNAK model; phased rollout |

---

### H. VERTICALS

### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **List.am (Real Estate section)** | Dominant property listings | No API | N/A | #1 real estate platform | HIGH | Most property listings in Armenia |
| **MyRealty.am** | Real estate portal | No | N/A | Growing | LOW | Newer platform |

### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **TUMO** | World-renowned creative tech education | No public API | N/A | International brand | MED | No integration API but major institution |
| **Armenian Code Academy** | Coding bootcamp | No | N/A | Local market | LOW | — |

### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Armed (E-Health)** | National e-health system | Partial (HL7/FHIR pilot) | Certificate | National | MED | Government e-health platform; API in development |
| **DOC.am** | Doctor appointment booking | No public API | N/A | Growing | MED | Leading health platform, no API |

### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **GG Taxi** | Dominant ride-hailing in Armenia | No public API | N/A | Dominant | HIGH | Armenian-built; extremely popular; Telegram bot exists; no developer API |
| **Yandex Go** | Ride-hailing | Yes (Yandex API) | OAuth 2.0 | Significant | MED | Global API; active in Yerevan |
| **YerevanBus / T-Pay** | Public transport payment | Limited | Unknown | Public transit | LOW | Electronic ticketing system |

### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **HyurService** | Tour operator | No | N/A | Tourism | LOW | Major tour operator, no API |
| **Booking.com / Airbnb** | Accommodation | Yes (global APIs) | OAuth 2.0 | Dominant | LOW | Global APIs exist |

### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **datalex.am** | Court case database | No | N/A | Legal professionals | MED | Key legal resource |
| **No significant local LegalTech startups identified** | — | N/A | N/A | N/A | N/A | — |

### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Agriculture is ~12% of GDP but digitization is minimal | N/A | N/A | N/A | N/A | Opportunity gap |

### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Construction boom in Yerevan but no digital platforms with APIs | N/A | N/A | N/A | N/A | — |

---
---

## Kyrgyzstan (KG)

### Market Overview
- **Population:** ~7.0M
- **Internet penetration:** ~72%
- **Dominant payment:** Cash still dominant; mobile wallets (O!Dengi, MBANK, Balance.kg) rapidly growing
- **API language:** Russian/Kyrgyz; tech docs primarily in Russian
- **Regulatory notes:** National Bank of KR regulates fintech; relatively open digital market; strong mobile-first culture; e-government via Tunduk interoperability platform
- **Mobile-first:** Very high mobile penetration (~130%); many services mobile-only

---

### A. COMMERCE

### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Lalafo.kg** | Dominant classifieds (C2C marketplace) | No public API | N/A | #1 classifieds | HIGH | Millions of listings; very popular; mobile app dominant |
| **Salexy.kg** | Classifieds platform | No | N/A | Moderate | LOW | Second to Lalafo |
| **Wildberries KG** | Russian marketplace with KG presence | Yes (WB API) | API Key | Growing fast | MED | Cross-border e-commerce dominant |
| **Ozon KG** | Russian e-commerce | Yes (Ozon API) | OAuth 2.0 | Growing | MED | Expanding in Central Asia |
| **Mashina.kg** | Auto classifieds | No | N/A | Dominant in auto | MED | Largest auto marketplace; no API |

### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Namba Food** | Leading food/grocery delivery in Bishkek | No public API | N/A | Dominant in Bishkek | HIGH | Part of Namba ecosystem; Telegram bot; no developer API |
| **Glovo Kyrgyzstan** | Food/grocery delivery | Partner API | API Key | Growing | MED | Recently entered KG market |
| **Yandex Eats KG** | Food delivery | Yes (Yandex API) | OAuth 2.0 | Present in Bishkek | MED | Part of Yandex ecosystem |

### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Namba Food** | Restaurant ordering + delivery | No public API | N/A | Dominant | HIGH | See above |
| **Yandex Eats** | Restaurant delivery | Yes (Yandex API) | OAuth 2.0 | Growing | MED | — |

### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Poster POS** | Cloud POS for restaurants | Yes (REST API) | API Key | Growing in HoReCa | HIGH | Expanding in Central Asia |
| **iiko** | Restaurant management | Yes (iiko API) | Token | Significant | MED | CIS standard |
| **1C Retail (KG)** | Retail management | Yes (OData) | Various | Enterprise | MED | Dominant retail backend |

---

### B. FINANCE

### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **MBANK (Commercial Bank Kyrgyzstan)** | Digital bank, #1 in mobile banking | Yes (Open API) | OAuth 2.0 | #1 digital bank | HIGH | Most advanced banking API in KG; mobile-first; widely used |
| **Optima Bank** | Major commercial bank | Partial (Internet banking) | Token | Top 3 | MED | Growing digital services |
| **Demir Kyrgyz International Bank** | Commercial bank with EBRD backing | Limited | Unknown | Mid-tier | LOW | International-oriented |
| **BakaiBank** | Major bank | Partial | Token | Top 5 | MED | Growing digital |
| **Kyrgyz Investment and Credit Bank (KICB)** | Commercial bank | Limited | Unknown | Mid-tier | LOW | — |
| **RSK Bank** | State-owned, largest by branches | Limited | Token | Largest by branches | MED | Government transactions; limited API |
| **Dos-Credo Bank** | Microfinance/bank | Limited | Unknown | Microfinance | LOW | — |

### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Elsom** | National mobile money operator (linked to NBKR) | Yes (Merchant API) | API Key | National platform | HIGH | Government-backed mobile money; used for social payments |
| **FreedomPay (Freedom Finance)** | Payment processing | Yes (REST API) | API Key | Growing | MED | Part of Freedom Holding |
| **Payler** | Payment gateway | Yes (REST API) | API Key | Moderate | MED | International gateway serving KG |

### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **O!Dengi** | Mobile wallet by O! (Nurtelecom) | Yes (Merchant API) | API Key | ~1M+ users | HIGH | Dominant mobile wallet; tied to largest telco |
| **Balance.kg** | Mobile wallet + payment platform | Yes (Merchant API) | API Key | ~800K+ users | HIGH | Major wallet; extensive merchant network; API documented |
| **MBANK Wallet** | Bank-based mobile wallet | Yes (via MBANK API) | OAuth 2.0 | Growing fast | HIGH | Integrated with MBANK ecosystem |
| **MegaPay (Megacom)** | Mobile wallet by Megacom | Partial | API Key | Moderate | MED | Telco-based wallet |

### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Crypto usage exists but no local exchanges of note | N/A | N/A | N/A | N/A | Users use global platforms |

### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Jubilee Kyrgyzstan** | Insurance provider | No | N/A | Moderate | LOW | Traditional insurer |
| **No significant local InsurTech identified** | Insurance market underdeveloped | N/A | N/A | Small | N/A | Regulatory opportunity |

---

### C. LOGISTICS

### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Namba Delivery** | Local courier service | No public API | N/A | Bishkek dominant | MED | Part of Namba ecosystem |
| **Dostavka.kg** | Local delivery service | No | N/A | Moderate | LOW | — |

### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Kyrgyz Post** | National postal service | Limited (tracking) | None | National | LOW | Basic tracking only |
| **SPSR Express / CDEK KG** | Russian courier in KG | Yes (CDEK API) | API Key | Cross-border | MED | CDEK has well-documented API |

### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Transit corridor (China-KG-KZ); fragmented trucking market | N/A | N/A | N/A | N/A | Chinese goods transit hub |

### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

---

### D. BUSINESS SaaS

### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **amoCRM** | Popular CRM in CIS | Yes (REST API) | OAuth 2.0 | SMB sector | HIGH | Widely used by KG businesses |
| **Bitrix24** | CRM + business platform | Yes (REST API) | OAuth 2.0 | Enterprise + SMB | HIGH | Very popular in KG business |

### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Enterprise (KG localization)** | ERP with Kyrgyz tax compliance | Yes (OData) | Various | Dominant | HIGH | Standard business software |

### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Accounting KG** | Accounting with KG tax forms | Yes (OData) | Token | Dominant | HIGH | Handles KG tax reporting |
| **salyk.kg** | State Tax Service e-filing | Partial (XML submission) | Certificate/EDS | All businesses | HIGH | Mandatory tax filing portal |

### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **KKM Online (ГНС)** | Online cash register system | Yes (fiscal API) | Certificate | All retail | HIGH | Mandatory fiscalization; API for integration |

### 18. EDI / EDM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local EDI players identified** | Some businesses use Russian EDI platforms | N/A | N/A | N/A | N/A | — |

### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Job.kg** | Dominant job board | No public API | N/A | #1 job board | HIGH | Major HR platform; no API |
| **HeadHunter.kg** | Job portal | Yes (REST API) | OAuth 2.0 | Growing | MED | API from parent HH.ru |
| **Namba HR** | Job listings on Namba | No | N/A | Moderate | LOW | Part of Namba ecosystem |

### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Global tools used | N/A | N/A | N/A | N/A | — |

---

### E. MARKETING

### 21. SMS / Push

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **O! (Nurtelecom)** | Largest mobile operator; SMS API | Yes (SMS gateway) | API Key | #1 telco | HIGH | Dominant operator; business SMS |
| **Megacom** | Second mobile operator | Yes (SMS API) | API Key | #2 telco | MED | SMS sending API available |
| **Beeline KG** | Third mobile operator | Yes (SMS API) | API Key | #3 telco | MED | SMS API |

### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | UniSender, Mailchimp used | N/A | N/A | N/A | N/A | — |

### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Namba Media** | Local digital advertising network | Unknown — requires verification | N/A | Local market | MED | Part of Namba ecosystem; local ad placements |

### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Telegram** | Dominant messenger | Yes (Bot API) | Bot Token | ~3M+ users | HIGH | Primary communication platform |
| **Namba One** | Local social network / messenger | No public API | N/A | Declining | LOW | Was popular; losing to Telegram |

### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

---

### F. INFRASTRUCTURE

### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Megaline / ElCat** | Local ISP + hosting | Limited | Unknown | Local | LOW | Historical provider |
| **Namba Hosting** | Hosting services | Limited | Unknown | Small | LOW | Part of Namba |

### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **O! (Nurtelecom)** | Largest telco; SMS/USSD API | Yes | API Key | Dominant | HIGH | Key CPaaS provider locally |
| **Megacom** | Telco API | Partial | API Key | Significant | MED | — |

### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **2GIS Bishkek** | City maps + business directory | Yes (2GIS API) | API Key | Popular | HIGH | Detailed maps of Bishkek, Osh |
| **Yandex Maps** | Mapping | Yes | API Key | Used by many | MED | — |

---

### G. GOVERNMENT

### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Tunduk** | National data exchange / interoperability platform | Yes (SOAP/REST) | Certificate / EDS | All gov services | HIGH | Central hub for all government data exchange; modeled on X-Road (Estonia) |
| **portal.tunduk.kg** | Citizen e-services portal | Partial | EDS | All citizens | HIGH | Unified government services |
| **patent.kg** | Business registration / patents | Limited | Unknown | All businesses | MED | E-patent system |

### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **EAEU marking (planned)** | Kyrgyzstan joining EAEU marking system | Unknown — requires verification | N/A | Planned | LOW | Following EAEU schedule; phased implementation |

---

### H. VERTICALS

### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Lalafo.kg (real estate section)** | Property listings | No API | N/A | Dominant | MED | Part of Lalafo classifieds |
| **House.kg** | Real estate portal | No | N/A | Significant | MED | Dedicated real estate platform |

### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Market uses international platforms (Coursera, etc.) | N/A | N/A | N/A | N/A | — |

### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **e-Health KG** | National e-health system (in development) | Unknown — requires verification | N/A | National | MED | Government digital health initiative |

### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Go KG** | Ride-hailing in Bishkek | Yes (Yandex API) | OAuth 2.0 | Dominant | MED | Main ride-hailing service |
| **Namba Taxi** | Local taxi service | No public API | N/A | Declining | LOW | Losing to Yandex Go |
| **MaximTaxi KG** | Ride-hailing | Partial (driver API) | Token | Significant | MED | Russian-origin, strong in regions |

### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Aviata.kz (KG presence)** | Flight booking | Yes (REST API) | API Key | Regional | MED | Kazakhstan-based but serves KG |
| **No significant local travel tech** | — | N/A | N/A | N/A | N/A | Tourism growing (Issyk-Kul) but no local booking platforms |

### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **cbd.minjust.gov.kg** | Legal database | Limited | None | Legal professionals | LOW | Government legal information system |

### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Agriculture is ~12% GDP; digitization minimal | N/A | N/A | N/A | N/A | Major opportunity gap; donor-funded projects exist |

### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

---
---

## Tajikistan (TJ)

### Market Overview
- **Population:** ~10.0M
- **Internet penetration:** ~35-40% (lowest in CIS; growing via mobile)
- **Dominant payment:** Cash dominant; mobile wallets emerging (Alif, DC Pay)
- **API language:** Russian/Tajik; tech docs in Russian
- **Regulatory notes:** National Bank of Tajikistan regulates fintech; restrictive internet policies (VPN restrictions, periodic social media blocks); data localization requirements for some sectors
- **Mobile-first:** Very mobile-centric; feature phones still common; smartphones growing fast
- **Key note:** Remittance economy (~30% of GDP comes from labor migration, primarily Russia)

---

### A. COMMERCE

### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Somon.tj** | Dominant classifieds platform | No public API | N/A | #1 marketplace | HIGH | De facto marketplace of Tajikistan; mobile-heavy |
| **Lalafo.tj** | C2C classifieds | No | N/A | Growing | MED | Regional expansion from KG |
| **Wildberries TJ** | Russian e-commerce | Yes (WB API) | API Key | Growing | LOW | Limited penetration |

### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Dushanbe City (delivery)** | Food/grocery delivery in Dushanbe | No public API | N/A | Leading in Dushanbe | MED | Growing but limited API |
| **Yandex Eats TJ** | Food delivery | Yes (Yandex API) | OAuth 2.0 | Dushanbe only | MED | Limited coverage |

### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Food ordering is largely walk-in/phone-based; some Telegram bots | N/A | N/A | N/A | N/A | Telegram bots emerging for restaurants |

### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **iiko** | Restaurant management | Yes (iiko API) | Token | Small market | LOW | Used by upscale restaurants in Dushanbe |
| **1C TJ** | Retail/accounting | Yes (OData) | Various | Enterprise | MED | Standard CIS business software |

---

### B. FINANCE

### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Alif Bank** | Digital-first bank + fintech leader | Yes (REST API) | OAuth 2.0 / API Key | #1 digital bank | HIGH | Most innovative bank in TJ; mobile-first; installment payments; developer-friendly |
| **Orienbank** | Largest commercial bank by assets | Limited | Token | #1 by assets | MED | Traditional bank; limited API |
| **Amonatbonk** | State savings bank | No | N/A | Largest branch network | LOW | Government-owned; minimal digital |
| **Eskhata Bank** | Commercial bank with digital push | Partial | Token | Top 5 | MED | Growing mobile banking |
| **Spitamen Bank** | Commercial bank | Partial | Unknown | Top 5 | LOW | — |
| **International Bank of Tajikistan** | Commercial bank | Limited | Unknown | Mid-tier | LOW | — |
| **Dushanbe City Bank** | Commercial bank | Partial (mobile API) | Token | Growing | MED | Connected to Dushanbe City super-app |

### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Alif Pay** | Payment gateway by Alif | Yes (REST API) | API Key | Growing fast | HIGH | Leading payment processor; QR payments; merchant integration |
| **Korti Milli** | National payment card system | Partial (bank integration) | Certificate | National | MED | National card network (like ArCa in Armenia) |
| **DC Pay (Dushanbe City)** | Payment services | Partial | API Key | Growing | MED | Part of Dushanbe City ecosystem |

### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Alif Mobi** | Mobile wallet by Alif | Yes (API) | OAuth 2.0 | ~500K+ users | HIGH | Most popular mobile wallet; installment lending |
| **DC Wallet** | Dushanbe City wallet | Partial | API Key | Growing | MED | Super-app wallet |
| **TojPay** | Mobile money | Unknown — requires verification | N/A | Small | LOW | — |

### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Crypto is legally grey area; no local exchanges | N/A | N/A | N/A | N/A | — |

### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local InsurTech identified** | Insurance market underdeveloped; mostly state companies | N/A | N/A | Small | N/A | — |

---

### C. LOGISTICS

### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Delivery handled by marketplaces and informal couriers | N/A | N/A | N/A | N/A | — |

### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Pochta Tojikiston** | National postal service | No API | N/A | National | LOW | Very limited digital infrastructure |

### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Fragmented trucking; China-TJ corridor important | N/A | N/A | N/A | N/A | — |

### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

---

### D. BUSINESS SaaS

### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Bitrix24** | Used by TJ businesses | Yes (REST API) | OAuth 2.0 | SMB/Enterprise | MED | CIS standard; limited local adoption |
| **amoCRM** | CRM | Yes (REST API) | OAuth 2.0 | Small adoption | LOW | Growing but small market |

### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Enterprise TJ** | ERP with TJ localization | Yes (OData) | Various | Dominant | MED | Standard for mid/large business |

### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Accounting TJ** | Accounting with TJ tax compliance | Yes (OData) | Token | Dominant | MED | — |
| **Tax Committee portal** | State tax e-filing | Limited | Certificate | All businesses | MED | E-filing for tax declarations |

### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **KKM system (Tax Committee)** | Cash register fiscalization | Unknown — requires verification | Certificate | Retail | MED | Fiscal control system in development |

### 18. EDI / EDM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Somon.tj (jobs section)** | Job listings | No API | N/A | Major job platform | MED | Part of classifieds |
| **HeadHunter TJ** | Job portal | Yes (REST API) | OAuth 2.0 | Growing | MED | HH.ru expansion |

### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

---

### E. MARKETING

### 21. SMS / Push

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Tcell (Megafon TJ)** | Largest mobile operator; SMS gateway | Yes (SMS API) | API Key | #1 telco | HIGH | Dominant operator; bulk SMS services |
| **Babilon-Mobile** | Second operator | Partial (SMS) | API Key | #2 telco | MED | SMS gateway available |
| **ZET Mobile (Beeline TJ)** | Third operator | Partial | API Key | #3 telco | MED | — |

### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Digital advertising minimal; billboards/TV dominant | N/A | N/A | N/A | N/A | — |

### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Telegram** | Dominant messenger (when not blocked) | Yes (Bot API) | Bot Token | ~2M+ users | HIGH | Periodically restricted by authorities |
| **IMO** | Very popular video calling app | No public API | N/A | Very popular | MED | Widely used for diaspora communication |

### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

---

### F. INFRASTRUCTURE

### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local cloud providers identified** | Local ISPs provide basic hosting | N/A | N/A | N/A | N/A | Internet infrastructure limited; single gateway (government-controlled) |

### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Tcell (Megafon TJ)** | SMS/USSD API | Yes | API Key | Dominant | HIGH | Primary CPaaS option |
| **Babilon-Mobile** | Telco API | Partial | API Key | Significant | MED | — |

### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **2GIS Dushanbe** | City maps + business directory | Yes (2GIS API) | API Key | Popular in Dushanbe | MED | Good coverage of Dushanbe |
| **Yandex Maps** | Mapping | Yes | API Key | Used by some | LOW | Coverage limited outside Dushanbe |

---

### G. GOVERNMENT

### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **khidmatrasoni.tj** | E-government portal | Limited | EDS/Certificate | All citizens | MED | Growing e-gov services; limited API |
| **Gateway "TSMMR"** | Interagency electronic interaction system | Unknown — requires verification | Certificate | Government | MED | Similar to Tunduk concept but less mature |

### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Not yet implemented** | Tajikistan not yet in EAEU marking | N/A | N/A | N/A | N/A | Observer status in some EAEU programs |

---

### H. VERTICALS

### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Somon.tj (real estate)** | Property listings | No API | N/A | Dominant | MED | Part of classifieds platform |

### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Healthcare digitization minimal | N/A | N/A | N/A | N/A | — |

### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Go TJ** | Ride-hailing in Dushanbe | Yes (Yandex API) | OAuth 2.0 | Growing | MED | Primary ride-hailing |
| **MaximTaxi TJ** | Ride-hailing | Partial | Token | Significant | MED | Strong in Dushanbe |
| **Dushanbe City Taxi** | Super-app taxi | No public API | N/A | Growing | MED | Part of DC ecosystem |

### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | International platforms used | N/A | N/A | N/A | N/A | Tourism sector nascent |

### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Agriculture ~21% of GDP but no digital platforms | N/A | N/A | N/A | N/A | Major opportunity gap; World Bank/donor projects exist |

### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

---
---

## Moldova (MD)

### Market Overview
- **Population:** ~2.6M (excluding Transnistria ~0.35M)
- **Internet penetration:** ~82%
- **Dominant payment:** Card (Visa/MC dominant), mobile banking growing; EU integration driving PSD2 adoption
- **API language:** Romanian/Russian; tech docs increasingly in English
- **Regulatory notes:** National Bank of Moldova regulates fintech; EU Association Agreement drives regulatory alignment; GDPR-adjacent data protection; strong push toward EU digital standards; Transnistria is a separate de facto jurisdiction
- **Mobile-first:** High smartphone penetration; Viber and Telegram dominant messengers

---

### A. COMMERCE

### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **999.md** | Dominant classifieds marketplace (everything: auto, real estate, goods, jobs) | No public API | N/A | #1 platform (~5M monthly visits) | HIGH | The platform in Moldova; no API is a major gap |
| **Darwin.md** | Electronics e-commerce | No | N/A | Growing | MED | Major electronics retailer |
| **Maximum.md** | Electronics marketplace | No | N/A | Significant | MED | Electronics retail |
| **Marketplace.md** | General marketplace | Limited | Unknown | Growing | LOW | — |
| **Aiwa.md** | Electronics e-store | No | N/A | Moderate | LOW | — |

### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Glovo Moldova** | Food + grocery delivery | Partner API | API Key | Dominant in Chisinau | HIGH | Primary delivery platform |
| **Yandex Eats MD** | Food delivery | Yes (Yandex API) | OAuth 2.0 | Chisinau | MED | Part of Yandex ecosystem |
| **Straus.md** | Local food delivery | No | N/A | Growing | LOW | — |

### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Glovo** | Restaurant ordering | Partner API | API Key | Dominant | HIGH | See above |
| **Menu.md** | Restaurant listings + ordering | No | N/A | Moderate | MED | — |

### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Poster POS** | Cloud POS | Yes (REST API) | API Key | Growing | HIGH | Expanding in Moldova |
| **iiko** | Restaurant management | Yes (iiko API) | Token | Used by upscale HoReCa | MED | — |
| **1C Moldova** | Retail management | Yes (OData) | Various | Enterprise | MED | Standard |

---

### B. FINANCE

### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **MAIB (Moldova Agroindbank)** | Largest bank; innovation leader | Yes (Open Banking API) | OAuth 2.0 | #1 bank (~35% market) | HIGH | Most advanced API; PSD2-aligned; open banking pioneer in MD |
| **Victoriabank** | Second largest bank (Banca Transilvania group) | Yes (API banking) | OAuth 2.0 | #2 bank | HIGH | Strong digital banking; EU-influenced technology stack |
| **MICB (Moldindconbank)** | Third largest bank | Partial | Token | #3 bank | MED | Growing digital services |
| **FinComBank** | Commercial bank | Limited | Unknown | Mid-tier | LOW | — |
| **Energbank** | Commercial bank | Limited | Unknown | Smaller | LOW | — |
| **OTP Bank Moldova** | Hungarian bank subsidiary | Partial (OTP API) | Token | Growing | MED | Benefits from OTP Group tech |
| **ProCredit Bank MD** | German-origin bank | Partial | Token | SME focus | LOW | — |

### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **MAIB eCommerce** | Payment acquiring by MAIB | Yes (REST API) | API Key + HMAC | Dominant | HIGH | Main payment gateway for online business |
| **Victoriabank eCommerce** | Payment acquiring | Yes (REST API) | API Key | Significant | HIGH | Second largest processor |
| **paynet.md** | Payment aggregator | Yes (API) | API Key | Significant | HIGH | Wide acceptance; utility payments |
| **MMPS (Moldovan Multichannel Payment System)** | National payment system | Partial | Certificate | Infrastructure | MED | National switch |

### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **MAIB Pay** | Mobile payment by MAIB | Partial (via bank API) | OAuth 2.0 | Growing | MED | Part of MAIB ecosystem |
| **MPayments** | Mobile payments | Partial | API Key | Moderate | MED | — |
| **paynet.md wallet** | Payment wallet | Yes | API Key | Significant | MED | Utility + merchant payments |

### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Crypto not regulated; no local exchanges | N/A | N/A | N/A | N/A | Users use global platforms |

### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Moldasig** | Largest insurer | No public API | N/A | #1 insurer | MED | Traditional insurer |
| **DONARIS VIG** | Insurance (Vienna Insurance Group) | No | N/A | Significant | LOW | — |
| **INTACT Asigurari** | Insurance | No | N/A | Growing | LOW | — |

---

### C. LOGISTICS

### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Nova Poshta Moldova** | Ukrainian courier expanding to MD | Yes (NP API) | API Key | Growing | HIGH | Well-documented API from UA parent; e-commerce delivery |
| **Glovo courier** | Same-day delivery | Partner API | API Key | Chisinau | MED | — |
| **Poshtarik** | Local delivery | No | N/A | Small | LOW | — |

### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Posta Moldovei** | National postal service | Limited (tracking) | None | National | LOW | Government-owned; basic tracking |

### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Lardi-Trans (MD presence)** | Freight exchange platform | Yes (REST API) | API Key | CIS freight | MED | Major CIS freight platform used in Moldova |

### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | Small market |

---

### D. BUSINESS SaaS

### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **amoCRM** | CRM popular in CIS | Yes (REST API) | OAuth 2.0 | Growing | HIGH | Used by MD businesses |
| **Bitrix24** | CRM + collaboration | Yes (REST API) | OAuth 2.0 | Popular | HIGH | Dominant CIS business tool |

### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Enterprise MD** | ERP with Moldova localization | Yes (OData) | Various | Dominant | HIGH | Standard business software |
| **BAS (1C-based Moldova ERP)** | Moldovan adaptation | Yes (OData) | Various | Growing | MED | — |

### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C:Accounting MD** | Accounting with MD tax | Yes (OData) | Token | Dominant | HIGH | Handles Moldovan tax specifics |
| **SFS Portal (Serviciul Fiscal de Stat)** | State tax service e-filing | Yes (REST/SOAP) | Certificate / MPass | All businesses | HIGH | Mandatory e-filing; API for tax submission |
| **e-Factura** | Electronic invoicing system (government) | Yes (REST API) | MPass / Certificate | All B2B | HIGH | Mandatory e-invoicing; machine-readable API |

### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **SFS Fiscal (MCC)** | Fiscal cash register system | Yes (fiscal API) | Certificate | All retail | HIGH | Mandatory fiscal reporting |
| **Daisy Expert (fiscal printers)** | Fiscal device manufacturer | Yes (device API) | Serial/API | Retail | MED | Hardware + software integration |

### 18. EDI / EDM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **e-Factura** | Government EDI/e-invoicing | Yes (REST) | MPass | B2B mandatory | HIGH | See accounting section |

### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **rabota.md** | Dominant job board | No public API | N/A | #1 job board | HIGH | Most important HR platform; no API |
| **999.md (jobs section)** | Job classifieds | No API | N/A | Major traffic | MED | Part of 999.md |
| **HeadHunter MD** | Job portal | Yes (REST API) | OAuth 2.0 | Growing | MED | HH.ru expansion |
| **LinkedIn** | Professional networking | Yes (global API) | OAuth 2.0 | IT sector | LOW | — |

### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Global tools used | N/A | N/A | N/A | N/A | — |

---

### E. MARKETING

### 21. SMS / Push

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Orange Moldova** | Largest mobile operator; SMS API | Yes (SMS gateway) | API Key | #1 telco | HIGH | Major operator; business SMS |
| **Moldcell** | Second operator (Turkcell) | Yes (SMS API) | API Key | #2 telco | MED | Business SMS services |
| **Unite (Moldtelecom mobile)** | Third operator | Partial (SMS) | API Key | Growing | LOW | State-owned telco mobile |

### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Mailchimp, UniSender used | N/A | N/A | N/A | N/A | — |

### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Simpals (999.md parent)** | Digital advertising network | Unknown — requires verification | N/A | Dominant local digital | MED | Simpals group controls 999.md + other properties |

### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Viber** | Extremely popular messenger in Moldova | Partial (Viber Bot API) | Auth Token | ~1.5M+ users | HIGH | Most used messenger; business bots popular |
| **Telegram** | Growing messenger | Yes (Bot API) | Bot Token | ~1M+ users | HIGH | Growing fast especially in IT |
| **Odnoklassniki** | Social network (older demo) | Yes (OK API) | OAuth 2.0 | Significant (Russian speakers) | MED | Popular among Russian-speaking population |

### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

---

### F. INFRASTRUCTURE

### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Moldtelecom** | National telco + cloud/data center | Limited | Unknown | Government + enterprise | MED | State-owned; data center services |
| **Starnet** | ISP + hosting | Limited | Unknown | Local | LOW | Major ISP |
| **Orange Business MD** | Cloud/hosting | Partial | API Key | Enterprise | MED | Part of Orange group |

### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Orange Moldova** | SMS/USSD API | Yes | API Key | Dominant | HIGH | Primary CPaaS |
| **Moldcell** | Telco API | Yes | API Key | Significant | MED | — |

### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Point.md** | Local city guide + maps | No public API | N/A | Popular | MED | Simpals group product |
| **Google Maps / OpenStreetMap** | Mapping | Yes (global APIs) | API Key | Standard | LOW | Good coverage of MD |

---

### G. GOVERNMENT

### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **e-gov.md (MConnect / servicii.gov.md)** | Unified e-government portal | Yes (REST API via MConnect) | MPass (national eID) | All citizens | HIGH | Well-developed e-gov; EU-funded modernization; MPass SSO |
| **MPass** | National authentication service | Yes (SAML/OAuth) | Certificate | National SSO | HIGH | Single sign-on for all government services |
| **MConnect** | Government data exchange platform | Yes (REST/SOAP) | Certificate | G2G/G2B | HIGH | Interoperability platform (X-Road based) |
| **CNAM (Health Insurance)** | National health insurance portal | Partial | MPass | All citizens | MED | Health insurance verification |
| **e-Cadastru** | Land/property registry | Partial | MPass | Real estate | MED | Property records |
| **ASP (Agency of Public Services)** | Civil registry, documents | Partial | MPass | All citizens | MED | Birth/death/marriage certificates |

### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Not applicable** | Moldova not part of EAEU; follows EU labeling direction | N/A | N/A | N/A | N/A | CE marking alignment underway |

---

### H. VERTICALS

### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **999.md (real estate)** | Dominant property listings | No API | N/A | #1 platform | HIGH | Most property listings |
| **makler.md** | Real estate portal | No | N/A | Moderate | MED | Dedicated real estate |

### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Tekwill** | Tech education hub | No public API | N/A | Growing | LOW | Education + startup ecosystem |
| **No significant local EdTech platforms** | — | N/A | N/A | N/A | N/A | — |

### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **SIEMM (e-Health system)** | National e-health / medical records | Partial (HL7 FHIR pilot) | MPass | National | MED | Government e-health modernization |
| **doc.md** | Doctor appointment booking | No public API | N/A | Growing | MED | Leading health platform |

### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Yandex Go MD** | Ride-hailing in Chisinau | Yes (Yandex API) | OAuth 2.0 | Dominant | MED | Primary ride-hailing |
| **iGo (local taxi)** | Taxi app | No public API | N/A | Moderate | LOW | Local player |
| **Trolleybus/Bus Chisinau** | Public transport | No API | N/A | Public transit | LOW | No digital integration |

### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Fly One** | Moldovan airline | Partial (booking API) | Unknown | Dominant airline | MED | Main airline from Chisinau |
| **Moldovan Railways (CFM)** | Rail service | No API | N/A | Minimal | LOW | Very limited service |

### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Legis.md** | Legal information system | Limited | MPass | Legal professionals | MED | Government legal database |
| **No significant local LegalTech startups** | — | N/A | N/A | N/A | N/A | — |

### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **AIPA (Agency for Payments in Agriculture)** | Agricultural subsidies platform | Partial | Certificate | Farmers | MED | EU-aligned agricultural payments |
| **No significant local AgriTech startups** | Wine/agriculture ~10% GDP but minimal digital platforms | N/A | N/A | N/A | N/A | Wine-tech could be a niche |

### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | — | N/A | N/A | N/A | N/A | — |

---
---

## Turkmenistan (TM)

### Market Overview
- **Population:** ~6.3M
- **Internet penetration:** ~25-30% (heavily restricted; state-controlled ISP)
- **Dominant payment:** Cash dominant; limited digital payments
- **API language:** Turkmen/Russian; extremely limited tech documentation
- **Regulatory notes:** Most closed digital market in CIS; single state ISP (Turkmentelecom); social media and VPNs largely blocked; no independent fintech ecosystem; government controls most digital infrastructure; foreign companies have negligible presence
- **Mobile-first:** Growing smartphone adoption but restricted app ecosystem
- **Critical note:** This is the most restrictive digital environment in Central Asia. Most categories will have no players. The few that exist are state-controlled.

---

### A. COMMERCE

### 1. E-commerce / Marketplaces

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **arzanTM** | Domestic e-commerce / classifieds | No | N/A | Limited | LOW | One of few online platforms |
| **Turkmenistan.gov.tm (state shops)** | Government-linked shopping | No | N/A | Controlled | LOW | State-managed e-commerce |
| **No significant private marketplaces** | E-commerce is nascent due to internet restrictions | N/A | N/A | N/A | N/A | Cash economy dominant |

### 2. Grocery / Food Delivery

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | Food delivery services not developed | N/A | N/A | N/A | N/A | — |

### 3. Restaurant / Food Ordering

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | — | N/A | N/A | N/A | N/A | — |

### 4. POS / HoReCa / Retail Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | State retail dominant; minimal POS digitization | N/A | N/A | N/A | N/A | — |

---

### B. FINANCE

### 5. Banks (Business API)

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Dayhanbank** | State agricultural bank | No | N/A | State bank | LOW | Fully state-controlled |
| **Turkmenistan (state bank)** | Central state bank | No | N/A | State bank | LOW | — |
| **Senagat Bank** | State industrial bank | No | N/A | State bank | LOW | — |
| **Rysgal Bank** | First private bank (2012) | Unknown — requires verification | N/A | Only private bank | MED | Only private bank in TM; potential for API but unverified |
| **Halkbank** | State bank | No | N/A | State bank | LOW | Handles some digital payments |

### 6. Payment Gateways

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | Payment processing controlled by state banks | N/A | N/A | N/A | N/A | — |

### 7. Mobile Wallets / P2P

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Altyn Asyr (TDSE mobile pay)** | State telco mobile payment | Unknown — requires verification | N/A | Growing | LOW | State telco; some mobile payment features |

### 8. Crypto / Fintech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No players identified** | Crypto effectively banned | N/A | N/A | N/A | N/A | — |

### 9. Insurance / InsurTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Turkmen State Insurance** | State monopoly | No | N/A | State controlled | LOW | — |

---

### C. LOGISTICS

### 10. Courier / Last-Mile

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | — | N/A | N/A | N/A | N/A | — |

### 11. Postal Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Turkmenpost** | National postal service | No | N/A | National | LOW | No digital infrastructure |

### 12. Freight / Trucking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Transit corridor (China-TM-Iran) but state-managed | N/A | N/A | N/A | N/A | Strategic transit country but closed digital systems |

### 13. Warehousing / Fulfillment

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | — | N/A | N/A | N/A | N/A | — |

---

### D. BUSINESS SaaS

### 14. CRM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant local players identified** | Extremely limited SaaS adoption | N/A | N/A | N/A | N/A | — |

### 15. ERP

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **1C (limited presence)** | Some usage in larger enterprises | Yes (OData) | Various | Very limited | LOW | Mostly state enterprises |

### 16. Accounting / Tax

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **State Tax portal** | Tax submission system | Unknown — requires verification | N/A | State system | LOW | Digital tax filing existence unverified |

### 17. Fiscal Systems / OFD

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No information available** | — | N/A | N/A | N/A | N/A | — |

### 18. EDI / EDM

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | — | N/A | N/A | N/A | N/A | — |

### 19. HR / Recruiting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **tmcars.info (jobs section)** | Some job listings alongside auto | No | N/A | Minimal | LOW | One of the few platforms |
| **No dedicated job platforms** | — | N/A | N/A | N/A | N/A | — |

### 20. Project Management

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | — | N/A | N/A | N/A | N/A | — |

---

### E. MARKETING

### 21. SMS / Push

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Altyn Asyr (TDSE)** | State mobile operator | Unknown — requires verification | N/A | Dominant telco | LOW | Single state telco; unlikely public API |
| **TMCELL** | State mobile operator brand | Unknown — requires verification | N/A | State telco | LOW | — |

### 22. Email Marketing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No players identified** | — | N/A | N/A | N/A | N/A | — |

### 23. Advertising

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No digital advertising platforms** | State media dominant; no digital ad platforms | N/A | N/A | N/A | N/A | — |

### 24. Social Media

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **IMO** | Messaging app (one of few allowed) | No public API | N/A | Very popular | MED | One of few communication apps not fully blocked |
| **Most social media blocked** | Facebook, Twitter, Telegram often blocked | N/A | N/A | N/A | N/A | VPN usage illegal but common |

### 25. Analytics / BI

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No players identified** | — | N/A | N/A | N/A | N/A | — |

---

### F. INFRASTRUCTURE

### 26. Cloud / Hosting

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Turkmentelecom** | State ISP + only hosting provider | No public API | N/A | Monopoly | LOW | Single ISP; all internet traffic routed through state gateway |

### 27. Telecom API / CPaaS

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Altyn Asyr / TMCELL** | State telco | Unknown — requires verification | N/A | Monopoly | LOW | No known public API |

### 28. Maps / Geolocation

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No local players** | Google Maps/OSM have limited TM coverage | N/A | N/A | N/A | N/A | Limited mapping data available |

---

### G. GOVERNMENT

### 29. e-Gov Services

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **e.gov.tm** | Government portal (launched 2019) | Unknown — requires verification | N/A | National | LOW | Digital government initiative; actual API availability uncertain |
| **sanly.tm** | Digital economy portal | No | N/A | Government project | LOW | Part of "Digital Turkmenistan" initiative |

### 30. Product Labeling / Marking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Not applicable** | No known labeling/marking system | N/A | N/A | N/A | N/A | — |

---

### H. VERTICALS

### 31. Real Estate

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **tmcars.info** | Auto + some real estate listings | No | N/A | One of few platforms | LOW | — |
| **No dedicated real estate platforms** | Property market state-controlled | N/A | N/A | N/A | N/A | — |

### 32. EdTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | — | N/A | N/A | N/A | N/A | — |

### 33. Healthcare

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | Healthcare fully state-run | N/A | N/A | N/A | N/A | — |

### 34. Transport / Ride-hailing

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No significant players identified** | No ride-hailing apps; taxi via phone | N/A | N/A | N/A | N/A | — |

### 35. Travel / Booking

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **Turkmenistan Airlines** | National carrier | No API | N/A | Monopoly airline | LOW | State airline; bookings via website only |
| **No local booking platforms** | — | N/A | N/A | N/A | N/A | — |

### 36. Legal Tech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No players identified** | — | N/A | N/A | N/A | N/A | — |

### 37. AgriTech

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No players identified** | Agriculture ~8% GDP but fully traditional | N/A | N/A | N/A | N/A | — |

### 38. Construction

| Company / Service | Description | Public API? | Auth Type | Market Size | MCP Priority | Notes |
|---|---|---|---|---|---|---|
| **No players identified** | State-directed construction sector | N/A | N/A | N/A | N/A | — |

---
---

## Cross-Country Summary: TOP MCP PRIORITIES

### Tier 1 — HIGH priority, API confirmed, large user base

| # | Service | Country | Category | Why |
|---|---|---|---|---|
| 1 | **MAIB Open Banking** | Moldova | Bank API | PSD2-aligned, dominant bank, well-documented API |
| 2 | **Ameriabank API** | Armenia | Bank API | Most advanced bank API in AM, OAuth 2.0 |
| 3 | **MBANK API** | Kyrgyzstan | Bank API | #1 digital bank in KG, Open API |
| 4 | **Alif Bank/Alif Pay** | Tajikistan | Bank + Payments | Only real fintech in TJ, REST API |
| 5 | **IDram** | Armenia | Payments/Wallet | ~1M users, merchant API documented |
| 6 | **O!Dengi** | Kyrgyzstan | Mobile Wallet | ~1M+ users, merchant API |
| 7 | **Balance.kg** | Kyrgyzstan | Mobile Wallet | Well-documented merchant API |
| 8 | **Tunduk** | Kyrgyzstan | e-Gov | X-Road-based interoperability; central data hub |
| 9 | **MConnect/MPass** | Moldova | e-Gov | EU-funded; REST API; national SSO |
| 10 | **e-Factura MD** | Moldova | EDI/Invoicing | Mandatory e-invoicing with API |
| 11 | **SFS Moldova (Tax)** | Moldova | Tax Filing | REST/SOAP API for tax submission |
| 12 | **ARCA / ArCa** | Armenia | Card Processing | National card network API |
| 13 | **Telcell** | Armenia | Payments | 3000+ terminals; merchant API |
| 14 | **paynet.md** | Moldova | Payments | Wide acceptance; documented API |
| 15 | **Nova Poshta MD** | Moldova | Logistics | Well-documented API from UA |

### Tier 2 — HIGH potential, API needs verification or creation

| # | Service | Country | Category | Why |
|---|---|---|---|---|
| 1 | **999.md** | Moldova | Marketplace | 5M visits/mo but NO API — huge gap |
| 2 | **List.am** | Armenia | Marketplace | #1 classifieds in AM; no API |
| 3 | **Lalafo.kg** | Kyrgyzstan | Marketplace | #1 classifieds in KG; no API |
| 4 | **Somon.tj** | Tajikistan | Marketplace | #1 classifieds in TJ; no API |
| 5 | **GG Taxi** | Armenia | Ride-hailing | Dominant in AM; no developer API |
| 6 | **Namba Food** | Kyrgyzstan | Food Delivery | #1 in Bishkek; no API |
| 7 | **Staff.am** | Armenia | HR/Jobs | #1 job board; no API |
| 8 | **rabota.md** | Moldova | HR/Jobs | #1 job board; no API |
| 9 | **Victoriabank** | Moldova | Banking | #2 bank; API growing |
| 10 | **Evocabank** | Armenia | Banking | Open banking push |

### Tier 3 — Turkmenistan (watch list)

Turkmenistan has no viable MCP candidates at this time due to state control of all digital infrastructure, restricted internet access, and absence of public APIs. **Rysgal Bank** (only private bank) and **e.gov.tm** are the only services worth monitoring for future API development.

### Market Readiness Ranking

| Rank | Country | MCP-Ready Services | API Maturity | Notes |
|---|---|---|---|---|
| 1 | **Moldova** | 15-20 | High | EU alignment drives API standards; MConnect/MPass infrastructure |
| 2 | **Armenia** | 12-15 | Medium-High | Strong tech sector; bank APIs well-developed |
| 3 | **Kyrgyzstan** | 10-12 | Medium | Tunduk platform is strong; wallets have APIs |
| 4 | **Tajikistan** | 4-6 | Low-Medium | Alif ecosystem is the standout; rest minimal |
| 5 | **Turkmenistan** | 0-1 | None | Effectively closed digital market |
