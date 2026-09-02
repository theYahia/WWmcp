---
name: order-management
description: Manage RetailCRM orders and customers
argument-hint: <action> [details]
allowed-tools:
  - Bash
  - Read
---

# /order-management — RetailCRM Operations

## Algorithm

1. Use `list_orders` to list orders with filters by status, customer, or date range.
2. Use `get_order` for a single order's detail (`detail:"full"` for line items/delivery/payments).
3. Use `create_order` to create orders (link an existing customer via `customer_id`, or pass `first_name`).
4. Use `list_customers` / `get_customer` to search and inspect customers.
5. Use `store_inventories` to check stock, `orders_history` for status-change history.

## Response Format

```
## RetailCRM Orders

### Recent Orders
1. #1234 — new — Ivan Petrov — 15,000 RUB — 2 items
2. ...

### Customer Search: "Ivanov"
1. Ivan Ivanov — ivan@mail.ru — 5 orders — 75,000 RUB total
```

## Examples

```
/order-management list orders status new
/order-management create order "Ivan Petrov" +79001234567
/order-management search customers "Sidorov"
```
