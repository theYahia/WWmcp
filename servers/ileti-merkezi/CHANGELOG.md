# Changelog

## 4.0.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

## 4.0.0

Complete rewrite against the **real** İletiMerkezi v1 JSON API, ported from the standalone
`theYahia/ileti-merkezi-mcp` repo (npm `latest` since 2026-06-23) and adapted to
`@theyahia/mcp-core`. Every prior release — 1.0.x and 3.0.0 — targeted a fabricated API surface
(header-based SHA256 auth + REST paths `/send-sms`, `/send-bulk-sms`, `/contacts/...`) and did not
work against the live provider.

### ⚠️ Breaking

- **Authentication moved into the request body.** Credentials are sent as
  `request.authentication.{key, hash}`; the `X-API-Key` / `X-API-Hash` headers and all client-side
  hashing are gone — the `hash` is the value the panel precomputes, passed through unchanged.
- **Environment variables changed.** `ILETIMERKEZI_API_KEY` + `ILETIMERKEZI_API_HASH`.
  `ILETI_SECRET` no longer exists. `ILETI_API_KEY` / `ILETI_API_HASH` are accepted as aliases.
- **Tools removed** (no real endpoint): `send_bulk_sms`, `create_contact_group`, `add_contacts`.
  Bulk sending is `send_sms` with an array of numbers.
- **Tools renamed:** `list_senders` → `get_sender`, `get_sms_report` → `get_report`.
- `.claude/skills/contact-lists` deleted — it drove the two removed contact-group tools.

### Added

- 11 verified tools: `send_sms`, `cancel_order`, `get_report`, `get_reports`, `get_balance`,
  `get_sender`, `get_blacklist`, `add_blacklist`, `delete_blacklist`, `iys_register`, `iys_check`.
- **İYS compliance ergonomics:** `send_sms` exposes `message_type` (`transactional` |
  `commercial`) which drives the İYS consent flag, so callers don't reason about Law 6563 directly.
- İYS consent tools (`iys_register` / `iys_check`) for commercial-message consent.
- zod validation of every input (Turkish MSISDN, sender header length, date formats, batch caps),
  so obvious mistakes are caught before a billable call.
- Tool output pairs a readable summary (order id, balance, delivery counts, per-number status
  labels) with the raw JSON, and failures carry actionable guidance keyed off the API status code
  (401 → check credentials + "Allow API access", 450 → sender header not approved, …).
- `ILETIMERKEZI_SENDER` / `ILETI_SENDER` env fallback for the sender header.

### Changed

- Advertised server version is read from `package.json` (was a hardcoded `2.0.0` that had drifted).
- 4xx responses are no longer thrown away as transport errors: their bodies carry the
  İletiMerkezi status code, so the client returns them for the tool layer to interpret.
- `src/types.ts` deleted — it typed responses of the fabricated endpoints.

### Unchanged

- Built on `@theyahia/mcp-core`: `BaseHttpClient` (retry/timeout/logging), `withErrorHandling`
  (output sanitization + MCP-spec `isError`), `runServer` dual transport (stdio + Streamable HTTP).

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
