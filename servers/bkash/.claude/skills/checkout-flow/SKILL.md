---
name: checkout-flow
description: Run a bKash tokenized checkout end to end — create, execute, confirm
argument-hint: <amount BDT> <merchantInvoiceNumber> <payerReference>
---

# /checkout-flow — bKash tokenized checkout

## Algorithm

1. Collect amount (BDT, passed as a **string**), merchantInvoiceNumber (your order number),
   payerReference (customer phone or internal ID) and callbackURL.
2. Call `create_payment` with amount, merchantInvoiceNumber, payerReference, callbackURL.
   Optional: currency (defaults to BDT), intent (sale or authorization),
   merchantAssociationInfo. It returns a paymentID and a bKashURL for the customer.
3. Give the customer the bKash URL. Do not call the next step until they report finishing
   the popup — bKash rejects an execute on an unconfirmed payment.
4. Call `execute_payment` with the paymentID from step 2. This is what actually moves money.
5. Call `query_payment` with the same paymentID to confirm the final state and capture trxID.
6. If `execute_payment` errored but the customer says they paid, call `query_payment` before
   retrying — a duplicate execute can double-charge.

## Response format

```
## bKash payment

**paymentID**: TR0011ON1565343075976
**Invoice**: INV-2026-0142
**Amount**: 1,500 BDT
**Status**: Completed
**trxID**: 8H7D9K2L01

Customer link: https://checkout.sandbox.bka.sh/...
```

## Notes

- amount is a string in the API ("1500", not 1500). Pass it as typed.
- intent = authorization holds funds instead of capturing them; only use it if the user
  explicitly asks for a hold.
- trxID appears only after a successful execute — do not promise it earlier.

## Examples

```
/checkout-flow 1500 INV-2026-0142 01712345678
/checkout-flow 250 ORDER-88 customer_4417
```
