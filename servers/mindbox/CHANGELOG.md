# Changelog

## 1.2.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

Все значимые изменения этого проекта документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [семантическому версионированию](https://semver.org/lang/ru/).

## [Unreleased]

## [1.2.0] - 2026-06-23

### Fixed

- **Критично: неверный путь API.** Запросы шли на `POST /v3/operations`, но Mindbox требует
  сегмент режима — `/v3/operations/sync` (request→response) или `/v3/operations/async`
  (fire-and-forget). Без него вызовы к реальному Mindbox не проходят. Теперь по умолчанию `sync`;
  `run_operation` принимает параметр `mode`.
- **Критично: краш при старте без credentials.** Клиент создавался на верхнем уровне каждого
  tool-модуля, и конструктор бросал исключение при отсутствии `MINDBOX_API_KEY`/`MINDBOX_ENDPOINT_ID` —
  сервер падал при импорте, ломая tool-discovery (Smithery scan, `npx` без env). Клиент теперь
  ленивый (`getClient()`): сервер стартует и отдаёт список инструментов без ключей, ошибка — только
  при реальном вызове.
- **Критично: сломанный HTTP-режим.** На каждый запрос создавался новый транспорт и вызывался
  `server.connect()` на одном общем `McpServer` (коллизии request-ID, «висящие» сессии). Переписано
  на корректный stateless-паттерн SDK (свежий сервер+транспорт на запрос, `405` на GET/DELETE).
- `create_order` больше не отправляет пустого клиента: добавлена проверка идентификатора, как в
  остальных инструментах.

### Added

- Повторы с экспоненциальным backoff и джиттером на `429`/`5xx`/таймаут/сетевые сбои; уважается
  `Retry-After`. Идемпотентность через `transactionId` (UUID v4, переиспользуется между повторами);
  `TransactionAlreadyProcessed` трактуется как успех.
- Защита HTTP-транспорта: привязка к `127.0.0.1` по умолчанию, DNS-rebinding protection
  (`allowedHosts`/`allowedOrigins`), CORS `*` только на `/health`, опциональный bearer-токен
  (`MINDBOX_HTTP_TOKEN`).
- `run_operation` помечен как опасный, логирует вызовы и отключается через `MINDBOX_ALLOW_RAW=0`.
- Разбор ответа: ветвление по `status`, поддержка `validationMessages`, защитный парсинг вместо
  слепых приведений типов.
- `server.json` для публикации в Official MCP Registry.
- Tooling: ESLint + Prettier, `.editorconfig`, `.env.example`, Dependabot, `Dockerfile`/`.dockerignore`.
- Валидация ввода: `.email()` для email-полей.
- Тюнинг клиента через env: `MINDBOX_MAX_RETRIES`, `MINDBOX_RETRY_BASE_MS`, `MINDBOX_TIMEOUT_MS`.

### Changed

- CI теперь гоняет тесты, typecheck и lint на матрице Node 18/20/22 (+ smoke-импорт без credentials).
- Версия и количество инструментов больше не хардкодятся — берутся из `package.json` и реестра инструментов.
- `.mcp.json` приведён к `MINDBOX_API_KEY` (как в README/Smithery); `MINDBOX_SECRET_KEY` остаётся алиасом.
- `randomUUID` импортируется из `node:crypto` (надёжно на Node 18).

> Изменение пути endpoint меняет фактическое поведение интеграции — при релизе рекомендуется
> минимум minor-bump (а лучше major, если кто-то полагался на прежний нерабочий путь).

## [1.1.0]

- 6 инструментов, Vitest, Streamable HTTP, smithery, skills.

## [1.0.0]

- Первый релиз.
