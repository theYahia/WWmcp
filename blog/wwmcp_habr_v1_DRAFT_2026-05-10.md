---
target: Habr
hubs: ["Open source", "TypeScript", "Искусственный интеллект", "Программирование"]
status: DRAFT (ready-for-final-edit)
draft_date: 2026-05-10
target_length: ~2000 слов / 8-10 минут чтения
based_on:
  - docs/discoverability/blog-habr-ru.md (outline)
  - README.ru.md (каталог)
  - docs/use-cases/ (демо)
publish_path: habr.com/feed → New post
post_publish_actions:
  - Trackback в README badges
  - Pin в TG @vhodvai
  - Tweet thread per hn-reddit-twitter.md
---

# Composio для остального мира: 25 MCP-серверов для российских и не-западных API

> Как я за месяц собрал монорепо MCP-серверов под `@theyahia/*` для МойСклад, Битрикс24, ЮKassa, Wildberries, T-Bank и ещё 21 API — и почему это не Hello-World галерея, а production-grade слой для AI-автоматизации без VPN.

## TL;DR

Anthropic выкатил MCP (Model Context Protocol) — открытый стандарт подключения LLM к API. В их официальном каталоге — преимущественно американский SaaS: Stripe, Slack, GitHub, Notion. Если ты сидишь в РФ или СНГ, у тебя на руках другой стек: ЮKassa, Bitrix24, МойСклад, СДЭК, Атол, hh.ru. Под них в каталоге — пусто.

Я собрал монорепо `WWmcp` с 25 опубликованными MCP-серверами под одним npm-scope `@theyahia/*`, общим shared-core (auth, retries, dual transport stdio+HTTP, structured errors, opt-in телеметрия) и скриптом `npx @theyahia/create-mcp <name>` для скаффолда нового сервера за 30 секунд.

Дальше — почему это нужно, как устроено и какие гoтчи ловил по дороге.

---

## 1. Что такое MCP и почему это важно

Если коротко: **MCP = REST API для LLM**, но переносимый между клиентами.

Без MCP каждый LLM-клиент (Claude Desktop, Cursor, Continue, Cline) хочет свой формат tools. Ты пишешь function-calling под Claude — потом перепаковываешь под OpenAI Assistants — потом снова под Cline. Один API → три имплементации, три CI-pipeline, три места где может сломаться сериализация JSON Schema.

С MCP пишешь один сервер — он работает во всех клиентах поддерживающих протокол. Передаёшь ему credentials через env, он публикует список tools, LLM вызывает их parametrically. Весь lifecycle (handshake, capability negotiation, error formats) — в спецификации.

Ключевое для open-source: **MCP не привязан к Anthropic как вендору**. Спека опубликована, реализации есть и не-Anthropic клиентов (LibreChat, Cline, Continue). Ты не привязываешь свой сервер к одному провайдеру.

Что в каталоге Anthropic есть: GitHub, Slack, Stripe, Notion, Postgres, Filesystem, Brave Search, ~50 серверов на момент написания.

Что в нём **отсутствует** для российской/СНГ-аудитории: всё что не SaaS-первого-мира.

## 2. Пробел в каталоге — конкретный кейс

Возьмём типичный e-commerce shop в РФ. Стек:

- **Учёт товаров и склад:** МойСклад
- **CRM/lead pipeline:** Bitrix24 или amoCRM
- **Платежи:** ЮKassa или T-Kassa, иногда CloudPayments
- **Доставка:** СДЭК + Boxberry + Почта России
- **Фискализация (54-ФЗ):** ЮKassa встроенно или Атол отдельно
- **Маркетинг:** Yandex.Direct, Yandex.Metrika, MyTarget, VK Ads

Хозяин магазина хочет AI-агента который сделает: «проверь остатки SKU TS-100 в МойСклад, рассчитай доставку СДЭК до Новосибирска, выпиши счёт на ЮKassa и подготовь фискальный чек». Семь параллельных tool calls.

Ни одного из этих API нет в официальном MCP-каталоге Anthropic.

