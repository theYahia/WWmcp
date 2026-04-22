# Deep Research: MCP Candidates — Brazil + Mexico + Argentina

You are a senior technology market analyst. Conduct deep research on companies and services in **Brazil, Mexico, and Argentina** that are strong candidates for MCP (Model Context Protocol) server implementations.

An MCP server is a standardized integration layer that lets AI assistants (Claude, GPT, etc.) interact with external services via their APIs — read data, trigger actions, automate workflows.

## COUNTRIES

1. **Brazil** — 215M population, 165M internet users, BRICS founding member, Pix payments (140M+ users), largest LATAM tech ecosystem
2. **Mexico** — 130M population, 100M+ internet users, neutral RF stance, 2nd largest LATAM economy
3. **Argentina** — 46M population, 36M internet users, withdrew from BRICS, pragmatic stance, active fintech scene

## RESEARCH REQUIREMENTS

For each country, investigate ALL 30 categories. Actually visit API docs, verify endpoints, check GitHub.

### A. COMMERCE & MARKETPLACES
1. E-commerce — BR: Mercado Livre, Magazine Luiza, Americanas, Shopee BR, Amazon BR, B2W | MX: Mercado Libre MX, Amazon MX, Coppel, Liverpool | AR: Mercado Libre AR
2. Grocery / Food Delivery — BR: iFood, Rappi, Mercado Livre entregas | MX: Rappi, Cornershop (Uber), Jokr | AR: Rappi, PedidosYa
3. Restaurant / Food — BR: iFood (dominant), Rappi | MX: Uber Eats, Rappi, DiDi Food | AR: PedidosYa, Rappi
4. POS / Retail — BR: Stone, PagSeguro, Cielo, Rede, SumUp BR | MX: Clip, SumUp MX | AR: Mercado Pago Point

### B. FINANCE & PAYMENTS
5. Banks with APIs — BR: Nubank, Itau, Bradesco, Banco do Brasil, Inter, C6, Neon | MX: BBVA Mexico, Banorte, Citibanamex, Banregio, Albo, Klar | AR: Galicia, Santander AR, Ualá, Brubank
6. Payment Gateways — BR: PagSeguro, Stone, Pagar.me, Mercado Pago, Asaas, Gerencianet/Efí | MX: Conekta, OpenPay, Mercado Pago, PayPal MX | AR: Mercado Pago, Mobbex
7. Pix / Mobile Payments — BR: Pix (BCB API — critical!), PicPay, Mercado Pago | MX: CoDi/DiMo, Mercado Pago | AR: Mercado Pago, MODO
8. Crypto / Fintech — BR: Mercado Bitcoin, Foxbit, Hashdex, Creditas, Nubank Crypto | MX: Bitso, GBM, Kavak | AR: Ripio, Lemon Cash, Buenbit
9. Insurance — BR: Porto Seguro, Youse, Pier Digital | MX: Clupp, GNP | AR: 123Seguro

### C. LOGISTICS & DELIVERY
10. Courier — BR: Correios, Loggi, Jadlog, Total Express, Sequoia | MX: Estafeta, DHL MX, Fedex MX, 99minutos, Skydropx | AR: Andreani, OCA, Correo Argentino
11. Postal Services — national posts
12. Freight — BR: CargoX, TruckPad, FreteBras | MX: Nowports | AR: limited
13. Warehousing — Mercado Livre Fulfillment, Amazon FBA BR/MX

### D. BUSINESS SOFTWARE & SaaS
14. CRM — BR: RD Station, Ploomes, Agendor | MX: Clientify, local | AR: limited local
15. ERP — BR: TOTVS (huge!), Omie, Bling, Tiny | MX: Aspel, ContPAQi, Bind ERP | AR: Colppy, Xubio
16. Accounting / Tax — BR: ContaAzul, Omie, NFe.io | MX: ContPAQi, Aspel, Facturapi | AR: Monotributo tools
17. NF-e / CFDI / Fiscal — BR: NFe/NFSe (mandatory electronic invoice), NFe.io, Focus NFe | MX: CFDI (mandatory), Facturapi, Finkok, SW Sapien | AR: AFIP factura electronica
18. EDI / Document Management
19. HR / Recruiting — BR: Gupy, Catho, InfoJobs BR, Kenoby | MX: OCCMundial, Computrabajo, Bumeran | AR: Bumeran, ZonaJobs
20. Project Management — regional tools

### E. MARKETING & COMMUNICATIONS
21. SMS / Push — BR: Zenvia, Twilio BR, Infobip BR | MX: Auronix | AR: limited
22. Email Marketing — BR: RD Station, Dinamize, Mailbiz | MX: regional | AR: Doppler
23. Advertising — Google/Meta + Mercado Ads (all 3), Rappi Ads
24. Social Media — WhatsApp dominant (all 3), Instagram, TikTok
25. Analytics — BR: RD Station analytics, local BI | MX/AR: global tools

### F. INFRASTRUCTURE & CLOUD
26. Cloud — BR: Locaweb, UOL Host, KingHost | MX: Triara (Telmex), Kio Networks | AR: Dattatec
27. Telecom API — BR: Zenvia, Total Voice | MX: Auronix, Sinch MX | AR: VoIP providers
28. Maps — Google Maps, Waze (very popular in BR)

### G. GOVERNMENT & COMPLIANCE
29. e-Gov — BR: Gov.br, Receita Federal, eSocial, SPED | MX: SAT, gob.mx, CURP, RFC | AR: AFIP, MiArgentina, ANSES
30. Product Marking — BR: Selo Fiscal | MX: customs systems | AR: AFIP codes

### H. INDUSTRY VERTICALS
31. Real Estate — BR: QuintoAndar, ZAP Imoveis, VivaReal | MX: Inmuebles24, Segundamano | AR: ZonaProp, Argenprop
32. EdTech — BR: Hotmart (huge!), Descomplica, Alura | MX: Platzi (CO but big in MX), Crehana | AR: Acamica, Coderhouse
33. Healthcare — BR: Doctoranytime, Doctoralia BR, Conexa Saude | MX: Doctoralia MX, Sofomex | AR: limited
34. Transport — BR: 99 (DiDi), Uber BR | MX: DiDi, Uber, Beat | AR: Cabify, Uber
35. Travel — BR: Decolar, MaxMilhas, ViajaNet | MX: Despegar, ClickBus | AR: Despegar, Almundo
36. Legal Tech — BR: JusBrasil, Projuris | MX: limited | AR: limited
37. AgriTech — BR: Solinftec, Agrosmart, Aegro (BR is agri giant!) | MX: limited | AR: Auravant
38. Construction — limited local

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

1. **Pix is Brazil's UPI** — BCB API, 140M+ users, mandatory for all payment providers. HIGH MCP value.
2. **NFe/NFSe** (Brazil) and **CFDI** (Mexico) are MANDATORY e-invoicing — every business needs them
3. **TOTVS** is Brazil's largest ERP — check Fluig and developer APIs thoroughly
4. **Mercado Libre/Mercado Pago** operates in all 3 countries — seller API is critical
5. **RD Station** is Brazilian marketing automation leader — check API docs
6. **Hotmart** (Brazil) is a digital products platform with 35M+ users — check partner API
7. **Nubank** has 80M+ customers — check open banking API status
8. Actually visit developer portals, verify URLs
9. Check GitHub for existing MCP servers
10. Produce **TOP 15 per country** at the end
