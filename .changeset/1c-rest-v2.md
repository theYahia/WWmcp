---
"@theyahia/1c-rest-mcp": major
---

Production-grade rewrite to v2.0.0. Promoted from `pipeline/finance/` to `servers/` workspace. Now built on `@theyahia/mcp-core` (`BaseHttpClient` + `BasicAuthStrategy` + `runServer` dual transport).

Breaking changes:
- HTTP env var renamed: `PORT` → `HTTP_PORT`
- Removed separate HTTP binary `1c-rest-mcp-http`; use `1c-rest-mcp --http` or `HTTP_PORT=…`
- Single `bin` entrypoint (`dist/index.js`); `dist/http.js` removed
- Tool errors now return MCP-spec `CallToolResult` with `isError: true`

Tool names, arguments, return formats, and `ONEC_*` env vars are unchanged. Backward-compat aliases `1C_*` still accepted.
