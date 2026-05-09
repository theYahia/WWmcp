# Short-form: Hacker News / Reddit / Twitter

## Hacker News — Show HN

**URL:** https://news.ycombinator.com/submit

**Best window:** Tuesday or Wednesday 9-11am ET (US business hours, fewer giant launches competing). Avoid Mondays and Fridays.

### Title (max 80 chars)
```
Show HN: WWmcp – 25 MCP servers for non-Western APIs (Russia, MENA, Africa)
```

### URL
Link to the blog post (dev.to or Habr). HN slightly prefers blog posts over GitHub repos for "Show HN" — they convert better than raw repos because they tell a story.

### First comment (post immediately as the author)
```
Author here. WWmcp is a monorepo of 25 production MCP servers for APIs that aren't on Anthropic's official catalog: Russian payments and CRM (MoySklad, YooKassa, Bitrix24), Turkish SMS (İleti Merkezi), Saudi e-commerce (Salla), Bangladeshi mobile money (bKash), Ethiopian fintech (Chapa), Iranian comms (Kavenegar), and more.

All under @theyahia on npm, built on a shared @theyahia/mcp-core (auth, retries, dual stdio+HTTP transport, structured errors). MIT licensed.

Happy to answer questions about MCP architecture, monorepo trade-offs, the npm publishing gotchas I hit, or the specific APIs. Feedback welcome — particularly if you're in any of these regions and want to flag what's missing.
```

## Reddit

### r/ClaudeAI

**Title:** `25 MCP servers for non-Western APIs (Russia, MENA, Africa, LATAM, SEA) — open source`

**Body:**
```
Hi r/ClaudeAI — sharing a project I've been on for the past month: WWmcp, a monorepo of 25 production-grade MCP servers for APIs not on Anthropic's official catalog.

Coverage:
- 🇷🇺 Russia: MoySklad, YooKassa, Bitrix24, CDEK, Wildberries, VK Ads, Yandex Search, T-Bank Acquiring, MegaPlan, GetCourse, CloudPayments, Robokassa, 1C, 2GIS
- 🇹🇷 Turkey: İleti Merkezi (SMS)
- 🇸🇦 Saudi: Salla (e-commerce)
- 🇧🇩 Bangladesh: bKash
- 🇪🇹 Ethiopia: Chapa
- 🇪🇬 Egypt: Fawaterak
- 🇵🇰 Pakistan: JazzCash, Easypaisa
- 🇧🇷 Brazil: MercadoPago
- 🇮🇷 Iran: Kavenegar, Neshan Maps
- 🇺🇿 Uzbekistan: CBU, Payme
- 🌍 Africa wide: Orange Money

All on npm under @theyahia, MIT, shared core, vitest, dual transport (stdio + Streamable HTTP).

Demo: [GIF] — checking stock in MoySklad → calculating CDEK shipping → generating YooKassa payment link → preparing fiscal receipt via Atol, all from one prompt.

Repo: https://github.com/theYahia/WWmcp
Blog (full write-up): [link]

Looking for: feedback on missing APIs in any of these regions, contributors (npx @theyahia/create-mcp scaffolds a new server in 30 sec), use cases.
```

### r/LocalLLaMA

Similar but emphasize:
- Works with any MCP client (not just Claude — Continue, Cline, Cursor)
- Self-hostable via stdio or Streamable HTTP
- Privacy: telemetry is opt-in only

### r/mcp (if active)

Direct link + 1-paragraph description. r/mcp readers already know what MCP is — skip the explanation.

## Twitter / X

### Thread (6-8 tweets)

**Tweet 1 (hook):**
```
Anthropic shipped MCP — a standard for connecting LLMs to APIs.

But the official catalog ships mostly US/global SaaS.

So I built 25 MCP servers for non-Western APIs in a month.

🇷🇺🇹🇷🇸🇦🇧🇩🇪🇹🇮🇷🇧🇷 — open source, MIT, on npm under @theyahia.

🧵
```

**Tweet 2 (demo GIF):**
```
Demo: one prompt drives 6 MCP servers across an end-to-end e-commerce flow

→ check stock (MoySklad)
→ calc shipping (CDEK)
→ generate payment link (YooKassa)
→ prepare fiscal receipt (Atol)

All via @AnthropicAI Claude. No backend code.

[GIF]
```

**Tweet 3 (coverage):**
```
What's in v3.0:

🇷🇺 14 Russian APIs (payments, CRM, logistics, marketing, fiscal)
🇹🇷 İleti Merkezi (SMS)
🇸🇦 Salla (e-commerce)
🇧🇩 bKash
🇪🇹 Chapa
🇮🇷 Kavenegar, Neshan Maps
🇧🇷 MercadoPago
🇵🇰 JazzCash, Easypaisa
+ more

15+ countries. 200+ tools.
```

**Tweet 4 (architecture):**
```
Architecture:

📦 Turborepo + pnpm workspace
🔧 Shared @theyahia/mcp-core: auth, retries, dual transport (stdio + HTTP)
🚀 Changesets release pipeline → npm
✅ vitest per server, full CI
🔐 Privacy-first opt-in telemetry

Production-grade, not Hello-World gallery.
```

**Tweet 5 (contribute):**
```
Add your country's API in 30 seconds:

$ npx @theyahia/create-mcp <name> \
    --region=<...> --category=<...> \
    --base-url=<url>

Scaffolds a working MCP server.

Implement tools, run tests, open PR.

5+ "good first issue" tagged.
```

**Tweet 6 (links):**
```
🔗 GitHub: github.com/theYahia/WWmcp
📝 Full blog: [link]
📦 npm: npmjs.com/org/theyahia
💬 Discussions for use cases & feedback

If you're building AI agents in or for emerging markets — this is for you.

⭐ if useful.
```

### Tags / mentions
- `@AnthropicAI`
- `#MCP` `#ModelContextProtocol`
- Region tags as relevant: `#RussianTech`, `#MENATech`, `#AfricaTech`, `#LATAMTech`

## Cross-promotion

After each channel publishes, add to README:

```markdown
**Featured on:**
[Habr](link) · [dev.to](link) · [Hacker News](link) · [Reddit r/ClaudeAI](link)
```

This becomes a self-reinforcing trust signal for new visitors.
