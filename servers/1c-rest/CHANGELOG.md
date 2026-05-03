# Changelog

## 3.0.0

### Major Changes

- 54cb308: Production-grade rewrite to v2.0.0. Promoted from `pipeline/finance/` to `servers/` workspace. Now built on `@theyahia/mcp-core` (`BaseHttpClient` + `BasicAuthStrategy` + `runServer` dual transport).

  Breaking changes:

  - HTTP env var renamed: `PORT` → `HTTP_PORT`
  - Removed separate HTTP binary `1c-rest-mcp-http`; use `1c-rest-mcp --http` or `HTTP_PORT=…`
  - Single `bin` entrypoint (`dist/index.js`); `dist/http.js` removed
  - Tool errors now return MCP-spec `CallToolResult` with `isError: true`

  Tool names, arguments, return formats, and `ONEC_*` env vars are unchanged. Backward-compat aliases `1C_*` still accepted.

## 2.0.0 — 2026-04-22

Production-grade rewrite. Promoted from `pipeline/finance/` to `servers/` workspace with full integration into `@theyahia/mcp-core`.

### Breaking

- **HTTP transport env var renamed:** `PORT=3000` → `HTTP_PORT=3000`.
- **Removed separate HTTP binary:** `1c-rest-mcp-http` no longer exists. Use `1c-rest-mcp --http` or `HTTP_PORT=3000 1c-rest-mcp`.
- **Removed `dist/http.js`:** single `bin` entrypoint via `dist/index.js`.
- **Internal client class:** rewritten on top of `@theyahia/mcp-core`'s `BaseHttpClient` + `BasicAuthStrategy`. Public functional API (`oneCGet`, `oneCPost`, `oneCPatch`, `buildODataPath`) unchanged.
- **Error responses:** tool errors now return MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`) instead of throwing. Compatible with all MCP clients.

### Added

- Streamable HTTP transport via `@theyahia/mcp-core`'s `runServer` — includes session management (`mcp-session-id`), CORS, graceful shutdown, `GET /health` endpoint.
- Structured JSON logging via `createLogger("1c-rest-mcp")`.
- ErrorCategory-based error responses (validation / auth / rate_limit / not_found / server_error / timeout) with self-recovery hints for the LLM.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).

### Improved

- Auth, retries, timeouts, and response parsing now share the battle-tested `BaseHttpClient` implementation used by 12 other production servers.
- Tests (`tests/client.test.ts`, `tests/server.test.ts`, `tests/tools.test.ts`) — vitest with mock fetch, covering all 9 tool handlers and backward-compat env var aliases.
- `tsconfig.json` now extends the workspace `tsconfig.base.json` (consistent compiler options across all packages).

### Unchanged

- Tool names, arguments, return formats — fully backward-compatible.
- `ONEC_BASE_URL`, `ONEC_LOGIN`, `ONEC_PASSWORD` env vars (and `1C_*` backward-compat aliases).
- `ONEC_SERVICES` module filtering (catalogs, documents, registers, reports, odata, meta).
- npm package name `@theyahia/1c-rest-mcp`.

---

## 1.2.1 — 2026-04-06

Last release of the v1.x line. See git history for details.
