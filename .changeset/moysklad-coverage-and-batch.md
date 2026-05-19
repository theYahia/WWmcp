---
"@theyahia/moysklad-mcp": minor
---

MoySklad: 6× test coverage boost, examples/ dir with 3 production patterns, batch operations across products/orders/counterparties.

- **Tests:** 1 → 7 test files (1 e2e + 6 new unit suites covering products, orders, counterparties, stock, reports, supply). 24 new unit tests with mocked HTTP — happy path, edge cases, and error propagation.
- **examples/** (new): `warehouse-sync.ts` (cross-warehouse replenishment), `order-fulfillment.ts` (daily fulfillment with human-in-the-loop), `financial-report.ts` (monthly P&L by counterparty).
- **Batch operations (5 new tools, 10 → 15 total):**
  - `batch_update_products` — bulk patch up to 100 products in parallel
  - `batch_set_prices` — bulk reprice up to 100 products (preserves `priceType` meta)
  - `batch_create_orders` — bulk create up to 100 customer orders
  - `batch_update_status` — bulk transition up to 100 orders to a target state
  - `batch_create_counterparties` — bulk create up to 100 counterparties
- Client-side parallel batching with concurrency cap (default 5) + per-item ok/error envelope with `failed_indexes` ready for retry. The shared 45 req/3s token bucket prevents server overload.
- **README.md** added with batch ops table, examples/ pointer, and "AI agent for MoySklad" use cases.
- E2E smoke test updated to expect 15 tools (was 10).
