# iFood MCP — gerencie pedidos, loja e cardápio conversando com uma IA

Se você procurava como conectar sua loja do iFood a uma IA, aceitar e despachar pedidos conversando, abrir ou fechar a loja e ajustar o cardápio sem programar, é isto. São 26 ferramentas para pedidos, loja e catálogo, usadas a partir do Claude Desktop, Cursor ou qualquer cliente MCP.

Talks to the iFood **Merchant API** (`merchant-api.ifood.com.br`) using OAuth2 `client_credentials`. One shared, auto-refreshed token is used across all tools.

## Quick Start

```json
{
  "mcpServers": {
    "ifood": {
      "command": "npx",
      "args": ["-y", "@theyahia/ifood-mcp"],
      "env": {
        "IFOOD_CLIENT_ID": "<YOUR_IFOOD_CLIENT_ID>",
        "IFOOD_CLIENT_SECRET": "<YOUR_IFOOD_CLIENT_SECRET>"
      }
    }
  }
}
```

Get credentials from the [iFood Developer Portal](https://developer.ifood.com.br/) (create an application; this server uses the `client_credentials` grant, which reaches the merchants your application directly owns).

## Order workflow

iFood delivers orders as **events** you must poll and acknowledge:

1. `list_orders` — poll for new events (~every 30s). Returns events like `PLACED`, `CONFIRMED`, `CANCELLED`.
2. `acknowledge_events` — acknowledge the event IDs you received, or **iFood redelivers them on every poll forever**.
3. `get_order` — fetch full detail for an order ID from a `PLACED` event.
4. `confirm_order` → `start_preparation` (optional) → `dispatch_order` (delivery) **or** `ready_to_pickup` (takeout/dine-in).
5. To cancel: `get_cancellation_reasons` (get valid codes for that order) → `cancel_order` (with a code).

## Tools (26)

### Orders
| Tool | What it does |
|---|---|
| `list_orders` | Poll order events (PLACED/CONFIRMED/…). |
| `acknowledge_events` | Acknowledge events so they stop being redelivered. |
| `get_order` | Get full order detail by ID. |
| `confirm_order` | Confirm/accept an order. |
| `start_preparation` | Mark an order as in preparation (optional). |
| `ready_to_pickup` | Mark an order ready for pickup (required for takeout/dine-in). |
| `dispatch_order` | Mark a delivery order as dispatched. |
| `get_cancellation_reasons` | Get valid cancellation codes for an order. |
| `cancel_order` | Request cancellation using a code. |

### Merchant
| Tool | What it does |
|---|---|
| `list_merchants` | List accessible merchants (paginated). |
| `get_merchant` | Full merchant detail (name, address, operations). |
| `get_merchant_status` | Availability per operation/sales channel. |
| `get_opening_hours` | Read weekly opening hours. |
| `set_opening_hours` | Replace the entire weekly schedule. |
| `list_interruptions` | List active/future store pauses. |
| `create_interruption` | Temporarily pause the store (the correct pause mechanism). |
| `delete_interruption` | Resume the store. |

### Catalog (v2.0)
| Tool | What it does |
|---|---|
| `update_item_status` | Set an item AVAILABLE/UNAVAILABLE. |
| `update_item_price` | Update an item's price. |
| `update_option_status` | Set a complement/option AVAILABLE/UNAVAILABLE. |
| `update_option_price` | Update a complement/option price. |
| `list_catalogs` | List the merchant's catalogs. |
| `list_categories` | List categories (use `include_items` to get item IDs). |
| `list_items_by_category` | List items/products/options in a category. |
| `list_products` | List products (paginated). |
| `upsert_item` | Create or fully replace an item with its dependencies. |

To discover an `item_id` for the write tools: `list_merchants` → `list_catalogs` → `list_categories` (`include_items: true`).

Tools carry MCP [annotations](https://modelcontextprotocol.io/) (`readOnlyHint` / `destructiveHint` / `idempotentHint`) so clients can warn before write/destructive actions.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `IFOOD_CLIENT_ID` | Yes | — | OAuth client ID. |
| `IFOOD_CLIENT_SECRET` | Yes | — | OAuth client secret. |
| `IFOOD_BASE_URL` | No | `https://merchant-api.ifood.com.br` | Override the API base URL (staging/sandbox). |
| `IFOOD_TOKEN_URL` | No | `<base>/authentication/v1.0/oauth/token` | Override the token endpoint. |
| `IFOOD_TIMEOUT_MS` | No | `15000` | Per-request timeout in ms. |
| `IFOOD_MAX_ATTEMPTS` | No | `3` | Total attempts (initial + retries) for transient failures. |

The client automatically: retries `429`/`5xx`/network/timeout with exponential backoff (honoring `Retry-After`), refreshes the OAuth token once on a `401`, and tolerates the empty `202`/`204` bodies iFood returns for state transitions.

## Troubleshooting

- **401 / auth errors** — check `IFOOD_CLIENT_ID`/`IFOOD_CLIENT_SECRET`; the client re-auths once automatically on a mid-session 401.
- **Empty merchant list** — `client_credentials` only reaches merchants your application directly owns. The iFood *distribution* model (per-merchant `authorization_code` tokens) is not implemented here.
- **429 rate limit** — `list_orders` polling is limited to ~one request per 30s per token; the client backs off automatically.
- **`get_order` 404 right after PLACED** — order detail can lag the event; retry with backoff (up to ~10 min).

## ⚠️ Endpoints pending verification

iFood's developer portal blocks automated access, so two endpoints were implemented from best available (cross-source) evidence rather than a verbatim spec read. **Verify against the live iFood docs / Postman collection before depending on them in production** (see code comments in the relevant tool files):

- **`acknowledge_events`** — uses `POST /order/v1.0/events/acknowledgment`. The `events` path segment is a best-guess (the alternative is `/order/v1.0/acknowledgment`).
- **`cancel_order`** — sends `{ "reason": "<code>" }`. The exact order-module body is uncertain (a two-field `{ reason, cancellationCode }` shape may belong to the shipping module).

## Development

```bash
npm ci
npm run build      # tsc → dist/
npm test           # vitest
npm run dev        # tsx src/index.ts
```

## License

MIT

---

Telegram: [@vhodvai](https://t.me/vhodvai)
