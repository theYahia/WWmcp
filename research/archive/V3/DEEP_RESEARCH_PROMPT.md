# Контекст для глубокого исследования: @theyahia MCP-серия для российских API

## Кто я

**theYahia** — соло-разработчик. npm аккаунт: `metarebalance`, npm org: `@theyahia`. GitHub: github.com/theYahia. Есть ИП (нужно открыть расчётный счёт). Стек: TypeScript.

## Что уже сделано (за 1 день, 30–31 марта 2026)

### 47 MCP-серверов опубликованы на npm и GitHub

Серия **Russian API MCP** — крупнейшая коллекция MCP-серверов для российских API. Витрина: https://github.com/theYahia/russian-mcp

Каждый MCP:
- TypeScript + @modelcontextprotocol/sdk + Zod
- npm пакет под `@theyahia/` (кроме dadata-mcp под `@metarebalance/`)
- GitHub репозиторий
- .mcp.json (для cursor.directory)
- README с установкой для Claude Desktop, Claude Code, VS Code/Cursor, Windsurf
- Минимум 1 Claude Code skill (.claude/skills/*/SKILL.md)
- MIT лицензия

### Полный список (47 готовых + 3 SOON):

**Данные и обогащение:**
- @metarebalance/dadata-mcp — 31 tool, v1.0.4 (адреса, компании, банки, телефоны, паспорта, геолокация, 12 справочников)
- @theyahia/kontur-focus-mcp — 4 tools (проверка контрагентов)
- @theyahia/cbr-mcp — 5 tools (курсы ЦБ, ключевая ставка, металлы, конвертация)
- @theyahia/chestnyznak-mcp — 2 tools (маркировка товаров)

**Платежи (4):**
- @theyahia/yookassa-mcp — 10 tools (платежи, возвраты, чеки 54-ФЗ)
- @theyahia/tkassa-mcp — 5 tools (T-Kassa/Tinkoff)
- @theyahia/robokassa-mcp — 2 tools
- @theyahia/cloudpayments-mcp — 6 tools

**CRM и управление (8):**
- @theyahia/amocrm-mcp — 5 tools
- @theyahia/bitrix24-mcp — 4 tools
- @theyahia/moysklad-mcp — 4 tools
- @theyahia/retailcrm-mcp — 3 tools
- @theyahia/megaplan-mcp — 3 tools
- @theyahia/planfix-mcp — 3 tools
- @theyahia/kaiten-mcp — 3 tools
- @theyahia/elma365-mcp — 3 tools

**Доставка (4):**
- @theyahia/cdek-mcp — 6 tools (OAuth2 + sandbox)
- @theyahia/boxberry-mcp — 4 tools
- @theyahia/delovye-linii-mcp — 3 tools
- @theyahia/pochta-russia-mcp — 3 tools

**Маркетинг и аналитика (8):**
- @theyahia/yandex-metrika-mcp — 4 tools
- @theyahia/yandex-direct-mcp — 4 tools
- @theyahia/yandex-webmaster-mcp — 3 tools
- @theyahia/unisender-mcp — 4 tools
- @theyahia/sendpulse-mcp — 3 tools
- @theyahia/roistat-mcp — 2 tools
- @theyahia/calltouch-mcp — 2 tools
- @theyahia/mindbox-mcp — 3 tools

**HR и рекрутинг (3):**
- @theyahia/hh-mcp — 6 tools (без авторизации)
- @theyahia/superjob-mcp — 2 tools
- @theyahia/huntflow-mcp — 4 tools

**Коммуникации (7):**
- @theyahia/vk-mcp — 4 tools
- @theyahia/jivosite-mcp — 3 tools
- @theyahia/mts-exolve-mcp — 3 tools
- @theyahia/mango-office-mcp — 2 tools
- @theyahia/voximplant-mcp — 3 tools
- @theyahia/sms-ru-mcp — 3 tools
- @theyahia/tilda-mcp — 3 tools

**AI и ML (4):**
- @theyahia/gigachat-mcp — 3 tools (OAuth TokenManager)
- @theyahia/yandexgpt-mcp — 3 tools
- @theyahia/salutespeech-mcp — 2 tools
- @theyahia/yandex-speechkit-mcp — 2 tools

**Финансы (2):**
- @theyahia/sber-mcp — 2 tools
- @theyahia/1c-rest-mcp — 3 tools

**Другое (3):**
- @theyahia/travelpayouts-mcp — 3 tools
- @theyahia/kaspi-mcp — 3 tools
- @theyahia/getcourse-mcp — 3 tools

**E-commerce (3 SOON):**
- @theyahia/ozon-mcp — зарезервирован
- @theyahia/wildberries-mcp — зарезервирован
- @theyahia/yandex-market-mcp — зарезервирован

### Площадки где мы есть

**Автоматические (подано для всех 47):**
- LobeHub (PRs #3-7)
- cline/mcp-marketplace (Issues #1118-#1175)
- Glama.ai (автоиндексация из npm)
- VS Code MCP Gallery (автоматом из npm)
- n8n (автоматом из npm)

**Частично:**
- mcp.so — подан только dadata-mcp
- cursor.directory — подан только dadata-mcp

**Не подано (руками):**
- Official MCP Registry (нужен mcp-publisher CLI)
- mcpservers.org (форма)
- mcpmarket.com (форма)
- mcp.directory (GitHub issue)
- Claude Code Plugins (форма + ревью Anthropic)
- Smithery (нужен HTTP transport)

### Конкурентная ситуация

- DaData запустила свой официальный MCP: dadata.ru/mcp (4 tools) — у нас 31 tool
- Для остальных 46 российских API MCP-серверов конкурентов **нет**
- В мире 19 000+ MCP серверов, но для российских API — мы единственные
- Ключевые слова «mcp server for russian apis» имеют **нулевую конкуренцию** в SEO

### Монетизация

- Реферальные программы: ЮKassa, МойСклад, amoCRM, СДЭК, Unisender, CloudPayments — БЛОКЕР: нужен расчётный счёт ИП
- Контент: Habr, vc.ru, Telegram — ещё не начат
- GitHub Stars: пока мало (только запустились)

---

## Что нужно исследовать

### 1. Стратегия роста до #1 в российском MCP-пространстве

- Как максимально быстро набрать npm downloads и GitHub stars?
- Какие метрики отслеживать еженедельно?
- Как создать «эффект платформы» — чтобы люди искали именно @theyahia когда им нужен российский MCP?
- Нужен ли свой Telegram-канал? Если да — как его развивать?
- Стоит ли создать русскоязычный MCP-каталог (russian-mcp.ru)?

### 2. Качество и доработка существующих 47 MCP

- Какие из 47 серверов наиболее востребованы и заслуживают углубления (больше tools, лучше error handling, тесты)?
- Нужны ли интеграционные тесты? Как организовать тестирование с sandbox/mock API?
- Стоит ли добавить HTTP transport (Streamable HTTP) ко всем серверам для совместимости с OpenAI/Smithery?
- Как организовать CI/CD — автоматический build + publish при каждом push?
- Нужен ли монорепозиторий вместо 47 отдельных?

### 3. E-commerce тройка (Ozon, Wildberries, Yandex.Market)

- Это самые востребованные API в России. Как сделать их максимально качественно?
- У Ozon и WB сложные API с rate limits — стратегия?
- Есть ли уже чужие MCP для этих маркетплейсов?
- Можно ли сделать единый e-commerce стек (dadata + payment + moysklad + cdek + ozon)?

### 4. Контент-стратегия

- Habr: какие заголовки/темы дадут максимум просмотров?
- vc.ru: бизнес-угол или технический?
- Telegram: собственный канал или постинг в чужие?
- Twitter/X, Reddit, HN — стоит ли для русского проекта?
- Product Hunt — когда и как запускаться?
- dev.to, Medium — стоит ли переводить на английский?

### 5. Монетизация

- Реферальные программы: какие ещё есть кроме тех что в плане?
- GitHub Sponsors — стоит ли?
- Платная поддержка / консалтинг?
- Можно ли продавать «пакеты интеграций» (настройка MCP + обучение)?
- SaaS модель: hosted MCP серверы за подписку?

### 6. Техническое развитие

- HTTP transport / Streamable HTTP — приоритет?
- Docker-образы для каждого MCP?
- Единый CLI для установки всей серии (`npx @theyahia/russian-mcp install dadata cbr yookassa`)?
- GitHub Actions для автоматической публикации на Official MCP Registry?
- Мониторинг здоровья API (uptime, версии, breaking changes)?

### 7. Партнёрства

- Как связаться с командами DaData, ЮKassa, amoCRM, МойСклад, СДЭК, Ozon?
- Можно ли стать официальным интегратором / technology partner?
- Стоит ли предлагать бесплатные MCP серверы сервисам в обмен на листинг в их документации?
- Anthropic MCP ecosystem — как попасть в рекомендуемые?

### 8. Международная экспансия

- Казахстан (Kaspi уже есть), Узбекистан, другие страны СНГ?
- Турция, Индия, Бразилия — похожие рынки с локальными API?
- Нужен ли отдельный бренд или оставить @theyahia?

---

## Формат ответа

Дай подробный стратегический план по каждому из 8 разделов выше. Для каждого пункта:
- Конкретные действия (не абстрактные советы)
- Приоритет (высокий/средний/низкий)
- Ожидаемый эффект
- Сроки
- Риски

Особый фокус на то что даст максимальный результат в первые 2 недели — проект только запустился и нужен быстрый рост для создания моментума.
