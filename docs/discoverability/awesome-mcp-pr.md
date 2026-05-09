# Awesome-MCP PR submissions

Three lists worth submitting to. Each accepts PRs adding entries to a categorized README.

## 1. punkpeye/awesome-mcp-servers (highest traffic)

**URL:** https://github.com/punkpeye/awesome-mcp-servers

Fork → edit README → PR. The list is organized by category. Add WWmcp under multiple categories (e-commerce, payments, finance, marketing) since it spans many.

### Suggested PR title
```
Add WWmcp — 25 production MCP servers for non-Western APIs (CIS, MENA, Africa, LATAM, SEA)
```

### Suggested entry (under "Community Servers" or each relevant category)
```markdown
- [theYahia/WWmcp](https://github.com/theYahia/WWmcp) - 🌍 Production-grade MCP servers for non-Western APIs across 15+ countries — Russian payments (YooKassa, CloudPayments, T-Bank), CRM (Bitrix24, Megaplan), Turkish SMS (İleti Merkezi), MENA e-commerce (Salla), African mobile money (Orange Money, bKash, Chapa), LATAM fintech (MercadoPago), and more. One npm scope (`@theyahia`), shared core, dual transport.
```

### PR body
```markdown
## What this adds

WWmcp is the largest open-source collection of MCP servers for non-Western APIs:

- 25 production servers published to npm (`@theyahia/*-mcp`)
- 15+ countries: Russia, CIS, Turkey, Gulf, MENA, Africa, LATAM, Southeast Asia
- Shared core (`@theyahia/mcp-core`): auth, retries, dual transport (stdio + Streamable HTTP)
- Production-grade per server: 8+ tools, vitest, Conventional Commits, changesets release pipeline
- License: MIT

## Why it fits awesome-mcp-servers

The official Anthropic catalog and most existing community servers wrap US/global SaaS. WWmcp fills a real gap for users in or working with emerging markets.

## Demo

[GIF placeholder — 30s flow: "check stock in MoySklad → calculate CDEK shipping → generate YooKassa payment link"]

## Maintainer
@theYahia
```

## 2. modelcontextprotocol/servers

**URL:** https://github.com/modelcontextprotocol/servers

The official Anthropic-curated list has a community section. PR adding WWmcp under "Community Servers" → "Other".

Same entry as above; keep it under 200 chars per their convention.

## 3. appcypher/awesome-mcp-servers

**URL:** https://github.com/appcypher/awesome-mcp-servers

Same entry as punkpeye; this list is shorter and friendlier to broad multi-server collections.

## After PRs are merged

Add a "Featured in" section to the WWmcp README with badges/links to each list. This becomes a 2-way trust signal for new visitors.
