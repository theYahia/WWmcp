# EXECUTION PLAN — Что конкретно кодить и делать

**Дата старта:** 2026-04-01
**Бюджет:** $200/мес Claude Code (Opus)
**Режим:** full-time, максимальный пуш
**Цель месяца:** первый реальный пользователь + Хабр-статья + 3 production сервера

---

## БЛОК 1: DaData MCP → Production (дни 1-2)

Это наш **главный козырь** — 31 tool vs 4 у конкурента. Сейчас код есть, но нет тестов, нет Streamable HTTP, README слабый.

### 1.1 Тесты (день 1, ~3-4 часа)

```
Промпт для Claude Code:

Перейди в репо dadata-mcp. Добавь тесты на Vitest.

1. Установи vitest как devDependency
2. Создай tests/ папку
3. Напиши тесты:

   a) unit тесты для каждого из 31 tool:
      - Проверь что tool зарегистрирован с правильным именем
      - Проверь Zod-схему параметров (валидные и невалидные данные)
      - Замокай HTTP-вызовы (используй msw или простые моки)
      - Проверь формат ответа

   b) integration тест:
      - Подключение через StdioClientTransport
      - listTools() возвращает 31 tool
      - Каждый tool имеет описание и inputSchema

   c) smoke тест:
      - Сервер запускается без ошибок
      - Сервер отвечает на initialize

4. Добавь script "test" в package.json
5. Запусти тесты, убедись что все зелёные
6. Добавь badge в README: [![Tests](https://github.com/theYahia/dadata-mcp/actions/workflows/test.yml/badge.svg)]

7. Создай .github/workflows/test.yml — GitHub Actions CI:
   - trigger: push, pull_request
   - node 20
   - npm ci && npm test && npm run build
```

### 1.2 Streamable HTTP (день 1, ~2-3 часа)

```
Промпт для Claude Code:

В dadata-mcp добавь Streamable HTTP транспорт.

Сейчас сервер работает только через stdio. Нужно добавить HTTP-транспорт
для работы через Smithery и удалённого хостинга.

1. В src/index.ts добавь второй транспорт:
   - Если запущен с аргументом --http или env HTTP_PORT, 
     запустить HTTP-сервер на указанном порту (default 3000)
   - Иначе — stdio как сейчас

2. Используй StreamableHTTPServerTransport из @modelcontextprotocol/sdk/server/streamableHttp
   - Один endpoint: /mcp
   - POST для JSON-RPC запросов
   - GET для SSE (server-sent events)
   - Заголовок Mcp-Session-Id для сессий

3. Добавь CORS headers (Origin validation)

4. Обнови README:
   - Секция "Stdio (default)": npx @metarebalance/dadata-mcp
   - Секция "HTTP": npx @metarebalance/dadata-mcp --http
   - Секция "Docker" (заготовка)

5. Проверь что оба транспорта работают:
   - stdio: echo '{"jsonrpc":"2.0","method":"initialize"...}' | npx ...
   - http: curl -X POST http://localhost:3000/mcp ...
```

### 1.3 README переделка (день 1, ~1 час)

```
Промпт для Claude Code:

Переделай README.md в dadata-mcp. Сделай его продающим и удобным.

Структура:
1. Одна строка: "31 инструмент для DaData API. Лучший MCP-сервер для российских адресов, компаний и данных."
2. Бейджи: npm version, downloads, tests, license
3. GIF-демо (создай placeholder, потом запишем) или текстовый пример диалога с Claude
4. "Быстрый старт" — 3 строки для Claude Desktop, Claude Code, Cursor
5. Таблица ВСЕХ 31 tools с описанием (группировка: адреса, компании, банки, телефоны, email, паспорта, авто, гео, справочники)
6. Примеры запросов (5 самых полезных):
   - "Найди адрес по строке 'москва тверская 1'"
   - "Проверь компанию по ИНН 7707083893"
   - "Стандартизируй телефон +7 916 1234567"
   - "Покажи ближайшее отделение почты к координатам 55.75, 37.62"
   - "Проверь паспорт 4509 123456"
7. Сравнение с официальным DaData MCP: таблица (31 tools vs 4, локальный vs hosted, npm vs API)
8. Streamable HTTP: как запустить удалённо
9. Раздел серии: ссылка на russian-mcp
10. Contributing + License
```

