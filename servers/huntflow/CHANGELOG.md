# Changelog

Все значимые изменения `@theyahia/huntflow-mcp` документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [семантическому версионированию](https://semver.org/lang/ru/).

Даты — даты публикации в npm.

## [1.2.0] — не опубликовано в npm

Код версии 1.2.0 лежит в репозитории с 2026-06-23, но в npm последняя опубликованная
версия — 1.1.1. Пути и параметры сверены с живой OpenAPI-спекой
`https://api.huntflow.ru/v2/openapi.json`.

### Fixed

- **Обязательный заголовок `User-Agent`** — без него API отдавал `400 bad_user_agent`
  на каждый запрос. Теперь шлётся всегда (настраивается `HUNTFLOW_USER_AGENT`).
- **`list_stages`**: путь `/vacancy/statuses` → `/vacancies/statuses` (прежний возвращал 404).
- **`search_applicants`**: запрос перенесён на `/applicants/search` (у `/applicants` нет
  параметра `q` — поиск молча игнорировался). Добавлены фильтры `vacancy`/`status`/`tag`.
- **`get_applicant_resumes`**: больше не бьёт в несуществующий `/applicants/{id}/externals`;
  список резюме берётся из поля `external[]` объекта кандидата.
- **Пагинация**: во все списочные инструменты добавлен параметр `page`.
- **Ошибки инструментов** возвращаются как `{ isError: true }` (видны модели), а не как
  протокольные JSON-RPC-ошибки.
- **Скиллы** `skill-applicants` / `skill-vacancy-stats` теперь используют
  `list_vacancy_applicants` (раньше звали `search_applicants` без фильтра по вакансии —
  функция была сломана).
- Парсинг тела ошибок Huntflow (`{errors:[{type,value}]}` и OAuth-формы).
- Retry-политика: только `429/5xx`/таймаут/transient-сеть; backoff с jitter;
  учёт `Retry-After`.

### Added

- **Авто-refresh токена** через `POST /token/refresh` при 401 с сохранением ротированной
  пары в файл состояния (`HUNTFLOW_TOKEN_FILE`), single-flight, fallback на перевыпущенную
  пару из env.
- Клиентский **rate limiter** 10 req/s (документированный лимит API).
- Новые инструменты: `list_vacancy_applicants`, `get_resume`, `list_coworkers`,
  `list_sources`, `list_rejection_reasons`, `list_divisions`, `list_tags` (7 → 14).
- **Курируемый вывод** списков + `structuredContent`/`outputSchema`; флаг `raw` для
  сырого ответа.
- **HTTP-hardening**: DNS-rebinding protection (`allowedHosts`), привязка к `127.0.0.1`,
  опциональный shared-secret (`HUNTFLOW_HTTP_SECRET`).

### Changed

- CI запускает `typecheck`, `lint`, `format:check`, `build`, `test` на Node 18/20/22
  (раньше — только `build`).
- Добавлены ESLint и Prettier, тесты клиента (retry/refresh/таймаут/токен) и
  интеграционный тест через in-memory MCP-транспорт.

## [1.1.1] — 2026-04-01

### Changed

- Переписаны `description` и `keywords` пакета под поиск в npm.

## [1.1.0] — 2026-03-31

### Added

- 7 инструментов, 2 скилла, транспорты stdio и Streamable HTTP, тесты.

## [1.0.1] — 2026-03-31

Опубликовано 2026-03-31 — изменения не задокументированы.

## [1.0.0] — 2026-03-30

### Added

- Первый релиз: 4 инструмента для HuntFlow ATS API.
- Скилл Claude Code.

## [0.0.1] — 2026-03-30

Первая публикация в npm.

---

Инструменты, зарегистрированные в `src/` сейчас (14): `list_vacancies`, `get_vacancy`,
`list_stages`, `search_applicants`, `list_vacancy_applicants`, `get_applicant`,
`get_applicant_resumes`, `get_resume`, `list_accounts`, `list_coworkers`, `list_sources`,
`list_rejection_reasons`, `list_divisions`, `list_tags`.
