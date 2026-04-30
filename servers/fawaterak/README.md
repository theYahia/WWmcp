# @theyahia/fawaterak-mcp

> MCP server for **Fawaterak** (Egypt) — payment aggregator covering Fawry, cards, wallets, Meeza in a single API.
> 8 tools. Bearer auth. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/fawaterak-mcp)](https://www.npmjs.com/package/@theyahia/fawaterak-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Tools (8)

### Invoices

| Tool | Description |
|------|-------------|
| `create_invoice_link` | Create a hosted checkout invoice link — customer opens it to pay via any enabled method. |
| `send_payment` | Initiate a payment with a specific `payment_method_id` (e.g. force Fawry only). |
| `get_invoice_data` | Get full invoice details by invoice ID. |
| `list_invoices` | List invoices with pagination + optional status filter. |
| `cancel_invoice` | Cancel an unpaid invoice. |
| `refund_payment` | Refund a paid invoice (full or partial — depends on method). |

### Account

| Tool | Description |
|------|-------------|
| `get_payment_methods` | List all enabled payment methods (Fawry, cards, wallets, Meeza) with commission rates. |
| `get_balance` | Get merchant balance — settled and pending amounts. |

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fawaterak": {
      "command": "npx",
      "args": ["-y", "@theyahia/fawaterak-mcp"],
      "env": {
        "FAWATERAK_API_KEY": "your_api_key",
        "FAWATERAK_SANDBOX": "true"
      }
    }
  }
}
```

Set `FAWATERAK_SANDBOX=true` for staging endpoint; remove or set to `false` for production.

### Cursor / Windsurf

Same configuration block under `mcpServers`.

### VS Code (Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "fawaterak": {
      "command": "npx",
      "args": ["-y", "@theyahia/fawaterak-mcp"],
      "env": { "FAWATERAK_API_KEY": "your_key", "FAWATERAK_SANDBOX": "true" }
    }
  }
}
```

### Streamable HTTP transport

```bash
HTTP_PORT=3000 FAWATERAK_API_KEY=your_key npx @theyahia/fawaterak-mcp
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
| `FAWATERAK_API_KEY` | yes | Bearer API key from your Fawaterak merchant panel. |
| `FAWATERAK_SANDBOX` | no | Set to `"true"` to use `staging.fawaterk.com`. Default: production `app.fawaterk.com`. |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

1. Sign up at [fawaterk.com](https://fawaterk.com) and verify your business.
2. Generate an API key from the merchant panel.
3. Use the key as `FAWATERAK_API_KEY`.
4. Test against `staging.fawaterk.com` first by setting `FAWATERAK_SANDBOX=true`.

Docs: [fawaterak-api.readme.io](https://fawaterak-api.readme.io/)

---

## Demo Prompts

Try these natural-language prompts in your MCP client:

> "List Fawaterak payment methods on my account — I want to know if Fawry, cards, and Meeza are all enabled."

> "Create an invoice link for 250 EGP, customer Mohammad Hamza (mohammad@example.com, phone 01234567890), 1 product called 'Premium subscription' at 250 EGP. Success URL https://mystore.com/ok, fail https://mystore.com/fail."

> "Get invoice data for invoice 12345 — what's its current status?"

> "List the last 50 paid invoices."

> "Cancel invoice 12345 — customer changed their mind before paying."

> "Refund invoice 67890 partially — return 100 EGP."

> "What's my Fawaterak balance? How much has been settled?"

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/fawaterak-mcp build
pnpm --filter @theyahia/fawaterak-mcp test
pnpm --filter @theyahia/fawaterak-mcp dev   # tsx watch mode
```

Project layout:

```
servers/fawaterak/
├── src/
│   ├── index.ts          — bin entry, runServer
│   ├── server.ts         — createServer factory + 8 tools (inline definitions)
│   └── client.ts         — BaseHttpClient + ApiKeyStrategy + sandbox/prod URL switching
└── tests/
    ├── client.test.ts    — auth headers + sandbox/prod URLs + body shape + missing-key error
    └── server.test.ts    — createServer factory smoke
```

---

## License

MIT — see [LICENSE](./LICENSE).