### 1.4 smithery.yaml (день 1, ~30 мин)

```
Промпт для Claude Code:

Создай файл smithery.yaml в корне dadata-mcp для публикации на Smithery.

smithery.yaml:
  name: dadata-mcp
  description: "DaData API MCP server — 31 tools for Russian address validation, company lookup, geocoding"
  icon: 🇷🇺
  
  startCommand:
    type: stdio
    configSchema:
      type: object
      required:
        - DADATA_API_KEY
      properties:
        DADATA_API_KEY:
          type: string
          description: "DaData API key from dadata.ru"
    commandFunction: |-
      (config) => ({
        command: 'npx',
        args: ['-y', '@metarebalance/dadata-mcp'],
        env: { DADATA_API_KEY: config.DADATA_API_KEY }
      })

Закоммить и запушь.
```

---

## БЛОК 2: МойСклад MCP → Production (день 2-3)

### 2.1 Аудит текущего кода (день 2, ~1 час)

```
Промпт для Claude Code:

Открой репо moysklad-mcp. Проведи аудит:
1. Сколько tools реализовано? Какие?
2. Работает ли client.ts? Правильная ли авторизация (Basic Auth / Bearer)?
3. Обрабатываются ли цены в копейках (×100)?
4. Есть ли rate limiting (45 req/3 сек)?
5. Качество error handling
6. Выведи список проблем и что нужно доработать

НЕ МЕНЯЙ КОД — только аудит и отчёт.
```

### 2.2 Доработка по аудиту (день 2, ~3-4 часа)

```
Промпт для Claude Code:

На основании аудита доработай moysklad-mcp:

1. Убедись что есть все 10 tools из спецификации:
   search_products, get_product, create_product, get_stock, update_prices,
   get_counterparties, create_customer_order, get_orders, get_profit_report, create_supply

2. Добавь throttling (45 req/3 сек) через простой token bucket
3. Конвертация копейки ↔ рубли во всех tools
4. Error handling: парсить ошибки МойСклад, возвращать читаемые сообщения
5. Поддержка двух типов auth: Basic (login+password) и Bearer (token)

Rate limit МойСклад: 45 запросов в 3-секундном окне.
Base URL: https://api.moysklad.ru/api/remap/1.2/
Content-Type: application/json;charset=utf-8
```

### 2.3 Тесты + Streamable HTTP + smithery.yaml (день 2-3, ~3 часа)

```
Аналогично DaData — добавь Vitest тесты, Streamable HTTP транспорт, 
smithery.yaml, GitHub Actions CI, обнови README.

Специфика МойСклад:
- Env vars: MOYSKLAD_LOGIN + MOYSKLAD_PASSWORD или MOYSKLAD_TOKEN
- Цены в копейках в API, в рублях в ответах пользователю
- Rate limit: 45 req/3 сек
```

---

## БЛОК 3: СДЭК MCP → Production (день 3)

### 3.1 Аудит + доработка (день 3, ~3-4 часа)

```
Промпт для Claude Code:

Открой репо cdek-mcp. Аудит + доработка:

1. Проверь все 8 tools: calculate_tariff, create_order, get_order, track_shipment,
   list_delivery_points, get_cities, generate_barcode, delete_order

2. Проверь OAuth 2.0 Client Credentials:
   - TokenManager: получение, кеширование, авто-обновление за 60 сек до истечения
   - Поддержка sandbox (CDEK_SANDBOX=true → api.edu.cdek.ru)
   - Тестовые credentials: EMscd6r9JnFiQ3bLoyjJY6eM78JrJceI / PjLZkKBHEiLK3YsjtNrt3TGNG0ahs3kh

3. Error handling для СДЭК API

4. Добавь тесты, Streamable HTTP, smithery.yaml, CI, обнови README
```

---

## БЛОК 4: Контент — Хабр-статья (день 4-5)

### 4.1 Написать статью (день 4, ~4-5 часов)

