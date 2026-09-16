# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-23

Correctness, robustness and repository-hygiene overhaul. Verified against the official
Diadoc API documentation (developer.kontur.ru/doc/diadoc-api).

### Fixed
- **Authentication.** `POST /V3/Authenticate` now sends the developer key inside the
  `Authorization: DiadocAuth ddauth_api_client_id=…` header and adds `?type=password`,
  as the API requires (previously sent a non-standard separate header and no `type`).
- **`list_organizations`.** Sends `inn` and `kpp` as **separate** query params (was an
  invalid combined `innKpp`); `inn` is now required, matching the API.
- **`list_documents`.** Cursor-based pagination via `after_index_key` + `count` (0–100)
  instead of the unsupported `offset`; ISO timestamps converted to `.NET` ticks
  (`timestampFromTicks`/`timestampToTicks`); `filter_category` is required (defaulted).
- **`list_counterparties`.** Uses `myBoxId` (was the wrong `myOrgId`).
- **`send_document`.** Builds a proper `MessageToPost` with `DocumentAttachments[]` /
  `SignedContent { Content, Signature }` and `TypeNamedId` (was an invalid `MessageBodyItems`
  shape). Accepts a caller-supplied `signature_base64`; unsigned sends are allowed.
- **`sign_document`.** Sends `Signatures[]` of `DocumentSignature` (was `RecipientTitles`),
  passes `boxId`/`messageId` in the query, and accepts a real `signature_base64` or
  `sign_with_test_signature` for the sandbox.
- Server version is now read from `package.json` (was a hard-coded `1.0.0` that drifted).

### Added
- 401 → transparent single re-authentication and retry; 23h token TTL.
- `isError` results with friendly messages instead of crashing on API errors (`DiadocError`).
- Input validation for ИНН (10/12 digits) and КПП (9 digits); response size cap.
- `DIADOC_BASE_URL` to target a sandbox host.
- Tests for the auth header format, 401 re-auth, backoff, and tool request shapes.
- GitHub Actions CI (Node 18/20/22), Biome lint/format, `.gitignore`, `.env.example`,
  `CONTRIBUTING.md`, and a bilingual (RU/EN) README.

### Changed
- Credentials: the developer key is read from `DIADOC_API_CLIENT_ID` (falls back to the
  legacy `DIADOC_CLIENT_ID`). The previously-required, unused `DIADOC_API_KEY` is dropped.
- `send_document` parameters renamed for clarity: `box_id`→`from_box_id`,
  `document_type`→`type_named_id`; `file_name` is now optional.

### Removed
- Committed `node_modules/` and `dist/` are no longer tracked in git (added `.gitignore`).

## [1.0.1] - 2026-04-01

Initial published release: 8 tools for Diadoc (authenticate, organizations, documents,
counterparties).
