---
name: send-otp
description: Send a single transactional SMS in Turkey (OTP, order update) and confirm delivery
argument-hint: <phone 5XXXXXXXXX> "<message>" [sender]
---

# /send-otp — Single SMS with delivery check

## Algorithm

1. Call `get_sender` to get the sender headers (başlık) approved on this account. An
   unapproved header is the most common cause of a silently undelivered SMS in Turkey.
   `APITEST` is the provider sandbox header.
2. Call `get_balance` if the account is near empty or the user asks — one credit per segment.
3. Call `send_sms` with `to` (a Turkish mobile, e.g. `5551234567`), `message`, and `sender`
   from step 1. Leave `message_type` at its default `transactional`: OTP and order updates are
   exempt from İYS consent. Never pass `schedule_at` for a verification code.
4. Take the order id from the response and call `get_report` with `order_id` to read the
   per-recipient delivery state. A report right after sending usually reads `110 WAITING` —
   wait and re-check once before declaring failure.
5. If the number never receives it, call `get_blacklist` to check whether it opted out.

## Response format

```
## SMS sent

**To**: 5551234567
**Sender**: SIRKETADI
**Message**: Dogrulama kodunuz: 481902
**Segments**: 1
**order_id**: 4471029
**Delivery**: DELIVERED (111)
**Balance left**: 4,812 credits
```

## Notes

- Turkish characters (ç ğ ı ö ş ü) push a message into Unicode encoding: 70 chars per
  segment instead of 160. Warn the user when the text will cost extra segments.
- A number on the blacklist will never receive anything — `send_sms` may still return OK.
- Message status codes: `110 WAITING`, `111 DELIVERED`, `112 UNDELIVERED`.

## Examples

```
/send-otp 5551234567 "Dogrulama kodunuz: 481902"
/send-otp 5339876543 "Siparisiniz kargoya verildi" SIRKETADI
```