Тот же пробел для:
- **Турция:** İyzico, Trendyol, MNG Kargo, NetGSM
- **Бангладеш:** bKash, Nagad, Pathao
- **Эфиопия:** Chapa, telebirr, Awash Bank
- **Бразилия:** Mercado Pago, Pagar.me, Correios
- **Индонезия:** Midtrans, Tokopedia API, Tiket.com
- **Иран:** ZarinPal, Saderat
- **И ещё ~10 стран которые я успел посмотреть**

Это не «Anthropic не уделяет внимания» — это **открытый стандарт, открытые возможности**. Никто не запрещал писать сторонние серверы. Их просто никто не писал систематически.

## 3. Решение — WWmcp монорепо

Что внутри на момент публикации поста:

| Метрика | Значение |
|---------|----------|
| Опубликованных серверов в npm | **25** под scope `@theyahia/*` |
| Стран покрыто | **15+** (РФ, Турция, Бангладеш, Эфиопия, Эмираты, Индонезия, Бразилия, Перу, Колумбия, Индия, ...) |
| Total tools (across servers) | **~200+** |
| Категории | Платежи (6 RU + ещё 8) / CRM (8 RU) / Маркетинг (12 RU) / Логистика (6 RU + СНГ) / HR (3 RU) / Связь (5+) |
| Shared core | `@theyahia/mcp-core` — auth/retries/transport/errors/телеметрия |
| Telemetry | `@theyahia/wwmcp-telemetry` — opt-in, privacy-first, выключена по умолчанию |
| CI | Turborepo + pnpm workspace + Changesets release pipeline |
| Лицензия | MIT |

### Российская секция (ядро каталога)

**Платежи:**
- `@theyahia/yookassa-mcp` v2.0.0 — 20 tools (payments, refunds, receipts 54-ФЗ, payouts, webhooks, recurring, СБП, splits)
- `@theyahia/tkassa-mcp` v2.0.0 — 14 tools (T-Bank Kassa: payments, recurring, customers, cards, СБП)
- `@theyahia/cloudpayments-mcp` v2.0.0 — 12 tools
- `@theyahia/sberbank-acquiring-mcp` v1.0.0 — 8 tools
- `@theyahia/robokassa-mcp` v1.0.0 — 2 tools (минимально-полезный)
- `@theyahia/prodamus-mcp` v1.0.0 — 8 tools

**CRM/учёт:**
- `@theyahia/amocrm-mcp` v2.0.1 — 19 tools (leads, contacts, pipelines, tasks, search, events)
- `@theyahia/bitrix24-mcp` v3.0.0 — 12 tools
- `@theyahia/moysklad-mcp` v3.0.0 — 21 tools (products, stock, orders, counterparties, shipments, supplies, stores, reports, webhooks)
- `@theyahia/retailcrm-mcp` v2.0.0 — 15 tools
- `@theyahia/kaiten-mcp` v3.0.0 — 10 tools
- `@theyahia/yandex-tracker-mcp` v1.0.0 — 12 tools

**Маркетинг (Yandex stack):**
- `@theyahia/yandex-metrika-mcp` v2.1.0 — 15 tools
- `@theyahia/yandex-direct-mcp` v3.0.0 — 12 tools
- `@theyahia/yandex-webmaster-mcp` v1.0.1 — 5 tools
- `@theyahia/appmetrica-mcp` v1.0.0 — 8 tools
- `@theyahia/tgstat-mcp` v1.0.0 — 8 tools (Telegram analytics)
- `@theyahia/vk-ads-mcp` v1.0.0 — 8 tools

**Логистика РФ:**
- `@theyahia/cdek-mcp` v2.0.1 — 14 tools
- `@theyahia/boxberry-mcp` v1.0.1 — 4 tools
- `@theyahia/pochta-russia-mcp` v1.0.1 — 3 tools
- `@theyahia/yandex-delivery-mcp` v1.0.0 — 8 tools

**HR:**
- `@theyahia/hh-mcp` v2.0.0 — 16 tools (vacancies, resumes, employers, salary stats, dictionaries, autocomplete)
- `@theyahia/superjob-mcp` v1.0.0 — 2 tools
- `@theyahia/huntflow-mcp` v1.0.0 — 4 tools

**Связь:**
- `@theyahia/mts-exolve-mcp` v3.0.0 — 8 tools (SMS, calls, call recordings, Viber)

(полный каталог по странам — в README репо)

## 4. Демо: e-commerce flow на 6 серверах

