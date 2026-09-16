---
name: order-payments
description: Register, correct and delete RetailCRM order payments
argument-hint: <order id> [amount]
---

# /order-payments — Order Payments

## Algorithm

1. Find the order: `list_orders` (filter_number or filter_customer) or `get_order` (id, by:"id"/"externalId", detail:"full"). detail:"full" is what exposes the existing payments — the summary view does not.
2. Read the valid payment type codes with `list_payment_types`. Never invent a code.
3. Register the payment with `order_payment_create` (order_id or order_external_id, amount, type, optional status and paid_at as "YYYY-MM-DD HH:MM:SS").
4. Correcting an amount, status or date on an existing payment: `order_payment_edit` (id, by, amount / status / paid_at). Prefer editing over delete+recreate — it keeps the payment id stable.
5. Only remove a payment created in error: `order_payment_delete` (id). This is **destructive**; confirm the payment id with the user first.
6. Re-read `get_order` with detail:"full" and show the payment list plus the remaining balance.

## Notes

- Multi-site accounts: pass the `site` param, taking the code from `list_sites`, or the write is rejected.
- amount is a plain number in the account currency.
- Under RETAILCRM_READONLY all three write tools are unavailable — report that rather than looking for a workaround.

## Response Format

```
## Order #10432 — payments

**Order total**: 18,400 RUB
**Paid**: 10,000 RUB · **Remaining**: 8,400 RUB

| Payment | Type | Amount | Status | Paid at |
|---------|------|--------|--------|---------|
| 5512 | bank-card | 10,000 RUB | paid | 2026-08-19 14:02 |

Registered payment 5518: 8,400 RUB, type cash, status paid.
```

## Examples

```
/order-payments 10432
/order-payments 10432 8400
/order-payments edit payment 5512 status paid
```
