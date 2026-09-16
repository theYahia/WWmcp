---
name: create-invoice
description: Create a sales invoice in Parasut for a customer
allowed-tools:
  - mcp__parasut__list_contacts
  - mcp__parasut__list_products
  - mcp__parasut__create_sales_invoice
---
Ask the user for: the customer (name or ID) and the line items (product, quantity, unit price).
1. Find the customer with `list_contacts` (account_type=customer) by name, or use the given ID.
2. Find each product with `list_products` by name to get its product_id, or use given IDs.
3. Create the invoice with `create_sales_invoice` (issue_date, currency=TRL, items with vat_rate=20 unless told otherwise).
4. Report back: the invoice ID, net/gross total, currency, and line items.
