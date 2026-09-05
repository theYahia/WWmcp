# Changelog

## 1.2.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

Все значимые изменения `@theyahia/cloudpayments-mcp` документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [семантическому версионированию](https://semver.org/lang/ru/).

Даты — даты публикации в npm.

## [1.2.0] — 2026-05-03

Первая публикация из монорепозитория WWmcp. В npm это текущая версия (`dist-tag latest`),
хотя формально она младше опубликованных ранее 2.0.x из отдельного репозитория.

### Added

- 6 инструментов: `charge`, `auth`, `confirm`, `void_payment`, `get_transaction`, `refund`.
  Авторизация — Basic.
- Сервер собран на `@theyahia/mcp-core`: `BaseHttpClient`, `runServer`
  (stdio + Streamable HTTP), `withErrorHandling`, `createLogger`.

## [2.0.1] — 2026-04-01

### Changed

- Переписаны `description` и `keywords` пакета под поиск в npm.

## [2.0.0] — 2026-04-01

### Added

- Расширение до 12 инструментов: подписки, заказы, история транзакций.

## [1.1.0] — 2026-03-31

### Added

- HTTP-транспорт, тесты на vitest, `smithery.yaml`.

### Changed

- Обновлён README.

## [1.0.1] — 2026-03-31

Опубликовано 2026-03-31 — изменения не задокументированы.

## [1.0.0] — 2026-03-30

### Added

- Первый релиз: 6 инструментов — `charge`, `auth`, `confirm`, `void`, `refund`,
  поиск транзакции.
- Скилл Claude Code.

## [0.0.1] — 2026-03-30

Первая публикация в npm.
