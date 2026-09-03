---
name: performance-report
description: VK Ads performance report — impressions, clicks, spend, CTR and CPC per campaign
argument-hint: <account_id> <date_from YYYY-MM-DD> <date_to YYYY-MM-DD>
---

# /performance-report — VK Ads statistics

## Algorithm

1. Call `list_campaigns` with account_id (optionally status = active) to collect campaign ids.
2. Call `get_statistics` with account_id, ids_type = campaign, ids = the campaign id array,
   period (day, week, month or overall), date_from and date_to in YYYY-MM-DD.
3. Compute the derived metrics yourself — VK returns raw counters:
   CTR = clicks / impressions × 100, CPC = spend / clicks, CPM = spend / impressions × 1000.
   Convert spend from kopecks to roubles before showing it.
4. To drill into a weak campaign, call `list_ads` with its campaign_ids and then
   `get_statistics` again with ids_type = ad and the ad ids. This is where a bad creative
   shows up.
5. Call `get_budget` with account_id so the report ends with runway, not just spend.

## Response format

```
## VK Ads — 2026-08-01 … 2026-08-31

| Campaign | Impressions | Clicks | CTR | Spend | CPC |
|----------|------------|--------|-----|-------|-----|
| Осенняя распродажа | 1,204,882 | 8,412 | 0.70% | 84,120 ₽ | 10.00 ₽ |
| Ретаргет | 210,004 | 3,880 | 1.85% | 21,340 ₽ | 5.50 ₽ |

**Total spend**: 105,460 ₽
**Balance left**: 84,000 ₽ — about 25 days at the current rate.

### Weak spot
"Осенняя распродажа" ad 991205 — CTR 0.11%, 12,400 ₽ spent, 9 clicks.
```

## Notes

- All money in this API is in kopecks. Divide by 100 for roubles.
- ids_type accepts campaign, ad or office. office gives the account-level roll-up.
- period = overall collapses the range into one row; use day when the user wants a trend.

## Examples

```
/performance-report 1700123456 2026-08-01 2026-08-31
/performance-report 1700123456 2026-09-01 2026-09-03 day
```
