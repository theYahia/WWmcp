# Awesome-MCP PR drafts — 3 lists 2026-05-10

> Card: rd234. Distillation от `awesome-mcp-pr.md` outline + concrete fork+commit+push instructions для каждого PR.
> **Trigger:** через 3-5 дней после Habr blog post (rd232 publish 12.05) и HN/Reddit (rd233 14-15.05). I.e. earliest **Mon 19.05**.
> **Why this order:** awesome-* lists ценят live traction. Если HN front page hit или Habr trending — PR get auto-credibility.

## TL;DR

3 PRs ~30 min each = ~90 min total. Same content (one entry block), 3 forks, 3 PRs.

⚠️ **Все 3 fork+push требуют user action** — ваш `gh auth` или browser GitHub UI. Я подготовлю **content + steps**.

## PR 1 — punkpeye/awesome-mcp-servers (highest traffic)

**Repo:** https://github.com/punkpeye/awesome-mcp-servers
**Recent activity:** active maintainer, weekly PR merges. ⭐ ~2k stars (one of top awesome lists).
**Conventions:** alphabetical sort within category, single-line entry с emoji + dash separator.

### Fork + push steps

```bash
# 1. Fork в browser:
#    https://github.com/punkpeye/awesome-mcp-servers → Fork button → твой namespace
# 2. Clone fork:
git clone https://github.com/<your-username>/awesome-mcp-servers
cd awesome-mcp-servers
# 3. Create branch
git checkout -b add-wwmcp
# 4. Edit README.md (см. раздел "Entry block" ниже)
# 5. Commit + push
git add README.md
git commit -m "feat: add WWmcp — 25 MCP servers for non-Western APIs"
git push -u origin add-wwmcp
# 6. Create PR через gh:
gh pr create --repo punkpeye/awesome-mcp-servers \
  --title "Add WWmcp — 25 production MCP servers for non-Western APIs (CIS, MENA, Africa, LATAM, SEA)" \
  --body-file ../WWmcps/WWmcp/docs/discoverability/AWESOME_MCP_PR_BODY_punkpeye.md
```

(Альтернатива через GitHub UI — Compare & pull request button после push.)

### PR title

```
Add WWmcp — 25 production MCP servers for non-Western APIs (CIS, MENA, Africa, LATAM, SEA)
```

### Where to insert entry

Сlone'ни README.md, проверь section names. На 2026-05-10 структура такая (per последнего commit на main):

- ✅ Add под секцию `## Community Servers` (если subdivided — под `### Other` или `### Cross-platform`)
- Possibly add under `### E-commerce`, `### Payments`, `### Finance`, `### Marketing` если sub-sections существуют (скорее всего — да)

Pick **one** primary placement (Community Servers / Other) + кросс-link в category-specific подсекциях если они есть.

### Entry block (single line, alphabetical sort by repo name)

```markdown
- [theYahia/WWmcp](https://github.com/theYahia/WWmcp) - 🌍 25 production MCP servers for non-Western APIs across 15+ countries — Russian payments (YooKassa, T-Bank, CloudPayments), CRM (Bitrix24, MoySklad, Megaplan), Turkish SMS (İleti Merkezi), MENA e-commerce (Salla), African mobile money (bKash, Chapa, Orange Money), LATAM fintech (MercadoPago), and more. Shared core, dual transport, MIT.
```

### PR body (paste в `gh pr create --body-file` или в GitHub UI)

