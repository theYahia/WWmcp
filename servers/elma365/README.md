> 📦 Часть **[WWmcp — Emerging Markets MCP](https://github.com/theYahia/WWmcp)** — 114 MCP-серверов для non-Western API (Россия/СНГ/MENA/Gulf/SE Asia/Africa/Brazil).

# @theyahia/elma365-mcp

MCP-сервер для ELMA365 API — discovery схемы, элементы приложений, BPM-задачи, бизнес-процессы, пользователи, комментарии. **20 инструментов.**

[![npm](https://img.shields.io/npm/v/@theyahia/elma365-mcp)](https://www.npmjs.com/package/@theyahia/elma365-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/theYahia/elma365-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/elma365-mcp/actions)

Все эндпоинты сверены с официальной документацией [api.elma365.com](https://api.elma365.com/ru/public-api/reference/).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "elma365": {
      "command": "npx",
      "args": ["-y", "@theyahia/elma365-mcp"],
      "env": {
        "ELMA365_DOMAIN": "mycompany",
        "ELMA365_TOKEN": "your-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add elma365 \
  -e ELMA365_DOMAIN=mycompany \
  -e ELMA365_TOKEN=your-token \
  -- npx -y @theyahia/elma365-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "elma365": {
      "command": "npx",
      "args": ["-y", "@theyahia/elma365-mcp"],
      "env": {
        "ELMA365_DOMAIN": "mycompany",
        "ELMA365_TOKEN": "your-token"
      }
    }
  }
}
```

### Streamable HTTP (для веб-клиентов)

```bash
ELMA365_DOMAIN=mycompany ELMA365_TOKEN=your-token npx @theyahia/elma365-mcp --http --port 3000
```

Endpoint: `http://localhost:3000/mcp`
Health check: `http://localhost:3000/health`

> ⚠️ HTTP-транспорт без аутентификации и предназначен для локального использования. Не публикуйте порт в интернет напрямую. По умолчанию принимаются только запросы с `Host: localhost`/`127.0.0.1` (защита от DNS-rebinding); дополнительные хосты — через `ELMA365_ALLOWED_HOSTS` (через запятую).

### Smithery

Используйте `smithery.yaml` в корне репозитория для деплоя на [Smithery](https://smithery.ai).

## Аутентификация

- `ELMA365_DOMAIN` — домен ELMA365: поддомен облака (`mycompany` → `mycompany.elma365.ru`) или полный хост (`mycompany.elma365.ru`).
- `ELMA365_TOKEN` — Bearer-токен ELMA365 API (заголовок `Authorization: Bearer <token>`).
- `ELMA365_BASE_URL` *(опц.)* — полный базовый URL для on-premise / нестандартных хостов, например `https://elma365.mycorp.com/pub/v1`. Имеет приоритет над `ELMA365_DOMAIN`.
- `ELMA365_TIMEOUT` *(опц.)* — таймаут запроса в мс (по умолчанию 10000).
- `ELMA365_ALLOWED_HOSTS` *(опц.)* — дополнительные разрешённые `Host` для HTTP-транспорта.

**Где взять токен:** Администрирование → Токены → «+ Токен» (доступно группе «Администраторы»). Токен привязывается к пользователю — созданные элементы будут от его имени, доступ ограничен его правами. Значение показывается только при создании.

Базовый URL: `https://{domain}.elma365.ru/pub/v1/` (облако) или значение `ELMA365_BASE_URL` (on-premise).

## Инструменты (20)

### Discovery — начните отсюда

Чтобы не угадывать namespace / коды приложений / коды полей, сначала используйте discovery.

| Инструмент | Описание |
|------------|----------|
| `list_namespaces` | Список разделов (namespaces) системы |
| `list_apps` | Список приложений в разделе |
| `get_app_schema` | Схема приложения: коды и типы полей |

### Элементы приложений

| Инструмент | Описание |
|------------|----------|
| `get_app_items` | Список элементов приложения (фильтрация, сортировка, пагинация) |
| `get_app_item` | Один элемент по id |
| `create_item` | Создать элемент |
| `update_app_item` | Изменить поля элемента |
| `set_app_item_status` | Сменить статус элемента |

### Задачи (BPM)

| Инструмент | Описание |
|------------|----------|
| `get_tasks` | Список задач (все / входящие / исходящие / участие) |
| `get_task` | Одна задача по id |
| `get_task_exits` | Доступные исходы задачи (для завершения) |
| `complete_task` | Завершить задачу по выбранному исходу |
| `reassign_task` | Переназначить задачу |

### Бизнес-процессы

| Инструмент | Описание |
|------------|----------|
| `list_processes` | Шаблоны процессов в разделе |
| `start_process` | Запустить процесс (`namespace` + `code`) |
| `get_process_instances` | Запущенные экземпляры процесса |

### Пользователи и комментарии

| Инструмент | Описание |
|------------|----------|
| `get_users` | Список пользователей (с фильтром) |
| `get_user_by_id` | Пользователь по id |
| `get_comments` | Комментарии (лента) элемента |
| `add_comment` | Добавить комментарий в ленту элемента |

## Skills (Claude Code)

| Skill | Описание |
|-------|----------|
| `/skill-my-tasks` | Мои задачи — показать текущие BPM-задачи |
| `/skill-start-process` | Запусти бизнес-процесс по namespace и коду |
| `/elma365-apps` | Работа с элементами приложений и задачами |

## Примеры

```
Покажи разделы ELMA365 (list_namespaces)
Покажи приложения в разделе sales и схему приложения crm_deals
Покажи элементы приложения sales/crm_deals со статусом «в работе»
Создай элемент в приложении hr/candidates с полями {"fio": "Иванов", "email": "..."}
Покажи мои BPM-задачи, затем заверши задачу T-123 по исходу «Согласовано»
Запусти процесс sales/approval_flow с параметрами {"amount": 50000}
Добавь комментарий «Согласовано» к элементу item-123 в sales/crm_deals
```

## 🚀 Demo prompt

> **Use case (RU):** «Создай в ELMA365 заявку на отпуск через приложение HR и стартани процесс согласования»

🤖 **Хорошо сочетается с:**
- [`@theyahia/planfix-mcp`](https://github.com/theYahia/planfix-mcp)
- [`@theyahia/kaiten-mcp`](https://github.com/theYahia/kaiten-mcp)
- [`@theyahia/bitrix24-mcp`](https://github.com/theYahia/bitrix24-mcp)

## Транспорт

| Режим | Команда | Описание |
|-------|---------|----------|
| stdio (по умолчанию) | `npx @theyahia/elma365-mcp` | Для Claude Desktop, Claude Code, Cursor |
| Streamable HTTP | `npx @theyahia/elma365-mcp --http` | Для веб-клиентов, port 3000 по умолчанию |
| Streamable HTTP (порт) | `npx @theyahia/elma365-mcp --http --port 8080` | Кастомный порт |

## Разработка

```bash
npm install
npm run build
npm run lint
npm run typecheck
npm test
npm run dev    # запуск через tsx
```

## Лицензия

MIT

---

⭐ **Star, если строите на ELMA365** — помогает другим разработчикам найти этот сервер.
