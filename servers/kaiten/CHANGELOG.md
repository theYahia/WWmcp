# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0]

Major release: full house-standard alignment, large API expansion, and
token-efficient output.

### Breaking

- **Compact list output.** `list_*` tools now return a compact projection
  (`{ total, <key>: [...] }` with key fields) instead of the full raw API JSON,
  to cut token usage on large boards. `get_*` tools and all mutations still
  return full JSON. Prompts that parsed the old raw list shape need updating.

### Added

- **Spaces, columns, lanes, boards** CRUD coverage.
- **Cards**: `delete_card`, full-text `query` on `list_cards`, and
  `due_date` / `asap` / `size_text` / `lane_id` on create/update/move.
- **Comments**: `list_comments`, `update_comment`, `delete_comment`.
- **Card members, card tags, checklists (+ items), children, external links,
  time logs, blockers, card types.**
- **Users**: `get_current_user`, `get_user`.
- **Custom properties, documents, iterations, sprints.**
- **HTTP transport** (`--http <port>` / `HTTP_PORT`) with `/health` and `/mcp`,
  CORS opt-in via `KAITEN_HTTP_CORS_ORIGIN`.
- **`KAITEN_BASE_URL`** env for self-hosted Kaiten; `KAITEN_DOMAIN` now accepts a
  full host (`acme.kaiten.io`) as well as a bare subdomain (`acme`).
- House-standard tooling: ESLint + Prettier + husky/lint-staged, Vitest coverage,
  GitHub Actions CI, `smithery.yaml`.

### Fixed

- Server version is now read from `package.json` (was hardcoded and stale).
- API error responses now surface the response body and give a specific message
  for 401/403 auth failures.
- Empty success bodies (e.g. 204 from `DELETE`) no longer crash JSON parsing.
- Retries now respect the `Retry-After` header.

### Excluded (deliberate, out of scope for an interactive MCP)

- SCIM provisioning, bulk Imports, and the Addons framework.
- Webhook subscription management (may be added later on request).
