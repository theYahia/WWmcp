# IMPLEMENTATION.md — Подробный план имплементации

**Дата:** 2026-04-01
**Контекст:** PLAN.md + STRUCTURE.md + аудит 47 серверов + competitive landscape
**Обновлять:** по мере прогресса (чекбоксы)

---

## РЕАЛЬНОСТЬ НА СТАРТЕ

```
47 серверов опубликованы на npm (@theyahia)
47 repos с исходниками на github.com/theYahia/{name}-mcp
0 из них имеют тесты
1 production-grade (dadata — 31 tool, 2603 строк)
6 decent (5-10 tools, 300-540 строк): yookassa, cdek, cbr, tkassa, cloudpayments, pochta-russia
40 заготовок (2-4 tools, 100-300 строк)
0 GitHub stars, 0 реальных пользователей
Площадки: npm + MCP Registry + PulseMCP + Glama (47/47), остальные 1/47
```

---

## SPRINT 0: ФУНДАМЕНТ ✅ СДЕЛАНО

- [x] Реорганизовать neuraldeep/ → servers/{category}/ (11 категорий)
- [x] Перенести Researches/V1-V5 → research/archive/
- [x] Скопировать CIS ресёрч → research/cis-market/ (6 файлов, 11 стран)
- [x] Скопировать промпты → research/deep-research-prompts/ready/ (15 промптов)
- [x] Создать PLAN.md, STRUCTURE.md, IMPLEMENTATION.md
- [x] Сохранить контекст в память Claude Code
- [x] GitHub repos с исходниками — уже открыты (47/47)
- [x] COMPETITIVE_LANDSCAPE Deep Research — результат получен

---

## SPRINT 0.5: DEEP RESEARCH (3-5 дней, параллельно со Sprint 1)

> Скармливать в Claude.ai Deep Research по 3-4/день.
> Промпты: `D:/Yahia/experiments/mcp-servers/research/deep-research-prompts/ready/`

**День 1:**
- [ ] CIS_01_RUSSIA_DEEP.md → `research/cis-market/russia_deep.md`
- [ ] CIS_02_CENTRAL_ASIA_DEEP.md → `research/cis-market/central_asia_deep.md`
- [ ] CIS_03_CAUCASUS_EE_DEEP.md → `research/cis-market/caucasus_ee_deep.md`

**День 2:**
- [ ] W01_UAE_SAUDI_QATAR.md → `research/world-market/uae_saudi_qatar.md`
- [ ] W02_TURKEY.md → `research/world-market/turkey.md`
- [ ] W04_CHINA.md → `research/world-market/china.md`

**День 3 (в процессе):**
- [ ] W03a_INDIA_FINANCE_COMMERCE.md → `research/world-market/india_finance.md`
- [ ] W03b_INDIA_SAAS_INFRA.md → `research/world-market/india_saas.md`
- [ ] W05a_INDONESIA.md → `research/world-market/indonesia.md`

**День 4:**
- [ ] W05b_VIETNAM_THAILAND.md → `research/world-market/vietnam_thailand.md`
- [ ] W06_MALAYSIA_PHILIPPINES_BANGLADESH.md → `research/world-market/malaysia_ph_bd.md`
- [ ] W07_BRAZIL_MEXICO_ARGENTINA.md → `research/world-market/brazil_mexico_argentina.md`

**День 5:**
- [ ] W08_NIGERIA_KENYA_SOUTH_AFRICA.md → `research/world-market/nigeria_kenya_sa.md`
- [ ] W09_SERBIA_EGYPT_ALGERIA.md → `research/world-market/serbia_egypt_algeria.md`
- [ ] W10_IRAN_PAKISTAN_IRAQ.md → `research/world-market/iran_pakistan_iraq.md`

---

## SPRINT 1: QUALITY (неделя 1-2, параллельно с Deep Research)

> Цель: превратить 10 серверов из заготовок в production-grade
> Критерий production: 8+ tools, error handling, README с demo-промптами, тесты

### Топ-10 для апгрейда:

| # | Сервер | Сейчас | Цель | Что добавить |
|---|--------|--------|------|-------------|
| 1 | yookassa-mcp | 10 tools, 490 строк | 15+ | webhooks, рекуррентные, payouts, receipts (54-ФЗ), баланс |
| 2 | moysklad-mcp | 4 tools, 245 строк | 12+ | товары CRUD, контрагенты по ИНН, заказы, отгрузки, склады, отчёты |
| 3 | cdek-mcp | 6 tools, 539 строк | 10+ | все тарифы, создание заказа, печать ШК, ПВЗ геолокация, курьер |
| 4 | bitrix24-mcp | 4 tools, 244 строк | 12+ | сделки/контакты/компании CRUD, задачи, календарь, диск, чат |
| 5 | hh-mcp | 6 tools, 244 строк | 10+ | вакансии CRUD, отклики, резюме поиск, справочники |
| 6 | amocrm-mcp | 5 tools, 280 строк | 10+ | воронки, задачи, каталоги, webhooks (⚠️ конкурент caiborg-ai 36 tools) |
| 7 | vk-mcp | 4 tools, 201 строк | 10+ | сообщества, стена, бот-сообщения, VK Ads, Market, фото/видео |
| 8 | yandex-metrika-mcp | 4 tools, 232 строк | 8+ | отчёты, цели, сегменты, сравнение периодов, e-commerce |
| 9 | unisender-mcp | 4 tools, 196 строк | 8+ | списки, рассылки email/SMS, шаблоны, статистика, автоматизации |
| 10 | kaspi-mcp | 3 tools, 270 строк | 8+ | merchant API, Kaspi Pay, магазины, отчёты (⚠️ API ограниченный) |

