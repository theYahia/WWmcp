# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0]

> Versioned 4.0.0 to supersede the npm `latest` 3.0.0 (an earlier 8-tool build
> that was never reflected in this repo). This is the first release of the v3
> correctness/hardening overhaul on npm.

This release fixes a series of API v3 correctness bugs (the previous request
shapes did not match the real Megaplan v3 API), closes critical HTTP-mode
security holes, expands the tool surface, and hardens the client. It is a
**breaking** release: request/response shapes changed and `--http` now requires
a token.

### ⚠️ Breaking

- **List filtering & pagination rewritten.** v3 list endpoints use a nested
  `*Filter` JSON object and a `pageAfter` cursor — not `filter[field]=value`
  query params or `offset`. Tool params changed: `filter_status` now takes status
  **code(s)** (e.g. `["filter_any"]`), and `offset` is replaced by `page_after`
  (a cursor id).
- **Comments fixed.** Endpoint is now the plural `/{entity}/{id}/comments`; the
  `create_comment` text field is `content` (was `text`).
- **`create_task` deadline** is now sent as a `DateTime` object, not a bare string.
- **`create_deal`** now sends `program` as a `Program` ref (was `DealProgram`),
  money as a `Money` object on the `price` field (was a bare number on `cost`),
  and `contact` as `ContractorHuman`/`ContractorCompany` (was `Contractor`) — see
  the new `contact_type` param.
- **HTTP mode requires `MCP_HTTP_TOKEN`** and binds to `127.0.0.1` by default.
- Tool output is now a **compact summary** by default; pass `raw: true` for the
  raw API JSON.

### Added

- Tools: `get_task`, `get_deal`, `get_project` (get-by-id); `update_task`,
  `update_deal`; `get_deal_programs`, `get_deal_program`; `list_clients`,
  `get_client`; `get_current_user` (experimental).
- `get_deal_programs` makes `create_deal` usable: it's how you discover the
  required `program_id`.
- A compact, LLM-friendly output formatter for every tool (with a `raw` escape hatch).
- HTTP security: bearer auth, loopback bind, DNS-rebinding protection, request
  body-size limit, idle-session eviction.
- Client robustness: single in-flight auth (no thundering herd), correct 401
  re-auth, auth timeout, retries on transient network errors, `Retry-After`
  support, safe JSON parsing, `MEGAPLAN_DOMAIN` validation.
- ESLint, a `typecheck` script (covering tests too), a CI matrix on Node 18/20/22,
  and this changelog.

### Fixed

- `my-tasks-today` prompt now scopes to the current user (via `get_current_user`)
  instead of returning everyone's tasks.
- `create-deal-wizard` prompt now lists pipelines via `get_deal_programs`.
- `vitest` and `@types/express` moved to `devDependencies` (they were shipped to
  consumers).

### Notes

A few items are implemented from official docs/SDKs but could not be confirmed
against a live account (auth body encoding, the search param name, the
current-user endpoint, the task status-change field shape). They are marked
`TODO(live-verify)` in the source and noted as experimental. See the README.

## [3.0.0]

- Published to npm 2026-05-03 as a version bump of the 8-tool v1 codebase; this
  release was never reflected in the repository's git history. Superseded by 4.0.0.

## [1.1.0]

- Initial published surface: 8 tools (tasks, deals, projects, employees,
  comments), 2 prompts, stdio + Streamable HTTP transports.
