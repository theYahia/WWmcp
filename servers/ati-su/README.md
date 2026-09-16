# @theyahia/ati-su-mcp

MCP server for the **ATI.su** freight exchange API (Russian logistics) — firms,
loads, your own fleet, dictionaries, and distance, exposed as tools for AI agents.

Built against the real ATI.su API: `https://api.ati.su` with OAuth2 (or a static
token), the v2 `/v2/cargos` create flow, v1.0 firm/load reads, and the `/gw/*`
gateway services. Where the public docs don't fully expose a schema, the affected
fields are marked `TODO(verify)` in source and listed under
[Verification status](#verification-status).

## Tools

### Read
| Tool | What it does |
|------|--------------|
| `get_firm` | Firm summary by ATI id — `score` (stars; negative = bad/red), claims, recommendations, verified-trucks count, INN/OGRN |
| `search_firms` | Find a firm by **INN** or **phone** (ATI has no free-text name/city search) |
| `get_load` | A single load by id (legacy v1.0 read) |
| `list_my_loads` | Your own loads (`GET /v1.0/loads`), optionally filtered by `contact_id` |
| `search_loads_byboards` | Carrier search over **your own** Personal boards (requires board ids) |
| `list_my_trucks` / `get_truck` | Your **own** fleet (ATI has no public truck search) |
| `list_body_types` / `list_cargo_types` | Dictionaries (ids you pass elsewhere) |
| `resolve_city` | City name → ATI numeric city id (most endpoints are id-based) |
| `get_distance` | Road distance + time between two points — **paid API**, off by default |

### Write
| Tool | What it does |
|------|--------------|
| `create_load` | **Publishes a real, public load** on ATI.su (`POST /v2/cargos`). Disabled unless `ATI_ALLOW_WRITES=1`; previews via `dry_run` by default and only publishes when `dry_run=false` **and** `confirm=true`. |

> ⚠️ `create_load` writes to a live commercial marketplace. Treat it like a real
> business action — keep it disabled unless you intend to publish loads.

## Setup

### 1. Get credentials

Either a **static token** (simplest) from
<https://ati.su/developers/tokens/>, or an **OAuth2** app
(<https://ati.su/developers/auth/auth-v2/>) to obtain a `client_id`,
`client_secret`, and `refresh_token`. Access tokens last ~2h and are refreshed
automatically.

### 2. Configure your MCP client

**Static token:**
```json
{
  "mcpServers": {
    "ati-su": {
      "command": "npx",
      "args": ["-y", "@theyahia/ati-su-mcp"],
      "env": { "ATI_TOKEN": "your-token" }
    }
  }
}
```

**OAuth2:**
```json
{
  "mcpServers": {
    "ati-su": {
      "command": "npx",
      "args": ["-y", "@theyahia/ati-su-mcp"],
      "env": {
        "ATI_CLIENT_ID": "...",
        "ATI_CLIENT_SECRET": "...",
        "ATI_REFRESH_TOKEN": "..."
      }
    }
  }
}
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `ATI_TOKEN` | Static API token (takes precedence over OAuth2 if set) |
| `ATI_CLIENT_ID` / `ATI_CLIENT_SECRET` / `ATI_REFRESH_TOKEN` | OAuth2 credentials |
| `ATI_ALLOW_WRITES` | Set to `1` to enable `create_load` |
| `ATI_ENABLE_DISTANCE` | Set to `1` to enable the paid `get_distance` tool |
| `ATI_SANDBOX` | Set to `1` to target `sandbox-api.ati.su` |

## Demo prompts

- "Look up firm 123456 on ATI.su — what's its rating and how many claims?"
- "Find the ATI firm with INN 7700000000."
- "List the truck body types available on ATI.su."
- "What's the ATI city id for Екатеринбург?"
- "Show my active loads for contact 100."
- "Search loads on my board <board-id>."
- "Preview a load: 8 tons, 40 m³, Москва → Ростов, loading 2026-07-01." *(requires `ATI_ALLOW_WRITES=1`)*

## Verification status

This rebuild follows the public docs, the raw OpenAPI, and verified community code.
The following are doc-derived but **not yet confirmed against a live token** and are
tagged `TODO(verify)` in source:

| Area | Unconfirmed detail |
|------|--------------------|
| OAuth2 | token path/`grant_type` literal/body encoding (`/oauth2/token`, `grant_type=refresh_token`, form-encoded) |
| `search_loads_byboards` | exact query-param name(s) for board ids |
| `list_my_loads` | existence/array-shape of the bare `GET /v1.0/loads` listing (only the single-load read is doc-sourced) |
| `resolve_city` | `locations/parse` request/response shape |
| `list_my_trucks` / `get_truck` | full truck object schema (absent from the public OpenAPI) |
| `create_load` | full `cargo_application` field set for `/v2/cargos` |
| `get_firm` | by-id `summary` schema (modelled on sibling endpoints) |

Contributions confirming these against a live token are welcome — see
[CONTRIBUTING.md](https://github.com/theYahia/WWmcp/blob/main/CONTRIBUTING.md).

## Development

```bash
npm install
npm run build
npm test            # mocked fetch — no network or token needed
npx @modelcontextprotocol/inspector node dist/index.js   # MCP Inspector smoke test
```

## License

MIT — see [LICENSE](https://github.com/theYahia/WWmcp/blob/main/LICENSE).
