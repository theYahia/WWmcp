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

- **Node.js** ≥ 20.12 — CI runs on Node 20 and 22. Node 18 is EOL, and vitest 4.x needs `node:util.styleText` (Node 20.12+), so tests will not run on 18 even though `engines` is still permissive.
- **pnpm** ≥ 9.0.0 (run `corepack enable` if you don't have it)

---

## Ways to Contribute

### 1. Add a new MCP server (most-wanted)

The fastest path:

```bash
npx @theyahia/create-mcp <name> \
  --region=<russia|cis|turkey|mena|gulf|africa|latam|sea|south-asia|global> \
  --category=<payments|crm|logistics|comms|ai|data|hr|marketing|finance|ecommerce|other> \
  --base-url=https://api.example.com
```

This scaffolds `servers/<name>/` from `servers/_template/`, wires it into the pnpm workspace, and prints next steps. Full flag list: [`packages/create-mcp/README.md`](packages/create-mcp/README.md).

The template is deliberately thin — it gives you `src/`, `package.json` and `tsconfig.json`. Tests, `smithery.yaml` and `.claude/skills/` you add yourself; copy them from a reference server below.

**Production-grade checklist** (required for `servers/`):

- [ ] **Tools covering the API's useful surface.** 8+ is the target for a broad API, but it is not a quota — `cbr` and `cbu` ship 5 tools and are complete, because the upstream API is that small. Padding a thin API with filler tools makes the server worse, not better.
- [ ] Uses [`@theyahia/mcp-core`](packages/core) for HTTP client, errors, auth, logging
- [ ] **Dual transport** (stdio + Streamable HTTP) inherited from core
- [ ] **Error handling** via `isError: true` MCP responses (never raw exceptions)
- [ ] **Tests** with `vitest` and mocked HTTP responses (no live API calls in CI)
- [ ] **README** with: install, env vars, full tool list, 2-3 demo prompts
- [ ] **`smithery.yaml`** with an `icon:` field — see [Server assets](#server-assets)
- [ ] **At least one skill** in `.claude/skills/` — see [Bundled skills](#bundled-skills)
- [ ] **`node scripts/catalog.mjs`** re-run and `scripts/catalog.json` committed — see [Catalog numbers](#catalog-numbers)
- [ ] **Changeset** added (`pnpm changeset` — see [Versioning](#versioning))

Reference servers to copy patterns from:

| Pattern | Reference |
|---|---|
| Small no-auth REST API (start here) | [`servers/cbu`](servers/cbu) — 5 tools, 2 skills, e2e smoke test |
| REST + API key | [`servers/cbr`](servers/cbr) |
| REST + OAuth 2.0 | [`servers/moysklad`](servers/moysklad) — also the richest skill set (8) |
| Logistics / tracking | [`servers/cdek`](servers/cdek), [`servers/pochta-russia`](servers/pochta-russia) |
| E-commerce / multi-resource | [`servers/salla`](servers/salla) |
| Webhooks + payment flow | [`servers/cloudpayments`](servers/cloudpayments) |
| Skill ↔ tool consistency test | [`servers/yookassa/tests/skills.test.ts`](servers/yookassa/tests/skills.test.ts) |

### 2. Fix bugs / improve existing servers

Look for [`good first issue`](https://github.com/theYahia/WWmcp/labels/good%20first%20issue) and [`help wanted`](https://github.com/theYahia/WWmcp/labels/help%20wanted) labels. Comment on the issue before starting so we can avoid duplicate work.

### 3. Improve `@theyahia/mcp-core`

The shared library lives in [`packages/core`](packages/core). Changes here ripple through every server — please add tests and a changeset, and tag a maintainer for review.

### 4. Documentation, translations, examples

`README.md` (English) and `README.ru.md` (Russian) are the entry points. We'd love help with:

- Translations of the README (Spanish, Portuguese, Arabic, Turkish, Indonesian, …)
- Per-server manuals — `servers/<name>/docs/MANUAL.ru.md`, see [`servers/wildberries/docs/MANUAL.ru.md`](servers/wildberries/docs/MANUAL.ru.md)
- Use-case examples (one-screen e-commerce flows, multi-server orchestration)
- Demo GIFs / screencasts

---

## Catalog numbers

The server count, per-server versions and tool counts in `README.md`, `README.ru.md` and `docs/index.html` are **generated, not hand-written**. The generator is [`scripts/catalog.mjs`](scripts/catalog.mjs).

Tools are counted **live**: every server is started over stdio and asked for `listTools()`. Grepping for `registerTool` lies — `wildberries` registers in a loop over `toolDefinitions` (grep says 3, reality is 30), `huntflow` uses its own `registerStructured` / `registerText` wrappers, and `retailcrm` / `aprovodka` change their tool set based on env vars.

```bash
node scripts/catalog.mjs                 # regenerate scripts/catalog.json
node scripts/catalog.mjs --check         # verify only; exits 1 on drift
node scripts/catalog.mjs --write-readme  # also patch the numbers into README / docs
```

Servers log to stderr; append `2>/dev/null` for clean output.

**If your PR adds a server, or adds / removes / renames a tool, run `node scripts/catalog.mjs` and commit the updated `scripts/catalog.json`** (add `--write-readme` if the README tables need the new numbers). Otherwise the published counts drift from reality. `--check` is the fast way to confirm you are clean before opening the PR.

---

## Bundled skills

Each server ships Claude Code skills in `servers/<name>/.claude/skills/<skill-name>/SKILL.md` — short, task-shaped recipes ("create a payment and return the link", "show me stuck deals in the pipeline") that turn a pile of tools into a workflow. They are part of the server, not an optional extra: `moysklad` has 8, `wildberries` 6, `cbr` 5.

Two rules are enforced by tests — see [`servers/yookassa/tests/skills.test.ts`](servers/yookassa/tests/skills.test.ts) (the same test also lives in `calltouch` and `mango-office`):

- **Every backticked tool name in a `SKILL.md` must actually be registered in `src/index.ts`.** Renaming a tool without updating the skill fails CI. This is the most common way a skill rots.
- **If the frontmatter declares `allowed-tools:`, it must include at least one `mcp__*` entry.** A skill restricted to `Bash` / `Read` can never reach the server's own tools.

Adding a skill is a good first contribution: copy the shape from a neighbouring server, keep it under a page, and make the frontmatter `description` say *when* to reach for it, not what it does.

---

## Server assets

- `servers/<name>/smithery.yaml` — Smithery registry manifest. Include an `icon:` field.
- `servers/<name>/assets/icon.svg` — square, works on light and dark. Reference: [`servers/wildberries/assets/icon.svg`](servers/wildberries/assets/icon.svg).
- `servers/<name>/assets/demo.svg` — optional animated terminal demo. Reference: [`servers/wildberries/assets/demo.svg`](servers/wildberries/assets/demo.svg).
- `servers/<name>/docs/MANUAL.ru.md` — optional long-form Russian manual for servers with a Russian-speaking audience.

---

## Development Workflow

### Project layout

```
WWmcp/
├── packages/
│   ├── core/          @theyahia/mcp-core — shared HTTP client, errors, auth, logging
│   ├── create-mcp/    @theyahia/create-mcp — scaffolding CLI
│   └── telemetry/     @theyahia/wwmcp-telemetry — privacy-first opt-in metrics
├── servers/           production MCP servers (one workspace per server)
│   ├── _template/     scaffold base — do not modify directly, use create-mcp CLI
│   └── <name>/
│       ├── src/               tools, client, types
│       ├── tests/             vitest, mocked HTTP
│       ├── .claude/skills/    bundled workflow skills (part of the server)
│       ├── assets/            icon.svg, demo.svg
│       ├── docs/              optional MANUAL.ru.md
│       └── smithery.yaml      registry manifest
├── scripts/           catalog.mjs — live tool counter, source of truth for all numbers
└── docs/              use-case guides, configs, docs/index.html catalog page
```

Each `servers/<name>/` is an independent npm package published to `@theyahia/<name>-mcp`.

### A note on `.gitignore`

Some rules in the root `.gitignore` are **deliberately anchored with a leading slash**:

```gitignore
/pipeline/
/skills/
/content/
```

Without the leading slash, `skills/` matches at **any** depth — including `servers/*/.claude/skills/`, which silently hides every bundled skill in the repo. That has happened once already and cost 63 skills. If you add an ignore rule for a top-level directory, anchor it with `/`. Sanity check after touching `.gitignore`:

```bash
git check-ignore -v servers/moysklad/.claude/skills/   # must print nothing
```

### Common commands

| Command | What it does |
|---|---|
| `pnpm dev --filter <name>-mcp` | Run one server in watch mode |
| `pnpm test --filter <name>-mcp` | Run tests for one server |
| `pnpm build --filter <name>-mcp...` | Build a server and its deps (note the `...`) |
| `pnpm typecheck` | Type-check everything |
| `node scripts/catalog.mjs --check` | Verify server / tool counts match the docs |
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
- [ ] `node scripts/catalog.mjs --check` is clean (if you touched a server or its tools)
- [ ] `pnpm changeset` was run (if you changed published code)
- [ ] README of the affected server is up to date (tool list, env vars, examples)
- [ ] Skills in `.claude/skills/` reference only tools that exist
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
