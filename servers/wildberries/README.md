# @theyahia/wildberries-mcp

> MCP server for **Wildberries** Seller API — products, prices, stocks, orders, sales, supplies, FBS pickups, feedbacks, ABC analysis, sales velocity, returns analytics, competitor price intelligence, and polling-based order/stock subscriptions.
> 25 tools. Production-grade rate limiting (300 req/min + 409 penalty protection). Stdio + Streamable HTTP transports.
>
> Part of the **[WWmcp](https://github.com/theYahia/mcp-servers)** monorepo — MCP servers for Russian, CIS, and global APIs.

[![npm](https://img.shields.io/npm/v/@theyahia/wildberries-mcp)](https://www.npmjs.com/package/@theyahia/wildberries-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### What's new in v1.1.0 (minor, backward-compatible)

- **Modular refactor:** `src/tools.ts` split into `src/tools/{products,stock,orders,seller-account,analytics,webhooks}.ts`. All v1.0 tool names, signatures, and return formats are preserved.
- **New analytics:** `get_sales_velocity`, `get_competitor_prices`, `get_returns_stats`.
- **New seller-account tools:** `get_warehouse_list`, `get_commission_rates`.
- **Polling pseudo-webhooks:** `subscribe_to_orders`, `subscribe_to_stock_changes`, `list_subscriptions`, `unsubscribe`, `check_subscriptions`. Wildberries does not push webhooks, so this gives MCP clients a workflow-friendly polling primitive.
- **More tests:** rate-limiter happy-path + exhaustion-and-recover, analytics & webhooks coverage, refactor smoke test.

### Migrating from v1.x

- **HTTP transport env var renamed:** `PORT=3000` → `HTTP_PORT=3000`.
- **HTTP transport replaced:** v1 had a hand-rolled `http.createServer` block. v2 uses `@theyahia/mcp-core`'s `runServer`.
- Tool names, arguments, return formats, the `WB_API_TOKEN` env var, the `WBClient` class, and the `RateLimiter` (with 409 penalty handling) are all unchanged.

---

## Tools (25)

### Products & content

| Tool | Description |
|------|-------------|
| `list_products` | List seller product cards with pagination, optional text search. |
| `get_product` | Get detailed info for product cards by `nmIDs`. |
| `update_prices` | Bulk update product prices. |

### Stock

| Tool | Description |
|------|-------------|
| `update_stocks` | Update stock quantities by SKU at a warehouse. |
| `get_stocks` | Get current stock levels for a warehouse (optionally filtered by SKU). |

### Orders, sales & supplies

| Tool | Description |
|------|-------------|
| `get_orders` | List orders with filters (limit, dateFrom, dateTo, pagination). |
| `get_new_orders` | Get new (unprocessed) orders. |
| `get_sales` | Sales report for a date range. |
| `get_supply` | List FBS supplies. |
| `create_supply` | Create a new FBS supply (with name). |
| `get_feedbacks` | Get customer feedbacks (reviews). |
| `reply_feedback` | Reply to a customer review. |

### Seller account

| Tool | Description |
|------|-------------|
| `get_warehouses` | List WB pickup offices (FBS, `/api/v3/offices`). |
| `get_warehouse_list` | List seller's own warehouses (`/api/v1/warehouses`). |
| `get_commission_rates` | Commission % per category — useful for unit economics. |

### Analytics

| Tool | Description |
|------|-------------|
| `get_statistics` | Detailed sales statistics report by period. |
| `get_abc_analysis` | ABC product classification by revenue (A: 80%, B: 95%, C: rest). |
| `get_sales_velocity` | Avg units sold per day for an nm_id over N days (default 30, max 90). |
| `get_competitor_prices` | Public WB catalog scrape — competitor name, price, brand, rating, feedbacks. No auth, no token consumed. |
| `get_returns_stats` | Return rate stats for a period, top returned SKUs. |

### Polling subscriptions (pseudo-webhooks)

> ⚠️ Wildberries does NOT push webhooks. These tools register in-memory subscriptions that the agent polls on demand via `check_subscriptions`. Lost on process restart.

| Tool | Description |
|------|-------------|
| `subscribe_to_orders` | Register an orders polling subscription. |
| `subscribe_to_stock_changes` | Register a stock-diff subscription for a warehouse. |
| `list_subscriptions` | List active subscriptions in this session. |
| `unsubscribe` | Remove a subscription by ID. |
| `check_subscriptions` | Poll subscriptions and return events since the last check. |

---

## Use case: AI seller analytics in one prompt

Combine new v1.1.0 tools with classic ones:

> "For my Wildberries store: 1) run ABC analysis for the past 60 days, 2) compute sales velocity per top-5 A-class SKU, 3) for each A-class SKU fetch competitor prices in its category and tell me where I'm priced too high or too low, 4) flag any SKU with return rate above 5%."

The agent calls `get_abc_analysis` → `get_sales_velocity` (per nm_id) → `get_competitor_prices` (per category) → `get_returns_stats`, and synthesises a one-page pricing & inventory report — fully autonomous, no manual spreadsheet work.

Another:

> "Subscribe to new orders, then every minute call check_subscriptions and notify me of any new order placed."

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wildberries": {
      "command": "npx",
      "args": ["-y", "@theyahia/wildberries-mcp"],
      "env": {
        "WB_API_TOKEN": "your_seller_token"
      }
    }
  }
}
```

### Cursor / Windsurf

Same configuration block under `mcpServers` in the IDE's MCP settings.

### VS Code (Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "wildberries": {
      "command": "npx",
      "args": ["-y", "@theyahia/wildberries-mcp"],
      "env": { "WB_API_TOKEN": "your_seller_token" }
    }
  }
}
```

