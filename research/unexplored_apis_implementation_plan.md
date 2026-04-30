# Implementation Plan — Top 10 Unexplored MCP Servers

**Date:** 2026-04-22
**Source:** `unexplored_apis_brave_synthesis.md` (18-query Brave sweep, 251KB raw data)
**Predecessor work:** 7 starred servers v2.0.0 wave (1c-rest, vk-ads, salla, ileti-merkezi, 2gis, megaplan, wildberries) — все production-grade
**Canonical scaffolding:** `servers/_template/` + `@theyahia/mcp-core` + Turborepo workspace

---

## 🎯 Top 10 build queue (the goal)

| # | Server | Country | Phase | Quick Win? | Effort | Auth |
|---|--------|---------|-------|------------|--------|------|
| 1 | `@theyahia/mercadopago-mcp` | AR + BR/MX/UY | 1 | ✅ | 1.5d | Bearer (`ApiKeyStrategy`) |
| 2 | `@theyahia/bkash-mcp` | BD | 1 | ✅ | 2d | Custom 3-step token |
| 3 | `@theyahia/chapa-mcp` | ET | 1 | ✅ | 1.5d | Bearer (`ApiKeyStrategy`) |
| 4 | `@theyahia/fawaterak-mcp` | EG | 1 | ✅ | 1.5d | Bearer (`ApiKeyStrategy`) |
| 5 | `@theyahia/orange-money-mcp` | SN + 10 W. African | 1 | ✅ | 2d | OAuth2 Client Creds |
| 6 | `@theyahia/paymob-mcp` | EG | 2 | — | 2d | Multi-step token |
| 7 | `@theyahia/mtn-momo-mcp` | GH + 16 African | 2 | — | 2.5d | Subscription key + Basic |
| 8 | `@theyahia/mercadolibre-mcp` | AR + BR/MX/UY | 2 | — | 2d | OAuth2 (same as MercadoPago) |
| 9 | `@theyahia/nagad-mcp` | BD | 2 | — | 2d (risk: 2.5) | RSA payload encryption |
| 10 | `@theyahia/paydunya-mcp` | SN/CI/ML | 2 | — | 1.5d | Bearer (`ApiKeyStrategy`) |

**Phase 1 (5 Quick Wins):** ~8.5 days, all confirmed via Brave (public docs URLs verified).
**Phase 2 (5 stretch):** ~10 days, complications with auth or partner onboarding.
**Total:** 18.5 days for all 10.

**Country expansion:** WWmcp goes from 22 → 28 covered countries (adds AR, BD, ET, SN, GH; deepens EG which was 0).

---

## TL;DR

**Goal:** Build 10 new production-grade MCP servers across 6 unexplored countries (Egypt, Argentina, Bangladesh, Ethiopia, Senegal, Ghana). All ranked by MCP value × auth simplicity from Brave-validated data.

**Effort estimate:** 18 working days for all 10 (8 days for first 5 Quick Wins, 10 days for next 5 + complications).

**Quick Win batch (Phase 1):** MercadoPago (AR), bKash (BD), Chapa (ET), Fawaterak (EG), Orange Money (SN). Each ~1.5–2 days. Public docs confirmed by Brave.

**Stretch batch (Phase 2):** Paymob (EG), MTN MoMo (GH), MercadoLibre marketplace (AR), Nagad (BD), PayDunya (SN). Each ~2–3 days due to OAuth2 dance, partner API complexity, or pan-regional surface.

**Strategic outcome:** WWmcp expands from 22 to **28+ countries**. Each new server unlocks an addressable population averaging 30–100M people, none of which have a Western SaaS substitute (this is the strategic moat).

---

## Phase 0 — Pre-build verification (MANDATORY before each server)

For every server below, the dev MUST execute Phase 0 before writing code. This avoids the trap we hit with wildberries (assumed JSON Schema → Zod via SDK; wasted 30 min on test failure).

**Per-server Phase 0 checklist (~30–60 min):**

1. **Open the Brave-surfaced docs URL in browser** (not WebFetch — actually scroll the docs).
2. **Identify the auth flow** explicitly:
   - API key Bearer? → `ApiKeyStrategy` from mcp-core.
   - HTTP Basic? → `BasicAuthStrategy`.
   - OAuth2 Client Credentials? → `OAuthStrategy`.
   - OAuth2 Password grant? → custom (use `MegaplanAuthStrategy` as template).
   - HMAC / signature? → custom (use `IletiHmacStrategy` as template).
   - mTLS / cert-based? → ❌ DEFER (not supported by current `AuthStrategy` contract).
