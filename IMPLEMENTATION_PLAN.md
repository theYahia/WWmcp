# Implementation Plan: MCP Servers Monorepo

> На основе аудита V5 (53 MCP-серверов). Дата создания: 2026-03-31.

---

## Обзор

Миграция 11 существующих MCP-серверов из 11 отдельных репозиториев в единую монорепу с общим пакетом `@theyahia/mcp-core`. Основные цели:

1. **Устранение дублирования** — retry, auth, error handling, transport setup были копипастом в каждом сервере
2. **`isError: true`** — ошибки теперь возвращаются как MCP tool errors, видимые LLM для self-recovery
3. **Улучшенные tool descriptions** — 3-4 предложения вместо 1, связи между tools, response_format
4. **Единый CI/CD** — Turborepo фильтрует сборку только изменённых пакетов
5. **Changesets** — автоматическое версионирование и публикация в npm

---

## Архитектура

```
mcp-servers/
├── packages/
│   └── core/                          # @theyahia/mcp-core
│       └── src/
│           ├── index.ts               # Re-exports всего
│           ├── errors.ts              # createToolError() + withErrorHandling()
│           ├── format.ts              # formatResponse(), formatRUB/UZS/KZT, formatDate
│           ├── logging.ts             # createLogger() → stderr JSON
│           ├── client.ts              # BaseHttpClient, RateLimitedClient, TokenBucketLimiter
│           ├── server.ts              # runServer() — stdio/HTTP dual transport
│           ├── auth/
│           │   └── index.ts           # ApiKey, Basic, OAuth, Dual, NoAuth strategies
│           └── testing/
│               └── smoke.ts           # runSmokeTest() для E2E
├── servers/
│   ├── _template/                     # Образец для новых серверов (~30 мин на новый)
│   ├── cbr/                           # ЦБ РФ — 5 tools, no auth
│   ├── cdek/                          # СДЭК — 8 tools, OAuth2
│   ├── moysklad/                      # МойСклад — 10 tools, Bearer/Basic + rate limit
│   ├── bitrix24/                      # Bitrix24 CRM — 4 tools, webhook
│   ├── cloudpayments/                 # CloudPayments — 6 tools, Basic auth
│   ├── robokassa/                     # Робокасса — 2 tools, MD5 signature
│   ├── tkassa/                        # Т-Касса — 5 tools, SHA-256 token
│   ├── getcourse/                     # GetCourse — 3 tools, API key
│   ├── payme/                         # Payme (УЗ) — 10 tools, JSON-RPC 2.0
│   ├── travelpayouts/                 # Travelpayouts — 3 tools, token param
│   └── cbu/                           # ЦБ Узбекистана — 5 tools, no auth
├── .github/workflows/
│   ├── ci.yml                         # Build + test (filtered by changed packages)
│   ├── release.yml                    # Changesets → npm publish
│   └── e2e.yml                        # E2E smoke tests (nightly + on push)
├── .changeset/config.json
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

---

## Фаза 1: Core Package (`@theyahia/mcp-core`)

### 1.1 Error Handling (`errors.ts`)

**Проблема**: Ошибки возвращались как обычный текст. LLM не мог их видеть и self-recover.

**Решение**: Все ошибки теперь обёрнуты в `CallToolResult` с `isError: true`.

| Категория | HTTP статус | Сообщение для LLM |
|-----------|------------|-------------------|
| validation | ZodError | «Исправьте параметры» |
| auth | 401, 403 | «Перенастройте API-ключ» |
| rate_limit | 429 | «Повторите через N секунд» |
| not_found | 404 | «Используйте search/list tool» |
| server_error | 5xx | «Повторите через 10-30 секунд» |
| timeout | AbortError | «API не ответил, повторите» |

**Два способа использования**:
```typescript
// 1. Обёртка (рекомендуется)
server.tool("name", desc, schema, withErrorHandling(async (params) => {
  return { content: [{ type: "text", text: await handler(params) }] };
}));

