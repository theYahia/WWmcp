# 🧩 1С MCP — роадмап

> **Позиционирование:** не dev-tool ради GitHub-звёзд (ниша насыщена: 25+ репо, 88★-двойник `feenlace/mcp-1c`, «1С:Напарник» закрыл dev-time), а **KII on-prem runtime + marketplace-монетизация**. Звёзды ≠ платящие: **0 публичных платящих клиентов** у всех AI/MCP-обвязок 1С (ресёрч `onec-niche-2026-04-29`, вердикт MAYBE-PILOT → GO-NICHE-KII-RUNTIME).

## Сейчас — база готова
- [x] `@theyahia/1c-rest-mcp` v3.x — 32 tools, 11 модулей, 3 MCP-prompt, 87 тестов
- [x] OData REST scope (в монорепо `WWmcp/servers/1c-rest`)
- [x] Heavy-max ресёрч ниши (onec-niche 2026-04-29) — вердикт и цифры зафиксированы

## Phase 1 — KII-runtime пилот (30-90 дн)
> **Открытая ниша:** облачные LLM (Claude/GPT) де-факто запрещены в КИИ (360-р + 152/187-ФЗ + Указ 166) → on-prem MCP туда, где конкуренты не дотягиваются. Direct sales, не partnership.
- [ ] Определить 3-5 target enterprise (КИИ-сектор с 1С + запрет cloud LLM)
- [ ] On-prem deploy-пакет: локальный LLM-backend, работа без интернета
- [ ] 1 пилотный клиент → **первый платящий reference** (которого нет ни у одного конкурента)
- [ ] Кейс-стади для GTM
- [ ] GATE: есть платящий пилот? → да: Phase 2. нет: пересмотр scope.

## Phase 2 — marketplace / Инфостарт
> **Где реальные деньги:** Инфостарт — выручка платформы 1071 млн ₽/2024 (+24%); топ-соло-автор ~110k ₽/мес. Не звёзды — внедрение.
- [ ] Публикация на Инфостарт как платное решение
- [ ] Пакетирование под внедренцев (бизнес-функция, не dev-tool)
- [ ] 2-3 продажи через marketplace

## Phase 3 — консалтинг / поддержка
> 1С-ставки высокие: Senior аутсорс 5.5-10k ₽/час; Lead 300-420k ₽/мес. Recurring-доход.
- [ ] Пакет внедрения + поддержки (подписка)
- [ ] Reputation build в 1С-комьюнити (6-12 мес — барьер входа)

## Открытые wedge (куда можно расти)
- [ ] KII-compliant on-prem runtime — **главный**, меньше конкуренции
- [ ] Smithery cross-border distribution
- [ ] Pluggable backend orchestration (НЕ generic OData — занято feenlace)

## Риски / что уже закрыто конкурентами
> - ⚠️ 25+ репо 1С-AI/MCP: comol/ai_rules_1c 231★, hawkxtreme 190★, feenlace/mcp-1c 88★ (прямой scope-двойник)
> - ⚠️ «1С:Напарник» (официальный) закрыл dev-time wedge; free до окт-2026 → paid token-based
> - ⚠️ 3 gatekeeper: Filippov/VibeCoding1C (курсы 14-55k₽), Infostart MCP, 1С-Рарус
> - ⚠️ Нужна 1С-экспертиза + reputation 6-12 мес (не задекларирована)
> - ⚠️ Потолок ниши: solo 5-50 млн ₽ ARR, **NO venture-scale** (TAM ceiling ~$30M ARR)

---
> Источник: `experiments/research/2026-04/onec-niche-2026-04-29/` (150_synthesis · DECISION_TREE · 60_ai_mcp_landscape). Правится в этом `.md`, не в коде дашборда.
