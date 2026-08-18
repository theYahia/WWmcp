# Security Policy

`yookassa-mcp` drives **real money operations** (payments, refunds, payouts) against a
YooKassa shop using its credentials. Treat the server as a privileged component.

## Credentials

- `YOOKASSA_SECRET_KEY` is **full-privilege**: anything that can reach the running server
  can move money. Store it in a secret manager / env, never in source control, never in logs.
- Prefer **test-shop credentials** during development. Verify you are in test mode via the
  `get_shop_info` tool (`test: true`) before pointing the server at a live shop.
- The server never logs the secret key or the Basic-auth header.

## stdio transport (default)

The default transport is stdio — the server only talks to the local MCP client that spawned
it. This is the recommended mode for desktop clients (Claude Desktop, Cursor, VS Code).

## HTTP transport (`--http`)

The Streamable HTTP transport (`--http` / `HTTP_PORT`) exposes the money-moving tools over
the network. It is hardened as follows, but still must be deployed carefully:

- **Authentication is mandatory.** The server refuses to start in HTTP mode unless
  `MCP_AUTH_TOKEN` is set. Every `/mcp` request must send `Authorization: Bearer <token>`;
  the token is compared in constant time. Use a long random secret (e.g. `openssl rand -hex 32`).
- **Binds to `127.0.0.1` by default.** Set `HTTP_HOST=0.0.0.0` only when the server sits
  behind an authenticating reverse proxy / mTLS / network ACL — never expose it directly.
- **DNS-rebinding protection** is enabled: the `Host` header is validated against
  `MCP_ALLOWED_HOSTS` (default localhost) and browser `Origin`s are rejected unless listed in
  `MCP_ALLOWED_ORIGINS`. CORS never uses a `*` wildcard.
- **Stateless**: a fresh server/transport is created per request and closed when the response
  ends; `/mcp` accepts `POST` only (`GET`/`DELETE` return `405`).
- `/health` is unauthenticated (for liveness probes) and returns only `{ status, server, tools }`.

For maximum safety in HTTP mode, also restrict the high-risk tools (`create_payout`,
`create_refund`) at the proxy layer and set conservative amount limits.

## Reporting a vulnerability

Please report security issues privately to the maintainer
([@theYahia](https://github.com/theYahia)) rather than opening a public issue.
