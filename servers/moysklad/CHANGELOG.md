# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0]

### Fixed

- **`create_product` with a sale price no longer fails.** Previously an empty
  `priceType.href` was sent; MoySklad requires a valid price type. The server now
  attaches the account's default price type (from `list_price_types`), or a
  `price_type_href` you pass. The same fix applies to `update_prices` and
  `create_service`.
- **Correct retry backoff after `429`.** The client now reads MoySklad's
  `X-Lognex-Retry-After` (milliseconds) header, falling back to `Retry-After`
  then exponential backoff.
- **Single source of truth for the version.** The server version is read from
  `package.json` instead of a hardcoded string that had drifted out of sync.
- **Claude skills corrected.** `warehouse-management` no longer claims prices are
  in kopecks (the server returns rubles), references `create_customer_order`
  (not a non-existent `create_order`), and drops the wrong `allowed-tools`.
  `daily-report` uses `moment_from`/`moment_to`; `find-product` no longer
  promises stock that `search_products` doesn't return.

### Added

- **39 new tools (21 → 60)**: stock moves, inventory, enter/loss, purchase
  orders, sales/purchase returns, invoices, bank/cash payments, unified
  `search_assortment`, price types, variants/bundles/services, dashboard /
  turnover / money reports, audit log, webhook update/delete, entity metadata,
  reference lists, and generic `get_documents`/`get_document` fallbacks.
- **MoySklad error messages are parsed** from the API `errors[]` structure
  (code, message, parameter) instead of dumped as raw text.
- **Request-weight-aware, conservative rate limiting** with a parallel-request
  cap, configurable via `MOYSKLAD_RATE_BUCKET` and `MOYSKLAD_MAX_CONCURRENT`.
  Stock reports are charged their real weight (5 units).
- **`User-Agent`** header for self-identification.
- Optional `raw` flag on detail-get tools to return the full MoySklad object.
- Dev tooling: ESLint, Prettier, Husky + lint-staged, Vitest coverage
  (95% line coverage), and a CI matrix (Node 18 build/smoke, 20/22 full).

### Changed

- **Consistent response formatting** across all tools (several previously
  returned raw JSON).
- HTTP transport CORS is now **opt-in** via `MOYSKLAD_HTTP_CORS_ORIGIN` instead
  of a wildcard default.
- Filter values are validated to prevent filter-grammar injection via `;`.
- `vitest` moved from `dependencies` to `devDependencies`.

All 21 original tool names and signatures are unchanged (backward compatible).
