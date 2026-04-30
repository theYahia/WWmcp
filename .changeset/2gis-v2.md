---
"@theyahia/2gis-mcp": major
---

Production-grade rewrite to v2.0.0. Promoted from `pipeline/data/` to `servers/` workspace. Adopts `@theyahia/mcp-core` for entry/transport layer (`runServer`, `createLogger`).

Breaking changes:
- Server entry refactored: `src/server.ts` (factory) split from `src/index.ts` (bin).
- Adds Streamable HTTP transport (previously stdio-only).
- Early `TWOGIS_API_KEY` validation in entry point.

Native HTTP client preserved (4 base URLs + query-param auth don't fit `BaseHttpClient`/`AuthStrategy` pattern). Tool names, arguments, return formats, and `TWOGIS_API_KEY` env var are unchanged.
