# Changelog

## 1.0.0 — 2026-04-22

Initial release. MCP server for Fawaterak (Egypt's payment aggregator covering Fawry, cards, wallets, Meeza).

### Added

- 8 tools: `create_invoice_link`, `send_payment`, `get_payment_methods`, `get_invoice_data`, `list_invoices`, `cancel_invoice`, `refund_payment`, `get_balance`.
- Built on `@theyahia/mcp-core` (`BaseHttpClient` + `ApiKeyStrategy`).
- Sandbox vs production endpoint switching via `FAWATERAK_SANDBOX` env var (verified via Brave sweep against curl/PHP/C# samples on fawaterak-api.readme.io).
- Stdio + Streamable HTTP transports.
- English README with cross-IDE configuration.
- vitest suite covering Bearer auth header, sandbox/production URL switching, body serialization, and missing-credential error path.
