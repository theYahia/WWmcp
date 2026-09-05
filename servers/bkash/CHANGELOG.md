# Changelog

## 1.1.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

## 1.1.0

### Minor Changes

- 54cb308: Initial release v1.0.0. MCP server for bKash Tokenized Checkout (Bangladesh's #1 mobile financial service, 70M+ users). 8 tools covering payments, refunds, and recurring agreements. Custom `BkashAuthStrategy` implements bKash's 3-step token grant flow with auto-refresh. Sandbox + production endpoint switching via `BKASH_SANDBOX` env. Built on `@theyahia/mcp-core`.

## 1.0.0 — 2026-04-22

Initial release. MCP server for bKash Tokenized Checkout (Bangladesh).

### Added

- 8 tools: `create_payment`, `execute_payment`, `query_payment`, `search_transaction`, `refund_payment`, `query_refund`, `agreement_create`, `agreement_query`.
- Custom `BkashAuthStrategy` implementing the 3-step token grant + refresh flow (Brave-verified at `https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant`).
- Sandbox vs production switch via `BKASH_SANDBOX` env var.
- Built on `@theyahia/mcp-core` (`BaseHttpClient` + custom `AuthStrategy` + `runServer`).
- Stdio + Streamable HTTP transports.
- Structured JSON logging, ErrorCategory-based MCP error responses.
- English README with cross-IDE configuration.
- vitest suite covering grant flow, authorization headers (raw token, no `Bearer` prefix), sandbox/prod URL switching, and missing-credential error paths.

### Auth

- 4 env vars required: `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`.
- Optional `BKASH_SANDBOX=true` for sandbox endpoints.
