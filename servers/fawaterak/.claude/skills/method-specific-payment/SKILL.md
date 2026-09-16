---
name: method-specific-payment
description: Charge through one specific Fawaterak rail — Fawry, card, wallet or Meeza
argument-hint: <method name> <total EGP> <customer details>
---

# /method-specific-payment — Force one payment method

## Algorithm

1. Call `get_payment_methods`. It returns each enabled method with its id, name, key
   (fawry, visa, meeza, wallet…) and commission rate.
2. Match the method the user named to a row and take its numeric id. If the method they want
   is not in the list, stop — it is not enabled on this account. Do not substitute another.
3. Show the commission rate for the chosen method before charging, so the user sees the cost.
4. Call `send_payment` with payment_method_id, cartTotal (a **string**), cartItems,
   successUrl, failUrl, and optionally currency and pendingUrl.
5. Call `get_invoice_data` with the returned invoice_id to confirm the outcome and pull the
   method-specific artifact — for Fawry that is the reference code the customer pays with.

## Response format

```
## Fawaterak payment — fawry

**Method**: Fawry (id 2, commission 1.0%)
**Invoice**: 88231
**Total**: 450 EGP
**Status**: unpaid
**Fawry reference**: 187 264 913

Customer pays this reference at any Fawry outlet within 48 hours.
```

## Notes

- Method ids are account-specific. Always read them from `get_payment_methods`; never hardcode.
- Wallet and Meeza flows return a redirect; Fawry returns a code. Present whichever the
  response actually contains.
- Commission differs per method — mention it when the user is choosing between rails.

## Examples

```
/method-specific-payment fawry 450 "Mona Hassan" mona@example.com
/method-specific-payment meeza 1200 "Ahmed Ali" ahmed@example.com
```
