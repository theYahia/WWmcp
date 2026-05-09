# Habr post draft (RU)

**Хаб:** Open source, TypeScript, Искусственный интеллект, Программирование

**Целевая длина:** 8-10 минут чтения, ~2500-3500 слов.

**Hook:** Anthropic выкатил MCP — стандарт подключения LLM к API. Но в их официальном каталоге — преимущественно американский SaaS. Я собрал 25 MCP-серверов для российских и не-западных API за месяц и опубликовал монорепо.

---

## Заголовок (выбрать один)

1. **«Composio для остального мира»: 25 MCP-серверов для российских и не-западных API**
2. **MCP вне Кремниевой долины: построил монорепу из 25 серверов для МойСклад, Битрикс24, ЮKassa, Wildberries и ещё 21 API**
3. **Как я отдал Claude доступ к российским API через MCP — 25 серверов, 200+ инструментов, один scope `@theyahia`**

---

## Структура

### 1. Контекст: что такое MCP и почему это важно (300 слов)

- MCP = Model Context Protocol, открытый стандарт от Anthropic для подключения LLM к внешним инструментам
- Альтернатива: писать свои function tools под каждый клиент (Claude Desktop, Cursor, Continue, Cline)
- Каталог Anthropic покрывает GitHub, Slack, Stripe, Notion — но не МойСклад, не СДЭК, не Bitrix24

### 2. Проблема: пробел в каталоге (200 слов)

- Скриншот / список: что есть в официальном MCP, что отсутствует
- Конкретный кейс: e-commerce shop в России хочет автоматизировать через AI — нужны МойСклад + СДЭК + ЮKassa + Atol для 54-ФЗ. Ничего из этого в официальном каталоге нет.
- Тот же пробел для Турции, Бангладеш, Эфиопии, Бразилии, Индонезии.

### 3. Решение: WWmcp монорепо (500 слов)

- 25 production-серверов, опубликованы под `@theyahia/*-mcp`
- 15+ стран
- Shared core: `@theyahia/mcp-core` — auth, retries, dual transport (stdio + Streamable HTTP), structured errors, opt-in телеметрия
- Turborepo + pnpm workspace + Changesets release pipeline
- Полная таблица серверов (вставить часть README catalog)

### 4. Демо: e-commerce flow на 6 серверах (400 слов)

> Промпт: «Проверь остаток SKU TS-100 в МойСклад, рассчитай доставку СДЭК до Новосибирска, выпиши счёт на ЮKassa и подготовь фискальный чек через Атол»

- Показать что AI делает: 6 параллельных tool calls
- GIF / видео (Loom 30 сек) с реальной сессией
- Логи MCP-сервера (с redacted токенами)

### 5. Архитектура: почему монорепо, а не 25 отдельных репо (500 слов)

- Shared core — единственный источник правды для auth, retries, error mapping. Изменение в core ломает CI всех серверов одновременно — это feature, не bug.
- Turborepo дает incremental build; pnpm workspace — workspace:* deps
- Changesets — каждый PR обязан добавить .changeset/*.md, релизы атомарны
- Telemetry: privacy-first, opt-in, по умолчанию выключена. Можно подключить @theyahia/wwmcp-telemetry для метрик использования.

### 6. Уроки за месяц разработки (400 слов)

- **Гoтча 1:** `setup-node@v4` с `registry-url` создаёт `.npmrc` ожидающий `${NODE_AUTH_TOKEN}`, а не `${NPM_TOKEN}` — npm возвращает E404 при неверной авторизации (а не E401 как ожидаешь)
- **Гoтча 2:** Changesets публикует все workspace-пакеты включая `_template`. Ставь `private: true` чтобы исключить.
- **Гoтча 3:** при partial-fail релизе (некоторые пакеты опубликованы, некоторые нет) — следующий запуск получает E403 на уже опубликованных. Изоляция changesets по пакету решает.
- Что бы сделал иначе: сразу dual transport, сразу changesets, сразу `mcpName` для mcp.so listing.

### 7. Как добавить свой API (300 слов)

- `npx @theyahia/create-mcp <name> --region=<...> --category=<...> --base-url=<...>` — 30 секунд до working scaffold
- Production checklist: 8+ tools, vitest, README с demo prompts, changeset
- Список «good first issue» — национальные ЦБ постсоветских стран, public stats APIs, простые logistics tracking

### 8. Призыв (200 слов)

- ⭐ GitHub: https://github.com/theYahia/WWmcp
- 🌍 Свободно бери и используй (MIT)
- 🤝 PR welcome — особенно для стран не покрытых: Иран глубже, Узбекистан, Грузия, Беларусь, Армения, Казахстан, Кыргызстан, Африка вне Top-3
- 💬 Discussions для use-кейсов
- 📢 TG: @vhodvai

---

## Что вынести в отдельные посты (если первый зайдёт)

- Технический пост: «Как я написал `@theyahia/mcp-core` — общий слой для 25 MCP-серверов»
- Кейс-стади: «Полная автоматизация e-commerce в России через 6 MCP-серверов (без бэкенд-кода)»
- Тест-стади: «Тестирование MCP-серверов: vitest + undici MockAgent vs msw»

---

## Tone и стиль

- Хабр любит конкретику, гoтчи, конкретные цифры. Включи: точные версии npm-пакетов, точные ошибки CI, точные бенчмарки latency MCP-сервера.
- Не пиши «Anthropic не уделяет внимания не-западным рынкам» — это конфликтогенно. Пиши «открытый стандарт, открытые возможности».
- Скриншоты Claude Desktop в действии = сильное доказательство.

---

## После публикации

- Trackback в README: добавить «📰 Featured on Habr: [link]» рядом с badges
- Закрепить пост в Telegram канале @vhodvai
- Перевести ключевые тезисы в твиттер-thread (см. `hn-reddit-twitter.md`)
