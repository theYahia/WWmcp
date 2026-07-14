# Glama submission — 3-track action texts 2026-05-10

> Card: rd235. Companion к existing `GLAMA_SUBMISSION_PACKAGE.md` (355 lines deep dive).
> **This file:** ready-to-paste support ticket + per-track checklist + concrete commands.
> Total time для всех 3 tracks: **~2.5 ч (Track B самый длинный)**.

## TL;DR

| Track | Action | Time | ROI |
|-------|--------|------|-----|
| **A** | Support ticket для Glama backfill `io.github.theYahia/*` namespace | **5 мин** | 49 listings unlocked |
| **C** | Drop `glama.json` в 4 repos для claim ownership | **8 мин** | 5 servers verified-maintainer badge |
| **B** | Batch publish 67 серверов в MCP Registry | **~2 ч** | +67 listings (через ingestion) |

**Recommended order:** A first (highest ROI per minute), then C (low effort), then B (largest payoff but more work).

---

## Track A — Glama support ticket (READY-TO-PASTE, 5 мин)

### Where to submit

**Primary:** https://glama.ai/support — contact form
**Backup:** https://github.com/punkpeye/glama-issues — open issue
**Backup:** Glama Discord (link на glama.ai footer)

### Subject

```
Backfill request for io.github.theYahia/* namespace (49 servers)
```

### Body (paste verbatim)

