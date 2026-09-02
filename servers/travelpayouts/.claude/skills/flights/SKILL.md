---
name: flights
description: Search cheap flights - prices by dates, price calendar, popular routes
argument-hint: <origin IATA> <destination IATA> [departure date]
---

# /flights -- Flight search

## Algorithm

1. Call search_flights with IATA city codes and dates
2. Call get_prices_calendar for monthly price overview
3. Show cheapest options with links

## Examples

    /flights MOW LED 2026-05
    /flights SVO IST