// 2. Ручной try/catch
try { ... } catch (e) { return createToolError(e); }
```

### 1.2 HTTP Client (`client.ts`)

**Проблема**: Retry/timeout/backoff код дублировался в каждом из 11 серверов (~100 строк × 11).

**Решение**: `BaseHttpClient` с конфигурируемыми параметрами.

| Параметр | Default | Описание |
|----------|---------|----------|
| timeout | 15_000ms | AbortController timeout |
| maxRetries | 3 | Количество попыток |
| backoff | exp 1-8s | 1000 × 2^(attempt-1), max 8000 |

**Специализации**:
- `RateLimitedClient` — добавляет TokenBucketLimiter (для МойСклад: 45 req/3s)
- Автоматический retry на 429 и 5xx
- Автоматический token refresh при 401 (через `auth.invalidate()`)

### 1.3 Auth Strategies (`auth/`)

| Стратегия | Серверы | Описание |
|-----------|---------|----------|
| `NoAuthStrategy` | CBR, CBU | Pass-through |
| `ApiKeyStrategy` | Travelpayouts, GetCourse | Bearer token / custom header |
| `BasicAuthStrategy` | CloudPayments | Base64(user:pass) |
| `OAuthStrategy` | СДЭК | Client credentials + auto-refresh + dedup |
| `DualAuthStrategy` | МойСклад | Token → Basic fallback |

Robokassa (MD5), T-Kassa (SHA-256), Payme (JSON-RPC), Bitrix24 (webhook URL) — используют кастомную auth в своих клиентах, т.к. не укладываются в стандартные паттерны.

### 1.4 Response Formatting (`format.ts`)

- `formatResponse()` — CSV для списков >3 элементов (экономия 29% токенов), JSON для остальных
- `formatRUB()` — копейки → рубли с ₽
- `formatUZS()` — тийины → сумы
- `formatKZT()` — тиын → тенге
- `formatDate()` — ISO → «31 марта 2026 г.»

### 1.5 Logging (`logging.ts`)

- JSON structured logs → stderr (КРИТИЧНО: stdout = JSON-RPC при stdio)
- Автоматическая маскировка sensitive полей (token, password, secret, api_key)
- Уровни: debug, info, warn, error
- Конфигурация через `LOG_LEVEL` env var

### 1.6 Server Factory (`server.ts`)

`runServer(createServer, config)` — автоматически определяет transport:
- **stdio** (default) — для Claude Desktop, Cursor, Windsurf
- **HTTP** (`--http` flag или `HTTP_PORT` env) — Express + StreamableHTTPServerTransport

HTTP режим включает:
- CORS headers
- Health endpoint: `GET /health` → `{ status, uptime, memory_mb, tools }`
- Session management с UUID
- Graceful shutdown на SIGINT/SIGTERM

---

## Фаза 2: Миграция серверов

### Что изменилось в каждом сервере

| Сервер | Tools | Изменения |
|--------|-------|-----------|
| CBR | 5 | client.ts → BaseHttpClient + NoAuth; withErrorHandling; улучшенные описания |
| СДЭК | 8 | TokenManager + CdekClient → BaseHttpClient + OAuthStrategy; server.ts слит в index.ts |
| МойСклад | 10 | Ручной rate limiter → RateLimitedClient + DualAuth; HTTP transport → runServer() |
| Bitrix24 | 4 | Custom fetch → BaseHttpClient + NoAuth (URL webhook) |
| CloudPayments | 6 | Custom client → BaseHttpClient + BasicAuth |
| Робокасса | 2 | Logging → createLogger(); MD5 auth сохранена |
| Т-Касса | 5 | Logging → createLogger(); SHA-256 auth сохранена |
| GetCourse | 3 | Custom client → BaseHttpClient + NoAuth (key as param) |
| Payme | 10 | Logging → createLogger(); JSON-RPC client сохранён |
| Travelpayouts | 3 | Custom fetch → BaseHttpClient + NoAuth (token param) |
| CBU | 5 | client.ts → BaseHttpClient + NoAuth; format.ts сохранён |

### Паттерн миграции (для оставшихся 42 серверов)

1. `cp -r servers/_template servers/{name}`
2. Переименовать CHANGEME → имя сервера
3. Скопировать types.ts и tools/*.ts из оригинала
4. Адаптировать client.ts (выбрать auth strategy)
5. Настроить index.ts (зарегистрировать tools)
6. `pnpm build --filter=@theyahia/{name}-mcp`
7. `pnpm test:e2e --filter=@theyahia/{name}-mcp`

Время на сервер: **~30 минут** (вместо нескольких часов).

---

## Фаза 3: Tool Descriptions

### До (типичное)
```
"Получить счёт"
```

### После (по стандарту Anthropic)
```
"Получить детали счёта по ID. Возвращает сумму, статус оплаты, контрагента
и позиции. Используйте search_invoices для поиска ID по номеру или дате.
Для списка неоплаченных — list_unpaid_invoices."
```

### Правила описаний

1. **3-4 предложения**: что делает → когда использовать → связи с другими tools → ограничения
2. **Каждый параметр**: `.describe()` с форматом, ограничениями, примером
3. **`response_format`**: `z.enum(["concise", "detailed"])` для больших ответов
4. **Начинается с глагола** (Получить, Создать, Найти, Рассчитать)
5. **Не дублировать** параметры в описании tool — они описаны в schema

---

## Фаза 4: CI/CD

### ci.yml
- **Trigger**: push/PR to main
- **Matrix**: Node 18, 20, 22
- **Turborepo filter**: `--filter='...[origin/main]'` — собирает только изменённые пакеты
- **Steps**: install → build → typecheck → test → audit

### release.yml
- **Trigger**: push to main
- **Changesets**: автоматический "Version Packages" PR
- **Publish**: `pnpm release` → npm publish для изменённых пакетов

### e2e.yml
- **Trigger**: push/PR + nightly cron (03:00 UTC)
- **StdioClientTransport** smoke tests для каждого сервера
- **Проверки**: initialize, tools/list, description quality

---

## Фаза 5: E2E Smoke Tests

Каждый сервер имеет `tests/e2e/smoke.test.ts` с 3 тестами:

1. **starts and lists N tools** — сервер запускается, возвращает ожидаемое количество
2. **all tools have quality descriptions** — длина ≥20 символов, есть inputSchema
3. **has expected tool names** — точный список имён (sorted)

### Shared утилита (`@theyahia/mcp-core/testing/smoke`)

```typescript
const result = await runSmokeTest({
  serverPath: "dist/index.js",
  expectedToolCount: 5,
  env: { API_KEY: "test" },
  timeout: 10_000,
});
```

---

## Фаза 6: Следующие шаги (после миграции)

### 6.1 Миграция оставшихся 42 серверов
Серверы из npm-каталога @theyahia/, которые ещё не в монорепе. Приоритет:
- **Tier 1** (production): DaData (31 tool), МойСклад (done), СДЭК (done)
- **Tier 2** (published): YooKassa, amoCRM, Яндекс.Метрика, Unisender, hh.ru
- **Tier 3** (placeholder): остальные

### 6.2 OpenTelemetry integration
- `@opentelemetry/sdk-node` + OTLP exporter
- Span на каждый tool call с атрибутами mcp.tool.name, duration_ms
- Включается через `OTEL_EXPORTER_OTLP_ENDPOINT` env var
- MCPcat как быстрый способ получить dashboard

### 6.3 Smithery registration
- `smithery.yaml` для каждого сервера
- Hosted variant для discoverability
- Стандартизированные README с badges

### 6.4 Performance
- Connection pooling через undici (встроен в Node 18+)
- In-memory cache для справочников (node-cache, TTL 5-15 мин)
- `--max-old-space-size=2048` для HTTP-серверов

### 6.5 Security hardening
- CORS allowlist вместо `*` в production
- Output sanitization (prompt injection protection)
- `npm audit` в CI (уже добавлен)
- lockfile-lint для проверки registry

---

## Технические решения

### Почему Turborepo, а не Nx?
- **20 строк конфигурации** vs 200+ у Nx
- **~3× быстрее** на малых пакетах (наш случай)
- Нативная поддержка pnpm workspaces
- Консенсус 2026 года для 1-3 разработчиков

### Почему pnpm?
- `workspace:*` — мгновенное использование изменений в shared коде
- Строгая изоляция node_modules (phantom deps невозможны)
- В 2-3× быстрее npm install

### Почему Changesets?
- Стандарт для Turborepo монореп
- Автоматический CHANGELOG.md
- GitHub Action создаёт "Version Packages" PR
- Один merge = автоматическая npm publish

### Почему НЕ монолитный сервер?
- Каждый сервер деплоится и версионируется независимо
- Пользователь устанавливает только нужные серверы через npx
- Один сервер ≠ один API-ключ (нельзя смешивать)

---

## Метрики успеха

| Метрика | До | После |
|---------|-----|-------|
| Изменение в BaseClient | 11 ручных PR | 1 PR |
| Строки retry/auth кода | ~1100 (100×11) | ~200 (в core) |
| `isError: true` | 0% ошибок | 100% ошибок |
| Средняя длина описания | ~30 символов | ~150 символов |
| CI на 1 сервер | нет | ~60 секунд |
| Время создания сервера | несколько часов | ~30 минут |
| E2E coverage | 0 серверов | 11 серверов |

---

## Quick Start

```bash
# Клонировать и установить
git clone https://github.com/theYahia/mcp-servers.git
cd mcp-servers
pnpm install

# Собрать всё
pnpm build

# Собрать только core + CBR
pnpm turbo build --filter=@theyahia/cbr-mcp...

# Запустить тесты
pnpm test

# E2E smoke tests
pnpm test:e2e

# Добавить changeset перед PR
pnpm changeset

# Создать новый сервер
cp -r servers/_template servers/my-new-server
# Отредактировать файлы, заменить CHANGEME
```
