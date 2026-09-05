# Changelog

## 1.1.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

Все значимые изменения `@theyahia/payme-mcp` документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [семантическому версионированию](https://semver.org/lang/ru/).

Даты — даты публикации в npm.

## [1.1.0] — 2026-05-03

Первая публикация из монорепозитория WWmcp.

### Added

- 10 инструментов: карты (`cards_create`, `cards_check`, `cards_verify`, `cards_remove`)
  и чеки (`receipts_create`, `receipts_pay`, `receipts_send`, `receipts_check`,
  `receipts_cancel`, `receipts_get_all`). Транспорт — JSON-RPC 2.0 с заголовком `X-Auth`.
- Сервер собран на `@theyahia/mcp-core`: `BaseHttpClient`, `runServer`
  (stdio + Streamable HTTP), `withErrorHandling`, `createLogger`.

## [1.0.1] — 2026-04-01

### Changed

- Переписаны `description` и `keywords` пакета под поиск в npm.

## [1.0.0] — 2026-03-31

### Added

- Первый релиз: Payme Subscribe API — платежи, карты, чеки для Узбекистана,
  протокол JSON-RPC 2.0.
