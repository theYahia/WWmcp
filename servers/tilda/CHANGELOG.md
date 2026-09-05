# Changelog

## 1.2.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

Все значимые изменения проекта документируются в этом файле.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

## [1.2.0] - 2026-06-23

### Added

- Инструмент `get_page_body` (`getpage`) — тело страницы без `<head>`, ссылки на Tilda CDN.
- Инструмент `get_page_export_body` (`getpageexport`) — экспорт тела страницы с локализованными ассетами `{from,to}` для вставки в свой шаблон/CMS. Завершает покрытие всех 7 методов Tilda API.
- Опциональный параметр `webconfig` (`htaccess`|`nginx`) у `get_project_info` — Tilda возвращает пример конфигурации веб-сервера.
- Опциональный параметр `metadata_only` у инструментов страниц — ответ без `html`/`css`/`js` для экономии контекста.
- Линтинг (ESLint flat config + `typescript-eslint`) и форматирование (Prettier); скрипты `lint`, `format`, `format:check`, `typecheck`.
- Тесты ретраев/таймаута/`Retry-After` (`test/client.test.ts`) и smoke-тесты HTTP-транспорта (`test/http.test.ts`); проверка регистрации всех 7 инструментов через in-memory клиента.

### Changed

- **HTTP-режим переписан на stateless**: на каждый POST создаётся свежий `McpServer`+транспорт (`sessionIdGenerator: undefined`), который закрывается по завершении ответа. Устраняет race единственного общего транспорта между клиентами.
- HTTP `/mcp`: явная маршрутизация методов (`POST`/`OPTIONS`→204/прочее→405+`Allow`), CORS-заголовки, лимит тела запроса (1 МБ → 413), парсинг тела в `try/catch` (битый JSON → 400 вместо зависшего соединения).
- Ошибки инструментов возвращаются как `{ isError: true }`-контент (LLM видит текст ошибки) вместо непрозрачной JSON-RPC ошибки.
- Клиент учитывает заголовок `Retry-After` (секунды или HTTP-date) при ретрае 429.
- Валидация: `projectid`/`pageid` теперь `z.string().min(1)` (пустые строки отклоняются).
- `createMcpServer`/`startHttpMode` вынесены в `src/server.ts`; `src/index.ts` — тонкая точка входа (импорт модуля больше не запускает stdio-сервер, что нужно для тестов). `TOOL_COUNT` выводится из единого `TOOL_NAMES`.
- CI: матрица Node `[18, 20, 22]` + шаг `lint`.

### Fixed

- Голый глобал `crypto.randomUUID()` падал на Node 18.x (`globalThis.crypto` без флага доступен только с Node 19) — устранён переходом на stateless HTTP.
- `package-lock.json` был рассинхронизирован с `package.json` (ломал `npm ci`, а значит и CI) — пересобран.
