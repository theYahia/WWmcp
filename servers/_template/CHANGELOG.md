# Changelog

Все заметные изменения этого сервера. Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
версии — [SemVer](https://semver.org/lang/ru/).

Записи сюда попадают из changeset'ов: `pnpm changeset` в корне монорепо, релиз собирает файл сам.
Руками правь только тогда, когда описываешь ещё не выпущенную версию.

## 1.0.0

Первый релиз.

- Инструмент `list_items`.
- Два транспорта: stdio и Streamable HTTP (`--http` / `HTTP_PORT`).
