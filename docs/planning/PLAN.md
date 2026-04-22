# PLAN.md — Единственный актуальный план

**Версия:** 6.1 (заменяет V1-V5)
**Дата:** 2026-04-01
**Автор:** @theYahia

> Предыдущие версии планов (V1-V5) в `research/archive/`.
> Этот документ — единственная точка правды.
> Детальная имплементация — в IMPLEMENTATION.md.

---

## СТРАТЕГИЯ: "Composio для остального мира"

**Что:** Платформа MCP-серверов для API за пределами Запада
**Для кого:** AI-разработчики в СНГ + дружественных странах (33 страны, 2B+ людей)
**Почему сейчас:** 20,000+ MCP для западных API, ~20 для СНГ. Мы = 47. Конкурентов 0.
**Moat:** managed auth для нестандартных API + региональная экспертиза + community

---

## ТЕКУЩИЙ СТАТУС

- 47 MCP-серверов опубликованы на npm (@theyahia)
- 47 GitHub repos с открытыми исходниками (github.com/theYahia/{name}-mcp)
- 47/47 в Official MCP Registry, PulseMCP, Glama.ai
- 47/47 PR в LobeHub (ждёт мерж), 47/47 Issues в Cline marketplace
- 1/47 на neuraldeep.ru, mcp.so, cursor.directory (только dadata)
- DaData = единственный production-grade (31 tool, 2603 строк)
- Остальные = vibe-coded заготовки (2-10 tools, 100-500 строк)
- 0 звёзд, 0 форков на GitHub
- 0 реальных пользователей (кроме себя)

### Ресёрч

- Competitive landscape — ✅ готов (MCP = стандарт, 0 конкурентов в СНГ)
- CIS первичка (11 стран, 950+ компаний) — ✅ готов
- RF-friendly countries (70+ стран, TOP-30) — ✅ готов
- Deep Research промпты (15 шт) — готовы к скармливанию в Claude.ai
- Deep Research результаты — в процессе (4 из 15 скармливаются)

---

## PHASES

### PHASE 1: FOUNDATION (Апрель 2026) ← ТЫ ЗДЕСЬ

| Задача | Статус | Детали |
|--------|--------|--------|
| Реорганизация проекта | ✅ | servers/{category}/, research/, PLAN.md |
| GitHub repos открыты | ✅ | 47/47 с исходниками |
| Deep Research pipeline | ⏳ | 15 промптов, скармливать по 3-4/день |
| Апгрейд топ-10 серверов | ⏳ | 8 агентов параллельно → production-grade |
| Visibility (каталоги + Habr) | 🔜 | Подача в mcp.so, neuraldeep.ru + статья |

### PHASE 2: MEGA PLAN (Апрель-Май 2026)

Когда все 15 Deep Research готовы:
- Скормить ВСЕ ресёрчи → MASTER_INVENTORY (TOP-200 API)
- ARCHITECTURE.md — shared auth, CI/CD, auto-publish
- Массовая генерация: 47 → 120+ серверов (CIS + World)

### PHASE 3: PLATFORM (Июнь 2026)

- Registry сайт (openclaw.dev) с каталогом и поиском
- Auth Layer — managed OAuth для кривых CIS API (= платный tier)
- Монетизация: Free (open-source) / Pro $29 (auth+hosting) / Enterprise

---

## МЕТРИКИ УСПЕХА

| Метрика | Апрель | Май | Июнь |
|---------|--------|-----|------|
| MCP-серверов | 47→55 | 100+ | 150+ |
| Production-grade | 1→10 | 30 | 50 |
| GitHub stars | 0→50 | 200 | 500 |
| npm downloads/week | ?→100 | 500 | 2000 |
| Реальных пользователей | 0→10 | 50 | 200 |
| Revenue | 0 | 0-50K₽ | 100K₽+ |

---

## KILL LIST

- ❌ Новые версии планов — обновлять ЭТОТ файл
- ❌ Новые серверы-заготовки — допилить существующие 47
- ❌ Свой agent framework — интегрироваться с Dify/LangChain/CrewAI
- ❌ Конкурировать с Bitrix24 official MCP / amoCRM (caiborg-ai)
- ❌ Фокус на РФ-only — сразу CIS + World

---

## HONEST ASSESSMENT

| Сценарий | Вероятность |
|----------|------------|
| Platform >150K₽/мес за 12 мес | 10-15% |
| Consulting + Platform >50K₽/мес | 25-35% |
| Портфолио для карьеры (PM/DevRel) | 85-90% |
| "Composio для СНГ" с инвестициями | 5-10% |

**Главная метрика:** есть ли хоть один человек, который реально использует твой MCP.

---

## ССЫЛКИ

| Что | Где |
|-----|-----|
| GitHub (index) | github.com/theYahia/russian-mcp |
| npm org | npmjs.com/org/theyahia |
| Telegram | @vhodvai |
| Имплементация | IMPLEMENTATION.md |
| Структура | STRUCTURE.md |
| Промпты Deep Research | research/deep-research-prompts/ready/ |
| CIS ресёрч | research/cis-market/ |
| World ресёрч | research/world-market/ |
| Архив V1-V5 | research/archive/ |
