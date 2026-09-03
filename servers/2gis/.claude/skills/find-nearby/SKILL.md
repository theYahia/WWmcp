---
name: find-nearby
description: Find places around a location in 2GIS — cafes, pharmacies, ATMs — with ratings and reviews
argument-hint: <what to find> <address or lat,lon> [radius in meters]
---

# /find-nearby — Places around a point

## Algorithm

1. If the user gave an address instead of coordinates, call `geocode` with it and take lat/lon
   from the first result. If they gave coordinates, skip this step.
2. Call `search_places` with query = what the user is looking for, point = "lon,lat" (2GIS
   expects longitude first), radius in meters (default 1000), page_size = 10.
3. If nothing is found, widen radius to 5000 and retry once before reporting an empty result.
4. For the top 3 results call `get_reviews` with their place_id to pull rating and recent
   review count. Skip this if the user asked for a plain list.
5. If a result looks ambiguous, call `get_place` with its place_id for the full card
   (schedule, phones, website).

## Response format

```
## Cafes within 1 km of Tverskaya 7

| # | Name | Address | Rating | Distance |
|---|------|---------|--------|----------|
| 1 | Coffee Bean | Tverskaya 9 | 4.6 (312) | 180 m |
| 2 | ... | | | |

Total found: 47 — showing top 10.
```

## Notes

- `search_places` takes point as a single "lon,lat" string, not two numbers.
- The type filter accepts building, street, branch, org, adm_div — use org for businesses.
- `get_reviews` takes a place_id from a search result, not a name.
- 2GIS covers Russia and CIS. Outside that footprint results will be empty — say so instead
  of retrying.

## Examples

```
/find-nearby pharmacy 55.7558,37.6173
/find-nearby coffee "Nevsky prospekt 28" 500
/find-nearby ATM Sberbank Kazan center
```
