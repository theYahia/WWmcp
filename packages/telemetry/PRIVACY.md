# wwmcp-telemetry — Privacy

## Default = OFF

Telemetry is **disabled by default**. To opt in:
```bash
export WWMCP_TELEMETRY=on
```

## What we collect (only when opted in)

- Package name (e.g. `@theyahia/voximplant-mcp`)
- Package version
- Country (2-letter ISO, derived from system timezone — no IP)
- Use case category (`ci` / `dev` / `production` / `unknown`)
- Timestamp (rounded to the hour server-side)

## What we DO NOT collect

- IP address (never sent; stripped server-side even if leaked)
- User ID, hostname, project path, working directory
- Environment variables (except CI / NODE_ENV for use-case detection)
- npm tokens, git config, file contents

## Data retention

Aggregated counters, 90-day rolling window. No per-user records.

## Source code

Open source: https://github.com/theYahia/WWmcp/tree/main/packages/telemetry
