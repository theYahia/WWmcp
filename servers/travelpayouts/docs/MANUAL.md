# travelpayouts-mcp user manual

Package `@theyahia/travelpayouts-mcp`, package version 2.0.1, 13 tools. Node.js 18 or
newer. Two upstream APIs: Travelpayouts (`https://api.travelpayouts.com`) for flights and
reference data, Hotellook (`https://engine.hotellook.com/api/v2`) for hotels.

Sections: [1. Purpose](#1-what-this-is-and-who-needs-it) · [2. Install](#2-installation-and-connection) ·
[3. Token](#3-where-to-get-the-api-token) · [4. Tools](#4-tools-by-task) ·
[5. Scenarios](#5-ready-made-scenarios) · [6. Limits](#6-limits-and-pitfalls) ·
[7. Errors](#7-common-errors)

---

## 1. What this is and who needs it

The server gives an AI agent flight and hotel pricing from the Travelpayouts (Aviasales)
affiliate API: cheap fares for a route and date, a price calendar, the cheapest month,
direct-only flights, flexible dates around a target day, special offers, hotel search, and
lookup tables for airports, cities and airlines.

The work it removes is opening a search engine and reading a results page: "how much is
Moscow to Sochi on 12 October", "which month is cheapest for Istanbul", "±3 days around
15 March if it is cheaper", "direct flights only".

Who needs it: anyone planning trips who wants numbers in a table instead of a search
results page; a travel affiliate checking prices across many routes; a developer
prototyping against the Travelpayouts API before writing code.

Two properties matter before you rely on the numbers. First, this API serves **cached
prices** collected from earlier searches, not a live booking-engine quote — see section
6.1. Second, tool descriptions and default locales are Russian (`currency: "rub"`,
`lang: "ru"`), because the server targets the Russian market; every one of those is a
parameter you can change per call.

---

## 2. Installation and connection

### Claude Desktop

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "travelpayouts": {
      "command": "npx",
      "args": ["-y", "@theyahia/travelpayouts-mcp"],
      "env": {
        "TRAVELPAYOUTS_TOKEN": "your_token"
      }
    }
  }
}
```

The client reads its configuration at startup — restart it after editing.

### Claude Code

```
claude mcp add travelpayouts -e TRAVELPAYOUTS_TOKEN=your_token -- npx -y @theyahia/travelpayouts-mcp
```

### Cursor / Windsurf / VS Code (Copilot)

Cursor and Windsurf take the same `mcpServers` block in `.cursor/mcp.json` or
`.windsurf/mcp.json`. VS Code uses `.vscode/mcp.json`, where the root key is `servers`,
not `mcpServers`; `command`, `args` and `env` are the same. Keep the token out of files
under version control.

### Streamable HTTP transport

```bash
HTTP_PORT=3000 npx @theyahia/travelpayouts-mcp --http
```

The mode is enabled by the `--http` flag or by setting `HTTP_PORT` (default 3000).
Endpoints: `POST /mcp` (requests; an initialize request opens a session), `GET /mcp` (SSE
stream for an existing session), `DELETE /mcp` (session termination), `GET /health`
(`status`, `server`, `version`, `uptime`, `memory_mb`, `tools`). Sessions are keyed by the
`mcp-session-id` header; browser cross-origin calls are rejected by default.

`/mcp` has no authentication of its own. Everything this server exposes is read-only, so
the exposure is your affiliate token's quota rather than your data — still not a reason to
publish the port.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `TRAVELPAYOUTS_TOKEN` | yes | API token; sent as a `token=` **query parameter** |
| `HTTP_PORT` | no | Port for HTTP mode; setting it also enables the mode |
| `MCP_DISABLE_SANITIZE` | no | `true` disables prompt-injection filtering of responses |

A missing token is discovered on the first tool call, not at startup.

Note a version inconsistency worth knowing when reading logs: `package.json` says 2.0.1
while the MCP handshake and `/health` report 2.1.0.

---

## 3. Where to get the API token

The token is issued in the Travelpayouts partner account:
<https://www.travelpayouts.com/developers/api>. One value is all the configuration this
server needs.

Two implementation details follow from how Travelpayouts authenticates:

- **The token travels as a query parameter, not a header.** It is appended as `token=…`
  to every request URL. That is what the API expects, but it means the token can appear in
  proxy logs and access logs along the way. Treat any log capturing full URLs as
  containing the credential.
- **The same token serves both upstreams.** Flight and reference calls go to
  `api.travelpayouts.com`; hotel calls go to `engine.hotellook.com`. Both receive the same
  token.

The token is tied to an affiliate account, and Travelpayouts applies quotas per account.
Nothing in this server can raise them; section 6.6 covers what happens when they are hit.

---

## 4. Tools by task

City and airport codes throughout are **IATA codes**: `MOW` for Moscow (the city, all
airports), `SVO` for Sheremetyevo (one airport), `LED`, `IST`, `DXB`. Resolve names with
the lookup tools before searching — a wrong code returns an empty result, not an error.

Dates are `YYYY-MM-DD`, and several flight tools also accept `YYYY-MM` to mean "any day
that month". Currency defaults to `rub` and accepts the usual codes (`usd`, `eur`).
Responses are the raw upstream JSON, pretty-printed.

### 4.1 Resolve codes first

**`lookup_cities`** — city autocomplete. Required `query` (a name or code); optional
`lang` (default `ru`) and `limit` (1–20, default 5).

**`lookup_airports`** — the same autocomplete restricted to airports. Same parameters.
Use it when you need a specific terminal rather than a whole city.

**`lookup_airlines`** — airline reference. Optional `query`; without it the **entire
airline directory** is returned. Optional `lang` (default `ru`) selects the reference feed.
Filtering is done client-side: the query is matched as a substring against the whole
record, so it finds a name, an IATA code or an ICAO code without you saying which.

### 4.2 Price for a known route and date

**`search_flights_prices`** — the main tool. Required `origin` and `destination`.
Optional: `departure_at` (`YYYY-MM` or `YYYY-MM-DD`), `return_at` (same formats, for a
round trip), `one_way` (default `true`), `currency` (default `rub`), `limit` (1–30,
default 10).

**`get_direct_routes`** — the same endpoint with `direct=true` forced: non-stop flights
only. Required `origin` and `destination`; optional `departure_at`, `currency`, `limit`
(1–30, default 10). There is no `one_way` here.

### 4.3 When the dates are flexible

**`get_calendar_prices`** — cheapest price per day for a route. Required `origin` and
`destination`; optional `currency`. No date range parameter — the API decides the window.

**`get_cheapest_month`** — cheapest fares across one month. Required `origin`,
`destination` and `month` (`YYYY-MM`); optional `currency`. Internally this is the same
prices endpoint grouped by month.

**`get_nearest_prices`** — prices for a window centred on a date. Required `origin`,
`destination` and `departure_at` (`YYYY-MM-DD`); optional `range_days` (1–7, default 3)
and `currency`.

This tool is different in kind from the others: it issues **one request per day** in the
window — `2 × range_days + 1` requests, so up to 15 — in parallel, and merges them into an
array of `{date, data}`. Days whose request failed come back with `data: null` rather than
failing the whole call. Each day is capped at 3 offers.

### 4.4 Browsing without a fixed route

**`get_special_offers`** — current deals. All parameters optional: `origin` (omit for
offers across all routes), `currency` (default `rub`), `locale` (default `ru`).

**`get_popular_directions`** — popular destinations from a city. Required `origin`;
optional `currency`.

> `get_popular_directions` and `get_special_offers` call **the same upstream endpoint**
> (`/aviasales/v3/get_special_offers`). The difference is that `get_popular_directions`
> requires an origin and does not pass a locale. Do not expect a genuinely different
> ranking from the two.

**`get_airline_directions`** — routes served by one airline. Required `airline_code` (IATA,
e.g. `SU`); optional `limit` (1–100, default 30).

### 4.5 Hotels

Both hotel tools query Hotellook's cache endpoint and always request Russian-language
results (`language=ru` is hard-coded).

**`search_hotels`** — required `location` (a city or resort **name**, not a code),
`check_in` and `check_out` (`YYYY-MM-DD`). Optional: `adults` (1–9, default 2), `children`
(0–4, default 0), `currency` (default `rub`), `limit` (1–50, default 10).

**`get_hotel_prices`** — prices for one hotel. Required `hotel_id` (the numeric Hotellook
ID, obtained from `search_hotels`), `check_in`, `check_out`; optional `adults` (1–9,
default 2) and `currency`. Note that `children` is not available here.

---

## 5. Ready-made scenarios

**1. "How much is Moscow to Sochi on 12 October?"**
`lookup_cities` (`query: "Sochi"` → `AER`) → `search_flights_prices` (`origin: "MOW"`,
`destination: "AER"`, `departure_at: "2026-10-12"`, `limit: 10`).

**2. "Which month is cheapest to fly to Istanbul?"**
`get_cheapest_month` for each candidate month (`month: "2026-06"`, then `"2026-07"`…), or
`get_calendar_prices` for a day-by-day view of whatever window the API returns.

**3. "Around 15 March, ±3 days, whichever is cheaper."**
`get_nearest_prices` (`origin`, `destination`, `departure_at: "2026-03-15"`,
`range_days: 3`). The result is seven dated blocks; compare their minimum prices. Days
returning `data: null` failed and should be re-checked individually.

**4. "Direct flights only, Moscow to Minsk."**
`get_direct_routes` (`origin: "MOW"`, `destination: "MSQ"`, `departure_at`). Using
`search_flights_prices` here would also return one- and two-stop itineraries.

**5. "What is trending out of Saint Petersburg?"**
`get_popular_directions` (`origin: "LED"`). For deals without a fixed origin,
`get_special_offers` with no parameters.

**6. "Hotels in Sochi, 10–17 July, two adults — then flights there."**
`search_hotels` (`location: "Sochi"`, `check_in: "2026-07-10"`, `check_out: "2026-07-17"`,
`adults: 2`) → pick a hotel and take its `hotel_id` → `get_hotel_prices` for the exact
quote → `search_flights_prices` (`MOW` → `AER`, matching dates).

**7. "Where does Aeroflot fly?"**
`get_airline_directions` (`airline_code: "SU"`, `limit: 100`). To find the code first:
`lookup_airlines` (`query: "Aeroflot"`).

**8. "Compare Sheremetyevo and Domodedovo departures."**
`lookup_airports` (`query: "Moscow"`) to get `SVO`, `DME`, `VKO` → run
`search_flights_prices` once per airport code. The city code `MOW` aggregates all of them;
airport codes separate them.

**9. "Prices in euros, results in English."**
Every price tool takes `currency: "eur"`; `get_special_offers` also takes `locale: "en"`,
and the lookup tools take `lang: "en"`. The hotel tools have no language parameter — they
always request Russian.

---

## 6. Limits and pitfalls

### 6.1 These are cached prices, not bookable quotes

The Travelpayouts data API returns fares previously found by other users' searches. A
price can be hours or days old, and it is not a reservation: by the time someone opens the
booking page, the fare may be gone or different.

Practical consequence: treat the output as an indication of price level and a way to
compare dates and routes, not as a quote. Anything the agent presents as "the price"
should carry that qualification.

### 6.2 A wrong code returns nothing, not an error

Every route tool takes IATA codes. `MOSCOW`, `Moskva` or a misspelled code produces an
empty result set with HTTP 200 — no validation error anywhere in the chain. The same
applies to a route the API has no cached data for.

So an empty answer has two indistinguishable causes: bad code, or no data. Resolve codes
with `lookup_cities` / `lookup_airports` first, and when a valid-looking route comes back
empty, widen the date (`YYYY-MM` instead of a single day) before concluding there are no
flights.

Related: city code versus airport code. `MOW` covers every Moscow airport; `SVO` covers
one. Searching the airport code when you meant the city silently narrows the result.

### 6.3 `get_nearest_prices` is many requests in one call

The tool fans out to `2 × range_days + 1` parallel requests — up to 15 at `range_days: 7`.
Three things follow:

- it consumes quota accordingly (section 6.6);
- individual days can fail without the call failing: those come back as `data: null`,
  and a `null` means "the request failed", not "no flights that day";
- each day returns at most 3 offers, regardless of any limit you might expect.

Its `departure_at` must be a full `YYYY-MM-DD` date — a `YYYY-MM` month would produce
nonsensical day arithmetic.

### 6.4 Two tools overlap, and one name is misleading

`get_popular_directions` calls the special-offers endpoint with a required origin. It is
not a separate "popular routes" dataset. If both tools return similar content for the same
city, that is why.

`get_cheapest_month` and `search_flights_prices` also share an endpoint; the difference is
the `group_by=month` grouping and a required `month` parameter.

### 6.5 Hotels answer in Russian and use their own IDs

Both hotel tools hard-code `language=ru` in the upstream request — hotel names and
descriptions come back in Russian regardless of any other setting, and there is no
parameter to change it.

`get_hotel_prices` needs a numeric Hotellook `hotel_id`, which exists only in the
Hotellook catalogue. The only way to obtain one here is `search_hotels`; there is no
lookup by name, and IDs from other booking sites will not work.

`search_hotels` takes a location **name**, not an IATA code — the opposite convention
from every flight tool in the same server.

### 6.6 Retries, timeouts and quota

All 13 tools are read-only GET requests, so retries are safe and enabled: `429` and `5xx`
are retried up to three times with a `1000 × 2^(attempt−1)` ms delay, capped at 8 seconds.
The per-request timeout is 15 seconds and is not configurable.

Travelpayouts applies quotas per affiliate account. When the quota is exhausted, `429`
persists past all three retries and the error reaches the model. Nothing in the server
raises the limit — reduce `limit`, avoid large `range_days`, and do not loop
`get_nearest_prices` across many routes.

### 6.7 Output size and filtering

Responses are returned as the upstream JSON, pretty-printed, with no field trimming.
`lookup_airlines` without a `query` returns the entire airline directory — thousands of
records — and `get_nearest_prices` merges up to fifteen responses into one blob.

Output longer than 50 000 characters is truncated with a note. Always pass a `query` to
`lookup_airlines`, and keep `limit` modest.

Text from responses (city, hotel and airline names) passes through a filter: constructions
such as "ignore previous instructions" and `<system>` tags are replaced with `[filtered]`.
Disable with `MCP_DISABLE_SANITIZE=true`.

### 6.8 What is not here

No booking, no seat selection, no passenger data, no payment — the server is strictly a
price and reference reader. There are no train, bus or car-rental tools, no baggage or
fare-rule details, and no affiliate link generation: the responses carry whatever link
fields Travelpayouts itself includes, and nothing is added.

---

## 7. Common errors

Errors reach the model as a result with `isError: true`, classified by HTTP status.
Authentication failures are rewritten with an explicit hint.

| What you see | What it means | What to do |
|---|---|---|
| `TRAVELPAYOUTS_TOKEN is required. Get it at https://travelpayouts.com/` | The token never reached the process; surfaces on the first tool call, not at startup | Set it in the client's `env` block and restart the client |
| `Travelpayouts authentication error (401): проверьте TRAVELPAYOUTS_TOKEN` | The token was rejected: typo, revoked, or not activated | Copy it again from the partner account at travelpayouts.com/developers/api |
| `Travelpayouts authentication error (403): проверьте TRAVELPAYOUTS_TOKEN` | The token is valid but not allowed for this endpoint or the account is restricted | Check which API products the affiliate account has enabled |
| `Rate limit. Retry in Ns` (HTTP 429) | Account quota hit; three retries have already been spent | Pause; lower `limit` and `range_days`, do not loop `get_nearest_prices` |
| Server error (HTTP 5xx) | Upstream failure; three retries spent | Retry later |
| `Request timeout` | No response within 15 seconds | Retry; for `get_nearest_prices` reduce `range_days` — it issues many parallel requests |
| Validation error naming a parameter | The MCP schema rejected the arguments before any request — e.g. `limit` above 30, `range_days` above 7, a missing `month` | Correct the argument against the ranges in section 4 |
| Empty result, HTTP 200 | Either a wrong IATA code or no cached data for that route and date | Section 6.2: resolve the code with `lookup_cities`, then widen the date to `YYYY-MM` |
| `data: null` for some days in `get_nearest_prices` | Those individual day requests failed; the rest succeeded | Re-query those dates with `search_flights_prices` |
| Empty hotel result | The `location` name did not match Hotellook's catalogue | Try the city's common English or Russian name; hotel search takes a name, never an IATA code |
| Response truncated with a `[Truncated…]` note | Output exceeded 50 000 characters | Pass a `query` to `lookup_airlines`; lower `limit`; reduce `range_days` |
| Prices differ from the booking site | Cached data, by design | Section 6.1 — present these as indicative, not as a quote |

The server log goes to **stderr** — stdout carries the JSON-RPC protocol. Retry warnings
and the startup line with the tool count appear there.

---

MIT licence. Source: `servers/travelpayouts` in the
[WWmcp](https://github.com/theYahia/WWmcp) monorepo.
