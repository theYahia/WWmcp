# Changelog

## 3.0.0

### Major Changes

- 54cb308: Production-grade rewrite to v2.0.0. Promoted from `pipeline/cis/` to `servers/` workspace. Now built on `@theyahia/mcp-core` with a custom `IletiHmacStrategy` (SHA256(apiKey + secret + ISO_timestamp), sent as `X-API-Key` + `X-API-Hash` headers).

  Breaking changes:

  - `IletiMerkeziClient` now wraps `BaseHttpClient`. Public `request(method, path, body?)` shape unchanged.
  - Tool errors return MCP-spec `CallToolResult` with `isError: true`.
  - Adds Streamable HTTP transport (previously stdio-only).
  - Lazy client init: `new IletiMerkeziClient()` no longer throws at construction without env vars.

  Tool names, arguments, return formats, and `ILETI_API_KEY`/`ILETI_SECRET` env vars are unchanged.

## 2.0.0 — 2026-04-22

Production-grade rewrite. Promoted from `pipeline/cis/` to `servers/` workspace with full integration into `@theyahia/mcp-core`.

### Breaking

- **Internal client class:** `IletiMerkeziClient` now wraps `@theyahia/mcp-core`'s `BaseHttpClient` with a custom `IletiHmacStrategy`. Public `request(method, path, body?)` shape unchanged.
- **Error responses:** tool errors now return MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`) instead of throwing.

### Added

- Streamable HTTP transport via `@theyahia/mcp-core`'s `runServer` — includes session management (`mcp-session-id`), CORS, graceful shutdown, `GET /health` endpoint.
- Structured JSON logging via `createLogger("ileti-merkezi-mcp")`.
- ErrorCategory-based error responses with self-recovery hints for the LLM.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).
- **Lazy client initialization:** `new IletiMerkeziClient()` no longer throws at construction time when `ILETI_API_KEY` or `ILETI_SECRET` is missing — env vars are read on the first request.

### Improved

- HMAC-signed requests now share the battle-tested `BaseHttpClient` retry/timeout logic (3 retries, exponential backoff on 5xx/429).
- Tests (`tests/client.test.ts`, `tests/server.test.ts`) — vitest with mock fetch, covering HMAC header generation, lazy init, and POST body serialization. Verifies that `X-API-Hash` differs across requests (timestamp recomputed each time).
- `tsconfig.json` extends the workspace `tsconfig.base.json`.
- Server factory (`src/server.ts`) split out from `src/index.ts` so tests don't trigger the side-effect `runServer()` call.

### Unchanged

- Tool names, arguments, return formats — fully backward-compatible.
- `ILETI_API_KEY` and `ILETI_SECRET` env vars.
- HMAC formula: SHA256(apiKey + secret + ISO_timestamp), sent as `X-API-Key` + `X-API-Hash` headers.
- npm package name `@theyahia/ileti-merkezi-mcp`.

---

## 1.0.1 — 2026-04-01

Last release of the v1.x line. See git history for details.
