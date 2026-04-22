# Go-to-market playbook for @metarebalance/dadata-mcp

**DaData already ships an official MCP server — but it only exposes 4 tools.** Your 27-tool server covers the entire DaData API surface, and that gap is your primary competitive advantage. This playbook provides concrete commands, code, and strategy for every phase: npm publication, directory listings, Russian community launch, v2 architecture, brand scaling, and monetization. The Russian GenAI market hit **₽58 billion in 2025** with 71% of companies using generative AI, yet fewer than 0.05% of the 20,000+ global MCP servers target Russian services — first-mover advantage is real but time-limited.

---

## PART 1: npm publication checklist

### 1.1 Scoped @metarebalance is the right call

Every official MCP server uses scoped packages (`@modelcontextprotocol/server-filesystem`, `@modelcontextprotocol/server-github`). npm search ranking is driven by **keywords, description, and README content** — not scope. Scoped packages do not suffer a discoverability penalty. The `@metarebalance` scope signals organizational ownership and enables future packages (`@metarebalance/moysklad-mcp`, `@metarebalance/yookassa-mcp`) under a unified brand.

**Anti-pattern**: Don't use unscoped `dadata-mcp` thinking it helps search — it doesn't, and you lose namespace coherence.

**Recommended package.json** (complete, production-ready):

```json
{
  "name": "@metarebalance/dadata-mcp",
  "version": "0.1.0",
  "description": "Complete MCP server for DaData.ru — 27 tools for Russian address, company, bank, phone, and email data",
  "license": "MIT",
  "type": "module",
  "bin": {
    "dadata-mcp": "dist/index.js"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsc && shx chmod +x dist/*.js",
    "prepare": "npm run build",
    "prepublishOnly": "npm run build && npm test",
    "start": "node dist/index.js",
    "watch": "tsc --watch",
    "test": "vitest run",
    "inspect": "npx @modelcontextprotocol/inspector node dist/index.js"
  },
  "keywords": [
    "mcp", "mcp-server", "model-context-protocol", "modelcontextprotocol",
    "dadata", "dadataru", "russia", "russian-api",
    "address", "geocoding", "company", "inn",
    "ai", "claude", "llm", "anthropic"
  ],
  "engines": { "node": ">=18.0.0" },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/theYahia/dadata-mcp.git"
  },
  "publishConfig": { "access": "public" }
}
```

**Critical fields explained**:

- **`"type": "module"`** — MCP SDK requires ESM. Omitting this causes cryptic import errors.
- **`"bin": { "dadata-mcp": "dist/index.js" }`** — Object form with explicit command name. When users run `npx @metarebalance/dadata-mcp`, npm looks up the bin entry. The string form (`"bin": "dist/index.js"`) uses the package name as command, which works but is less explicit.
- **`"files": ["dist"]`** — Only ships compiled JS. Using `"files"` makes `.npmignore` unnecessary — npm includes only what's listed plus `package.json`, `README.md`, and `LICENSE` automatically.
- **`"publishConfig": { "access": "public" }`** — **Mandatory** for scoped packages. Without it, `npm publish` defaults to restricted (private), requiring a paid npm org.
- **`"prepare"`** — Runs `npm run build` on `npm install` from git (useful for contributors cloning the repo).
- **`"prepublishOnly"`** — Ensures build and tests pass before every publish. Differs from `prepare` in that it only runs on `npm publish`.

**Shebang requirement**: The first line of `src/index.ts` must be:

```typescript
#!/usr/bin/env node
```

Without this, `npx` fails silently on Linux/macOS. The `shx chmod +x dist/*.js` in the build script makes the output executable cross-platform.

**Anti-patterns**:
- ❌ Don't include `src/` in `files` — only ship `dist/`
- ❌ Don't use `console.log()` anywhere — stdout is the MCP JSON-RPC transport channel. All logging must go to `console.error()` or the SDK's built-in logging (which writes to stderr)
- ❌ Don't forget `"type": "module"` — the MCP SDK is ESM-only
- ❌ Don't exceed ~16 keywords — diminishing returns and it looks spammy

### 1.2 Start at 0.1.0, not 1.0.0

Official MCP servers use calendar versioning (`2026.1.14`) because they release from a monorepo on a date-based schedule. That pattern doesn't apply to independent packages. Third-party MCP servers consistently start at **0.x.x** — `twitter-mcp` started at `0.1.1`, `@gabrielmaialva33/mcp-filesystem` at `0.3.0`.

**Start at `0.1.0`**. Semver semantics say `0.x.y` means "initial development, API may change." Move to `1.0.0` once the tool interface is stable and you've processed community feedback. This gives you freedom to rename tools, change schemas, and restructure without breaking semver expectations.

**Semver strategy for MCP servers**:
- **Patch** (0.1.0 → 0.1.1): Bug fixes, improved error messages, docs updates
- **Minor** (0.1.0 → 0.2.0): New tools added, new DaData endpoints supported, new features like caching
- **Major** (0.x → 1.0.0): Stable API declaration; after 1.0.0, major bumps for breaking tool schema changes

**CHANGELOG format**: Use Keep a Changelog format with Conventional Commits. The official MCP monorepo skips per-package changelogs, but independent servers should maintain one — users and AI clients need to know what changed:

