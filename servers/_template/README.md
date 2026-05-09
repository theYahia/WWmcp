# @theyahia/CHANGEME-mcp

MCP server for **CHANGEME API**.

> Replace this README with a description of your server. The placeholders below are filled automatically when you scaffold via `npx @theyahia/create-mcp`.

## Install

```bash
npm install -g @theyahia/CHANGEME-mcp
```

Or use directly via `npx` in your MCP client config (see below).

## Configuration

Set the following environment variables:

| Variable | Required | Description |
|---|---|---|
| `CHANGEME_API_KEY` | yes | API key from https://example.com/settings |

## Usage

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "CHANGEME": {
      "command": "npx",
      "args": ["-y", "@theyahia/CHANGEME-mcp"],
      "env": {
        "CHANGEME_API_KEY": "your_api_key"
      }
    }
  }
}
```

### Cursor / VS Code (Continue, Cline)

Same format — add the entry to your MCP servers config.

### Streamable HTTP

```bash
HTTP_PORT=8080 npx @theyahia/CHANGEME-mcp --http
```

Then point your MCP client at `http://localhost:8080`.

## Tools

<!-- Replace with your actual tools. Add ≥8 for production-grade. -->

| Tool | Description |
|---|---|
| `list_items` | Get a list of items. Supports query filter and pagination. |

## Demo prompts

<!-- Add 2-3 prompts a user would actually send to the LLM. -->

> "List all items matching 'shipping'"

## Development

```bash
# from monorepo root
pnpm install
pnpm dev --filter @theyahia/CHANGEME-mcp
pnpm test --filter @theyahia/CHANGEME-mcp
```

## License

MIT
