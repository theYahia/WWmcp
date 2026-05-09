# Contributing to WWmcp

Thanks for your interest in WWmcp — MCP servers for non-Western APIs. This monorepo aims to be the fastest way to get LLMs talking to **any** regional API: Russian payment gateways, Turkish SMS providers, MENA e-commerce, Latin American fintech, African mobile money, Southeast Asian logistics.

We welcome contributions of all sizes — from fixing a typo to shipping a brand-new MCP server for your country's tax authority.

---

## Quick Start

```bash
git clone https://github.com/theYahia/WWmcp.git
cd WWmcp
pnpm install        # uses pnpm@9.15.4 (see package.json#packageManager)
pnpm build          # builds @theyahia/mcp-core first, then all servers
pnpm test           # vitest across all workspaces
```

Requirements:
- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 9.0.0 (run `corepack enable` if you don't have it)

---

## Ways to Contribute

### 1. Add a new MCP server (most-wanted)

The fastest path:

```bash
npx @theyahia/create-mcp <name> \
  --region <country-or-region> \
  --category <payments|crm|logistics|comms|ai|data|hr|marketing|other> \
  --base-url https://api.example.com
```

This scaffolds `servers/<name>/` from the template, wires it into the pnpm workspace, and prints next steps.

If `create-mcp` is not yet published, copy `servers/_template/` manually and follow [`servers/_template/README.md`](servers/_template/README.md).

**Production-grade checklist** (required for `servers/` — looser for `pipeline/`):

- [ ] **8+ tools** covering the most useful operations of the API
- [ ] Uses [`@theyahia/mcp-core`](packages/core) for HTTP client, errors, auth, logging
- [ ] **Dual transport** (stdio + Streamable HTTP) inherited from core
- [ ] **Error handling** via `isError: true` MCP responses (never raw exceptions)
- [ ] **Tests** with `vitest` and mocked HTTP responses (no live API calls in CI)
- [ ] **README** with: install, env vars, full tool list, 2-3 demo prompts
- [ ] **Changeset** added (`pnpm changeset` — see [Versioning](#versioning))

Reference servers to copy patterns from:

| Pattern | Reference |
|---|---|
| REST + API key | [`servers/cbr`](servers/cbr) |
| REST + OAuth 2.0 | [`servers/moysklad`](servers/moysklad) |
| E-commerce / multi-resource | [`servers/salla`](servers/salla) |
| Webhooks + payment flow | [`servers/cloudpayments`](servers/cloudpayments) |

### 2. Fix bugs / improve existing servers

Look for [`good first issue`](https://github.com/theYahia/WWmcp/labels/good%20first%20issue) and [`help wanted`](https://github.com/theYahia/WWmcp/labels/help%20wanted) labels. Comment on the issue before starting so we can avoid duplicate work.

### 3. Improve `@theyahia/mcp-core`

The shared library lives in [`packages/core`](packages/core). Changes here ripple through every server — please add tests and a changeset, and tag a maintainer for review.

### 4. Documentation, translations, examples

`README.md` (English) and `README.ru.md` (Russian) are the entry points. We'd love help with:
- Translations (Spanish, Portuguese, Arabic, Turkish, Indonesian)
- Use-case examples (one-screen e-commerce flows, multi-server orchestration)
- Demo GIFs / screencasts

---

## Development Workflow

### Project layout

```
WWmcp/
├── packages/
│   ├── core/          @theyahia/mcp-core — shared HTTP client, errors, auth, logging
│   └── telemetry/     @theyahia/wwmcp-telemetry — privacy-first opt-in metrics
├── servers/           production MCP servers (one workspace per server)
│   └── _template/     scaffold base — do not modify directly, use create-mcp CLI
└── docs/              architecture, planning, use-case guides
```

Each `servers/<name>/` is an independent npm package published to `@theyahia/<name>-mcp`.

### Common commands

| Command | What it does |
|---|---|
| `pnpm dev --filter <name>-mcp` | Run one server in watch mode |
| `pnpm test --filter <name>-mcp` | Run tests for one server |
| `pnpm build --filter <name>-mcp...` | Build a server and its deps (note the `...`) |
| `pnpm typecheck` | Type-check everything |
| `pnpm changeset` | Create a changeset entry for your PR |
| `pnpm audit:security` | Run `pnpm audit --audit-level=high` |

### Versioning

We use [Changesets](https://github.com/changesets/changesets). Every PR that changes published code **must** include a changeset:

```bash
pnpm changeset
# pick the changed packages → pick patch/minor/major → write a 1-2 sentence summary
git add .changeset/<generated-file>.md
```

The release workflow runs on merge to `main`:
1. Changesets opens a "Version Packages" PR aggregating all pending changesets
2. Merging that PR bumps versions, updates each `CHANGELOG.md`, and publishes to npm

### Commit messages

Conventional Commits, lightly enforced:

```
feat(salla-mcp): add product variant tools
fix(mcp-core): retry HTTP 429 with exponential backoff
docs: update Quick Start example for Cursor
chore(deps): bump @modelcontextprotocol/sdk to 1.13.0
```

Scope = package name when the change is server-specific.

---

## Pull Request Checklist

Before opening a PR:

- [ ] `pnpm test` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm changeset` was run (if you changed published code)
- [ ] README of the affected server is up to date (tool list, env vars, examples)
- [ ] Commits follow Conventional Commits
- [ ] No secrets, API keys, or live credentials anywhere in the diff

CI runs on every push: build, type-check, unit tests, e2e smoke tests, security audit.

---

## Code Review

- One maintainer approval is required before merge.
- Reviews focus on: correctness, security (input validation, secret handling), MCP-spec conformance, test coverage, README freshness.
- We squash-merge into `main`. Your PR title becomes the squash commit subject — please make it descriptive.

---

## Code of Conduct

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Be kind. Disagreement is fine; rudeness is not.

---

## Questions

- **General questions / ideas** → [GitHub Discussions](https://github.com/theYahia/WWmcp/discussions)
- **Bugs / feature requests** → [GitHub Issues](https://github.com/theYahia/WWmcp/issues/new/choose)
- **Security** → see [SECURITY.md](SECURITY.md)

Thank you for helping make MCP truly global. 🌍
