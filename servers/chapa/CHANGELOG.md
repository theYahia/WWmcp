# Changelog

## 1.1.0

### Minor Changes

- 54cb308: Initial release v1.0.0. MCP server for Chapa (Ethiopia's modern payment gateway). 8 tools covering transaction initialization, verification, transfers, bank listing, and account balance. Bearer auth via single `CHAPA_SECRET_KEY` env var (test/live via key prefix). Built on `@theyahia/mcp-core`.

## 1.0.0 — 2026-04-22

Initial release. MCP server for Chapa (Ethiopia payment gateway, Brave-verified at developer.chapa.co).

### Added

- 8 tools: `initialize_transaction`, `verify_transaction`, `list_banks`, `transfer`, `verify_transfer`, `list_transfers`, `list_transactions`, `get_balance`.
- Built on `@theyahia/mcp-core` (`BaseHttpClient` + `ApiKeyStrategy(CHAPA_SECRET_KEY)`).
- Stdio + Streamable HTTP transports.
- Test/live mode via env value (CHASECK_TEST-... vs CHASECK-...).
- English README with cross-IDE configuration.
- vitest suite covering auth headers, body shape, and missing-key error path.
