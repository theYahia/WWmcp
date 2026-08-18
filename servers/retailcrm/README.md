# @theyahia/retailcrm-mcp

Production-grade MCP server for **RetailCRM** e-commerce CRM. 39 tools + 2 prompt skills for managing orders, customers, products, inventory, payments, tasks, references, and analytics via API v5.

[![npm](https://img.shields.io/npm/v/@theyahia/retailcrm-mcp)](https://www.npmjs.com/package/@theyahia/retailcrm-mcp)
[![Smithery](https://smithery.ai/badge/@theyahia/retailcrm-mcp)](https://smithery.ai/server/@theyahia/retailcrm-mcp)

## Output is token-efficient by default

Read tools return a **compact, shaped summary** of only the fields an agent needs — not the full RetailCRM payload. Control verbosity per call:

| Param | Effect |
|-------|--------|
| _(default)_ | `detail:"summary"` — essential fields + a `pagination` block |
| `detail:"full"` | All shaped fields (line items, delivery, payments, address…) |
| `raw:true` | The untouched RetailCRM response (for debugging) |

> ⚠️ **v3 is a breaking change** vs v2: default output is now the shaped summary instead of raw JSON. Pass `raw:true` to restore the old payload.

## Tools (39)

### Orders
| Tool | Description |
|------|-------------|
| `list_orders` | List orders by status, customer, number, date range |
| `get_order` | Get one order by ID or externalId |
| `create_order` | Create an order; link an existing customer (`customer_id`/`customer_external_id`) or create one inline |
| `update_order` | Update status, customer, delivery, comments |
| `orders_history` | Order change history incl. status transitions (incremental sync) |

### Customers
| Tool | Description |
|------|-------------|
| `list_customers` | Search customers by name, email, phone, date |
| `get_customer` | Get one customer by ID or externalId |
| `create_customer` | Create a customer |
| `update_customer` | Edit an existing customer |
| `merge_customers` | Merge duplicates (destructive) |
| `customers_history` | Customer change log (growth/churn, incremental sync) |

### Products & inventory
| Tool | Description |
|------|-------------|
| `list_products` | Catalog products by name, group, active, price |
| `list_product_groups` | Product category tree |
| `store_inventories` | Stock levels & cost prices per offer/warehouse |

### Payments
| Tool | Description |
|------|-------------|
| `order_payment_create` | Record a payment on an order |
| `order_payment_edit` | Edit a payment |
| `order_payment_delete` | Delete a payment (destructive) |

### Notes & tasks
| Tool | Description |
|------|-------------|
| `customer_notes_list` / `customer_notes_create` / `customer_notes_delete` | Free-text customer notes |
| `tasks_list` / `tasks_create` / `tasks_edit` | Follow-up tasks/reminders |

### Marketing & finance
| Tool | Description |
|------|-------------|
| `list_segments` | Customer segments (RFM/marketing cohorts) |
| `list_costs` / `create_cost` | Expense records for margin analytics |

### Files
| Tool | Description |
|------|-------------|
| `files_list` / `files_get` / `files_upload` | Attach & retrieve files (raw octet-stream upload) |

### References
| Tool | Description |
|------|-------------|
| `list_statuses` / `list_delivery_types` / `list_payment_types` / `list_stores` | Order/delivery/payment/store reference data |
| `list_sites` | Sites the API key can act on (fill the `site` param) |
| `list_countries` / `list_order_types` / `list_order_methods` | Address & order reference data |

### Analytics
| Tool | Description |
|------|-------------|
| `get_orders_summary` | Period-scoped order stats: exact count + revenue, AOV, status distribution |
| `get_customers_summary` | New-customer count for a date range |

## Prompt Skills (2)

| Skill | Description |
|-------|-------------|
| `new-orders` | Quick daily overview of today's orders |
| `customer-search` | Find a customer by name, email, or phone |

## Setup

1. In RetailCRM, go to **Settings > Integration > API keys**.
2. Create an API key with the required permissions (orders, customers, store, references). For a **multi-site** key, pass the `site` code on create/edit tools (see `list_sites`).
3. Note your domain (the `yourstore` part of `yourstore.retailcrm.ru`).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RETAILCRM_DOMAIN` | Yes | Your RetailCRM domain (e.g. `yourstore.retailcrm.ru`) |
| `RETAILCRM_API_KEY` | Yes | API key (sent via the `X-API-KEY` header) |
| `RETAILCRM_READONLY` | No | `1` to expose only read tools (hide create/update/merge/delete) |
| `RETAILCRM_RATE_LIMIT` | No | Client-side requests/second cap (RetailCRM allows ~10/s) |
| `PORT` / `HOST` | No | HTTP server bind (default `3000` / `127.0.0.1`, `--http` mode only) |
| `RETAILCRM_HTTP_ALLOWED_HOSTS` | No | Comma-separated allowed `Host` values for DNS-rebinding protection |
| `RETAILCRM_DNS_PROTECTION` | No | `off` to disable DNS-rebinding protection (HTTP mode) |

> `RETAILCRM_URL` is still accepted as a fallback for `RETAILCRM_DOMAIN`.

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "retailcrm": {
      "command": "npx",
      "args": ["-y", "@theyahia/retailcrm-mcp"],
      "env": {
        "RETAILCRM_DOMAIN": "yourstore.retailcrm.ru",
        "RETAILCRM_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Streamable HTTP Mode

Run as an HTTP server instead of stdio:

```bash
RETAILCRM_DOMAIN=yourstore.retailcrm.ru \
RETAILCRM_API_KEY=your-key \
npx @theyahia/retailcrm-mcp --http
```

- `POST /mcp` — MCP Streamable HTTP endpoint (stateless: a fresh server is created per request)
- `GET /health` — health check (JSON with version, tool count)
- `GET`/`DELETE /mcp` — `405` (not used in stateless mode)
- Default bind: `127.0.0.1:3000`. DNS-rebinding protection is on by default for local binds.

## Smithery

```bash
npx @smithery/cli install @theyahia/retailcrm-mcp
```

## Demo Prompts

**1. Daily order overview:** "Show me all orders created today with status 'new'. Summarize the total count and revenue."

**2. Customer lookup and order history:** "Find the customer with email anna@example.com. Show their full profile and recent orders."

**3. Stock check:** "Is the product with externalId SKU-42 in stock, and in which warehouse?"

## Webhooks / Triggers

RetailCRM does not support API-created webhooks. Use **Triggers** in the admin panel (Settings > Triggers) to send HTTP requests to external endpoints on order/customer events.

## Error Handling

- **Rate limits / 5xx:** automatic retry with exponential backoff + jitter (up to 3 attempts).
- **API errors:** RetailCRM error details are parsed and returned to the model as a tool result with `isError: true`, so the agent can self-correct (e.g. retry with `by:"externalId"`).
- **Timeouts:** 15-second per-request timeout with retry.

## Development

```bash
npm install
npm test          # vitest (mock-based; no live API key needed)
npm run lint      # eslint
npm run typecheck # tsc --noEmit
npm run dev       # stdio dev mode (tsx)
npm run build     # clean + compile to dist/
```

## License

MIT
