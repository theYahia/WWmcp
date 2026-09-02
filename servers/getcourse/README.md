# MCP-сервер для GetCourse — пользователи и заказы онлайн-школы (3 инструмента)

Позволяет вытащить из GetCourse список учеников с фильтрами по статусу и дате регистрации, посмотреть заказы за период и завести нового пользователя — сразу с добавлением в группу и созданием заказа по коду предложения. Выгрузки больших списков идут через асинхронный экспорт GetCourse, сервер сам дожидается готовности отчёта.

[![npm](https://img.shields.io/npm/v/@theyahia/getcourse-mcp)](https://www.npmjs.com/package/@theyahia/getcourse-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/getcourse-mcp?label=downloads)](https://www.npmjs.com/package/@theyahia/getcourse-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

`claude_desktop_config.json` — macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`.

```json
{
  "mcpServers": {
    "getcourse": {
      "command": "npx",
      "args": ["-y", "@theyahia/getcourse-mcp"],
      "env": {
        "GETCOURSE_DOMAIN": "myschool.getcourse.ru",
        "GETCOURSE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add getcourse \
  -e GETCOURSE_DOMAIN=myschool.getcourse.ru \
  -e GETCOURSE_API_KEY=your-api-key \
  -- npx -y @theyahia/getcourse-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "getcourse": {
      "command": "npx",
      "args": ["-y", "@theyahia/getcourse-mcp"],
      "env": {
        "GETCOURSE_DOMAIN": "myschool.getcourse.ru",
        "GETCOURSE_API_KEY": "your-api-key"
      }
    }
  }
}
```

Требуется Node.js 18 или новее.

## Инструменты

| Инструмент | Что делает |
|---|---|
| `get_users` | Список пользователей с фильтрами по статусу и дате регистрации. Большие выборки идут через асинхронный экспорт, до 50 записей за запрос, профиль отдаётся целиком |
| `create_user` | Создаёт или обновляет пользователя. Опционально добавляет в группу и создаёт заказ по коду предложения. Возвращает ID пользователя и результат операций с группой и заказом |
| `get_deals` | Список заказов с фильтрами по статусу и дате создания. Так же поддерживает асинхронный экспорт, до 50 записей за запрос |

Экспорт опрашивается до 10 раз с интервалом 2 секунды; если GetCourse не успел подготовить отчёт, инструмент вернёт сообщение об этом, а не пустой список.

## Примеры запросов

- «Сколько человек зарегистрировалось в школе за прошлую неделю и какие у них статусы?»
- «Покажи заказы в статусе "в работе" за июнь — сколько их и на какую сумму».
- «Заведи ученика ivan@example.com, добавь в группу "Поток-12" и создай заказ по офферу course-basic».

## Переменные окружения

| Переменная | Обязательна | Где взять |
|---|---|---|
| `GETCOURSE_DOMAIN` | да | Домен вашего аккаунта GetCourse, например `myschool.getcourse.ru` — без `https://` |
| `GETCOURSE_API_KEY` | да | Секретный ключ из настроек аккаунта GetCourse |

Ключ передаётся параметром запроса `key`. Без любой из двух переменных сервер завершится с ошибкой при первом обращении к API.

## Транспорт

По умолчанию сервер работает через stdio — этого достаточно для Claude Desktop, Claude Code, VS Code и Cursor.

Для запуска по HTTP (Streamable HTTP, эндпоинт `/mcp` плюс `/health` со статусом и числом инструментов) передайте флаг `--http` или задайте `HTTP_PORT`:

```bash
HTTP_PORT=3000 npx -y @theyahia/getcourse-mcp
```

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
