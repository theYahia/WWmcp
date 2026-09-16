# MCP-сервер для бизнес-API Сбербанка — счета, выписки и платежи через ИИ

Если вы искали, как подключить СберБизнес API к нейросети, посмотреть баланс и выписку по расчётному счёту или собрать платёж не открывая интернет-банк — это оно. 8 инструментов: счета, баланс, выписки, платежи, контрагенты. Спрашиваете «сколько пришло на счёт за неделю» — получаете сумму и список поступлений.

[![npm](https://img.shields.io/npm/v/@theyahia/sber-mcp)](https://www.npmjs.com/package/@theyahia/sber-mcp)
[![CI](https://github.com/theYahia/sber-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/sber-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![smithery badge](https://smithery.ai/badge/@theyahia/sber-mcp)](https://smithery.ai/server/@theyahia/sber-mcp)

Часть серии [WWmcp](https://github.com/theYahia/WWmcp) от [@theYahia](https://github.com/theYahia).

## Быстрый старт

### Claude Desktop

```json
{
  "mcpServers": {
    "sber": {
      "command": "npx",
      "args": ["-y", "@theyahia/sber-mcp"],
      "env": {
        "SBER_TOKEN": "ваш-bearer-токен"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add sber -e SBER_TOKEN=ваш-токен -- npx -y @theyahia/sber-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "sber": {
      "command": "npx",
      "args": ["-y", "@theyahia/sber-mcp"],
      "env": {
        "SBER_TOKEN": "ваш-bearer-токен"
      }
    }
  }
}
```

### Windsurf

```json
{
  "mcpServers": {
    "sber": {
      "command": "npx",
      "args": ["-y", "@theyahia/sber-mcp"],
      "env": {
        "SBER_TOKEN": "ваш-bearer-токен"
      }
    }
  }
}
```

### Streamable HTTP (удалённо / Docker)

```bash
PORT=3000 npx -y @theyahia/sber-mcp --http
```

Эндпоинты:
- `POST /mcp` — MCP Streamable HTTP транспорт
- `GET /health` — проверка здоровья (`{ "status": "ok", "tools": 8 }`)

## Переменные окружения

Авторизация — **либо** прямой Bearer-токен, **либо** пара OAuth-кредов:

| Переменная | Обязательна | Описание |
|---|:--:|---|
| `SBER_TOKEN` | один из | Прямой Bearer-токен API (синоним `SBER_ACCESS_TOKEN`) |
| `SBER_CLIENT_ID` + `SBER_CLIENT_SECRET` | один из | OAuth client_credentials |
| `SBER_BASE_URL` | нет | API-хост (дефолт `https://fintech.sberbank.ru:9443`) |
| `SBER_OAUTH_URL` | нет | OAuth-эндпоинт (дефолт `https://api.sberbank.ru:8443/prod/tokens/v2/oauth`) |
| `SBER_OAUTH_SCOPE` | нет | Space-separated scope (дефолт `GET_STATEMENT_ACCOUNT PAY_DOC_RU GET_CLIENT_ACCOUNTS`) |
| `SBER_TIMEOUT_MS` | нет | Таймаут запроса в мс (дефолт 30000) |
| `SBER_PFX_PATH` / `SBER_PFX_PASSPHRASE` | нет | mTLS: путь к `.p12`/`.pfx` и пароль |
| `SBER_CERT_PATH` / `SBER_KEY_PATH` / `SBER_CA_PATH` | нет | mTLS: отдельные PEM-файлы (альтернатива PFX) |
| `PORT` | нет | Порт HTTP-транспорта (дефолт 3000) |

## Инструменты (8)

### Счета

| Инструмент | Описание |
|---|---|
| `get_accounts` | Список счетов клиента |
| `get_balance` | Баланс по счёту |

### Выписки

| Инструмент | Описание |
|---|---|
| `get_statement` | Выписка по счёту за период (список транзакций, пагинация) |
| `summarize_transactions` | Сводка: количество, поступления, списания, чистый итог |

### Платежи

| Инструмент | Описание |
|---|---|
| `create_payment` | Создание платёжного поручения (идемпотентно по RqUID) |
| `get_payment_status` | Статус платежа по ID |

### Контрагенты / Организация

| Инструмент | Описание |
|---|---|
| `list_counterparties` | Список сохранённых контрагентов |
| `get_company_info` | Сведения об организации (реквизиты, ИНН, счета) |

## Demo-промпты

```
Покажи мои счета и баланс по рублёвому счёту
```

```
Сделай сводку транзакций по счёту 40702… за май: сколько пришло, сколько ушло, чистый итог
```

```
Создай платёжку на 150 000 ₽ контрагенту ООО «Ромашка», БИК 044525225, назначение «Оплата по договору №7», затем проверь статус
```

## Архитектура

- **Авторизация**: прямой Bearer-токен (`SBER_TOKEN`) **или** OAuth client_credentials
  (`SBER_CLIENT_ID`/`SBER_CLIENT_SECRET`, Basic-auth + scope), при необходимости поверх mTLS.
- **Идемпотентность**: каждая денежная операция несёт один стабильный `x-Introspect-RqUID`
  (32 hex) + `rq_uid` в теле, который **переиспользуется на всех ретраях** — Сбер дедуплицирует
  повтор и не создаёт второй платёж. Можно передать свой ключ.
- **Таймаут / ретраи**: 30с (настраивается), 3 попытки на 429/5xx/таймаут/сетевой сбой с
  экспоненциальной задержкой (1с, 2с, 4с). Refresh OAuth-токена защищён от конкуренции.
- **Транспорт**: stdio (по умолчанию) или Streamable HTTP (`--http` / `PORT`).

## Соответствие API

Боевой СберБизнес API закрыт за **mTLS и заявкой в банк**, поэтому реализация **не проверена
против живого окружения**. Дефолты хостов, путей и scope соответствуют официальной документации
([developers.sber.ru/docs/ru/sber-api](https://developers.sber.ru/docs/ru/sber-api/overview),
[developers.sber.ru](https://developers.sber.ru/)) на дату ресёрча, но **точные пути
эндпоинтов и имена параметров сверяйте с вашим интеграционным договором** — у Сбера сосуществуют
поколения API (v2 direct / v3 partners). Все хосты переопределяются через `SBER_BASE_URL`,
`SBER_OAUTH_URL`, `SBER_OAUTH_SCOPE`. Пометки `VERIFY` в исходниках указывают на места,
требующие сверки.

## Лицензия

MIT — часть серии [WWmcp](https://github.com/theYahia/WWmcp).

---

Часть [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
