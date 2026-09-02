# MCP-сервер для ЦБ РФ — курсы валют, ключевая ставка и драгметаллы (5 инструментов)

Даёт ассистенту официальные данные Центробанка России: курс любой валюты на нужную дату, текущую ключевую ставку, учётные цены на золото, серебро, платину и палладий, а также пересчёт суммы из валюты в валюту по курсу ЦБ. Ключей и регистрации не требует — источники публичные.

[![npm](https://img.shields.io/npm/v/@theyahia/cbr-mcp)](https://www.npmjs.com/package/@theyahia/cbr-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/cbr-mcp?label=downloads)](https://www.npmjs.com/package/@theyahia/cbr-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

`claude_desktop_config.json` — macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`.

```json
{
  "mcpServers": {
    "cbr": {
      "command": "npx",
      "args": ["-y", "@theyahia/cbr-mcp"]
    }
  }
}
```

Блок `env` не нужен: авторизация не используется.

### Claude Code

```bash
claude mcp add cbr -- npx -y @theyahia/cbr-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "cbr": {
      "command": "npx",
      "args": ["-y", "@theyahia/cbr-mcp"]
    }
  }
}
```

Требуется Node.js 18 или новее.

## Инструменты

| Инструмент | Что делает |
|---|---|
| `get_daily_rates` | Все курсы валют ЦБ РФ на указанную дату: код, номинал, курс и изменение за день |
| `get_currency_rate` | Курс конкретной валюты к рублю с изменением за день. Код валюты: USD, EUR, CNY и другие |
| `get_key_rate` | Текущая ключевая ставка ЦБ РФ в процентах и дата последнего изменения. Параметров не принимает |
| `get_precious_metals` | Учётные цены ЦБ РФ на золото, серебро, платину и палладий в руб./грамм. Принимает дату для исторических значений |
| `convert_currency` | Конвертация суммы из одной валюты в другую по курсу ЦБ РФ. Поддерживает все валюты ЦБ и RUB |

## Примеры запросов

- «Какая сейчас ключевая ставка ЦБ и когда её меняли в последний раз?»
- «Переведи 12 400 юаней в рубли по курсу ЦБ на 1 июля и покажи, каким был курс».
- «Сколько стоил грамм золота по учётной цене ЦБ неделю назад и сколько сейчас?»

## Переменные окружения

| Переменная | Обязательна | Где взять |
|---|---|---|
| — | — | Сервер не использует переменных окружения: данные ЦБ РФ открыты и не требуют авторизации |

## Источники данных

| Инструмент | Источник |
|---|---|
| `get_daily_rates`, `get_currency_rate`, `convert_currency` | `cbr-xml-daily.ru` — ежедневный JSON и архив по датам |
| `get_key_rate` | `cbr.ru/scripts/XML_KeyRate.asp` |
| `get_precious_metals` | `cbr.ru/scripts/xml_metall.asp` |

## Транспорт

По умолчанию сервер работает через stdio — этого достаточно для Claude Desktop, Claude Code, VS Code и Cursor.

Для запуска по HTTP (Streamable HTTP, эндпоинт `/mcp` плюс `/health` со статусом и числом инструментов) передайте флаг `--http` или задайте `HTTP_PORT`:

```bash
HTTP_PORT=3000 npx -y @theyahia/cbr-mcp
```

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
