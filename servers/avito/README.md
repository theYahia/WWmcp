# @theyahia/avito-mcp

> MCP server for **Avito** — Russia's #1 classifieds platform (50M+ monthly active users).
> **3 tools** in v0.1.0: list your ads, get item details, browse messenger chats.
> OAuth 2.0 Client Credentials with auto-refresh. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/avito-mcp)](https://www.npmjs.com/package/@theyahia/avito-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of **[WWmcp — Emerging Markets MCP](https://github.com/theYahia/WWmcp)**, the MCP collection for non-Western APIs (33 countries). · Telegram: [@vhodvai](https://t.me/vhodvai)

---

## Tools (3)

| Tool | Description | Endpoint |
|------|-------------|----------|
| `list_my_items` | List seller's own Avito listings with pagination + status/category filters. | `GET /core/v1/items` |
| `get_item_info` | Get full item details by `item_id` (status, services applied, view/contact stats). | `GET /core/v1/accounts/{user_id}/items/{item_id}/` |
| `list_chats` | List Avito Messenger v2 chats with pagination, unread filter, and per-item filter. | `GET /messenger/v2/accounts/{user_id}/chats` |

**Roadmap (v0.2.0, Day 27–28):** `send_message`, `get_chat_messages`, `mark_chat_read`, `get_items_stats`, `get_account_balance`.

---

## Quick Start

### 1. Get OAuth credentials

1. Sign in to your Avito seller account.
2. Open the [API office](https://developers.avito.ru/) → **Создать приложение** (Create app).
3. Select grant type **`client_credentials`**. Avito access tokens last **24 hours** and are auto-refreshed by this server.
4. Copy `client_id` and `client_secret`.
5. (Optional) Note your numeric Avito `user_id` — set it as `AVITO_USER_ID` so you don't have to pass it on every tool call.

### 2. Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "avito": {
      "command": "npx",
      "args": ["-y", "@theyahia/avito-mcp"],
      "env": {
        "AVITO_CLIENT_ID": "your_client_id",
        "AVITO_CLIENT_SECRET": "your_client_secret",
        "AVITO_USER_ID": "12345678"
      }
    }
  }
}
```

### 3. Cursor / Windsurf / VS Code MCP

Same env vars. The package binary is `avito-mcp` (stdio by default; pass `--http` or set `HTTP_PORT` for the Streamable HTTP transport).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AVITO_CLIENT_ID` | yes | OAuth `client_id` from Avito API office |
| `AVITO_CLIENT_SECRET` | yes | OAuth `client_secret` from Avito API office |
| `AVITO_USER_ID` | optional | Default Avito numeric `user_id` for tools that need it in the URL path |
| `HTTP_PORT` | optional | If set, the server starts in Streamable HTTP mode instead of stdio |

---

## Demo Prompts

Prompts an LLM would actually send once this server is wired up:

> "Список всех моих активных объявлений на Avito с пагинацией, страница 1."
>
> Calls `list_my_items({ page: 1, per_page: 25, status: "active" })`.

> "Покажи мне детали по объявлению ID 4123456789 — статус, активные платные услуги, базовая статистика."
>
> Calls `get_item_info({ item_id: 4123456789 })`.

> "Сколько у меня непрочитанных чатов на Avito? Покажи первые 20."
>
> Calls `list_chats({ limit: 20, unread_only: true })`.

---

## Auth Flow

1. On first request, the server POSTs to `https://api.avito.ru/token/` with `grant_type=client_credentials`, `client_id`, `client_secret`.
2. Avito returns `{ access_token, expires_in: 86400, token_type: "Bearer" }`.
3. The token is cached in memory and reused for all subsequent API calls.
4. ~60 seconds before expiry (or on `invalidate()`), the token is auto-refreshed in the background.
5. Concurrent refreshes are deduplicated — multiple in-flight requests share one token fetch.

Implemented in [`@theyahia/mcp-core`](../../packages/core/src/auth/index.ts) `OAuthStrategy`.

---

## Development

```bash
# from monorepo root
pnpm install
pnpm -F @theyahia/avito-mcp build
pnpm -F @theyahia/avito-mcp test
pnpm -F @theyahia/avito-mcp dev    # tsx watch mode
```

Tests use mocked `fetch` — no live API calls in CI.

---

## License

MIT © [theYahia](https://github.com/theYahia)

---

## Why this exists

Avito is the **largest classifieds platform in Russia** by a wide margin: 50M+ monthly active users, billions of listings annually, used for everything from second-hand bikes to job posts to real estate. Yet until this package shipped, there was **no MCP server** for it — meaning every Avito seller using Claude / Cursor / Windsurf had to drop to manual API calls.

This is the **TOP-1 RU gap** in MCP coverage as identified by the [WWmcp gap analysis](https://github.com/theYahia/WWmcp) (score 19/20).
