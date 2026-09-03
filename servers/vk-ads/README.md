# @theyahia/vk-ads-mcp

> MCP server for the **VK Ads API v2** (`ads.vk.com/api/v2`) — campaigns (ad_plans), ad groups, ads (banners), statistics, account balance.
> 8 tools. Bearer auth with optional refresh_token rotation. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/vk-ads-mcp)](https://www.npmjs.com/package/@theyahia/vk-ads-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### ⚠️ Migrating from v3.x and earlier

Every release before 4.0.0 called legacy `api.vk.com` / myTarget v1 endpoints
(`/campaigns.json`, `/ads.json`, `/budget.json`, `/targeting_groups.json`) that do not exist on
`ads.vk.com/api/v2`. 4.0.0 rewrites the whole API layer against the official `target.vk.ru`
documentation. **Breaking:**

- **`account_id` removed from every tool** — the cabinet is determined by the OAuth token.
- **Campaigns are `ad_plans`.** `list/create/update_campaign` now hit `/ad_plans.json`;
  update is `POST /ad_plans/{id}.json` (id in the path).
- **Campaign lifecycle:** `status: 1|0` → `action: activate | stop | delete`.
- **Budgets:** `all_limit` (kopecks) → `budget_limit` / `budget_limit_day` **in the cabinet
  currency** (roubles for RUB).
- **Campaign goal:** `type` → `objective`.
- **Ads are `banners`.** `create_ad` takes `{ad_group_id, textblocks, urls, content}` instead of
  `{campaign_id, ad_format, title, description, link_url}`.
- **Statistics:** `GET /statistics/{object_type}/{period}.json` with path segments;
  `period` is `day` or `summary` only, and impressions are called **`shows`**.
- **`list_targeting_groups` → `list_ad_groups`** (`/ad_groups.json` — targeting/delivery lives on
  the ad group).
- **`get_budget` → `get_account`** (`/user.json`; the balance field needs the OAuth scope
  `read_payments`).

Unverified request details are marked `// VERIFY:` in the source — they follow the official docs
and five independent working clients, but have not been exercised against a live cabinet.

---

## Tools (8)

Model: **ad_plans** (campaigns) → **ad_groups** → **banners** (ads).

### Campaigns (ad_plans)

| Tool | Description |
|------|-------------|
| `list_campaigns` | List campaigns with a `status` filter (active / blocked / deleted). Auto-paginates. |
| `create_campaign` | Create a campaign: `name`, `objective`, `budget_limit` / `budget_limit_day`. |
| `update_campaign` | Rename, rebudget, or run the lifecycle (`activate` / `stop` / `delete`). |

### Ad groups & ads

| Tool | Description |
|------|-------------|
| `list_ad_groups` | Ad groups with their targeting/delivery, filtered by campaign. Auto-paginates. |
| `list_ads` | Banners, filtered by ad group. Auto-paginates. |
| `create_ad` | Create a banner in an ad group: `textblocks`, `urls`, `content` (ids of already-uploaded creatives). |

### Reporting

| Tool | Description |
|------|-------------|
| `get_statistics` | `shows`, clicks and spend for campaigns / ad_groups / banners / users; `day` or `summary`, up to 92 days and 200 ids. |
| `get_account` | Cabinet info and balance (`/user.json`, needs scope `read_payments`). |

Read tools carry `readOnlyHint` and return `structuredContent` alongside the text block;
`create_*` and `update_campaign` are annotated as writes.

There is no tool to create an ad group or upload a creative — do both in the VK Ads cabinet,
then reference their ids from `create_ad`.

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
| `VK_ADS_TOKEN` | yes | Bearer access token from your VK Ads cabinet. |
| `VK_ADS_CLIENT_ID` | no | OAuth client id — with the two below, an expired token is refreshed automatically. |
| `VK_ADS_CLIENT_SECRET` | no | OAuth client secret. |
| `VK_ADS_REFRESH_TOKEN` | no | Refresh token. |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

Get your VK Ads API token:

1. Log in to [ads.vk.com](https://ads.vk.com).
2. Open **Tools → API access** in your VK Ads account.
3. Generate a token with the scopes you need (read/write ads, statistics; `read_payments` for the balance).
4. Use the token as `VK_ADS_TOKEN`.

A VK Ads `access_token` lives 24 hours. Set `VK_ADS_CLIENT_ID`, `VK_ADS_CLIENT_SECRET` and
`VK_ADS_REFRESH_TOKEN` as well and the server renews it on the first 401 instead of failing.
Agency cabinets authenticate with `agency_client_credentials` — the token itself selects the
cabinet, which is why no tool takes an `account_id`.

---

## Demo Prompts

Try these natural-language prompts in your MCP client:

> "List all active campaigns."

> "Create a campaign 'Summer 2026 Sale' with objective traffic and a daily budget of 2000 roubles."

> "Show me statistics for campaigns 67890 and 67891 from January 1 to March 31, 2026, day by day."

> "Stop campaign 67890."

> "What's my balance and how long does it last at last week's spend?"

> "List the ad groups under campaign 67890, then the banners in each."

> "Which banner has the worst CTR this month?"

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
│   ├── server.ts         — createServer factory, registerTool + annotations + outputSchema
│   ├── client.ts         — BaseHttpClient + refresh-token auth + auto-pagination
│   ├── errors.ts         — defensive parsing of VK Ads' three error shapes
│   └── tools/
│       ├── ad_plans.ts    — campaigns
│       ├── ad_groups.ts   — ad groups (targeting/delivery)
│       ├── banners.ts     — ads
│       ├── statistics.ts
│       └── account.ts
└── tests/
    ├── tools.test.ts     — request shapes, pagination, retry policy, error parsing, refresh
    └── server.test.ts    — in-memory MCP client: 8 tools + annotations
```

---

## License

MIT — see [LICENSE](./LICENSE).

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
