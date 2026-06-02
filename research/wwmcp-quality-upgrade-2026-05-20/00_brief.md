---
type: research-brief
tier: heavy-max
date: 2026-05-20
sprint: wwmcp-quality-upgrade-2026-05-20
status: ready-to-fire (НЕ запущен Phase 2)
parent_card: rd1046
parent_project: D:/Yahia/active/wwmcps/WWmcp/
---

# 00 — WWmcp Quality Upgrade Research Brief

> **Цель спринта:** определить какие из ~114 Tier-3 stub MCP в pipeline следует upgrade до Tier-2 production parallel с Day 31-60 build queue (rd1047 viral sprint). Найти конкретные API'и где Tier-2 quality (handcrafted tools / production auth / >5 tools / типизация / тесты) даёт **measurable activation lift** vs наша baseline Tier-3 stub coverage.

## Контекст (что есть СЕЙЧАС, 2026-05-20)

- **12 production-grade MCP** в `servers/` (Turborepo workspaces, используют @theyahia/mcp-core)
- **~100 pipeline servers** by category: ai/ / cis/ / comms/ / crm/ / data/ / finance/ / hr/ / logistics/ / marketing/ / payments/
- **114 Tier-3 stubs** в build queue (по rd1046 card body)
- **40 multi-server MCP skills** (.git repo)
- **1020 API candidates** в `docs/planning/MASTER_INVENTORY.md`
- **Strategy:** «Composio для остального мира» — non-Western API (33 страны)
- **npm scope:** @theyahia (за исключением @metarebalance/dadata-mcp)
- **CI/CD:** GitHub Actions, MCP Registry, changesets

## Connection с другими активными initiatives

- **rd1047 WWmcp viral sprint Day 20→30** (gate 31.05) — 20 PRs open, 5 user-actions блокируют Day 22. Этот спринт RUNS PARALLEL не блокирует viral.
- **claude-webcache** OSS narrative — WWmcp builder credibility поддерживает M3 Signal D (open-source signal: npm 90/нед WATCH).
- **MAX pivot 2026-05-09** — WWmcp distribution через MAX-канал @yahia-builds (M3 Signal B).

## Killer questions (что должен ответить спринт)

1. **Quality ROI:** какие категории Tier-3 → Tier-2 upgrade дают наибольший activation lift (downloads / GitHub stars / npm dl/нед / Telegram mentions)? Финансы / Маркетинг / HR / Логистика — где marginal pick?
2. **Production gap quantification:** что физически отличает Tier-3 stub от Tier-2 production? Список измеримых criteria (tool count, auth pattern, типы, тесты coverage, docs depth).
3. **Competitor benchmark:** какие из 114 уже имеют strong competitor (Composio / Pipedream / aci.dev / SmIThy / official vendor MCP)? Не дублировать — focus на gaps.
4. **Community signal:** какие API имеют активный community demand (GitHub Issues, Reddit r/mcp, dev.to articles, Habr) — упор на эти.
5. **Maintenance cost:** Tier-2 upgrade требует ongoing maintenance — какие API stable (low maintenance burden) vs volatile (frequent breaking changes)?
6. **Auth complexity:** какие API имеют OAuth2 / KeyVault complexity vs simple API key — обратно correlate с upgrade priority (simple first).
7. **Pricing tier:** какие API freemium tier позволяют MCP demo без paid account — обратно correlate с adoption barriers.
8. **Russian-specific value:** где non-Western API даёт уникальную value которую Composio не покрывает (DaData / 2GIS / 1C / GigaChat / YandexGPT / SberBoom / MAX Bot API / Tinkoff Invest)?
9. **Cross-server skill leverage:** какие upgrades enable новые multi-server skills (e.g. AmoCRM + Mango Office + JivoSite = sales-automation-skill)?
10. **Pricing strategy:** какие MCP могут перейти из @theyahia free → paid commercial offering (если quality justifies $5-20/мес)?

## Decision criteria (4-категорный verdict — НЕ binary)

