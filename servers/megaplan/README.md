# @theyahia/megaplan-mcp

MCP server for **Megaplan** project management. Tasks, deals, projects,
employees, clients, and comments via Megaplan API v3.

> **v4.0 is a breaking release** (and the first npm release of this overhaul —
> it supersedes the older 8-tool `3.0.0`). Request/response shapes changed to
> match the real v3 API, and `--http` now requires an auth token. See
> [CHANGELOG.md](./CHANGELOG.md) and [Migrating from older versions](#migrating-from-older-versions).

## Tools (18)

| Tool | Description |
|------|------------|
| `get_tasks` | List tasks; filter by status code(s), responsible, search |
| `get_task` | Get one task by ID |
| `create_task` | Create a task (name, description, responsible, deadline) |
| `update_task` | Update a task (name, description, responsible, deadline, status) |
| `get_deals` | List deals; filter by status code(s), responsible, search |
| `get_deal` | Get one deal by ID |
| `create_deal` | Create a deal (requires a program/pipeline ID) |
| `update_deal` | Update a deal (name, responsible, amount, description, status) |
| `get_projects` | List projects; filter by status code(s), search |
| `get_project` | Get one project by ID |
| `get_employees` | List employees; search + department filter |
| `get_deal_programs` | List deal programs (pipelines) — find the `program_id` for `create_deal` |
| `get_deal_program` | Get one deal program by ID |
| `list_clients` | List clients (contractors): people (`human`) or orgs (`company`) |
| `get_client` | Get one client by type + ID |
| `get_current_user` | Authenticated user's employee record (**experimental**) |
| `get_comments` | List comments on a task/deal/project |
| `create_comment` | Add a comment to a task/deal/project |

All list/get tools return a **compact summary** by default; pass `raw: true` for
the unmodified API JSON. Lists are cursor-paginated: pass the returned
`nextPageAfter` as `page_after` to get the next page.

## Skills (Prompts)

| Skill | Description |
|-------|------------|
| `my-tasks-today` | "Мои задачи на сегодня" — your tasks (scoped via `get_current_user`) |
| `create-deal-wizard` | "Создай сделку" — guided deal creation (lists pipelines first) |

## Setup

### Option A: Access Token

1. In Megaplan, go to **Settings → Integration → API**.
2. Generate an access token, and set it as `MEGAPLAN_TOKEN`.

### Option B: Login + Password

Set `MEGAPLAN_LOGIN` (email) + `MEGAPLAN_PASSWORD`. The server exchanges them for
an access token (cached in memory, re-authenticated on expiry).

`MEGAPLAN_DOMAIN` is your account host. A bare subdomain like `yourcompany` is
expanded to `yourcompany.megaplan.ru`; a full host (`crm.example.com`) is used
as-is.

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "megaplan": {
      "command": "npx",
      "args": ["-y", "@theyahia/megaplan-mcp"],
      "env": {
        "MEGAPLAN_DOMAIN": "yourcompany",
        "MEGAPLAN_TOKEN": "your-access-token"
      }
    }
  }
}
```

Or with login/password — replace `MEGAPLAN_TOKEN` with `MEGAPLAN_LOGIN` +
`MEGAPLAN_PASSWORD`.

## Finding IDs

Several tools take IDs. Here's how to discover them via the server itself:

- **`responsible_id`, `filter_responsible_id`** → `get_employees` (each item has an `id`).
- **`filter_department_id`** → IDs appear on employees' `department` (or your Megaplan UI).
- **`program_id`** (required by `create_deal`) → `get_deal_programs`.
- **`contact_id`** (for `create_deal`) → `list_clients` with `type: "human"` or `"company"`; pass the matching `contact_type`.
- **status codes** (`filter_status`) are account-specific enum codes (e.g. `filter_any`), not display names. Find them in your Megaplan UI / account API schema.

## Streamable HTTP transport

For remote/cloud deployments, run with `--http`. **Auth is mandatory** — the
server holds your Megaplan credentials, so it refuses to start without
`MCP_HTTP_TOKEN` and binds to loopback by default.

```bash
MEGAPLAN_DOMAIN=yourcompany \
MEGAPLAN_TOKEN=xxx \
MCP_HTTP_TOKEN=$(openssl rand -hex 32) \
npx @theyahia/megaplan-mcp --http
# → http://127.0.0.1:3000/mcp  (send: Authorization: Bearer $MCP_HTTP_TOKEN)
# Health: http://127.0.0.1:3000/health
```

To expose beyond loopback, set `HOST=0.0.0.0` **and** add the public host:port to
`MCP_HTTP_ALLOWED_HOSTS` (DNS-rebinding protection is on). Only do this behind
your own network controls.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MEGAPLAN_DOMAIN` | Yes | Account host (`yourcompany` → `yourcompany.megaplan.ru`, or a full host) |
| `MEGAPLAN_TOKEN` | One of | Bearer access token |
| `MEGAPLAN_LOGIN` | One of | Login email (if no token) |
| `MEGAPLAN_PASSWORD` | One of | Password (if no token) |
| `MEGAPLAN_DEBUG` | No | `1` to log full upstream error bodies |
| `PORT` | No | HTTP port for `--http` mode (default: 3000) |
| `MCP_HTTP_TOKEN` | `--http` | Bearer token required to call `/mcp` (server refuses to start without it) |
| `HOST` | No | Bind address for `--http` (default `127.0.0.1`) |
| `MCP_HTTP_ALLOWED_HOSTS` | No | Comma-separated allowed `Host` values (default loopback:port) |
| `MCP_HTTP_BODY_LIMIT` | No | Max request body size (default `1mb`) |
| `MCP_HTTP_MAX_SESSIONS` | No | Max concurrent sessions (default `100`) |
| `MCP_HTTP_SESSION_TTL_MS` | No | Idle session eviction TTL (default 30 min) |

## Migrating from older versions

Applies to the previously published 8-tool builds (`1.x`–`3.0.0`):

- `get_*` list tools: `offset` → `page_after` (cursor); `filter_status` now takes
  status **code(s)**, not names like `active`.
- Output is a compact summary by default — pass `raw: true` for the old raw JSON.
- `create_comment`: the text field is now `content` (was `text`).
- `--http`: set `MCP_HTTP_TOKEN`; the default bind is now `127.0.0.1`.

## Verification status

Most behaviour is confirmed against the official v3 RAML and real v3 client
libraries. A few items are best-effort from docs and marked `TODO(live-verify)`
in the source (and `experimental` here), pending a test against a live account:
auth body encoding, the free-text search param name, the `get_current_user`
endpoint, and the task/deal status-change field shape. Errors are surfaced
clearly (set `MEGAPLAN_DEBUG=1` for full detail) so any mismatch is diagnosable.

## Referral

Get **20-50% recurring** commission by referring Megaplan:

- [Megaplan Partner Program](https://megaplan.ru/partners/)
- Sign up as a partner, get your referral link.
- Every client you bring = recurring revenue share.

## Development

```bash
npm install
npm run build        # tsc -> dist/
npm run typecheck    # tsc --noEmit (src + tests)
npm run lint         # eslint
npm test             # vitest
npm run dev          # stdio mode with tsx
npm run start:http   # HTTP mode (needs MCP_HTTP_TOKEN)
```

## License

MIT
