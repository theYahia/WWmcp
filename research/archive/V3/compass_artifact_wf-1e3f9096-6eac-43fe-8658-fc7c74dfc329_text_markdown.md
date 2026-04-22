# Полный гид по публикации MCP-серверов: 50+ площадок для максимального охвата

**Экосистема MCP к марту 2026 года выросла до 19 000+ серверов в крупнейших каталогах**, а протокол стал де-факто стандартом — его приняли OpenAI, Google, Microsoft и десятки IDE. Для серии из 50 MCP-серверов для российских API существует **более 50 площадок** публикации, но стратегический приоритет имеют 15–20 ключевых. Протокол был передан в Agentic AI Foundation (Linux Foundation) в декабре 2025, что закрепило его нейтральный статус. Ниже — исчерпывающий анализ каждой площадки и пошаговый план запуска.

> ⚠️ **Критическая находка**: DaData уже запустила собственный официальный MCP-сервер на `https://dadata.ru/mcp/` (хостед-версия на `https://mcp.dadata.ru/mcp`). Также интеграцию DaData MCP предлагает Composio. Проект `dadata-mcp` должен чётко дифференцироваться — как локальная npm-устанавливаемая альтернатива с расширенным набором инструментов, поддержкой офлайн-режима и дополнительными возможностями, которых нет в официальном сервере.

---

## Специализированные MCP-каталоги: 16 директорий от канонических до нишевых

Экосистема каталогов MCP-серверов сформировала чёткую иерархию. На вершине — **Official MCP Registry**, запущенный в сентябре 2025 как «единый источник истины». Все крупные под-реестры (Smithery, PulseMCP, Glama) потребляют данные из него. Публикация в Official Registry через CLI-инструмент `mcp-publisher` с верификацией пространства имён через GitHub OAuth или DNS — это **первый и обязательный шаг** для любого MCP-сервера.

Крупнейший по количеству листингов каталог — **mcp.so** с **19 152+ серверами**, за ним **PulseMCP** (~13 000+) и **LobeHub** (10 000+ плагинов). Smithery.ai занимает особое место как каталог-и-хостинг одновременно: помимо листинга ~2 880+ серверов, он предоставляет управление OAuth, аналитику использования и инфраструктуру. **Docker MCP Catalog** (hub.docker.com/mcp) — новый мощный канал дистрибуции, запущенный в мае 2025, с криптографической верификацией и изоляцией контейнеров.

| # | Площадка | URL | Серверов | Подача заявки | Приоритет | Стоимость |
|---|----------|-----|----------|---------------|-----------|-----------|
| 1 | **Official MCP Registry** | registry.modelcontextprotocol.io | Каноническ. | CLI `mcp-publisher` + верификация | 🔴 Высший | Бесплатно |
| 2 | **Smithery.ai** | smithery.ai | 2 880+ | CLI `smithery mcp publish` или дашборд | 🔴 Высший | Бесплатно |
| 3 | **mcp.so** | mcp.so | 19 152+ | GitHub Issue на github.com/chatmcp/mcpso | 🔴 Высший | Бесплатно |
| 4 | **PulseMCP** | pulsemcp.com/servers | 13 230+ | Авто-обнаружение + форма Submit | 🔴 Высший | Бесплатно |
| 5 | **Glama.ai** | glama.ai/mcp/servers | Крупнейший* | Авто-индексация из GitHub/npm | 🔴 Высший | Бесплатно |
| 6 | **cursor.directory** | cursor.directory/plugins | 1 800+ | Веб-форма /plugins/new | 🔴 Высокий | Бесплатно |
| 7 | **LobeHub MCP** | lobehub.com/mcp | 10 000+ | Кнопка «Submit MCP» + CLI | 🔴 Высокий | Бесплатно |
| 8 | **Docker MCP Catalog** | hub.docker.com/mcp | 200+ верифиц. | PR в github.com/docker/mcp-registry | 🔴 Высокий | Бесплатно |
| 9 | **GitHub modelcontextprotocol/servers** | github.com/modelcontextprotocol/servers | Ссылки | Pull Request | 🟡 Средний | Бесплатно |
| 10 | **mcpservers.org** | mcpservers.org | Тысячи | Pull Request (awesome-list) | 🟡 Средний | Бесплатно |
| 11 | **mcp.directory** | mcp.directory | Крупный | Не документировано | 🟡 Средний | Бесплатно |
| 12 | **MCPHub.ai** | mcphub.ai | Растущий | Community contributions | 🟡 Средний | Бесплатно |
| 13 | **MCPMarket.com** | mcpmarket.com | Крупный | Не документировано | 🟡 Средний | Бесплатно |
| 14 | **OpenTools** | opentools.com/registry | Курируемый | Курируемый реестр | 🟢 Низкий | Бесплатно |
| 15 | **mcpserverfinder.com** | mcpserverfinder.com | Крупный | Не документировано | 🟢 Низкий | Бесплатно |
| 16 | **mcpserver.directory** | mcpserver.directory | Курируемый | Не документировано | 🟢 Низкий | Бесплатно |

