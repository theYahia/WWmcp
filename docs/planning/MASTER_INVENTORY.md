# MASTER INVENTORY -- NeuralDeep MCP Server Candidates

**Generated:** 2026-04-01
**Sources:** inventory_cis.csv (361 entries) + inventory_world.csv (659 entries) = **1,020 total**
**Scoring:** `API_Quality x3 + Market_Size x2.5 + no_MCP x2 + has_OpenAPI x1.5 + inverse_hours x1`
**Hours mapping:** S=5, M=3, L=1.5, XL=0.5

---

## 1. Executive Summary

| Metric | Count |
|--------|-------|
| **Total API candidates** | 1,020 |
| CIS (11 countries) | 361 |
| World (33+ countries) | 659 |
| **Priority: HIGH** | 507 (50%) |
| **Priority: MED** | 375 (37%) |
| **Priority: LOW** | 138 (13%) |
| No existing MCP | 962 (94%) |
| Has existing MCP | 52 (5%) |
| Has OpenAPI spec | 34 (3%) |
| **Quick Wins** (Q>=4, no MCP, Est=S) | **144** |
| Already built (@theyahia) | 47 |

**Key findings:**
- 94% of inventoried APIs have NO existing MCP server -- massive greenfield
- 144 quick-win candidates (high API quality, small build, no MCP) across all regions
- Turkey, Gulf, and SE Asia have the highest density of HIGH-priority APIs
- Payments is the largest category (114 entries), followed by Logistics (73) and Banking (60)
- Top composite scores cluster around Payments, E-Invoicing, and Marketplace categories

---

## 2. TOP-50 Global Priority List

| Rank | Service | Country | Category | API Q | Mkt Size | MCP? | Est Hrs | Score |
|------|---------|---------|----------|-------|----------|------|---------|-------|
| 1 | **YooKassa API** | RU | Payment Gateway | 5 | 5 | no | S | 36.0 |
| 2 | **Facturapi** | MX | E-Invoicing | 5 | 5 | no | S | 34.5 |
| 3 | **iyzico** | TR | Payments | 5 | 5 | no | S | 34.5 |
| 4 | **Tap Payments** | AE | Payments | 5 | 5 | no | S | 34.5 |
| 5 | **Tap Payments KSA** | SA | Payments | 5 | 5 | no | S | 34.5 |
| 6 | **Divar (Kenar)** | IR | Classifieds | 5 | 5 | no | M | 34.0 |
| 7 | **MoySklad** | RU/KZ/BY | Cloud ERP/WMS | 5 | 4 | no | S | 33.5 |
| 8 | **Nomba** | NG | Payments | 5 | 4 | no | S | 33.5 |
| 9 | **Midtrans** | ID | Payments | 5 | 5 | no | M | 32.5 |
| 10 | **Clickatell** | ZA | CPaaS | 5 | 5 | no | M | 32.5 |
| 11 | **Trendyol** | TR | Marketplace | 5 | 5 | no | M | 32.5 |
| 12 | **DaData API** | RU | Address/Company Data | 5 | 4 | no | S | 32.0 |
| 13 | **Pagar.me (Stone)** | BR | Payments | 5 | 4 | no | S | 32.0 |
| 14 | **NFe.io** | BR | E-Invoicing | 5 | 4 | no | S | 32.0 |
| 15 | **ZarinPal** | IR | Payments | 5 | 4 | no | S | 32.0 |
| 16 | **Kavenegar** | IR | SMS/Voice | 5 | 4 | no | S | 32.0 |
| 17 | **Chargily Pay** | DZ | Payments | 5 | 4 | no | S | 32.0 |
| 18 | **Termii** | NG | CPaaS | 5 | 4 | no | S | 32.0 |
| 19 | **Yoco** | ZA | Payments | 5 | 4 | no | S | 32.0 |
| 20 | **Ileti Merkezi** | TR | SMS | 5 | 4 | no | S | 32.0 |
| 21 | **PayTabs UAE** | AE | Payments | 5 | 4 | no | S | 32.0 |
| 22 | **PayTabs KSA** | SA | Payments | 5 | 4 | no | S | 32.0 |
| 23 | **PayMongo** | PH | Payments | 5 | 4 | no | S | 32.0 |
| 24 | **Globe Labs** | PH | Telecom | 5 | 4 | no | S | 32.0 |
| 25 | **Tinkoff Acquiring** | RU | Payment Gateway/Banking | 4 | 5 | no | S | 31.5 |
| 26 | **Yandex Metrica** | RU/KZ/BY/UZ | Web Analytics | 4 | 5 | no | S | 31.5 |
| 27 | **CDEK API v2** | RU/KZ/BY/AM/KG/UZ | Courier/Delivery | 4 | 5 | no | S | 31.5 |
| 28 | **PayFast** | ZA | Payments | 4 | 5 | no | S | 31.5 |
| 29 | **Takealot** | ZA | Marketplace | 4 | 5 | no | S | 31.5 |
| 30 | **Sage SA** | ZA | Accounting | 4 | 5 | no | S | 31.5 |
| 31 | **Is Bankasi** | TR | Banking | 4 | 5 | no | S | 31.5 |
| 32 | **Turkish Airlines** | TR | Travel | 4 | 5 | no | S | 31.5 |
| 33 | **Udemy** | TR | EdTech | 4 | 5 | no | S | 31.5 |
| 34 | **Unifonic KSA** | SA | CPaaS | 4 | 5 | no | S | 31.5 |
| 35 | **Forte Bank** | KZ | Payment Gateway/Banking | 5 | 3 | no | S | 31.0 |
| 36 | **Pix (BCB)** | BR | Payments | 4 | 5 | no | M | 31.0 |
| 37 | **ETA e-Invoice** | EG | E-Invoice | 5 | 5 | no | L | 31.0 |
| 38 | **Paymob** | EG | Payments | 5 | 5 | no | L | 31.0 |
| 39 | **Xendit** | ID | Payments | 5 | 4 | no | M | 30.0 |
| 40 | **Parasut** | TR | Accounting | 5 | 4 | no | M | 30.0 |
| 41 | **Payme API** | UZ | Payment Gateway | 4 | 5 | no | M | 29.5 |
| 42 | **Click API** | UZ | Payment Gateway | 4 | 5 | no | M | 29.5 |
| 43 | **Halyk Bank ePay** | KZ | Payment Gateway | 4 | 4 | no | M | 29.5 |
| 44 | **Hepsiburada** | TR | Marketplace | 4 | 5 | no | M | 29.5 |
| 45 | **Salla** | SA | E-Commerce | 4 | 5 | no | M | 29.5 |
| 46 | **Amazon Payment Services** | AE | Payments | 4 | 5 | no | M | 29.5 |
| 47 | **Yandex Direct** | RU/KZ/BY/UZ | Advertising | 4 | 5 | no | M | 29.5 |
| 48 | **VK API** | RU/KZ/BY/UZ/... | Social Network | 3 | 5 | yes | M | 29.5 |
| 49 | **iFood** | BR | Food Delivery | 4 | 5 | no | M | 29.5 |
| 50 | **SSLCommerz** | BD | Payments | 4 | 4 | no | S | 29.0 |

