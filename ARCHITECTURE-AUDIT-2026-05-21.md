# Architecture Audit — WWmcp
Date: 2026-05-21
Auditor: Claude (Sonnet 4.6)
Scope: structural / isolation / trust-boundary audit. Read-only. Companion to `REVIEW-2026-05-21.md` (security findings).

---

## TL;DR

WWmcp is a **clean MCP server fleet** with strong structural hygiene: zero cross-server shared state, zero filesystem persistence, every credential scoped to its own process. The high-ROI fix is **wiring `sanitizeApiResponse` + `truncateResponse` into `withErrorHandling()` in `@theyahia/mcp-core/errors.ts`** — one edit, applies to all 22 servers, closes the dead-code finding from REVIEW.

Headline numbers (verified):
- 22 servers in `servers/` × **138 total tools** (count by `registerTool/server.tool/tool("` grep)
- 1 shared package actually consumed: `@theyahia/mcp-core` (3 packages exist; `telemetry` opt-in only, `create-mcp` is build-time scaffolder)
- 0 servers import `sanitizeApiResponse` — dead module, confirmed
- 0 cross-server shared state (no global `Map`/singleton in core, no `writeFile`/sqlite/redis anywhere in `servers/`)

---

## 1. `servers/` vs `pipeline/` — structural distinction

**CLAUDE.md describes** a `pipeline/` directory with 100+ servers in build queue, organised by category (ai/cis/comms/crm/data/finance/hr/logistics/marketing/payments). Per cmem 20964, `servers/` and `pipeline/` are separate purposes.

**Audit reality:** `pipeline/` does **not exist inside `D:/Yahia/active/wwmcps/WWmcp/`**. It lives **one level up** at `D:/Yahia/active/wwmcps/` (as separate `*-mcp/` repo directories: `ifood-mcp/`, `planfix-mcp/`, plus `batch{1,2,3,4,5}_*` reports, `quality-upgrade-2026-05-20/`, etc.). This matches the rule "Pipeline серверы — каждый = отдельный git repo" from CLAUDE.md line 45.

**Distinction:**

| Aspect | `servers/` (inside WWmcp) | `pipeline/` (outside, sibling repos) |
|---|---|---|
| Topology | Turborepo workspace, `pnpm-workspace.yaml` lists `servers/*` | Independent git repos under `D:/Yahia/active/wwmcps/` |
| Shared lib | `@theyahia/mcp-core` via `workspace:*` | Must `npm install @theyahia/mcp-core` from registry |
| Bar for promotion | "Production-grade": 8+ tools, dual transport, README + tests | Scaffold/draft quality; ranges from 1-3 tools to skeletons |
| Build coordination | Single `turbo build` | Each repo independent CI |
| Tool inventory | 22 servers, 138 tools (counted) | Unknown to this monorepo |

**Implication for refactor priorities:** any change to `@theyahia/mcp-core` (e.g. wiring sanitize into withErrorHandling) **must be released to npm** before pipeline repos can pick it up. In-tree `servers/` get it for free via workspace resolver, pipeline lags by one publish cycle. Mitigation: pin pipeline repos to `^x.y` once core API stabilises, ship core hotfixes as patch versions.

**Naming note for clarity:** "pipeline" in CLAUDE.md means "build queue of future servers", not a streaming/data-pipeline subsystem. No runtime coupling between `servers/` and `pipeline/`.

---

## 2. `@theyahia/mcp-core` — what gets shared, what stays per-server

**Module map** (`packages/core/src/`):

| File | Exports | Used by | Cross-server effect |
|---|---|---|---|
| `client.ts` | `BaseHttpClient`, `RateLimitedClient`, `TokenBucketLimiter`, `ApiError` | every server's `client.ts` | none — per-server instance |
| `errors.ts` | `createToolError`, `withErrorHandling`, `ErrorCategory` | all 22 servers (verified) | none — per-call closure |
| `auth/index.ts` | `ApiKeyStrategy`, `BasicAuthStrategy`, `OAuthStrategy`, `DualAuthStrategy`, `NoAuthStrategy` | every server (one strategy per process) | none — credentials live in env vars, scoped to OS process |
| `server.ts` | `runServer`, `startStdio`, `startHttp`, `ServerConfig`, `HttpServerConfig` | every server's `index.ts` | shares the **CORS-wildcard default bug** (REVIEW finding 3) and **session-management code path** (sessions are in-memory per-process, OK) |
| `logging.ts` | `createLogger` (stderr-only, masks `SENSITIVE_KEYS`) | every server | none |
| `format.ts` | `formatResponse`, `formatRUB/UZS/KZT`, `formatDate`, `formatNumber` | pure helpers | none |
| `sanitize.ts` | `sanitizeApiResponse`, `truncateResponse` | **ZERO servers** (dead) | n/a until wired |

