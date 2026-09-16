# Changelog

All notable changes to `@theyahia/tkassa-mcp` are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

Dates are npm publish dates.

## [2.1.0] — not published to npm

The 16-tool upgrade landed in the standalone repository on 2026-04-06; the latest
version published to npm is 2.0.1 (14 tools).

### Added

- Expanded to **16 tools** (T-Invest section: `get_invest_portfolio`, `find_instrument`).

### Changed

- README updated for 16 tools and the corresponding environment variables.
- Restored `.github`, `LICENSE`, `README` and the test infrastructure.

## [2.0.1] — 2026-04-01

### Changed

- Package `description` and `keywords` rewritten for npm discoverability.

## [2.0.0] — 2026-04-01

### Added

- **14 tools**: payments, refunds, recurring charges, customers, SBP, receipts.

## [1.1.0] — 2026-03-31

### Added

- HTTP transport, vitest tests, `smithery.yaml`.

### Changed

- README updated.

## [1.0.1] — 2026-03-31

Published 2026-03-31 — no documented changes.

## [1.0.0] — 2026-03-30

### Added

- Initial release: **5 tools** — payments and refunds.
- Claude Code skill.

## [0.0.1] — 2026-03-30

First npm publish.

---

Tools currently registered in `src/` (16): `init_payment`, `get_payment_state`,
`confirm_payment`, `cancel_payment`, `charge_payment`, `refund_payment`, `add_customer`,
`get_customer`, `remove_customer`, `get_card_list`, `remove_card`, `create_sbp_qr`,
`get_sbp_qr_state`, `send_closing_receipt`, `get_invest_portfolio`, `find_instrument`.
