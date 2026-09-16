---
name: store
description: Kaspi.kz store management - orders, products, statuses
argument-hint: [order status] [date from] [date to]
---

# /store -- Kaspi store management

## Algorithm

1. Call get_orders for order list with filters
2. Call get_order for specific order details if needed
3. Call get_products for product catalog overview
4. Show summary of orders and products

## Examples

    /store NEW
    /store DELIVERY 2026-03-01 2026-03-30
