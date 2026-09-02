# MCP-сервер для ЦБ Узбекистана — курсы валют к суму и конвертация (5 инструментов)

Даёт ассистенту официальные курсы Центрального банка Республики Узбекистан: около 30 валют к суму (UZS) на сегодня или на историческую дату, направление дневного изменения и пересчёт сумм, в том числе кросс-курсом через сум. Ключей и регистрации не требует — данные открытые.

[![npm](https://img.shields.io/npm/v/@theyahia/cbu-mcp)](https://www.npmjs.com/package/@theyahia/cbu-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/cbu-mcp?label=downloads)](https://www.npmjs.com/package/@theyahia/cbu-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

`claude_desktop_config.json` — macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`.

```json
{
  "mcpServers": {
    "cbu": {
      "command": "npx",
      "args": ["-y", "@theyahia/cbu-mcp"]
    }
  }
}
```

Блок `env` не нужен: авторизация не используется.

### Claude Code

```bash
claude mcp add cbu -- npx -y @theyahia/cbu-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "cbu": {
      "command": "npx",
      "args": ["-y", "@theyahia/cbu-mcp"]
    }
  }
}
```

Требуется Node.js 18 или новее.

## Инструменты

| Инструмент | Что делает |
|---|---|
| `get_all_rates` | Все текущие курсы ЦБ Узбекистана, порядка 30 валют: код, название, курс за номинал в сумах и дневное изменение |
| `get_currency_rate` | Курс конкретной валюты — USD, EUR, RUB, GBP и другие. Принимает дату для исторического значения |
| `get_historical_rates` | Все курсы на конкретную прошедшую дату в формате YYYY-MM-DD. Формат ответа тот же, что у `get_all_rates` |
| `convert_currency` | Конвертация по курсам ЦБ Узбекистана. По умолчанию — в сумы; кросс-конвертация идёт через UZS. Принимает дату |
| `get_rate_dynamics` | Курс валюты, номинал, дневная разница и направление изменения: up / down / unchanged |

## Примеры запросов

- «Какой сегодня курс доллара и рубля к суму по данным ЦБ Узбекистана?»
- «Переведи 15 000 000 сумов в рубли по курсу ЦБ Узбекистана».
- «Каким был курс евро к суму 1 марта и куда он двинулся за последний день?»

## Переменные окружения

| Переменная | Обязательна | Где взять |
|---|---|---|
| — | — | Сервер не использует переменных окружения: API ЦБ Узбекистана (`cbu.uz`) открыт и не требует авторизации |

## Транспорт

По умолчанию сервер работает через stdio — этого достаточно для Claude Desktop, Claude Code, VS Code и Cursor.

Для запуска по HTTP (Streamable HTTP, эндпоинт `/mcp` плюс `/health` со статусом и числом инструментов) передайте флаг `--http` или задайте `HTTP_PORT`:

```bash
HTTP_PORT=3000 npx -y @theyahia/cbu-mcp
```

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