**Азиатские и российские MCP-каталоги**: выделенных директорий не обнаружено. Китайские MCP-серверы (Alibaba Cloud, Tencent, Zhipu, Baidu Maps) листятся в глобальных каталогах — mcp.so, PulseMCP, Glama. Существует руководство на китайском `github.com/liaokongVFX/MCP-Chinese-Getting-Started-Guide`. Российских MCP-каталогов не существует — **это потенциальная ниша** для создания собственного.

---

## AI-экосистемы и IDE: каждая крупная платформа поддерживает MCP

OpenAI **полностью принял MCP** в марте 2025 — протокол стал основой ChatGPT Apps SDK, работает в OpenAI Codex и Agents SDK. Это означает, что любой MCP-сервер, опубликованный на npm, автоматически совместим с **Claude, ChatGPT, Cursor, VS Code, Windsurf, JetBrains** и десятками других клиентов. Публикация одного npm-пакета даёт доступ ко всей экосистеме.

**VS Code** — крупнейший потенциальный канал с **15M+ ежемесячных пользователей**. MCP поддерживается GA с июля 2025 (VS Code 1.102), есть встроенная галерея MCP-серверов с фильтром `@mcp` в панели расширений. **Windsurf** (Codeium) имеет **встроенный MCP Marketplace** прямо в настройках IDE — это прямой канал дистрибуции. **Continue.dev** запустил Continue Hub для обмена MCP-конфигурациями.

| # | Платформа | URL | Тип | Формат публикации | Аудитория | Приоритет |
|---|-----------|-----|-----|-------------------|-----------|-----------|
| 17 | **VS Code MCP Gallery** | code.visualstudio.com | IDE-галерея | Расширение или конфиг .vscode/mcp.json | 15M+ MAU | 🔴 Высокий |
| 18 | **Windsurf MCP Marketplace** | Встроен в IDE | IDE-маркетплейс | Через настройки MCP Toolkit | Миллионы | 🔴 Высокий |
| 19 | **Claude Code Plugins** | platform.claude.com/plugins/submit | Маркетплейс | Форма подачи, QA-ревью | Растущая | 🔴 Высокий |
| 20 | **ChatGPT Apps SDK** | platform.openai.com/docs/mcp | Платформа | MCP-сервер через Apps SDK, Streamable HTTP | Сотни млн | 🟡 Средний* |
| 21 | **Continue Hub** | hub.continue.dev | Хаб | YAML/JSON конфигурации | Растущая | 🟡 Средний |
| 22 | **JetBrains Marketplace** | plugins.jetbrains.com | Маркетплейс | JetBrains плагин | Миллионы | 🟡 Средний |
| 23 | **n8n MCP nodes** | docs.n8n.io | Интеграция | Community node или URL | 80K+ GH stars | 🟡 Средний |

*ChatGPT Apps SDK требует Streamable HTTP транспорта и OAuth — средний приоритет из-за дополнительной разработки.

**Awesome-списки на GitHub** — один из ключевых каналов обнаружения:

| Список | URL | Stars | Действие |
|--------|-----|-------|----------|
| **wong2/awesome-mcp-servers** | github.com/wong2/awesome-mcp-servers | **40K+** | PR — максимальный приоритет |
| **appcypher/awesome-mcp-servers** | github.com/appcypher/awesome-mcp-servers | 10K+ | PR |
| **TensorBlock/awesome-mcp-servers** | github.com/TensorBlock/awesome-mcp-servers | 500+ | PR |
| patriksimek/awesome-mcp-servers-2 | github.com/patriksimek/awesome-mcp-servers-2 | 1K+ | PR |
| rohitg00/awesome-devops-mcp-servers | github.com/rohitg00/awesome-devops-mcp-servers | Малый | PR если DevOps-релевантно |

---

## Российские площадки: от Habr до Telegram-каналов

