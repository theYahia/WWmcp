---
"@theyahia/wildberries-mcp": minor
---

Refactor wildberries server to modular tools/, add seller analytics + webhook + rate-limiter tests.

- Split monolithic `src/tools.ts` into `src/tools/{products,stock,orders,seller-account,analytics,webhooks}.ts`. All v1.0 tool names, signatures, and return formats are preserved (backward-compatible — `src/tools.ts` re-exports the aggregated registry).
- New analytics tools: `get_sales_velocity` (units/day per nm_id, last N days), `get_competitor_prices` (public WB catalog scrape, no auth), `get_returns_stats` (return rate + per-SKU breakdown).
- New seller-account tools: `get_warehouse_list` (`/api/v1/warehouses`, distinct from FBS offices), `get_commission_rates` (`/api/v1/tariffs/commission`).
- Polling pseudo-webhooks: `subscribe_to_orders`, `subscribe_to_stock_changes`, `list_subscriptions`, `unsubscribe`, `check_subscriptions`. Wildberries does not push webhooks; these register in-memory polling subscriptions for workflow-friendly diff detection.
- Tests: added `analytics.test.ts`, `webhooks.test.ts`, `refactor-smoke.test.ts`; expanded `rate-limiter.test.ts` with happy-path and exhaustion-recovery scenarios. 54 tests total (up from 33), 7 files (up from 4).
- README: updated tool table (15 → 25), added "AI seller analytics" use-case section, cross-linked to WWmcp monorepo.
