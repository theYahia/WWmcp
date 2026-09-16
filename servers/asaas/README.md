# asaas-mcp

MCP server for Asaas payment and Pix gateway (Brazil).

## Tools (9)

| Tool | Description |
|---|---|
| `create_payment` | Create a payment/billing |
| `get_payment` | Get payment by ID |
| `list_payments` | List payments |
| `create_pix_qr` | Generate Pix QR code |
| `get_pix_status` | Get Pix payment status |
| `create_customer` | Create a customer |
| `list_customers` | List customers |
| `create_subscription` | Create a subscription |
| `refund_payment` | Refund a payment |

## Quick Start

```json
{
  "mcpServers": {
    "asaas": {
      "command": "npx",
      "args": ["-y", "@theyahia/asaas-mcp"],
      "env": {
        "ASAAS_API_KEY": "<YOUR_ASAAS_API_KEY>"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ASAAS_API_KEY` | Yes | API key from Asaas dashboard |

## License

MIT

---

Telegram: [@vhodvai](https://t.me/vhodvai)
