# MCP-сервер для Robokassa — ссылки на оплату и проверка счетов (2 инструмента)

Позволяет попросить ассистента сгенерировать ссылку на оплату Robokassa с корректной MD5-подписью — при необходимости с фискальным чеком по 54-ФЗ — и затем проверить, оплачен ли счёт. Полезно, когда счёт нужно выставить разово и вручную, без интеграции на стороне сайта.

[![npm](https://img.shields.io/npm/v/@theyahia/robokassa-mcp)](https://www.npmjs.com/package/@theyahia/robokassa-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/robokassa-mcp?label=downloads)](https://www.npmjs.com/package/@theyahia/robokassa-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

`claude_desktop_config.json` — macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`.

```json
{
  "mcpServers": {
    "robokassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/robokassa-mcp"],
      "env": {
        "ROBOKASSA_LOGIN": "your-merchant-login",
        "ROBOKASSA_PASSWORD1": "your-password-1",
        "ROBOKASSA_PASSWORD2": "your-password-2",
        "ROBOKASSA_TEST": "false"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add robokassa \
  -e ROBOKASSA_LOGIN=your-merchant-login \
  -e ROBOKASSA_PASSWORD1=your-password-1 \
  -e ROBOKASSA_PASSWORD2=your-password-2 \
  -- npx -y @theyahia/robokassa-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "robokassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/robokassa-mcp"],
      "env": {
        "ROBOKASSA_LOGIN": "your-merchant-login",
        "ROBOKASSA_PASSWORD1": "your-password-1",
        "ROBOKASSA_PASSWORD2": "your-password-2"
      }
    }
  }
}
```

Требуется Node.js 18 или новее.

## Инструменты

| Инструмент | Что делает |
|---|---|
| `create_invoice` | Собирает ссылку на оплату с MD5-подписью: сумма в рублях, номер счёта (0 — автогенерация), описание до 100 символов, email покупателя, язык интерфейса (ru / en), срок действия в ISO 8601 и позиции чека по 54-ФЗ со ставками НДС (none, vat0, vat10, vat110, vat20, vat120). Возвращает ссылку, номер счёта и сумму |
| `check_invoice` | Проверяет статус счёта по номеру через XML-интерфейс `OpStateExt`: код состояния, код результата, способ оплаты и данные клиента. Подпись считается по Password2 |

Подпись `create_invoice` строится как `MD5(login:сумма:номер:Password1)`, а при наличии чека — `MD5(login:сумма:номер:receipt:Password1)`.

## Примеры запросов

- «Сделай ссылку на оплату 4 900 ₽ по счёту 10231, описание "Консультация", чек с НДС 20%».
- «Проверь, оплачен ли счёт 10231 в Robokassa и каким способом».
- «Выстави счёт на 15 000 ₽ со сроком действия до конца недели и языком интерфейса ru».

## Переменные окружения

| Переменная | Обязательна | Где взять |
|---|---|---|
| `ROBOKASSA_LOGIN` | да | Личный кабинет Robokassa → Настройки → Технические настройки, идентификатор магазина |
| `ROBOKASSA_PASSWORD1` | да | Там же, пароль №1 — им подписывается ссылка на оплату |
| `ROBOKASSA_PASSWORD2` | да | Там же, пароль №2 — им подписывается запрос статуса счёта |
| `ROBOKASSA_TEST` | нет | Тестовый режим. Включается строкой `true`; любое другое значение и отсутствие переменной означают боевой режим |

Без любого из трёх обязательных значений сервер завершится с ошибкой при первом обращении.

## Транспорт

По умолчанию сервер работает через stdio — этого достаточно для Claude Desktop, Claude Code, VS Code и Cursor.

Для запуска по HTTP (Streamable HTTP, эндпоинт `/mcp` плюс `/health` со статусом и числом инструментов) передайте флаг `--http` или задайте `HTTP_PORT`:

```bash
HTTP_PORT=3000 npx -y @theyahia/robokassa-mcp
```

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
