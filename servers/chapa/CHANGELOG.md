# Changelog

## 1.0.0 — 2026-04-22

Initial release. MCP server for Chapa (Ethiopia payment gateway, Brave-verified at developer.chapa.co).

### Added

- 8 tools: `initialize_transaction`, `verify_transaction`, `list_banks`, `transfer`, `verify_transfer`, `list_transfers`, `list_transactions`, `get_balance`.
- Built on `@theyahia/mcp-core` (`BaseHttpClient` + `ApiKeyStrategy(CHAPA_SECRET_KEY)`).
- Stdio + Streamable HTTP transports.
- Test/live mode via env value (CHASECK_TEST-... vs CHASECK-...).
- English README with cross-IDE configuration.
- vitest suite covering auth headers, body shape, and missing-key error path.
