# Changelog

## 0.2.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

## 0.2.0

### Minor Changes

- 1d702b1: Initial Avito MCP server v0.1.0 — 3 tools (list_my_items, get_item_info, list_chats) + OAuth 2.0 Client Credentials client + smoke tests

  - New `servers/avito/` workspace: `@theyahia/avito-mcp` — MCP server for Avito, Russia's #1 classifieds platform (50M+ MAU). Ships the TOP-1 RU gap identified by the WWmcp gap analysis (score 19/20).
  - 3 tools (v0.1.0; 5 more in v0.2.0 roadmap):
    - `list_my_items` — paginate seller's own listings (`GET /core/v1/items`) with optional `status` (active/old/blocked/rejected/removed) and `category` filters.
    - `get_item_info` — full item details (`GET /core/v1/accounts/{user_id}/items/{item_id}/`) including status, services applied, and stats. Falls back to `AVITO_USER_ID` env when caller omits `user_id`.
    - `list_chats` — Avito Messenger v2 chats (`GET /messenger/v2/accounts/{user_id}/chats`) with pagination, `unread_only` filter, and `item_ids` filter.
  - Auth: OAuth 2.0 Client Credentials via `@theyahia/mcp-core` `OAuthStrategy`. Token endpoint `https://api.avito.ru/token/`, 24h token life, auto-refresh + concurrent-request deduplication. Env vars: `AVITO_CLIENT_ID` + `AVITO_CLIENT_SECRET` (required), `AVITO_USER_ID` (optional default).
  - Dual transport (stdio + Streamable HTTP) inherited from `runServer`.
  - 13 unit tests: server smoke + OAuth flow (token request, Bearer header propagation, token caching, resolveUserId precedence) + per-tool path/query assertions. All mocked, no live API.
  - Smithery.yaml + README with Quick Start, demo prompts, and auth flow diagram. Sources verified against the `covox/avito_api` OpenAPI spec on GitHub.

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
