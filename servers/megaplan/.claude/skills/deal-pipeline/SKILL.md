---
name: deal-pipeline
description: Review the Megaplan deal pipeline — value by stage, stalled deals, add a new one
argument-hint: "[status] [responsible id]"
---

# /deal-pipeline — Deal pipeline review

## Algorithm

1. Call `get_deals` with optional filter_status (account-specific status **codes**),
   filter_responsible_id or search, plus limit (max 100). Lists are cursor-paginated: pass the
   returned `nextPageAfter` back as `page_after` until the list ends.
2. Call `get_employees` to resolve responsible IDs into names.
3. Group deals by status and sum amount per group — that is the pipeline picture. Show both
   count and money; a stage with many small deals is a different problem from one with few
   large ones.
4. Find stalled deals: for the largest ones, call `get_deal` with the deal ID for the full
   record, then `get_comments` with subject_type = deal and subject_id = that ID.
   A deal with no recent comment is not being worked.
   Use `list_clients` or `get_client` when you need the counterparty behind a deal.
5. Call `get_projects` with filter_status or search if the user wants to see which delivery
   projects the won deals feed into.
6. To add a deal, call `get_deal_programs` first to find the program_id (the pipeline ID —
   `create_deal` requires it), then call `create_deal` with name and program_id, plus
   optionally responsible_id, contact_id, amount and description. Use `get_deal_program`
   for the detail of one pipeline.
7. To chase a deal, call `create_comment` with subject_type = deal, subject_id and content.

## Response format

```
## Megaplan pipeline

| Stage | Deals | Value |
|-------|-------|-------|
| negotiation | 14 | 4,820,000 ₽ |
| proposal sent | 9 | 2,310,000 ₽ |
| won | 6 | 3,150,000 ₽ |

**Open pipeline**: 7,130,000 ₽ across 23 deals

### Stalled (no comment in 14+ days)
| Deal | Value | Owner | Last activity |
|------|-------|-------|---------------|
| Contract — Romashka | 1,200,000 ₽ | Ivan Petrov | 2026-08-14 |
```

## Notes

- program_id is mandatory for `create_deal`. Get it from `get_deal_programs` — never guess
  an ID. `update_deal` changes an existing deal without recreating it.
- Status codes are account-specific. If a filter returns empty, pull unfiltered and group
  by whatever status values actually come back.
- `create_deal` takes the amount as `amount` + `currency`; the server wraps it into the v3 Money
  object. Tool output is a compact summary by default (`raw: true` for the API JSON).
- `create_comment` notifies the assignee. Get the text approved before posting.

## Examples

```
/deal-pipeline
/deal-pipeline negotiation
/deal-pipeline responsible 1000005
```
