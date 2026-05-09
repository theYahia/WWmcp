# @theyahia/create-mcp

Scaffold a new MCP server for the [WWmcp](https://github.com/theYahia/WWmcp) monorepo (or anywhere) in 30 seconds.

## Usage

From inside the WWmcp monorepo (recommended):

```bash
npx @theyahia/create-mcp <name> \
  --region=<region> \
  --category=<category> \
  --base-url=<api-url> \
  [--description="..."]
```

This:
1. Detects the monorepo root (looks for `pnpm-workspace.yaml`).
2. Copies `servers/_template/` to `servers/<name>/`.
3. Replaces placeholders (`CHANGEME` → `<name>`, env-var prefixes, base URL, package metadata).
4. Prints next steps.

## Examples

```bash
# Russian payment gateway
npx @theyahia/create-mcp tinkoff \
  --region=russia --category=payments \
  --base-url=https://securepay.tinkoff.ru/v2 \
  --description="Tinkoff Acquiring API — payments, refunds, recurring"

# African mobile money
npx @theyahia/create-mcp m-pesa \
  --region=africa --category=payments \
  --base-url=https://sandbox.safaricom.co.ke
```

## Flags

| Flag | Values |
|---|---|
| `--region` | `russia`, `cis`, `turkey`, `mena`, `gulf`, `africa`, `latam`, `sea`, `south-asia`, `global` |
| `--category` | `payments`, `crm`, `logistics`, `comms`, `ai`, `data`, `hr`, `marketing`, `finance`, `ecommerce`, `other` |
| `--base-url` | API base URL (string) |
| `--auth` | `api-key` (default), `bearer`, `oauth2`, `hmac`, `none` |
| `--description` | Short description for `package.json` and README |
| `--target-dir` | Override target directory (advanced) |
| `--dry-run` | Print actions without writing files |
| `--help` | Show help |

## Naming rules

- Lowercase, ASCII only
- Hyphenated (no underscores, no camelCase)
- Don't include the `-mcp` suffix — it's added automatically
- Examples: `tinkoff`, `m-pesa`, `pochta-russia`

## After scaffolding

```bash
cd servers/<name>
pnpm install                              # from monorepo root
pnpm test --filter @theyahia/<name>-mcp   # ensure template tests still pass
# implement your tools, add tests, update README
pnpm changeset                            # describe your change for the release
```

See the [WWmcp Contributing Guide](https://github.com/theYahia/WWmcp/blob/main/CONTRIBUTING.md) for the full production-grade checklist (8+ tools, mcp-core, dual transport, vitest, etc.).

## License

MIT
