# Deep Research: MCP Candidates — China (CN)

> **Research Date:** April 2026 | **Analyst:** Claude Sonnet 4.6
> **Scope:** 38 categories × Chinese tech ecosystem — API availability, MCP gap analysis, prioritisation

---

## Market Overview

| Parameter | Detail |
|-----------|--------|
| Population | 1.4B |
| Internet Users | ~1.08B |
| Dominant Payments | Alipay + WeChat Pay (duopoly, ~95% mobile payments) |
| API Language | Chinese (Mandarin); English docs rare outside Alibaba Cloud / Tencent Cloud |
| Key Regulatory | Great Firewall, PIPL (data localisation), Golden Tax fapiao mandate, ICP licence required |
| MCP Ecosystem | Nascent — most Chinese platforms have NO MCP server; Feishu/Lark is notable exception |
| Business Registration | Most B-grade APIs require 营业执照 (business licence) + ICP |

---

## A. COMMERCE & MARKETPLACES

### A1. E-Commerce

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Taobao / Tmall (Alibaba) | China's #1 C2C + B2C marketplace | Public API (TOP platform) | open.taobao.com | OAuth2 + App Key | ~$850B GMV | **HIGH** | 60–80h | Requires seller account; Chinese docs; no MCP found |
| JD.com | #2 B2C, own logistics | Public API (JOS) | jos.jd.com | OAuth2 | ~$380B GMV | **HIGH** | 60–80h | Rich API; order/inventory/logistics; no MCP found |
| Pinduoduo | Group-buy / low-price leader | Partner API | open.pinduoduo.com | HMAC-SHA256 | ~$490B GMV | **HIGH** | 40–60h | Temu seller API partially overlaps; no MCP |
| 1688.com | B2B wholesale marketplace (Alibaba) | Public API | open.1688.com | OAuth2 | Dominant B2B | **HIGH** | 50–70h | Key for supply chain automation; no MCP |
| AliExpress | Cross-border e-commerce | Public API | developers.aliexpress.com | OAuth2 | Global seller tool | **MEDIUM** | 40–60h | English docs available; no MCP found |
| Xiaohongshu / RED | Lifestyle + social commerce | Partner API (restricted) | open.xiaohongshu.com | OAuth2 | 300M+ MAU | **HIGH** | 60–80h | Very restricted; requires brand partner status |
| Douyin Shop | TikTok China e-commerce | Public API | developer.open-douyin.com | OAuth2 | Fastest-growing | **HIGH** | 60–80h | ByteDance Open Platform; separate from TikTok Shop |
| Kuaishou Shop | Short-video commerce | Partner API | open.kuaishou.com | OAuth2 | 400M MAU | **MEDIUM** | 50–70h | Less documented than Douyin |

### A2. Grocery & Food Delivery

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Meituan Maicai | Instant grocery (30-min) | Internal / Partner | open.meituan.com | OAuth2 | #1 instant grocery | **MEDIUM** | 60h | B2B partner API only; no public MCP |
| Dingdong Maicai | Pre-order grocery | Internal only | N/A | N/A | ~$2B revenue | **LOW** | N/A | No public API |
| Hema / Freshippo (Alibaba) | Supermarket + delivery | Internal / Partner | N/A | N/A | 300+ stores | **MEDIUM** | 60h | API via Alibaba ecosystem; no standalone docs |

### A3. Restaurant / Food Ordering

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Meituan | #1 food delivery + life services | Public API (Open Platform) | open.meituan.com | OAuth2 + HMAC | ~70% market share | **HIGH** | 60–80h | Rich API: orders, reviews, merchant mgmt; no MCP |
| Ele.me (Alibaba) | #2 food delivery | Public API | open.ele.me | OAuth2 | ~30% market share | **HIGH** | 50–70h | Alibaba ecosystem integration; no MCP |

### A4. POS / Retail Tech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Hualala (哗啦啦) | Restaurant POS + management | Partner API | open.hualala.com | API Key | 400,000+ restaurants | **HIGH** | 40–60h | Dominant restaurant SaaS; no MCP; Chinese only |
| Meituan POS / Kuaifu | F&B POS integrated with Meituan | Partner API | Via Meituan Open | OAuth2 | Bundled with Meituan | **MEDIUM** | 40h | Integrated with food delivery ecosystem |
| Ling Shou Tong (灵寿通, Alibaba) | FMCG retail digitisation | Partner API | lst.alibaba.com | OAuth2 | Millions of small stores | **MEDIUM** | 50h | Key for FMCG/CPG supply chain |

---

## B. FINANCE & PAYMENTS

