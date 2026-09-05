---
name: customer-360
description: Build a full RetailCRM customer profile — orders, history, notes, segments
argument-hint: <name, phone or email>
---

# /customer-360 — Customer Profile

## Algorithm

1. Find the customer with `list_customers` (filter_name / filter_email / filter_phone, page, limit). Take the numeric `id` from the match.
2. Pull the card with `get_customer` (id, by:"id" or by:"externalId", detail:"full").
3. List their orders with `list_orders` (filter_customer set to the customer name, detail:"full") — count them and sum the totals.
4. Read what changed recently: `customers_history` (filter_date_from / filter_date_to, or filter_since_id for incremental sync).
5. Read the manager notes: `customer_notes_list` (filter_customer_id).
6. Check which marketing segments they fall into with `list_segments` (filter_active:true).
7. If the user dictates a follow-up note, write it with `customer_notes_create` (customer_id, text).

## Notes

- `list_customers` matches names partially — always show the user the candidate list before committing to one id.
- Duplicates: `merge_customers` (result_customer_id + merged_customer_ids) is **destructive** — the merged records are deleted. Never call it without explicit user confirmation of the exact ids.
- With RETAILCRM_READONLY set, the write tools are unavailable; report that instead of retrying.

## Response Format

```
## Customer: Ivan Petrov (id 4821)

**Contacts**: +79001234567 · ivan@mail.ru
**Segments**: Repeat buyers, Moscow
**Orders**: 7 · 143,500 RUB total · avg 20,500 RUB
**Last order**: #10432 — complete — 2026-08-19

### Recent history
- 2026-08-20 — phone changed
- 2026-07-02 — moved to segment "Repeat buyers"

### Notes
- 2026-08-19 — "Asks for pickup delivery only" — manager Sidorova
```

## Examples

```
/customer-360 Ivan Petrov
/customer-360 +79001234567
/customer-360 ivan@mail.ru
```
