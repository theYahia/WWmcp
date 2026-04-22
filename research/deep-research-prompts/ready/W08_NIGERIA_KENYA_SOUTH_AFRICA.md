# Deep Research: MCP Candidates — Nigeria + Kenya + South Africa

You are a senior technology market analyst. Conduct deep research on companies and services in **Nigeria, Kenya, and South Africa** that are strong candidates for MCP (Model Context Protocol) server implementations.

An MCP server is a standardized integration layer that lets AI assistants (Claude, GPT, etc.) interact with external services via their APIs — read data, trigger actions, automate workflows.

## COUNTRIES

1. **Nigeria** — 220M population, 136M internet users, BRICS partner, Africa's largest economy, vibrant fintech scene
2. **Kenya** — 55M population, 33M+ internet users, M-Pesa pioneer, East Africa tech hub, strong API culture
3. **South Africa** — 60M population, 40M internet users, BRICS founding member, most mature African API ecosystem

## RESEARCH REQUIREMENTS

For each country, investigate ALL 30 categories. Actually visit API docs, verify endpoints, check GitHub.

### A. COMMERCE & MARKETPLACES
1. E-commerce — NG: Jumia NG, Konga, Jiji.ng, PayPorte | KE: Jumia KE, Kilimall, Jiji.ke | ZA: Takealot, Bidorbuy, Bob Shop, Superbalist
2. Grocery / Food Delivery — NG: Jumia Food, Chowdeck, Glovo NG | KE: Glovo KE, Jumia Food | ZA: Checkers Sixty60, Pick n Pay Asap, Mr D Food
3. Restaurant / Food — NG: Chowdeck, Glovo | KE: Glovo, Uber Eats | ZA: Mr D Food, Uber Eats
4. POS / Retail — NG: Nomba (ex-Kudi), Moniepoint POS | KE: Lipa Na M-Pesa | ZA: Yoco, iKhokha

### B. FINANCE & PAYMENTS
5. Banks with APIs — NG: GTBank, Access Bank, First Bank, Zenith, Kuda, Moniepoint, OPay, PalmPay | KE: Equity Bank, KCB, Co-op Bank, NCBA | ZA: FNB, Standard Bank, Nedbank, ABSA, Capitec, TymeBank, Discovery Bank
6. Payment Gateways — NG: Paystack (Stripe), Flutterwave, Monnify, Interswitch, Squad | KE: Paystack KE, Flutterwave KE, IntaSend, Kopokopo, PesaPal | ZA: PayFast, Yoco, Peach Payments, PayGate, Ozow
7. Mobile Money — NG: OPay, PalmPay, Moniepoint, Paga | KE: M-Pesa (Safaricom), Airtel Money | ZA: SnapScan, Zapper, MTN MoMo
8. Crypto / Fintech — NG: Quidax, Luno NG, Patricia, Piggyvest, Cowrywise, FairMoney, Carbon | KE: Chipper Cash, M-Shwari | ZA: Luno ZA, VALR, EasyEquities
9. Insurance — NG: Curacel, Casava, Hygeia | KE: Turaco, Pula, ICEA Lion | ZA: Discovery, Naked Insurance, Pineapple

### C. LOGISTICS & DELIVERY
10. Courier — NG: GIG Logistics, Kwik, Topship, Sendbox | KE: Sendy, Lori Systems | ZA: The Courier Guy, Pargo, Fastway, uAfrica
11. Postal — national posts
12. Freight — NG: Kobo360, Lori Systems | KE: Lori Systems | ZA: Imperial Logistics
13. Warehousing — Jumia fulfillment, emerging 3PL

### D. BUSINESS SOFTWARE & SaaS
14. CRM — local alternatives + Salesforce/HubSpot adoption
15. ERP — NG: SAP Africa, Odoo NG, SystemSpecs | KE: SAP, Odoo | ZA: SAP (large presence), SYSPRO, Sage Africa
16. Accounting / Tax — NG: Zoho NG, Wave | KE: Tally, Zoho | ZA: Sage, Xero ZA, Draftworx
17. E-Invoice / Fiscal — NG: FIRS (Federal Inland Revenue), TaxProMax | KE: KRA iTax, TIMS (e-invoicing mandatory!) | ZA: SARS eFiling
18. EDI — emerging
19. HR / Recruiting — NG: Jobberman, BambooHR NG, SeamlessHR | KE: BrighterMonday, Kuhustle | ZA: PNET, CareerJunction, Sage People
20. Project Management — global tools dominate

### E. MARKETING & COMMUNICATIONS
21. SMS / Push — NG: Termii, Africa's Talking (major!), Sendchamp | KE: Africa's Talking (Kenyan origin!), Infobip KE | ZA: Clickatell (ZA origin!), BulkSMS
22. Email Marketing — global tools + Mailchimp
23. Advertising — Google/Meta + local marketplace ads
24. Social Media — WhatsApp dominant (all 3), Twitter/X popular in NG, TikTok growing
25. Analytics — global tools

### F. INFRASTRUCTURE & CLOUD
26. Cloud — NG: MainOne, Rack Centre | KE: Safaricom Cloud, ICOLO | ZA: Teraco, Internet Solutions, AWS Cape Town
27. Telecom API — **Africa's Talking** (pan-African, Kenyan origin — SMS, USSD, Voice, Airtime, Payments), **Clickatell** (ZA origin — chat commerce)
28. Maps — Google Maps, OpenStreetMap popular in Africa

### G. GOVERNMENT & COMPLIANCE
29. e-Gov — NG: NIMC (identity), FIRS, CAC (company registry) | KE: eCitizen, Huduma, NTSA | ZA: eNaTIS, SARS, CIPC
30. Product Marking — NG: SON (standards), NIS | KE: KEBS | ZA: NRCS

### H. INDUSTRY VERTICALS
31. Real Estate — NG: PropertyPro, Nigeria Property Centre | KE: BuyRentKenya | ZA: Property24, Private Property
32. EdTech — NG: uLesson, AltSchool Africa | KE: Eneza, M-Shule | ZA: GetSmarter, Valenture
33. Healthcare — NG: Helium Health, mDoc, 54gene | KE: M-Tiba, Ilara Health | ZA: Discovery Health, Intercare
34. Transport — NG: Bolt, Uber, inDrive | KE: Bolt, Uber, Little Ride | ZA: Bolt, Uber
35. Travel — NG: Wakanow, Kiwi | KE: Jumia Travel (discontinued?), Travelstart | ZA: Travelstart, FlySafair
36. Legal Tech — limited
37. AgriTech — NG: FarmCrowdy, Thrive Agric, Releaf | KE: Twiga Foods, Apollo Agriculture | ZA: Aerobotics
38. Construction — emerging

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

1. **Africa's Talking** is the #1 pan-African developer API platform (Kenyan origin) — SMS, USSD, Voice, Airtime, Payments — document ALL endpoints
2. **M-Pesa/Daraja API** (Safaricom) is the world's most successful mobile money — verify all API capabilities
3. **Paystack** (Nigeria, acquired by Stripe) has excellent developer docs — check thoroughly
4. **Flutterwave** operates across Africa — check multi-country API capabilities
5. **KRA TIMS** (Kenya) made e-invoicing mandatory — check API status
6. **Clickatell** is South African origin, now global chat commerce platform — check API
7. **Moniepoint** (Nigeria) grew to 10M+ merchants — check merchant API
8. Actually visit developer portals, verify URLs
9. Check GitHub for existing MCP servers
10. Produce **TOP 15 per country** at the end
