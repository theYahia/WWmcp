# pochta-russia-mcp

[![npm](https://img.shields.io/npm/v/@theyahia/pochta-russia-mcp)](https://www.npmjs.com/package/@theyahia/pochta-russia-mcp)
[![CI](https://github.com/theYahia/pochta-russia-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/pochta-russia-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP-сервер для API Почты России — отслеживание, расчёт тарифов, сроки доставки, поиск отделений, индексы, нормализация адресов.

## Возможности (6 инструментов)

| Инструмент | Описание | Что требуется |
|---|---|---|
| `track` | Отслеживание отправления по трек-номеру | `POCHTA_LOGIN` + `POCHTA_PASSWORD` (SOAP-трекинг) |
| `calculate` | Расчёт стоимости и сроков доставки | `POCHTA_TOKEN` + `POCHTA_LOGIN` + `POCHTA_PASSWORD` |
| `delivery_time` | Расчёт сроков доставки между индексами | `POCHTA_TOKEN` + `POCHTA_LOGIN` + `POCHTA_PASSWORD` |
| `get_offices` | Поиск почтовых отделений | `POCHTA_TOKEN` + `POCHTA_LOGIN` + `POCHTA_PASSWORD` |
| `zip_lookup` | Информация по почтовому индексу | `POCHTA_TOKEN` + `POCHTA_LOGIN` + `POCHTA_PASSWORD` |
| `normalize_address` | Нормализация адреса через API | `POCHTA_TOKEN` + `POCHTA_LOGIN` + `POCHTA_PASSWORD` |

## Быстрый старт

### Claude Desktop / Cursor / Windsurf (stdio)

```json
{
  "mcpServers": {
    "pochta": {
      "command": "npx",
      "args": ["-y", "@theyahia/pochta-russia-mcp"],
      "env": {
        "POCHTA_TOKEN": "<ACCESS_TOKEN>",
        "POCHTA_LOGIN": "<LOGIN>",
        "POCHTA_PASSWORD": "<PASSWORD>"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add pochta \
  -e POCHTA_TOKEN=<ACCESS_TOKEN> \
  -e POCHTA_LOGIN=<LOGIN> \
  -e POCHTA_PASSWORD=<PASSWORD> \
  -- npx -y @theyahia/pochta-russia-mcp
```

### Streamable HTTP

```bash
npx @theyahia/pochta-russia-mcp --http --port=3000
```

MCP endpoint: `http://localhost:3000/mcp`
Health check: `http://localhost:3000/health` → `{"status":"ok","version":"…","tools":6}`

## Переменные окружения

| Переменная | Обязательная | Описание |
|---|---|---|
| `POCHTA_TOKEN` | Да | Access-токен приложения → заголовок `Authorization: AccessToken …` |
| `POCHTA_LOGIN` | Да | Логин кабинета → часть `X-User-Authorization: Basic …` |
| `POCHTA_PASSWORD` | Да | Пароль кабинета → часть `X-User-Authorization: Basic …` |
| `POCHTA_KEY` | Нет | Back-compat: готовый `base64(login:password)` для `X-User-Authorization` (вместо LOGIN/PASSWORD) |
| `POCHTA_TIMEOUT_MS` | Нет | Таймаут запроса в мс (по умолчанию 15000) |

Получите доступ к API: [Кабинет отправителя](https://otpravka.pochta.ru/) → Настройки → API.
Спецификация: <https://otpravka.pochta.ru/specification>.

## Авторизация

REST-методы otpravka-api используют **два** заголовка (согласно официальной спецификации):

- `Authorization: AccessToken <POCHTA_TOKEN>` — access-токен приложения;
- `X-User-Authorization: Basic <base64(POCHTA_LOGIN:POCHTA_PASSWORD)>` — учётные данные кабинета.

Отслеживание (`track`) использует SOAP-API трекинга (`tracking.russianpost.ru`) и требует
`POCHTA_LOGIN` + `POCHTA_PASSWORD` (access-токен там не применяется).

## ⚠️ Миграция на 2.0.0 (breaking change)

В версиях ≤ 1.x заголовки авторизации формировались неверно (access-токен и ключ были
перепутаны местами), из-за чего REST-методы не проходили авторизацию. В 2.0.0 контракт
исправлен:

- **Было:** `POCHTA_TOKEN` + `POCHTA_KEY`. Этот набор больше не работает сам по себе.
- **Стало:** `POCHTA_TOKEN` + `POCHTA_LOGIN` + `POCHTA_PASSWORD`.
- `POCHTA_KEY` сохранён только как опциональный back-compat (готовый `base64(login:password)`
  для `X-User-Authorization`).

## Надёжность

- Повторные попытки (до 3) с экспоненциальной задержкой на сетевые ошибки, `429` и `5xx`.
- Таймаут запроса (по умолчанию 15 с, настраивается через `POCHTA_TIMEOUT_MS`).
- Диагностические логи ретраев/ошибок пишутся в `stderr` (канал stdout занят MCP).

## Skills (Claude Code)

| Команда | Описание |
|---|---|
| `/track <номер>` | Отследить посылку Почты России |
| `/calculate <от> <до> <вес>` | Расчёт стоимости отправления |
| `/parcel <от> <до> <вес>` | Полный расчёт с ближайшим отделением |

## Тесты

```bash
npm install
npm run typecheck
npm test
```

## Лицензия

MIT
