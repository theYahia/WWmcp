# @theyahia/kaspi-mcp

> MCP-сервер для API **Kaspi.kz Marketplace** (Казахстан) — заказы, товары, детали заказа.
> 3 инструмента. Bearer-авторизация. Транспорты stdio + Streamable HTTP.

[![npm](https://img.shields.io/npm/v/@theyahia/kaspi-mcp)](https://www.npmjs.com/package/@theyahia/kaspi-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Инструменты (3)

| Инструмент | Описание |
|---|---|
| `get_orders` | Список заказов с фильтрацией по статусу (`state`), диапазону дат и постраничным выводом |
| `get_order` | Детали одного заказа по ID: суммы, доставка, клиент, адрес с координатами |
| `get_products` | Список товаров продавца (`merchantoffers`), фильтр по активности |

Допустимые значения `state`: `NEW`, `SIGN_REQUIRED`, `PICKUP`, `DELIVERY`, `KASPIDELIVERY`, `ARCHIVE`, `COMPLETED`, `CANCELLED`, `RETURNED`.

## Быстрый старт

```json
{
  "mcpServers": {
    "kaspi": {
      "command": "npx",
      "args": ["-y", "@theyahia/kaspi-mcp"],
      "env": {
        "KASPI_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

## Переменные окружения

| Переменная | Обязательная | Описание |
|---|---|---|
| `KASPI_API_KEY` | Да | API-ключ из кабинета продавца Kaspi.kz |
| `HTTP_PORT` | Нет | Включает Streamable HTTP вместо stdio (по умолчанию порт 3000) |

## Транспорты

- **stdio** (по умолчанию) — Claude Desktop / Cursor / Windsurf.
- **Streamable HTTP** — флаг `--http` или переменная `HTTP_PORT`. Даёт эндпоинт `/mcp` и `/health`.

## Что изменилось в монорепозитории WWmcp

Сервер переведён на общее ядро [`@theyahia/mcp-core`](../../packages/core):

- **HTTP-клиент ядра** — ретраи с экспоненциальной задержкой, таймаут 15 с, защита от SSRF. Формат авторизации не менялся: `Authorization: Bearer <KASPI_API_KEY>`.
- **Ленивая инициализация** — `KASPI_API_KEY` читается при первом запросе, а не при импорте модуля.
- **Ошибки инструментов** — возвращаются как `CallToolResult` с `isError: true` (через `withErrorHandling`), модель может исправиться сама.
- **HTTP-транспорт** — раньше был только stdio.

Имена инструментов, их аргументы и формат ответа не изменились.

## Разработка

```bash
pnpm --filter @theyahia/kaspi-mcp build
pnpm --filter @theyahia/kaspi-mcp test
```

## Примеры запросов

Спросите ИИ:

- «Покажи заказы Kaspi в статусе NEW за последнюю неделю» — `get_orders`
- «Открой детали заказа по ID: сумма, адрес доставки, клиент» — `get_order`
- «Выведи список моих активных товаров на Kaspi» — `get_products`

## Лицензия

MIT

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
