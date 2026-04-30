# Changelog

## 2.0.0 — 2026-04-22

Production-grade rewrite. Promoted from `pipeline/crm/` to `servers/` workspace with full integration into `@theyahia/mcp-core`.

### Breaking

- **HTTP transport env var renamed:** `PORT=3000` → `HTTP_PORT=3000`.
- **Hand-rolled `http.ts` removed:** v1's separate `--http` codepath is replaced by `@theyahia/mcp-core`'s `runServer`. Same `--http` flag still works, but the implementation now includes session management (`mcp-session-id`), CORS, `GET /health` endpoint, and graceful shutdown.
- **Internal client class:** rewritten on top of `BaseHttpClient` + custom `MegaplanAuthStrategy` (Password grant flow with token caching and 401 re-auth via `invalidate()`). Public functional API (`megaplanGet`, `megaplanPost`) unchanged.
- **Error responses:** tool errors now return MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`) instead of throwing.

### Added

- Streamable HTTP transport via `runServer` (multi-session, `/health`, CORS).
- Structured JSON logging via `createLogger("megaplan-mcp")`.
- ErrorCategory-based error responses with self-recovery hints for the LLM.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).
- Server factory split (`src/server.ts`) so tests don't trigger `runServer`.

### Improved

- Auth, retries, timeouts, and response parsing now share the battle-tested `BaseHttpClient` implementation used by all production servers (3 retries, exponential backoff on 5xx/429).
- Tests (`tests/client.test.ts`, `tests/server.test.ts`) — vitest with mock fetch, covering both auth modes, the nested `data.access_token` response shape, missing-env validation, and POST body serialization.
- `tsconfig.json` extends the workspace `tsconfig.base.json`.

### Unchanged

- Tool names, arguments, return formats — fully backward-compatible.
- 2 MCP prompts (`my-tasks-today`, `create-deal-wizard`) preserved as-is.
- `MEGAPLAN_DOMAIN`, `MEGAPLAN_TOKEN`, `MEGAPLAN_LOGIN`, `MEGAPLAN_PASSWORD` env vars.
- npm package name `@theyahia/megaplan-mcp`.

---

## 1.1.0 — 2026-04-01

Last release of the v1.x line. See git history for details.