---

## 3. Already Built (@theyahia -- 47 servers)

### Tier 1: Production-ready
| Server | npm | Tools | Lines |
|--------|-----|-------|-------|
| dadata-mcp | @metarebalance | 31 | 2603 |

### Tier 2: Decent (need upgrade)
| Server | npm | Tools | Lines |
|--------|-----|-------|-------|
| yookassa-mcp | @theyahia | 10 | 490 |
| cdek-mcp | @theyahia | 6 | 539 |
| cbr-mcp | @theyahia | 5 | 360 |
| tkassa-mcp | @theyahia | 5 | 333 |
| cloudpayments-mcp | @theyahia | 6 | 305 |
| pochta-russia-mcp | @theyahia | 3 | 386 |

### Tier 3: Stubs (40 servers, 2-5 tools, 100-300 lines)

| # | Category | Server | Inventory Match |
|---|----------|--------|-----------------|
| 1 | payments | yookassa-mcp | YooKassa API (score 36.0) |
| 2 | payments | tkassa-mcp | Tinkoff Acquiring (31.5) |
| 3 | payments | robokassa-mcp | Robokassa (25.5) |
| 4 | payments | cloudpayments-mcp | CloudPayments (29.0) |
| 5 | data | dadata-mcp | DaData API (32.0) |
| 6 | data | kontur-focus-mcp | Kontur.Focus (28.0) |
| 7 | data | cbr-mcp | CBR API (21.0) |
| 8 | data | chestnyznak-mcp | Chestny ZNAK (20.5) |
| 9 | crm | amocrm-mcp | amoCRM (29.0) |
| 10 | crm | bitrix24-mcp | Bitrix24 (27.5) |
| 11 | crm | moysklad-mcp | MoySklad (33.5) |
| 12 | crm | retailcrm-mcp | RetailCRM (28.5) |
| 13 | crm | megaplan-mcp | Megaplan (21.0) |
| 14 | crm | planfix-mcp | Planfix (23.5) |
| 15 | crm | kaiten-mcp | Kaiten (28.0) |
| 16 | crm | elma365-mcp | ELMA365 (25.0) |
| 17 | logistics | cdek-mcp | CDEK API v2 (31.5) |
| 18 | logistics | boxberry-mcp | Boxberry (20.0) |
| 19 | logistics | delovye-linii-mcp | Delovye Linii (25.0) |
| 20 | logistics | pochta-russia-mcp | Pochta Russia (22.0) |
| 21 | marketing | yandex-metrika-mcp | Yandex Metrica (31.5) |
| 22 | marketing | yandex-direct-mcp | Yandex Direct (29.5) |
| 23 | marketing | yandex-webmaster-mcp | Yandex Webmaster (25.0) |
| 24 | marketing | unisender-mcp | Unisender (28.0) |
| 25 | marketing | sendpulse-mcp | SendPulse (27.0) |
| 26 | marketing | roistat-mcp | Roistat (25.0) |
| 27 | marketing | calltouch-mcp | Calltouch (24.0) |
| 28 | marketing | mindbox-mcp | Mindbox (26.0) |
| 29 | hr | hh-mcp | HeadHunter (31.0) |
| 30 | hr | superjob-mcp | SuperJob (24.0) |
| 31 | hr | huntflow-mcp | Huntflow (28.0) |
| 32 | comms | vk-mcp | VK API (29.5) |
| 33 | comms | jivosite-mcp | JivoSite (n/a in inventory) |
| 34 | comms | mts-exolve-mcp | MTS Exolve (27.0) |
| 35 | comms | mango-office-mcp | Mango Office (25.0) |
| 36 | comms | voximplant-mcp | Voximplant (28.0) |
| 37 | comms | sms-ru-mcp | SMS.ru (28.0) |
| 38 | comms | tilda-mcp | Tilda (25.0) |
| 39 | ai | gigachat-mcp | GigaChat API (27.0) |
| 40 | ai | yandexgpt-mcp | YandexGPT API (27.0) |
| 41 | ai | salutespeech-mcp | Salute AI (25.0) |
| 42 | ai | yandex-speechkit-mcp | Yandex SpeechKit (26.0) |
| 43 | finance | sber-mcp | Sberbank Acquiring (25.5) |
| 44 | finance | 1c-rest-mcp | 1C:Enterprise (20.5) |
| 45 | other-ru | travelpayouts-mcp | Aviasales/Travelpayouts (29.0) |
| 46 | other-ru | getcourse-mcp | GetCourse (27.0) |
| 47 | cis | kaspi-mcp | Kaspi (27.5) |

---

## 4. By Region

### 4.1 Russia (HIGH priority only)