### Порядок работы для каждого сервера:

```
1. Прочитать текущий код (src/)
2. Прочитать официальную API документацию сервиса
3. Составить список недостающих endpoints
4. Имплементировать tools
5. Добавить error handling (HTTP errors, rate limits, auth errors)
6. Написать тесты (vitest, mock HTTP)
7. Обновить README: описание, установка, конфигурация, demo-промпты
8. npm version major && npm publish
9. git push
```

### Параллелизация (8 агентов Claude Code):

```
Агент 1: yookassa-mcp + tkassa-mcp        (payments — схожие API)
Агент 2: moysklad-mcp + retailcrm-mcp     (crm — e-commerce фокус)
Агент 3: cdek-mcp + boxberry-mcp          (logistics — схожие API)
Агент 4: bitrix24-mcp                     (большой, отдельно)
Агент 5: hh-mcp + superjob-mcp            (hr — схожие API)
Агент 6: amocrm-mcp + megaplan-mcp        (crm)
Агент 7: vk-mcp + yandex-metrika-mcp      (marketing)
Агент 8: unisender-mcp + sendpulse-mcp + kaspi-mcp
```

---

## SPRINT 2: VISIBILITY (неделя 2-3)

> Цель: чтобы люди узнали что серверы существуют

### S2.1 Каталоги — массовая подача
- [ ] neuraldeep.ru: подать остальные 46 серверов
- [ ] mcp.so: подать остальные 46 (~2 мин/сервер)
- [ ] cursor.directory: подать топ-10
- [ ] Smithery.ai: подать все 47
- [ ] awesome-mcp-servers (GitHub): PR
- [ ] mcp.directory: подать все

### S2.2 GitHub polish
- [ ] russian-mcp repo: обновить README с бейджами и таблицей серверов
- [ ] LICENSE (MIT) в каждый сервер
- [ ] .github/CONTRIBUTING.md

### S2.3 Контент
- [ ] **Habr #1:** "47 MCP-серверов для российских API" → `content/habr/`
- [ ] **Telegram-посты** в AI/dev каналы → `content/telegram/`
- [ ] **GitHub Discussions** в modelcontextprotocol/servers

### S2.4 Killer demo (e-commerce use case)
```
"Создай заказ для ООО Ромашка: 50 шт Светильник LED-500,
 доставка СДЭК до Новосибирска, оплата YooKassa"

→ DaData: проверка реквизитов
→ МойСклад: поиск товара + остатки + создание заказа
→ СДЭК: расчёт + создание заявки
→ YooKassa: платёжная ссылка
```
- [ ] Демо-сценарий + GIF/видео
- [ ] В README и Habr статью

---

## SPRINT 3: MEGA PLAN (когда все 15 Deep Research готовы)

> Цель: из ресёрчей → roadmap на 200+ серверов

### S3.1 Скормить всё в Claude Code
Все файлы из `research/cis-market/` + `research/world-market/` → единая сессия.

Выход:
- [ ] `MASTER_INVENTORY.md` — TOP-200 API по приоритету
- [ ] `ARCHITECTURE.md` — монорепа, shared auth, CI/CD, auto-publish
- [ ] `GENERATION_STRATEGY.md` — для каждого API: auto-gen / ручная / skip

### S3.2 Приоритизация
```
~50 API:  OpenAPI spec есть     → авто-генерация (2-4 ч/сервер)
~80 API:  Docs есть, spec нет   → ручная (8-20 ч/сервер)
~30 API:  Docs слабые           → reverse engineer (20-40 ч)
~40 API:  Нет API               → пропуск или Telegram bot wrapper
```

---

## SPRINT 4: MASS GENERATION (неделя 4-8)

> Цель: 47 → 120+ серверов

### S4.1 Инфраструктура
- [ ] Шаблон-генератор: `npx create-mcp-server --name kaspi`
- [ ] `@theyahia/mcp-core` — shared HTTP client, auth, error handling
- [ ] `@theyahia/mcp-test` — test utilities
- [ ] CI/CD: GitHub Actions (lint → build → test → publish on tag)

