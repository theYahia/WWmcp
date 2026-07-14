# HN / Reddit / Twitter — ready-to-paste drafts 2026-05-10

> Card: rd233. Distillation из `hn-reddit-twitter.md` outline + numbers refresh + publish sequence.
> **Trigger:** через 1-2 дня **после** Habr blog post (rd232) publish — НЕ одновременно.
> **Prerequisite:** Habr URL должен быть live (получаешь из rd917 publish ON Tue 12.05).

## Publish sequence (Wed 14.05 → Fri 16.05)

| When | Channel | Why this order |
|------|---------|---------------|
| **Wed 14.05 ~16:00 МСК (=09:00 ET)** | HN Show HN | Best window per HN folklore — Tue/Wed 9-11am ET |
| **Wed 14.05 ~17:00 МСК (~1h after HN)** | Twitter thread | First reactions из HN amplify |
| **Wed 14.05 ~21:00 МСК / 14:00 ET** | Reddit r/ClaudeAI | Evening RU-time = US East working hours |
| **Thu 15.05 ~12:00 МСК** | Reddit r/LocalLLaMA | Sub more active mornings/early afternoons EU |
| **Fri 16.05 (optional)** | Reddit r/mcp (если sub active) | Long-tail amplification |

⚠️ **Critical:** проверить что Habr post гет Habr top-of-day rank ДО HN. Если Habr показал слабую traction — re-evaluate (low-quality signal cascade всё ломает).

## A. HN — Show HN

### Title (max 80 chars)

```
Show HN: WWmcp – 25 MCP servers for non-Western APIs (Russia, MENA, Africa)
```

(76 chars ✅)

### URL

`<HABR-LINK>` (или `<DEVTO-LINK>` если переводил). HN преfersит blog posts > raw repos.

### First comment (paste IMMEDIATELY после submit, как author)

```
Author here. WWmcp is a monorepo of 25 production MCP servers for APIs that aren't on Anthropic's official catalog: Russian payments and CRM (MoySklad, YooKassa, Bitrix24), Turkish SMS (İleti Merkezi), Saudi e-commerce (Salla), Bangladeshi mobile money (bKash), Ethiopian fintech (Chapa), Iranian comms (Kavenegar), and more.

All under @theyahia on npm, built on a shared @theyahia/mcp-core (auth, retries, dual stdio+HTTP transport, structured errors). MIT licensed.

10 GitHub stars / 1 fork at the moment, 25 packages live, ~200 tools across them. Total npm downloads (org-wide) trending up monthly — modest but real adoption signals from Smithery/Glama/MCP catalog scrapers and a few early curious devs.

Happy to answer questions about MCP architecture, monorepo trade-offs, the npm publishing gotchas I hit (NODE_AUTH_TOKEN vs NPM_TOKEN, partial-fail releases, Changesets workflow), or specific APIs. Feedback welcome — particularly if you're in any of these regions and want to flag what's missing.
```

(225 words — within HN comment norms)

### HN watch protocol

- 15 мин после submit → проверь HN /newest — landed?
- 1 час → если ≥10 votes → on track. Если <5 — низкий traction.
- 6-12 часов → reply substantively на questions. **НЕ argue с trolls** (lose karma).

## B. Reddit r/ClaudeAI

### Title

```
25 MCP servers for non-Western APIs (Russia, MENA, Africa, LATAM, SEA) — open source
```

### Body (ready-to-paste)

```
Hi r/ClaudeAI — sharing a project I've been on for the past month: WWmcp, a monorepo of 25 production-grade MCP servers for APIs not on Anthropic's official catalog.

Coverage:
- 🇷🇺 Russia: MoySklad, YooKassa, Bitrix24, CDEK, T-Bank Acquiring, MegaPlan, GetCourse, CloudPayments, Robokassa, 1C, 2GIS, VK Ads, Yandex Metrika, Yandex Direct (14 APIs)
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

Demo (одна prompt → 6 серверов): «Check stock for SKU TS-100 in MoySklad → calculate CDEK shipping to Novosibirsk → generate YooKassa payment link → prepare fiscal receipt via Atol» — Claude Desktop runs all 4 calls in parallel, no glue code.

Repo: https://github.com/theYahia/WWmcp
Blog (full write-up): <HABR-LINK>

Looking for: feedback on missing APIs in any of these regions, contributors (npx @theyahia/create-mcp scaffolds a new server in 30 seconds), use cases.
```

### r/LocalLLaMA variant

Add **above** the coverage list:

```
Note: works with any MCP client (not just Claude — Continue, Cline, Cursor, LibreChat). Self-hostable via stdio or Streamable HTTP. Telemetry is opt-in only — zero outbound traffic without consent.
```

Rest identical.

### r/mcp (if active sub)

