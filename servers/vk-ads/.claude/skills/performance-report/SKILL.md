---
name: performance-report
description: VK Ads performance report — shows, clicks, spend, CTR and CPC per campaign
argument-hint: <date_from YYYY-MM-DD> <date_to YYYY-MM-DD>
---

# /performance-report — VK Ads statistics

## Algorithm

1. Call `list_campaigns` (optionally `status: "active"`) to collect campaign ids.
2. Call `get_statistics` with `object_type: "campaigns"`, `ids` = those ids (1–200),
   `period: "day"` for a trend or `"summary"` for one aggregate row, plus `date_from` /
   `date_to` in `YYYY-MM-DD`. `period: "day"` requires both dates and the range must be
   at most 92 days. `metrics` selects the counter set (`all`, `base`, `events`, `video`, …).
3. Compute the derived metrics yourself — VK returns raw counters, and impressions are called
   **shows**: CTR = clicks / shows × 100, CPC = spend / clicks, CPM = spend / shows × 1000.
   Amounts are already in the cabinet currency — do **not** divide by 100.
4. To drill into a weak campaign: `list_ad_groups` with `campaign_ids` and
   `get_statistics` with `object_type: "ad_groups"`, then `list_ads` with `ad_group_ids` and
   `get_statistics` with `object_type: "banners"`. That last level is where a bad creative
   shows up.
5. Call `get_account` so the report ends with runway, not just spend.

## Response format

```
## VK Ads — 2026-08-01 … 2026-08-31

| Campaign | Shows | Clicks | CTR | Spend | CPC |
|----------|-------|--------|-----|-------|-----|
| Осенняя распродажа | 1,204,882 | 8,412 | 0.70% | 84,120 ₽ | 10.00 ₽ |
| Ретаргет | 210,004 | 3,880 | 1.85% | 21,340 ₽ | 5.50 ₽ |

**Total spend**: 105,460 ₽
**Balance left**: 84,000 ₽ — about 25 days at the current rate.

### Weak spot
"Осенняя распродажа" banner 991205 — CTR 0.11%, 12,400 ₽ spent, 9 clicks.
```

## Notes

- `object_type` accepts `campaigns` (= ad_plans), `ad_groups`, `banners` and `users`.
  `users` gives the account-level roll-up.
- `period` is only `day` or `summary` — there is no `week` / `month` / `overall`; aggregate
  daily rows yourself when the user wants weekly buckets.
- Statistics take at most 200 ids per call. Batch larger accounts.
- `get_account` reads `/user.json`; the balance field needs the OAuth scope `read_payments`.

## Examples

```
/performance-report 2026-08-01 2026-08-31
/performance-report 2026-09-01 2026-09-03
```
