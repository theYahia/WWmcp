# Changelog

## 2.0.0 — 2026-04-22

Production-grade rewrite. Promoted from `pipeline/marketing/` to `servers/` workspace with full integration into `@theyahia/mcp-core`.

### Breaking

- **Internal client class:** rewritten on top of `@theyahia/mcp-core`'s `BaseHttpClient` + `ApiKeyStrategy`. Public functional API (`apiGet`, `apiPost`) unchanged.
- **Error responses:** tool errors now return MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`) instead of throwing. Compatible with all MCP clients.

### Added

- Streamable HTTP transport via `@theyahia/mcp-core`'s `runServer` — includes session management (`mcp-session-id`), CORS, graceful shutdown, `GET /health` endpoint.
- Structured JSON logging via `createLogger("vk-ads-mcp")`.
- ErrorCategory-based error responses (validation / auth / rate_limit / not_found / server_error / timeout) with self-recovery hints for the LLM.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).

### Improved

- Auth, retries, timeouts, and response parsing now share the battle-tested `BaseHttpClient` implementation used by all production servers.
- Tests (`tests/client.test.ts`, `tests/server.test.ts`, `tests/tools.test.ts`) — vitest with mock fetch, covering all 8 tool handlers + auth + retry behavior.
- `tsconfig.json` extends the workspace `tsconfig.base.json` (consistent compiler options).
- Server factory (`src/server.ts`) split out from `src/index.ts` so tests don't trigger the side-effect `runServer()` call.

### Unchanged

- Tool names, arguments, return formats — fully backward-compatible.
- `VK_ADS_TOKEN` env var.
- npm package name `@theyahia/vk-ads-mcp`.

---

## 1.0.1 — 2026-04-01

Last release of the v1.x line. See git history for details.
