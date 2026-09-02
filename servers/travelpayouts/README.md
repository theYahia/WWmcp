# @theyahia/travelpayouts-mcp

MCP server for the Travelpayouts (Aviasales) API. **13 tools** for flight search, price calendars, hotel search, airport/airline/city lookup, direct routes, and flexible date pricing.

## Install

```bash
npm install -g @theyahia/travelpayouts-mcp
```

Or use directly with npx:

```bash
npx @theyahia/travelpayouts-mcp
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TRAVELPAYOUTS_TOKEN` | Yes | API token from [Travelpayouts](https://www.travelpayouts.com/developers/api) |

## Claude Desktop Config

```json
{
  "mcpServers": {
    "travelpayouts": {
      "command": "npx",
      "args": ["-y", "@theyahia/travelpayouts-mcp"],
      "env": {
        "TRAVELPAYOUTS_TOKEN": "your-token"
      }
    }
  }
}
```

## Tools (13)

### Flights (8)
| Tool | Description |
|------|-------------|
| `search_flights_prices` | Search cheap flights by route, dates, and currency |
| `get_cheapest_month` | Find cheapest flights for an entire month |
| `get_calendar_prices` | Price calendar showing cheapest price per day |
| `get_popular_directions` | Popular flight directions from a city with prices |
| `get_airline_directions` | Routes served by a specific airline |
| `get_special_offers` | Current special flight deals across all routes |
| `get_direct_routes` | Search only non-stop flights between two cities |
| `get_nearest_prices` | Prices for ±N days around a target date (flexible travel) |

### Hotels (2)
| Tool | Description |
|------|-------------|
| `search_hotels` | Search hotels by city with dates and guest count |
| `get_hotel_prices` | Get prices for a specific hotel by ID |

### Lookup (3)
| Tool | Description |
|------|-------------|
| `lookup_airports` | Search/autocomplete airports by name or IATA code |
| `lookup_airlines` | Search airlines by name or IATA/ICAO code |
| `lookup_cities` | Search/autocomplete cities by name or IATA code |

## Auth

API token passed via `X-Access-Token` header or query parameter. Retries on 429 (rate limit) and 5xx (server errors) with exponential backoff.

## Demo Prompts

1. **"Find the cheapest flights from Moscow to Istanbul in June"**
   Uses `lookup_cities` to resolve IATA codes, then `get_cheapest_month` to find the best deals for the month.

2. **"What are the popular destinations from Saint Petersburg right now?"**
   Uses `get_popular_directions` with origin LED to show trending routes and current prices.

3. **"Search hotels in Sochi for July 10-17 for 2 adults, then find flights there from Moscow"**
   Uses `search_hotels` for accommodation options, then `search_flights_prices` for matching flight dates.

4. **"I want to fly Moscow → Dubai around March 15, but ±3 days is fine if it's cheaper"**
   Uses `get_nearest_prices` to compare prices across 7 dates centered on March 15.

5. **"Find only direct flights from Moscow to Minsk"**
   Uses `get_direct_routes` with direct=true filter.

## Development

```bash
npm install
npm run dev          # Run with tsx
npm test             # Run tests
npm run build        # Compile TypeScript
```

## License

MIT

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
