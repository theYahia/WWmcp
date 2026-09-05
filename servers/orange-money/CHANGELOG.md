# Changelog

## 1.1.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

## 1.1.0

### Minor Changes

- 6913b64: Initial release v1.0.0. MCP server for Orange Money WebPay covering ~12 Francophone African countries from a single package via `ORANGE_MONEY_COUNTRY` env switching. 8 tools spanning hosted WebPay, B2B cashin/cashout/transfer, balance, and webhook validation. Custom `OrangeMoneyAuthStrategy` implements Orange Developer's quirky OAuth2 (Basic Authorization header, no body credentials, mandatory Accept: application/json) — Brave-verified against developer.orange.com docs. Built on `@theyahia/mcp-core`.

## 1.0.0 — 2026-04-22

Initial release. MCP server for Orange Money WebPay covering ~12 Francophone African countries from a single package.

### Added

- 8 tools: `create_webpayment`, `get_payment_status`, `cashin`, `cashout`, `transfer`, `get_balance`, `list_supported_countries`, `validate_webhook`.
- Custom `OrangeMoneyAuthStrategy` implementing Orange Developer's OAuth2 Client Credentials with **Basic Authorization header** (Brave-verified: Orange forbids client_id/secret in body, returns HTTP 400 "Duplicate credentials" if you put them there).
- Multi-country routing via `ORANGE_MONEY_COUNTRY` env var (sn, ci, ml, cm, bf, td, mg, ne, gn, lr, sl, cd).
- Built on `@theyahia/mcp-core` (`BaseHttpClient` + custom `AuthStrategy` + `runServer`).
- Stdio + Streamable HTTP transports.
- English README with currency reference (XOF for UEMOA, XAF for CEMAC).
- vitest suite covering Basic auth header construction, no-body-credentials guarantee, per-country URL routing, and missing-env error paths.

### Auth notes

- `client_id`/`secret` are sent ONLY in the Basic header.
- Body of the token request is exactly `grant_type=client_credentials` (no extra params).
- `Accept: application/json` is mandatory (else HTTP 406).
- These are quirks of Orange Developer's OAuth implementation, NOT generic OAuth2 Client Credentials.
