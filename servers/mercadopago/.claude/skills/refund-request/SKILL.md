---
name: refund-request
description: Refund a MercadoPago payment — locate it, verify it is refundable, refund full or partial
argument-hint: <payment_id or external_reference> [amount]
---

# /refund-request — Refund

## Algorithm

1. Locate the payment. If the user gave a payment_id, call `get_payment` with it. If they
   gave an order reference, call `search_payments` with external_reference set to it.
2. Check the status. Only approved payments can be refunded. If it is pending, rejected or
   already refunded, stop and report that — do not attempt the refund.
3. Check what is already refunded on the payment record. A second full refund on a
   partially refunded payment will fail or over-refund.
4. Confirm the amount with the user. Omit amount for a full refund; pass a number for a
   partial one.
5. Call `refund_payment` with payment_id and, for a partial, amount.
6. Call `get_payment` again to read back the resulting status and refunds list.

## Response format

```
## MercadoPago refund

**Payment**: 1315432109 (ORDER-2026-0142)
**Original**: 17,000 ARS — approved
**Previously refunded**: 0
**This refund**: 8,500 ARS (partial)
**New status**: partially_refunded
```

## Notes

- Refunds are irreversible. Always confirm the amount with the user before calling.
- MercadoPago's own fee is generally not returned on a refund — do not tell the user they
  get the full gross back unless the response says so.
- A charged_back payment is a dispute, not a refund. Refunding it on top of the chargeback
  double-pays; check status first.

## Examples

```
/refund-request 1315432109
/refund-request ORDER-2026-0142 8500
```
