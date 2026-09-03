---
name: campaign-launch
description: Launch a VK Ads campaign — check budget, create campaign, attach ads, review targeting
argument-hint: <account_id> "<campaign name>" <budget in kopecks>
---

# /campaign-launch — New VK Ads campaign

## Algorithm

1. Call `get_budget` with account_id. If the remaining balance is below the campaign budget,
   stop and report it — VK will accept the campaign and then refuse to serve it.
2. Call `list_campaigns` with account_id to check the name is not already taken and to see
   what the account already runs.
3. Call `create_campaign` with account_id, name, type (normal, promoted_posts or
   adaptive_ads — normal by default) and budget **in kopecks**.
4. Call `create_ad` with campaign_id from step 3 and format (text, image or video), plus
   title, description, link_url and optionally ad_group_id. Repeat per creative.
5. Call `list_targeting_groups` with campaign_id to show what audience the campaign
   inherited. This server has no tool to create or edit targeting — if the user needs
   different targeting, tell them to set it in the VK Ads cabinet.
6. Call `list_ads` with campaign_ids to confirm everything landed and report moderation status.

## Response format

```
## VK Ads campaign created

**Account**: 1700123456 — balance 84,000 ₽
**Campaign**: "Осенняя распродажа" (id 88214), type normal
**Budget**: 3,000,000 kopecks = 30,000 ₽

### Ads
| id | Format | Title | Status |
|----|--------|-------|--------|
| 991201 | image | Скидки до 40% | moderation |

### Targeting groups
1. Москва 25-45, интерес «одежда» — reach 1.2M
```

## Notes

- **Budgets and prices are in kopecks.** 30,000 ₽ = 3000000. Multiply by 100 before sending
  and divide by 100 when showing figures back.
- New ads go to moderation, not straight to live. Do not tell the user the campaign is
  running until `list_ads` shows it active.
- There is no delete tool here — `update_campaign` with status = stop is how you halt one.

## Examples

```
/campaign-launch 1700123456 "Осенняя распродажа" 3000000
/campaign-launch 1700123456 "Ретаргет ноябрь" 500000
```
