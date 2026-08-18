# Changelog

All notable changes to `@theyahia/cdek-mcp` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project adheres to [Semantic Versioning](https://semver.org/).

## [2.2.0]

First release buildable and testable as a standalone repository (previous `2.1.0` was never published — CI could not build it outside the monorepo).

### Fixed
- **Standalone build** — removed monorepo coupling that broke `npm ci` / `tsc` for anyone cloning the repo:
  - `@theyahia/mcp-core` dependency `workspace:*` → `^1.0.0` (resolves from the npm registry).
  - `tsconfig.json` no longer `extends ../../tsconfig.base.json` / references `../../packages/core`; the compiler options are inlined.
  - `repository` now points at `theYahia/cdek-mcp` instead of the archived monorepo.
- **Test suite** — repaired drift against the current source:
  - `tests/server.test.ts` now imports the exported `createServer` factory and asserts all 16 tools.
  - Removed the obsolete `token-manager.test.ts` (OAuth token handling lives in `@theyahia/mcp-core`’s `OAuthStrategy`).
  - `tests/e2e/smoke.test.ts` expects 16 tools (was 8).
  - Consolidated unit tests under `tests/` (was split between `test/` and `tests/`).

### Added
- **GPS search for `list_delivery_points`** — optional `latitude` / `longitude` / `radius_km` filter and sort pickup points by client-side haversine distance (annotates each result with `координаты` and `расстояние_км`). Makes the README "nearest pickup point" demo work.
- **Input validation** — `calculate_tariff`, `calculate_tariff_list`, and `create_order` now require `code` or `postal_code` for each location up front, with an actionable error.
- **`src/server.ts`** — the server is now a pure, importable factory; `src/index.ts` is a thin runtime entry point.
- **Tooling** — ESLint (flat config) + Prettier, `lint` / `format` scripts; CI now runs `lint`, `typecheck`, and the e2e smoke test.

### Changed
- **Node 20+ required** (`engines.node` `>=18` → `>=20`). The test toolchain (Vitest 4) needs `util.styleText`, available from Node 20.12; Node 18 is end-of-life. CI matrix is now Node 20 / 22.

## [2.1.0]
- 16 tools (added `list_orders`, `delete_webhook`). Tagged in git but not published to npm.

## [2.0.2]
- Last version published to npm before 2.2.0 (14 tools): tariff list, regions, courier pickup, receipt, webhooks.

[2.2.0]: https://github.com/theYahia/cdek-mcp/releases/tag/v2.2.0
