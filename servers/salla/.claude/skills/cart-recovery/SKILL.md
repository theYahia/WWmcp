---
name: cart-recovery
description: Salla abandoned-cart recovery — who dropped off, what they left, which coupon to offer
argument-hint: "[pages to scan]"
---

# /cart-recovery — Abandoned Cart Recovery

## Algorithm

1. Pull the carts with `list_abandoned_carts` (page, per_page up to 50). Page through until the list is exhausted or the user's limit is reached.
2. Group the carts by product to find the recurring drop-off item, and sum the value at risk.
3. Enrich the top carts: `get_customer` (customer_id) for contact details and group, `list_customers` (page, per_page) when you need the wider customer list.
4. Check what the item costs and whether it is even in stock before offering it back: `get_product` (product_id) or `get_product_by_sku` (sku). Recovering a cart for an out-of-stock item wastes the outreach.
5. Look at the existing incentives with `list_coupons` (page, per_page) — reuse a live coupon rather than inventing a discount.
6. Read the store's currency and settings from `get_store_info` before quoting any amount.

## Notes

- This server has no messaging tool — it cannot send the recovery email or SMS. Produce the target list, the message draft and the coupon code; the user sends it from Salla or their ESP.
- Do not create a coupon as a side effect: `list_coupons` is read-only and there is no coupon-creation tool here.
- Cart lists are paginated and can be long; state how many pages you actually scanned so the totals are not read as store-wide.

## Response Format

```
## Abandoned carts (scanned 3 pages, 68 carts)

**Value at risk**: 21,400 SAR · **Average cart**: 315 SAR

### Most abandoned products
1. Blue mug (SKU MUG-BLU-01) — 14 carts — in stock: 40
2. Ceramic set — 9 carts — in stock: 0 (skip, cannot fulfil)

### Top carts to recover
| Customer | Items | Value | Contact |
|----------|-------|-------|---------|
| Ahmed A. | 3 | 780 SAR | ahmed@example.com |

### Suggested offer
Existing coupon WELCOME10 (10%, active) — no new coupon needed.
```

## Examples

```
/cart-recovery
/cart-recovery 5
/cart-recovery which product gets abandoned most
```