3. **Identify base URL(s)** — is it single host (clean) or multi-host (use 2gis pattern: keep native client)?
4. **Identify rate limit policy** — is there special handling like Wildberries' 409 penalty? If so, write a custom limiter (use Wildberries' `RateLimiter` as template).
5. **Identify sandbox / staging** — most public APIs have one; document the env var to switch (e.g., `*_SANDBOX=true`).
6. **List 8–15 tools** — pick by use-case priority, not API surface size. Aim for ≥8 (production-grade criterion from `mcp-servers/CLAUDE.md`).
7. **Write 5–7 demo prompts** in Russian/English natural language — these go in README.

If Phase 0 reveals a blocker (cert auth, no public docs, partner-only), STOP and downgrade priority. Do not write speculative code.

---

## Phase 1 — Quick Win batch (5 servers, ~8 days)

These 5 have public docs visible in Brave results. Each follows the canonical template.

### 1.1 — `@theyahia/mercadopago-mcp` (Argentina + LATAM, ~1.5 days)

**Why first:** Highest combined score. Single dev portal serves AR/BR/MX/UY (4-country leverage). MercadoLibre HQ.

**Phase 0 deliverables:**
- Docs URL: https://www.mercadopago.com.ar/developers/es/docs (verified by Brave)
- Auth: OAuth2 access tokens (test + live) — `ApiKeyStrategy(token)` Bearer
- Base URL: `https://api.mercadopago.com`
- Sandbox: `MERCADOPAGO_SANDBOX=true` switches to test creds
- Tools (target 10): `create_payment`, `get_payment`, `refund_payment`, `list_payments`, `create_preference` (checkout), `get_preference`, `list_merchant_orders`, `get_merchant_order`, `create_payment_method` (card token), `get_account_balance`

**Build steps:**
```bash
mkdir -p servers/mercadopago/{src/tools,tests}
cp servers/_template/{package.json,tsconfig.json,src/index.ts,src/client.ts,src/server.ts} servers/mercadopago/
# Replace CHANGEME → mercadopago
# Implement client.ts using BaseHttpClient + ApiKeyStrategy(MERCADOPAGO_ACCESS_TOKEN)
# Implement 10 tools/*.ts following catalogs.ts pattern from 1c-rest
# Write tests/{client,server,tools}.test.ts
# Write README.md (cdek pattern), CHANGELOG.md (initial 1.0.0)
# Add changeset
```

**Env vars:** `MERCADOPAGO_ACCESS_TOKEN` (required), `MERCADOPAGO_SANDBOX` (optional)

**Verification:**
- `pnpm --filter @theyahia/mercadopago-mcp build && test` → green
- Stdio: `tools/list` returns 10 tools
- HTTP: `/health` shows `tools: 10`
- Live smoke (if user has MP test creds): create test payment → refund

