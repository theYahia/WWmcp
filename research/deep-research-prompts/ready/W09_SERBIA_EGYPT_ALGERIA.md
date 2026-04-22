# Deep Research: MCP Candidates — Serbia + Egypt + Algeria

You are a senior technology market analyst. Conduct deep research on companies and services in **Serbia, Egypt, and Algeria** that are strong candidates for MCP (Model Context Protocol) server implementations.

An MCP server is a standardized integration layer that lets AI assistants (Claude, GPT, etc.) interact with external services via their APIs — read data, trigger actions, automate workflows.

## COUNTRIES

1. **Serbia** — 6.6M population, ~5.5M internet users, RF strategic partner, 7,290 Russian entrepreneurs, no sanctions, EU candidate
2. **Egypt** — 106M population, 96M internet users, BRICS member, MIR card planned, large digital economy
3. **Algeria** — 45M population, ~30M internet users, RF strategic partner, top Russian arms buyer, low digital maturity but growing

## RESEARCH REQUIREMENTS

For each country, investigate ALL 30 categories. Actually visit API docs, verify endpoints, check GitHub.

### A. COMMERCE & MARKETPLACES
1. E-commerce — RS: KupujemProdajem, Limundo, eKupi, Gigatron, Tehnomanija | EG: Jumia EG, Amazon EG (ex-Souq), Noon EG, OLX EG | DZ: Ouedkniss, Jumia DZ
2. Grocery / Food — RS: Wolt, Glovo, Donesi, AlfaDelivery | EG: Talabat, Elmenus, Rabbit (quick commerce), Breadfast | DZ: Yassir, Jumia Food
3. Restaurant / Food — RS: Wolt, Glovo | EG: Talabat, Elmenus | DZ: Yassir
4. POS / Retail — RS: eFiskalizacija | EG: Paymob, Fawry POS | DZ: limited

### B. FINANCE & PAYMENTS
5. Banks with APIs — RS: Banca Intesa, Komercijalna Banka, OTP Banka, Raiffeisen RS | EG: CIB, NBE, Banque Misr, QNB Alahli, Fawry | DZ: BNA, BEA, BADR, CPA (all state banks, limited APIs)
6. Payment Gateways — RS: PaySpot, AllSecure, MonriPay | EG: Paymob, Fawry, Accept, Kashier, PayTabs EG | DZ: CIB e-payment, SATIM (interbank), BaridiMob
7. Mobile Wallets / P2P — RS: mBanka apps | EG: Vodafone Cash, Orange Cash, WE Pay, Fawry Pay, InstaPay | DZ: BaridiMob (Algérie Poste), Flexy
8. Crypto / Fintech — RS: limited but growing | EG: restricted but fintech growing (MNT-Halan, Khazna, Sympl) | DZ: very restricted
9. Insurance — regional players

### C. LOGISTICS & DELIVERY
10. Courier — RS: Post Express, DExpress, BEX, City Express | EG: Aramex EG, Bosta, Mylerz, R2S | DZ: Yalidine, Maystro Delivery, ZR Express, EMS Algérie
11. Postal — RS: Pošta Srbije | EG: Egypt Post | DZ: Algérie Poste (huge — 20M+ accounts via BaridiMob!)
12. Freight — limited local
13. Warehousing — emerging

### D. BUSINESS SOFTWARE & SaaS
14. CRM — global tools dominate
15. ERP — RS: Pantheon (Datalab), Microsoft Dynamics RS | EG: Daftra, Odoo EG | DZ: limited
16. Accounting / Tax — RS: eFiskalizacija (mandatory e-fiscalization!), Minimax | EG: Daftra, Elmenus POS | DZ: PCCompta, Sage DZ
17. E-Invoice / Fiscal — RS: eFiskalizacija (SEF portal — mandatory!) | EG: Egypt e-Invoice (ETA — mandatory since 2022!) | DZ: emerging
18. EDI — limited
19. HR / Recruiting — RS: Infostud/Poslovi.rs, HelloWorld.rs | EG: Wuzzuf, Forasna, Bayt.com EG | DZ: Emploitic, Ouedkniss emploi
20. PM — global tools

### E. MARKETING & COMMUNICATIONS
21. SMS / Push — RS: local telco SMS | EG: Unifonic EG, Cequens | DZ: Mobilis SMS, Djezzy
22. Email — global tools
23. Advertising — Google/Meta dominant
24. Social Media — RS: Instagram/TikTok | EG: Facebook huge, TikTok growing | DZ: Facebook dominant
25. Analytics — global tools

### F. INFRASTRUCTURE & CLOUD
26. Cloud — RS: SBB, Orion Telekom | EG: Telecom Egypt Cloud, Raya | DZ: Algérie Télécom
27. Telecom API — RS: MTS RS, A1 RS, Yettel | EG: Vodafone EG API, Orange EG, Etisalat/e& | DZ: Mobilis, Djezzy, Ooredoo DZ
28. Maps — Google Maps, OpenStreetMap

### G. GOVERNMENT & COMPLIANCE
29. e-Gov — RS: eUprava, APR (business registry), ePorezi | EG: Digital Egypt (masreya.gov.eg), MOI services | DZ: mesydz.gov.dz
30. Product Marking — RS: EU-adjacent compliance | EG: ETA fiscal | DZ: limited

### H. INDUSTRY VERTICALS
31. Real Estate — RS: Nekretnine.rs, 4zida.rs, Halooglasi | EG: Aqarmap, OLX Property, Nawy | DZ: Ouedkniss immobilier
32. EdTech — RS: limited | EG: Noon Academy, Nagwa, Almentor | DZ: limited
33. Healthcare — RS: limited | EG: Vezeeta, Chefaa | DZ: limited
34. Transport — RS: CarGo, Bolt, Yandex? | EG: Uber, Careem, SWVL, inDrive | DZ: Yassir (dominant!), Heetch, Temtem
35. Travel — RS: eSky, Booking.com | EG: Almosafer, Wego | DZ: Tassili Airlines, Air Algérie
36-38. Legal, Agri, Construction — limited

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

1. **Egypt e-Invoice (ETA)** is mandatory since 2022 — check API thoroughly, huge MCP value
2. **Paymob** (Egypt) is the leading payment gateway — well-documented API, check it
3. **Fawry** (Egypt) is used by 40M+ — check merchant/developer API
4. **BaridiMob** (Algeria) from Algérie Poste has 20M+ users — check if API exists
5. **Yassir** (Algeria) is the dominant ride-hailing — expanding across Africa, check API
6. **Serbia eFiskalizacija (SEF)** is mandatory e-fiscalization — check API docs
7. **Serbia has 7,290 Russian entrepreneurs** — high relevance for Russian tech integration
8. Actually visit developer portals, verify URLs
9. Check GitHub for existing MCP servers
10. Produce **TOP 10 per country** at the end
