# MCP-сервер для CloudPayments — приём платежей, холдирование и возвраты (6 инструментов)

Позволяет провести платёж по криптограмме карты, поставить сумму в холд и подтвердить её позже, снять холд, найти транзакцию по ID и вернуть деньги целиком или частично — прямо из диалога с ассистентом. Полезно для разбора спорных оплат и ручных возвратов, когда лезть в личный кабинет дольше, чем спросить.

[![npm](https://img.shields.io/npm/v/@theyahia/cloudpayments-mcp)](https://www.npmjs.com/package/@theyahia/cloudpayments-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/cloudpayments-mcp?label=downloads)](https://www.npmjs.com/package/@theyahia/cloudpayments-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

`claude_desktop_config.json` — macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`.

```json
{
  "mcpServers": {
    "cloudpayments": {
      "command": "npx",
      "args": ["-y", "@theyahia/cloudpayments-mcp"],
      "env": {
        "CLOUDPAYMENTS_PUBLIC_ID": "pk_xxxxxxxxxxxxxxxxxxxxx",
        "CLOUDPAYMENTS_API_SECRET": "your-api-secret"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add cloudpayments \
  -e CLOUDPAYMENTS_PUBLIC_ID=pk_xxxxxxxxxxxxxxxxxxxxx \
  -e CLOUDPAYMENTS_API_SECRET=your-api-secret \
  -- npx -y @theyahia/cloudpayments-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "cloudpayments": {
      "command": "npx",
      "args": ["-y", "@theyahia/cloudpayments-mcp"],
      "env": {
        "CLOUDPAYMENTS_PUBLIC_ID": "pk_xxxxxxxxxxxxxxxxxxxxx",
        "CLOUDPAYMENTS_API_SECRET": "your-api-secret"
      }
    }
  }
}
```

Требуется Node.js 18 или новее.

## Инструменты

| Инструмент | Что делает |
|---|---|
| `charge` | Одностадийный платёж: списывает деньги сразу по криптограмме карты. Требует IP-адрес плательщика; принимает номер счёта, описание и email для чека |
| `auth` | Двухстадийный платёж: блокирует сумму на карте без списания. Дальше — `confirm` или `void_payment`. Параметры те же, что у `charge` |
| `confirm` | Подтверждает захолдированный платёж и списывает деньги. Можно подтвердить сумму меньше исходной. Нужен ID транзакции из `auth` |
| `void_payment` | Снимает холд и возвращает заблокированную сумму держателю карты. Работает только для неподтверждённых платежей — для проведённых используйте `refund` |
| `get_transaction` | Находит транзакцию по ID: статус, сумма, данные карты, таймстемпы. Для проверки статуса оплаты и разбора инцидентов |
| `refund` | Возврат проведённого платежа целиком или частично. Частичные возвраты можно делать несколько раз в пределах исходной суммы |

## Примеры запросов

- «Найди транзакцию 1234567 в CloudPayments — она прошла или отклонена, и на какую сумму?»
- «Верни клиенту 1 500 ₽ по транзакции 1234567 — это частичный возврат за одну позицию из заказа».
- «Сними холд по авторизации 7654321, клиент отменил бронь».

## Переменные окружения

| Переменная | Обязательна | Где взять |
|---|---|---|
| `CLOUDPAYMENTS_PUBLIC_ID` | да | Личный кабинет CloudPayments → Настройки сайта → API |
| `CLOUDPAYMENTS_API_SECRET` | да | Там же. Секрет даёт полный доступ к платежам — храните его как боевой ключ |

Обе переменные используются как логин и пароль Basic-авторизации к `api.cloudpayments.ru`. Без любой из них сервер завершится с ошибкой при первом обращении.

## Транспорт

По умолчанию сервер работает через stdio — этого достаточно для Claude Desktop, Claude Code, VS Code и Cursor.

Для запуска по HTTP (Streamable HTTP, эндпоинт `/mcp` плюс `/health` со статусом и числом инструментов) передайте флаг `--http` или задайте `HTTP_PORT`:

```bash
HTTP_PORT=3000 npx -y @theyahia/cloudpayments-mcp
```

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
