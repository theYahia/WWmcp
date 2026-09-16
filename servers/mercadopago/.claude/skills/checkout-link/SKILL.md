---
name: checkout-link
description: Create a MercadoPago Checkout Pro link (preference) for a cart and adjust it later
argument-hint: <item title> <quantity> <unit price> [payer email]
---

# /checkout-link — MercadoPago preference

## Algorithm

1. Build the items array. Each item needs title, quantity and unit_price; currency_id and
   description are optional (currency defaults to the account's country currency).
2. Call `create_preference` with items and, where the user has them: payer_email, payer_name,
   external_reference (your order ID — set this, reconciliation depends on it),
   back_urls (success / failure / pending), notification_url, auto_return.
3. Return the init_point URL from the response to the customer. In a sandbox account use
   sandbox_init_point instead.
4. To change the cart, expiration or redirect URLs later, call `update_preference` with the
   preference_id and a patch object holding only the fields that change.
5. Call `get_preference` with the preference_id to read back the current state before
   telling the user what the link now contains.

## Response format

```
## MercadoPago checkout

**preference_id**: 1234567890-abcd-...
**external_reference**: ORDER-2026-0142
**Items**: 2 × Camiseta @ 8,500 ARS = 17,000 ARS
**Payer**: cliente@example.com

Checkout link: https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...
```

## Notes

- Always set external_reference. Without it `search_payments` and `search_merchant_orders`
  cannot tie a payment back to an order.
- auto_return = approved sends the buyer back automatically after a successful payment;
  it requires a valid back_urls.success.
- Amounts are in the account's currency (ARS, BRL, MXN, UYU, CLP, COP, PEN) — do not
  convert; pass what the user gave.

## Examples

```
/checkout-link "Camiseta" 2 8500 cliente@example.com
/checkout-link "Consultoria" 1 150000
```
