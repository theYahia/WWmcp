---
"@theyahia/salla-mcp": minor
---

Salla: webhook signature verification (security), OAuth refresh, +5 catalog ops

- **Security:** added `verify_webhook_signature` tool — HMAC-SHA256 verification of Salla webhooks against `X-Salla-Signature` header, with timing-safe comparison via Node's built-in `crypto.timingSafeEqual`. Supports both Salla strategies (`Signature` default + legacy `Token`). Zero new dependencies. New `src/webhooks/signature.ts` module exposes `verifySignature`, `verifyToken`, and a dispatcher `verifyWebhook` that auto-reads `X-Salla-Security-Strategy`. Sources verified against Salla's official `docs.salla.dev/doc-421119` and `SallaApp/webhook-actions-js`.
- **OAuth refresh:** new `SallaRefreshStrategy` in `client.ts` — automatically refreshes the access token against `https://accounts.salla.sa/oauth2/token` before expiry. Supports the rotating refresh token Salla returns on every refresh, with an optional `PersistCallback` for hosts that want to keep the latest pair across restarts. Concurrent refreshes are deduplicated. Activated by setting `SALLA_OAUTH_CLIENT_ID` + `SALLA_OAUTH_CLIENT_SECRET` + `SALLA_REFRESH_TOKEN`. Legacy static-token mode (`SALLA_ACCESS_TOKEN` alone) remains fully supported.
- **+5 catalog tools:** `get_product_variants` (options + variants for a product), `update_product_price` (base price + optional sale_price/sale_end with validation), `bulk_inventory_adjust` (up to 1000 items by id/variant_id/sku with overwrite/increment/decrement modes; wraps `POST /products/quantities/bulk`), `get_categories` (paginated + keyword), `get_brands` (paginated + keyword, requires `brands.read` scope).
- Tool count: 9 → 15. Bumped server version to 3.1.0.
- Tests: 27 → 48 (added `tests/oauth-refresh.test.ts` 10 cases + `tests/webhook-signature.test.ts` 17 cases + 6 catalog-op cases in `tests/tools.test.ts`).
- README: documented Gulf SaaS stack composition (Salla + Foodics + Tabby + Unifonic), webhook verification flow with raw-body warning, both auth modes, expanded demo prompts.

Fully backward-compatible. Existing tool names, arguments, return formats, `SALLA_ACCESS_TOKEN` env var, and module entry points are unchanged.
