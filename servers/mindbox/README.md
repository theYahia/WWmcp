# @theyahia/mindbox-mcp

MCP-сервер для API Mindbox CDP — профили клиентов, заказы, сегменты, списки товаров и произвольные операции.

[![npm](https://img.shields.io/npm/v/@theyahia/mindbox-mcp)](https://www.npmjs.com/package/@theyahia/mindbox-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Возможности

- 6 инструментов для работы с Mindbox API
- Транспорт: stdio (по умолчанию) и Streamable HTTP (`--http`)
- Совместимость с Claude Desktop, Claude Code, Cursor, Smithery
- Повторы с backoff и идемпотентностью (`transactionId`), защита HTTP-транспорта
- Skills для автоматизации типовых сценариев

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "mindbox": {
      "command": "npx",
      "args": ["-y", "@theyahia/mindbox-mcp"],
      "env": {
        "MINDBOX_API_KEY": "ваш_ключ",
        "MINDBOX_ENDPOINT_ID": "ваш_endpoint_id"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add mindbox -e MINDBOX_API_KEY=ваш_ключ -e MINDBOX_ENDPOINT_ID=ваш_endpoint_id -- npx -y @theyahia/mindbox-mcp
```

### Streamable HTTP

```bash
MINDBOX_API_KEY=ваш_ключ MINDBOX_ENDPOINT_ID=ваш_endpoint_id npx @theyahia/mindbox-mcp --http
# MCP endpoint: http://127.0.0.1:3000/mcp
# Health check: http://127.0.0.1:3000/health
```

По умолчанию сервер слушает `127.0.0.1` (см. раздел [Безопасность](#безопасность)). Порт — через `PORT`, хост — через `HOST`.

### Smithery

Файл `smithery.yaml` включён. Требуемые параметры: `MINDBOX_API_KEY`, `MINDBOX_ENDPOINT_ID`.

## Авторизация и эндпоинты

Заголовок авторизации: `Authorization: Mindbox secretKey="..."`.

Запросы идут на `POST https://api.mindbox.ru/v3/operations/{sync|async}?endpointId=…&operation=…`:

- **sync** — операции с ответом (профиль клиента, сегменты, создание заказа, список товаров). Используется по умолчанию.
- **async** — fire-and-forget события (просмотры, добавления в корзину). Доступно для `run_operation` через `mode: "async"`.

> Системные имена операций (`operation`) настраиваются **в каждом проекте Mindbox** — это не универсальные встроенные методы. Дефолты вроде `Website.GetCustomerInfo` — лишь распространённая конвенция; администратор проекта должен создать операции с совпадающими системными именами, иначе Mindbox вернёт `ProtocolError`.

## Переменные окружения

| Переменная                     | Обязательна | Описание                                                            |
| ------------------------------ | :---------: | ------------------------------------------------------------------- |
| `MINDBOX_API_KEY`              |     да      | Секретный ключ API Mindbox (также принимается `MINDBOX_SECRET_KEY`) |
| `MINDBOX_ENDPOINT_ID`          |     да      | ID точки интеграции (endpointId)                                    |
| `PORT`                         |     нет     | Порт HTTP-сервера (по умолчанию 3000)                               |
| `HOST`                         |     нет     | Хост привязки HTTP (по умолчанию 127.0.0.1)                         |
| `MINDBOX_HTTP_TOKEN`           |     нет     | Bearer-токен для защиты `/mcp` (если задан — обязателен в запросах) |
| `MINDBOX_HTTP_ALLOWED_HOSTS`   |     нет     | Доп. разрешённые `Host` (через запятую) для DNS-rebinding защиты    |
| `MINDBOX_HTTP_ALLOWED_ORIGINS` |     нет     | Доп. разрешённые `Origin` (через запятую)                           |
| `MINDBOX_ALLOW_RAW`            |     нет     | `0`/`false`/`off`/`no` отключает `run_operation`                    |
| `MINDBOX_MAX_RETRIES`          |     нет     | Число повторов при 429/5xx/таймауте (по умолчанию 3)                |
| `MINDBOX_RETRY_BASE_MS`        |     нет     | Базовая задержка backoff в мс (по умолчанию 500)                    |
| `MINDBOX_TIMEOUT_MS`           |     нет     | Таймаут одной попытки в мс (по умолчанию 15000)                     |

## Инструменты (6)

| Инструмент         | Описание                                                                            |
| ------------------ | ----------------------------------------------------------------------------------- |
| `get_customer`     | Получение профиля клиента по email/телефону/ID                                      |
| `create_order`     | Создание заказа с привязкой к клиенту                                               |
| `get_segments`     | Получение сегментов клиента                                                         |
| `get_product_list` | Получение списка товаров                                                            |
| `update_customer`  | Обновление профиля клиента                                                          |
| `run_operation`    | ⚠️ Выполнение произвольной операции Mindbox API (см. [Безопасность](#безопасность)) |

## Безопасность

- **`run_operation`** выполняет ПРОИЗВОЛЬНУЮ операцию Mindbox под вашим секретным ключом и может изменять данные. В недоверенных агентских сценариях это вектор prompt-injection. Вызовы логируются в stderr; полностью отключить — `MINDBOX_ALLOW_RAW=0`.
- **HTTP-транспорт** не имеет встроенной аутентификации, кроме опционального `MINDBOX_HTTP_TOKEN`. Сервер по умолчанию слушает `127.0.0.1`, включена DNS-rebinding защита (валидация `Host`/`Origin`), CORS `*` разрешён только на `/health`. Для удалённого доступа ставьте за аутентифицирующим обратным прокси и не открывайте порт наружу без необходимости.
- Секретный ключ используется только на стороне сервера и никогда не должен попадать в браузер.

## Skills

| Скилл                   | Описание                | Триггер                   |
| ----------------------- | ----------------------- | ------------------------- |
| `skill-customer-search` | Поиск клиента в Mindbox | "Найди клиента в Mindbox" |
| `skill-segment-stats`   | Статистика сегментов    | "Статистика сегментов"    |

## Примеры запросов

```
Найди клиента с email user@example.com
Создай заказ для клиента с телефоном +7900...
Какие сегменты у клиента user@example.com?
Покажи список товаров
Обнови имя клиента с ID 12345
Выполни операцию Custom.GetData с телом {"key": "value"}
```

## Troubleshooting

| Симптом                                              | Причина и решение                                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Переменная окружения MINDBOX_API_KEY … обязательна` | Не заданы `MINDBOX_API_KEY`/`MINDBOX_ENDPOINT_ID`. Сервер стартует и отдаёт список инструментов без них, но любой вызов требует ключи.    |
| `Mindbox HTTP 401/403`                               | Неверный `secretKey` или `endpointId`, либо ключ не имеет прав на операцию.                                                               |
| `Статус: ProtocolError` / операция не найдена        | Системное имя операции не настроено в проекте Mindbox. Создайте операцию с совпадающим `systemName` или передайте корректный `operation`. |
| `Mindbox: таймаут запроса`                           | Превышен `MINDBOX_TIMEOUT_MS` (15с по умолчанию). Сервер уже делает повторы; увеличьте таймаут/повторы при необходимости.                 |
| HTTP `403 Invalid Host header`                       | Сработала DNS-rebinding защита. Добавьте свой хост в `MINDBOX_HTTP_ALLOWED_HOSTS`.                                                        |

## Разработка

```bash
npm install          # установка + сборка (prepare)
npm run dev          # stdio
npm run dev:http     # HTTP на порту 3000
npm test             # Vitest
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
```

См. [CONTRIBUTING.md](./CONTRIBUTING.md).

## Лицензия

MIT
