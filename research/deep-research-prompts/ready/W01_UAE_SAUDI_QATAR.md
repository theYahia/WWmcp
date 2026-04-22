# Deep Research: MCP Candidates — UAE + Saudi Arabia + Qatar

You are a senior technology market analyst. Conduct deep research on companies and services in **UAE, Saudi Arabia, and Qatar** that are strong candidates for MCP (Model Context Protocol) server implementations.

An MCP server is a standardized integration layer that lets AI assistants (Claude, GPT, etc.) interact with external services via their APIs — read data, trigger actions, automate workflows.

## COUNTRIES

1. **UAE** — Dubai/Abu Dhabi tech hub, massive fintech, Russian business community, BRICS member
2. **Saudi Arabia** — Vision 2030 digital transformation, $14.9B AI investments, BRICS member
3. **Qatar** — Advanced digital infrastructure, wealthy small market

## RESEARCH REQUIREMENTS

For each country, investigate ALL of these 30 categories. **Actually visit API documentation pages**, check GitHub for existing SDKs, verify endpoints are live.

### A. COMMERCE & MARKETPLACES
1. E-commerce / Marketplaces (Noon, Amazon.ae, Namshi, Mumzworld, Jarir, Salla, Zid, etc.)
2. Grocery & Food Delivery (Talabat, Careem, InstaShop, Nana, HungerStation, etc.)
3. Restaurant / Food Ordering (Talabat, Deliveroo ME, Jahez, etc.)
4. POS / Retail Tech (Foodics, iKcon, POSRocket, Loyyal, etc.)

### B. FINANCE & PAYMENTS
5. Banks with APIs (Emirates NBD, FAB, Mashreq, ADCB, Al Rajhi, SNB, QNB, etc.)
6. Payment Gateways (Telr, PayTabs, Tap Payments, HyperPay, Moyasar, PayFort/Amazon Payment Services, etc.)
7. Mobile Wallets (Apple Pay ME, Samsung Pay, STC Pay, Careem Pay, etc.)
8. Crypto / Fintech (Rain, BitOasis, Sarwa, Beehive, Tamara BNPL, Tabby, etc.)
9. Insurance / InsurTech (Aman, Bayzat, etc.)

### C. LOGISTICS & DELIVERY
10. Courier / Last-Mile (Aramex, Fetchr, Quiqup, SMSA, J&T Express ME, etc.)
11. Postal Services (Emirates Post, Saudi Post/SPL, Qatar Post)
12. Freight / B2B Logistics (Trukker, Careem for Business, etc.)
13. Warehousing / Fulfillment (Fulfillment Bridge, IQ Fulfillment, etc.)

### D. BUSINESS SOFTWARE & SaaS
14. CRM (Zoho ME, Freshworks ME, local alternatives)
15. ERP (Oracle ME, SAP ME, Odoo ME, local alternatives like Wafeq)
16. Accounting / Tax (Wafeq, Zoho Books, FreshBooks ME, VAT compliance tools)
17. Fiscal / E-invoicing (ZATCA Fatoora for KSA, UAE e-invoicing)
18. EDI / Document Management
19. HR / Recruiting (Bayt.com, GulfTalent, Keka, ZenHR, Glowork, etc.)
20. Project Management (local tools if any)

### E. MARKETING & COMMUNICATIONS
21. SMS / Push / Notifications (Unifonic, Cequens, etc.)
22. Email Marketing (regional providers)
23. Advertising Platforms (Google/Meta local, Snapchat ME, TikTok ME)
24. Social Media / Content (Twitter/X dominance in Gulf, Snapchat, TikTok, local platforms)
25. Analytics / BI (local tools, Adjust ME, etc.)

### F. INFRASTRUCTURE & CLOUD
26. Cloud / Hosting (AWS ME, Azure ME, Oracle ME, Alibaba Cloud ME, STC Cloud, G42, etc.)
27. Telecom API / CPaaS (Unifonic, Cequens, du API, STC API, Ooredoo API, etc.)
28. Maps / Geolocation (Google Maps ME, HERE ME, what3words, local alternatives)

### G. GOVERNMENT & COMPLIANCE
29. Government Services (UAE Pass, MOHRE, DED, Absher, Tawakkalna, Nafath, Hukoomi, etc.)
30. Product Labeling / Track & Trace (SABER for KSA, etc.)

### H. INDUSTRY VERTICALS
31. Real Estate (Bayut, Property Finder, Dubizzle, Aqar, etc.)
32. EdTech (Noon Academy, Almentor, Coursera ME, etc.)
33. Healthcare (Vezeeta, Altibbi, Cura, Seha, etc.)
34. Transport / Ride-hailing (Careem, Uber ME, etc.)
35. Travel / Booking (Almosafer, Tajawal, Wego, Musafir, etc.)
36. Legal Tech
37. AgriTech (Pure Harvest, Red Sea Farms, etc.)
38. Construction / PropTech

## OUTPUT FORMAT

For each country:

```
## [Country Name]

### Market Overview
- Population / Internet penetration / Dominant payment / API language / Regulatory notes

### [Category Number]. [Category Name]

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
```

Where:
- **API Status**: Verified (checked docs) / Documented / Partial / None / Unknown
- **API Docs URL**: ACTUAL verified URL to developer docs
- **Auth Type**: OAuth2 / API Key / Token / JWT / HMAC / Certificate / Unknown
- **Market Size**: Large / Medium / Small
- **MCP Priority**: HIGH / MED / LOW
- **Est. Hours**: S (8-20h) / M (20-60h) / L (60-150h) / XL (150h+)

## CRITICAL INSTRUCTIONS

1. **Actually visit** developer portals and API documentation pages — don't guess from memory
2. **Verify URLs** — dead links are worse than "Unknown"
3. **Check GitHub** for existing MCP servers or SDK wrappers for each service
4. **Note ZATCA/VAT compliance APIs** — mandatory for all KSA businesses, high MCP value
5. **Note UAE Pass / Absher / Nafath** — government identity APIs used by millions
6. **Include super-apps**: Careem and its sub-services have different APIs
7. **Include Arabic-first platforms** that Western research typically misses
8. **Note Salla and Zid** (Saudi e-commerce platforms) — growing fast, seller APIs
9. Be exhaustive — include ALL companies, even small ones
10. At the end, produce a **TOP 20 priority list** ranked by MCP value
