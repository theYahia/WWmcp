# @theyahia/megaplan-mcp

> 📦 Part of **[WWmcp — Emerging Markets MCP](https://github.com/theYahia/WWmcp)** — 114 MCP servers for non-Western APIs (Brazil/MENA/Gulf/SE Asia/Africa/CIS).

> MCP server for **Megaplan** project management — tasks, deals, projects, employees, comments via API v3.
> 8 tools + 2 MCP prompts. Token OR Password-grant auth. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/megaplan-mcp)](https://www.npmjs.com/package/@theyahia/megaplan-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### Migrating from v1.x

If you used v1.x, the v2.0.0 release introduces a few breaking changes:

- **HTTP transport env var renamed:** `PORT=3000` → `HTTP_PORT=3000`.
- **Removed separate `--http` codepath:** v1 had a hand-rolled `http.ts` triggered by `--http`. v2 uses `@theyahia/mcp-core`'s `runServer` which auto-routes via `--http` flag OR `HTTP_PORT` env. Same CLI flag, different implementation (now with session management, `/health` endpoint, CORS, graceful shutdown).
- **Internal client:** rewritten on `@theyahia/mcp-core`'s `BaseHttpClient` with a custom `MegaplanAuthStrategy` (Password grant flow). The exported `megaplanGet`/`megaplanPost` API is unchanged.
- **Tool errors:** now returned as MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`).

Tool names, arguments, return formats, MCP prompts (`my-tasks-today`, `create-deal-wizard`), and `MEGAPLAN_*` env vars are unchanged.

---

## Tools (8) + Prompts (2)

### Tasks

| Tool | Description |
|------|-------------|
| `get_tasks` | List tasks with filters by status (active / completed / delayed), responsible user, search. |
| `create_task` | Create a new task (name, description, responsible, deadline). |

### Deals

| Tool | Description |
|------|-------------|
| `get_deals` | List deals with filters by status, responsible user, search. |
| `create_deal` | Create a new deal (name, pipeline, responsible, amount). |

### Projects & Employees

| Tool | Description |
|------|-------------|
| `get_projects` | List projects with filters by status and search. |
| `get_employees` | List employees with search and department filter. |

### Comments

| Tool | Description |
|------|-------------|
| `get_comments` | List comments on a task / deal / project. |
| `create_comment` | Add a comment to a task / deal / project. |

### MCP Prompts

| Prompt | Description |
|--------|-------------|
| `my-tasks-today` | "Мои задачи на сегодня" — fetches your active tasks sorted by urgency, marks overdue. |
| `create-deal-wizard` | "Создай сделку" — guided deal creation wizard via conversation. |

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

## 🚀 Demo prompts

> **Use case:** "Создай в Megaplan задачу 'Перезвонить клиенту Acme' с дедлайном завтра 17:00"

🤖 **Pairs well with:**
- [`@theyahia/planfix-mcp`](https://github.com/theYahia/planfix-mcp)
- [`@theyahia/kaiten-mcp`](https://github.com/theYahia/kaiten-mcp)
- [`@theyahia/bitrix24-mcp`](https://github.com/theYahia/bitrix24-mcp)

Try these in your MCP client:

> "What active tasks do I have? Sort by urgency."

> "Create a task 'Review Q2 budget' assigned to user 42, deadline next Friday."

> "Show me deals in the 'Sales' pipeline (program 1) with status 'in_progress'."

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
│   ├── server.ts         — createServer factory + 8 tools + 2 prompts
│   ├── client.ts         — BaseHttpClient + MegaplanAuthStrategy (token OR Password grant)
│   ├── types.ts          — TypeScript types
│   └── tools/
│       ├── comments.ts
│       ├── deals.ts
│       ├── employees.ts
│       ├── projects.ts
│       └── tasks.ts
└── tests/
    ├── client.test.ts    — token + Password grant + 401 re-auth + body
    └── server.test.ts    — createServer factory smoke
```

---

## License

MIT — see [LICENSE](./LICENSE).

---

## 🌍 Part of WWmcp — Emerging Markets MCP

**[WWmcp](https://github.com/theYahia/WWmcp)** ships 114 MCP servers covering APIs across Russia/CIS, MENA, Gulf, SE Asia, Africa, and Latin America — the markets ignored by Composio and other Western MCP hubs.

⭐ **Star the [monorepo](https://github.com/theYahia/WWmcp)** to support the project, or [open an issue](https://github.com/theYahia/WWmcp/issues) if your favorite non-Western API isn't covered yet.