```
Hi Glama team,

I'm theYahia (https://github.com/theYahia, https://glama.ai/mcp/servers/theYahia).

I've published 49 MCP servers to the official MCP Registry (registry.modelcontextprotocol.io) under the `io.github.theYahia/*` namespace, but only 4-5 are currently visible on glama.ai/mcp/servers/theYahia. The rest seem to be behind ingestion lag.

Could you trigger a backfill ingestion for the entire `io.github.theYahia/*` namespace?

Full list (49 servers, 200+ tools across them):
https://registry.modelcontextprotocol.io/v0/servers?search=theyahia&limit=100

Highlights worth visibility:
- yookassa-mcp, tkassa-mcp, cloudpayments-mcp, robokassa-mcp — 4 first-of-kind Russian payment MCPs
- moysklad-mcp (21 tools), bitrix24-mcp (12 tools), retailcrm-mcp (15 tools) — Russia CRM
- cdek-mcp, boxberry-mcp, pochta-russia-mcp, delovye-linii-mcp — Russia logistics
- gigachat-mcp, yandexgpt-mcp, salutespeech-mcp — Russia AI
- yandex-direct-mcp, yandex-metrika-mcp, vk-ads-mcp — Russia marketing
- dadata-mcp (31 tools — most-tooled MCP in CIS bucket)
- kaspi-mcp (Kazakhstan), qsearch (multi-engine search)

Most coverage non-Western (Russia / CIS / MENA / Africa / LATAM / SEA) — currently underrepresented in MCP catalogs broadly.

Repo umbrella: https://github.com/theYahia/WWmcp (10 stars, 25 packages aggregated)

Thanks for the great directory work!

— Tim (theYahia)
```

### After submit

- Expected response: 2-7 days
- Expected resolution: 7-14 days backfill
- Track в outreach log: «Glama support ticket submitted YYYY-MM-DD, awaiting reply»
- Follow-up: если silent ≥10 дней, ping в Discord

---

## Track C — Claim ownership через glama.json (8 мин, 4 commits)

### Per-repo file content

Identical для всех 4 repos. **Drop at repo root** as `glama.json`:

```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": ["theYahia"]
}
```

### 4 repos требуют добавление

| # | Repo | Local path (если cloned) | Commit message |
|---|------|--------------------------|----------------|
| 1 | `theYahia/payfast-mcp` | `D:/Yahia/active/payfast-mcp` (если existed) или fork+clone | `chore: add glama.json for ownership claim` |
| 2 | `theYahia/nomba-mcp` | `D:/Yahia/active/nomba-mcp` | same |
| 3 | `theYahia/hotmart-mcp` | `D:/Yahia/active/hotmart-mcp` | same |
| 4 | `theYahia/qsearch` | `D:/Yahia/active/qsearch` | same |

### Steps per repo (~2 мин)

```bash
cd D:/Yahia/active/<repo-name>
cat > glama.json <<'EOF'
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": ["theYahia"]
}
EOF
git add glama.json
git commit -m "chore: add glama.json for ownership claim"
git push
```

### Verification

После 24-48h Glama re-crawls → проверь https://glama.ai/mcp/servers/theYahia/{repo} — должен appear «verified maintainer» badge.

### qsearch — special note

`qsearch` уже live на Glama как connector (per existing GLAMA_SUBMISSION_PACKAGE line 41). claude-webcache **already has** glama.json (per package). Так что только **3 reps требуют new file** (payfast / nomba / hotmart) + qsearch optional если нет.

⚠️ **Verify first:** `cat glama.json` в каждой repo — если уже есть, **skip**. Не overwrite.

---

## Track B — Batch publish 67 servers в MCP Registry (~2 ч)

### Pre-requisites (one-time)

```bash
# 1. Login to MCP Registry (OAuth flow opens browser)
npx mcp-publisher login github

# 2. Verify auth state
ls ~/.config/mcp-publisher/  # should show config files
```

### Per-server steps (~2 мин per server × 67 = 134 мин ≈ 2.2 ч)

```bash
cd <path-to-server-repo>

# 1. Verify mcpName в package.json (must be `io.github.theYahia/<repo-name>`)
grep mcpName package.json
# If missing — add line:  "mcpName": "io.github.theYahia/<repo-name>",

# 2. Generate server.json (interactive, asks 2-3 fields)
npx mcp-publisher init

# 3. Publish
npx mcp-publisher publish
```

### 67 servers list (per existing package — alphabetical)

```
2gis, africas-talking, alfa-bank, appmetrica, asaas, ati-su, atol-online,
bepaid, bog-ipay, casebook, chargily, click, correios, easypaisa, factura-uz,
facturapi, foodics, forte-bank, getir, halyk-epay, hepsiburada, hotmart, idpay,
ifood, ileti-merkezi, is-bankasi, iyzico, jazzcash, kavenegar, kontur-diadoc,
maib, midtrans, momo-vn, moyasar, neshan-maps, nfeio, nomba, pagarme, parasut,
payfast, payme, paymongo, paytabs, prodamus, rajaongkir, salla,
sberbank-acquiring, spark-interfax, tabby, tap-payments, tbc-bank, termii,
tgstat, tochka-bank, trendyol, unifonic, vk-ads, vnpay, xendit, yandex-360,
yandex-cloud, yandex-delivery, yandex-maps, yandex-tracker, yoco, zalo-oa,
zarinpal
```

### Batch script (optional — automates the loop)

Save as `D:/Yahia/active/WWmcps/WWmcp/scripts/publish-batch.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SERVERS=(
  2gis africas-talking alfa-bank appmetrica asaas ati-su atol-online
  bepaid bog-ipay casebook chargily click correios easypaisa factura-uz
  facturapi foodics forte-bank getir halyk-epay hepsiburada hotmart idpay
  ifood ileti-merkezi is-bankasi iyzico jazzcash kavenegar kontur-diadoc
  maib midtrans momo-vn moyasar neshan-maps nfeio nomba pagarme parasut
  payfast payme paymongo paytabs prodamus rajaongkir salla
  sberbank-acquiring spark-interfax tabby tap-payments tbc-bank termii
  tgstat tochka-bank trendyol unifonic vk-ads vnpay xendit yandex-360
  yandex-cloud yandex-delivery yandex-maps yandex-tracker yoco zalo-oa
  zarinpal
)

REPO_BASE="${REPO_BASE:-D:/Yahia/active/WWmcps/WWmcp/servers}"
SUCCESS=0
FAIL=0
SKIP=0

for s in "${SERVERS[@]}"; do
  echo "==> Processing $s"
  REPO="$REPO_BASE/$s"
  if [ ! -d "$REPO" ]; then
    echo "  SKIP $s — no repo at $REPO"
    SKIP=$((SKIP+1))
    continue
  fi
  cd "$REPO"
  if ! grep -q '"mcpName"' package.json; then
    echo "  SKIP $s — no mcpName in package.json (add manually first)"
    SKIP=$((SKIP+1))
    continue
  fi
  if npx mcp-publisher init && npx mcp-publisher publish 2>&1 | tee /tmp/mcp-publish-$s.log; then
    SUCCESS=$((SUCCESS+1))
    echo "  ✅ $s published"
  else
    FAIL=$((FAIL+1))
    echo "  ❌ $s FAILED — see /tmp/mcp-publish-$s.log"
  fi
done

echo ""
echo "===== SUMMARY ====="
echo "Success: $SUCCESS / Fail: $FAIL / Skip: $SKIP"
```

⚠️ **НЕ запускать batch автономно** — `mcp-publisher publish` интерактивен на init, plus может triggerit OAuth re-auth. Юзер должен sit на сессии.

### Track B prerequisites checklist

- [ ] All 67 server repos exist locally (либо в WWmcp monorepo `servers/<name>/`, либо отдельные)
- [ ] All have `package.json` с `"mcpName": "io.github.theYahia/<repo-name>"` (если нет — add first via batch sed)
- [ ] Logged into MCP Registry once via `npx mcp-publisher login github`
- [ ] Each repo can resolve via `npm view @theyahia/<name>-mcp version`

## Sequencing recommendation

**Day 1 (Mon 19.05 ~30 мин):**
- Track A: submit support ticket (5 мин)
- Track C: drop glama.json в 4 repos + push (15 мин)
- Track B prep: bulk-add `mcpName` field в 67 packages.json через sed (10 мин)

**Day 2 (Tue 20.05 ~2 ч):**
- Track B: batch publish (interactive session, 2 ч)
- Re-check Track A — есть ли response?

**Day 3-7 (Wed-Sun 21-25.05 background):**
- Wait для Glama backfill (~7-14 дней expected)
- Re-check https://glama.ai/mcp/servers/theYahia каждые 3-4 дня

## Что НЕ делаем

- ❌ Submit Track A multiple times — это spam, mods банят
- ❌ Push glama.json без verifying что repo действительно мой (tracking ownership)
- ❌ Batch publish без mcpName — crashes mid-loop
- ❌ Mass commit glama.json через bash one-liner — каждый repo требует separate commit + push

## Cross-references

- **GLAMA_SUBMISSION_PACKAGE.md** (existing 355 lines) — deep methodology + per-server text reference
- **rd234** Awesome-MCP PRs — параллельная distribution, не conflict
- **rd233** HN/Reddit/Twitter — комплементарно (organic distribution vs marketplace registration)
- **rd232** Habr blog post — credibility boost для всех submissions, link include в Track B server.json descriptions

## After completion — README badges update

Add к WWmcp README:

```markdown
**Listed on:**
[![Glama AI](https://img.shields.io/badge/Glama-listed-blue)](https://glama.ai/mcp/servers/theYahia)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-49+_servers-green)](https://registry.modelcontextprotocol.io/v0/servers?search=theyahia)
[![Smithery](https://img.shields.io/badge/Smithery-listed-purple)](https://smithery.ai/?q=theyahia)
```