| Service | Category | API Q | Mkt Size | MCP? | Est Hrs | Score |
|---------|----------|-------|----------|------|---------|-------|
| YooKassa API | Payment Gateway | 5 | 5 | no | S | 36.0 |
| MoySklad | Cloud ERP/WMS | 5 | 4 | no | S | 33.5 |
| DaData API | Address/Company Data | 5 | 4 | no | S | 32.0 |
| Tinkoff Acquiring | Payment Gateway/Banking | 4 | 5 | no | S | 31.5 |
| Yandex Metrica | Web Analytics | 4 | 5 | no | S | 31.5 |
| CDEK API v2 | Courier/Delivery | 4 | 5 | no | S | 31.5 |
| Yandex Direct | Advertising | 4 | 5 | no | M | 29.5 |
| VK API | Social Network | 3 | 5 | yes | M | 29.5 |
| amoCRM | Sales CRM | 4 | 4 | no | S | 29.0 |
| CloudPayments | Payment Gateway | 4 | 4 | no | S | 29.0 |
| 2GIS | Maps/Business Directory | 4 | 4 | no | S | 29.0 |
| Aviasales/Travelpayouts | Flight Search | 4 | 4 | no | S | 29.0 |
| RetailCRM | E-commerce CRM | 5 | 3 | no | M | 28.5 |
| Bitrix24 | CRM/PM/Collaboration | 4 | 5 | unknown | M | 27.5 |
| Telegram Bot API | Messaging/Bots | 5 | 5 | yes | S | 32.5 |
| Yandex Cloud | Cloud IaaS/PaaS/ML | 4 | 5 | no | XL | 26.0 |
| Kontur.Focus | Business Intelligence | 3 | 4 | no | S | 28.0 |
| Poster POS | Restaurant POS | 4 | 3 | no | S | 28.0 |
| Voximplant | CPaaS | 4 | 3 | no | M | 28.0 |
| Huntflow | ATS/Recruiting | 4 | 3 | no | M | 28.0 |
| Kaiten | Project Management | 4 | 3 | no | M | 28.0 |
| Yandex Maps | Maps/Geocoding/Routing | 4 | 5 | no | M | 29.5 |
| Evotor Cloud | Smart POS Terminal | 3 | 4 | no | M | 27.5 |
| iiko | Restaurant POS/Management | 3 | 4 | no | M | 27.5 |
| MTS Exolve | CPaaS | 3 | 4 | no | M | 27.0 |
| GetCourse | Online Course Platform | 3 | 4 | no | M | 27.0 |
| AppMetrica | Mobile Analytics | 4 | 4 | no | M | 27.0 |
| VK Ads | Social Advertising | 3 | 4 | no | M | 27.0 |
| Telegram Ads | Channel Advertising | 3 | 4 | no | M | 27.0 |
| Yandex Go B2B | Corporate Ride-hailing | 3 | 4 | no | M | 27.0 |
| YandexGPT | LLM/AI | 4 | 4 | no | M | 27.0 |
| GigaChat | LLM/AI | 4 | 4 | no | M | 27.0 |
| Alfa-Bank | Banking | 3 | 4 | no | M | 27.0 |
| SPARK (Interfax) | Business Intelligence | 3 | 4 | no | M | 27.0 |
| Pravo.ru/Casebook | Legal Tech | 3 | 3 | no | M | 27.0 |
| Kontur.Diadoc | EDM/E-invoicing | 4 | 4 | no | L | 25.5 |
| ATOL Online | Cloud Fiscalization/OFD | 3 | 4 | no | M | 27.0 |
| ATI.su | Freight Exchange | 3 | 4 | no | M | 27.0 |
| Yandex Routing | Route Optimization | 3 | 3 | no | M | 27.0 |
| Yandex Tracker | Project Management | 4 | 4 | no | M | 27.0 |
| Yandex 360 | Productivity Suite | 3 | 4 | no | M | 27.0 |
| TGStat | Telegram Analytics | 3 | 3 | no | M | 27.0 |
| Unisender | Email Marketing | 3 | 4 | no | S | 28.0 |
| SendPulse | Multi-channel Marketing | 4 | 4 | no | M | 27.0 |
| SMS.ru | SMS Gateway | 3 | 3 | no | S | 28.0 |
| HeadHunter | Job Board | 4 | 5 | yes | S | 31.0 |
| 1C:Enterprise | ERP/Accounting | 3 | 5 | no | XL | 20.5 |
| Chestny ZNAK | Product Labeling | 3 | 5 | no | XL | 20.5 |

**Total Russia: 181 entries, 55 HIGH priority**

### 4.2 Central Asia (KZ, UZ, KG, TJ)

| Service | Country | Category | API Q | Mkt Size | Est Hrs | Score |
|---------|---------|----------|-------|----------|---------|-------|
| Forte Bank | KZ | Payment Gateway | 5 | 3 | S | 31.0 |
| Payme API | UZ | Payment Gateway | 4 | 5 | M | 29.5 |
| Click API | UZ | Payment Gateway | 4 | 5 | M | 29.5 |
| Halyk Bank ePay | KZ | Payment Gateway | 4 | 4 | M | 29.5 |
| Kaspi Marketplace | KZ | E-commerce/Super-app | 3 | 5 | M | 27.5 |
| Factura.uz | UZ | E-invoicing | 4 | 4 | M | 27.0 |
| DIDOX | UZ | E-invoicing/EDM | 3 | 4 | M | 27.0 |
| Uzum Bank/Pay | UZ | Payment Gateway | 3 | 4 | M | 27.0 |
| Kapitalbank (UZ) | UZ | Banking | 3 | 4 | M | 27.0 |
| Webkassa | KZ | Online Cash Register | 3 | 4 | M | 27.0 |
| NCA Layer | KZ | Digital Signatures | 3 | 4 | M | 27.0 |
| eGov.kz Open Data | KZ | Government/Open Data | 3 | 4 | M | 27.0 |
| SolIQ QR | UZ | Fiscal/POS | 3 | 4 | M | 27.0 |
| Elsom | KG | National Mobile Money | 3 | 3 | M | 27.0 |
| ESF (KZ) | KZ | E-invoicing/Fiscal | 3 | 5 | XL | 22.5 |
| Kaspi Pay | KZ | Payments | 1 | 5 | XL | 18.0 |
| Chestny ZNAK KZ | KZ | Product Marking | 3 | 4 | L | 25.0 |
| Alif Bank/Pay | TJ | Banking/Payments | 1 | 3 | L | 16.0 |

**Total Central Asia: 85 entries, 18 HIGH priority**

### 4.3 Caucasus + Eastern Europe (GE, AM, AZ, BY, MD)

