# Changelog

## 1.1.0

Correctness overhaul + much wider API coverage (8 → 26 tools).

### Fixed (correctness — the server was broken against the live iFood API)
- **Empty/202/204 response bodies no longer throw.** The client always called `response.json()`, which throws on the empty `202` bodies that confirm/dispatch/cancel return and the `204` that polling returns — so write tools failed even on success. Bodies are now parsed safely.
- **Shared OAuth token.** Each tool created its own `IfoodClient` at import time, producing up to 8 separate token caches (8 token fetches). Tools now share one lazy singleton — one token across all tools.
- **No more crash on missing credentials.** The constructor threw at import time, crashing the process before the MCP transport connected. Validation is deferred to the first request and surfaces as a normal tool error.
- **`update_item_availability` was wrong** (PUT + legacy boolean body + wrong path). Replaced by `update_item_status` → `PATCH /catalog/v2.0/.../items/status` with an `AVAILABLE`/`UNAVAILABLE` enum. **Breaking:** the old tool name is removed (it never worked).
- **`cancel_order` no longer hardcodes code `501`.** Callers must pass a valid code from `get_cancellation_reasons`.
- **Server version** is read from `package.json` (was hardcoded `1.0.0` while the package was `1.0.1`).

### Added
- **Robustness:** retry/backoff on `429`/`5xx`/network/timeout (honoring `Retry-After`), one-time token refresh on `401`, and env-configurable `IFOOD_BASE_URL` / `IFOOD_TOKEN_URL` / `IFOOD_TIMEOUT_MS` / `IFOOD_MAX_ATTEMPTS`.
- **Order tools:** `acknowledge_events`, `start_preparation`, `ready_to_pickup`, `get_cancellation_reasons`.
- **Merchant tools:** `get_merchant`, `get_opening_hours`, `set_opening_hours`, `list_interruptions`, `create_interruption`, `delete_interruption`; pagination on `list_merchants`.
- **Catalog tools:** `update_item_price`, `update_option_status`, `update_option_price`, `list_catalogs`, `list_categories`, `list_items_by_category`, `list_products`, `upsert_item`.
- MCP tool **annotations** (`readOnlyHint`/`destructiveHint`/`idempotentHint`) on every tool.
- CI (GitHub Actions, Node 18/20/22), `server.json` for the MCP registry, `bugs` field, expanded README, expanded test suite (shared-token regression, 401 refresh, retry, timeout, empty-body).

### Changed
- Migrated from the deprecated `server.tool()` to `server.registerTool()`.
- `list_orders` re-described as an event poll (it is not a list of orders).
- Removed the unused `src/types.ts`.

### ⚠️ Pending verification (implemented from best-available evidence; verify against live iFood docs before relying on them)
- `acknowledge_events` path (`/order/v1.0/events/acknowledgment` vs `/order/v1.0/acknowledgment`).
- `cancel_order` request body (`{ reason: <code> }` vs a two-field shape).

### Notes for maintainer (not done here)
- npm publish was intentionally **not** performed.
- MCP registry publish (`mcp-publisher`) not performed — before publishing, verify the `server.json` schema version and that the `io.github.theYahia` namespace casing matches your GitHub login exactly (npm scope is lowercase `@theyahia`).
