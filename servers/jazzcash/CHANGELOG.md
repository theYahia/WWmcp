# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1]

### Fixed
- Package no longer ships stale compiled files for the removed tools. `tsc` does not prune
  `dist/`, so the 2.0.0 tarball still contained inert `get-balance`/`redeem-voucher`/`inquire-transaction`
  artifacts. Added a cross-platform `prebuild` step that wipes `dist/` before each build.

## [2.0.0]

Correctness-first overhaul. The secure-hash construction, amount units, and tool surface were
reconciled against the official JazzCash documentation, the official worked hash test vector, and
several independent integrations.

### Removed (breaking)
- `get_balance` — JazzCash exposes no balance-inquiry API endpoint.
- `redeem_voucher` — voucher redemption is offline at a JazzCash outlet; there is no merchant API.
- `inquire_transaction` — duplicated `check_payment_status`; merged into it.

### Changed (breaking)
- **Amounts are now in PKR rupees** and converted to paisa (`× 100`) before signing. Previously the
  raw value was sent, undercharging by 100×.
- `create_mobile_account_payment` now uses the real `MWALLET` transaction type (there is no `MA` type).
- `create_voucher` now issues an **OTC** voucher (`pp_TxnType=OTC`) via the payment endpoint instead of a
  non-existent `CreateVoucher` endpoint.
- `check_payment_status` now calls the canonical `PaymentInquiry/Inquire` endpoint instead of
  `/2.0/Purchase/TransactionStatus`.
- `refund_payment` now calls `authorize/Refund`-style routing; documented as applying to card transactions.
- `txn_ref` is optional and auto-generated (`T` + datetime + random) when omitted.

### Fixed
- **Secure hash**: empty/`undefined` field values are now excluded from the signed message — the previous
  implementation injected a spurious `&&` when an optional field (e.g. `pp_Description`) was blank, so every
  such request failed integrity validation. (The salt-prefix + salt-as-key + lowercase-hex construction was
  already correct and is now locked by an official test-vector unit test.)
- Production is now reachable via `JAZZCASH_ENV`/`JAZZCASH_BASE_URL`; the base URL was previously hardcoded
  to sandbox.

### Added
- Response `pp_SecureHash` verification (constant-time) — tampered responses raise an error.
- MCP-level error handling: handler throws and non-success `pp_ResponseCode` (on write tools) return
  `isError`, so a declined/failed payment is never reported as success.
- Tool annotations (`readOnlyHint`/`destructiveHint`/`openWorldHint`).
- Stronger input validation (mobile `03XXXXXXXXX`, 6-digit CNIC, amount ceiling, txn_ref format).
- Secret redaction: `pp_Password`/`pp_SecureHash` stripped from output; upstream error bodies not echoed.
- Fail-fast startup credential check; server version single-sourced from `package.json`.
- Expanded test suite (hash test vector, empty-value filtering, response verification, fetch mocking,
  date formatting, amount conversion, negative-path schemas) and a GitHub Actions CI workflow.

### Internal
- De-duplicated the per-tool client singleton into a shared `getClient()`; added `buildBaseFields`/`submit`
  helpers; removed dead `types.ts` interfaces; merged `request()`/`post()`.

## [1.0.1]
- npm discoverability metadata (description, keywords).

## [1.0.0]
- Initial release: JazzCash payments MCP server (8 tools).

[2.0.1]: https://github.com/theYahia/jazzcash-mcp/releases/tag/v2.0.1
[2.0.0]: https://github.com/theYahia/jazzcash-mcp/releases/tag/v2.0.0
[1.0.1]: https://github.com/theYahia/jazzcash-mcp/releases/tag/v1.0.1
[1.0.0]: https://github.com/theYahia/jazzcash-mcp/releases/tag/v1.0.0
