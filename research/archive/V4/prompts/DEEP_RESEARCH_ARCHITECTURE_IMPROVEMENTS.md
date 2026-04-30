# Deep Research — Архитектура 53 MCP-серверов @theyahia: аудит и план улучшений

## Контекст

Я — @theyahia, соло-разработчик. За 1 день довёл **53 MCP-сервера** до production-grade (тесты, Streamable HTTP, CI, skills, smithery.yaml, npm publish). Серверы покрывают 3 страны: Россия (47), Казахстан (2), Узбекистан (4).

Все серверы написаны на TypeScript с единой архитектурой. Мне нужен глубокий аудит этой архитектуры и конкретные рекомендации по улучшению.

---

## Текущая архитектура (одинаковая для всех 53 серверов)

### Структура файлов

```
{service}-mcp/
├── src/
│   ├── index.ts          — точка входа, регистрация tools, выбор транспорта
│   ├── client.ts         — HTTP-клиент для API сервиса (auth, retry, timeout)
│   ├── types.ts          — TypeScript интерфейсы для ответов API
│   └── tools/
│       ├── {group1}.ts   — группа tools (register на McpServer)
│       ├── {group2}.ts   — ещё группа
│       └── ...
├── tests/
│   ├── tools.test.ts     — unit-тесты tools (mock fetch)
│   ├── client.test.ts    — тесты клиента (auth, retry)
│   └── server.test.ts    — smoke test (listTools)
├── .claude/skills/
│   └── {skill-name}/SKILL.md
├── .github/workflows/ci.yml
├── .mcp.json             — конфиг для cursor.directory
├── smithery.yaml         — конфиг для Smithery
├── package.json          — mcpName, keywords, bin
├── tsconfig.json
└── README.md
```

### Паттерн index.ts

```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

// Validate env vars
const token = process.env.SERVICE_TOKEN;
if (!token) { console.error("FATAL: ..."); process.exit(1); }

// Create server
const server = new McpServer({ name: "service-mcp", version: "1.0.0" });

// Register tools
registerTools(server);

// Transport: stdio (default) or HTTP (--http flag)
if (process.argv.includes("--http") || process.env.HTTP_PORT) {
  // HTTP server on /mcp with CORS, /health endpoint
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

### Паттерн client.ts

```typescript
class ServiceClient {
  private baseUrl: string;
  private token: string;
  
  async get(path: string, params?: Record<string, string>): Promise<any> {
    // fetch with auth headers, timeout 10-15s
    // retry 3x on 429/5xx with exponential backoff
    // parse JSON response
    // throw on error with readable message
  }
  
  async post(path: string, body: object): Promise<any> { ... }
}
```

### Паттерн tools/*.ts

```typescript
export function registerTools(server: McpServer) {
  server.tool("tool_name", "Description for AI agent", {
    param1: z.string().describe("What this param is"),
    param2: z.number().optional().describe("Optional param"),
  }, async ({ param1, param2 }) => {
    const client = getClient();
    const result = await client.get("/endpoint", { param1 });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });
}
```

### Паттерн тестов

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
vi.stubGlobal("fetch", vi.fn());

describe("tool_name", () => {
  it("returns correct data", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "test" }),
    });
    // call tool handler
    // assert result
  });
});
```

---

## Что уже сделано хорошо

1. **Единая архитектура** — все 53 сервера следуют одному паттерну
2. **Zod-валидация** — все параметры tools описаны через Zod
3. **Dual transport** — stdio + Streamable HTTP
4. **Тесты** — ~700+ тестов суммарно (Vitest, mock fetch)
5. **CI** — GitHub Actions на всех репо
6. **Skills** — Claude Code slash-commands
7. **smithery.yaml** — готовы для Smithery
8. **mcpName** — зарегистрированы в Official MCP Registry

---

## Что нужно исследовать и улучшить

### 1. Общий код (DRY) — монорепа или shared пакет?

Сейчас каждый из 53 серверов — отдельный репозиторий с копипастой:
- Streamable HTTP setup (~40 строк, одинаковые в каждом index.ts)
- Retry logic с exponential backoff (одинаковая в каждом client.ts)
- CORS headers (одинаковые)
- Health endpoint (одинаковый)
- Vitest config (одинаковый)
- CI workflow (одинаковый)

