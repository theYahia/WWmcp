---
name: competitor-scan
description: Scan competitors in a 2GIS category around a location — count, ratings, weak spots
argument-hint: <rubric id or category name> <location> [radius in meters]
---

# /competitor-scan — Category density and ratings

## Algorithm

1. Resolve the location: call `geocode` on the address the user gave, take lat/lon.
2. Resolve the category. If the user gave a 2GIS rubric_id, use it directly with
   `search_by_rubric`. If they gave a name ("barbershop", "coffee"), use `search_places` with
   that query and type = org instead — there is no rubric lookup tool in this server.
3. Call `search_by_rubric` (or `search_places`) with point = "lon,lat" and radius
   (default 1500). Note the total count — that is the density number.
4. For the top 5 results call `get_reviews` with each place_id. Record rating and review count.
5. For the two highest-rated call `get_place` to pull schedule and contacts.
6. Summarize: how many competitors, rating spread, who dominates, where the gap is
   (low ratings, few reviews, short opening hours).

## Response format

```
## Barbershops within 1.5 km of Arbat 12

**Density**: 23 in radius
**Rating spread**: 3.4 — 4.9 (median 4.3)

| # | Name | Rating | Reviews | Hours |
|---|------|--------|---------|-------|
| 1 | ... | 4.9 | 480 | 10:00–22:00 |

**Gap**: 9 of 23 have under 20 reviews — thin social proof in this radius.
```

## Notes

- Report only what the tools returned. Do not estimate revenue or traffic — 2GIS has no such
  fields.
- `get_reviews` accepts an optional limit; keep it small (10) since only the aggregate matters.
- A large total with a small returned page is normal: increase page_size on `search_places`
  or paginate before claiming a number is final.

## Examples

```
/competitor-scan barbershop "Arbat 12" 1500
/competitor-scan "coffee shop" 55.7558,37.6173
/competitor-scan pharmacy "Kazan, Bauman 5" 800
```
