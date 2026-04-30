---
"@theyahia/salla-mcp": major
---

Production-grade rewrite to v2.0.0. Promoted from `pipeline/cis/` to `servers/` workspace. Now built on `@theyahia/mcp-core` (`BaseHttpClient` + `ApiKeyStrategy` + `runServer` dual transport).

Breaking changes:
- `SallaClient` now wraps `BaseHttpClient`. Public `request(method, path, body?)` shape unchanged.
- Tool errors return MCP-spec `CallToolResult` with `isError: true`.
- Adds Streamable HTTP transport (previously stdio-only).
- Lazy client init: `new SallaClient()` no longer throws at construction without env var.

Tool names, arguments, return formats, and `SALLA_ACCESS_TOKEN` env var are unchanged.
