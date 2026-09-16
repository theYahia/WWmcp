# MCP-сервер для Деловых Линий — расчёт грузоперевозки, заказы и отслеживание (6 инструментов)

Позволяет узнать стоимость и срок доставки груза между городами, найти нужный терминал с адресом и телефонами, оформить заказ на перевозку, посмотреть статус по номеру накладной и поднять историю заказов за период — не открывая личный кабинет Деловых Линий.

[![npm](https://img.shields.io/npm/v/@theyahia/delovye-linii-mcp)](https://www.npmjs.com/package/@theyahia/delovye-linii-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/delovye-linii-mcp?label=downloads)](https://www.npmjs.com/package/@theyahia/delovye-linii-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

`claude_desktop_config.json` — macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`.

```json
{
  "mcpServers": {
    "delovye-linii": {
      "command": "npx",
      "args": ["-y", "@theyahia/delovye-linii-mcp"],
      "env": {
        "DELLIN_API_KEY": "your-dellin-api-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add delovye-linii \
  -e DELLIN_API_KEY=your-dellin-api-key \
  -- npx -y @theyahia/delovye-linii-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "delovye-linii": {
      "command": "npx",
      "args": ["-y", "@theyahia/delovye-linii-mcp"],
      "env": {
        "DELLIN_API_KEY": "your-dellin-api-key"
      }
    }
  }
}
```

Требуется Node.js 18 или новее.

## Инструменты

| Инструмент | Что делает |
|---|---|
| `get_cities` | Поиск городов в справочнике Деловых Линий. Возвращает `cityID`, который нужен для `calculate`, `get_terminals` и `create_order` |
| `calculate` | Расчёт стоимости и сроков доставки: города отправления и назначения, вес в кг, габариты в метрах, количество мест |
| `get_terminals` | Терминалы в указанном городе: адрес, часы работы, телефоны |
| `create_order` | Создание заказа на грузоперевозку. Перед вызовом стоит посчитать стоимость через `calculate` |
| `track` | Отслеживание по номеру накладной: статус, маршрут, ключевые даты |
| `get_order_history` | История заказов за период с постраничной выдачей |

Порядок вызовов: `get_cities` → `calculate` → `create_order`. ID городов из справочника, а не названия — иначе расчёт не пройдёт.

## Примеры запросов

- «Сколько будет стоить отправить 240 кг груза из Москвы в Новосибирск и за сколько дней доедет?»
- «Где в Екатеринбурге терминалы Деловых Линий и до скольких они работают в будни?»
- «Проверь накладную 12-00123456 — где груз сейчас и когда его планируют выдать».

## Переменные окружения

| Переменная | Обязательна | Где взять |
|---|---|---|
| `DELLIN_API_KEY` | да | Личный кабинет Деловых Линий, раздел для разработчиков: https://dev.dellin.ru/ |

Ключ передаётся в теле каждого запроса полем `appkey` — заголовок авторизации не используется. Без переменной сервер завершится с ошибкой при первом обращении к API.

## Транспорт

По умолчанию сервер работает через stdio — этого достаточно для Claude Desktop, Claude Code, VS Code и Cursor.

Для запуска по HTTP (Streamable HTTP, эндпоинт `/mcp` плюс `/health` со статусом и числом инструментов) передайте флаг `--http` или задайте `HTTP_PORT`:

```bash
HTTP_PORT=3000 npx -y @theyahia/delovye-linii-mcp
```

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
