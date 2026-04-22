# @theyahia/mercadopago-mcp

> MCP server for **MercadoPago** — payments, refunds, checkout preferences, merchant orders.
> Multi-country: AR, BR, MX, UY, CL, CO, PE, EC, VE.
> 10 tools. Bearer access token. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/mercadopago-mcp)](https://www.npmjs.com/package/@theyahia/mercadopago-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Tools (10)

### Payments

| Tool | Description |
|------|-------------|
| `create_payment` | Create a payment (charge a customer). Supports cards (with token + installments), wallets, vouchers (PIX, Rapipago, OXXO). |
| `get_payment` | Get full payment details — status, amount, payer, refunds, fees. |
| `search_payments` | Search by external_reference, status, or date range. |
| `refund_payment` | Full refund (no `amount`) or partial refund. |
| `get_payment_methods` | List all enabled payment methods on the account. |

### Checkout (Preferences)

| Tool | Description |
|------|-------------|
| `create_preference` | Create a hosted checkout session. Returns `init_point` URL to redirect the customer. |
| `get_preference` | Get preference details. |
| `update_preference` | Update items, redirect URLs, expiration. |

### Merchant Orders

| Tool | Description |
|------|-------------|
| `search_merchant_orders` | Search orchestrator entities (preference + payments + shipments) by external_reference. |
| `get_merchant_order` | Get full merchant order details. |

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mercadopago": {
      "command": "npx",
      "args": ["-y", "@theyahia/mercadopago-mcp"],
      "env": {
        "MERCADOPAGO_ACCESS_TOKEN": "APP_USR-XXXXXXXX-XXXXXX-X-XXXXXXXX"
      }
    }
  }
}
```

For testing, use a `TEST-...` token instead of `APP_USR-...`.

### Cursor / Windsurf

Same configuration block under `mcpServers`.

### VS Code (Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "mercadopago": {
      "command": "npx",
      "args": ["-y", "@theyahia/mercadopago-mcp"],
      "env": { "MERCADOPAGO_ACCESS_TOKEN": "your_token" }
    }
  }
}
```

### Streamable HTTP transport

```bash
HTTP_PORT=3000 MERCADOPAGO_ACCESS_TOKEN=your_token npx @theyahia/mercadopago-mcp
# or: npx @theyahia/mercadopago-mcp --http
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
| `MERCADOPAGO_ACCESS_TOKEN` | yes | Bearer access token. Production: `APP_USR-...`, sandbox: `TEST-...`. |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

The country (AR, BR, MX, etc.) is derived from your account's `site_id` — no separate env var needed.

---

## Authentication

1. Log in to your MercadoPago account.
2. Go to **Developers Panel → Your applications → Credentials**.
3. Copy either the **production** access token (starts with `APP_USR-`) or the **test** access token (starts with `TEST-`).
4. Use that as `MERCADOPAGO_ACCESS_TOKEN`.

For testing, MercadoPago provides separate sandbox accounts and test card numbers — see [Testing](https://www.mercadopago.com.ar/developers/en/docs/checkout-pro/test-integration) docs.

---

## Demo Prompts

Try these natural-language prompts in your MCP client:

> "Create a checkout preference for 2 books at $100 each. Set success URL to https://mystore.com/thanks."

> "Find all approved payments from January 2026 — limit 50."

> "Refund payment 12345678 partially — return $500 of the original $1000."

> "Show me payment methods enabled on my account — I want to know if PIX is available."

> "Create a payment for $1500 ARS using card token `card_xyz123` for buyer `customer@example.com`, 6 installments."

> "Search for merchant orders with external_reference `ORDER-2026-04-22-001` and show me their payment status."

> "Update preference `pref_abc123` — change the success redirect URL to https://newdomain.com/ok."

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/mercadopago-mcp build
pnpm --filter @theyahia/mercadopago-mcp test
pnpm --filter @theyahia/mercadopago-mcp dev   # tsx watch mode
```

Project layout:

```
servers/mercadopago/
├── src/
│   ├── index.ts          — bin entry, runServer
│   ├── server.ts         — createServer factory + 10 tools
│   ├── client.ts         — BaseHttpClient + ApiKeyStrategy + mpGet/mpPost/mpPut
│   └── tools/
│       ├── payments.ts          — 5 payment tools
│       ├── preferences.ts       — 3 checkout preference tools
│       └── merchant-orders.ts   — 2 merchant order tools
└── tests/
    ├── client.test.ts    — auth header + body serialization + retry
    ├── server.test.ts    — createServer factory smoke
    └── tools.test.ts     — every tool's URL + body shape
```

---

## License

MIT — see [LICENSE](./LICENSE).