**Habr.com** — ключевая площадка для русскоязычной аудитории. Статьи о MCP уже получают **66 000+ просмотров** (статья «Model Context Protocol — универсальный протокол для взаимодействия с ИИ» из Песочницы набрала 66K). Хабы «Искусственный интеллект», «Машинное обучение», «API» — прямые целевые. Публикация из Песочницы бесплатна, а при хорошей карме — напрямую.

**vc.ru** с **21M ежемесячных посетителей** подходит для бизнес-ориентированного контента. Раздел «AI» — прямое попадание. Статья публикуется мгновенно без пре-модерации, но нужно избегать явной рекламы.

**Telegram** — самый быстрый канал достижения российской AI-аудитории. Ключевые каналы для продвижения MCP-серверов:

- **@ai_machinelearning_big_data** (Machinelearning) — 50K+ подписчиков, AI/ML новости
- **@neurohive** (Neurohive) — 30–50K, ML/AI исследования
- **@llm_under_hood** (LLM под капотом) — 15–30K, LLM-продукты, идеальная аудитория для MCP
- **@techsparks** (Себрант) — 50K+, технологии и AI
- **@ai_newz** (Эйай ньюз) — 50K+, ежедневные AI-дайджесты

| # | Площадка | URL | Тип | Аудитория | Формат | Приоритет |
|---|----------|-----|-----|-----------|--------|-----------|
| 24 | **Habr.com** | habr.com | Медиа/блог | 10M+ в мес. | Техническая статья | 🔴 Высший (для RU) |
| 25 | **vc.ru** | vc.ru | Медиа/UGC | 21M+ в мес. | Статья в разделе AI | 🔴 Высокий |
| 26 | **Telegram каналы** | Список выше | Мессенджер | 200K+ совокупно | Пост/анонс | 🔴 Высокий |
| 27 | **proglib.io** | proglib.io | Образование | Крупный | Guest article | 🟡 Средний |
| 28 | **tproger.ru** | tproger.ru | Медиа | Крупный | Статья/новость | 🟡 Средний |
| 29 | **Битрикс24 Маркетплейс** | bitrix24.ru/apps | Маркетплейс | 4000+ приложений | REST API приложение | 🟢 Низкий* |
| 30 | **amoCRM Интеграции** | amocrm.ru/integrations | Маркетплейс | CRM-аудитория | Интеграция | 🟢 Низкий* |

*Российские маркетплейсы интеграций (Битрикс24, amoCRM, МойСклад, 1С) **не поддерживают MCP-протокол нативно**. Это маркетплейсы для REST API приложений и виджетов. Публикация MCP-серверов возможна только как контент-маркетинг: статьи о том, как использовать MCP + API этих платформ вместе. Для прямого попадания в их маркетплейсы нужно создавать полноценные REST-приложения, а не MCP-серверы.

**Важно**: связаться с **командой DaData** напрямую. Поскольку у них уже есть официальный MCP-сервер, можно предложить свой как community-альтернативу или расширенную версию для листинга на `solutions.dadata.ru`. DaData активно развивает экосистему интеграций через iPaaS-платформы вроде Albato (908 подключаемых приложений).

---

## Международные сообщества: Reddit, Discord, HN и другие

**Discord** — эпицентр MCP-сообщества. Три ключевых сервера: **Claude (Anthropic)** с **~77K участников**, **Model Context Protocol Community** с **~11.8K** и **MCP Contributors** (~3.8K, только для контрибьюторов, маркетинг запрещён). Community-сервер наиболее открыт для демонстрации проектов.

**Reddit** не имеет выделенного r/mcp для Model Context Protocol. Обсуждения распределены по **r/ClaudeAI** (~200K подписчиков), **r/LocalLLaMA** (~500K) и **r/MachineLearning** (~2.8M). Формат «I built 50 MCP servers for Russian APIs — here's what I learned» с техническим содержанием работает лучше всего.

**Hacker News** — проверенный канал для MCP. Множество «Show HN» постов о MCP-серверах уже получают вовлечение. Уникальный угол «Russian API ecosystem» выделяет проект среди 19 000+ существующих серверов. **Product Hunt** также показывает хорошие результаты: MCP-проекты получают сотни upvotes.

