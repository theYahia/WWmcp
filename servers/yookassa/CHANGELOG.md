# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## [3.0.0]

Production-hardening release: correctness fixes that prevent duplicate/wrong money
operations, a secured HTTP transport, MCP best-practices, and 54-FZ-robust receipts.

### Breaking
- **Renamed tool `get_shop_balance` → `get_shop_info`.** `/me` returns shop settings, not a
  monetary balance, and YooKassa has no balance endpoint. Update any client/skill references.
- **HTTP transport (`--http`) now requires `MCP_AUTH_TOKEN`** and binds to `127.0.0.1` by
  default. It refuses to start without a token, validates `Host`/`Origin`, and no longer sends
  `Access-Control-Allow-Origin: *`. `/mcp` is POST-only.
- **`create_payment` / `create_sbp_payment` / `create_split_payment` no longer inject a
  placeholder `return_url`.** `return_url` is now required for `confirmation_type=redirect`
  (the new default); use `confirmation_type=embedded`/`qr` otherwise.
- **Money amounts** now also accept a 2-decimal string (e.g. `"99.50"`) in addition to a
  number; numbers are formatted via integer kopecks (no `toFixed` float artifacts).

### Fixed
- **Idempotency:** the `Idempotence-Key` is generated once per logical request and reused on
  every retry (it was regenerated per attempt, so a retried POST/DELETE created a duplicate
  payment/refund/payout). Extended to DELETE; callers may pass an explicit key.
- **Payouts:** `card` is now sent as an object `{ number }` (was a JSON string, rejected by the
  API); SBP payouts require `bank_id`; payout endpoints use a separate gateway client.
- **Retries / timeout:** client timeout raised to 35s (above YooKassa's ~30s answer window);
  retries are safe because the key is stable.
- **Errors:** non-JSON/HTML error bodies are truncated and labeled instead of echoed verbatim.
- **Bundled skills:** `check-account` referenced a non-existent `get_balance`; all skills
  declared `allowed-tools: [Bash, Read]` and could not call the MCP tools — fixed.

### Added
- **MCP annotations** on every tool (`readOnlyHint` for reads; `destructiveHint`/`idempotentHint`
  for money operations) and server `instructions` for safe usage.
- **Structured output** (`outputSchema` + `structuredContent`) for payment/refund/payout tools.
- **Receipts (54-FZ):** per-item `payment_subject` (1212), `payment_mode` (1214), `measure` (2108,
  required for FFD 1.2) with sensible defaults; receipt-level `tax_system_code` (1055); standalone
  receipts send `send:true` and auto-computed `settlements`.
- **Split payments:** per-transfer `platform_fee_amount` and `metadata`; transfers must sum to the
  total (validated locally).
- **Payouts:** `payout_token` support (for merchants without PCI DSS) and separate gateway
  credentials (`YOOKASSA_PAYOUT_AGENT_ID` / `YOOKASSA_PAYOUT_SECRET_KEY`).
- **Validation:** ISO-4217 currency codes; `YOOKASSA_DEBUG` request tracing (never logs secrets).
- **Tooling/docs:** Biome linter + CI lint step, `SECURITY.md`, `CONTRIBUTING.md`, expanded test
  suite, English tool surface, and a skill↔tool consistency check.

## [2.0.x]

- 20 tools (payments, refunds, receipts, payouts, webhooks, account), stdio + Streamable HTTP
  transports, Vitest test suite, CI on Node 18/20/22, and Smithery packaging.

[3.0.0]: https://github.com/theYahia/yookassa-mcp/releases/tag/v3.0.0
