# dev.to post draft (EN)

**Tags:** `mcp`, `ai`, `typescript`, `opensource`

**Length:** 6-8 min read, ~1500-2000 words.

**Hook:** Anthropic shipped MCP — a standard for connecting LLMs to APIs. But the official catalog ships mostly US/global SaaS. I built 25 MCP servers for non-Western APIs in a month and open-sourced the monorepo.

---

## Title (pick one)

1. **Building 25 MCP servers for non-Western APIs: lessons from `@theyahia` monorepo**
2. **MCP outside Silicon Valley: shipping production servers for Russia, MENA, Africa, LATAM, and SEA**
3. **Why I built "Composio for the rest of the world" — and what shipping 25 MCP servers in 30 days taught me**

---

## Outline

### 1. The gap (200 words)

- MCP catalog: GitHub, Slack, Stripe, Notion, Linear — all great, all US/global
- What's missing: Russia (MoySklad, CDEK, YooKassa, Bitrix24), Turkey (İleti Merkezi), Saudi (Salla), Bangladesh (bKash), Ethiopia (Chapa), Pakistan (JazzCash, Easypaisa), Brazil (MercadoPago), Iran (Kavenegar)
- Real-world impact: an e-commerce shop in any of these regions can't ship a fully-AI-driven order flow with the official catalog

### 2. WWmcp in numbers (150 words)

- 25 production servers on npm under `@theyahia/*-mcp`
- 200+ tools across e-commerce, payments, CRM, logistics, comms, AI, finance
- 15+ countries
- Shared core: `@theyahia/mcp-core` (auth, retries, errors, dual transport)
- Turborepo + pnpm + Changesets
- License: MIT

### 3. Demo: end-to-end e-commerce flow (300 words)

```
Prompt: "Check stock for SKU TS-100 in MoySklad, calculate CDEK shipping
        to Novosibirsk, generate a YooKassa payment link, and prepare
        an Atol fiscal receipt for Russian compliance (54-FZ)"
```

What the AI does:
1. `moysklad_get_product_stock(sku="TS-100")` → 47 units in warehouse
2. `cdek_calculate_tariff(from="...", to="Novosibirsk", weight=1.2)` → 850 RUB / 3-5 days
3. `yookassa_create_payment(amount=...)` → returns payment URL
4. `atol_create_receipt(items=..., taxation="usn_income")` → fiscal receipt ID

→ GIF/video here (30s).

### 4. Architecture decisions (400 words)

**Why a monorepo, not 25 separate repos?**

- Shared core means changes propagate to all servers' CI immediately — that's a feature, catches breakages early
- Turborepo handles incremental build; pnpm workspace handles `workspace:*` deps
- Changesets enforce per-PR changelog entries; releases are atomic across packages

**Why dual transport (stdio + Streamable HTTP)?**

- stdio for desktop clients (Claude Desktop, Cursor)
- HTTP for hosted deployments, OpenAPI gateways, custom orchestration

**Why a shared core, not copy-paste?**

- Auth strategies (API key, Bearer, OAuth2 with refresh, HMAC) tested once, reused 25 times
- Structured errors map upstream API errors to MCP `isError: true` responses uniformly
- Logging, retries with backoff, response formatting — same code path everywhere

### 5. Three gotchas that cost me hours (400 words)

**Gotcha 1: `setup-node@v4` + npm publish**

`actions/setup-node@v4` with `registry-url` writes an `.npmrc` that reads `${NODE_AUTH_TOKEN}`. Changesets/action reads `${NPM_TOKEN}`. If only `NPM_TOKEN` is set, npm returns **E404 "package not found"** — not E401/E403 — because it can't authenticate to even check. Fix: set both env vars to the same secret.

**Gotcha 2: Changesets publishes everything in the workspace**

Including `_template/`. Add `"private": true` to scaffold packages or they'll get accidentally published as `@scope/CHANGEME-mcp@1.0.0`. (Yes, I shipped this. It's still on npm.)

**Gotcha 3: Partial-fail releases drift state**

When `changeset publish` succeeds for 23 packages and fails on the 24th, the next run retries the already-published 23 and gets E403. Changesets doesn't track per-package publish state across runs. Either keep changesets very small (one package per release PR) or accept that re-runs after partial fails need manual intervention.

### 6. How to add your API (200 words)

```bash
npx @theyahia/create-mcp <name> --region=<region> --category=<type> --base-url=<url>
```

This scaffolds `servers/<name>/` with placeholders filled. 30 seconds from clone to a working stub.

The production-grade bar is real but not high:
- 8+ tools (most APIs trivially clear this)
- Use `@theyahia/mcp-core` for HTTP/auth/errors
- Vitest tests with mocked HTTP (no live API in CI)
- README with tool list + 2-3 demo prompts
- One `changeset` per PR

### 7. Call to action (150 words)

⭐ Star the repo: https://github.com/theYahia/WWmcp
🌍 MIT licensed — use freely
🤝 PRs welcome — especially for countries / verticals not yet covered:
   - Deeper Iran, Pakistan, Bangladesh
   - More CIS (Uzbekistan, Belarus, Armenia, Kyrgyzstan, Georgia)
   - SEA beyond Indonesia / Vietnam / Philippines
   - Sub-Saharan Africa beyond Nigeria / Kenya / SA / Algeria

If you're a developer in any of these regions, your country's APIs would benefit massively from MCP coverage. The CLI gets you scaffolded in 30 seconds, the core handles 80% of the boilerplate, and good first issues are tagged.

---

## Notes on style

- dev.to readers want code samples and concrete numbers. Show actual diff snippets, actual error messages, actual bash commands.
- Don't make it political. "Filling a gap" frames better than "Anthropic ignores X".
- One GIF demo > a thousand words.
- End with a clear "what to do next" for two reader personas: (1) wants to use the servers (link to Quick Start), (2) wants to contribute (link to good-first-issue + create-mcp).

## After publishing

- Add a "Featured on dev.to" badge to README
- Cross-post a 280-char teaser to Twitter/X with the GIF
- Submit to https://news.ycombinator.com/submit as "Show HN: WWmcp — 25 MCP servers for non-Western APIs"
