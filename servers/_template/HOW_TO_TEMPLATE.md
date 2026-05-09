# `_template/` — How to Add a New MCP Server

This directory is the canonical scaffold for new MCP servers in the WWmcp monorepo. **Do not edit it directly.** Instead, copy it to `servers/<your-name>/` and modify the copy.

## Three ways to scaffold

### 1. CLI (recommended)

```bash
npx @theyahia/create-mcp <name> \
  --region=<region> \
  --category=<category> \
  --base-url=<api-url>
```

Replaces all `CHANGEME` placeholders, sets the env var prefix, wires the package metadata. See [`packages/create-mcp/README.md`](../../packages/create-mcp/README.md) for full flag reference.

### 2. Manual copy

```bash
cp -r servers/_template servers/<your-name>
cd servers/<your-name>
```

Then find-and-replace every occurrence of `CHANGEME`:
- `package.json` → `name`, `bin`, `mcpName`, `description`, `keywords`, `repository.directory`
- `src/index.ts` → server `name`, logger label, JSDoc header
- `src/client.ts` → logger label, env var name (`CHANGEME_API_KEY`), `baseUrl`
- `src/tools/example.ts` → endpoint paths

### 3. Fork an existing server

For complex APIs, copy a similar working server instead of `_template`:

| You're building... | Copy from |
|---|---|
| REST + simple API key | [`../cbr/`](../cbr/) |
| REST + OAuth 2.0 + token refresh | [`../moysklad/`](../moysklad/) |
| E-commerce / multi-resource (orders, products, customers) | [`../salla/`](../salla/) |
| Payment gateway with webhooks | [`../cloudpayments/`](../cloudpayments/) |
| Logistics + address validation | [`../cdek/`](../cdek/) |

Then adapt the auth strategy, endpoints, and tool names for your API.

## Production-grade checklist

A server in `servers/` (as opposed to `pipeline/`) must meet these criteria before merging:

- [ ] **8+ tools** covering the most useful operations the API exposes
- [ ] Uses [`@theyahia/mcp-core`](../../packages/core) (`BaseHttpClient`, auth strategies, `withErrorHandling`, `formatResponse`, `runServer`, `createLogger`)
- [ ] **Dual transport** (stdio + Streamable HTTP) — inherited automatically from `runServer`
- [ ] **Error handling** via `withErrorHandling` wrapper — never raw exceptions
- [ ] **Tests** with `vitest`, mocking HTTP via undici/`MockAgent` or msw — no live API calls in CI
- [ ] **README** with: install command, env vars, tool list (name + 1-line description), 2-3 demo prompts an LLM would actually send
- [ ] **`mcpName`** in `package.json` set to `io.github.theYahia/<name>-mcp` (used by mcp.so / glama.ai listing)
- [ ] **Changeset** added (`pnpm changeset`) — required for the release pipeline to publish to npm

## What's in `_template/`

```
_template/
├── package.json     — placeholders: @theyahia/CHANGEME-mcp, CHANGEME_API_KEY, etc.
├── tsconfig.json    — extends ../../tsconfig.base.json, references packages/core
└── src/
    ├── index.ts     — server setup, tool registration via runServer()
    ├── client.ts    — BaseHttpClient + ApiKeyStrategy (swap for OAuth2/HMAC if needed)
    └── tools/
        └── example.ts  — first tool with zod schema, formatResponse, getClient
```

The template ships with **one** example tool (`list_items`). Add 7+ more before the server is production-grade.

## Auth strategies

Pick the right strategy from `@theyahia/mcp-core`:

| Strategy | Use when |
|---|---|
| `ApiKeyStrategy(key)` | API key in `Authorization: Bearer` header (default in template) |
| `BearerTokenStrategy(token)` | Static bearer token (no key/secret split) |
| `OAuth2Strategy({ clientId, clientSecret, ... })` | OAuth 2.0 client credentials with auto-refresh |
| `HmacSignedStrategy({ ... })` | Requests signed with HMAC (e.g., AWS-style, some Russian banks) |
| `BasicAuthStrategy(user, pass)` | HTTP Basic |

Examples are in [`packages/core/src/auth/`](../../packages/core/src/auth).

## Common pitfalls

- **Don't** hard-code secrets. Always read from `process.env.<NAME>_API_KEY` and throw a helpful error if missing.
- **Don't** call the live API in unit tests. Mock `BaseHttpClient.get/post` or use undici's `MockAgent`.
- **Do** use `formatResponse` for all list-type outputs — it handles both `concise` (CSV) and `detailed` (JSON) formats consistently across the monorepo.
- **Do** put translatable text (tool descriptions, error messages) in the same language as the upstream API docs — Russian for Russian APIs, Turkish for Turkish, etc. The MCP client will pass them through to the LLM.
- **Do** add a changeset before opening a PR. The release workflow won't publish without one.

## After scaffolding

```bash
# from monorepo root
pnpm install
pnpm dev --filter @theyahia/<your-name>-mcp     # watch mode
pnpm test --filter @theyahia/<your-name>-mcp    # run tests
pnpm typecheck                                   # full monorepo typecheck
pnpm changeset                                   # describe your change
```

Then open a PR. CI will run build, typecheck, tests, and security audit.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the full PR checklist.
