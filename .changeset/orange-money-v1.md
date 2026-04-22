---
"@theyahia/orange-money-mcp": minor
---

Initial release v1.0.0. MCP server for Orange Money WebPay covering ~12 Francophone African countries from a single package via `ORANGE_MONEY_COUNTRY` env switching. 8 tools spanning hosted WebPay, B2B cashin/cashout/transfer, balance, and webhook validation. Custom `OrangeMoneyAuthStrategy` implements Orange Developer's quirky OAuth2 (Basic Authorization header, no body credentials, mandatory Accept: application/json) — Brave-verified against developer.orange.com docs. Built on `@theyahia/mcp-core`.