| Service | Country | Category | API Q | Mkt Size | Est Hrs | Score |
|---------|---------|----------|-------|----------|---------|-------|
| TBC Bank | GE | Banking/Payments | 4 | 4 | S | 29.0 |
| Bank of Georgia / iPay | GE | Banking/Payments | 4 | 4 | S | 29.0 |
| bePaid | BY | Payment Gateway | 4 | 3 | S | 26.5 |
| MAIB (Moldova) | MD | Banking/Payments | 4 | 4 | M | 27.0 |
| Victoriabank | MD | Banking/Payments | 3 | 3 | M | 27.0 |
| Goldenpay | AZ | Payment Gateway | 3 | 3 | S | 26.5 |
| Payze | GE | Payment Gateway | 4 | 2 | S | 24.0 |
| Kapital Bank (AZ) | AZ | Banking/Payments | 3 | 4 | M | 27.0 |
| ERIP (Belarus) | BY | National Payment System | 3 | 5 | L | 24.0 |
| ARCA (Armenian Card) | AM | Card Processing | 2 | 4 | M | 25.0 |
| Evropochta | BY | Courier/Delivery | 3 | 3 | M | 27.0 |
| E-Qaime (AZ) | AZ | E-invoicing/Fiscal | 3 | 4 | M | 27.0 |
| rs.ge (Revenue GE) | GE | Tax/E-invoicing | 2 | 4 | L | 23.5 |
| SFS Portal / e-Factura (MD) | MD | Tax/E-invoicing | 3 | 4 | M | 27.0 |
| MConnect (MD) | MD | Gov Data Exchange | 3 | 3 | L | 24.5 |
| MPass (MD) | MD | National Auth | 3 | 3 | M | 27.0 |
| Tax.am (SRC) | AM | Tax Authority | 3 | 3 | M | 27.0 |
| e-invoice.am | AM | E-invoicing | 3 | 3 | M | 27.0 |
| Ameriabank Open Banking | AM | Banking | 3 | 3 | M | 27.0 |
| Armenian Fiscal (CRK) | AM | Fiscal/Cash Register | 3 | 3 | M | 27.0 |

**Total Caucasus + EE: 95 entries, 22 HIGH priority**

### 4.4 Turkey

| Service | Category | API Q | Mkt Size | Est Hrs | Score |
|---------|----------|-------|----------|---------|-------|
| iyzico | Payments | 5 | 5 | S | 34.5 |
| Trendyol | Marketplace | 5 | 5 | M | 32.5 |
| Ileti Merkezi | SMS | 5 | 4 | S | 32.0 |
| Is Bankasi | Banking | 4 | 5 | S | 31.5 |
| Turkish Airlines | Travel | 4 | 5 | S | 31.5 |
| Udemy | EdTech | 4 | 5 | S | 31.5 |
| Parasut | Accounting | 5 | 4 | M | 30.0 |
| Hepsiburada | Marketplace | 4 | 5 | M | 29.5 |
| Craftgate | Payments | 5 | 3 | S | 29.5 |
| PayTR | Payments | 4 | 4 | S | 29.0 |
| Papara | Fintech/Wallet | 4 | 4 | S | 29.0 |
| Garanti BBVA | Banking | 4 | 4 | S | 29.0 |
| MNG Kargo | Logistics | 4 | 4 | S | 29.0 |
| Netgsm | SMS | 4 | 4 | S | 29.0 |
| Bulutsantralim | Cloud PBX | 4 | 3 | S | 26.5 |
| Foriba/Sovos | E-Invoice | 4 | 5 | M | 29.5 |
| Nilvera | E-Invoice | 5 | 3 | M | 29.5 |
| Logo Yazilim | ERP | 4 | 5 | L | 28.0 |
| Mikro Yazilim | ERP | 4 | 4 | M | 27.0 |
| Kolay IK | HR | 4 | 3 | M | 26.0 |
| DoktorTakvimi | Healthcare | 4 | 3 | M | 26.0 |
| Yurtici Kargo | Logistics | 2 | 4 | M | 25.0 |
| Aras Kargo | Logistics | 2 | 4 | M | 25.0 |
| Turkcell Mesaj Ussu | SMS | 3 | 4 | S | 27.0 |
| Turkcell API Platform | Telecom | 3 | 4 | S | 27.0 |
| Getir | Grocery/Delivery | 3 | 4 | M | 27.0 |
| Yemeksepeti | Food Delivery | 3 | 4 | M | 27.0 |
| Trendyol Yemek | Food Delivery | 3 | 4 | M | 27.0 |
| Uyumsoft | ERP/E-Invoice | 3 | 3 | M | 27.0 |
| Turkcell e-Sirket | E-Invoice | 4 | 3 | M | 26.0 |
| Pegasus Airlines | Travel | 3 | 4 | M | 27.0 |
| Enuygun | Travel | 5 | 4 | yes | S | 30.0 |
| Obilet | Travel | 3 | 4 | M | 27.0 |
| BtcTurk | Crypto | 4 | 3 | yes | S | 28.0 |
| Sahibinden.com | Classifieds | 1 | 5 | L | 23.5 |
| GIB Portal | E-Invoice | 2 | 5 | L | 23.5 |
| PTT | Postal | 2 | 4 | M | 25.0 |
| Doktar | AgriTech | 4 | 2 | M | 24.0 |

**Total Turkey: 50 entries, 38 HIGH priority**

### 4.5 India

| Service | Category | API Q | Mkt Size | MCP? | Est Hrs | Score |
|---------|----------|-------|----------|------|---------|-------|
| Freshsales/CRM | CRM | 4 | 4 | no | S | 29.0 |
| LeadSquared | CRM | 4 | 3 | no | M | 26.0 |
| TallyPrime | Accounting | 3 | 5 | yes | M | 25.5 |
| ClearTax | Tax | 4 | 5 | no | M | 29.5 |
| Leegality | eSign | 4 | 3 | no | M | 26.0 |
| Gupshup | CPaaS | 4 | 5 | no | L | 28.0 |
| WebEngage | Engagement | 4 | 4 | no | M | 27.0 |
| MoEngage | Engagement | 4 | 4 | no | M | 27.0 |
| CleverTap | Engagement | 4 | 4 | no | M | 27.0 |
| MapMyIndia/Mappls | Maps | 4 | 4 | no | M | 27.0 |
| Shiprocket | Logistics | 4 | 5 | no | M | 29.5 |
| Delhivery | Logistics | 4 | 4 | no | M | 27.0 |
| Keka HR | HR | 4 | 3 | no | M | 26.0 |
| greytHR | HR | 4 | 3 | no | M | 26.0 |
| GSTN API | Tax | 3 | 5 | no | L | 26.0 |
| NIC e-Invoice | Tax | 3 | 5 | no | L | 26.0 |
| Tata 1mg | Healthcare | 4 | 4 | no | S | 29.0 |
| Practo | Healthcare | 3 | 4 | no | M | 27.0 |
| Netcore Cloud | Marketing | 4 | 4 | no | L | 25.5 |

**Total India: 49 entries, 31 HIGH priority**

### 4.6 Gulf (UAE, SA, QA)

