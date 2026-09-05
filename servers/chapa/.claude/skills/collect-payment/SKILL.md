---
name: collect-payment
description: Take a Chapa payment in Ethiopia — build the checkout link, then verify it
argument-hint: <amount ETB> <customer email> <first name> <last name> [tx_ref]
---

# /collect-payment — Chapa checkout

## Algorithm

1. Collect amount (a **string**, e.g. "250"), email, first_name, last_name. Optional:
   phone_number, currency (defaults to ETB), callback_url, return_url,
   customization_title, customization_description.
2. Generate tx_ref yourself if the user did not give one — it must be unique per attempt
   (e.g. order number plus timestamp). Reusing a tx_ref makes Chapa reject the request.
3. Call `initialize_transaction` with those fields. It returns a checkout_url.
4. Send the customer to the checkout_url. Wait for them to finish — do not verify early,
   a fresh transaction reads as pending.
5. Call `verify_transaction` with the same tx_ref. Read status, amount, charge (Chapa's fee),
   payment method and customer info from the response.
6. If status is pending after the customer says they paid, retry `verify_transaction` once
   after a short wait before treating it as failed.

## Response format

```
## Chapa payment

**tx_ref**: ORDER-2026-0142-1725350400
**Amount**: 250 ETB
**Charge (fee)**: 8.75 ETB
**Status**: success
**Method**: telebirr
**Customer**: Abebe Kebede / abebe@example.com

Checkout link: https://checkout.chapa.co/checkout/payment/...
```

## Notes

- amount is a string in this API. Pass "250", not 250.
- Chapa supports ETB and USD; anything else will be rejected.
- Never generate a tx_ref that collides with a previous one — verification keys off it.

## Examples

```
/collect-payment 250 abebe@example.com Abebe Kebede
/collect-payment 1200 sara@example.com Sara Tesfaye ORDER-991
```