### B5. Banks with APIs

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| ICBC (工商银行) | Largest bank by assets | Partner API | open.icbc.com.cn | RSA + OAuth2 | World's largest bank | **HIGH** | 80–120h | Corporate API available; requires enterprise agreement |
| CCB (建设银行) | #2 state bank | Partner API | open.ccbchina.com | RSA | $4.7T assets | **MEDIUM** | 80h | Corporate payments API |
| ABC (农业银行) | #3 state bank | Partner API | N/A (private) | RSA | $4.5T assets | **LOW** | 100h | Very limited public API |
| BOC (中国银行) | #4 state bank + FX | Partner API | N/A (private) | RSA | FX dominant | **MEDIUM** | 80h | Cross-border payment API of interest |
| WeBank (微众银行, Tencent) | China's first digital bank | Public API | open.webank.com | OAuth2 | 350M+ users | **HIGH** | 50–70h | Best API among banks; MSME lending APIs |
| MYbank (网商银行, Ant) | SME digital bank | Partner API | Via Alipay open | OAuth2 | Integrated with Alipay | **HIGH** | 50h | SME lending; integrated in Alibaba ecosystem |

### B6. Payment Gateways

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Alipay | #1 mobile payment | **Public API** | open.alipay.com | RSA2 + OAuth2 | 1.3B users | **HIGH** | 40–60h | Excellent docs; AlipayPlus MCP exists (intl); domestic MCP gap |
| WeChat Pay | #2 mobile payment | **Public API** | pay.weixin.qq.com | HMAC-SHA256 | 900M+ users | **HIGH** | 40–60h | Mature API; no standalone MCP server found |
| UnionPay (银联) | Card network + QR pay | Partner API | open.unionpay.com | RSA | Dominant cards | **MEDIUM** | 60–80h | Requires bank partnership |
| Ping++ (Pingplusplus) | Payment aggregator (Stripe-like) | **Public API** | pingxx.com/docs | API Key | Developer-focused | **HIGH** | 20–30h | Best DX among Chinese payment APIs; no MCP |
| LianLian Pay | Cross-border + domestic | Public API | open.lianlianpay.com | OAuth2 | Cross-border focus | **MEDIUM** | 40h | Popular with Amazon/eBay sellers |
| Yeepay (易宝支付) | Payment gateway | Public API | open.yeepay.com | RSA | Enterprise payments | **MEDIUM** | 40h | Financial services focus |

### B7. Mobile Wallets / Digital Currency

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Alipay Wallet | Consumer wallet | Public API | open.alipay.com | RSA2 | 1.3B users | **HIGH** | 30–50h | Mini-program + wallet APIs; no MCP |
| WeChat Pay Wallet | Consumer wallet in WeChat | Public API | pay.weixin.qq.com | HMAC-SHA256 | 900M+ | **HIGH** | 30–50h | Deeply embedded in WeChat ecosystem |
| Digital RMB / e-CNY | PBOC central bank digital currency | Restricted Partner | N/A (PBOC-controlled) | N/A | Pilot phase | **LOW** | N/A | No public API; PBOC controls entirely |
| UnionPay QuickPass | NFC + QR payment | Partner API | Via UnionPay | RSA | Widespread | **LOW** | 60h | Requires UnionPay certification |

### B8. Fintech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Ant Group / Alipay+ | Fintech super-platform | Public API | open.alipay.com | RSA2 | $78B valuation | **HIGH** | 40–60h | Credit scoring (Sesame), wealth mgmt, lending |
| Tiger Brokers (老虎证券) | Online brokerage | **Public API** | quant.itiger.com | OAuth2 | NASDAQ-listed | **HIGH** | 30–40h | Trading API well-documented; partial MCP opportunity |
| Futu / Moomoo | Online brokerage | **Public API** | openapi.futunn.com | OAuth2 | NASDAQ-listed | **HIGH** | 30–40h | Futu OpenAPI is mature; no MCP found |
| Du Xiaoman (度小满, Baidu) | Consumer lending + wealth | Internal | N/A | N/A | Spun off Baidu FS | **LOW** | N/A | No public API |
| Lufax | P2P/fintech (Ping An) | Internal | N/A | N/A | Listed NYSE | **LOW** | N/A | No public API |

### B9. Insurance

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| ZhongAn (众安保险) | Fully digital insurance | **Public API** | cw.zhongan.com | OAuth2 + API Key | Largest insurtech | **HIGH** | 40–60h | API for embedding insurance in apps; no MCP |
| Waterdrop (水滴) | Health insurance + crowdfunding | Partner API | N/A public | N/A | Major platform | **MEDIUM** | 60h | Less open than ZhongAn |
| PICC (人保) | #1 P&C insurer | Partner API | N/A public | RSA | State-owned giant | **LOW** | 80h | API mainly for enterprise partners |

---

## C. LOGISTICS & DELIVERY

