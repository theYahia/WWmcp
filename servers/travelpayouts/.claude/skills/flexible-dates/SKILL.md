---
name: flexible-dates
description: Find the cheapest flight date when travel dates are flexible — month, calendar, ±N days
argument-hint: <origin> <destination> [month YYYY-MM or date YYYY-MM-DD]
---

# /flexible-dates — Cheapest date search

## Algorithm

1. Resolve city codes. If the user gave city names rather than IATA codes, call
   `lookup_airports` or `lookup_cities` with query and lang to get the correct code.
   Never guess an IATA code — a wrong one returns plausible prices for the wrong city.
2. Pick the tool that matches how flexible the user is:
   - Whole month open → `get_cheapest_month` with origin, destination, month (YYYY-MM).
   - Date roughly fixed → `get_nearest_prices` with origin, destination, departure_at
     (YYYY-MM-DD) and range_days (1–7, default 3).
   - Wants the full picture → `get_calendar_prices` with origin and destination:
     minimum price per date.
3. If the user refuses connections, call `get_direct_routes` with origin, destination,
   optional departure_at and limit — non-stop only.
4. Call `search_flights_prices` with origin, destination, departure_at, return_at,
   one_way and limit for the actual ticket list on the winning date.
5. Compare the chosen date against the surrounding ones and state the saving in money,
   not just "cheaper".

## Response format

```
## MOW → LED, October 2026 — flexible

**Cheapest in month**: 2026-10-14 — 2,140 ₽
**Most expensive**: 2026-10-31 — 7,800 ₽

### ±3 days around 2026-10-17
| Date | Price | vs chosen |
|------|-------|-----------|
| 2026-10-14 | 2,140 ₽ | −1,960 ₽ |
| 2026-10-17 | 4,100 ₽ | — |

**Direct only**: 2 non-stop options from 3,200 ₽.
Shifting departure by 3 days saves 1,960 ₽ per passenger.
```

## Notes

- currency defaults to rub; pass usd or eur if the user thinks in another currency.
- Prices are cached historical minimums from Travelpayouts, not live availability. Say so —
  the fare may be gone.
- `get_cheapest_month` needs the month as YYYY-MM; `get_nearest_prices` needs a full
  YYYY-MM-DD. Mixing the formats returns nothing.
- For inspiration rather than a fixed pair, use `get_popular_directions` or
  `get_special_offers` with just an origin.

## Examples

```
/flexible-dates MOW LED 2026-10
/flexible-dates Москва Стамбул 2026-11-17
/flexible-dates SVO AER direct only
```
