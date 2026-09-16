---
name: monthly-bills
description: Review this month's purchase bills and what is still unpaid in Parasut
allowed-tools:
  - mcp__parasut__list_purchase_bills
  - mcp__parasut__list_accounts
  - mcp__parasut__record_purchase_bill_payment
---
1. Determine the current month's date range (first and last day).
2. Call `list_purchase_bills` with issue_date_from / issue_date_to set to that range (sort='-issue_date').
3. For any bill the user wants to pay, list cash/bank accounts with `list_accounts`, then `record_purchase_bill_payment` (bill_id, account_id, amount, date).
4. Summarize: total bills, total amount, and which suppliers are still owed.