| # | Площадка | URL | Тип | Аудитория | Формат | Приоритет |
|---|----------|-----|-----|-----------|--------|-----------|
| 31 | **Discord MCP Community** | discord.gg/model-context-protocol... | Чат | 11.8K | Showcase-пост | 🔴 Высокий |
| 32 | **Discord Claude** | discord.gg/6PPFFzqPDZ | Чат | 77K | Showcase | 🔴 Высокий |
| 33 | **Reddit r/ClaudeAI** | reddit.com/r/ClaudeAI | Форум | ~200K | Пост с описанием | 🔴 Высокий |
| 34 | **Reddit r/LocalLLaMA** | reddit.com/r/LocalLLaMA | Форум | ~500K | Технический пост | 🔴 Высокий |
| 35 | **Hacker News** | news.ycombinator.com | Форум | Миллионы | Show HN | 🔴 Высокий |
| 36 | **Product Hunt** | producthunt.com | Лаунчпад | Миллионы | Запуск продукта | 🔴 Высокий |
| 37 | **Twitter/X** | twitter.com | Соцсеть | Миллионы | Тред + хэштеги | 🔴 Высокий |
| 38 | **dev.to** | dev.to | Блог-платформа | Миллионы | Статья-туториал | 🟡 Средний |
| 39 | **LinkedIn** | linkedin.com | Профессион. сеть | B2B | Статья/пост | 🟡 Средний |
| 40 | **Hashnode** | hashnode.com | Блог-платформа | 1M+ MAU | Статья | 🟡 Средний |
| 41 | **Medium** | medium.com | Блог-платформа | Массовая | Статья в паблике | 🟡 Средний |
| 42 | **IndieHackers** | indiehackers.com | Комьюнити | Нишевая | Building in public | 🟢 Низкий |
| 43 | **Stack Overflow** | stackoverflow.com | Q&A | Массовая | Ответы на вопросы | 🟢 Низкий |

**Хэштеги для Twitter/X**: `#MCP`, `#ModelContextProtocol`, `#MCPServer`, `#ClaudeAI`, `#AITools`, `#AIAgents`, `#OpenSource`. Ключевые аккаунты для тегирования: **@AnthropicAI**, корневые мейнтейнеры MCP (David Soria Parra, Den Delimarsky).

---

## SEO, npm и GitHub: техническая оптимизация для обнаружения

**npm — основной канал дистрибуции** MCP-серверов. Правильная оптимизация package.json критически важна. Рекомендуемые ключевые слова для каждого пакета:

```json
"keywords": [
  "mcp", "mcp-server", "model-context-protocol", "modelcontextprotocol",
  "claude", "ai", "llm", "anthropic", "cursor", "ai-tools", "ai-agent",
  "dadata", "russian-api", "address-validation", "data-enrichment"
]
```

Описание должно содержать все ключевые термины: `"Model Context Protocol (MCP) server for DaData.ru — Russian address validation, company lookup, and data enrichment for Claude, Cursor, and AI agents"`. Обязательно поле `bin` для запуска через `npx @theyahia/dadata-mcp`.

**Поисковые паттерны пользователей** при поиске MCP-серверов: `"MCP server [service]"` (основной), `"[service] MCP integration"`, `"Claude [service] integration"`, `"Cursor [service] MCP"`. Длинные хвосты вроде **«mcp server for russian apis»** и **«dadata address validation ai»** имеют **нулевую конкуренцию** — это золотая ниша для SEO.

**GitHub Topics** для каждого репозитория: `mcp-server`, `mcp`, `model-context-protocol`, `claude`, `ai`, `llm`, `dadata`, `russian-api`. Тема `mcp-server` на GitHub уже насчитывает тысячи репозиториев.

**Лендинг рекомендуется создать** — GitHub Pages сайт как хаб для всей коллекции из 50 серверов:

```
theyahia.github.io/russian-mcp-servers/
├── index.html       — Каталог всех 50 серверов
├── /dadata-mcp/     — Страница каждого сервера
├── /blog/           — Туториалы, анонсы
└── catalog.json     — Машиночитаемый каталог для реестров
```

Хаб-страница создаёт «эффект коллекции» — каждый из 50 серверов ведёт трафик к остальным. Google хорошо индексирует GitHub Pages, а коллекция из 50 серверов — гораздо более заметная история, чем одиночный пакет.

---

## Action plan: пошаговый план запуска

### Неделя 1 — Фундамент и каталоги

**День 1–2: Техническая подготовка**
- Убедиться, что dadata-mcp чётко дифференцирован от официального dadata.ru/mcp (расширенный набор инструментов, локальная установка, офлайн-возможности, дополнительные API-методы)
- Оптимизировать package.json: ключевые слова, описание, bin field, repository, homepage
- Оптимизировать README: бейджи, Quick Start с конфигами для Claude/Cursor/VS Code/Windsurf, таблица инструментов, раздел «Part of Russian MCP Servers Collection»
- Добавить GitHub Topics ко всем репозиториям

