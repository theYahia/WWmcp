# Changelog

## 4.0.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

## 4.0.0

API v3 correctness overhaul, ported from the standalone `theYahia/megaplan-mcp` repo (npm `latest`)
and adapted to `@theyahia/mcp-core`. Earlier releases sent request shapes that do not match the real
Megaplan v3 API. Tool surface grows 8 → 18. **Breaking.**

### ⚠️ Breaking

- **List filtering & pagination rewritten.** v3 list endpoints take a SINGLE JSON object
  (`limit` + a nested `*Filter` + a `pageAfter` cursor) URL-encoded into the query string — not flat
  `filter[field]=value` params or `offset`. `filter_status` now takes account-specific status
  **code(s)** (e.g. `["filter_any"]`); `offset` is replaced by `page_after`.
- **Comments fixed.** The endpoint is the plural `/{entity}/{id}/comments`, and `create_comment`'s
  text field is `content` (was `text`, plus a redundant `subject` in the body).
- **`create_task` deadline** is sent as a v3 `DateTime` object, not a bare ISO string.
- **`create_deal`** sends `program` as a `Program` ref (was `DealProgram`), money as a `Money` object
  on `price` (was a bare number on `cost`), and `contact` as `ContractorHuman` / `ContractorCompany`
  (was `Contractor`) — hence the new `contact_type` param.
- **Tool output is a compact summary** (`{ total, count, items, nextPageAfter }`) by default;
  pass `raw: true` for the raw API JSON.

### Added

- 10 tools: `get_task`, `get_deal`, `get_project` (get-by-id); `update_task`, `update_deal`;
  `get_deal_programs`, `get_deal_program`; `list_clients`, `get_client`;
  `get_current_user` (experimental).
- `get_deal_programs` makes `create_deal` usable — it is how you discover the required `program_id`.
- `src/query.ts`: v3 list-query builder (FilterTermEnum / FilterTermRef / cursor) plus `DateTime`
  and `Money` value-object helpers.
- `src/format.ts`: defensive, LLM-friendly formatting of every entity, with a `raw` escape hatch.
- `idSchema` guard on every id interpolated into a request path — LLM-supplied ids are an untrusted
  boundary, so `../employee/current` and `1/2` are rejected before the call.
- `MEGAPLAN_DOMAIN` validation (bare `host[:port]` only, config-time SSRF guard) and expansion of a
  bare subdomain to `<sub>.megaplan.ru`.
- Single in-flight auth: concurrent cold-start requests share one password grant instead of firing
  one each.
- Upstream error bodies are folded into the thrown message, so the model sees why a call failed
  instead of a bare `HTTP 422`.

### Fixed

- Password grant posts `application/x-www-form-urlencoded` fields (the OAuth2 shape the v3
  `auth/access_token` endpoint expects), not a JSON body.
- Advertised server version is read from `package.json` (was a hardcoded `2.0.0` that had drifted).
- `.claude/skills/*` updated to the new tool set, cursor pagination and `content` field.

### Not ported from the standalone 4.0.0

- HTTP-transport hardening (bearer auth, loopback bind, DNS-rebinding protection, body-size limit,
  idle-session eviction). This monorepo's HTTP transport is `@theyahia/mcp-core`'s shared
  `runServer`/`startHttp`, so that work belongs in `packages/core` for all servers at once.

### Unchanged

- Built on `@theyahia/mcp-core`: `BaseHttpClient` (retry/timeout/401 re-auth/logging),
  `withErrorHandling`, `runServer` dual transport (stdio + Streamable HTTP).
- `MEGAPLAN_TOKEN` / `MEGAPLAN_LOGIN` + `MEGAPLAN_PASSWORD` auth, both MCP prompts.

## 3.0.0

### Major Changes

- 54cb308: Production-grade rewrite to v2.0.0. Promoted from `pipeline/crm/` to `servers/` workspace. Now built on `@theyahia/mcp-core` with a custom `MegaplanAuthStrategy` supporting BOTH direct token (`MEGAPLAN_TOKEN`) and Password grant (`MEGAPLAN_LOGIN` + `MEGAPLAN_PASSWORD`) with automatic 401 re-auth.

  Breaking changes:

  - HTTP env var renamed: `PORT` → `HTTP_PORT`.
  - Hand-rolled `http.ts` removed; `--http` flag still works via `runServer` (now with session management, `/health` endpoint, CORS).
  - Internal client now extends `BaseHttpClient`. Functional API (`megaplanGet`, `megaplanPost`) unchanged.
  - Tool errors return MCP-spec `CallToolResult` with `isError: true`.

  Tool names, arguments, return formats, 2 MCP prompts, and `MEGAPLAN_*` env vars are unchanged.

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
