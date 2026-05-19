---
"@theyahia/avito-mcp": minor
---

Initial Avito MCP server v0.1.0 — 3 tools (list_my_items, get_item_info, list_chats) + OAuth 2.0 Client Credentials client + smoke tests

- New `servers/avito/` workspace: `@theyahia/avito-mcp` — MCP server for Avito, Russia's #1 classifieds platform (50M+ MAU). Ships the TOP-1 RU gap identified by the WWmcp gap analysis (score 19/20).
- 3 tools (v0.1.0; 5 more in v0.2.0 roadmap):
  - `list_my_items` — paginate seller's own listings (`GET /core/v1/items`) with optional `status` (active/old/blocked/rejected/removed) and `category` filters.
  - `get_item_info` — full item details (`GET /core/v1/accounts/{user_id}/items/{item_id}/`) including status, services applied, and stats. Falls back to `AVITO_USER_ID` env when caller omits `user_id`.
  - `list_chats` — Avito Messenger v2 chats (`GET /messenger/v2/accounts/{user_id}/chats`) with pagination, `unread_only` filter, and `item_ids` filter.
- Auth: OAuth 2.0 Client Credentials via `@theyahia/mcp-core` `OAuthStrategy`. Token endpoint `https://api.avito.ru/token/`, 24h token life, auto-refresh + concurrent-request deduplication. Env vars: `AVITO_CLIENT_ID` + `AVITO_CLIENT_SECRET` (required), `AVITO_USER_ID` (optional default).
- Dual transport (stdio + Streamable HTTP) inherited from `runServer`.
- 13 unit tests: server smoke + OAuth flow (token request, Bearer header propagation, token caching, resolveUserId precedence) + per-tool path/query assertions. All mocked, no live API.
- Smithery.yaml + README with Quick Start, demo prompts, and auth flow diagram. Sources verified against the `covox/avito_api` OpenAPI spec on GitHub.
