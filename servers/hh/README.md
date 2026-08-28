# @theyahia/hh-mcp

MCP server for the [hh.ru](https://hh.ru) API — Russia and CIS job market. **19 tools** covering vacancies, resumes, employers, salary statistics, dictionaries, autocomplete, and token diagnostics.

Responses are returned as compact, LLM-friendly summaries by default — pass `raw: true` to any search/detail tool to get the full hh.ru JSON.

[![npm](https://img.shields.io/npm/v/@theyahia/hh-mcp)](https://www.npmjs.com/package/@theyahia/hh-mcp)
[![CI](https://github.com/theYahia/hh-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/hh-mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of the [Russian API MCP](https://github.com/theYahia/russian-mcp) series by [@theYahia](https://github.com/theYahia).

## Two Modes

| Mode | What's available | Token needed? |
|------|-----------------|:-------------:|
| **No token** | Vacancy search, vacancy by ID, similar vacancies, employers, salary stats, areas, roles, industries, metro, dictionaries, suggests, token check | No |
| **With token** | Everything above + resume search, resume by ID | Yes (`HH_ACCESS_TOKEN`) |

Get a token at [dev.hh.ru/admin](https://dev.hh.ru/admin). Note: resume search additionally requires an **employer** account with a **paid resume-database subscription** — applicant/anonymous tokens get a 403. Use `validate_token` to check what your token can do.

## Installation

### Claude Desktop

```json
{
  "mcpServers": {
    "hh": {
      "command": "npx",
      "args": ["-y", "@theyahia/hh-mcp"],
      "env": {
        "HH_ACCESS_TOKEN": "optional-oauth-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add hh -- npx -y @theyahia/hh-mcp
# With token:
claude mcp add hh -e HH_ACCESS_TOKEN=your-token -- npx -y @theyahia/hh-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "hh": {
      "command": "npx",
      "args": ["-y", "@theyahia/hh-mcp"]
    }
  }
}
```

### Windsurf

```json
{
  "mcpServers": {
    "hh": {
      "command": "npx",
      "args": ["-y", "@theyahia/hh-mcp"]
    }
  }
}
```

### HTTP Mode (Streamable HTTP)

```bash
npx @theyahia/hh-mcp --http
# or
HTTP_PORT=8080 npx @theyahia/hh-mcp --http
```

Endpoint: `http://localhost:3000/mcp` (POST) · Health check: `http://localhost:3000/health` (GET)

HTTP mode is stateless and binds to `127.0.0.1` by default with DNS-rebinding protection on. To expose it, set `HOST=0.0.0.0` and add your host/origin to `HH_ALLOWED_HOSTS` / `HH_ALLOWED_ORIGINS`, and put it behind your own auth.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HH_ACCESS_TOKEN` | No | OAuth 2.0 Bearer token. Required for resume endpoints (employer + paid resume DB). |
| `HH_USER_AGENT` | No | Custom `HH-User-Agent` (hh.ru requires it). Recommend `your-app/1.0 (you@example.com)`. |
| `HTTP_PORT` / `PORT` | No | Port for HTTP mode (default: 3000). |
| `HOST` | No | Interface to bind in HTTP mode (default: `127.0.0.1`). |
| `HH_ALLOWED_HOSTS` | No | Comma-separated Host allow-list for HTTP mode (default: loopback). |
| `HH_ALLOWED_ORIGINS` | No | Comma-separated Origin allow-list for HTTP mode. |

See [`.env.example`](.env.example).

## Tools (19)

Every search/detail tool accepts `raw: true` to return the full hh.ru JSON instead of the compact summary.

### Vacancies

| Tool | Description | Token? |
|------|-------------|:------:|
| `search_vacancies` | Search by keywords, region, professional role, industry, metro, employer, salary, experience, work format / employment form, date range (`period` or `date_from`/`date_to`), labels, search field, with sorting and pagination | No |
| `get_vacancy` | Full vacancy details: description, requirements, key skills, contacts | No |
| `get_similar_vacancies` | Find vacancies similar to a given one | No |

### Resumes (employer token + paid resume DB)

| Tool | Description | Token? |
|------|-------------|:------:|
| `search_resumes` | Search candidate resumes by keywords, region, role, salary, experience | **Yes** |
| `get_resume` | Full resume: experience, education, skills, contacts | **Yes** |

### Employers

| Tool | Description | Token? |
|------|-------------|:------:|
| `search_employers` | Search companies by name and region | No |
| `get_employer` | Employer profile: description, industries, website, vacancy count | No |
| `get_employer_vacancies` | List active vacancies for a specific employer | No |

### Dictionaries & Suggests

| Tool | Description | Token? |
|------|-------------|:------:|
| `get_areas` | Tree of regions and cities (`id — name`) | No |
| `get_areas_subtree` | Regions/cities under one area id — lighter than the full tree | No |
| `get_professional_roles` | Tree of professional roles with IDs | No |
| `get_industries` | Tree of company industries with IDs | No |
| `get_metro` | Metro stations/lines with IDs for a city | No |
| `get_dictionaries` | All reference data: currencies, employment types, schedules, experience, labels | No |
| `suggest_positions` | Autocomplete job titles | No |
| `suggest_companies` | Autocomplete company names | No |
| `suggest_areas` | Autocomplete region/city names | No |

### Salary & Account

| Tool | Description | Token? |
|------|-------------|:------:|
| `get_salary_statistics` | **Estimated** salary distribution (median, P25/P75, min/max) for a role in a region, computed from posted vacancy salaries. Biased sample, not official market data. | No |
| `validate_token` | Check whether `HH_ACCESS_TOKEN` is valid (via `/me`) and report the account role | No |

## Rate Limiting

Built-in rate limiter respects the hh.ru API limit of 5 requests per second. Automatic retry with exponential backoff on 429 and 5xx errors (up to 3 attempts). Note: the limiter is process-global, so in shared HTTP mode all clients share one 5 req/s budget.

## Demo Prompts

```
Find remote Python developer jobs in Moscow paying over 300,000 RUB
```

```
Show me all open vacancies at Yandex and give me salary statistics for their top roles
```

```
Compare Senior Backend salaries in Moscow vs Saint Petersburg, and suggest similar vacancies to the best-paying one
```

## Development

```bash
git clone https://github.com/theYahia/hh-mcp.git
cd hh-mcp
npm install
npm run build
npm test
```

## API Reference

- [hh.ru API docs](https://api.hh.ru/)
- [hh.ru API GitHub](https://github.com/hhru/api)

## License

MIT
