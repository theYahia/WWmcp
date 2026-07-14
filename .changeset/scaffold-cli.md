---
"@theyahia/create-mcp": minor
---

Initial release of `@theyahia/create-mcp` — zero-deps CLI for scaffolding new MCP servers in the WWmcp monorepo.

```bash
npx @theyahia/create-mcp <name> --region=<...> --category=<...> --base-url=<...>
```

Copies `servers/_template/` (excluding `HOW_TO_TEMPLATE.md`), replaces `CHANGEME` placeholders, derives env-var prefix from name, sets `mcpName`, `repository.directory`, and keywords. Supports `--dry-run` for preview, `--help` for usage. Built on pure Node stdlib (`node:fs`, `node:path`) — works on Node ≥18.
