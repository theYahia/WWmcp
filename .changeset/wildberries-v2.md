---
"@theyahia/wildberries-mcp": major
---

Production-grade rewrite to v2.0.0. Promoted from `pipeline/ecommerce/` to `servers/` workspace. Adopts `@theyahia/mcp-core` for entry/transport layer (`runServer`, `createLogger`).

Breaking changes:
- HTTP env var renamed: `PORT` → `HTTP_PORT`.
- Hand-rolled HTTP server replaced by `runServer` (multi-session, CORS, `/health`).
- Server entry refactored: `src/server.ts` (factory with WBClient injection) split from `src/index.ts` (bin).

Native `WBClient` + `RateLimiter` (300 req/min + 200ms min interval + 409 penalty handling with `X-Ratelimit-Retry-After`) preserved — Wildberries-specific logic doesn't fit `BaseHttpClient`'s generic retry pattern. `tools.ts` JSON Schema definitions kept (Zod migration deferred). Tool names, arguments, return formats, and `WB_API_TOKEN` env var are unchanged.
