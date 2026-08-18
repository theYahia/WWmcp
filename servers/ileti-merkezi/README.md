# ileti-merkezi-mcp

A type-safe [Model Context Protocol](https://modelcontextprotocol.io) server for the
**[İletiMerkezi](https://www.iletimerkezi.com) SMS API** (Turkey). Lets an AI assistant
send SMS / OTP, run bulk campaigns, pull delivery reports, check balance, manage sender
headers and the blacklist, and handle İYS commercial-message consent — all over the real
İletiMerkezi v1 JSON API.

> **Looking for the official one?** İletiMerkezi publishes its own first-party server,
> [`@iletimerkezi/mcp-server`](https://github.com/iletimerkezi/iletimerkezi-mcp-server). If
> you want the vendor-maintained option with a dynamically-synced tool manifest, use that.
>
> **This** package is an independent, **zero-dependency, fully-typed** alternative:
> native `fetch` (no axios, no manifest fetch on startup → predictable and offline-friendly),
> explicit `zod`-validated tool schemas, type-safe response highlights, ergonomic İYS
> handling, and a tested codebase. Same İletiMerkezi account, same env-var names — drop-in.

## Tools (11)

| Tool | Endpoint | Description |
|---|---|---|
| `send_sms` | `send-sms/json` | Send to one recipient or many (bulk, up to 50000). OTP = a single-recipient send. |
| `cancel_order` | `cancel-order/json` | Cancel a future-scheduled order before dispatch. |
| `get_report` | `get-report/json` | Per-recipient delivery report for one order. |
| `get_reports` | `get-reports/json` | Order summaries within a date range (≤ 10 days). |
| `get_balance` | `get-balance/json` | Account balance (TL) + remaining SMS credits. |
| `get_sender` | `get-sender/json` | List approved sender headers (başlık). |
| `get_blacklist` | `get-blacklist/json` | List blocked numbers (paginated). |
| `add_blacklist` | `add-blacklist/json` | Block a number (idempotent). |
| `delete_blacklist` | `delete-blacklist/json` | Unblock a number. |
| `iys_register` | `consent/create/json` | Register İYS consent records (batch, 1–5000). |
| `iys_check` | `consent/show/json` | Look up a recipient's İYS consent status (ONAY/RET). |

## Quick start

Add to your MCP client config (e.g. `claude_desktop_config.json` or `mcp.json`):

```json
{
  "mcpServers": {
    "ileti-merkezi": {
      "command": "npx",
      "args": ["-y", "@theyahia/ileti-merkezi-mcp"],
      "env": {
        "ILETIMERKEZI_API_KEY": "<YOUR_API_KEY>",
        "ILETIMERKEZI_API_HASH": "<YOUR_API_HASH>"
      }
    }
  }
}
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ILETIMERKEZI_API_KEY` | Yes | API key from the panel. |
| `ILETIMERKEZI_API_HASH` | Yes | **Precomputed** hash from the panel — copy as-is. |
| `ILETIMERKEZI_SENDER` | No | Default sender header used when a call omits `sender`. |

Both credentials are issued, already paired, from **panel.iletimerkezi.com → Settings →
Security → API Access**. The panel precomputes the hash — **do not hash anything yourself**.
Also enable **"Allow API access"** under Settings → Security, or every call returns `401`.

`ILETI_API_KEY` / `ILETI_API_HASH` are accepted as migration aliases for pre-2.0 configs.

## Sending: sender headers & İYS compliance

- **Sender header (başlık):** 3–11 chars, must be BTK-approved before use. İletiMerkezi
  provides **`APITEST`** as a sandbox sender for development. Pass `sender` per call or set
  `ILETIMERKEZI_SENDER`.
- **İYS (İleti Yönetim Sistemi):** Turkey's national consent registry. Under Law 6563,
  **commercial/marketing** SMS require recipient consent; **transactional** messages
  (OTP, order/delivery/appointment/billing notifications) are exempt.

  `send_sms` exposes a `message_type` discriminator so you don't have to wire the raw flag:

  | `message_type` | Effect | Use for |
  |---|---|---|
  | `transactional` *(default)* | İYS check skipped (`iys=0`) | OTP, notifications, invoices |
  | `commercial` | Real-time İYS consent validation (`iys=1`) | Marketing / campaigns |

  Defaulting to `transactional` is the safe choice (it never wrongly blocks a legitimate
  OTP). **Set `message_type: "commercial"` for any marketing content.**

## Demo prompts

- "Send an OTP code 123456 to 5551234567 from APITEST."
- "Send a bulk commercial SMS to these numbers about our 20% discount."
- "How many SMS credits do I have left?"
- "List my approved sender headers."
- "Get the delivery report for order 4815162342."
- "Block 5559998877 from receiving messages."
- "Check whether 5551234567 has İYS consent for MESAJ under brand 100."

## Development

```bash
npm install
npm run dev          # run from source (tsx)
npm test             # vitest
npm run typecheck    # tsc --noEmit
npm run lint         # eslint + prettier --check
npm run build        # compile to dist/
```

### Live smoke test

With real credentials in `.env`, exercise the read-only tools first (`get_balance`,
`get_sender`), then a sandbox send with the `APITEST` sender header, then `get_report`
on the returned order id.

## License

[MIT](./LICENSE)
