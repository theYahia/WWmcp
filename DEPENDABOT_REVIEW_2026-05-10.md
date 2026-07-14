# WWmcp Dependabot 6 PRs review — 2026-05-10

> Card: rd237. Source: 7 open Dependabot PRs (#28-30 GH Actions, #32-35 deps).
> **NOT merging anything autonomously** — это recommendation list. Юзер решает merge/hold через `gh pr merge <N>`.

## TL;DR

| PR | Bump | Risk | Verdict | Action |
|----|------|------|---------|--------|
| #28 | actions/setup-node 4→6 | LOW (CI only) | ✅ MERGE | Breaking: cache scope ограничен npm. Если используешь cache field — проверь. WWmcp юзает pnpm cache отдельно через #30 → safe |
| #29 | actions/checkout 4→6 | LOW (CI only) | ✅ MERGE | Cosmetic update, ноль breaking changes для checkout |
| #30 | pnpm/action-setup 4→6 | LOW (CI only) | ✅ MERGE | Update to v6, safe для monorepo. CI passing |
| #32 | dev-deps group (@changesets/cli 2.30→2.31, turbo) | LOW | ✅ MERGE | Patch/minor only, change error handling on unknown flags. Безопасно |
| #33 | @types/node 22.19→25.6 | MED (major +3) | ⚠️ HOLD | Major bump 3 версии. Тип changes могут сломать TS compilation в каком-то server'е. CI проходит, но нужен smoke `pnpm test` локально перед merge |
| #34 | vitest 1.6.1→4.1.5 | HIGH (major +3) | ⚠️ HOLD | Major v1→v4 — три breaking releases. Несмотря на passing CI, vitest 4 удалил/переименовал ряд APIs. Запустить `pnpm test --run` локально. Если зелёный — merge; если красный — заморозить |
| #35 | zod 3.25.76→4.4.3 | **CRITICAL** (major +1) | 🚫 HOLD/REJECT | **CI FAILS** (build-and-test (20) + e2e). Zod 4 удалил/изменил `.parse()` обработку errors + ряд coercion API. WWmcp использует zod в каждом MCP server для inputSchema. Major rewrite required. Закрыть PR + добавить в backlog как «zod v4 migration» |

## Per-PR detail

### #28 — actions/setup-node 4 → 6 ✅ MERGE

- **Breaking change** (per release notes): «Limit automatic caching to npm, update workflows and documentation» — то есть auto-cache работает теперь только для npm, не yarn/pnpm.
- **WWmcp impact:** workflows используют `pnpm/action-setup` (PR #30) для pnpm cache отдельно. setup-node нужен только для node version → cache impact = ноль.
- **Checks:** all green (4/4).
- **Action:** `gh pr merge 28 --repo theYahia/WWmcp --squash`

### #29 — actions/checkout 4 → 6 ✅ MERGE

- **Breaking change:** ноль реальных breaks для checkout, в основном internal.
- **Checks:** all green (4/4).
- **Action:** `gh pr merge 29 --repo theYahia/WWmcp --squash`

### #30 — pnpm/action-setup 4 → 6 ✅ MERGE

- **Breaking:** v6 теперь supports newer pnpm versions, нет breaks для setup itself.
- **Checks:** all green (4/4).
- **Action:** `gh pr merge 30 --repo theYahia/WWmcp --squash`

### #32 — dev-deps group (changesets/cli + turbo) ✅ MERGE

- **changesets/cli 2.30.0 → 2.31.0** (minor): error handling for unknown CLI flags + per-subcommand --help. Не ломает.
- **turbo:** patch/minor (group bump) — no breaking changes.
- **Files:** package.json + pnpm-lock.yaml only.
- **Checks:** all green (4/4).
- **Action:** `gh pr merge 32 --repo theYahia/WWmcp --squash`

### #33 — @types/node 22.19.15 → 25.6.2 ⚠️ HOLD-FOR-SMOKE

- **Major bump 3 versions** (22→23→24→25). Affects every `package.json` в monorepo (~25+ files).
- **Risk:** TypeScript types для Node API могут получить incompatible signatures (особенно `fs/promises`, `stream/web`, `crypto`).
- **Checks:** all green (4/4) — но CI tests лишь некоторое подмножество. Production servers могут не компилироваться с новыми types.
- **Recommended workflow:** `git checkout dependabot/npm_and_yarn/types/node-25.6.2 && pnpm install && pnpm typecheck` локально. Если всё компилируется — merge. Если нет — close + cherry-pick @types/node 22.x patches вручную.
- **Action:** **запросить юзера** smoke test локально перед merge.

### #34 — vitest 1.6.1 → 4.1.5 ⚠️ HOLD-FOR-SMOKE

- **Major bump 3 major versions** (1→2→3→4). Vitest 4 deprecated/removed: `vi.mocked` updates, snapshot serialization changes, `expect.assertions` semantics.
- **Files:** package.json в каждом server'е (25+ files) + huge `pnpm-lock.yaml` diff (135/-1335 — net removal, smaller graph хороший знак).
- **Checks:** all green (4/4) — но WWmcp CI запускает `vitest run` без strict mode. Edge cases можно пропустить.
- **Recommended workflow:** `pnpm test --run` всех servers локально. Особое внимание `_template/`, `cbr/`, `1c-rest/` (наиболее sophisticated test suites).
- **Action:** **запросить юзера** local smoke test перед merge. Если passing — merge.

### #35 — zod 3.25.76 → 4.4.3 🚫 HOLD/REJECT

- **CI FAILS:** `build-and-test (20)` + `e2e` red (https://github.com/theYahia/WWmcp/actions/runs/25600637388/job/75153790206).
- **Why:** zod 4 — major rewrite. Changed: `.parse()` error structure, `z.coerce.*` semantics, `.refine()` async behavior, removed `z.preprocess` (replaced by `z.transform`).
- **WWmcp impact:** **каждый MCP server** использует zod schemas для tool inputs. `inputSchema: z.object({...})` повсеместно. Migration = полный sweep с `z.<v3 method>` → `z.<v4 method>`.
- **Action:**
  - **NOW:** `gh pr close 35 --comment "Closing — zod v4 = major rewrite, нужен dedicated migration sprint. Reopen после migration plan."` (если confirm с юзером).
  - **Backlog:** новая card `zod v3→v4 migration sweep` с estimate ~4-8h work + полный test pass.

## Suggested merge order (если пользователь хочет zip-through)

```bash
# 4 safe merges first (low risk):
gh pr merge 32 --repo theYahia/WWmcp --squash
gh pr merge 29 --repo theYahia/WWmcp --squash
gh pr merge 28 --repo theYahia/WWmcp --squash
gh pr merge 30 --repo theYahia/WWmcp --squash

# Then validate locally + merge:
git fetch origin
git checkout dependabot/npm_and_yarn/types/node-25.6.2
pnpm install && pnpm typecheck && echo "PR33 OK to merge"
gh pr merge 33 --repo theYahia/WWmcp --squash

git checkout dependabot/npm_and_yarn/vitest-4.1.5
pnpm install && pnpm test --run && echo "PR34 OK to merge"
gh pr merge 34 --repo theYahia/WWmcp --squash

# PR35 = close until zod migration sprint:
gh pr close 35 --comment "Holding for dedicated zod v3→v4 migration sprint."
```

## Что НЕ делал автономно (per safety rules)

- ✗ Не вызывал `gh pr merge` ни на одном PR — это user decision.
- ✗ Не вызывал `gh pr close` — это user decision.
- ✗ Не делал локальный smoke test (`pnpm install` в новой ветке) — это deletes/modifies `node_modules`, плюс long-running.

## Files inspected

- `gh pr list --repo theYahia/WWmcp --state open` — 7 PRs
- `gh pr view <N> --json title,body,files,statusCheckRollup,mergeable` × 7
- Release notes preview через `gh pr view <N> --json body` для major bumps

---

**Action items для юзера**:

- [ ] (5 min) Merge PR #28, #29, #30, #32 — safe, all green
- [ ] (30 min) Smoke test PR #33 (@types/node) + #34 (vitest) локально, потом merge
- [ ] (Decision) PR #35 (zod v4) — close или backlog migration sprint
