# Deep Research: MCP Candidates — Turkey

You are a senior technology market analyst. Conduct deep research on companies and services in **Turkey** that are strong candidates for MCP (Model Context Protocol) server implementations.

An MCP server is a standardized integration layer that lets AI assistants (Claude, GPT, etc.) interact with external services via their APIs — read data, trigger actions, automate workflows.

## CONTEXT

Turkey is a massive market: 85M population, 80M+ internet users, $55B trade with Russia, MIR card accepted at 5 banks, major parallel import hub. Strong local tech ecosystem with many services that have NO MCP coverage.

## RESEARCH REQUIREMENTS

For each of these 30 categories, **actually visit API documentation pages**, check GitHub for existing SDKs, verify endpoints.

### A. COMMERCE & MARKETPLACES
1. E-commerce (Trendyol, Hepsiburada, n11.com, GittiGidiyor, Ciceksepeti, LC Waikiki, etc.)
2. Grocery & Food Delivery (Getir, Migros Sanal, A101, Istegelsin, etc.)
3. Restaurant / Food Ordering (Yemeksepeti, Getir Yemek, Trendyol Yemek, etc.)
4. POS / Retail Tech (iyzico POS, Param POS, local systems)

### B. FINANCE & PAYMENTS
5. Banks with APIs (Is Bankasi, Garanti BBVA, Yapi Kredi, Akbank, Ziraat, VakifBank, DenizBank, QNB Finansbank, ING Turkey, Papara, etc.)
6. Payment Gateways (iyzico, PayTR, Param, Tosla, Craftgate, Paynet, etc.)
7. Mobile Wallets (BKM Express, Papara, Tosla, Param, Fastpay, etc.)
8. Crypto / Fintech (BtcTurk, Paribu, Bitci, Colendi, Figopara, etc.)
9. Insurance (Sigortam.net, Koalay, Aksigorta, etc.)

### C. LOGISTICS & DELIVERY
10. Courier / Last-Mile (Yurticii Kargo, Aras Kargo, MNG Kargo, Surat Kargo, Sendeo, etc.)
11. Postal Services (PTT)
12. Freight / Trucking (Kolay Gelsin, Lojiper, Fretlink TR, etc.)
13. Warehousing / Fulfillment (Trendyol Fulfillment, Hepsiburada Fulfillment, etc.)

### D. BUSINESS SOFTWARE & SaaS
14. CRM (Salesforce TR, local alternatives)
15. ERP (Logo Yazilim — Tiger/Netsis, Mikro Yazilim, IAS, Uyumsoft, etc.)
16. Accounting / Tax (Logo Muhasebe, ETA, Uyumsoft, Parabus, e-Fatura/e-Arsiv compliance)
17. E-Invoice / E-Fatura (GIB portal, Foriba/Sovos, Logo, Uyumsoft, Mikro, Parabus, etc.)
18. EDI / Document Management (Foriba, EDM providers)
19. HR / Recruiting (Kariyer.net, Yenibiris.com, Eleman.net, Secretcv, Kolay IK, etc.)
20. Project Management (local tools)

### E. MARKETING & COMMUNICATIONS
21. SMS / Push (Netgsm, iletimerkezi, JetSMS, Turkcell Mobil, etc.)
22. Email Marketing (Euromsg, Emarsys TR, local providers)
23. Advertising (Google TR, Meta TR, Trendyol Ads, Hepsiburada Ads, etc.)
24. Social Media (Twitter huge in Turkey, Instagram, TikTok, Eksi Sozluk, etc.)
25. Analytics (local BI tools, Adjust TR, etc.)

### F. INFRASTRUCTURE & CLOUD
26. Cloud / Hosting (Turkcell Bulut, Turknet, Radore, Natro, Turhost, etc.)
27. Telecom API / CPaaS (Turkcell API, Vodafone TR API, Netgsm, Bulutsantralim, etc.)
28. Maps (Yandex Maps TR, Google Maps, Basarsoft, etc.)

### G. GOVERNMENT & COMPLIANCE
29. Government Services (e-Devlet, GIB, MERNIS, TAKBIS, UYAP, SGK, etc.)
30. Product Marking (TPMS — tobacco/alcohol tracking, etc.)

### H. INDUSTRY VERTICALS
31. Real Estate (Sahibinden.com, Hepsiemlak, Emlakjet, etc.)
32. EdTech (Udemy TR origin, Mavianalitik, Kodluyoruz, etc.)
33. Healthcare (Doktortakvimi, Acibademsaglik, e-Nabiz, etc.)
34. Transport (BiTaksi, Uber TR, Martı, BinBin, etc.)
35. Travel (Obilet, Enuygun, Jolly, Tatilbudur, Tatilsepeti, Pegasus API, THY API, etc.)
36. Legal Tech
37. AgriTech (Tarfin, Doktar, etc.)
38. Construction

## OUTPUT FORMAT

```
## Turkey (TR)

### Market Overview
- Population: ~85M / Internet: ~80M+ / Payment: cards + bank transfer + Papara / API lang: Turkish / Regulatory: e-Fatura mandatory

### [Category]. [Name]

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
```

## CRITICAL INSTRUCTIONS

1. **Actually visit** developer.trendyol.com, dev.hepsiburada.com, iyzico docs, Logo Yazilim API, etc.
2. **Verify URLs** are live
3. **Check GitHub** for existing MCP servers or wrappers
4. **e-Fatura/e-Arsiv is MANDATORY** — all invoicing goes through GIB; integrators have APIs
5. **Sahibinden.com** is Turkey's largest classifieds — check API status carefully
6. **Trendyol** seller API is critical — 30M+ products, marketplace model
7. **Note marketplace seller APIs** specifically (Trendyol, Hepsiburada, n11)
8. Include ALL companies even small ones
9. Produce a **TOP 20 priority list** at the end