### C10. Courier / Last-Mile

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| SF Express (顺丰) | Premium courier | **Public API** | open.sf-express.com | API Key + RSA | #1 premium | **HIGH** | 30–40h | Well-documented; waybill, tracking, pickup; no MCP |
| ZTO Express (中通) | #1 by volume | Partner API | open.zto.com | OAuth2 | Largest volume | **HIGH** | 30–40h | Good API coverage; no MCP |
| YTO Express (圆通) | Major courier | Partner API | open.yto.net.cn | OAuth2 | Top-5 courier | **MEDIUM** | 30h | Similar to ZTO |
| STO Express (申通) | Major courier (Alibaba-owned) | Partner API | open.sto.cn | OAuth2 | Top-5 courier | **MEDIUM** | 30h | Alibaba ecosystem |
| Yunda Express (韵达) | Major courier | Partner API | open.yundaex.com | API Key | Top-5 courier | **MEDIUM** | 30h | Less mature API |
| Cainiao (菜鸟, Alibaba) | Logistics network orchestrator | Public API | open.cainiao.com | OAuth2 | Alibaba logistics hub | **HIGH** | 40–60h | Aggregates all couriers; key for e-commerce automation |
| JD Logistics | Self-operated logistics | Public API | open.jdl.com | OAuth2 | Premium B2B/B2C | **HIGH** | 40–60h | Cold chain, warehousing APIs; no MCP |

### C11. Postal Services

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| China Post / EMS | National postal service | Partner API | open.chinapost.com.cn | API Key | Universal service | **LOW** | 40h | Limited API; slow modernisation |

### C12. Freight / B2B Logistics

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Full Truck Alliance / Manbang (满帮) | Uber for trucks | **Public API** | open.manbang.com | OAuth2 | NYSE-listed; $2B+ revenue | **HIGH** | 50–70h | Load matching, pricing API; no MCP |
| Lalamove (货拉拉) | Same-day freight delivery | Public API | developers.lalamove.com | OAuth2 | 400+ cities | **HIGH** | 30–40h | English + Chinese docs; no MCP server found |
| GoGoX (Gogovan) | HK/China freight | Partner API | developer.gogox.com | OAuth2 | HK focus | **LOW** | 30h | Smaller than Lalamove |

### C13. Warehousing / Fulfillment

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Cainiao Fulfillment | 3PL fulfillment (Alibaba) | Partner API | open.cainiao.com | OAuth2 | Dominant for Taobao/Tmall | **HIGH** | 50h | WMS API; no MCP |
| JD Fulfillment (京东物流-仓配) | 3PL fulfillment (JD) | Partner API | open.jdl.com | OAuth2 | Premium 3PL | **HIGH** | 50h | WMS + TMS APIs |

---

## D. BUSINESS SOFTWARE & SaaS

### D14. CRM

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Xiaoshouyi / Neocrm (销售易) | #1 enterprise CRM | **Public API** | open.xiaoshouyi.com | OAuth2 | 3000+ enterprise clients | **HIGH** | 40–60h | Salesforce competitor; no MCP found |
| Fenxiang Xiaoke (纷享销客) | SME CRM | Public API | open.fxiaoke.com | OAuth2 | SME focus | **HIGH** | 40h | Good API docs; no MCP |
| Jianyu (简道云) | No-code CRM/forms | Public API | hc.jiandaoyun.com/api | API Key | 5M+ users | **MEDIUM** | 20–30h | Airtable-like; API well-documented |
| Weike (微客) | WeChat-native CRM | Partner API | N/A public | N/A | WeChat ecosystem | **MEDIUM** | 40h | Embedded in enterprise WeChat |

### D15. ERP

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Kingdee (金蝶) | #1 Chinese ERP (cloud) | **Public API** | open.kingdee.com | OAuth2 | 7M+ SME clients | **HIGH** | 60–80h | Kingdee Cloud open platform; no MCP found |
| Yonyou (用友) | #2 Chinese ERP | **Public API** | open.yonyoucloud.com | OAuth2 | Large enterprise focus | **HIGH** | 60–80h | NC Cloud + iUAP platform APIs |
| SAP China | Global ERP localised | Public API | developers.sap.com | OAuth2 | MNC segment | **MEDIUM** | 40–60h | SAP BTP; some MCP tools exist internationally |

### D16. Accounting / Tax

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Kingdee Finance | Accounting module | Public API | open.kingdee.com | OAuth2 | Bundled with ERP | **HIGH** | 40h | Part of Kingdee Cloud |
| Yonyou Finance | Accounting module | Public API | open.yonyoucloud.com | OAuth2 | Bundled with ERP | **HIGH** | 40h | Part of YonYou NC |
| Baiwang (百望) | Tax + accounting SaaS | Partner API | open.baiwangcloud.com | OAuth2 | 3M+ enterprises | **HIGH** | 40–60h | Critical: fapiao + accounting integration |

