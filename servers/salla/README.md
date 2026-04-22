# @theyahia/salla-mcp

> MCP server for **Salla** e-commerce platform (Saudi Arabia) — products, orders, customers, store.
> 9 tools. OAuth 2.0 Bearer auth. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/salla-mcp)](https://www.npmjs.com/package/@theyahia/salla-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### Migrating from v1.x

If you used v1.x, the v2.0.0 release adds Streamable HTTP transport and is built on `@theyahia/mcp-core`. Breaking changes:

- **Internal client class:** `SallaClient` now wraps `BaseHttpClient` with `ApiKeyStrategy`. The public `request(method, path, body?)` shape is unchanged, so tool code keeps working.
- **Lazy init:** `new SallaClient()` no longer throws when `SALLA_ACCESS_TOKEN` is missing — the env var is read on the first request. This unblocks tests that import the client without setting env vars.
- **Tool errors:** now returned as MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`).
- **HTTP transport:** previously stdio-only. v2 adds HTTP via `--http` flag or `HTTP_PORT` env.

Tool names, arguments, return formats, and `SALLA_ACCESS_TOKEN` env var are unchanged.

---

## Tools (9)

### Products

| Tool | Description |
|------|-------------|
| `list_products` | List products with pagination. Optional `status` filter (sale, out, hidden, deleted). |
| `get_product` | Get full product details by ID. |
| `create_product` | Create a new product (name, price, product_type, optional quantity/SKU/description). |
| `update_product` | Update name, price, quantity, or status. |

### Orders

| Tool | Description |
|------|-------------|
| `list_orders` | List orders with pagination. Optional `status` filter. |
| `get_order` | Get full order details (customer, items, totals). |
| `update_order_status` | Set order fulfillment status (completed, in_progress, under_review, cancelled, restoring, refunded). |

### Customers & Store

| Tool | Description |
|------|-------------|
| `list_customers` | List customers with pagination. |
| `get_store_info` | Get store information (name, currency, timezone, plan). |

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "salla": {
      "command": "npx",
      "args": ["-y", "@theyahia/salla-mcp"],
      "env": {
        "SALLA_ACCESS_TOKEN": "your_oauth_access_token"
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
    "salla": {
      "command": "npx",
      "args": ["-y", "@theyahia/salla-mcp"],
      "env": { "SALLA_ACCESS_TOKEN": "your_oauth_access_token" }
    }
  }
}
```

### Streamable HTTP transport

For remote/multi-tenant deployments:

```bash
HTTP_PORT=3000 SALLA_ACCESS_TOKEN=your_token npx @theyahia/salla-mcp
# or: npx @theyahia/salla-mcp --http
```

Endpoints:
- `POST /mcp` — MCP requests
- `GET /mcp` — SSE event stream (per session)
- `DELETE /mcp` — session termination
- `GET /health` — `{ status: "ok", version, tools, uptime, memory_mb }`

Includes session management (`mcp-session-id` header), CORS, graceful shutdown.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SALLA_ACCESS_TOKEN` | yes | OAuth 2.0 access token from Salla. |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

Salla uses OAuth 2.0:

1. Register an app at [Salla Partners](https://salla.partners/).
2. Complete the OAuth flow to get an access token (refresh tokens are NOT handled by this server — implement refresh externally and pass the active token).
3. Use the access token as `SALLA_ACCESS_TOKEN`.

Salla docs: https://docs.salla.dev/

---

## Demo Prompts

Try these natural-language prompts in your MCP client:

> "List all products on sale in my Salla store."

> "Show me the details of order #1001."

> "Create a new product called 'Premium Dates' for 150 SAR, type 'product', initial stock 100."

> "Mark order 1001 as completed."

> "How many customers do I have? Show the first 50."

> "Update product 42 — change the price to 199 SAR."

> "What's my store's currency and timezone?"

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/salla-mcp build
pnpm --filter @theyahia/salla-mcp test
pnpm --filter @theyahia/salla-mcp dev   # tsx watch mode
```

Project layout:

```
servers/salla/
├── src/
│   ├── index.ts          — bin entry, runServer
│   ├── server.ts         — createServer factory + tool registration
│   ├── client.ts         — SallaClient wrapping BaseHttpClient
│   ├── types.ts          — TypeScript types for Salla responses
│   └── tools/
│       ├── create-product.ts
│       ├── get-order.ts
│       ├── get-product.ts
│       ├── get-store-info.ts
│       ├── list-customers.ts
│       ├── list-orders.ts
│       ├── list-products.ts
│       ├── update-order-status.ts
│       └── update-product.ts
└── tests/
    ├── client.test.ts
    ├── server.test.ts
    └── tools.test.ts
```

---

## License

MIT — see [LICENSE](./LICENSE).