**Вопросы:**
- Стоит ли создать `@theyahia/mcp-base` — shared пакет с общим кодом?
- Что вынести: BaseClient, createHttpServer, createStdioServer?
- Или перейти на монорепу (Turborepo + pnpm)?
- Или оставить как есть (53 независимых репо — проще для пользователей)?
- Каковы trade-offs каждого подхода для соло-разработчика?
- Как другие крупные MCP-экосистемы решают эту проблему?

### 2. Качество tool descriptions — оптимизация для AI-агентов

Сейчас описания tools выглядят так:
```
"Поиск вакансий на hh.ru по ключевым словам, региону, зарплате"
```

**Вопросы:**
- Какой формат описания tool лучше всего понимает Claude/GPT-4?
- Нужны ли примеры в описании? (example: "Найди вакансии Python в Москве от 200К")
- Оптимальная длина описания (коротко vs подробно)?
- Нужно ли описывать что tool НЕ делает? (ограничения)
- Как описывать связки между tools? (suggest_address → clean_address)
- Исследования/бенчмарки по качеству tool descriptions для MCP?

### 3. Error handling — что возвращать AI-агенту

Сейчас ошибки возвращаются как текст:
```typescript
return { content: [{ type: "text", text: `Ошибка: ${error.message}` }] };
```

**Вопросы:**
- Использовать `isError: true` в MCP response?
- Как форматировать ошибки чтобы AI-агент мог самостоятельно решить проблему?
- Нужно ли различать: user error (неверный ИНН) vs API error (500) vs auth error (401) vs rate limit (429)?
- Нужно ли предлагать next action? ("Проверьте API-ключ в env DADATA_API_KEY")
- Как обрабатывать timeout? Retry и вернуть результат или сразу ошибку?
- Best practices error handling в MCP-серверах?

### 4. Response formatting — JSON vs human-readable

Сейчас все ответы — JSON.stringify:
```typescript
return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
```

**Вопросы:**
- JSON или human-readable таблицы? Что лучше для AI-агента?
- Нужно ли форматировать суммы (1500.00 → "1 500,00 ₽")?
- Нужно ли переводить даты (2026-03-31 → "31 марта 2026")?
- Нужно ли обрезать большие ответы? (API вернул 1000 элементов)
- Pagination — как передавать cursor/offset через MCP?
- MCP spec поддерживает type: "image" — стоит ли возвращать графики/charts?

### 5. Авторизация — паттерны и безопасность

Сейчас 5 типов авторизации:
- **API Key** в header (DaData, hh.ru, 2GIS)
- **HTTP Basic** (МойСклад, CloudPayments, Halyk ePay)
- **OAuth 2.0** (СДЭК, amoCRM, GigaChat, YandexGPT)
- **JWT** (Wildberries, Eskiz)
- **Custom signature** (Click SHA1, Mango HMAC-SHA256, Robokassa MD5)

**Вопросы:**
- Стоит ли создать базовый AuthManager с разными стратегиями?
- Как безопасно логировать ошибки авторизации без утечки credentials?
- MCP spec имеет встроенный auth — стоит ли использовать вместо env vars?
- OAuth token refresh — текущая реализация через lazy singleton — это надёжно?
- Rate limiting — должен ли MCP-сервер сам управлять rate limits или делегировать клиенту?

### 6. Тестирование — что покрывать, что нет

Сейчас ~700 тестов, все с mock fetch:
- Unit: каждый tool handler с мокнутым API
- Smoke: server starts, listTools() returns N tools
- Client: auth headers, retry on 429/5xx

**Вопросы:**
- Нужны ли integration тесты с реальным API? Для каких серверов?
- Как тестировать OAuth flow без реальных credentials?
- Нужны ли snapshot тесты для response format?
- Нужны ли E2E тесты через StdioClientTransport → McpServer?
- Как тестировать Streamable HTTP транспорт?
- Contract testing — проверять что API не изменился?
- Какой % coverage достаточен для MCP-сервера?

### 7. Performance и масштабирование

