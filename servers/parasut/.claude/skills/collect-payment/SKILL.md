---
name: collect-payment
description: Record a payment collected against a sales invoice in Parasut
allowed-tools:
  - mcp__parasut__list_sales_invoices
  - mcp__parasut__list_accounts
  - mcp__parasut__record_sales_invoice_payment
---
Ask the user for: the invoice (ID or customer + date) and the amount and date collected.
1. If only the customer is known, find the invoice with `list_sales_invoices` (filter by contact_id and issue-date range).
2. List cash/bank accounts with `list_accounts` and pick the one the money went into (account_id).
3. Record it with `record_sales_invoice_payment` (invoice_id, account_id, amount, date).
4. Report back: remaining balance on the invoice if returned, and the account used.
