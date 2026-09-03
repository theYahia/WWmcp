---
name: plan-route
description: Build a route between two addresses in 2GIS — driving, transit, walking — with time and distance
argument-hint: <from address> <to address> [driving|public_transport|pedestrian|bicycle|taxi]
---

# /plan-route — Route between two points

## Algorithm

1. Call `geocode` for the origin address. If the user typed a partial address, call `suggest`
   first and ask which of the completions they meant.
2. Call `geocode` for the destination the same way.
3. Call `get_directions` with origin_lat, origin_lon, dest_lat, dest_lon and mode
   (driving by default; the user may ask for public_transport, pedestrian, bicycle or taxi).
4. Read total_duration_sec and total_distance_m from each returned route; convert seconds to
   minutes and meters to kilometers before showing them.
5. If the user is comparing options, call `get_directions` once per mode and put the results
   in one table.

## Response format

```
## Route: Tverskaya 7 → Sheremetyevo D

**Mode**: driving
**Time**: 52 min
**Distance**: 34.8 km
**Legs**: 3

Alternatives:
| Mode | Time | Distance |
|------|------|----------|
| driving | 52 min | 34.8 km |
| public_transport | 1 h 18 min | 41.2 km |
```

## Notes

- `get_directions` takes four separate numbers, not a point string — unlike `search_places`.
- If the response has no routes, report "no route found" rather than inventing one; 2GIS
  returns nothing for cross-border or unreachable pairs.
- `reverse_geocode` is the inverse tool: use it when the user gives coordinates and wants to
  confirm the address before routing.

## Examples

```
/plan-route "Tverskaya 7" "Sheremetyevo D"
/plan-route "Nevsky 28" "Pulkovo" public_transport
/plan-route "my office" "Kazan station" pedestrian
```