**Sharing model:** library code, not runtime singleton. Each server `import`s classes from core and instantiates its own `BaseHttpClient`. No module-level mutable state in core (verified — no `export const` / `export let` mutable bindings found in `packages/core/src/`).

**Two genuine cross-server effects:**

1. **SDK version drift.** Most servers pin `@modelcontextprotocol/sdk: ^1.12.1`; `moysklad` is on `^1.29.0`. Mixed semver ranges plus pnpm hoisting can resolve to one or two SDK copies in the workspace store — fine at runtime (stdio is process-isolated) but a typecheck nuisance. Pin centrally via `pnpm.overrides` or a versions catalogue.
2. **Core API change blast radius.** Any signature change to `withErrorHandling` / `BaseHttpClient.request()` / `runServer()` ripples to all 22 servers + every pipeline repo on next publish. This is the price of consolidation; it's also why a single edit to wire sanitize is so valuable (Section 5).

---

## 3. Cross-server isolation — can one server affect another's state?

**Verdict: no.** Each MCP server is an independent OS process launched by the MCP host (Claude Desktop / Cursor / Windsurf). Isolation guarantees:

| Dimension | Result | Evidence |
|---|---|---|
| **Process** | One process per server, stdio piped to host | `runServer` → `startStdio` calls `process.exit(0)` on SIGTERM (server.ts:200), no orchestrator |
| **Filesystem** | No writes outside Node tmp/log | `grep -rEn "writeFile\|writeFileSync\|fs\.write\|fs\.append" servers/` → 0 matches |
| **State store** | None — no SQLite, no Redis, no LevelDB, no in-memory `Map` cache shared between calls | `grep -rE "sqlite\|leveldb\|redis\|global\." servers/` → 0 matches |
| **Credentials** | Per-server env-var namespace (e.g. `MOYSKLAD_*`, `AVITO_*`, `BITRIX24_WEBHOOK_URL`) | `.env.example` enumerates 11 distinct prefixes; each server reads only its own |
| **Auth tokens** | OAuth refresh tokens cached in-memory inside that one `OAuthStrategy` instance | `auth/index.ts:56-97` — `private token`, scope = single client instance |
| **HTTP server** | Each server binds its own port (default `HTTP_PORT=3000`); deploying two HTTP servers requires distinct ports per container | `server.ts:228-237` |
| **Logs** | All stderr, MCP host muxes streams; no shared sink | `logging.ts:84` |

**The only "shared" surface is the HTTP transport's session registry** (`server.ts:108` `const transports: Record<string, any> = {}`) — but that map is scoped to one `startHttp()` invocation, i.e. one server's process. There is no inter-process session table.

**Risk that does cross processes:** if `.env` is loaded with `dotenv` at a shared parent path, a misconfigured server could *read* another server's secrets. None of the servers ship a `dotenv` import — credentials are read directly from `process.env`. The MCP host or systemd unit is responsible for env isolation; that's correct security model.

**One subtle leak vector** (not a finding, an observation): the **CORS wildcard in HTTP mode** (REVIEW finding 3) means if two servers run on the same host with different ports, a malicious local web page can hit both via cross-origin requests. This is a per-server defect that aggregates badly when multiple HTTP-mode servers run on one box.

---

## 4. Tool surface map — credentialled vs pure-compute

Classification by what each server's tools do with credentials:

### 4.1 Credentialled write surface (PII / money / data mutation)

These tools accept secrets via env and can mutate external systems. Highest blast radius.