### Streamable HTTP transport

```bash
HTTP_PORT=3000 WB_API_TOKEN=your_token npx @theyahia/wildberries-mcp
# or: npx @theyahia/wildberries-mcp --http
```

Endpoints:
- `POST /mcp` — MCP requests
- `GET /mcp` — SSE event stream (per session)
- `DELETE /mcp` — session termination
- `GET /health` — `{ status: "ok", version, tools, uptime, memory_mb }`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WB_API_TOKEN` | yes | Wildberries Seller API token. |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

1. Log in to your [Wildberries Seller portal](https://seller.wildberries.ru).
2. Go to **Settings → Access to API**.
3. Generate a new token with the scopes you need (Content, Marketplace, Statistics, Analytics, Feedbacks).
4. Use the token as `WB_API_TOKEN`.

> `get_competitor_prices` hits the public catalog and does **not** send your token.

---

## Rate Limiting

Wildberries enforces strict rate limits. This server includes a production-grade rate limiter:

- **Token bucket:** 300 requests per minute, refilled smoothly.
- **Minimum interval:** 200ms between any two requests.
- **409 penalty handling:** when WB returns HTTP 409 (penalty), the server reads `X-Ratelimit-Retry-After`, deducts the penalty tokens, and waits the indicated duration before retrying. This prevents amplifying penalties through naive retries.

You don't need to configure anything — the limiter is always active.

---

## Demo Prompts

> "List the first 50 products in my Wildberries catalog with their current prices."

> "Update the price of nmID 12345678 to 1990 rubles."

> "Show me all orders from the last 7 days."

> "Run an ABC analysis for the past 30 days — which products account for 80% of revenue?"

> "For nmID 12345678, what's the sales velocity over the past 14 days?"

> "Find me top 20 competitor products for 'умная колонка' and tell me the median price."

> "What's my return rate this month and which SKUs return most?"

> "Subscribe me to new orders, then poll every 60 seconds."

> "Create a new FBS supply called 'Morning shipment 2026-04-22'."

> "Reply to feedback xyz123 with: 'Thank you for your review! We're glad you enjoyed the product.'"

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/wildberries-mcp build
pnpm --filter @theyahia/wildberries-mcp test
pnpm --filter @theyahia/wildberries-mcp dev   # tsx watch mode
```

Project layout (post-v1.1.0):

```
servers/wildberries/
├── src/
│   ├── index.ts                 — bin entry, runServer, env validation
│   ├── server.ts                — createServer factory (accepts WBClient injection)
│   ├── client.ts                — WBClient with rate-limited HTTP + 409 penalty handling
│   ├── rate-limiter.ts          — production-grade RateLimiter (token bucket + penalty)
│   ├── tools.ts                 — backward-compat re-export of tools/index.ts
│   └── tools/
│       ├── index.ts             — aggregates & dispatches across modules
│       ├── products.ts          — list/get/update_prices
│       ├── stock.ts             — get/update_stocks
│       ├── orders.ts            — orders, sales, supplies, feedbacks
│       ├── seller-account.ts    — warehouses, commission rates
│       ├── analytics.ts         — statistics, ABC, velocity, competitor prices, returns
│       └── webhooks.ts          — polling pseudo-subscriptions
└── tests/
    ├── client.test.ts           — HTTP behavior + 409 retry
    ├── rate-limiter.test.ts     — limiter edge cases + happy/failure paths
    ├── server.test.ts           — createServer smoke
    ├── tools.test.ts            — handler dispatch per tool
    ├── analytics.test.ts        — sales velocity, returns, competitor prices
    ├── webhooks.test.ts         — subscribe/list/unsubscribe round-trip
    └── refactor-smoke.test.ts   — modular split integrity
```

---

## License

MIT — see [LICENSE](./LICENSE).
