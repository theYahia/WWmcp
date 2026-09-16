# Changelog

Все значимые изменения `@theyahia/robokassa-mcp` документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [семантическому версионированию](https://semver.org/lang/ru/).

Даты — даты публикации в npm.

## [1.2.0] — 2026-05-03

Первая публикация из монорепозитория WWmcp.

### Added

- 2 инструмента: `create_invoice` (ссылка на оплату) и `check_invoice` (статус счёта).
  Подпись — MD5.
- Сервер собран на `@theyahia/mcp-core`: `BaseHttpClient`, `runServer`
  (stdio + Streamable HTTP), `withErrorHandling`, `createLogger`.

## [1.1.1] — 2026-04-01

### Changed

- Переписаны `description` и `keywords` пакета под поиск в npm.

## [1.1.0] — 2026-03-31

### Added

- HTTP-транспорт, тесты на vitest, `smithery.yaml`.

### Changed

- Обновлён README.

## [1.0.1] — 2026-03-31

Опубликовано 2026-03-31 — изменения не задокументированы.

## [1.0.0] — 2026-03-30

### Added

- Первый релиз: генерация ссылок на оплату и проверка статуса счёта.
- Скилл Claude Code.

## [0.0.1] — 2026-03-30

Первая публикация в npm.
