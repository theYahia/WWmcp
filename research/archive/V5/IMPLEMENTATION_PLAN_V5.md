# ПЛАН ИМПЛЕМЕНТАЦИИ V5 — От исследования к действиям

**Дата:** 2026-03-31
**Источник:** compass_artifact V5 (74db) + V5 status + монорепа mcp-servers
**Цель:** Первый реальный пользователь за 7 дней. Первые деньги за 30 дней.

---

## БЛОК A: ИНФРАСТРУКТУРА МОНОРЕПЫ (Дни 1-2)

### A1. Quickstart README для монорепы
**Файл:** `D:/DEV/Yahia/mcp-servers/README.md`
**Effort:** 2 часа | **Impact:** критический

Создать README с:
- Hero-секция: "48 MCP-серверов для российских API" + бейджи (npm, build, license)
- Quickstart: МойСклад MCP + Continue.dev + GigaChat за 10 минут
- Таблица всех 11 мигрированных серверов с описанием и статусом
- Конфигурация для Claude Desktop, Cursor, Continue.dev, n8n
- E-commerce бизнес-кейс: "заказ → доставка → проверка реквизитов в одном промпте"

### A2. Quickstart-гайд Continue.dev + GigaChat
**Файл:** `D:/DEV/Yahia/mcp-servers/docs/quickstart-continuedev-gigachat.md`
**Effort:** 3 часа | **Impact:** очень высокий

Пошаговый гайд:
1. Установка Continue.dev в VS Code
2. Настройка GigaChat через gpt2giga прокси
3. Добавление МойСклад MCP в конфиг Continue.dev
4. Первый запрос: "Покажи товары на складе с остатком > 10"
5. JSON-конфиг с примерами

### A3. Dockerfiles для 3 фокусных серверов
**Файлы:**
- `D:/DEV/Yahia/mcp-servers/servers/moysklad/Dockerfile`
- `D:/DEV/Yahia/mcp-servers/servers/cdek/Dockerfile`
- `D:/DEV/Yahia/mcp-servers/servers/cbr/Dockerfile`
- `D:/DEV/Yahia/mcp-servers/Dockerfile.shared` (base)
**Effort:** 4 часа | **Impact:** высокий

Shared multi-stage Dockerfile:
```
FROM node:20-alpine AS builder → pnpm install → turbo build --filter=@theyahia/{server}-mcp
FROM node:20-alpine → COPY dist → CMD ["node", "dist/index.js"]
```
+ docker-compose.yml для связки МойСклад + СДЭК + DaData

### A4. Конфигурации для IDE-клиентов
**Файлы:**
- `D:/DEV/Yahia/mcp-servers/docs/configs/claude-desktop.json`
- `D:/DEV/Yahia/mcp-servers/docs/configs/cursor-settings.json`
- `D:/DEV/Yahia/mcp-servers/docs/configs/continuedev-config.json`
- `D:/DEV/Yahia/mcp-servers/docs/configs/n8n-workflow.json`
**Effort:** 2 часа | **Impact:** высокий

Готовые copy-paste конфиги для каждого клиента с комментариями.

---

## БЛОК B: E-COMMERCE БИЗНЕС-КЕЙС (Дни 2-3)

### B1. Интеграционный сценарий МойСклад + СДЭК + DaData
**Файл:** `D:/DEV/Yahia/mcp-servers/docs/use-cases/ecommerce-automation.md`
**Effort:** 3 часа | **Impact:** критический

Полный сценарий от А до Я:
```
Пользователь: "Создай заказ для ООО Ромашка на 50 шт Светильник LED-500,
               рассчитай доставку СДЭК до Новосибирска, проверь реквизиты"

Шаг 1: DaData → validate_company("ООО Ромашка") → ИНН, ОГРН, адрес
Шаг 2: МойСклад → search_products("Светильник LED-500") → UUID, цена, остаток
Шаг 3: МойСклад → get_counterparties(filter_inn: "7712345678") → или create
Шаг 4: СДЭК → calculate_tariff(from: "Москва", to: "Новосибирск", weight: 5000g)
Шаг 5: МойСклад → create_customer_order(org, agent, items, delivery)
Шаг 6: СДЭК → create_order(sender, recipient, packages)
```

