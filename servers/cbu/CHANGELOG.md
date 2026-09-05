# Changelog

## 1.1.1

### Patch Changes

- Updated dependencies [b146575]
  - @theyahia/mcp-core@1.2.0

Все значимые изменения `@theyahia/cbu-mcp` документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [семантическому версионированию](https://semver.org/lang/ru/).

Даты — даты публикации в npm.

## [1.1.0] — 2026-05-03

Первая публикация из монорепозитория WWmcp.

### Added

- 5 инструментов: курсы, конвертация, динамика курса. Авторизация не требуется.
- Сервер собран на `@theyahia/mcp-core`: `BaseHttpClient`, `runServer`
  (stdio + Streamable HTTP), `withErrorHandling`, `createLogger`.

## [1.0.0] — 2026-03-31

### Added

- Первый релиз: курсы валют Центрального банка Узбекистана и конвертация.
  Авторизация не требуется.
- Скиллы Claude Code.

---

Инструменты, зарегистрированные в `src/` сейчас (5): `get_all_rates`, `get_currency_rate`,
`get_historical_rates`, `convert_currency`, `get_rate_dynamics`.
