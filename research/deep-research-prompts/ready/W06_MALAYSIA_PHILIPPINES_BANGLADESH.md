# Deep Research: MCP Candidates — Malaysia + Philippines + Bangladesh

You are a senior technology market analyst. Conduct deep research on companies and services in **Malaysia, Philippines, and Bangladesh** that are strong candidates for MCP (Model Context Protocol) server implementations.

An MCP server is a standardized integration layer that lets AI assistants (Claude, GPT, etc.) interact with external services via their APIs — read data, trigger actions, automate workflows.

## COUNTRIES

1. **Malaysia** — 33M population, 32M internet users, BRICS partner, growing fintech, MIR early stages
2. **Philippines** — 115M population, 75M+ internet users, GCash dominant, massive BPO/tech sector
3. **Bangladesh** — 170M population, growing digital economy, bKash mobile money dominant

## RESEARCH REQUIREMENTS

For each country, investigate ALL 30 categories. Actually visit API docs, check GitHub.

### A. COMMERCE & MARKETPLACES
1. E-commerce — MY: Shopee MY, Lazada MY, Mudah.my, Carousell MY | PH: Shopee PH, Lazada PH, Carousell PH | BD: Daraz BD, Chaldal, Evaly (status?)
2. Grocery / Food Delivery — MY: GrabMart, HappyFresh, Jaya Grocer | PH: GrabMart, MetroMart | BD: Chaldal, Pandamart
3. Restaurant / Food — MY: GrabFood, Foodpanda MY | PH: GrabFood, Foodpanda PH | BD: Foodpanda BD, Pathao Food
4. POS / Retail — MY: StoreHub, EasyStore | PH: local systems | BD: limited

### B. FINANCE & PAYMENTS
5. Banks with APIs — MY: Maybank, CIMB, Public Bank, RHB, Touch 'n Go | PH: BDO, BPI, UnionBank, Maya Bank, Tonik | BD: BRAC Bank, Dutch-Bangla Bank, City Bank
6. Payment Gateways — MY: Billplz, Revenue Monster, iPay88, Razer Merchant Services, SenangPay | PH: PayMongo, Dragonpay, PesoPay, PayMaya/Maya | BD: SSLCommerz, AmarPay, PortWallet
7. Mobile Wallets — MY: Touch 'n Go eWallet, GrabPay, Boost, MAE | PH: GCash, Maya/PayMaya | BD: bKash, Nagad, Rocket
8. Crypto / Fintech — MY: Luno, MX Global | PH: Coins.ph, PDAX | BD: limited (restricted)
9. Insurance — regional players

### C. LOGISTICS & DELIVERY
10. Courier — MY: Pos Laju, J&T MY, Ninja Van, DHL eCommerce | PH: J&T PH, Ninja Van, LBC Express, JRS | BD: Pathao, Steadfast, RedX, Paperfly
11. Postal Services — national posts
12. Freight — regional players
13. Warehousing — Shopee/Lazada fulfillment

### D. BUSINESS SOFTWARE & SaaS
14-20. CRM, ERP, Accounting, Fiscal, EDI, HR, PM — local alternatives + regional adoption of global tools. MY: SQL Accounting, AutoCount | PH: JuanTax, Sprout HR | BD: limited local SaaS

### E. MARKETING & COMMUNICATIONS
21-25. SMS, Email, Ads, Social, Analytics — Shopee Ads, social platform dominance (Facebook huge in PH/BD, WhatsApp in MY)

### F. INFRASTRUCTURE & CLOUD
26. Cloud — MY: TM One, Maxis Business | PH: Globe Business Cloud | BD: limited
27. Telecom API — MY: Maxis API, Celcom | PH: Globe Labs API (notable!), Smart API | BD: Grameenphone API
28. Maps — Google Maps dominant

### G. GOVERNMENT & COMPLIANCE
29. e-Gov — MY: MyDigital, MyGovernment, LHDN (tax) | PH: eGov PH, BIR (tax), PhilSys ID | BD: a2i, myGov
30. E-invoicing — MY: LHDN e-Invoice (mandatory 2024+) | PH: BIR CAS | BD: NBR

### H. INDUSTRY VERTICALS
31-38. Real Estate, EdTech, Healthcare, Transport, Travel, Legal, Agri, Construction

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

1. **GCash** is the Philippines' de facto payment — 80M+ users, check merchant API thoroughly
2. **bKash** dominates Bangladesh mobile money — 65M+ users, check API
3. **Globe Labs API** (Philippines) is one of the best telco APIs in the region
4. **Malaysia e-Invoice** became mandatory in 2024 — LHDN API is critical
5. **Touch 'n Go** is Malaysia's payment leader — check developer API
6. Actually visit developer portals, verify URLs
7. Check GitHub for existing MCP servers
8. Include ALL companies even small ones
9. Produce **TOP 10 per country** at the end
