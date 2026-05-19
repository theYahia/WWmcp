# @theyahia/salla-mcp

> MCP server for **Salla** e-commerce platform (Saudi Arabia) — products, orders, customers, catalog ops, and webhook security.
> **15 tools.** OAuth 2.0 with auto-refresh. HMAC-SHA256 webhook verification. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/salla-mcp)](https://www.npmjs.com/package/@theyahia/salla-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of the **`@theyahia` Gulf SaaS stack** for AI agents:

| Package | Vertical | What it does |
|---------|----------|--------------|
| [`@theyahia/salla-mcp`](https://www.npmjs.com/package/@theyahia/salla-mcp) | E-commerce (KSA) | This package — products/orders/customers/catalog |
| [`@theyahia/foodics-mcp`](https://www.npmjs.com/package/@theyahia/foodics-mcp) | Restaurant POS (KSA + GCC) | Menus, orders, branches, inventory |
| [`@theyahia/tabby-mcp`](https://www.npmjs.com/package/@theyahia/tabby-mcp) | BNPL (GCC) | Pre-scoring, sessions, transaction lookup |
| [`@theyahia/unifonic-mcp`](https://www.npmjs.com/package/@theyahia/unifonic-mcp) | SMS / Voice (GCC) | Transactional SMS, OTP, sender ID |

See [Gulf SaaS stack — combined use case](#gulf-saas-stack-combined-flow) below.

---

## What's new in v3.1.0

- **Webhook signature verification** (`verify_webhook_signature` tool) — HMAC-SHA256 against `X-Salla-Signature` with timing-safe comparison. Supports both Salla strategies (`Signature` default + `Token`). Zero new dependencies (Node `crypto`).
- **OAuth auto-refresh** — set `SALLA_OAUTH_CLIENT_ID` + `SALLA_OAUTH_CLIENT_SECRET` + `SALLA_REFRESH_TOKEN` and the client refreshes its access token transparently. The new refresh token (Salla rotates them) is propagated to an optional persistence callback.
- **5 new catalog tools**: `get_product_variants`, `update_product_price`, `bulk_inventory_adjust` (up to 1000 items), `get_categories`, `get_brands`.

Backward-compatible: existing `SALLA_ACCESS_TOKEN` static mode and all 9 original tool names/arguments are unchanged.

---

## Tools (15)

### Products & Catalog

| Tool | Description |
|------|-------------|
| `list_products` | List products with pagination. Optional `status` filter (sale, out, hidden, deleted). |
| `get_product` | Get full product details by ID. |
| `create_product` | Create a new product (name, price, product_type, optional quantity/SKU/description). |
| `update_product` | Update name, price, quantity, or status. |
| `update_product_price` | Set base price plus optional `sale_price` + `sale_end`. |
| `get_product_variants` | Return options + variants for a product (size, color, etc.). |
| `bulk_inventory_adjust` | Bulk adjust quantities (overwrite/increment/decrement) by ID, variant ID, or SKU. Up to 1000 items. |
| `get_categories` | List categories with pagination + keyword filter. |
| `get_brands` | List brands with pagination + keyword filter (requires `brands.read` scope). |

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

### Security

| Tool | Description |
|------|-------------|
| `verify_webhook_signature` | Verify a Salla webhook payload via HMAC-SHA256 (`Signature` strategy) or token equality (`Token` strategy). Returns `{ valid, strategy, computed_signature }`. Timing-safe. |

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
        "SALLA_ACCESS_TOKEN": "your_oauth_access_token",
        "SALLA_WEBHOOK_SECRET": "your_webhook_secret_optional"
      }
    }
  }
}
```

For OAuth auto-refresh (recommended for production):

```json
{
  "mcpServers": {
    "salla": {
      "command": "npx",
      "args": ["-y", "@theyahia/salla-mcp"],
      "env": {
        "SALLA_OAUTH_CLIENT_ID": "your_client_id",
        "SALLA_OAUTH_CLIENT_SECRET": "your_client_secret",
        "SALLA_REFRESH_TOKEN": "your_refresh_token",
        "SALLA_WEBHOOK_SECRET": "your_webhook_secret"
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
| `SALLA_ACCESS_TOKEN` | one of (a static token) or (b OAuth pair) | OAuth 2.0 access token. Use alone for static mode, or as the initial token in refresh mode. |
| `SALLA_OAUTH_CLIENT_ID` | for auto-refresh | App client ID from Salla Partners → Apps → OAuth credentials. |
| `SALLA_OAUTH_CLIENT_SECRET` | for auto-refresh | Matching client secret. |
| `SALLA_REFRESH_TOKEN` | for auto-refresh | The `refresh_token` returned by Salla's `/oauth2/token` exchange. Rotated by Salla on every refresh — persist the new value. |
| `SALLA_ACCESS_TOKEN_EXPIRES_AT` | no | UNIX seconds; helps skip the first refresh round-trip if you already have a valid access token. |
| `SALLA_WEBHOOK_SECRET` | only for `verify_webhook_signature` | Webhook secret from Salla Partners → Apps → Webhooks. |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

Salla uses OAuth 2.0 via `https://accounts.salla.sa/oauth2/token`:

1. Register an app at [Salla Partners](https://salla.partners/).
2. Complete the OAuth flow with `scope=offline_access` to get an `access_token` + `refresh_token`. Access tokens last ~14 days, refresh tokens ~1 month.
3. Either:
   - **Static mode (simple)** — paste the access token into `SALLA_ACCESS_TOKEN`. Re-paste before expiry.
   - **Auto-refresh mode (production)** — set `SALLA_OAUTH_CLIENT_ID`, `SALLA_OAUTH_CLIENT_SECRET`, and `SALLA_REFRESH_TOKEN`. The server refreshes transparently. Salla rotates the refresh token on every refresh — provide a persistence callback (advanced) or accept that the in-memory copy is lost on restart and re-seed from your OAuth callback handler.

Salla OAuth docs: <https://salla.dev/blog/oauth-2-0-in-action-with-salla/>

---

## Webhook signature verification

Salla signs webhook payloads with HMAC-SHA256. Two strategies are supported:

| Strategy | Header | Value | When to use |
|----------|--------|-------|-------------|
| `Signature` (default) | `X-Salla-Signature` | hex digest of `HMAC-SHA256(secret, raw_body)` | Always prefer this — secret never travels over the wire. |
| `Token` | `Authorization` | the secret itself | Legacy. Avoid for new apps. |

Salla advertises which strategy a given webhook uses via the `X-Salla-Security-Strategy` header.

Sources verified 2026-05-19: <https://docs.salla.dev/doc-421119> (Webhooks Explained) and the official [`SallaApp/webhook-actions-js`](https://github.com/SallaApp/webhook-actions-js) library.

### From a Node webhook handler

If you receive a Salla webhook in your own HTTP server, ask the LLM to call `verify_webhook_signature` with the raw body and headers:

```text
User → assistant: "Verify this Salla webhook before I act on it."

Tool call: verify_webhook_signature
  payload:       <the raw request body, byte-exact>
  signature:     <value of X-Salla-Signature>
  strategy:      "Signature"

Tool response: { "valid": true, "strategy": "Signature",
                 "computed_signature": "ac3ea83628…" }
```

**Important:** the raw body must be byte-exact. In Express, use
`express.raw({ type: 'application/json' })` on the webhook route (not the
JSON-parsed body) so whitespace and key order match what Salla signed.

### From a single agent stack

If your agent both receives the webhook and calls the MCP server, the
typical flow is:

1. Web framework → captures raw body + headers → passes to agent.
2. Agent → calls `verify_webhook_signature(payload, signature, "Signature")`.
3. On `valid: false` → log + reject + alert (someone tried to forge a webhook).
4. On `valid: true` → proceed with the order/customer/product action via the
   other MCP tools.

---

## Gulf SaaS stack — combined flow

The `@theyahia` Gulf packages compose into multi-vendor workflows. Example: a
customer in Riyadh orders via a Salla storefront, paid with Tabby, fulfilled
from a Foodics kitchen, with delivery updates via Unifonic SMS.

```
┌────────────┐  webhook   ┌────────────┐  verify_webhook_signature
│  Salla     │───────────▶│  Agent     │───────────────────────────┐
│  storefront│            │  (Claude)  │                           │
└────────────┘            └─────┬──────┘                           ▼
   order.created                │                            (HMAC-SHA256 check)
                                │                                   │
                                ▼                                   │
                       ┌────────────────┐                           │
                       │ tabby-mcp      │ pre_scoring + capture     │
                       │ (BNPL)         │                           │
                       └─────┬──────────┘                           │
                             │ approved                             │
                             ▼                                      │
                       ┌────────────────┐  push items to kitchen    │
                       │ foodics-mcp    │                           │
                       │ (POS)          │                           │
                       └─────┬──────────┘                           │
                             │ ready                                │
                             ▼                                      │
                       ┌────────────────┐  SMS "Order ready"        │
                       │ unifonic-mcp   │                           │
                       │ (comms)        │                           │
                       └────────────────┘                           │
                                                                    │
                       ┌────────────────┐  bulk_inventory_adjust    │
                       │ salla-mcp      │◀──────────────────────────┘
                       │ (decrement     │
                       │  stock)        │
                       └────────────────┘
```

Concrete prompts:

> "A Salla webhook just fired `order.created` for order 1001 — verify the signature, then look the order up in Salla, charge it via Tabby, push line items to Foodics branch 12, and SMS the customer via Unifonic when ready."

> "List my top 10 best-selling Salla products this month, then bulk-decrement inventory for each by the units sold."

> "An order failed Tabby pre-scoring. Set the Salla order status to `cancelled` and SMS the customer in Arabic via Unifonic with the rejection reason."

---

## Demo prompts (single-server)

> "List all products on sale in my Salla store, sorted by stock low to high."

> "Show me the details of order #1001."

> "Create a new product called 'Premium Dates' for 150 SAR, type 'product', initial stock 100."

> "Mark order 1001 as completed."

> "Bulk-update inventory: SKU `DT-S` += 50 units, SKU `DT-L` -= 5 units, product 42 → 200 units (overwrite)."

> "List all brands in my store whose name contains 'organic'."

> "Show me all variants of product 42 and their current SKUs."

> "Verify this Salla webhook signature: payload `{...}`, header `X-Salla-Signature: ac3e…`."

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
│   ├── index.ts                          — bin entry, runServer
│   ├── server.ts                         — createServer factory + tool registration
│   ├── client.ts                         — SallaClient + SallaRefreshStrategy
│   ├── types.ts                          — TypeScript types for Salla responses
│   ├── webhooks/
│   │   └── signature.ts                  — HMAC-SHA256 verification (timing-safe)
│   └── tools/
│       ├── create-product.ts
│       ├── get-order.ts
│       ├── get-product.ts
│       ├── get-store-info.ts
│       ├── list-customers.ts
│       ├── list-orders.ts
│       ├── list-products.ts
│       ├── update-order-status.ts
│       ├── update-product.ts
│       ├── get-product-variants.ts       ◀ v3.1
│       ├── update-product-price.ts       ◀ v3.1
│       ├── bulk-inventory-adjust.ts      ◀ v3.1
│       ├── get-categories.ts             ◀ v3.1
│       ├── get-brands.ts                 ◀ v3.1
│       └── verify-webhook-signature.ts   ◀ v3.1
└── tests/
    ├── client.test.ts
    ├── server.test.ts
    ├── tools.test.ts
    ├── oauth-refresh.test.ts             ◀ v3.1
    └── webhook-signature.test.ts         ◀ v3.1
```

---

## License

MIT — see [LICENSE](./LICENSE).
