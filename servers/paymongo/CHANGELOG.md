# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0]

### Added
- **Links** tools: `create_link`, `get_link` (by ID or reference number),
  `archive_link` (archive/unarchive).
- **Webhooks** tools: `create_webhook`, `list_webhooks`, `get_webhook`,
  `update_webhook` (URL/events + enable/disable), and `verify_webhook_signature`
  — a local HMAC-SHA256 verifier (no network call) for the `Paymongo-Signature`
  header.
- **Payment Methods** tools: `create_payment_method`, `get_payment_method`.
- **Customers** tools: `create_customer`, `get_customer`, `list_customers`.
- **Refunds** read tools: `get_refund`, `list_refunds`.
- **Live-mode safety guard**: money-moving operations are refused when a LIVE
  key (`sk_live_`) is configured unless `PAYMONGO_ALLOW_LIVE=true`.
- **MCP tool annotations** (`readOnlyHint`, `destructiveHint`, `idempotentHint`,
  `openWorldHint`) so clients can present and gate tools appropriately.
- Automatic retries for `429` (always) and `5xx` (GET only), honoring
  `Retry-After`.
- CI (GitHub Actions, Node 18/20/22), `.env.example`, this changelog, and an
  expanded README.

### Changed
- The PayMongo client is now constructed **lazily**. A missing
  `PAYMONGO_SECRET_KEY` now surfaces as a tool-call error instead of crashing
  the process at import time (previously the server could not even list its
  tools without a key). Backward-compatible for well-behaved consumers.
- API errors are parsed from PayMongo's `errors[]` array into readable messages
  and returned as `isError` tool results (still prefixed `PayMongo HTTP
  <status>`).
- `amount` inputs must be integers (centavos); `list_*` tools take a bounded
  `limit` (1–100) plus `before`/`after` cursors.
- `create_refund` now accepts PayMongo's full `reason` set, including `others`.

### Security
- All resource IDs interpolated into request paths are `encodeURIComponent`-encoded,
  preventing path/parameter injection (e.g. an ID like `x/../webhooks/y/disable`)
  from redirecting a call to a different PayMongo endpoint.

## [1.0.0]

### Added
- Initial release: 9 tools for payment intents, sources, payments, refunds, and
  checkout sessions via Basic Auth.

[1.1.0]: https://github.com/theYahia/paymongo-mcp/releases/tag/v1.1.0
[1.0.0]: https://github.com/theYahia/paymongo-mcp/releases/tag/v1.0.0
