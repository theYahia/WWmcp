# PayMongo MCP — accept online payments in the Philippines from an AI assistant

If you were looking for a way to take GCash, GrabPay or card payments from Claude or another AI assistant, send a customer a payment link, refund an order or wire up webhooks without writing gateway code, this is it. 24 tools cover payment intents, sources, payments, refunds, checkout sessions, **payment links**, **webhooks**, **payment methods** and **customers** over the [PayMongo](https://www.paymongo.com/) API via Basic Auth.

## Tools (24)

### Payments

| Tool | Description |
|---|---|
| `create_payment_intent` | Create a payment intent |
| `get_payment_intent` | Get a payment intent by ID |
| `create_source` | Create a GCash/GrabPay source |
| `get_source` | Get a source by ID |
| `create_payment` | Charge a source to create a payment |
| `list_payments` | List payments (cursor pagination) |

### Refunds

| Tool | Description |
|---|---|
| `create_refund` | Refund a payment |
| `get_refund` | Get a refund by ID |
| `list_refunds` | List refunds (cursor pagination) |

### Checkout & Links

| Tool | Description |
|---|---|
| `create_checkout` | Create a hosted checkout session |
| `get_checkout` | Get a checkout session by ID |
| `create_link` | Create a no-code Payment Link |
| `get_link` | Get a link by ID or reference number |
| `archive_link` | Archive / unarchive a link |

### Webhooks

| Tool | Description |
|---|---|
| `create_webhook` | Register a webhook endpoint |
| `list_webhooks` | List webhooks |
| `get_webhook` | Get a webhook by ID |
| `update_webhook` | Update URL/events, enable/disable |
| `verify_webhook_signature` | Verify the `Paymongo-Signature` header locally (no API call) |

### Payment Methods & Customers

| Tool | Description |
|---|---|
| `create_payment_method` | Create a payment method (e.g. a card) |
| `get_payment_method` | Get a payment method by ID |
| `create_customer` | Create a customer |
| `get_customer` | Get a customer by ID |
| `list_customers` | List customers (cursor pagination) |

## Quick Start

```json
{
  "mcpServers": {
    "paymongo": {
      "command": "npx",
      "args": ["-y", "@theyahia/paymongo-mcp"],
      "env": {
        "PAYMONGO_SECRET_KEY": "<YOUR_PAYMONGO_SECRET_KEY>"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PAYMONGO_SECRET_KEY` | Yes | Secret API key from the PayMongo dashboard (`sk_test_…` or `sk_live_…`). |
| `PAYMONGO_ALLOW_LIVE` | No | Must be `"true"` to allow money-moving tools when a **live** key is used (see Safety). |

The server reads the secret key **lazily** — it can start and list its tools
without a key set, so a missing key surfaces as a tool-call error rather than a
startup crash.

## Amounts

All amounts are **integers in centavos** (the smallest currency unit):
`10000` = ₱100.00. PayMongo's minimum is typically `2000` (₱20.00) and varies by
method.

## Safety: test vs live keys

PayMongo keys are either **test** (`sk_test_…`) or **live** (`sk_live_…`). To
prevent an AI agent from accidentally moving real money, the money-moving tools
(`create_payment`, `create_refund`, `create_payment_intent`, `create_source`,
`create_checkout`, `create_link`, `create_payment_method`) are **refused** when a
live key is configured unless you opt in with:

```
PAYMONGO_ALLOW_LIVE=true
```

Read-only tools (`get_*`, `list_*`) always work. Tools are also tagged with MCP
annotations (`readOnlyHint` / `destructiveHint`) so clients can auto-approve
reads and warn on destructive actions.

## Webhooks

Create a webhook to receive async payment events (e.g. `source.chargeable`,
`payment.paid`):

```
create_webhook { "url": "https://your.app/paymongo/hook", "events": ["payment.paid", "source.chargeable"] }
```

The response includes a per-webhook **signing secret** (`whsk_…`). Store it. When
PayMongo POSTs an event, verify the `Paymongo-Signature` header **before**
trusting the body — pass the raw request body, the header value, and the signing
secret to `verify_webhook_signature`:

```
verify_webhook_signature {
  "payload": "<raw request body, exactly as received>",
  "signature_header": "t=...,te=...,li=...",
  "webhook_signing_secret": "whsk_...",
  "mode": "test"
}
```

It computes `HMAC-SHA256(timestamp + "." + body)` and compares it (timing-safe)
against the `te` (test) or `li` (live) segment. This tool runs entirely locally
and needs no API key. Pass `tolerance_seconds` to also reject stale timestamps
(replay protection).

## Demo Prompts

- "Create a payment intent for 100 PHP"
- "Create a GCash source for 50 PHP with success/fail redirect URLs"
- "Create a payment link for 250 PHP for 'Consulting fee'"
- "List recent payments"
- "Refund 25 PHP from payment pay_123"
- "Register a webhook at https://example.com/hook for payment.paid"

## Development

```bash
npm ci
npm run typecheck   # tsc --noEmit
npm run build       # tsc -> dist/
npm test            # vitest
npm run dev         # run from source with tsx
```

## License

MIT

---

Часть [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)

