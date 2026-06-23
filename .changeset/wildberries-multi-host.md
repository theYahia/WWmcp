---
"@theyahia/wildberries-mcp": minor
---

Fix critical API host routing, broaden coverage to 30 tools, and harden the client.

**Fixed**

- **Requests now reach the API.** Every call used a single base URL
  `https://seller.wildberries.ru` — the seller web cabinet, not an API host — so all tools
  hit the wrong server. Calls are now routed per category to the correct hosts
  (`content-api`, `discounts-prices-api`, `marketplace-api`, `statistics-api`,
  `seller-analytics-api`, `common-api`, `feedbacks-api`, `returns-api`, `advert-api`).
- **`get_abc_analysis`** read `response.data`, but `reportDetailByPeriod` returns a
  top-level array, so ABC was always empty against the real API. Now tolerates both shapes.
- **`get_statistics` / `get_abc_analysis`** moved off the deprecated v1 `reportDetailByPeriod`
  to v5.

**Added**

- **15 new tools** (15 → 30): `get_incomes`, `get_fbw_stocks`, `add_orders_to_supply`,
  `deliver_supply`, `get_supply_barcode`, `get_funnel`, `get_paid_storage` (async report),
  `get_commission`, `get_tariffs`, `get_questions`, `reply_question`, `get_returns`,
  `get_balance`, `list_campaigns`, `get_campaign_stats`.
- **Per-category rate limiting** (`RateLimiterPool`): one token bucket per host, with
  stricter per-endpoint buckets; 409 penalties stay isolated to a category.
- **Per-request timeouts** via `AbortController` (`WB_TIMEOUT_MS`, default 30s).
- **Structured WB error messages** — parses `errorText`/`detail`/`requestId` and includes
  the target host, so wrong-host / missing-scope failures are self-diagnosing.
- **Input validation** — the JSON Schema → Zod converter now honours `enum` / `integer` /
  `minimum` / `maximum` / `minItems` / `maxItems`, enforced by the SDK before handlers run.
- `encodeURIComponent` on string path segments (path-traversal guard); NaN-safe env parsing.
- `tests/server.test.ts` adds a real `tools/list` + `tools/call` round-trip over an
  in-memory transport; per-tool host assertions across the suite.

**Notes**

- A few newer endpoints (`get_funnel`, `get_paid_storage` status strings, `reply_question`
  state, `list_campaigns` / `get_campaign_stats` bodies, `get_returns` params, supply
  barcode shape) are implemented to current public docs but marked `VERIFY` in source —
  confirm against your account with a live token.
- The token must have each used category's scope enabled (see README).
