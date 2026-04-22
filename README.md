# MCP Servers for Russian & CIS APIs

[![npm org](https://img.shields.io/badge/npm-%40theyahia-cb3837?logo=npm)](https://www.npmjs.com/org/theyahia)
[![Build](https://img.shields.io/github/actions/workflow/status/theYahia/mcp-servers/ci.yml?branch=main&label=build)](https://github.com/theYahia/mcp-servers/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Servers](https://img.shields.io/badge/MCP%20servers-48-green)](#full-ecosystem)

The single entry point for Russian, Uzbek, and Kazakh API services through [Model Context Protocol](https://modelcontextprotocol.io).
48 servers published on npm, 11 migrated to a production-grade monorepo with shared core.
Think **Composio for CIS** -- connect any LLM to ERP, delivery, payments, bank rates, and company data APIs used across the Russian-speaking market.

---

## Quick Start

**1. Install any server with npx (no setup needed):**

```bash
npx -y @theyahia/moysklad-mcp
```

**2. Add it to your AI client config** (see [Configuration](#configuration) below):

```json
{
  "mcpServers": {
    "moysklad": {
      "command": "npx",
      "args": ["-y", "@theyahia/moysklad-mcp"],
      "env": {
        "MOYSKLAD_TOKEN": "your-bearer-token"
      }
    }
  }
}
```

**3. Use it from your LLM:**

> "Show me current stock levels for SKU LED-500"

The AI calls `get_stock` with the product name, gets structured data back, and responds in natural language.

---

## Migrated Servers

11 servers are migrated to the monorepo with shared `@theyahia/mcp-core` (errors with `isError: true`, HTTP client with retry, auth strategies, structured logging, dual transport).

| Package | Service | Tools | Auth | Description |
|---------|---------|:-----:|------|-------------|
| `@theyahia/moysklad-mcp` | МойСклад | 10 | Bearer / Basic | ERP & inventory -- products, stock, orders, counterparties, supplies, profit reports. Token bucket rate limiting (45 req/3s). |
| `@theyahia/cdek-mcp` | СДЭК | 8 | OAuth2 | Delivery -- calculate tariffs, create/track orders, find pickup points, generate barcodes. |
| `@theyahia/cbr-mcp` | ЦБ РФ | 5 | None | Central Bank of Russia -- currency rates, key rate, precious metals, conversion. |
| `@theyahia/cbu-mcp` | ЦБ Узбекистана | 5 | None | Central Bank of Uzbekistan -- currency rates, conversion, dynamics. |
| `@theyahia/bitrix24-mcp` | Bitrix24 | 4 | Webhook URL | CRM -- deals, contacts, tasks via webhook API. |
| `@theyahia/cloudpayments-mcp` | CloudPayments | 6 | Basic | Payments -- charge, authorize, confirm, void, refund, find transaction. |
| `@theyahia/tkassa-mcp` | Т-Касса | 5 | SHA-256 token | T-Bank (Tinkoff) payments -- init, confirm, cancel, get state, refund. |
| `@theyahia/robokassa-mcp` | Робокасса | 2 | MD5 signature | Payments -- generate payment URLs, check invoice status. |
| `@theyahia/getcourse-mcp` | GetCourse | 3 | API key | EdTech platform -- users, deals, create/update users. |
| `@theyahia/payme-mcp` | Payme | 10 | X-Auth header | Uzbekistan payments -- cards, payments, receipts via JSON-RPC 2.0. |
| `@theyahia/travelpayouts-mcp` | Travelpayouts | 3 | Token param | Travel -- flight search, popular routes, price calendar. |

**Total: 66 tools across 11 servers.**

---

## Full Ecosystem

48 MCP servers are published on npm under the [@theyahia](https://www.npmjs.com/org/theyahia) organization, covering:

- **ERP & CRM** -- МойСклад, Bitrix24, amoCRM, 1C
- **Payments** -- CloudPayments, Робокасса, Т-Касса, ЮKassa, Payme, Click
- **Delivery** -- СДЭК, Boxberry, DPD, Почта России
- **Data & Compliance** -- DaData (31 tools), ЦБ РФ, ЦБ Узбекистана, ЕГРЮЛ
- **Communication** -- SMS.ru, Unisender, SendPulse
- **Travel & Transport** -- Travelpayouts, Aviasales, RZD
- **EdTech** -- GetCourse

Browse the full list: [npmjs.com/org/theyahia](https://www.npmjs.com/org/theyahia)

---

## Configuration

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "moysklad": {
      "command": "npx",
      "args": ["-y", "@theyahia/moysklad-mcp"],
      "env": {
        "MOYSKLAD_TOKEN": "your-bearer-token"
      }
    },
    "cdek": {
      "command": "npx",
      "args": ["-y", "@theyahia/cdek-mcp"],
      "env": {
        "CDEK_CLIENT_ID": "your-client-id",
        "CDEK_CLIENT_SECRET": "your-client-secret"
      }
    },
    "cbr": {
      "command": "npx",
      "args": ["-y", "@theyahia/cbr-mcp"],
      "env": {}
    }
  }
}
```

### Cursor

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "moysklad": {
      "command": "npx",
      "args": ["-y", "@theyahia/moysklad-mcp"],
      "env": {
        "MOYSKLAD_TOKEN": "your-bearer-token"
      }
    }
  }
}
```

### Continue.dev + GigaChat

Claude is blocked in Russia. Use [Continue.dev](https://continue.dev) with GigaChat via [gpt2giga](https://github.com/ai-forever/gpt2giga) proxy:

```json
{
  "models": [
    {
      "title": "GigaChat via gpt2giga",
      "provider": "openai",
      "model": "GigaChat-Pro",
      "apiBase": "http://localhost:8090/v1",
      "apiKey": "your-gigachat-credentials"
    }
  ],
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@theyahia/moysklad-mcp"],
          "env": {
            "MOYSKLAD_TOKEN": "your-bearer-token"
          }
        }
      }
    ]
  }
}
```

### n8n

Use the **MCP Client Tool** node in n8n with Streamable HTTP transport:

1. Start the server with HTTP transport:
   ```bash
   MOYSKLAD_TOKEN=your-token TRANSPORT=http PORT=3100 npx -y @theyahia/moysklad-mcp
   ```
2. In n8n, add an **MCP Client Tool** node pointing to `http://localhost:3100/mcp`.
3. Connect it to any AI Agent node (OpenAI, Anthropic, GigaChat).

---

## Use Case: AI Manager for an Online Store

Connect МойСклад + СДЭК + DaData to handle a complete order workflow through natural language:

**User prompt:**
> "Create an order for OOO Romashka: 50x LED-500 lamps. Calculate CDEK delivery to Novosibirsk. Check the company details first."

**What the AI does (3 servers, 5 tool calls):**

1. **DaData** `suggest_company` -- finds OOO Romashka by name, returns INN, KPP, legal address, CEO name
2. **МойСклад** `search_products` -- finds "LED-500" in the product catalog, confirms price and availability
3. **МойСклад** `get_stock` -- checks that 50 units are in stock
4. **СДЭК** `calculate_tariff` -- calculates delivery cost and estimated days from warehouse to Novosibirsk
5. **МойСклад** `create_order` -- creates the customer order with the verified counterparty and line items

**AI response:**
> Order #MS-4821 created for OOO Romashka (INN 7707123456).
> 50x LED-500 at 890 RUB = 44,500 RUB.
> CDEK delivery to Novosibirsk: 2,340 RUB, 4-6 business days (tariff "warehouse-door").
> Total: 46,840 RUB.

---

## Architecture

```
mcp-servers/
├── packages/
│   └── core/                       @theyahia/mcp-core
│       ├── errors.ts               createToolError() + withErrorHandling()
│       ├── client.ts               BaseHttpClient, RateLimitedClient
│       ├── auth/                   ApiKey, Basic, OAuth2, Dual, NoAuth
│       ├── format.ts               formatResponse(), currency formatters
│       ├── logging.ts              createLogger() -> stderr JSON
│       ├── server.ts               runServer() — stdio + Streamable HTTP
│       └── testing/smoke.ts        E2E smoke test runner
│
├── servers/
│   ├── _template/                  Scaffold for new servers (~30 min)
│   ├── moysklad/                   10 tools, rate-limited
│   ├── cdek/                       8 tools, OAuth2 flow
│   ├── cbr/                        5 tools, no auth
│   ├── cbu/                        5 tools, no auth
│   ├── bitrix24/                   4 tools, webhook
│   ├── cloudpayments/              6 tools, Basic auth
│   ├── tkassa/                     5 tools, SHA-256
│   ├── robokassa/                  2 tools, MD5 signature
│   ├── getcourse/                  3 tools, API key
│   ├── payme/                      10 tools, JSON-RPC 2.0
│   └── travelpayouts/             3 tools, token param
│
├── .github/workflows/
│   ├── ci.yml                      Build + test (Turborepo filtered)
│   ├── e2e.yml                     E2E smoke tests per server
│   └── release.yml                 Changesets -> npm publish
│
├── turbo.json                      Task pipeline config
├── pnpm-workspace.yaml             Workspace definitions
└── tsconfig.base.json              Shared TypeScript config
```

**Key design decisions:**

- **`isError: true`** on all error responses -- LLMs can detect failures and self-recover instead of hallucinating
- **Dual transport** -- every server runs as stdio (Claude Desktop, Cursor) or Streamable HTTP (n8n, custom apps) via a single `TRANSPORT` env var
- **Shared auth strategies** -- OAuth2 token refresh, Basic auth, API key injection, webhook URL parsing are all handled by `@theyahia/mcp-core`
- **Rate limiting** -- МойСклад enforces 45 req/3s via token bucket; the pattern is reusable for any rate-limited API
- **Filtered CI** -- Turborepo only builds and tests packages affected by the current changeset

---

## Development

```bash
# Clone and install
git clone https://github.com/theYahia/mcp-servers.git
cd mcp-servers
pnpm install

# Build everything
pnpm build

# Build a specific server
pnpm build --filter=@theyahia/cdek-mcp

# Run tests
pnpm test

# Run E2E smoke tests (requires API credentials)
pnpm test:e2e

# Create a new server from template
cp -r servers/_template servers/your-service
# Edit package.json, src/index.ts, and you're ready
```

## Contributing

Contributions are welcome. The easiest way to start:

1. Pick a server from the [npm org](https://www.npmjs.com/org/theyahia) that hasn't been migrated to the monorepo yet
2. Use `servers/_template` as a scaffold
3. Follow the patterns in existing servers (especially `cbr` for simple APIs or `moysklad` for complex ones)
4. Open a PR with tests

See [open issues](https://github.com/theYahia/mcp-servers/issues) for tasks labeled `good first issue`.

---

## License

[MIT](LICENSE) -- built by [@theyahia](https://github.com/theYahia).
