# Deep Research: MCP Candidates — Iran + Pakistan + Iraq

You are a senior technology market analyst. Conduct deep research on companies and services in **Iran, Pakistan, and Iraq** that are strong candidates for MCP (Model Context Protocol) server implementations.

An MCP server is a standardized integration layer that lets AI assistants (Claude, GPT, etc.) interact with external services via their APIs — read data, trigger actions, automate workflows.

## COUNTRIES

1. **Iran** — 88M population, 70M+ internet users, BRICS/SCO member, RF ally, comprehensive strategic partnership, own isolated tech ecosystem (like China lite), heavily sanctioned by West
2. **Pakistan** — 230M population, 120M+ internet users, SCO member, MIR early stages, massive mobile-first economy, growing fintech
3. **Iraq** — 43M population, 30M+ internet users, RF-friendly, oil cooperation, rebuilding digital infrastructure

## RESEARCH REQUIREMENTS

For each country, investigate ALL 30 categories. Actually visit API docs where accessible, verify endpoints, check GitHub.

### A. COMMERCE & MARKETPLACES
1. E-commerce — IR: Digikala (Iran's Amazon!), Torob (price comparison), Basalam, DigiStyle | PK: Daraz.pk, OLX PK, PakWheels, Zameen.com | IQ: Miswag, OpenSooq IQ, Shein IQ
2. Grocery / Food — IR: SnappFood, Digikala Jet | PK: Foodpanda PK, Airlift (status?), Cheetay | IQ: Talabat IQ, Toters
3. Restaurant / Food — IR: SnappFood (dominant) | PK: Foodpanda (dominant) | IQ: Talabat, Toters
4. POS / Retail — IR: local systems | PK: Oscar POS, RetailX | IQ: limited

### B. FINANCE & PAYMENTS
5. Banks with APIs — IR: Bank Mellat, Bank Melli, Parsian Bank, Saman Bank (isolated from SWIFT!) | PK: HBL, UBL, MCB, Meezan Bank, Allied Bank, Bank Alfalah | IQ: TBI, Cihan Bank, Qi Card system
6. Payment Gateways — IR: ZarinPal, IDPay, NextPay, Pay.ir (all domestic-only!) | PK: JazzCash, Easypaisa, SadaPay, NayaPay, HBL Pay | IQ: Qi Card, ZainCash, Asia Hawala
7. Mobile Wallets — IR: Bale Pay, Bank app wallets | PK: JazzCash (60M+ users!), Easypaisa (40M+), SadaPay, NayaPay | IQ: ZainCash (dominant!), Asia Hawala
8. Crypto / Fintech — IR: restricted but crypto mining legal | PK: restricted, some growth | IQ: very limited
9. Insurance — IR: Bimeh.com, Asia Insurance | PK: Jubilee, EFU | IQ: limited

### C. LOGISTICS & DELIVERY
10. Courier — IR: Post Pishtaz, Tipax, Chapar, AloPeyk, Miare | PK: TCS, Leopards, BlueEx, PostEx, Rider, Trax | IQ: Orisdi, local couriers
11. Postal — IR: Iran Post | PK: Pakistan Post | IQ: Iraqi Post
12. Freight — IR: BarBala | PK: Truck It In, Bykea Logistics | IQ: limited
13. Warehousing — Digikala Fulfillment (IR), Daraz Fulfillment (PK)

### D. BUSINESS SOFTWARE & SaaS
14. CRM — mostly global tools adapted locally
15. ERP — IR: Hamkaran System, Holoo, Hesabfa | PK: Odoo PK, SAP PK | IQ: limited
16. Accounting / Tax — IR: Hesabfa, Hesabix, Holoo | PK: Odoo, local tools | IQ: limited
17. E-Invoice / Fiscal — IR: Moadian system (mandatory e-invoice!) | PK: FBR POS integration (mandatory for retail) | IQ: emerging
18. EDI — limited
19. HR / Recruiting — IR: Jobinja, IranTalent, Jobvision, E-estekhdam | PK: Rozee.pk, Mustakbil, Indeed PK | IQ: limited
20. PM — global tools

### E. MARKETING & COMMUNICATIONS
21. SMS — IR: Kavenegar, Ghasedak, Melipayamak | PK: Jazz SMS, Telenor APIs | IQ: Zain SMS, Asiacell
22. Email — limited relevance (messaging apps dominant)
23. Advertising — IR: Yektanet (ad network), Divar Ads | PK: Google, Meta + Daraz Ads | IQ: mostly Meta/Google
24. Social Media — IR: Instagram (still works!), Telegram (huge!), local: Rubika, Eitaa, Bale | PK: TikTok huge, Facebook, WhatsApp | IQ: Facebook dominant, Telegram
25. Analytics — limited local tools

### F. INFRASTRUCTURE & CLOUD
26. Cloud — IR: Arvan Cloud (major!), Abr Arvan, ParsOnline, Asiatech | PK: PTCL Cloud, Supernet | IQ: very limited
27. Telecom API — IR: Kavenegar (SMS/Voice API), Ghasedak | PK: Jazz/Mobilink APIs, Telenor PK API | IQ: Zain, Asiacell, Korek
28. Maps — IR: Neshan (Iran's Google Maps!), Balad | PK: Google Maps | IQ: Google Maps

### G. GOVERNMENT & COMPLIANCE
29. e-Gov — IR: dolat.ir, e-namad (trust seal), my.gov.ir | PK: Pakistan Citizen Portal, Nadra (identity), FBR (tax) | IQ: limited
30. Product Marking — IR: own standards system | PK: customs systems | IQ: limited

### H. INDUSTRY VERTICALS
31. Real Estate — IR: Divar (classifieds giant!), Sheypoor, Kilid | PK: Zameen.com (dominant!), Graana | IQ: OpenSooq
32. EdTech — IR: Faradars, Maktabkhooneh, Tamland | PK: Sabaq, Knowledge Platform | IQ: limited
33. Healthcare — IR: DoctorTo, Torob Health | PK: Oladoc, Sehat Kahani | IQ: limited
34. Transport — IR: Snapp (Iran's Uber — 40M+ users!), Tapsi | PK: Careem PK, inDrive, Bykea | IQ: Careem, Bolt
35. Travel — IR: Alibaba.ir (travel OTA!), Flightio, Snapptrip | PK: Sastaticket, Bookme | IQ: limited
36. Legal — limited
37. Agri — IR: limited | PK: Cropconnect, eBazaar | IQ: limited
38. Construction — limited

## OUTPUT FORMAT

For EACH country:

```
## [Country] ([Code])

### Market Overview
- Population / Internet / Dominant payment / API lang / Regulatory

### [Category]. [Name]

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
```

## CRITICAL INSTRUCTIONS

1. **Iran has a parallel tech ecosystem** — Digikala, Snapp, SnappFood, Divar, ZarinPal are all massive but isolated from global internet. APIs exist but only work domestically.
2. **Arvan Cloud** is Iran's leading cloud provider — check developer API thoroughly
3. **Neshan Maps** is Iran's mapping service (Google Maps alternative) — check API
4. **Kavenegar** is Iran's #1 SMS/communication API — well-documented
5. **JazzCash** (60M+) and **Easypaisa** (40M+) dominate Pakistan mobile money — check merchant APIs
6. **ZainCash** dominates Iraqi mobile payments — check API status
7. **Snapp** (Iran) has 40M+ users — check driver/merchant API if exists
8. **Digikala** seller API — Iran's marketplace leader, check developer portal
9. **Iran Moadian** (mandatory e-invoice) — high-value government API
10. Actually visit developer portals where accessible, verify URLs
11. Check GitHub for existing MCP servers
12. Note which Iranian services are accessible ONLY from Iranian IPs
13. Produce **TOP 10 per country** at the end