```
Промпт для Claude Code:

Напиши статью для Хабр на тему:
"Я написал 47 MCP-серверов для российских API за 2 дня — вот что я понял"

Автор: theYahia

Структура:

1. HOOK (2 абзаца)
   - "Две ночи, 47 серверов, ноль пользователей. Вот честная история."
   - Кратко: что такое MCP, зачем оно, почему я решил покрыть весь российский стек

2. ЧТО Я СДЕЛАЛ (с конкретикой)
   - 47 серверов: платежи, маркетплейсы, CRM, доставка, HR, аналитика
   - Стек: TypeScript, @modelcontextprotocol/sdk, Zod
   - Опубликовано на npm (@theyahia/*), GitHub, Official MCP Registry, 7 каталогов
   - DaData MCP — 31 инструмент (таблица: наш vs официальный)

3. ДЕМО — конкретный пример с DaData
   - Скриншот/текст диалога с Claude:
     "Проверь компанию по ИНН 7707083893" → результат
     "Стандартизируй адрес москва тверская 1" → результат
   - JSON конфигурации для Claude Desktop (copy-paste)

4. ЧТО Я ПОНЯЛ — честные выводы
   - 97% MCP-серверов — мусор. Как не стать частью
   - Реферальная модель не работает (и почему)
   - Claude заблокирован в РФ — слон в комнате
   - 47 серверов без тестов = техдолг, не актив
   - amoCRM уже занят конкурентом (36 tools)
   - Окно возможностей реально, но сужается

5. ТЕХНИЧЕСКИЕ ДЕТАЛИ (для тех кто хочет сам)
   - Архитектура: index.ts → client.ts → tools/*.ts → types.ts
   - Zod-схемы для параметров
   - Error handling для AI-агентов
   - Streamable HTTP транспорт
   - Пример кода (ключевой фрагмент)

6. ЧТО ДАЛЬШЕ
   - 3 сервера в production-фокусе: DaData, МойСклад, СДЭК
   - Freemium через MCPize
   - CIS: Казахстан (0 MCP-серверов, Kaspi 721K продавцов)

7. ССЫЛКИ
   - GitHub: github.com/theYahia/russian-mcp
   - npm: npmjs.com/org/theyahia
   - Telegram: [канал]
   - "Ставьте звезду если полезно"

Тон: честный, технический, без воды. Build-in-public формат.
Длина: 2000-3000 слов.
Хабы: Open Source, API, AI, Node.js
Сохрани в файл HABR_ARTICLE_1.md
```

### 4.2 Telegram-канал (день 4, ~30 мин)

```
Действие руками:
1. Создать канал в Telegram: "MCP Россия" или "Russian MCP Servers"
2. Описание: "47 MCP-серверов для российских API. Open source. @theYahia"
3. Первый пост: "Запустил серию из 47 MCP-серверов для российских API. 
   DaData (31 tool), МойСклад, СДЭК, ЮKassa, Ozon, WB и ещё 41.
   Всё open source: github.com/theYahia/russian-mcp"
4. Ссылку канала добавить в README всех серверов
```

---

## БЛОК 5: mcp.so — подать все 47 (день 5)

### 5.1 Автоматизация подачи на mcp.so

```
Промпт для Claude Code:

Мне нужно подать 46 серверов на mcp.so (1 уже подан — dadata).
У mcp.so есть форма submit. Проверь: есть ли API или только веб-форма?

Если только форма — подготовь данные для каждого из 46 серверов:
- Name
- GitHub URL
- npm package
- Description (до 100 символов)
- Server Config JSON

Сгенерируй файл mcp_so_submissions.json с данными для всех 46,
чтобы я мог быстро копировать и вставлять.
```

---

## БЛОК 6: Лендинг GitHub Pages (день 6, ~3 часа)

```
Промпт для Claude Code:

Создай лендинг для github.com/theYahia/russian-mcp на GitHub Pages.

Файл: docs/index.html (или отдельная ветка gh-pages)

Дизайн: минималистичный, тёмная тема, один HTML файл с inline CSS.

Контент:
1. Заголовок: "47 MCP-серверов для российских API"
2. Подзаголовок: "Подключи Claude, Cursor, VS Code к DaData, МойСклад, СДЭК, Ozon, WB и ещё 42 сервисам"
3. Три карточки: DaData (31 tool), МойСклад (10 tools), СДЭК (8 tools) — с кнопками "npm install" и "GitHub"
4. Таблица всех 47 серверов (группировка по категориям)
5. Quick start: JSON конфиг для Claude Desktop (copy-paste)
6. Автор: @theYahia, GitHub, Telegram
7. Footer: MIT License, 2026

SEO: title, description, og:tags для шаринга
Responsive: мобильный + десктоп
```

---

