# Changelog

Все значимые изменения проекта документируются здесь.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
проект использует [семантическое версионирование](https://semver.org/lang/ru/).

## [Unreleased]

### Изменено
- Исходники переехали в монорепо [WWmcp](https://github.com/theYahia/WWmcp/tree/main/servers/sber)
  и работают на `@theyahia/mcp-core`: ответы и ошибки инструментов проходят санитизацию ядра,
  логи — структурный JSON в stderr.
- HTTP-режим — транспорт ядра: сессии Streamable HTTP, CORS по умолчанию закрыт (раньше `*`).
  Порт — `HTTP_PORT`; `PORT` по-прежнему работает вместе с `--http`.
- Описание `get_balance` расширено до «Баланс по счёту клиента в Сбербанке.» (смоук требует ≥20 символов).

## [1.2.0] — 2026-06-23

### Добавлено
- Инструмент `summarize_transactions` — сводка по выписке (поступления/списания/чистый итог).
- Инструмент `list_counterparties` — список сохранённых контрагентов.
- Инструмент `get_company_info` — сведения об организации-клиенте.
- Пагинация выписки (`page`) в `get_statement`.
- MCP tool annotations: read-инструменты помечены `readOnlyHint`, `create_payment` —
  `destructiveHint` + `idempotentHint`.
- Опциональный mTLS: клиентский сертификат через `SBER_PFX_PATH`/`SBER_PFX_PASSPHRASE`
  или `SBER_CERT_PATH`/`SBER_KEY_PATH`/`SBER_CA_PATH`.
- Настраиваемые `SBER_OAUTH_URL`, `SBER_OAUTH_SCOPE`, `SBER_TIMEOUT_MS`.

### Исправлено
- **Риск двойного списания:** `create_payment` ретраился без ключа идемпотентности. Теперь
  каждая write-операция несёт стабильный `x-Introspect-RqUID` (+ `rq_uid` в теле), который
  переиспользуется на всех ретраях — Сбер дедуплицирует повтор и не создаёт второй платёж.
- OAuth приведён к доке СберБизнес: отдельный host/порт, Basic-auth (client_id:client_secret),
  scope-имена, заголовок RqUID, разделение `SBER_BASE_URL` (API) и `SBER_OAUTH_URL` (токен).
- Guard от конкурентного refresh OAuth-токена (один in-flight запрос вместо N параллельных).
- Ретрай также на транзиентных сетевых ошибках, не только на таймауте.
- HTTP-режим: добавлены CORS, обработка `OPTIONS`, очистка транспорта/сервера по завершении
  запроса и try/catch с корректным 500. `/health` отдаёт версию и число инструментов.
- Версия сервера читается из `package.json` (single source of truth) вместо хардкода.
- CI теперь прогоняет тесты (`npm test`) на Node 18/20/22, а не только сборку.

### Удалено
- Мёртвый код `src/skills/*` (логика перенесена в `summarize_transactions`) и неиспользуемый
  алиас `sberGet`.

### Документация
- README переписан: быстрый старт для Claude Desktop/Code, Cursor/VS Code, Windsurf и HTTP,
  таблицы env и 8 инструментов, demo-промпты, архитектура, секция «Соответствие API».

> ⚠️ **Соответствие API.** Боевой СберБизнес API закрыт за mTLS и договором — реализация
> не проверена против живого окружения. Дефолты хостов/путей соответствуют официальной
> документации на дату ресёрча; пути и имена параметров переопределяемы через env. Сверяйте
> с вашим интеграционным договором (см. секцию «Соответствие API» в README).

## [1.1.0]

- Базовый MCP-сервер: `get_accounts`, `get_balance`, `get_statement`, `create_payment`,
  `get_payment_status`; stdio + HTTP-режим; Bearer/OAuth авторизация.
