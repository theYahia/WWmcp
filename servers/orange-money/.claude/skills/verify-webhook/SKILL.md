---
name: verify-webhook
description: Validate an incoming Orange Money webhook before trusting it and shipping the order
argument-hint: <order_id> <amount> <pay_token>
---

# /verify-webhook — Webhook validation

## Algorithm

1. Take order_id, amount and pay_token out of the webhook payload the user received.
   Never act on the payload's status field alone — that field is attacker-controllable if
   the notif_url is reachable from the internet.
2. Call `validate_webhook` with order_id, amount and pay_token. This re-queries Orange
   Money's transactionstatus endpoint, so the answer comes from Orange, not from the payload.
3. Compare the authoritative status to what the payload claimed. If they differ, treat the
   payload as forged and say so loudly.
4. Compare the amount to the order total on the user's side. A matching order_id with a
   smaller amount is the classic underpayment attack.
5. If anything is inconclusive, call `get_payment_status` with the same three fields for a
   second read before releasing goods.

## Response format

```
## Webhook validation — CMD-2026-0142

| Field | Payload said | Orange says |
|-------|--------------|-------------|
| status | SUCCESS | SUCCESS |
| amount | 15,000 XOF | 15,000 XOF |

**Verdict**: VALID — safe to fulfil.
```

## Notes

- A mismatch verdict means do not fulfil. Say that plainly rather than hedging.
- Orange Money retries notifications; the same order_id arriving twice is normal.
  Fulfilment must be idempotent on order_id.
- This tool proves the transaction state. It does not prove the request came from Orange —
  that is why re-querying rather than signature-checking is the pattern here.

## Examples

```
/verify-webhook CMD-2026-0142 15000 abc123token
/verify-webhook ORDER-88 5000 xyz789token
```
