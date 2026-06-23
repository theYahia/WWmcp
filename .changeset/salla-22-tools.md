---
"@theyahia/salla-mcp": minor
---

Add 13 new tools (9 → 22): delete_product, get_product_by_sku, bulk_update_quantities,
list_categories, get_category, create_category, list_brands, get_customer,
list_order_statuses, get_order_histories, list_coupons, list_abandoned_carts,
list_branches. All endpoints verified against docs.salla.dev.

Also fix the server version reported in the MCP handshake / `/health` (was hardcoded
`2.0.0` in code while the package was `3.0.0`); the version is now a single `VERSION`
constant in `server.ts`.
