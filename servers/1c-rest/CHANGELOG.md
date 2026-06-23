# Changelog

## 3.2.0

### Minor Changes

- ec77db5: Add batch operations + change-tracking + improved 1C error parsing.

  **New tools (5):**

  - `batch_create_documents` — create N documents (1..100) in parallel with concurrency cap and per-item success/failure reporting.
  - `batch_update_catalog_items` — PATCH N catalog items by `Ref_Key` in parallel.
  - `batch_query` — run N OData GET queries (1..50) in parallel.
  - `poll_changes_since` — pull-mode change tracking using `$filter` on a date field; returns `next_cursor` for the next poll.
  - `list_subscriptions` — explicit no-op that documents the absence of native 1C webhooks and points the LLM at the polling tool.

  **Improved 1C error parsing** (`src/lib/errors.ts`):

  - Detects 10 common 1C error categories from Russian error messages: `object_not_found`, `field_required`, `type_mismatch`, `permission_denied`, `posting_failed`, `deletion_locked`, `invalid_guid`, `session_locked`, `validation_failed`, `unknown`.
  - Extracts messages from both JSON `odata.error` envelopes and XML Atom envelopes.
  - Enriches every error thrown by `oneCGet` / `oneCPost` / `oneCPatch` / `oneCDelete` with an English recovery suggestion that the LLM can act on.

  **Research notes:**

  - 1C OData does **not** support the `$batch` multipart endpoint — verified via [Infostart community](https://forum.infostart.ru/forum15/topic272942/). Batch ops are implemented as client-side parallel dispatch with concurrency cap.
  - 1C OData has **no** webhook or event-subscription mechanism. Only polling is possible. `list_subscriptions` is shipped as an explicit no-op to prevent LLMs from hallucinating subscribe flows.

  **Tests:** 32 → 62 (added 30 tests across 3 new files: `batch.test.ts`, `error-parsing.test.ts`, `change-tracking.test.ts`).

  **Backwards compatibility:** fully backward-compatible. All 9 existing tools, env vars, and module names unchanged. New modules (`batch`, `changes`) registered by default and filterable via `ONEC_SERVICES`.

- 9846fb0: Expand 1c-rest-mcp from 9 to 26 tools, driven by confirmed RU search demand (Wordstat ~40k/mo for «1С api» + 467/mo for «mcp сервер для 1с»). All new tools are optional modules, filterable via `ONEC_SERVICES`; the existing 9 tools are unchanged.

  - **documents**: `post_document`, `unpost_document` (OData bound actions Post/Unpost), `delete_document`
  - **catalogs**: `create_catalog_item`, `update_catalog_item` (CRUD parity with documents)
  - **registers**: `write_information_register`, `get_accumulation_balance` (virtual `Balance` method)
  - **accounting** (new module): `get_accounting_register`
  - **constants** (new module): `get_constant`, `set_constant`
  - **shortcuts** (new module): `find_by_description`, `get_by_key`, `count_entities`, `set_deletion_mark`, `get_recent_documents`
  - **meta**: `get_metadata` (raw EDMX), `describe_entity` (field list via sample record)

  Inherits core security hardening: tool output sanitization and the SSRF origin guard now protect `get_report`. Write/posting tools follow the 1C OData 3.0 spec and should be validated against a target configuration's `$metadata`.

- 3c1f791: Add `get_document_lines` — read a document's tabular section (строки / табличная часть, e.g. Товары, Услуги) by `Ref_Key` via OData `$expand`. Previously tabular rows were only reachable through a hand-written `$expand` in `odata_query`/`get_documents`. The tabular-section name is configuration-specific; discover it with `get_metadata` / `describe_entity`.
- 1754505: Add three MCP prompts — guided multi-tool workflows that ship with the package (no separate skill install), so any MCP client can invoke them:

  - `inventory-database` — map an unfamiliar 1C base (entities → counts → key fields).
  - `find-and-post-document` — find a document, show its fields and tabular lines, then post it **only after explicit human confirmation**.
  - `reconcile-balances` — reconcile accumulation-register остатки against the underlying movements and report discrepancies.

### Patch Changes

- 5363941: Harden OData input handling against `$filter`/path injection.

  - `get_document_by_number` now escapes single quotes in `number` (`escapeODataString`) so a quote can't break out of the OData string literal.
  - `buildKeyedPath` validates `Ref_Key` as a GUID and throws a clear error otherwise — making injection through the key impossible for every keyed operation (post/unpost/delete/update document, update catalog item, `get_by_key`, `set_deletion_mark`). `update_document` now routes through `buildKeyedPath` instead of hand-building the keyed path.
  - New shared zod field schemas (`refKeySchema`, `odataDate`, `odataDateTime`) validate Ref_Key/date inputs at the MCP boundary with actionable messages; applied to every `ref_key`, `get_document_by_number.date`, and `get_accumulation_balance.period`.
  - Centralised the single-quote escaping that was duplicated inline in `find_by_description` and `get_accumulation_balance`.

  Test coverage raised from 37 to 55 cases: all previously-untested handlers, the injection-escaping path, the GUID guard, and schema validation.

- c3d1203: Fix server-version drift, stale docs, and an incomplete-rebuild bug.

  - The version reported on the MCP handshake (`server.ts`) and on the `/health` endpoint (`index.ts`) had drifted apart (`3.1.0` vs a stale `2.0.0`); both now derive from a single `VERSION` constant so they can't desync again.
  - Updated the `index.ts` module docstring and the README header to reflect 26 tools across 9 modules (were stale at "9 tools").
  - `clean` script now also removes `tsconfig.tsbuildinfo`. With `composite: true`, the incremental build state lives outside `dist/`, so `rm -rf dist` alone left it stale and `tsc` would silently skip re-emitting unchanged tool files — producing a partial `dist/` (the cause of the `2.0.0`/`3.1.0` split in old builds). A clean build now emits all 9 tool modules.

- Updated dependencies [80fc973]
  - @theyahia/mcp-core@1.1.0

## 3.0.0

### Major Changes

- 54cb308: Production-grade rewrite (v3.0.0 line). Promoted from `pipeline/finance/` to `servers/` workspace. Now built on `@theyahia/mcp-core` (`BaseHttpClient` + `BasicAuthStrategy` + `runServer` dual transport).

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