### B2. Демо-промпты для каждого сервера
**Файл:** `D:/DEV/Yahia/mcp-servers/docs/demo-prompts.md`
**Effort:** 1 час | **Impact:** средний

10 готовых промптов для демонстрации:
- МойСклад: "Какие товары заканчиваются?" / "Создай приходную накладную"
- СДЭК: "Рассчитай доставку 5 кг из Москвы в Казань" / "Отследи заказ"
- CBR: "Курс доллара за последнюю неделю"
- CloudPayments: "Покажи платежи за сегодня"
- и т.д.

---

## БЛОК C: РЕГИСТРАЦИЯ НА ПЛОЩАДКАХ (День 3)

### C1. Smithery — подготовка к регистрации
**Проблема:** Smithery требует Streamable HTTP transport
**Решение:** HTTP transport уже реализован в `server.ts` → нужны smithery.yaml

**Файлы для каждого из 11 серверов:**
- `D:/DEV/Yahia/mcp-servers/servers/{name}/smithery.yaml`
**Effort:** 2 часа | **Impact:** очень высокий (275-375K визитов/мес)

```yaml
name: "@theyahia/moysklad-mcp"
description: "MCP server for MoySklad ERP — inventory, orders, counterparties, reports"
startCommand:
  type: stdio
  configSchema:
    type: object
    required: ["MOYSKLAD_TOKEN"]
    properties:
      MOYSKLAD_TOKEN:
        type: string
        description: "API token from МойСклад account settings"
```

### C2. Массовая регистрация на каталогах
**Площадки для 11 production серверов:**

| Каталог | Метод | Оценка трафика |
|---------|-------|----------------|
| mcp.so | Форма на сайте | 50K+/мес |
| Smithery.ai | smithery.yaml + CLI | 275-375K/мес |
| mcpdb.ru | Форма | RU-аудитория |
| mcplist.ru | Форма | RU-аудитория |
| openmcp.ru | Форма | RU-аудитория |
| mcp-server.ru | Форма | RU-аудитория |
| cursor.directory | PR/форма | Cursor users |
| awesome-mcp-servers | GitHub PR | 30K+ звёзд |

**Effort:** 3 часа | **Impact:** критический — мгновенная обнаружимость

### C3. GitHub Issues для good first issues
**Файл:** Шаблоны issues в GitHub
**Effort:** 1 час | **Impact:** средний (+13% контрибьюторов)

10 issues:
1. "Translate README to English" (для каждого из 11 серверов)
2. "Add integration test for search_products"
3. "Add TypeScript JSDoc for tools/orders.ts"
4. "Support pagination cursor in get_stock"
5. и т.д.

---

## БЛОК D: КОНТЕНТ И OUTREACH (Дни 4-7)

### D1. Структура статьи для Хабр
**Файл:** `D:/DEV/Yahia/mcp-servers/content/habr-draft.md`
**Effort:** 3-5 дней | **Impact:** 5K-55K просмотров

**Заголовок:** «48 MCP-серверов для российских API: как соло-разработчик автоматизирует МойСклад, СДЭК и DaData через AI»

**Структура:**
1. **Крючок** (2 абзаца) — "AI-агент может оформить заказ, рассчитать доставку и проверить контрагента за 10 секунд. Вот как."
2. **Что такое MCP** (3 абзаца) — минимум теории, фокус на "зачем бизнесу"
3. **Таблица 48 серверов** — впечатляющий список с категориями
4. **Пошаговый пример** — МойСклад + СДЭК + Continue.dev + GigaChat, полный код
5. **Как работает без Claude** — Continue.dev + GigaChat как бесплатная альтернатива
6. **Бизнес-кейс** — "AI-менеджер интернет-магазина" с расчётом ROI
7. **Архитектура монорепы** — диаграмма, shared core, как устроено
8. **Что дальше** — приглашение в TG-канал, ссылка на GitHub

