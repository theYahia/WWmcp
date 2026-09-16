---
name: invoice-housekeeping
description: Clean up Fawaterak invoices — list, cancel stale unpaid ones, refund paid ones
argument-hint: "[status paid|unpaid|expired|cancelled]"
---

# /invoice-housekeeping — Invoice cleanup and refunds

## Algorithm

1. Call `list_invoices` with page, per_page and status (paid | unpaid | expired | cancelled).
   Start with unpaid to find stale checkouts.
2. Page through until the list is exhausted. Do not report a total you have not paged to.
3. For anything ambiguous, call `get_invoice_data` with its invoice_id for the full record
   (amount, method, transaction_id, customer).
4. To cancel: `cancel_invoice` with invoice_id. This only works on unpaid invoices — check
   status first, and confirm with the user before cancelling anything.
5. To refund: `refund_payment` with invoice_id, optional amount (omit for full refund) and
   optional reason. Refund support depends on the rail — a Fawry cash payment may not be
   refundable through the API. Report the error as-is rather than retrying blindly.
6. Call `get_balance` at the end so the user sees the account position after the cleanup.

## Response format

```
## Fawaterak housekeeping

**Balance**: 18,420 EGP

### Unpaid over 48 h — 6 invoices, 3,100 EGP
| Invoice | Amount | Created | Action |
|---------|--------|---------|--------|
| 88101 | 450 EGP | 2026-08-30 | cancelled |

### Refunds issued
| Invoice | Amount | Reason | Status |
|---------|--------|--------|--------|
| 88044 | 200 EGP | partial return | success |
```

## Notes

- Always confirm before `cancel_invoice` or `refund_payment` — neither is reversible.
- Partial refund = pass amount. Full refund = omit amount entirely.
- `get_balance` reflects settled money; a just-issued refund may not be deducted yet.

## Examples

```
/invoice-housekeeping unpaid
/invoice-housekeeping refund 88044 200 "partial return"
```
