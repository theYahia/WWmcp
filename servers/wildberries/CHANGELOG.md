# Changelog

## 3.1.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

## 3.1.0

### Minor Changes

- be3708c: Fix critical API host routing, broaden coverage to 30 tools, and harden the client.

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

## 3.0.0

### Major Changes

- 54cb308: Production-grade rewrite to v2.0.0. Promoted from `pipeline/ecommerce/` to `servers/` workspace. Adopts `@theyahia/mcp-core` for entry/transport layer (`runServer`, `createLogger`).

  Breaking changes:

  - HTTP env var renamed: `PORT` → `HTTP_PORT`.
  - Hand-rolled HTTP server replaced by `runServer` (multi-session, CORS, `/health`).
  - Server entry refactored: `src/server.ts` (factory with WBClient injection) split from `src/index.ts` (bin).

  Native `WBClient` + `RateLimiter` (300 req/min + 200ms min interval + 409 penalty handling with `X-Ratelimit-Retry-After`) preserved — Wildberries-specific logic doesn't fit `BaseHttpClient`'s generic retry pattern. `tools.ts` JSON Schema definitions kept (Zod migration deferred). Tool names, arguments, return formats, and `WB_API_TOKEN` env var are unchanged.

## 2.0.0 — 2026-04-22

Production-grade rewrite. Promoted from `pipeline/ecommerce/` to `servers/` workspace with selective integration into `@theyahia/mcp-core` (entry/transport layer; native rate-limited HTTP client preserved).

### Breaking

- **HTTP transport env var renamed:** `PORT=3000` → `HTTP_PORT=3000`.
- **Hand-rolled HTTP server replaced:** v1 had its own `http.createServer` block in `index.ts`. v2 uses `@theyahia/mcp-core`'s `runServer`, which adds session management (`mcp-session-id`), CORS, graceful shutdown, and a richer `/health` endpoint. Same `--http` flag still works.
- **Server entry refactored:** `src/server.ts` (factory) split out from `src/index.ts` (bin entry). The factory accepts an optional `WBClient` injection for testability.

### Added

- Streamable HTTP transport via `runServer` (multi-session, `/health`, CORS, graceful shutdown).
- Structured JSON logging via `createLogger("wildberries-mcp")` for fatal errors and lifecycle events.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).
- Early `WB_API_TOKEN` validation in `index.ts` — fails fast with a helpful message.

### Improved

- `tsconfig.json` extends the workspace `tsconfig.base.json` (consistent compiler options).
- Server factory split enables proper unit-testing of tool registration without spawning a transport.

### Unchanged (deliberate)

- **`WBClient` + `RateLimiter` preserved as-is.** The Wildberries-specific 409 penalty handling (parsing `X-Ratelimit-Retry-After` and `X-Ratelimit-Remaining` headers, deducting penalty tokens, waiting the prescribed duration) doesn't fit the generic retry pattern in `@theyahia/mcp-core`'s `BaseHttpClient`. The native client + limiter are battle-tested and unique IP for this server.
- **`tools.ts` JSON Schema definitions kept.** A small `jsonPropToZod` converter in `src/server.ts` maps the existing JSON Schema shapes (`string`, `number`, `boolean`, `array`, nested `object` + `required`) to Zod raw shapes at registration time. This was required because `McpServer.tool()` in SDK 1.29 strictly rejects raw JSON Schema. Migrating each of the 15 tool definitions to hand-written Zod is deferred — the converter is a one-liner per tool and the JSON shapes remain the source of truth.
- Tool names, arguments, return formats — fully backward-compatible.
- `WB_API_TOKEN` env var.
- Rate limiter behavior (300 req/min + 200ms min interval + 409 penalty).
- npm package name `@theyahia/wildberries-mcp`.

---

## 0.3.3 — 2026-04-06

Last release of the v0.x line. See git history for details.
