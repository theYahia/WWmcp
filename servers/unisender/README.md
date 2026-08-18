# @theyahia/unisender-mcp

MCP server for [UniSender](https://affiliate.unisender.com) API — lists, contacts, campaigns, templates, statistics.

> **[Sign up for UniSender via referral link](https://affiliate.unisender.com)** — 50% first payment + 25% recurring.

[![npm](https://img.shields.io/npm/v/@theyahia/unisender-mcp)](https://www.npmjs.com/package/@theyahia/unisender-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Smithery](https://smithery.ai/badge/@theyahia/unisender-mcp)](https://smithery.ai/server/@theyahia/unisender-mcp)

## Install

### Claude Desktop

```json
{
  "mcpServers": {
    "unisender": {
      "command": "npx",
      "args": ["-y", "@theyahia/unisender-mcp"],
      "env": {
        "UNISENDER_API_KEY": "your_key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add unisender -e UNISENDER_API_KEY=your_key -- npx -y @theyahia/unisender-mcp
```

### Smithery

```bash
npx @smithery/cli install @theyahia/unisender-mcp
```

### Streamable HTTP

```bash
UNISENDER_API_KEY=your_key npx @theyahia/unisender-mcp --http
# Server on http://localhost:3000/mcp
# Health check: GET http://localhost:3000/health
```

## Auth

`UNISENDER_API_KEY` — API key from UniSender. Get one: [API Settings](https://www.unisender.com/ru/support/api/common/api-key/).

Base URL: `https://api.unisender.com/ru/api/`

## Tools (10)

### Lists
| Tool | Description |
|------|-------------|
| `get_lists` | Get all mailing lists: ID, title, subscriber count |
| `create_list` | Create a new mailing list |

### Contacts
| Tool | Description |
|------|-------------|
| `get_contacts` | Get contacts from a list: email, subscription status |
| `subscribe` | Subscribe a contact to mailing list(s) |

### Campaigns
| Tool | Description |
|------|-------------|
| `create_email` | Create an email message for a campaign |
| `send_email` | Send a campaign with a created message |
| `get_campaign_status` | Get campaign status |
| `get_campaign_delivery_stats` | Detailed delivery statistics |

### Templates
| Tool | Description |
|------|-------------|
| `get_templates` | List email templates |
| `get_template` | Get a specific template by ID |

## Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `skill-send-campaign` | "Send campaign" | Full flow: list -> email -> send |
| `skill-campaign-stats` | "Campaign stats" | Status + detailed analytics |

## Example prompts

```
Show all mailing lists
Create a list called "VIP Clients"
Subscribe user@example.com to list 123
Create an email with subject "Sale" and send to list 123
Campaign 456 statistics
Show email templates
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## UniSender

[UniSender](https://affiliate.unisender.com) — email and SMS marketing service. 50% first payment + 25% recurring via [referral link](https://affiliate.unisender.com).

## License

MIT