| Server | Tool count | Auth | Notable write-capable tools |
|---|---|---|---|
| `1c-rest` | 9 | Basic (ERP creds) | `handleCreateDocument`, `handleGetReport` (SSRF carrier — REVIEW finding 1) |
| `bitrix24` | 4 | webhook URL embeds auth | CRM contacts/deals/tasks CRUD |
| `moysklad` | 10 | Bearer/Basic | orders/products/counterparties/supply (full ERP CRUD) |
| `salla` | 9 | Bearer | `create-product`, `update-product`, `update-order-status` |
| `cloudpayments` | 6 | Basic (public_id:api_secret) | payments |
| `bkash` | 8 | sandbox/prod toggle | payment intents |
| `payme` | 2 | X-Auth header | payment ops |
| `robokassa` | 2 | MD5 signature | payment confirmation |
| `chapa` | 8 | Bearer | Ethiopian payments |
| `fawaterak` | 8 | API key | Egyptian payments |
| `mercadopago` | 10 | access token | LatAm payments |
| `orange-money` | 8 | OAuth | African mobile money |
| `avito` | 3 | OAuth | listings + chats (read-only today, but token has write scope) |
| `vk-ads` | 8 | bearer | ad campaign mgmt |
| `getcourse` | 3 | API key in query | LMS data |
| `megaplan` | 8 | per-domain | CRM |
| `ileti-merkezi` | 8 | API key | SMS sending (cost exposure) |

**Total credentialled tools: ~114 of 138 (~83%)**. The SSRF in 1c-rest is the worst exposure because Basic auth credentials get attached to any URL passed in (REVIEW finding 1).

### 4.2 Public-data / pure-compute surface

These hit unauthenticated public APIs. Lower risk — no creds to leak, but prompt-injection risk via response content is identical.

| Server | Tools | Auth | Risk profile |
|---|---|---|---|
| `cbr` | 5 | none | Russian Central Bank exchange rates (public JSON) |
| `cbu` | 5 | none | Uzbek Central Bank rates |
| `2gis` | 8 | API key in query (free tier) | local search, low-sensitivity |
| `yandex-search` | 3 | API key (Cloud Yandex) | search results — **prompt injection vector**, content from arbitrary websites |
| `wildberries` | 1 | seller key | marketplace listings |

**Yandex-search is the highest prompt-injection risk** despite being "lower" tier — search results return attacker-controlled text from random web pages. Avito chats are second (user-typed). 1c-rest reports are third (1C report bodies). All three should run through `sanitizeApiResponse` before reaching the LLM. This dovetails into Section 5.

### 4.3 Tools by external-API verb (where `BaseHttpClient` actually hits the wire)

Every credentialled call routes through `BaseHttpClient.request()` in `packages/core/src/client.ts`. **That is the single chokepoint** for outbound HTTP — auditing it is a 1:1 audit of all 22 servers' egress. Two things sit on that chokepoint:
- `opts.path.startsWith("http")` bypass (client.ts:85) — the SSRF root cause
- `JSON.parse(text)` of response body before returning to caller (client.ts:114) — the prompt-injection delivery vehicle

---

## 5. Refactor priorities — highest ROI single edit

### Priority 1 — wire `sanitizeApiResponse` + `truncateResponse` into `withErrorHandling` (or its sibling)

**Why this is the single best move:**

- `withErrorHandling` is already adopted by **all 22 servers** (`grep` confirmed: every `src/index.ts` or `src/server.ts` imports it).
- It's already the canonical "wrap your tool handler" entry point — the natural place for cross-cutting policy.
- One edit in `packages/core/src/errors.ts` (~5 lines) closes REVIEW finding 2 globally.
- No per-server PRs needed; next `pnpm publish` propagates.

**Sketch** (`errors.ts`, post-edit):

```ts
import { sanitizeApiResponse, truncateResponse } from "./sanitize.js";

export function withErrorHandling<T>(
  handler: (params: T) => Promise<CallToolResult>,
): (params: T) => Promise<CallToolResult> {
  return async (params: T): Promise<CallToolResult> => {
    try {
      const result = await handler(params);
      // Sanitize every text content block before returning to MCP host
      if (result.content) {
        for (const block of result.content) {
          if (block.type === "text" && typeof block.text === "string") {
            block.text = truncateResponse(sanitizeApiResponse(block.text));
          }
        }
      }
      return result;
    } catch (error) {
      return createToolError(error);
    }
  };
}
```