## БЛОК 7: npm publish обновлённых серверов (день 6, ~1 час)

```
Промпт для Claude Code:

Для каждого из 3 серверов (dadata-mcp, moysklad-mcp, cdek-mcp):
1. npm run build — убедись что чистая сборка
2. npm version patch
3. npm publish --access public
4. mcp-publisher publish (обновить в Official Registry)
5. git push

Потом обнови витрину russian-mcp README: DaData, МойСклад, СДЭК → ✅ с числом tools.
```

---

## БЛОК 8: ЗАПУСК — день 7

### 8.1 Публикация Хабр (утро)

```
Действие руками:
1. Опубликовать статью на Habr (хабы: Open Source, API, AI, Node.js)
2. Сразу после — пост в Telegram-канал со ссылкой
3. Пост в @pro_mcp
4. Reddit: r/mcp, r/ClaudeAI — "I built 47 MCP servers for Russian APIs"
5. Twitter/X: тред с 3-5 постами + скриншоты/GIF
```

### 8.2 Мониторинг (весь день)

```
Отслеживать:
- Habr: просмотры, закладки, комментарии — ОТВЕЧАТЬ НА ВСЕ
- GitHub: stars, issues, forks
- npm: downloads (npmjs.com/org/theyahia)
- Reddit: upvotes, комментарии — ОТВЕЧАТЬ НА ВСЕ
```

---

## БЛОК 9: Неделя 2 — контент + маркетплейсы сервисов

### 9.1 Вторая Хабр-статья (дни 9-10)

```
"MCP для e-commerce: управляй Ozon, WB и МойСклад через AI"

Фокус на конкретных сценариях:
- "Покажи товары с остатком < 5 на всех площадках"
- "Обнови цены на 10% в категории Электроника"  
- "Какая выручка за март по всем маркетплейсам?"

С честным disclaimer: что работает, что нет (real-time sync не работает).
```

### 9.2 Подача в маркетплейсы самих сервисов (дни 10-11)

```
Промпт для Claude Code:

Подготовь материалы для подачи DaData MCP в каталог интеграций DaData:
1. Проверь есть ли у DaData каталог интеграций / solutions
2. Подготовь description, скриншоты, конфигурацию
3. Напиши письмо для tech-команды DaData

Аналогично для МойСклад → маркетплейс приложений (dev.moysklad.ru)
```

---

## БЛОК 10: Неделя 3 — монетизация + first-mover КЗ

### 10.1 MCPize freemium (дни 15-17)

```
Промпт для Claude Code:

Исследуй MCPize.com:
1. Как опубликовать MCP-сервер на MCPize?
2. Какой формат нужен? API? Dashboard?
3. Как работает freemium модель (5 бесплатных запросов → подписка)?
4. Как настроить pricing ($5-9/мес)?
5. Как получать выплаты (85% revenue share)?

Подготовь DaData MCP для публикации на MCPize.
```

### 10.2 Kaspi MCP — first-mover claim (дни 19-20)

```
Промпт для Claude Code:

Доработай существующий kaspi-mcp для Kaspi Marketplace Seller API.

Документация: https://guide.kaspi.kz/partner/ru/shop/api/general
Протокол: JSON:API (application/vnd.api+json)
Base URL: https://kaspi.kz/shop/api/v2
Auth: Header X-Auth-Token
Env: KASPI_AUTH_TOKEN

Минимум 5-8 tools:
1. get_orders — GET /v2/orders
2. get_order — GET /v2/orders/{id}
3. get_order_items — GET /v2/orders/{id}/entries
4. update_order_status — POST /v2/orders
5. get_cities — GET /v2/cities

Добавь тесты, README, smithery.yaml. Опубликуй на npm и Official Registry.
Это first-mover claim — первый MCP для Kaspi в мире.
```

### 10.3 dev.to статья (дни 17-18)

```
"I Built 47 MCP Servers for Russian APIs in 2 Days — Here's What I Learned"

Английская версия Хабр-статьи, адаптированная для международной аудитории.
Tags: #ai #mcp #opensource #showdev
```

---

## БЛОК 11: Неделя 4 — РАЗВИЛКА

### Метрики для оценки (день 22-25)