```markdown
## What this adds

WWmcp — open-source monorepo of 25 production MCP servers covering APIs not on Anthropic's official catalog:

- **Coverage:** 15+ countries — Russia (14 servers), Turkey, Saudi Arabia, Bangladesh, Ethiopia, Egypt, Pakistan, Brazil, Iran, Uzbekistan, Africa-wide
- **Architecture:** Shared `@theyahia/mcp-core` (auth, retries, dual transport stdio + Streamable HTTP, structured errors, opt-in телеметрия)
- **Quality:** 8+ tools per server, vitest coverage, Conventional Commits, Changesets release pipeline, MIT licensed
- **Distribution:** All published to npm under `@theyahia/*` scope

## Why it fits awesome-mcp-servers

Official Anthropic catalog ships mostly US/global SaaS. WWmcp closes the gap for users building AI agents **in** or **for** emerging markets — these APIs (МойСклад, ЮKassa, bKash, Chapa, etc.) currently have zero MCP coverage anywhere else.

## Demo

One prompt, six MCP servers: «check stock for SKU TS-100 in MoySklad → calculate CDEK shipping to Novosibirsk → generate YooKassa payment link → prepare fiscal receipt via Atol» — Claude Desktop runs all 4 calls in parallel, no glue code.

[GIF demo — TBA pending rd231]

## Stats (2026-05)

- 25 packages live на npm
- 200+ tools across servers
- 10 GitHub stars / 1 fork
- ~750 npm downloads/month sustained (org-wide)

## Maintainer

@theYahia (Tim) — ship'аю активно, PR welcome для country-coverage gaps.

## License

MIT.
```

## PR 2 — modelcontextprotocol/servers (official curated)

**Repo:** https://github.com/modelcontextprotocol/servers
**Recent activity:** Anthropic-maintained. PRs review slow (~weeks), strict quality bar, but listing here = highest trust signal.
**Conventions:** README has «Community Servers» section subdivided by category. Entry must be single line ≤200 chars. No emoji в standard format (per их existing entries).

### Fork + push steps (same pattern as PR 1)

```bash
# 1. Fork: github.com/modelcontextprotocol/servers
# 2. Clone, branch, edit README, commit, push:
git clone https://github.com/<your-username>/servers
cd servers
git checkout -b add-wwmcp
# Edit README.md — see Entry below
git add README.md
git commit -m "Add WWmcp to Community Servers (non-Western APIs)"
git push -u origin add-wwmcp
gh pr create --repo modelcontextprotocol/servers \
  --title "Add WWmcp to Community Servers — 25 MCP servers for non-Western APIs" \
  --body-file ../WWmcps/WWmcp/docs/discoverability/AWESOME_MCP_PR_BODY_official.md
```

### Entry block (≤200 chars, no emoji, alphabetical)

```markdown
- **[theYahia/WWmcp](https://github.com/theYahia/WWmcp)** - 25 production MCP servers for non-Western APIs across 15+ countries (Russia, MENA, Africa, LATAM, SEA). Shared core, dual transport.
```

(193 chars ✅)

### PR body

```markdown
## What this adds

Adds WWmcp to the Community Servers section. WWmcp is a monorepo of 25 production-grade MCP servers covering APIs not represented in the existing catalog:

- 15+ countries (Russia, Turkey, Bangladesh, Ethiopia, Saudi Arabia, Iran, Brazil, Pakistan, Uzbekistan, Egypt, Africa-wide)
- 200+ tools across servers, all MIT licensed
- Architecture: shared `@theyahia/mcp-core` (auth, retries, dual transport stdio + Streamable HTTP, structured errors)
- Production-grade per server: ≥8 tools, vitest, Changesets release pipeline

## Why fits MCP servers list

The current list covers US/global SaaS comprehensively. WWmcp adds non-Western coverage — Russian payments and CRM, MENA e-commerce, African mobile money, LATAM fintech, etc. — which currently have zero MCP wrappers anywhere.

## Repo
https://github.com/theYahia/WWmcp

## Maintainer
@theYahia
```

## PR 3 — appcypher/awesome-mcp-servers (broader-scope alternative)

**Repo:** https://github.com/appcypher/awesome-mcp-servers
**Recent activity:** less active maintainer, but list shorter и friendlier к broad multi-server collections.
**Conventions:** более liberal с описаниями, allows emoji.

### Fork + push steps (same pattern)

```bash
git clone https://github.com/<your-username>/awesome-mcp-servers
cd awesome-mcp-servers
git checkout -b add-wwmcp
# Edit README.md
git add README.md
git commit -m "feat: add WWmcp — 25 MCP servers for non-Western APIs"
git push -u origin add-wwmcp
gh pr create --repo appcypher/awesome-mcp-servers \
  --title "Add WWmcp — 25 MCP servers for non-Western APIs" \
  --body-file ../WWmcps/WWmcp/docs/discoverability/AWESOME_MCP_PR_BODY_appcypher.md
```

### Entry (same as punkpeye, copy-paste)

Use the same entry block from PR 1.

### PR body (same as punkpeye, copy-paste)

Same body.

## Bonus options (defer if first 3 successful)

- **wong2/awesome-mcp-servers** — third major awesome list. Smaller traction. Same template applies.
- **github.com/topics/model-context-protocol** — add WWmcp tags `model-context-protocol`, `mcp-server` через repo settings (no PR needed, just `gh repo edit` или GitHub UI).
- **Smithery, Glama, MCP.so** — separate marketplaces, distinct workflow per `GLAMA_SUBMISSION_PACKAGE.md` (rd235).

## Pre-PR sanity check

- [ ] WWmcp README.md hero is up-to-date (25 серверов, 200+ tools, 15+ countries — reflected in description)
- [ ] Все 25 packages installable from npm registry (verify через `npm view @theyahia/<name>-mcp version`)
- [ ] `LICENSE` file = MIT
- [ ] CONTRIBUTING.md exists (most awesome-* lists check)
- [ ] Active commit activity past 30 days (signal of maintenance — у тебя точно да)

## After PR merged — README update

Add «Featured in» section к WWmcp README:

```markdown
**Featured in:**
- [punkpeye/awesome-mcp-servers](link)
- [modelcontextprotocol/servers](link)
- [appcypher/awesome-mcp-servers](link)
```

Self-reinforcing trust signal для новых visitors.

## Что НЕ делаем

- ❌ Submit к 5+ lists в один день — это spam pattern, mods wonder
- ❌ Submit к Anthropic official PR пока WWmcp <50 stars / <500 downloads/wk — bar высокий, могут reject «недостаточно traction»
- ❌ Spamming в PR body «please merge» / «follow back» — comment etiquette
- ❌ Push без forking (нельзя — это owner's repo)

## Cross-references

- **rd231** GIF demo — embed link в PR body (placeholder сейчас)
- **rd232** Habr blog post — link в PR body после publish (additional credibility)
- **rd233** HN/Reddit/Twitter — после awesome-mcp PRs merge → trackback в WWmcp README → cycle
- **rd235** Glama submission — параллельная distribution через marketplace, не conflict
