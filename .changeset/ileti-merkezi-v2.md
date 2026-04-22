---
"@theyahia/ileti-merkezi-mcp": major
---

Production-grade rewrite to v2.0.0. Promoted from `pipeline/cis/` to `servers/` workspace. Now built on `@theyahia/mcp-core` with a custom `IletiHmacStrategy` (SHA256(apiKey + secret + ISO_timestamp), sent as `X-API-Key` + `X-API-Hash` headers).

Breaking changes:
- `IletiMerkeziClient` now wraps `BaseHttpClient`. Public `request(method, path, body?)` shape unchanged.
- Tool errors return MCP-spec `CallToolResult` with `isError: true`.
- Adds Streamable HTTP transport (previously stdio-only).
- Lazy client init: `new IletiMerkeziClient()` no longer throws at construction without env vars.

Tool names, arguments, return formats, and `ILETI_API_KEY`/`ILETI_SECRET` env vars are unchanged.
