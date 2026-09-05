---
name: campaign-launch
description: Launch a VK Ads campaign — check balance, create the ad_plan, attach ads, review ad groups
argument-hint: "<campaign name>" <objective> <budget in roubles>
---

# /campaign-launch — New VK Ads campaign

VK Ads v2 has three levels: **ad_plans** (campaigns) → **ad_groups** → **banners** (ads).
No tool here takes an `account_id` — the cabinet is determined by the token.

## Algorithm

1. Call `get_account`. If the remaining balance is below the campaign budget, stop and report
   it — VK will accept the campaign and then refuse to serve it. (Balance needs the OAuth
   scope `read_payments`; if it is missing, say so rather than reporting a blank.)
2. Call `list_campaigns` to check the name is not already taken and to see what the account
   already runs.
3. Call `create_campaign` with name, objective (e.g. `traffic`, `reach`, `site_conversions`,
   `leadads`) and `budget_limit` and/or `budget_limit_day` **in the cabinet currency — roubles
   for RUB, not kopecks**.
4. Ad groups carry the targeting and are **not creatable from this server**. Tell the user to
   add an ad group under the new campaign in the VK Ads cabinet, then call `list_ad_groups`
   with `campaign_ids` to get its id.
5. Call `create_ad` with that `ad_group_id`, plus `textblocks`, `urls` and `content`. Media
   creatives must already be uploaded in the cabinet — `content` references their ids
   (e.g. `{"image_600x600": {"id": 123}}`). Repeat per creative.
6. Call `list_ads` with `ad_group_ids` to confirm everything landed and report
   `moderation_status`.

## Response format

```
## VK Ads campaign created

**Balance**: 84,000 ₽
**Campaign (ad_plan)**: "Осенняя распродажа" (id 88214), objective traffic
**Budget**: 30,000 ₽ total / 2,000 ₽ per day

### Ad groups
| id | Name | Delivery |
|----|------|----------|
| 55120 | Москва 25-45 | active |

### Ads (banners)
| id | Title | Moderation |
|----|-------|------------|
| 991201 | Скидки до 40% | moderation |
```

## Notes

- **Budgets are in the cabinet currency, not kopecks.** 30,000 ₽ = `30000`.
- New ads go to moderation, not straight to live. Do not tell the user the campaign is
  running until `list_ads` shows it active.
- There is no delete tool — `update_campaign` with `action: "stop"` halts a campaign and
  `action: "delete"` marks it deleted. Both are reversible only in the cabinet.
- Lists auto-paginate up to `limit` (default 200) and report `truncated` when there is more.

## Examples

```
/campaign-launch "Осенняя распродажа" traffic 30000
/campaign-launch "Ретаргет ноябрь" site_conversions 5000
```
