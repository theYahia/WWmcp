# @theyahia/1c-rest-mcp

> **AI agent for 1C:Enterprise** — MCP server exposing the 1C REST/OData 3.0
> API to Claude, Cursor, Windsurf and any MCP-compatible LLM.
> 14 tools (catalogs, documents, registers, reports, **batch ops, change tracking**).
> HTTP Basic auth. Stdio + Streamable HTTP transports.

[![npm](https://img.shields.io/npm/v/@theyahia/1c-rest-mcp)](https://www.npmjs.com/package/@theyahia/1c-rest-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of the [WWmcp](https://github.com/theYahia/WWmcp) monorepo — _Composio
for the rest of the world_: MCP servers for non-Western APIs (33 countries).

---

### Migrating from v1.x

If you starred or used v1.x, the v2.0.0 release introduces a few breaking changes:

- **HTTP transport env var renamed:** `PORT=3000` → `HTTP_PORT=3000`.
- **Removed separate HTTP binary:** `1c-rest-mcp-http` is gone. Use `1c-rest-mcp --http` or `HTTP_PORT=3000 1c-rest-mcp` instead.
- **Single `bin` entrypoint:** `dist/http.js` is no longer published.
- **Internal client:** now extends `@theyahia/mcp-core`'s `BaseHttpClient` with `BasicAuthStrategy`. The exported functional API (`oneCGet/oneCPost/oneCPatch/buildODataPath`) is unchanged, so tool code keeps working.
- **Tool errors:** now returned as MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling` from `@theyahia/mcp-core`). Compatible with all MCP clients.

Tool names, arguments, return formats, and the `ONEC_*` env vars are unchanged.

---

## Use case: AI agent for 1C

Drop this server into your MCP-compatible LLM client and you get an _agent
that speaks 1C natively_. Common workflows:

- **"Catch up the books overnight"** — agent polls `Document_*` for everything
  modified since yesterday, validates totals via `get_register`, posts missing
  documents via `batch_create_documents`.
- **"Reprice 800 SKUs from a CSV"** — agent loads `Catalog_Номенклатура`,
  reconciles against the CSV, applies updates via `batch_update_catalog_items`
  with concurrency cap 10 and reports per-item failures.
- **"Watch sales in real-time-ish"** — agent calls `poll_changes_since` on a
  60-second loop, surfaces new invoices to a Slack channel via your other MCP
  servers, and uses the returned `next_cursor` to stay current.
- **"Debug why this document won't post"** — agent calls `update_document`,
  receives the 1C error enriched with a Russian→English hint
  (`field_required`, `posting_failed`, `type_mismatch`, …) and self-corrects.

The error parser, batch concurrency cap, and poll cursor are deliberately
LLM-friendly: every response includes a structured `note` describing what
1C natively supports vs what is done client-side, so the model never
hallucinates webhook setup or `$batch` endpoints.

## Tools (14)

### Discovery (always enabled)

| Tool | Description |
|------|-------------|
| `list_entities` | List all available 1C OData entities (catalogs / documents / registers / reports). Use this first when working with an unfamiliar database. |
| `get_document_by_number` | Locate a 1C document by its number (e.g. invoice ТД-00123 dated 2026-03-01). Convenience wrapper over `$filter`. |

### Catalogs

| Tool | Description |
|------|-------------|
| `get_catalogs` | Read 1C catalog data. Supports `$filter`, `$select`, `$orderby`, `$top`, `$skip`. |

### Documents

| Tool | Description |
|------|-------------|
| `get_documents` | Read 1C documents with full OData filtering. |
| `create_document` | Create a new document via OData POST. |
| `update_document` | Update an existing document via OData PATCH (by `Ref_Key` GUID). |

### Registers

| Tool | Description |
|------|-------------|
| `get_register` | Read information or accumulation register data. |

### Reports

| Tool | Description |
|------|-------------|
| `get_report` | Get a 1C report from an arbitrary HTTP service URL (`/hs/...`). |

### Generic OData

| Tool | Description |
|------|-------------|
| `odata_query` | Run an arbitrary OData 3.0 query. Supports `$filter`, `$select`, `$expand`, `$orderby`, `$top`, `$skip`, `$inlinecount`. |

### Batch operations (v3.1)

> **Note:** 1C does **not** natively support the OData `$batch` endpoint
> (verified via 1C support / Infostart community 2026-05).
> These tools implement **client-side parallel batching** with a concurrency
> cap and per-item success/failure reporting — partial failures do not abort.

| Tool | Description |
|------|-------------|
| `batch_create_documents` | Create N documents (1..100) in parallel. Each item reported individually. |
| `batch_update_catalog_items` | Update N catalog items by `Ref_Key` in parallel. |
| `batch_query` | Run N OData GET queries (1..50) in parallel. Combine results client-side. |

### Change tracking (v3.1)

> **Note:** 1C OData has **no webhooks / no event subscriptions**.
> Only polling is possible. These tools make that explicit so an LLM never
> hallucinates `subscribe_to_event(...)`.

| Tool | Description |
|------|-------------|
| `poll_changes_since` | Pull rows where `date_field >= cursor`. Returns rows + `next_cursor` + `has_more`. |
| `list_subscriptions` | Returns `supported: false` and lists workarounds. Pure metadata, no HTTP. |

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "1c": {
      "command": "npx",
      "args": ["-y", "@theyahia/1c-rest-mcp"],
      "env": {
        "ONEC_BASE_URL": "http://server:8080/base",
        "ONEC_LOGIN": "your_login",
        "ONEC_PASSWORD": "your_password"
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
    "1c": {
      "command": "npx",
      "args": ["-y", "@theyahia/1c-rest-mcp"],
      "env": {
        "ONEC_BASE_URL": "http://server:8080/base",
        "ONEC_LOGIN": "your_login",
        "ONEC_PASSWORD": "your_password"
      }
    }
  }
}
```

### Streamable HTTP transport

For remote/multi-tenant deployments, run as an HTTP server:

```bash
HTTP_PORT=3000 \
ONEC_BASE_URL=http://server:8080/base \
ONEC_LOGIN=admin \
ONEC_PASSWORD=secret \
npx @theyahia/1c-rest-mcp
# or: npx @theyahia/1c-rest-mcp --http
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
| `ONEC_BASE_URL` | yes | Base URL of the 1C HTTP server (e.g. `http://localhost:8080/base`). |
| `ONEC_LOGIN` | yes | Login for HTTP Basic auth. |
| `ONEC_PASSWORD` | yes | Password for HTTP Basic auth. |
| `ONEC_SERVICES` | no | Comma-separated module list (default: `all`). |
| `HTTP_PORT` | no | If set, server runs in HTTP mode on this port. |

**Backward-compat:** `1C_BASE_URL`, `1C_LOGIN`, `1C_PASSWORD` are also accepted as fallback.

### Module filtering (`ONEC_SERVICES`)

Limit registered tools to save LLM context. Modules: `catalogs`, `documents`, `registers`, `reports`, `odata`, `batch`, `changes`, `meta`.

```bash
ONEC_SERVICES=catalogs,documents,batch npx @theyahia/1c-rest-mcp
```

The discovery tools (`list_entities`, `get_document_by_number`) are always registered — without them an agent cannot discover the database structure.

---

## Authentication

1C:Enterprise REST API uses HTTP Basic auth. Get credentials from your 1C administrator:

1. Enable **HTTP services** and **OData publication** in the 1C Designer.
2. Create a 1C user with the role required to read/write the entities you need.
3. Use that user's login/password as `ONEC_LOGIN` / `ONEC_PASSWORD`.
4. The `ONEC_BASE_URL` is the URL of the published infobase (the same URL you use for the 1C web client, without `/odata/...` suffix).

The OData endpoint will be `${ONEC_BASE_URL}/odata/standard.odata/`.

---

## Demo Prompts

Try these natural-language prompts in your MCP client:

> "List all document types in the 1C database that contain 'Реализация' in the name."

> "Find invoice ТД-00123 dated 2026-03-01 — show its lines and total amount."

> "Get the last 50 sales documents from the past week, ordered by date descending."

> "Read the 'Цены номенклатуры' information register for product UUID `abc-123`."

> "Create a new RealizationOfGoodsAndServices document for counterparty 'ООО Ромашка' with two product lines."

> "Run an OData query: `Catalog_Номенклатура` where `Description` contains 'кофе', expand `Производитель`, top 20."

> "Get the balance report from `/hs/reports/balance?date=2026-04-01` and summarize it."

> "Reprice 50 SKUs from this CSV — use `batch_update_catalog_items` and report which ones failed."

> "Poll `Document_РеализацияТоваровУслуг` every 60s for invoices since this morning — use `poll_changes_since`."

---

## What 1C natively supports — and what we work around

| Feature | 1C native | This server |
|---------|-----------|-------------|
| CRUD on OData entities | Yes | All 9 base tools |
| OData `$batch` multipart endpoint | **No** ([Infostart](https://forum.infostart.ru/forum15/topic272942/) confirms returns "Произошла ошибка сервиса") | Client-side parallel batching with concurrency cap |
| Webhooks / event push | **No** | `poll_changes_since` pull-mode polling |
| Russian error messages | Yes, raw | Auto-mapped to 10 English categories with recovery hints |
| HTTPS / auth refresh | Basic auth only | Backed by `@theyahia/mcp-core` retry+timeout+auth client |

If your 1C deployment exposes custom HTTP services (`/hs/...`) — for example
a custom webhook endpoint maintained by your 1C developer — use the generic
`get_report` tool to invoke it.

---

## Development

```bash
pnpm install
pnpm --filter @theyahia/1c-rest-mcp build
pnpm --filter @theyahia/1c-rest-mcp test
pnpm --filter @theyahia/1c-rest-mcp dev   # tsx watch mode
```

Project layout:

```
servers/1c-rest/
├── src/
│   ├── index.ts            — entry point, runServer, tool registration
│   ├── client.ts           — BaseHttpClient + BasicAuthStrategy + functional API
│   ├── server.ts           — server factory + module wiring
│   ├── types.ts            — OData TypeScript types
│   ├── lib/
│   │   └── errors.ts       — 1C-specific error parsing (Russian → category + hint)
│   └── tools/
│       ├── catalogs.ts
│       ├── documents.ts
│       ├── metadata.ts     — discovery (list_entities, get_document_by_number)
│       ├── odata-query.ts
│       ├── registers.ts
│       ├── reports.ts
│       ├── batch.ts        — batch_create_documents, batch_update_catalog_items, batch_query
│       └── change-tracking.ts — poll_changes_since, list_subscriptions
└── tests/
    ├── client.test.ts
    ├── server.test.ts
    ├── tools.test.ts
    ├── batch.test.ts          — 8 tests (happy path + partial failure + concurrency)
    ├── error-parsing.test.ts  — 16 tests (10 error categories + envelope formats)
    └── change-tracking.test.ts — 8 tests (polling cursor + has_more + no-webhook contract)
```

---

## License

MIT — see [LICENSE](./LICENSE).
