# @theyahia/moysklad-mcp

> MCP server for **MoySklad** (Моё Дело) ERP/inventory REST API — products, stock,
> orders, counterparties, supplies, profit reports + **batch operations**.
> 15 tools. Token-bucket rate limiting (45 req/3s). Dual auth: Bearer token or
> Basic login/password. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/moysklad-mcp)](https://www.npmjs.com/package/@theyahia/moysklad-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why this MCP

**AI agent for MoySklad.** Drive a Russian ERP system from natural language —
"проверь остатки молочки в обоих складах и пополни B из A", "закрой месяц по
прибыли", "переведи все новые заказы в подтверждённые" — and let the agent
issue the right batch of API calls. The 5 batch tools collapse what used to be
50-100 single-entity calls into one parallel-fanned-out invocation, with
per-item failure reporting so the agent can retry only the subset that failed.

Common use cases:

- **Daily order fulfillment** — pick `Новый` orders, surface a summary,
  batch-transition the approved subset.
- **Cross-warehouse replenishment** — diff stock between two stores, fire a
  batch of customer orders for the deltas.
- **Monthly P&L close** — pull profit-by-product + paginated orders, aggregate
  in-memory, surface a per-counterparty table.
- **Catalog bulk operations** — bulk re-price 100 SKUs, bulk update product
  metadata, bulk-create supplier counterparties from a CRM export.

See [`examples/`](./examples/) for full recipes.

---

## Tools (15)

### Catalog (4)

| Tool | Description |
|------|-------------|
| `search_products` | Search products by name or article/SKU. Paginated up to 1000/page. |
| `get_product` | Get a single product by UUID with prices in rubles. |
| `create_product` | Create a product. Prices accepted in rubles, converted to kopecks internally. |
| `update_prices` | Update sale/buy/min prices for one product. Preserves `priceType` meta. |

### Inventory (1)

| Tool | Description |
|------|-------------|
| `get_stock` | Stock/inventory report. Group by product/variant/store, filter by stock level. |

### Sales (2)

| Tool | Description |
|------|-------------|
| `create_customer_order` | Create one customer order with line items. |
| `get_orders` | List orders with state/agent filters and sorting. |

### Counterparties (1)

| Tool | Description |
|------|-------------|
| `get_counterparties` | Search customers/suppliers by name or INN. |

### Purchasing (1)

| Tool | Description |
|------|-------------|
| `create_supply` | Create an incoming supply (purchase receipt). |

### Reports (1)

| Tool | Description |
|------|-------------|
| `get_profit_report` | Profit by product with date range. All sums in rubles. |

### Batch operations (5, new in v3.1.0)

| Tool | Description |
|------|-------------|
| `batch_update_products` | Update up to 100 products in parallel. Each item patches a subset of name/article/description/code/weight/volume/vat. Returns per-item ok/error envelope with `failed_indexes` ready for retry. |
| `batch_set_prices` | Update sale/buy/min prices for up to 100 products in parallel. Reuses `update_prices` per item so MoySklad's required `salePrices.priceType` meta is preserved. |
| `batch_create_orders` | Create up to 100 customer orders in parallel. Each item is the same shape as `create_customer_order`. |
| `batch_update_status` | Transition up to 100 orders to a target state in parallel. Pass UUIDs + one state meta href. |
| `batch_create_counterparties` | Create up to 100 counterparties in parallel. Only `name` is required; optional: inn, kpp, phone, email, description, company_type. |

**Batch semantics.** All batch tools use client-side parallel dispatch with
a concurrency cap (default 5). The shared 45 req/3s token bucket prevents
server overload regardless of the value chosen. Partial failures do NOT abort
the batch — the returned envelope lists `failed_indexes` so the LLM can retry
just the failed subset.

---

## Quick Start

### Claude Desktop

```json
{
  "mcpServers": {
    "moysklad": {
      "command": "npx",
      "args": ["-y", "@theyahia/moysklad-mcp"],
      "env": {
        "MOYSKLAD_TOKEN": "your-token-here"
      }
    }
  }
}
```

Get a token at <https://online.moysklad.ru/app/#admin/settings/access> →
**Доступ по токену**.

### Login/password (fallback)

```json
"env": {
  "MOYSKLAD_LOGIN": "your-email@example.com",
  "MOYSKLAD_PASSWORD": "your-password"
}
```

Token is preferred — it's revocable and doesn't expose your account password.

---

## Example prompts (RU)

- *"Найди все товары с артикулом MILK-* и подними цену на 5%."*
  → `search_products` → `batch_set_prices` (one call for all matches).
- *"Все заказы в статусе Новый старше 3 дней — переведи в Подтверждён."*
  → `get_orders { filter_state: "Новый" }` → human review → `batch_update_status`.
- *"Закрой май по прибыли — покажи топ-10 клиентов."*
  → `get_profit_report` + paginated `get_orders` + in-memory aggregation.
- *"Загрузи 50 новых контрагентов из этого CSV."*
  → parse CSV in agent context → one `batch_create_counterparties` call.

---

## Examples directory

Production-quality recipes in [`examples/`](./examples/):

- [`warehouse-sync.ts`](./examples/warehouse-sync.ts) — cross-warehouse stock
  diff + batch replenishment orders.
- [`order-fulfillment.ts`](./examples/order-fulfillment.ts) — daily fulfillment
  worker with human-in-the-loop approval before batch state transitions.
- [`financial-report.ts`](./examples/financial-report.ts) — monthly P&L grouped
  by counterparty, combining `get_profit_report` with paginated `get_orders`.

Each example is a structured recipe (not a standalone script) showing the
exact MCP tool-call sequence an LLM agent would follow.

---

## Auth & rate limits

- **Token** (preferred): set `MOYSKLAD_TOKEN`. Send as `Authorization: Bearer ...`.
- **Basic** (fallback): set `MOYSKLAD_LOGIN` + `MOYSKLAD_PASSWORD`. Sent as
  `Authorization: Basic <base64>`.
- **Rate limit**: token bucket = 45 requests / 3 seconds (per MoySklad's
  published limit). Hits exceed limit are auto-queued client-side.
- **Retries**: 3 retries with exponential backoff on 5xx / 429 / network errors
  (via `@theyahia/mcp-core`'s `RateLimitedClient`).

---

## Environment

| Var | Required | Description |
|-----|----------|-------------|
| `MOYSKLAD_TOKEN` | ⚠️ One of token OR login+password | Bearer access token |
| `MOYSKLAD_LOGIN` | ⚠️ | Account email (Basic auth) |
| `MOYSKLAD_PASSWORD` | ⚠️ | Account password (Basic auth) |
| `HTTP_PORT` | Optional | If set, launches Streamable HTTP transport instead of stdio |
| `LOG_LEVEL` | Optional | `debug` / `info` / `warn` / `error` (default: `info`) |

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/moysklad-mcp build
pnpm --filter @theyahia/moysklad-mcp test         # unit (vitest)
pnpm --filter @theyahia/moysklad-mcp test:e2e     # smoke (spawn server, MCP handshake)
pnpm --filter @theyahia/moysklad-mcp typecheck
```

---

## License

MIT © theYahia. Not affiliated with МойСклад / Logema.