Direct link + 1 paragraph, skip explanation (audience knows MCP):

```
Posted 25 production MCP servers under @theyahia/* — Russia (14), Turkey, Saudi, Bangladesh, Ethiopia, Iran, Brazil, Pakistan, Uzbekistan, Egypt, Africa-wide. Shared @theyahia/mcp-core. MIT.

Repo: https://github.com/theYahia/WWmcp
Blog: <HABR-LINK>
npm org: https://www.npmjs.com/org/theyahia

PR welcome для country-coverage gaps.
```

## C. Twitter / X thread (6 tweets)

### Tweet 1 (hook) — 280 chars

```
Anthropic shipped MCP — стандарт подключения LLM к API.

Но в их официальном каталоге — преимущественно US/global SaaS.

За месяц собрал 25 MCP-серверов для не-западных API.

🇷🇺🇹🇷🇸🇦🇧🇩🇪🇹🇮🇷🇧🇷 — open source, MIT, на npm под @theyahia

🧵
```

(~270 chars)

### Tweet 2 — Demo

```
Демо: один prompt → 6 MCP-серверов для end-to-end e-commerce

→ checkstock в МойСклад
→ рассчитать СДЭК доставку
→ сгенерить ссылку на оплату ЮKassa
→ подготовить фискальный чек через Атол

Всё через @AnthropicAI Claude Desktop. Без backend кода.

[GIF/Loom 30 сек]
```

### Tweet 3 — Coverage

```
Что в v3.0:

🇷🇺 14 RU APIs (платежи, CRM, логистика, маркетинг, фискалка)
🇹🇷 İleti Merkezi (SMS)
🇸🇦 Salla
🇧🇩 bKash
🇪🇹 Chapa
🇮🇷 Kavenegar
🇧🇷 MercadoPago
🇵🇰 JazzCash, Easypaisa
+ ещё

15+ стран. 200+ tools.
```

### Tweet 4 — Architecture

```
Architecture:

📦 Turborepo + pnpm workspace
🔧 Shared @theyahia/mcp-core: auth, retries, dual transport (stdio + HTTP), structured errors
🚀 Changesets release pipeline → npm
✅ vitest per server, CI matrix Node 20/22
🔐 Privacy-first opt-in телеметрия

Production-grade, не Hello-World gallery.
```

### Tweet 5 — Contribute

```
Добавить API своей страны за 30 секунд:

$ npx @theyahia/create-mcp <name> \
    --region=<...> --category=<...> \
    --base-url=<url>

Scaffolds working MCP server.

Implement tools, run tests, open PR.

5+ «good first issue» tagged.
```

### Tweet 6 — Links

```
🔗 GitHub: github.com/theYahia/WWmcp
📝 Habr blog: <HABR-LINK>
📦 npm org: npmjs.com/org/theyahia
💬 Discussions для use cases & feedback

Если строишь AI-агентов **в** или **для** emerging markets — это для тебя.

⭐ если зашло.
```

### Tags / mentions to include

- `@AnthropicAI`
- `#MCP` `#ModelContextProtocol`
- Region: `#RussianTech` `#MENATech` `#AfricaTech` `#LATAMTech`

## Pre-publish sanity check

- [ ] Habr post URL получен (после rd917 publish 12.05 09:00)
- [ ] WWmcp repo metadata corrected: README hero shows 25 servers / 200+ tools / 15+ countries / 10 stars
- [ ] GIF/Loom created (rd231 на board, ~30-40 мин — `WWmcp GIF demo для README`)
- [ ] HN account active (если new = 30 days waiting period для Show HN)
- [ ] Reddit account ≥karma 100 для r/ClaudeAI (sub mods filter low-karma)
- [ ] Twitter ≥10 followers + active feed (сначала post 3-5 build-in-public update'а перед thread, иначе reads as spam-account)

## After publishing — README update

```markdown
**Featured on:**
[Habr](habr-link) · [Hacker News](hn-link) · [Reddit r/ClaudeAI](reddit-link)
```

Это self-reinforcing trust signal для новых visitors.

## Что НЕ делаем

- ❌ Posting на ВСЕ каналы одновременно — это spam pattern, mods banять
- ❌ Posting BEFORE Habr article live — нет destination link, conversion = 0
- ❌ Cross-link Reddit-HN в comments — обе платформы видят это как vote-manipulation
- ❌ Posting в weekend (Sat/Sun) — low engagement windows для tech audiences

## Cross-references

- **rd232** Habr blog post draft (Marathon-1) — prerequisite, должен publish первым
- **rd231** GIF demo для README (board) — embed в Twitter Tweet 2
- **rd234** Awesome-MCP PRs — параллельная distribution, после HN/Reddit shipped
- **rd235** Glama submission — passive distribution, не conflict with HN/Reddit timing
