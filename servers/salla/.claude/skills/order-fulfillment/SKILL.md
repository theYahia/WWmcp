---
name: order-fulfillment
description: Move Salla orders through fulfilment — review, status change, timeline
argument-hint: "[status] or <order_id>"
---

# /order-fulfillment — Salla Order Fulfilment

## Algorithm

1. List the queue with `list_orders` (page, per_page up to 50, status). Common statuses: under_review, in_progress, completed, cancelled.
2. Open one order with `get_order` (order_id) — customer, line items, totals, shipping.
3. Before changing anything, read the store's configured statuses with `list_order_statuses` (no arguments). It returns the statuses and sub-statuses this store actually uses — the source of truth for valid values.
4. Move the order with `update_order_status` (order_id, status). Accepted values: completed, in_progress, under_review, cancelled, restoring, refunded.
5. Verify and audit with `get_order_histories` (order_id) — the status-change timeline, including who moved it and when.
6. If pickup or a physical location matters, resolve it with `list_branches` (page, per_page).

## Notes

- `update_order_status` is customer-visible: Salla notifies the buyer. Confirm the exact order_id and target status with the user before calling it.
- Never guess a status string. If the value the user names is not in `list_order_statuses`, ask instead of substituting the closest match.
- Bulk work: iterate `list_orders` page by page. There is no bulk status tool — one `update_order_status` call per order.

## Response Format

```
## Salla orders — under_review

| Order | Customer | Total | Placed |
|-------|----------|-------|--------|
| 1284302 | Ahmed A. | 349.00 SAR | 2026-09-01 |

### Order 1284302
Items: 3 · Total 349.00 SAR · Branch: Riyadh main
Status: under_review → in_progress (updated)

### Timeline
2026-09-01 10:12 — created
2026-09-02 09:40 — under_review → in_progress
```

## Examples

```
/order-fulfillment under_review
/order-fulfillment 1284302
/order-fulfillment complete order 1284302
```
