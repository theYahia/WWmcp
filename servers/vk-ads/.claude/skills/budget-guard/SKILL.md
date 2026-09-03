---
name: budget-guard
description: Find VK Ads campaigns burning budget without results and stop or rebudget them
argument-hint: <account_id> [CPC threshold in roubles]
---

# /budget-guard — Stop the bleeding

## Algorithm

1. Call `get_budget` with account_id. Note the remaining balance — this is the runway.
2. Call `list_campaigns` with account_id and status = active.
3. Call `get_statistics` with account_id, ids_type = campaign, ids = the active campaign ids,
   period = day, and a date range covering the last 7 days.
4. For each campaign compute CPC (spend / clicks) and CTR (clicks / impressions). Convert
   spend from kopecks to roubles first.
5. Flag a campaign when it exceeds the user's CPC threshold, or when it has spent money with
   near-zero clicks. State the numbers — never flag on a hunch.
6. Show the flagged list and **ask for confirmation before changing anything**.
7. On confirmation, per campaign either:
   - `update_campaign` with campaign_id and status = stop to pause it, or
   - `update_campaign` with campaign_id and budget (kopecks) to cut its budget instead.
8. Call `list_campaigns` again to confirm the new state.

## Response format

```
## VK Ads budget guard — account 1700123456

**Balance**: 84,000 ₽
**Last 7 days spend**: 41,200 ₽ → runway ≈ 14 days

### Flagged (CPC over 15 ₽)
| Campaign | Spend 7d | Clicks | CPC | Action |
|----------|----------|--------|-----|--------|
| Осенняя распродажа | 28,400 ₽ | 812 | 34.98 ₽ | stopped |
| Тест видео | 6,200 ₽ | 41 | 151.22 ₽ | budget → 5,000 ₽ |

Projected saving: ~24,000 ₽ / week.
```

## Notes

- Budget values in `update_campaign` are in kopecks, same as `create_campaign`.
- status accepts start and stop. Stopping is reversible — say so, it makes the decision easier.
- Never stop a campaign without explicit confirmation, even when the numbers are damning.

## Examples

```
/budget-guard 1700123456
/budget-guard 1700123456 15
```
