# @theyahia/mango-office-mcp

MCP-сервер для Mango Office API — звонки, пользователи, записи, SMS, статистика. **8 инструментов.**

[![npm](https://img.shields.io/npm/v/@theyahia/mango-office-mcp)](https://www.npmjs.com/package/@theyahia/mango-office-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "mango-office": {
      "command": "npx",
      "args": ["-y", "@theyahia/mango-office-mcp"],
      "env": { "MANGO_API_KEY": "your-key", "MANGO_API_SALT": "your-salt" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add mango-office -e MANGO_API_KEY=your-key -e MANGO_API_SALT=your-salt -- npx -y @theyahia/mango-office-mcp
```

### VS Code / Cursor

```json
{ "servers": { "mango-office": { "command": "npx", "args": ["-y", "@theyahia/mango-office-mcp"], "env": { "MANGO_API_KEY": "your-key", "MANGO_API_SALT": "your-salt" } } } }
```

### Streamable HTTP

```bash
npx @theyahia/mango-office-mcp --http
# POST /mcp, GET /health — порт 3000 (HTTP_PORT=8080 для другого)
```

> Требуется `MANGO_API_KEY` и `MANGO_API_SALT`. Получите в личном кабинете [Mango Office](https://www.mango-office.ru).

## Аутентификация

Все запросы подписываются HMAC-SHA256: `sign = HMAC(apiKey + json + apiSalt)`.
Базовый URL: `https://app.mango-office.ru/vpbx/`.

## Инструменты (6)

| Инструмент | Описание | API endpoint |
|------------|----------|--------------|
| `get_calls` | История звонков за период | `stats/request` |
| `get_users` | Список пользователей | `config/users/request` |
| `make_call` | Инициировать исходящий звонок | `commands/callback` |
| `get_stats` | Сводная статистика звонков | `stats/request` |
| `get_recording` | Ссылка на запись разговора | `queries/recording/post` |
| `send_sms` | Отправить SMS | `commands/sms` |

## Skills (2)

| Инструмент | Описание |
|------------|----------|
| `skill_call_history` | История звонков за сегодня — готовый отчёт |
| `skill_stats` | Статистика звонков за сегодня — сводка |

## Примеры

```
Покажи звонки за последний час
Список пользователей Mango Office
Позвони с 101 на +79001234567
Статистика звонков за сегодня
Скачай запись разговора rec_123
Отправь SMS с 101 на +79001234567 "Перезвоните"
```

## Mango Office

[Mango Office](https://www.mango-office.ru/?utm_source=github&utm_medium=mcp) — облачная телефония для бизнеса.
Реферальная программа: **до 25% пожизненно** от платежей приведённых клиентов.

## Лицензия

MIT
