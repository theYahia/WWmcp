# @theyahia/vk-ads-mcp

> MCP server for **VK Ads** API — campaigns, ads, statistics, targeting, budgets.
> 8 tools. Bearer auth. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/vk-ads-mcp)](https://www.npmjs.com/package/@theyahia/vk-ads-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### Migrating from v1.x

If you used v1.x, the v2.0.0 release adds Streamable HTTP transport and is built on `@theyahia/mcp-core`. Breaking changes:

- **Internal client:** now extends `BaseHttpClient` with `ApiKeyStrategy`. The exported `apiGet`/`apiPost` functional API is unchanged, so tool code keeps working.
- **Tool errors:** now returned as MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`). Compatible with all MCP clients.
- **Single bin entrypoint:** previously stdio-only via `dist/index.js`. v2 adds HTTP via `--http` flag or `HTTP_PORT` env on the same binary.

Tool names, arguments, return formats, and the `VK_ADS_TOKEN` env var are unchanged.

---

## Tools (8)

### Campaigns

| Tool | Description |
|------|-------------|
| `list_campaigns` | List campaigns in an account. Supports `status` filter (active / blocked / deleted). |
| `create_campaign` | Create a new campaign (name, type, budget in kopecks). |
| `update_campaign` | Update name, budget, or status (start/stop). |

### Ads

| Tool | Description |
|------|-------------|
| `list_ads` | List ads inside one or more campaigns. |
| `create_ad` | Create an ad — text/image/video format with title, description, link URL. |

### Reporting

| Tool | Description |
|------|-------------|
| `get_statistics` | Impressions, clicks, spend over a date range — grouped by day/week/month/overall. |
| `list_targeting_groups` | List targeting groups for a campaign. |
| `get_budget` | Account budget — remaining balance and spending limits. |

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vk-ads": {
      "command": "npx",
      "args": ["-y", "@theyahia/vk-ads-mcp"],
      "env": {
        "VK_ADS_TOKEN": "your_token"
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
    "vk-ads": {
      "command": "npx",
      "args": ["-y", "@theyahia/vk-ads-mcp"],
      "env": { "VK_ADS_TOKEN": "your_token" }
    }
  }
}
```

### Streamable HTTP transport

For remote/multi-tenant deployments:

```bash
HTTP_PORT=3000 VK_ADS_TOKEN=your_token npx @theyahia/vk-ads-mcp
# or: npx @theyahia/vk-ads-mcp --http
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
| `VK_ADS_TOKEN` | yes | Bearer token from your VK Ads account. |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

Get your VK Ads API token:

1. Log in to [ads.vk.com](https://ads.vk.com).
2. Open **Tools → API access** in your VK Ads account.
3. Generate a new token with permissions for the operations you need (read/write campaigns, statistics, etc.).
4. Use the token as `VK_ADS_TOKEN`.

---

## Demo Prompts

Try these natural-language prompts in your MCP client:

> "List all active campaigns in account 12345."

> "Create a campaign 'Summer 2026 Sale' in account 12345 with a budget of 500 rubles (50000 kopecks)."

> "Show me statistics for campaign 67890 from January 1 to March 31, 2026 — daily breakdown."

> "Pause campaign 67890."

> "What's the remaining budget on account 12345?"

> "List all ads in campaigns 67890 and 67891 — I want to compare formats."

> "Show me targeting groups for campaign 67890."

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/vk-ads-mcp build
pnpm --filter @theyahia/vk-ads-mcp test
pnpm --filter @theyahia/vk-ads-mcp dev   # tsx watch mode
```

Project layout:

```
servers/vk-ads/
├── src/
│   ├── index.ts          — bin entry, runServer
│   ├── server.ts         — createServer factory + tool registration
│   ├── client.ts         — BaseHttpClient + ApiKeyStrategy + apiGet/apiPost helpers
│   └── tools/
│       ├── ads.ts
│       ├── budget.ts
│       ├── campaigns.ts
│       ├── statistics.ts
│       └── targeting.ts
└── tests/
    ├── client.test.ts
    ├── server.test.ts
    └── tools.test.ts
```

---

## License

MIT — see [LICENSE](./LICENSE).
