---
name: reconcile-day
description: Reconcile a day of MercadoPago activity — payments by status plus merchant orders
argument-hint: "[date YYYY-MM-DD] [external_reference]"
---

# /reconcile-day — Daily reconciliation

## Algorithm

1. Call `search_payments` with begin_date and end_date as ISO 8601 covering the day
   (e.g. 2026-09-03T00:00:00Z to 2026-09-03T23:59:59Z), range = date_created,
   limit = 100, offset = 0.
2. Page with offset until the returned page is short. Do not report a total you have not
   paged to.
3. Group by status: approved, pending, in_process, rejected, cancelled, refunded,
   charged_back, in_mediation. Sum amounts per group.
4. Call `search_merchant_orders` for the same period, filtering by preference_id or
   external_reference if the user is chasing specific orders. This shows orders where a
   payment was expected but never landed.
5. Cross-check: any merchant order without an approved payment is an abandoned checkout.
   Any approved payment without a merchant order came in through the direct payments API.
6. For a specific order, call `get_merchant_order` with its merchant_order_id, or
   `get_payment` with the payment_id, for the full record including fees.

## Response format

```
## MercadoPago — 2026-09-03

| Status | Count | Amount |
|--------|-------|--------|
| approved | 84 | 712,400 ARS |
| pending | 11 | 96,200 ARS |
| rejected | 9 | 71,000 ARS |
| refunded | 2 | 17,000 ARS |

**Net approved**: 695,400 ARS

### Gaps
- 6 merchant orders with no approved payment (abandoned checkout).
- 1 payment in in_mediation — buyer dispute, ORDER-2026-0119.
```

## Notes

- range picks which timestamp the date filter applies to: date_created, date_approved,
  date_last_updated or money_release_date. date_approved is the one that matches a
  settlement report; date_created matches "what came in today".
- charged_back and in_mediation are disputes, not failures — call them out separately.

## Examples

```
/reconcile-day 2026-09-03
/reconcile-day ORDER-2026-0142
```
