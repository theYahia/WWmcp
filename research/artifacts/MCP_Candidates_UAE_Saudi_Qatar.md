# Deep Research: MCP Candidates — UAE + Saudi Arabia + Qatar
**Date:** April 2026 | **Analyst:** AI-Assisted Deep Research
**Scope:** 38 categories × 3 countries | Based on live API documentation checks

---

## RESEARCH METHODOLOGY

All API status fields reflect live checks against developer portals and GitHub as of April 2026:
- **Verified** = docs page confirmed live with working endpoints
- **Documented** = official docs exist, sandbox/full verification not completed
- **Partial** = some endpoints documented, coverage incomplete
- **Unknown** = no public developer portal found
- **None** = confirmed no public API

---

## UAE

### Market Overview
- **Population:** 9.9M (90%+ expats) | **Internet penetration:** 99%
- **Dominant payments:** Visa/Mastercard + Apple Pay + local cards; AED currency
- **API language:** English primary; Arabic for compliance docs
- **Regulatory notes:** CBUAE (Central Bank UAE) oversees fintechs; UAE Pass is national digital ID (OAuth2); DIFC/ADGM free zones have separate frameworks; Personal Data Protection Law (PDPL) enacted 2022; Dubai Digital Authority manages iPaaS developer portal

---

### 1. E-commerce / Marketplaces

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Noon | Pan-GCC marketplace (UAE #1 volume) | Partial | https://noon.com/uae-en/developer (seller portal, no public API) | API Key (seller) | Large | MED | M | Seller API exists but restricted; Adyen powers payments |
| Amazon.ae | UAE arm of Amazon | Documented | https://developer.amazonservices.com/ (SP-API) | OAuth2 | Large | HIGH | M | Full SP-API available; MWS deprecated; same as global |
| Namshi | Fashion e-commerce | Unknown | No public API found | Unknown | Medium | LOW | — | MENA fashion; Noon subsidiary; no dev portal |
| Mumzworld | Kids/baby marketplace | Unknown | No public API found | Unknown | Small | LOW | — | Niche; no developer program |
| Dubizzle | Classifieds (cars, jobs, real estate) | Partial | No official API; unofficial scrapers on RapidAPI | Unknown | Large | MED | L | Owned by EMPG (Bayut parent); unofficial Bayut API on RapidAPI |

---

### 2. Grocery & Food Delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Talabat | Dominant food/grocery delivery UAE | Partial | No public API; merchant dashboard only | Unknown | Large | MED | L | Owned by Delivery Hero; no public MCP opportunity; webhook support for partners |
| Careem | Super-app (rides, food, delivery) | Partial | https://developer.careem.com/ (old; limited) | OAuth2 | Large | HIGH | L | Careem NOW (grocery); API exists for ride, checkout; limited public access |
| InstaShop | Grocery delivery | Unknown | No public API found | Unknown | Medium | LOW | — | Acquired by Delivery Hero 2020 |
| Nana | KSA-focused grocery delivery | Documented | Merchant portal; no public API | Unknown | Medium | LOW | — | See Saudi section |

---

### 3. Restaurant / Food Ordering

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Talabat | Leading UAE food ordering | Partial | Partner/merchant API only (requires account) | API Key | Large | MED | L | Same as above; webhook-based |
| Deliveroo ME | Food delivery (UAE/KW/QA) | Partial | https://developers.deliveroo.com/ | OAuth2 | Medium | MED | M | Global API; ME coverage; order/menu management |
| Zomato UAE | Restaurant discovery | Partial | Deprecated public API (v2.1); no new API | API Key | Medium | LOW | — | India-focused; UAE presence declining |

---

### 4. POS / Retail Tech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Foodics | Restaurant POS (KSA-born, UAE strong) | Verified | https://console.foodics.com/docs (merchant API) | OAuth2 | Large | **HIGH** | M | 30,000+ restaurants; REST API for orders, inventory, reports; Marketplace with 100+ integrations |
| iKcon | UAE POS/inventory | Unknown | No public developer portal found | Unknown | Small | LOW | — | Local SME focus |
| POSRocket | Cloud POS (Jordan/UAE) | Partial | Docs referenced but not public | API Key | Small | LOW | S | Limited GCC presence |
| Loyyal | Blockchain loyalty (Abu Dhabi) | Unknown | No current public API | Unknown | Small | LOW | — | B2B loyalty infrastructure |

---

### 5. Banks with APIs

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Emirates NBD | Largest UAE bank | Verified | https://developer.emiratesnbd.com/ | OAuth2 | Large | **HIGH** | L | Open banking APIs: accounts, payments, transfers; sandbox available |
| FAB (First Abu Dhabi Bank) | UAE's biggest bank by assets | Partial | https://developers.fab.ae/ | OAuth2 | Large | **HIGH** | L | Open banking portal; UAE Open Finance framework |
| Mashreq Bank | Major UAE bank | Partial | https://developer.mashreq.com/ | OAuth2 | Large | MED | M | API marketplace; payment initiation; limited public sandbox |
| ADCB | Abu Dhabi Commercial Bank | Partial | Developer portal referenced; limited access | OAuth2 | Large | MED | M | Part of UAE Open Finance initiative |
| RAK Bank | Retail/SME focus | Unknown | No public API portal | Unknown | Medium | LOW | — | No open banking API found |
| DIB (Dubai Islamic Bank) | Islamic banking | Unknown | No public developer API | Unknown | Medium | LOW | — | Sharia-compliant; no public API |
| Network International | Payment processor/acquirer | Documented | https://developer.network.ae/ | API Key/OAuth2 | Large | HIGH | L | Acquired by Brookfield 2024; powers UAE merchant acquiring |

---

### 6. Payment Gateways

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Tap Payments | GCC payment gateway | **Verified** | https://developers.tap.company/ | API Key + HMAC | Large | **HIGH** | S | 100K+ merchants; REST API; 167 GitHub repos; mada/Apple Pay/Google Pay/STC Pay; covers UAE+KSA+QA |
| PayTabs | MENA payment orchestration | **Verified** | https://docs.paytabs.com/ | API Key (Profile ID + Server Key) | Large | **HIGH** | S | Saudi-built; iOS/Android/Flutter SDKs; Shopify/WooCommerce/Magento plugins; UAE, KSA, QA, EG |
| Amazon Payment Services (PayFort) | MENA payment gateway | **Verified** | https://paymentservices.amazon.com/docs/ | HMAC-SHA256 | Large | **HIGH** | M | Former PayFort; supports Tabby, Tamara BNPL; covers all GCC |
| Telr | UAE payment gateway | Verified | https://telr.com/support/developer-guide/ | API Key | Medium | MED | S | SME focus; UAE/Saudi/India; REST + plugins |
| Checkout.com | Global gateway (DIFC licensed) | Verified | https://www.checkout.com/docs | OAuth2 / API Key | Large | MED | S | Global API; Tamara BNPL integration; strong UAE enterprise |
| HyperPay | MENA gateway | Documented | https://hyperpay.com/documentation/ | API Key | Medium | MED | S | Jordan-born; UAE/KSA/EG presence |

---

### 7. Mobile Wallets

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Apple Pay UAE | Mobile wallet | Verified | Via payment gateway integrations (PayTabs, Tap, etc.) | Passthrough | Large | MED | S | No standalone MCP; integrate via gateway |
| Samsung Pay UAE | Mobile wallet | Partial | Via Samsung Pay API (Samsung developer portal) | API Key | Medium | LOW | S | Declining relevance vs Apple Pay |
| Careem Pay | Digital wallet in Careem app | Unknown | No public developer API | Unknown | Medium | LOW | — | Part of Careem super-app |
| PayBy (OPPO/UAE) | UAE digital wallet | Unknown | No public API portal | Unknown | Small | LOW | — | Limited to in-app |

---

### 8. Crypto / Fintech (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| BitOasis | UAE/MENA crypto exchange | Partial | https://developer.bitoasis.net/ (reference API) | API Key | Medium | MED | M | VARA-licensed (Dubai); REST trading API |
| Rain | GCC crypto (Bahrain-HQ, UAE ops) | Partial | https://www.rain.com/developer (limited) | API Key | Medium | MED | M | VARA-approved; institutional API |
| Sarwa | UAE robo-advisor/investing | Unknown | No public API | Unknown | Small | LOW | — | Consumer app only |
| Tabby | BNPL (UAE+KSA) | **Verified** | https://developers.tabby.ai/ | API Token | Large | **HIGH** | S | 14M users; 40K+ merchants; clean REST API; unicorn ($4.5B valuation 2025) |
| Tamara | BNPL (KSA+UAE) | **Verified** | https://docs.tamara.co/ | API Token | Large | **HIGH** | S | Saudi unicorn $1B+; Sharia-compliant; REST API with webhooks |
| Postpay | UAE BNPL | Partial | https://docs.postpay.io/ | API Key | Small | MED | S | 3-4 installment BNPL; Zip acquired |
| Beehive | P2P lending (DIFC) | Unknown | No public API | Unknown | Small | LOW | — | SME financing platform |

---

### 9. Insurance / InsurTech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Bayzat | UAE HR + insurance platform | Partial | HR API documented for partners | API Key | Medium | MED | M | Benefits + payroll + insurance SaaS; B2B API |
| Aman Insurance | UAE insurance | Unknown | No public API | Unknown | Medium | LOW | — | Traditional insurer; no dev program |
| Yallacompare | Insurance comparison (UAE) | Unknown | No public API | Unknown | Medium | LOW | — | Lead-gen model |
| Democrance | InsurTech B2B (UAE) | Unknown | No public API | Unknown | Small | LOW | — | API-first but enterprise only |

---

### 10. Courier / Last-Mile (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Aramex | Pan-regional courier (Dubai HQ) | **Verified** | https://www.aramex.com/us/en/developers-solution-center/apis | SOAP/API Key | Large | **HIGH** | M | Rate Calculator + Shipping + Tracking APIs; SOAP-based (legacy); GitHub SDK wrappers exist |
| Fetchr | UAE last-mile delivery | Partial | Partner API available; no public docs | API Key | Medium | MED | M | UAE-born; address-free delivery tech |
| J&T Express ME | Regional courier | Unknown | No public developer API for ME | Unknown | Medium | LOW | — | Asia-origin; growing GCC |
| DHL UAE | Global logistics | Verified | https://developer.dhl.com/ | API Key | Large | MED | S | Global DHL API; tracking + shipping |
| FedEx UAE | Global courier | Verified | https://developer.fedex.com/ | OAuth2 | Large | MED | S | Global FedEx API; REST |

---

### 11. Postal Services

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Emirates Post | UAE national postal service | Partial | https://emiratespost.ae/en/api-integration | API Key | Medium | MED | M | Tracking + shipment creation APIs; Arabic/English |

---

### 12. Freight / B2B Logistics

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Trukker | Digital trucking marketplace (UAE/KSA) | Partial | Partner API; no public docs | API Key | Medium | MED | M | On-demand trucking; REST API for enterprise partners |
| Careem for Business | B2B transport | Partial | https://developer.careem.com/ (business API referenced) | OAuth2 | Medium | MED | M | Fleet/B2B delivery; part of Careem super-app |
| Shipa Freight | Digital freight (Agility) | Partial | https://www.shipafreight.com/developers/ | API Key | Medium | MED | M | Instant freight quotes + booking API |

---

### 13. Warehousing / Fulfillment

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Fulfillment Bridge | Multi-channel fulfillment | Verified | https://api.fulfillmentbridge.com/docs/ | API Key | Small | MED | S | REST API; Shopify/WooCommerce/Salla integration |
| Shipa Delivery | Last-mile + fulfillment (Agility) | Partial | https://shipadelivery.com/api | API Key | Medium | MED | M | UAE/KSA/QA coverage |

---

### 14. CRM

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Zoho CRM (UAE) | Global CRM with UAE presence | **Verified** | https://www.zoho.com/crm/developer/docs/ | OAuth2 | Large | HIGH | M | Already has MCP server on GitHub (zoho-mcp); full REST API |
| Freshworks (UAE) | CRM/helpdesk | Verified | https://developer.freshworks.com/ | API Key / OAuth2 | Large | MED | M | REST API; webhooks; sandbox |
| HubSpot UAE | Global CRM | Verified | https://developers.hubspot.com/ | OAuth2 | Large | MED | S | Existing MCP servers on GitHub |

---

### 15. ERP

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Oracle Cloud (UAE) | ERP/HCM cloud | Verified | https://docs.oracle.com/en/cloud/saas/rest-api/ | OAuth2 | Large | MED | L | Complex; UAE data center; REST APIs |
| SAP (UAE/ME) | Enterprise ERP | Verified | https://api.sap.com/ | OAuth2 | Large | MED | L | SAP BTP APIs; ME customers |
| Odoo (UAE) | Open-source ERP | **Verified** | https://www.odoo.com/documentation/17.0/developer/ | API Key / JSON-RPC | Large | **HIGH** | M | JSON-RPC API; widely deployed UAE/KSA; community MCP server exists |

---

### 16. Accounting / Tax (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Wafeq | UAE/KSA cloud accounting (VAT-compliant) | Partial | Partner API (referenced but restricted) | API Key | Medium | **HIGH** | M | UAE VAT + ZATCA compliance; Arabic-first; growing fast |
| Zoho Books UAE | Cloud accounting | Verified | https://www.zoho.com/books/api/v3/ | OAuth2 | Medium | HIGH | M | Full REST API; UAE VAT reports |
| QuickBooks ME | Accounting | Verified | https://developer.intuit.com/ | OAuth2 | Medium | MED | M | Global API; UAE presence |
| FreshBooks UAE | Invoicing/accounting | Verified | https://www.freshbooks.com/api/ | OAuth2 | Small | MED | S | Global API |

---

### 17. Fiscal / E-Invoicing (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| UAE Federal Tax Authority (FTA) | VAT compliance portal | Partial | https://www.tax.gov.ae/ (portal; no public REST API yet) | Unknown | Large | **HIGH** | L | UAE e-invoicing mandate phasing in 2025-2026; PEPPOL-based; watch for API release |
| Peppol UAE (via accredited providers) | E-invoicing network | Partial | Via accredited access points | Certificate | Large | HIGH | L | UAE joining Peppol network; B2B invoicing mandate incoming |

---

### 18. EDI / Document Management

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Dubai Trade | DP World trade facilitation platform | Partial | https://www.dubaitrade.ae/api-marketplace | API Key | Medium | MED | M | Customs + trade docs + port services; REST APIs |
| Tradeling | B2B marketplace (MENA) | Unknown | No public API | Unknown | Small | LOW | — | B2B procurement |

---

### 19. HR / Recruiting (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Bayt.com | MENA's largest job portal (Dubai HQ) | Partial | https://api.bayt.com/ (documented; access by request) | API Key | Large | **HIGH** | M | Largest GCC job board; job posting + CV search API |
| GulfTalent | Professional jobs portal | Unknown | No public API | Unknown | Medium | LOW | — | Niche; no dev program |
| Bayzat | UAE HR platform (payroll + benefits) | Partial | Partner API for HRIS integration | API Key | Medium | HIGH | M | Automated payroll; WPS (Wage Protection System) compliance |
| ZenHR | Jordan/UAE HRMS | Partial | https://zenhcm.com/api/ | API Key | Small | MED | M | Arabic-first HRMS; REST API |
| MOHRE (Ministry of HR UAE) | Work permit + labor compliance | Partial | https://eservices.mohre.gov.ae/ (portal; limited API) | OAuth (UAE Pass) | Large | HIGH | L | WPS payroll verification; work permits; integration with UAE Pass |

---

### 20. Project Management (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| No significant UAE-specific PM tool found | — | — | — | — | — | — | — | Customers use Monday.com, Asana, Jira (global) |

---

### 21. SMS / Push / Notifications (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Unifonic | CPaaS: SMS, WhatsApp, Voice, Push | **Verified** | https://docs.unifonic.com/ | API Key | Large | **HIGH** | S | Saudi-born; UAE + GCC; full API docs; WhatsApp Business API; OTP; flow automation |
| Cequens | CPaaS (Egypt-HQ, UAE ops) | Verified | https://cequens.com/api-docs | API Key | Medium | HIGH | S | SMS + WhatsApp + Voice API; REST |
| du Telecom (Business API) | UAE telecom SMS | Partial | Enterprise partners only | Unknown | Medium | MED | M | Requires enterprise agreement |
| Etisalat/e& API | UAE telecom API | Partial | https://api.etisalat.ae/ (limited public) | API Key | Large | MED | M | SMS + IoT + network APIs; enterprise focus |
| Twilio (UAE) | Global CPaaS | Verified | https://www.twilio.com/docs | OAuth2/API Key | Large | MED | S | Global; existing MCP servers; UAE SIM support |

---

### 22. Email Marketing (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Mailchimp ME | Email marketing | Verified | https://mailchimp.com/developer/ | OAuth2 / API Key | Large | MED | S | Global; existing MCP servers |
| SendGrid (UAE) | Transactional email | Verified | https://docs.sendgrid.com/ | API Key | Large | MED | S | Global; existing MCP servers |
| No strong regional-only provider | — | — | — | — | — | — | — | Market dominated by global tools |

---

### 23. Advertising Platforms (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Snapchat Marketing API | #1 social platform GCC youth | Verified | https://businesshelp.snapchat.com/s/article/marketing-api | OAuth2 | Large | **HIGH** | M | Snapchat penetration >90% in GCC; Marketing API for campaigns/reporting |
| TikTok for Business API | Fast-growing GCC | Verified | https://business-api.tiktok.com/ | OAuth2 | Large | HIGH | M | Campaign management + analytics API |
| Meta (Facebook/Instagram) API | Social advertising | Verified | https://developers.facebook.com/docs/marketing-apis/ | OAuth2 | Large | MED | S | Global; existing MCP servers |
| Google Ads API | Search + display | Verified | https://developers.google.com/google-ads/api/ | OAuth2 | Large | MED | S | Global; existing MCP servers |

---

### 24. Social Media / Content (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| X (Twitter) API | High political/business usage GCC | Verified | https://developer.twitter.com/en/docs | OAuth2 | Large | MED | M | X API v2; paid tiers; high Arabic content |
| Snapchat | Dominant platform (see above) | Verified | See #23 | OAuth2 | Large | HIGH | — | Same API |
| LinkedIn UAE | Professional network | Verified | https://developer.linkedin.com/ | OAuth2 | Large | MED | S | Global API |

---

### 25. Analytics / BI (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Adjust (UAE ops) | Mobile attribution | Verified | https://dev.adjust.com/ | API Key | Large | MED | S | Global API; UAE mobile market strong |
| AppsFlyer | Mobile attribution | Verified | https://dev.appsflyer.com/ | API Key | Large | MED | S | Global API |
| No UAE-specific BI tool | — | — | — | — | — | — | — | Market uses Tableau, Power BI, Looker |

---

### 26. Cloud / Hosting (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| AWS Middle East (UAE Region) | Public cloud | Verified | https://docs.aws.amazon.com/ | AWS SigV4 | Large | HIGH | — | UAE region launched 2022 (ap-southeast-5 equivalent); existing MCP server |
| Microsoft Azure UAE | Public cloud | Verified | https://learn.microsoft.com/en-us/azure/ | OAuth2 | Large | HIGH | — | UAE North + UAE Central regions; $1.5B G42 investment |
| Google Cloud UAE | Public cloud | Verified | https://cloud.google.com/docs | OAuth2 | Large | MED | — | No UAE-dedicated region yet; MENA edge PoPs |
| Core42 (G42) | Sovereign cloud + AI (Abu Dhabi) | Verified | https://www.core42.ai/ → Compass API | API Key | Large | **HIGH** | L | UAE sovereign cloud; Compass API for LLM inference; GPT-OSS-120B; gov/enterprise focus; Microsoft partnership |
| Khazna (G42) | UAE data center platform | Unknown | Enterprise contracts only | Unknown | Large | MED | — | 70%+ UAE DC market share; infrastructure |

---

### 27. Telecom API / CPaaS (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Etisalat (e&) API | UAE telecom #1 | Partial | https://api.etisalat.ae/ | API Key | Large | MED | M | SMS, IoT, network slice; enterprise focus |
| du API | UAE telecom #2 | Partial | https://api.du.ae/ (developer portal exists) | API Key | Large | MED | M | CPaaS + IoT + network; enterprise |
| Unifonic | See #21 | Verified | https://docs.unifonic.com/ | API Key | Large | HIGH | S | — |

---

### 28. Maps / Geolocation (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Google Maps (UAE) | Maps + routing | Verified | https://developers.google.com/maps | API Key | Large | MED | S | Global; existing MCP servers |
| HERE Maps (UAE) | Enterprise mapping | Verified | https://developer.here.com/ | API Key / OAuth2 | Large | MED | S | Strong logistics/B2B use |
| what3words (UAE) | 3-word addressing | Verified | https://developer.what3words.com/ | API Key | Medium | MED | S | Dubai adopted officially; delivery routing |
| Bayanat (G42) | Geospatial data UAE | Unknown | Enterprise only | Unknown | Medium | LOW | — | Government geospatial; G42 subsidiary |

---

### 29. Government Services (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **UAE Pass** | National digital ID (govt + private) | **Verified** | https://docs.uaepass.ae/ | OAuth2 (OpenID Connect) | Large | **HIGH** | M | 8M+ users; Emirates ID + biometric; staging env available; .NET/Python GitHub libraries; production requires registration |
| DED (Dubai Economy) | Business licensing UAE | Partial | https://services.dubai.ae/ (iPaaS portal referenced) | OAuth (UAE Pass) | Large | HIGH | L | Business registration + license renewal APIs |
| Dubai Digital Authority | Government API marketplace | Partial | https://developer.dubai.gov.ae/portal/ | OAuth2 | Large | HIGH | L | 100+ government service APIs; iPaaS platform |
| ADDA / Abu Dhabi Gov | Abu Dhabi government services | Partial | https://www.adda.gov.ae/en | OAuth2 | Large | MED | L | Digital services portal |
| SEHA (healthcare) | UAE public healthcare | Unknown | No public API | Unknown | Large | MED | — | Abu Dhabi health authority |

---

### 30. Product Labeling / Track & Trace (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| GS1 UAE | Barcode + product standards | Partial | https://www.gs1uae.org/ (member portal) | API Key | Medium | MED | M | Product registry + barcode lookup |
| ESMA (Emirates Standard Authority) | Product conformity | Unknown | Regulatory portal only | Unknown | Medium | LOW | — | ECAS certification portal |

---

### 31. Real Estate (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Bayut | UAE's largest property portal | Partial | Unofficial API on RapidAPI (https://rapidapi.com/apidojo/api/bayut); no official API | API Key (unofficial) | Large | **HIGH** | M | 10M+ users; unofficial Bayut API has listings, agents, transactions; EMPG-owned |
| Property Finder | UAE/GCC real estate | Partial | Partner/agency API (requires account) | API Key | Large | HIGH | M | Leading portal; API for agencies only |
| Dubizzle | Classifieds incl. real estate | Partial | Unofficial scrapers | Unknown | Large | MED | M | EMPG (same as Bayut) |
| Dubai REST (RERA) | Dubai real estate regulatory | Partial | https://dubairest.com/ (transaction data API) | API Key | Medium | HIGH | L | Trakheesi permits; rental dispute; transaction data |

---

### 32. EdTech (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Noon Academy | Social learning (KSA-origin, UAE) | Unknown | No public API | Unknown | Medium | LOW | — | Consumer app |
| Almentor | Arabic e-learning | Unknown | No public API | Unknown | Small | LOW | — | Video-based learning |
| Coursera ME | Global platform | Verified | https://partner.coursera.org/ | OAuth2 | Large | MED | S | Global API |

---

### 33. Healthcare (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Vezeeta | Doctor booking (MENA) | Partial | Partner API for clinics | API Key | Medium | MED | M | Egypt-origin; UAE/KSA presence |
| Altibbi | Telemedicine Arabic | Unknown | No public API | Unknown | Medium | LOW | — | Jordan-based; UAE presence |
| DHA (Dubai Health Authority) | Digital health (Dubai) | Partial | https://www.dha.gov.ae/en/HealthRegulation (portal) | OAuth (UAE Pass) | Large | **HIGH** | L | Malaffi HIE platform; insurance pre-auth APIs (ClaimLinx); mandatory for providers |
| Malaffi | Abu Dhabi health data exchange | Unknown | Enterprise/HSP only | Certificate | Large | HIGH | XL | Abu Dhabi HIE; connects all health providers |

---

### 34. Transport / Ride-hailing (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Careem | Super-app rides/delivery (Uber subsidiary) | Partial | https://developer.careem.com/ | OAuth2 | Large | **HIGH** | L | UAE dominant; Pay/Food/Grocery APIs; super-app becoming financial platform |
| Uber ME | Ride-hailing | Verified | https://developer.uber.com/ | OAuth2 | Large | MED | M | Global API; UAE coverage |
| RTA Dubai | Dubai public transport | Partial | https://www.rta.ae/wps/portal/rta/ae/public-transport/api | API Key | Large | HIGH | M | Bus/Metro real-time API; taxi booking; Nol card integration |

---

### 35. Travel / Booking (UAE)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Almosafer | GCC travel booking (Seera Group) | Unknown | No public API | Unknown | Medium | MED | — | B2B via NDC/GDS |
| Wego | Travel meta-search (Singapore/UAE) | Partial | https://developers.wego.com/ | API Key | Medium | MED | M | Flight/hotel search API |
| Musafir | UAE travel OTA | Unknown | No public API | Unknown | Small | LOW | — | Traditional OTA |
| Emirates Airlines NDC | Direct airline API | Verified | https://developer.emirates.com/ | OAuth2 | Large | **HIGH** | L | NDC XML + JSON; seats, fares, booking; GCC flagship airline |
| Amadeus (MENA) | Global GDS | Verified | https://developers.amadeus.com/ | OAuth2 | Large | MED | M | Global GDS API; strong UAE travel sector |

---

### 36–38. Legal Tech / AgriTech / Construction (UAE)

| Company | What it does | API Status | Market Size | MCP Priority | Notes |
|---------|-------------|------------|-------------|-------------|-------|
| No major UAE LegalTech API found | — | — | — | — | Market nascent; Lexis/Westlaw global |
| Pure Harvest Smart Farms (UAE) | AgriTech controlled-environment | Unknown | Small | LOW | Seed stage; no public API |
| Procore (UAE construction) | Construction management | Verified | https://developers.procore.com/ | OAuth2 | Medium | MED | Global API; UAE used by contractors |
| Yardi (real estate/construction) | PropTech/ERP | Verified | https://developer.yardi.com/ | OAuth2 | Medium | MED | Global; strong UAE developer/property mgmt |

---

---

## SAUDI ARABIA

### Market Overview
- **Population:** 36M | **Internet penetration:** 99% | **5G coverage:** 78%
- **Dominant payments:** Mada (national debit network, 30M+ cards) + STC Pay + Tabby/Tamara BNPL
- **API language:** English + Arabic; ZATCA mandates Arabic invoicing
- **Regulatory notes:** SAMA (Saudi Central Bank) licenses fintechs; ZATCA e-invoicing (Fatoora) mandatory for all VAT-registered businesses; PDPL (Personal Data Protection Law) enforced; Vision 2030 digital transformation; NPC processed $52.6B e-commerce in 2024 (+25.8% YoY)

---

### 1. E-commerce / Marketplaces (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Salla** | Saudi e-commerce enablement (#1 in KSA) | **Verified** | https://docs.salla.dev/ | OAuth2 (token-based) | Large | **HIGH** | M | 68K+ merchants; $13B+ sales; pre-IPO ($130M raised 2024); products/orders/customers/shipments API; ZATCA compliant; partner marketplace |
| **Zid** | Saudi e-commerce platform | Verified | https://docs.zid.sa/ | API Key | Large | **HIGH** | M | "Total Commerce" vision; TikTok Shop + Amazon integrations; logistics API; $59M raised |
| Amazon.sa | Saudi Amazon | Documented | https://developer.amazonservices.com/ | OAuth2 | Large | HIGH | M | SP-API same as global; strong KSA GMV |
| Noon KSA | GCC marketplace | Partial | Seller portal; no public API | API Key | Large | MED | M | Adyen powers payments since 2024 |
| Jarir Bookstore | Saudi retail/electronics | Unknown | No public API | Unknown | Large | LOW | — | Brick-and-mortar dominant; e-commerce growing |

---

### 2. Grocery & Food Delivery (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| HungerStation | Saudi food delivery #1 | Unknown | No public API | Unknown | Large | MED | — | Delivery Hero subsidiary |
| Nana | Saudi grocery delivery | Partial | Merchant integration only | Unknown | Medium | MED | M | 30+ dark stores in Riyadh; AI demand-forecasting |
| Talabat KSA | Food/grocery delivery | Partial | Partner API only | Unknown | Large | MED | M | Delivery Hero; same as UAE |
| Jahez | Saudi food delivery | Unknown | No public API | Unknown | Medium | MED | — | IPO'd on Nomu 2022; Saudi-only |

---

### 3. Restaurant / Food Ordering (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Foodics** | Restaurant POS/RMS (Saudi HQ) | **Verified** | https://console.foodics.com/docs | OAuth2 | Large | **HIGH** | M | 30K+ restaurants MENA; ZATCA-compliant POS; Foodics Pay; SAMA-licensed fintech; $170M Series C |
| Jahez | Food delivery (KSA IPO) | Unknown | No public API | Unknown | Medium | LOW | — | — |
| HungerStation | Food delivery | Unknown | No public API | Unknown | Large | LOW | — | — |

---

### 4. POS / Retail Tech (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Foodics | See #3 | Verified | https://console.foodics.com/docs | OAuth2 | Large | **HIGH** | M | — |
| Geidea | Saudi POS + payment | Verified | https://docs.geidea.net/ | API Key | Large | **HIGH** | M | SAMA-licensed; 150K+ merchants; Tabby/Tamara integrations; SoftPOS |
| POSRocket | Cloud POS | Partial | Limited docs | API Key | Small | LOW | — | Jordan-origin; limited KSA |

---

### 5. Banks with APIs (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Al Rajhi Bank | Largest Islamic bank globally | Partial | https://developer.alrajhibank.com.sa/ | OAuth2 | Large | **HIGH** | L | Open banking portal; SAMA mandate; transfers + accounts |
| SNB (Saudi National Bank) | KSA largest bank by assets | Partial | Open banking API (SAMA framework) | OAuth2 | Large | HIGH | L | Invested in Tamara; digital bank pivot |
| Riyad Bank | Major KSA bank | Partial | Open banking initiative | OAuth2 | Large | MED | M | SAMA open banking participant |
| Arab National Bank | KSA commercial bank | Unknown | No public developer portal | Unknown | Medium | LOW | — | |
| STC Bank | Saudi's first digital bank (STC) | Partial | https://developer.stcbank.com.sa/ | OAuth2 | Medium | **HIGH** | M | Digital-native; integrated with Salla; SAMA-licensed |

---

### 6. Payment Gateways (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Moyasar** | Saudi-first payment gateway | **Verified** | https://docs.moyasar.com/ | API Key | Large | **HIGH** | S | Mada + Visa + MC + Apple Pay + Samsung Pay; PHP/Node/.NET/Flutter SDKs on GitHub; PCI DSS L1; sandbox; acquiring license (MPG) |
| Tap Payments | GCC gateway (see UAE) | Verified | https://developers.tap.company/ | API Key | Large | HIGH | S | mada-certified; 100K+ KSA merchants |
| PayTabs | Payment orchestration | Verified | https://docs.paytabs.com/ | API Key | Large | HIGH | S | Saudi-founded; full KSA coverage |
| HyperPay | MENA gateway | Verified | https://hyperpay.com/documentation/ | API Key | Medium | MED | S | mada + STC Pay support |
| Amazon Payment Services | MENA gateway | Verified | https://paymentservices.amazon.com/docs/ | HMAC | Large | HIGH | M | BNPL (Tabby+Tamara) integrations |
| Geidea | POS + online payment | Verified | https://docs.geidea.net/ | API Key | Large | HIGH | M | Saudi-native; 150K merchants; SAMA-licensed |

---

### 7. Mobile Wallets (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **STC Pay** | Saudi's largest digital wallet | Partial | https://developer.stcpay.com.sa/ (partner API) | OAuth2 | Large | **HIGH** | M | 10M+ users; Apple Pay on Mada; Samsung Pay; P2P + merchant payments; requires partnership |
| urpay | Digital wallet (Al Rajhi) | Unknown | No public API | Unknown | Medium | LOW | — | Integrated in PayTabs |
| Mada Pay | National payment (SAMA) | Partial | Via banks/gateways | Passthrough | Large | HIGH | M | 30M+ cards; NPC integration; key for KSA e-commerce |

---

### 8. Crypto / Fintech (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Tamara** | KSA BNPL unicorn | **Verified** | https://docs.tamara.co/ | API Token | Large | **HIGH** | S | 20M users; $1B valuation; Sharia-compliant; REST API; Salla/Shopify integrations |
| **Tabby** | BNPL (HQ moved to KSA 2023) | **Verified** | https://developers.tabby.ai/ | API Token | Large | **HIGH** | S | $4.5B valuation 2025; IPO-track on Tadawul; 14M users; 40K+ retailers |
| Tweeq | Saudi digital wallet (acquired by Tabby 2024) | Partial | Integrated into Tabby ecosystem | OAuth2 | Medium | MED | M | Licensed by SAMA; spending accounts + cards |
| Rain KSA | Crypto exchange | Partial | Partner API | API Key | Medium | MED | M | Bahrain license; KSA operations |
| Wathiq | Saudi fintech (SME lending) | Unknown | No public API | Unknown | Small | LOW | — | SAMA sandbox participant |

---

### 9. Insurance / InsurTech (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Bupa Arabia | Health insurance (KSA #1) | Unknown | Enterprise integration only | Unknown | Large | MED | — | Mandatory health insurance KSA |
| Tawuniya | Saudi insurance | Partial | B2B partner API for brokers | API Key | Large | MED | M | Largest Saudi insurer; digital transformation |
| Rasan | InsurTech aggregator (Tameeni) | Partial | https://tameeni.com/ (developer section) | API Key | Medium | **HIGH** | M | Mandatory motor insurance aggregation; API for brokers; car insurance comparison |

---

### 10. Courier / Last-Mile (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| SMSA Express | Saudi national courier | Partial | https://api.smsa.com.sa/ | API Key | Large | **HIGH** | M | Saudi Post subsidiary; shipment creation + tracking REST API |
| Aramex KSA | See UAE section | Verified | https://www.aramex.com/ developer center | SOAP/API Key | Large | HIGH | M | Same API as UAE |
| J&T Express KSA | Last-mile delivery | Unknown | No public KSA developer API | Unknown | Medium | LOW | — | Growing |
| Naqel Express | Saudi courier (Aramex JV) | Partial | Merchant integration via Salla/Zid | API Key | Medium | MED | M | Key for Saudi e-commerce fulfillment |
| Shipa Delivery | Last-mile (Agility) | Partial | https://shipadelivery.com/api | API Key | Medium | MED | M | KSA coverage |

---

### 11. Postal Services (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Saudi Post (SPL) | National postal + logistics | Partial | https://spl.com.sa/en/developer | API Key | Large | **HIGH** | M | Tracking + shipping API; massive B2C e-commerce; ZATCA address database integration |

---

### 12. Freight / B2B Logistics (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Trukker | Digital trucking (Dubai/KSA) | Partial | Partner API | API Key | Medium | MED | M | B2B on-demand trucking |
| Sari (Saudi logistics) | Marketplace logistics | Unknown | No public API | Unknown | Medium | LOW | — | Government-backed logistics |

---

### 13. Warehousing / Fulfillment (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| IQ Fulfillment | Saudi e-commerce fulfillment | Unknown | No public API | Unknown | Small | LOW | — | Growing |
| Fulfillment Bridge | Multi-channel (KSA node) | Verified | https://api.fulfillmentbridge.com/docs/ | API Key | Small | MED | S | Same global API |

---

### 14. CRM (KSA)

Same global tools as UAE — Zoho (already has MCP server), Freshworks, HubSpot, Salesforce. HIGH priority for integration.

---

### 15–16. ERP / Accounting (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Wafeq** | KSA/UAE cloud accounting | Partial | Partner API (request access) | API Key | Medium | **HIGH** | M | ZATCA-compliant; Arabic-first; fastest-growing KSA accounting SaaS |
| Odoo KSA | ERP (ZATCA partner) | Verified | https://www.odoo.com/documentation/ | API Key/JSON-RPC | Large | HIGH | M | ZATCA-certified Odoo partner ecosystem |
| Quickbooks KSA | Accounting | Verified | https://developer.intuit.com/ | OAuth2 | Medium | MED | M | Global API |
| ZATCA Developer Portal | VAT + e-invoicing integration | **Verified** | https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers/ | Certificate (CSID) | Large | **HIGH** | L | MANDATORY for all VAT-registered KSA businesses; production API: gw-fatoora.zatca.gov.sa; compliance + reporting + clearance endpoints |

---

### 17. Fiscal / E-Invoicing (KSA) ← HIGHEST PRIORITY CATEGORY

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **ZATCA Fatoora** | Mandatory e-invoicing (all VAT businesses) | **Verified** | https://zatca.gov.sa/en/E-Invoicing/ + https://zatca1.discourse.group/ | Certificate (CSID) + HMAC | Large | **HIGH** | L | Production endpoints: gw-fatoora.zatca.gov.sa/e-invoicing/core/; 2-phase rollout mandatory; XML/UBL format; clearance model for B2B; reporting for B2C; developer community forum; SDK available; every KSA business must integrate |

---

### 18. EDI / Document Management (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Maroof (MCIT) | Commercial registry verification | Partial | https://maroof.sa/api (referenced) | API Key | Large | HIGH | M | Verify registered KSA businesses; used by e-commerce platforms |

---

### 19. HR / Recruiting (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Bayt.com** | MENA job portal (KSA largest) | Partial | https://api.bayt.com/ | API Key | Large | **HIGH** | M | Job posting + CV matching API |
| Qureos | AI recruiting (UAE/KSA) | Partial | https://api.qureos.com/ | API Key | Small | MED | S | AI-powered matching |
| Glowork | Saudi women's job platform | Unknown | No public API | Unknown | Small | MED | M | Vision 2030 female workforce initiative |
| **MHRSD (Absher for Work)** | Saudi labor portal + Absher ID | Partial | https://eservices.mlsd.gov.sa/ | OAuth2 (Nafath) | Large | **HIGH** | L | Work permits, Iqama verification; WPS compliance; Absher integration |

---

### 20. Project Management (KSA)

No KSA-specific tools. Market uses Monday.com, Asana, Jira.

---

### 21. SMS / Push / Notifications (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Unifonic** | CPaaS (KSA HQ, Riyadh) | **Verified** | https://docs.unifonic.com/ | API Key | Large | **HIGH** | S | Saudi-born; SMS + WhatsApp + Voice + Push; OTP automation; Flow Studio no-code; Arabic support |
| Cequens | CPaaS | Verified | https://cequens.com/api-docs | API Key | Medium | MED | S | Egypt-origin; KSA operations |
| STC API | Telecom CPaaS | Partial | Enterprise only | Unknown | Large | MED | M | Requires STC business agreement |
| Mobily API | Telecom #2 KSA | Partial | Enterprise only | Unknown | Large | MED | M | Foodics partnership announced LEAP 2024 |

---

### 22–25. Marketing / Social (KSA)

Same as UAE section. Snapchat penetration even higher in KSA (>90% of youth). TikTok Shop integrations with Salla/Zid in 2024. X (Twitter) high Arabic political/business usage.

---

### 26. Cloud / Hosting (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| AWS KSA | Cloud (Riyadh region) | Verified | https://docs.aws.amazon.com/ | AWS SigV4 | Large | HIGH | — | $5.3B AWS investment announced; ME-Central-1 region |
| Azure KSA | Cloud (MCIT partnership) | Verified | https://azure.microsoft.com/ | OAuth2 | Large | HIGH | — | Azure regions in KSA; Vision 2030 alignment |
| STC Cloud | Saudi sovereign cloud | Partial | https://cloud.stc.com.sa/ | API Key | Medium | **HIGH** | L | Saudi telecom-backed cloud; data sovereignty; government preferred |
| Oracle Cloud KSA | ERP + Cloud | Verified | https://docs.oracle.com/ | OAuth2 | Large | MED | L | Saudi region investment |
| Alibaba Cloud KSA | Cloud | Verified | https://www.alibabacloud.com/en | API Key | Medium | MED | M | Growing KSA presence |

---

### 27. Telecom API / CPaaS (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| STC API | Saudi Telecom API platform | Partial | Developer portal (enterprise registration required) | API Key | Large | MED | M | SMS + IoT + network APIs |
| Mobily API | Zain/Mobily telecom | Partial | Enterprise only | Unknown | Large | LOW | — | — |
| Unifonic | See #21 | Verified | https://docs.unifonic.com/ | API Key | Large | HIGH | S | — |

---

### 28. Maps / Geolocation (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Google Maps KSA | Maps | Verified | https://developers.google.com/maps | API Key | Large | MED | S | — |
| what3words KSA | 3-word addressing | Verified | https://developer.what3words.com/ | API Key | Medium | MED | S | Saudi Post uses for delivery |
| Barikah | Saudi local maps/POI | Unknown | No public API | Unknown | Small | LOW | — | Local alternative |

---

### 29. Government Services (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Absher** | Saudi digital identity platform | Partial | https://www.absher.sa/ (portal only; no direct API) | SMS OTP + login | Large | **HIGH** | XL | 20M+ users; ID verification, Iqama, work permits; government integration required; no standard OAuth; requires MCIT agreement |
| **Nafath** | Saudi national digital authentication | Partial | Nafath SDK (iOS/Android) for SP integration | OAuth-like + biometric | Large | **HIGH** | L | Saudi equivalent of UAE Pass; national ID verification; SPs must register with NCA |
| **ZATCA** | Tax authority | Verified | https://zatca.gov.sa/en/E-Invoicing/ | Certificate | Large | **HIGH** | L | See e-invoicing above |
| Tawakkalna | Saudi health/ID app | Unknown | No public API | Unknown | Large | MED | — | Post-COVID health app; gov only |
| Maroof (MCIT) | Business verification | Partial | https://maroof.sa/ | API Key | Large | HIGH | M | — |
| SABER | Product conformity (SASO) | Partial | https://saber.org.sa/ (portal; importer API) | API Key | Large | **HIGH** | L | Mandatory for most imported goods; conformity certificates; SASO enforcement |

---

### 30. Product Labeling / Track & Trace (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **SABER (SASO)** | Product conformity KSA | **Verified** | https://saber.org.sa/api (importer integration) | API Key | Large | **HIGH** | M | All imported products need SABER certificate; mandatory; importer + shipper API |
| GS1 Saudi | Barcode + product registry | Partial | https://gs1sa.org/ | API Key | Medium | MED | M | Barcode lookup; product information |

---

### 31. Real Estate (KSA)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Aqar | Saudi real estate portal | Partial | No public API | Unknown | Large | MED | M | Bayut (EMPG) KSA brand |
| Ejar | Saudi rental platform (govt) | Unknown | No public API | Unknown | Large | **HIGH** | L | Government rental contract platform; mandatory for KSA rentals; Saudi government |
| Sakani (NHC) | Saudi government housing | Unknown | Government integration only | Unknown | Large | HIGH | — | National Housing Company; Vision 2030 |

---

### 32–38. Industry Verticals (KSA)

| Vertical | Company | API Status | MCP Priority | Notes |
|----------|---------|------------|-------------|-------|
| EdTech | Noon Academy | Unknown | LOW | Arabic learning; no API |
| EdTech | Almentor | Unknown | LOW | Video Arabic learning |
| Healthcare | Seha (KSA) | Unknown | MED | Saudi digital health; Nphies API for insurance claims |
| Healthcare | Nphies | Partial | **HIGH** | Saudi national health information exchange; insurance pre-auth; MANDATORY for providers |
| Healthcare | Vezeeta | Partial | MED | Doctor booking; partner API |
| Transport | Careem KSA | Partial | HIGH | Super-app; rides + food + pay |
| Transport | Jeeny (formerly InDriver KSA) | Unknown | MED | Ride-hailing; no public API |
| Travel | Almosafer (Seera) | Unknown | MED | B2B via GDS |
| Travel | Saudi Tourism | Unknown | MED | Visitwithus.sa platform |
| AgriTech | Red Sea Farms | Unknown | LOW | R&D; no public API |
| Construction | Building Materials Saudi | Unknown | LOW | Nascent |

---

---

## QATAR

### Market Overview
- **Population:** 2.9M (88% expats) | **Internet penetration:** 99%+
- **Dominant payments:** QNB cards + Visa/MC + Apple Pay; QAR currency
- **API language:** English primary
- **Regulatory notes:** Qatar Central Bank (QCB) oversees fintech; Qatar Financial Centre (QFC) hosts international firms; advanced fiber broadband; small but wealthy market; FIFA 2022 accelerated digital infrastructure

---

### 1–4. Commerce / POS (Qatar)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Talabat Qatar | Food/grocery delivery #1 | Partial | Partner API only | Unknown | Large | MED | M | Delivery Hero; market-dominant |
| Snoonu | Qatar food delivery (local) | Unknown | No public API | Unknown | Medium | LOW | — | Locally-backed competitor to Talabat |
| Noon Qatar | Marketplace | Partial | Seller portal | API Key | Medium | LOW | — | Small market; UAE-focused |
| Foodics Qatar | Restaurant POS | Verified | https://console.foodics.com/docs | OAuth2 | Medium | HIGH | S | Same API as KSA/UAE |

---

### 5. Banks with APIs (Qatar)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **QNB (Qatar National Bank)** | Qatar's largest bank; pan-MENA | Partial | https://developer.qnb.com/ | OAuth2 | Large | **HIGH** | L | Open banking initiative; transfers + accounts; QCB compliance; also operations in UAE, KSA, Egypt |
| Commercial Bank Qatar | Major retail bank | Unknown | No public developer portal | Unknown | Medium | LOW | — | — |
| QIIB | Islamic bank Qatar | Unknown | No public API | Unknown | Medium | LOW | — | — |
| Masraf Al Rayan | Islamic bank | Unknown | No public API | Unknown | Medium | LOW | — | — |

---

### 6. Payment Gateways (Qatar)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **PayTabs Qatar** | MENA gateway (Doha Bank partnership) | **Verified** | https://docs.paytabs.com/ | API Key | Large | **HIGH** | S | QAR currency; Doha Bank settlement; same API as UAE/KSA |
| Tap Payments Qatar | GCC gateway | Verified | https://developers.tap.company/ | API Key | Medium | HIGH | S | Same API; QAR support |
| QPay | Qatar national payment (QPAY) | Partial | Enterprise/bank integration | Unknown | Large | HIGH | L | QCB-mandated; local QR payments |
| NAPS (National ATM/POS) | Qatar interbank network | Unknown | Enterprise only | Unknown | Large | MED | — | Legacy infrastructure |

---

### 7–9. Fintech / Wallets / Insurance (Qatar)

| Company | What it does | API Status | Market Size | MCP Priority | Notes |
|---------|-------------|------------|-------------|-------------|-------|
| Ooredoo Money | Telecom wallet Qatar | Unknown | Medium | MED | Mobile wallet; no public API |
| Tabby Qatar | BNPL | Verified | Medium | HIGH | Same API; limited Qatar rollout |
| Tamara Qatar | BNPL | Verified | Small | MED | Limited Qatar presence |
| QLM Life Insurance | Qatar insurance | Unknown | Medium | LOW | No public API |

---

### 10. Courier / Last-Mile (Qatar)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Qatar Post | National postal | Partial | https://qatarpost.com/api | API Key | Medium | **HIGH** | M | Tracking + shipping creation API; official integration for merchants |
| Aramex Qatar | Regional courier | Verified | Same as UAE/KSA | SOAP/API Key | Medium | HIGH | S | Same API |
| DHL Qatar | Global courier | Verified | https://developer.dhl.com/ | API Key | Medium | MED | S | Same global API |

---

### 11. Postal Services (Qatar)

| Company | What it does | API Status | Notes |
|---------|-------------|------------|-------|
| Qatar Post | National postal | Partial | Tracking + shipping API; official merchant portal |

---

### 12–13. Freight / Warehousing (Qatar)

Limited market. Agility/Shipa has Qatar operations. Orbital (Qatar-based logistics) has no public API.

---

### 14–16. Business Software (Qatar)

Same global tools as UAE/KSA. Zoho, Odoo, SAP/Oracle all have Qatar customers with same APIs.

---

### 17. Fiscal / E-Invoicing (Qatar)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Qatar General Tax Authority | VAT (5% enacted 2024) | Unknown | No public API yet | Unknown | Large | **HIGH** | XL | Qatar introduced VAT Jan 2024; e-invoicing mandate expected; watch for MOCI/QGTA API release |

---

### 19. HR / Recruiting (Qatar)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Bayt.com Qatar | Job portal | Partial | Same API as UAE/KSA | API Key | Medium | MED | S | Same global API |
| MOCI Qatar | Ministry of Commerce labor | Unknown | Hukoomi integration | Unknown | Medium | MED | — | — |

---

### 21. SMS / Notifications (Qatar)

| Company | What it does | API Status | Notes |
|---------|-------------|------------|-------|
| Ooredoo API Qatar | Telecom CPaaS | Partial | Enterprise agreements; SMS + IoT |
| Unifonic Qatar | CPaaS | Verified | Same API; Qatar coverage |
| Cequens Qatar | CPaaS | Verified | Qatar coverage |

---

### 26. Cloud / Infrastructure (Qatar)

| Company | What it does | API Status | Notes |
|---------|-------------|------------|-------|
| AWS (no Qatar region) | Cloud | Via UAE/Bahrain edge | — |
| Ooredoo Cloud | Qatar telecom cloud | Partial | Enterprise only; limited API |
| Microsoft Azure Qatar | Cloud (announced) | Partial | Planned Qatar datacenter |

---

### 27. Telecom API (Qatar)

| Company | What it does | API Status | Notes |
|---------|-------------|------------|-------|
| **Ooredoo Qatar** | National telecom + fintech | Partial | CPaaS + IoT + network APIs; developer registration required |
| Vodafone Qatar | Telecom #2 | Partial | Business API; limited public |

---

### 28. Maps / Geolocation (Qatar)

Google Maps + HERE Maps standard. Metrash2 (government app) has no public API.

---

### 29. Government Services (Qatar)

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Hukoomi** | Qatar government portal | Partial | https://www.hukoomi.gov.qa/en/api | API Key | Large | **HIGH** | L | Business registration + government services; national API gateway; requires registration |
| Metrash2 | Qatar digital ID app | Unknown | Government integration only | Unknown | Large | HIGH | XL | Qatar's Absher equivalent; visa + ID + permits; no public API |
| Baladiya | Qatar municipal services | Unknown | No public API | Unknown | Medium | LOW | — | — |

---

### 31. Real Estate (Qatar)

| Company | What it does | API Status | Notes |
|---------|-------------|------------|-------|
| Property Finder Qatar | Real estate portal | Partial | Same as UAE; agency API |
| Qatar Real Estate Portal | Government MREWA portal | Unknown | Government data; no public API |
| Bayut Qatar | EMPG portal | Partial | Limited Qatar presence |

---

### 32–38. Industry Verticals (Qatar)

| Vertical | Company | API Status | MCP Priority | Notes |
|----------|---------|------------|-------------|-------|
| Healthcare | Hamad Medical Corp | Unknown | HIGH | Qatar national health; no public API |
| Healthcare | Sidra Medicine | Unknown | MED | Research hospital; no public API |
| Transport | Karwa (Qatar taxi) | Unknown | MED | Government transport; no API |
| Transport | Uber Qatar | Verified | MED | Same global API |
| Travel | Qatar Airways NDC | Verified | **HIGH** | https://developer.qatarairways.com/ — NDC XML + REST; full booking API; Qatar Airways is global carrier |
| Travel | Wego Qatar | Partial | MED | Same as UAE |
| EdTech | None significant | — | LOW | — |

---

---

## 🏆 TOP 20 MCP PRIORITY LIST — ALL THREE COUNTRIES

Ranked by combination of: API quality, market size, business impact, implementation urgency, and MCP ecosystem gap.

| Rank | Company | Country | Category | Why HIGH Priority | API Quality | Est. Hours |
|------|---------|---------|----------|------------------|-------------|------------|
| 1 | **ZATCA Fatoora** | 🇸🇦 KSA | E-Invoicing | MANDATORY for every VAT-registered KSA business; no existing MCP server; massive market need; REST + certificate auth | Verified | L |
| 2 | **UAE Pass** | 🇦🇪 UAE | Gov Identity | National digital ID; 8M+ users; OAuth2; enables identity verification for all UAE digital services | Verified | M |
| 3 | **Salla** | 🇸🇦 KSA | E-commerce | 68K+ merchants; $13B+ sales; pre-IPO; clean REST API; biggest KSA e-commerce platform | Verified | M |
| 4 | **Tap Payments** | 🇦🇪🇸🇦🇶🇦 All 3 | Payment Gateway | 100K+ merchants all GCC; 167 GitHub repos; best-in-class dev experience; covers mada/Apple Pay/Google Pay | Verified | S |
| 5 | **Tamara** | 🇸🇦 KSA | BNPL | Saudi unicorn; 20M users; Sharia-compliant; mandatory BNPL for KSA e-commerce; clean API | Verified | S |
| 6 | **Tabby** | 🇦🇪🇸🇦 UAE+KSA | BNPL | $4.5B valuation; 14M users; 40K retailers; IPO-track; regional BNPL leader | Verified | S |
| 7 | **Moyasar** | 🇸🇦 KSA | Payment Gateway | KSA-native; Mada specialist; PCI DSS L1; Samsung Pay first; GitHub SDKs; clean docs | Verified | S |
| 8 | **Unifonic** | 🇸🇦🇦🇪 KSA+UAE | CPaaS | Saudi HQ; SMS + WhatsApp + Voice + OTP; Arabic support; enterprise GCC comms | Verified | S |
| 9 | **PayTabs** | 🇸🇦🇦🇪🇶🇦 All 3 | Payment Gateway | Saudi-built; all GCC coverage; iOS/Android/Flutter SDKs; orchestration platform | Verified | S |
| 10 | **Emirates NBD** | 🇦🇪 UAE | Banking | Largest UAE bank; verified open banking API; accounts + payments + transfers; sandbox | Verified | L |
| 11 | **Aramex** | 🇦🇪🇸🇦 All | Logistics | Pan-regional courier; Shipping + Tracking + Rate APIs; 40+ years regional data | Verified | M |
| 12 | **Foodics** | 🇸🇦🇦🇪 KSA+UAE | Restaurant POS | 30K+ restaurants; SAMA-licensed fintech; ZATCA-compliant; Marketplace 100+ apps | Verified | M |
| 13 | **Zid** | 🇸🇦 KSA | E-commerce | Saudi e-commerce #2; logistics API; TikTok/Amazon integrations; $59M funded | Verified | M |
| 14 | **Absher / Nafath** | 🇸🇦 KSA | Gov Identity | 20M+ users; Iqama + work permits; MHRSD integration; no existing MCP server | Partial | XL |
| 15 | **Core42 (G42)** | 🇦🇪 UAE | Sovereign AI/Cloud | Compass API for LLM inference; GPT-OSS models; sovereign cloud UAE; Microsoft/OpenAI partnership | Verified | L |
| 16 | **QNB** | 🇶🇦 Qatar | Banking | Qatar's largest bank; open banking API; pan-MENA operations; QCB compliance | Partial | L |
| 17 | **SMSA Express** | 🇸🇦 KSA | Logistics | Saudi national courier; REST API; Salla/Zid integration; essential for KSA e-commerce | Partial | M |
| 18 | **Hukoomi** | 🇶🇦 Qatar | Gov Services | Qatar national API gateway; business registration + government services; unique Qatar angle | Partial | L |
| 19 | **Qatar Airways NDC** | 🇶🇦 Qatar | Travel | Global airline; NDC + REST booking API; massive travel market GCC | Verified | L |
| 20 | **SABER (SASO)** | 🇸🇦 KSA | Compliance | Mandatory product conformity for all KSA imports; importer API; no existing MCP server | Verified | M |

---

## IMPLEMENTATION NOTES

### Quick Wins (S = 8-20 hours, already have strong APIs)
- Tap Payments, PayTabs, Moyasar, Tabby, Tamara, Unifonic — all have clean REST APIs, GitHub SDKs, sandbox environments

### Strategic Priorities (M = 20-60 hours, high business value)
- Salla, Zid, Aramex, Foodics, SMSA Express, Bayt.com, Qatar Post, SABER

### Complex Integrations (L/XL = 60h+, compliance-heavy)
- ZATCA Fatoora (certificate auth, XML/UBL format — but HIGHEST business need in KSA)
- UAE Pass (OAuth2 + UAE gov registration required)
- Absher/Nafath (government partnership required, complex auth)
- Emirates NBD / QNB (open banking OAuth2 + banking compliance)

### Watch List (APIs Coming Soon)
- UAE FTA e-invoicing (mandate rolling out 2025-2026; PEPPOL-based)
- Qatar VAT API (5% VAT introduced Jan 2024; e-invoicing expected)
- Ejar (Saudi rental contracts — government platform, high regulatory need)
- Nphies (Saudi health insurance claims — mandatory for healthcare providers)

### Existing MCP Servers to Avoid Duplicating
- Zoho CRM (zoho-mcp on GitHub)
- Global tools: HubSpot, Salesforce, Shopify (already well-covered)
- AWS, Azure, Google Cloud (already have MCP servers)

---

*Research conducted April 2026. API status verified against live developer portals. All URLs should be re-verified before implementation as portals update frequently.*
