# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed
- Moved into the [WWmcp](https://github.com/theYahia/WWmcp/tree/main/servers/ati-su) monorepo;
  the stdio transport (plus opt-in Streamable HTTP via `--http` / `HTTP_PORT`, needs
  `express`), logging and output sanitization now come from
  `@theyahia/mcp-core`. The ATI.su HTTP client and OAuth2 token provider stay our own.
  Tool names, count and input schemas are unchanged.
- zod 4, Vitest 4.

### Fixed
- `create_load` is no longer repeated automatically after a 5xx, timeout or network
  error — the load may already be published, so a repeat could publish it twice.
- The OAuth2 token request now has a 15s timeout (a hung token endpoint used to hang
  every tool call).

## [2.0.0] - 2026-06-23

Complete rebuild against the **real** ATI.su API. The 1.0.x line targeted an
endpoint/field surface that does not exist on ATI.su (the calls would have failed
against the live API), so this is a breaking, ground-up rewrite.

### Breaking
- **Auth**: replaced the single static `ATI_TOKEN` (against a non-existent
  `/Profile/APIToken` flow) with real credentials — a static token from
  `https://ati.su/developers/tokens/`, **or** OAuth2 via
  `ATI_CLIENT_ID` + `ATI_CLIENT_SECRET` + `ATI_REFRESH_TOKEN`
  (`https://ati.su/developers/auth/auth-v2/`), with automatic refresh.
- **Tools**: removed fabricated tools that have no API equivalent
  (`search_loads`, `search_trucks`, `search_companies`, `get_routes`) and replaced
  them with real capabilities:
  - `get_firm`, `search_firms` (by INN/phone) — companies are "firms" on ATI.
  - `get_load`, `list_my_loads`, `search_loads_byboards` (carrier board search).
  - `create_load` now posts to `POST /v2/cargos` (was a non-existent `/v1.0/loads`),
    and is **gated** behind `ATI_ALLOW_WRITES` + `dry_run` + `confirm`.
  - `list_my_trucks`, `get_truck` (own fleet — ATI has no public truck search).
  - `list_body_types`, `list_cargo_types`, `resolve_city` (dictionaries).
  - `get_distance` (paid `POST /gw/gis-rm/v1/distance`, behind `ATI_ENABLE_DISTANCE`).
- **Response fields**: all types now match the real API (v1.0 PascalCase,
  v2/firms snake_case). Removed invented fields (`rating`, `review_count`,
  `verified`, `distance_km`, flat `from_city`, …).

### Added
- OAuth2 token provider with in-memory caching, single-flight refresh, and
  refresh-on-401.
- Modern MCP surface: `registerTool` with `title`, `annotations`
  (`destructiveHint` on `create_load`, `readOnlyHint` on reads), `outputSchema` +
  `structuredContent`, and server `instructions`.
- `ATI_SANDBOX`, `ATI_ALLOW_WRITES`, `ATI_ENABLE_DISTANCE` environment flags.
- GitHub Actions CI (Node 18/20/22), expanded test suite (auth, retries/backoff,
  parse errors, write-guard, handlers).

### Fixed
- Backoff now applies to network-error retries (previously hammered with no delay).
- Guarded `JSON.parse`: a non-JSON 2xx body is a non-retryable contract error.
- Server version is read from `package.json` (was hardcoded and drifting).
- `LICENSE` copyright holder corrected to the actual author.

### Notes
- Several schemas are doc-verified but not yet confirmed against a live token; these
  are tagged `TODO(verify)` in source and listed in the README "Verification status".

## [1.0.1] - 2026 (deprecated)
- Initial publish. Targeted an imagined API surface; not functional against live ATI.su.
