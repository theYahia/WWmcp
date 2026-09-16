# @metarebalance/dadata-mcp

Full-featured MCP server for [DaData.ru](https://dadata.ru) — **31 tools** covering the entire DaData API: addresses, companies, banks, phones, emails, passports, vehicles, geocoding, and 12 reference directories.

[![npm](https://img.shields.io/npm/v/@metarebalance/dadata-mcp)](https://www.npmjs.com/package/@metarebalance/dadata-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **[Русская версия (README.md)](./README.md)**

## Why this instead of official DaData MCP?

DaData offers an [official remote MCP server](https://mcp.dadata.ru/mcp) with 4 tools. This package provides **complete local coverage**:

| Feature | Official MCP | @metarebalance/dadata-mcp |
|---------|:-----------:|:---------------------:|
| Tools | 4 | **31** |
| Resources | 0 | **2** |
| Prompts | 0 | **2** |
| Transport | Remote | **Local stdio** |
| Free tools | 1 | **23** |
| npm install | No | **Yes** |
| Offline-capable | No | **Yes** (local process) |

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dadata": {
      "command": "npx",
      "args": ["-y", "@metarebalance/dadata-mcp"],
      "env": {
        "DADATA_API_KEY": "your-api-key",
        "DADATA_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add dadata -- npx -y @metarebalance/dadata-mcp
```

### VS Code / Cursor

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "dadata": {
      "command": "npx",
      "args": ["-y", "@metarebalance/dadata-mcp"],
      "env": {
        "DADATA_API_KEY": "your-api-key",
        "DADATA_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

## Tools (31)

### Addresses (3 tools)

| Tool | Cost | Description |
|------|:----:|-------------|
| `suggest_address` | Free | Autocomplete Russian addresses with postal code, FIAS ID, coordinates, timezone |
| `clean_address` | 0.20 ₽ | Standardize address into 80+ structured fields with quality codes |
| `find_by_id_address` | Free | Get full address info by FIAS ID, KLADR ID, or cadastral number |

### Companies (8 tools)

| Tool | Cost | Description |
|------|:----:|-------------|
| `suggest_company` | Free | Search companies by name, INN, or OGRN |
| `find_company_by_id` | Free | Get detailed company info: CEO, founders, financials, OKVED |
| `find_affiliated` | Free* | Find affiliated companies by INN (founders/managers). *Requires Maximum plan |
| `find_company_by_email` | 7 ₽ | Find company by corporate email or domain |
| `find_brand` | 7 ₽ | Get brand name, website, and logo by INN |
| `find_self_employed` | Free | Check if INN belongs to a self-employed person (via FNS) |
| `suggest_company_by` | Free | Search Belarusian companies by name or UNP |
| `suggest_company_kz` | Free | Search Kazakh companies by name or BIN |

### Banks (1 tool)

| Tool | Cost | Description |
|------|:----:|-------------|
| `find_bank` | Free | Find bank by BIC, SWIFT, INN, reg. number, or name |

### Names / FIO (2 tools)

| Tool | Cost | Description |
|------|:----:|-------------|
| `suggest_fio` | Free | Autocomplete Russian full names with gender detection |
| `clean_name` | 0.20 ₽ | Parse FIO into parts, detect gender, decline by grammatical case |

### Contacts (3 tools)

| Tool | Cost | Description |
|------|:----:|-------------|
| `clean_phone` | 0.20 ₽ | Validate phone: carrier, region, timezone, mobile/landline type |
| `clean_email` | 0.20 ₽ | Validate email: fix typos, detect disposable/corporate/personal |
| `suggest_email` | Free | Autocomplete email addresses with domain suggestions |

### Passports (3 tools)

| Tool | Cost | Description |
|------|:----:|-------------|
| `clean_passport` | 0.20 ₽ | Validate passport against MVD invalid passports registry |
| `find_fms_unit` | Free | Find passport issuing authority by subdivision code |
| `find_inn_by_passport` | Free | Find person's INN by passport data and birthday (via FNS) |

### Vehicles (2 tools)

| Tool | Cost | Description |
|------|:----:|-------------|
| `clean_vehicle` | 0.20 ₽ | Recognize car brand and model from string |
| `suggest_car_brand` | Free | Autocomplete car brand names (Russian and English) |

### Geolocation (2 tools)

| Tool | Cost | Description |
|------|:----:|-------------|
| `geolocate_address` | Free | Reverse geocoding: coordinates to nearest addresses |
| `ip_locate` | Free | Detect Russian city by IPv4 address |

### Postal & Countries (2 tools)

| Tool | Cost | Description |
|------|:----:|-------------|
| `find_postal_unit` | Free | Find post office by index or nearest by coordinates |
| `suggest_country` | Free | Search countries by name or ISO code (ISO 3166) |

### Logistics (1 tool)

| Tool | Cost | Description |
|------|:----:|-------------|
| `find_delivery_city` | Free | Get CDEK, Boxberry, DPD city IDs by KLADR code |

### Composite Validation (1 tool)

| Tool | Cost | Description |
|------|:----:|-------------|
| `clean_person` | 0.20 ₽ | Validate full person record in one request: FIO + address + phone + email + passport. 5-8x cheaper than separate calls |

### Reference Directories (1 tool, 12 directories)

| Tool | Cost | Description |
|------|:----:|-------------|
| `lookup_reference` | Free | Search across 12 directories: OKVED2, OKPD2, OKTMO, metro stations, tax offices (FNS), customs (FTS), courts, currencies (ISO 4217), MKTU (trademarks), professions, positions, medical positions |

### Account Info (2 tools)

| Tool | Cost | Description |
|------|:----:|-------------|
| `get_balance` | Free | Check account balance and daily usage statistics |
| `get_versions` | Free | Check when reference databases were last updated |

## Resources

- **`dadata://reference/quality-codes`** — Reference for DaData quality codes (qc, qc_geo) and confidence levels
- **`dadata://reference/capabilities`** — API capabilities summary: free vs paid, rate limits, data types

## Prompts

- **`check_counterparty`** — Due diligence workflow: check Russian company by INN (status, CEO, registration, financials, risk level)
- **`validate_address`** — Multi-step address validation with quality assessment and confidence scoring

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DADATA_API_KEY` | Yes | API key from [dadata.ru/profile](https://dadata.ru/profile/#info) |
| `DADATA_SECRET_KEY` | No | Secret key for paid tools (`clean_*`). Without it, 23 free tools still work |

## Example Prompts

```
Find company by INN 7707083893
```

```
Standardize address: мск сухонская 11 кв 89
```

```
Check counterparty with INN 7736207543 — is the company active?
```

```
What city is IP 46.226.227.20 from?
```

```
Find Sberbank's BIC and correspondent account
```

```
Validate passport 4510 235857 — is it in the MVD invalid list?
```

```
Look up OKVED code for "разработка программного обеспечения"
```

## Security

- API keys are never logged or included in error responses
- All inputs validated with Zod schemas (length limits, type checks, regex)
- Path traversal protection on all API endpoint construction
- 10-second hard timeout on all HTTP requests
- Retry with exponential backoff on transient errors only (429, 5xx)
- `stdout` reserved for JSON-RPC — all logs go to `stderr`

## Development

```bash
git clone https://github.com/theYahia/WWmcp.git
cd WWmcp
pnpm install
pnpm --filter @metarebalance/dadata-mcp build
pnpm --filter @metarebalance/dadata-mcp test
```

### Test with MCP Inspector

```bash
DADATA_API_KEY=your-key npx @modelcontextprotocol/inspector node dist/index.js
```

Opens an interactive UI at `http://localhost:6274` where you can call each tool and see JSON-RPC messages.

## License

MIT
