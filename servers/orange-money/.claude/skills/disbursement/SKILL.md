---
name: disbursement
description: Move money on Orange Money B2B — pay out to a customer, collect from one, or transfer
argument-hint: <cashin|cashout|transfer> <msisdn> <amount> <reference>
---

# /disbursement — B2B money movement

## Algorithm

1. Call `get_balance` first. Every operation below fails opaquely on an underfunded account.
2. Pick the direction and confirm it with the user in plain words before calling anything:
   - `cashin` — you push money TO a customer's wallet (you pay them out).
   - `cashout` — you pull money FROM a customer's wallet (they pay you).
   - `transfer` — wallet to wallet between two MSISDNs you control.
3. For `cashin` and `cashout`, pass partner_id, partner_name, partner_msisdn,
   customer_msisdn, amount (a **string**), reference (unique), and pin if the account
   requires one.
4. For `transfer`, pass from_msisdn, to_msisdn, amount, reference and optionally pin.
5. Read the response status. Call `get_balance` again afterwards and show the delta so the
   user can see the money actually moved.
6. Never retry a failed disbursement with the same reference until you have confirmed it did
   not land — a duplicate reference can either be rejected or double-pay depending on market.

## Response format

```
## Orange Money disbursement

**Operation**: cashin (payout to customer)
**Customer**: 22507xxxxxxx
**Amount**: 25,000 XOF
**Reference**: PAYOUT-2026-09-03-01
**Status**: SUCCESS

Balance: 1,240,000 → 1,215,000 XOF
```

## Notes

- MSISDNs go in full international form without a plus, e.g. 22507xxxxxxx.
- amount is a string for these three tools, unlike `create_webpayment` where it is a number.
- pin is the partner account PIN, not the customer's. Never ask a customer for their PIN.
- Not every country in the footprint enables cashin/cashout — check
  `list_supported_countries` if a call is rejected as unsupported.

## Examples

```
/disbursement cashin 22507xxxxxxx 25000 PAYOUT-01
/disbursement cashout 22507xxxxxxx 10000 COLLECT-14
/disbursement transfer 22501xxxxxxx 22507xxxxxxx 50000 MOVE-03
```
