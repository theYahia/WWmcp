# @theyahia/wildberries-mcp

> MCP server for **Wildberries** Seller API — products, prices, stocks, orders, sales, supplies, FBS pickups, feedbacks, ABC analysis.
> 15 tools. Production-grade rate limiting (300 req/min + 409 penalty protection). Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/wildberries-mcp)](https://www.npmjs.com/package/@theyahia/wildberries-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### Migrating from v1.x

If you starred or used v1.x, the v2.0.0 release introduces a few breaking changes:

- **HTTP transport env var renamed:** `PORT=3000` → `HTTP_PORT=3000`.
- **HTTP transport replaced:** v1 had a hand-rolled `http.createServer` block. v2 uses `@theyahia/mcp-core`'s `runServer`, which adds session management (`mcp-session-id`), CORS, graceful shutdown, and a richer `/health` endpoint. Same `--http` flag still works.
- **Server entry refactored:** `src/server.ts` (factory) split out from `src/index.ts` (bin entry) for testability.

Tool names, arguments, return formats, the `WB_API_TOKEN` env var, the `WBClient` class, and the `RateLimiter` (with 409 penalty handling) are all unchanged.

---

## Tools (14)

### Products & content

| Tool | Description |
|------|-------------|
| `list_products` | List seller product cards with pagination, optional text search. |
| `get_product` | Get detailed info for product cards by `nmIDs`. |
| `update_prices` | Bulk update product prices. |
| `update_stocks` | Bulk update stock quantities by `nmID`. |

### Orders & sales

| Tool | Description |
|------|-------------|
| `list_orders` | List orders for a date range. |
| `list_sales` | List sales for a date range (paid / completed). |
| `get_order_status` | Get status for one or more orders. |

### FBS supplies & pickups

| Tool | Description |
|------|-------------|
| `list_supplies` | List FBS supplies. |
| `create_supply` | Create a new FBS supply (with name). |
| `add_orders_to_supply` | Attach orders to an FBS supply. |
| `get_supply_barcode` | Get the barcode for an FBS supply (PDF/PNG). |

### Analytics & feedback

| Tool | Description |
|------|-------------|
| `get_sales_report` | Detailed sales report for a date range with realization details. |
| `get_abc_analysis` | ABC product classification by revenue (A: 80%, B: 95%, C: rest). |
| `reply_feedback` | Reply to a customer feedback. |

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

---

## Rate Limiting

Wildberries enforces strict rate limits. This server includes a production-grade rate limiter:

- **Token bucket:** 300 requests per minute, refilled smoothly.
- **Minimum interval:** 200ms between any two requests.
- **409 penalty handling:** when WB returns HTTP 409 (penalty), the server reads `X-Ratelimit-Retry-After`, deducts the penalty tokens, and waits the indicated duration before retrying. This prevents amplifying penalties through naive retries.

You don't need to configure anything — the limiter is always active.

---

## Demo Prompts

Try these natural-language prompts in your MCP client:

> "List the first 50 products in my Wildberries catalog with their current prices."

> "Update the price of nmID 12345678 to 1990 rubles."

> "Show me all orders from the last 7 days."

> "Run an ABC analysis for the past 30 days — which products account for 80% of revenue?"

> "Create a new FBS supply called 'Morning shipment 2026-04-22' and attach orders 1001, 1002, 1003 to it."

> "Get the barcode for FBS supply WB-GI-12345 in PDF format."

> "Reply to feedback xyz123 with: 'Thank you for your review! We're glad you enjoyed the product.'"

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/wildberries-mcp build
pnpm --filter @theyahia/wildberries-mcp test
pnpm --filter @theyahia/wildberries-mcp dev   # tsx watch mode
```

Project layout:

```
servers/wildberries/
├── src/
│   ├── index.ts         — bin entry, runServer, env validation
│   ├── server.ts        — createServer factory (accepts WBClient injection for tests)
│   ├── client.ts        — WBClient with rate-limited HTTP requests + 409 penalty handling
│   ├── rate-limiter.ts  — production-grade RateLimiter (token bucket + penalty)
│   └── tools.ts         — 14 tool definitions (JSON Schema) + handleTool dispatcher
└── tests/
    ├── client.test.ts       — HTTP request behavior + 409 retry
    ├── rate-limiter.test.ts — rate limiter edge cases
    ├── server.test.ts       — createServer factory smoke
    └── tools.test.ts        — handleTool dispatcher per tool
```

---

## License

MIT — see [LICENSE](./LICENSE).
