---
"@theyahia/1c-rest-mcp": minor
---

Add three MCP prompts — guided multi-tool workflows that ship with the package (no separate skill install), so any MCP client can invoke them:

- `inventory-database` — map an unfamiliar 1C base (entities → counts → key fields).
- `find-and-post-document` — find a document, show its fields and tabular lines, then post it **only after explicit human confirmation**.
- `reconcile-balances` — reconcile accumulation-register остатки against the underlying movements and report discrepancies.