### S4.2 Волна 1: CIS (8 агентов, +30-40 серверов, 2 недели)
```
Агент 1: KZ — kaspi-pay, halyk-bank, kolesa, krisha, egov-kz
Агент 2: KZ — webkassa, 2gis-kz, chocofood, wolt-kz
Агент 3: UZ — payme, click, uzum-market, soliq, factura-uz
Агент 4: UZ — express24, mytaxi-uz, humans-uz
Агент 5: GE+AM — tbc-bank, bog-ipay, rs-ge, idram, ameriabank
Агент 6: BY — erip, bepaid, onliner, kufar, e-pasluga
Агент 7: AZ — kapital-bank, m10, goldenpay, asan
Агент 8: MD + cross-CIS — maib, 999-md, albato
```

### S4.3 Волна 2: World (8 агентов, +40-60 серверов, 3 недели)
```
Агент 1: TR — trendyol, iyzico, hepsiburada, getir, yemeksepeti
Агент 2: IN — razorpay, cashfree, zoho-crm, cleartax, shiprocket
Агент 3: IN — gstn, digilocker, mappls, naukri, upi
Агент 4: Gulf — tap-payments, moyasar, paytabs, talabat, careem
Агент 5: SEA — midtrans, xendit, momo-vn, grab, gojek
Агент 6: LATAM — pix, mercado-pago, nubank, conekta
Агент 7: Africa — paystack, flutterwave, mpesa, africas-talking
Агент 8: IR+PK — zarinpal, snapp, digikala, jazzcash, easypaisa
```

---

## SPRINT 5: PLATFORM (месяц 2-3)

> Цель: коллекция серверов → платформа с монетизацией

### S5.1 Registry сайт
- [ ] Домен: openclaw.dev или theyahia.dev
- [ ] Stack: Next.js + SQLite/Supabase
- [ ] Каталог с поиском, фильтрами по странам/категориям
- [ ] Страница сервера: описание, tools, install, demo
- [ ] npm downloads + GitHub stars статистика

### S5.2 Auth Layer (moat)
- [ ] `@theyahia/mcp-auth`:
  - OAuth2 management (Yandex, VK, Kaspi, T-Bank)
  - API key rotation + token refresh
  - Certificate auth (1C, госуслуги)
  - Multi-tenant credential storage
- [ ] Hosted auth proxy для платных клиентов

### S5.3 Монетизация
```
FREE:     open-source серверы, npx install, community support
PRO $29:  managed auth + hosted servers + monitoring + priority support  
ENTERPRISE: custom серверы + SLA + on-premise
```

---

## SPRINT 6: SCALE (месяц 3-6)

### S6.1 Community
- [ ] GitHub org + contributor guide + bounty ($50-200/сервер)
- [ ] Telegram community channel

### S6.2 Integrations
- [ ] Dify plugin, n8n nodes, LangChain/CrewAI tools
- [ ] GigaChat + YandexGPT function calling совместимость

### S6.3 Content engine
- [ ] Habr: 1 статья / 2 недели
- [ ] YouTube/Telegram: demo use cases
- [ ] docs.openclaw.dev

---

## МЕТРИКИ

| Sprint | Когда | Серверов | Production | Stars | Users | Revenue |
|--------|-------|----------|-----------|-------|-------|---------|
| S0 | ✅ сейчас | 47 | 1 | 0 | 0 | 0 |
| S1 | +2 нед | 47 | 10 | 0 | 0 | 0 |
| S2 | +3 нед | 47 | 10 | 50+ | 5+ | 0 |
| S3 | +4 нед | 47 | 10 | 50+ | 10+ | 0 |
| S4 | +8 нед | 120+ | 40+ | 200+ | 50+ | 0 |
| S5 | +12 нед | 150+ | 60+ | 500+ | 200+ | $500+/мес |
| S6 | +24 нед | 200+ | 100+ | 1000+ | 500+ | $2000+/мес |

---

## БЛОКЕРЫ

| Блокер | Влияет на | Решение |
|--------|-----------|---------|
| Deep Research не готов | S3, S4.3 | S1-S2 не зависят, делаем параллельно |
| Claude заблокирован в РФ | 80-90% аудитории | Cursor, VS Code, Continue.dev + GigaChat |
| amoCRM занят caiborg-ai | amocrm-mcp | Не конкурировать лоб-в-лоб |
| Bitrix24 official MCP | bitrix24-mcp | Наш = webhook-based (проще) |
| 0 пользователей | Мотивация | S2 visibility решает |

---

## ЧТО ДЕЛАТЬ ПРЯМО СЕЙЧАС

```
1. Скармливать Deep Research промпты по 3-4/день (Sprint 0.5)
2. Параллельно: апгрейд топ-10 серверов в 8 агентов (Sprint 1)
3. Параллельно: подача в каталоги + Habr статья (Sprint 2)
4. Когда все 15 ресёрчей готовы → скормить сюда → Mega Plan (Sprint 3)
5. Mass generation 8 агентов CIS → World (Sprint 4)
```