Конфиг Claude Desktop:

```json
{
  "mcpServers": {
    "moysklad": {
      "command": "npx",
      "args": ["-y", "@theyahia/moysklad-mcp"],
      "env": { "MOYSKLAD_TOKEN": "your_token" }
    },
    "cdek": {
      "command": "npx",
      "args": ["-y", "@theyahia/cdek-mcp"],
      "env": { "CDEK_CLIENT_ID": "your_id", "CDEK_CLIENT_SECRET": "your_secret" }
    },
    "yookassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/yookassa-mcp"],
      "env": { "YOOKASSA_SHOP_ID": "your_id", "YOOKASSA_SECRET_KEY": "your_key" }
    }
  }
}
```

Промпт:
> «Проверь остатки товара TS-100 в МойСклад, рассчитай доставку СДЭК до Новосибирска и создай ссылку на оплату через ЮKassa»

Что AI делает (без ручной возни):

1. `moysklad.get_product` SKU=TS-100 → остатки и цена
2. `moysklad.get_stock` для всех складов → распределение по локациям
3. `cdek.calculate_tariff` from=Москва to=Новосибирск weight=1kg → тарифы доставки
4. `yookassa.create_payment` amount=<price+delivery> → ссылка на оплату

Один промпт. Без glue-кода. Без custom backend. **МойСклад не публикует MCP. ЮKassa не публикует. СДЭК не публикует. Я опубликовал.**

[INSERT GIF/Loom 30 сек с реальной сессией Claude Desktop — TODO для финальной версии]

## 5. Архитектура — почему монорепо, а не 25 отдельных репо

Это самое спорное решение в проекте. Оправдание:

**Shared core — единственный источник правды.** `@theyahia/mcp-core` экспортирует:
- `BaseClient` для auth flows (api-key / bearer / oauth2 / hmac)
- Retry middleware с exponential backoff и jitter
- Dual transport: stdio (для Claude Desktop) + Streamable HTTP (для cloud деплоя)
- Structured error mapping (HTTP status → MCP error codes)
- Schema validation через zod

Изменение в core ломает CI всех серверов одновременно — это **feature, не bug**. Я хочу знать сразу что мой rewrite retry-логики сломал bkash MCP, а не через 3 месяца когда юзер откроет issue.

**Turborepo + pnpm workspace + workspace:* deps.** `pnpm install` за 12 секунд, `turbo build` инкрементально пересобирает только изменённое. Locked deps через `pnpm-lock.yaml`.

**Changesets — каждый PR обязан добавить `.changeset/*.md`.** Релизы атомарны: один CI run = один версионный тег = N npm-публикаций. Нельзя зарелизить один сервер забыв обновить версию shared-core.

**Telemetry: privacy-first, opt-in, выключена по умолчанию.** Если хочешь подключить `@theyahia/wwmcp-telemetry` — получишь метрики использования (какие tools вызываются чаще, latency p50/p95). Без consent — нулевой трафик исходит.

## 6. Гoтчи за месяц разработки

**Гoтча 1 — `setup-node@v4` с registry-url создаёт неправильный `.npmrc`.**

Если в GitHub Action написать:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    registry-url: 'https://registry.npmjs.org'
```

То автоматически создаётся `.npmrc` с `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}`. Имя env-variable — **NODE_AUTH_TOKEN**, не `NPM_TOKEN`. Я долго не мог понять почему `npm publish` падает с **E404 «package not found»** при правильном `NPM_TOKEN` в secrets — оказалось npm читает `${NODE_AUTH_TOKEN}` из шаблона, видит пустое значение, обращается без auth и сервер возвращает 404 (а не 401, как ожидаешь).

**Гoтча 2 — Changesets публикует все workspace-пакеты включая `_template`.**

В монорепо есть `servers/_template/` — скаффолд из которого `create-mcp` копирует. Без `"private": true` в его `package.json` — Changesets честно публикует `@theyahia/_template-mcp@0.1.0` в npm. Узнал когда юзеры начали путаться в каталоге.

Фикс: в каждый workspace package, который не предназначен для публикации, добавить `"private": true`. Changesets его пропустит.

**Гoтча 3 — partial-fail релиз ломает следующий запуск.**

Один из ранних релизов опубликовал 8 пакетов из 12, потом упал на 9-м (rate limit npm). Следующий запуск пробовал опубликовать все 12 заново и получил **E403 «cannot republish over previously published version»** на уже опубликованных. CI зависает в красном.

Фикс: Changesets хорошо изолирует версии — каждый пакет получает свой версионный bump атомарно. Если использовать `changeset publish` (не `npm publish` руками) — он автоматически skip'ает уже опубликованные версии. Я переписал release script под `changeset publish` и проблема ушла.

## 7. Как добавить свой API

```bash
npx @theyahia/create-mcp tinkoff \
  --region=russia \
  --category=payments \
  --base-url=https://securepay.tinkoff.ru/v2 \
  --auth=api-key \
  --description="Tinkoff Acquiring API"
