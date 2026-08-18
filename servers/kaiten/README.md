# @theyahia/kaiten-mcp

> 📦 Part of **[WWmcp — Emerging Markets MCP](https://github.com/theYahia/WWmcp)** — 114 MCP servers for non-Western APIs (Brazil/MENA/Gulf/SE Asia/Africa/CIS).

MCP server for the **Kaiten** kanban / project-management API. **63 tools** covering spaces, boards, columns, lanes, cards (with rich filters), comments, members, tags, checklists, child cards, external links, blockers, card types, sprints, custom properties, and users.

[![npm](https://img.shields.io/npm/v/@theyahia/kaiten-mcp)](https://www.npmjs.com/package/@theyahia/kaiten-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of the [Russian API MCP](https://github.com/theYahia/russian-mcp) series by [@theYahia](https://github.com/theYahia).

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kaiten": {
      "command": "npx",
      "args": ["-y", "@theyahia/kaiten-mcp"],
      "env": {
        "KAITEN_DOMAIN": "your-domain",
        "KAITEN_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add kaiten -e KAITEN_DOMAIN=your-domain -e KAITEN_TOKEN=your-token -- npx -y @theyahia/kaiten-mcp
```

### Cursor / Windsurf

```json
{
  "kaiten": {
    "command": "npx",
    "args": ["-y", "@theyahia/kaiten-mcp"],
    "env": { "KAITEN_DOMAIN": "your-domain", "KAITEN_TOKEN": "your-api-token" }
  }
}
```

## Auth

1. In Kaiten, go to **Profile → API tokens** and create a token.
2. Note your subdomain (e.g. `mycompany` from `mycompany.kaiten.ru`).

| Variable          | Required | Description                                                                                                                   |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `KAITEN_DOMAIN`   | Yes\*    | Subdomain (`mycompany`) **or** full host (`mycompany.kaiten.io`). A bare subdomain resolves to `.kaiten.ru`.                  |
| `KAITEN_TOKEN`    | Yes      | Bearer token from Profile → API tokens.                                                                                       |
| `KAITEN_BASE_URL` | No       | Full API base for **self-hosted / on-premise** Kaiten, e.g. `https://kaiten.mycorp.ru/api/latest`. Overrides `KAITEN_DOMAIN`. |

\* `KAITEN_DOMAIN` is required unless `KAITEN_BASE_URL` is set.

The token needs permission for the entities you use: read tools need view rights, and create/update/delete tools need edit rights.

## Try this prompt

> _"Создай задачу в колонке 'In Progress' доски 'Sprint 23', назначь @alex, добавь тег bug"_

The agent chains `list_spaces` → `list_boards` → `list_columns` → `create_card` → `list_users` → `add_card_member` → `add_card_tag`.

## Tools (63)

Counts are derived from the registry at startup; the server logs the exact number on launch.

### Spaces

`list_spaces` · `get_space` · `create_space` · `update_space` · `delete_space`

### Boards, columns, lanes

`list_boards` · `get_board` · `create_board` · `update_board` · `delete_board` · `list_columns` · `create_column` · `update_column` · `delete_column` · `list_lanes` · `create_lane` · `update_lane` · `delete_lane`

### Cards

`list_cards` (rich filters: board/column/lane/space, query, tag, type, owner, responsible, members, states, condition, archived, asap, overdue, due dates, ordering) · `get_card` · `create_card` · `update_card` (title, description, owner, due date, asap, size) · `move_card` (column + lane) · `delete_card` · `get_card_location_history`

### Comments

`add_comment` · `list_comments` · `update_comment` · `delete_comment`

### Card members & tags

`list_card_members` · `add_card_member` · `update_card_member_role` · `remove_card_member` · `list_card_tags` · `add_card_tag` · `remove_card_tag`

### Checklists

`create_checklist` · `get_checklist` · `update_checklist` · `remove_checklist` · `add_checklist_item` · `update_checklist_item` · `remove_checklist_item`

### Children, links, blockers

`list_card_children` · `add_card_child` · `remove_card_child` · `list_card_external_links` · `add_card_external_link` · `update_card_external_link` · `remove_card_external_link` · `list_card_blockers` · `block_card` · `update_card_blocker` · `unblock_card`

### Workspace & read-only

`list_tags` · `list_users` · `get_current_user` · `list_card_types` · `list_sprints` · `get_sprint_summary` · `list_custom_properties` · `get_custom_property` · `list_custom_property_select_values`

> List tools return a **compact projection** (key fields only) to keep token usage low on large boards. `get_*` tools and all mutations return the full API JSON.

## HTTP Transport

By default the server speaks stdio (for Claude Desktop / Code). To run it as a streamable-HTTP server instead:

```bash
kaiten-mcp --http 3000
# or
HTTP_PORT=3000 kaiten-mcp
```

- `GET /health` → `{ status, tools, version }`
- `POST /mcp` → MCP streamable-HTTP endpoint

CORS is opt-in: set `KAITEN_HTTP_CORS_ORIGIN` to the allowed origin (the endpoint acts on your token, so there is no wildcard default).

## Demo Prompts

```
List all spaces, then the boards in space 5
Show columns and lanes on board 123
Create a card "Fix login bug" on board 123, column 456
Set card 789's due date to next Friday and mark it ASAP
Add @alex as a member of card 789 and tag it "bug"
Add a checklist "QA" to card 789 with items "write tests" and "deploy"
Move card 789 to column "Done"
Who am I? (get_current_user)
```

## Troubleshooting

- **401 / auth error** — check `KAITEN_TOKEN` is valid and has permission for the entity. The server reports auth failures explicitly.
- **`.kaiten.io` / self-hosted** — set `KAITEN_DOMAIN` to the full host (`acme.kaiten.io`) or `KAITEN_BASE_URL` to your full API base.
- **`list_boards` returns nothing without `space_id`** — Kaiten lists boards per space; pass `space_id` (the documented path).

## Not included

These exist in the Kaiten API but are intentionally out of scope for an interactive assistant: SCIM provisioning, bulk Imports, the Addons framework, and webhook subscription management. Documents and iterations, plus write operations for custom properties / card types, are not yet exposed (their request shapes need confirmation against a live instance) — open an issue if you need them.

## Development

```bash
npm install
npm run dev        # run from source (tsx)
npm run build      # compile to dist/
npm test           # vitest
npm run coverage   # vitest + coverage
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## API Reference

Official Kaiten API docs: <https://developers.kaiten.ru>

## Pairs well with

- **[planfix-mcp](https://github.com/theYahia/planfix-mcp)** — RU project management / CRM
- **[megaplan-mcp](https://github.com/theYahia/megaplan-mcp)** — RU all-in-one business platform
- **[yandex-tracker-mcp](https://github.com/theYahia/yandex-tracker-mcp)** — Yandex's Jira-like tracker

Browse all 114 servers in the [WWmcp catalog](https://github.com/theYahia/WWmcp).

## License

MIT

---

**Part of [WWmcp](https://github.com/theYahia/WWmcp)** — the emerging-markets MCP catalog. ⭐ Star the catalog if you find these servers useful, and [open an issue](https://github.com/theYahia/WWmcp/issues) to request a server for another non-Western API.
