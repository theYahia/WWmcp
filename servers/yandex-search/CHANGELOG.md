# Changelog

Все значимые изменения `@theyahia/yandex-search-mcp` документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [семантическому версионированию](https://semver.org/lang/ru/).

Даты — даты публикации в npm.

## [Unreleased]

Исправления от 2026-07-10, ещё не опубликованные в npm.

### Fixed

- **`wordstat_top_requests` падал с HTTP 400 на любом вызове.** API требует `num_phrases`
  в диапазоне 1..2000, а тело запроса содержало только `phrase` — лимит применялся
  клиентски через `slice()`. Проверено вживую на Yandex Cloud Search API: 3 из 3
  инструментов работают. `wordstat_regions` и `wordstat_dynamics` были исправны.
- **Регион 225** — агрегат «Россия (вся)»; без имени он читался как обычный регион и
  стоял первым по объёму.
- **Ответ 200 без поля `results` приводил к `TypeError` вместо «не найдено».** Фраза с
  нулевой частотностью заставляет Wordstat вернуть 200 и тело без `results` (не пустой
  массив); `wordstat_top_requests` звал `data.results.slice()` до проверки на пустоту,
  у `wordstat_dynamics` была та же дыра в `.filter()`. Оба переведены на
  `(data.results ?? [])`.
- Регрессионные тесты в `src/tools/wordstat.test.ts`.

## [1.0.0] — 2026-05-03

### Added

- Первый релиз: Wordstat через Yandex Cloud Search API — `wordstat_top_requests`,
  `wordstat_dynamics`, `wordstat_regions`.