```

Результат — рабочий сервер в `servers/tinkoff/` за 30 секунд. Внутри:
- `package.json` с правильным scope, exports, MCP metadata
- `src/index.ts` — entry point, регистрирует MCP server
- `src/client.ts` — `BaseClient` extension с auth-конфигом
- `src/tools/_template.ts` — пример tool с zod schema
- `vitest.config.ts` + `__tests__/` шаблон
- `README.md` шаблон
- `.changeset/` директория

Production checklist для PR в монорепо:
- [ ] 8+ tools на сервер (минимально полезно)
- [ ] vitest покрытие основных code paths
- [ ] README с demo prompts (3-5 промптов которые точно работают)
- [ ] Changeset (`.changeset/<random>.md`) с описанием изменений
- [ ] CI зелёный (`pnpm test`, `pnpm typecheck`, `pnpm build`)

«Good first issues» — национальные ЦБ постсоветских стран (НБК, НБРБ, НБУ, ...), public stats APIs (Росстат, Statbel, ...), simple logistics tracking. Список открыт в репо.

## 8. Призыв

⭐ GitHub: **https://github.com/theYahia/WWmcp**
🌍 MIT — бери и используй
🤝 PR welcome — особенно для:
- Иран глубже (Saman, Mellat, Pasargad)
- Узбекистан (Click, Payme, Apelsin)
- Грузия (TBC, Bank of Georgia)
- Армения (Ameria, IDBank)
- Беларусь (ЕРИП, бел.карт)
- Казахстан (Kaspi.kz API, Halyk)
- Кыргызстан (MBank, Demir)
- Африка вне Top-3 (Wave, Fawry, Pesapal)

💬 Discussions для use-кейсов: github.com/theYahia/WWmcp/discussions
📢 Telegram канал: @vhodvai

---

## Что планирую вынести в отдельные посты (если этот зайдёт)

- **Технический deep-dive:** «Как я написал `@theyahia/mcp-core` — общий слой для 25 MCP-серверов» (auth flows, retry с jitter, dual transport, error mapping в MCP error codes)
- **Кейс-стади:** «Полная автоматизация e-commerce в РФ через 6 MCP-серверов (без backend кода)» — сценарий клиент→AI-агент→результат с реальными временными интервалами
- **Тест-стади:** «Тестирование MCP-серверов: vitest + undici MockAgent vs msw» — про моки HTTP, contract-тесты, как отличать broken-API от broken-кода

---

## Финальный draft note

Этот текст — DRAFT v1 (ready-for-final-edit). До публикации:

1. **Заменить `[INSERT GIF/Loom 30 сек]` на реальный Loom** — записать сессию Claude Desktop с e-commerce промптом (rd231 на board, ~30 мин работы)
2. **Финальная вычитка** — read-aloud pass на awkward fraseology
3. **Проверить корректность чисел** на момент публикации (количество серверов / tools / стран — могут измениться)
4. **Проверить ссылки** — все npm-страницы открываются, GitHub workflows зелёные
5. **(Optional) `/codex review`** для technical accuracy
6. **Hub selection в Habr UI:** Open source primary + Open Source / TypeScript / AI / Программирование (≤3 hubs можно бесплатно для нового аккаунта; ≤5 для активных)

После publish:
- Trackback в README badges (`📰 Featured on Habr: <link>`)
- Pin в @vhodvai
- HN/Reddit/Twitter cascade — через 1-2 дня (per `hn-reddit-twitter.md`)
