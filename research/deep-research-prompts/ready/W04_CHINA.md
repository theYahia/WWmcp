# Deep Research: MCP Candidates — China

You are a senior technology market analyst. Conduct deep research on companies and services in **China** that are strong candidates for MCP (Model Context Protocol) server implementations.

An MCP server is a standardized integration layer that lets AI assistants (Claude, GPT, etc.) interact with external services via their APIs — read data, trigger actions, automate workflows.

## CONTEXT

China: 1.4B population, 1.08B internet users, #1 Russia trade partner ($240B), BRICS/SCO, own massive tech ecosystem behind the Great Firewall. Chinese APIs are often well-documented but in Chinese only. Many services have NO MCP servers despite massive scale.

## RESEARCH REQUIREMENTS

China has its own parallel tech ecosystem. For each category, find the **Chinese equivalent** of global services and check their API availability.

### A. COMMERCE & MARKETPLACES
1. E-commerce (Taobao/Tmall, JD.com, Pinduoduo/Temu, 1688.com, AliExpress seller API, Xiaohongshu/RED, Douyin Shop, Kuaishou Shop, etc.)
2. Grocery & Food Delivery (Meituan Maicai, Dingdong Maicai, Hema/Freshippo, etc.)
3. Restaurant / Food Ordering (Meituan, Ele.me, etc.)
4. POS / Retail Tech (Hualala, Meituan POS, etc.)

### B. FINANCE & PAYMENTS
5. Banks with APIs (ICBC, CCB, ABC, BOC, Ant Group/MYbank, WeBank, etc.)
6. Payment Gateways (Alipay, WeChat Pay, UnionPay, Ping++, LianLian Pay, etc.)
7. Mobile Wallets (Alipay, WeChat Pay, UnionPay QuickPass, Digital RMB/e-CNY, etc.)
8. Fintech (Ant Group, Lufax, Du Xiaoman, Tiger Brokers, Futu/Moomoo, etc.)
9. Insurance (Zhong An, Waterdrop, etc.)

### C. LOGISTICS & DELIVERY
10. Courier / Last-Mile (SF Express, ZTO, YTO, STO, Yunda, Best Express, Cainiao, JD Logistics, etc.)
11. Postal Services (China Post EMS API)
12. Freight / B2B Logistics (Full Truck Alliance/Manbang, Lalamove, GoGoX, etc.)
13. Warehousing / Fulfillment (Cainiao Fulfillment, JD Fulfillment, etc.)

### D. BUSINESS SOFTWARE & SaaS
14. CRM (Salesforce China, Fenxiang Xiaoke, Xiaoshouyi/Neocrm, etc.)
15. ERP (Kingdee, Yonyou, SAP China, etc.)
16. Accounting / Tax (Kingdee, Yonyou, Baiwang, Golden Tax System, etc.)
17. E-Invoice / Fapiao (Golden Tax System, Baiwang, Hangxin, Nuonuo — fapiao is mandatory!)
18. EDI / Document Management
19. HR / Recruiting (Zhaopin, 51job, Boss Zhipin, Liepin, Moka, etc.)
20. Project Management (Feishu/Lark, DingTalk, WeChat Work, Teambition, etc.)

### E. MARKETING & COMMUNICATIONS
21. SMS / Push (Alibaba Cloud SMS, Tencent Cloud SMS, Yunpian, etc.)
22. Email Marketing (less relevant — WeChat/mini-programs dominate)
23. Advertising (Baidu Ads, ByteDance/Ocean Engine, Tencent Ads, Xiaohongshu Ads, Bilibili Ads, etc.)
24. Social Media / Content (WeChat, Weibo, Douyin/TikTok China, Xiaohongshu, Bilibili, Kuaishou, Zhihu, etc.)
25. Analytics (Baidu Tongji, GrowingIO, Sensors Data, TalkingData, etc.)

### F. INFRASTRUCTURE & CLOUD
26. Cloud (Alibaba Cloud, Tencent Cloud, Huawei Cloud, Baidu Cloud, JD Cloud, etc.)
27. Telecom API / CPaaS (Alibaba Cloud Communication, Rongcloud, Agora, etc.)
28. Maps (Amap/Gaode, Baidu Maps, Tencent Maps, etc.)

### G. GOVERNMENT & COMPLIANCE
29. Government Services (Guo Wu Yuan apps, Alipay mini-programs for gov, WeChat gov services, etc.)
30. Product Marking / Compliance (CCC certification systems, etc.)

### H. INDUSTRY VERTICALS
31. Real Estate (Beike/KE.com, Lianjia, Anjuke, Fang.com, etc.)
32. EdTech (post-crackdown landscape: Zuoyebang, Yuanfudao remnants, adult education pivots, etc.)
33. Healthcare (Ping An Good Doctor, DXY/DingXiangYuan, WeDoctor, JD Health, Ali Health, etc.)
34. Transport (Didi Chuxing, Amap ride-hailing, Caocao, T3, Hello/Hellobike, etc.)
35. Travel (Ctrip/Trip.com, Qunar, Fliggy, Mafengwo, Tongcheng, etc.)
36. Legal Tech (Wolters Kluwer China, local platforms)
37. AgriTech (Pinduoduo Duo Duo Maicai, Nongxin, etc.)
38. Construction / BIM

## OUTPUT FORMAT

```
## China (CN)

### Market Overview
- Population: 1.4B / Internet: 1.08B / Payment: Alipay+WeChat Pay dominant / API lang: Chinese (Mandarin) / Regulatory: Great Firewall, data localization, Golden Tax

### [Category]. [Name]

| Company | What it does | API Status | API Docs URL | Auth Type | Market Size | MCP Priority | Est. Hours | Notes |
|---------|-------------|------------|-------------|-----------|-------------|-------------|------------|-------|
```

## CRITICAL INSTRUCTIONS

1. **WeChat ecosystem is MASSIVE** — Mini Programs, WeChat Pay, WeChat Work, Official Accounts all have separate APIs
2. **Fapiao (invoice) system** is mandatory — Golden Tax / Baiwang / Nuonuo APIs are critical
3. **Feishu/Lark and DingTalk** are the enterprise collaboration platforms — both have rich APIs
4. **Mini Programs** (WeChat, Alipay, Douyin) are a unique Chinese platform — check dev docs
5. **Data localization** — all data must stay in China, affects MCP architecture
6. **API docs are in Chinese** — note language and whether English docs exist
7. Actually visit developer portals (open.weixin.qq.com, open.alipay.com, etc.)
8. Check GitHub for existing MCP servers
9. Include ALL companies even small ones
10. Produce a **TOP 25 priority list** at the end
