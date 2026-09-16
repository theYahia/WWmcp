# @theyahia/megaplan-mcp

> MCP server for **Megaplan** (Мегаплан) project management — tasks, deals, projects, employees, deal pipelines, CRM clients, comments via API v3.
> 18 tools + 2 MCP prompts. Token OR Password-grant auth. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/megaplan-mcp)](https://www.npmjs.com/package/@theyahia/megaplan-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### ⚠️ Migrating from v3.x and earlier

4.0.0 fixes a series of API v3 correctness bugs — the request shapes sent by earlier releases did not
match the real Megaplan v3 API — and expands the tool surface from 8 to 18. It is **breaking**:

- **List filtering & pagination rewritten.** v3 list endpoints take a nested `*Filter` JSON object and
  a `pageAfter` cursor, not `filter[field]=value` query params or `offset`. `filter_status` now takes
  status **code(s)** (e.g. `["filter_any"]`, account-specific), and `offset` is replaced by
  `page_after` (a cursor id, returned as `nextPageAfter`).
- **Comments fixed.** The endpoint is the plural `/{entity}/{id}/comments`, and `create_comment`'s
  text field is `content` (was `text`).
- **`create_task` deadline** is sent as a v3 `DateTime` object, not a bare string.
- **`create_deal`** sends `program` as a `Program` ref (was `DealProgram`), money as a `Money` object
  on the `price` field (was a bare number on `cost`), and `contact` as
  `ContractorHuman` / `ContractorCompany` (was `Contractor`) — see the new `contact_type` param.
- **Tool output is a compact summary** by default; pass `raw: true` for the raw API JSON.
- `MEGAPLAN_DOMAIN` is validated (bare host only) and a bare subdomain is expanded to
  `<sub>.megaplan.ru`.

---

## Tools (18) + Prompts (2)

### Tasks

| Tool | Description |
|------|-------------|
| `get_tasks` | List tasks, filtered by status code(s), responsible user, free-text search. |
| `get_task` | Get one task by ID with full details. |
| `create_task` | Create a task (name, description, responsible, deadline, parent task/project). |
| `update_task` | Update an existing task (name, description, responsible, deadline, status). |

### Deals & pipelines

| Tool | Description |
|------|-------------|
| `get_deals` | List deals, filtered by status code(s), responsible user, free-text search. |
| `get_deal` | Get one deal by ID with full details. |
| `create_deal` | Create a deal. Requires `program_id` — discover it via `get_deal_programs`. |
| `update_deal` | Update an existing deal (name, responsible, amount, description, status). |
| `get_deal_programs` | List deal programs (pipelines) — the only way to find a `program_id`. |
| `get_deal_program` | Get one deal program by ID. |

### Projects, people & clients

| Tool | Description |
|------|-------------|
| `get_projects` | List projects, filtered by status code(s) and search. |
| `get_project` | Get one project by ID. |
| `get_employees` | List employees with search and department filter. |
| `get_current_user` | The authenticated user's employee record (experimental endpoint). |
| `list_clients` | List CRM contractors: people (`human`) or organizations (`company`). |
| `get_client` | Get one client by type and ID. |

### Comments

| Tool | Description |
|------|-------------|
| `get_comments` | List comments on a task / deal / project. |
| `create_comment` | Add a comment to a task / deal / project. |

### MCP Prompts

| Prompt | Description |
|--------|-------------|
| `my-tasks-today` | "Мои задачи на сегодня" — resolves your employee id via `get_current_user`, then lists your active tasks by urgency. |
| `create-deal-wizard` | "Создай сделку" — lists pipelines via `get_deal_programs`, then walks through `create_deal`. |

Every list tool returns a compact `{ total, count, items, nextPageAfter }` summary; pass `raw: true`
for the untouched API JSON.

---

## Quick Start

### Claude Desktop — token auth

```json
{
  "mcpServers": {
    "megaplan": {
      "command": "npx",
      "args": ["-y", "@theyahia/megaplan-mcp"],
      "env": {
        "MEGAPLAN_DOMAIN": "yourcompany",
        "MEGAPLAN_TOKEN": "your_access_token"
      }
    }
  }
}
```

### Claude Desktop — login/password auth

```json
{
  "mcpServers": {
    "megaplan": {
      "command": "npx",
      "args": ["-y", "@theyahia/megaplan-mcp"],
      "env": {
        "MEGAPLAN_DOMAIN": "yourcompany",
        "MEGAPLAN_LOGIN": "user@example.com",
        "MEGAPLAN_PASSWORD": "your_password"
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
HTTP_PORT=3000 \
MEGAPLAN_DOMAIN=yourcompany \
MEGAPLAN_TOKEN=your_token \
npx @theyahia/megaplan-mcp
# or: npx @theyahia/megaplan-mcp --http
```

Endpoints:
- `POST /mcp` — MCP requests
- `GET /mcp` — SSE event stream (per session)
- `DELETE /mcp` — session termination
- `GET /health` — `{ status: "ok", version, tools, uptime, memory_mb }`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MEGAPLAN_DOMAIN` | yes | Your Megaplan subdomain (e.g. `mycompany` for `mycompany.megaplan.ru`). |
| `MEGAPLAN_TOKEN` | one of | Bearer access token (preferred — no auth roundtrip). |
| `MEGAPLAN_LOGIN` | one of | Login email (used with `MEGAPLAN_PASSWORD` if no token). |
| `MEGAPLAN_PASSWORD` | one of | Password (used with `MEGAPLAN_LOGIN` if no token). |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

---

## Authentication

Two options:

**Option A — Token (recommended):**
1. In Megaplan, go to **Settings → Integration → API**.
2. Generate an access token.
3. Use it as `MEGAPLAN_TOKEN`.

**Option B — Password grant:**
1. Use your Megaplan login email + password.
2. The server fetches an access token via `/api/v3/auth/access_token` on the first request and caches it in memory. On HTTP 401 the cache is cleared and re-auth happens automatically.

---

## Demo Prompts

Try these in your MCP client:

> "What active tasks do I have? Sort by urgency."

> "Create a task 'Review Q2 budget' assigned to user 42, deadline next Friday."

> "List the deal pipelines, then show me the deals in the Sales one."

> "Add a comment to deal 1234: 'Met with the client today, going to send proposal Monday.'"

> "List all employees in the 'Marketing' department."

> "Create a deal for 250,000 RUB in pipeline 1 — name 'Acme Corp annual contract'."

> Use the `my-tasks-today` MCP prompt to get a daily standup view.

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/megaplan-mcp build
pnpm --filter @theyahia/megaplan-mcp test
pnpm --filter @theyahia/megaplan-mcp dev   # tsx watch mode
```

Project layout:

```
servers/megaplan/
├── src/
│   ├── index.ts          — bin entry, runServer
│   ├── server.ts         — createServer factory + 18 tools + 2 prompts
│   ├── client.ts         — BaseHttpClient + MegaplanAuthStrategy (token OR Password grant)
│   ├── query.ts          — v3 list-query / filter-term / DateTime / Money builders
│   ├── format.ts         — compact, LLM-friendly output (with a raw escape hatch)
│   ├── prompts.ts        — MCP prompt definitions
│   ├── types.ts          — shapes of the formatted output
│   └── tools/
│       ├── comments.ts    contractors.ts   deals.ts
│       ├── employees.ts   me.ts            programs.ts
│       └── projects.ts    tasks.ts
└── tests/
    ├── client.test.ts    — domain guard, v3 query encoding, password grant, error bodies
    ├── tools.test.ts     — request shapes for all 18 tools + id path-traversal guard
    ├── format.test.ts    — envelope unwrapping and entity formatting
    ├── prompts.test.ts   — prompts steer toward the right tools
    └── server.test.ts    — in-memory MCP client: 18 tools + 2 prompts
```

---

## License

MIT — see [LICENSE](./LICENSE).

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