| Service | Country | Category | API Q | Mkt Size | Est Hrs | Score |
|---------|---------|----------|-------|----------|---------|-------|
| Tap Payments | AE | Payments | 5 | 5 | S | 34.5 |
| Tap Payments KSA | SA | Payments | 5 | 5 | S | 34.5 |
| PayTabs UAE | AE | Payments | 5 | 4 | S | 32.0 |
| PayTabs KSA | SA | Payments | 5 | 4 | S | 32.0 |
| Unifonic KSA | SA | CPaaS | 4 | 5 | S | 31.5 |
| Salla | SA | E-Commerce | 4 | 5 | M | 29.5 |
| Amazon Payment Services | AE | Payments | 4 | 5 | M | 29.5 |
| Tabby | AE | BNPL | 4 | 4 | S | 29.0 |
| Tamara | AE | BNPL | 4 | 4 | S | 29.0 |
| Unifonic UAE | AE | CPaaS | 4 | 4 | S | 29.0 |
| Moyasar | SA | Payments | 4 | 4 | S | 29.0 |
| Tamara KSA | SA | BNPL | 4 | 4 | S | 29.0 |
| Tabby KSA | SA | BNPL | 4 | 4 | S | 29.0 |
| CEQUENS UAE | AE | CPaaS | 4 | 3 | S | 26.5 |
| PayTabs Qatar | QA | Payments | 4 | 3 | S | 26.5 |
| Tap Payments Qatar | QA | Payments | 4 | 3 | S | 26.5 |
| Foodics Qatar | QA | POS | 4 | 3 | S | 26.5 |
| UAE Pass | AE | Government | 4 | 5 | M | 29.5 |
| Emirates NBD | AE | Banking | 4 | 5 | L | 28.0 |
| Foodics UAE | AE | POS | 4 | 4 | M | 27.0 |
| Network International | AE | Payments | 3 | 4 | L | 24.5 |
| ZATCA Fatoora | SA | E-Invoice | 4 | 5 | L | 28.0 |
| Zid | SA | E-Commerce | 4 | 4 | M | 27.0 |
| Geidea | SA | POS/Payments | 4 | 4 | M | 27.0 |
| Careem | AE | Transport | 3 | 4 | L | 24.5 |
| RTA Dubai | AE | Transport | 3 | 4 | M | 27.0 |
| Dubai Digital Authority | AE | Government | 3 | 4 | L | 24.5 |
| Snapchat Marketing API | AE | Advertising | 4 | 4 | M | 27.0 |
| Emirates Airlines NDC | AE | Travel | 4 | 5 | L | 28.0 |

**Total Gulf: 84 entries, 67 HIGH priority**

### 4.7 China

| Service | Category | API Q | Mkt Size | MCP? | Est Hrs | Score |
|---------|----------|-------|----------|------|---------|-------|
| Alibaba Cloud | Cloud | 5 | 5 | yes | M | 30.5 |
| Feishu / Lark | Collaboration | 5 | 5 | yes | S | 32.5 |
| Taobao / Tmall | Marketplace | 4 | 5 | no | L | 28.0 |
| JD.com | Marketplace | 4 | 5 | no | L | 28.0 |
| Pinduoduo | Marketplace | 3 | 5 | no | M | 27.5 |
| Douyin Shop | Marketplace | 4 | 5 | no | L | 28.0 |
| Meituan | Food/Services | 4 | 5 | no | L | 28.0 |
| Alipay | Payments | 4 | 5 | yes | M | 27.5 |
| WeChat Pay | Payments | 4 | 5 | no | M | 29.5 |
| Ping++ | Payments | 4 | 3 | no | S | 26.5 |
| Kingdee | ERP | 4 | 5 | no | L | 28.0 |
| Yonyou | ERP | 4 | 5 | no | L | 28.0 |
| Boss Zhipin | HR | 4 | 5 | no | M | 29.5 |
| Moka HR | HR | 4 | 3 | no | M | 26.0 |
| ByteDance Ocean Engine | Advertising | 4 | 5 | no | L | 28.0 |
| Baidu Marketing | Advertising | 4 | 5 | no | M | 29.5 |
| Tencent Ads | Advertising | 4 | 5 | no | L | 28.0 |
| Xiaoshouyi / Neocrm | CRM | 4 | 3 | no | M | 26.0 |
| SF Express | Logistics | 4 | 4 | no | M | 27.0 |
| Cainiao | Logistics | 4 | 5 | no | M | 29.5 |
| JD Logistics | Logistics | 4 | 4 | no | M | 27.0 |
| Lalamove | Freight | 4 | 3 | no | M | 26.0 |
| Yunpian | SMS | 5 | 3 | no | S | 29.5 |
| Amap / Gaode Maps | Maps | 4 | 5 | no | M | 29.5 |
| Baidu Maps | Maps | 4 | 5 | no | M | 29.5 |
| Tianyancha | Compliance | 4 | 4 | no | M | 27.0 |
| Didi Chuxing | Transport | 4 | 5 | no | M | 29.5 |
| Ctrip / Trip.com | Travel | 4 | 5 | no | M | 29.5 |
| Baidu Tongji | Analytics | 4 | 5 | no | M | 29.5 |
| WeChat Official Accounts | Social Media | 4 | 5 | yes | M | 27.5 |
| WeChat Mini Programs | Platform | 4 | 5 | no | L | 28.0 |
| Douyin Open Platform | Social Media | 4 | 5 | no | M | 29.5 |
| Weibo | Social Media | 4 | 4 | no | M | 27.0 |
| Nuonuo | E-Invoice | 4 | 4 | no | M | 27.0 |
| Aisino / Golden Tax | E-Invoice | 3 | 5 | no | L | 26.0 |

**Total China: 86 entries, 66 HIGH priority**

### 4.8 SE Asia (ID, VN, TH, MY, PH, BD)

