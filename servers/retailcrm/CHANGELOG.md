# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] — 2026-06-23

Production-hardening release. **Breaking**: read tools now return shaped, token-efficient
output by default instead of the raw RetailCRM payload.

### Breaking
- **Shaped output (summary by default).** `list_orders`, `get_order`, `list_customers`,
  `get_customer`, `list_products` now return compact, essential-field views. Pass
  `detail:"full"` for the complete shaped object, or `raw:true` for the untouched
  RetailCRM payload. Lists now include an explicit `pagination` block
  (`page/totalPages/totalCount/returned/hasMore`).
- Tool results no longer pretty-print raw JSON; large nested payloads are projected to
  the fields an agent actually needs (big token reduction).

### Added
- **20+ new tools:** `orders_history`, `update_customer`, `customers_history`,
  `list_product_groups`, `store_inventories`, `order_payment_create/edit/delete`,
  `customer_notes_list/create/delete`, `tasks_list/create/edit`, `list_segments`,
  `list_costs`, `create_cost`, `files_list/get/upload`, and references
  `list_sites`, `list_countries`, `list_order_types`, `list_order_methods`. (39 tools total.)
- **Link existing customers on orders:** `create_order`/`update_order` accept
  `customer_id` / `customer_external_id` instead of always creating an inline customer.
- **`site` parameter** on create/edit tools for multi-site API keys.
- **`RETAILCRM_READONLY=1`** hides all write/destructive tools (query-only deployments).
- Tool `annotations` (`readOnlyHint`, and `destructiveHint` on `merge_customers`) and
  `structuredContent` for forward-compatible clients.
- Optional client-side rate limiter via `RETAILCRM_RATE_LIMIT` (requests/second).
- Raw `application/octet-stream` file upload support in the API client (matches `/files/upload`).

### Changed
- **Auth via `X-API-KEY` header** instead of the `apiKey` URL query string — keeps the
  key out of proxy/CDN/server access logs.
- **Honest, period-scoped analytics.** `get_orders_summary` now sends the date filters
  and aggregates status distribution / revenue / AOV over the window (exact `totalCount`,
  with a `partial` flag), replacing the mislabeled all-time `/orders/statuses/statistic`
  snapshot. `get_customers_summary` returns the period new-customer count.
- Retry logic branches on a typed `RetailCrmHttpError` (numeric `status` + `isTimeout`)
  instead of matching error-message substrings; backoff now has jitter.
- Server version is read from `package.json` (single source of truth) for the MCP
  handshake, `/health`, and startup log.

### Fixed
- **HTTP `--http` transport.** Each `POST /mcp` now gets a fresh `McpServer` + transport
  (stateless isolation) with cleanup on response close; previously one shared server was
  re-`connect()`ed per request, cross-wiring concurrent responses and leaking transports.
  `GET`/`DELETE /mcp` return `405`; errors return a JSON-RPC `500` instead of hanging.
  Optional DNS-rebinding protection (`allowedHosts`).
- CI now runs lint + typecheck + tests on Node 18/20/22 (previously build-only).
- Removed dead, unwired tool modules and a broken, never-run test file.
- Date filters validated as `YYYY-MM-DD`; list `limit` capped at 100.

## [2.0.1] — earlier
- npm discoverability (description, keywords).

## [2.0.0] — earlier
- Production-grade rewrite: 15 tools + 2 prompt skills, stdio + Streamable HTTP.

## [1.1.0] / [1.0.0] — earlier
- Initial releases.

[3.0.0]: https://github.com/theYahia/retailcrm-mcp/releases/tag/v3.0.0
