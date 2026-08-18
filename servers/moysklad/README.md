# @theyahia/moysklad-mcp

MCP server for **MoySklad** (МойСклад) warehouse / ERP / CRM API. **60 tools** covering the full trade and warehouse lifecycle: products & catalog, stock, counterparties, customer & purchase orders, shipments, supplies, stock moves, inventory, write-offs/enters, returns, invoices, payments & cash, reports, audit log, and webhooks.

[![npm](https://img.shields.io/npm/v/@theyahia/moysklad-mcp)](https://www.npmjs.com/package/@theyahia/moysklad-mcp)
[![license](https://img.shields.io/npm/l/@theyahia/moysklad-mcp)](./LICENSE)

Part of **WWmcp** — a set of MCP servers for emerging markets — and the [russian-mcp](https://github.com/theYahia?tab=repositories&q=mcp) series.

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "moysklad": {
      "command": "npx",
      "args": ["-y", "@theyahia/moysklad-mcp"],
      "env": {
        "MOYSKLAD_TOKEN": "your-bearer-token"
      }
    }
  }
}
```

To use login/password instead of a token, replace the `env` block with:

```json
"env": { "MOYSKLAD_LOGIN": "you@example.com", "MOYSKLAD_PASSWORD": "your-password" }
```

### Claude Code

```bash
claude mcp add moysklad --env MOYSKLAD_TOKEN=your-bearer-token -- npx -y @theyahia/moysklad-mcp
```

### Cursor / Windsurf

Add to MCP settings:

```json
{
  "moysklad": {
    "command": "npx",
    "args": ["-y", "@theyahia/moysklad-mcp"],
    "env": { "MOYSKLAD_TOKEN": "your-bearer-token" }
  }
}
```

## Auth

| Variable                               | Description              |
| -------------------------------------- | ------------------------ |
| `MOYSKLAD_TOKEN`                       | Bearer token (preferred) |
| `MOYSKLAD_LOGIN` + `MOYSKLAD_PASSWORD` | HTTP Basic auth          |

Get a token in MoySklad: **Settings → Users → Access tokens** (`POST /security/token` also works with Basic auth). Generating a new token revokes the previous one.

**Required permissions:** the user/token needs access to the entities you intend to use. Read tools need view rights; create/update tools need edit rights for that document type. Webhooks and some reports require a paid MoySklad plan.

## Prices

The MoySklad API stores money in **kopecks** (1 ruble = 100 kopecks). This server converts automatically:

- **Input**: pass prices/amounts in **rubles** (e.g. `1500.50`)
- **Output**: prices/amounts are returned in **rubles**
- (The `get_dashboard` report is passed through verbatim, so its money values are still in kopecks.)

When a product carries a sale price, MoySklad requires a **price type**. The server attaches your account's default price type automatically (from `list_price_types`); pass `price_type_href` to choose a specific one.

## Tools (60)

### Products & catalog

| Tool                                                     | Description                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `search_products`                                        | Search products by name or article                          |
| `get_product`                                            | Get a product by UUID (`raw` for the full object)           |
| `create_product`                                         | Create a product (price type attached automatically)        |
| `update_prices`                                          | Update sale/buy/min prices                                  |
| `search_assortment`                                      | Unified search across products, variants, services, bundles |
| `list_price_types`                                       | List price types (first is the default)                     |
| `search_variants` / `search_bundles` / `search_services` | Search modifications / kits / services                      |
| `create_service`                                         | Create a service                                            |

### Stock

| Tool                 | Description                                   |
| -------------------- | --------------------------------------------- |
| `get_stock`          | Current stock (quantity, reserve, in-transit) |
| `get_stock_by_store` | Stock broken down by warehouse                |
| `get_stock_current`  | Fast current-stock snapshot                   |

### Counterparties

| Tool                  | Description                                  |
| --------------------- | -------------------------------------------- |
| `get_counterparties`  | Search by name, INN, or phone                |
| `get_counterparty`    | Get full details (`raw` for the full object) |
| `create_counterparty` | Create customer/supplier                     |

### Orders & shipments

| Tool                                                                                           | Description                                        |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `create_customer_order` / `get_orders` / `get_customer_order` / `update_customer_order_status` | Customer order lifecycle                           |
| `create_purchase_order` / `get_purchase_orders`                                                | Purchase orders to suppliers                       |
| `create_demand`                                                                                | Shipment (demand) linked to an order and warehouse |
| `create_supply`                                                                                | Incoming supply (purchase receipt)                 |
| `create_sales_return` / `create_purchase_return`                                               | Returns from customers / to suppliers              |

### Warehouse documents

| Tool                                   | Description                       |
| -------------------------------------- | --------------------------------- |
| `create_move` / `get_moves`            | Stock transfer between warehouses |
| `create_enter` / `get_enters`          | Stock enter (оприходование)       |
| `create_loss` / `get_losses`           | Write-off (списание)              |
| `create_inventory` / `get_inventories` | Inventory count (инвентаризация)  |

### Finance

| Tool                                                            | Description                       |
| --------------------------------------------------------------- | --------------------------------- |
| `create_payment_in` / `create_payment_out`                      | Incoming / outgoing bank payments |
| `create_cash_in` / `create_cash_out`                            | Cash receipt / expense orders     |
| `create_invoice_out` / `create_invoice_in` / `get_invoices_out` | Sales / supplier invoices         |

### Reports

| Tool                | Description                               |
| ------------------- | ----------------------------------------- |
| `get_profit_report` | Profit by product (revenue, cost, margin) |
| `get_sales_report`  | Sales by product (quantity, revenue)      |
| `get_dashboard`     | Day/week/month dashboard metrics          |
| `get_turnover`      | Product turnover over a period            |
| `get_money_report`  | Current money balances by account/cash    |

### Reference & audit

| Tool                                                          | Description                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `list_stores` / `list_organizations`                          | Warehouses / legal entities                                        |
| `list_employees` / `list_currencies` / `list_product_folders` | Reference data                                                     |
| `get_metadata`                                                | Entity metadata (states, attributes) — find order-state hrefs here |
| `get_audit` / `get_entity_audit`                              | Account event log / single-entity history                          |

### Webhooks & generic

| Tool                                                                     | Description                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `list_webhooks` / `create_webhook` / `update_webhook` / `delete_webhook` | Manage webhooks (CREATE/UPDATE/DELETE/PROCESSED)       |
| `get_documents` / `get_document`                                         | Generic list/get for any entity type not covered above |

## HTTP Transport

```bash
HTTP_PORT=3000 npx @theyahia/moysklad-mcp
# or
npx @theyahia/moysklad-mcp --http 3000
```

Endpoints: `POST /mcp` (JSON-RPC), `GET /health` (status). CORS is **off by default** — the HTTP endpoint acts on your MoySklad token, so set `MOYSKLAD_HTTP_CORS_ORIGIN` only if a trusted browser origin needs it.

## Configuration (env)

| Variable                               | Default | Description                                      |
| -------------------------------------- | ------- | ------------------------------------------------ |
| `MOYSKLAD_TOKEN`                       | —       | Bearer token                                     |
| `MOYSKLAD_LOGIN` / `MOYSKLAD_PASSWORD` | —       | Basic auth                                       |
| `MOYSKLAD_RATE_BUCKET`                 | `20`    | Requests allowed per 3-second window             |
| `MOYSKLAD_MAX_CONCURRENT`              | `5`     | Max parallel requests (MoySklad allows 5/user)   |
| `MOYSKLAD_HTTP_CORS_ORIGIN`            | —       | Allowed CORS origin for the HTTP transport       |
| `HTTP_PORT`                            | —       | Start the Streamable HTTP transport on this port |

## Rate Limiting

MoySklad uses a weight-per-3-seconds model (≈45 units for a solution token, fewer for login/password, and the `get_stock`/`get_stock_by_store` reports cost 5 units each). The built-in limiter is a token bucket charged by request weight, kept **conservative by default** (`MOYSKLAD_RATE_BUCKET=20`) because the API can temporarily disable access after repeated `429`s. It retries `429`/`5xx` with backoff, honoring MoySklad's `X-Lognex-Retry-After` header. Solution-token users can raise the bucket toward 45.

## Troubleshooting

| Symptom                      | Cause / fix                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Auth not configured`        | Set `MOYSKLAD_TOKEN` (or `MOYSKLAD_LOGIN` + `MOYSKLAD_PASSWORD`).                                                                                     |
| `auth error 401/403`         | Token invalid/expired or the user lacks rights for that entity. A new token revokes old ones.                                                         |
| `MoySklad HTTP 412 …`        | A required field is missing (e.g. an outgoing payment may need an expense item — pass `expense_item_href`). The error message includes the parameter. |
| Many `429` / slow            | Lower request volume or rely on the built-in limiter; raise `MOYSKLAD_RATE_BUCKET` only with a solution token.                                        |
| `HTTP 415`                   | The runtime isn't sending gzip — use Node ≥18 (its `fetch` handles gzip automatically).                                                               |
| Webhooks / some reports fail | Require a paid MoySklad plan.                                                                                                                         |

## E-commerce Stack

| Service  | MCP Server               | What it does                |
| -------- | ------------------------ | --------------------------- |
| MoySklad | `@theyahia/moysklad-mcp` | Warehouse, products, orders |
| CDEK     | `@theyahia/cdek-mcp`     | Delivery, tracking          |
| DaData   | `@theyahia/dadata-mcp`   | Address validation          |
| YooKassa | `@theyahia/yookassa-mcp` | Payments                    |

## Demo Prompts

> "Show me all products with low stock (less than 10 units) and their current prices"

> "Create a customer order for counterparty 'OOO Roga i Kopyta' with 50 units of 'Widget Pro' at 1500 rubles each, then create a shipment from the main warehouse"

> "Move 20 units of SKU LP15 from the main warehouse to the store, then pull the profit report for this month"

## Development

```bash
npm install        # installs deps + git hooks (husky)
npm run build      # tsc -> dist/
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest (requires Node >=20)
npm run coverage   # vitest with coverage
```

The published runtime supports **Node ≥18**; the test tooling requires **Node ≥20**.

## API Reference

Based on [MoySklad JSON API 1.2](https://dev.moysklad.ru/doc/api/remap/1.2/).

## License

MIT