**Estimated:** 1.5 days. Critical path: tool selection (don't bloat — pick the 10 most agentic).

---

### 1.2 — `@theyahia/bkash-mcp` (Bangladesh, ~2 days)

**Why second:** 70M+ users. **npm SDKs already exist** (`faiyaz032/bkash`, GatePay) — can be reference (NOT copy — implement from scratch via official docs to avoid license issues).

**Phase 0 deliverables:**
- Docs URL: developer.bka.sh (need to verify in Phase 0 — Brave surfaced GitHub topics not official docs)
- Auth: bKash uses **3-step token dance** (App Token → Grant Token → Refresh Token). Custom `BkashAuthStrategy` similar to `MegaplanAuthStrategy`.
- Base URL: `https://tokenized.pay.bka.sh/v1.2.0-beta` (sandbox) / `https://tokenized.pay.bka.sh/v1.2.0-beta` (live — different host)
- Tools (target 8): `create_payment`, `execute_payment`, `query_payment`, `search_transaction`, `refund_payment`, `query_refund`, `agreement_create`, `agreement_query` (for tokenized recurring)

**Custom auth detail:**
```ts
class BkashAuthStrategy implements AuthStrategy {
  // Step 1: POST /tokenized/checkout/token/grant with app_key + app_secret + username + password
  // Step 2: cache id_token (TTL ~1h)
  // Step 3: on 401, POST /tokenized/checkout/token/refresh with refresh_token
  // Add `Authorization: <id_token>` (no "Bearer" prefix per docs) + `X-APP-Key: <app_key>` headers
}
```

**Env vars:** `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`, `BKASH_SANDBOX` (optional)

**Verification:** sandbox creds available for free at developer.bka.sh registration. Run full payment lifecycle smoke.

**Estimated:** 2 days (custom auth strategy + sandbox dance).

---

### 1.3 — `@theyahia/chapa-mcp` (Ethiopia, ~1.5 days)

**Why third:** Brave confirmed chapa.co with modern marketing site = likely modern dev-friendly REST API. Ethiopia has 30M+ Telebirr users + growing online retail.

**Phase 0 deliverables:**
- Docs URL: developer.chapa.co (must verify in Phase 0)
- Auth: Bearer secret key — `ApiKeyStrategy(CHAPA_SECRET_KEY)`. Confirmed via competitor pattern (East African fintechs typically use Stripe-like API keys).
- Base URL: `https://api.chapa.co/v1`
- Tools (target 8): `initialize_transaction`, `verify_transaction`, `create_subaccount`, `list_banks`, `transfer`, `bulk_transfer`, `get_balance`, `webhook_validate`

**Env vars:** `CHAPA_SECRET_KEY`, `CHAPA_PUBLIC_KEY` (optional, for client-side)

**Verification:** Chapa offers free test mode. Run init → verify smoke.

**Estimated:** 1.5 days.

---

### 1.4 — `@theyahia/fawaterak-mcp` (Egypt, ~1.5 days)

**Why fourth:** ✅ Brave surfaced **public docs at fawaterak-api.readme.io** — readme.io is a developer-portal best-practice signal. Aggregator role = covers multiple Egyptian payment methods (Fawry, Vodafone Cash, Meeza, cards) in one server.

**Phase 0 deliverables:**
- Docs URL: https://fawaterak-api.readme.io/reference/payment-methods (verified by Brave)
- Auth: Bearer API key (assume — confirm in Phase 0)
- Base URL: `https://app.fawaterk.com/api/v2` (assume — confirm)
- Tools (target 10): `create_invoice`, `get_invoice`, `list_invoices`, `cancel_invoice`, `refund`, `get_payment_methods` (list active gateways), `create_customer`, `get_customer`, `list_customers`, `webhook_validate`

**Env vars:** `FAWATERAK_API_KEY`, `FAWATERAK_VENDOR_KEY`, `FAWATERAK_SANDBOX` (optional — they have a test environment)

**Verification:** sandbox accounts free.

**Estimated:** 1.5 days.

---

### 1.5 — `@theyahia/orange-money-mcp` (Senegal + Côte d'Ivoire + Mali + ..., ~2 days)

**Why fifth:** ✅ **Official Orange Developer portal** at developer.orange.com/apis/om-webpay (Brave-verified). Pan-Francophone West African coverage = 1 MCP unlocks ~10 countries. Strategic moat unmatched.

**Phase 0 deliverables:**
- Docs URL: https://developer.orange.com/apis/om-webpay
- Auth: OAuth2 Client Credentials with developer.orange.com app — **fits `OAuthStrategy` as-is**
- Base URL: `https://api.orange.com/orange-money-webpay/<country-code>/v1`
- Tools (target 8): `create_webpayment`, `get_payment_status`, `cashin`, `cashout`, `transfer`, `get_balance`, `get_country_list` (list of OM-active countries), `webhook_validate`

**Multi-country setup:** server reads `ORANGE_MONEY_COUNTRY` env (e.g., `sn`, `ci`, `ml`, `cm`, ...) and routes base URL accordingly.

**Env vars:** `ORANGE_MONEY_CLIENT_ID`, `ORANGE_MONEY_CLIENT_SECRET`, `ORANGE_MONEY_COUNTRY`, `ORANGE_MONEY_MERCHANT_KEY`

**Verification:** sandbox via developer.orange.com.

**Estimated:** 2 days (OAuth2 dance + multi-country routing).

---

## Phase 2 — Stretch batch (5 servers, ~10 days)

Higher complexity / partner API friction / multi-host.

### 2.1 — `@theyahia/paymob-mcp` (Egypt, ~2 days)

**Why:** Egypt's #2 gateway after Fawry. Brave surfaced GitHub repos suggesting multiple integrations exist (community signal).

**Risks:** Paymob's onboarding requires merchant verification (slower than Fawaterak self-serve). Auth involves multi-step (auth token → integration ID → order → payment key).

**Tools (target 8):** `auth_request`, `create_order`, `get_payment_key`, `pay_with_card`, `pay_with_wallet`, `get_transaction`, `refund_transaction`, `webhook_validate`

**Estimated:** 2 days.

---

### 2.2 — `@theyahia/mtn-momo-mcp` (Pan-African, ~2.5 days)

**Why:** MTN Mobile Money operates in 16 African countries (Ghana, Uganda, Rwanda, Cameroon, Côte d'Ivoire, Zambia, ...). Single MCP = pan-African leverage similar to Orange Money.

**Risks:** MTN MoMo Open API uses **subscription key + API user creation** dance. Sandbox-first model. ~3 days realistic.

**Tools (target 10, split by 4 product lines):**
- Collections (charge customers): `request_to_pay`, `get_payment_status`, `get_account_balance`
- Disbursements (pay out): `transfer`, `get_transfer_status`
- Remittance: `remit`, `get_remittance_status`
- Common: `validate_account_holder`, `get_account_info`, `get_user_info_token`

**Auth:** custom `MtnMomoAuthStrategy` (subscription key in `Ocp-Apim-Subscription-Key` header + Basic auth on `/token` endpoint to get Bearer)

**Estimated:** 2.5 days.

---

### 2.3 — `@theyahia/mercadolibre-mcp` (Argentina + LATAM, ~2 days)

**Why:** Sister to MercadoPago. Same OAuth2 dev portal. Marketplace + listings + orders.

**Tools (target 12):** `search_items`, `get_item`, `create_listing`, `update_listing`, `pause_listing`, `list_orders`, `get_order`, `ship_order`, `get_user_info`, `get_categories`, `get_currencies`, `get_seller_metrics`

**Estimated:** 2 days (mostly straightforward — same auth as MercadoPago).

---

### 2.4 — `@theyahia/nagad-mcp` (Bangladesh, ~2 days)

**Why:** #2 mobile money in BD. Sister-package to bKash. State-owned (Bangladesh Post Office) = stability signal.

**Risks:** Nagad uses RSA PKCS#1 encryption on payloads (not just headers) — significantly more complex than bKash's JWT-style flow. May need 2.5 days.

**Tools (target 8):** `initialize`, `complete`, `verify`, `refund`, `query_status`, `cancel`, `get_balance`, `webhook_validate`

**Estimated:** 2 days (risk: 2.5 if RSA encryption is per-request).

---

### 2.5 — `@theyahia/paydunya-mcp` (Pan-Francophone-Africa, ~1.5 days)

**Why:** Aggregator for Wave + Orange Money + multiple W. African MFS. **developers.paydunya.com confirmed by Brave**. Lower per-tool complexity (aggregator does the routing).

**Tools (target 8):** `create_invoice`, `get_invoice`, `confirm_invoice`, `cancel_invoice`, `list_payment_methods`, `softpay_orange_money`, `softpay_wave`, `get_balance`

**Estimated:** 1.5 days.

---

## Phase 3 — Validation, demo, promotion (~3 days, parallel to dev)

After Phase 1 ships (5 servers live on npm):

3.1. **mcp-skills integration (1 day)** — write 3 cross-server demo skills:
   - `bangladesh-checkout`: bKash + SSL Wireless SMS + Daraz BD search
   - `egypt-ecommerce`: Fawaterak + Paymob (after Phase 2) + Talabat ordering
   - `latam-marketplace`: MercadoPago + MercadoLibre listings (after Phase 2)
   - Add to `skills/` repo

3.2. **WWmcp meta-repo update (0.5 day)** — same workflow as Apr 22 PR:
   - Add 5 new entries to README sectioned by region
   - Update header: 114 → 119 servers
   - PR via feature branch (no direct main push — per safety rule)

3.3. **Habr post + Telegram (1 day)** — single Russian-language announcement:
   - Title: "10 новых MCP-серверов: открываем Африку, Латам и Бангладеш для AI-агентов"
   - Cover the strategic angle (non-Western APIs that Western SaaS doesn't reach)
   - Show 1 demo per region

3.4. **Smithery + Glama submissions (0.5 day)** — submit all 5 (then all 10) to public MCP registries.

---

## Phase 4 — Tier 3 follow-up Brave sweep (~0.5 day)

After Phase 1+2 ships, run a focused Brave sweep on:
- Armenia (Idram, Telcell, AmeriaBank)
- Azerbaijan (Kapital Bank, ABB, m10)
- Kyrgyzstan (MBANK, Optima)
- Mongolia (KhanBank, Golomt)
- Sri Lanka (FriMi, LANKAQR)
- Nepal (eSewa, Khalti)
- Cambodia (ABA Bank, Wing)
- Plus deeper dive on Tier 1 caveats: Vodafone Cash (Egypt), Telebirr (Ethiopia), AFIP (Argentina)

Brave query budget: 16 queries (~$0.05 cost).

Output: same synthesis pattern → next 8-server build queue.

---

## Per-server "Definition of Done"

A server is shippable to npm when ALL of these pass:

- [ ] `pnpm --filter @theyahia/{name}-mcp build` — TypeScript clean, dist/ created
- [ ] `pnpm --filter @theyahia/{name}-mcp test` — vitest green, ≥70% statement coverage on tools/
- [ ] **Stdio smoke**: `node dist/index.js` → `tools/list` returns expected count + valid Zod-derived schemas
- [ ] **HTTP smoke**: `HTTP_PORT=3000 node dist/index.js` → `/health` returns `{tools: N}` + `/mcp` initialize returns SSE response with `mcp-session-id` header
- [ ] **Live API smoke** (if sandbox creds available): dispatch 1–2 real tool calls → response is valid (not just shape — actual API semantics)
- [ ] README.md: 10-section cdek-style structure (header, Tools, Quick Start ×4 IDEs, Env Vars, Auth, Demo Prompts, Development, License). English only.
- [ ] CHANGELOG.md: `## 1.0.0 — 2026-XX-XX` with sections Added / Notes / Auth.
- [ ] smithery.yaml: configSchema with `required` + `properties`, `commandFunction`.
- [ ] `mcpName` field in package.json: `io.github.theYahia/{name}-mcp`.
- [ ] `keywords` includes country code (e.g., `egyptian-api`) and category (e.g., `payments`).
- [ ] Changeset added in `.changeset/{name}-v1.md` (initial bump = `minor` for new packages, not `major`).
- [ ] Server folder added to STRUCTURE.md count.

---

## Workspace integration & release flow

**After Phase 1 (5 new servers built):**

```bash
cd /d/Yahia/active/mcp-servers
pnpm install                    # link new workspace packages
pnpm turbo build                # 25/25 packages should build (12 prod + 7 v2 wave + 5 new + mcp-core)
pnpm turbo test --filter='!@theyahia/travelpayouts-mcp' --filter='!@theyahia/cdek-mcp'  # exclude E2E tests that hit live APIs
pnpm changeset version          # bumps all package.json + generates per-server CHANGELOG entries
git add . && git commit -m "feat: add 5 new MCP servers (Phase 1 quick wins)"
git push origin main            # ⚠️ Per safety rule: should be PR not direct push
```

**Release cadence:**
- After Phase 1: ship as one batch v1 release of 5 packages
- After Phase 2: ship as second batch v1 release of 5 packages
- 7 starred servers from Apr 22 wave: separate release with their major bumps (already pending in `.changeset/`)

**npm publish via release.yml:** push to main triggers changesets/action@v1 → creates "Version Packages" PR → merge that PR → triggers actual `pnpm release` (= `turbo build && changeset publish`).

---

## Risks & open questions

### Hard blockers (need clarification BEFORE dev starts)

1. **NPM_TOKEN secret**: assumed configured in WWmcp/mcp-servers GitHub repo settings (12 packages have published successfully). Verify with `gh secret list -R theYahia/mcp-servers` before Phase 1 ship.

2. **Sandbox creds availability**: 4 of 5 Quick Wins offer free self-serve sandbox. **bKash specifically** requires registering as developer at developer.bka.sh — may need user (theYahia) to create account before live smoke is possible. Ship without live smoke if blocked.

3. **AFIP (Argentina tax)** and **Vodafone Cash (Egypt)** — Brave failed to surface clear public dev portals. Both are deferred to Phase 4 with deeper research, NOT included in Phase 1+2.

### Soft risks (manageable)

4. **MTN MoMo subscription key flow** — slower onboarding than other servers. May discover it needs ~3 days not 2.5. Acceptable.

5. **Nagad RSA encryption** — if encryption is per-request payload (not just key exchange), ~2.5 days realistic. Mitigation: study existing PHP/Node SDKs in GitHub for Nagad before scoping.

6. **Brave-surfaced URLs may not be the real dev portal** — e.g., Brave gave us GitHub topics for bKash, not bka.sh's official docs. Phase 0 must always navigate from the company's main site → developer/API section.

### Open scoping questions for user

7. **Should `mercadolibre-mcp` cover all 4 LATAM countries (AR/BR/MX/UY) in one package, or split per-country?** Recommended: **one package**, country selected via `MERCADOLIBRE_SITE_ID` env var (e.g., `MLA`, `MLB`, `MLM`, `MLU`). Same auth, single server, multi-region.

8. **Should `orange-money-mcp` cover all ~10 Francophone African countries in one package?** Recommended: **yes, one package**, country via `ORANGE_MONEY_COUNTRY` env. Per-country deployments in production are common via env var, not separate packages.

9. **Wildberries' "tools.ts" JSON Schema → Zod migration** — was deferred to v2.1.0 in last wave. Should this be done before Phase 2 or after? Recommended: **after** — focus on shipping new APIs, not refactoring shipped ones.

---

## Timeline (calendar-aware)

| Day | Server | Status |
|-----|--------|--------|
| 1 | MercadoPago build + test + ship | 1.5d alloc |
| 2 | bKash build (custom auth) | 2d alloc |
| 3 | bKash test + ship + Chapa start | |
| 4 | Chapa finish + Fawaterak start | |
| 5 | Fawaterak finish | |
| 6 | Orange Money build (OAuth2 + multi-country) | 2d alloc |
| 7 | Orange Money finish + Phase 1 batch release | |
| 8 | Phase 1 verification + WWmcp PR + npm publish | |
| 9 | Paymob start | |
| 10 | Paymob finish + MTN MoMo start | |
| 11 | MTN MoMo (slow auth dance) | |
| 12 | MTN MoMo finish + MercadoLibre start | |
| 13 | MercadoLibre finish + Nagad start (RSA risk) | |
| 14 | Nagad | |
| 15 | Nagad finish + PayDunya start | |
| 16 | PayDunya finish + Phase 2 batch release | |
| 17 | mcp-skills + WWmcp PR + Habr post draft | |
| 18 | Habr publish + Smithery/Glama submissions + Phase 4 Brave sweep | |

**Calendar:** if started 2026-04-23 (Mon), Phase 1 ships ~Apr 30, full delivery ~May 12.

---

## Critical files (developer reference)

**Templates / examples to mirror:**
- `D:\Yahia\active\mcp-servers\servers\_template\` — copy as starting point
- `D:\Yahia\active\mcp-servers\servers\salla\src\client.ts` — Bearer + lazy class example (use for MercadoPago, Chapa, Fawaterak)
- `D:\Yahia\active\mcp-servers\servers\megaplan\src\client.ts` — Custom `MegaplanAuthStrategy` example (use for bKash, MTN MoMo)
- `D:\Yahia\active\mcp-servers\servers\ileti-merkezi\src\client.ts` — Custom HMAC `IletiHmacStrategy` (use as Nagad/RSA reference)
- `D:\Yahia\active\mcp-servers\servers\wildberries\src\rate-limiter.ts` — production rate limiter (reuse for any rate-limited API)
- `D:\Yahia\active\mcp-servers\servers\cdek\README.md` — canonical 10-section README (use as fill-in)

**Shared library (don't reimplement):**
- `D:\Yahia\active\mcp-servers\packages\core\src\index.ts` — public exports
- `D:\Yahia\active\mcp-servers\packages\core\src\auth\index.ts` — 5 auth strategies
- `D:\Yahia\active\mcp-servers\packages\core\src\server.ts:223` — `runServer(createServer, config)` signature

**Workspace / CI:**
- `D:\Yahia\active\mcp-servers\pnpm-workspace.yaml` — already includes `servers/*`, no edit needed
- `D:\Yahia\active\mcp-servers\.changeset\` — drop new `<name>-v1.md` per server
- `D:\Yahia\active\mcp-servers\.github\workflows\release.yml` — handles npm publish on main push

**Research outputs (audit trail):**
- `D:\Yahia\active\mcp-servers\research\unexplored_countries_mega_prompt.md`
- `D:\Yahia\active\mcp-servers\research\unexplored_apis_brave_synthesis.md`
- `D:\Yahia\active\mcp-servers\research\_raw_data\unexplored_apis_2026-04-22\` — 18 query JSONs + parsed_snippets.md

---

## Verification milestones

**End of Phase 1 (Day 8):**
- 5 new packages on npm: `@theyahia/{mercadopago,bkash,chapa,fawaterak,orange-money}-mcp@1.0.0`
- WWmcp README updated via PR (5 new entries + 22→25 country count)
- `pnpm turbo build` green for 25/25 packages
- All 5 individual `pnpm --filter ... test` green
- HTTP /health smoke for all 5 returns correct tool count

**End of Phase 2 (Day 16):**
- 10 new packages on npm total
- WWmcp updated again (now 30 packages added since Apr 22)
- Country count: 22 → 28 (added EG, AR, BD, ET, SN; deepened GH for MTN MoMo)
- mcp-skills repo gains 3 cross-server skills

**End of Phase 3 (Day 18):**
- Habr post live (target: front-page in /hub/programming or similar)
- Smithery + Glama listings live for all 10 new servers
- Phase 4 Brave sweep done → Tier 3 build queue identified

---

## What NOT to do (anti-patterns from previous waves)

1. **Don't write Zod schemas as raw JSON Schema and cast.** SDK 1.29 rejects it (caught in wildberries pilot). Either write proper `z.object({...}).shape` or use the `jsonPropToZod` converter from `servers/wildberries/src/server.ts`.

2. **Don't read env vars at module top-level.** Causes test imports to throw. Use lazy `getClient()` singleton (see `1c-rest/src/client.ts`).

3. **Don't run `runServer()` at module top-level in `index.ts` AND import from index.ts in tests.** Side-effects fire during vitest. Split into `server.ts` (factory exports) + `index.ts` (only `runServer` call).

4. **Don't push directly to WWmcp main branch.** Use feature branch + PR (per safety rule, even though it's the user's own repo).

5. **Don't add `express` only to consumer's deps.** It must be in `mcp-core`'s `optionalDependencies` for pnpm to symlink it into `packages/core/node_modules/`. Already fixed in Apr 22 wave; verify on each new server build.

6. **Don't bump initial new packages to v2.0.0.** New packages start at `1.0.0` — major bump only on breaking changes.

7. **Don't include 12+ tools per server when 8 cover the use case.** Quality over quantity. Cdek (16) and Moysklad (21) are exceptions, not the rule.

---

## Cost summary

| Item | Cost |
|------|------|
| Brave sweeps (3 phases × ~$0.05) | ~$0.15 |
| npm publish (free for public packages) | $0 |
| GitHub Actions runtime (10 min × 10 packages) | within free tier |
| Sandbox API accounts (all 10 free for testing) | $0 |
| Habr publication (free) | $0 |
| Smithery / Glama submission (free) | $0 |
| Developer time (18 days @ focused work) | the actual cost |

**Total monetary: ~$0.15. Total time: 18 working days.**

---

## Approval gate before execution

This is a multi-week build plan. Before kicking off Phase 1, confirm:

1. **Tier 1 priority order correct?** (MercadoPago → bKash → Chapa → Fawaterak → Orange Money). Or swap to country-clustering (Egypt: Fawaterak+Paymob first; Bangladesh: bKash+Nagad first; etc.)?
2. **Multi-country packaging confirmed?** (`mercadolibre-mcp` covers AR/BR/MX/UY; `orange-money-mcp` covers ~10 Francophone countries — both as single packages with env switching.)
3. **Wildberries Zod migration deferred?** (Recommended: yes, focus on new APIs.)
4. **Habr post in Russian?** (Audience for non-Western API expansion is RU/CIS dev community.)
5. **Phase 4 (Tier 3 sweep) deferred until after Phase 2 ships?** (Recommended: yes.)
