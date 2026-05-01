# @theyahia/wwmcp-telemetry

Privacy-first opt-in telemetry SDK for `@theyahia` MCP servers.

## Usage (in your MCP server)

```typescript
import { ping } from '@theyahia/wwmcp-telemetry';

// Call once at server startup
ping({ pkg: '@theyahia/your-package', version: '1.0.0' });
```

## Opt-in (user side)

```bash
export WWMCP_TELEMETRY=on   # enable
export WWMCP_TELEMETRY=off  # disable (default)
```

No collection without explicit opt-in. See [PRIVACY.md](./PRIVACY.md).

## What it collects

Only when `WWMCP_TELEMETRY=on`: package name, version, country (from timezone), use-case (ci/dev/prod). No IP, no path, no user ID. Fire-and-forget HTTP POST, 1s timeout, never throws.
