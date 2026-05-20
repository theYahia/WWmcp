# @theyahia/avito-mcp

> MCP server for **Avito** — Russia's #1 classifieds platform (50M+ monthly active users).
> **8 tools** in v0.2.0: items + stats + full messenger flow + wallet balance.
> OAuth 2.0 Client Credentials with auto-refresh. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/avito-mcp)](https://www.npmjs.com/package/@theyahia/avito-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of **[WWmcp — Emerging Markets MCP](https://github.com/theYahia/mcp-servers)**, the MCP collection for non-Western APIs (33 countries).

---

## Tools (8)

### Items (3)

| Tool | Description | Endpoint |
|------|-------------|----------|
| `list_my_items` | List seller's own Avito listings with pagination + status/category filters. | `GET /core/v1/items` |
| `get_item_info` | Get full item details by `item_id` (status, services applied, view/contact stats). | `GET /core/v1/accounts/{user_id}/items/{item_id}/` |
| `get_items_stats` | Views / unique views / contacts / favorites for up to 200 items, day/week/month grouping. | `POST /stats/v1/accounts/{user_id}/items` |

### Messenger (4)

| Tool | Description | Endpoint |
|------|-------------|----------|
| `list_chats` | List Avito Messenger v2 chats with pagination, unread filter, and per-item filter. | `GET /messenger/v2/accounts/{user_id}/chats` |
| `get_chat_messages` | Paginated message history of a single chat (Messenger v3). | `GET /messenger/v3/accounts/{user_id}/chats/{chat_id}/messages/` |
| `send_message` | Post a plain-text message (≤1000 chars) to a chat. | `POST /messenger/v1/accounts/{user_id}/chats/{chat_id}/messages` |
| `mark_chat_read` | Clear the unread badge after replying. | `POST /messenger/v1/accounts/{user_id}/chats/{chat_id}/read` |

### Account (1)

| Tool | Description | Endpoint |
|------|-------------|----------|
| `get_account_balance` | Wallet balance: real rubles + bonus rubles. Useful for low-balance alerts. | `GET /core/v1/accounts/{user_id}/balance/` |

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

> "Покажи историю чата chat_abc — последние 50 сообщений."
>
> Calls `get_chat_messages({ chat_id: "chat_abc", limit: 50, offset: 0 })`.

> "Ответь покупателю в чате chat_abc: 'Здравствуйте! Велосипед ещё в продаже, готов показать сегодня после 18:00.'"
>
> Calls `send_message({ chat_id: "chat_abc", text: "..." })`.

> "Отметь чат chat_abc как прочитанный."
>
> Calls `mark_chat_read({ chat_id: "chat_abc" })`.

> "Статистика по моим топ-3 объявлениям за последние 7 дней — просмотры, контакты, добавления в избранное."
>
> Calls `get_items_stats({ item_ids: [1,2,3], date_from: "2026-05-13", date_to: "2026-05-20", fields: ["uniqViews","uniqContacts","uniqFavorites"], period_grouping: "day" })`.

> "Какой у меня баланс кошелька Avito? Хватит ли на продление продвижения?"
>
> Calls `get_account_balance({})`.

---

## curl Equivalents

For debugging or comparing with the raw API, here is what each tool wraps:

```bash
# Auth (the server does this for you; shown for completeness):
curl -X POST https://api.avito.ru/token/ \
  -d "grant_type=client_credentials&client_id=$CID&client_secret=$CSEC"

# 1. list_my_items
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.avito.ru/core/v1/items?page=1&per_page=25&status=active"

# 2. get_item_info
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.avito.ru/core/v1/accounts/$UID/items/$ITEM_ID/"

# 3. get_items_stats
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"dateFrom":"2026-05-13","dateTo":"2026-05-20","fields":["uniqViews","uniqContacts","uniqFavorites"],"itemIds":[1,2,3],"periodGrouping":"day"}' \
  "https://api.avito.ru/stats/v1/accounts/$UID/items"

# 4. list_chats
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.avito.ru/messenger/v2/accounts/$UID/chats?limit=20&offset=0&unread_only=true"

# 5. get_chat_messages
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.avito.ru/messenger/v3/accounts/$UID/chats/$CHAT_ID/messages/?limit=50&offset=0"

# 6. send_message
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"message":{"text":"Здравствуйте!"},"type":"text"}' \
  "https://api.avito.ru/messenger/v1/accounts/$UID/chats/$CHAT_ID/messages"

# 7. mark_chat_read
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{}' \
  "https://api.avito.ru/messenger/v1/accounts/$UID/chats/$CHAT_ID/read"

# 8. get_account_balance
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.avito.ru/core/v1/accounts/$UID/balance/"
```

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

End-to-end demo scripts (require real OAuth creds in env):

```bash
pnpm -F @theyahia/avito-mcp build
node servers/avito/dist/examples/send_message.js
node servers/avito/dist/examples/check_balance.js
```

---

## License

MIT © [theYahia](https://github.com/theYahia)

---

## Why this exists

Avito is the **largest classifieds platform in Russia** by a wide margin: 50M+ monthly active users, billions of listings annually, used for everything from second-hand bikes to job posts to real estate. Yet until this package shipped, there was **no MCP server** for it — meaning every Avito seller using Claude / Cursor / Windsurf had to drop to manual API calls.

This is the **TOP-1 RU gap** in MCP coverage as identified by the [WWmcp gap analysis](https://github.com/theYahia/mcp-servers) (score 19/20).
