---
"@theyahia/megaplan-mcp": major
---

Production-grade rewrite to v2.0.0. Promoted from `pipeline/crm/` to `servers/` workspace. Now built on `@theyahia/mcp-core` with a custom `MegaplanAuthStrategy` supporting BOTH direct token (`MEGAPLAN_TOKEN`) and Password grant (`MEGAPLAN_LOGIN` + `MEGAPLAN_PASSWORD`) with automatic 401 re-auth.

Breaking changes:
- HTTP env var renamed: `PORT` → `HTTP_PORT`.
- Hand-rolled `http.ts` removed; `--http` flag still works via `runServer` (now with session management, `/health` endpoint, CORS).
- Internal client now extends `BaseHttpClient`. Functional API (`megaplanGet`, `megaplanPost`) unchanged.
- Tool errors return MCP-spec `CallToolResult` with `isError: true`.

Tool names, arguments, return formats, 2 MCP prompts, and `MEGAPLAN_*` env vars are unchanged.
