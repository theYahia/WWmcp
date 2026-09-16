---
name: payout-to-bank
description: Send money from a Chapa balance to an Ethiopian bank account, then verify it
argument-hint: <amount> <account name> <account number> <bank name> <reference>
---

# /payout-to-bank — Chapa transfer

## Algorithm

1. Call `get_balance` first. If the available balance is below the payout amount, stop and
   report it — Chapa rejects underfunded transfers and the error is opaque.
2. Call `list_banks` (currency defaults to ETB; pass USD if paying out in dollars). Find the
   bank the user named and take its bank_code. Never guess a bank_code.
3. Confirm account_name and account_number with the user, character by character. Transfers
   are not reversible from this API.
4. Call `transfer` with account_name, account_number, amount (a **string**), reference
   (unique per payout), bank_code, and optionally currency and beneficiary_name.
5. Call `verify_transfer` with the same reference to read the final state.
6. If verification says pending, say pending. Do not report a payout as delivered on the
   strength of the transfer call alone.

## Response format

```
## Chapa payout

**Balance before**: 42,300 ETB
**To**: Abebe Kebede / 1000123456789 / Commercial Bank of Ethiopia (bank_code 946)
**Amount**: 5,000 ETB
**Reference**: PAYOUT-2026-09-03-01
**Status**: success
```

## Notes

- `list_banks` is the only source of a valid bank_code — a wrong code silently routes to
  the wrong institution or fails late.
- reference must be unique; `verify_transfer` looks the transfer up by it.
- amount is a string here as well.

## Examples

```
/payout-to-bank 5000 "Abebe Kebede" 1000123456789 "Commercial Bank of Ethiopia" PAYOUT-01
/payout-to-bank 800 "Sara Tesfaye" 0123456789 Awash PAYOUT-02
```
