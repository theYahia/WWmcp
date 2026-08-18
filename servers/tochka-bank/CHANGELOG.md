# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/).

## [2.0.0] - 2026-06-23

A ground-up rewrite to work against the **real** Tochka Bank uAPI. The 1.x
endpoints (base URL, version, auth flow, `counterparties`/`company-info`
resources, kopeks amounts) did not match the real bank and could not work.

### Breaking

- **Base URL & version**: `https://enter.tochka.com/api/v2` →
  `https://enter.tochka.com/uapi`; open-banking version `v2.0` → `v1.0`.
- **Authentication**: bare `client_credentials` (which cannot read accounts or
  move money) is replaced by the OAuth 2.0 **hybrid flow** (consent → authorize
  → authorization_code → refresh). Run `tochka-bank-mcp auth` once to authorize;
  the server then refreshes tokens automatically.
- **Response parsing**: all responses are read from the `{ Data, Links, Meta }`
  envelope (e.g. `Data.Account[]`, `Data.Balance[]`).
- **Payment amount is in RUBLES** (decimal, e.g. `75000.50`), not kopeks. The
  old "minor units (kopeks)" contract was wrong and risked a 100× error.
- **`create_payment`** uses the `/payment/v1.0/for-sign` flow: it creates a
  payment that a human signs in Tochka internet-bank (SMS) — nothing moves money
  automatically. It requires `confirm: true`; otherwise it returns a dry-run
  preview. Honors `TOCHKA_MAX_PAYMENT_RUB` and `TOCHKA_ALLOWED_RECIPIENTS`.
- **Removed** `list_counterparties` and `create_counterparty` — Tochka has no
  counterparties resource. **Added** `list_customers`; `get_company_info` now
  reads the real `customers/{customerCode}` resource.
- **`get_statement`** is now asynchronous (init + poll until Ready), matching the
  real API.
- **`get_payment_status`** is keyed by `request_id` (returned by `create_payment`).

### Added

- `auth` CLI command running the OAuth loopback flow; tokens persisted at
  `~/.config/tochka-bank-mcp/tokens.json` (override with `TOCHKA_TOKEN_STORE`).
- Request timeouts (`AbortSignal`), in-flight token-refresh dedup,
  `Retry-After`-aware 429 backoff with jitter, single 401 re-auth.
- PII/secret redaction on every error message and log line.
- MCP tool annotations (`readOnlyHint` / `destructiveHint`) and structured output.
- Input validation: BIK (9 digits), INN (10/12 + checksum), account (20 digits),
  amount bounds.
- GitHub Actions CI (Node 18/20/22), Biome lint/format, and an expanded test suite.

### Fixed

- Server version is now read from `package.json` (was hardcoded `1.0.0` while the
  package was `1.0.1`).
- All path and query parameters are URL-encoded.

## [1.0.1]

- Initial release (non-functional against the real Tochka API).
