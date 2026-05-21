# Changelog

## 0.2.0 — 2026-05-20

WWmcp viral sprint Day 20/60 — Avito reaches production-grade 8-tool coverage.

### Added (5 new tools, total 8)

Messenger (full chat flow now possible):

- `send_message` — post a text message to a buyer (`POST /messenger/v1/accounts/{user_id}/chats/{chat_id}/messages`). Up to 1000 chars, `text/plain`.
- `get_chat_messages` — paginated chat history (`GET /messenger/v3/accounts/{user_id}/chats/{chat_id}/messages/`).
- `mark_chat_read` — clear unread badge after replying (`POST /messenger/v1/accounts/{user_id}/chats/{chat_id}/read`).

Stats + account:

- `get_items_stats` — views / unique views / contacts / favorites per item over a date window (`POST /stats/v1/accounts/{user_id}/items`). Batch up to 200 item_ids, period grouping day/week/month.
- `get_account_balance` — wallet balance, real + bonus rubles (`GET /core/v1/accounts/{user_id}/balance/`). Useful for alerts before promotion services expire.

### Changed

- `TOOL_COUNT` bumped 3 → 8.
- README rewritten with full 8-tool table, demo prompts for the new tools, and curl-equivalent snippets.
- 20+ new vitest cases in `tests/messenger.test.ts` covering happy path, explicit-vs-env user_id, URL encoding, auth errors, schema validation, and HTTP 4xx/5xx propagation.
- Two e2e example scripts added in `examples/`: `send_message.ts` and `check_balance.ts`.

### Not changed (backwards compatible)

- All v0.1.0 tools (`list_my_items`, `get_item_info`, `list_chats`) keep their signatures and endpoints.
- OAuth flow, transports, env vars (`AVITO_CLIENT_ID`, `AVITO_CLIENT_SECRET`, `AVITO_USER_ID`) unchanged.

## 0.1.0 — 2026-05-19

Initial release. Part of **WWmcp — Emerging Markets MCP** push (Track 7d, TOP-1 RU gap).

### Added

- 3 production tools:
  - `list_my_items` — list seller's own Avito listings with pagination + status/category filters (`GET /core/v1/items`)
  - `get_item_info` — full item details by `item_id` including status, services, and stats (`GET /core/v1/accounts/{user_id}/items/{item_id}/`)
  - `list_chats` — Avito Messenger v2 chats with pagination, unread filter, and per-item filter (`GET /messenger/v2/accounts/{user_id}/chats`)
- OAuth 2.0 Client Credentials auto-refresh against `https://api.avito.ru/token/` via `@theyahia/mcp-core` `OAuthStrategy`. Tokens last 24h; concurrent refreshes are deduplicated.
- Dual transport (stdio + Streamable HTTP) inherited from `@theyahia/mcp-core` `runServer`.
- `AVITO_USER_ID` env fallback so tools needing `user_id` in the URL path can be invoked without repeating it on every call.
- 13 unit tests across smoke / OAuth flow / tool handlers, all mocked (no live API calls).
