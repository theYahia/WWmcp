# @theyahia/wildberries-mcp

> MCP server for the **Wildberries** Seller API — **30 tools** across products, prices, stocks, orders, sales, FBS supplies, analytics, feedbacks, questions, returns, and ads. Per-category host routing with rate limiting and 409 penalty protection. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/wildberries-mcp)](https://www.npmjs.com/package/@theyahia/wildberries-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wildberries": {
      "command": "npx",
      "args": ["-y", "@theyahia/wildberries-mcp"],
      "env": { "WB_API_TOKEN": "your_seller_token" }
    }
  }
}
```

Cursor / Windsurf / VS Code (Copilot) use the same `mcpServers` block in their MCP settings.

### Streamable HTTP transport

```bash
HTTP_PORT=3000 WB_API_TOKEN=your_token npx @theyahia/wildberries-mcp
# or: npx @theyahia/wildberries-mcp --http
```

Endpoints: `POST /mcp`, `GET /mcp` (SSE), `DELETE /mcp` (session end), `GET /health`.

## Authentication & token scopes

`Authorization: Bearer {WB_API_TOKEN}` (JWT, 180-day validity). Get your token in the
[seller portal](https://seller.wildberries.ru/supplier-settings/access-to-api) under
**Settings → Access to API**.

A single token can carry multiple **category scopes**. Because each tool talks to a
different API host, a token missing a scope returns `401` from *that* host while other
tools keep working — enable the scopes you need:

| Scope | Powers tools |
|-------|--------------|
| Content | `list_products`, `get_product` |
| Prices & discounts | `update_prices` |
| Marketplace | `update_stocks`, `get_stocks`, `get_orders`, `get_new_orders`, `get_warehouses`, `get_supply`, `create_supply`, `add_orders_to_supply`, `deliver_supply`, `get_supply_barcode` |
| Statistics | `get_sales`, `get_incomes`, `get_fbw_stocks`, `get_statistics`, `get_abc_analysis` |
| Analytics | `get_funnel`, `get_paid_storage` |
| Tariffs (Common) | `get_commission`, `get_tariffs` |
| Feedbacks & questions | `get_feedbacks`, `reply_feedback`, `get_questions`, `reply_question` |
| Returns | `get_returns` |
| Advertising | `get_balance`, `list_campaigns`, `get_campaign_stats` |

Errors name the host and include WB's `requestId`, so a missing scope or wrong-host issue
is obvious (e.g. `WB API GET advert-api.wildberries.ru/adv/v1/balance → 401: ...`).

## Architecture — per-category hosts

The Wildberries Seller API is **not** a single gateway. `seller.wildberries.ru` is the web
cabinet; the API is split across category hosts and every request is routed to the right one:

| Category | Host |
|----------|------|
| Content | `content-api.wildberries.ru` |
| Prices & discounts | `discounts-prices-api.wildberries.ru` |
| Marketplace (FBS) | `marketplace-api.wildberries.ru` |
| Statistics | `statistics-api.wildberries.ru` |
| Analytics | `seller-analytics-api.wildberries.ru` |
| Common / Tariffs | `common-api.wildberries.ru` |
| Feedbacks & questions | `feedbacks-api.wildberries.ru` |
| Returns | `returns-api.wildberries.ru` |
| Advertising | `advert-api.wildberries.ru` |

## Tools (30)

### Products & content
| Tool | Method | Host · Endpoint |
|------|--------|-----------------|
| `list_products` | POST | content · `/content/v2/get/cards/list` |
| `get_product` | POST | content · `/content/v2/get/cards/detail` |
| `update_prices` | POST | prices · `/api/v2/upload/task` |
| `update_stocks` | PUT | marketplace · `/api/v3/stocks/{warehouseId}` |
| `get_stocks` | POST | marketplace · `/api/v3/stocks/{warehouseId}` |

### Orders & sales
| Tool | Method | Host · Endpoint |
|------|--------|-----------------|
| `get_orders` | GET | marketplace · `/api/v3/orders` |
| `get_new_orders` | GET | marketplace · `/api/v3/orders/new` |
| `get_sales` | GET | statistics · `/api/v1/supplier/sales` |
| `get_incomes` | GET | statistics · `/api/v1/supplier/incomes` |
| `get_fbw_stocks` | GET | statistics · `/api/v1/supplier/stocks` |

### Warehouses & FBS supplies
| Tool | Method | Host · Endpoint |
|------|--------|-----------------|
| `get_warehouses` | GET | marketplace · `/api/v3/offices` |
| `get_supply` | GET | marketplace · `/api/v3/supplies` |
| `create_supply` | POST | marketplace · `/api/v3/supplies` |
| `add_orders_to_supply` | PATCH | marketplace · `/api/v3/supplies/{id}/orders/{orderId}` |
| `deliver_supply` | PATCH | marketplace · `/api/v3/supplies/{id}/deliver` |
| `get_supply_barcode` | GET | marketplace · `/api/v3/supplies/{id}/barcode` |

### Analytics
| Tool | Method | Host · Endpoint |
|------|--------|-----------------|
| `get_statistics` | GET | statistics · `/api/v5/supplier/reportDetailByPeriod` |
| `get_abc_analysis` | GET | statistics · `reportDetailByPeriod` (computed Pareto) |
| `get_funnel` | POST | analytics · `/api/v2/nm-report/detail` |
| `get_paid_storage` | GET | analytics · `/api/v1/paid_storage` (async report) |

### Pricing reference
| Tool | Method | Host · Endpoint |
|------|--------|-----------------|
| `get_commission` | GET | common · `/api/v1/tariffs/commission` |
| `get_tariffs` | GET | common · `/api/v1/tariffs/box` |

### Feedbacks & questions
| Tool | Method | Host · Endpoint |
|------|--------|-----------------|
| `get_feedbacks` | GET | feedbacks · `/api/v1/feedbacks` |
| `reply_feedback` | PATCH | feedbacks · `/api/v1/feedbacks` |
| `get_questions` | GET | feedbacks · `/api/v1/questions` |
| `reply_question` | PATCH | feedbacks · `/api/v1/questions` |

### Returns & ads
| Tool | Method | Host · Endpoint |
|------|--------|-----------------|
| `get_returns` | GET | returns · `/api/v1/claims` |
| `get_balance` | GET | advert · `/adv/v1/balance` |
| `list_campaigns` | GET | advert · `/adv/v1/promotion/count` |
| `get_campaign_stats` | POST | advert · `/adv/v2/fullstats` |

## Rate limiting

Wildberries meters requests **per API category**, not as one global pool — and returns
`409` as a penalty for bursts. The client keeps one token-bucket limiter **per host** plus
finer buckets for the strictest endpoints (paid-storage create/download 1/min, status 1/5s;
prices ~10/6s). 409 penalties (via `X-Ratelimit-Retry-After` / `X-Ratelimit-Remaining`)
stay isolated to the offending category. The defaults are conservative and safe to raise
after observing your account's real limits.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WB_API_TOKEN` | yes | Wildberries Seller API token (JWT). |
| `WB_TIMEOUT_MS` | no | Per-request timeout in ms (default 30000). |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

