---
name: daily-settlement
description: Daily Chapa reconciliation — money in, money out, closing balance
argument-hint: "[page] [per_page]"
---

# /daily-settlement — Chapa daily reconciliation

## Algorithm

1. Call `get_balance` — this is the closing figure everything must tie back to.
2. Call `list_transactions` with pagination (page, per_page) and, if the user is chasing a
   specific bucket, status = pending | success | failed.
3. Page through with page until you reach today's boundary. This API paginates rather than
   filtering by date — do not claim a total you have not paged to.
4. Call `list_transfers` with the same pagination to get money going out.
5. Group inbound by status, sum successful amounts, sum charges (Chapa's fee) separately.
6. Flag anything stuck: inbound still pending, or outbound transfers not in a final state.
   For a stuck outbound, call `verify_transfer` with its reference to get a fresh read.

## Response format

```
## Chapa settlement — 2026-09-03

**Closing balance**: 42,300 ETB

### Inbound
| Status | Count | Amount |
|--------|-------|--------|
| success | 38 | 21,400 ETB |
| pending | 4 | 1,150 ETB |
| failed | 2 | 600 ETB |

Fees on successful: 748 ETB

### Outbound
3 transfers, 12,000 ETB — 1 pending (ref PAYOUT-02)

### Needs attention
- 4 inbound stuck in pending over 1 hour.
```

## Notes

- Report only what the tools returned. Chapa does not expose a settlement report endpoint
  here, so this is reconstructed from listings — say so if the user needs an official one.
- `verify_transaction` takes a tx_ref if the user wants to drill into one inbound payment.

## Examples

```
/daily-settlement
/daily-settlement 1 100
```
