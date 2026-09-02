---
name: customer-orders
description: "Работа с клиентами и заказами в Mindbox"
argument-hint: <customer email or phone>
allowed-tools:
  - get_customer
  - create_order
  - get_segments
---

# /customer-orders

1. Call get_customer to find customer profile
2. Call create_order if needed
3. Call get_segments for segmentation info
4. Format customer summary
