# @theyahia/tochka-bank-mcp

MCP server for the **real** [Tochka Bank](https://tochka.com/) business API
(`https://enter.tochka.com/uapi`). It lets an MCP client (Claude Desktop, Cursor,
etc.) read your business accounts, balances and statements, look up your company
details, and prepare outgoing ruble payments for you to sign.

> ⚠️ **This server can prepare real payments.** `create_payment` builds a payment
> via Tochka's *for-sign* flow: it never sends money on its own — a human signs
> each payment in Tochka internet-bank (SMS). It also requires `confirm: true`
> (otherwise it returns a dry-run preview) and respects an amount limit. Run the
> server **without auto-approve** for tools and keep `TOCHKA_MAX_PAYMENT_RUB` set
> to a sane value.

## Features

- Accounts, balances, and (asynchronous) statements
- Company/customer info
- Outgoing payments via the *for-sign* flow, with dry-run preview, a required
  `confirm` flag, an amount limit, and an optional recipient allowlist
- OAuth 2.0 hybrid auth with a one-time `auth` command and automatic token refresh
- PII/secret redaction, request timeouts, rate-limit handling, structured output

## Install

```bash
npx -y @theyahia/tochka-bank-mcp
```

Requires Node.js ≥ 18.

## Authentication

Tochka's account and payment APIs require the OAuth 2.0 **hybrid flow** — a bare
`client_credentials` token is not enough. Setup is a one-time step:

1. In Tochka internet-bank, open **Интеграции и API**, create an application, and
   copy its **client id** and **client secret**.
2. Register a redirect URI for the app. For local setup use
   `http://localhost:8765/callback` (or set `TOCHKA_REDIRECT_URI` to match what you
   registered — the host must be a loopback address).
3. Run the one-time authorization (opens your browser, you approve the requested
   permissions, tokens are saved locally):

   ```bash
   TOCHKA_CLIENT_ID=... TOCHKA_CLIENT_SECRET=... npx -y @theyahia/tochka-bank-mcp auth
   ```

   Run `npx -y @theyahia/tochka-bank-mcp auth --help` for details.

After that, the server refreshes tokens automatically (access token ~24h, refresh
token ~30d). For headless deployments you can instead provide the refresh token
via `TOCHKA_REFRESH_TOKEN`.

> Single-tenant alternative: Tochka also supports a JWT generated directly in the
> developer cabinet. This server currently implements the OAuth flow; JWT support
> can be added by setting `TOCHKA_REFRESH_TOKEN`-style config in a future release.

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `TOCHKA_CLIENT_ID` | Yes | OAuth client id from the Tochka developer cabinet |
| `TOCHKA_CLIENT_SECRET` | Yes | OAuth client secret |
| `TOCHKA_REDIRECT_URI` | No | OAuth redirect URI (default `http://localhost:8765/callback`); must match the one registered for your app |
| `TOCHKA_BASE_URL` | No | API base (default `https://enter.tochka.com/uapi`; sandbox `https://enter.tochka.com/sandbox/v2`) |
| `TOCHKA_TOKEN_STORE` | No | Token file path (default `~/.config/tochka-bank-mcp/tokens.json`, mode 0600) |
| `TOCHKA_REFRESH_TOKEN` | No | Pre-issued refresh token (headless; skips the `auth` step) |
| `TOCHKA_MAX_PAYMENT_RUB` | No | Max payment amount allowed by `create_payment` (default `100000`) |
| `TOCHKA_ALLOWED_RECIPIENTS` | No | Comma-separated recipient account allowlist for `create_payment` |
| `TOCHKA_STATEMENT_TIMEOUT_MS` | No | Max wait for an async statement to become Ready (default `25000`) |

## Claude Desktop setup

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tochka-bank": {
      "command": "npx",
      "args": ["-y", "@theyahia/tochka-bank-mcp"],
      "env": {
        "TOCHKA_CLIENT_ID": "your-client-id",
        "TOCHKA_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

Run the `auth` step (above) once before starting the client so the tokens exist.

## Tools

| Tool | Kind | Description |
|------|------|-------------|
| `list_accounts` | read | List business accounts (accountId, currency, type, status) |
| `get_account_balance` | read | Balances for an account (one row per balance type) |
| `get_statement` | read | Transactions for a date range (async: init + poll) |
| `list_customers` | read | Your Tochka customer codes (legal entities) |
| `get_company_info` | read | Company details for a customer code (auto-selected if only one) |
| `create_payment` | **write / destructive** | Prepare an outgoing RUB payment for signing (rubles, dry-run unless `confirm:true`) |
| `get_payment_status` | read | Payment status by `request_id` |

External counterparties are not a Tochka resource; derive them from
`get_statement` transactions.

## Demo prompts

1. "Show me all my Tochka Bank accounts and their balances."
2. "Prepare a payment of 75000.50 RUB to OOO Romashka, account 40702810000000005678,
   BIK 044525225, for web development services — show me a preview first."
3. "Get my company registration info from Tochka Bank."

## Security

- `create_payment` is annotated `destructiveHint`, requires `confirm: true`,
  supports `dry_run`, enforces `TOCHKA_MAX_PAYMENT_RUB`, and an optional recipient
  allowlist. Funds never move without a human signing in internet-bank.
- API error bodies can contain INNs, account numbers, and balances; all error
  messages and logs are redacted (identifiers keep only the last 4 characters).
- Tokens are stored locally (mode 0600). Do not commit the token store.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

## License

MIT