**Вопросы:**
- Сколько concurrent connections выдерживает Streamable HTTP?
- Нужен ли connection pooling для HTTP-клиента?
- Caching — стоит ли кешировать ответы API? Какие? (справочники vs данные)
- Memory leaks — есть ли риски при долго-работающем HTTP-сервере?
- Graceful shutdown — все ли серверы корректно обрабатывают SIGINT/SIGTERM?

### 8. Developer Experience (DX) для пользователей

**Вопросы:**
- npx работает медленно (скачивает каждый раз) — стоит ли рекомендовать global install?
- Как сделать debug-режим? (verbose logging, request/response dump)
- Нужен ли `--version` и `--help` флаги?
- Error messages при отсутствии env vars — достаточно ли понятны?
- Нужен ли interactive setup wizard? (`npx @theyahia/dadata-mcp --init`)

### 9. Deployment и hosting

**Вопросы:**
- Docker — нужен ли Dockerfile для каждого сервера?
- Docker Compose — для запуска нескольких серверов?
- Serverless (Cloudflare Workers, Vercel, AWS Lambda) — возможно ли?
- Smithery hosting — как работает? Стоит ли использовать?
- Self-hosted — какой минимальный VPS нужен для 53 серверов?

### 10. Мониторинг и observability

**Вопросы:**
- Как мониторить здоровье 53 серверов? (Upptime? Custom dashboard?)
- Metrics — request count, latency, error rate?
- OpenTelemetry — стоит ли интегрировать?
- Structured logging (JSON) vs current stderr text?
- Alerting — когда API сервиса упал или сменил endpoint?

### 11. Versioning и обратная совместимость

**Вопросы:**
- Как версионировать: semver строго или pragmatic?
- Если API сервиса изменился — major bump?
- Changelog — нужен ли CHANGELOG.md для каждого сервера?
- Changesets (для монорепы) vs manual versioning?
- Deprecation policy — как убирать старые tools?

### 12. Security

**Вопросы:**
- npm audit — есть ли уязвимости в зависимостях?
- Supply chain — сколько зависимостей у каждого сервера? Минимизировать?
- Zod validation — достаточно ли для input sanitization?
- CORS в Streamable HTTP — какие origins разрешать?
- Rate limiting на стороне MCP-сервера — нужен ли?
- Content Security — может ли вредоносный API response повлиять на AI-агента?

---

## Архитектура конкурентов

Исследуй как устроены другие крупные MCP-экосистемы:

1. **Anthropic official servers** (github.com/modelcontextprotocol/servers) — архитектура, паттерны
2. **n8n MCP** (88/100 quality score) — что делает его лучшим?
3. **MongoDB MCP** (86/100) — enterprise-grade паттерны
4. **Stripe MCP** — как платёжный сервис реализовал свой MCP
5. **21st.dev** ($10K MRR) — как монетизируют
6. **Bitrix24 MCP** (официальный) — что они сделали правильно

Для каждого: архитектура, кол-во tools, тестирование, deployment, что можно позаимствовать.

---

## Формат ответа

### 1. Аудит текущей архитектуры

| Аспект | Оценка (1-10) | Главная проблема | Рекомендация |
|--------|--------------|------------------|-------------|
| Code reuse (DRY) | ? | ? | ? |
| Tool descriptions | ? | ? | ? |
| Error handling | ? | ? | ? |
| Response formatting | ? | ? | ? |
| Auth patterns | ? | ? | ? |
| Test coverage | ? | ? | ? |
| Performance | ? | ? | ? |
| DX | ? | ? | ? |
| Security | ? | ? | ? |

### 2. Топ-10 улучшений по ROI (impact / effort)

Отсортированные:
1. [Что] — [effort часы] — [impact] — [почему первым]
2. ...

### 3. Архитектурное решение: монорепа vs shared пакет vs статус-кво

Pros/cons каждого варианта для соло-разработчика с 53 серверами.
Конкретная рекомендация.

### 4. Конкретные промпты для Claude Code

Для каждого улучшения — copy-paste ready промпт.

Не давай абстрактных советов. Конкретные паттерны кода, конкретные инструменты, конкретные числа.