```markdown
# Changelog
## [0.2.0] - 2026-04-15
### Added
- `validate_counterparty` composite tool (chains INN lookup + address + financials)
- In-memory cache with configurable TTL per endpoint type
### Fixed
- Timeout handling on slow DaData API responses
## [0.1.0] - 2026-04-01
### Added
- Initial release with 27 tools covering full DaData API
```

### 1.3 Publication process — step by step

**First publish (manual, one-time)**:

```bash
# 1. Ensure you're logged into npm
npm login

# 2. Verify package builds and tests pass
npm run build
npm test

# 3. Dry run to check what will be published
npm pack --dry-run
# Verify: only dist/, README.md, LICENSE, package.json appear

# 4. First publish (scoped packages require --access public)
npm publish --access public --provenance

# 5. Verify it works via npx
npx @metarebalance/dadata-mcp --help
# Or test with MCP Inspector:
DADATA_API_KEY=test npx @modelcontextprotocol/inspector npx @metarebalance/dadata-mcp
```

**Note**: New npm packages may take **up to 2 weeks** to appear in npm search results. The package is installable immediately but search indexing has a delay.

**OIDC Trusted Publishing (set up after first publish)**:

npm revoked all classic personal tokens in December 2025. The new standard is **OIDC Trusted Publishing** (GA since July 2025). After your first manual publish:

1. Go to npmjs.com → `@metarebalance/dadata-mcp` → Settings → Trusted Publisher → GitHub Actions
2. Enter: repository owner `theYahia`, repository name `dadata-mcp`, workflow filename `publish.yml`
3. Optionally enable "Require 2FA" and "Disallow tokens" for maximum security

**GitHub Actions workflow for automated publish**:

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags: ["v*"]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write  # Required for OIDC trusted publishing

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
          registry-url: "https://registry.npmjs.org"

      - run: npm install -g npm@latest  # >= 11.5.1 required for OIDC

      - run: npm ci

      - run: npm test

      - run: npm run build

      - run: npm publish --provenance --access public
```

**Release workflow**:

```bash
# Bump version (updates package.json AND creates git tag)
npm version patch   # or: npm version minor

# Push code and tag
git push origin main --tags
# GitHub Actions triggers automatically on v* tag → publishes to npm
```

**Anti-patterns**:
- ❌ Don't store npm tokens as GitHub secrets — use OIDC instead (tokens were revoked)
- ❌ Don't use `npm install` in CI — use `npm ci` for deterministic, faster builds
- ❌ Don't run publish without `--provenance` — it enables supply chain attestation
- ❌ Don't forget that OIDC requires npm ≥ 11.5.1, which requires Node 20+

---

## PART 2: README architecture for 27 tools

### 2.1 What top MCP servers teach about README structure

The **GitHub MCP Server** (most starred, 40+ tools) uses a pattern worth studying: badges at top → one-liner description → use cases (5 bullets) → installation split by method → **toolsets as collapsible `<details>` sections** → CLI utilities. The Salesforce MCP server groups tools into "toolsets" with GA/non-GA status markers. The Azure MCP server uses tables for sub-servers.

**Recommended README structure for @metarebalance/dadata-mcp**:

```markdown
# @metarebalance/dadata-mcp

