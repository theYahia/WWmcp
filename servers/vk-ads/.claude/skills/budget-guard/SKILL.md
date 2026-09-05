---
name: budget-guard
description: Find VK Ads campaigns burning budget without results and stop or rebudget them
argument-hint: "[CPC threshold in roubles]"
---

# /budget-guard — Stop the bleeding

## Algorithm

1. Call `get_account`. Note the remaining balance — this is the runway. (Balance needs the
   OAuth scope `read_payments`.)
2. Call `list_campaigns` with `status: "active"`.
3. Call `get_statistics` with `object_type: "campaigns"`, `ids` = the active campaign ids
   (max 200), `period: "day"`, and `date_from` / `date_to` covering the last 7 days
   (`YYYY-MM-DD`, range at most 92 days).
4. For each campaign compute CPC (spend / clicks) and CTR (clicks / **shows**) — VK calls
   impressions `shows`. Amounts are already in the cabinet currency; do not divide by 100.
5. Flag a campaign when it exceeds the user's CPC threshold, or when it has spent money with
   near-zero clicks. State the numbers — never flag on a hunch.
6. Show the flagged list and **ask for confirmation before changing anything**.
7. On confirmation, per campaign either:
   - `update_campaign` with `campaign_id` and `action: "stop"` to pause it, or
   - `update_campaign` with `campaign_id` and `budget_limit` / `budget_limit_day` to cut its
     budget instead.
8. Call `list_campaigns` again to confirm the new state.
9. If one campaign is the problem but not all of it, drill down: `list_ad_groups` with
   `campaign_ids`, then `get_statistics` with `object_type: "ad_groups"`.

## Response format

```
## VK Ads budget guard

**Balance**: 84,000 ₽
**Last 7 days spend**: 41,200 ₽ → runway ≈ 14 days

### Flagged (CPC over 15 ₽)
| Campaign | Spend 7d | Clicks | CPC | Action |
|----------|----------|--------|-----|--------|
| Осенняя распродажа | 28,400 ₽ | 812 | 34.98 ₽ | stopped |
| Тест видео | 6,200 ₽ | 41 | 151.22 ₽ | budget_limit → 5,000 ₽ |

Projected saving: ~24,000 ₽ / week.
```

## Notes

- Budgets are in the cabinet currency (roubles for RUB), not kopecks.
- `action` accepts `activate`, `stop` and `delete`. Stopping is reversible — say so, it makes
  the decision easier. `delete` is not.
- Never stop a campaign without explicit confirmation, even when the numbers are damning.
- `update_campaign` is annotated destructive: the client may prompt the user before it runs.

## Examples

```
/budget-guard
/budget-guard 15
```