**Правила:**
- Ноль ссылок на TG-канал в тексте (Хабр-аллергия на саморекламу)
- Все ссылки только в профиле
- Хабы: «Программирование», «API», «Искусственный интеллект»
- Минимум 5000 слов с кодом и скриншотами

### D2. Telegram-канал "MCP Russia"
**Effort:** 2 часа на создание | **Impact:** занятие пустой ниши

- Название: "MCP Russia — AI-интеграции для российских API"
- Описание: Новости MCP, туториалы, серверы для российских сервисов
- Контент-план: 3-5 постов/неделю
- Первые 5 постов:
  1. "MCP-протокол: что это и зачем вашему бизнесу" (обзор)
  2. "48 MCP-серверов для российских API — полный список" (таблица)
  3. "МойСклад + AI: автоматизация склада через MCP" (кейс)
  4. "Continue.dev + GigaChat: бесплатная AI-IDE для российских разработчиков" (туториал)
  5. "СДЭК MCP: рассчёт доставки через AI-промпт" (демо)

### D3. Прямой outreach — стратегия первого пользователя за 7 дней
**Effort:** 2-3 часа | **Impact:** критический

**5 конкретных целей для личного обращения:**
1. Авторы Хабр-статей о МойСклад API → личное сообщение
2. Участники TG-чата МойСклад для разработчиков
3. Автор npm-пакета `moysklad` (wmakeev) → GitHub message
4. Автор cdek-sdk → GitHub message
5. Создатели платных интеграций МойСклад↔СДЭК (cdek-ms.yooogi.ru)

**Шаблон сообщения:**
```
Привет! Я создал open-source MCP-сервер для МойСклад API (10 tools: 
товары, заказы, остатки, контрагенты, отчёты). Работает через Cursor, 
Continue.dev и n8n. Буду рад, если попробуете и дадите обратную связь.
GitHub: [ссылка] | npm: @theyahia/moysklad-mcp
```

---

## БЛОК E: МОНЕТИЗАЦИЯ (Дни 7-14)

### E1. MCPize регистрация
**Effort:** 3 часа | **Impact:** первая монетизация

Зарегистрировать на MCPize:
- DaData MCP: free tier 1000 вызовов/мес → $0.005/вызов сверх
- МойСклад MCP: free tier 500 вызовов/мес → $0.01/вызов сверх
- СДЭК MCP: free tier 500 вызовов/мес → $0.01/вызов сверх

### E2. Yandex Cloud грант
**Effort:** 1 день | **Impact:** до 2 000 000 руб + YandexGPT доступ

Подготовить заявку:
- Описание проекта: "MCP-экосистема для российских API-сервисов"
- Тех. потребности: hosting 11 серверов, YandexGPT API для тестирования
- Roadmap: MCP Hub интеграция с Yandex AI Studio

### E3. Партнёрские предложения
**Effort:** 3 часа | **Impact:** средний-высокий

Письма в:
1. **МойСклад** (dev.moysklad.ru) — предложение добавить MCP-сервер в документацию
2. **СДЭК** (integrator@cdek.ru) — аналогичное предложение
3. **Amvera Cloud** — хостинг серверов + совместная Хабр-статья
4. **Just AI** — демонстрация СДЭК MCP для их клиентов
5. **GigaChat community** (@gigstery) — демо MCP + GigaChat

---

## БЛОК F: ТЕХНИЧЕСКОЕ УСИЛЕНИЕ (Параллельно)

### F1. DaData MCP — репозиционирование
**Текущее:** флагман, 31 tool, отдельный репо @metarebalance
**Новое:** бесплатная витрина, lead magnet

