---
name: invoice-checkout
description: Create a Fawaterak hosted invoice link for an Egyptian customer and track it to paid
argument-hint: <total EGP> <customer name> <email> <phone>
---

# /invoice-checkout — Fawaterak hosted invoice

## Algorithm

1. Collect the cart: each item needs name, price and quantity. Compute cartTotal — it must
   equal the sum of the line items or Fawaterak rejects the invoice.
2. Collect customer details (first name, last name, email, phone) and the three redirect
   URLs: successUrl, failUrl, and optionally pendingUrl.
3. Call `create_invoice_link` with cartTotal (a **string**), cartItems, successUrl, failUrl,
   and optionally currency (defaults to EGP) and pendingUrl. It returns an invoice id and a
   hosted checkout URL that offers every enabled method.
4. Send the customer the URL.
5. Call `get_invoice_data` with the invoice_id to read status, paid amount, payment_method
   and transaction_id.
6. Fawry payments are not instant — a customer gets a reference code and pays at a kiosk.
   An invoice sitting in unpaid for hours is normal for Fawry; do not call it failed.

## Response format

```
## Fawaterak invoice

**Invoice**: 88214
**Total**: 450 EGP
**Status**: unpaid → paid
**Method**: fawry
**Transaction**: FWR-99182736
**Customer**: Mona Hassan / mona@example.com

Checkout link: https://app.fawaterk.com/invoice/...
```

## Notes

- cartTotal is a string; it must match the line items exactly.
- Use `get_payment_methods` first if the user wants to know which rails are actually enabled
  on this account before quoting options to a customer.
- There is no webhook tool here — status comes from polling `get_invoice_data`.

## Examples

```
/invoice-checkout 450 "Mona Hassan" mona@example.com 01012345678
/invoice-checkout 1200 "Ahmed Ali" ahmed@example.com 01198765432
```
