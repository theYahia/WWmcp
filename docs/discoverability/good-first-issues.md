# `gh issue create` commands — good-first-issue starter pack

Run these from the WWmcp repo root after `gh auth login`. Each opens a starter issue with the `new-server` and `good first issue` labels.

The picks below are **simple public APIs** with clear docs, simple auth (API key, no OAuth dance), and are realistic for a contributor to ship in a weekend.

> Before running: ensure the labels exist:
> ```bash
> gh label create "good first issue" --color "7057ff" --description "Good for newcomers" 2>/dev/null
> gh label create "new-server" --color "0e8a16" --description "Request for a new MCP server" 2>/dev/null
> gh label create "help wanted" --color "008672" --description "Extra attention is needed" 2>/dev/null
> ```

---

## 1. National Bank of Belarus (NBRB) — currency rates

```bash
gh issue create \
  --title "[New Server] Add @theyahia/nbrb-mcp — National Bank of Belarus exchange rates" \
  --label "new-server,good first issue,help wanted" \
  --body 'Public API, no auth, well-documented JSON. Mirrors what cbr-mcp does for Russia.

**API:** https://api.nbrb.by/exrates/rates
**Docs:** https://www.nbrb.by/apihelp/exrates
**Auth:** none (public)
**Region:** cis
**Category:** finance

**Suggested tools (8+):**
- `nbrb_get_rates(date?)` — daily exchange rates
- `nbrb_get_rate_by_currency(code, date?)` — single currency
- `nbrb_get_rate_dynamics(currency_id, start, end)` — historical
- `nbrb_list_currencies(periodicity?)` — currency catalog
- `nbrb_get_currency(currency_id)` — single currency metadata
- `nbrb_get_refinancing_rate(date?)` — central bank refi rate
- `nbrb_get_refinancing_history(start, end)` — historical refi
- `nbrb_get_metals_prices(date?)` — precious metals fixings

**Scaffold:**
\`\`\`bash
npx @theyahia/create-mcp nbrb --region=cis --category=finance --base-url=https://api.nbrb.by
\`\`\`

Reference: copy patterns from [`servers/cbr/`](../servers/cbr/) — same shape (no auth, JSON-only, single currency authority).'
```

## 2. National Bank of Kazakhstan — currency rates

```bash
gh issue create \
  --title "[New Server] Add @theyahia/nbk-kz-mcp — National Bank of Kazakhstan rates" \
  --label "new-server,good first issue,help wanted" \
  --body 'Public XML API. Similar shape to cbr-mcp / nbrb-mcp.

**API:** https://www.nationalbank.kz/rss/rates_all.xml
**Docs:** https://nationalbank.kz/?docid=363&switch=russian
**Auth:** none
**Region:** cis
**Category:** finance

**Suggested tools (8+):** daily rates, single currency, historical, current refi rate, gold reserves, monetary base.

\`\`\`bash
npx @theyahia/create-mcp nbk-kz --region=cis --category=finance --base-url=https://www.nationalbank.kz
\`\`\`

Reference: [`servers/cbr/`](../servers/cbr/), [`servers/cbu/`](../servers/cbu/).'
```

## 3. Central Bank of Armenia

```bash
gh issue create \
  --title "[New Server] Add @theyahia/cba-am-mcp — Central Bank of Armenia rates" \
  --label "new-server,good first issue,help wanted" \
  --body 'Public REST API.

**Docs:** https://www.cba.am/EN/Pages/main.aspx (look for "Statistical data" → "Exchange rates")
**Auth:** none
**Region:** cis
**Category:** finance

\`\`\`bash
npx @theyahia/create-mcp cba-am --region=cis --category=finance --base-url=https://api.cba.am
\`\`\`'
```

## 4. National Bank of Kyrgyzstan

```bash
gh issue create \
  --title "[New Server] Add @theyahia/nbkr-mcp — National Bank of Kyrgyz Republic rates" \
  --label "new-server,good first issue,help wanted" \
  --body 'Public API for KGS rates.

**Docs:** https://www.nbkr.kg/index1.jsp?item=137&lang=ENG
**Auth:** none
**Region:** cis
**Category:** finance

\`\`\`bash
npx @theyahia/create-mcp nbkr --region=cis --category=finance --base-url=https://www.nbkr.kg
\`\`\`'
```

