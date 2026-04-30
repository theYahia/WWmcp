# @theyahia/orange-money-mcp

> MCP server for **Orange Money WebPay** — pan-Francophone African mobile money (~12 countries from one server).
> 8 tools. OAuth2 Client Credentials with Basic header. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/orange-money-mcp)](https://www.npmjs.com/package/@theyahia/orange-money-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Tools (8)

### Customer payments

| Tool | Description |
|------|-------------|
| `create_webpayment` | Create a hosted WebPay session — returns a redirect URL where the customer enters their Orange Money PIN. |
| `get_payment_status` | Query the status of a WebPay session by order_id + amount + pay_token. |
| `validate_webhook` | Validate an incoming WebPay webhook by re-querying transactionstatus. |

### B2B / disbursements

| Tool | Description |
|------|-------------|
| `cashin` | Push money TO a customer's wallet (you pay them). |
| `cashout` | Pull money FROM a customer's wallet (collect from them, requires pre-authorization). |
| `transfer` | Transfer money between two Orange Money wallets. |

### Account

| Tool | Description |
|------|-------------|
| `get_balance` | Get current merchant wallet balance for the configured country. |
| `list_supported_countries` | List the country codes this server is configured to route to. |

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "orange-money": {
      "command": "npx",
      "args": ["-y", "@theyahia/orange-money-mcp"],
      "env": {
        "ORANGE_MONEY_CLIENT_ID": "your_client_id",
        "ORANGE_MONEY_CLIENT_SECRET": "your_client_secret",
        "ORANGE_MONEY_MERCHANT_KEY": "your_merchant_key",
        "ORANGE_MONEY_COUNTRY": "sn"
      }
    }
  }
}
```

`ORANGE_MONEY_COUNTRY` accepts ISO codes (lowercase): `sn` (Senegal), `ci` (Côte d'Ivoire), `ml` (Mali), `cm` (Cameroon), `bf` (Burkina Faso), `td` (Chad), etc.

### Cursor / Windsurf

Same configuration block under `mcpServers`.

### VS Code (Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "orange-money": {
      "command": "npx",
      "args": ["-y", "@theyahia/orange-money-mcp"],
      "env": {
        "ORANGE_MONEY_CLIENT_ID": "...",
        "ORANGE_MONEY_CLIENT_SECRET": "...",
        "ORANGE_MONEY_MERCHANT_KEY": "...",
        "ORANGE_MONEY_COUNTRY": "sn"
      }
    }
  }
}
```

### Streamable HTTP transport

```bash
HTTP_PORT=3000 \
ORANGE_MONEY_CLIENT_ID=... ORANGE_MONEY_CLIENT_SECRET=... \
ORANGE_MONEY_MERCHANT_KEY=... ORANGE_MONEY_COUNTRY=sn \
npx @theyahia/orange-money-mcp
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
| `ORANGE_MONEY_CLIENT_ID` | yes | OAuth2 client ID from developer.orange.com → MyApps. |
| `ORANGE_MONEY_CLIENT_SECRET` | yes | OAuth2 client secret. |
| `ORANGE_MONEY_MERCHANT_KEY` | yes (for create_webpayment) | Per-country merchant key from your Orange Money business contract. |
| `ORANGE_MONEY_COUNTRY` | yes | ISO country code (lowercase): sn, ci, ml, cm, bf, td, mg, ne, gn, lr, sl, cd. |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

Orange Developer uses **OAuth2 Client Credentials with Basic header** (a quirk: `client_id`/`secret` MUST be in the Basic header, NOT the body — body credentials trigger HTTP 400 "Duplicate credentials"). This server handles the dance internally.

1. Register at [developer.orange.com](https://developer.orange.com).
2. Create an app under **MyApps** and subscribe to **Orange Money WebPay**.
3. Copy the `client_id` and `client_secret`.
4. Get a `merchant_key` from your Orange Money local business team for each country you operate in.
5. Set the env vars above and pick `ORANGE_MONEY_COUNTRY`.

---

## Currency reference

- **XOF** (West African CFA franc): Senegal, Côte d'Ivoire, Mali, Burkina Faso, Niger, Togo, Benin, Guinea-Bissau (UEMOA).
- **XAF** (Central African CFA franc): Cameroon, Chad, Central African Republic, Republic of the Congo, Equatorial Guinea, Gabon (CEMAC).

Use `list_supported_countries` to see what this server is currently configured to route to.

---

## Demo Prompts

Try these natural-language prompts in your MCP client:

> "Create an Orange Money payment for 5000 XOF, order ORDER-001, return URL https://mystore.com/ok, cancel URL https://mystore.com/cancel, notif URL https://mystore.com/webhook, language fr."

> "Get the status of order ORDER-001, amount 5000, pay_token TKN_abc123."

> "Cashout 2000 XOF from customer 221771234567 — partner ID PRT001, partner name MyShop, partner MSISDN 221770000001, reference TX-CASHOUT-001."

> "Cashin 10000 XAF to customer 237651234567 — same partner setup, reference SALARY-2026-04."

> "What's my Orange Money merchant balance right now?"

> "List supported Orange Money countries — which one am I configured for?"

> "Validate webhook payload: order_id ORDER-001, amount 5000, pay_token TKN_abc123."

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/orange-money-mcp build
pnpm --filter @theyahia/orange-money-mcp test
pnpm --filter @theyahia/orange-money-mcp dev   # tsx watch mode
```

Project layout:

```
servers/orange-money/
├── src/
│   ├── index.ts          — bin entry, runServer
│   ├── server.ts         — createServer factory + 8 tools
│   └── client.ts         — OrangeMoneyAuthStrategy (Basic header OAuth2) + omGet/omPost
└── tests/
    ├── client.test.ts    — Basic auth header, no-body-credentials, per-country URL routing
    └── server.test.ts    — createServer factory smoke
```

---

## License

MIT — see [LICENSE](./LICENSE).