| Service | Country | Category | API Q | Mkt Size | Est Hrs | Score |
|---------|---------|----------|-------|----------|---------|-------|
| Midtrans | ID | Payments | 5 | 5 | M | 32.5 |
| PayMongo | PH | Payments | 5 | 4 | S | 32.0 |
| Globe Labs | PH | Telecom | 5 | 4 | S | 32.0 |
| Xendit | ID | Payments | 5 | 4 | M | 30.0 |
| SSLCommerz | BD | Payments | 4 | 4 | S | 29.0 |
| Billplz | MY | Payments | 4 | 4 | S | 29.0 |
| Shopee VN | VN | Marketplace | 4 | 5 | M | 29.5 |
| Shopee TH | TH | Marketplace | 4 | 5 | M | 29.5 |
| Shopee MY | MY | Marketplace | 4 | 5 | M | 29.5 |
| Shopee PH | PH | Marketplace | 4 | 5 | M | 29.5 |
| Shopee ID | ID | Marketplace | 4 | 5 | M | 29.5 |
| VNPay | VN | Payments | 4 | 5 | M | 29.5 |
| Momo | VN | Payments | 4 | 5 | M | 29.5 |
| bKash | BD | Payments | 4 | 5 | M | 29.5 |
| RajaOngkir | ID | Logistics | 4 | 4 | S | 29.0 |
| BCA | ID | Banking | 4 | 5 | L | 28.0 |
| BRI | ID | Banking | 4 | 5 | L | 28.0 |
| KBank (KBTG) | TH | Banking | 4 | 5 | L | 28.0 |
| LHDN MyInvois | MY | E-Invoice | 4 | 5 | M | 29.5 |
| Mekari | ID | SaaS Platform | 4 | 4 | L | 25.5 |
| Accurate Online | ID | Accounting | 4 | 4 | M | 27.0 |
| GHN | VN | Logistics | 4 | 4 | M | 27.0 |
| GHTK | VN | Logistics | 4 | 4 | M | 27.0 |
| Viettel Post | VN | Logistics | 4 | 4 | M | 27.0 |
| VN e-Invoice | VN | E-Invoice | 4 | 5 | M | 29.5 |
| Zalo OA API | VN | Messaging | 4 | 5 | M | 29.5 |
| Bitkub | TH | Crypto | 4 | 5 | M | 29.5 |
| Opn Payments (Omise) | TH | Payments | 5 | 4 | yes | M | 28.0 |
| 2C2P | TH | Payments | 4 | 4 | M | 27.0 |
| FlowAccount | TH | Accounting | 4 | 3 | S | 28.0 |
| LINE Messaging | TH | Messaging | 4 | 5 | yes | M | 27.5 |
| Agoda | TH | Travel | 4 | 5 | yes | M | 27.5 |
| Pathao Courier | BD | Logistics | 4 | 4 | M | 27.0 |
| Steadfast Courier | BD | Logistics | 4 | 3 | S | 26.5 |
| MISA AMIS | VN | Accounting | 3 | 5 | L | 26.0 |
| KiotViet | VN | POS | 4 | 4 | yes | S | 27.0 |
| Maya/PayMaya | PH | Payments | 4 | 4 | M | 27.0 |
| UnionBank | PH | Banking | 4 | 4 | M | 27.0 |
| GCash | PH | Wallet | 3 | 5 | M | 27.5 |
| Nagad | BD | Payments | 3 | 5 | M | 27.5 |
| Haravan | VN | E-Commerce | 4 | 3 | M | 26.0 |
| Daraz BD | BD | Marketplace | 4 | 4 | M | 27.0 |

**Total SE Asia: 155 entries, 92 HIGH priority**

### 4.9 LATAM (BR, MX, AR)

| Service | Country | Category | API Q | Mkt Size | Est Hrs | Score |
|---------|---------|----------|-------|----------|---------|-------|
| Facturapi | MX | E-Invoicing | 5 | 5 | S | 34.5 |
| Pagar.me (Stone) | BR | Payments | 5 | 4 | S | 32.0 |
| NFe.io | BR | E-Invoicing | 5 | 4 | S | 32.0 |
| Pix (BCB) | BR | Payments | 4 | 5 | M | 31.0 |
| iFood | BR | Food Delivery | 4 | 5 | M | 29.5 |
| Mercado Libre MX | MX | Marketplace | 4 | 5 | M | 29.5 |
| Mercado Libre AR | AR | Marketplace | 4 | 5 | M | 29.5 |
| Mercado Livre BR | BR | Marketplace | 4 | 5 | M | 29.5 |
| PagBank/PagSeguro | BR | Payments | 4 | 4 | M | 27.0 |
| Cielo | BR | Payments | 4 | 5 | M | 29.5 |
| Conekta | MX | Payments | 5 | 5 | yes | S | 32.5 |
| OpenPay (BBVA) | MX | Payments | 4 | 4 | M | 27.0 |
| Bitso | MX | Crypto | 4 | 4 | M | 27.0 |
| Clip | MX | Payments | 4 | 4 | M | 27.0 |
| Skydropx | MX | Logistics | 4 | 4 | M | 27.0 |
| Correios | BR | Logistics | 4 | 5 | M | 29.5 |
| TOTVS | BR | ERP | 4 | 5 | L | 28.0 |
| RD Station | BR | Marketing | 4 | 4 | M | 27.0 |
| Bling | BR | ERP | 4 | 4 | M | 27.0 |
| Omie | BR | ERP | 3 | 4 | M | 27.0 |
| Hotmart | BR | Digital Products | 4 | 5 | M | 29.5 |
| WhatsApp Business | BR | Messaging | 4 | 5 | M | 29.5 |
| Zenvia | BR | CPaaS | 4 | 4 | M | 27.0 |
| Banco do Brasil | BR | Banking | 4 | 5 | M | 29.5 |
| Magazine Luiza | BR | Marketplace | 4 | 4 | M | 27.0 |
| AFIP Factura Electronica | AR | E-Invoicing | 3 | 5 | M | 27.5 |
| Andreani | AR | Logistics | 4 | 4 | M | 27.0 |
| Ripio | AR | Crypto | 4 | 3 | M | 26.0 |
| Focus NFe | BR | E-Invoicing | 4 | 4 | S | 29.0 |
| Asaas | BR | Payments | 4 | 3 | S | 26.5 |
| Gov.br / Receita Federal | BR | Government | 3 | 5 | M | 27.5 |
| SAT (via wrappers) | MX | Government | 2 | 5 | M | 25.5 |

**Total LATAM: 98 entries, 36 HIGH priority**

### 4.10 Africa (NG, KE, ZA)