### D17. E-Invoice / Fapiao ⭐ CRITICAL CATEGORY

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Aisino / Golden Tax (航信) | Official Golden Tax hardware + API | Partner API | isales.aisino.com | RSA + API Key | Mandatory for all enterprises | **HIGH** | 60–80h | 100% market mandated by SAT (税务局); no MCP |
| Baiwang (百望) | e-Fapiao SaaS | Partner API | open.baiwangcloud.com | OAuth2 | Millions of businesses | **HIGH** | 40–60h | Strong API coverage; no MCP |
| Nuonuo (诺诺, Alibaba) | e-Fapiao (Alibaba's solution) | **Public API** | open.nuonuo.com | OAuth2 | Alibaba ecosystem | **HIGH** | 30–40h | Best DX for fapiao; integrated with Alipay; no MCP |
| Hangxin (航信互联) | Tax filing + fapiao | Partner API | N/A public | RSA | Mid-market | **MEDIUM** | 60h | Less open than Nuonuo/Baiwang |

### D18. EDI / Document Management

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| GS1 China | Barcode / product registry | Partner API | www.gs1cn.org | API Key | Standard body | **MEDIUM** | 40h | Product data registry; no MCP |
| Alibaba Cloud OSS + DMS | Document storage + management | **Public API** | help.aliyun.com | AK/SK | Cloud-scale | **MEDIUM** | 20–30h | Within Alibaba Cloud ecosystem |

### D19. HR / Recruiting

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Boss Zhipin (BOSS直聘) | #1 direct-hire job platform | **Public API** | open.zhipin.com | OAuth2 | 100M+ users | **HIGH** | 40–60h | Employer posting + resume API; no MCP found |
| Zhaopin (智联招聘) | Major job platform | Partner API | open.zhaopin.com | OAuth2 | Traditional leader | **MEDIUM** | 40h | Less modern DX than BOSS |
| 51job (前程无忧) | Major job platform | Partner API | N/A public | N/A | Listed NASDAQ | **LOW** | 60h | Limited public API |
| Moka HR | ATS + HRIS | **Public API** | developer.mokahr.com | OAuth2 | 1000+ enterprise clients | **HIGH** | 30–40h | Best API DX in Chinese HR SaaS; no MCP |
| Liepin (猎聘) | Executive recruiting | Partner API | N/A public | N/A | Mid-senior level | **LOW** | 60h | Limited API |

### D20. Project Management / Collaboration ⭐

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| **Feishu / Lark** (ByteDance) | Enterprise collaboration suite | **Public API** | open.feishu.cn / open.larksuite.com | OAuth2 | 500M+ MAU | ✅ **MCP EXISTS** | — | **OFFICIAL MCP**: larksuite/lark-openapi-mcp (584★); also cso1z/Feishu-MCP (488★) |
| **DingTalk** (Alibaba) | Enterprise comms + OA | **Public API** | open.dingtalk.com | OAuth2 | 700M+ users | ⚠️ **PARTIAL MCP** | 30–40h | wllcnm/dingding MCP exists (basic); official MCP missing |
| **WeChat Work** (企业微信) | Enterprise WeChat | **Public API** | work.weixin.qq.com/api | OAuth2 | 180M+ users | ⚠️ **PARTIAL MCP** | 30–40h | wecom-bot-mcp-server exists (messaging only); no full MCP |
| Teambition (Alibaba) | Project management | Public API | open.teambition.com | OAuth2 | 10M+ users | **MEDIUM** | 30h | Notion-like; no MCP |
| Ones.ai | Enterprise PM + DevOps | Public API | ones.ai/open-api | OAuth2 | Enterprise segment | **MEDIUM** | 30h | GitHub-like project tracking; no MCP |

---

## E. MARKETING & COMMUNICATIONS

### E21. SMS / Push Notifications

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Alibaba Cloud SMS | SMS gateway | **Public API** | help.aliyun.com/sms | AK/SK | #1 cloud SMS | **HIGH** | 20–30h | Excellent docs; English available; no MCP |
| Tencent Cloud SMS | SMS gateway | **Public API** | cloud.tencent.com/sms | API Key | #2 cloud SMS | **HIGH** | 20–30h | Good docs; no MCP |
| Yunpian (云片) | SMS aggregator | **Public API** | www.yunpian.com/api | API Key | Developer-friendly | **HIGH** | 15–20h | Best DX for SMS; Twilio equivalent; no MCP |
| Submail | Multi-channel messaging | **Public API** | www.mysubmail.com/en/documents | API Key | SME focus; bilingual | **MEDIUM** | 15–20h | English docs available |

### E22. Email Marketing

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Alibaba Cloud DirectMail | Transactional email | **Public API** | help.aliyun.com/dm | AK/SK | Enterprise | **MEDIUM** | 20h | Less strategic (email not dominant in China) |
| NetEase Coremail | Enterprise email | Partner API | mail.163.com/api | OAuth2 | 163.com / 126.com | **LOW** | 40h | Less relevant than messaging |

### E23. Advertising Platforms

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| ByteDance Ocean Engine (巨量引擎) | TikTok/Douyin ad platform | **Public API** | open.oceanengine.com | OAuth2 | Largest ad platform | **HIGH** | 60–80h | Marketing API mature; no MCP found |
| Baidu Marketing API (百度营销) | Search + feed ads | **Public API** | mssp.baidu.com | OAuth2 | #1 search ads | **HIGH** | 50–70h | BMAPI well-documented; no MCP |
| Tencent Ads (腾讯广告) | WeChat + QQ ad platform | **Public API** | ads.tencent.com/api | OAuth2 | Social ads leader | **HIGH** | 60–80h | Marketing API available; no MCP |
| Xiaohongshu Ads | KOL + lifestyle ads | Partner API | partner.xiaohongshu.com | OAuth2 | Premium lifestyle | **MEDIUM** | 60h | Restricted access |
| Bilibili Ads | Gen-Z video platform | Partner API | member.bilibili.com | OAuth2 | 400M MAU | **MEDIUM** | 50h | Growing ad platform |
| Kuaishou Ads | Short-video ads | Public API | open.kuaishou.com/ads | OAuth2 | 400M DAU | **MEDIUM** | 50h | Competitor to Douyin |

### E24. Social Media / Content Platforms

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| WeChat Official Accounts | Brand publishing platform | **Public API** | mp.weixin.qq.com/wiki | OAuth2 | 1.3B users | **HIGH** | 40–60h | Message sending, article publishing; partial MCP (wechat-mcp) |
| WeChat Mini Programs | App-in-app platform | **Public API** | developers.weixin.qq.com | OAuth2 | 500M+ mini app users | **HIGH** | 60–80h | Unique Chinese platform; no MCP for mini program automation |
| Weibo Open API | Twitter equivalent | **Public API** | open.weibo.com | OAuth2 | 580M MAU | **HIGH** | 30–40h | Post, read timeline, search; no MCP found |
| Douyin Open Platform | TikTok China creator/brand API | **Public API** | developer.open-douyin.com | OAuth2 | 700M+ DAU | **HIGH** | 50–70h | Content + commerce API; no MCP |
| Xiaohongshu (RED) | Pinterest/Instagram hybrid | Partner API | open.xiaohongshu.com | OAuth2 | 300M MAU | **HIGH** | 60–80h | Brand + creator API; restricted; no MCP |
| Bilibili | Video platform (iQiyi of Gen-Z) | Public API | openhome.bilibili.com | OAuth2 | 400M MAU | **MEDIUM** | 40h | Content + analytics API; no MCP |
| Zhihu | Q&A platform (Quora equivalent) | Partner API | open.zhihu.com | OAuth2 | 100M MAU | **LOW** | 40h | Limited API access |
| Kuaishou | Short-video (Douyin competitor) | Public API | open.kuaishou.com | OAuth2 | 400M DAU | **MEDIUM** | 50h | Growing; no MCP |

### E25. Analytics

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Baidu Tongji (百度统计) | Web analytics (GA equivalent) | **Public API** | tongji.baidu.com/api | OAuth2 | Dominant in China | **HIGH** | 30–40h | Reporting API; no MCP found |
| GrowingIO (北极星) | Product analytics | **Public API** | docs.growingio.com/api | OAuth2 | Enterprise focus | **HIGH** | 30–40h | Mixpanel/Amplitude equivalent; no MCP |
| Sensors Data (神策数据) | Enterprise analytics | **Public API** | manual.sensorsdata.cn | API Key | 2000+ enterprise | **HIGH** | 30–40h | On-premise + cloud; no MCP |
| TalkingData | Mobile analytics | Partner API | www.talkingdata.com | API Key | Mobile focus | **MEDIUM** | 30h | Aging platform |
| Umeng (友盟, Alibaba) | Mobile analytics + push | Public API | developer.umeng.com | App Key | 800K+ apps | **HIGH** | 30–40h | Integrated with Alibaba; no MCP |

---

## F. INFRASTRUCTURE & CLOUD

### F26. Cloud Platforms

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Alibaba Cloud (阿里云) | #1 Chinese cloud | **Public API** | help.aliyun.com | AK/SK | ~37% China market | ✅ **MCP EXISTS** | — | Alibaba Cloud RDS MCP on official MCP registry |
| Tencent Cloud | #2 Chinese cloud | **Public API** | cloud.tencent.com/doc | SecretId/SecretKey | ~33% market | **HIGH** | 40–60h | Excellent APIs; no comprehensive MCP |
| Huawei Cloud | #3 Chinese cloud | **Public API** | support.huaweicloud.com | AK/SK | Global ambitions | **HIGH** | 50–70h | Strong APIs; no MCP |
| Baidu AI Cloud | AI-focused cloud | **Public API** | cloud.baidu.com | AK/SK | AI/ML focus | **MEDIUM** | 40h | Ernie + Wenxin Yiyan integration opportunities |
| JD Cloud | JD's cloud | Public API | docs.jdcloud.com | AK/SK | Logistics/retail focus | **LOW** | 40h | Smaller scale |

### F27. Telecom API / CPaaS

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Agora (声网) | RTC video/audio SDK | **Public API** | docs.agora.io | App ID/Token | Global RTC leader | **HIGH** | 30–40h | English docs; no MCP |
| Rongcloud (融云) | IM cloud service | **Public API** | doc.rongcloud.cn | App Key | 10K+ apps | **HIGH** | 30–40h | Chat + IM API; no MCP |
| ZEGO (即构) | Audio/video SDK | **Public API** | docs.zegocloud.com | App ID | Global reach | **MEDIUM** | 30h | English docs available |
| Alibaba Cloud Communication | SMS + voice + video | **Public API** | help.aliyun.com | AK/SK | Enterprise-grade | **HIGH** | 30–40h | Within Alibaba Cloud; no separate MCP |

### F28. Maps

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Amap / Gaode (高德, Alibaba) | #1 mobile map (China) | **Public API** | lbs.amap.com | API Key | 900M MAU | **HIGH** | 30–40h | Best map API in China; geocoding, routing, POI; no MCP |
| Baidu Maps | #2 map platform | **Public API** | lbsyun.baidu.com | API Key | 650M MAU | **HIGH** | 30–40h | Good API; Chinese + English docs; no MCP |
| Tencent Maps (腾讯地图) | Map + WeChat integration | **Public API** | lbs.qq.com | API Key | 300M MAU | **MEDIUM** | 30h | Best for WeChat ecosystem; no MCP |

---

## G. GOVERNMENT & COMPLIANCE

### G29. Government Services

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| 国家政务服务平台 | National e-government portal | Closed / Restricted | gjzwfw.gov.cn | Government cert | Entire population | **LOW** | N/A | Not open to commercial MCP builders |
| Alipay Gov Mini-Programs | Citizen services in Alipay | Partner API | Via Alipay Open | OAuth2 | 100+ city govs | **MEDIUM** | 60h | Tax payment, license renewal; requires gov partnership |
| WeChat Gov Services | Gov services in WeChat | Partner API | Via WeChat Open | OAuth2 | 100+ city govs | **MEDIUM** | 60h | Same ecosystem, WeChat side |

### G30. Compliance / Certification

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Tianyancha (天眼查) | Enterprise credit/registry | **Public API** | open.tianyancha.com | API Key | 220M+ users | **HIGH** | 30–40h | Company lookup, shareholding, legal cases; no MCP |
| Qichacha (企查查) | Enterprise credit alternative | **Public API** | openapi.qichacha.com | API Key | Major competitor | **HIGH** | 30–40h | Similar to Tianyancha; no MCP |
| SAMR (市场监管总局) | Product registration/CCC | Government-only | N/A | N/A | Regulatory body | **LOW** | N/A | No API for third parties |

---

## H. INDUSTRY VERTICALS

### H31. Real Estate

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Beike / KE.com (贝壳) | #1 property platform (NYSE) | Partner API | open.ke.com | OAuth2 | $5B+ revenue | **HIGH** | 50–70h | Listing data, agent tools; no MCP |
| Lianjia (链家) | #1 brokerage (owned by Beike) | Via Beike API | open.ke.com | OAuth2 | China's Compass | **MEDIUM** | 40h | Same parent as Beike |
| Anjuke (安居客, 58.com) | Property listings | Partner API | N/A public | N/A | Major portal | **MEDIUM** | 50h | Less open API |
| Fang.com (房天下) | Real estate portal | Partner API | N/A public | N/A | Older portal | **LOW** | 60h | Declining relevance |

### H32. EdTech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| NetEase Youdao (有道) | Translation + learning | **Public API** | ai.youdao.com | API Key | 100M+ users | **HIGH** | 20–30h | Translation API is excellent; dict + OCR; no MCP |
| Zuoyebang (作业帮) | Homework help (post-crackdown pivot) | Internal | N/A | N/A | Pivoting to AI | **LOW** | N/A | No public API |
| Xuexi Qiangguo (学习强国) | CCP education app | Government | N/A | N/A | 200M installs | **LOW** | N/A | No commercial API |
| Ximalaya (喜马拉雅) | Podcast/audio platform | Public API | open.ximalaya.com | OAuth2 | China's Spotify of audio | **MEDIUM** | 30–40h | Content API; no MCP |

### H33. Healthcare

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Ping An Good Doctor (平安好医生) | Telemedicine + health mgmt | Partner API | N/A public | OAuth2 | 400M+ registered | **HIGH** | 60–80h | AI-triage, appointment; no public MCP |
| DXY / DingXiang Yuan (丁香园) | Medical professional platform | Partner API | open.dxy.cn | OAuth2 | 15M medical pros | **HIGH** | 50h | Drug DB, clinical tools; no MCP |
| JD Health (京东健康) | Online pharmacy + telemedicine | Partner API | open.jdhealth.com | OAuth2 | 150M+ users | **HIGH** | 50h | Medicine ordering API; no MCP |
| Ali Health (阿里健康) | Online pharmacy (Alibaba) | Partner API | Via Taobao Open | OAuth2 | Tmall Pharmacy leader | **HIGH** | 50h | Integrated in Alibaba; no MCP |
| WeDoctor (微医) | Appointment + telemedicine | Internal | N/A | N/A | Major platform | **MEDIUM** | 80h | Limited public API |

### H34. Transport

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Didi Chuxing (滴滴) | #1 ride-hailing (China's Uber) | **Public API** | open.didiglobal.com | OAuth2 | 550M users | **HIGH** | 50–70h | Corporate travel API well-documented; no MCP |
| Hello / Hellobike (哈啰) | Bike + scooter sharing | Partner API | N/A public | N/A | 500M+ users | **LOW** | 60h | Limited API access |
| Caocao Mobility (曹操出行) | Geely-owned ride-hailing | Internal | N/A | N/A | Growing | **LOW** | N/A | No public API |
| Amap Ride-Hailing (高德打车) | Ride aggregator in Amap | Via Amap API | lbs.amap.com | API Key | 200M+ users | **MEDIUM** | 40h | Aggregates Didi + others |

### H35. Travel

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Ctrip / Trip.com (携程) | #1 OTA (NASDAQ) | **Public API** | open.ctrip.com / hapi.ctrip.com | OAuth2 | Dominant OTA | **HIGH** | 50–70h | Hotel, flight, train booking API; no MCP |
| Qunar (去哪儿, owned by Ctrip) | Price comparison OTA | Partner API | open.qunar.com | OAuth2 | Integrated with Ctrip | **MEDIUM** | 40h | Less strategic given Ctrip overlap |
| Fliggy (飞猪, Alibaba) | Travel e-commerce | Partner API | open.fliggy.com | OAuth2 | Alibaba travel | **MEDIUM** | 40h | Integrated with Taobao ecosystem |
| Tongcheng (同程旅行) | Budget travel + Tencent JV | Partner API | open.ly.com | OAuth2 | WeChat-integrated | **MEDIUM** | 40–50h | WeChat travel bookings; no MCP |
| 12306 (China Railway) | High-speed rail ticketing | **No public API** | www.12306.cn | N/A | 4B tickets/year | **HIGH** | N/A | Government monopoly; unofficial scrapers exist only |

### H36. Legal Tech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Fa Yi Tong (法意通) | Legal database | Partner API | N/A | N/A | Niche | **LOW** | 80h | Limited open access |
| Peking University Fabao (北大法宝) | Legal research database | Partner API | api.pkulaw.com | API Key | Legal professionals | **MEDIUM** | 40h | Case law + statutes API; no MCP |
| Wolters Kluwer China | Global legal publishing (China) | Partner API | N/A | N/A | Enterprise legal | **LOW** | 80h | Same as global WK |

### H37. AgriTech

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Alibaba Rural Taobao (农村淘宝) | E-commerce for rural China | Via Taobao API | open.taobao.com | OAuth2 | 100M rural users | **MEDIUM** | 40h | Part of Taobao ecosystem |
| JD Farm (京东农场) | Traceable agriculture | Partner API | Via JD Open | OAuth2 | Growing | **LOW** | 50h | Supply chain traceability |
| Pinduoduo Duo Duo Maicai | Community group buying (agri) | Internal | N/A | N/A | 100M+ orders | **LOW** | N/A | No public API |
| Nongxin (农信) | Agricultural finance + services | Internal | N/A | N/A | Rural finance | **LOW** | N/A | No public API |

### H38. Construction / BIM

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
| Glodon / Guanglianda (广联达) | BIM + construction cost | **Public API** | open.glodon.com | OAuth2 | China's Autodesk | **HIGH** | 50–70h | BIM SaaS; cost estimation API; no MCP |
| PKPM | Structural engineering software | Partner API | N/A | N/A | Niche | **LOW** | 80h | Desktop-first; no real API |
| Yilian Cloud BIM (易联云) | BIM collaboration | Internal | N/A | N/A | Startup | **LOW** | N/A | No public API |

---

## 🏆 TOP 25 MCP Priority List

Ranked by: **Market Size × API Maturity × MCP Gap** (no existing MCP = higher priority)

| Rank | Company / Service | Category | Why It's #1 | Est. Hours | Existing MCP? |
|------|------------------|----------|-------------|-----------|---------------|
| 1 | **WeChat Pay** | Payments | 900M users, mature API, zero MCP server, embedded in everything | 40–60h | ❌ None |
| 2 | **Alipay (domestic)** | Payments | 1.3B users, excellent API, AlipayPlus MCP covers intl only | 40–60h | ⚠️ Intl only |
| 3 | **Meituan** | Food/Services | 70% food delivery market, rich API, zero MCP, 700M+ users | 60–80h | ❌ None |
| 4 | **DingTalk** | Collaboration | 700M users, rich API, official MCP missing (only basic bots) | 30–40h | ⚠️ Partial |
| 5 | **Taobao / Tmall** | E-commerce | $850B GMV, mature TOP API, no MCP for AI shopping automation | 60–80h | ❌ None |
| 6 | **Douyin / ByteDance Ocean Engine** | Ads + Commerce | Fastest-growing ad + commerce platform; no MCP | 60–80h | ❌ None |
| 7 | **Nuonuo Fapiao** (Alibaba) | E-Invoice | Mandatory for ALL Chinese businesses; best DX; no MCP | 30–40h | ❌ None |
| 8 | **JD.com (JOS)** | E-commerce | $380B GMV, logistics leader, mature API, no MCP | 60–80h | ❌ None |
| 9 | **Cainiao** | Logistics | Alibaba logistics orchestration; all courier aggregation; no MCP | 40–60h | ❌ None |
| 10 | **Xiaoshouyi / Neocrm** | CRM | #1 enterprise CRM; OAuth2 API; no MCP; Salesforce gap | 40–60h | ❌ None |
| 11 | **Kingdee Cloud** | ERP | 7M clients; complete Open Platform; no MCP | 60–80h | ❌ None |
| 12 | **SF Express** | Courier | Premium logistics API; best DX among couriers; no MCP | 30–40h | ❌ None |
| 13 | **Amap / Gaode Maps** | Maps | 900M MAU; best map API; critical for logistics/transport apps | 30–40h | ❌ None |
| 14 | **Weibo** | Social Media | 580M MAU; mature OAuth2 API; publishing + analytics gap | 30–40h | ❌ None |
| 15 | **Baidu Maps** | Maps | 650M MAU; POI + routing API; no MCP | 30–40h | ❌ None |
| 16 | **Baidu Tongji** | Analytics | Dominant web analytics; reporting API; no MCP | 30–40h | ❌ None |
| 17 | **Tencent Cloud SMS** | SMS | Enterprise SMS gateway; no MCP (Twilio MCP exists, gap clear) | 20–30h | ❌ None |
| 18 | **Yunpian SMS** | SMS | Best DX SMS API; developer-friendly; Twilio equivalent; no MCP | 15–20h | ❌ None |
| 19 | **Tianyancha** | Compliance | 220M users; company registry/credit API; due diligence automation | 30–40h | ❌ None |
| 20 | **Boss Zhipin** | HR | #1 recruiting; 100M+ users; OAuth2 API; no MCP | 40–60h | ❌ None |
| 21 | **Futu / Moomoo** | Fintech | Mature OpenAPI (trading); NASDAQ-listed; no MCP | 30–40h | ❌ None |
| 22 | **Ctrip / Trip.com** | Travel | #1 OTA; 500M users; booking API; no MCP | 50–70h | ❌ None |
| 23 | **Glodon** | Construction/BIM | China's Autodesk; open API; no MCP; B2B high-value | 50–70h | ❌ None |
| 24 | **Moka HR** | HR/ATS | Best API DX in Chinese HR SaaS; growing enterprise base; no MCP | 30–40h | ❌ None |
| 25 | **Sensors Data / GrowingIO** | Analytics | Enterprise product analytics; API mature; no MCP; clear Mixpanel gap | 30–40h | ❌ None |

---

## Existing MCP Servers — Summary

| Service | MCP Server | Stars | Notes |
|---------|-----------|-------|-------|
| Feishu / Lark | larksuite/lark-openapi-mcp ✅ OFFICIAL | 584★ | Full OpenAPI coverage |
| Feishu / Lark | cso1z/Feishu-MCP | 488★ | Community, TypeScript |
| WeChat (personal) | JettChenT/wechat-mcp | ? | Unofficial, uses WeCom protocol |
| WeChat (personal) | BiboyQG/WeChat-MCP | ? | Read/reply WeChat messages |
| WeChat Work | loonghao/wecom-bot-mcp-server | ⭐ | Bot messaging only |
| DingTalk | wllcnm/dingding (via PulseMCP) | Basic | Webhook/messaging only |
| Alibaba Cloud RDS | Official MCP registry | ✅ | Database management |
| AlipayPlus | AlipayPlus MCP | ✅ | International only, not CN domestic |
| Tencent CloudBase | Official MCP registry | ✅ | WeChat Mini Program backend |

---

## Key Architectural Notes for MCP Development in China

1. **Data Localisation**: All MCP servers for Chinese services MUST run on China-mainland infrastructure. Offshore deployment will violate PIPL and likely break API access.
2. **ICP Licence**: Any MCP server exposed as an HTTP endpoint within China requires an ICP filing.
3. **Business Registration**: Most Partner-grade APIs require 营业执照 (business licence). Individual developers cannot access many APIs.
4. **Firewall Impact**: MCP servers calling Chinese APIs from outside China will face intermittent failures. Recommend Hong Kong or Shanghai hosting.
5. **WeChat Ecosystem Fragmentation**: WeChat Official Accounts, Mini Programs, WeChat Pay, and WeChat Work are FOUR separate API systems under one brand — each needs its own MCP server.
6. **Fapiao Priority**: Any business-facing MCP toolkit for China MUST include fapiao (e-invoice) integration. It's legally mandatory for all B2B transactions.

---

*Report compiled: April 2026 | Sources: GitHub, PulseMCP, company developer portals, public API documentation*