**Caveats to design around:**
- `sanitizeApiResponse` currently replaces patterns with `[filtered]` — verify this doesn't corrupt CRM data the user *wanted* to read (e.g. a legit Bitrix24 note about a previous CRM project named "System: New customers"). Consider an env-var escape hatch `MCP_DISABLE_SANITIZE=true` for trusted-API servers (cbr/cbu — pure rate data, no user input).
- `truncateResponse` default 50k chars — confirm none of the 1c-rest OData queries legitimately need more (today they return raw `JSON.stringify` which can blow past that). Add a per-server config knob.
- Some servers may want **structured** content (`type: "resource"`, `type: "image"`) — only mutate `type === "text"`, which the sketch already does.

### Priority 2 — fix the SSRF properly at the chokepoint (REVIEW finding 1)

Remove or restrict the `opts.path.startsWith("http")` bypass in `BaseHttpClient.request()` (client.ts:85). Options:
- (a) **Remove** the bypass entirely; force `path` to be relative. Breaks any tool that legitimately passes absolute URLs (none audited, but verify).
- (b) **Keep** but validate the absolute URL has the same origin as `this.baseUrl`. One-line `new URL(opts.path).origin === new URL(this.baseUrl).origin` guard.
- (c) Combine with a `report_url`-level Zod refinement in `1c-rest/src/tools/reports.ts` that requires `/` prefix and rejects `//` (protocol-relative).

(b) at the core level + (c) at the tool level = defence in depth. SSRF stops being possible regardless of which tool's input is unsanitised.

### Priority 3 — make CORS default safe (REVIEW finding 3)

Change `corsOrigins ?? ["*"]` in `server.ts:82` to `corsOrigins ?? []` (deny-all) and require servers to opt in. Or upgrade to `cors` middleware with proper preflight handling. Single edit, no per-server changes needed (no server currently passes `corsOrigins`).

### Priority 4 — pin MCP SDK version centrally

Add `pnpm.overrides` in root `package.json` to pin `@modelcontextprotocol/sdk` to one minor version across the workspace. Resolves the 1.12 vs 1.29 drift between moysklad and the others without touching 22 `package.json` files.

### Priority 5 — block CI on security audit (REVIEW finding 4)

Remove `continue-on-error: true` from `.github/workflows/ci.yml:47`. If existing vulnerabilities need triage, switch threshold to `--audit-level=critical` temporarily rather than silencing.

---

## 6. Healthy invariants to preserve

- Process isolation is real — no global state, no filesystem, no cross-server DB. Adding any would be a regression.
- `createLogger` masks `SENSITIVE_KEYS` and writes stderr-only (protects stdio JSON-RPC).
- `OAuthStrategy` deduplicates concurrent refresh; `BasicAuthStrategy` pre-encodes — pattern scales to pipeline repos.
- Lazy client init (`1c-rest/src/client.ts:46-50`) defers env errors to first request — keeps `_template/` smooth.
- Telemetry is opt-in, no IP, no user ID, 90-day aggregate (`packages/telemetry/PRIVACY.md`).

---

## 7. Open questions

1. Pure-compute servers (cbr/cbu) returning numeric JSON — sanitize on by default is a no-op, leave it on (zero false-positive risk).
2. Pipeline → `servers/` promotion gate should add "uses `@theyahia/mcp-core@>=POST_FIX_VERSION`" once Priority 1+2 land.
3. Dockerfile defaults to HTTP mode (`CMD ["node", "dist/index.js", "--http"]`). If exposed beyond localhost, CORS fix (Priority 3) is mandatory.
4. Verify `https://telemetry.wwmcp.dev/v1/ping` domain is registered — squatting risk if opt-in users hit unowned host.

---

## Files referenced

- `packages/core/src/client.ts` — SSRF bypass line 85, JSON parse line 114
- `packages/core/src/errors.ts` — wire sanitize into `withErrorHandling` line 153
- `packages/core/src/sanitize.ts` — currently dead
- `packages/core/src/server.ts` — CORS default line 82, session map line 108
- `packages/core/src/auth/index.ts` — 5 strategies, OAuth dedup lines 87-96
- `servers/1c-rest/src/tools/reports.ts` + `servers/1c-rest/src/client.ts` — SSRF carrier
- `.env.example` — credential namespace inventory (11 prefixes)
- `REVIEW-2026-05-21.md` — companion security findings
- `CLAUDE.md` lines 11-22 — `servers/` vs `pipeline/` distinction
