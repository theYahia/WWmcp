---
name: refund-flow
description: Refund a bKash payment safely — verify first, refund, then confirm refund status
argument-hint: <paymentID or trxID> <amount> <sku> [reason]
---

# /refund-flow — bKash refund

## Algorithm

1. Identify the payment. If the user gave a paymentID, call `query_payment` with it.
   If they gave a transaction reference, call `search_transaction` with the trxID.
2. Check the returned status. Refund only a completed payment. If the status is anything
   else, stop and report it — do not attempt the refund.
3. Confirm the refundable amount with the user. bKash needs amount as a **string**, plus
   the sku of the item being refunded.
4. Call `refund_payment` with paymentID, trxID, amount, sku and optionally reason.
5. Call `query_refund` with paymentID, trxID and sku to read back the refund status.
   Refunds are not always instant — if it is still pending, say so.

## Response format

```
## bKash refund

**Original**: TR0011ON1565343075976 / trxID 8H7D9K2L01 — 1,500 BDT (Completed)
**Refunded**: 500 BDT (partial)
**Reason**: damaged item
**Refund status**: Completed
```

## Notes

- Both paymentID and trxID are required by `refund_payment` — get trxID from
  `query_payment` or `search_transaction` first, never guess it.
- sku is mandatory. If the merchant has no SKUs, use the order number, but be consistent —
  `query_refund` matches on the same sku.
- Partial refunds: pass the partial amount. Repeat refunds on the same sku are how bKash
  models multiple partials; check `query_refund` before sending another.

## Examples

```
/refund-flow TR0011ON1565343075976 500 SKU-114 "damaged item"
/refund-flow trxID 8H7D9K2L01 1500 ORDER-88
```
