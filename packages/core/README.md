# @theyahia/mcp-core

Общая библиотека, на которой собраны все MCP-серверы монорепозитория WWmcp. Забирает на себя то, что иначе пришлось бы писать в каждом сервере заново: HTTP-клиент с ретраями и таймаутом, стратегии авторизации, разбор ошибок в понятный модели текст, санитизацию ответов внешних API, логирование, форматирование выдачи и запуск сервера сразу в двух транспортах.

[![npm](https://img.shields.io/npm/v/@theyahia/mcp-core)](https://www.npmjs.com/package/@theyahia/mcp-core)
[![npm downloads](https://img.shields.io/npm/dm/@theyahia/mcp-core?label=downloads)](https://www.npmjs.com/package/@theyahia/mcp-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

```bash
npm install @theyahia/mcp-core
```

Требуется Node.js 18 или новее. `express` — опциональная зависимость, нужна только для HTTP-транспорта.

## Что даёт

| Модуль | Что закрывает |
|---|---|
| HTTP-клиент | `BaseHttpClient` — таймаут, экспоненциальный бэкофф, защита от подмены origin (абсолютный URL в пути принимается, только если его origin совпадает с базовым). `RateLimitedClient` — то же плюс token bucket, если API лимитирует частоту |
| Авторизация | Стратегии Bearer/API-key, Basic, OAuth2 client credentials с автообновлением токена, двойная (токен либо логин с паролем) и no-auth для публичных API |
| Ошибки | `withErrorHandling` категоризирует сбой (validation, auth, rate_limit, not_found, server_error, timeout) и отдаёт модели текст с `isError: true`, по которому она может исправиться сама |
| Санитизация | Ответ внешнего API чистится от паттернов prompt-инъекций и обрезается по длине до попадания в контекст |
| Форматирование | Списки отдаются CSV вместо JSON (на табличных данных примерно на 29% меньше токенов), деньги — из копеек и тийинов в ₽, сум и тенге |
| Логирование | JSON-логи в stderr с уровнем из `LOG_LEVEL` — stdout занят протоколом MCP и засорять его нельзя |
| Запуск сервера | `runServer` сам выбирает транспорт: stdio по умолчанию, Streamable HTTP по флагу `--http` или переменной `HTTP_PORT`. В HTTP-режиме поднимаются `/mcp`, `/health`, CORS с deny-all по умолчанию и корректное завершение по SIGINT/SIGTERM |
| Тестирование | `runSmokeTest` поднимает собранный сервер, подключается к нему как MCP-клиент, проверяет, что инструменты перечисляются и у них есть содержательные описания |

## Как это выглядит в сервере

Клиент — `servers/cloudpayments/src/client.ts`: базовый URL, таймаут, ретраи и стратегия авторизации задаются декларативно.

```ts
import { BaseHttpClient, BasicAuthStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("cloudpayments-mcp");

const client = new BaseHttpClient({
  baseUrl: "https://api.cloudpayments.ru",
  timeout: 10_000,
  maxRetries: 3,
  auth: new BasicAuthStrategy(publicId, apiSecret),
  logger,
});
```

Точка входа — `servers/bitrix24/src/index.ts`: инструменты оборачиваются в `withErrorHandling`, транспорт выбирает `runServer`.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";

const logger = createLogger("bitrix24-mcp");

function createServer(): McpServer {
  const server = new McpServer({ name: "bitrix24-mcp", version: "1.2.0" });

  server.tool(
    "get_deals",
    "Список сделок CRM с фильтрами по стадии и ответственному.",
    getDealsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetDeals(params) }],
    })),
  );

  return server;
}

runServer(createServer, { name: "bitrix24-mcp", version: "1.2.0", toolCount: 4, logger });
```

## Публичные экспорты

Из `src/index.ts`:

| Категория | Экспорты |
|---|---|
| Ошибки | `createToolError`, `withErrorHandling`; типы `ErrorCategory`, `ApiErrorInfo` |
| Форматирование | `formatResponse`, `formatRUB`, `formatUZS`, `formatKZT`, `formatDate`, `formatNumber` |
| Логирование | `createLogger`; типы `Logger`, `LogLevel` |
| HTTP-клиент | `BaseHttpClient`, `RateLimitedClient`, `TokenBucketLimiter`, `ApiError`; типы `BaseClientOptions`, `RequestOptions` |
| Авторизация | `ApiKeyStrategy`, `BasicAuthStrategy`, `OAuthStrategy`, `DualAuthStrategy`, `NoAuthStrategy`; тип `AuthStrategy` |
| Санитизация | `sanitizeApiResponse`, `truncateResponse` |
| Запуск сервера | `runServer`, `startStdio`, `startHttp`; типы `ServerConfig`, `HttpServerConfig` |

Подмодули доступны и точечно: `@theyahia/mcp-core/client`, `/auth`, `/errors`, `/format`, `/logging`, `/server`, `/testing/smoke`.

## Переменные окружения

| Переменная | Обязательна | Что делает |
|---|---|---|
| `LOG_LEVEL` | нет | Порог логирования: `debug`, `info`, `warn`, `error`. По умолчанию `info` |
| `HTTP_PORT` | нет | Включает Streamable HTTP вместо stdio и задаёт порт. То же делает флаг `--http`, порт по умолчанию 3000 |

## Смежные пакеты

Телеметрия в ядро не входит: opt-in SDK живёт отдельным пакетом `@theyahia/wwmcp-telemetry` и подключается сервером явно. Установка `@theyahia/mcp-core` ничего никуда не отправляет.

---

Часть монорепозитория [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
