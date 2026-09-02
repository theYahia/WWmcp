# Changelog

All notable changes to `@theyahia/travelpayouts-mcp` are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

Dates are npm publish dates.

## [2.1.0] — not published to npm

The 13-tool upgrade landed in the standalone repository on 2026-04-06; the latest
version published to npm is 2.0.1 (11 tools).

### Added

- Expanded to **13 tools**: `get_direct_routes` and `get_nearest_prices`.

### Changed

- README updated for 13 tools.

## [2.0.1] — 2026-04-01

### Changed

- Package `description` and `keywords` rewritten for npm discoverability.

## [2.0.0] — 2026-04-01

### Added

- **11 tools**: flight search, price calendar, cheapest month, popular directions.
- Full test suite.

## [1.1.0] — 2026-03-31

### Added

- HTTP transport, vitest tests, `smithery.yaml`.

### Changed

- README updated.

## [1.0.1] — 2026-03-31

Published 2026-03-31 — no documented changes.

## [1.0.0] — 2026-03-31

### Added

- Initial release: flight search, popular routes, price calendar.

## [0.0.1] — 2026-03-30

First npm publish.

---

Tools currently registered in `src/` (13): `search_flights_prices`, `get_cheapest_month`,
`get_calendar_prices`, `get_popular_directions`, `get_airline_directions`,
`get_special_offers`, `search_hotels`, `get_hotel_prices`, `lookup_airports`,
`lookup_airlines`, `lookup_cities`, `get_direct_routes`, `get_nearest_prices`.