| Verdict | Outcome |
|---|---|
| **GO-FOCUSED-25** | Top-25 Tier-3 selected для Tier-2 upgrade с прогнозируемой ROI (activation lift > 3x baseline). Plan with effort estimates per server. |
| **GO-BROAD-50** | 50+ upgrades viable но требует ~3-5 founder-months. Plan с phased rollout. |
| **MAYBE-PILOT-5** | Только top-5 critical upgrades с ROI proof; rest = WATCH. |
| **NO-GO-FOCUS-VIRAL** | Tier-3 stubs достаточно для viral распространения; quality upgrade — wasted effort vs Day 31-60 build queue. Focus on viral instead. |

## What I Already Know (recorded before research)

- MCP ecosystem 2025-2026 — explosive growth (1000+ servers, MCP Registry adoption)
- Composio имеет ~3000+ integrations но weak non-Western coverage
- Pipedream / Make.com / Zapier — workflow tools NOT MCP-native
- aci.dev — emerging MCP marketplace
- Anthropic MCP Registry — official, accepts community submissions
- Russian/CIS API: DaData, 2GIS, ChestnyZnak, Roskomnadzor data — все имеют API but most без production MCP
- Tier-3 stub = ~3-5 tools, basic auth, no tests, partial docs
- Tier-2 production = 8-15 tools, production auth (OAuth2 if needed), typed schemas, тестировано, full docs
- Tier-1 best-in-class = composable, multi-account, error handling, retries, telemetry

## Pre-research priors (Brier calibration baseline, 28 priors)

| # | Claim | Prior P | Type |
|---|---|---|---|
| 1 | ≥50% Tier-3 stubs можно apgrayd к Tier-2 за ≤8h effort each | 0.45 | engineering |
| 2 | Финансы (1С / Альфа / Тинькофф) category даст наибольший activation lift | 0.65 | market |
| 3 | HR (HH / SuperJob / HuntFlow) даст средний lift | 0.50 | market |
| 4 | Логистика (Pochta / Boxberry / СДЭК) — saturated competitors | 0.30 | market |
| 5 | Маркетинг (AppMetrica / Mindbox / Yandex Direct) даст high lift | 0.55 | market |
| 6 | CRM (AmoCRM / Bitrix24) — competitors сильны, low priority | 0.35 | competitive |
| 7 | Платежи (YooKassa / Sber Acquiring) — high demand но requires legal-side documentation | 0.50 | market |
| 8 | AI (GigaChat / YandexGPT / SaluteSpeech) — high demand 2026 | 0.75 | market |
| 9 | Данные (DaData / 2GIS / ChestnyZnak) — unique RU value, Composio gap | 0.80 | strategic |
| 10 | Comms (JivoSite / Mango / SMS-RU) — saturated low lift | 0.30 | market |
| 11 | СНГ international (50 стран) — long tail, individual API low lift но collective scale | 0.40 | strategic |
| 12 | Top-25 GO-FOCUSED достаточно для 3-мес roadmap | 0.55 | scoping |
| 13 | Tier-2 upgrade требует ~1500-3000 LOC per server | 0.50 | engineering |
| 14 | OAuth2 complexity blocks fast upgrade для ≥30% serverов | 0.45 | engineering |
| 15 | Freemium tier availability для testing — ≥60% серверов | 0.55 | feasibility |
| 16 | Community demand signal (GitHub Issues / Reddit) есть для ≤20% серверов | 0.50 | community |
| 17 | Cross-server skill leverage возможен для 5+ pairs (e.g. AmoCRM+Mango = sales-automation) | 0.65 | composition |
| 18 | Paid commercial tier viable для ≥5 серверов (justifies $5-20/мес) | 0.30 | monetization |
| 19 | Composio non-coverage RU API = unique moat | 0.80 | competitive |
| 20 | MCP Registry submission accelerates organic discovery 2-3× | 0.60 | distribution |
| 21 | npm dl/нед correlates с MCP Registry visibility | 0.65 | distribution |
| 22 | Tier-3 → Tier-2 даёт 3-5× activation lift | 0.45 | hypothesis |
| 23 | Maintenance cost ~5-15% upgrade effort annually | 0.55 | engineering |
| 24 | RU vendor MCP официальные — конкуренция уже existing для ≤10% серверов | 0.40 | competitive |
| 25 | Tier-3 stub достаточно для viral если distribution через MAX/Telegram | 0.50 | strategy |
| 26 | aci.dev / SmIThy emerge competitive 2026 H2 | 0.55 | competitive |
| 27 | Pipedream MCP мигрирует — direct competitor 2026 | 0.45 | competitive |
| 28 | M3 gate 31.07 unblocked если upgrade top-25 ship + Habr article | 0.40 | M3-linkage |

