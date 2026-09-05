# Changelog

## 4.0.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

## 4.0.0

Переработка под реальный VK Ads API v2 (`ads.vk.com/api/v2`) — порт из standalone-репо
`theYahia/vk-ads-mcp` (npm `latest`), адаптированный под `@theyahia/mcp-core`. Версии до 4.0.0 били в
легаси-эндпоинты `api.vk.com` / myTarget v1 (`/campaigns.json`, `/ads.json`, `/budget.json`,
`/targeting_groups.json`), которых в v2 нет. Число инструментов то же (8), но два заменены.

### ⚠️ Breaking

- Удалён параметр `account_id` из всех инструментов — кабинет определяется OAuth-токеном.
- `list_campaigns` / `create_campaign` / `update_campaign` → `/ad_plans.json`;
  обновление — `POST /ad_plans/{id}.json` (id в пути, не в теле).
- Жизненный цикл кампании: `status: 1/0` → `action: activate | stop | delete`.
- Бюджет: `all_limit` (копейки) → `budget_limit` / `budget_limit_day` в валюте кабинета (рубли для RUB).
- Цель кампании: `type` → `objective`.
- `list_ads` / `create_ad` → `/banners.json`; тело создания `{ad_group_id, textblocks, urls, content}`
  вместо `{campaign_id, ad_format, title, description, link_url}`.
- `get_statistics` → `GET /statistics/{object_type}/{period}.json` (path-сегменты);
  `period` только `day` или `summary`, показы называются `shows`.
- **`list_targeting_groups` → `list_ad_groups`** (`/ad_groups.json`): отдельного ресурса
  targeting_groups в v2 нет, таргетинг/доставка живёт на группе объявлений.
- **`get_budget` → `get_account`** (`/user.json`, баланс требует scope `read_payments`).

### Added

- Авто-обновление токена через `refresh_token` (опц. `VK_ADS_CLIENT_ID` / `VK_ADS_CLIENT_SECRET` /
  `VK_ADS_REFRESH_TOKEN`) — `access_token` живёт 86400с, без этого статичный токен ломается ежедневно.
  Реализовано как `AuthStrategy.invalidate()`, так что перевыпуск делает штатный 401-ретрай
  `BaseHttpClient`.
- Авто-пагинация списков (limit/offset, страница 50, до 200 объектов по умолчанию, флаг `truncated`).
- `src/errors.ts`: защитный разбор трёх несовместимых форматов ошибок VK Ads (`{code,message}`,
  `{error,error_description}`, полевые ошибки). Результат отдаётся как `ApiError` ядра, поэтому
  `withErrorHandling` видит и категорию по HTTP-статусу, и настоящую причину от VK.
- `registerTool` с аннотациями (`readOnly` / `destructive` / `idempotent` / `openWorld`) и
  `outputSchema` + `structuredContent` для read-инструментов.
- Валидация ввода: даты `YYYY-MM-DD`, диапазон не более 92 дней, не более 200 объектов статистики,
  `period=day` требует обе даты — ошибка возвращается до вызова API.
- `.claude/skills/*` переписаны под v2: без `account_id`, без копеек, `shows` вместо impressions,
  `list_ad_groups` / `get_account` вместо удалённых инструментов.

### Fixed

- Создающие POST-запросы не ретраятся на 5xx/таймауте (риск дублей) — правило идемпотентности
  `BaseHttpClient`.
- Версия сервера читается из `package.json` (был захардкоженный `2.0.0` при `3.0.0` в пакете).

### Not ported from the standalone 4.0.0

- `dotenv` для локального запуска и fail-fast `assertCredentials()` на старте: в монорепе клиенты
  ленивые (сервер поднимается и отдаёт listTools без кредов — на этом держится `scripts/catalog.mjs`),
  а env приходят из конфига MCP-клиента.
- Учёт `Retry-After` на 429: `BaseHttpClient` использует свой экспоненциальный backoff и ретраит 429
  только для GET. Поддержка заголовка — задача ядра, общая для всех серверов.

## 3.0.0

### Major Changes

- 54cb308: Production-grade rewrite to v2.0.0. Promoted from `pipeline/marketing/` to `servers/` workspace. Now built on `@theyahia/mcp-core` (`BaseHttpClient` + `ApiKeyStrategy` + `runServer` dual transport).

  Breaking changes:

  - Internal client now extends `BaseHttpClient`. Functional API (`apiGet`, `apiPost`) unchanged.
  - Tool errors return MCP-spec `CallToolResult` with `isError: true`.
  - Adds Streamable HTTP transport (previously stdio-only).

  Tool names, arguments, return formats, and `VK_ADS_TOKEN` env var are unchanged.

## 2.0.0 — 2026-04-22

Production-grade rewrite. Promoted from `pipeline/marketing/` to `servers/` workspace with full integration into `@theyahia/mcp-core`.

### Breaking

- **Internal client class:** rewritten on top of `@theyahia/mcp-core`'s `BaseHttpClient` + `ApiKeyStrategy`. Public functional API (`apiGet`, `apiPost`) unchanged.
- **Error responses:** tool errors now return MCP-spec `CallToolResult` with `isError: true` (via `withErrorHandling`) instead of throwing. Compatible with all MCP clients.

### Added

- Streamable HTTP transport via `@theyahia/mcp-core`'s `runServer` — includes session management (`mcp-session-id`), CORS, graceful shutdown, `GET /health` endpoint.
- Structured JSON logging via `createLogger("vk-ads-mcp")`.
- ErrorCategory-based error responses (validation / auth / rate_limit / not_found / server_error / timeout) with self-recovery hints for the LLM.
- English README with cross-IDE configuration (Claude Desktop, Cursor, Windsurf, VS Code Copilot).

### Improved

- Auth, retries, timeouts, and response parsing now share the battle-tested `BaseHttpClient` implementation used by all production servers.
- Tests (`tests/client.test.ts`, `tests/server.test.ts`, `tests/tools.test.ts`) — vitest with mock fetch, covering all 8 tool handlers + auth + retry behavior.
- `tsconfig.json` extends the workspace `tsconfig.base.json` (consistent compiler options).
- Server factory (`src/server.ts`) split out from `src/index.ts` so tests don't trigger the side-effect `runServer()` call.

### Unchanged

- Tool names, arguments, return formats — fully backward-compatible.
- `VK_ADS_TOKEN` env var.
- npm package name `@theyahia/vk-ads-mcp`.

---

## 1.0.1 — 2026-04-01

Last release of the v1.x line. See git history for details.
