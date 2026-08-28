# @theyahia/kontur-focus-mcp

MCP server for **Kontur.Focus API** -- company search, EGRUL extracts, financial statements, arbitration cases, bankruptcy, licenses, and affiliate networks for Russian legal entities.

Part of the **Russian API MCP series** alongside [`@theyahia/dadata-mcp`](https://www.npmjs.com/package/@theyahia/dadata-mcp), [`@theyahia/spark-interfax-mcp`](https://www.npmjs.com/package/@theyahia/spark-interfax-mcp), and [`@theyahia/casebook-mcp`](https://www.npmjs.com/package/@theyahia/casebook-mcp).

## Tools

| Tool | Description |
|------|-------------|
| `search_company` | Search company by INN, OGRN, or name |
| `get_company_brief` | Brief company report with risk summary |
| `get_company_details` | Full EGRUL extract |
| `get_financial_statements` | Balance sheet, P&L, financial analytics |
| `get_arbitration_cases` | Arbitration court cases |
| `get_bankruptcy_info` | Bankruptcy proceedings |
| `get_licenses` | Company licenses |
| `get_related_companies` | Affiliated/related companies |

## Install

### Claude Desktop / Cline / Cursor

Add to your MCP config:

```json
{
  "mcpServers": {
    "kontur-focus": {
      "command": "npx",
      "args": ["-y", "@theyahia/kontur-focus-mcp"],
      "env": { "KONTUR_FOCUS_API_KEY": "<YOUR_API_KEY>" }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KONTUR_FOCUS_API_KEY` | Yes | API key from [Kontur.Focus](https://focus.kontur.ru/) |

## Demo Prompts

- "Find company info for INN 7707083893"
- "Show me the EGRUL extract for Sberbank"
- "Get financial statements for INN 7736050003"
- "Are there any arbitration cases for INN 7710140679?"
- "Check bankruptcy status for INN 5024164553"
- "What licenses does company INN 7802849731 have?"
- "Show affiliated companies for INN 7707083893"
- "Search for companies named 'Yandex'"

## API Reference

Base URL: `https://focus-api.kontur.ru/api3/`

Docs: [https://focus-api.kontur.ru/](https://focus-api.kontur.ru/)

## License

MIT
