# @theyahia/ileti-merkezi-mcp

> MCP server for the **İletiMerkezi** SMS API (Turkey) — SMS/OTP, bulk sending, delivery reports, sender headers, blacklist, İYS consent.
> 11 tools. Panel-issued key + hash auth. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/ileti-merkezi-mcp)](https://www.npmjs.com/package/@theyahia/ileti-merkezi-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### ⚠️ Migrating from v3.x and earlier

Every release before 4.0.0 targeted a **fabricated** API surface (header auth `X-API-Key` / `X-API-Hash` with a client-side SHA256, and REST paths like `/send-sms`, `/contacts/groups`) that does not exist at İletiMerkezi. 4.0.0 is a complete rewrite against the real v1 JSON API and is **breaking**:

- **Auth moved into the request body.** Credentials are sent as `request.authentication.{key, hash}`. All client-side hashing is gone — the panel issues both values already paired.
- **Env vars changed:** `ILETIMERKEZI_API_KEY` + `ILETIMERKEZI_API_HASH`. `ILETI_SECRET` no longer exists. `ILETI_API_KEY` / `ILETI_API_HASH` are accepted as migration aliases.
- **Tools removed** (no real endpoint): `send_bulk_sms`, `create_contact_group`, `add_contacts`. Bulk sending is `send_sms` with an array of numbers.
- **Tools renamed:** `list_senders` → `get_sender`, `get_sms_report` → `get_report`.
- **Tools added:** `cancel_order`, `get_reports`, `add_blacklist`, `delete_blacklist`, `iys_register`, `iys_check`.

---

## Tools (11)

### Sending

| Tool | Description |
|------|-------------|
| `send_sms` | Send to one recipient or many (bulk, up to 50 000) — `to` takes a string or an array. `message_type` (`transactional` / `commercial`) drives the İYS consent flag. Optional `schedule_at` (`DD/MM/YYYY HH:MM`). |
| `cancel_order` | Cancel a future-scheduled order before it is dispatched. |

### Reporting

| Tool | Description |
|------|-------------|
| `get_report` | Per-recipient delivery report for one order id (paginated). |
| `get_reports` | Order summaries within a date range (`YYYY-MM-DD`, range ≤ 10 days). |
| `get_balance` | Account balance (TL) and remaining SMS credits. |
| `get_sender` | Approved sender headers (başlık) on the account. |

### Blacklist

| Tool | Description |
|------|-------------|
| `get_blacklist` | List blocked numbers, optionally filtered by a datetime range. |
| `add_blacklist` | Block a number (idempotent). |
| `delete_blacklist` | Unblock a number. |

### İYS consent (Turkey, Law 6563)

| Tool | Description |
|------|-------------|
| `iys_register` | Register consent records in batch (1–5000, atomic). |
| `iys_check` | Look up one recipient's consent status (ONAY / RET) for a brand + channel. |

Status codes surfaced in tool output: order `113 SENDING` / `114 COMPLETED` / `115 CANCELED`; message `110 WAITING` / `111 DELIVERED` / `112 UNDELIVERED`.

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ileti-merkezi": {
      "command": "npx",
      "args": ["-y", "@theyahia/ileti-merkezi-mcp"],
      "env": {
        "ILETIMERKEZI_API_KEY": "your_api_key",
        "ILETIMERKEZI_API_HASH": "your_api_hash",
        "ILETIMERKEZI_SENDER": "APITEST"
      }
    }
  }
}
```

### Cursor / Windsurf

Same configuration block under `mcpServers` in the IDE's MCP settings.

### VS Code (Copilot)

Same shape under `.vscode/mcp.json` `servers` key.

### Streamable HTTP transport

```bash
HTTP_PORT=3000 ILETIMERKEZI_API_KEY=... ILETIMERKEZI_API_HASH=... npx @theyahia/ileti-merkezi-mcp
# or: npx @theyahia/ileti-merkezi-mcp --http
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
| `ILETIMERKEZI_API_KEY` | yes | API key from the panel (alias: `ILETI_API_KEY`). |
| `ILETIMERKEZI_API_HASH` | yes | API hash from the panel — **precomputed, do not hash anything yourself** (alias: `ILETI_API_HASH`). |
| `ILETIMERKEZI_SENDER` | no | Default sender header when `send_sms` omits `sender` (alias: `ILETI_SENDER`). |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

Both values are issued — already paired — from **panel.iletimerkezi.com → Settings → Security → API Access**. Copy them as-is; the panel precomputes the hash. Also switch on **"Allow API access"** under Settings → Security, otherwise the API answers 401.

Reference: [İletiMerkezi authentication docs](https://www.iletimerkezi.com/docs/api/authentication).

Sandbox: send with sender header `APITEST`.

---

## Demo Prompts

> "Send an SMS to 5551234567 saying 'Siparişiniz kargoya verildi'."

> "Send this 20% Bayram discount to these 400 numbers — it's marketing, handle the İYS consent."

> "How many SMS credits do I have left?"

> "Show the delivery report for order 4471029."

> "Which sender headers are approved on my account?"

> "Block 5559998877 from receiving any further SMS."

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/ileti-merkezi-mcp build
pnpm --filter @theyahia/ileti-merkezi-mcp test
pnpm --filter @theyahia/ileti-merkezi-mcp dev   # tsx watch mode
```

Project layout:

```
servers/ileti-merkezi/
├── src/
│   ├── index.ts          — bin entry, runServer
│   ├── server.ts         — createServer factory + 11 tools defined inline
│   ├── client.ts         — request-envelope client over BaseHttpClient
│   ├── schemas.ts        — zod input shapes (phone/date/İYS validators)
│   ├── errors.ts         — API status-code maps + actionable guidance
│   └── responses.ts      — type-safe response highlights
└── tests/
    ├── client.test.ts    — envelope, credential aliases, 4xx pass-through
    └── server.test.ts    — in-memory MCP client: tool list, send_sms, İYS flag
```

---

## License

MIT — see [LICENSE](./LICENSE).

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
