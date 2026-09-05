# Changelog

## 2.0.3

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

All notable changes to `@theyahia/amocrm-mcp` are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

Dates are npm publish dates.

## [2.0.2] — 2026-04-01

### Changed

- Package `description` and `keywords` rewritten for npm discoverability.

## [2.0.1] — 2026-04-01

### Fixed

- Republished with all **19 tools** — the 2.0.0 publish shipped only 17.

## [2.0.0] — 2026-04-01

### Added

- **17 tools**: leads, contacts, companies, pipelines, tasks.
- OAuth 2.0 auto-refresh.
- Rate limiting.
- Vitest test suite.

## [1.1.0] — 2026-03-31

### Added

- **10 tools**, OAuth 2.0 with auto-refresh, Streamable HTTP transport.
- Claude Code skill.
- CI workflow.

## [1.0.1] — 2026-03-31

Published 2026-03-31 — no documented changes.

## [1.0.0] — 2026-03-31

### Added

- Initial release: leads, contacts, pipelines. Bearer token auth.

## [0.0.1] — 2026-03-30

First npm publish.

---

Tools currently registered in `src/` (19): `list_leads`, `get_lead`, `create_lead`,
`update_lead`, `list_contacts`, `get_contact`, `create_contact`, `list_companies`,
`create_company`, `list_pipelines`, `list_tasks`, `create_task`, `complete_task`,
`list_unsorted`, `accept_unsorted`, `add_note`, `search`, `list_events`, `get_account`.