| Service | Country | Category | API Q | Mkt Size | MCP? | Est Hrs | Score |
|---------|---------|----------|-------|----------|------|---------|-------|
| Nomba | NG | Payments | 5 | 4 | no | S | 33.5 |
| Termii | NG | CPaaS | 5 | 4 | no | S | 32.0 |
| Yoco | ZA | Payments | 5 | 4 | no | S | 32.0 |
| Clickatell | ZA | CPaaS | 5 | 5 | no | M | 32.5 |
| M-Pesa Daraja | KE | Mobile Money | 5 | 5 | yes | S | 32.5 |
| PayFast | ZA | Payments | 4 | 5 | no | S | 31.5 |
| Takealot | ZA | Marketplace | 4 | 5 | no | S | 31.5 |
| Sage SA | ZA | Accounting | 4 | 5 | no | S | 31.5 |
| Paystack | NG | Payments | 5 | 5 | yes | M | 30.5 |
| Flutterwave | NG | Payments | 5 | 5 | yes | M | 30.5 |
| Africa's Talking | KE | CPaaS | 5 | 5 | yes | M | 30.5 |
| Sendchamp | NG | CPaaS | 5 | 3 | no | S | 29.5 |
| Bosta | EG | Logistics | 5 | 3 | no | S | 29.5 |
| Kuda Bank | NG | Banking | 4 | 4 | no | M | 27.0 |
| Ozow | ZA | Payments | 4 | 4 | no | S | 29.0 |
| VALR | ZA | Crypto | 5 | 3 | no | M | 28.0 |
| Nedbank | ZA | Banking | 4 | 4 | no | M | 27.0 |
| Remita | NG | Government | 4 | 4 | no | S | 29.0 |
| GIG Logistics | NG | Logistics | 3 | 4 | no | S | 27.0 |
| SeamlessHR | NG | HR | 4 | 3 | no | S | 26.5 |
| Sendbox | NG | Logistics | 4 | 3 | no | S | 26.5 |
| Bob Go | ZA | Logistics | 4 | 3 | no | S | 26.5 |
| CIPC | ZA | Government | 4 | 3 | no | S | 26.5 |
| NIMC (NIN) | NG | Identity | 3 | 5 | no | S | 27.0 |
| Equity Bank (Jenga) | KE | Banking | 4 | 4 | no | S | 29.0 |
| IntaSend | KE | Payments | 4 | 3 | no | S | 26.5 |
| Kopokopo | KE | Payments | 4 | 3 | no | S | 26.5 |
| KRA eTIMS | KE | Government/Tax | 4 | 5 | no | L | 28.0 |

**Total Africa: 53 entries, 30 HIGH priority**

### 4.11 MENA (EG, DZ, IR, IQ, PK, RS)

| Service | Country | Category | API Q | Mkt Size | Est Hrs | Score |
|---------|---------|----------|-------|----------|---------|-------|
| Divar (Kenar) | IR | Classifieds | 5 | 5 | M | 34.0 |
| ZarinPal | IR | Payments | 5 | 4 | S | 32.0 |
| Kavenegar | IR | SMS/Voice | 5 | 4 | S | 32.0 |
| Chargily Pay | DZ | Payments | 5 | 4 | S | 32.0 |
| ETA e-Invoice | EG | E-Invoice | 5 | 5 | L | 31.0 |
| Paymob | EG | Payments | 5 | 5 | L | 31.0 |
| Fawry | EG | Payments | 4 | 5 | M | 29.5 |
| IDPay | IR | Payments | 4 | 3 | S | 26.5 |
| Melipayamak | IR | SMS | 4 | 3 | S | 26.5 |
| AloPeyk | IR | Delivery | 4 | 3 | S | 26.5 |
| Yalidine | DZ | Logistics | 4 | 3 | S | 26.5 |
| Dolivroo | DZ | Logistics | 4 | 2 | S | 24.0 |
| Bale | IR | Messaging | 3 | 4 | S | 27.0 |
| Neshan Maps | IR | Maps | 4 | 4 | S | 29.0 |
| Arvan Cloud | IR | Cloud | 4 | 4 | M | 27.0 |
| Alibaba.ir | IR | Travel | 3 | 4 | M | 27.0 |
| Moadian | IR | E-Invoice | 3 | 5 | M | 27.5 |
| Finnotech | IR | Open Banking | 4 | 5 | L | 28.0 |
| JazzCash | PK | Payments | 4 | 5 | M | 29.5 |
| Easypaisa | PK | Payments | 4 | 4 | M | 27.0 |
| Daraz.pk | PK | Marketplace | 4 | 4 | M | 27.0 |
| TCS | PK | Logistics | 4 | 5 | M | 29.5 |
| FBR POS | PK | Government/Tax | 4 | 5 | M | 29.5 |
| Bank Alfalah | PK | Banking | 4 | 4 | L | 25.5 |
| NADRA Nishan | PK | Identity/KYC | 3 | 5 | L | 26.0 |
| Foodpanda PK | PK | Food Delivery | 4 | 4 | M | 27.0 |
| ZainCash | IQ | Payments | 4 | 4 | M | 27.0 |
| Qi Card | IQ | Payment Infra | 4 | 4 | M | 27.0 |
| Talabat Iraq | IQ | Food Delivery | 4 | 3 | M | 26.0 |
| SEF / eFaktura | RS | E-Invoice | 4 | 4 | M | 27.0 |
| Wolt RS | RS | Food Delivery | 4 | 3 | M | 26.0 |
| MonriPay | RS | Payments | 4 | 3 | M | 26.0 |
| Minimax | RS | Accounting | 4 | 3 | M | 26.0 |
| Pantheon (Datalab) | RS | ERP | 3 | 4 | L | 24.5 |
| Unifonic | EG | CPaaS | 4 | 4 | S | 29.0 |
| CEQUENS | EG | CPaaS | 4 | 3 | S | 26.5 |
| Daftra | EG | ERP | 4 | 4 | M | 27.0 |
| Jumia Egypt | EG | Marketplace | 4 | 4 | L | 25.5 |
| Talabat Egypt | EG | Food Delivery | 4 | 4 | L | 25.5 |
| SATIM | DZ | Payment Infra | 3 | 4 | M | 27.0 |

**Total MENA: 84 entries, 52 HIGH priority**

---

## 5. By Category Summary

