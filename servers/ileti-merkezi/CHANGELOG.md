# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## [4.0.0] - 2026-06-23

Complete rewrite against the **real** İletiMerkezi v1 JSON API. Every prior npm
release — 1.0.x and 3.0.0 — targeted a fabricated API surface (header-based
SHA256/HMAC auth + REST-style `/send-sms`, `/send-bulk-sms`, `/contacts/...`
paths) and did not work against the live provider. This release is verified
against the official İletiMerkezi SDK and the live API manifest.

> Versioned **4.0.0** to supersede the broken **3.0.0** that was published to npm
> (2026-05-03) but never committed to this repository — `latest` must move
> forward, not back.

### ⚠️ Breaking changes

- **Authentication moved into the request body.** Credentials are now sent as
  `request.authentication.{key, hash}` (JSON body), not as `X-API-Key` /
  `X-API-Hash` HTTP headers. All client-side hashing was removed — the `hash` is
  the value the panel precomputes and is passed through unchanged.
- **Environment variables changed.** Use `ILETIMERKEZI_API_KEY` +
  `ILETIMERKEZI_API_HASH` (the panel issues both). The old `ILETI_SECRET` is gone
  (there is no runtime secret/hashing). `ILETI_API_KEY` / `ILETI_API_HASH` are
  accepted as migration aliases.
- **Tool set revised to match the real API.** Removed fabricated tools that have
  no real endpoint (`send_bulk_sms`, `create_contact_group`, `add_contacts`, and
  the separate OTP tool). Bulk sending is now `send_sms` with an array of numbers;
  OTP is a normal single-recipient `send_sms`.

### Added

- Real, verified endpoints: `send_sms`, `cancel_order`, `get_report`,
  `get_reports`, `get_balance`, `get_sender`, `get_blacklist`, `add_blacklist`,
  `delete_blacklist`, `iys_register`, `iys_check` (11 tools).
- **İYS compliance ergonomics**: `send_sms` exposes `message_type`
  (`transactional` | `commercial`) which drives the İYS consent flag, so callers
  don't have to reason about Turkey's Law 6563 directly.
- İYS consent tools (`iys_register` / `iys_check`) for commercial-message consent.
- Proper MCP error reporting: every tool returns `isError` with actionable
  guidance (e.g. 401 → check credentials + "Allow API access") instead of throwing.
- zod validation of all inputs; type-safe response highlights alongside raw JSON.
- Tooling: ESLint + Prettier, GitHub Actions CI (Node 18/20/22), `.env.example`,
  `SECURITY.md`.

### Changed

- Server version is now read from `package.json` (no more hardcoded drift).
- Zero runtime dependencies beyond `@modelcontextprotocol/sdk` and `zod`
  (native `fetch`, no remote manifest fetch on boot).
