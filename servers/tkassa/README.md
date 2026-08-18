# @theyahia/tkassa-mcp

MCP server for T-Kassa (T-Bank/Tinkoff) payment API. **16 tools:** payments, refunds, recurring charges, customer management, saved cards, SBP (Fast Payments), receipts (54-FZ), T-Invest portfolio.

[![npm](https://img.shields.io/npm/v/@theyahia/tkassa-mcp)](https://www.npmjs.com/package/@theyahia/tkassa-mcp)
[![license](https://img.shields.io/npm/l/@theyahia/tkassa-mcp)](./LICENSE)

Part of the [Russian API MCP](https://github.com/theYahia/russian-mcp) series (50 servers) by [@theYahia](https://github.com/theYahia).

## Quick Start

### Claude Desktop

```json
{
  "mcpServers": {
    "tkassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/tkassa-mcp"],
      "env": {
        "TKASSA_TERMINAL_KEY": "your-terminal-key",
        "TKASSA_PASSWORD": "your-password"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add tkassa -e TKASSA_TERMINAL_KEY=your-key -e TKASSA_PASSWORD=your-password -- npx -y @theyahia/tkassa-mcp
```

### Cursor / Windsurf

```json
{
  "tkassa": {
    "command": "npx",
    "args": ["-y", "@theyahia/tkassa-mcp"],
    "env": {
      "TKASSA_TERMINAL_KEY": "your-terminal-key",
      "TKASSA_PASSWORD": "your-password"
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `TKASSA_TERMINAL_KEY` | Yes | Terminal key (Dashboard -> Shops -> Terminals) |
| `TKASSA_PASSWORD` | Yes | Terminal password (used for SHA-256 token signing) |
| `TINKOFF_INVEST_TOKEN` | No | T-Invest API token (for tools 15–16). Get in T-Invest app: Settings → OpenAPI Token |

Get test credentials at [T-Kassa Dashboard](https://www.tbank.ru/kassa/).

## Tools (16)

### Payments (5)

| Tool | Description |
|------|-------------|
| `init_payment` | Create a payment. Returns PaymentURL. Supports one-step/two-step, receipts (54-FZ), recurring, DATA fields |
| `get_payment_state` | Get payment status by PaymentId (NEW, AUTHORIZED, CONFIRMED, REVERSED, REFUNDED, REJECTED) |
| `confirm_payment` | Confirm a two-step payment. Supports partial confirmation |
| `cancel_payment` | Cancel a payment (before or after confirmation). Supports partial cancellation |
| `charge_payment` | Charge a recurring payment using RebillId from a saved card |

### Refunds (1)

| Tool | Description |
|------|-------------|
| `refund_payment` | Full or partial refund. Payment must be in CONFIRMED status |

### Customers & Cards (5)

| Tool | Description |
|------|-------------|
| `add_customer` | Register a customer for saving cards and recurring payments |
| `get_customer` | Get customer data (Email, Phone) by CustomerKey |
| `remove_customer` | Remove a customer and all saved cards |
| `get_card_list` | List saved cards (CardId, Pan, ExpDate, RebillId) |
| `remove_card` | Remove a saved card by CardId |

### SBP - Fast Payments (2)

| Tool | Description |
|------|-------------|
| `create_sbp_qr` | Generate QR code for SBP payment (payload link or base64 PNG) |
| `get_sbp_qr_state` | Check SBP QR payment status |

### Receipts - 54-FZ (1)

| Tool | Description |
|------|-------------|
| `send_closing_receipt` | Send a closing receipt with Items (Name, Price, Quantity, Tax) for fiscal compliance |

### T-Invest (2)

Requires `TINKOFF_INVEST_TOKEN`. If not set, these tools return a descriptive error.

| Tool | Description |
|------|-------------|
| `get_invest_portfolio` | Get investment portfolio: stocks, bonds, ETFs, current value and P&L |
| `find_instrument` | Search instrument by ticker, ISIN, or company name. Returns FIGI key |

## Auth

Every request is signed with SHA-256:

```
Token = SHA-256(concat(sorted values of {Password, TerminalKey, ...params}))
```

Only scalar values participate in signing. Nested objects (Receipt, DATA) are excluded. Handled automatically.

## HTTP Transport

```bash
HTTP_PORT=3000 npx @theyahia/tkassa-mcp
# or
npx @theyahia/tkassa-mcp --http 3000
```

Endpoints: `POST /mcp` (JSON-RPC), `GET /health` (status).

## Skills

- **skill-create-payment** -- create a payment and get a payment URL
- **skill-payment-status** -- check payment status by PaymentId

## Webhook Notifications

T-Kassa sends POST notifications to your `notification_url` (set in `init_payment`) when payment status changes:

```json
{
  "TerminalKey": "your-key",
  "OrderId": "your-order-id",
  "Success": true,
  "Status": "CONFIRMED",
  "PaymentId": 123456789,
  "ErrorCode": "0",
  "Amount": 10000,
  "RebillId": 987654321,
  "CardId": 12345,
  "Pan": "430000******0777",
  "ExpDate": "1230",
  "Token": "sha256-signature"
}
```

Verify by computing the Token the same way (sorted values concat + SHA-256) and comparing.

## Notes

- Base URL: `https://securepay.tinkoff.ru/v2/`
- Amounts are in kopecks internally (server converts rubles automatically)
- Automatic retry with exponential backoff on 429/5xx
- API docs: https://www.tbank.ru/kassa/dev/payments/

## Demo Prompts

**Create a payment with receipt:**
```
Create a payment for 1500 rubles, order "order-42", with a receipt: 1x "Premium subscription" at 1500 RUB, VAT 20%, tax system USN income. Send receipt to user@example.com.
```

**Set up recurring payments:**
```
Register customer "cust-123" with email user@example.com, then create a recurring payment for 990 rubles on order "sub-monthly-1".
```

**Refund and check status:**
```
Refund 500 rubles from payment 777888999, then check its current status.
```

## Series: Russian API MCP

| MCP | Status | Description |
|-----|--------|-------------|
| [@metarebalance/dadata-mcp](https://github.com/theYahia/dadata-mcp) | ready | Addresses, companies, banks, phones |
| [@theyahia/cbr-mcp](https://github.com/theYahia/cbr-mcp) | ready | Exchange rates, key rate |
| [@theyahia/yookassa-mcp](https://github.com/theYahia/yookassa-mcp) | ready | Payments, refunds, receipts 54-FZ |
| [@theyahia/tkassa-mcp](https://github.com/theYahia/tkassa-mcp) | **v2.1** | **16 tools** -- payments, refunds, recurring, SBP, receipts, T-Invest |
| ... | soon | **+46 servers** -- [full list](https://github.com/theYahia/russian-mcp) |

## License

MIT
