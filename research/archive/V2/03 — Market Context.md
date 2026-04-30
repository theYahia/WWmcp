# Контекст рынка — российские MCP-серверы

**Дата:** 2026-03-29

---

## Рынок

- Глобальная экосистема MCP: **20 000+ серверов**
- Российские сервисы представлены в **менее 0.05%** из них
- Рынок GenAI в России вырос **в 5 раз** до ₽58 млрд в 2025
- **71% компаний** уже используют генеративный ИИ
- **850 000+ селлеров** на маркетплейсах нуждаются в автоматизации

## Наш проект

**@metarebalance/dadata-mcp** — первый полноценный standalone MCP-сервер для DaData.ru.

- **27 tools** покрывающих 100% API DaData
- Конкуренты: официальный MCP (4 tools), Composio (~40 tools но platform-dependent)
- Опубликован на GitHub: https://github.com/theYahia/dadata-mcp
- npm: @metarebalance/dadata-mcp (ещё не опубликован)

## Цель автора

Засветиться как разработчик в российском AI-комьюнити. Набрать статус через полезные open-source инструменты. DaData — первый из серии MCP-серверов для российских сервисов.

## Каналы публикации

| Канал | Статус |
|-------|--------|
| GitHub (theYahia/dadata-mcp) | Опубликован |
| npm (@metarebalance/dadata-mcp) | НЕ опубликован |
| neuraldeep.ru | НЕ залистен |
| glama.ai | НЕ залистен |
| smithery.ai | НЕ залистен |
| mcp.so | НЕ залистен |
| Habr | Статья НЕ написана |
| Telegram | Канал НЕ создан |

## Следующие MCP после DaData (приоритет по скору)

| # | MCP-сервер | Score | Сложность |
|---|------------|:-----:|-----------|
| 1 | ЮKassa Payments | 36/40 | LOW |
| 2 | hh.ru Recruiter | 36/40 | LOW |
| 3 | МойСклад Inventory | 36/40 | LOW |
| 4 | Ozon Seller | 36/40 | MEDIUM |
| 5 | СДЭК Logistics | 34/40 | LOW |
| 6 | DaData Enrichment | 34/40 | DONE |
| 7 | Yandex Ads Stack | 33/40 | MEDIUM |
| 8 | Marketplace Multi-Analytics | 33/40 | HIGH |
| 9 | Wildberries Pro | 32/40 | MEDIUM |
| 10 | Яндекс.Маркет Seller | 32/40 | MEDIUM |

## Конкурентный ландшафт DaData MCP

### Официальный MCP DaData (mcp.dadata.ru)
- Remote MCP сервер
- **4 tools**: find_party, clean_address, find_company_by_email, find_company_by_domain
- Требует supergateway proxy для Claude Desktop
- Нет resources, prompts, batch, кеширования

### Composio DaData
- ~40 tools через hosted платформу
- Требует аккаунт Composio + API ключ Composio
- Ключи DaData хранятся на серверах Composio
- Добавляет латентность, нет offline/local режима
- Нет resources/prompts

### Наш @metarebalance/dadata-mcp
- **27 tools** — полное покрытие API
- Локальный npm пакет (npx запуск)
- 2 resources + 2 prompts
- 99 тестов + security audit
- Ключи остаются у пользователя (env vars)
- Zero-dependency HTTP client (native fetch)
- MIT license

## neuraldeep.ru — платформа для листинга

Открытый каталог AI-скиллов для российских разработчиков:
- Категории: Skills, MCP Servers, CLI Tools
- Поддержка: Claude Code, Cursor, Copilot, Windsurf + российские агенты (GigaCode, Koda, SourceCraft)
- Фокус: интеграции с Yandex, Bitrix24, 1С, GigaChat, Wildberries
- Добавление: `npx skillsbd add <owner/repo>`
- DaData на neuraldeep.ru пока **НЕТ** — мы будем первыми

## Монетизация

- Реферальная программа DaData: **30% revenue share** от привлечённых клиентов
- Hosted MCP через MCPize (85/15 split)
- Premium features (кеш, batch, SLA) — будущее
