# Changelog

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

### Roadmap (v0.2.0, Day 27-28)

- `send_message` (`POST /messenger/v1/accounts/{user_id}/chats/{chat_id}/messages`)
- `get_chat_messages` (`GET /messenger/v2/accounts/{user_id}/chats/{chat_id}/messages`)
- `mark_chat_read` (`POST /messenger/v1/accounts/{user_id}/chats/{chat_id}/read`)
- `get_items_stats` (`POST /core/v1/accounts/{user_id}/stats/items`)
- `get_account_balance` (`GET /core/v1/accounts/{user_id}/balance/`)
