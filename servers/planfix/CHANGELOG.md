# Changelog

Все значимые изменения `@theyahia/planfix-mcp` документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [семантическому версионированию](https://semver.org/lang/ru/).

Даты — даты публикации в npm.

## [1.2.0] — 2026-06-23

### Fixed

- **Комментарии больше не возвращают 404.** Путь исправлен с единственного числа
  `task/{id}/comment(/list)` на множественное `task/{id}/comments(/list)`, как требует
  официальный контракт Planfix REST API. Затронуты `get_comments` и `add_comment`.
- **Назначение исполнителя теперь работает.** В `create_task`/`update_task` поле
  `assignees` приведено к формату `PeopleRequest` — `{ users: [{ id: "user:<N>" }] }`
  (id — строка с префиксом `user:`), вместо неверного `[{ id: <число> }]`.
- `getBaseUrl` больше не строит недостижимый `api.planfix.com/rest`. Субдомен
  (`PLANFIX_ACCOUNT`) теперь обязателен — при его отсутствии бросается понятная ошибка.
  Добавлена переменная `PLANFIX_HOST` для региональных инсталляций (по умолчанию
  `planfix.com`).
- Клиент проверяет тело ответа на `{ "result": "fail" }` даже при HTTP 200 и бросает
  ошибку с кодом и текстом. Логический код `22` (rate limit) трактуется как retryable.
- Сохраняется значимый завершающий слэш в путях (`POST /task/`, `.../comments/`).
- `update_task` корректно обрабатывает пустой ответ (200/202) и отдаёт осмысленное
  подтверждение вместо пустого объекта.
- У `get_projects` убран несуществующий параметр `filterId` (он есть только у контактов).
- `filterId` у задач/контактов приводится к строке (как в спецификации).

### Added

- Параметр `fields` во всех list/get-инструментах с осмысленными значениями по умолчанию —
  раньше Planfix возвращал почти пустые (id-only) объекты.
- Человекочитаемое форматирование ответов (вместо сырого JSON), с безопасным
  JSON-фоллбэком на неизвестные формы.
- Новые инструменты (всего теперь 20):
  - `list_users`, `get_user` — сотрудники (`/user/list`, `/user/{id}`); нужны для поиска
    ID исполнителя по имени.
  - `create_contact`, `update_contact` — управление контактами.
  - `list_directories`, `list_directory_entries` — справочники (в т.ч. наборы статусов).
  - `list_custom_fields` — кастомные поля по типу объекта.
  - `list_datatags` — дата-теги.
  - `upload_file_from_url`, `get_file` — файлы по ссылке и метаданные.
- Ad-hoc фильтры (`filters[]`) для `get_tasks`.

### Changed

- CI запускает `npm test` и собирается на Node 18 и 20 (раньше — только `build` на 20).

### Известные ограничения

- Точные допустимые значения `priority` в `create_task` не верифицированы против live API —
  поле передаётся как строка «как есть».
- Прямая загрузка файлов (multipart `POST /file/`) и эндпоинты time-tracking/actions
  не реализованы (REST-контракт не подтверждён).

## [1.1.1] — 2026-04-01

### Changed

- Переписаны `description` и `keywords` пакета под поиск в npm.

## [1.1.0] — 2026-03-31

### Added

- 10 инструментов: задачи, проекты, контакты, комментарии.
- 2 скилла Claude Code, HTTP-транспорт, Vitest.

## [1.0.1] — 2026-03-31

Опубликовано 2026-03-31 — изменения не задокументированы.

## [1.0.0] — 2026-03-31

### Added

- Первый релиз: 3 инструмента — задачи и контакты.

## [0.0.1] — 2026-03-30

Первая публикация в npm.

---

Инструменты, зарегистрированные в `src/` сейчас (20): `get_tasks`, `get_task`,
`create_task`, `update_task`, `get_contacts`, `get_contact`, `get_projects`, `get_project`,
`get_comments`, `add_comment`, `create_contact`, `update_contact`, `list_users`, `get_user`,
`list_directories`, `list_directory_entries`, `list_custom_fields`, `list_datatags`,
`upload_file_from_url`, `get_file`.