| Category Group | Count | Examples |
|---------------|-------|---------|
| **Payments** (all types) | 131 | YooKassa, iyzico, Tap, Midtrans, Razorpay, M-Pesa |
| **Logistics** (courier, freight, postal) | 79 | CDEK, Correios, SF Express, Aramex, RajaOngkir |
| **Banking** | 60 | Tinkoff, Is Bankasi, BCA, Equity Bank, TBC Bank |
| **Marketplace** | 48 | Trendyol, Shopee, Mercado Libre, Takealot, Tokopedia |
| **Food Delivery** | 30 | iFood, Meituan, GrabFood, Talabat, Getir |
| **E-Invoice / Tax** | 29 | Facturapi, ETA, ZATCA, LHDN, Moadian, FBR |
| **ERP / Accounting** | 35 | MoySklad, TOTVS, Kingdee, Parasut, Sage SA |
| **HR / Recruiting** | 21 | HeadHunter, Keka HR, SeamlessHR, Kolay IK |
| **CRM** | 17 | amoCRM, Bitrix24, Zoho CRM, Freshsales, Xiaoshouyi |
| **CPaaS / SMS** | 31 | Termii, Kavenegar, Gupshup, Clickatell, Africa's Talking |
| **Government / Identity** | 26 | UAE Pass, NADRA, Absher, Gov.br, eGov.kz |
| **Maps / Location** | 7 | Yandex Maps, 2GIS, MapMyIndia, Neshan, Amap |
| **Cloud / AI** | 9 | Yandex Cloud, Alibaba Cloud, Arvan Cloud, GigaChat |
| **Advertising** | 8 | Yandex Direct, ByteDance, Baidu Marketing, Tencent Ads |
| **Social / Messaging** | 12 | VK, Telegram, WeChat, Zalo, Bale, LINE |
| **Travel** | 17 | Turkish Airlines, Ctrip, Agoda, Aviasales, Enuygun |
| **Healthcare** | 11 | Tata 1mg, Practo, DoktorTakvimi, Vezeeta |
| **Crypto** | 16 | Bitso, BtcTurk, Bitkub, VALR, Indodax |
| **Real Estate / Classifieds** | 19 | Divar, Sahibinden, Bayut, Avito, OLX |
| **Other** | ~100 | Insurance, AgriTech, EdTech, Construction... |

**Total unique categories: 180+** (many are sub-categories)

---

## 6. Quick Wins

Services with API_Quality >= 4, NO existing MCP, Est_Hours = S (Small).
These are the fastest to build with highest impact.

### Tier 1 Quick Wins (Score >= 30)

| Service | Country | Category | API Q | Mkt Size | Score |
|---------|---------|----------|-------|----------|-------|
| YooKassa API | RU | Payment Gateway | 5 | 5 | 36.0 |
| Facturapi | MX | E-Invoicing | 5 | 5 | 34.5 |
| iyzico | TR | Payments | 5 | 5 | 34.5 |
| Tap Payments | AE | Payments | 5 | 5 | 34.5 |
| Tap Payments KSA | SA | Payments | 5 | 5 | 34.5 |
| MoySklad | RU/KZ/BY | Cloud ERP/WMS | 5 | 4 | 33.5 |
| Nomba | NG | Payments | 5 | 4 | 33.5 |
| DaData API | RU | Address/Company Data | 5 | 4 | 32.0 |
| Pagar.me | BR | Payments | 5 | 4 | 32.0 |
| NFe.io | BR | E-Invoicing | 5 | 4 | 32.0 |
| ZarinPal | IR | Payments | 5 | 4 | 32.0 |
| Kavenegar | IR | SMS/Voice | 5 | 4 | 32.0 |
| Chargily Pay | DZ | Payments | 5 | 4 | 32.0 |
| Termii | NG | CPaaS | 5 | 4 | 32.0 |
| Yoco | ZA | Payments | 5 | 4 | 32.0 |
| Ileti Merkezi | TR | SMS | 5 | 4 | 32.0 |
| PayTabs UAE | AE | Payments | 5 | 4 | 32.0 |
| PayTabs KSA | SA | Payments | 5 | 4 | 32.0 |
| PayMongo | PH | Payments | 5 | 4 | 32.0 |
| Globe Labs | PH | Telecom | 5 | 4 | 32.0 |
| Tinkoff Acquiring | RU | Payments/Banking | 4 | 5 | 31.5 |
| Yandex Metrica | RU/CIS | Web Analytics | 4 | 5 | 31.5 |
| CDEK API v2 | RU/CIS | Courier/Delivery | 4 | 5 | 31.5 |
| PayFast | ZA | Payments | 4 | 5 | 31.5 |
| Takealot | ZA | Marketplace | 4 | 5 | 31.5 |
| Sage SA | ZA | Accounting | 4 | 5 | 31.5 |
| Is Bankasi | TR | Banking | 4 | 5 | 31.5 |
| Turkish Airlines | TR | Travel | 4 | 5 | 31.5 |
| Udemy | TR | EdTech | 4 | 5 | 31.5 |
| Unifonic KSA | SA | CPaaS | 4 | 5 | 31.5 |
| Forte Bank | KZ | Payments/Banking | 5 | 3 | 31.0 |

### Tier 2 Quick Wins (Score 26-30)

144 total quick wins. Top additional picks:

| Service | Country | Category | Score |
|---------|---------|----------|-------|
| Yunpian | CN | SMS | 29.5 |
| Bosta | EG | Logistics | 29.5 |
| Sendchamp | NG | CPaaS | 29.5 |
| Craftgate | TR | Payments | 29.5 |
| amoCRM | RU/CIS | Sales CRM | 29.0 |
| CloudPayments | RU/CIS | Payment Gateway | 29.0 |
| TBC Bank | GE | Banking | 29.0 |
| Bank of Georgia | GE | Banking | 29.0 |
| 2GIS | RU/KZ/KG/UZ | Maps | 29.0 |
| Aviasales | RU/CIS | Flight Search | 29.0 |
| Focus NFe | BR | E-Invoicing | 29.0 |
| RajaOngkir | ID | Logistics | 29.0 |
| Neshan Maps | IR | Maps | 29.0 |
| Unifonic | EG | CPaaS | 29.0 |
| Ozow | ZA | Payments | 29.0 |
| PayTR | TR | Payments | 29.0 |
| Papara | TR | Fintech/Wallet | 29.0 |
| Garanti BBVA | TR | Banking | 29.0 |
| MNG Kargo | TR | Logistics | 29.0 |
| Netgsm | TR | SMS | 29.0 |
| SSLCommerz | BD | Payments | 29.0 |
| Billplz | MY | Payments | 29.0 |
| Equity Bank (Jenga) | KE | Banking | 29.0 |
| Remita | NG | Government | 29.0 |
| Tabby | AE | BNPL | 29.0 |
| Tamara | AE | BNPL | 29.0 |
| Moyasar | SA | Payments | 29.0 |
| FlowAccount | TH | Accounting | 28.0 |
| Poster POS | RU/CIS | Restaurant POS | 28.0 |
| Freshsales/CRM | IN | CRM | 29.0 |
| Tata 1mg | IN | Healthcare | 29.0 |

---

*This document is the single source of truth for NeuralDeep MCP server candidate prioritization.*
*Source data: research/inventory_cis.csv + research/inventory_world.csv*
