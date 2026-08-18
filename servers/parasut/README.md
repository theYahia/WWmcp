# @theyahia/parasut-mcp

MCP server for **Parasut** (Paraşüt) — the Turkish accounting / invoicing platform. 37 tools covering the full bookkeeping loop: contacts, sales invoices, purchase bills, products, cash & bank accounts, payments, sales offers, and **e-Fatura / e-Arşiv** issuance over OAuth 2.0.

[![npm](https://img.shields.io/npm/v/@theyahia/parasut-mcp)](https://www.npmjs.com/package/@theyahia/parasut-mcp)
[![license](https://img.shields.io/npm/l/@theyahia/parasut-mcp)](./LICENSE)

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "parasut": {
      "command": "npx",
      "args": ["-y", "@theyahia/parasut-mcp"],
      "env": {
        "PARASUT_CLIENT_ID": "<your-client-id>",
        "PARASUT_CLIENT_SECRET": "<your-client-secret>",
        "PARASUT_USERNAME": "<your-parasut-email>",
        "PARASUT_PASSWORD": "<your-parasut-password>",
        "PARASUT_COMPANY_ID": "<your-company-id>"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add parasut -- npx -y @theyahia/parasut-mcp
```

Then set the five env vars below.

### Cursor / Windsurf

Add the same `parasut` block to your MCP settings.

## Auth

> **Important (breaking change in 2.0):** Parasut API v4 does **not** support the
> OAuth `client_credentials` grant. This server uses the **`password` grant**, so
> it needs your Parasut account email + password in addition to the API app's
> client id/secret. (The 1.x `client_credentials` flow never actually
> authenticated against Parasut.)

| Variable | Required | Description |
|---|---|---|
| `PARASUT_CLIENT_ID` | Yes | OAuth client ID of your Parasut API application |
| `PARASUT_CLIENT_SECRET` | Yes | OAuth client secret |
| `PARASUT_USERNAME` | Yes | Parasut account email |
| `PARASUT_PASSWORD` | Yes | Parasut account password |
| `PARASUT_COMPANY_ID` | No | Company ID (the number in your dashboard URL). Resolved via `GET /me` when omitted. |

Register an API application and read the docs at <https://apidocs.parasut.com/>.
The server authenticates with the `password` grant and then transparently renews
the 2-hour access token via the rotating `refresh_token`.

## Tools (37)

### Contacts
| Tool | Description |
|---|---|
| `list_contacts` | List customers/suppliers (filter by `account_type`, name) |
| `get_contact` | Get a single contact |
| `create_contact` | Create a contact (`account_type` customer/supplier is required) |
| `collect_from_contact` | Record a collection against a customer's balance |
| `pay_to_contact` | Record a payment against a supplier's balance |

### Sales invoices
| Tool | Description |
|---|---|
| `list_sales_invoices` | List invoices (filter by contact, type, issue-date range) |
| `get_sales_invoice` | Get one invoice with details, contact and payments |
| `create_sales_invoice` | Create an invoice/estimate with line items (VAT defaults to 20%) |
| `record_sales_invoice_payment` | Record a collection into a cash/bank account |
| `cancel_sales_invoice` | Cancel an invoice (HTTP DELETE on `/cancel`) |
| `archive_sales_invoice` / `recover_sales_invoice` | Archive / recover |
| `convert_estimate_to_invoice` | Turn an estimate into an invoice |

### Purchase bills
| Tool | Description |
|---|---|
| `list_purchase_bills` | List supplier bills |
| `get_purchase_bill` | Get one bill with details, supplier and payments |
| `create_purchase_bill` | Create a basic bill (needs `due_date`, `net_total`, `total_vat`) |
| `record_purchase_bill_payment` | Pay a bill from a cash/bank account |
| `cancel_purchase_bill` | Cancel a bill |

### Products
| Tool | Description |
|---|---|
| `list_products` | List products/services |
| `get_product` | Get one product |
| `create_product` | Create a product/service (VAT defaults to 20%) |

### Cash & bank
| Tool | Description |
|---|---|
| `list_accounts` | List cash and bank accounts (for `account_id` in payments) |
| `get_account` | Get one account with its balance |
| `list_account_transactions` | List money movements on an account |

### e-Fatura / e-Arşiv
| Tool | Description |
|---|---|
| `check_einvoice_inbox` | Look up a recipient's e-Fatura inbox by VKN |
| `issue_e_document` | Smart flow: inbox check → e-Fatura or e-Arşiv → wait for the async job |
| `create_e_invoice` | Low-level e-Fatura issuance to a known inbox address |
| `create_e_archive` | Low-level e-Arşiv issuance |
| `get_trackable_job` | Poll an async e-document job (`running` / `done` / `error`) |

### Sales offers & reference
| Tool | Description |
|---|---|
| `list_sales_offers` / `get_sales_offer` | Estimates / quotes |
| `update_sales_offer_status` | Set status `accepted` / `rejected` / `waiting` |
| `get_me` | Authenticated user + accessible companies |
| `list_tags` / `list_item_categories` / `list_warehouses` / `list_taxes` | Reference data |

## e-Fatura vs e-Arşiv

In Turkey you can only send an **e-Fatura** to a recipient who is registered for
e-Fatura; everyone else gets an **e-Arşiv**. `issue_e_document` handles this for
you: it looks up the recipient's VKN via `check_einvoice_inbox`, picks the right
document type, posts it, and (because issuance is asynchronous) polls the
returned trackable job until it reaches `done` / `error`.

## HTTP Transport

```bash
HTTP_PORT=3000 npx @theyahia/parasut-mcp
# or
npx @theyahia/parasut-mcp --http 3000
```

Endpoints: `POST /mcp` (JSON-RPC), `GET /health` (status). CORS is opt-in via
`PARASUT_HTTP_CORS_ORIGIN` (never a wildcard default — the tools act on your
credentials).

## Rate limiting

Parasut allows **10 requests per 10 seconds**. The client paces requests with a
token bucket and retries `5xx`/`429` with backoff, so you rarely trip the
throttle. Pagination is capped at Parasut's maximum `page[size]` of 25.

## Demo Prompts

> "List my customers in Parasut and create an invoice for 5 000 TRY to Acme Ltd for 10 hours of consulting."

> "Show this month's unpaid purchase bills, then record a payment for the Vodafone one from my Garanti account."

> "Issue an e-Fatura for invoice 12345 to the customer with VKN 1234567890 — or an e-Arşiv if they aren't registered."

## Turkish stack

| Service | MCP Server | What it does |
|---|---|---|
| Parasut | `@theyahia/parasut-mcp` | Accounting, invoicing, e-Fatura |
| İleti Merkezi | `@theyahia/ileti-merkezi-mcp` | SMS |

Part of the [theYahia MCP series](https://github.com/theYahia?tab=repositories&q=mcp).

## Development

```bash
npm install
npm run build
npm test
```

## API Reference

Based on the official [Parasut API v4](https://apidocs.parasut.com/) — OpenAPI
spec at [github.com/parasutcom/api-doc](https://github.com/parasutcom/api-doc).

## License

MIT