## 5. World Bank Open Data

```bash
gh issue create \
  --title "[New Server] Add @theyahia/worldbank-mcp — World Bank Open Data" \
  --label "new-server,good first issue,help wanted" \
  --body 'Free, no-auth, well-documented REST + JSON. Useful for AI agents doing economic analysis or country comparisons.

**API:** https://api.worldbank.org/v2/
**Docs:** https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-getting-started
**Auth:** none
**Region:** global
**Category:** data

**Suggested tools (8+):**
- `worldbank_list_indicators(topic?, source?)` — catalog of indicators
- `worldbank_get_indicator(code)` — indicator metadata
- `worldbank_get_indicator_data(country, indicator, date_range?)` — time series
- `worldbank_list_countries(region?, income?)` — country catalog
- `worldbank_get_country(code)` — country metadata
- `worldbank_list_topics()` — topic catalog
- `worldbank_list_sources()` — data source catalog
- `worldbank_search(query, type?)` — full-text search

\`\`\`bash
npx @theyahia/create-mcp worldbank --region=global --category=data --base-url=https://api.worldbank.org/v2
\`\`\`'
```

## 6. KazPost tracking

```bash
gh issue create \
  --title "[New Server] Add @theyahia/kazpost-mcp — KazPost shipment tracking" \
  --label "new-server,good first issue,help wanted" \
  --body 'KazPost public tracking API.

**Docs:** https://post.kz/services/tracking-api (or scrape from track.kazpost.kz public endpoint)
**Auth:** API key (free tier available)
**Region:** cis
**Category:** logistics

**Suggested tools (8+):** track shipment, batch track, get history, calculate tariff, list services, find office by city, validate address.

\`\`\`bash
npx @theyahia/create-mcp kazpost --region=cis --category=logistics --base-url=https://track.kazpost.kz
\`\`\`

Reference: [`servers/cdek/`](../servers/cdek/).'
```

## 7. Belposhta tracking (Belarus Post)

```bash
gh issue create \
  --title "[New Server] Add @theyahia/belposhta-mcp — Belposhta tracking" \
  --label "new-server,good first issue,help wanted" \
  --body 'Belarus national post.

**Docs:** https://www.belpost.by/Predpriyatie/api
**Auth:** API key
**Region:** cis
**Category:** logistics

\`\`\`bash
npx @theyahia/create-mcp belposhta --region=cis --category=logistics --base-url=https://api.belpost.by
\`\`\`'
```

## 8. ExchangeRate.host — free FX API

```bash
gh issue create \
  --title "[New Server] Add @theyahia/exchangerate-mcp — exchangerate.host FX API" \
  --label "new-server,good first issue,help wanted" \
  --body 'Free FX rates aggregator (190+ currencies, crypto, historical). No auth needed. Good complement to national-bank servers when you want a single multi-currency source.

**API:** https://exchangerate.host/
**Auth:** none (free) or API key (higher limits)
**Region:** global
**Category:** finance

**Suggested tools (8+):** latest rates, convert, historical, time series, fluctuation, supported currencies, supported sources, EU central bank rates.

\`\`\`bash
npx @theyahia/create-mcp exchangerate --region=global --category=finance --base-url=https://api.exchangerate.host
\`\`\`'
```

---

## After issues are open

1. Pin the most-impactful one (#1 NBRB or #5 World Bank) so visitors see it first.
2. Reference the issue list in the blog post: "Want to ship your first PR? Pick one: [link to good-first-issue label]"
3. Watch for activity. If someone claims an issue, assign it. If three weeks pass with no movement, ship it yourself — these are 1-evening tasks each.

## Self-test

This list also doubles as a **smoke test for `create-mcp`**. If you can't successfully run the suggested scaffold command for any of these, the CLI has a bug and needs fixing first.
