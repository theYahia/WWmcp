---
name: sales-summary
description: RetailCRM period report — revenue, AOV, status mix, new customers, costs
argument-hint: "[date_from] [date_to]"
---

# /sales-summary — Period Sales Report

## Algorithm

1. Resolve the period. Default: the current month to date. Dates are YYYY-MM-DD.
2. Call `get_orders_summary` (date_from, date_to, optional filter_status, max_pages up to 20). It returns totalCount, revenue, averageOrderValue and byStatus.
3. Check the `partial` flag in the response: `true` means revenue/status were aggregated over fewer orders than totalCount — say so explicitly and raise max_pages before quoting the revenue as final.
4. Call `get_customers_summary` (date_from, date_to) for the new-customer count in the same window.
5. Translate status codes to names with `list_statuses` — never print raw codes to the user.
6. Pull the period expenses with `list_costs` (filter_date_from, filter_date_to, optional filter_cost_groups) and subtract them from revenue for a gross margin line.
7. If the user dictates a new expense, record it with `create_cost` (summ, cost_item, date_from).

## Notes

- totalCount is always exact; revenue and byStatus are only exact when `partial` is false.
- `get_orders_summary` filters by creation date, not by completion date — a long fulfilment cycle shifts revenue between periods.
- For a drill-down into which orders make up the number, use `list_orders` with the same filter_date_from / filter_date_to.

## Response Format

```
## Sales 2026-08-01 — 2026-08-31

**Orders**: 412 (aggregated over 412 — full)
**Revenue**: 6,180,000 RUB
**Average order**: 15,000 RUB
**New customers**: 87
**Costs**: 940,000 RUB → gross 5,240,000 RUB

| Status | Orders |
|--------|--------|
| Complete | 351 |
| Cancelled | 34 |
| New | 27 |
```

## Examples

```
/sales-summary
/sales-summary 2026-08-01 2026-08-31
/sales-summary 2026-08-01 2026-08-31 complete
```