**День 3–4: Публикация в каталогах (Tier 1)**
- Опубликовать в Official MCP Registry через `mcp-publisher`
- Опубликовать на Smithery.ai через `smithery mcp publish`
- Подать GitHub Issue на mcp.so
- Подать на PulseMCP через форму Submit
- Убедиться что Glama.ai проиндексировал (автоматически из GitHub/npm)
- Подать на cursor.directory через /plugins/new
- Подать на LobeHub через кнопку «Submit MCP»

**День 5–7: Awesome-листы и GitHub**
- PR в wong2/awesome-mcp-servers (40K+ звёзд — **максимальный приоритет**)
- PR в appcypher/awesome-mcp-servers
- PR в modelcontextprotocol/servers (community list)
- PR в TensorBlock/awesome-mcp-servers
- PR в Docker MCP Registry (github.com/docker/mcp-registry) — если есть Docker-образ

### Неделя 2 — Контент и сообщества

**День 8–10: Русскоязычный контент**
- Написать статью на Habr: «Как я создал MCP-сервер для DaData и подключил Claude к российским данным» (хаб «Искусственный интеллект»). Цель: повторить успех в 66K+ просмотров
- Написать статью на vc.ru в раздел AI: бизнес-ориентированный угол — «Как MCP меняет работу с российскими API»
- Опубликовать анонс в Telegram: написать в @llm_under_hood, @neurohive, Cursor Community

**День 11–12: Англоязычный контент**
- Пост на dev.to: «I'm Building 50 MCP Servers for Russian APIs — Here's the First One» (теги: #ai, #mcp, #javascript, #showdev)
- Пост на Reddit r/ClaudeAI и r/LocalLLaMA
- Пост в Discord MCP Community (канал #showcase)
- Тред в Twitter/X с демонстрацией + хэштеги #MCP #ModelContextProtocol #ClaudeAI

**День 13–14: Product-платформы**
- Show HN на Hacker News: «Show HN: MCP Servers for Russian APIs (DaData, Yandex, etc.)»
- Подготовить карточку на Product Hunt (запланировать запуск на вторник/среду)

### Месяц 1 — Масштабирование и экосистема

**Неделя 3:**
- Создать GitHub Pages сайт-каталог для всей коллекции
- Подать в Claude Code Plugins (platform.claude.com/plugins/submit)
- Подать в Windsurf MCP Marketplace
- Подать в остальные каталоги (MCPHub.ai, MCPMarket.com, mcpservers.org, mcp.directory)
- Запустить на Product Hunt

**Неделя 4:**
- Статья на LinkedIn: профессиональный формат для B2B
- Кросс-пост на Hashnode и Medium (в паблики Towards Data Science, Better Programming)
- Написать в proglib.io и tproger.ru
- Связаться с командой DaData — предложить листинг на solutions.dadata.ru
- Начать работу над 2–3 следующими серверами для набора импульса

**До конца месяца:**
- Выпустить 5+ серверов и опубликовать roundup-статью: «5 новых MCP-серверов для российских API»
- Создать собственный Telegram-канал для русского MCP-экосистемы
- Настроить кросс-линковку: каждый npm-пакет → GitHub → лендинг → блог → другие серверы коллекции
- Мониторить аналитику: npm downloads, GitHub stars, Smithery install count

---

## Conclusion

Три стратегических вывода из исследования. **Во-первых**, экосистема MCP достигла зрелости — 19 000+ серверов, поддержка от всех крупных AI-компаний, стандартизация через Linux Foundation. Публикация одного npm-пакета даёт автоматическую совместимость с Claude, ChatGPT, Cursor, VS Code, Windsurf, n8n, LangChain и десятками других платформ. **Во-вторых**, «российские API» — это **подлинно уникальная и незанятая ниша**. При 19 000+ серверов в каталогах конкуренция высока для generic-инструментов, но практически нулевая для region-specific серверов. Ключевые слова вроде «mcp server for russian apis» имеют нулевые результаты — это редкое окно возможностей. **В-третьих**, коллекция из 50 серверов — значительно более мощная история, чем одиночный пакет. Именно позиционирование как «полная MCP-экосистема для российских API» создаёт эффект платформы и привлекает внимание медиа, каталогов и сообщества одновременно. Конкуренция с официальным DaData MCP-сервером требует чёткой дифференциации через расширенный функционал, локальную установку и коллекционный эффект.