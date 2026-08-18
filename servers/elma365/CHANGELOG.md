# Changelog

Все значимые изменения проекта документируются в этом файле.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [семантическому версионированию](https://semver.org/lang/ru/).

## [2.0.0] — 2026-06-23

Крупный релиз: исправление корректности эндпоинтов (сверка с официальной
документацией `api.elma365.com`) и расширение возможностей с 9 до 20 инструментов.

### ⚠️ Breaking changes

- `start_process` теперь требует параметр `namespace` (раньше принимал только `code`).
  Путь исправлен на `POST /bpm/template/{namespace}/{code}/run`.
- `get_processes` переименован в `list_processes` и теперь требует `namespace`
  (возвращает шаблоны процессов раздела через `GET /scheme/namespaces/{namespace}/processes`).
- `create_item`/`update_app_item` отправляют поля внутри обёртки `context`
  (требование ELMA365 API). Прямая передача полей верхним уровнем больше не используется.
- `get_comments`/`add_comment` переведены на ленту объекта (feed):
  `feed/{namespace}/{code}/{itemId}/message[/list]`.

### Fixed (несуществовавшие пути → реальные эндпоинты)

- `get_tasks`: `GET bpm/task` → `POST /tasks/list` (+ `/income`, `/outcome`, `/participate`).
- `start_process`: `POST bpm/process/{code}/start` → `POST /bpm/template/{namespace}/{code}/run`.
- `get_user_by_id`: `GET user/{id}` (не существует) → `POST /user/list` с фильтром `ids`.
- `get_comments`/`add_comment`: `app/.../comment` → feed-эндпоинты.
- `create_item`: тело обёрнуто в `context`; читается ответ `{ success, item, error }`.
- `get_app_items`: `GET .../list` с плоскими `from/size` → `POST .../list` с телом фильтрации.

### Added

- Discovery: `list_namespaces`, `list_apps`, `get_app_schema` — агент узнаёт реальные
  namespace/коды приложений/коды полей вместо угадывания.
- Элементы: `get_app_item`, `update_app_item`, `set_app_item_status`.
- Задачи: `get_task`, `get_task_exits`, `complete_task` (завершение задачи), `reassign_task`.
- Процессы: `get_process_instances` (экземпляры по шаблону).
- Аннотации инструментов (`readOnlyHint`/`destructiveHint`) и единый `isError`-вывод ошибок.
- Валидация ввода (`from/size` с границами и значениями по умолчанию; непустые строки).
- Контракт-тесты, проверяющие метод/путь/тело каждого инструмента (37 тестов).
- `ELMA365_BASE_URL` (on-premise) и `ELMA365_TIMEOUT` (опциональные).
- HTTP-транспорт: защита от DNS-rebinding (проверка `Host`), обогащённый `/health`.
- CI: шаги `lint` (ESLint) и `typecheck`; покрытие через `@vitest/coverage-v8`.

### Changed

- Версия сервера и `TOOL_COUNT` берутся из единого источника, без рассинхрона.
- Удалён неиспользуемый `getExtensionsUrl`.

## [1.1.0]

- Первый опубликованный набор из 9 инструментов, stdio + Streamable HTTP транспорт.
