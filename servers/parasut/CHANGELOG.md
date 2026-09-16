# Changelog

## 2.0.0

### Breaking

- **OAuth: switched from `client_credentials` to the `password` grant.** Parasut
  API v4 does not support `client_credentials`, so 1.x never actually
  authenticated. You must now set `PARASUT_USERNAME` (account email) and
  `PARASUT_PASSWORD` in addition to `PARASUT_CLIENT_ID` / `PARASUT_CLIENT_SECRET`.
  `PARASUT_COMPANY_ID` is now optional (resolved via `GET /me` when omitted).

### Fixed

- Access tokens are now renewed via the rotating `refresh_token` (2-hour
  lifetime) instead of being silently dropped.
- `create_contact` now sends the required `account_type` (customer/supplier);
  `contact_type` correctly means person/company.
- `create_purchase_bill` now sends the required `due_date` and `total_vat`.
- `create_sales_invoice` / `create_product` default VAT to **20%** (Turkey's
  standard KDV since July 2023, was 18%).
- `list_sales_invoices` date filter no longer emits a malformed one-sided
  `from...` range; a single bound becomes an exact-date match.
- e-document errors are parsed from the JSON:API `{ errors: [{ title, detail }] }`
  shape into readable messages.

### Added

- Modular tool architecture (`src/tools/<domain>.ts`); the tool count is derived,
  not hardcoded.
- Resilient client: token-bucket rate limiting (10 req / 10 s), concurrency cap,
  retries with backoff on 5xx/429, friendly 401/403 messages, `User-Agent`.
- Correct **e-Fatura / e-Arşiv** flow: `check_einvoice_inbox` (VKN lookup),
  `issue_e_document` (smart branch + async job poll), `create_e_invoice`,
  `create_e_archive`, `get_trackable_job`.
- Payments: `record_sales_invoice_payment`, `record_purchase_bill_payment`,
  `collect_from_contact`, `pay_to_contact`.
- Cash & bank: `list_accounts`, `get_account`, `list_account_transactions`.
- Single-record `get_*`, lifecycle actions (cancel/archive/recover/convert),
  sales offers, and reference lists (`get_me`, tags, item categories, warehouses,
  taxes).
- Streamable HTTP transport (`--http` / `HTTP_PORT`) with `/health` and opt-in
  CORS.
- CI (GitHub Actions), `vitest.config.ts`, `smithery.yaml`, `.mcp.json`, and
  `.claude/skills` recipes.

## 1.0.1

- Initial release (8 tools). Note: authentication was non-functional due to the
  unsupported `client_credentials` grant — fixed in 2.0.0.
