---
name: inventory-sync
description: Audit and bulk-update Salla product stock by SKU, variant or branch
argument-hint: "[sku or product name]"
---

# /inventory-sync — Stock Audit and Bulk Update

## Algorithm

1. Survey the catalogue with `list_products` (page, per_page up to 50, status: sale / out / hidden / deleted). Status `out` is the fastest way to see what is already sold out.
2. Resolve a single item: `get_product_by_sku` (sku) when the user gives a SKU, `get_product` (product_id) when they give an ID.
3. If stock is branch-specific, get the branch IDs with `list_branches` (page, per_page).
4. Push quantities with `bulk_update_quantities` (products — an array of items). Each item takes:
   - identifer_type — whether identifer holds a product id, variant id or SKU;
   - identifer — the actual id or SKU value;
   - quantity — the new number;
   - mode — how quantity is applied;
   - unlimited_quantity, branch, reason_id — optional.
5. Single-field corrections (name, price, quantity, status) on one product: `update_product` (product_id, plus the fields to change).
6. Read back with `get_product_by_sku` or `get_product` and show before/after.

## Notes

- `bulk_update_quantities` is **queued** — Salla accepts the request and applies it asynchronously, so it may take minutes. A read straight after the call can still show the old number; say so instead of retrying blindly.
- Do not batch more than the user has actually confirmed. Show the full table of intended changes first.
- The parameter is spelled identifer / identifer_type in the API — keep that spelling.

## Response Format

```
## Salla stock

### Out of stock (status: out)
| SKU | Product | Qty |
|-----|---------|-----|
| MUG-BLU-01 | Blue mug | 0 |

### Queued update (5 items)
| SKU | Was | Will be |
|-----|-----|---------|
| MUG-BLU-01 | 0 | 40 |

Salla queued the job — re-check in a few minutes.
```

## Examples

```
/inventory-sync
/inventory-sync MUG-BLU-01
/inventory-sync set MUG-BLU-01 to 40
```
