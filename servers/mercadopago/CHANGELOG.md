# Changelog

## 1.1.0

### Minor Changes

- 54cb308: Initial release v1.0.0. MCP server for MercadoPago covering 10 tools across payments, refunds, checkout preferences, and merchant orders. Multi-country support (AR/BR/MX/UY/CL/CO/PE/EC/VE) via single Bearer access token. Built on `@theyahia/mcp-core` with stdio + Streamable HTTP transports.

## 1.0.0 — 2026-04-22

Initial release. MCP server for MercadoPago covering payments, refunds, checkout preferences, and merchant orders.

### Added

- 10 tools across 3 categories:
  - **Payments**: `create_payment`, `get_payment`, `search_payments`, `refund_payment`, `get_payment_methods`
  - **Checkout (Preferences)**: `create_preference`, `get_preference`, `update_preference`
  - **Merchant Orders**: `search_merchant_orders`, `get_merchant_order`
- Built on `@theyahia/mcp-core` (`BaseHttpClient` + `ApiKeyStrategy` + `runServer`).
- Stdio + Streamable HTTP transports (auto-detected via `--http` or `HTTP_PORT`).
- Structured JSON logging via `createLogger("mercadopago-mcp")`.
- ErrorCategory-based MCP responses (validation / auth / rate_limit / not_found / server_error / timeout) with self-recovery hints for the LLM.
- Multi-country support: works for AR, BR, MX, UY, CL, CO, PE, EC, VE — country derived from token's account `site_id`.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).
- vitest suite covering auth headers, body shapes, every tool URL, retry behavior.

### Auth

Single env var `MERCADOPAGO_ACCESS_TOKEN`. Sandbox tokens (`TEST-...`) and production tokens (`APP_USR-...`) use the same code path.
