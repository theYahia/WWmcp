# @theyahia/amocrm-mcp

Production-grade MCP server for [amoCRM](https://www.amocrm.ru/) API. 19 tools covering leads, contacts, companies, pipelines, tasks, notes, search, events, and unsorted leads. OAuth 2.0 with automatic token refresh. Rate limiting (7 req/sec). Retry with exponential backoff.

## Installation

```bash
npx -y @theyahia/amocrm-mcp
```

## MCP Configuration

Add to your Claude Desktop, Cursor, or any MCP client config:

```json
{
  "mcpServers": {
    "amocrm": {
      "command": "npx",
      "args": ["-y", "@theyahia/amocrm-mcp"],
      "env": {
        "AMOCRM_SUBDOMAIN": "mycompany",
        "AMOCRM_ACCESS_TOKEN": "your-access-token",
        "AMOCRM_REFRESH_TOKEN": "your-refresh-token",
        "AMOCRM_CLIENT_ID": "your-client-id",
        "AMOCRM_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AMOCRM_SUBDOMAIN` | Yes | Your amoCRM subdomain (e.g. `mycompany` from `mycompany.amocrm.ru`) |
| `AMOCRM_ACCESS_TOKEN` | Yes | OAuth access token |
| `AMOCRM_REFRESH_TOKEN` | No | OAuth refresh token (enables auto-refresh on 401) |
| `AMOCRM_CLIENT_ID` | No | OAuth client ID (required for token refresh) |
| `AMOCRM_CLIENT_SECRET` | No | OAuth client secret (required for token refresh) |

> `AMOCRM_DOMAIN` is also accepted as an alias for `AMOCRM_SUBDOMAIN` (backwards compatibility).

## Tools (19)

### Leads
| Tool | Description |
|------|-------------|
| `list_leads` | Search and list deals with filters (pipeline, statuses, query). Embed contacts, loss reasons. |
| `get_lead` | Get a single lead by ID with linked contacts and catalog elements. |
| `create_lead` | Create a new lead with name, price, pipeline, status, custom fields. |
| `update_lead` | Update lead fields — move between stages, change price, reassign. |

### Contacts
| Tool | Description |
|------|-------------|
| `list_contacts` | Search contacts by name, phone, email. |
| `get_contact` | Get a single contact with all custom fields. |
| `create_contact` | Create a contact with phone, email, and custom fields. |

### Companies
| Tool | Description |
|------|-------------|
| `list_companies` | Search companies. Embed linked leads and contacts. |
| `create_company` | Create a company with custom fields. |

### Pipelines
| Tool | Description |
|------|-------------|
| `list_pipelines` | List all sales pipelines with their statuses (stages). |

### Tasks
| Tool | Description |
|------|-------------|
| `list_tasks` | List tasks filtered by entity, completion, responsible user. |
| `create_task` | Create a task linked to a lead/contact/company with deadline. |
| `complete_task` | Mark task as done and add result text. |

### Unsorted
| Tool | Description |
|------|-------------|
| `list_unsorted` | List incoming unsorted leads (forms, email parsing). |
| `accept_unsorted` | Accept an unsorted lead into a pipeline. |

### Notes
| Tool | Description |
|------|-------------|
| `add_note` | Add a note (common, call_in, call_out, service_message) to any entity. |

### Search
| Tool | Description |
|------|-------------|
| `search` | Universal search across leads, contacts, and companies. |

### Events
| Tool | Description |
|------|-------------|
| `list_events` | Activity log — status changes, calls, notes, links. |

### Account
| Tool | Description |
|------|-------------|
| `get_account` | Account info, users, task types, amojo settings. |

## Demo Prompts

**Sales overview:**
> "Show me all leads in the 'Sales' pipeline that are currently in the 'Negotiation' stage. Include contact info."

**Task management:**
> "Create a follow-up call task for lead #12345, deadline tomorrow at 10:00 AM. Then list all my incomplete tasks."

**New client onboarding:**
> "Create a contact 'Ivan Petrov' with phone +79001234567, then create a company 'Petrov Solutions' and a lead 'Website Development' for 150,000 RUB in the main pipeline."

## OAuth 2.0 Setup Guide

1. Go to your amoCRM account settings: `https://YOUR_SUBDOMAIN.amocrm.ru/settings/widgets/`
2. Create a new integration (external integration)
3. Set the redirect URI to `https://YOUR_SUBDOMAIN.amocrm.ru`
4. Copy the **Client ID** and **Client Secret**
5. Authorize the integration to get the initial **Authorization Code**
6. Exchange the code for tokens:

```bash
curl -X POST https://YOUR_SUBDOMAIN.amocrm.ru/oauth2/access_token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "grant_type": "authorization_code",
    "code": "YOUR_AUTH_CODE",
    "redirect_uri": "https://YOUR_SUBDOMAIN.amocrm.ru"
  }'
```

7. Save the `access_token` and `refresh_token` from the response
8. The server will automatically refresh expired tokens if `AMOCRM_REFRESH_TOKEN`, `AMOCRM_CLIENT_ID`, and `AMOCRM_CLIENT_SECRET` are set

## Error Handling

- **401 Unauthorized**: Auto-refreshes token if refresh credentials are configured, then retries
- **429 Rate Limited**: Exponential backoff retry (up to 3 attempts)
- **5xx Server Errors**: Exponential backoff retry (up to 3 attempts)
- **Rate Limiting**: Token bucket of 7 requests/second to stay within amoCRM limits

## Development

```bash
git clone https://github.com/theYahia/WWmcp.git
cd WWmcp
pnpm install
pnpm --filter @theyahia/amocrm-mcp build
pnpm --filter @theyahia/amocrm-mcp test
```

Part of the [WWmcp](https://github.com/theYahia/WWmcp) monorepo — shared HTTP client, auth,
retries and error handling come from `@theyahia/mcp-core`.

## Transports

- **stdio** (default) — for Claude Desktop, Cursor, and other local MCP clients
- **Streamable HTTP** — run with `--http` or set `HTTP_PORT`; exposes `/mcp` and `/health`

## License

MIT

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