## Demo prompts

> "List the first 50 products in my catalog with current prices."
> "Run an ABC analysis for the last 30 days — which products make 80% of revenue?"
> "Create an FBS supply 'Morning 2026-06-23', attach orders 1001 and 1002, close it for delivery and get its barcode."
> "Show unanswered questions and draft a reply to the first one."
> "What's my advertising balance and which campaigns are active?"

## Development

```bash
pnpm install
pnpm --filter @theyahia/wildberries-mcp build
pnpm --filter @theyahia/wildberries-mcp test
pnpm --filter @theyahia/wildberries-mcp dev   # tsx watch mode
```

Project layout (`servers/wildberries/`):

```
src/
  index.ts         — bin entry (runServer), env validation
  server.ts        — createServer factory (WBClient injection) + JSON Schema → Zod
  client.ts        — per-host WBClient (timeout, error parsing, async poll)
  rate-limiter.ts  — RateLimiter (token bucket + 409 penalty) + RateLimiterPool
  tools.ts         — 30 tool definitions (JSON Schema) + handleTool dispatcher
tests/
  client.test.ts       — host routing, timeout, error parsing, 409 retry
  rate-limiter.test.ts — limiter + pool isolation
  server.test.ts       — registration + tools/list & tools/call round-trip
  tools.test.ts        — per-tool host assertions
```

## License

MIT