## Scope (что внутри / за пределами)

### Внутри scope
- ✅ Analysis всех 114 Tier-3 stubs по 5+ метрикам (community demand / competition / API quality / Russian value / cross-skill leverage)
- ✅ Competitor landscape Composio / Pipedream / aci.dev / SmIThy / official vendor MCP
- ✅ Tier-2 criteria definition (measurable)
- ✅ Top-25 / top-50 / top-5 lists per verdict scenario
- ✅ Effort estimates per top server (LOC, h, prerequisites)
- ✅ Multi-server skill leverage map (5+ pairs)
- ✅ Russian-specific value quantification (DaData / 2GIS / 1C / GigaChat etc.)

### За пределами scope
- ❌ Actual upgrade implementation (это Phase 6+ — separate sprint)
- ❌ Pricing strategy detailed (только high-level paid viability)
- ❌ Re-design @theyahia/mcp-core architecture (если нужно — отдельный architectural sprint)
- ❌ CI/CD pipeline overhaul
- ❌ Replace decision для conflict-prone APIs (Bitrix24 / amoCRM — конфликт с existing players, **skip**)

## Budget

- **Tokens:** ~400-600k pooled (heavy-max baseline) — Phase 1 brief / Phase 2 dual sweep / Phase 3 triage / Phase 4 Brave Context deep read / Phase 5 synthesis / Phase 6 disconfirming / Phase 6.5 steel-man / Phase 7 retrospective
- **Time:** 2-3 working days (если Phase 4 offload to night-loop facts.json + Claude finalize next morning)
- **Money:** $0 если qsearch backend up + BRAVE_API_KEY в `<project>/.env.local` (no manual paid API calls)
- **Disconfirming budget:** min 5 angles (Phase 6, see Research-Workflow.md)

## Source priority tiers (для Phase 3 triage)

- **1A** — official Anthropic MCP docs / MCP Registry data / npm registry data / GitHub repo stars+stats
- **1B** — competitor MCP repos (Composio / Pipedream / aci.dev source code) / official API docs primary
- **2** — Habr / dev.to / Reddit r/mcp / VK / Twitter mainstream tech press
- **3** — industry references (Tadviser, IDC RU IT market, OpenAI changelog)
- **4** — community (Discord, Telegram channels, GitHub Issues)
- **❌** — affiliate marketing pages, listicles без primary sources, content farms

## Risks

| Risk | Probability | Mitigation |
|---|---|---|
| Phase 2 fan-out backfires (250+ queries × Brave = €40 if no qsearch) | 0.30 | DUAL SWEEP gate — verify qsearch /health перед запуском |
| Тема overlap с rd1046's parent project (rd1047 viral sprint) — конфликт focus | 0.40 | Explicit "parallel runs" notation; sprint не блокирует viral build queue |
| Tier-3 vs Tier-2 criteria — subjective, может оказаться нечётко measurable | 0.35 | В Phase 1 deliverable: 5-7 hard-criteria checklist BEFORE Phase 2 |
| Russian API access blocked from Brave US/EU exit nodes | 0.40 | qsearch SearXNG (local) для RU API queries; AmneziaVPN split-tunnel for direct |
| Findings overlap с rd1047 viral artefacts | 0.50 | Cross-reference rd1047 при Phase 5; deduplicate findings |
| Wasted heavy-max на category где Tier-3 достаточно | 0.30 | Phase 6.5 steel-man explicit «do nothing» option |

