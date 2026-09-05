# MCP-сервер для Битрикс24 — сделки, контакты и задачи CRM из диалога с ИИ (4 инструмента)

Позволяет спросить ассистента, какие сделки висят на нужной стадии, найти контакт по телефону и тут же завести новую сделку или задачу — не открывая интерфейс Битрикс24. Авторизация идёт по входящему вебхуку: отдельное OAuth-приложение регистрировать не нужно.

[![npm](https://img.shields.io/npm/v/@theyahia/bitrix24-mcp)](https://www.npmjs.com/package/@theyahia/bitrix24-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/bitrix24-mcp?label=downloads)](https://www.npmjs.com/package/@theyahia/bitrix24-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

`claude_desktop_config.json` — macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`.

```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "npx",
      "args": ["-y", "@theyahia/bitrix24-mcp"],
      "env": {
        "BITRIX24_WEBHOOK_URL": "https://your-portal.bitrix24.ru/rest/1/xxxxxxxxxxxx/"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add bitrix24 \
  -e BITRIX24_WEBHOOK_URL=https://your-portal.bitrix24.ru/rest/1/xxxxxxxxxxxx/ \
  -- npx -y @theyahia/bitrix24-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "bitrix24": {
      "command": "npx",
      "args": ["-y", "@theyahia/bitrix24-mcp"],
      "env": {
        "BITRIX24_WEBHOOK_URL": "https://your-portal.bitrix24.ru/rest/1/xxxxxxxxxxxx/"
      }
    }
  }
}
```

Требуется Node.js 18 или новее.

## Инструменты

| Инструмент | Что делает |
|---|---|
| `get_deals` | Список сделок CRM с фильтрами по стадии и ответственному. Возвращает ID, название, стадию, сумму, валюту и даты. Пагинация — параметр offset кратно 50 |
| `create_deal` | Создаёт сделку: название, сумма, стадия, связанный контакт или компания, валюта, комментарий. Возвращает ID новой сделки |
| `get_contacts` | Список контактов с фильтрами по имени, телефону или email. Возвращает телефоны, почты и связанную компанию. Поддерживает пагинацию |
| `create_task` | Создаёт задачу: название, описание, ответственный, дедлайн, приоритет (low / normal / high), проект или группа. Возвращает ID задачи |

## Примеры запросов

- «Покажи сделки в стадии переговоров на ответственном с ID 5 — сколько их и на какую сумму».
- «Найди контакт по телефону +7 916 123-45-67 и создай на него сделку "Годовая поддержка" на 180 000 ₽».
- «Заведи задачу "Выставить счёт по сделке 4412" на ответственного 12 с дедлайном на завтра, приоритет высокий».

## Переменные окружения

| Переменная | Обязательна | Где взять |
|---|---|---|
| `BITRIX24_WEBHOOK_URL` | да | URL входящего вебхука вашего портала Битрикс24 — токен доступа входит в путь. Вид: `https://<портал>.bitrix24.ru/rest/<user_id>/<token>/` |

Права вебхука должны покрывать нужные скоупы: CRM (сделки, контакты) и задачи. Завершающий слэш подставляется автоматически, если его нет.

## Транспорт

По умолчанию сервер работает через stdio — этого достаточно для Claude Desktop, Claude Code, VS Code и Cursor.

Для запуска по HTTP (Streamable HTTP, эндпоинт `/mcp` плюс `/health` со статусом и числом инструментов) передайте флаг `--http` или задайте `HTTP_PORT`:

```bash
HTTP_PORT=3000 npx -y @theyahia/bitrix24-mcp
```

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
