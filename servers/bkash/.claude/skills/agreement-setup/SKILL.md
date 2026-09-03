---
name: agreement-setup
description: Set up a bKash tokenized agreement for repeat charges and check its status
argument-hint: <payerReference> <callbackURL>
---

# /agreement-setup — bKash agreement (recurring)

## Algorithm

1. Collect payerReference (the customer's phone number or your internal customer ID) and
   callbackURL (where bKash sends the customer back after they authorize).
2. Call `agreement_create` with payerReference, callbackURL and optionally
   merchantAssociationInfo. It returns an agreementID and a bKash URL.
3. Send the customer to that URL. They authorize once; after that you can charge without
   re-entering credentials.
4. When the customer returns, call `agreement_query` with the agreementID to confirm it is
   active. Store the agreementID against the customer on your side.
5. To charge against an active agreement, run the normal payment path
   (`create_payment` then `execute_payment`) using the same payerReference.

## Response format

```
## bKash agreement

**agreementID**: AGR2026X0091
**payerReference**: 01712345678
**Status**: Completed
**Created**: 2026-09-03

Authorization link (send to customer):
https://checkout.sandbox.bka.sh/agreement/...
```

## Notes

- An agreement is per customer, not per order. Creating a second one for the same
  payerReference gives you a duplicate you have to reconcile — call `agreement_query` first
  if you think one already exists.
- There is no agreement-cancel tool in this server. If the customer wants to revoke, that is
  done on the bKash side — say so rather than looking for a tool.
- Sandbox and production agreementIDs are not interchangeable.

## Examples

```
/agreement-setup 01712345678 https://shop.example/bkash/return
/agreement-setup customer_4417 https://api.example/callbacks/bkash
```
