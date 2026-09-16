# MCP-сервер для Альфа-Банк Бизнес (Alfa API) — счета, выписки и платежи через ИИ

Если вы искали, как подключить Alfa API к нейросети, поднять баланс и выписку по расчётному счёту или подготовить платёжное поручение из чата — это оно. 8 инструментов: счета и балансы, выписки, платёжные поручения, контрагенты, курсы валют, зарплатные реестры. Боевой доступ к Alfa API требует mTLS и подписи ГОСТ PKCS#7 — прочитайте раздел о статусе проверки эндпоинтов ниже, прежде чем подключать продакшн.

> MCP-сервер для Альфа-Банк Бизнес (Alfa API) — счета, балансы, выписки, платёжные поручения, контрагенты, курсы валют и зарплатные реестры. **8 инструментов.**

[![npm](https://img.shields.io/npm/v/@theyahia/alfa-bank-mcp)](https://www.npmjs.com/package/@theyahia/alfa-bank-mcp)
[![CI](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/WWmcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![smithery badge](https://smithery.ai/badge/@theyahia/alfa-bank-mcp)](https://smithery.ai/server/@theyahia/alfa-bank-mcp)

Часть серии [WWmcp](https://github.com/theYahia/WWmcp) от [@theYahia](https://github.com/theYahia).

> ⚠️ **Прочитайте [Дисклеймер и статус проверки эндпоинтов](#дисклеймер-и-статус-проверки-эндпоинтов) перед использованием.** Сервер работает с реальным [Alfa API](https://developers.alfabank.ru/), но боевой доступ требует mTLS и подписи запросов PKCS#7 ГОСТ — подробности ниже.

## Быстрый старт

### Claude Desktop

```json
{
  "mcpServers": {
    "alfa-bank": {
      "command": "npx",
      "args": ["-y", "@theyahia/alfa-bank-mcp"],
      "env": {
        "ALFA_CLIENT_ID": "your-client-id",
        "ALFA_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add alfa-bank -e ALFA_CLIENT_ID=your-id -e ALFA_CLIENT_SECRET=your-secret -- npx -y @theyahia/alfa-bank-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "alfa-bank": {
      "command": "npx",
      "args": ["-y", "@theyahia/alfa-bank-mcp"],
      "env": {
        "ALFA_CLIENT_ID": "your-client-id",
        "ALFA_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### Windsurf

```json
{
  "mcpServers": {
    "alfa-bank": {
      "command": "npx",
      "args": ["-y", "@theyahia/alfa-bank-mcp"],
      "env": {
        "ALFA_CLIENT_ID": "your-client-id",
        "ALFA_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### Streamable HTTP (удалённый сервер / Docker)

```bash
HTTP_PORT=3000 npx -y @theyahia/alfa-bank-mcp --http
```

Эндпоинты:
- `POST /mcp` — транспорт MCP Streamable HTTP
- `GET /health` — проверка состояния (`{ "status": "ok", "tools": 8 }`)

## Переменные окружения

| Переменная | Обяз. | Описание |
|----------|:--------:|-------------|
| `ALFA_CLIENT_ID` | да | OAuth 2.0 client ID с [портала разработчика Альфа-Банка](https://developers.alfabank.ru/) |
| `ALFA_CLIENT_SECRET` | да | OAuth 2.0 client secret |
| `ALFA_BASE_URL` | нет | Базовый URL API (по умолчанию `https://baas.alfabank.ru`) |
| `ALFA_SCOPE` | нет | Scope'ы OAuth/OIDC через пробел, которых требуют вызываемые методы |
| `ALFA_TLS_CERT` | нет | Клиентский сертификат mTLS (PEM строкой или путь к файлу) — **обязателен для боевого доступа** |
| `ALFA_TLS_KEY` | нет | Приватный ключ клиента mTLS (PEM строкой или путь к файлу) |
| `ALFA_TLS_CA` | нет | Набор корневых сертификатов mTLS (PEM строкой или путь к файлу) |
| `ALFA_TIMEOUT_MS` | нет | Таймаут запроса в мс (по умолчанию `15000`) |
| `HTTP_PORT` | нет | Порт HTTP-транспорта (по умолчанию `3000`) |

## Инструменты (8)

| Инструмент | Описание | Пометка |
|------|-------------|:----------:|
| `list_accounts` | Список всех бизнес-счетов | только чтение |
| `get_account_balance` | Текущий баланс по счёту | только чтение |
| `get_account_statement` | Операции за период | только чтение |
| `create_payment_order` | Создать платёжное поручение (двигает реальные деньги) | **разрушающая** |
| `get_payment_status` | Статус платёжного поручения или реестра | только чтение |
| `list_counterparties` | Сохранённые контрагенты (получатели) | только чтение |
| `get_exchange_rates` | Текущие курсы валют | только чтение |
| `get_salary_registry` | Зарплатные реестры | только чтение |

У `create_payment_order` выставлен `destructiveHint: true`, чтобы MCP-клиенты требовали явного подтверждения перед запуском.

## Демо-промпты

```
Покажи все мои бизнес-счета в Альфа-Банке и их балансы
```

```
Достань выписку по счёту за март 2026 и выдели самые крупные траты
```

```
Создай платёж на 150 000 рублей на счёт 40702810000000005678, БИК 044525225, назначение — консультационные услуги
```

## Архитектура

- **Базовый URL**: `https://baas.alfabank.ru` (переопределяется через `ALFA_BASE_URL`)
- **Авторизация**: OAuth 2.0 / OpenID Connect через Alfa ID — токен из `POST /oidc/token` (client credentials), кэшируется до истечения, `scope` опционален
- **mTLS**: в продакшене клиентский сертификат обязателен на каждом вызове; задаётся через `ALFA_TLS_CERT` / `ALFA_TLS_KEY` (+ опционально `ALFA_TLS_CA`) и ставится глобальным диспетчером undici
- **Подпись**: операционные методы (платежи) требуют подписи `X-Alfabank-Signature` в формате PKCS#7 (CAdES-BES) по ГОСТ-2012; по умолчанию не реализована — подключите свой `Signer` (`src/auth/signer.ts`), чтобы отправлять платежи
- **Таймаут**: `AbortController` на каждый запрос (по умолчанию 15 с)
- **Повторы**: для запросов чтения — ограниченное число повторов с экспоненциальной задержкой и джиттером на 429 / 5xx / сетевых ошибках / таймаутах; отправка платежа автоматически **не повторяется** (банк мог её уже принять — сверьтесь через `get_payment_status`); 401 запускает одну повторную аутентификацию
- **Транспорт**: stdio (по умолчанию) или Streamable HTTP (`--http` / `HTTP_PORT`)
- **Безопасность**: реквизиты никогда не попадают в логи и тексты ошибок; в режиме stdio все логи идут в stderr

## Дисклеймер и статус проверки эндпоинтов

Пакет собран по **публичной** [документации Alfa API](https://developers.alfabank.ru/products/alfa-api/documentation), но это **не проверенная, готовая к продакшену интеграция**:

- Боевой доступ требует **сертификатов mTLS**, **подписи запросов PKCS#7 по ГОСТ** и **подписанного договора о техническом взаимодействии** с банком. Без этого сервер **не достучится до боевого контура** — он работает в демо-режиме.
- `create_payment_order` отражает реальную модель **реестра + электронной подписи**. С подписантом по умолчанию (не реализован) он возвращает понятную ошибку вместо отправки; подключите настоящий `Signer`, чтобы включить отправку.
- Пути эндпоинтов приведены к документированной поверхности. Уверенность разная — пункты, помеченные ниже как **ПРОВЕРИТЬ** (и комментариями `// VERIFY` в `src/client.ts`), стоит сверить с живым Swagger на странице документации каждого метода, прежде чем на них полагаться.

| Инструмент | Путь | Статус |
|------|------|--------|
| авторизация | `POST /oidc/token` | ✅ документирован |
| `get_account_statement` | `GET /api/statement/transactions` | ✅ путь документирован; параметры периода **ПРОВЕРИТЬ** (в доке `statementDate`+`page`) |
| `list_accounts` | `GET /api/pp/v1/accounts` | 🟡 вероятно |
| `get_payment_status` | `GET /api/jp/v1/registries/{id}` | 🟡 вероятно |
| `create_payment_order` | `POST /api/jp/v1/registries` + подпись | 🟡 модель документирована; точное тело запроса **ПРОВЕРИТЬ** |
| `list_counterparties` | `GET /na/jp/v1/beneficiaries` | 🟡 концепция документирована (beneficiaries); путь списка **ПРОВЕРИТЬ** |
| `get_exchange_rates` | `GET /api/rates/gd/v1/offices-rates` | 🟡 вероятно |
| `get_account_balance` | `GET /api/pp/v1/accounts/{id}/balance` | ⚠️ **ПРОВЕРИТЬ** (путь баланса собственного счёта не подтверждён) |
| `get_salary_registry` | `GET /api/jp/v1/registries?type=SALARY` | ⚠️ **ПРОВЕРИТЬ** (в публичной документации не подтверждён) |

## Разработка

```bash
npm install
npm run dev        # запуск через tsx
npm run typecheck
npm run build
npm test            # vitest

# отладка через MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## Часть серии WWmcp

| MCP | Статус | Описание |
|-----|--------|-------------|
| [@theyahia/cbr-mcp](https://github.com/theYahia/cbr-mcp) | готов | Курсы валют, ключевая ставка |
| [@theyahia/yookassa-mcp](https://github.com/theYahia/yookassa-mcp) | готов | Платежи, возвраты, чеки, выплаты, вебхуки |
| [@theyahia/alfa-bank-mcp](https://github.com/theYahia/WWmcp/tree/main/servers/alfa-bank) | этот сервер | Бизнес-счета, выписки, платежи |
| ... | | [полный список](https://github.com/theYahia/WWmcp) |

## Лицензия

MIT

---

Часть [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