Действия:
- Обновить README: позиционирование как "бесплатная альтернатива" официальному DaData MCP
- Добавить сравнительную таблицу: @theyahia/dadata-mcp vs dadata.ru/mcp vs Composio
- Подчеркнуть: 31 tool vs ограниченный набор у конкурентов + полностью бесплатный

### F2. Миграция следующих 5 серверов в монорепу
**Приоритет по критерию: уникальность × рынок × отсутствие конкурентов**

| # | Сервер | Почему |
|---|--------|--------|
| 1 | robokassa | Ведущий платёжный шлюз РФ, нет MCP-конкурентов, уже в монорепе |
| 2 | ozon | Второй маркетплейс РФ, полностью свободная ниша |
| 3 | wildberries | Крупнейший маркетплейс, 2 community-конкурента |
| 4 | yookassa | Платежи, широко используется |
| 5 | hh | Рекрутинг, уникальная аудитория |

### F3. Output sanitization (prompt injection protection)
**Файл:** `D:/DEV/Yahia/mcp-servers/packages/core/src/sanitize.ts`
**Effort:** 2 часа | **Impact:** security

Базовая защита от prompt injection в ответах API:
```typescript
export function sanitizeApiResponse(text: string): string {
  // Strip potential instruction injection from API responses
  return text.replace(/\b(ignore|forget|disregard)\s+(previous|all|above)\s+(instructions?|prompts?|context)/gi, '[filtered]');
}
```

---

## ХРОНОЛОГИЯ (Апрель 2026)

### Неделя 1 (1-7 апреля) — Фундамент
| День | Что делать | Блок |
|------|-----------|------|
| 1 | README монорепы + quickstart Continue.dev | A1, A2 |
| 2 | Dockerfiles + конфиги IDE + smithery.yaml | A3, A4, C1 |
| 3 | Регистрация на 8 каталогах (11 серверов) | C2 |
| 4 | E-commerce кейс + демо-промпты | B1, B2 |
| 5 | Прямой outreach 5 людям | D3 |
| 6 | Good first issues + TG-канал создание | C3, D2 |
| 7 | MCPize регистрация 3 серверов | E1 |

### Неделя 2 (8-14 апреля) — Контент
| День | Что делать | Блок |
|------|-----------|------|
| 8-12 | Написание Хабр-статьи | D1 |
| 13 | Публикация на Хабр + анонс в TG-чатах | D1 |
| 14 | Отправка писем партнёрам | E3 |

### Неделя 3 (15-21 апреля) — Международный reach
| День | Что делать |
|------|-----------|
| 15-16 | Кросспост на Dev.to (английский) |
| 17 | PR в awesome-mcp-servers |
| 18-19 | Миграция ozon-mcp в монорепу |
| 20-21 | Миграция wildberries-mcp в монорепу |

### Неделя 4 (22-30 апреля) — Масштабирование
| День | Что делать |
|------|-----------|
| 22-23 | Грант Yandex Cloud |
| 24-25 | Вторая Хабр-статья: "МойСклад + СДЭК + AI: кейс автоматизации" |
| 26-28 | Миграция yookassa + hh в монорепу |
| 29-30 | Ретроспектива: метрики, выводы, план на май |

---

## МЕТРИКИ УСПЕХА (к 30 апреля)

| Метрика | Цель |
|---------|------|
| Реальных пользователей | ≥ 1 |
| npm weekly downloads (суммарно) | ≥ 50 |
| GitHub stars (монорепа) | ≥ 20 |
| Хабр-просмотры | ≥ 5 000 |
| Smithery — серверов зарегистрировано | ≥ 3 |
| Каталогов с присутствием | ≥ 6 из 8 |
| TG-канал подписчиков | ≥ 50 |
| MCPize — серверов на платформе | 3 |
| Партнёрских писем отправлено | ≥ 5 |
| Серверов в монорепе | ≥ 15 (из 47) |
