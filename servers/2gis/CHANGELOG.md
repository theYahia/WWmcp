# Changelog

## 3.0.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

## 3.0.0

### Major Changes

- 54cb308: Production-grade rewrite to v2.0.0. Promoted from `pipeline/data/` to `servers/` workspace. Adopts `@theyahia/mcp-core` for entry/transport layer (`runServer`, `createLogger`).

  Breaking changes:

  - Server entry refactored: `src/server.ts` (factory) split from `src/index.ts` (bin).
  - Adds Streamable HTTP transport (previously stdio-only).
  - Early `TWOGIS_API_KEY` validation in entry point.

  Native HTTP client preserved (4 base URLs + query-param auth don't fit `BaseHttpClient`/`AuthStrategy` pattern). Tool names, arguments, return formats, and `TWOGIS_API_KEY` env var are unchanged.

## 2.0.0 — 2026-04-22

Production-grade rewrite. Promoted from `pipeline/data/` to `servers/` workspace with selective integration into `@theyahia/mcp-core` (entry/transport layer; native HTTP client preserved).

### Breaking

- **Server entry refactored:** `src/server.ts` (factory) split out from `src/index.ts` (bin entry). Tests can now import the factory without triggering server startup.
- **HTTP transport added:** previously stdio-only. v2 adds HTTP via `--http` flag or `HTTP_PORT` env on the same binary.

### Added

- Streamable HTTP transport via `@theyahia/mcp-core`'s `runServer` — includes session management (`mcp-session-id`), CORS, graceful shutdown, `GET /health` endpoint.
- Structured JSON logging via `createLogger("2gis-mcp")`.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).
- Early `TWOGIS_API_KEY` validation in `index.ts` — fails fast with a helpful message instead of erroring on the first tool call.

### Improved

- `tsconfig.json` extends the workspace `tsconfig.base.json` (consistent compiler options across the monorepo).

### Unchanged (deliberate)

- **Native HTTP client kept** (`src/client.ts`). 2GIS spans 4 different base URLs (catalog, routing, suggest, reviews) and uses query-param API key auth. The `BaseHttpClient` + `AuthStrategy` pattern from `@theyahia/mcp-core` models a single base URL with header auth, which doesn't fit. Adopting it would require either a refactor of `AuthStrategy` to support URL injection, or a per-host client array — either of which is out of scope for this release.
- Tool names, arguments, return formats — fully backward-compatible.
- `TWOGIS_API_KEY` env var.
- npm package name `@theyahia/2gis-mcp`.

---

## 1.0.1 — 2026-04-01

Last release of the v1.x line. See git history for details.