[![npm](https://img.shields.io/npm/v/@metarebalance/dadata-mcp)](https://npmjs.com/package/@metarebalance/dadata-mcp)
[![downloads](https://img.shields.io/npm/dm/@metarebalance/dadata-mcp)](https://npmjs.com/package/@metarebalance/dadata-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP Tools: 27](https://img.shields.io/badge/MCP_Tools-27-blue)]()
[![Security: 10/10](https://img.shields.io/badge/Security-10%2F10-brightgreen)]()

🇬🇧 English | [🇷🇺 Русский](README.ru.md)

> Complete MCP server for the full DaData.ru API — 27 tools for Russian
> addresses, companies, banks, phones, emails, and more. Runs locally
> with stdio transport. Works with Claude Desktop, VS Code, Cursor,
> and any MCP client.

> **Note**: DaData offers [an official hosted MCP server](https://dadata.ru/mcp/)
> with 4 tools. This package provides comprehensive access to
> **all 27 DaData endpoints** — running locally in your environment.

![Demo](assets/demo.gif)

## Quick start

```json
{
  "mcpServers": {
    "dadata": {
      "command": "npx",
      "args": ["-y", "@metarebalance/dadata-mcp"],
      "env": {
        "DADATA_API_KEY": "<your-api-key>",
        "DADATA_SECRET_KEY": "<your-secret-key>"
      }
    }
  }
}
```​

## Tools (27)

| Category | Count | Free tier |
|----------|-------|-----------|
| 🏠 Addresses | 8 | Partial |
| 🏢 Companies | 6 | ✅ Full |
| 🏦 Banks | 3 | ✅ Full |
| 📞 Contacts | 5 | Partial |
| 🌍 Geo & Reference | 5 | ✅ Full |

<details>
<summary>🏠 Address Tools (8)</summary>

| Tool | Description | API Cost |
|------|-------------|----------|
| `suggest_address` | Autocomplete addresses as user types | Free |
| `clean_address` | Standardize free-form address | 0.20₽ |
| `geolocate_address` | Reverse geocode lat/lng | Free |
...
</details>

<details>
<summary>🏢 Company Tools (6)</summary>
...
</details>
```

**Key principles for 27-tool README**:
- **Summary table first** — shows all categories at a glance with free/paid indicator
- **Collapsible `<details>` sections** — GitHub renders them natively, preventing wall-of-text
- **Tables inside sections** — more scannable than bullet lists for 5+ items
- **Free/paid marking** with ✅/💰 — DaData-specific value add since pricing varies by endpoint
- **Most-used tools first** within each group

**One-click install badges** (from jamesmontemagno/mcp-badge-creator):

```markdown
[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install-0098FF?logo=visualstudiocode)](vscode:...)
[![Install in Cursor](https://img.shields.io/badge/Cursor-Install-000?logo=cursor)](cursor:...)
```

### 2.2 Recording a demo GIF

**VHS (charmbracelet/vhs)** records terminal sessions only — it cannot capture Claude Desktop's GUI. Use it for terminal demos (npx installation, MCP Inspector testing).

**For Claude Desktop GUI demos on Windows, use ScreenToGif** (NickeManarin/ScreenToGif):

1. Download portable .exe from GitHub (~7MB)
2. Launch → click "Window" → select Claude Desktop window
3. Set capture at **15 FPS** (sufficient for UI, halves file size vs 30 FPS)
4. Record a **single workflow**: ask Claude to look up a company by INN → show the result
5. In the built-in editor: trim excess frames, add a title frame, optimize with 128-color palette
6. Export as GIF, target **under 5MB** (under 10MB for GitHub)

**What to show in 8–15 seconds**: One complete round trip — type a natural language prompt like "Найди компанию с ИНН 7707083893" → Claude calls the `find_party` tool → structured company data appears. This demonstrates the value proposition instantly.

**Hosting the GIF**: Use GitHub's CDN — open any issue in your repo, drag the GIF into the comment box, GitHub uploads it to `user-images.githubusercontent.com`, copy the URL, paste into README. Close the issue without submitting. This avoids bloating the repo clone size.

**Anti-pattern**: Don't commit large GIFs (>5MB) directly to the repo — it permanently inflates clone size for all contributors.

### 2.3 Bilingual README: English primary, Russian essential

GitHub renders **only `README.md`** on the repo landing page. There is no automatic language detection or switching. The established pattern is:

```
README.md       ← English (primary, rendered on landing)
README.ru.md    ← Russian (linked from README.md)
```

With language toggles at the top of each file:

```markdown
🇬🇧 English | [🇷🇺 Русский](README.ru.md)
```

**English must be the primary README** because: npm, GitHub search, and all MCP directories operate in English; tool names and descriptions must be in English for optimal LLM tool selection (LLMs are trained predominantly on English data and perform measurably better at matching intent to English tool descriptions); and the MCP ecosystem is global.

**Russian README is essential** because DaData is a Russian service with Russian-speaking users, Habr articles will link to `README.ru.md`, and the Telegram community expects Russian docs.

**Tool descriptions in code must be English** — this is a technical requirement, not a preference. The MCP protocol sends tool metadata (`name` + `description` + `inputSchema`) directly to the LLM for tool selection. English descriptions produce significantly better tool selection accuracy.

---

## PART 3: Directory listings — exact processes

### Priority-ordered submission checklist

**Tier 1 — Submit immediately after npm publish**:

**Glama.ai** (17,200+ servers, auto-indexed):
1. Go to https://glama.ai/mcp/servers
2. Click "Add Server"
3. Paste `https://github.com/theYahia/dadata-mcp`
4. Server is **automatically indexed and quality-scored** (A/B/C grades based on security, schemas, error handling)
5. Claim the server listing afterward for admin access and analytics

**Smithery.ai** (4,000+ servers):
1. Go to https://smithery.ai/new
2. Sign in with GitHub
3. Provide GitHub repository URL
4. Smithery auto-indexes, builds, and lists the server
5. Optionally deploy hosted version with `smithery deploy .`

Alternative CLI method:
```bash
npm install -g @smithery/cli@latest
smithery auth login
smithery mcp publish "https://github.com/theYahia/dadata-mcp" -n @metarebalance/dadata-mcp
```

**NeuralDeep.ru** (Russian-focused, critical for DaData):
1. Go to https://neuraldeep.ru/submit ("Добавить навык")
2. Fill the web form with server details
3. Tag as "Российские" (Russian) for visibility in the Russian services filter
4. CLI alternative: `npx skillsbd add theYahia/dadata-mcp`
5. The site is open-source — you can also submit a PR to their GitHub repo

**awesome-mcp-servers** (punkpeye/awesome-mcp-servers, 80K+ stars):
1. Fork the repository
2. Add entry in alphabetical order in the appropriate category section
3. Format: `[dadata-mcp](https://github.com/theYahia/dadata-mcp) - Complete MCP server for DaData.ru Russian data API (27 tools) ![TypeScript Badge]`
4. Submit PR

**Tier 2 — Submit within first week**:

**mcp.so** (19,129+ servers):
1. Click "Submit" in the navigation bar on mcp.so
2. Creates a GitHub issue on their repo (chatmcp/mcpso)
3. Provide: server name, description, features list, `npx @metarebalance/dadata-mcp` connection command, GitHub link

**PulseMCP** (13,230+ servers):
- PulseMCP **auto-discovers** servers from across the internet and updates daily
- Ensure your `server.json` exists and is well-formed; the server should appear automatically
- Contact hello@pulsemcp.com for expedited listing or partnership

**MCP.directory** (1,891 servers):
1. Click "Submit Server" at https://mcp.directory/submit
2. Fill the form with details
3. Community-vetted after submission

**mcpservers.org**:
1. Go to https://mcpservers.org/submit
2. Fill: Server Name, Short Description, GitHub URL, Category (select "Other" or "Development"), Contact Email
3. Free listing available; premium listing ($39 one-time) gives official badge and faster review

**Official MCP Registry** (modelcontextprotocol/registry):
1. Add `mcpName` to package.json: `"mcpName": "io.github.theYahia/dadata-mcp"`
2. Create a `server.json` following the schema at the registry docs
3. Use the `mcp-publisher` CLI from the registry repo to publish

**Tier 3 — Submit when ready**:

**Docker MCP Catalog** (after containerizing):
1. Submit PR to https://github.com/docker/mcp-registry with metadata
2. Choose "Docker-built" option for cryptographic signatures and automatic security updates
3. Server appears in Docker Desktop MCP Toolkit within 24 hours of approval

**LobeHub MCP Marketplace**:
- Submit via the marketplace link at https://lobehub.com/mcp
- Include Claude Desktop JSON config in README for easy integration

**Claude Connectors** (for remote HTTP transport):
- Submit at https://support.claude.com/en/articles/12922490
- Requires: OAuth authentication, privacy policy, 3+ working examples, support contact
- Only relevant after adding Streamable HTTP transport in v2

### What NOT to do with directory submissions

- ❌ Don't submit to all directories on the same day — stagger over 1–2 weeks to maintain engagement momentum
- ❌ Don't use different descriptions everywhere — keep a consistent 1-2 sentence description across all listings
- ❌ Don't skip NeuralDeep.ru — it's the primary Russian-language MCP directory and your most relevant audience
- ❌ Don't claim "official DaData MCP server" — this is factually incorrect and will damage trust

---

## PART 4: Go-to-market for Russian AI community

### 4.1 Habr is your highest-leverage channel

A first-time Habr author published an MCP explainer article that reached **66,000 views** — proving massive appetite for MCP content on the platform. DaData's parent company HFLabs has an **official corporate blog with 45,000 subscribers** and actively promotes partner integrations through their blog, newsletter (~7,000 recipients), and Telegram channel.

**Critical discovery**: DaData already lists an MCP server at `dadata.ru/mcp/`. Their official server has **only 4 tools** (clean_address, find_party, find_company_by_domain, find_company_by_email). Your server's **27 tools** covering the complete API is the differentiation story.

**Article title variants (A/B)**:
- A: *"27 инструментов DaData для Claude и ChatGPT: полный MCP-сервер за 5 минут"* (technical, numbers-driven)
- B: *"Как я за один день сделал MCP-сервер для DaData с 27 инструментами"* (personal story, Habr loves dev diaries)
- C: *"Официальный MCP DaData даёт 4 инструмента. Мой — 27"* (bold comparison, attention-grabbing)

**Recommended format**: Tutorial with a personal story arc. Habr's most bookmarked articles are practical tutorials. Structure:

1. **Hook** — "DaData released an official MCP server. It has 4 tools. I needed 27."
2. **What is MCP** — Brief (link to the 66K-view article for deeper background)
3. **Why DaData + AI agents** — Real use cases (address validation for chatbots, counterparty verification, lead enrichment)
4. **Step-by-step setup** — `npx @metarebalance/dadata-mcp`, Claude Desktop config JSON, first query
5. **Tool showcase** — 3-4 real scenarios with screenshots of Claude using the tools
6. **Architecture** — Brief: how it's built, security audit score, test coverage
7. **What's next** — v2 plans, CIS expansion, other Russian service MCP servers

**Target hubs**: Искусственный интеллект (primary reach), Программирование (broad), Проектирование API (directly relevant). Publish on **Saturday or Sunday 10:00–13:00 MSK** — fewer competing articles on weekends, longer visibility in the feed.

**HFLabs cross-promotion**: Contact DaData/HFLabs directly. They actively promote partner integrations and their referral program page explicitly mentions promoting partners via blog and newsletter. The pitch: "I built a community MCP server covering your full API — want to feature it in your newsletter to the 7,000 subscribers?" They already list MCP on their product page, so they clearly see value in MCP adoption. Success example: LeadVertex developers earned **300,000₽** from DaData's referral program, suggesting active partner engagement.

### 4.2 Telegram channels to target

**Large channels (100K+ subscribers)**:
- **@vistehno** — AI/tech news, general audience
- **@ai_machinelearning_big_data** — ML/AI news, research reviews
- **@neuro_channel** (Нейроканал by Tproger) — AI/ML tool reviews

**Mid-size developer channels (10K–100K)**:
- **@ml_product** (ML Product Hub) — ML product development, case studies
- **@aitalenthubnews** (AI Talent Hub) — AI education community
- **Департамент Разработки** — Code-focused, real-world cases

**Post format for maximum engagement**:
```
🔥 Первый полноценный MCP-сервер для DaData — 27 инструментов

Официальный MCP-сервер DaData даёт 4 инструмента.
Мой — все 27 эндпоинтов: адреса, организации, банки,
телефоны, email, геолокация.

Работает с Claude Desktop, VS Code, Cursor.
99 тестов, аудит безопасности 10/10.

npx @metarebalance/dadata-mcp

📦 npm: [link]
🐙 GitHub: [link]  
📝 Habr: [link]

#MCP #DaData #AI #Claude
```

**Creating your own channel**: Yes, but start small — a personal dev channel like "@metarebalance_dev" or "@mcp_russia" for updates. Post Habr articles there first. A channel specifically about "MCP + Russian APIs" would be genuinely unique with no competition. Build it alongside the server series.

### 4.3 Other platforms

**Reddit** (English, immediate):
- Post in r/mcp, r/ClaudeAI, r/LocalLLaMA
- Format: *"I built an MCP server for DaData.ru — the Russian address/company data API (27 tools, 99 tests)"*
- Include GIF demo, link to GitHub, brief description of 2-3 use cases
- The "first MCP server for Russian services" angle is genuinely novel for the international community

**ProductHunt** (worth it):
- MCP is an active category on ProductHunt — multiple servers launched successfully in 2025-2026
- Angle: "First comprehensive MCP server for Russian data services"
- Launch on a **Tuesday or Wednesday** for maximum visibility
- Prepare 4-5 screenshots, maker comment, and 1-paragraph description

**VC.ru** (for business audience):
- Write a business-angle version of the Habr article: "Как AI-агенты получают доступ к данным российских компаний через MCP"
- VC.ru audience (20M+ monthly) is business-focused, not deeply technical — avoid code, focus on use cases
- Lower priority than Habr

**dev.to** (English cross-post):
- Cross-post the English version of Habr article
- Good SEO — dev.to articles rank well in Google
- Format: tutorial with code examples

**Twitter/X**: Limited for Russian audience (Telegram dominates), but useful for international MCP community. Post announcements with `#MCP #ModelContextProtocol` hashtags. Anthropic and MCP ecosystem are very active on X.

### 4.4 SEO and organic discovery

Developers find MCP servers through **directories first, search engines second**. Primary discovery paths: MCP registries (Glama, Smithery, PulseMCP, mcp.so) → GitHub search → npm search → Google/Yandex → Habr/dev.to articles → Reddit/Telegram recommendations.

**Common search queries to optimize for**:
- English: "MCP server DaData", "DaData AI integration", "Russian API MCP server", "address validation MCP"
- Russian: "MCP сервер DaData", "DaData интеграция AI", "MCP сервер для российских API"

**A separate landing page is not needed at launch** — GitHub README is the primary landing page for MCP servers. However, once you have 3+ servers in the @metarebalance series, a simple landing page at `metarebalance.dev` listing all servers would help SEO and brand cohesion. For now, invest in README quality and directory presence.

---

## PART 5: DaData referral program

### 5.1 Confirmed terms

DaData's referral program at `dadata.ru/referral/`:

- **Commission**: **30% of all purchases** made by referred clients
- **Duration**: Ongoing — clients who adopt DaData once "continue generating revenue year after year" (their language)
- **Payment frequency**: **Quarterly** — DaData and partner agree on payout amount each quarter
- **Payment method**: Partner invoices DaData, payment to **bank account (расчётный счёт)** within 3 business days
- **Legal framework**: Agency offer agreement (оферта) — no lawyers needed, just apply
- **Document exchange**: Via Diadok electronic document system
- **Success example**: LeadVertex developers earned **300,000₽** from the program
- **Client base**: 6,800 companies and 50,000 individuals use DaData

### 5.2 Where and how to embed the referral link

**Primary placement — README "Get API Key" section**:

```markdown
## Getting your DaData API key

1. [Sign up for DaData](https://dadata.ru/?ref=metarebalance) (free tier: 10,000 requests/day)
2. Copy your API key from the dashboard
3. Set it as `DADATA_API_KEY` environment variable

> 💡 *The referral link above supports this project's development.
> You can also sign up directly at [dadata.ru](https://dadata.ru).*
```

**Secondary placements**:
- In the error message when `DADATA_API_KEY` is missing: `"Get your free API key at https://dadata.ru/?ref=metarebalance"`
- In the Habr article's "Getting Started" section
- In the npm package description (subtle: "Get a DaData API key at...")

**Ethical handling**: Be transparent. The disclosure pattern above ("supports this project's development") is standard in open-source. Many npm wrapper libraries include referral links — Stripe, Twilio, and SendGrid wrappers commonly do this. It does **not** violate npm or GitHub terms of service as long as it's not deceptive.

**Anti-patterns**:
- ❌ Don't hide the referral nature — always disclose
- ❌ Don't make the referral link the only way to sign up — always offer a direct link alternative
- ❌ Don't embed the referral link in API request headers or redirect actual API traffic

**Revenue estimate at scale**: If you refer 100 users paying the mid-tier plan (28,000₽/year), that's 100 × 28,000 × 0.30 = **840,000₽/year (~$8,400)**. At 1,000 users: **8,400,000₽/year (~$84,000)**. This is recurring quarterly revenue with no ongoing cost. The referral program is your most realistic short-term monetization path.

---

## PART 6: v2 roadmap — architecture and code

### 6.1 Composite tools

MCP has **no built-in workflow/sequence mechanism** — each tool call is independent. The approach: create server-side composite tools that internally chain multiple DaData API calls, returning a unified result. This is superior to letting the LLM chain atomic tools because it reduces token usage, latency, and failure modes.

**`validate_counterparty` — complete implementation**:

```typescript
server.tool(
  "validate_counterparty",
  {
    inn: z.string().describe("INN of the company to validate"),
    check_address: z.boolean().optional().describe("Also verify registered address"),
  },
  async ({ inn, check_address }) => {
    const results: Record<string, any> = {};
    const errors: string[] = [];

    // Step 1: Company lookup by INN
    try {
      const party = await dadataRequest("findById/party", { query: inn, count: 1 });
      results.company = party.suggestions?.[0] ?? null;
      if (!results.company) {
        return {
          content: [{ type: "text", text: JSON.stringify({
            success: false, error: `No company found for INN ${inn}`
          }, null, 2) }],
        };
      }
    } catch (e: any) {
      errors.push(`Company lookup: ${e.message}`);
    }

    // Step 2: Address verification (if requested and company found)
    if (check_address && results.company?.data?.address?.unrestricted_value) {
      try {
        const cleaned = await fetch("https://cleaner.dadata.ru/api/v1/clean/address", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${process.env.DADATA_API_KEY}`,
            "X-Secret": process.env.DADATA_SECRET_KEY!,
          },
          body: JSON.stringify([results.company.data.address.unrestricted_value]),
        });
        const cleanData = await cleaned.json();
        results.addressVerification = {
          original: results.company.data.address.unrestricted_value,
          qc: cleanData[0]?.qc,          // 0 = valid, 1-3 = needs attention
          isValid: cleanData[0]?.qc === 0,
          cleaned: cleanData[0]?.result,
        };
      } catch (e: any) {
        errors.push(`Address verification: ${e.message}`);
      }
    }

    // Step 3: Compile risk assessment from available data
    const d = results.company?.data;
    results.risk = {
      status: d?.state?.status,                  // ACTIVE / LIQUIDATING / LIQUIDATED
      isActive: d?.state?.status === "ACTIVE",
      registrationDate: d?.state?.registration_date,
      type: d?.type,                             // LEGAL / INDIVIDUAL
      okved: d?.okved,
      management: d?.management?.name,
      finance: d?.finance,
    };

    return {
      content: [{ type: "text", text: JSON.stringify({
        success: errors.length === 0,
        inn,
        company: { name: d?.name?.full_with_opf, ogrn: d?.ogrn, kpp: d?.kpp },
        addressVerification: results.addressVerification ?? null,
        risk: results.risk,
        errors: errors.length > 0 ? errors : undefined,
      }, null, 2) }],
    };
  }
);
```

**Edge case handling pattern**: If Step 1 fails, return immediately — subsequent steps depend on it. If Steps 2 or 3 fail, return partial results with the error array populated. Set a **5-second timeout per step** (DaData's default is 3 seconds). Total budget for a 3-step chain: ~10 seconds.

### 6.2 Caching with per-endpoint TTL

**TTL strategy by data type**:

| Endpoint | TTL | Rationale |
|----------|-----|-----------|
| `suggest/address` | 60 seconds | User is typing; results change per keystroke |
| `findById/party` | 1–24 hours | EGRUL updates every ~3 days |
| `clean/address` | 12–24 hours | FIAS reference data updates weekly |
| `geolocate/address` | 24–72 hours | Coordinates are essentially static |
| `findById/bank` | 24 hours | Bank registry changes infrequently |
| `profile/balance` | 0 (no cache) | Must be real-time |

**In-memory cache is correct for v2** — a single-process stdio MCP server doesn't need Redis. Redis becomes necessary only when you add HTTP transport with multiple instances behind a load balancer.

```typescript
class TTLCache<T = unknown> {
  private cache = new Map<string, { data: T; expiresAt: number }>();
  private cleanup: NodeJS.Timeout;

  constructor(cleanupMs = 60_000) {
    this.cleanup = setInterval(() => this.evict(), cleanupMs);
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) { this.cache.delete(key); return undefined; }
    return entry.data;
  }

  set(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  private evict(): void {
    const now = Date.now();
    for (const [k, v] of this.cache) if (now > v.expiresAt) this.cache.delete(k);
  }

  destroy(): void { clearInterval(this.cleanup); this.cache.clear(); }
}
```

**Signaling cache status**: MCP has no native cache metadata field. Include `"cached": true, "cachedAt": "2026-03-29T10:00:00Z"` in the JSON response text. Alternatively, use the `_meta` field on content items.

### 6.3 Docker

**Production Dockerfile** (multi-stage, non-root, Alpine):

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN addgroup -g 1001 -S mcp && adduser -S mcp -u 1001 -G mcp
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER mcp
ENTRYPOINT ["node", "dist/index.js"]
```

**Claude Desktop config for Docker**:

```json
{
  "mcpServers": {
    "dadata": {
      "command": "docker",
      "args": ["run", "-i", "--rm",
        "-e", "DADATA_API_KEY",
        "-e", "DADATA_SECRET_KEY",
        "ghcr.io/theyahia/dadata-mcp:latest"
      ],
      "env": {
        "DADATA_API_KEY": "your_key",
        "DADATA_SECRET_KEY": "your_secret"
      }
    }
  }
}
```

The `-i` flag (interactive/stdin) is **required** for stdio transport. The `--rm` flag auto-removes the container on exit.

**Use GitHub Container Registry (ghcr.io)** for open-source MCP servers — seamless GitHub Actions integration, unlimited free public images. Use Docker Hub only if you want Docker MCP Toolkit catalog listing.

### 6.4 Streamable HTTP transport

SSE is **officially deprecated** as of MCP spec version 2025-03-26. Streamable HTTP uses a **single endpoint** (`/mcp`) for both POST and GET, with optional SSE streaming within responses. As of March 2026, **all major MCP clients support it**: Claude Desktop (via Connectors), Claude Code, VS Code, Cursor, Windsurf, JetBrains, OpenAI Responses API, and Vercel AI SDK.

**Dual transport implementation** (stdio default, HTTP optional):

```typescript
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

const server = new McpServer({ name: "dadata-mcp", version: "2.0.0" });
// ... register all 27 tools ...

const transport = process.argv.includes("--http")
  ? await startHttpTransport(server)
  : new StdioServerTransport();

await server.connect(transport);
```

For the HTTP path, use `@modelcontextprotocol/express` middleware which handles session management, Host header validation, and DNS rebinding protection automatically.

### 6.5 Belarus and Kazakhstan — low effort, clear value

DaData provides `suggest/party_by` (Belarus, by UNP) and `suggest/party_kz` (Kazakhstan, by BIN) using the **same auth header** as Russian endpoints — no additional keys needed. The Laravel DaData SDK and Composio's MCP integration already advertise CIS support as a feature, confirming market demand. Adding 4 tools (suggest + findById for each country) is a half-day of work that expands your addressable market to the entire CIS region. **Include in v2**.

---

## PART 7: Brand scaling

### 7.1 Next MCP servers — priority order

**Critical positioning note**: DaData's official MCP server exists with 4 tools. For future Russian service servers, check whether the service itself has already built an MCP server before investing development time.

| Priority | Service | Why | Complexity | Est. time | Partner program |
|----------|---------|-----|-----------|-----------|-----------------|
| 1 | **МойСклад** | Best partner program (up to 50%), 700K users, app marketplace revenue path | Medium-High | 2–3 days | ✅ Up to 50% discount-based |
| 2 | **ЮKassa** | Critical e-commerce infrastructure, platform partner API with OAuth | Medium | 1–2 days | ✅ Platform partner program |
| 3 | **Ozon Seller** | Massive seller base, app marketplace | High | 3–4 days | ✅ App marketplace |
| 4 | **hh.ru** | Huge user base, clear AI use cases (job search automation) | Medium | 1–2 days | ✅ Partner program for >10M₽/year |
| 5 | **СДЭК** | Complements e-commerce stack | Medium | 1–2 days | Via ApiShip aggregator |

**МойСклад is the highest-value next target**: their partner program allows up to 50% revenue, they have 700K+ users, an active app marketplace where solo developers earn sustainably, and the inventory/trade management domain is highly amenable to AI agent automation ("check stock levels", "create orders", "generate reports").

### 7.2 Monorepo under @metarebalance

Use a **Turborepo + pnpm monorepo** with all packages under the `@metarebalance` scope:

```
@metarebalance/
├── packages/
│   ├── mcp-core/          # Shared framework
│   ├── dadata-mcp/
│   ├── moysklad-mcp/
│   ├── yookassa-mcp/
│   ├── hh-mcp/
│   ├── ozon-mcp/
│   └── cdek-mcp/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**@metarebalance/mcp-core would contain**: MCP server initialization boilerplate, API key management utilities, rate limiting, shared error handling and response formatting, TTL cache implementation, INN/KPP/BIN validation helpers, and testing utilities for MCP tool testing.

The DaData MCP architecture is **highly reusable** — the pattern of "wrap REST API endpoints as MCP tools with Zod schemas" transfers directly to every Russian service API. The main variable is the API's complexity and authentication model.

**Naming convention**: `@metarebalance/[service]-mcp` — consistent, predictable, discoverable via `npm search @metarebalance`.

### 7.3 GitHub organization

**Create a `metarebalance` GitHub organization**. Benefits: team management for future contributors, org-level settings, professional appearance, and alignment with the npm scope. The monorepo lives at `metarebalance/mcp-servers` (or separate repos per server — monorepo is recommended for shared code).

Pattern from ecosystem: `modelcontextprotocol/servers`, `github/github-mcp-server`, `apify/apify-mcp-server` — all org-scoped.

---

## PART 8: Monetization

### 8.1 Referral programs across Russian services

| Service | Referral/Partner program | Commission model |
|---------|------------------------|-----------------|
| **DaData** | ✅ 30% of all purchases, quarterly, ongoing | Revenue share |
| **МойСклад** | ✅ Up to 50% discount-based, app marketplace | Revenue share + app sales |
| **ЮKassa** | ✅ Platform partner program | Commission on transactions |
| **hh.ru** | ✅ Partner verification for >10M₽/year | Revenue share |
| **Ozon** | ✅ App marketplace | Seller subscriptions |
| **СДЭК** | Partial — via ApiShip aggregator | Integration referral |

**DaData referral revenue at scale**: At 1,000 referred users on the mid-tier plan (28,000₽/year), quarterly payouts total **8.4M₽/year (~$84K)**. Even at 100 users, that's **840K₽/year** — meaningful passive income.

### 8.2 Hosted MCP via MCPize and Apify

**MCPize** (mcpize.com): **85% to creator / 15% platform fee**. Supports subscription, usage tiers, or one-off licenses. Stripe Connect payouts. Deploy with `mcpize deploy`. Good for subscription-based model ($10-20/month for premium features).

**Apify** (apify.com/mcp/developers): **80% to creator / 20% platform fee**. Pay-per-event model — charge per tool request (e.g., $0.05 per call). 130K+ monthly signups on Apify. Paid $596K to creators by December 2025. Template: `apify create my-actor -t ts-mcp-proxy`.

**Revenue on MCPize/Apify**: At $10/month subscription with 85% share on MCPize, 100 subscribers = **$850/month = $10,200/year**. At $0.01/call on Apify, 1,000 users × 100 calls/month = **$850/month**. Both platforms are worth listing on simultaneously.

### 8.3 Premium features for open-core model

The open-source server remains free. Premium differentiators:

- **Persistent cross-session cache** — Redis-backed cache that survives restarts, shared across instances
- **Batch operations** — process hundreds of addresses/companies in a single tool call
- **Composite tools** (validate_counterparty, enrich_lead, smart_address_resolve) — only in hosted/premium
- **Analytics dashboard** — usage tracking, API cost monitoring, error rates
- **Priority support** — direct access to the developer via dedicated channel
- **Higher rate limits** — bypass DaData's 30 req/sec limit with smart queuing

The market reference: **21st.dev** hit **$10K MRR in 6 weeks** with a freemium MCP server (free first 5 requests → $20/month). This model works.

### 8.4 Consulting is immediately viable

The demand signals are strong: **82% of Russian companies plan to implement AI agents within 1-3 years**, 39% already use them, and the Russian AI consulting market is approximately **42.6 billion₽**. "Help integrate DaData into your AI workflow" is a viable consulting offer at **50,000–150,000₽ per project** for SMB clients.

The MCP server itself is the **lead generation funnel** — companies discover it, try it, realize they need custom integration, and hire you. Position this in the Habr article: "Need help building an AI agent that uses DaData? Contact me."

---

## Competitive positioning against DaData's official server

This is the single most important strategic consideration. DaData's official MCP server at `mcp.dadata.ru` is a **hosted Streamable HTTP server with 4 tools**. Your server has **27 tools with stdio transport**. Frame the positioning clearly:

**Official server strengths**: Zero setup (hosted), maintained by DaData team, native Streamable HTTP, direct company trust.

**Your server strengths**: **6.75x more tools** (27 vs 4), covers the complete API surface including suggestions, cleaning, geocoding, profile, and reference endpoints that the official server lacks. Local-first architecture (no data leaves the user's machine except to DaData's API). Open-source transparency (auditable). Works with any MCP client via stdio. **99 tests and 10/10 security audit** — institutional quality.

In the README, acknowledge the official server honestly and position yours as the "Complete Edition":

> *DaData offers [an official hosted MCP server](https://dadata.ru/mcp/) with 4 core tools (clean_address, find_party, find_by_domain, find_by_email). This package provides access to **all 27 DaData API endpoints** — including address suggestions, geocoding, bank lookups, phone/email/passport validation, and more — running locally in your environment with full transparency.*

This honest framing builds trust and clearly communicates your value. **Do not hide the official server's existence** — developers will find it immediately, and concealing it destroys credibility.

---

## Immediate action sequence

Execute in this order over the first 2 weeks:

1. **Day 1**: Finalize package.json, add shebang, test with MCP Inspector, `npm publish --access public --provenance`
2. **Day 1**: Set up OIDC Trusted Publishing on npm, GitHub Actions workflow
3. **Day 2**: Rewrite README (English primary + README.ru.md), record demo GIF with ScreenToGif
4. **Day 2-3**: Submit to Glama.ai, Smithery.ai, NeuralDeep.ru, awesome-mcp-servers PR
5. **Day 3-4**: Submit to mcp.so, PulseMCP, MCP.directory, mcpservers.org, Official MCP Registry
6. **Day 4-5**: Write and publish Habr article (tutorial format, target hubs: ИИ + Программирование + API)
7. **Day 5-6**: Contact HFLabs/DaData about cross-promotion and referral program enrollment
8. **Day 6-7**: Share on Telegram channels, Reddit (r/mcp, r/ClaudeAI), dev.to cross-post
9. **Week 2**: ProductHunt launch (Tuesday), VC.ru business-angle article
10. **Week 2-3**: Begin v2 development (composite tools, caching, Docker, Belarus/Kazakhstan)

The Russian MCP ecosystem is a wide-open field. With 27 tools, 99 tests, and a security audit score of 10/10, @metarebalance/dadata-mcp has the quality foundation to become the reference implementation for Russian service MCP servers. The combination of referral revenue, hosted MCP platforms, and consulting creates a sustainable business model from day one.