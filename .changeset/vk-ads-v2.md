---
"@theyahia/vk-ads-mcp": major
---

Production-grade rewrite to v2.0.0. Promoted from `pipeline/marketing/` to `servers/` workspace. Now built on `@theyahia/mcp-core` (`BaseHttpClient` + `ApiKeyStrategy` + `runServer` dual transport).

Breaking changes:
- Internal client now extends `BaseHttpClient`. Functional API (`apiGet`, `apiPost`) unchanged.
- Tool errors return MCP-spec `CallToolResult` with `isError: true`.
- Adds Streamable HTTP transport (previously stdio-only).

Tool names, arguments, return formats, and `VK_ADS_TOKEN` env var are unchanged.