## Pre-mortem (что может пойти не так)

1. **Brier #19 (Composio non-coverage = unique moat, P=0.80) refuted** — оказывается Composio в 2026 H2 покрывает RU API. → план: skip GO-BROAD, shift to NO-GO-FOCUS-VIRAL.
2. **Тип-1 ошибка:** все 114 servers выглядят "high priority" — нет signal. → план: 5-criteria scoring rubric пресекает.
3. **API documentation paywall** для 30%+ Russian vendors → не можем reliably score upgrade effort. → план: graceful degradation, score "unknown" honestly.
4. **MCP ecosystem evolves H2 2026** (new official Anthropic features) → recommended upgrades obsolete. → план: Phase 6 disconfirming включает «Anthropic 2026 roadmap» angle.

## Emergency checkpoint protocol

Если Phase 2 refutes ≥3 of top-10 priors (#19, #9, #2, #12) — STOP Phase 3-7. Escalate. Не тратить heavy-max budget на dead thesis.

## Deliverables (Phase 5 onwards)

**Triptych v7 layout, ~17-20 numbered .md:**
- `00_brief.md` (this file)
- `10_<aspect>_queries.txt` per category
- `20_raw_findings.md` (Brave + qsearch consolidated)
- `30_competitor_landscape.md`
- `40_tier_criteria_definition.md`
- `50_top_categories_analysis.md` (Финансы / Маркетинг / HR / Логистика / AI / Данные / Comms / Платежи / CRM)
- `60_russian_unique_value.md`
- `70_cross_skill_leverage_map.md`
- `80_effort_estimates_per_server.md`
- `90_competitor_gap_analysis.md`
- `100_freemium_tier_audit.md`
- `110_oauth_complexity_audit.md`
- `120_community_demand_signal.md`
- `130_maintenance_cost_projections.md`
- `140_disconfirming_steelman.md` (≥5 angles)
- `150_synthesis.md` (4-cat verdict + top-N list)
- `160_thirty_day_plan.md` (if GO) или `160_park_decision.md` (if NO-GO)
- `170_open_threads.md`
- `180_brier_retrospective.md`
- `DECISION_TREE.md`

## Phase 1 verify items (BEFORE Phase 2 запускать)

- [ ] `D:/Yahia/active/wwmcps/WWmcp/docs/planning/MASTER_INVENTORY.md` существует и содержит 1020 API list
- [ ] `D:/Yahia/active/wwmcps/WWmcp/docs/planning/BUILD_QUEUE.md` существует с Tier-3 stub status
- [ ] `D:/Yahia/active/wwmcps/WWmcp/docs/planning/STRUCTURE.md` существует с server-status mapping
- [ ] qsearch /health = OK на `localhost:8080/health`
- [ ] BRAVE_API_KEY в `D:/Yahia/active/wwmcps/WWmcp/.env.local`
- [ ] Не дублирует rd1047 viral sprint работы (cross-check)

---

## Next step

**НЕ запускать Phase 2 без user go.** Этот brief = «ready to fire» state.

Когда user даёт go:
1. Phase 1 verify (5 чеков выше)
2. Phase 2: `python scripts/brave_sweep.py queries.txt _raw_data/wwmcp-quality-upgrade-2026-05-20/brave/` + qsearch dual sweep
3. Phase 3-7 per `D:/Yahia/obsidian/Base/Templates/Research/Research-Workflow.md`
4. Или alternative: night-loop OFFLOAD per CLAUDE.md секция 4.5 (Phase 1 v9.4) — Phase 3-5 ночью на Ollama, Claude finalize утром

**Параллельно с rd1047:** этот спринт runs DURING viral sprint (PRs merged independent). NOT блокирует Day 20→30 gate 31.05.
