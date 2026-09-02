# @theyahia/yookassa-mcp

MCP server for YooKassa API -- payments, refunds, receipts (54-FZ), payouts, webhooks, recurring, SBP, marketplace splits. **20 tools.**

[![npm](https://img.shields.io/npm/v/@theyahia/yookassa-mcp)](https://www.npmjs.com/package/@theyahia/yookassa-mcp)
[![CI](https://github.com/theYahia/yookassa-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/yookassa-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![smithery badge](https://smithery.ai/badge/@theyahia/yookassa-mcp)](https://smithery.ai/server/@theyahia/yookassa-mcp)

Part of [WWmcp](https://github.com/theYahia/WWmcp) series by [@theYahia](https://github.com/theYahia).

## Quick Start

### Claude Desktop

```json
{
  "mcpServers": {
    "yookassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/yookassa-mcp"],
      "env": {
        "YOOKASSA_SHOP_ID": "your-shop-id",
        "YOOKASSA_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add yookassa -e YOOKASSA_SHOP_ID=your-id -e YOOKASSA_SECRET_KEY=your-key -- npx -y @theyahia/yookassa-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "yookassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/yookassa-mcp"],
      "env": {
        "YOOKASSA_SHOP_ID": "your-shop-id",
        "YOOKASSA_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

### Windsurf

```json
{
  "mcpServers": {
    "yookassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/yookassa-mcp"],
      "env": {
        "YOOKASSA_SHOP_ID": "your-shop-id",
        "YOOKASSA_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

### Streamable HTTP (remote / Docker)

> ⚠️ **The HTTP transport exposes money-moving tools.** It requires a Bearer token,
> binds to `127.0.0.1` by default, and validates `Host`/`Origin` (DNS-rebinding protection).
> Never expose it directly to the internet — put it behind an authenticating reverse proxy / mTLS.
> See [SECURITY.md](SECURITY.md).

```bash
MCP_AUTH_TOKEN="$(openssl rand -hex 32)" HTTP_PORT=3000 npx -y @theyahia/yookassa-mcp --http
```

Then call `/mcp` with `Authorization: Bearer <MCP_AUTH_TOKEN>`.

Endpoints:
- `POST /mcp` -- MCP Streamable HTTP transport (Bearer auth required; stateless — POST only)
- `GET /health` -- unauthenticated health check (`{ "status": "ok", "tools": <count> }`)

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `YOOKASSA_SHOP_ID` | Yes | Shop ID (Settings -> Shop) |
| `YOOKASSA_SECRET_KEY` | Yes | Secret key (Integration -> API Keys) |
| `YOOKASSA_PAYOUT_AGENT_ID` | Payouts | Gateway id (agentId) for the Payouts product (Settings -> Payouts) |
| `YOOKASSA_PAYOUT_SECRET_KEY` | Payouts | Secret key for the Payouts gateway |
| `HTTP_PORT` | No | Port for HTTP transport (default 3000); enables `--http` mode |
| `MCP_AUTH_TOKEN` | HTTP only | **Required in HTTP mode.** Bearer token clients must send on `/mcp` |
| `HTTP_HOST` | No | Bind address for HTTP mode (default `127.0.0.1`; set `0.0.0.0` to expose — only behind a proxy) |
| `MCP_ALLOWED_HOSTS` | No | Comma-separated `Host` allowlist (default `127.0.0.1:<port>,localhost:<port>`) |
| `MCP_ALLOWED_ORIGINS` | No | Comma-separated browser `Origin` CORS allowlist (default: none — browser origins rejected) |
| `YOOKASSA_DEBUG` | No | Set to `1` to trace each request (method/path/status/latency/idempotency-key) to stderr — never logs secrets, the auth header, or request bodies |

## Test mode / safety

This server drives **real money operations**. While developing:

1. Create a **test shop** in the [YooKassa dashboard](https://yookassa.ru/my/shop-settings) and
   use its `YOOKASSA_SHOP_ID` / `YOOKASSA_SECRET_KEY`.
2. Confirm you are in test mode by calling **`get_shop_info`** — expect `"test": true` — **before**
   switching to a live shop.
3. In a **live** shop, `create_payment`, `create_refund`, `create_payout`, `create_recurring_payment`,
   `save_payment_method`, and `capture_payment` move real funds and are **irreversible**. These tools
   are annotated as destructive so MCP clients can prompt before running them.
4. The HTTP transport is unauthenticated-by-default-refused and binds to localhost — see
   [SECURITY.md](SECURITY.md) before any remote deployment.

## Tools (20)

### Payments (9)

| Tool | Description |
|------|-------------|
| `create_payment` | Create a payment with amount, description, payment method. Returns payment URL. Supports receipts and metadata |
| `get_payment` | Get payment details by ID -- status, amount, confirmation URL, metadata |
| `capture_payment` | Confirm a two-step payment (capture held funds). Partial capture supported |
| `cancel_payment` | Cancel a payment (pending or waiting_for_capture) |
| `list_payments` | List payments with filters by status, date range, and pagination |
| `save_payment_method` | Save a payment method for recurring charges (card binding) |
| `create_recurring_payment` | Charge a saved payment method (no user interaction) |
| `create_sbp_payment` | Create a payment via SBP (Russian fast payment system) |
| `create_split_payment` | Split payment for marketplaces -- distribute funds among partners |

### Refunds (3)

| Tool | Description |
|------|-------------|
| `create_refund` | Full or partial refund by payment ID |
| `get_refund` | Get refund details by ID |
| `list_refunds` | List refunds with optional payment filter |

### Receipts (2)

| Tool | Description |
|------|-------------|
| `create_receipt` | Fiscal receipt (54-FZ) -- items, VAT codes, customer contacts |
| `list_receipts` | List receipts by payment or refund ID |

### Payouts (2)

> ⚠️ **Payouts are a separately-activated YooKassa product** with their own gateway
> credentials (`YOOKASSA_PAYOUT_AGENT_ID` + `YOOKASSA_PAYOUT_SECRET_KEY`), not the shop's
> payment key. Sending a raw card number requires a PCI DSS certificate — without it, collect
> the recipient via the payout widget and pass `payout_token`. Payouts are asynchronous (poll `get_payout`).

| Tool | Description |
|------|-------------|
| `create_payout` | Payout to bank card / YooMoney wallet / SBP, or via `payout_token` |
| `get_payout` | Get payout status and details by ID |

### Webhooks (3)

| Tool | Description |
|------|-------------|
| `create_webhook` | Register a webhook URL for events (payment.succeeded, refund.succeeded, etc.) |
| `list_webhooks` | List all registered webhooks |
| `delete_webhook` | Delete a webhook by ID |

### Account (1)

| Tool | Description |
|------|-------------|
| `get_shop_info` | Shop info -- ID, status, test mode, fiscalization (YooKassa has no balance endpoint) |

## Demo Prompts

```
Create a payment for 5000 RUB for order #123 with SBP as payment method
```

```
Set up a recurring subscription: bind the card with 1 ruble, then charge 999 RUB monthly using the saved method
```

```
Show all successful payments for the last 7 days and create a refund of 2500 RUB for payment pay_xxx
```

## Architecture

- **Auth**: HTTP Basic Auth (`YOOKASSA_SHOP_ID:YOOKASSA_SECRET_KEY`)
- **Base URL**: `https://api.yookassa.ru/v3/`
- **Idempotence-Key**: one stable UUID v4 per logical POST/DELETE request, preserved across retries (a retried request is de-duplicated by YooKassa, never double-charged). Callers may pass an explicit key.
- **Timeout**: 35 seconds (above YooKassa's ~30s server-side answer window, so slow-but-successful operations are not aborted client-side)
- **Retry**: 3 attempts on 429/5xx/timeout with exponential backoff (1s, 2s, 4s); retries reuse the same Idempotence-Key, so they are safely de-duplicated
- **Transport**: stdio (default) or Streamable HTTP (`--http` / `HTTP_PORT`)

## Part of WWmcp Series

| MCP | Status | Description |
|-----|--------|-------------|
| [@metarebalance/dadata-mcp](https://github.com/theYahia/dadata-mcp) | ready | Addresses, companies, banks, phones |
| [@theyahia/cbr-mcp](https://github.com/theYahia/cbr-mcp) | ready | Currency rates, key rate |
| [@theyahia/yookassa-mcp](https://github.com/theYahia/yookassa-mcp) | ready | Payments, refunds, receipts, payouts, webhooks |
| [@theyahia/cloudpayments-mcp](https://github.com/theYahia/cloudpayments-mcp) | ready | Payments, subscriptions, orders |
| ... | | **46 servers** -- [full list](https://github.com/theYahia/WWmcp) |

## License

MIT

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
