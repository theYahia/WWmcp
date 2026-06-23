---
"@theyahia/1c-rest-mcp": patch
---

Fix server-version drift, stale docs, and an incomplete-rebuild bug.

- The version reported on the MCP handshake (`server.ts`) and on the `/health` endpoint (`index.ts`) had drifted apart (`3.1.0` vs a stale `2.0.0`); both now derive from a single `VERSION` constant so they can't desync again.
- Updated the `index.ts` module docstring and the README header to reflect 26 tools across 9 modules (were stale at "9 tools").
- `clean` script now also removes `tsconfig.tsbuildinfo`. With `composite: true`, the incremental build state lives outside `dist/`, so `rm -rf dist` alone left it stale and `tsc` would silently skip re-emitting unchanged tool files — producing a partial `dist/` (the cause of the `2.0.0`/`3.1.0` split in old builds). A clean build now emits all 9 tool modules.
