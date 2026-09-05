---
name: hotel-search
description: Search hotels via Travelpayouts/Hotellook and compare prices across booking sites
argument-hint: <city> <check_in YYYY-MM-DD> <check_out YYYY-MM-DD> [adults]
---

# /hotel-search — Hotels and price comparison

## Algorithm

1. Call `search_hotels` with location (city or resort name, e.g. Moscow or Сочи),
   check_in, check_out, adults (1–9, default 2), children (0–4), currency (default rub)
   and limit (1–50, default 10).
2. Rank the results the way the user asked — cheapest, best rated, or closest to centre.
   If they did not say, sort by price and note the rating alongside so the trade-off is visible.
3. For the shortlist, call `get_hotel_prices` with hotel_id (from the search results),
   check_in, check_out, adults and currency. This returns live rates from different OTAs —
   Booking, Ostrovok and others — for the same room.
4. Show the spread between OTAs. That spread is the whole point: the same hotel often
   differs by 15–30% between agencies.
5. Compute price per night (total divided by nights) so options with different stay lengths
   are comparable.

## Response format

```
## Hotels — Сочи, 2026-10-12 → 2026-10-15 (2 adults, 3 nights)

| # | Hotel | Rating | Total | Per night |
|---|-------|--------|-------|-----------|
| 1 | Marins Park | 8.4 | 21,600 ₽ | 7,200 ₽ |
| 2 | Bogatyr | 9.1 | 34,500 ₽ | 11,500 ₽ |

### Price by agency — Marins Park (hotel_id 4471)
| Agency | Total |
|--------|-------|
| Ostrovok | 21,600 ₽ |
| Booking | 25,100 ₽ |

Saving by choosing the cheaper agency: 3,500 ₽.
```

## Notes

- hotel_id is a number from `search_hotels`. Do not pass a hotel name to `get_hotel_prices`.
- Prices are cached indicative rates, not a guaranteed booking. Say so — the user will see
  a different number if they book hours later.
- children is capped at 4 and adults at 9 per query.
- This server searches and prices; it does not book. There is no reservation tool here.

## Examples

```
/hotel-search Сочи 2026-10-12 2026-10-15
/hotel-search Istanbul 2026-11-01 2026-11-05 2
```
