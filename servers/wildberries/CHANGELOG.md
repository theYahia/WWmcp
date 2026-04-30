# Changelog

## 2.0.0 — 2026-04-22

Production-grade rewrite. Promoted from `pipeline/ecommerce/` to `servers/` workspace with selective integration into `@theyahia/mcp-core` (entry/transport layer; native rate-limited HTTP client preserved).

### Breaking

- **HTTP transport env var renamed:** `PORT=3000` → `HTTP_PORT=3000`.
- **Hand-rolled HTTP server replaced:** v1 had its own `http.createServer` block in `index.ts`. v2 uses `@theyahia/mcp-core`'s `runServer`, which adds session management (`mcp-session-id`), CORS, graceful shutdown, and a richer `/health` endpoint. Same `--http` flag still works.
- **Server entry refactored:** `src/server.ts` (factory) split out from `src/index.ts` (bin entry). The factory accepts an optional `WBClient` injection for testability.

### Added

- Streamable HTTP transport via `runServer` (multi-session, `/health`, CORS, graceful shutdown).
- Structured JSON logging via `createLogger("wildberries-mcp")` for fatal errors and lifecycle events.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).
- Early `WB_API_TOKEN` validation in `index.ts` — fails fast with a helpful message.

### Improved

- `tsconfig.json` extends the workspace `tsconfig.base.json` (consistent compiler options).
- Server factory split enables proper unit-testing of tool registration without spawning a transport.

### Unchanged (deliberate)

- **`WBClient` + `RateLimiter` preserved as-is.** The Wildberries-specific 409 penalty handling (parsing `X-Ratelimit-Retry-After` and `X-Ratelimit-Remaining` headers, deducting penalty tokens, waiting the prescribed duration) doesn't fit the generic retry pattern in `@theyahia/mcp-core`'s `BaseHttpClient`. The native client + limiter are battle-tested and unique IP for this server.
- **`tools.ts` JSON Schema definitions kept.** A small `jsonPropToZod` converter in `src/server.ts` maps the existing JSON Schema shapes (`string`, `number`, `boolean`, `array`, nested `object` + `required`) to Zod raw shapes at registration time. This was required because `McpServer.tool()` in SDK 1.29 strictly rejects raw JSON Schema. Migrating each of the 15 tool definitions to hand-written Zod is deferred — the converter is a one-liner per tool and the JSON shapes remain the source of truth.
- Tool names, arguments, return formats — fully backward-compatible.
- `WB_API_TOKEN` env var.
- Rate limiter behavior (300 req/min + 200ms min interval + 409 penalty).
- npm package name `@theyahia/wildberries-mcp`.

---

## 0.3.3 — 2026-04-06

Last release of the v0.x line. See git history for details.
