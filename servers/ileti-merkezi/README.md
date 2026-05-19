# @theyahia/ileti-merkezi-mcp

> 📦 Part of **[WWmcp — Emerging Markets MCP](https://github.com/theYahia/WWmcp)** — 114 MCP servers for non-Western APIs (Brazil/MENA/Gulf/SE Asia/Africa/CIS).

> MCP server for **Ileti Merkezi** SMS API (Turkey) — single SMS, bulk SMS, delivery reports, contacts, blacklist.
> 8 tools. HMAC SHA256 auth. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/ileti-merkezi-mcp)](https://www.npmjs.com/package/@theyahia/ileti-merkezi-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### Migrating from v1.x

If you used v1.x, the v2.0.0 release adds Streamable HTTP transport and is built on `@theyahia/mcp-core`. Breaking changes:

- **Internal client class:** `IletiMerkeziClient` now wraps `BaseHttpClient` with a custom `IletiHmacStrategy`. The public `request(method, path, body?)` shape is unchanged.
- **Lazy init:** `new IletiMerkeziClient()` no longer throws when env vars are missing — they are read on the first request.
- **Tool errors:** now returned as MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`).
- **HTTP transport:** previously stdio-only. v2 adds HTTP via `--http` flag or `HTTP_PORT` env.

Tool names, arguments, return formats, and `ILETI_API_KEY`/`ILETI_SECRET` env vars are unchanged.

---

## Tools (8)

### Sending

| Tool | Description |
|------|-------------|
| `send_sms` | Send a single SMS. Optional `sender` (pre-approved name) and `schedule_at` (ISO 8601). |
| `send_bulk_sms` | Send the same SMS to multiple recipients in one call. |

### Reporting

| Tool | Description |
|------|-------------|
| `get_sms_report` | Delivery report for a sent SMS (by `message_id` or bulk `order_id`). |
| `get_balance` | Account balance and remaining SMS credits. |
| `list_senders` | List approved sender names/numbers. |

### Contacts & blacklist

| Tool | Description |
|------|-------------|
| `create_contact_group` | Create a new contact group. |
| `add_contacts` | Add contacts (phone + optional name/email) to a group. |
| `get_blacklist` | List blacklisted phone numbers (opt-outs and blocks). |

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
        "ILETI_API_KEY": "your_api_key",
        "ILETI_SECRET": "your_secret"
      }
    }
  }
}
```

### Cursor / Windsurf

Same configuration block under `mcpServers` in the IDE's MCP settings.

### VS Code (Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "ileti-merkezi": {
      "command": "npx",
      "args": ["-y", "@theyahia/ileti-merkezi-mcp"],
      "env": {
        "ILETI_API_KEY": "your_api_key",
        "ILETI_SECRET": "your_secret"
      }
    }
  }
}
```

### Streamable HTTP transport

```bash
HTTP_PORT=3000 ILETI_API_KEY=... ILETI_SECRET=... npx @theyahia/ileti-merkezi-mcp
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
| `ILETI_API_KEY` | yes | API key from your Ileti Merkezi panel. |
| `ILETI_SECRET` | yes | Secret key from your Ileti Merkezi panel. |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

Ileti Merkezi uses HMAC-style auth: each request sends `X-API-Key` and `X-API-Hash` headers, where the hash is SHA256(`apiKey + secret + ISO_timestamp`). The hash is recomputed on every request.

Get your credentials from the [Ileti Merkezi panel](https://www.iletimerkezi.com/) (Settings → API).

---

## 🚀 Demo prompts

> **Use case:** "Send OTP via Ileti Merkezi to +90551234567 with text 'Your code is 1234'"

🤖 **Pairs well with:**
- [`@theyahia/termii-mcp`](https://github.com/theYahia/termii-mcp)
- [`@theyahia/unifonic-mcp`](https://github.com/theYahia/unifonic-mcp)
- [`@theyahia/mts-exolve-mcp`](https://github.com/theYahia/mts-exolve-mcp)

Try these natural-language prompts in your MCP client:

> "Send an SMS to +905551234567 saying 'Your order is ready for pickup'."

> "Send bulk SMS to my VIP contact group about the 20% Bayram discount."

> "Check the delivery report for message msg_001."

> "How many SMS credits do I have left?"

> "Create a contact group called 'March Campaign' and add three contacts to it."

> "Show me the first 50 blacklisted numbers."

> "What sender names are approved on my account?"

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
│   ├── server.ts         — createServer factory + 8 tools defined inline
│   ├── client.ts         — IletiMerkeziClient + IletiHmacStrategy
│   └── types.ts          — TypeScript types for Ileti Merkezi responses
└── tests/
    ├── client.test.ts    — HMAC header generation, lazy init, body serialization
    └── server.test.ts    — createServer factory smoke
```

---

## License

MIT — see [LICENSE](./LICENSE).

---

## 🌍 Part of WWmcp — Emerging Markets MCP

**[WWmcp](https://github.com/theYahia/WWmcp)** ships 114 MCP servers covering APIs across Russia/CIS, MENA, Gulf, SE Asia, Africa, and Latin America — the markets ignored by Composio and other Western MCP hubs.

⭐ **Star the [monorepo](https://github.com/theYahia/WWmcp)** to support the project, or [open an issue](https://github.com/theYahia/WWmcp/issues) if your favorite non-Western API isn't covered yet.
