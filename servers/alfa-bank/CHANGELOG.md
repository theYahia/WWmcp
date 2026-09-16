# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); this project uses semantic versioning.

## [Unreleased]

### Changed

- Moved into the [WWmcp](https://github.com/theYahia/WWmcp/tree/main/servers/alfa-bank) monorepo;
  transports, logging and output sanitization now come from `@theyahia/mcp-core`. Tool names,
  count and input schemas are unchanged.
- HTTP transport: CORS is now deny-all by default (was `*`); non-browser MCP clients are unaffected.
  Sessions are tracked per `Mcp-Session-Id`.

### Fixed

- `create_payment_order` is no longer repeated automatically after a timeout, network error,
  429 or 5xx — the bank may already have accepted the registry, so a repeat could pay twice.
  Read requests keep their retries.

## [1.1.0]

### Changed (API correctness — aligned to public Alfa API docs)

- **Base URL** default `https://partner.business.alfabank.ru` → `https://baas.alfabank.ru`.
- **Token endpoint** `POST /oauth/token` → OIDC `POST /oidc/token`; added optional `scope`
  (`ALFA_SCOPE`) and handling of OIDC token responses.
- **Endpoint paths** corrected toward the documented Alfa API surface:
  - `list_accounts` → `GET /api/pp/v1/accounts`
  - `get_account_statement` → `GET /api/statement/transactions`
  - `create_payment_order` → registry model (`POST /api/jp/v1/registries` + signature)
  - `get_payment_status` → `GET /api/jp/v1/registries/{id}`
  - `list_counterparties` → beneficiaries (`/na/jp/v1/beneficiaries`)
  - `get_exchange_rates` → `GET /api/rates/gd/v1/offices-rates`
  - Paths not yet confirmed 1:1 are marked `// VERIFY` in code and in the README status table.

### Added

- **mTLS scaffold** (`auth/mtls.ts`): optional client-certificate dispatcher from
  `ALFA_TLS_CERT` / `ALFA_TLS_KEY` / `ALFA_TLS_CA` (inline PEM or file path).
- **Request signing interface** (`auth/signer.ts`): `Signer` + default `UnimplementedSigner`
  that explains the required PKCS#7 GOST signature for operational methods.
- **Tool annotations**: read-only tools marked `readOnlyHint`; `create_payment_order` marked
  `destructiveHint` so clients can gate the money-moving call.
- **Streamable HTTP transport** (`--http` / `HTTP_PORT`) with `POST /mcp` and `GET /health`.
- **Request timeouts** (`ALFA_TIMEOUT_MS`, default 15s) and bounded retries with jitter on
  429 / 5xx / network / timeout; secrets are never placed in error messages.
- Graceful shutdown on `SIGINT` / `SIGTERM`; server version resolved from `package.json`.
- Tooling: Biome lint/format, GitHub Actions CI (node 18/20/22), `smithery.yaml`, `.mcp.json`.
- Tests: client unit tests for the new endpoints plus an in-memory MCP server smoke test
  (tool count, names, and the destructive payment annotation).

### Migrated

- Tool registration moved from the legacy `server.tool()` to `server.registerTool()`
  (title + annotations); `@modelcontextprotocol/sdk` bumped `^1.12.1` → `^1.29.0`.

### Documentation

- README rewritten with a **Disclaimer & endpoint verification status** section: production
  access requires mTLS, GOST request signing, and a bank contract; this package does not reach
  the live contour without them.

## [1.0.1]

- Initial public release: 8 tools over an illustrative Alfa-Bank API contract, stdio transport.
