# Changelog

## 3.0.0

### Major Changes

- 54cb308: Production-grade rewrite to v2.0.0. Promoted from `pipeline/cis/` to `servers/` workspace. Now built on `@theyahia/mcp-core` (`BaseHttpClient` + `ApiKeyStrategy` + `runServer` dual transport).

  Breaking changes:

  - `SallaClient` now wraps `BaseHttpClient`. Public `request(method, path, body?)` shape unchanged.
  - Tool errors return MCP-spec `CallToolResult` with `isError: true`.
  - Adds Streamable HTTP transport (previously stdio-only).
  - Lazy client init: `new SallaClient()` no longer throws at construction without env var.

  Tool names, arguments, return formats, and `SALLA_ACCESS_TOKEN` env var are unchanged.

## 2.0.0 — 2026-04-22

Production-grade rewrite. Promoted from `pipeline/cis/` to `servers/` workspace with full integration into `@theyahia/mcp-core`.

### Breaking

- **Internal client class:** `SallaClient` now wraps `@theyahia/mcp-core`'s `BaseHttpClient` + `ApiKeyStrategy`. Public `request(method, path, body?)` shape unchanged.
- **Error responses:** tool errors now return MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`) instead of throwing.

### Added

- Streamable HTTP transport via `@theyahia/mcp-core`'s `runServer` — includes session management (`mcp-session-id`), CORS, graceful shutdown, `GET /health` endpoint.
- Structured JSON logging via `createLogger("salla-mcp")`.
- ErrorCategory-based error responses with self-recovery hints for the LLM.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).
- **Lazy client initialization:** `new SallaClient()` no longer throws at construction time when `SALLA_ACCESS_TOKEN` is missing — env var is read on the first request. Unblocks tests that import the client without env vars.

### Improved

- Auth, retries, timeouts, and response parsing now share the battle-tested `BaseHttpClient` implementation used by all production servers (3 retries, exponential backoff on 5xx/429).
- Tests (`tests/client.test.ts`, `tests/server.test.ts`, `tests/tools.test.ts`) — vitest with mock fetch, covering all 9 tool handlers + auth + lazy init behavior.
- `tsconfig.json` extends the workspace `tsconfig.base.json` (consistent compiler options).
- Server factory (`src/server.ts`) split out from `src/index.ts` so tests don't trigger the side-effect `runServer()` call.

### Unchanged

- Tool names, arguments, return formats — fully backward-compatible.
- `SALLA_ACCESS_TOKEN` env var.
- npm package name `@theyahia/salla-mcp`.

---

## 1.1.1 — 2026-04-01

Last release of the v1.x line. See git history for details.