```
Промпт для Claude Code:

Собери метрики за первый месяц:

1. npm downloads:
   curl "https://api.npmjs.org/downloads/point/last-month/@metarebalance/dadata-mcp"
   И для каждого @theyahia/* пакета

2. GitHub stars:
   gh api repos/theYahia/dadata-mcp --jq '.stargazers_count'
   gh api repos/theYahia/russian-mcp --jq '.stargazers_count'

3. Проверь issues/PR на всех репо:
   gh search issues --owner theYahia --state open

Выведи сводку в формате таблицы.
```

### Решение

| Результат | Действие |
|-----------|----------|
| >500 downloads, >5 пользователей | Масштабируй: ещё 2-3 сервера в production, больше контента, MCPize |
| 100-500 downloads, 1-5 пользователей | Продолжай контент, ищи consulting leads |
| <100 downloads, 0 пользователей | Pivot на consulting: 47 серверов = портфолио, ищи контракты 100-300K₽ |

---

## ПАРАЛЛЕЛЬНЫЕ ЗАДАЧИ (делать в фоне когда ждёшь)

### GitHub Actions CI для всех 47 репо

```
Промпт для Claude Code:

Создай единый GitHub Actions workflow и добавь его во все 47 MCP-репо.

.github/workflows/ci.yml:
- trigger: push to main, pull_request
- matrix: node [18, 20]
- steps: checkout, setup-node, npm ci, npm run build
- (если есть тесты: npm test)

Скрипт: для каждого репо в gh repo list theYahia — клонируй, добавь workflow, коммит, пуш.
```

### Обновить все README — единый формат

```
Промпт для Claude Code:

Для каждого из 47 MCP-репо обнови README по шаблону:

1. Одна строка описания
2. Бейджи: npm, license
3. Quick Start: Claude Desktop JSON, Claude Code command, Cursor
4. Таблица tools
5. Примеры запросов (2-3)
6. Раздел серии: ссылка на russian-mcp + Telegram
7. License

Автоматизируй через скрипт: clone → update README → commit → push.
НЕ ТРОГАЙ src/ код — только README.md.
```

### Keywords и SEO для всех package.json

```
Промпт для Claude Code:

Для каждого из 47 пакетов проверь и обнови package.json:

1. keywords содержит: "mcp", "mcp-server", "model-context-protocol",
   "claude", "ai", "llm", "russian-api", + сервис-специфичные
2. homepage указывает на GitHub репо
3. repository.url правильный
4. description — до 100 символов, информативное
5. mcpName — io.github.theYahia/SERVICE-mcp (уже добавлено)

Автоматизируй: clone → update → commit → push → npm publish.
```

---

## ЧЕКЛИСТ ГОТОВНОСТИ К ЗАПУСКУ (день 7)

| # | Пункт | Статус |
|---|-------|--------|
| 1 | DaData MCP: тесты зелёные | ✅ 99 тестов, 6 файлов, все green |
| 2 | DaData MCP: Streamable HTTP работает | ⬜ |
| 3 | DaData MCP: README переделан | ⬜ |
| 4 | DaData MCP: smithery.yaml | ⬜ |
| 5 | DaData MCP: опубликован на Smithery | ⬜ |
| 6 | DaData MCP: CI (GitHub Actions) | ⬜ |
| 7 | МойСклад MCP: аудит + доработка | ⬜ |
| 8 | МойСклад MCP: тесты + Streamable HTTP | ⬜ |
| 9 | СДЭК MCP: аудит + доработка | ⬜ |
| 10 | СДЭК MCP: тесты + Streamable HTTP | ⬜ |
| 11 | Хабр-статья написана | ⬜ |
| 12 | Telegram-канал создан | ⬜ |
| 13 | mcp.so: данные для 46 серверов подготовлены | ⬜ |
| 14 | Лендинг GitHub Pages | ⬜ |
| 15 | npm publish для 3 обновлённых серверов | ⬜ |
| 16 | Registry обновлён для 3 серверов | ⬜ |
| 17 | Витрина russian-mcp обновлена | ⬜ |
| 18 | р/с ИП открыт (Точка) | 🟡 регистрация в процессе |
| 19 | Рефка DaData зарегистрирована | 🟡 DaData ответили! Ждёт: р/с → реквизиты на dadata.ru/profile/#company → написать им → получить ссылку |
| 20 | Рефка МойСклад зарегистрирована | ⬜ |

---

*Каждый промпт выше — готов к копированию в Claude Code CLI. Максимальный пуш.*
