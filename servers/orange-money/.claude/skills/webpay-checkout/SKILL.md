---
name: webpay-checkout
description: Take an Orange Money WebPay payment in Francophone Africa and poll it to a final state
argument-hint: <amount> <currency XOF|XAF> <order_id>
---

# /webpay-checkout — Orange Money WebPay

## Algorithm

1. Call `list_supported_countries` if the user is unsure which market this account serves.
   It also tells you the currency: XOF for West Africa, XAF for Central Africa.
2. Collect amount (in whole local units — these currencies have no minor unit), currency,
   order_id (unique per attempt), return_url, cancel_url and notif_url.
3. Call `create_webpayment` with those, plus optionally reference and lang (fr or en;
   fr is the right default for most of this footprint).
4. Keep the pay_token from the response — you cannot query the payment without it. Send the
   customer to the returned payment URL, where they enter their Orange Money PIN.
5. Call `get_payment_status` with order_id, amount and pay_token — all three are required
   and must match the original request exactly.
6. Poll until the status is final. A customer who abandoned the PIN screen leaves the
   payment pending indefinitely — treat a long pending as abandoned, not as paid.

## Response format

```
## Orange Money WebPay

**order_id**: CMD-2026-0142
**Amount**: 15,000 XOF
**Country**: Cote d'Ivoire
**Status**: SUCCESS
**txnid**: OM240903.1432.B00123

Payment link: https://webpayment.orange-money.com/...
```

## Notes

- XOF and XAF have no decimals. 15000 means fifteen thousand francs, not 150.00.
- pay_token is single-use per order and is the only key to `get_payment_status` — losing it
  means losing the ability to check that payment from this server.
- amount passed to `get_payment_status` must be identical to the one in `create_webpayment`;
  a mismatch returns an error rather than the payment.

## Examples

```
/webpay-checkout 15000 XOF CMD-2026-0142
/webpay-checkout 5000 XAF ORDER-88
```
