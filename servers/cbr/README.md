# @theyahia/cbr-mcp

MCP-сервер для API Центрального Банка РФ — курсы валют, ключевая ставка, драгоценные металлы, конвертация. **Без авторизации**, работает из коробки.

[![npm](https://img.shields.io/npm/v/@theyahia/cbr-mcp)](https://www.npmjs.com/package/@theyahia/cbr-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

Добавьте в `claude_desktop_config.json`:

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

### Claude Code

```bash
claude mcp add cbr -- npx -y @theyahia/cbr-mcp
```

### VS Code / Cursor

Добавьте в `.vscode/mcp.json`:

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

### Windsurf

Добавьте в настройки MCP Toolkit:

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

> Авторизация **не нужна** — API ЦБ РФ полностью открытый.

## Инструменты (7)

| Инструмент | Описание |
|------------|----------|
| `get_daily_rates` | Все курсы валют ЦБ РФ на указанную дату |
| `get_currency_rate` | Курс конкретной валюты к рублю с изменением за день |
| `get_rate_dynamics` | Динамика курса валюты за период (ряд + min/max/avg, изменение) |
| `get_key_rate` | Текущая ключевая ставка ЦБ РФ и дата её вступления в силу |
| `get_key_rate_history` | История изменений ключевой ставки за период |
| `get_precious_metals` | Учётные цены на золото, серебро, платину, палладий (покупка/продажа) |
| `convert_currency` | Конвертация суммы из одной валюты в другую через курс ЦБ |

### Особенности

- **Выходные и праздники.** Если на запрошенную дату курсы не публиковались (выходной/праздник),
  возвращаются данные за ближайший доступный рабочий день с пометкой `note`.
- **Отказоустойчивость.** Основной источник курсов — зеркало `cbr-xml-daily.ru`; при его
  недоступности используется официальный `cbr.ru` (`XML_daily.asp`) как fallback.
- **Источники данных:** курсы — `cbr-xml-daily.ru` + `cbr.ru/scripts/XML_daily.asp`;
  динамика — `cbr.ru/scripts/XML_dynamic.asp`; ключевая ставка — `cbr.ru/hd_base/KeyRate`;
  металлы — `cbr.ru/scripts/xml_metall.asp`.

## Примеры запросов

```
Какой курс доллара сегодня?
```

```
Переведи 1000 USD в евро
```

```
Как менялся курс доллара с 1 по 23 июня?
```

```
Какая ключевая ставка ЦБ и с какого числа она действует?
```

```
Покажи историю ключевой ставки за последний год
```

```
Какие цены на золото и серебро?
```

```
Покажи курсы валют на 10 января 2025
```

## Часть серии Russian API MCP

| MCP | Статус | Описание |
|-----|--------|----------|
| [@metarebalance/dadata-mcp](https://github.com/theYahia/dadata-mcp) | ✅ готов | Адреса, компании, банки, телефоны |
| [@theyahia/cbr-mcp](https://github.com/theYahia/cbr-mcp) | ✅ готов | Курсы валют, ключевая ставка |
| @theyahia/yookassa-mcp | 📅 скоро | Платежи, возвраты, чеки 54-ФЗ |
| @theyahia/moysklad-mcp | 📅 скоро | Склад, заказы, контрагенты |
| ... | 📅 | **+46 серверов** — [полный список](https://github.com/theYahia/russian-mcp) |

## Разработка

```bash
npm install
npm run build      # компиляция TypeScript → dist/
npm run lint       # eslint
npm test           # vitest (юнит-тесты парсеров на офлайн-фикстурах)
npm run dev        # запуск из исходников через tsx
```

Тесты не ходят в сеть — парсеры проверяются на сохранённых ответах API в `test/fixtures/`.
История изменений — в [CHANGELOG.md](CHANGELOG.md).

## Лицензия

MIT
